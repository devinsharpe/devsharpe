import { createFileRoute } from "@tanstack/react-router";
import { siteIconResponse } from "~/server/og/cards.server";

// Server route: the icon iOS uses for home-screen bookmarks (180×180; iOS
// rounds the corners itself).
export const Route = createFileRoute("/apple-touch-icon.png")({
  server: {
    handlers: {
      GET: ({ request }) => siteIconResponse(request, "apple"),
    },
  },
});
