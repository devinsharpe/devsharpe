import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Grid2X2PlusIcon, PlusIcon, ServerPlusIcon } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Button from "~/components/_ui/button";
import Dialog from "~/components/_ui/dialog";
import Divider from "~/components/_ui/divider";
import Main from "~/components/_ui/main";
import { SortableList } from "~/components/_ui/sortable-list";
import { useToast } from "~/components/_ui/toast";
import { CameraFormItem } from "~/components/form-items/camera-form-item";
import { HardwareFormItem } from "~/components/form-items/hardware-form-item";
import { SoftwareFormItem } from "~/components/form-items/software-form-item";
import { CameraForm } from "~/components/forms/camera-form";
import { HardwareItemForm } from "~/components/forms/hardware-item-form";
import { SoftwareItemForm } from "~/components/forms/software-item-form";
import type { GearKind } from "~/lib/gear";
import type {
  CameraItem,
  HardwareItem,
  SoftwareItem,
} from "~/server/database/schema.server";
import {
  listCameraItems,
  listHardwareItems,
  listSoftwareItems,
  reorderGear,
} from "~/server/functions/gear.functions";

/** The admin view should show everything, not one public-sized page. */
const ADMIN_LIST = { data: { page: 1, size: 100 } };

export const Route = createFileRoute("/_authenticated/edit/gear")({
  component: RouteComponent,
  loader: async () => {
    const [hardware_items, software_items, camera_items] = await Promise.all([
      listHardwareItems(ADMIN_LIST),
      listSoftwareItems(ADMIN_LIST),
      listCameraItems(ADMIN_LIST),
    ]);
    return { hardware_items, software_items, camera_items };
  },
});

type DialogState =
  | { kind: "hardware"; item?: HardwareItem }
  | { kind: "software"; item?: SoftwareItem }
  | { kind: "camera"; item?: CameraItem };

const DIALOG_NOUN: Record<DialogState["kind"], string> = {
  hardware: "Hardware Item",
  software: "Software Item",
  camera: "Camera",
};

function RouteComponent() {
  const { hardware_items, software_items, camera_items } =
    Route.useLoaderData();
  const router = useRouter();
  const reorder = useServerFn(reorderGear);
  const toast = useToast();
  const [dialog, set_dialog] = useState<DialogState | null>(null);

  const close_dialog = () => set_dialog(null);
  const handle_saved = async () => {
    close_dialog();
    await router.invalidate();
  };

  const persist_order =
    (kind: GearKind) => async (items: Array<{ id: string }>) => {
      try {
        await reorder({ data: { kind, ids: items.map((item) => item.id) } });
      } catch (error) {
        toast.danger({
          title: "Couldn't save the new order",
          description: error instanceof Error ? error.message : undefined,
        });
      } finally {
        // Re-sync with the database either way (reverts the list on failure).
        await router.invalidate();
      }
    };

  return (
    <Main>
      <BreadcrumbNav current_page_label="Gear">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
      </BreadcrumbNav>
      <section className="flex flex-col gap-4">
        <div className="flex gap-8">
          <h2 className="text-2xl font-semibold">Hardware</h2>
          <Button
            size="icon"
            aria-label="New hardware item"
            onClick={() => set_dialog({ kind: "hardware" })}
          >
            <ServerPlusIcon strokeWidth={1.5} size={16} />
          </Button>
        </div>
        <SortableList
          items={hardware_items}
          item_label={(item) => item.name}
          on_reorder={persist_order("hardware")}
          render_item={(item, drag_handle) => (
            <HardwareFormItem
              item={item}
              drag_handle={drag_handle}
              on_edit_click={(item) => set_dialog({ kind: "hardware", item })}
            />
          )}
        />
        {hardware_items.length === 0 && (
          <p className="italic opacity-80">No hardware items to show</p>
        )}
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <div className="flex gap-8">
          <h2 className="text-2xl font-semibold">Software</h2>
          <Button
            size="icon"
            aria-label="New software item"
            onClick={() => set_dialog({ kind: "software" })}
          >
            <Grid2X2PlusIcon strokeWidth={1.5} size={16} />
          </Button>
        </div>
        <SortableList
          items={software_items}
          item_label={(item) => item.name}
          on_reorder={persist_order("software")}
          render_item={(item, drag_handle) => (
            <SoftwareFormItem
              item={item}
              drag_handle={drag_handle}
              on_edit_click={(item) => set_dialog({ kind: "software", item })}
            />
          )}
        />
        {software_items.length === 0 && (
          <p className="italic opacity-80">No software items to show</p>
        )}
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <div className="flex gap-8">
          <h2 className="text-2xl font-semibold">Cameras</h2>
          <Button
            size="icon"
            aria-label="New camera"
            onClick={() => set_dialog({ kind: "camera" })}
          >
            <PlusIcon strokeWidth={1.5} size={16} />
          </Button>
        </div>
        <SortableList
          items={camera_items}
          item_label={(item) => item.name}
          on_reorder={persist_order("camera")}
          render_item={(item, drag_handle) => (
            <CameraFormItem
              item={item}
              drag_handle={drag_handle}
              on_edit_click={(item) => set_dialog({ kind: "camera", item })}
            />
          )}
        />
        {camera_items.length === 0 && (
          <p className="italic opacity-80">No cameras to show</p>
        )}
      </section>
      <Dialog.Root
        open={dialog !== null}
        onOpenChange={(open) => !open && close_dialog()}
      >
        <Dialog.Content className="max-w-2xl gap-2">
          {dialog && (
            <>
              <div className="-mx-2 px-2 pb-2 border-b">
                <h2 className="text-2xl font-bold">
                  {dialog.item ? "Edit" : "New"} {DIALOG_NOUN[dialog.kind]}
                </h2>
              </div>
              {/* Keyed so each open starts from a fresh form state. */}
              <GearDialogForm
                key={`${dialog.kind}:${dialog.item?.id ?? "new"}`}
                dialog={dialog}
                on_cancel={close_dialog}
                on_saved={handle_saved}
              />
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Main>
  );
}

interface GearDialogFormProps {
  dialog: DialogState;
  on_cancel: () => void;
  on_saved: () => Promise<void>;
}

function GearDialogForm({ dialog, ...props }: GearDialogFormProps) {
  switch (dialog.kind) {
    case "hardware":
      return <HardwareItemForm item={dialog.item} {...props} />;
    case "software":
      return <SoftwareItemForm item={dialog.item} {...props} />;
    case "camera":
      return <CameraForm item={dialog.item} {...props} />;
  }
}
