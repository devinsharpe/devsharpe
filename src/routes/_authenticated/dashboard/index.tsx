import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import {
  BookImageIcon,
  ChartLineIcon,
  ComputerIcon,
  HammerIcon,
  HomeIcon,
  ImageIcon,
  ImageUpIcon,
  ImagesIcon,
  InboxIcon,
  LinkIcon,
  MessageSquareIcon,
  RssIcon,
  UserSquareIcon,
} from "lucide-react";
import { ComingSoon } from "~/components/_ui/coming-soon";
import Divider from "~/components/_ui/divider";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import {
  ContactRequestItem,
  useContactRequestActions,
} from "~/components/contact-request-item";
import { CollectionSummaryItem } from "~/components/photography/collection-summary-item";
import { PostSummaryItem } from "~/components/post-summary-item";
import { ProjectSummaryItem } from "~/components/project-summary-item";
import { viewCount } from "~/lib/photography";
import { getContactRequestOverview } from "~/server/functions/contact.functions";
import { getPhotographyOverview } from "~/server/functions/photography.functions";
import { listRecentlyEditedPosts } from "~/server/functions/posts.functions";
import { listActiveProjects } from "~/server/functions/projects.functions";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: RouteComponent,
  loader: async () => {
    const [requests, recent_posts, active_projects, photography] =
      await Promise.all([
      // The newest messages from the contact page not yet marked read.
      getContactRequestOverview({ data: { limit: 3 } }),
      // Drafts and published posts alike, most recently changed first.
      listRecentlyEditedPosts({ data: { limit: 3 } }),
      // The first three, in the order set on the Projects page.
      listActiveProjects({ data: { limit: 3 } }),
      // Published collections and collected photos, most viewed first.
      getPhotographyOverview({ data: { limit: 3 } }),
    ]);
    return { requests, recent_posts, active_projects, photography };
  },
});

