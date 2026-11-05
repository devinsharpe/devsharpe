import { ComponentProps } from "react";
import { cn } from "~/lib/utils";

export default function Divider({ className, ...props }: ComponentProps<"hr">) {
  return <hr className={cn("-mx-2", className)} {...props} />;
}
