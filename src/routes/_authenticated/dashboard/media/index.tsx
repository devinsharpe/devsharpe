import {
  createFileRoute,
  stripSearchParams,
  Link as TanstackLink,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon, ImageUpIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Button from "~/components/_ui/button";
import Dialog from "~/components/_ui/dialog";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import { MediaDetailsDialog } from "~/components/media/media-details-dialog";
import { MediaLibraryItem } from "~/components/media/media-library-item";
import {
  MediaUploader,
  type UploadActivity,
  uploadActivityLabel,
} from "~/components/media/media-uploader";
import { mediaLibrarySearchSchema } from "~/lib/media";
import { cn } from "~/lib/utils";
import { getMediaLibrary } from "~/server/functions/media.functions";

export const Route = createFileRoute("/_authenticated/dashboard/media/")({
  validateSearch: mediaLibrarySearchSchema,
  // Keeps "?page=1" out of URLs.
  search: { middlewares: [stripSearchParams({ page: 1 })] },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getMediaLibrary({ data: deps }),
  component: RouteComponent,
});

function TagFilterLink({
  tag,
  is_current,
  children,
}: {
  tag?: string;
  is_current: boolean;
  children: ReactNode;
}) {
  return (
    <TanstackLink
      to="/dashboard/media"
      search={{ tag }}
      // The router marks a link current when the URL merely contains its
      // search ("All" would match every tag), so only an exact match counts.
      activeOptions={{ exact: true }}
      aria-current={is_current ? "page" : undefined}
      className={cn(
        "block border px-2 transition-colors",
        is_current
          ? "border-neutral-900 bg-neutral-900 text-neutral-100 dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
          : "border-neutral-300 dark:border-neutral-700 hover:border-neutral-800 dark:hover:border-white",
      )}
    >
      {children}
    </TanstackLink>
  );
}

function SetupNotice({ title, missing }: { title: string; missing: string[] }) {
  return (
    <div className="border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/40 p-3 text-sm flex flex-col gap-1">
      <p className="font-medium">{title}</p>
      <p>
        Set{" "}
        {missing.map((name, index) => (
          <span key={name}>
            {index > 0 && ", "}
            <code>{name}</code>
          </span>
        ))}{" "}
        in the server environment, then restart the server.
      </p>
    </div>
  );
}

function RouteComponent() {
  const { items, total, page, page_count, cameras, tags, setup } =
    Route.useLoaderData();
  const { tag } = Route.useSearch();
  const router = useRouter();
  const [selected_id, set_selected_id] = useState<string | null>(null);
  // Read from the loader so edits show up once it reloads.
  const selected = items.find((item) => item.id === selected_id) ?? null;
  const refresh = () => router.invalidate();
  const [is_upload_open, set_is_upload_open] = useState(false);
  const [upload_activity, set_upload_activity] = useState<UploadActivity>({
    in_progress: 0,
    failed: 0,
  });
  const activity_label = uploadActivityLabel(upload_activity);

  return (
    <Main>
      <BreadcrumbNav current_page_label="Media">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
      </BreadcrumbNav>
      {!setup.can_upload && (
        <SetupNotice
          title="Uploads are off: media storage isn't configured."
          missing={setup.missing_storage}
        />
      )}
      {setup.missing_imgproxy.length > 0 && (
        <SetupNotice
          title="Previews are off: imgproxy isn't configured."
          missing={setup.missing_imgproxy}
        />
      )}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <h2 className="text-2xl font-semibold">Library</h2>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                aria-label="Upload photos"
                title="Upload photos"
                disabled={!setup.can_upload}
                onClick={() => set_is_upload_open(true)}
              >
                <ImageUpIcon strokeWidth={1.5} size={16} />
              </Button>
              {/* Uploads keep going with the dialog closed; this reopens it. */}
              {activity_label && (
                <button
                  type="button"
                  onClick={() => set_is_upload_open(true)}
                  className="text-sm underline underline-offset-2 opacity-80 hover:opacity-100 cursor-pointer"
                >
                  {activity_label}
                </button>
              )}
            </div>
          </div>
          {total > 0 && (
            <p className="text-sm opacity-80">
              {total} {total === 1 ? "image" : "images"}
            </p>
          )}
        </div>
        {tags.length > 0 && (
          <nav aria-label="Filter by tag">
            <ul className="flex flex-wrap gap-2 text-sm">
              <li>
                <TagFilterLink is_current={!tag}>All</TagFilterLink>
              </li>
              {tags.map((entry) => (
                <li key={entry.tag}>
                  <TagFilterLink tag={entry.tag} is_current={entry.tag === tag}>
                    #{entry.tag}{" "}
                    <span className="opacity-70">
                      {entry.count}
                      <span className="sr-only">
                        {entry.count === 1 ? " image" : " images"}
                      </span>
                    </span>
                  </TagFilterLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {items.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <MediaLibraryItem
                key={item.id}
                item={item}
                on_open={() => set_selected_id(item.id)}
              />
            ))}
          </ul>
        ) : tag ? (
          <p className="italic opacity-80">
            No images tagged #{tag}.{" "}
            <TanstackLink to="/dashboard/media" className="underline">
              See them all
            </TanstackLink>
          </p>
        ) : (
          <p className="italic opacity-80">
            No images yet. Add some with the upload button.
          </p>
        )}
        {page_count > 1 && (
          <nav
            aria-label="Pages"
            className="-mx-2 flex items-center justify-between gap-4"
          >
            {page > 1 ? (
              <Link to="/dashboard/media" search={{ tag, page: page - 1 }}>
                <ArrowLeftIcon strokeWidth={1.5} size={16} aria-hidden />
                Newer
              </Link>
            ) : (
              <span />
            )}
            <p className="text-sm opacity-80">
              Page {page} of {page_count}
            </p>
            {page < page_count ? (
              <Link to="/dashboard/media" search={{ tag, page: page + 1 }}>
                Older
                <ArrowRightIcon strokeWidth={1.5} size={16} aria-hidden />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
      <Dialog.Root
        open={is_upload_open}
        onOpenChange={(open) => set_is_upload_open(open)}
      >
        {/* Stays mounted while closed, so uploads carry on in the background. */}
        <Dialog.Content className="max-w-2xl gap-4">
          <div className="-mx-2 px-2 pb-2 pr-12 border-b">
            <h2 className="text-2xl font-bold">Upload Photos</h2>
            <p className="text-sm opacity-80">
              Uploads keep going if you close this.
            </p>
          </div>
          <div className="px-2 pb-2">
            <MediaUploader
              disabled={!setup.can_upload}
              cameras={cameras}
              on_uploaded={refresh}
              on_activity_change={set_upload_activity}
            />
          </div>
        </Dialog.Content>
      </Dialog.Root>
      <MediaDetailsDialog
        item={selected}
        cameras={cameras}
        on_close={() => set_selected_id(null)}
        on_changed={refresh}
      />
    </Main>
  );
}
