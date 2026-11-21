// Server-only: the RSS 2.0 feed of published posts, served at /rss.xml.
import {
  POSTS_FEED_LIMIT,
  POSTS_FEED_PATH,
  postsFeedTitle,
} from "../lib/posts";
import { db } from "./database/index.server";
import { getServerEnv } from "./env.server";
import { resolveRichTextMedia } from "./media/rich-text-media.server";
import { MediaRepository } from "./repositories/media.repository.server";
import { PostsRepository } from "./repositories/posts.repository.server";
import { SiteRepository } from "./repositories/site.repository.server";
import { escapeHtml, richTextToHtml } from "./rich-text-html.server";

// XML 1.0 forbids most control characters, even escaped or inside CDATA.
const INVALID_XML_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

/** Text for an XML element or attribute. */
function xmlText(value: string) {
  return escapeHtml(value.replace(INVALID_XML_CHARS, ""));
}

/** Markup carried verbatim, e.g. HTML in <content:encoded>. */
function cdata(value: string) {
  const safe = value
    .replace(INVALID_XML_CHARS, "")
    // "]]>" would end the section early; split it across two sections.
    .replaceAll("]]>", "]]]]><![CDATA[>");
  return `<![CDATA[${safe}]]>`;
}

/**
 * The site's public origin, for absolute links. SITE_URL (or BETTER_AUTH_URL)
 * wins over the request, which behind a proxy may say http:// or an internal
 * host.
 */
export function resolveSiteOrigin(request_url: string) {
  const configured = getServerEnv().siteUrl;
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol === "https:" || url.protocol === "http:") {
        return url.origin;
      }
    } catch {
      // Fall through to the request's origin.
    }
    console.warn(`Ignoring SITE_URL "${configured}": not an http(s) URL.`);
  }
  return new URL(request_url).origin;
}

/** The saved subtitle, or null if it was never saved or can't be read. */
export async function readSavedSubtitle() {
  try {
    return (await new SiteRepository(db).getSettings())?.subtitle ?? null;
  } catch (error) {
    console.error("Could not read site settings; using SITE_SUBTITLE.", error);
    return null;
  }
}

export async function etagFor(body: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(body),
  );
  const hex = Array.from(new Uint8Array(digest).slice(0, 16), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `"${hex}"`;
}

/** Whether an If-None-Match header already has this version of the feed. */
export function matchesEtag(if_none_match: string | null, etag: string) {
  if (!if_none_match) return false;
  return if_none_match
    .split(",")
    .map((tag) => tag.trim().replace(/^W\//, ""))
    .some((tag) => tag === "*" || tag === etag);
}

/**
 * The newest published posts, each with its full content (HTML in
 * <content:encoded>) and its summary (<description>). Items are identified by
 * post id, so changing a slug doesn't make readers show a post as new.
 */
export async function buildPostsFeed(origin: string) {
  const env = getServerEnv();
  const [posts, saved_subtitle] = await Promise.all([
    new PostsRepository(db).listFeedPosts(POSTS_FEED_LIMIT),
    readSavedSubtitle(),
  ]);
  const subtitle = saved_subtitle ?? env.siteSubtitle;
  // One lookup for every image in the feed.
  const media = await resolveRichTextMedia(
    new MediaRepository(db),
    posts.map((post) => post.content),
  );
  const posts_url = `${origin}/posts`;
  // A revision to an older post can be the most recent change.
  const last_change = posts.reduce<Date | null>((latest, post) => {
    const changed = post.revisedAt ?? post.publishedAt;
    return changed && (!latest || changed > latest) ? changed : latest;
  }, null);

  const items = posts.map((post) => {
    const link = `${posts_url}/${encodeURIComponent(post.slug)}`;
    const summary = post.description ?? post.excerpt;
    return [
      "    <item>",
      `      <title>${xmlText(post.title)}</title>`,
      `      <link>${xmlText(link)}</link>`,
      `      <guid isPermaLink="false">urn:uuid:${post.id}</guid>`,
      post.publishedAt &&
        `      <pubDate>${post.publishedAt.toUTCString()}</pubDate>`,
      summary && `      <description>${xmlText(summary)}</description>`,
      ...post.tags.map((tag) => `      <category>${xmlText(tag)}</category>`),
      post.content &&
        `      <content:encoded>${cdata(richTextToHtml(post.content, { base_url: link, media }))}</content:encoded>`,
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    "  <channel>",
    `    <title>${xmlText(postsFeedTitle(env.siteTitle))}</title>`,
    `    <link>${xmlText(posts_url)}</link>`,
    `    <description>${xmlText(subtitle || `Musings from ${env.siteTitle}`)}</description>`,
    "    <language>en-us</language>",
    `    <atom:link href="${xmlText(origin + POSTS_FEED_PATH)}" rel="self" type="application/rss+xml"/>`,
    last_change &&
      `    <lastBuildDate>${last_change.toUTCString()}</lastBuildDate>`,
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  return { xml, etag: await etagFor(xml) };
}
