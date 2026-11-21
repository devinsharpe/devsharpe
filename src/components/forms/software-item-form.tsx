import { useServerFn } from "@tanstack/react-start";
import { Grid2X2PlusIcon } from "lucide-react";
import { Form } from "~/components/_ui/form";
import { useConfirm } from "~/components/_ui/alert-dialog";
import { useAppForm } from "~/forms/context.form";
import {
  softwareItemInputSchema,
  type SoftwareItemInput,
} from "~/lib/gear";
import { toIdentifier } from "~/lib/validation";
import type { SoftwareItem } from "~/server/database/schema.server";
import {
  createSoftwareItem,
  deleteSoftwareItem,
  updateSoftwareItem,
} from "~/server/functions/gear.functions";
import { RecordFormProps, useMutationFeedback } from "./use-mutation-feedback";

function SoftwareItemForm({
  item,
  on_cancel,
  on_saved,
}: RecordFormProps<SoftwareItem>) {
  const create = useServerFn(createSoftwareItem);
  const update = useServerFn(updateSoftwareItem);
  const remove = useServerFn(deleteSoftwareItem);
  const run = useMutationFeedback("software item");
  const confirm = useConfirm();
  const is_editing = !!item;

  const form = useAppForm({
    defaultValues: {
      id: item?.id ?? "",
      name: item?.name ?? "",
      purpose: item?.purpose ?? "",
      description: item?.description ?? "",
      link: item?.link ?? "",
    } as SoftwareItemInput,
    validators: { onChange: softwareItemInputSchema },
    onSubmit: async ({ value }) => {
      const saved = await run(is_editing ? "update" : "create", () =>
        is_editing ? update({ data: value }) : create({ data: value }),
      );
      if (saved) await on_saved();
    },
  });

  const handle_delete = async () => {
    if (!item) return;
    const confirmed = await confirm({
      title: `Delete "${item.name}"?`,
      description: "This can't be undone.",
      confirm_label: "Delete item",
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
            name="id"
            children={(field) => (
              <field.TextField label="Identifier" placeholder="zed" disabled />
            )}
          />
          <form.AppField
            name="name"
            listeners={{
              onChange: ({ value }) => {
                // The identifier is the primary key, so it's fixed once created.
                if (!is_editing) form.setFieldValue("id", toIdentifier(value));
              },
            }}
            children={(field) => (
              <field.TextField label="Name" placeholder="Zed" />
            )}
          />
          <form.AppField
            name="purpose"
            children={(field) => (
              <field.TextField label="Purpose" placeholder="Editor" />
            )}
          />
          <form.AppField
            name="link"
            children={(field) => (
              <field.TextField label="Link" placeholder="https://zed.dev" />
            )}
          />
          <form.AppField
            name="description"
            children={(field) => (
              <field.TextAreaField
                label="Description"
                placeholder="Why it's part of the daily rotation…"
              />
            )}
          />
        </div>
        <form.FormActions
          submit_label={is_editing ? "Save Changes" : "Create Item"}
          submit_icon={
            is_editing ? undefined : (
              <Grid2X2PlusIcon strokeWidth={1.5} size={16} />
            )
          }
          on_cancel={on_cancel}
          on_delete={is_editing ? handle_delete : undefined}
        />
      </Form>
    </form.AppForm>
  );
}

export { SoftwareItemForm };
