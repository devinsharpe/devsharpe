import {
  createFileRoute,
  notFound,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRightIcon, PencilLineIcon } from "lucide-react";
import { useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Button from "~/components/_ui/button";
import Dialog from "~/components/_ui/dialog";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import { PostForm } from "~/components/forms/post-form";
import { PublishingEditor } from "~/components/rich-text/publishing-editor";
import { isPostId } from "~/lib/posts";
import {
  getPostEditor,
  publishPost,
  savePostDraft,
  unpublishPost,
} from "~/server/functions/posts.functions";

export const Route = createFileRoute("/_authenticated/dashboard/posts/$postId")({
  component: RouteComponent,
  loader: ({ params }) => {
    if (!isPostId(params.postId)) throw notFound();
    return getPostEditor({ data: { id: params.postId } });
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();
  // Keyed so moving between posts starts a fresh editor.
  return <PostEditor key={data.post.id} {...data} />;
}

type EditorData = Awaited<ReturnType<typeof getPostEditor>>;

function PostEditor({ post, content, status: loaded_status }: EditorData) {
  const router = useRouter();
  const navigate = useNavigate();
  const save_draft = useServerFn(savePostDraft);
  const publish = useServerFn(publishPost);
  const unpublish = useServerFn(unpublishPost);
  const [status, set_status] = useState(loaded_status);
  const [is_editing_details, set_is_editing_details] = useState(false);

  const close_details = () => set_is_editing_details(false);

  return (
    <Main>
      <BreadcrumbNav current_page_label={post.title}>
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem to="/dashboard/posts">Posts</BreadcrumbItem>
      </BreadcrumbNav>
      <PublishingEditor
        title={post.title}
        details={
          <p className="text-sm opacity-80 break-all">
            /posts/{post.slug}
            {post.tags.length > 0 &&
              ` · ${post.tags.map((tag) => `#${tag}`).join(" ")}`}
          </p>
        }
        noun="post"
        initial_content={content}
        status={status}
        on_status_change={set_status}
        save_draft={(content) => save_draft({ data: { id: post.id, content } })}
        publish={(content) => publish({ data: { id: post.id, content } })}
        unpublish={() => unpublish({ data: { id: post.id } })}
        unpublish_confirmation={{
          title: `Unpublish "${post.title}"?`,
          description:
            "It comes off the site, but your draft is kept. Publishing it again gives it a new date.",
        }}
        actions={
          <>
            <Button onClick={() => set_is_editing_details(true)}>
              <PencilLineIcon strokeWidth={1.5} size={16} />
              Details
            </Button>
            {status.isPublished && (
              <Link
                to="/posts/$slug"
                params={{ slug: post.slug }}
                target="_blank"
              >
                View post
                <ArrowUpRightIcon strokeWidth={1.5} size={16} aria-hidden />
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            )}
          </>
        }
        editor_label={`Content of ${post.title}`}
        placeholder="Start writing…"
      />
      <Dialog.Root
        open={is_editing_details}
        onOpenChange={(open) => !open && close_details()}
      >
        <Dialog.Content className="max-w-2xl gap-2">
          {is_editing_details && (
            <>
              <div className="-mx-2 px-2 pb-2 border-b">
                <h2 className="text-2xl font-bold">Post Details</h2>
              </div>
              <PostForm
                item={{ ...post, isPublished: status.isPublished }}
                on_cancel={close_details}
                on_saved={async () => {
                  close_details();
                  // Reloads the title and slug; the editor keeps its content.
                  await router.invalidate();
                }}
                on_deleted={async () => {
                  close_details();
                  // The post is gone, so there's nothing left to save.
                  await navigate({ to: "/dashboard/posts", ignoreBlocker: true });
                }}
              />
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </Main>
  );
}
