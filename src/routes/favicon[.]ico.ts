import { createFileRoute } from "@tanstack/react-router";
import { siteIconResponse } from "~/server/og/cards.server";

// Server route: the site icon at the address browsers and search engines
// look for when a page doesn't say (48×48, the size Google asks for).
export const Route = createFileRoute("/favicon.ico")({
  server: {
    handlers: {
      GET: ({ request }) => siteIconResponse(request, "ico"),
    },
  },
});
