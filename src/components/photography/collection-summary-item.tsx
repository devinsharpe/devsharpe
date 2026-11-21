import { ArrowUpRightIcon, NotebookPenIcon } from "lucide-react";
import { type ComponentProps, useId } from "react";
import { photoCount, viewCount } from "~/lib/photography";
import { cn } from "~/lib/utils";
import type { listCollectionsAdmin } from "~/server/functions/photography.functions";
import Link from "../_ui/link";
import { LocalTime } from "../_ui/local-time";

export type CollectionAdminSummary = Awaited<
  ReturnType<typeof listCollectionsAdmin>
>[number];

interface CollectionSummaryItemProps extends ComponentProps<"li"> {
  item: CollectionAdminSummary;
}

function CollectionStatus({ item }: { item: CollectionAdminSummary }) {
  if (item.isPublished && item.publishedAt) {
    return (
      <>
        Published <LocalTime date={item.publishedAt} />
        {item.hasUnpublishedChanges && " · Unpublished write-up changes"}
      </>
    );
  }
  return (
    <>
      Draft · created <LocalTime date={item.createdAt} />
    </>
  );
}

/** One collection in an admin list (dashboard, Photo Collections); render inside a <ul>. */
export function CollectionSummaryItem({
  item,
  className,
  ...props
}: CollectionSummaryItemProps) {
  const title_id = useId();
  return (
    <li
      {...props}
      className={cn(
        "border border-neutral-300 dark:border-neutral-700 flex items-start gap-4 p-2",
        className,
      )}
    >
      <div className="size-16 shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        {item.cover && (
          <img
            src={item.cover.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <p className="opacity-80 text-sm">
          <CollectionStatus item={item} />
        </p>
        <p id={title_id} className="font-medium">
          {item.title}
          <span className="opacity-80 font-normal text-sm break-all">
            {" "}
            /photography/{item.slug}
          </span>
        </p>
        <p className="opacity-80 text-sm">
          {photoCount(item.photoCount)}
          {item.isPublished && ` · ${viewCount(item.views)}`}
        </p>
      </div>
      <Link
        size="icon"
        to="/dashboard/collections/$collectionId"
        params={{ collectionId: item.id }}
        aria-label="Edit"
        aria-describedby={title_id}
        title="Edit"
      >
        <NotebookPenIcon strokeWidth={1.5} size={16} />
      </Link>
      {item.isPublished && (
        <Link
          size="icon"
          to="/photography/$slug"
          params={{ slug: item.slug }}
          target="_blank"
          aria-label="View collection (opens in a new tab)"
          aria-describedby={title_id}
          title="View collection"
        >
          <ArrowUpRightIcon strokeWidth={1.5} size={16} />
        </Link>
      )}
    </li>
  );
}
