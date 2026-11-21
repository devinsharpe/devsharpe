import { ArrowUpRightIcon, NotebookPenIcon, PencilLineIcon } from "lucide-react";
import { type ComponentProps, useId } from "react";
import { cn } from "~/lib/utils";
import type { listAllPosts } from "~/server/functions/posts.functions";
import Button from "./_ui/button";
import Link from "./_ui/link";
import { LocalTime } from "./_ui/local-time";

export type PostAdminSummary = Awaited<ReturnType<typeof listAllPosts>>[number];

interface PostSummaryItemProps extends ComponentProps<"li"> {
  item: PostAdminSummary;
  /** Shows an "Edit details" button when provided. */
  on_edit_click?: (item: PostAdminSummary) => void;
}

function PostStatus({ item }: { item: PostAdminSummary }) {
  if (item.isPublished && item.publishedAt) {
    return (
      <>
        Published <LocalTime date={item.publishedAt} />
        {item.hasUnpublishedChanges && " · Unpublished changes"}
      </>
    );
  }
  if (item.draftUpdatedAt) {
    return (
      <>
        Draft · saved <LocalTime date={item.draftUpdatedAt} />
      </>
    );
  }
  return (
    <>
      Draft · created <LocalTime date={item.createdAt} />, nothing written yet
    </>
  );
}

/** One post in an admin list (dashboard, Posts page); render inside a <ul>. */
export function PostSummaryItem({
  item,
  on_edit_click,
  className,
  ...props
}: PostSummaryItemProps) {
  const title_id = useId();
  return (
    <li
      {...props}
      className={cn(
        "border border-neutral-300 dark:border-neutral-700 flex items-start gap-4 p-2",
        className,
      )}
    >
      <div className="flex flex-col flex-1 min-w-0">
        <p className="opacity-80 text-sm">
          <PostStatus item={item} />
        </p>
        <p id={title_id} className="font-medium">
          {item.title}
          <span className="opacity-80 font-normal text-sm break-all">
            {" "}
            /posts/{item.slug}
          </span>
        </p>
        {item.tags.length > 0 && (
          <p className="opacity-80 text-sm">
            {item.tags.map((tag) => `#${tag}`).join(" ")}
          </p>
        )}
      </div>
      <Link
        size="icon"
        to="/dashboard/posts/$postId"
        params={{ postId: item.id }}
        aria-label="Write"
        aria-describedby={title_id}
        title="Write"
      >
        <NotebookPenIcon strokeWidth={1.5} size={16} />
      </Link>
      {on_edit_click && (
        <Button
          size="icon"
          aria-label="Edit details"
          aria-describedby={title_id}
          title="Edit details"
          onClick={() => on_edit_click(item)}
        >
          <PencilLineIcon strokeWidth={1.5} size={16} />
        </Button>
      )}
      {item.isPublished && (
        <Link
          size="icon"
          to="/posts/$slug"
          params={{ slug: item.slug }}
          target="_blank"
          aria-label="View post (opens in a new tab)"
          aria-describedby={title_id}
          title="View post"
        >
          <ArrowUpRightIcon strokeWidth={1.5} size={16} />
        </Link>
      )}
    </li>
  );
}
