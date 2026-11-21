// Public: photos laid out in columns at their own shapes (no cropping), each
// linking to its page in the collection it's shown from.
import { Link } from "@tanstack/react-router";
import type { getPublishedCollection } from "~/server/functions/photography.functions";
import { MediaImage } from "../media/media-image";

export type GridPhoto = Awaited<
  ReturnType<typeof getPublishedCollection>
>["photos"][number] & {
  /** The collection whose photo page the tile links to. */
  collection_slug: string;
};

/** Two columns, three from 48rem (Main is at most ~53rem of content). */
const PHOTO_SIZES = "(min-width: 48rem) 17rem, calc(50vw - 2rem)";

interface PhotoGridProps {
  photos: ReadonlyArray<GridPhoto>;
  /** Names a photo with no alt text, e.g. "Photo 3". */
  fallback_label?: (index: number) => string;
}

export function PhotoGrid({
  photos,
  fallback_label = (index) => `Photo ${index + 1}`,
}: PhotoGridProps) {
  return (
    <ul className="columns-2 md:columns-3 gap-4">
      {photos.map((photo, index) => (
        <li key={photo.id} className="mb-4 break-inside-avoid">
          <Link
            to="/photography/$slug/$photoId"
            params={{ slug: photo.collection_slug, photoId: photo.id }}
            className="group block overflow-hidden bg-neutral-200 dark:bg-neutral-800 focus:outline focus:outline-offset-2 focus:outline-neutral-800 dark:focus:outline-white"
          >
            {photo.image ? (
              <MediaImage
                image={photo.image}
                alt={photo.altText || fallback_label(index)}
                sizes={PHOTO_SIZES}
                // The first row is usually on screen when the page opens.
                loading={index < 3 ? "eager" : "lazy"}
                className="block h-auto w-full transition-opacity motion-safe:group-hover:opacity-90"
              />
            ) : (
              <span className="flex aspect-square items-center justify-center p-2 text-sm italic opacity-80">
                {photo.altText || fallback_label(index)}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
