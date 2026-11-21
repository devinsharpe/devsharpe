import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  getRequestHeaders,
  setResponseStatus,
} from "@tanstack/react-start/server";
import {
  COLLECTION_PHOTOS_MAX,
  collectionAddPhotosSchema,
  collectionContentSchema,
  collectionCoverSchema,
  collectionIdSchema,
  collectionInputSchema,
  collectionOrderSchema,
  collectionPhotoSchema,
  collectionSlugSchema,
  collectionUpdateSchema,
  photographsAdminSearchSchema,
  photographyLimitSchema,
  photographySearchSchema,
  photoPageSchema,
  recordViewSchema,
} from "~/lib/photography";
import { auth } from "~/server/auth.server";
import type { Media } from "~/server/database/schema.server";
import { getImgproxy, type Imgproxy } from "~/server/media/imgproxy.server";
import {
  toCoverImage,
  toMediaView,
  toPhotoView,
  toShareImageUrl,
  toThumbnailUrl,
} from "~/server/media/media-views.server";
import { resolveRichTextMedia } from "~/server/media/rich-text-media.server";
import { getMediaStorage } from "~/server/media/storage.server";
import { ensure_auth_middleware } from "~/server/middleware/auth.middleware";
import { media_middleware } from "~/server/middleware/media.middleware";
import { photography_middleware } from "~/server/middleware/photography.middleware";
import type { MediaRepository } from "~/server/repositories/media.repository.server";

/** Admin list rows show the cover this big. */
const ADMIN_THUMBNAIL_SIZE = 160;

/**
 * Fills in each collection's cover image (3:2 for cards, square for admin
 * lists). Null when it has no photos, or while imgproxy isn't configured.
 */
async function withCovers<T extends { coverId: string | null }>(
  media_repo: MediaRepository,
  rows: T[],
) {
  const { imgproxy } = getImgproxy();
  const ids = [
    ...new Set(rows.map((row) => row.coverId).filter((id) => id !== null)),
  ];
  const covers =
    imgproxy && ids.length > 0 ? await media_repo.listReadyMediaByIds(ids) : [];
  const by_id = new Map(covers.map((cover) => [cover.id, cover]));
  return rows.map(({ coverId, ...row }) => {
    const cover = coverId ? by_id.get(coverId) : undefined;
    return {
      ...row,
      cover:
        cover && imgproxy
          ? {
              alt: cover.altText ?? "",
              image: toCoverImage(imgproxy, cover),
              thumbnailUrl: toThumbnailUrl(imgproxy, cover, ADMIN_THUMBNAIL_SIZE),
            }
          : null,
    };
  });
}

function slugTaken(slug: string): never {
  setResponseStatus(409);
  throw new Error(
    `Another collection already uses the slug "${slug}". Pick a different one.`,
  );
}

const shareImage = (imgproxy: Imgproxy | null, row: Media | undefined) =>
  imgproxy && row ? toShareImageUrl(imgproxy, row) : null;

// <-- Public -->

/**
 * /photography: a page of published collections or, with `camera`, a page of
 * the published photos taken with it.
 */
export const listPhotography = createServerFn({ method: "GET" })
  .middleware([photography_middleware, media_middleware])
  .validator(photographySearchSchema)
  .handler(async ({ context, data }) => {
    if (data.camera) {
      const camera = await context.photography.getCamera(data.camera);
      if (!camera) {
        return {
          kind: "camera" as const,
          camera: null,
          photos: [],
          total: 0,
          page: 1,
          page_count: 1,
        };
      }
      const { imgproxy } = getImgproxy();
      const { items, ...pages } =
        await context.photography.listPublishedPhotosByCamera(camera.id, data.page);
      return {
        kind: "camera" as const,
        camera,
        photos: items.map(({ slug, photo }) => ({
          ...toPhotoView(photo, imgproxy),
          collection_slug: slug,
        })),
        ...pages,
      };
    }
    const { items, ...pages } =
      await context.photography.listPublishedCollections(data.page);
    return {
      kind: "collections" as const,
      collections: await withCovers(context.media, items),
      ...pages,
    };
  });

/** The newest published collections, e.g. for the homepage. */
export const listLatestCollections = createServerFn({ method: "GET" })
  .middleware([photography_middleware, media_middleware])
  .validator(photographyLimitSchema)
  .handler(async ({ context, data }) =>
    withCovers(
      context.media,
      await context.photography.listLatestCollections(data.limit),
    ),
  );

