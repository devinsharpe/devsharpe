import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Form } from "~/components/_ui/form";
import { useAppForm } from "~/forms/context.form";
import {
  formatBytes,
  type MediaDetailsInput,
  mediaDetailsSchema,
} from "~/lib/media";
import {
  deleteMedia,
  getMediaUsage,
  updateMediaDetails,
} from "~/server/functions/media.functions";
import { useConfirm } from "../_ui/alert-dialog";
import Dialog from "../_ui/dialog";
import { LocalTime } from "../_ui/local-time";
import { useMutationFeedback } from "../forms/use-mutation-feedback";
import { MediaImage } from "./media-image";
import type { MediaCameraOption, MediaItem } from "./media-library-item";

type MediaUse = Awaited<ReturnType<typeof getMediaUsage>>[number];

/** e.g. `post "Hello"`, for the delete confirmation. */
function describeUse(use: MediaUse) {
  const name =
    use.kind === "post"
      ? `post "${use.title}"`
      : use.kind === "project"
        ? `project page "${use.title}"`
        : use.kind === "collection"
          ? `photo collection "${use.title}"`
          : use.kind === "links"
            ? "the photo on /links"
            : "the homepage biography";
  return use.is_live ? name : `${name} (draft only)`;
}

function UseLink({ use }: { use: MediaUse }) {
  const className = "underline underline-offset-2 hover:opacity-80";
  if (use.kind === "post") {
    return (
      <Link to="/dashboard/posts/$postId" params={{ postId: use.id }} className={className}>
        Post “{use.title}”
      </Link>
    );
  }
  if (use.kind === "collection") {
    return (
      <Link
        to="/dashboard/collections/$collectionId"
        params={{ collectionId: use.id }}
        className={className}
      >
        Photo collection “{use.title}”
      </Link>
    );
  }
  if (use.kind === "project") {
    return (
      <Link
        to="/dashboard/projects/$projectId"
        params={{ projectId: use.id }}
        className={className}
      >
        Project page “{use.title}”
      </Link>
    );
  }
  if (use.kind === "links") {
    return (
      <Link to="/edit/links" className={className}>
        Links page photo
      </Link>
    );
  }
  return (
    <Link to="/edit/biography" className={className}>
      Homepage biography
    </Link>
  );
}

