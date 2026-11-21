import { createFileRoute } from "@tanstack/react-router";
import {
  buildPostsFeed,
  matchesEtag,
  resolveSiteOrigin,
} from "~/server/feed.server";

// Feed readers poll; let them (and any CDN) reuse a copy for 15 minutes, then
// revalidate with If-None-Match.
const CACHE_CONTROL = "public, max-age=900";

// Server route: the RSS feed of published posts.
export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { xml, etag } = await buildPostsFeed(
          resolveSiteOrigin(request.url),
        );
        const headers = { "Cache-Control": CACHE_CONTROL, ETag: etag };
        if (matchesEtag(request.headers.get("if-none-match"), etag)) {
          return new Response(null, { status: 304, headers });
        }
        return new Response(xml, {
          headers: {
            ...headers,
            "Content-Type": "application/rss+xml; charset=utf-8",
          },
        });
      },
    },
  },
});
