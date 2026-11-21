import {
  createFileRoute,
  stripSearchParams,
  Link as TanstackLink,
} from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import {
  COLLECTION_GRID,
  CollectionCard,
} from "~/components/photography/collection-card";
import { PhotoGrid } from "~/components/photography/photo-grid";
import { type PhotographySearch, photographySearchSchema } from "~/lib/photography";
import { pageMeta } from "~/lib/share";
import { listPhotography } from "~/server/functions/photography.functions";

export const Route = createFileRoute("/photography/")({
  // `camera` shows one camera's photos instead (linked from /uses).
  validateSearch: photographySearchSchema,
  // Keeps "?page=1" out of URLs.
  search: { middlewares: [stripSearchParams({ page: 1 })] },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listPhotography({ data: deps }),
  head: ({ loaderData }) => ({
    meta: pageMeta({
      title:
        loaderData?.kind === "camera" && loaderData.camera
          ? `Photos taken with ${loaderData.camera.name}`
          : "Photography",
    }),
  }),
  component: RouteComponent,
});

function Pagination({
  search,
  page,
  page_count,
  labels,
}: {
  search: Omit<PhotographySearch, "page">;
  page: number;
  page_count: number;
  labels: [previous: string, next: string];
}) {
  if (page_count <= 1) return null;
  return (
    <nav
      aria-label="Pages"
      className="-mx-2 flex items-center justify-between gap-4"
    >
      {page > 1 ? (
        <Link to="/photography" search={{ ...search, page: page - 1 }}>
          <ArrowLeftIcon strokeWidth={1.5} size={16} aria-hidden />
          {labels[0]}
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm opacity-80">
        Page {page} of {page_count}
      </p>
      {page < page_count ? (
        <Link to="/photography" search={{ ...search, page: page + 1 }}>
          {labels[1]}
          <ArrowRightIcon strokeWidth={1.5} size={16} aria-hidden />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

function RouteComponent() {
  const data = Route.useLoaderData();

  if (data.kind === "camera") {
    const { camera, photos, total, page, page_count } = data;
    return (
      <Main>
        <section className="flex flex-col gap-4">
          {camera ? (
            <>
              <div>
                <h2 className="text-2xl font-semibold">
                  Photos taken with {camera.name}
                </h2>
                {total > 0 && (
                  <p className="text-sm opacity-80">
                    {total.toLocaleString("en-US")}{" "}
                    {total === 1 ? "photo" : "photos"}, newest first
                  </p>
                )}
              </div>
              {photos.length > 0 ? (
                <PhotoGrid photos={photos} />
              ) : (
                <p className="italic opacity-80">
                  No photos from this camera are up yet.{" "}
                  <TanstackLink to="/uses" className="underline">
                    See the rest of my gear
                  </TanstackLink>
                </p>
              )}
              <Pagination
                search={{ camera: camera.id }}
                page={page}
                page_count={page_count}
                labels={["Newer", "Older"]}
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">Camera not found</h2>
              <p className="italic opacity-80">
                That camera isn't listed anymore.{" "}
                <TanstackLink to="/uses" className="underline">
                  See the gear I use
                </TanstackLink>
              </p>
            </>
          )}
        </section>
      </Main>
    );
  }

  const { collections, page, page_count } = data;
  return (
    <Main>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Photography</h2>
        {collections.length > 0 ? (
          <ul className={COLLECTION_GRID}>
            {collections.map((item) => (
              <CollectionCard key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">No collections yet. Check back soon.</p>
        )}
        <Pagination
          search={{}}
          page={page}
          page_count={page_count}
          labels={["Newer", "Older"]}
        />
      </section>
    </Main>
  );
}
