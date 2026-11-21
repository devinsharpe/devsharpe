import { ChevronDownIcon, GripIcon, PencilLineIcon } from "lucide-react";
import { ComponentProps, useId, useState } from "react";
import { cn } from "~/lib/utils";
import type { PositionItem } from "~/server/database/schema.server";
import Button from "../_ui/button";
import type { SortableHandleProps } from "../_ui/sortable-list";

interface PositionFormItemProps extends ComponentProps<"div"> {
  item: PositionItem;
  on_edit_click: (item: PositionItem) => void;
  /** Wires the grip button up as this row's drag handle. */
  drag_handle: SortableHandleProps;
}

function PositionFormItem({
  className,
  item,
  on_edit_click,
  drag_handle,
  ...props
}: PositionFormItemProps) {
  const details_id = useId();
  const [is_open, set_is_open] = useState(false);
  const has_details =
    !!item.description ||
    item.highlights.length > 0 ||
    item.technologies.length > 0;

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
            {item.startDate} – {item.endDate ?? "Current"}
          </p>
          <p className="font-medium">
            {item.title}
            <span className="opacity-80 font-normal"> @ {item.name}</span>
          </p>
        </div>
        {has_details && (
          <Button
            size="icon"
            aria-label={`Details for ${item.title} at ${item.name}`}
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
        <Button
          size="icon"
          aria-label={`Edit ${item.title} @ ${item.name}`}
          onClick={() => on_edit_click(item)}
        >
          <PencilLineIcon strokeWidth={1.5} size={16} />
        </Button>
      </div>
      {has_details && (
        // Indented to line up with the title (grip button + gap). Tailwind's
        // preflight hides [hidden] with !important, so `flex` can't override it.
        <div
          id={details_id}
          hidden={!is_open}
          className="flex flex-col gap-2 pt-2 pl-12 text-sm"
        >
          {item.description && <p>{item.description}</p>}
          {item.highlights.length > 0 && (
            <ul className="list-disc list-inside">
              {item.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          )}
          {item.technologies.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="opacity-80">Technologies</p>
              <ul className="flex flex-wrap gap-2">
                {item.technologies.map((technology) => (
                  <li
                    key={technology}
                    className="border border-neutral-300 dark:border-neutral-700 px-2"
                  >
                    {technology}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export { PositionFormItem };
