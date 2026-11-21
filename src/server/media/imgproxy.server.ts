// Server-only: imgproxy URLs for stored media. URLs are signed with
// IMGPROXY_KEY/IMGPROXY_SALT, so only this server can ask imgproxy for an
// image (or a size of one); the key never reaches the browser.
import { createHmac } from "node:crypto";
import { getServerEnv } from "../env.server";

const HEX = /^(?:[0-9a-f]{2})+$/i;

export class Imgproxy {
  private base_url: string;
  private key: Buffer | null;
  private salt: Buffer | null;
  private source_prefix: string;

  constructor(options: {
    base_url: string;
    key: Buffer | null;
    salt: Buffer | null;
    source_prefix: string;
  }) {
    this.base_url = options.base_url.replace(/\/+$/, "");
    this.key = options.key;
    this.salt = options.salt;
    this.source_prefix = options.source_prefix;
  }

  /**
   * A URL for the object at `storage_key`, processed by `options`: imgproxy's
   * processing options as path segments, e.g. "rs:fit:800:0".
   */
  url(storage_key: string, options: string) {
    const source = Buffer.from(this.source_prefix + storage_key).toString(
      "base64url",
    );
    const path = `/${options}/${source}`;
    return `${this.base_url}/${this.sign(path)}${path}`;
  }

  /** imgproxy's signature: HMAC-SHA256(key, salt + path), URL-safe base64. */
  private sign(path: string) {
    // imgproxy without a key/salt accepts any signature segment.
    if (!this.key || !this.salt) return "insecure";
    return createHmac("sha256", this.key)
      .update(this.salt)
      .update(path)
      .digest("base64url");
  }
}

/** imgproxy, or the env vars still needed to use it. */
export function getImgproxy():
  | { imgproxy: Imgproxy; missing: [] }
  | { imgproxy: null; missing: string[] } {
  const env = getServerEnv();
  const { url, key, salt } = env.imgproxy;
  const missing: string[] = [];

  let base_url: URL | null = null;
  try {
    base_url = url ? new URL(url) : null;
  } catch {
    base_url = null;
  }
  if (!base_url || !/^https?:$/.test(base_url.protocol)) {
    missing.push("IMGPROXY_URL");
  }
  // Both or neither: imgproxy signs only when it has both.
  if (key || salt) {
    if (!HEX.test(key)) missing.push("IMGPROXY_KEY (hex)");
    if (!HEX.test(salt)) missing.push("IMGPROXY_SALT (hex)");
  }
  const source_prefix =
    env.imgproxy.sourcePrefix ||
    (env.s3.bucket ? `s3://${env.s3.bucket}/` : "");
  if (!source_prefix) missing.push("S3_BUCKET or IMGPROXY_SOURCE_PREFIX");

  if (missing.length || !base_url) return { imgproxy: null, missing };
  return {
    imgproxy: new Imgproxy({
      base_url: base_url.href,
      key: key ? Buffer.from(key, "hex") : null,
      salt: salt ? Buffer.from(salt, "hex") : null,
      source_prefix,
    }),
    missing: [],
  };
}
