import { ComponentProps, useMemo } from "react";
import { cn } from "~/lib/utils";
import type { ProjectItem } from "~/server/database/schema.server";
import Link from "./_ui/link";
import { LinkIcon } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Link as TanstackLink } from "@tanstack/react-router";

type ProjectCardProps = ProjectItem &
  ComponentProps<"li"> & {
    /** Whether /projects/{slug} has a published write-up to link to. */
    hasPublishedPage: boolean;
  };

export default function ProjectCard({
  id: slug,
  name,
  description,
  appLink,
  githubLink,
  badges,
  startDate,
  endDate,
  isActive,
  hasPublishedPage,
  // Not rendered; pulled out so they aren't spread onto the <li> as attributes.
  sortOrder: _sortOrder,
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  ...props
}: ProjectCardProps) {
  const links = useMemo(
    () => [
      ...(appLink ? [{ type: "app" as const, link: appLink }] : []),
      ...(githubLink ? [{ type: "github" as const, link: githubLink }] : []),
    ],
    [appLink, githubLink],
  );

  return (
    <li {...props} className={cn("flex flex-col gap-2", props.className)}>
      <div className="flex items-center gap-2 w-full">
        <h2 className="grow text-lg">
          {hasPublishedPage ? (
            <TanstackLink to={`/projects/$slug`} params={{ slug }}>{name}</TanstackLink>
          ) : (
            name
          )}
        </h2>
        {links.length > 0 && (
          <div className="flex gap-2">
            {links.map((l) => (
              <Link
                href={l.link}
                target="_blank"
                rel="noreferrer"
                key={l.type}
              >
                {l.type === "app" && <LinkIcon strokeWidth={1.5} size={16} />}
                {l.type === "github" && (
                  <SiGithub strokeWidth={1.5} size={16} />
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
      {description && <p className="max-w-3xl">{description}</p>}
      <div className="flex justify-between">
        <p className="text-sm opacity-80">
          {startDate} - {isActive ? "Current" : (endDate ?? "")}
        </p>
        {hasPublishedPage && (
          <Link to={`/projects/$slug`} params={{ slug }}>
            View Project Details
          </Link>
        )}
      </div>
    </li>
  );
}
