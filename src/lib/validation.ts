// Client-safe building blocks for the admin form schemas (gear, biography).
// Nothing here may touch server-only APIs. Keep imports relative: the database
// schema (loaded by drizzle-kit) imports modules that import this one.
import slugify from "slugify";
import * as z from "zod";

/** Slug used as a record's primary key, e.g. "Strata Company" → "strata-company". */
export function toIdentifier(value: string) {
  return slugify(value, { lower: true, strict: true });
}

export const identifierSchema = z
  .string()
  .trim()
  .min(1, "Enter a name to generate an identifier")
  .max(120)
  // `*` so an empty value reports only the `min` message above.
  .regex(/^[a-z0-9-]*$/, "Only lowercase letters, numbers, and dashes");

export const requiredText = (message: string, max = 200) =>
  z.string().trim().min(1, message).max(max);

/** Empty strings from the form are stored as NULL. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);

/**
 * Comma-separated text → tags. Lowercased (so "React" and "react" are one
 * filter), a leading "#" dropped (it's added back for display), and
 * duplicates and blanks removed.
 */
export const tagList = (max_tags: number, max_length: number) =>
  z
    .string()
    .transform((value) => [
      ...new Set(
        value
          .split(",")
          .map((tag) => tag.trim().replace(/^#+\s*/, "").toLowerCase())
          .filter(Boolean),
      ),
    ])
    .pipe(
      z
        .array(
          z.string().max(max_length, `Keep each tag under ${max_length} characters`),
        )
        .max(max_tags, `At most ${max_tags} tags`),
    );

/** A ?tag= filter from the URL. A bad value is dropped rather than throwing. */
export const tagFilter = (max_length: number) =>
  z.string().trim().toLowerCase().min(1).max(max_length).optional().catch(undefined);

/** A record to link by its identifier, or "" for none (stored as NULL). */
export const optionalIdentifier = z
  .union([z.literal(""), identifierSchema])
  .transform((value) => value || null);

export const optionalUrl = z
  .union([z.literal(""), z.url("Enter a full URL, e.g. https://…")])
  .transform((value) => value || null);

/** A full list of record ids in their new display order. */
export const reorderIdsSchema = z
  .array(z.string().min(1).max(120))
  .max(500)
  .refine((ids) => new Set(ids).size === ids.length, "Duplicate ids");

/** Textarea → array: one entry per non-blank line. */
export const lineList = (max_items: number, max_length: number) =>
  z
    .string()
    .transform((value) =>
      value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string().max(max_length, `Keep each line under ${max_length} characters`))
        .max(max_items, `At most ${max_items} lines`),
    );

/** Text input → array: comma-separated, blanks dropped. */
export const commaList = (max_items: number, max_length: number) =>
  z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    )
    .pipe(
      z
        .array(z.string().max(max_length, `Keep each entry under ${max_length} characters`))
        .max(max_items, `At most ${max_items} entries`),
    );
