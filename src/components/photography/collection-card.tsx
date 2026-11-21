import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { photoCount } from "~/lib/photography";
import { cn } from "~/lib/utils";
import type { listLatestCollections } from "~/server/functions/photography.functions";
import { PublishedDate } from "../_ui/published-date";
import { MediaImage } from "../media/media-image";

export type CollectionCardItem = Awaited<
  ReturnType<typeof listLatestCollections>
>[number];

/** Cards sit three across at Main's full width, two on small screens. */
const COVER_SIZES = "(min-width: 48rem) 17rem, (min-width: 40rem) 50vw, 100vw";

interface CollectionCardProps extends ComponentProps<"li"> {
  item: CollectionCardItem;
}

/**
 * A published collection in a grid (homepage, /photography); render inside
 * a <ul> with COLLECTION_GRID.
 */
export function CollectionCard({ item, className, ...props }: CollectionCardProps) {
  return (
    <li {...props} className={cn("flex flex-col gap-2 min-w-0", className)}>
      <Link
        to="/photography/$slug"
        params={{ slug: item.slug }}
        className="group flex flex-col gap-2"
      >
        <div className="aspect-3/2 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
          {item.cover && (
            <MediaImage
              image={item.cover.image}
              // The title is the link's name; the cover only illustrates it.
              alt=""
              sizes={COVER_SIZES}
              loading="lazy"
              className="h-full w-full object-cover transition-transform motion-safe:group-hover:scale-105"
            />
          )}
        </div>
        <h3 className="text-lg group-hover:underline">{item.title}</h3>
      </Link>
      {item.description && <p className="text-sm">{item.description}</p>}
      <p className="text-sm opacity-80">
        {photoCount(item.photoCount)}
        {item.publishedAt && (
          <>
            {" · "}
            <PublishedDate date={item.publishedAt} />
          </>
        )}
      </p>
    </li>
  );
}

/** The <ul> classes for a grid of CollectionCards. */
export const COLLECTION_GRID = "grid gap-6 sm:grid-cols-2 md:grid-cols-3";
