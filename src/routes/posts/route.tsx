import { createFileRoute } from "@tanstack/react-router";

// The layout for every /posts page. It only renders the page (the default
// <Outlet />); it's here for the section's crumb, which then shows on the list
// and on each post.
export const Route = createFileRoute("/posts")({
  staticData: { breadcrumb: "Posts" },
});
