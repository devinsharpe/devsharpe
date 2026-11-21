import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import {
  RESUME_CONTENT_TYPE,
  RESUME_HISTORY_LIMIT,
  resumeIdSchema,
  resumeUploadSchema,
} from "~/lib/resume";
import {
  getMediaStorage,
  type MediaStorage,
  requireMediaStorage,
  storageError,
} from "~/server/media/storage.server";
import { ensure_auth_middleware } from "~/server/middleware/auth.middleware";
import { resume_middleware } from "~/server/middleware/resume.middleware";
import type { ResumeRepository } from "~/server/repositories/resume.repository.server";

/** Uploads not finished within this long are treated as abandoned. */
const ABANDONED_UPLOAD_MS = 24 * 60 * 60 * 1000;

/** PDF readers accept the "%PDF-" header anywhere in the first 1024 bytes. */
const PDF_HEADER_WINDOW = 1024;

/** Removes a few abandoned uploads, objects first. Never blocks a new upload. */
async function cleanUpAbandonedUploads(
  resumes: ResumeRepository,
  storage: MediaStorage,
) {
  try {
    const stale = await resumes.listStalePendingResumes(
      new Date(Date.now() - ABANDONED_UPLOAD_MS),
      20,
    );
    for (const item of stale) {
      await storage.delete(item.storageKey);
      await resumes.deleteResume(item.id);
    }
  } catch (error) {
    console.error("Couldn't clean up abandoned résumé uploads.", error);
  }
}

/** Throws away a bad upload: the object (best effort), then its row. */
async function discard(
  resumes: ResumeRepository,
  storage: MediaStorage,
  item: { id: string; storageKey: string },
) {
  try {
    await storage.delete(item.storageKey);
  } catch (error) {
    console.error("Couldn't delete a rejected résumé upload.", error);
  }
  await resumes.deleteResume(item.id);
}

/** Public: whether /resume.pdf has a file to serve (for the employment page). */
export const getResumeAvailability = createServerFn({ method: "GET" })
  .middleware([resume_middleware])
  .handler(async ({ context }) => {
    try {
      return { has_pdf: (await context.resumes.getCurrentResume()) !== null };
    } catch (error) {
      // Don't fail the page over it (e.g. before `npm run migrate` adds the table).
      console.error("Couldn't check for an uploaded résumé.", error);
      return { has_pdf: false };
    }
  });

/** Admin: the current résumé, the previous ones, and whether uploads work. */
export const getResumeLibrary = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, resume_middleware])
  .handler(async ({ context }) => {
    const { storage, missing } = getMediaStorage();
    const [current = null, ...previous] =
      await context.resumes.listReadyResumes(RESUME_HISTORY_LIMIT + 1);
    return {
      current,
      previous,
      setup: { can_upload: storage !== null, missing_storage: missing },
    };
  });

/**
 * Step 1 of an upload: records it and returns a presigned URL. The browser
 * PUTs the PDF there directly, then calls `completeResumeUpload`.
 */
export const createResumeUpload = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, resume_middleware])
  .validator(resumeUploadSchema)
  .handler(async ({ context, data }) => {
    const storage = requireMediaStorage();
    await cleanUpAbandonedUploads(context.resumes, storage);

    // Keys are generated here, never taken from the file name.
    const id = crypto.randomUUID();
    const storage_key = `resumes/${id}.pdf`;
    let upload_url: string;
    try {
      upload_url = await storage.presignUpload(
        storage_key,
        RESUME_CONTENT_TYPE,
        data.byteSize,
      );
    } catch (error) {
      throw storageError(error);
    }
    await context.resumes.createPendingResume({
      id,
      storageKey: storage_key,
      originalName: data.filename,
      byteSize: data.byteSize,
    });
    return { id, upload_url };
  });

/**
 * Step 2: checks that a PDF arrived as promised (size, type, and the PDF
 * header), then makes it the current résumé. Anything else is discarded.
 */
export const completeResumeUpload = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, resume_middleware])
  .validator(resumeIdSchema)
  .handler(async ({ context, data }) => {
    const storage = requireMediaStorage();
    const item = await context.resumes.getResume(data.id);
    if (!item) throw notFound();
    if (item.status === "ready") return { id: item.id };

    let stored: Awaited<ReturnType<MediaStorage["head"]>>;
    try {
      stored = await storage.head(item.storageKey);
    } catch (error) {
      throw storageError(error);
    }
    if (!stored) {
      await context.resumes.deleteResume(item.id);
      setResponseStatus(409);
      throw new Error("The file never reached storage. Try uploading it again.");
    }
    const stored_type = stored.contentType.split(";")[0].trim().toLowerCase();
    if (stored.byteSize !== item.byteSize || stored_type !== RESUME_CONTENT_TYPE) {
      await discard(context.resumes, storage, item);
      setResponseStatus(400);
      throw new Error(
        "The uploaded file didn't match what was expected, so it was discarded.",
      );
    }
    let header: Uint8Array;
    try {
      header = await storage.readStart(item.storageKey, PDF_HEADER_WINDOW);
    } catch (error) {
      throw storageError(error);
    }
    if (!Buffer.from(header).includes("%PDF-")) {
      await discard(context.resumes, storage, item);
      setResponseStatus(400);
      throw new Error("That file isn't a PDF, so it was discarded.");
    }

    const ready = await context.resumes.markResumeReady(item.id);
    if (!ready) throw notFound();
    return { id: ready.id };
  });

/** Gives up on an unfinished upload (e.g. the PUT failed). Safe to call twice. */
export const cancelResumeUpload = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, resume_middleware])
  .validator(resumeIdSchema)
  .handler(async ({ context, data }) => {
    const item = await context.resumes.getResume(data.id);
    if (!item || item.status !== "pending") return { success: true };
    const { storage } = getMediaStorage();
    if (storage) {
      try {
        await storage.delete(item.storageKey);
      } catch (error) {
        // Left for the abandoned-upload cleanup to retry.
        console.error("Couldn't delete a cancelled résumé upload.", error);
        return { success: true };
      }
    }
    await context.resumes.deleteResume(item.id);
    return { success: true };
  });

/** Makes a previous résumé the one visitors download. */
export const makeResumeCurrent = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, resume_middleware])
  .validator(resumeIdSchema)
  .handler(async ({ context, data }) => {
    const item = await context.resumes.makeResumeCurrent(data.id);
    if (!item) throw notFound();
    return { id: item.id };
  });

/** Deletes a résumé and its file. Deleting the current one makes the next newest current. */
export const deleteResume = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, resume_middleware])
  .validator(resumeIdSchema)
  .handler(async ({ context, data }) => {
    const storage = requireMediaStorage();
    const item = await context.resumes.getResume(data.id);
    if (!item) throw notFound();
    try {
      await storage.delete(item.storageKey);
    } catch (error) {
      throw storageError(error);
    }
    await context.resumes.deleteResume(item.id);
    return { success: true };
  });
