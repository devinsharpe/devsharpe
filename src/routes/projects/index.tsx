import { createFileRoute } from "@tanstack/react-router";
import Main from "~/components/_ui/main";
import ProjectCard from "~/components/project-card";
import { listProjects } from "~/functions/projects.functions";

export const Route = createFileRoute("/projects/")({
  component: RouteComponent,
  loader: () => listProjects(),
});

function RouteComponent() {
  const data = Route.useLoaderData();
  return (
    <Main>
      <section>
        <h2 className="text-2xl font-semibold">Active Projects</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {data.filter((project) => project.is_active).map((project) => (
            <ProjectCard {...project} />
          ))}
        </ul>
      </section>
      <hr className="-mx-2" />
      <section>
        <h2 className="text-2xl font-semibold">Retired Projects</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {data.filter((project) => !project.is_active).map((project) => (
            <ProjectCard {...project} />
          ))}
        </ul>
      </section>
    </Main>
  );
}
