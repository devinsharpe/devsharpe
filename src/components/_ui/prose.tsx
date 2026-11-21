import { cn } from "~/lib/utils";
import type { ComponentProps } from "react";

export default function Prose({
  className,
  children,
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      className={cn("prose prose-neutral prose-invert max-w-none", className)}
      {...props}
    >
      {children}
    </section>
  );
}
