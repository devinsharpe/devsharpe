// Link previews: the meta tags that sites like Slack, iMessage and Bluesky
// read (Open Graph), and X's `twitter:` versions of the main ones. The root
// route sets the defaults for every page,
// including a generated card as the image (see server/og/cards.server.tsx);
// a page's own tags win over them, tag by tag.

/** The size of the generated cards, and of library images shared as og:image. */
export const SHARE_IMAGE_WIDTH = 1200;
export const SHARE_IMAGE_HEIGHT = 630;

/** A path without its trailing slash (except the root's). */
export function withoutTrailingSlash(path: string) {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/** Where the generated share card for the page at `path` is: /og/... */
export function shareCardPath(path: string) {
  const page = withoutTrailingSlash(path);
  return page === "/" ? "/og" : `/og${page}`;
}

/**
 * A link-preview tag as both `og:<key>` and `twitter:<key>`. X falls back to
 * the og: tag, but other readers and SEO checkers look for both.
 */
export function previewMeta(
  key: "title" | "description" | "url",
  content: string,
) {
  return [
    { property: `og:${key}`, content },
    { name: `twitter:${key}`, content },
  ];
}

/**
 * The share image: og:image and its size, in that order (the size tags
 * describe the image before them), then twitter:image. Both kinds of share
 * image are 1200 × 630.
 */
export function shareImageMeta(url: string) {
  return [
    { property: "og:image", content: url },
    { property: "og:image:width", content: `${SHARE_IMAGE_WIDTH}` },
    { property: "og:image:height", content: `${SHARE_IMAGE_HEIGHT}` },
    { name: "twitter:image", content: url },
  ];
}

/**
 * A page's title, description and image, as both the browser's tags and the
 * link-preview ones. Leave out `image` to keep the generated card.
 */
export function pageMeta({
  title,
  description,
  image,
}: {
  title?: string | null;
  description?: string | null;
  image?: string | null;
}) {
  return [
    ...(title ? [{ title }, ...previewMeta("title", title)] : []),
    ...(description
      ? [
          { name: "description", content: description },
          ...previewMeta("description", description),
        ]
      : []),
    ...(image ? shareImageMeta(image) : []),
  ];
}
