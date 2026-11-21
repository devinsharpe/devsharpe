import { ArrowUpRightIcon, NotebookPenIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import type { ProjectItem } from "~/server/database/schema.server";
import Link from "./_ui/link";

interface ProjectSummaryItemProps extends ComponentProps<"li"> {
  item: ProjectItem;
}

/** Compact project row for the admin dashboard; render inside a <ul>. */
export function ProjectSummaryItem({
  item,
  className,
  ...props
}: ProjectSummaryItemProps) {
  return (
    <li
      {...props}
      className={cn(
        "border border-neutral-300 dark:border-neutral-700 flex items-center gap-4 p-2",
        className,
      )}
    >
      <div className="flex flex-col flex-1 min-w-0">
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
      <Link
        size="icon"
        to="/dashboard/projects/$projectId"
        params={{ projectId: item.id }}
        aria-label={`Write the page for ${item.name}`}
        title="Write page"
      >
        <NotebookPenIcon strokeWidth={1.5} size={16} />
      </Link>
      <Link
        size="icon"
        to="/projects/$slug"
        params={{ slug: item.id }}
        target="_blank"
        aria-label={`View ${item.name} (opens in a new tab)`}
        title="View page"
      >
        <ArrowUpRightIcon strokeWidth={1.5} size={16} />
      </Link>
    </li>
  );
}
