import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BriefcaseBusinessIcon,
  HandHeartIcon,
  PencilLineIcon,
} from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Button from "~/components/_ui/button";
import Dialog from "~/components/_ui/dialog";
import Divider from "~/components/_ui/divider";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import { SortableList } from "~/components/_ui/sortable-list";
import { useToast } from "~/components/_ui/toast";
import { BiographyPreview } from "~/components/biography-preview";
import { PositionFormItem } from "~/components/form-items/position-form-item";
import { PositionForm } from "~/components/forms/position-form";
import { ResumeManager } from "~/components/resume-manager";
import { POSITION_TYPE_LABELS, type PositionType } from "~/lib/about";
import type { PositionItem } from "~/server/database/schema.server";
import {
  getBiography,
  listPositions,
  reorderPositions,
} from "~/server/functions/about.functions";
import { getResumeLibrary } from "~/server/functions/resume.functions";
import { getSubtitleSetting } from "~/server/functions/site.functions";

export const Route = createFileRoute("/_authenticated/edit/biography/")({
  component: RouteComponent,
  loader: async () => {
    const [positions, biography, header, resumes] = await Promise.all([
      listPositions(),
      getBiography(),
      getSubtitleSetting(),
      getResumeLibrary(),
    ]);
    return { positions, biography, header, resumes };
  },
});

interface DialogState {
  type: PositionType;
  item?: PositionItem;
}

function RouteComponent() {
  const { positions, biography, header, resumes } = Route.useLoaderData();
  const router = useRouter();
  const reorder = useServerFn(reorderPositions);
  const toast = useToast();
  const [dialog, set_dialog] = useState<DialogState | null>(null);

  const positions_by_type = useMemo(
    () => ({
      employment: positions.filter(({ type }) => type === "employment"),
      volunteer: positions.filter(({ type }) => type === "volunteer"),
    }),
    [positions],
  );

  const close_dialog = () => set_dialog(null);
  const handle_saved = async () => {
    close_dialog();
    await router.invalidate();
  };

  const persist_order =
    (type: PositionType) => async (items: Array<{ id: string }>) => {
      try {
        await reorder({ data: { type, ids: items.map((item) => item.id) } });
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

  const render_section = (
    type: PositionType,
    heading: string,
    add_icon: ReactNode,
  ) => (
    <section className="flex flex-col gap-4">
      <div className="flex gap-8">
        <h2 className="text-2xl font-semibold">{heading}</h2>
        <Button
          size="icon"
          aria-label={`New ${POSITION_TYPE_LABELS[type].toLowerCase()} position`}
          onClick={() => set_dialog({ type })}
        >
          {add_icon}
        </Button>
      </div>
      <SortableList
        items={positions_by_type[type]}
        item_label={(item) => `${item.title} at ${item.name}`}
        on_reorder={persist_order(type)}
        render_item={(item, drag_handle) => (
          <PositionFormItem
            item={item}
            drag_handle={drag_handle}
            on_edit_click={(item) => set_dialog({ type: item.type, item })}
          />
        )}
      />
      {positions_by_type[type].length === 0 && (
        <p className="italic opacity-80">
          No {POSITION_TYPE_LABELS[type].toLowerCase()} positions to show
        </p>
      )}
    </section>
  );

  return (
    <Main>
      <BreadcrumbNav current_page_label="Biography">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
      </BreadcrumbNav>
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Biography</h2>
          <Link to="/edit/biography/write">
            <PencilLineIcon strokeWidth={1.5} size={16} />
            <span>Edit Biography & Subtitle</span>
          </Link>
        </div>
        <BiographyPreview header={header} biography={biography} />
      </section>
      <Divider />
      <ResumeManager library={resumes} />
      <Divider />
      {render_section(
        "employment",
        "Employment History",
        <BriefcaseBusinessIcon strokeWidth={1.5} size={16} />,
      )}
      <Divider />
      {render_section(
        "volunteer",
        "Volunteer History",
        <HandHeartIcon strokeWidth={1.5} size={16} />,
      )}
      <Dialog.Root
        open={dialog !== null}
        onOpenChange={(open) => !open && close_dialog()}
      >
        <Dialog.Content className="max-w-2xl gap-2">
          {dialog && (
            <>
              <div className="-mx-2 px-2 pb-2 border-b">
                <h2 className="text-2xl font-bold">
                  {dialog.item ? "Edit" : "New"}{" "}
                  {POSITION_TYPE_LABELS[dialog.type]} Position
                </h2>
              </div>
              {/* Keyed so each open starts from a fresh form state. */}
              <PositionForm
                key={`${dialog.type}:${dialog.item?.id ?? "new"}`}
                item={dialog.item}
                default_type={dialog.type}
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
