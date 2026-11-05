import { createFileRoute } from "@tanstack/react-router";
import {
  Grid2X2PlusIcon,
  PlusCircleIcon,
  PlusIcon,
  PlusSquareIcon,
  ServerPlusIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Button from "~/components/_ui/button";
import Dialog from "~/components/_ui/dialog";
import Divider from "~/components/_ui/divider";
import Main from "~/components/_ui/main";
import { HardwareFormItem } from "~/components/form-items/hardware-form-item";
import { SoftwareFormItem } from "~/components/form-items/software-form-item";
import { HardwareItemForm } from "~/components/forms/hardware-item-form";
import {
  listDailySoftware,
  listHardwareItems,
} from "~/server/functions/gear.functions";

export const Route = createFileRoute("/_authenticated/edit/gear")({
  component: RouteComponent,
  loader: async () => {
    return {
      hardware_items: await listHardwareItems(),
      software_items: await listDailySoftware(),
    };
  },
});

function RouteComponent() {
  const { hardware_items, software_items } = Route.useLoaderData();
  const [is_dialog_open, set_is_dialog_open] = useState(false);

  return (
    <Main>
      <BreadcrumbNav current_page_label="Gear">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
      </BreadcrumbNav>
      <section className="flex flex-col gap-4">
        <div className="flex gap-8">
          <h2 className="text-2xl font-semibold">Hardware</h2>
          <Button size="icon" onClick={() => set_is_dialog_open(true)}>
            <ServerPlusIcon strokeWidth={1.5} size={16} />
          </Button>
        </div>
        {hardware_items.map((hardware_item) => (
          <HardwareFormItem
            item={hardware_item}
            key={hardware_item.id}
            on_edit_click={console.log}
          />
        ))}
        {hardware_items.length === 0 && (
          <p className="italic opacity-80">No hardware items to show</p>
        )}
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <div className="flex gap-8">
          <h2 className="text-2xl font-semibold">Software</h2>
          <Button size="icon">
            <Grid2X2PlusIcon strokeWidth={1.5} size={16} />
          </Button>
        </div>
        {software_items.map((software_item) => (
          <SoftwareFormItem
            item={software_item}
            key={software_item.id}
            on_edit_click={console.log}
          />
        ))}
        {software_items.length === 0 && (
          <>
            <p className="italic opacity-80">No software items to show</p>
          </>
        )}
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <div className="flex gap-8">
          <h2 className="text-2xl font-semibold">Cameras</h2>
          <Button size="icon">
            <PlusIcon strokeWidth={1.5} size={16} />
          </Button>
        </div>
        {hardware_items.length === 0 && (
          <p className="italic opacity-80">No cameras to show</p>
        )}
      </section>
      <Dialog.Root open={is_dialog_open} onOpenChange={set_is_dialog_open}>
        <Dialog.Content className="max-w-2xl gap-2">
          <div className="-mx-2 px-2 pb-2 border-b">
            <h2 className="text-2xl font-bold">New Hardware Item</h2>
          </div>
          <section className="flex flex-col gap-2">
            <HardwareItemForm />
          </section>
          <div className="-mx-2 px-2 pt-2 border-t flex items-center justify-end gap-2">
            <Dialog.Action command="close">
              <XIcon strokeWidth={1.5} size={16} />
              <span>Cancel</span>
            </Dialog.Action>
            <Button>
              <span>Create Item</span>
              <ServerPlusIcon strokeWidth={1.5} size={16} />
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </Main>
  );
}
