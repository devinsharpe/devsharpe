// Server-only: the S3 bucket that holds uploaded media. The bucket can stay
// private: browsers upload with short-lived presigned URLs, and imgproxy reads
// objects with its own credentials.
import { setResponseStatus } from "@tanstack/react-start/server";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerEnv } from "../env.server";

/** How long a presigned upload URL stays valid. */
const UPLOAD_URL_TTL_SECONDS = 15 * 60;

type S3Settings = ReturnType<typeof getServerEnv>["s3"];

function createClient(settings: S3Settings, endpoint: string | undefined) {
  return new S3Client({
    region: settings.region,
    endpoint,
    forcePathStyle: settings.forcePathStyle,
    credentials: settings.accessKeyId
      ? {
          accessKeyId: settings.accessKeyId,
          secretAccessKey: settings.secretAccessKey,
        }
      : undefined,
    // Only add checksums where S3 requires them. By default the SDK puts a
    // CRC32 checksum of an empty body into presigned upload URLs, which a
    // browser upload can never match (and some S3-compatible services reject).
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

// Clients for one configuration, reused across requests.
let cached: {
  fingerprint: string;
  clients: { server: S3Client; browser: S3Client };
} | null = null;

/**
 * `server` talks to the bucket from here; `browser` only signs upload URLs,
 * since a signature covers the host the browser will send it to.
 */
function clientsFor(settings: S3Settings) {
  const fingerprint = JSON.stringify(settings);
  if (cached?.fingerprint !== fingerprint) {
    const server = createClient(settings, settings.endpoint);
    const browser =
      settings.publicEndpoint && settings.publicEndpoint !== settings.endpoint
        ? createClient(settings, settings.publicEndpoint)
        : server;
    cached = { fingerprint, clients: { server, browser } };
  }
  return cached.clients;
}

function isNotFound(error: unknown) {
  return (
    error instanceof S3ServiceException &&
    (error.name === "NotFound" ||
      error.name === "NoSuchKey" ||
      error.$metadata.httpStatusCode === 404)
  );
}

export class MediaStorage {
  private client: S3Client;
  private upload_client: S3Client;
  readonly bucket: string;

  /** `upload_client` signs upload URLs; it defaults to `client`. */
  constructor(client: S3Client, bucket: string, upload_client = client) {
    this.client = client;
    this.upload_client = upload_client;
    this.bucket = bucket;
  }

  /**
   * A presigned PUT URL for `key`. Content-Type and Content-Length are part of
   * the signature, so the browser must send exactly `content_type` and a body
   * of exactly `byte_size` bytes, or storage rejects the upload.
   */
  presignUpload(key: string, content_type: string, byte_size: number) {
    return getSignedUrl(
      this.upload_client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: content_type,
        ContentLength: byte_size,
      }),
      {
        expiresIn: UPLOAD_URL_TTL_SECONDS,
        // Content-Length is signed by default; Content-Type has to be asked for.
        signableHeaders: new Set(["content-type"]),
      },
    );
  }

  /** The stored object's size and type, or null if it isn't there. */
  async head(key: string) {
    try {
      const result = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        byteSize: result.ContentLength ?? 0,
        contentType: result.ContentType ?? "",
      };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  /** Up to the first `byte_count` bytes of the object (all of a shorter one). */
  async readStart(key: string, byte_count: number) {
    const result = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Range: `bytes=0-${byte_count - 1}`,
      }),
    );
    return result.Body
      ? await result.Body.transformToByteArray()
      : new Uint8Array();
  }

  /** The object as a stream (to pass a download through), or null if it isn't there. */
  async open(key: string) {
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      if (!result.Body) return null;
      return {
        body: result.Body.transformToWebStream(),
        byteSize: result.ContentLength ?? null,
      };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  /** Deletes the object. Deleting one that isn't there isn't an error. */
  async delete(key: string) {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}

/** The bucket, or the env vars still needed to reach it. */
export function getMediaStorage():
  | { storage: MediaStorage; missing: [] }
  | { storage: null; missing: string[] } {
  const settings = getServerEnv().s3;
  const missing: string[] = [];
  if (!settings.bucket) missing.push("S3_BUCKET");
  if (settings.accessKeyId && !settings.secretAccessKey) {
    missing.push("S3_SECRET_ACCESS_KEY");
  }
  if (missing.length) return { storage: null, missing };
  const { server, browser } = clientsFor(settings);
  return {
    storage: new MediaStorage(server, settings.bucket, browser),
    missing: [],
  };
}

/** For server functions: the bucket, or a 503 naming the env vars it needs. */
export function requireMediaStorage() {
  const { storage, missing } = getMediaStorage();
  if (!storage) {
    setResponseStatus(503);
    throw new Error(
      `Media storage isn't configured yet. Set ${missing.join(", ")} on the server.`,
    );
  }
  return storage;
}

/** A storage failure as an error that's safe and useful to show the admin. */
export function storageError(error: unknown) {
  console.error("Media storage request failed.", error);
  const detail = error instanceof Error ? ` (${error.message})` : "";
  return new Error(`Couldn't reach media storage${detail}.`);
}
