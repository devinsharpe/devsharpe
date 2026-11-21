import { ConstructionIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface ComingSoonProps {
  /** One line on what will be here. */
  children: ReactNode;
  className?: string;
}

/** Marks a part of the admin that isn't built yet. */
export function ComingSoon({ children, className }: ComingSoonProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 border border-dashed border-neutral-400 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-950 p-3 text-sm",
        className,
      )}
    >
      <ConstructionIcon
        strokeWidth={1.5}
        size={16}
        aria-hidden
        className="shrink-0 mt-0.5"
      />
      <div className="flex flex-col gap-0.5">
        <p className="font-medium">Coming soon</p>
        <p className="opacity-80">{children}</p>
      </div>
    </div>
  );
}
