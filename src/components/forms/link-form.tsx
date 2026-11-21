import { useServerFn } from "@tanstack/react-start";
import { PlusIcon } from "lucide-react";
import { useConfirm } from "~/components/_ui/alert-dialog";
import { Form } from "~/components/_ui/form";
import { useAppForm } from "~/forms/context.form";
import {
  clickCount,
  LINK_VISIBILITY_OPTIONS,
  linkInputSchema,
  type LinkInput,
} from "~/lib/links";
import {
  createLink,
  deleteLink,
  type getLinksEditor,
  updateLink,
} from "~/server/functions/links.functions";
import { type RecordFormProps, useMutationFeedback } from "./use-mutation-feedback";

/** A link as the admin page lists it. */
export type EditableLink = Awaited<
  ReturnType<typeof getLinksEditor>
>["links"][number];

function LinkForm({ item, on_cancel, on_saved }: RecordFormProps<EditableLink>) {
  const create = useServerFn(createLink);
  const update = useServerFn(updateLink);
  const remove = useServerFn(deleteLink);
  const run = useMutationFeedback("link");
  const confirm = useConfirm();
  const is_editing = !!item;

  const form = useAppForm({
    defaultValues: {
      title: item?.title ?? "",
      url: item?.url ?? "",
      isVisible: item && !item.isVisible ? "hidden" : "shown",
    } as LinkInput,
    validators: { onChange: linkInputSchema },
    onSubmit: async ({ value }) => {
      const saved = await run(is_editing ? "update" : "create", () =>
        item
          ? update({ data: { ...value, id: item.id } })
          : create({ data: value }),
      );
      if (saved) await on_saved();
    },
  });

  const handle_delete = async () => {
    if (!item) return;
    const confirmed = await confirm({
      title: `Delete "${item.title}"?`,
      description:
        item.clicks > 0
          ? `It comes off the page and its ${clickCount(item.clicks)} are lost. To take it off the page but keep it, hide it instead. This can't be undone.`
          : "It comes off the page. To take it off the page but keep it, hide it instead. This can't be undone.",
      confirm_label: "Delete link",
      is_destructive: true,
    });
    if (!confirmed) return;
    const deleted = await run("delete", () => remove({ data: { id: item.id } }));
    if (deleted) await on_saved();
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
        <div className="flex flex-col gap-2 pb-4 px-2">
          <form.AppField
            name="title"
            children={(field) => (
              <field.TextField label="Title" placeholder="Photography on Glass" />
            )}
          />
          <form.AppField
            name="url"
            children={(field) => (
              <field.TextField
                label="URL"
                placeholder="https://glass.photo/someone"
                autoComplete="off"
              />
            )}
          />
          <p className="text-sm opacity-80">
            A web address, a mailto: or tel: link, or a path on this site such
            as /photography.
          </p>
          <form.AppField
            name="isVisible"
            children={(field) => (
              <field.SelectField
                label="Visibility"
                options={LINK_VISIBILITY_OPTIONS}
              />
            )}
          />
        </div>
        <form.FormActions
          submit_label={is_editing ? "Save Changes" : "Add Link"}
          submit_icon={
            is_editing ? undefined : <PlusIcon strokeWidth={1.5} size={16} />
          }
          on_cancel={on_cancel}
          on_delete={is_editing ? handle_delete : undefined}
        />
      </Form>
    </form.AppForm>
  );
}

export { LinkForm };
