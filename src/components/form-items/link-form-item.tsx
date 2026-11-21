import { EyeIcon, EyeOffIcon, GripIcon, PencilLineIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { clickCount, displayUrl } from "~/lib/links";
import { cn } from "~/lib/utils";
import type { EditableLink } from "../forms/link-form";
import Button from "../_ui/button";
import type { SortableHandleProps } from "../_ui/sortable-list";
import { LinkBrandIcon } from "../links/link-icon";

interface LinkFormItemProps extends ComponentProps<"div"> {
  item: EditableLink;
  on_edit_click: (item: EditableLink) => void;
  /** Shows or hides the link on the page. */
  on_visibility_click: (item: EditableLink) => void;
  /** True while its visibility is being saved. */
  is_saving_visibility: boolean;
  /** Wires the grip button up as this row's drag handle. */
  drag_handle: SortableHandleProps;
}

function LinkFormItem({
  className,
  item,
  on_edit_click,
  on_visibility_click,
  is_saving_visibility,
  drag_handle,
  ...props
}: LinkFormItemProps) {
  return (
    <div
      className={cn(
        "border border-neutral-300 dark:border-neutral-700 flex items-center gap-4 p-2",
        className,
      )}
      {...props}
    >
      <Button size="icon" {...drag_handle}>
        <GripIcon strokeWidth={1.5} size={16} />
      </Button>
      <LinkBrandIcon
        url={item.url}
        className={cn("shrink-0", !item.isVisible && "opacity-50")}
      />
      <div className={cn("flex min-w-0 flex-1 flex-col", !item.isVisible && "opacity-60")}>
        <p className="font-medium break-words">
          {item.title}
          {!item.isVisible && (
            <span className="ml-2 border border-current px-1 text-xs font-normal">
              Hidden
            </span>
          )}
        </p>
        <p className="truncate text-sm opacity-80" title={item.url}>
          {displayUrl(item.url)}
        </p>
      </div>
      <p className="shrink-0 text-sm opacity-80 tabular-nums">
        {clickCount(item.clicks)}
      </p>
      <Button
        size="icon"
        variant="ghost"
        aria-label={`${item.isVisible ? "Hide" : "Show"} "${item.title}" on the page`}
        loading={is_saving_visibility}
        disabled={is_saving_visibility}
        onClick={() => on_visibility_click(item)}
      >
        {item.isVisible ? (
          <EyeIcon strokeWidth={1.5} size={16} />
        ) : (
          <EyeOffIcon strokeWidth={1.5} size={16} />
        )}
      </Button>
      <Button
        size="icon"
        aria-label={`Edit "${item.title}"`}
        onClick={() => on_edit_click(item)}
      >
        <PencilLineIcon strokeWidth={1.5} size={16} />
      </Button>
    </div>
  );
}

export { LinkFormItem };
