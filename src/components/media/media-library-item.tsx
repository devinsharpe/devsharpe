import { CheckIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import type { getMediaLibrary } from "~/server/functions/media.functions";

type MediaLibrary = Awaited<ReturnType<typeof getMediaLibrary>>;
export type MediaItem = MediaLibrary["items"][number];
/** A camera a photo can be linked to. */
export type MediaCameraOption = MediaLibrary["cameras"][number];

interface MediaLibraryItemProps {
  item: MediaItem;
  on_open: () => void;
  /** What opening it does, for screen readers: "Edit IMG_0042.jpg". */
  action?: string;
  /** In a multi-select picker: whether it's picked (shows a check). */
  is_selected?: boolean;
  /** Set when it can't be picked, e.g. "Already added"; shown on the tile. */
  unavailable_label?: string;
}

/** One square tile in the library grid; render inside a <ul>. */
export function MediaLibraryItem({
  item,
  on_open,
  action = "Edit",
  is_selected,
  unavailable_label,
}: MediaLibraryItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={on_open}
        disabled={!!unavailable_label}
        aria-pressed={is_selected}
        className={cn(
          "group relative block aspect-square w-full overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800 cursor-pointer focus:outline focus:outline-offset-2 focus:outline-neutral-800 dark:focus:outline-white",
          "disabled:cursor-not-allowed disabled:opacity-50",
          is_selected && "outline-2 outline-offset-2 outline-neutral-900 dark:outline-white",
        )}
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
        {is_selected && (
          <span
            aria-hidden
            className="absolute top-1 right-1 flex size-6 items-center justify-center bg-neutral-900 text-neutral-100 dark:bg-white dark:text-neutral-900"
          >
            <CheckIcon strokeWidth={2} size={16} />
          </span>
        )}
        {unavailable_label && (
          <span
            aria-hidden
            className="absolute top-1 right-1 bg-neutral-900/80 px-1 text-xs text-neutral-100"
          >
            {unavailable_label}
          </span>
        )}
        <span className="sr-only">
          {action} {item.originalName}
          {!item.altText && " (no alt text yet)"}
          {unavailable_label && ` (${unavailable_label})`}
        </span>
      </button>
    </li>
  );
}
