import { createFileRoute } from "@tanstack/react-router";

// The layout for every /projects page. It only renders the page (the default
// <Outlet />); it's here for the section's crumb, which then shows on the list
// and on each project.
export const Route = createFileRoute("/projects")({
  staticData: { breadcrumb: "Projects" },
});
