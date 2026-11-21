import { createFileRoute } from "@tanstack/react-router";
import Divider from "~/components/_ui/divider";
import Main from "~/components/_ui/main";
import { PublishedDate } from "~/components/_ui/published-date";
import { PostTags } from "~/components/post-tags";
import { RICH_TEXT_PROSE } from "~/components/rich-text/rich-text-classes";
import { RichTextRenderer } from "~/components/rich-text/rich-text-renderer";
import { pageMeta } from "~/lib/share";
import { getPublishedPost } from "~/server/functions/posts.functions";

export const Route = createFileRoute("/posts/$slug")({
  staticData: { breadcrumb: Breadcrumb },
  component: RouteComponent,
  loader: ({ params }) => getPublishedPost({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { title, description, excerpt } = loaderData.post;
    return {
      meta: [
        ...pageMeta({ title, description: description ?? excerpt }),
        { property: "og:type", content: "article" },
      ],
    };
  },
});

// Annotated: its type can't be inferred from Route, whose options include it.
function Breadcrumb(): string {
  return Route.useLoaderData().post.title;
}

/** Same calendar day as PublishedDate shows it (UTC). */
const isSameDay = (a: Date, b: Date) =>
  a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

function RouteComponent() {
  const { post, content, media } = Route.useLoaderData();
  const revised_at =
    post.revisedAt && !isSameDay(post.revisedAt, post.publishedAt)
      ? post.revisedAt
      : null;

  return (
    <Main>
      <header className="flex flex-col gap-3">
        <p className="text-sm opacity-80">
          <PublishedDate date={post.publishedAt} />
          {revised_at && (
            <>
              {" · Updated "}
              <PublishedDate date={revised_at} />
            </>
          )}
        </p>
        <h1 className="text-3xl font-semibold">{post.title}</h1>
        {post.description && (
          <p className="text-lg max-w-3xl">{post.description}</p>
        )}
        <PostTags tags={post.tags} />
      </header>
      <Divider />
      <RichTextRenderer
        document={content}
        media={media}
        className={RICH_TEXT_PROSE}
      />
    </Main>
  );
}
