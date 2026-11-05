import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import {
  BookImageIcon,
  ChartLineIcon,
  ComputerIcon,
  HammerIcon,
  HomeIcon,
  ImageIcon,
  ImagesIcon,
  MessageSquareIcon,
  RssIcon,
  UserSquareIcon,
} from "lucide-react";
import Divider from "~/components/_ui/divider";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
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
          <TanstackLink to="/dashboard/posts">Posts</TanstackLink>
        </h2>
        <h3 className="text-lg font-semibold">Most Viewed Posts</h3>
        <p className="italic opacity-80">No recent posts to show</p>
        <Link to="/dashboard/posts">
          <RssIcon strokeWidth={1.5} size={16} />
          <span>View All Posts</span>
        </Link>
        <h3 className="text-lg font-semibold">Recent Comments</h3>
        <p className="italic opacity-80">No recent comments to show</p>
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
        <h3 className="text-lg font-semibold">Most Viewed Projects</h3>
        <p className="italic opacity-80">No recent projects to show</p>
        <Link to="/dashboard/collections/photos">
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
        <p className="italic opacity-80">No recent collections to show</p>
        <Link to="/dashboard/collections">
          <ImagesIcon strokeWidth={1.5} size={16} />
          <span>View All Collections</span>
        </Link>
        <h3 className="text-lg font-semibold">Most Viewed Photographs</h3>
        <p className="italic opacity-80">No recent photographs to show</p>
        <Link to="/dashboard/collections/photos">
          <ImageIcon strokeWidth={1.5} size={16} />
          <span>View All Photos</span>
        </Link>
        <h3 className="text-lg font-semibold">Most Viewed Zines</h3>
        <p className="italic opacity-80">No recent zines to show</p>
        <Link to="/dashboard/collections/zines">
          <BookImageIcon strokeWidth={1.5} size={16} />
          <span>View All Zines</span>
        </Link>
      </section>
    </Main>
  );
}
