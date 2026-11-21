import { SiGithub } from "@icons-pack/react-simple-icons";
import { createFileRoute } from "@tanstack/react-router";
import { LinkIcon } from "lucide-react";
import Divider from "~/components/_ui/divider";
import { ExternalLink } from "~/components/_ui/external-link";
import Main from "~/components/_ui/main";
import { PublishedDate } from "~/components/_ui/published-date";
import { RICH_TEXT_PROSE } from "~/components/rich-text/rich-text-classes";
import { RichTextRenderer } from "~/components/rich-text/rich-text-renderer";
import { hasRichTextContent } from "~/lib/rich-text";
import { pageMeta } from "~/lib/share";
import { getPublishedProjectPage } from "~/server/functions/projects.functions";

export const Route = createFileRoute("/projects/$slug")({
  staticData: { breadcrumb: Breadcrumb },
  component: RouteComponent,
  loader: ({ params }) =>
    getPublishedProjectPage({ data: { slug: params.slug } }),
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: pageMeta({
            title: loaderData.project.name,
            description: loaderData.project.description,
          }),
        }
      : {},
});

// Annotated: its type can't be inferred from Route, whose options include it.
function Breadcrumb(): string {
  return Route.useLoaderData().project.name;
}

function RouteComponent() {
  const { project, content, media, publishedAt } = Route.useLoaderData();
  const end_date = project.isActive ? "Current" : (project.endDate ?? "");

  return (
    <Main>
      <header className="flex flex-col gap-3">
        <p className="text-sm opacity-80">
          {project.startDate} – {end_date}
        </p>
        <h1 className="text-3xl font-semibold">{project.name}</h1>
        {project.description && (
          <p className="text-lg max-w-3xl">{project.description}</p>
        )}
        {(project.appLink || project.githubLink) && (
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {project.appLink && (
              <li className="flex items-center gap-2">
                <LinkIcon strokeWidth={1.5} size={16} aria-hidden />
                <ExternalLink href={project.appLink}>Visit the app</ExternalLink>
              </li>
            )}
            {project.githubLink && (
              <li className="flex items-center gap-2">
                <SiGithub size={16} aria-hidden />
                <ExternalLink href={project.githubLink}>
                  Source on GitHub
                </ExternalLink>
              </li>
            )}
          </ul>
        )}
        {project.badges.length > 0 && (
          <ul aria-label="Built with" className="flex flex-wrap gap-2 text-sm">
            {project.badges.map((badge) => (
              <li
                key={badge}
                className="border border-neutral-300 dark:border-neutral-700 px-2"
              >
                {badge}
              </li>
            ))}
          </ul>
        )}
      </header>
      <Divider />
      {content && hasRichTextContent(content) ? (
        <article className="flex flex-col gap-6">
          <RichTextRenderer
            document={content}
            media={media}
            className={RICH_TEXT_PROSE}
          />
          {publishedAt && (
            <p className="text-sm opacity-80">
              Published <PublishedDate date={publishedAt} />
            </p>
          )}
        </article>
      ) : (
        <p className="italic opacity-80">
          A write-up for this project is coming soon.
        </p>
      )}
    </Main>
  );
}
