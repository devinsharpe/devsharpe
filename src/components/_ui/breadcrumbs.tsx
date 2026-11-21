// The page's breadcrumbs, built from the routes it matched: each route with a
// `staticData.breadcrumb` adds a crumb that links to its path (see
// StaticDataRouteOption in src/router.tsx). Main renders this at the top of
// every page, and it renders nothing until there's a crumb past the root's
// "Home". The admin pages set no crumbs and use BreadcrumbNav instead.
import { useLocation, useMatches } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import type { ComponentType } from "react";
import { buttonVariants } from "./button";
import Link, { type LinkProps } from "./link";
import { withoutTrailingSlash } from "~/lib/share";
import { cn } from "~/lib/utils";

/** Lets a long crumb (e.g. a post title) shorten instead of widening the page. */
const CRUMB = "min-w-0 max-w-full shrink";

function Label({ label: CustomLabel }: { label: string | ComponentType }) {
  return (
    <span className="truncate">
      {typeof CustomLabel === "string" ? CustomLabel : <CustomLabel />}
    </span>
  );
}

export default function Breadcrumbs() {
  const crumbs = useMatches({
    select: (matches) =>
      matches.flatMap((match) =>
        // A route whose loader failed has no data for its label to read.
        match.staticData.breadcrumb && match.status === "success"
          ? [
              {
                id: match.id,
                path: withoutTrailingSlash(match.pathname),
                label: match.staticData.breadcrumb,
              },
            ]
          : [],
      ),
  });
  const location = useLocation({
    select: (location) => ({
      path: withoutTrailingSlash(location.pathname),
      has_search: location.searchStr !== "",
    }),
  });

  if (crumbs.length < 2) return null;

  return (
    <nav aria-label="Breadcrumbs" className="-ml-2">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {crumbs.map((crumb, index) => {
          // The crumb for exactly this page isn't a link. With a search
          // (e.g. /posts?tag=…), the section's crumb links to the whole of it.
          const is_current =
            crumb.path === location.path && !location.has_search;
          return (
            <li
              key={crumb.id}
              className="flex min-w-0 max-w-full items-center gap-2"
            >
              {is_current ? (
                <span
                  aria-current="page"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    CRUMB,
                    "pointer-events-none opacity-80",
                  )}
                >
                  <Label label={crumb.label} />
                </span>
              ) : (
                // A matched route's own path, so always a real page; the
                // router's types only know its pattern (/posts/$slug).
                <Link
                  to={crumb.path as LinkProps["to"]}
                  size="sm"
                  className={CRUMB}
                >
                  <Label label={crumb.label} />
                </Link>
              )}
              {index < crumbs.length - 1 && (
                <ChevronRightIcon
                  aria-hidden
                  strokeWidth={1.5}
                  size={16}
                  className="shrink-0"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
