import { useServerFn } from "@tanstack/react-start";
import { BriefcaseBusinessIcon } from "lucide-react";
import { Form } from "~/components/_ui/form";
import { useConfirm } from "~/components/_ui/alert-dialog";
import { useAppForm } from "~/forms/context.form";
import {
  OFFICE_TYPE_LABELS,
  OFFICE_TYPES,
  POSITION_TYPE_LABELS,
  POSITION_TYPES,
  positionInputSchema,
  type PositionInput,
  type PositionType,
} from "~/lib/about";
import { toIdentifier } from "~/lib/validation";
import type { PositionItem } from "~/server/database/schema.server";
import {
  createPosition,
  deletePosition,
  updatePosition,
} from "~/server/functions/about.functions";
import { RecordFormProps, useMutationFeedback } from "./use-mutation-feedback";

const POSITION_TYPE_OPTIONS = POSITION_TYPES.map((value) => ({
  value,
  label: POSITION_TYPE_LABELS[value],
}));

const OFFICE_TYPE_OPTIONS = OFFICE_TYPES.map((value) => ({
  value,
  label: OFFICE_TYPE_LABELS[value],
}));

interface PositionFormProps extends RecordFormProps<PositionItem> {
  /** Which list a new position starts in; editing uses the item's own type. */
  default_type: PositionType;
}

function PositionForm({
  item,
  default_type,
  on_cancel,
  on_saved,
}: PositionFormProps) {
  const create = useServerFn(createPosition);
  const update = useServerFn(updatePosition);
  const remove = useServerFn(deletePosition);
  const run = useMutationFeedback("position");
  const confirm = useConfirm();
  const is_editing = !!item;

  const form = useAppForm({
    defaultValues: {
      id: item?.id ?? "",
      type: item?.type ?? default_type,
      title: item?.title ?? "",
      name: item?.name ?? "",
      link: item?.link ?? "",
      team: item?.team ?? "",
      location: item?.location ?? "",
      officeType: item?.officeType ?? "remote",
      startDate: item?.startDate ?? "",
      endDate: item?.endDate ?? "",
      description: item?.description ?? "",
      highlights: item?.highlights.join("\n") ?? "",
      technologies: item?.technologies.join(", ") ?? "",
    } as PositionInput,
    validators: { onChange: positionInputSchema },
    onSubmit: async ({ value }) => {
      const saved = await run(is_editing ? "update" : "create", () =>
        is_editing ? update({ data: value }) : create({ data: value }),
      );
      if (saved) await on_saved();
    },
  });

  // The identifier is the primary key, so it's fixed once created.
  const sync_identifier = () => {
    if (is_editing) return;
    const { name, startDate } = form.state.values;
    form.setFieldValue("id", toIdentifier(`${name} ${startDate}`));
  };

  const handle_delete = async () => {
    if (!item) return;
    const label = `${item.title} @ ${item.name}`;
    const confirmed = await confirm({
      title: `Delete "${label}"?`,
      description: "This can't be undone.",
      confirm_label: "Delete position",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4 px-2">
          <form.AppField
            name="type"
            children={(field) => (
              <field.SelectField label="List" options={POSITION_TYPE_OPTIONS} />
            )}
          />
          <form.AppField
            name="id"
            children={(field) => (
              <field.TextField
                label="Identifier"
                placeholder="strata-company-2024"
                disabled
              />
            )}
          />
          <form.AppField
            name="title"
            children={(field) => (
              <field.TextField
                label="Title"
                placeholder="Senior Frontend Software Engineer"
              />
            )}
          />
          <form.AppField
            name="name"
            listeners={{ onChange: sync_identifier }}
            children={(field) => (
              <field.TextField label="Organization" placeholder="Strata Company" />
            )}
          />
          <form.AppField
            name="startDate"
            listeners={{ onChange: sync_identifier }}
            children={(field) => (
              <field.TextField label="Start" placeholder="2024" />
            )}
          />
          <form.AppField
            name="endDate"
            children={(field) => (
              <field.TextField label="End" placeholder="Blank if current" />
            )}
          />
          <form.AppField
            name="location"
            children={(field) => (
              <field.TextField label="Location" placeholder="Philadelphia, PA" />
            )}
          />
          <form.AppField
            name="officeType"
            children={(field) => (
              <field.SelectField
                label="Office Type"
                options={OFFICE_TYPE_OPTIONS}
              />
            )}
          />
          <form.AppField
            name="team"
            children={(field) => (
              <field.TextField label="Team" placeholder="New Product Engineering" />
            )}
          />
          <form.AppField
            name="link"
            children={(field) => (
              <field.TextField label="Link" placeholder="https://gostrata.com" />
            )}
          />
          <form.AppField
            name="description"
            children={(field) => (
              <field.TextAreaField
                className="sm:col-span-2"
                label="Description"
                placeholder="What the role was about…"
                rows={3}
              />
            )}
          />
          <form.AppField
            name="highlights"
            children={(field) => (
              <field.TextAreaField
                className="sm:col-span-2"
                label="Highlights (one per line)"
                placeholder={"Led frontend development of…\nShipped…"}
                rows={5}
              />
            )}
          />
          <form.AppField
            name="technologies"
            children={(field) => (
              <field.TextField
                className="sm:col-span-2"
                label="Technologies (comma-separated)"
                placeholder="TypeScript, React, Tanstack Start"
              />
            )}
          />
        </div>
        <form.FormActions
          submit_label={is_editing ? "Save Changes" : "Create Position"}
          submit_icon={
            is_editing ? undefined : (
              <BriefcaseBusinessIcon strokeWidth={1.5} size={16} />
            )
          }
          on_cancel={on_cancel}
          on_delete={is_editing ? handle_delete : undefined}
        />
      </Form>
    </form.AppForm>
  );
}

export { PositionForm };
