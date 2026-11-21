import { SiMarkdown } from "@icons-pack/react-simple-icons";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDownIcon, FileDownIcon, FileTextIcon } from "lucide-react";
import { useMemo } from "react";
import Dropdown from "~/components/_ui/dropdown";
import Main from "~/components/_ui/main";
import PositionListItem from "~/components/position-list-item";
import { listPositions } from "~/server/functions/about.functions";
import { getResumeAvailability } from "~/server/functions/resume.functions";

export const Route = createFileRoute("/employment")({
  staticData: { breadcrumb: "Employment" },
  component: RouteComponent,
  loader: async () => {
    const [positions, resume] = await Promise.all([
      listPositions(),
      getResumeAvailability(),
    ]);
    return { positions, resume };
  },
});

function RouteComponent() {
  const { positions, resume } = Route.useLoaderData();

  const { employmentPositions, volunteerPositions } = useMemo(
    () => ({
      employmentPositions: positions.filter(
        ({ type }) => type === "employment",
      ),
      volunteerPositions: positions.filter(({ type }) => type === "volunteer"),
    }),
    [positions],
  );

  return (
    <Main>
      <section className="flex flex-col gap-4">
        <Dropdown.Root>
          <Dropdown.Trigger>
            <FileDownIcon strokeWidth={1.5} size={16} />
            <span>Download my résumé here</span>
            <ChevronDownIcon strokeWidth={1.5} size={16} />
          </Dropdown.Trigger>
          <Dropdown.Content className="p-3 gap-2! mt-2">
            {/* Plain links: both are files served by the server, not pages. */}
            {resume.has_pdf && (
              <Dropdown.Item as="link" href="/resume.pdf" download>
                <FileTextIcon strokeWidth={1.5} size={16} />
                <span>Download PDF</span>
              </Dropdown.Item>
            )}
            {/* Always there: it's written from the history on this page. */}
            <Dropdown.Item as="link" href="/resume.md" download>
              <SiMarkdown strokeWidth={1.5} size={16} />
              <span>Download Markdown</span>
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Root>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Employment History</h2>
        <ul className="flex flex-col gap-8">
          {employmentPositions.map((position) => (
            <PositionListItem key={position.id} {...position} />
          ))}
        </ul>
      </section>
      <hr className="-mx-2" />
      {/* Linked from the homepage; scroll-mt clears the sticky header. */}
      <section id="volunteer-history" className="flex flex-col gap-4 scroll-mt-20">
        <h2 className="text-2xl font-semibold">Volunteer History</h2>
        <ul className="flex flex-col gap-8">
          {volunteerPositions.map((position) => (
            <PositionListItem key={position.id} {...position} />
          ))}
        </ul>
      </section>
    </Main>
  );
}
