import { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import { SoftwareItem } from "~/server/database/schema.server";
import Button from "../_ui/button";
import type { SortableHandleProps } from "../_ui/sortable-list";
import { GripIcon, PencilLineIcon } from "lucide-react";

interface SoftwareFormItemProps extends ComponentProps<"div"> {
  item: SoftwareItem;
  on_edit_click: (item: SoftwareItem) => void;
  /** Wires the grip button up as this row's drag handle. */
  drag_handle: SortableHandleProps;
}

function SoftwareFormItem({
  className,
  item,
  on_edit_click,
  drag_handle,
  ...props
}: SoftwareFormItemProps) {
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
          <p className="opacity-80 text-sm">{item.purpose}</p>
          <p className="font-medium">{item.name}</p>
        </div>
        <Button
          size="icon"
          aria-label={`Edit ${item.name}`}
          onClick={() => on_edit_click(item)}
        >
          <PencilLineIcon strokeWidth={1.5} size={16} />
        </Button>
      </div>
      {item.description && (
        <p className="text-sm opacity-80">{item.description}</p>
      )}
    </div>
  );
}

export { SoftwareFormItem };
