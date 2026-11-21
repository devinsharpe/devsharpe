import { cn } from "~/lib/utils";
import type { ComponentProps } from "react";

interface MainProps extends ComponentProps<"div"> {}

export default function Main({ children, className, ...props }: MainProps) {
  return (
    <main
      className={cn(
        "container mx-auto flex h-full w-full max-w-4xl grow flex-col justify-start gap-8 px-6 pt-6 pb-4",
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
