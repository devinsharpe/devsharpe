// Admin: "Add Photos" for a collection. Pick any number of photos from the
// media library (or upload new ones, which come pre-picked), then add them.
import { ImagePlusIcon, ImageUpIcon, XIcon } from "lucide-react";
import { useId, useState } from "react";
import { COLLECTION_ADD_MAX } from "~/lib/photography";
import Button from "../_ui/button";
import Dialog from "../_ui/dialog";
import type { MediaCameraOption, MediaItem } from "../media/media-library-item";
import { MediaPickerLibrary } from "../media/media-picker-library";
import {
  MediaUploader,
  type UploadActivity,
  uploadActivityLabel,
} from "../media/media-uploader";

interface CollectionPhotoPickerProps {
  is_open: boolean;
  on_close: () => void;
  /** Photos already in the collection; they can't be picked again. */
  existing_ids: ReadonlySet<string>;
  can_upload: boolean;
  cameras: ReadonlyArray<MediaCameraOption>;
  /** Adds the picked photos, in the order they were picked. Resolves true on success. */
  on_add: (media_ids: string[]) => Promise<boolean>;
}

export function CollectionPhotoPicker({
  is_open,
  on_close,
  existing_ids,
  can_upload,
  cameras,
  on_add,
}: CollectionPhotoPickerProps) {
  const uploader_id = useId();
  // Picked ids, in the order they were picked.
  const [picked, set_picked] = useState<string[]>([]);
  const [is_adding, set_is_adding] = useState(false);
  const [reload, set_reload] = useState(0);
  // Once opened, the uploader stays mounted (hidden when toggled off, or with
  // the dialog closed) so uploads keep going.
  const [has_uploader, set_has_uploader] = useState(false);
  const [is_uploader_shown, set_is_uploader_shown] = useState(false);
  const [activity, set_activity] = useState<UploadActivity>({
    in_progress: 0,
    failed: 0,
  });
  const activity_label = uploadActivityLabel(activity);
  const is_full = picked.length >= COLLECTION_ADD_MAX;

  const toggle = (item: MediaItem) =>
    set_picked((current) =>
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : current.length >= COLLECTION_ADD_MAX
          ? current
          : [...current, item.id],
    );

  const close = () => {
    set_picked([]);
    on_close();
  };

  const add = async () => {
    if (picked.length === 0 || is_adding) return;
    set_is_adding(true);
    try {
      if (await on_add(picked)) close();
    } finally {
      set_is_adding(false);
    }
  };

  const picked_label =
    picked.length === 0
      ? "Pick photos to add"
      : `${picked.length} picked${is_full ? ` (the most at once)` : ""}`;

  return (
    <Dialog.Root open={is_open} onOpenChange={(open) => !open && close()}>
      <Dialog.Content className="max-w-3xl gap-4">
        <div className="-mx-2 px-2 pb-2 pr-12 border-b flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold">Add Photos</h2>
            <p className="text-sm opacity-80">
              Pick as many as you like; they're added to the end, in the order
              you pick them.
            </p>
          </div>
          {can_upload && (
            <div className="flex flex-wrap items-center gap-2">
              {activity_label && (
                <p className="text-sm opacity-80" aria-live="polite">
                  {activity_label}
                </p>
              )}
              <Button
                aria-expanded={is_uploader_shown}
                aria-controls={has_uploader ? uploader_id : undefined}
                onClick={() => {
                  set_has_uploader(true);
                  set_is_uploader_shown((shown) => !shown);
                }}
              >
                <ImageUpIcon strokeWidth={1.5} size={16} aria-hidden />
                {is_uploader_shown ? "Hide uploader" : "Upload photos"}
              </Button>
            </div>
          )}
        </div>
        {has_uploader && (
          <div
            id={uploader_id}
            hidden={!is_uploader_shown}
            className="px-2 pb-4 border-b border-neutral-300 dark:border-neutral-700"
          >
            <MediaUploader
              disabled={!can_upload}
              cameras={cameras}
              on_uploaded={async (item) => {
                // New uploads are what you came to add.
                set_picked((current) =>
                  current.includes(item.id) || current.length >= COLLECTION_ADD_MAX
                    ? current
                    : [...current, item.id],
                );
                set_reload((count) => count + 1);
              }}
              on_activity_change={set_activity}
            />
          </div>
        )}
        <div className="pb-2">
          {is_open && (
            <MediaPickerLibrary
              action="Pick"
              on_pick={toggle}
              is_selected={(item) => picked.includes(item.id)}
              unavailable_label={(item) =>
                existing_ids.has(item.id) ? "Already added" : undefined
              }
              on_loaded={() => undefined}
              reload={reload}
            />
          )}
        </div>
        <div className="-mx-2 px-2 pt-2 border-t flex flex-wrap items-center gap-2">
          <p className="text-sm opacity-80" aria-live="polite">
            {picked_label}
          </p>
          <Button className="ml-auto" onClick={close}>
            <XIcon strokeWidth={1.5} size={16} />
            <span>Cancel</span>
          </Button>
          <Button
            variant="success"
            disabled={picked.length === 0}
            loading={is_adding}
            onClick={add}
          >
            <ImagePlusIcon strokeWidth={1.5} size={16} />
            <span>
              {picked.length > 0
                ? `Add ${picked.length} ${picked.length === 1 ? "Photo" : "Photos"}`
                : "Add Photos"}
            </span>
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
