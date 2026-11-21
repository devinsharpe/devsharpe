import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import type { HardwareItem } from "~/server/database/schema.server";
import { ExternalLink } from "./_ui/external-link";

interface HardwareListItemProps extends ComponentProps<"div"> {
  item: HardwareItem;
}

/** One purpose → item pair; render inside a <dl>. */
export default function HardwareListItem({
  item,
  className,
  ...props
}: HardwareListItemProps) {
  return (
    <div
      {...props}
      className={cn(
        "border border-neutral-300 dark:border-neutral-700 p-3 flex flex-col gap-1",
        className,
      )}
    >
      <dt className="text-xs uppercase tracking-wider opacity-80">
        {item.purpose}
      </dt>
      <dd className="font-medium">
        {item.link ? (
          <ExternalLink href={item.link}>{item.name}</ExternalLink>
        ) : (
          item.name
        )}
      </dd>
    </div>
  );
}
