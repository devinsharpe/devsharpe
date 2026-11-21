import {
  createFileRoute,
  notFound,
  Link as TanstackLink,
  useNavigate,
} from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CameraIcon,
  MapPinIcon,
} from "lucide-react";
import { useEffect } from "react";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import { MediaImage } from "~/components/media/media-image";
import { useRecordView } from "~/components/photography/use-record-view";
import { RICH_TEXT_IMAGE_SIZES } from "~/components/rich-text/rich-text-classes";
import { isUuid } from "~/lib/photography";
import { pageMeta } from "~/lib/share";
import { getPublishedPhoto } from "~/server/functions/photography.functions";

export const Route = createFileRoute("/photography/$slug/$photoId")({
  staticData: { breadcrumb: Breadcrumb },
  component: RouteComponent,
  loader: ({ params }) => {
    if (!isUuid(params.photoId)) throw notFound();
    return getPublishedPhoto({
      data: { slug: params.slug, photoId: params.photoId },
    });
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { collection, photo, index, total, share_image } = loaderData;
    const title = `${collection.title}: photo ${index + 1} of ${total}`;
    return {
      meta: pageMeta({ title, description: photo.caption, image: share_image }),
    };
  },
});

// Annotated: its type can't be inferred from Route, whose options include it.
function Breadcrumb(): string {
  const { index, total } = Route.useLoaderData();
  return `Photo ${index + 1} of ${total}`;
}

/** Whether a key press belongs to something being typed in. */
function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.closest("input, textarea, select, [contenteditable]") !== null
  );
}

function RouteComponent() {
  const { collection, camera, index, total, previous_id, next_id, photo } =
    Route.useLoaderData();
  const navigate = useNavigate();
  useRecordView("photo", photo.id);

  // ← and → step through the collection.
  useEffect(() => {
    const on_key_down = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        isTyping(event.target)
      ) {
        return;
      }
      const photo_id =
        event.key === "ArrowLeft"
          ? previous_id
          : event.key === "ArrowRight"
            ? next_id
            : null;
      if (!photo_id) return;
      event.preventDefault();
      void navigate({
        to: "/photography/$slug/$photoId",
        params: { slug: collection.slug, photoId: photo_id },
      });
    };
    window.addEventListener("keydown", on_key_down);
    return () => window.removeEventListener("keydown", on_key_down);
  }, [navigate, collection.slug, previous_id, next_id]);

  const position = `${index + 1} of ${total}`;
  const has_details = photo.caption || photo.location || camera;

  return (
    <Main>
      <figure className="flex flex-col gap-4">
        {photo.image ? (
          <MediaImage
            // A new element per photo, so the old one doesn't linger while
            // the next loads.
            key={photo.id}
            image={photo.image}
            alt={photo.altText || `Photo ${position} in ${collection.title}`}
            sizes={RICH_TEXT_IMAGE_SIZES}
            fetchPriority="high"
            className="mx-auto block h-auto w-auto max-w-full max-h-[85vh]"
          />
        ) : (
          <div className="flex aspect-3/2 items-center justify-center bg-neutral-200 dark:bg-neutral-800 p-4 text-center italic opacity-80">
            This photo can't be shown right now.
          </div>
        )}
        {has_details && (
          <figcaption className="flex flex-col gap-2">
            {photo.caption && <p className="max-w-3xl">{photo.caption}</p>}
            {(photo.location || camera) && (
              <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm opacity-80">
                {photo.location && (
                  <li className="flex items-center gap-2">
                    <MapPinIcon strokeWidth={1.5} size={16} aria-hidden />
                    <span className="sr-only">Taken in </span>
                    {photo.location}
                  </li>
                )}
                {camera && (
                  <li className="flex items-center gap-2">
                    <CameraIcon strokeWidth={1.5} size={16} aria-hidden />
                    <span>
                      Shot on{" "}
                      <TanstackLink
                        to="/photography"
                        search={{ camera: camera.id }}
                        className="underline underline-offset-2 hover:opacity-80"
                      >
                        {camera.name}
                      </TanstackLink>
                    </span>
                  </li>
                )}
              </ul>
            )}
          </figcaption>
        )}
      </figure>
      <nav
        aria-label={`Photos in ${collection.title}`}
        className="-mx-2 flex items-center justify-between gap-4"
      >
        {previous_id ? (
          <Link
            to="/photography/$slug/$photoId"
            params={{ slug: collection.slug, photoId: previous_id }}
            rel="prev"
          >
            <ArrowLeftIcon strokeWidth={1.5} size={16} aria-hidden />
            Previous
          </Link>
        ) : (
          <span />
        )}
        <p className="text-sm opacity-80">{position}</p>
        {next_id ? (
          <Link
            to="/photography/$slug/$photoId"
            params={{ slug: collection.slug, photoId: next_id }}
            rel="next"
          >
            Next
            <ArrowRightIcon strokeWidth={1.5} size={16} aria-hidden />
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </Main>
  );
}
