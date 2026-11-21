import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import {
  LINKS_MAX,
  linkIdSchema,
  linkInputSchema,
  linkOrderSchema,
  linksProfileSchema,
  linkUpdateSchema,
  linkVisibilitySchema,
} from "~/lib/links";
import { getServerEnv } from "~/server/env.server";
import { getImgproxy } from "~/server/media/imgproxy.server";
import {
  toMediaView,
  toShareImageUrl,
  toSquareImage,
} from "~/server/media/media-views.server";
import { ensure_auth_middleware } from "~/server/middleware/auth.middleware";
import { links_middleware } from "~/server/middleware/links.middleware";
import { media_middleware } from "~/server/middleware/media.middleware";
import { site_middleware } from "~/server/middleware/site.middleware";
import type { MediaRepository } from "~/server/repositories/media.repository.server";

/** The photo is shown at 96px; these cover 1x to 3x screens. */
const PROFILE_PHOTO_WIDTHS = [96, 192, 288];

/** The chosen profile photo, if it's still a finished upload in the library. */
async function readProfilePhoto(media_repo: MediaRepository, id: string | null) {
  if (!id) return null;
  const [row] = await media_repo.listReadyMediaByIds([id]);
  return row ?? null;
}

// <-- Public -->

/** /links: the name, photo, line, and the links that are shown. */
export const getLinksPage = createServerFn({ method: "GET" })
  .middleware([links_middleware, site_middleware, media_middleware])
  .handler(async ({ context }) => {
    const { imgproxy } = getImgproxy();
    const [settings, links] = await Promise.all([
      context.site.getSettings(),
      context.links.listVisibleLinks(),
    ]);
    const photo = await readProfilePhoto(
      context.media,
      settings?.linksPhotoMediaId ?? null,
    );
    return {
      title: getServerEnv().siteTitle,
      bio: settings?.linksBio ?? null,
      photo:
        photo && imgproxy
          ? {
              alt: photo.altText ?? "",
              image: toSquareImage(imgproxy, photo, PROFILE_PHOTO_WIDTHS),
            }
          : null,
      links,
      share_image: photo && imgproxy ? toShareImageUrl(imgproxy, photo) : null,
    };
  });

// <-- Admin -->

/** Admin: every link with its clicks, and the profile at the top of the page. */
export const getLinksEditor = createServerFn({ method: "GET" })
  .middleware([
    ensure_auth_middleware,
    links_middleware,
    site_middleware,
    media_middleware,
  ])
  .handler(async ({ context }) => {
    const { imgproxy, missing: missing_imgproxy } = getImgproxy();
    const [settings, links] = await Promise.all([
      context.site.getSettings(),
      context.links.listAllLinks(),
    ]);
    const photo = await readProfilePhoto(
      context.media,
      settings?.linksPhotoMediaId ?? null,
    );
    return {
      title: getServerEnv().siteTitle,
      profile: {
        bio: settings?.linksBio ?? "",
        photo: photo ? toMediaView(photo, imgproxy) : null,
      },
      links: links.map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        isVisible: link.isVisible,
        clicks: link.clicks,
        lastClickedAt: link.lastClickedAt,
      })),
      total_clicks: links.reduce((total, link) => total + link.clicks, 0),
      setup: { missing_imgproxy },
    };
  });

export const createLink = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, links_middleware])
  .validator(linkInputSchema)
  .handler(async ({ context, data }) => {
    if ((await context.links.countLinks()) >= LINKS_MAX) {
      setResponseStatus(400);
      throw new Error(
        `The page can hold up to ${LINKS_MAX} links. Delete one to add another.`,
      );
    }
    return await context.links.createLink(data);
  });

export const updateLink = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, links_middleware])
  .validator(linkUpdateSchema)
  .handler(async ({ context, data: { id, ...details } }) => {
    const link = await context.links.updateLink(id, details);
    if (!link) throw notFound();
    return link;
  });

/** Shows or hides a link on the page without opening its form. */
export const setLinkVisibility = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, links_middleware])
  .validator(linkVisibilitySchema)
  .handler(async ({ context, data }) => {
    const link = await context.links.setVisibility(data.id, data.isVisible);
    if (!link) throw notFound();
    return link;
  });

export const deleteLink = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, links_middleware])
  .validator(linkIdSchema)
  .handler(async ({ context, data }) => {
    const link = await context.links.deleteLink(data.id);
    if (!link) throw notFound();
    return link;
  });

/** Saves the links' order. The list must be exactly the current links. */
export const reorderLinks = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, links_middleware])
  .validator(linkOrderSchema)
  .handler(async ({ context, data }) => {
    const current = await context.links.listLinkIds();
    const given = new Set(data.ids);
    if (
      current.length !== data.ids.length ||
      current.some((id) => !given.has(id))
    ) {
      setResponseStatus(409);
      throw new Error(
        "The links changed since this page loaded. Refresh and try again.",
      );
    }
    await context.links.reorderLinks(data.ids);
    return { success: true as const };
  });

/** The photo and line at the top of the page. */
export const updateLinksProfile = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, site_middleware, media_middleware])
  .validator(linksProfileSchema)
  .handler(async ({ context, data }) => {
    if (data.photoMediaId) {
      const photo = await context.media.getMedia(data.photoMediaId);
      if (!photo || photo.status !== "ready") {
        setResponseStatus(400);
        throw new Error(
          "That photo isn't in the media library anymore. Pick another.",
        );
      }
    }
    const settings = await context.site.updateLinksProfile(data);
    return {
      bio: settings.linksBio,
      photoMediaId: settings.linksPhotoMediaId,
    };
  });
