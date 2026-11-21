import { SiGithub } from "@icons-pack/react-simple-icons";
import {
  ChevronDownIcon,
  GripIcon,
  LinkIcon,
  NotebookPenIcon,
  PencilLineIcon,
} from "lucide-react";
import { ComponentProps, useId, useState } from "react";
import { cn } from "~/lib/utils";
import type { ProjectItem } from "~/server/database/schema.server";
import Button from "../_ui/button";
import Link from "../_ui/link";
import type { SortableHandleProps } from "../_ui/sortable-list";

interface ProjectFormItemProps extends ComponentProps<"div"> {
  item: ProjectItem;
  on_edit_click: (item: ProjectItem) => void;
  /** Wires the grip button up as this row's drag handle. */
  drag_handle: SortableHandleProps;
}

function ProjectFormItem({
  className,
  item,
  on_edit_click,
  drag_handle,
  ...props
}: ProjectFormItemProps) {
  const details_id = useId();
  const [is_open, set_is_open] = useState(false);
  const has_links = !!item.appLink || !!item.githubLink;
  const has_details =
    !!item.description || item.badges.length > 0 || has_links;

  return (
    <div
      className={cn(
        "border border-neutral-300 dark:border-neutral-700 flex flex-col p-2",
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        <Button size="icon" {...drag_handle}>
          <GripIcon strokeWidth={1.5} size={16} />
        </Button>
        <div className="flex flex-col flex-1">
          <p className="opacity-80 text-sm">
            {item.startDate} – {item.endDate ?? (item.isActive ? "Current" : "")}
          </p>
          <p className="font-medium">
            {item.name}
            <span className="opacity-80 font-normal text-sm">
              {" "}
              /projects/{item.id}
            </span>
          </p>
        </div>
        {has_details && (
          <Button
            size="icon"
            aria-label={`Details for ${item.name}`}
            aria-expanded={is_open}
            aria-controls={details_id}
            onClick={() => set_is_open((open) => !open)}
          >
            <ChevronDownIcon
              strokeWidth={1.5}
              size={16}
              className={cn("transition-transform", is_open && "rotate-180")}
            />
          </Button>
        )}
        <Link
          size="icon"
          to="/dashboard/projects/$projectId"
          params={{ projectId: item.id }}
          aria-label={`Write the page for ${item.name}`}
          title="Write page"
        >
          <NotebookPenIcon strokeWidth={1.5} size={16} />
        </Link>
        <Button
          size="icon"
          aria-label={`Edit ${item.name}`}
          onClick={() => on_edit_click(item)}
        >
          <PencilLineIcon strokeWidth={1.5} size={16} />
        </Button>
      </div>
      {has_details && (
        // Indented to line up with the name (grip button + gap). Tailwind's
        // preflight hides [hidden] with !important, so `flex` can't override it.
        <div
          id={details_id}
          hidden={!is_open}
          className="flex flex-col gap-2 pt-2 pl-12 text-sm"
        >
          {item.description && <p>{item.description}</p>}
          {has_links && (
            <ul className="flex flex-col gap-1">
              {item.appLink && (
                <li className="flex items-center gap-2">
                  <LinkIcon strokeWidth={1.5} size={14} />
                  <a
                    href={item.appLink}
                    target="_blank"
                    rel="noreferrer"
                    className="underline break-all"
                  >
                    {item.appLink}
                  </a>
                </li>
              )}
              {item.githubLink && (
                <li className="flex items-center gap-2">
                  <SiGithub size={14} />
                  <a
                    href={item.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="underline break-all"
                  >
                    {item.githubLink}
                  </a>
                </li>
              )}
            </ul>
          )}
          {item.badges.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {item.badges.map((badge) => (
                <li
                  key={badge}
                  className="border border-neutral-300 dark:border-neutral-700 px-2"
                >
                  {badge}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export { ProjectFormItem };
