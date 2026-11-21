import {
  createFileRoute,
  notFound,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRightIcon, PencilLineIcon } from "lucide-react";
import { useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Button from "~/components/_ui/button";
import Dialog from "~/components/_ui/dialog";
import Divider from "~/components/_ui/divider";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import { CollectionForm } from "~/components/forms/collection-form";
import { CollectionPhotos } from "~/components/photography/collection-photos";
import { PublishingEditor } from "~/components/rich-text/publishing-editor";
import { isUuid, photoCount, viewCount } from "~/lib/photography";
import {
  getCollectionEditor,
  publishCollection,
  saveCollectionDraft,
  unpublishCollection,
} from "~/server/functions/photography.functions";

export const Route = createFileRoute(
  "/_authenticated/dashboard/collections/$collectionId",
)({
  component: RouteComponent,
  loader: ({ params }) => {
    if (!isUuid(params.collectionId)) throw notFound();
    return getCollectionEditor({ data: { id: params.collectionId } });
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  // Keyed so moving between collections starts a fresh editor.
  return <CollectionEditor key={data.collection.id} {...data} />;
}

type EditorData = Awaited<ReturnType<typeof getCollectionEditor>>;

function CollectionEditor({
  collection,
  content,
  status: loaded_status,
  photos,
  cover_id,
  cameras,
  setup,
}: EditorData) {
  const router = useRouter();
  const navigate = useNavigate();
  const save_draft = useServerFn(saveCollectionDraft);
  const publish = useServerFn(publishCollection);
  const unpublish = useServerFn(unpublishCollection);
  const [status, set_status] = useState(loaded_status);
  const [is_editing_details, set_is_editing_details] = useState(false);
  const close_details = () => set_is_editing_details(false);

  return (
    <Main>
      <BreadcrumbNav current_page_label={collection.title}>
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem to="/dashboard/collections">
          Photo Collections
        </BreadcrumbItem>
      </BreadcrumbNav>
      {setup.missing_imgproxy.length > 0 && (
        <p className="border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/40 p-3 text-sm">
          Photos can't be shown until imgproxy is configured (
          {setup.missing_imgproxy.join(", ")}).
        </p>
      )}
      <PublishingEditor
        title={collection.title}
        details={
          <>
            <p className="text-sm opacity-80 break-all">
              /photography/{collection.slug} · {photoCount(photos.length)}
              {status.isPublished && ` · ${viewCount(collection.views)}`}
            </p>
            {collection.description && (
              <p className="text-sm max-w-2xl">{collection.description}</p>
            )}
          </>
        }
        noun="collection"
        initial_content={content}
        status={status}
        on_status_change={async (next) => {
          set_status(next);
          // The photo count, views, and lists elsewhere follow the change.
          await router.invalidate();
        }}
        save_draft={(content) =>
          save_draft({ data: { id: collection.id, content } })
        }
        publish={(content) => publish({ data: { id: collection.id, content } })}
        unpublish={() => unpublish({ data: { id: collection.id } })}
        unpublish_confirmation={{
          title: `Unpublish "${collection.title}"?`,
          description:
            "It comes off the site, but its photos and write-up draft are kept. Publishing it again gives it a new date.",
        }}
        allow_empty_publish
        actions={
          <>
            <Button onClick={() => set_is_editing_details(true)}>
              <PencilLineIcon strokeWidth={1.5} size={16} />
              Details
            </Button>
            {status.isPublished && (
              <Link
                to="/photography/$slug"
                params={{ slug: collection.slug }}
                target="_blank"
              >
                View collection
                <ArrowUpRightIcon strokeWidth={1.5} size={16} aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            )}
          </>
        }
        before_editor={
          <>
            <CollectionPhotos
              collection_id={collection.id}
              photos={photos}
              cover_id={cover_id}
              cameras={cameras}
              can_upload={setup.can_upload}
            />
            <Divider />
            <div>
              <h2 className="text-xl font-semibold">Write-up (optional)</h2>
              <p className="text-sm opacity-80">
                Shown above the photos. Publishing puts the collection on the
                site with whatever's written here, even nothing.
              </p>
            </div>
          </>
        }
        editor_label={`Write-up for ${collection.title}`}
        placeholder="The story behind these photos…"
      />
      <Dialog.Root
        open={is_editing_details}
        onOpenChange={(open) => !open && close_details()}
      >
        <Dialog.Content className="max-w-2xl gap-2">
          {is_editing_details && (
            <>
              <div className="-mx-2 px-2 pb-2 border-b">
                <h2 className="text-2xl font-bold">Collection Details</h2>
              </div>
              <CollectionForm
                item={{ ...collection, isPublished: status.isPublished }}
                on_cancel={close_details}
                on_saved={async () => {
                  close_details();
                  // Reloads the title and slug; the editor keeps its content.
                  await router.invalidate();
                }}
                on_deleted={async () => {
                  close_details();
                  await navigate({
                    to: "/dashboard/collections",
                    ignoreBlocker: true,
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
