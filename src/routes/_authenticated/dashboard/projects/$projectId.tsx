import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRightIcon } from "lucide-react";
import { useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import { PublishingEditor } from "~/components/rich-text/publishing-editor";
import {
  getProjectPageEditor,
  publishProjectPage,
  saveProjectPageDraft,
  unpublishProjectPage,
} from "~/server/functions/projects.functions";

export const Route = createFileRoute(
  "/_authenticated/dashboard/projects/$projectId",
)({
  component: RouteComponent,
  loader: ({ params }) =>
    getProjectPageEditor({ data: { id: params.projectId } }),
});

function RouteComponent() {
  const data = Route.useLoaderData();
  // Keyed so moving between projects starts a fresh editor.
  return <ProjectPageEditor key={data.project.id} {...data} />;
}

type EditorData = Awaited<ReturnType<typeof getProjectPageEditor>>;

function ProjectPageEditor({ project, content, status: loaded_status }: EditorData) {
  const save_draft = useServerFn(saveProjectPageDraft);
  const publish = useServerFn(publishProjectPage);
  const unpublish = useServerFn(unpublishProjectPage);
  const [status, set_status] = useState(loaded_status);

  return (
    <Main>
      <BreadcrumbNav current_page_label={project.name}>
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem to="/dashboard/projects">Projects</BreadcrumbItem>
      </BreadcrumbNav>
      <PublishingEditor
        title={project.name}
        noun="page"
        initial_content={content}
        status={status}
        on_status_change={set_status}
        save_draft={(content) =>
          save_draft({ data: { id: project.id, content } })
        }
        publish={(content) => publish({ data: { id: project.id, content } })}
        unpublish={() => unpublish({ data: { id: project.id } })}
        unpublish_confirmation={{
          title: `Unpublish the page for ${project.name}?`,
          description:
            "Your draft is kept, so you can publish it again later.",
        }}
        actions={
          status.isPublished && (
            <Link
              to="/projects/$slug"
              params={{ slug: project.id }}
              target="_blank"
            >
              View page
              <ArrowUpRightIcon strokeWidth={1.5} size={16} aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          )
        }
        editor_label={`Page content for ${project.name}`}
        placeholder="Write about this project…"
      />
    </Main>
  );
}
