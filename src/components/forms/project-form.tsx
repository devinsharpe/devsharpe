import { useServerFn } from "@tanstack/react-start";
import { FolderPlusIcon } from "lucide-react";
import { useRef } from "react";
import { Form } from "~/components/_ui/form";
import { useConfirm } from "~/components/_ui/alert-dialog";
import { useAppForm } from "~/forms/context.form";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUSES,
  projectInputSchema,
  toProjectStatus,
  type ProjectInput,
  type ProjectStatus,
} from "~/lib/projects";
import { toIdentifier } from "~/lib/validation";
import type { ProjectItem } from "~/server/database/schema.server";
import {
  createProject,
  deleteProject,
  updateProject,
} from "~/server/functions/projects.functions";
import { RecordFormProps, useMutationFeedback } from "./use-mutation-feedback";

const STATUS_OPTIONS = PROJECT_STATUSES.map((value) => ({
  value,
  label: PROJECT_STATUS_LABELS[value],
}));

interface ProjectFormProps extends RecordFormProps<ProjectItem> {
  /** Which list a new project starts in; editing uses the item's own status. */
  default_status: ProjectStatus;
}

function ProjectForm({
  item,
  default_status,
  on_cancel,
  on_saved,
}: ProjectFormProps) {
  const create = useServerFn(createProject);
  const update = useServerFn(updateProject);
  const remove = useServerFn(deleteProject);
  const run = useMutationFeedback("project");
  const confirm = useConfirm();
  const is_editing = !!item;

  // The slug follows the name until it's edited by hand (it's the public URL,
  // so it's worth choosing). Once created it's the primary key and is locked.
  const slug_edited = useRef(false);
  const syncing_slug = useRef(false);

  const form = useAppForm({
    defaultValues: {
      id: item?.id ?? "",
      name: item?.name ?? "",
      status: item ? toProjectStatus(item.isActive) : default_status,
      description: item?.description ?? "",
      appLink: item?.appLink ?? "",
      githubLink: item?.githubLink ?? "",
      badges: item?.badges.join(", ") ?? "",
      startDate: item?.startDate ?? "",
      endDate: item?.endDate ?? "",
    } as ProjectInput,
    validators: { onChange: projectInputSchema },
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
      confirm_label: "Delete project",
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
            name="name"
            listeners={{
              onChange: ({ value }) => {
                if (is_editing || slug_edited.current) return;
                syncing_slug.current = true;
                form.setFieldValue("id", toIdentifier(value));
                syncing_slug.current = false;
              },
            }}
            children={(field) => (
              <field.TextField label="Name" placeholder="devsharpe.io" />
            )}
          />
          <form.AppField
            name="id"
            listeners={{
              onChange: ({ value }) => {
                // Clearing the slug hands it back to the name.
                if (!syncing_slug.current) slug_edited.current = value !== "";
              },
            }}
            children={(field) => (
              <field.TextField
                label="Slug (/projects/…)"
                placeholder="devsharpe"
                disabled={is_editing}
              />
            )}
          />
          <form.AppField
            name="status"
            children={(field) => (
              <field.SelectField label="Status" options={STATUS_OPTIONS} />
            )}
          />
          <div className="grid grid-cols-2 gap-2">
            <form.AppField
              name="startDate"
              children={(field) => (
                <field.TextField label="Start" placeholder="2021" />
              )}
            />
            <form.AppField
              name="endDate"
              children={(field) => (
                <field.TextField label="End" placeholder="Blank if ongoing" />
              )}
            />
          </div>
          <form.AppField
            name="appLink"
            children={(field) => (
              <field.TextField
                label="App Link"
                placeholder="https://devsharpe.io"
              />
            )}
          />
          <form.AppField
            name="githubLink"
            children={(field) => (
              <field.TextField
                label="GitHub Link"
                placeholder="https://github.com/…"
              />
            )}
          />
          <form.AppField
            name="description"
            children={(field) => (
              <field.TextAreaField
                className="sm:col-span-2"
                label="Description"
                placeholder="What it is and why you built it…"
                rows={5}
              />
            )}
          />
          <form.AppField
            name="badges"
            children={(field) => (
              <field.TextField
                className="sm:col-span-2"
                label="Badges (comma-separated)"
                placeholder="Typescript, React, Tanstack Start"
              />
            )}
          />
        </div>
        <form.FormActions
          submit_label={is_editing ? "Save Changes" : "Create Project"}
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

export { ProjectForm };
