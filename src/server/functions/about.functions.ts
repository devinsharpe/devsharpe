import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { setResponseStatus } from "@tanstack/react-start/server";
import {
  BIOGRAPHY_HISTORY_LIMIT,
  biographyContentSchema,
  biographyVersionIdSchema,
  positionIdSchema,
  positionInputSchema,
  positionListSchema,
  positionReorderSchema,
} from "~/lib/about";
import { hasRichTextContent, toPlainText } from "~/lib/rich-text";
import { resolveRichTextMedia } from "~/server/media/rich-text-media.server";
import { about_middleware } from "~/server/middleware/about.middleware";
import { ensure_auth_middleware } from "~/server/middleware/auth.middleware";
import { media_middleware } from "~/server/middleware/media.middleware";

// <-- Positions (employment & volunteer history) -->
export const listPositions = createServerFn({ method: "GET" })
  .validator(positionListSchema)
  .middleware([about_middleware])
  .handler(({ context, data }) => {
    return context.about.listPositions(data?.type);
  });

export const createPosition = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, about_middleware])
  .validator(positionInputSchema)
  .handler(async ({ context, data }) => {
    if (await context.about.getPosition(data.id)) {
      setResponseStatus(409);
      throw new Error(
        `A position with the identifier "${data.id}" already exists`,
      );
    }
    return await context.about.createPosition(data);
  });

export const updatePosition = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, about_middleware])
  .validator(positionInputSchema)
  .handler(async ({ context, data }) => {
    const item = await context.about.updatePosition(data);
    if (!item) throw notFound();
    return item;
  });

export const deletePosition = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, about_middleware])
  .validator(positionIdSchema)
  .handler(async ({ context, data }) => {
    const item = await context.about.deletePosition(data.id);
    if (!item) throw notFound();
    return item;
  });

export const reorderPositions = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, about_middleware])
  .validator(positionReorderSchema)
  .handler(async ({ context, data }) => {
    await context.about.reorderPositions(data.type, data.ids);
    return { success: true };
  });

// <-- Biography (each save is a new version; the newest is current) -->
/** Public: the current biography and its images, or null if none has been written yet. */
export const getBiography = createServerFn({ method: "GET" })
  .middleware([about_middleware, media_middleware])
  .handler(async ({ context }) => {
    const current = await context.about.getCurrentBiography();
    if (!current) return null;
    return {
      content: current.content,
      media: await resolveRichTextMedia(context.media, [current.content]),
      updatedAt: current.createdAt,
    };
  });

/** Admin: the current biography and the most recent previous versions, as excerpts. */
export const getBiographyEditor = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, about_middleware])
  .handler(async ({ context }) => {
    const [current, previous, total] = await Promise.all([
      context.about.getCurrentBiography(),
      context.about.listPreviousBiographies(BIOGRAPHY_HISTORY_LIMIT),
      context.about.countBiographyVersions(),
    ]);
    return {
      current: current && {
        id: current.id,
        content: current.content,
        createdAt: current.createdAt,
      },
      previous: previous.map(({ content, ...version }) => ({
        ...version,
        excerpt: toPlainText(content, 160),
      })),
      previous_total: Math.max(total - 1, 0),
    };
  });

/** Admin: one version in full (with its images), for previewing before a restore. */
export const getBiographyVersion = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, about_middleware, media_middleware])
  .validator(biographyVersionIdSchema)
  .handler(async ({ context, data }) => {
    const version = await context.about.getBiographyVersion(data.id);
    if (!version) throw notFound();
    return {
      id: version.id,
      content: version.content,
      media: await resolveRichTextMedia(context.media, [version.content]),
      createdAt: version.createdAt,
    };
  });

export const saveBiography = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, about_middleware])
  .validator(biographyContentSchema)
  .handler(async ({ context, data }) => {
    if (!hasRichTextContent(data.content)) {
      setResponseStatus(400);
      throw new Error("Write something before saving.");
    }
    const version = await context.about.createBiographyVersion(data.content);
    return { id: version.id, createdAt: version.createdAt };
  });

export const restoreBiography = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, about_middleware])
  .validator(biographyVersionIdSchema)
  .handler(async ({ context, data }) => {
    const version = await context.about.restoreBiographyVersion(data.id);
    if (!version) throw notFound();
    return { id: version.id, createdAt: version.createdAt };
  });
