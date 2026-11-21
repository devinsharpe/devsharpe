import { useServerFn } from "@tanstack/react-start";
import { ServerPlusIcon } from "lucide-react";
import { Form } from "~/components/_ui/form";
import { useConfirm } from "~/components/_ui/alert-dialog";
import { useAppForm } from "~/forms/context.form";
import {
  hardwareItemInputSchema,
  type HardwareItemInput,
} from "~/lib/gear";
import { toIdentifier } from "~/lib/validation";
import type { HardwareItem } from "~/server/database/schema.server";
import {
  createHardwareItem,
  deleteHardwareItem,
  updateHardwareItem,
} from "~/server/functions/gear.functions";
import { RecordFormProps, useMutationFeedback } from "./use-mutation-feedback";

function HardwareItemForm({
  item,
  on_cancel,
  on_saved,
}: RecordFormProps<HardwareItem>) {
  const create = useServerFn(createHardwareItem);
  const update = useServerFn(updateHardwareItem);
  const remove = useServerFn(deleteHardwareItem);
  const run = useMutationFeedback("hardware item");
  const confirm = useConfirm();
  const is_editing = !!item;

  const form = useAppForm({
    defaultValues: {
      id: item?.id ?? "",
      name: item?.name ?? "",
      purpose: item?.purpose ?? "",
      link: item?.link ?? "",
    } as HardwareItemInput,
    validators: { onChange: hardwareItemInputSchema },
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
    const deleted = await run("delete", () =>
      remove({ data: { id: item.id } }),
    );
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
              <field.TextField
                label="Identifier"
                placeholder="apple-macbook-pro"
                disabled
              />
            )}
          />
          <form.AppField
            name="name"
            listeners={{
              onChange: ({ value }) => {
                // The identifier is the primary key, so it's fixed once created.
                if (!is_editing)
                  form.setFieldValue("id", toIdentifier(value));
              },
            }}
            children={(field) => (
              <field.TextField label="Name" placeholder="Apple MacBook Pro" />
            )}
          />
          <form.AppField
            name="purpose"
            children={(field) => (
              <field.TextField label="Purpose" placeholder="Primary Computer" />
            )}
          />
          <form.AppField
            name="link"
            children={(field) => (
              <field.TextField label="Link" placeholder="https://a.co/d/..." />
            )}
          />
        </div>
        <form.FormActions
          submit_label={is_editing ? "Save Changes" : "Create Item"}
          submit_icon={
            is_editing ? undefined : (
              <ServerPlusIcon strokeWidth={1.5} size={16} />
            )
          }
          on_cancel={on_cancel}
          on_delete={is_editing ? handle_delete : undefined}
        />
      </Form>
    </form.AppForm>
  );
}

export { HardwareItemForm };
