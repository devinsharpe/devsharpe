import { createFileRoute } from "@tanstack/react-router";
import Main from "~/components/_ui/main";
import CameraListItem from "~/components/camera-list-item";
import {
  listCameras,
  listDailySoftware,
  listHardware,
} from "~/server/functions/gear.functions";
import HardwareListItem from "~/components/hardware-list-item";
import SoftwareListItem from "~/components/software-list-item";

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
        {hardware.length > 0 ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {hardware.map((item) => (
              <HardwareListItem key={item.id} item={item} />
            ))}
          </dl>
        ) : (
          <p className="italic opacity-80">No hardware listed yet</p>
        )}
      </section>
      <hr className="-mx-2" />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Daily Software</h2>
        {software.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {software.map((item) => (
              <SoftwareListItem key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">No software listed yet</p>
        )}
      </section>
      <hr className="-mx-2" />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Photography</h2>
        <h3 className="text-lg font-semibold">Cameras</h3>
        {cameras.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cameras.map((item) => (
              <CameraListItem key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">No cameras listed yet</p>
        )}
      </section>
    </Main>
  );
}
