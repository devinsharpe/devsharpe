import { createFileRoute, useMatches } from "@tanstack/react-router";

// The layout for a collection's pages: the collection itself and each of its
// photos. It only renders the page (the default <Outlet />); it's here for the
// collection's crumb, so a photo's breadcrumbs link back to its collection.
export const Route = createFileRoute("/photography/$slug")({
  staticData: { breadcrumb: Breadcrumb },
});

/** The collection's title, from whichever of its pages is open (both load it). */
// Annotated: its type can't be inferred from the routes, which include it.
function Breadcrumb(): string {
  const title = useMatches({
    select: (matches): string | undefined => {
      for (const match of matches) {
        if (
          match.routeId === "/photography/$slug/" ||
          match.routeId === "/photography/$slug/$photoId"
        ) {
          return match.loaderData?.collection.title;
        }
      }
      return undefined;
    },
  });
  return title ?? "Collection";
}
