import { ArrowUpRightIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";

interface ExternalLinkProps extends Omit<ComponentProps<"a">, "target" | "rel"> {
  href: string;
}

/** Inline text link that opens in a new tab, marked with an ↗ icon. */
export function ExternalLink({ children, className, ...props }: ExternalLinkProps) {
  return (
    <a
      {...props}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1 underline underline-offset-2 hover:opacity-80",
        className,
      )}
    >
      {children}
      <ArrowUpRightIcon strokeWidth={1.5} size={14} aria-hidden className="shrink-0" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