/** /photography/{slug}: the collection, its photos, and its published write-up. */
export const getPublishedCollection = createServerFn({ method: "GET" })
  .middleware([photography_middleware, media_middleware])
  .validator(collectionSlugSchema)
  .handler(async ({ context, data }) => {
    const row = await context.photography.getPublishedCollection(data.slug);
    if (!row) throw notFound();
    const { content, coverId, ...collection } = row;
    const { imgproxy } = getImgproxy();
    const [photos, media] = await Promise.all([
      context.photography.listCollectionPhotos(collection.id),
      resolveRichTextMedia(context.media, [content]),
    ]);
    const cover = photos.find((photo) => photo.id === coverId) ?? photos[0];
    return {
      collection,
      content,
      media,
      photos: photos.map((photo) => toPhotoView(photo, imgproxy)),
      share_image: shareImage(imgproxy, cover),
    };
  });

/** /photography/{slug}/{photoId}: one photo, with previous/next in its collection. */
export const getPublishedPhoto = createServerFn({ method: "GET" })
  .middleware([photography_middleware])
  .validator(photoPageSchema)
  .handler(async ({ context, data }) => {
    const found = await context.photography.getPublishedPhoto(
      data.slug,
      data.photoId,
    );
    if (!found || found.photo.status !== "ready") throw notFound();
    const { imgproxy } = getImgproxy();
    const { photo, ...rest } = found;
    return {
      ...rest,
      photo: toPhotoView(photo, imgproxy),
      share_image: shareImage(imgproxy, photo),
    };
  });

/**
 * Counts a visit to a public collection or photo page. Called from the
 * browser (so prefetches and bots that don't run scripts aren't counted);
 * visits while signed in, and pages that aren't public, aren't counted.
 */
export const recordView = createServerFn({ method: "POST" })
  .middleware([photography_middleware])
  .validator(recordViewSchema)
  .handler(async ({ context, data }) => {
    const session = await auth.api.getSession({ headers: getRequestHeaders() });
    if (session) return { counted: false };
    const is_public =
      data.kind === "collection"
        ? await context.photography.isPublicCollection(data.id)
        : await context.photography.isPublicPhoto(data.id);
    if (!is_public) return { counted: false };
    await context.photography.recordView(data.kind, data.id);
    return { counted: true };
  });

// <-- Admin -->

/** Admin: every collection, with photo counts, views, and publish state. */
export const listCollectionsAdmin = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, photography_middleware, media_middleware])
  .handler(async ({ context }) =>
    withCovers(context.media, await context.photography.listAllCollections()),
  );

/** Admin: the most viewed collections and photos, for the dashboard. */
export const getPhotographyOverview = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, photography_middleware, media_middleware])
  .validator(photographyLimitSchema)
  .handler(async ({ context, data }) => {
    const { imgproxy } = getImgproxy();
    const [collections, photos] = await Promise.all([
      context.photography.listMostViewedCollections(data.limit),
      context.photography.listCollectedPhotos(1, data.limit),
    ]);
    return {
      collections: await withCovers(context.media, collections),
      photos: photos.items.map(({ row, views, collections }) => ({
        id: row.id,
        name: row.originalName,
        altText: row.altText,
        thumbnailUrl: imgproxy ? toThumbnailUrl(imgproxy, row) : null,
        views,
        // Where it can be seen, for a link to it.
        published_in: collections.find((collection) => collection.isPublished) ?? null,
      })),
    };
  });

/** Admin: the photos in any collection, most viewed first. */
export const listCollectedPhotos = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, photography_middleware, media_middleware])
  .validator(photographsAdminSearchSchema)
  .handler(async ({ context, data }) => {
    const { imgproxy } = getImgproxy();
    const [result, cameras] = await Promise.all([
      context.photography.listCollectedPhotos(data.page),
      context.media.listCameraOptions(),
    ]);
    const { items, ...pages } = result;
    return {
      items: items.map(({ row, views, collections }) => ({
        ...toMediaView(row, imgproxy),
        views,
        collections,
      })),
      ...pages,
      cameras,
    };
  });

/** Admin editor: details, the saved write-up draft, publish state, and the photos. */
export const getCollectionEditor = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, photography_middleware, media_middleware])
  .validator(collectionIdSchema)
  .handler(async ({ context, data }) => {
    const row = await context.photography.getCollectionForEditor(data.id);
    if (!row) throw notFound();
    const { imgproxy, missing: missing_imgproxy } = getImgproxy();
    const { storage } = getMediaStorage();
    const [photos, cameras] = await Promise.all([
      context.photography.listCollectionPhotos(row.id),
      context.media.listCameraOptions(),
    ]);
    const { draftContent, coverId, coverMediaId, ...collection } = row;
    return {
      collection,
      content: draftContent,
      status: {
        draftUpdatedAt: row.draftUpdatedAt,
        publishedAt: row.publishedAt,
        isPublished: row.isPublished,
        hasUnpublishedChanges: row.hasUnpublishedChanges,
      },
      photos: photos.map((photo) => toMediaView(photo, imgproxy)),
      /** The chosen cover; null means the first photo is used. */
      cover_id: coverMediaId,
      cameras,
      setup: { can_upload: storage !== null, missing_imgproxy },
    };
  });

