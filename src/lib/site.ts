// Client-safe module: validation for site-wide settings, shared by the site
// server functions and the admin forms. Keep imports relative: drizzle-kit
// may load lib modules through the database schema.
import * as z from "zod";

export const SITE_SUBTITLE_MAX_LENGTH = 120;

/** The line under the site name in the header; empty hides it. */
export const siteSubtitleSchema = z.object({
  subtitle: z
    .string()
    .trim()
    .max(
      SITE_SUBTITLE_MAX_LENGTH,
      `Keep it under ${SITE_SUBTITLE_MAX_LENGTH} characters`,
    ),
});
export type SiteSubtitleInput = z.input<typeof siteSubtitleSchema>;
