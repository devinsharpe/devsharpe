import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FolderPlusIcon, ImageIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Button from "~/components/_ui/button";
import Dialog from "~/components/_ui/dialog";
import Divider from "~/components/_ui/divider";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import { CollectionForm } from "~/components/forms/collection-form";
import {
  type CollectionAdminSummary,
  CollectionSummaryItem,
} from "~/components/photography/collection-summary-item";
import { listCollectionsAdmin } from "~/server/functions/photography.functions";

export const Route = createFileRoute("/_authenticated/dashboard/collections/")({
  component: RouteComponent,
  loader: async () => ({ collections: await listCollectionsAdmin() }),
});

function RouteComponent() {
  const { collections } = Route.useLoaderData();
  const navigate = useNavigate();
  const [is_creating, set_is_creating] = useState(false);

  const { drafts, published } = useMemo(
    () => ({
      drafts: collections.filter(({ isPublished }) => !isPublished),
      published: collections.filter(({ isPublished }) => isPublished),
    }),
    [collections],
  );

  const render_list = (items: CollectionAdminSummary[], empty: string) =>
    items.length > 0 ? (
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <CollectionSummaryItem key={item.id} item={item} />
        ))}
      </ul>
    ) : (
      <p className="italic opacity-80">{empty}</p>
    );

  return (
    <Main>
      <BreadcrumbNav current_page_label="Photo Collections">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
      </BreadcrumbNav>
      <nav className="flex flex-wrap gap-2 -mx-2">
        <Link to="/dashboard/collections/photos">
          <ImageIcon strokeWidth={1.5} size={16} />
          <span>All Photographs</span>
        </Link>
      </nav>
      <section className="flex flex-col gap-4">
        <div className="flex gap-8">
          <h2 className="text-2xl font-semibold">Drafts</h2>
          <Button
            size="icon"
            aria-label="New collection"
            title="New collection"
            onClick={() => set_is_creating(true)}
          >
            <FolderPlusIcon strokeWidth={1.5} size={16} />
          </Button>
        </div>
        {render_list(
          drafts,
          "No drafts. Start a new collection with the + button.",
        )}
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Published</h2>
        {render_list(published, "Nothing published yet")}
      </section>
      <Dialog.Root
        open={is_creating}
        onOpenChange={(open) => !open && set_is_creating(false)}
      >
        <Dialog.Content className="max-w-2xl gap-2">
          {is_creating && (
            <>
              <div className="-mx-2 px-2 pb-2 border-b">
                <h2 className="text-2xl font-bold">New Collection</h2>
                <p className="text-sm opacity-80">
                  It starts as a private draft; you'll add its photos next.
                </p>
              </div>
              <CollectionForm
                on_cancel={() => set_is_creating(false)}
                on_saved={async (collection) => {
                  set_is_creating(false);
                  // An empty collection needs photos, so go straight to it.
                  await navigate({
                    to: "/dashboard/collections/$collectionId",
                    params: { collectionId: collection.id },
                  });
                }}
              />
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Main>
  );
}
