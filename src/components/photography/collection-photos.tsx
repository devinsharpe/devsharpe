// Admin: a collection's photos in its editor. Add from the library, drag to
// reorder, pick the cover, edit a photo's details, or take it out.
import { isNotFound, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  GripIcon,
  ImageIcon,
  ImagePlusIcon,
  PencilLineIcon,
  XIcon,
} from "lucide-react";
import { useId, useMemo, useState } from "react";
import { photoCount } from "~/lib/photography";
import {
  addCollectionPhotos,
  removeCollectionPhoto,
  reorderCollectionPhotos,
  setCollectionCover,
} from "~/server/functions/photography.functions";
import Button from "../_ui/button";
import { type SortableHandleProps, SortableList } from "../_ui/sortable-list";
import { useToast } from "../_ui/toast";
import { MediaDetailsDialog } from "../media/media-details-dialog";
import type { MediaCameraOption, MediaItem } from "../media/media-library-item";
import { CollectionPhotoPicker } from "./collection-photo-picker";

const errorDescription = (error: unknown) =>
  isNotFound(error)
    ? "It's no longer there. The page has been refreshed."
    : error instanceof Error
      ? error.message
      : undefined;

interface PhotoRowProps {
  photo: MediaItem;
  is_cover: boolean;
  is_busy: boolean;
  drag_handle: SortableHandleProps;
  on_make_cover: () => void;
  on_edit: () => void;
  on_remove: () => void;
}

