// Admin editor only: the media library items a document's images refer to.
// Image blocks ask for their item as they mount; lookups are batched into
// one getMediaViews request, and the editor's preview reads the same cache.
import { useServerFn } from "@tanstack/react-start";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { isMediaId, MEDIA_LOOKUP_MAX } from "~/lib/media";
import {
  collectMediaIds,
  type RichTextDocument,
  type RichTextMedia,
  type RichTextMediaMap,
} from "~/lib/rich-text";
import { getMediaViews } from "~/server/functions/media.functions";
import type { MediaItem } from "../media/media-library-item";

export type MediaViewEntry =
  | { status: "loading" }
  | { status: "ready"; item: MediaItem }
  /** Deleted from the library (or never was in it). */
  | { status: "missing" }
  | { status: "error" };

const LOADING: MediaViewEntry = { status: "loading" };

export class MediaViewStore {
  private entries = new Map<string, MediaViewEntry>();
  private queued = new Set<string>();
  private listeners = new Set<() => void>();
  private version = 0;
  private is_flush_scheduled = false;
  private fetch_items: (ids: string[]) => Promise<MediaItem[]>;

  constructor(fetch_items: (ids: string[]) => Promise<MediaItem[]>) {
    this.fetch_items = fetch_items;
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Changes whenever any entry does. */
  get_version = () => this.version;

  get = (id: string): MediaViewEntry => this.entries.get(id) ?? LOADING;

  /** Loads `id` unless it's loaded or on its way; a failed lookup is retried. */
  request(id: string) {
    const entry = this.entries.get(id);
    if (entry && entry.status !== "error") return;
    if (!isMediaId(id)) {
      this.set(id, { status: "missing" });
      return;
    }
    this.set(id, LOADING);
    this.enqueue(id);
  }

  /** Looks `id` up again (e.g. after its details changed), showing the old item meanwhile. */
  refresh(id: string) {
    if (isMediaId(id)) this.enqueue(id);
  }

  /** Adds items already in hand, e.g. one just picked from the library. */
  prime(items: MediaItem[]) {
    for (const item of items) {
      this.entries.set(item.id, { status: "ready", item });
    }
    this.emit();
  }

  private set(id: string, entry: MediaViewEntry) {
    this.entries.set(id, entry);
    this.emit();
  }

  private emit() {
    this.version += 1;
    for (const listener of this.listeners) listener();
  }

  private enqueue(id: string) {
    this.queued.add(id);
    if (this.is_flush_scheduled) return;
    this.is_flush_scheduled = true;
    // Blocks mounting together (e.g. when a draft loads) share one request.
    queueMicrotask(() => void this.flush());
  }

  private async flush() {
    this.is_flush_scheduled = false;
    const ids = [...this.queued];
    this.queued.clear();
    for (let start = 0; start < ids.length; start += MEDIA_LOOKUP_MAX) {
      const batch = ids.slice(start, start + MEDIA_LOOKUP_MAX);
      try {
        const items = await this.fetch_items(batch);
        const found = new Map(items.map((item) => [item.id, item]));
        for (const id of batch) {
          const item = found.get(id);
          this.entries.set(
            id,
            item ? { status: "ready", item } : { status: "missing" },
          );
        }
      } catch (error) {
        console.error("Couldn't look up the document's images.", error);
        for (const id of batch) {
          // An item already showing stays; only a first lookup shows the error.
          if (this.entries.get(id)?.status !== "ready") {
            this.entries.set(id, { status: "error" });
          }
        }
      }
      this.emit();
    }
  }
}

/** A store for one editor (and its preview), looking items up with getMediaViews. */
export function useCreateMediaViewStore() {
  const fetch_views = useServerFn(getMediaViews);
  const [store] = useState(
    () => new MediaViewStore((ids) => fetch_views({ data: { ids } })),
  );
  return store;
}

const MediaViewStoreContext = createContext<MediaViewStore | null>(null);

export const MediaViewStoreProvider = MediaViewStoreContext.Provider;

export function useMediaViewStore() {
  const store = useContext(MediaViewStoreContext);
  if (!store) {
    throw new Error("useMediaViewStore must be used inside a RichTextEditor");
  }
  return store;
}

/** The library item for `id`, loading it on first use. */
export function useMediaView(store: MediaViewStore, id: string) {
  const entry = useSyncExternalStore(
    store.subscribe,
    () => store.get(id),
    () => store.get(id),
  );
  useEffect(() => store.request(id), [store, id]);
  return entry;
}

/** What the renderer needs from a library item; null while imgproxy is off. */
export function toRichTextMedia(item: MediaItem): RichTextMedia | null {
  return item.image
    ? { alt: item.altText, caption: item.caption, image: item.image }
    : null;
}

/** A document's images from the store, for RichTextRenderer's `media` (e.g. a preview). */
export function useRichTextMediaMap(
  store: MediaViewStore,
  document: RichTextDocument | null | undefined,
) {
  const version = useSyncExternalStore(
    store.subscribe,
    store.get_version,
    store.get_version,
  );
  const ids = useMemo(() => collectMediaIds([document]), [document]);
  useEffect(() => {
    for (const id of ids) store.request(id);
  }, [store, ids]);
  return useMemo(() => {
    void version; // Rebuilt whenever an entry changes.
    const media: RichTextMediaMap = {};
    for (const id of ids) {
      const entry = store.get(id);
      const item = entry.status === "ready" && toRichTextMedia(entry.item);
      if (item) media[id] = item;
    }
    return media;
  }, [store, ids, version]);
}
