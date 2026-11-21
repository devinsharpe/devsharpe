import { createFileRoute } from "@tanstack/react-router";
import { recordLinkClick } from "~/server/links.server";

// Server route: counts a click on /links (see LINK_CLICK_PATH).
export const Route = createFileRoute("/api/link-click")({
  server: {
    handlers: {
      POST: ({ request }) => recordLinkClick(request),
    },
  },
});
