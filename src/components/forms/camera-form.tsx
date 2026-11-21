import { useServerFn } from "@tanstack/react-start";
import { PlusIcon } from "lucide-react";
import { Form } from "~/components/_ui/form";
import { useConfirm } from "~/components/_ui/alert-dialog";
import { useAppForm } from "~/forms/context.form";
import {
  cameraInputSchema,
  type CameraInput,
} from "~/lib/gear";
import { toIdentifier } from "~/lib/validation";
import type { CameraItem } from "~/server/database/schema.server";
import {
  createCamera,
  deleteCamera,
  updateCamera,
} from "~/server/functions/gear.functions";
import { RecordFormProps, useMutationFeedback } from "./use-mutation-feedback";

function CameraForm({ item, on_cancel, on_saved }: RecordFormProps<CameraItem>) {
  const create = useServerFn(createCamera);
  const update = useServerFn(updateCamera);
  const remove = useServerFn(deleteCamera);
  const run = useMutationFeedback("camera");
  const confirm = useConfirm();
  const is_editing = !!item;

  const form = useAppForm({
    defaultValues: {
      id: item?.id ?? "",
      name: item?.name ?? "",
      purpose: item?.purpose ?? "",
      shortDescription: item?.shortDescription ?? "",
      description: item?.description ?? "",
    } as CameraInput,
    validators: { onChange: cameraInputSchema },
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
      description:
        "Photos taken with it stay in the media library, just without a camera. This can't be undone.",
      confirm_label: "Delete camera",
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
              <field.TextField label="Identifier" placeholder="canonet" disabled />
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
              <field.TextField
                label="Name"
                placeholder="Canon Canonet QL 17 GIII"
              />
            )}
          />
          <form.AppField
            name="purpose"
            children={(field) => (
              <field.TextField label="Purpose (optional)" placeholder="Daily Carry" />
            )}
          />
          <form.AppField
            name="shortDescription"
            children={(field) => (
              <field.TextField
                label="Short Description"
                placeholder="+ Moment Camera App"
              />
            )}
          />
          <form.AppField
            name="description"
            children={(field) => (
              <field.TextAreaField
                label="Description"
                placeholder="What it's like to shoot with…"
              />
            )}
          />
        </div>
        <form.FormActions
          submit_label={is_editing ? "Save Changes" : "Create Camera"}
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

export { CameraForm };
