import { createFileRoute } from "@tanstack/react-router";

// The layout for every /photography page. It only renders the page (the
// default <Outlet />); it's here for the section's crumb, which then shows on
// the list, each collection and each photo.
export const Route = createFileRoute("/photography")({
  staticData: { breadcrumb: "Photography" },
});
