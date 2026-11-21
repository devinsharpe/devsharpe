import { createFileRoute } from "@tanstack/react-router";
import { siteIconResponse } from "~/server/og/cards.server";

// Server route: the site icon for browsers that take SVG (see __root's links).
export const Route = createFileRoute("/favicon.svg")({
  server: {
    handlers: {
      GET: ({ request }) => siteIconResponse(request, "svg"),
    },
  },
});
