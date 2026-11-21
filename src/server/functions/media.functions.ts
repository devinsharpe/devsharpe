import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import {
  isMediaContentType,
  MEDIA_TYPES,
  mediaDetailsUpdateSchema,
  mediaIdSchema,
  mediaIdsSchema,
  mediaLibrarySearchSchema,
  mediaUploadSchema,
} from "~/lib/media";
import { getImgproxy } from "~/server/media/imgproxy.server";
import { toMediaView } from "~/server/media/media-views.server";
import {
  getMediaStorage,
  type MediaStorage,
  requireMediaStorage,
  storageError,
} from "~/server/media/storage.server";
import { ensure_auth_middleware } from "~/server/middleware/auth.middleware";
import { media_middleware } from "~/server/middleware/media.middleware";
import type { MediaRepository } from "~/server/repositories/media.repository.server";

/** Uploads not finished within this long are treated as abandoned. */
const ABANDONED_UPLOAD_MS = 24 * 60 * 60 * 1000;

/** Rejects a camera that doesn't exist (e.g. deleted since the page loaded). */
async function requireCamera(repo: MediaRepository, camera_id: string | null) {
  if (camera_id && !(await repo.cameraExists(camera_id))) {
    setResponseStatus(400);
    throw new Error("That camera no longer exists. Pick another one, or none.");
  }
}

/**
 * Removes a few abandoned uploads (the browser got a URL but never finished),
 * objects first. Best effort: a failure here never blocks a new upload.
 */
async function cleanUpAbandonedUploads(
  repo: MediaRepository,
  storage: MediaStorage,
) {
  try {
    const stale = await repo.listStalePendingMedia(
      new Date(Date.now() - ABANDONED_UPLOAD_MS),
      20,
    );
    for (const item of stale) {
      await storage.delete(item.storageKey);
      await repo.deleteMedia(item.id);
    }
  } catch (error) {
    console.error("Couldn't clean up abandoned media uploads.", error);
  }
}

/** The library page: one page of items, plus what's missing from the setup. */
export const getMediaLibrary = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, media_middleware])
  .validator(mediaLibrarySearchSchema)
  .handler(async ({ context, data }) => {
    const { storage, missing: missing_storage } = getMediaStorage();
    const { imgproxy, missing: missing_imgproxy } = getImgproxy();
    const [library, cameras, tags] = await Promise.all([
      context.media.listReadyMedia(data),
      context.media.listCameraOptions(),
      context.media.listMediaTags(),
    ]);
    return {
      ...library,
      items: library.items.map((item) => toMediaView(item, imgproxy)),
      cameras,
      tags,
      setup: {
        can_upload: storage !== null,
        missing_storage,
        missing_imgproxy,
      },
    };
  });

/**
 * Library items by id, for the images in a document being edited. Ids that
 * aren't in the library (deleted, or still uploading) are left out.
 */
export const getMediaViews = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, media_middleware])
  .validator(mediaIdsSchema)
  .handler(async ({ context, data }) => {
    const { imgproxy } = getImgproxy();
    const rows = await context.media.listReadyMediaByIds(data.ids);
    return rows.map((row) => toMediaView(row, imgproxy));
  });

/**
 * Step 1 of an upload: records it and returns a presigned URL. The browser
 * PUTs the file there directly, then calls `completeMediaUpload`.
 */
export const createMediaUpload = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, media_middleware])
  .validator(mediaUploadSchema)
  .handler(async ({ context, data }) => {
    const storage = requireMediaStorage();
    await requireCamera(context.media, data.cameraId);
    await cleanUpAbandonedUploads(context.media, storage);

    // Keys are generated here, never taken from the file name.
    const id = crypto.randomUUID();
    const storage_key = `media/${id}.${MEDIA_TYPES[data.contentType]}`;
    let upload_url: string;
    try {
      upload_url = await storage.presignUpload(
        storage_key,
        data.contentType,
        data.byteSize,
      );
    } catch (error) {
      throw storageError(error);
    }
    await context.media.createPendingMedia({
      id,
      storageKey: storage_key,
      originalName: data.filename,
      contentType: data.contentType,
      byteSize: data.byteSize,
      width: data.width,
      height: data.height,
      cameraId: data.cameraId,
      tags: data.tags,
    });
    return { id, upload_url };
  });

/**
 * Step 2: checks that the file arrived as promised (size and type), then adds
 * it to the library. A mismatched upload is discarded.
 */
export const completeMediaUpload = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, media_middleware])
  .validator(mediaIdSchema)
  .handler(async ({ context, data }) => {
    const storage = requireMediaStorage();
    const { imgproxy } = getImgproxy();
    const item = await context.media.getMedia(data.id);
    if (!item) throw notFound();
    if (item.status === "ready") return toMediaView(item, imgproxy);

    let stored: Awaited<ReturnType<MediaStorage["head"]>>;
    try {
      stored = await storage.head(item.storageKey);
    } catch (error) {
      throw storageError(error);
    }
    if (!stored) {
      await context.media.deleteMedia(item.id);
      setResponseStatus(409);
      throw new Error("The file never reached storage. Try uploading it again.");
    }
    const stored_type = stored.contentType.split(";")[0].trim().toLowerCase();
    if (
      stored.byteSize !== item.byteSize ||
      stored_type !== item.contentType ||
      !isMediaContentType(stored_type)
    ) {
      try {
        await storage.delete(item.storageKey);
      } catch (error) {
        console.error("Couldn't delete a mismatched upload.", error);
      }
      await context.media.deleteMedia(item.id);
      setResponseStatus(400);
      throw new Error(
        "The uploaded file didn't match what was expected, so it was discarded.",
      );
    }

    const ready = await context.media.markMediaReady(item.id);
    if (!ready) throw notFound();
    return toMediaView(ready, imgproxy);
  });

/** Gives up on an unfinished upload (e.g. the PUT failed). Safe to call twice. */
export const cancelMediaUpload = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, media_middleware])
  .validator(mediaIdSchema)
  .handler(async ({ context, data }) => {
    const item = await context.media.getMedia(data.id);
    if (!item || item.status !== "pending") return { success: true };
    const { storage } = getMediaStorage();
    try {
      // A partial PUT never creates an object, but a finished one might exist.
      await storage?.delete(item.storageKey);
    } catch (error) {
      // Left for the abandoned-upload cleanup to retry.
      console.error("Couldn't delete a cancelled upload.", error);
      return { success: true };
    }
    await context.media.deleteMedia(item.id);
    return { success: true };
  });

export const updateMediaDetails = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, media_middleware])
  .validator(mediaDetailsUpdateSchema)
  .handler(async ({ context, data: { id, ...details } }) => {
    await requireCamera(context.media, details.cameraId);
    const item = await context.media.updateMediaDetails(id, details);
    if (!item) throw notFound();
    return toMediaView(item, getImgproxy().imgproxy);
  });

/** Where a library image is used, so deleting it can say what loses it. */
export const getMediaUsage = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, media_middleware])
  .validator(mediaIdSchema)
  .handler(({ context, data }) => context.media.findMediaUsage(data.id));

/** Deletes the file from storage, then the record. */
export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, media_middleware])
  .validator(mediaIdSchema)
  .handler(async ({ context, data }) => {
    const item = await context.media.getMedia(data.id);
    if (!item) throw notFound();
    const storage = requireMediaStorage();
    try {
      await storage.delete(item.storageKey);
    } catch (error) {
      throw storageError(error);
    }
    await context.media.deleteMedia(item.id);
    return { id: item.id, name: item.originalName };
  });
