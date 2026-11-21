import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import { listRecentPosts } from "~/server/functions/posts.functions";
import { PostCard } from "~/components/post-card";
import Main from "~/components/_ui/main";
import {
  getBiography,
  listPositions,
} from "~/server/functions/about.functions";
import { listActiveProjects } from "~/server/functions/projects.functions";
import { listLatestCollections } from "~/server/functions/photography.functions";
import {
  COLLECTION_GRID,
  CollectionCard,
} from "~/components/photography/collection-card";
import PositionListItem from "~/components/position-list-item";
import ProjectCard from "~/components/project-card";
import { RICH_TEXT_PROSE } from "~/components/rich-text/rich-text-classes";
import { RichTextRenderer } from "~/components/rich-text/rich-text-renderer";
import { hasRichTextContent } from "~/lib/rich-text";
import { useMemo } from "react";
import Link from "~/components/_ui/link";
import { ArrowRightIcon } from "lucide-react";

// Default `ssr: true`: loader and component both run on the server, so the
// first response is a complete HTML document.
export const Route = createFileRoute("/")({
  loader: async () => {
    const [biography, positions, posts, projects, collections] =
      await Promise.all([
      getBiography(),
      listPositions(),
      listRecentPosts({ data: { limit: 3 } }),
      // The first three, in the order set on the admin Projects page.
      listActiveProjects({ data: { limit: 3 } }),
      listLatestCollections({ data: { limit: 3 } }),
    ]);
    return { biography, positions, posts, projects, collections };
  },
  component: Home,
});

function Home() {
  const { biography, positions, posts, projects, collections } =
    Route.useLoaderData();

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
        {/* Written on the admin Biography page. */}
        {biography && hasRichTextContent(biography.content) ? (
          <RichTextRenderer
            document={biography.content}
            media={biography.media}
            className={RICH_TEXT_PROSE}
          />
        ) : (
          <p className="italic">hey...</p>
        )}
        <Link to="/contact">
          <span>Send me a message</span>
          <ArrowRightIcon strokeWidth={1.5} size={16} />
        </Link>
      </section>
      <hr className="-mx-2" />
      <section className="flex flex-col gap-4">
        <h2 className="opacity-80 text-2xl font-semibold hover:underline">
          <TanstackLink to="/posts">Latest Musings</TanstackLink>
        </h2>
        {posts.length > 0 ? (
          <ul className="flex flex-col gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">No musings yet</p>
        )}
        <Link to="/posts">
          <span>Read all of my musings</span>
          <ArrowRightIcon strokeWidth={1.5} size={16} />
        </Link>
      </section>
      <hr className="-mx-2" />
      <section className="flex flex-col gap-4">
        <h2 className="opacity-80 text-2xl font-semibold hover:underline">
          <TanstackLink to="/projects">Active Projects</TanstackLink>
        </h2>
        {projects.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">No active projects right now</p>
        )}
        <Link to="/projects">
          <span>See all of my projects</span>
          <ArrowRightIcon strokeWidth={1.5} size={16} />
        </Link>
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
          <span>See my full history</span>
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
        {collections.length > 0 ? (
          <ul className={COLLECTION_GRID}>
            {collections.map((item) => (
              <CollectionCard key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="italic opacity-80">No photo collections yet</p>
        )}
        <Link to="/photography">
          <span>See all of my photography</span>
          <ArrowRightIcon strokeWidth={1.5} size={16} />
        </Link>
      </section>
      <hr className="-mx-2" />
      <section className="flex flex-col gap-4">
        <h2 className="opacity-80 text-2xl font-semibold hover:underline">
          <TanstackLink to="/employment" hash="volunteer-history">
            Volunteer History
          </TanstackLink>
        </h2>
        <ul className="flex flex-col gap-8">
          {volunteerPositions.map((position) => (
            <PositionListItem key={position.id} {...position} />
          ))}
        </ul>
        <Link to="/employment" hash="volunteer-history">
          <span>See my full history</span>
          <ArrowRightIcon strokeWidth={1.5} size={16} />
        </Link>
      </section>
    </Main>
  );
}