function PhotoRow({
  photo,
  is_cover,
  is_busy,
  drag_handle,
  on_make_cover,
  on_edit,
  on_remove,
}: PhotoRowProps) {
  const name_id = useId();
  const facts = [
    is_cover && "Cover",
    !photo.altText && "No alt text",
    photo.location,
  ].filter(Boolean);

  return (
    <div className="border border-neutral-300 dark:border-neutral-700 flex items-center gap-3 p-2">
      <Button size="icon" {...drag_handle}>
        <GripIcon strokeWidth={1.5} size={16} />
      </Button>
      <div className="size-16 shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        {photo.thumbnailUrl && (
          <img
            src={photo.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <p id={name_id} className="font-medium truncate" title={photo.originalName}>
          {photo.originalName}
        </p>
        {facts.length > 0 && (
          <p className="text-sm opacity-80 truncate">{facts.join(" · ")}</p>
        )}
        {photo.caption && (
          <p className="text-sm truncate" title={photo.caption}>
            {photo.caption}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        {!is_cover && (
          <Button
            size="icon"
            aria-label="Make this the cover"
            aria-describedby={name_id}
            title="Make cover"
            disabled={is_busy}
            onClick={on_make_cover}
          >
            <ImageIcon strokeWidth={1.5} size={16} />
          </Button>
        )}
        <Button
          size="icon"
          aria-label="Edit details"
          aria-describedby={name_id}
          title="Edit details"
          onClick={on_edit}
        >
          <PencilLineIcon strokeWidth={1.5} size={16} />
        </Button>
        <Button
          size="icon"
          aria-label="Remove from the collection"
          aria-describedby={name_id}
          title="Remove from collection (it stays in the library)"
          disabled={is_busy}
          onClick={on_remove}
        >
          <XIcon strokeWidth={1.5} size={16} />
        </Button>
      </div>
    </div>
  );
}

interface CollectionPhotosProps {
  collection_id: string;
  photos: MediaItem[];
  /** The chosen cover; null means the first photo is used. */
  cover_id: string | null;
  cameras: ReadonlyArray<MediaCameraOption>;
  can_upload: boolean;
}

export function CollectionPhotos({
  collection_id,
  photos,
  cover_id,
  cameras,
  can_upload,
}: CollectionPhotosProps) {
  const router = useRouter();
  const toast = useToast();
  const add_photos = useServerFn(addCollectionPhotos);
  const remove_photo = useServerFn(removeCollectionPhoto);
  const set_cover = useServerFn(setCollectionCover);
  const reorder = useServerFn(reorderCollectionPhotos);
  const [is_picker_open, set_is_picker_open] = useState(false);
  const [editing_id, set_editing_id] = useState<string | null>(null);
  const [busy_id, set_busy_id] = useState<string | null>(null);
  // Read from the loader so edits show up once it reloads.
  const editing = photos.find((photo) => photo.id === editing_id) ?? null;
  const shown_cover = cover_id ?? photos[0]?.id ?? null;
  const existing_ids = useMemo(
    () => new Set(photos.map((photo) => photo.id)),
    [photos],
  );

  const run = async (
    photo: MediaItem,
    action: () => Promise<unknown>,
    failure: string,
    success?: string,
  ) => {
    set_busy_id(photo.id);
    try {
      await action();
      if (success) toast.success({ title: success });
    } catch (error) {
      toast.danger({ title: failure, description: errorDescription(error) });
    } finally {
      await router.invalidate();
      set_busy_id(null);
    }
  };

  const add = async (media_ids: string[]) => {
    try {
      const { added, skipped } = await add_photos({
        data: { id: collection_id, mediaIds: media_ids },
      });
      toast.success({
        title: `Added ${photoCount(added)}`,
        description:
          skipped > 0
            ? `${photoCount(skipped)} ${skipped === 1 ? "was" : "were"} already in it or no longer in the library.`
            : undefined,
      });
      await router.invalidate();
      return true;
    } catch (error) {
      toast.danger({
        title: "Couldn't add the photos",
        description: errorDescription(error),
      });
      return false;
    }
  };

  const persist_order = async (items: MediaItem[]) => {
    try {
      await reorder({
        data: { id: collection_id, mediaIds: items.map((item) => item.id) },
      });
    } catch (error) {
      toast.danger({
        title: "Couldn't save the new order",
        description: errorDescription(error),
      });
    } finally {
      // Re-sync with the database either way (reverts the list on failure).
      await router.invalidate();
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Photos ({photos.length})</h2>
        <Button onClick={() => set_is_picker_open(true)}>
          <ImagePlusIcon strokeWidth={1.5} size={16} />
          <span>Add Photos</span>
        </Button>
      </div>
      {photos.length > 0 ? (
        <>
          <SortableList
            items={photos}
            item_label={(photo) => photo.originalName}
            on_reorder={persist_order}
            render_item={(photo, drag_handle) => (
              <PhotoRow
                photo={photo}
                is_cover={photo.id === shown_cover}
                is_busy={busy_id === photo.id}
                drag_handle={drag_handle}
                on_make_cover={() =>
                  void run(
                    photo,
                    () =>
                      set_cover({ data: { id: collection_id, mediaId: photo.id } }),
                    "Couldn't change the cover",
                    "Cover changed",
                  )
                }
                on_edit={() => set_editing_id(photo.id)}
                on_remove={() =>
                  void run(
                    photo,
                    () =>
                      remove_photo({
                        data: { id: collection_id, mediaId: photo.id },
                      }),
                    "Couldn't remove the photo",
                    `Removed ${photo.originalName}`,
                  )
                }
              />
            )}
          />
          <p className="text-sm opacity-80">
            Drag a photo's handle (or focus it and press the arrow keys) to
            reorder. The cover shows on the collection's card; until you pick
            one, it's the first photo. Removing a photo keeps it in the media
            library.
          </p>
        </>
      ) : (
        <p className="italic opacity-80">
          No photos yet. Add some from the media library; a collection needs
          at least one to be published.
        </p>
      )}
      <CollectionPhotoPicker
        is_open={is_picker_open}
        on_close={() => set_is_picker_open(false)}
        existing_ids={existing_ids}
        can_upload={can_upload}
        cameras={cameras}
        on_add={add}
      />
      <MediaDetailsDialog
        item={editing}
        cameras={cameras}
        on_close={() => set_editing_id(null)}
        on_changed={() => router.invalidate()}
      />
    </section>
  );
}
