import { useServerFn } from "@tanstack/react-start";
import { FolderPlusIcon } from "lucide-react";
import { useRef } from "react";
import { useConfirm } from "~/components/_ui/alert-dialog";
import { Form } from "~/components/_ui/form";
import { useAppForm } from "~/forms/context.form";
import { type CollectionInput, collectionInputSchema } from "~/lib/photography";
import { toIdentifier } from "~/lib/validation";
import {
  createCollection,
  deleteCollection,
  updateCollection,
} from "~/server/functions/photography.functions";
import { useMutationFeedback } from "./use-mutation-feedback";

/** The editable details of an existing collection. */
export interface CollectionDetails {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isPublished: boolean;
}

/** What a save resolves with: enough to link to the collection. */
export interface SavedCollection {
  id: string;
  slug: string;
  title: string;
}

interface CollectionFormProps {
  /** The collection being edited; omit to create a new (unpublished) one. */
  item?: CollectionDetails;
  on_cancel: () => void;
  on_saved: (collection: SavedCollection) => void | Promise<void>;
  /** Required when editing: called after the collection is deleted. */
  on_deleted?: () => void | Promise<void>;
}

/** A collection's title, slug, and summary. Photos and the write-up are added in its editor. */
function CollectionForm({
  item,
  on_cancel,
  on_saved,
  on_deleted,
}: CollectionFormProps) {
  const create = useServerFn(createCollection);
  const update = useServerFn(updateCollection);
  const remove = useServerFn(deleteCollection);
  const run = useMutationFeedback("collection");
  const confirm = useConfirm();
  const is_editing = !!item;

  // The slug follows the title until it's edited by hand (a saved slug that
  // doesn't match its title counts as hand-edited). A published collection's
  // slug is its URL, so it never follows the title.
  const slug_edited = useRef(
    !!item && (item.isPublished || item.slug !== toIdentifier(item.title)),
  );
  const syncing_slug = useRef(false);

  const form = useAppForm({
    defaultValues: {
      slug: item?.slug ?? "",
      title: item?.title ?? "",
      description: item?.description ?? "",
    } as CollectionInput,
    validators: { onChange: collectionInputSchema },
    onSubmit: async ({ value }) => {
      const result: { collection?: SavedCollection } = {};
      const saved = await run(is_editing ? "update" : "create", async () => {
        result.collection = item
          ? await update({ data: { ...value, id: item.id } })
          : await create({ data: value });
        return { name: result.collection.title };
      });
      if (saved && result.collection) await on_saved(result.collection);
    },
  });

  const handle_delete = async () => {
    if (!item) return;
    const confirmed = await confirm({
      title: `Delete "${item.title}"?`,
      description:
        (item.isPublished
          ? "It's published, so it will disappear from the site. "
          : "") + "Its photos stay in the media library. This can't be undone.",
      confirm_label: "Delete collection",
      is_destructive: true,
    });
    if (!confirmed) return;
    const deleted = await run("delete", async () => ({
      name: (await remove({ data: { id: item.id } })).title,
    }));
    if (deleted) await on_deleted?.();
  };

  return (
    <form.AppForm>
      <Form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4 px-2">
          <form.AppField
            name="title"
            listeners={{
              onChange: ({ value }) => {
                if (slug_edited.current) return;
                syncing_slug.current = true;
                form.setFieldValue("slug", toIdentifier(value));
                syncing_slug.current = false;
              },
            }}
            children={(field) => (
              <field.TextField label="Title" placeholder="Iceland, Winter 2025" />
            )}
          />
          <form.AppField
            name="slug"
            listeners={{
              onChange: ({ value }) => {
                // Clearing the slug hands it back to the title.
                if (!syncing_slug.current) slug_edited.current = value !== "";
              },
            }}
            children={(field) => (
              <field.TextField
                label="Slug (/photography/…)"
                placeholder="iceland-winter-2025"
              />
            )}
          />
          {item?.isPublished && (
            <p className="sm:col-span-2 text-sm opacity-80">
              This collection is live, so changing its slug changes its URL
              and breaks existing links to it. Details save straight to the
              live collection.
            </p>
          )}
          <form.AppField
            name="description"
            children={(field) => (
              <field.TextAreaField
                className="sm:col-span-2"
                label="Summary (optional)"
                placeholder="A sentence or two for the collection's card and link previews."
                rows={3}
              />
            )}
          />
        </div>
        <form.FormActions
          submit_label={is_editing ? "Save Changes" : "Create Collection"}
          submit_icon={
            is_editing ? undefined : (
              <FolderPlusIcon strokeWidth={1.5} size={16} />
            )
          }
          on_cancel={on_cancel}
          on_delete={is_editing ? handle_delete : undefined}
        />
      </Form>
    </form.AppForm>
  );
}

export { CollectionForm };
