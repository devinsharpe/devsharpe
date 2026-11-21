// Link previews: the meta tags that sites like Slack, iMessage and Bluesky
// read (Open Graph). The root route sets the defaults for every page,
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
 * og:image and its size, in that order: the size tags describe the image
 * before them. Both kinds of share image are 1200 × 630.
 */
export function shareImageMeta(url: string) {
  return [
    { property: "og:image", content: url },
    { property: "og:image:width", content: `${SHARE_IMAGE_WIDTH}` },
    { property: "og:image:height", content: `${SHARE_IMAGE_HEIGHT}` },
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
    ...(title ? [{ title }, { property: "og:title", content: title }] : []),
    ...(description
      ? [
          { name: "description", content: description },
          { property: "og:description", content: description },
        ]
      : []),
    ...(image ? shareImageMeta(image) : []),
  ];
}
