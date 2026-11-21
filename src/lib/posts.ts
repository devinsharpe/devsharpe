// Client-safe module: constants and validation schemas shared by the post
// server functions (inputs), the /posts route (search params), and the admin
// post forms (pre-checks). Nothing here may touch server-only APIs. Keep
// imports relative: drizzle-kit loads the database schema, which may import
// from lib modules.
import * as z from "zod";
import { richTextDocumentSchema } from "./rich-text";
import { optionalText, requiredText, tagFilter, tagList } from "./validation";

/** Published posts per page on /posts. */
export const POSTS_PAGE_SIZE = 10;
export const POST_TITLE_MAX_LENGTH = 200;
export const POST_DESCRIPTION_MAX_LENGTH = 300;
/** How much of the opening text becomes the summary when there's no description. */
export const POST_EXCERPT_LENGTH = 240;
export const POST_TAG_MAX_LENGTH = 40;
export const POST_TAGS_MAX = 10;

/** Where the RSS feed of published posts is served (src/routes/rss[.]xml.ts). */
export const POSTS_FEED_PATH = "/rss.xml";
/** How many of the newest posts the feed carries. */
export const POSTS_FEED_LIMIT = 20;
/** The feed's name, shared by the feed itself and the <link> that advertises it. */
export const postsFeedTitle = (site_title: string) => `${site_title} — Musings`;

/** URL slug: /posts/{slug}. */
const postSlug = z
  .string()
  .trim()
  .min(1, "Enter a title to generate a slug")
  .max(120)
  // `*` so an empty value reports only the `min` message above.
  .regex(/^[a-z0-9-]*$/, "Only lowercase letters, numbers, and dashes");

const postTags = tagList(POST_TAGS_MAX, POST_TAG_MAX_LENGTH);

/** A post's details (everything but its content), as edited in the admin form. */
export const postInputSchema = z.object({
  slug: postSlug,
  title: requiredText("Title is required", POST_TITLE_MAX_LENGTH),
  description: optionalText(POST_DESCRIPTION_MAX_LENGTH),
  tags: postTags,
});
/** Form-side shape: tags comma-separated, blank description allowed. */
export type PostInput = z.input<typeof postInputSchema>;

export const postUpdateSchema = postInputSchema.extend({ id: z.uuid() });

export const postIdSchema = z.object({ id: z.uuid() });

/** Whether a route param could be a post id (so bad URLs 404 instead of erroring). */
export const isPostId = (value: string) =>
  postIdSchema.shape.id.safeParse(value).success;

export const postSlugSchema = z.object({ slug: z.string().min(1).max(200) });

/** Saving or publishing a post's content from the editor. */
export const postContentSchema = z.object({
  id: z.uuid(),
  content: richTextDocumentSchema,
});

/** A short list, e.g. the latest posts on the homepage or dashboard. */
export const postListLimitSchema = z.object({
  limit: z.number().int().min(1).max(20),
});

/** URL state for /posts. Bad or missing values fall back instead of throwing. */
export const postsSearchSchema = z.object({
  tag: tagFilter(POST_TAG_MAX_LENGTH),
  page: z.number().int().min(1).max(10_000).default(1).catch(1),
});
export type PostsSearch = z.infer<typeof postsSearchSchema>;
