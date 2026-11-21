import {
  createFileRoute,
  stripSearchParams,
  Link as TanstackLink,
} from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon, RssIcon } from "lucide-react";
import type { ReactNode } from "react";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import { PostCard } from "~/components/post-card";
import { POSTS_FEED_PATH, postsSearchSchema } from "~/lib/posts";
import { cn } from "~/lib/utils";
import { listPosts } from "~/server/functions/posts.functions";

export const Route = createFileRoute("/posts/")({
  validateSearch: postsSearchSchema,
  // Keeps "?page=1" out of URLs.
  search: { middlewares: [stripSearchParams({ page: 1 })] },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listPosts({ data: deps }),
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
      to="/posts"
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

function RouteComponent() {
  const { items, page, page_count, tags } = Route.useLoaderData();
  const { tag } = Route.useSearch();

  return (
    <Main>
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 className="text-2xl font-semibold">
            {tag ? `Musings tagged #${tag}` : "Musings"}
          </h2>
          {/* A plain link: the feed is a server route, not an app page. */}
          <Link href={POSTS_FEED_PATH} size="sm" className="-mr-2">
            <RssIcon strokeWidth={1.5} size={16} aria-hidden />
            RSS feed
          </Link>
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
                        {entry.count === 1 ? " post" : " posts"}
                      </span>
                    </span>
                  </TagFilterLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {items.length > 0 ? (
          <ul className="flex flex-col gap-6">
            {items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </ul>
        ) : tag ? (
          <p className="italic opacity-80">
            No musings tagged #{tag}.{" "}
            <TanstackLink to="/posts" className="underline">
              See them all
            </TanstackLink>
          </p>
        ) : (
          <p className="italic opacity-80">No musings yet. Check back soon.</p>
        )}
        {page_count > 1 && (
          <nav
            aria-label="Pages"
            className="-mx-2 flex items-center justify-between gap-4"
          >
            {page > 1 ? (
              <Link to="/posts" search={{ tag, page: page - 1 }}>
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
              <Link to="/posts" search={{ tag, page: page + 1 }}>
                Older
                <ArrowRightIcon strokeWidth={1.5} size={16} aria-hidden />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </Main>
  );
}
