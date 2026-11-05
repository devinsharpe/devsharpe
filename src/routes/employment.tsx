import { SiMarkdown } from "@icons-pack/react-simple-icons";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDownIcon, FileDownIcon, FileTextIcon } from "lucide-react";
import { useMemo } from "react";
import Dropdown from "~/components/_ui/dropdown";
import Main from "~/components/_ui/main";
import PositionListItem from "~/components/position-list-item";
import { listPositions } from "~/server/functions/about.functions";

export const Route = createFileRoute("/employment")({
  component: RouteComponent,
  loader: async () => ({
    positions: await listPositions(),
  }),
});

function RouteComponent() {
  const { positions } = Route.useLoaderData();

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
            <Dropdown.Item as="button">
              <FileTextIcon strokeWidth={1.5} size={16} />
              <span>Download PDF</span>
            </Dropdown.Item>
            <Dropdown.Item as="button">
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
      <section className="flex flex-col gap-4">
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
