import { ChevronRightIcon } from "lucide-react";
import Link, { LinkProps } from "./link";
import { LinkComponentProps, useLocation } from "@tanstack/react-router";
import { ComponentProps } from "react";
import { cn } from "~/lib/utils";

function BreadcrumbItem({ children, ...props }: LinkProps) {
  return (
    <>
      <Link size="sm" {...props}>
        {children}
      </Link>
      <ChevronRightIcon strokeWidth={1.5} size={16} />
    </>
  );
}

interface BreadcrumbNavItemProps extends ComponentProps<"div"> {
  current_page_label: string;
}

function BreadcrumbNav({
  children,
  className,
  current_page_label,
  ...props
}: BreadcrumbNavItemProps) {
  const location = useLocation();

  return (
    <nav className={cn("flex items-center gap-2 -ml-2", className)} {...props}>
      {children}
      <Link size="sm" href={location.href} disabled>
        {current_page_label}
      </Link>
    </nav>
  );
}

export { BreadcrumbItem, BreadcrumbNav };
