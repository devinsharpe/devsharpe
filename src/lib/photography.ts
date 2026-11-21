// Client-safe module: photo collections, shared by the photography server
// functions, the public /photography routes (URL state), and the admin forms.
// Nothing here may touch server-only APIs. Keep imports relative: drizzle-kit
// loads the database schema, which imports VIEW_KINDS from here.
import * as z from "zod";
import { richTextDocumentSchema } from "./rich-text";
import { optionalText, requiredText } from "./validation";

export const COLLECTION_TITLE_MAX_LENGTH = 200;
export const COLLECTION_DESCRIPTION_MAX_LENGTH = 300;
/** Photos one collection can hold. */
export const COLLECTION_PHOTOS_MAX = 500;
/** Photos added in one go from the picker. */
export const COLLECTION_ADD_MAX = 100;

/** Collections per page on /photography. */
export const COLLECTIONS_PAGE_SIZE = 12;
/** Photos per page on /photography?camera= and the admin Photographs page. */
export const PHOTOS_PAGE_SIZE = 48;

/** What page views are counted for (see recordView). */
export const VIEW_KINDS = ["collection", "photo"] as const;
export type ViewKind = (typeof VIEW_KINDS)[number];

/** URL slug: /photography/{slug}. */
const collectionSlug = z
  .string()
  .trim()
  .min(1, "Enter a title to generate a slug")
  .max(120)
  // `*` so an empty value reports only the `min` message above.
  .regex(/^[a-z0-9-]*$/, "Only lowercase letters, numbers, and dashes");

/** A collection's details (not its photos or write-up), as edited in the admin form. */
export const collectionInputSchema = z.object({
  slug: collectionSlug,
  title: requiredText("Title is required", COLLECTION_TITLE_MAX_LENGTH),
  description: optionalText(COLLECTION_DESCRIPTION_MAX_LENGTH),
});
export type CollectionInput = z.input<typeof collectionInputSchema>;

export const collectionUpdateSchema = collectionInputSchema.extend({
  id: z.uuid(),
});

export const collectionIdSchema = z.object({ id: z.uuid() });

const uuid = z.uuid();
/** Whether a route param could be an id (so bad URLs 404 instead of erroring). */
export const isUuid = (value: string) => uuid.safeParse(value).success;

export const collectionSlugSchema = z.object({
  slug: z.string().min(1).max(200),
});

/** /photography/{slug}/{photoId}. */
export const photoPageSchema = collectionSlugSchema.extend({
  photoId: z.uuid(),
});

/** Saving or publishing the write-up from the editor. */
export const collectionContentSchema = z.object({
  id: z.uuid(),
  content: richTextDocumentSchema,
});

const distinctIds = (max: number) =>
  z
    .array(z.uuid())
    .max(max)
    .refine((ids) => new Set(ids).size === ids.length, "Duplicate photos");

/** Photos picked from the library, added to the end of the collection. */
export const collectionAddPhotosSchema = z.object({
  id: z.uuid(),
  mediaIds: distinctIds(COLLECTION_ADD_MAX).refine(
    (ids) => ids.length > 0,
    "Pick at least one photo",
  ),
});

/** One photo in a collection (to remove it). */
export const collectionPhotoSchema = z.object({
  id: z.uuid(),
  mediaId: z.uuid(),
});

/** The card image: one of its photos, or null for the first photo. */
export const collectionCoverSchema = z.object({
  id: z.uuid(),
  mediaId: z.uuid().nullable(),
});

/** Every photo in the collection, in its new order. */
export const collectionOrderSchema = z.object({
  id: z.uuid(),
  mediaIds: distinctIds(COLLECTION_PHOTOS_MAX),
});

const pageNumber = z.number().int().min(1).max(10_000).default(1).catch(1);

/**
 * URL state for /photography: collections, or with `camera`, the photos
 * taken with it (linked from /uses). Bad values fall back instead of throwing.
 */
export const photographySearchSchema = z.object({
  camera: z.string().trim().min(1).max(120).optional().catch(undefined),
  page: pageNumber,
});
export type PhotographySearch = z.infer<typeof photographySearchSchema>;

/** URL state for the admin Photographs page. */
export const photographsAdminSearchSchema = z.object({ page: pageNumber });

/** A short list, e.g. the homepage's latest collections. */
export const photographyLimitSchema = z.object({
  limit: z.number().int().min(1).max(24),
});

/** Counting a visit to a public collection or photo page. */
export const recordViewSchema = z.object({
  kind: z.enum(VIEW_KINDS),
  id: z.uuid(),
});

/** "1 photo", "12 photos". */
export const photoCount = (count: number) =>
  `${count.toLocaleString("en-US")} ${count === 1 ? "photo" : "photos"}`;

/** "1 view", "1,204 views". */
export const viewCount = (count: number) =>
  `${count.toLocaleString("en-US")} ${count === 1 ? "view" : "views"}`;