/** Where the image is used: null while checking, "error" if that failed. */
function MediaUsage({ uses }: { uses: MediaUse[] | null | "error" }) {
  if (uses === null) {
    return <p className="text-sm opacity-80">Checking where it's used…</p>;
  }
  if (uses === "error") {
    return <p className="text-sm opacity-80">Couldn't check where it's used.</p>;
  }
  if (uses.length === 0) {
    return <p className="text-sm opacity-80">Not used on any page.</p>;
  }
  return (
    <div className="text-sm">
      <p className="font-medium">Used on</p>
      <ul className="list-disc pl-5">
        {uses.map((use) => (
          <li key={`${use.kind}:${use.id}`}>
            <UseLink use={use} />
            {!use.is_live && <span className="opacity-80"> (draft only)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface MediaDetailsProps {
  item: MediaItem;
  /** Cameras the photo can be linked to. */
  cameras: ReadonlyArray<MediaCameraOption>;
  on_close: () => void;
  /** Reloads the library after a save or delete. */
  on_changed: () => Promise<void>;
}

function MediaDetails({ item, cameras, on_close, on_changed }: MediaDetailsProps) {
  const update = useServerFn(updateMediaDetails);
  const remove = useServerFn(deleteMedia);
  const fetch_usage = useServerFn(getMediaUsage);
  const run = useMutationFeedback("image");
  const confirm = useConfirm();
  const [uses, set_uses] = useState<MediaUse[] | null | "error">(null);
  // Deleting waits for the check, so the confirmation can name the pages.
  const usage = useRef<Promise<MediaUse[] | null> | null>(null);

  useEffect(() => {
    let is_current = true;
    const check = fetch_usage({ data: { id: item.id } }).then(
      (found) => {
        if (is_current) set_uses(found);
        return found;
      },
      () => {
        if (is_current) set_uses("error");
        return null;
      },
    );
    usage.current = check;
    return () => {
      is_current = false;
    };
  }, [fetch_usage, item.id]);

  const form = useAppForm({
    defaultValues: {
      altText: item.altText ?? "",
      caption: item.caption ?? "",
      location: item.location ?? "",
      cameraId: item.cameraId ?? "",
      tags: item.tags.join(", "),
    } as MediaDetailsInput,
    validators: { onChange: mediaDetailsSchema },
    onSubmit: async ({ value }) => {
      const saved = await run("update", async () => {
        await update({ data: { ...value, id: item.id } });
        return { name: item.originalName };
      });
      if (saved) {
        on_close();
        await on_changed();
      }
    },
  });

  const handle_delete = async () => {
    const found = await usage.current;
    const confirmed = await confirm({
      title: `Delete "${item.originalName}"?`,
      description: (
        <>
          {found == null ? (
            <p>Couldn't check which pages use it; any that do will lose it.</p>
          ) : found.length === 0 ? (
            <p>No pages use it.</p>
          ) : (
            <>
              <p>
                It's used on{" "}
                {found.length === 1 ? "1 page" : `${found.length} pages`}, which
                will lose it:
              </p>
              <ul className="list-disc pl-5">
                {found.map((use) => (
                  <li key={`${use.kind}:${use.id}`}>{describeUse(use)}</li>
                ))}
              </ul>
            </>
          )}
          <p>The file is removed from storage. This can't be undone.</p>
        </>
      ),
      confirm_label: "Delete image",
      is_destructive: true,
    });
    if (!confirmed) return;
    const deleted = await run("delete", () => remove({ data: { id: item.id } }));
    if (deleted) {
      on_close();
      await on_changed();
    }
  };

  const camera_options = [
    { value: "", label: "No camera" },
    ...cameras.map((camera) => ({ value: camera.id, label: camera.name })),
  ];

  const facts = [
    item.width && item.height ? `${item.width} × ${item.height}` : null,
    formatBytes(item.byteSize),
    item.contentType.replace("image/", "").toUpperCase(),
  ].filter(Boolean);

  return (
    <>
      <div className="-mx-2 px-2 pb-2 pr-12 border-b">
        <h2 className="text-2xl font-bold break-all">{item.originalName}</h2>
        <p className="text-sm opacity-80">
          {facts.join(" · ")} · uploaded <LocalTime date={item.createdAt} />
        </p>
      </div>
      <div className="px-2">
        {item.image ? (
          <MediaImage
            image={item.image}
            alt={item.altText ?? ""}
            sizes="(min-width: 48rem) 46rem, 100vw"
            className="mx-auto max-h-[50vh] w-auto object-contain"
          />
        ) : (
          <p className="italic opacity-80">
            Previews appear once imgproxy is configured.
          </p>
        )}
      </div>
      <div className="px-2">
        <MediaUsage uses={uses} />
      </div>
      <form.AppForm>
        <Form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-1 gap-2 pb-4 px-2">
            <form.AppField
              name="altText"
              children={(field) => (
                <field.TextAreaField
                  label="Alt text"
                  placeholder="Describe the photo for people who can't see it…"
                  rows={2}
                />
              )}
            />
            <form.AppField
              name="caption"
              children={(field) => (
                <field.TextAreaField
                  label="Caption (optional)"
                  placeholder="Shown alongside the photo where it's published"
                  rows={2}
                />
              )}
            />
            <form.AppField
              name="location"
              children={(field) => (
                <field.TextField
                  label="Location (optional)"
                  placeholder="Reykjavík, Iceland"
                />
              )}
            />
            {cameras.length > 0 && (
              <form.AppField
                name="cameraId"
                children={(field) => (
                  <field.SelectField
                    label="Camera (optional)"
                    options={camera_options}
                  />
                )}
              />
            )}
            <form.AppField
              name="tags"
              children={(field) => (
                <field.TextField
                  label="Tags (comma-separated)"
                  placeholder="iceland, landscape"
                />
              )}
            />
          </div>
          <form.FormActions
            submit_label="Save Changes"
            on_cancel={on_close}
            on_delete={handle_delete}
          />
        </Form>
      </form.AppForm>
    </>
  );
}

interface MediaDetailsDialogProps extends Omit<MediaDetailsProps, "item"> {
  /** The item to show; null keeps the dialog closed. */
  item: MediaItem | null;
}

/** Preview, alt text and caption, and delete, for one library item. */
export function MediaDetailsDialog({ item, ...props }: MediaDetailsDialogProps) {
  return (
    <Dialog.Root
      open={item !== null}
      onOpenChange={(open) => !open && props.on_close()}
    >
      <Dialog.Content className="max-w-3xl gap-2">
        {/* Keyed so each item starts from a fresh form. */}
        {item && <MediaDetails key={item.id} item={item} {...props} />}
      </Dialog.Content>
    </Dialog.Root>
  );
}
