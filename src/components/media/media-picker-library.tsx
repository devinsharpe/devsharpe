// The media library as a picker: tag filters, pages, and tiles to pick from.
// Used by the editor's image button and a collection's "Add Photos".
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MediaLibrarySearch } from "~/lib/media";
import { cn } from "~/lib/utils";
import { getMediaLibrary } from "~/server/functions/media.functions";
import Button from "../_ui/button";
import { type MediaItem, MediaLibraryItem } from "./media-library-item";

export type MediaLibrary = Awaited<ReturnType<typeof getMediaLibrary>>;

const TAG_CLASSES =
  "border px-2 transition-colors cursor-pointer border-neutral-300 dark:border-neutral-700 hover:border-neutral-800 dark:hover:border-white aria-pressed:border-neutral-900 aria-pressed:bg-neutral-900 aria-pressed:text-neutral-100 dark:aria-pressed:border-neutral-100 dark:aria-pressed:bg-neutral-100 dark:aria-pressed:text-neutral-900";

interface MediaPickerLibraryProps {
  on_pick: (item: MediaItem) => void;
  /** What picking does, for screen readers, e.g. "Insert". */
  action: string;
  /** For a multi-select picker: whether an item is picked. */
  is_selected?: (item: MediaItem) => boolean;
  /** Why an item can't be picked (e.g. "Already added"), or undefined if it can. */
  unavailable_label?: (item: MediaItem) => string | undefined;
  /** Called with each page as it loads (for the uploader's cameras). */
  on_loaded: (library: MediaLibrary) => void;
  /** Bumped after an upload: goes back to the first page, where it'll be. */
  reload: number;
}

/** The library, one page at a time, to pick from; mount it only while it's shown. */
export function MediaPickerLibrary({
  on_pick,
  action,
  is_selected,
  unavailable_label,
  on_loaded,
  reload,
}: MediaPickerLibraryProps) {
  const fetch_library = useServerFn(getMediaLibrary);
  const [search, set_search] = useState<MediaLibrarySearch>({ page: 1 });
  const [library, set_library] = useState<MediaLibrary | null>(null);
  const [error, set_error] = useState<string | null>(null);
  const [is_loading, set_is_loading] = useState(true);
  const [attempt, set_attempt] = useState(0);
  const on_loaded_ref = useRef(on_loaded);
  useEffect(() => {
    on_loaded_ref.current = on_loaded;
  });

  const seen_reload = useRef(reload);
  useEffect(() => {
    if (reload === seen_reload.current) return;
    seen_reload.current = reload;
    set_search({ page: 1 });
  }, [reload]);

  useEffect(() => {
    let is_current = true;
    set_is_loading(true);
    set_error(null);
    fetch_library({ data: search }).then(
      (result) => {
        if (!is_current) return;
        set_library(result);
        set_is_loading(false);
        on_loaded_ref.current(result);
      },
      (reason: unknown) => {
        if (!is_current) return;
        set_error(reason instanceof Error ? reason.message : "Something went wrong.");
        set_is_loading(false);
      },
    );
    return () => {
      is_current = false;
    };
  }, [fetch_library, search, attempt]);

  if (error) {
    return (
      <div className="flex flex-wrap items-center gap-2 px-2">
        <p>Couldn't load the media library. {error}</p>
        <Button onClick={() => set_attempt((count) => count + 1)}>Try again</Button>
      </div>
    );
  }
  if (!library) {
    return (
      <ul aria-hidden className="grid grid-cols-3 gap-2 px-2 sm:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <li
            key={index}
            className="aspect-square animate-pulse bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </ul>
    );
  }

  const { items, page, page_count, tags } = library;
  const go_to = (next: MediaLibrarySearch) => set_search(next);

  return (
    <div className="flex flex-col gap-4 px-2" aria-busy={is_loading}>
      {tags.length > 0 && (
        <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            aria-pressed={!search.tag}
            className={TAG_CLASSES}
            onClick={() => go_to({ page: 1 })}
          >
            All
          </button>
          {tags.map((entry) => (
            <button
              key={entry.tag}
              type="button"
              aria-pressed={entry.tag === search.tag}
              className={TAG_CLASSES}
              onClick={() => go_to({ page: 1, tag: entry.tag })}
            >
              #{entry.tag}
            </button>
          ))}
        </div>
      )}
      {items.length > 0 ? (
        <ul
          className={cn(
            "grid grid-cols-3 gap-2 sm:grid-cols-4 transition-opacity",
            is_loading && "opacity-60",
          )}
        >
          {items.map((item) => (
            <MediaLibraryItem
              key={item.id}
              item={item}
              action={action}
              is_selected={is_selected?.(item)}
              unavailable_label={unavailable_label?.(item)}
              on_open={() => on_pick(item)}
            />
          ))}
        </ul>
      ) : (
        <p className="italic opacity-80">
          {search.tag
            ? `No images tagged #${search.tag}.`
            : library.setup.can_upload
              ? "No images yet. Upload some with the button above."
              : "No images yet."}
        </p>
      )}
      {page_count > 1 && (
        <nav aria-label="Pages" className="flex items-center justify-between gap-4">
          <Button
            disabled={page <= 1 || is_loading}
            onClick={() => go_to({ ...search, page: page - 1 })}
          >
            <ArrowLeftIcon strokeWidth={1.5} size={16} aria-hidden />
            Newer
          </Button>
          <p className="text-sm opacity-80">
            Page {page} of {page_count}
          </p>
          <Button
            disabled={page >= page_count || is_loading}
            onClick={() => go_to({ ...search, page: page + 1 })}
          >
            Older
            <ArrowRightIcon strokeWidth={1.5} size={16} aria-hidden />
          </Button>
        </nav>
      )}
    </div>
  );
}
