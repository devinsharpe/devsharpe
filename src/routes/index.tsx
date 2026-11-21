import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import { listPosts } from "~/server/functions/posts.functions";
import { PostCard } from "~/components/post-card";
import Main from "~/components/_ui/main";
import { listPositions } from "~/server/functions/about.functions";
import PositionListItem from "~/components/position-list-item";
import { useMemo } from "react";
import Link from "~/components/_ui/link";
import { ArrowRightIcon } from "lucide-react";

// Default `ssr: true`: loader and component both run on the server, so the
// first response is a complete HTML document.
export const Route = createFileRoute("/")({
  loader: async () => {
    return {
      positions: await listPositions(),
      posts: await listPosts({ data: { page: 1 } }),
    };
  },
  component: Home,
});

function Home() {
  const { positions, posts } = Route.useLoaderData();

  const {
    employmentPositions,
    volunteerPositions,
    show_more_employment_positions,
    show_more_volunteer_positions,
  } = useMemo(() => {
    const employmentPositions = positions.filter(
      ({ type }) => type === "employment",
    );
    const volunteerPositions = positions.filter(
      ({ type }) => type === "volunteer",
    );
    return {
      employmentPositions: employmentPositions.slice(0, 2),
      volunteerPositions: volunteerPositions.slice(0, 2),
      show_more_employment_positions: employmentPositions.length > 3,
      show_more_volunteer_positions: volunteerPositions.length > 3,
    };
  }, [positions]);

  return (
    <Main>
      <section className="flex flex-col gap-4">
        <p className="italic">hey...</p>
      </section>
      <hr className="-mx-2" />
      <section className="flex flex-col gap-4">
        <h2 className="opacity-80 text-2xl font-semibold hover:underline">
          <TanstackLink to="/posts">Latest Musings</TanstackLink>
        </h2>
        <ul className="flex flex-col gap-2">
          {posts.items.slice(0, 3).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
        <Link to="/posts">All posts →</Link>
      </section>
      <hr className="-mx-2" />
      <section className="flex flex-col gap-4">
        <h2 className="opacity-80 text-2xl font-semibold hover:underline">
          <TanstackLink to="/employment">Employment History</TanstackLink>
        </h2>
        <ul className="flex flex-col gap-8">
          {employmentPositions.map((position) => (
            <PositionListItem key={position.id} {...position} />
          ))}
        </ul>
        <Link to="/employment">
          <span>See my full history here</span>
          <ArrowRightIcon strokeWidth={1.5} size={16} />
        </Link>
      </section>
      <hr className="-mx-2" />
      <section className="flex flex-col gap-4">
        <h2 className="opacity-80 text-2xl font-semibold hover:underline">
          <TanstackLink to="/photography">
            Latest Photo Collections
          </TanstackLink>
        </h2>
      </section>
      <hr className="-mx-2" />
      <section className="flex flex-col gap-4">
        <h2 className="opacity-80 text-2xl font-semibold hover:underline">
          <TanstackLink to="/employment">Volunteer History</TanstackLink>
        </h2>
        <ul className="flex flex-col gap-8">
          {volunteerPositions.map((position) => (
            <PositionListItem key={position.id} {...position} />
          ))}
        </ul>
      </section>
    </Main>
  );
}