export const createCollection = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, photography_middleware])
  .validator(collectionInputSchema)
  .handler(async ({ context, data }) => {
    if (await context.photography.findCollectionIdBySlug(data.slug)) {
      slugTaken(data.slug);
    }
    return await context.photography.createCollection(data);
  });

export const updateCollection = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, photography_middleware])
  .validator(collectionUpdateSchema)
  .handler(async ({ context, data: { id, ...details } }) => {
    const slug_owner = await context.photography.findCollectionIdBySlug(details.slug);
    if (slug_owner && slug_owner !== id) slugTaken(details.slug);
    const collection = await context.photography.updateCollection(id, details);
    if (!collection) throw notFound();
    return collection;
  });

/** Deletes the collection; its photos stay in the media library. */
export const deleteCollection = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, photography_middleware])
  .validator(collectionIdSchema)
  .handler(async ({ context, data }) => {
    const collection = await context.photography.deleteCollection(data.id);
    if (!collection) throw notFound();
    return collection;
  });

export const saveCollectionDraft = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, photography_middleware])
  .validator(collectionContentSchema)
  .handler(async ({ context, data }) => {
    const status = await context.photography.saveDraft(data.id, data.content);
    if (!status) throw notFound();
    return status;
  });

/** Publishes the write-up (it may be empty) and puts the collection on the site. */
export const publishCollection = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, photography_middleware])
  .validator(collectionContentSchema)
  .handler(async ({ context, data }) => {
    if ((await context.photography.countPhotos(data.id)) === 0) {
      setResponseStatus(400);
      throw new Error("Add at least one photo before publishing.");
    }
    const status = await context.photography.publishCollection(
      data.id,
      data.content,
    );
    if (!status) throw notFound();
    return status;
  });

export const unpublishCollection = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, photography_middleware])
  .validator(collectionIdSchema)
  .handler(async ({ context, data }) => {
    const status = await context.photography.unpublishCollection(data.id);
    if (!status) throw notFound();
    return status;
  });

/** Adds library photos to the end of a collection. */
export const addCollectionPhotos = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, photography_middleware])
  .validator(collectionAddPhotosSchema)
  .handler(async ({ context, data }) => {
    const collection = await context.photography.getCollectionForEditor(data.id);
    if (!collection) throw notFound();
    if (collection.photoCount + data.mediaIds.length > COLLECTION_PHOTOS_MAX) {
      setResponseStatus(400);
      throw new Error(
        `A collection can hold up to ${COLLECTION_PHOTOS_MAX} photos. Pick fewer, or start another collection.`,
      );
    }
    const added = await context.photography.addPhotos(data.id, data.mediaIds);
    return { added, skipped: data.mediaIds.length - added };
  });

/** Takes a photo out of a collection; it stays in the library. */
export const removeCollectionPhoto = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, photography_middleware])
  .validator(collectionPhotoSchema)
  .handler(async ({ context, data }) => {
    const collection = await context.photography.getCollectionForEditor(data.id);
    if (!collection) throw notFound();
    if (collection.isPublished && collection.photoCount <= 1) {
      setResponseStatus(400);
      throw new Error(
        "A published collection needs at least one photo. Add another first, or unpublish it.",
      );
    }
    const removed = await context.photography.removePhoto(data.id, data.mediaId);
    if (!removed) throw notFound();
    return { success: true as const };
  });

export const setCollectionCover = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, photography_middleware])
  .validator(collectionCoverSchema)
  .handler(async ({ context, data }) => {
    if (data.mediaId && !(await context.photography.hasPhoto(data.id, data.mediaId))) {
      setResponseStatus(400);
      throw new Error("The cover has to be one of the collection's photos.");
    }
    const updated = await context.photography.setCover(data.id, data.mediaId);
    if (!updated) throw notFound();
    return { success: true as const };
  });

/** Saves the photos' order. The list must be exactly the collection's photos. */
export const reorderCollectionPhotos = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, photography_middleware])
  .validator(collectionOrderSchema)
  .handler(async ({ context, data }) => {
    const current = await context.photography.listCollectionPhotoIds(data.id);
    const given = new Set(data.mediaIds);
    if (
      current.length !== data.mediaIds.length ||
      current.some((id) => !given.has(id))
    ) {
      setResponseStatus(409);
      throw new Error(
        "The collection's photos changed since this page loaded. Refresh and try again.",
      );
    }
    await context.photography.reorderPhotos(data.id, data.mediaIds);
    return { success: true as const };
  });
