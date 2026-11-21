// Server-only: media rows as the pages see them, with imgproxy URLs filled
// in. The storage key and signing stay on the server.
import type { Media } from "../database/schema.server";
import type { Imgproxy } from "./imgproxy.server";

/** Library tiles are shown at up to ~240px, so this covers 2x screens. */
const THUMBNAIL_SIZE = 480;

/** srcset widths for a full image. */
const IMAGE_WIDTHS = [640, 1280, 1920, 2560];

/** Used as `src` (for browsers without srcset support, and as the copyable link). */
const DEFAULT_WIDTH = 1280;

export interface ResponsiveImage {
  src: string;
  srcSet: string;
  /** The original's size, for the aspect ratio; null if it wasn't known. */
  width: number | null;
  height: number | null;
}

/**
 * Sizes of the image for `srcset`. imgproxy never enlarges (by default), so
 * widths past the original's are dropped and the original's own width is
 * offered as the largest.
 */
export function toResponsiveImage(
  imgproxy: Imgproxy,
  { storageKey, width, height }: Pick<Media, "storageKey" | "width" | "height">,
): ResponsiveImage {
  const widths = width
    ? [...IMAGE_WIDTHS.filter((candidate) => candidate < width), width]
    : IMAGE_WIDTHS;
  const candidates = widths.map((candidate) => ({
    width: candidate,
    url: imgproxy.url(storageKey, `rs:fit:${candidate}:0`),
  }));
  const fallback =
    candidates.find((candidate) => candidate.width >= DEFAULT_WIDTH) ??
    candidates[candidates.length - 1];
  return {
    src: fallback.url,
    srcSet: candidates
      .map((candidate) => `${candidate.url} ${candidate.width}w`)
      .join(", "),
    width,
    height,
  };
}

/** A square crop, with imgproxy's smart gravity picking the interesting part. */
export function toThumbnailUrl(
  imgproxy: Imgproxy,
  { storageKey }: Pick<Media, "storageKey">,
  size = THUMBNAIL_SIZE,
) {
  return imgproxy.url(storageKey, `rs:fill:${size}:${size}/g:sm`);
}

/** 1200 × 630, the size link previews (Open Graph) expect. */
export function toShareImageUrl(
  imgproxy: Imgproxy,
  { storageKey }: Pick<Media, "storageKey">,
) {
  return imgproxy.url(storageKey, "rs:fill:1200:630/g:sm");
}

/** A library item. Image URLs are null while imgproxy isn't configured. */
export function toMediaView(row: Media, imgproxy: Imgproxy | null) {
  return {
    id: row.id,
    originalName: row.originalName,
    contentType: row.contentType,
    byteSize: row.byteSize,
    width: row.width,
    height: row.height,
    altText: row.altText,
    caption: row.caption,
    location: row.location,
    cameraId: row.cameraId,
    tags: row.tags,
    createdAt: row.createdAt,
    thumbnailUrl: imgproxy ? toThumbnailUrl(imgproxy, row) : null,
    image: imgproxy ? toResponsiveImage(imgproxy, row) : null,
  };
}
export type MediaView = ReturnType<typeof toMediaView>;

/** Collection cards crop to 3:2; these are the widths offered. */
const COVER_WIDTHS = [480, 960, 1440];

/** A 3:2 crop for collection cards, with smart gravity picking the subject. */
export function toCoverImage(
  imgproxy: Imgproxy,
  { storageKey }: Pick<Media, "storageKey">,
): ResponsiveImage {
  const candidates = COVER_WIDTHS.map((width) => ({
    width,
    url: imgproxy.url(
      storageKey,
      `rs:fill:${width}:${Math.round((width * 2) / 3)}/g:sm`,
    ),
  }));
  return {
    src: candidates[1].url,
    srcSet: candidates
      .map((candidate) => `${candidate.url} ${candidate.width}w`)
      .join(", "),
    width: 3,
    height: 2,
  };
}

/** A photo as public pages show it. Image is null while imgproxy isn't configured. */
export function toPhotoView(row: Media, imgproxy: Imgproxy | null) {
  return {
    id: row.id,
    altText: row.altText ?? "",
    caption: row.caption,
    location: row.location,
    image: imgproxy ? toResponsiveImage(imgproxy, row) : null,
  };
}
export type PhotoView = ReturnType<typeof toPhotoView>;

/**
 * Square crops (smart gravity picks the subject) at `widths`, for small
 * fixed-size photos such as the one at the top of /links.
 */
export function toSquareImage(
  imgproxy: Imgproxy,
  row: Pick<Media, "storageKey">,
  widths: number[],
): ResponsiveImage {
  const candidates = widths.map((width) => ({
    width,
    url: toThumbnailUrl(imgproxy, row, width),
  }));
  return {
    src: candidates[candidates.length - 1].url,
    srcSet: candidates
      .map((candidate) => `${candidate.url} ${candidate.width}w`)
      .join(", "),
    width: 1,
    height: 1,
  };
}
