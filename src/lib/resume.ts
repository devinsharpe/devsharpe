// Client-safe module: constants and validation schemas for résumé uploads,
// shared by the résumé server functions (inputs) and the admin uploader
// (pre-checks). Nothing here may touch server-only APIs. Keep imports
// relative: drizzle-kit loads the database schema, which imports this module.
import * as z from "zod";
import { formatBytes } from "./media";

/** A pending upload has a presigned URL but hasn't been checked yet. */
export const RESUME_STATUSES = ["pending", "ready"] as const;
export type ResumeStatus = (typeof RESUME_STATUSES)[number];

export const RESUME_CONTENT_TYPE = "application/pdf";
/** For the file input's `accept`. */
export const RESUME_ACCEPT = `${RESUME_CONTENT_TYPE},.pdf`;
export const RESUME_MAX_BYTES = 10 * 1024 * 1024;
/** How many previous résumés the admin page lists (newest first). */
export const RESUME_HISTORY_LIMIT = 50;

/** Whether a picked file is a PDF. Some browsers leave `File.type` blank. */
export function isPdfFile(file: { name: string; type: string }) {
  if (file.type) return file.type === RESUME_CONTENT_TYPE;
  return /\.pdf$/i.test(file.name);
}

/** Asking for a presigned upload URL for one PDF. */
export const resumeUploadSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  byteSize: z
    .number()
    .int()
    .min(1, "The file is empty")
    .max(
      RESUME_MAX_BYTES,
      `Résumés can be up to ${formatBytes(RESUME_MAX_BYTES)}`,
    ),
});

export const resumeIdSchema = z.object({ id: z.uuid() });
