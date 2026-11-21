// Client-safe module: constants and validation schemas shared by the media
// server functions (inputs) and the admin media library (pre-checks). Nothing
// here may touch server-only APIs. Keep imports relative: drizzle-kit loads
// the database schema, which imports from this module.
import * as z from "zod";
import {
  optionalIdentifier,
  optionalText,
  tagFilter,
  tagList,
} from "./validation";

/** A pending upload has a presigned URL but hasn't been checked yet. */
export const MEDIA_STATUSES = ["pending", "ready"] as const;
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

/**
 * Image types that can be uploaded, with the extension used for the stored
 * object. No SVG: it can carry scripts, and imgproxy treats it differently.
 */
export const MEDIA_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
} as const;
export type MediaContentType = keyof typeof MEDIA_TYPES;
const MEDIA_CONTENT_TYPES = Object.keys(MEDIA_TYPES) as [
  MediaContentType,
  ...MediaContentType[],
];

/** For a file input's `accept`. */
export const MEDIA_ACCEPT = MEDIA_CONTENT_TYPES.join(",");

export const MEDIA_MAX_BYTES = 50 * 1024 * 1024;
export const MEDIA_PAGE_SIZE = 48;
export const MEDIA_ALT_TEXT_MAX_LENGTH = 500;
export const MEDIA_CAPTION_MAX_LENGTH = 1000;
export const MEDIA_LOCATION_MAX_LENGTH = 200;
export const MEDIA_TAG_MAX_LENGTH = 40;
export const MEDIA_TAGS_MAX = 20;

/** Comma-separated text → tags (see tagList), as typed in the library. */
export const mediaTagsSchema = tagList(MEDIA_TAGS_MAX, MEDIA_TAG_MAX_LENGTH);

/** Browsers sometimes leave `File.type` blank (HEIC on Chrome, for one). */
const TYPES_BY_EXTENSION: Record<string, MediaContentType> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
};

/** The upload type for a file: its own type if allowed, else by extension. */
export function mediaTypeOf(file: { name: string; type: string }) {
  if (file.type in MEDIA_TYPES) return file.type as MediaContentType;
  if (file.type) return null;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return TYPES_BY_EXTENSION[extension] ?? null;
}

export const isMediaContentType = (value: string): value is MediaContentType =>
  value in MEDIA_TYPES;

/** e.g. 3_400_000 → "3.2 MB". */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

const dimension = z.number().int().min(1).max(100_000).nullable();

/** Asking for a presigned upload URL for one file. */
export const mediaUploadSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  contentType: z.enum(MEDIA_CONTENT_TYPES, "That file type isn't supported"),
  byteSize: z
    .number()
    .int()
    .min(1, "The file is empty")
    .max(MEDIA_MAX_BYTES, `Files can be up to ${formatBytes(MEDIA_MAX_BYTES)}`),
  /** As the browser decoded it (after EXIF rotation); null if it couldn't. */
  width: dimension,
  height: dimension,
  /** The camera it was taken with, or "" for none. */
  cameraId: optionalIdentifier,
  tags: mediaTagsSchema,
});
export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;

export const mediaIdSchema = z.object({ id: z.uuid() });

const mediaIdValue = z.uuid();

/** Whether `value` has the shape of a media id (a library item's uuid). */
export const isMediaId = (value: unknown): value is string =>
  mediaIdValue.safeParse(value).success;

/** At most this many items are looked up in one request (see getMediaViews). */
export const MEDIA_LOOKUP_MAX = 100;

/** Library items to look up by id, e.g. the images in a document being edited. */
export const mediaIdsSchema = z.object({
  ids: z.array(mediaIdValue).min(1).max(MEDIA_LOOKUP_MAX),
});

/** Details edited in the library. Blank values are stored as NULL. */
export const mediaDetailsSchema = z.object({
  altText: optionalText(MEDIA_ALT_TEXT_MAX_LENGTH),
  caption: optionalText(MEDIA_CAPTION_MAX_LENGTH),
  /** Where it was taken, e.g. "Reykjavík, Iceland". Shown on photo pages. */
  location: optionalText(MEDIA_LOCATION_MAX_LENGTH),
  cameraId: optionalIdentifier,
  tags: mediaTagsSchema,
});
export type MediaDetailsInput = z.input<typeof mediaDetailsSchema>;

export const mediaDetailsUpdateSchema = mediaDetailsSchema.extend({
  id: z.uuid(),
});

/** URL state for the media library. */
export const mediaLibrarySearchSchema = z.object({
  tag: tagFilter(MEDIA_TAG_MAX_LENGTH),
  page: z.number().int().min(1).max(10_000).default(1).catch(1),
});
export type MediaLibrarySearch = z.infer<typeof mediaLibrarySearchSchema>;
