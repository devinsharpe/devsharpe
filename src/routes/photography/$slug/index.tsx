import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import Main from "~/components/_ui/main";
import { PublishedDate } from "~/components/_ui/published-date";
import { PhotoGrid } from "~/components/photography/photo-grid";
import { useRecordView } from "~/components/photography/use-record-view";
import { RICH_TEXT_PROSE } from "~/components/rich-text/rich-text-classes";
import { RichTextRenderer } from "~/components/rich-text/rich-text-renderer";
import { photoCount } from "~/lib/photography";
import { hasRichTextContent } from "~/lib/rich-text";
import { getPublishedCollection } from "~/server/functions/photography.functions";

export const Route = createFileRoute("/photography/$slug/")({
  component: RouteComponent,
  loader: ({ params }) =>
    getPublishedCollection({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { collection, share_image } = loaderData;
    return {
      meta: [
        { title: collection.title },
        { property: "og:title", content: collection.title },
        ...(collection.description
          ? [
              { name: "description", content: collection.description },
              { property: "og:description", content: collection.description },
            ]
          : []),
        ...(share_image ? [{ property: "og:image", content: share_image }] : []),
      ],
    };
  },
});

function RouteComponent() {
  const { collection, content, media, photos } = Route.useLoaderData();
  useRecordView("collection", collection.id);
  const grid_photos = useMemo(
    () => photos.map((photo) => ({ ...photo, collection_slug: collection.slug })),
    [photos, collection.slug],
  );

  return (
    <Main>
      <header className="flex flex-col gap-3">
        <p className="text-sm opacity-80">
          {collection.publishedAt && (
            <>
              <PublishedDate date={collection.publishedAt} />
              {" · "}
            </>
          )}
          {photoCount(photos.length)}
        </p>
        <h1 className="text-3xl font-semibold">{collection.title}</h1>
        {collection.description && (
          <p className="text-lg max-w-3xl">{collection.description}</p>
        )}
      </header>
      {content && hasRichTextContent(content) && (
        <RichTextRenderer
          document={content}
          media={media}
          className={RICH_TEXT_PROSE}
        />
      )}
      <section aria-label="Photos">
        <PhotoGrid photos={grid_photos} />
      </section>
    </Main>
  );
}
