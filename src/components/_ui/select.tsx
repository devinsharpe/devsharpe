import { ChevronDownIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import { SINGLE_LINE_CONTROL_HEIGHT } from "./input-field";

interface SelectProps extends ComponentProps<"select"> {
  /** Classes for the wrapper (e.g. width or margins); `className` styles the <select>. */
  wrapper_className?: string;
}

/**
 * Native <select> with its own chevron. The browser's arrow is hidden
 * (appearance-none) because browsers place it differently and padding doesn't
 * move it everywhere; this one always sits 8px from the right edge.
 */
export function Select({
  className,
  wrapper_className,
  children,
  ...props
}: SelectProps) {
  return (
    <div className={cn("relative", wrapper_className)}>
      <select
        {...props}
        className={cn(
          // pr-8 keeps option text clear of the 16px chevron and its 8px inset.
          "peer w-full appearance-none border outline-offset-2 pl-2 pr-8 py-1",
          SINGLE_LINE_CONTROL_HEIGHT,
          "bg-neutral-50 dark:bg-neutral-950",
          "focus:outline-neutral-900 dark:focus:outline-white focus:outline-1",
          "disabled:opacity-60",
          className,
        )}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden
        strokeWidth={1.5}
        size={16}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 peer-disabled:opacity-60"
      />
    </div>
  );
}
