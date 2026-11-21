import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import { cn } from "~/lib/utils";
import type { listRecentPosts } from "~/server/functions/posts.functions";
import { PublishedDate } from "./_ui/published-date";
import { PostTags } from "./post-tags";

export type PostSummary = Awaited<ReturnType<typeof listRecentPosts>>[number];

interface PostCardProps extends ComponentProps<"li"> {
  post: PostSummary;
}

/** A published post in a list (homepage, /posts); render inside a <ul>. */
export function PostCard({ post, className, ...props }: PostCardProps) {
  const summary = post.description ?? post.excerpt;
  return (
    <li {...props} className={cn("flex flex-col gap-2", className)}>
      {post.publishedAt && (
        <p className="text-sm opacity-80">
          <PublishedDate date={post.publishedAt} />
        </p>
      )}
      <h3 className="text-lg">
        <Link
          to="/posts/$slug"
          params={{ slug: post.slug }}
          className="hover:underline"
        >
          {post.title}
        </Link>
      </h3>
      {summary && <p className="max-w-3xl">{summary}</p>}
      <PostTags tags={post.tags} />
    </li>
  );
}
