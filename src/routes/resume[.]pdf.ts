import { createFileRoute } from "@tanstack/react-router";
import { servePdfResume } from "~/server/resume.server";

// Server route: the uploaded PDF résumé, as a download.
export const Route = createFileRoute("/resume.pdf")({
  server: {
    handlers: {
      GET: ({ request }) => servePdfResume(request),
    },
  },
});
