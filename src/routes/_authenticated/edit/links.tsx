import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLinkIcon, LinkIcon } from "lucide-react";
import { useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Button from "~/components/_ui/button";
import Dialog from "~/components/_ui/dialog";
import Divider from "~/components/_ui/divider";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import { SortableList } from "~/components/_ui/sortable-list";
import { useToast } from "~/components/_ui/toast";
import { LinkFormItem } from "~/components/form-items/link-form-item";
import { type EditableLink, LinkForm } from "~/components/forms/link-form";
import { LinksProfileForm } from "~/components/forms/links-profile-form";
import { clickCount, LINKS_MAX } from "~/lib/links";
import {
  getLinksEditor,
  reorderLinks,
  setLinkVisibility,
} from "~/server/functions/links.functions";

export const Route = createFileRoute("/_authenticated/edit/links")({
  loader: () => getLinksEditor(),
  head: () => ({ meta: [{ title: "Edit Links" }] }),
  component: RouteComponent,
});

/** The link being edited, or `{}` for a new one. */
type DialogState = { item?: EditableLink };

function RouteComponent() {
  const { title, profile, links, total_clicks, setup } = Route.useLoaderData();
  const router = useRouter();
  const reorder = useServerFn(reorderLinks);
  const set_visibility = useServerFn(setLinkVisibility);
  const toast = useToast();
  const [dialog, set_dialog] = useState<DialogState | null>(null);
  const [saving_visibility, set_saving_visibility] = useState<string | null>(null);
  const is_full = links.length >= LINKS_MAX;

  const close_dialog = () => set_dialog(null);
  const handle_saved = async () => {
    close_dialog();
    await router.invalidate();
  };

  const persist_order = async (items: Array<{ id: string }>) => {
    try {
      await reorder({ data: { ids: items.map((item) => item.id) } });
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

  const toggle_visibility = async (item: EditableLink) => {
    set_saving_visibility(item.id);
    try {
      await set_visibility({ data: { id: item.id, isVisible: !item.isVisible } });
      toast.success({
        title: item.isVisible
          ? `Hid ${item.title} from the page`
          : `Showing ${item.title} on the page`,
      });
      await router.invalidate();
    } catch (error) {
      toast.danger({
        title: `Couldn't ${item.isVisible ? "hide" : "show"} ${item.title}`,
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      set_saving_visibility(null);
    }
  };

  return (
    <Main>
      <BreadcrumbNav current_page_label="Links">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
      </BreadcrumbNav>
      {setup.missing_imgproxy.length > 0 && (
        <p className="border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/40 p-3 text-sm">
          The photo can't be shown until imgproxy is configured (
          {setup.missing_imgproxy.join(", ")}).
        </p>
      )}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold">Profile</h2>
          <Link to="/links" target="_blank" rel="noreferrer">
            <ExternalLinkIcon strokeWidth={1.5} size={16} />
            <span>View page</span>
          </Link>
        </div>
        <LinksProfileForm title={title} profile={profile} />
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <h2 className="text-2xl font-semibold">Links</h2>
          <Button
            size="icon"
            aria-label="New link"
            disabled={is_full}
            onClick={() => set_dialog({})}
          >
            <LinkIcon strokeWidth={1.5} size={16} />
          </Button>
          {links.length > 0 && (
            <p className="text-sm opacity-80">
              {clickCount(total_clicks)} in all · visits while signed in
              aren't counted
            </p>
          )}
        </div>
        {is_full && (
          <p className="text-sm opacity-80">
            The page holds up to {LINKS_MAX} links. Delete one to add another.
          </p>
        )}
        <SortableList
          items={links}
          item_label={(item) => item.title}
          on_reorder={persist_order}
          render_item={(item, drag_handle) => (
            <LinkFormItem
              item={item}
              drag_handle={drag_handle}
              on_edit_click={(item) => set_dialog({ item })}
              on_visibility_click={toggle_visibility}
              is_saving_visibility={saving_visibility === item.id}
            />
          )}
        />
        {links.length === 0 && (
          <p className="italic opacity-80">No links yet</p>
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
                  {dialog.item ? "Edit Link" : "New Link"}
                </h2>
              </div>
              {/* Keyed so each open starts from a fresh form state. */}
              <LinkForm
                key={dialog.item?.id ?? "new"}
                item={dialog.item}
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
