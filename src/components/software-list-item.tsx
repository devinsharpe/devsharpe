import { InfoIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import type { PublicSoftwareItem } from "~/server/repositories/gear.repository.server";
import { ExternalLink } from "./_ui/external-link";

interface SoftwareListItemProps extends ComponentProps<"li"> {
  item: PublicSoftwareItem;
}

export default function SoftwareListItem({
  item,
  className,
  ...props
}: SoftwareListItemProps) {
  const { disclosure } = item;

  return (
    <li
      {...props}
      className={cn(
        "border border-neutral-300 dark:border-neutral-700 p-3 flex flex-col gap-2",
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wider opacity-80">
          {item.purpose}
        </p>
        <h3 className="font-medium text-lg normal-case">
          {item.link ? (
            <ExternalLink href={item.link}>{item.name}</ExternalLink>
          ) : (
            item.name
          )}
        </h3>
      </div>
      {item.description && (
        <p className="text-sm opacity-90">{item.description}</p>
      )}
      {disclosure && (
        <p className="mt-auto pt-2 border-t border-neutral-300 dark:border-neutral-700 text-sm flex items-start gap-2">
          <InfoIcon
            strokeWidth={1.5}
            size={16}
            aria-hidden
            className="shrink-0 mt-0.5"
          />
          {disclosure.link.startsWith("/") ? (
            <a href={disclosure.link} className="underline underline-offset-2">
              {disclosure.message}
            </a>
          ) : (
            <ExternalLink href={disclosure.link}>{disclosure.message}</ExternalLink>
          )}
        </p>
      )}
    </li>
  );
}
