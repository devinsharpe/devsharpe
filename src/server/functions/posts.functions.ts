import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import {
  postContentSchema,
  postIdSchema,
  postInputSchema,
  postListLimitSchema,
  postSlugSchema,
  postsSearchSchema,
  postUpdateSchema,
} from "~/lib/posts";
import { hasRichTextContent } from "~/lib/rich-text";
import { resolveRichTextMedia } from "~/server/media/rich-text-media.server";
import { ensure_auth_middleware } from "~/server/middleware/auth.middleware";
import { media_middleware } from "~/server/middleware/media.middleware";
import { posts_middleware } from "~/server/middleware/posts.middleware";

// <-- Public: published posts only -->

/** /posts: one page of published posts, plus every tag for the filter. */
export const listPosts = createServerFn({ method: "GET" })
  .validator(postsSearchSchema)
  .middleware([posts_middleware])
  .handler(async ({ context, data }) => {
    const [posts, tags] = await Promise.all([
      context.posts.listPublishedPosts(data),
      context.posts.listPublishedTags(),
    ]);
    return { ...posts, tags };
  });

/** The newest published posts, e.g. for the homepage. */
export const listRecentPosts = createServerFn({ method: "GET" })
  .validator(postListLimitSchema)
  .middleware([posts_middleware])
  .handler(({ context, data }) =>
    context.posts.listRecentPublishedPosts(data.limit),
  );

/**
 * /posts/{slug}: the post, its published content, and the images that shows.
 * Drafts are never sent.
 */
export const getPublishedPost = createServerFn({ method: "GET" })
  .validator(postSlugSchema)
  .middleware([posts_middleware, media_middleware])
  .handler(async ({ context, data }) => {
    const row = await context.posts.getPublishedPost(data.slug);
    if (!row) throw notFound();
    const { content, publishedAt, ...post } = row;
    if (!content || !publishedAt) throw notFound();
    const media = await resolveRichTextMedia(context.media, [content]);
    return { post: { ...post, publishedAt }, content, media };
  });

// <-- Admin -->

export const listAllPosts = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .handler(({ context }) => context.posts.listAllPosts());

export const listRecentlyEditedPosts = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postListLimitSchema)
  .handler(({ context, data }) =>
    context.posts.listRecentlyEditedPosts(data.limit),
  );

/** Editor: the post's details, its saved draft, and publish status. */
export const getPostEditor = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postIdSchema)
  .handler(async ({ context, data }) => {
    const row = await context.posts.getPostForEditor(data.id);
    if (!row) throw notFound();
    const { draftContent, ...post } = row;
    return {
      post,
      content: draftContent,
      status: {
        draftUpdatedAt: post.draftUpdatedAt,
        publishedAt: post.publishedAt,
        isPublished: post.isPublished,
        hasUnpublishedChanges: post.hasUnpublishedChanges,
      },
    };
  });

function slugTaken(slug: string): never {
  setResponseStatus(409);
  throw new Error(
    `Another post already uses the slug "${slug}". Pick a different one.`,
  );
}

export const createPost = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postInputSchema)
  .handler(async ({ context, data }) => {
    if (await context.posts.findPostIdBySlug(data.slug)) slugTaken(data.slug);
    return await context.posts.createPost(data);
  });

export const updatePost = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postUpdateSchema)
  .handler(async ({ context, data: { id, ...details } }) => {
    const slug_owner = await context.posts.findPostIdBySlug(details.slug);
    if (slug_owner && slug_owner !== id) slugTaken(details.slug);
    const post = await context.posts.updatePost(id, details);
    if (!post) throw notFound();
    return post;
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postIdSchema)
  .handler(async ({ context, data }) => {
    const post = await context.posts.deletePost(data.id);
    if (!post) throw notFound();
    return post;
  });

export const savePostDraft = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postContentSchema)
  .handler(async ({ context, data }) => {
    const status = await context.posts.savePostDraft(data.id, data.content);
    if (!status) throw notFound();
    return status;
  });

export const publishPost = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postContentSchema)
  .handler(async ({ context, data }) => {
    if (!hasRichTextContent(data.content)) {
      setResponseStatus(400);
      throw new Error("Write something before publishing.");
    }
    const status = await context.posts.publishPost(data.id, data.content);
    if (!status) throw notFound();
    return status;
  });

export const unpublishPost = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, posts_middleware])
  .validator(postIdSchema)
  .handler(async ({ context, data }) => {
    const status = await context.posts.unpublishPost(data.id);
    if (!status) throw notFound();
    return status;
  });