function RouteComponent() {
  const { requests, recent_posts, active_projects, photography } =
    Route.useLoaderData();
  const request_actions = useContactRequestActions();

  return (
    <Main>
      <nav className="flex flex-wrap gap-2 w-full -mx-2">
        <Link to="/edit/biography">
          <UserSquareIcon strokeWidth={1.5} size={16} />
          <span>Edit Biography</span>
        </Link>
        <Link to="/edit/gear">
          <ComputerIcon strokeWidth={1.5} size={16} />
          <span>Edit Gear</span>
        </Link>
        <Link to="/edit/links">
          <LinkIcon strokeWidth={1.5} size={16} />
          <span>Edit Links</span>
        </Link>
        <Link to="/dashboard/media">
          <ImageUpIcon strokeWidth={1.5} size={16} />
          <span>Media Library</span>
        </Link>
        <Link
          href="https://analytics.dqc.dev/devsharpe.io"
          target="_blank"
          rel="noreferrer"
          className="ml-auto"
        >
          <ChartLineIcon strokeWidth={1.5} size={16} />
          <span className="sr-only">View Analytics</span>
        </Link>
        <Link to="/">
          <HomeIcon strokeWidth={1.5} size={16} />
          <span className="sr-only">Return to Site</span>
        </Link>
      </nav>
      <section className="flex flex-col gap-4">
        <h2 className="opacity-80 text-2xl font-semibold hover:underline">
          <TanstackLink to="/dashboard/requests">Contact Requests</TanstackLink>
        </h2>
        <h3 className="text-lg font-semibold">
          New Requests
          {requests.unread_count > 0 && ` (${requests.unread_count})`}
        </h3>
        {requests.recent.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {requests.recent.map((item) => (
              <ContactRequestItem
                key={item.id}
                item={item}
                is_compact
                is_busy={request_actions.busy_id === item.id}
                on_toggle_read={request_actions.toggle_read}
                on_delete={request_actions.remove}
              />
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">No new requests</p>
        )}
        <Link to="/dashboard/requests">
          <InboxIcon strokeWidth={1.5} size={16} />
          <span>View All Requests</span>
        </Link>
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <h2 className="opacity-80 text-2xl font-semibold hover:underline">
          <TanstackLink to="/dashboard/posts">Posts</TanstackLink>
        </h2>
        <h3 className="text-lg font-semibold">Recent Posts</h3>
        {recent_posts.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {recent_posts.map((post) => (
              <PostSummaryItem key={post.id} item={post} />
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">No posts yet</p>
        )}
        <Link to="/dashboard/posts">
          <RssIcon strokeWidth={1.5} size={16} />
          <span>View All Posts</span>
        </Link>
        <h3 className="text-lg font-semibold">Recent Comments</h3>
        <ComingSoon>Comments on your posts will show up here.</ComingSoon>
        <Link to="/dashboard/posts/comments">
          <MessageSquareIcon strokeWidth={1.5} size={16} />
          <span>View All Comments</span>
        </Link>
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <h2 className="opacity-80 text-2xl font-semibold hover:underline">
          <TanstackLink to="/dashboard/projects">Projects</TanstackLink>
        </h2>
        <h3 className="text-lg font-semibold">Active Projects</h3>
        {active_projects.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {active_projects.map((project) => (
              <ProjectSummaryItem key={project.id} item={project} />
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">No active projects to show</p>
        )}
        <Link to="/dashboard/projects">
          <HammerIcon strokeWidth={1.5} size={16} />
          <span>View All Projects</span>
        </Link>
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <h2 className="opacity-80 text-2xl font-semibold hover:underline">
          <TanstackLink to="/dashboard/collections">
            Photo Collections
          </TanstackLink>
        </h2>
        <h3 className="text-lg font-semibold">Most Viewed Collections</h3>
        {photography.collections.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {photography.collections.map((item) => (
              <CollectionSummaryItem key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">No published collections yet</p>
        )}
        <Link to="/dashboard/collections">
          <ImagesIcon strokeWidth={1.5} size={16} />
          <span>View All Collections</span>
        </Link>
        <h3 className="text-lg font-semibold">Most Viewed Photographs</h3>
        {photography.photos.length > 0 ? (
          <ul className="grid grid-cols-3 gap-4">
            {photography.photos.map((photo) => {
              const thumbnail = (
                <div className="aspect-square overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-800">
                  {photo.thumbnailUrl ? (
                    <img
                      src={photo.thumbnailUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center p-2 text-sm opacity-80 break-all">
                      {photo.name}
                    </span>
                  )}
                </div>
              );
              return (
                <li key={photo.id} className="flex flex-col gap-1 min-w-0">
                  {photo.published_in ? (
                    <TanstackLink
                      to="/photography/$slug/$photoId"
                      params={{
                        slug: photo.published_in.slug,
                        photoId: photo.id,
                      }}
                      target="_blank"
                      className="block hover:opacity-90 focus:outline focus:outline-offset-2 focus:outline-neutral-800 dark:focus:outline-white"
                    >
                      {thumbnail}
                      <span className="sr-only">
                        View {photo.altText || photo.name} in{" "}
                        {photo.published_in.title} (opens in a new tab)
                      </span>
                    </TanstackLink>
                  ) : (
                    thumbnail
                  )}
                  <p className="text-sm">
                    <span className="font-medium">{viewCount(photo.views)}</span>
                    {photo.published_in && (
                      <span className="opacity-80">
                        {" · "}
                        {photo.published_in.title}
                      </span>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="italic opacity-80">No photos in collections yet</p>
        )}
        <Link to="/dashboard/collections/photos">
          <ImageIcon strokeWidth={1.5} size={16} />
          <span>View All Photos</span>
        </Link>
        <h3 className="text-lg font-semibold">Most Viewed Zines</h3>
        <ComingSoon>Zines will show up here, alongside your photo collections.</ComingSoon>
        <Link to="/dashboard/collections/zines">
          <BookImageIcon strokeWidth={1.5} size={16} />
          <span>View All Zines</span>
        </Link>
      </section>
    </Main>
  );
}
