import { createFileRoute } from "@tanstack/react-router";
import {
  Details,
  DetailsContent,
  DetailsItem,
  DetailsTrigger,
} from "~/components/_ui/details-list";
import Main from "~/components/_ui/main";
import {
  listCameras,
  listDailySoftware,
  listHardware,
} from "~/functions/gear.functions";
import SoftwareListItem from "~/components/software-list-item";
import Link from "~/components/_ui/link";
import { ImageIcon } from "lucide-react";

export const Route = createFileRoute("/uses")({
  component: RouteComponent,
  loader: async () => {
    return {
      cameras: await listCameras(),
      hardware: await listHardware(),
      software: await listDailySoftware(),
    };
  },
});

function RouteComponent() {
  const { cameras, hardware, software } = Route.useLoaderData();

  return (
    <Main>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Hardware</h2>
        <ul className="flex flex-col gap-2">
          {hardware.map((h) => (
            <li key={h.label}>
              <span className="font-semibold">{h.label} &mdash;</span>
              &nbsp;{h.name}
            </li>
          ))}
        </ul>
      </section>
      <hr className="-mx-2" />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Daily Software</h2>
        <ul className="flex flex-col gap-2">
          {software.map((software) => (
            <SoftwareListItem
              key={`${software.tool}-${software.name}`}
              {...software}
            />
          ))}
        </ul>
      </section>
      <hr className="-mx-2" />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Photography</h2>
        <h3 className="text-lg font-semibold">Cameras</h3>
        <Details>
          {cameras.map((camera) => (
            <DetailsItem id={camera.id} key={camera.id}>
              <DetailsTrigger>
                <span>
                  {camera.name}
                  {camera.subtitle && (
                    <span className="opacity-80 font-normal">
                      &nbsp;{camera.subtitle}
                    </span>
                  )}
                </span>
              </DetailsTrigger>
              <DetailsContent>
                <p className="mb-4">{camera.description}</p>
                <Link
                  to="/photography"
                  search={{ camera: camera.id }}
                  className="ml-auto flex"
                >
                  <ImageIcon strokeWidth={1.5} size={16} />
                  <span>View Photos</span>
                </Link>
              </DetailsContent>
            </DetailsItem>
          ))}
        </Details>
      </section>
    </Main>
  );
}
