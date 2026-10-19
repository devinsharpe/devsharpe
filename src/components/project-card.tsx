import { ComponentProps, useMemo } from "react";
import { cn } from "~/lib/utils";
import { Project } from "~/types/projects.types";
import Link from "./_ui/link";
import { LinkIcon } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Link as TanstackLink } from "@tanstack/react-router";

type ProjectCardProps = Project & ComponentProps<"li">;

export default function ProjectCard({
  slug,
  name,
  description,
  links,
  badges,
  dates,
  is_active,
  ...props
}: ProjectCardProps) {
  return (
    <li {...props} className={cn("flex flex-col gap-2", props.className)}>
      <div className="flex items-center gap-2 w-full">
        <h2 className="grow text-lg">
          <TanstackLink to={`/projects/$slug`} params={{ slug }}>{name}</TanstackLink>
        </h2>
        {links.length > 0 && (
          <div className="flex gap-2">
            {links.map((l) => (
              <Link
                href={l.link}
                target="_blank"
                rel="noreferrer"
                key={`${slug}}-${l.type}`}
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
      <p className="max-w-3xl">{description}</p>
      <div className="flex justify-between">
        <p className="text-sm text-white/80">
          {dates.start} - {is_active ? "Current" : (dates.end ?? "")}
        </p>
        <Link to={`/projects/$slug`} params={{ slug }}>
          View Project Details
        </Link>
      </div>
    </li>
  );
}
