// Server-only: share cards for pages without an image of their own, and the
// site icon, as image responses (see routes/og/$.ts and the favicon routes).
//
// A card's text comes from the page's path, never from the request, so the
// endpoint can't be used to put arbitrary words on the site's cards. It's the
// page's breadcrumbs: the labels routes set in `staticData.breadcrumb`, with
// the labels that depend on the page (a post's title, ...) looked up here
// from published content only.
import type { getRouter } from "~/router";
import { db } from "../database/index.server";
import { getServerEnv } from "../env.server";
import {
  etagFor,
  matchesEtag,
  readSavedSubtitle,
  resolveSiteOrigin,
} from "../feed.server";
import { PhotographyRepository } from "../repositories/photography.repository.server";
import { PostsRepository } from "../repositories/posts.repository.server";
import { ProjectsRepository } from "../repositories/projects.repository.server";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  ShareCard,
  type ShareCardContent,
  SiteIcon,
  siteInitials,
} from "./designs.server";

/**
 * The renderer, loaded when the first image is drawn rather than with the
 * routes: with its WebAssembly, it's a few MB.
 */
const renderer = () => import("./render.server");

/** Bump when the designs change, so caches and crawlers fetch new images. */
const DESIGN_VERSION = 1;

/** Crawlers fetch a card once per share; let them and the CDN reuse it a day. */
const CARD_CACHE_CONTROL = "public, max-age=86400";
const ICON_CACHE_CONTROL = "public, max-age=604800";

/** Routes that never get a card: the admin pages, the APIs, and the cards. */
const NO_CARD_ROUTE_PREFIXES = ["/_authenticated", "/api", "/og"];

/**
 * The labels of the routes whose crumb is a component (it reads the page's
 * loader data in the browser). Keep in step with those routes. A label that
 * isn't found (e.g. an unpublished post) is left out, so the card shows the
 * section instead.
 */
const PAGE_LABELS: Record<
  string,
  (params: Record<string, string>) => Promise<string | null | undefined>
> = {
  "/posts/$slug": async ({ slug }) =>
    (await new PostsRepository(db).getPublishedPost(slug))?.title,
  "/projects/$slug": async ({ slug }) =>
    (await new ProjectsRepository(db).getProject(slug))?.name,
  "/photography/$slug": async ({ slug }) =>
    (await new PhotographyRepository(db).getPublishedCollection(slug))?.title,
  "/photography/$slug/$photoId": async ({ slug, photoId }) => {
    const found = await new PhotographyRepository(db).getPublishedPhoto(
      slug,
      photoId,
    );
    return found && `Photo ${found.index + 1} of ${found.total}`;
  },
};

type Router = ReturnType<typeof getRouter>;
let router: Promise<Router> | null = null;

/**
 * The app's routes that `path` matches, root first. The router is imported
 * lazily, since it imports every route (this module's own route included).
 */
async function matchRoutes(path: string) {
  router ??= import("~/router").then((module) => module.getRouter());
  return (await router).getMatchedRoutes(path);
}

/** The page's crumbs after Home, or null when the path has no card. */
async function crumbsFor(path: string) {
  const [routes, params, found] = await matchRoutes(path);
  // No page there, or a server route (an API, a feed, this one).
  if (!found || found.options.server) return null;
  const is_excluded = routes.some((route) =>
    NO_CARD_ROUTE_PREFIXES.some((prefix) => route.id.startsWith(prefix)),
  );
  if (is_excluded) return null;
  const crumbs: string[] = [];
  for (const route of routes.slice(1)) {
    const crumb = route.options.staticData?.breadcrumb;
    if (!crumb) continue;
    const label =
      typeof crumb === "string" ? crumb : await PAGE_LABELS[route.id]?.(params);
    if (label) crumbs.push(label);
  }
  return crumbs;
}

/** What the card for `path` says, or null when it has none. */
export async function shareCardContent(
  path: string,
  request_url: string,
): Promise<ShareCardContent | null> {
  const crumbs = await crumbsFor(path);
  if (!crumbs) return null;
  const env = getServerEnv();
  const brand = env.siteTitle;
  const host = new URL(resolveSiteOrigin(request_url)).host;
  if (crumbs.length === 0) {
    // The home page (and pages without a crumb): the site's subtitle.
    const subtitle = (await readSavedSubtitle()) ?? env.siteSubtitle;
    return { brand, host, section: [], title: subtitle || brand };
  }
  return { brand, host, section: crumbs.slice(0, -1), title: crumbs.at(-1)! };
}

/** Recently drawn images by ETag, so repeat requests skip the drawing. */
const drawn = new Map<string, Uint8Array | string>();
const DRAWN_LIMIT = 100;

/**
 * An image response for `content`, drawn by `draw` unless the client or this
 * process already has it. The ETag covers the content and the design version.
 */
async function imageResponse(
  request: Request,
  content: unknown,
  content_type: string,
  cache_control: string,
  draw: () => Promise<Uint8Array | string>,
) {
  const etag = await etagFor(JSON.stringify([DESIGN_VERSION, content]));
  const headers = { "Cache-Control": cache_control, ETag: etag };
  if (matchesEtag(request.headers.get("if-none-match"), etag)) {
    return new Response(null, { status: 304, headers });
  }
  let body = drawn.get(etag);
  if (body === undefined) {
    body = await draw();
    if (drawn.size >= DRAWN_LIMIT) {
      drawn.delete(drawn.keys().next().value!);
    }
    drawn.set(etag, body);
  }
  return new Response(body as BodyInit, {
    headers: { ...headers, "Content-Type": content_type },
  });
}

/** The share card for the page at `path`: a 1200×630 PNG, or a 404. */
export async function shareCardResponse(request: Request, path: string) {
  const content = await shareCardContent(path, request.url);
  if (!content) return new Response("Not found", { status: 404 });
  return imageResponse(
    request,
    content,
    "image/png",
    CARD_CACHE_CONTROL,
    async () =>
      (await renderer()).renderPng(
        <ShareCard {...content} />,
        CARD_WIDTH,
        CARD_HEIGHT,
      ),
  );
}

/** An .ico holding one PNG (every current browser reads PNG icons). */
function pngToIco(png: Uint8Array, size: number) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  header.writeUInt8(size, 6); // width (0 would mean 256)
  header.writeUInt8(size, 7); // height
  header.writeUInt8(0, 8); // no palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // color planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.byteLength, 14); // image size
  header.writeUInt32LE(header.byteLength, 18); // image offset
  return new Uint8Array(Buffer.concat([header, png]));
}

const ICONS = {
  svg: { type: "image/svg+xml", size: 64 },
  ico: { type: "image/x-icon", size: 48 },
  apple: { type: "image/png", size: 180 },
} as const;

/** The site icon, as /favicon.svg, /favicon.ico or /apple-touch-icon.png. */
export function siteIconResponse(request: Request, kind: keyof typeof ICONS) {
  const { type, size } = ICONS[kind];
  const initials = siteInitials(getServerEnv().siteTitle);
  const icon = <SiteIcon initials={initials} size={size} />;
  return imageResponse(
    request,
    [kind, initials],
    type,
    ICON_CACHE_CONTROL,
    async () => {
      const { renderPng, renderSvg } = await renderer();
      if (kind === "svg") return renderSvg(icon, size, size);
      const png = await renderPng(icon, size, size);
      return kind === "ico" ? pngToIco(png, size) : png;
    },
  );
}
