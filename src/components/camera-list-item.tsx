import { Link } from "@tanstack/react-router";
import { ImageIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import type { CameraItem } from "~/server/database/schema.server";

interface CameraListItemProps extends ComponentProps<"li"> {
  item: CameraItem;
}

/** One camera card, matching the other gear on /uses; render inside a <ul>. */
export default function CameraListItem({
  item,
  className,
  ...props
}: CameraListItemProps) {
  return (
    <li
      {...props}
      className={cn(
        "border border-neutral-300 dark:border-neutral-700 p-3 flex flex-col gap-2",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        {item.purpose && (
          <p className="text-xs uppercase tracking-wider opacity-80">
            {item.purpose}
          </p>
        )}
        <h4 className="font-medium text-lg">
          {item.name}
          {/* Reads as part of the name, e.g. "iPhone 16 Pro + Moment Camera App". */}
          {item.shortDescription && (
            <span className="opacity-80 font-normal"> {item.shortDescription}</span>
          )}
        </h4>
      </div>
      {item.description && (
        <p className="text-sm opacity-90">{item.description}</p>
      )}
      <p className="mt-auto pt-2 border-t border-neutral-300 dark:border-neutral-700 text-sm flex items-start gap-2">
        <ImageIcon
          strokeWidth={1.5}
          size={16}
          aria-hidden
          className="shrink-0 mt-0.5"
        />
        <Link
          to="/photography"
          search={{ camera: item.id }}
          className="underline underline-offset-2 hover:opacity-80"
        >
          View photos<span className="sr-only"> taken with {item.name}</span>
        </Link>
      </p>
    </li>
  );
}
