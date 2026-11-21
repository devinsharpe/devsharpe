import { GripIcon, PencilLineIcon } from "lucide-react";
import { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import type { HardwareItem } from "~/server/database/schema.server";
import Button from "../_ui/button";
import type { SortableHandleProps } from "../_ui/sortable-list";

interface HardwareFormItemProps extends ComponentProps<"div"> {
  item: HardwareItem;
  on_edit_click: (item: HardwareItem) => void;
  /** Wires the grip button up as this row's drag handle. */
  drag_handle: SortableHandleProps;
}

function HardwareFormItem({
  item,
  on_edit_click,
  drag_handle,
  className,
  ...props
}: HardwareFormItemProps) {
  return (
    <div
      className={cn(
        "border border-neutral-300 dark:border-neutral-700 flex items-start gap-4 p-2",
        className,
      )}
      {...props}
    >
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
  );
}

export { HardwareFormItem };
