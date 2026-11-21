import {
  createFileRoute,
  stripSearchParams,
  Link as TanstackLink,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import { MediaDetailsDialog } from "~/components/media/media-details-dialog";
import { photographsAdminSearchSchema, viewCount } from "~/lib/photography";
import { listCollectedPhotos } from "~/server/functions/photography.functions";

export const Route = createFileRoute(
  "/_authenticated/dashboard/collections/photos",
)({
  validateSearch: photographsAdminSearchSchema,
  // Keeps "?page=1" out of URLs.
  search: { middlewares: [stripSearchParams({ page: 1 })] },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listCollectedPhotos({ data: deps }),
  component: RouteComponent,
});

function RouteComponent() {
  const { items, total, page, page_count, cameras } = Route.useLoaderData();
  const router = useRouter();
  const [selected_id, set_selected_id] = useState<string | null>(null);
  // Read from the loader so edits show up once it reloads.
  const selected = items.find((item) => item.id === selected_id) ?? null;

  return (
    <Main>
      <BreadcrumbNav current_page_label="Photographs">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem to="/dashboard/collections">
          Photo Collections
        </BreadcrumbItem>
      </BreadcrumbNav>
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-semibold">
            Photographs{total > 0 && ` (${total})`}
          </h2>
          <p className="text-sm opacity-80">
            Every photo in a collection, most viewed first. Views count visits
            to a photo's page. Select one to edit its details.
          </p>
        </div>
        {items.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <li key={item.id} className="flex flex-col gap-1 min-w-0">
                <button
                  type="button"
                  onClick={() => set_selected_id(item.id)}
                  className="group relative block aspect-square w-full overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 cursor-pointer focus:outline focus:outline-offset-2 focus:outline-neutral-800 dark:focus:outline-white"
                >
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform motion-safe:group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center p-2 text-sm opacity-80 break-all">
                      {item.originalName}
                    </span>
                  )}
                  {!item.altText && (
                    <span
                      aria-hidden
                      className="absolute bottom-1 left-1 bg-neutral-900/80 px-1 text-xs text-neutral-100"
                    >
                      No alt text
                    </span>
                  )}
                  <span className="sr-only">
                    Edit {item.originalName}, {viewCount(item.views)}
                  </span>
                </button>
                <p className="text-sm font-medium">{viewCount(item.views)}</p>
                <p className="text-sm opacity-80 truncate">
                  {item.collections.map((collection, index) => (
                    <span key={collection.id}>
                      {index > 0 && ", "}
                      <TanstackLink
                        to="/dashboard/collections/$collectionId"
                        params={{ collectionId: collection.id }}
                        className="underline underline-offset-2 hover:opacity-80"
                      >
                        {collection.title}
                      </TanstackLink>
                      {!collection.isPublished && " (draft)"}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">
            No photos in collections yet. Add some from a collection's page.
          </p>
        )}
        {page_count > 1 && (
          <nav
            aria-label="Pages"
            className="-mx-2 flex items-center justify-between gap-4"
          >
            {page > 1 ? (
              <Link
                to="/dashboard/collections/photos"
                search={{ page: page - 1 }}
              >
                <ArrowLeftIcon strokeWidth={1.5} size={16} aria-hidden />
                More viewed
              </Link>
            ) : (
              <span />
            )}
            <p className="text-sm opacity-80">
              Page {page} of {page_count}
            </p>
            {page < page_count ? (
              <Link
                to="/dashboard/collections/photos"
                search={{ page: page + 1 }}
              >
                Less viewed
                <ArrowRightIcon strokeWidth={1.5} size={16} aria-hidden />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
      <MediaDetailsDialog
        item={selected}
        cameras={cameras}
        on_close={() => set_selected_id(null)}
        on_changed={() => router.invalidate()}
      />
    </Main>
  );
}
