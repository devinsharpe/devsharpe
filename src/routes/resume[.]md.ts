import { createFileRoute } from "@tanstack/react-router";
import { resolveSiteOrigin } from "~/server/feed.server";
import { serveMarkdownResume } from "~/server/resume.server";

// Server route: a Markdown résumé, written from the positions and projects.
export const Route = createFileRoute("/resume.md")({
  server: {
    handlers: {
      GET: ({ request }) =>
        serveMarkdownResume(request, resolveSiteOrigin(request.url)),
    },
  },
});
