import {
  and,
  arrayContains,
  count,
  desc,
  eq,
  isNotNull,
  sql,
} from "drizzle-orm";
import {
  POST_EXCERPT_LENGTH,
  POSTS_PAGE_SIZE,
  type PostsSearch,
} from "../../lib/posts";
import { type RichTextDocument, toPlainText } from "../../lib/rich-text";
import type { AppDatabase } from "../database/index.server";
import { type NewPost, post } from "../database/schema.server";

type PostDetails = Pick<NewPost, "slug" | "title" | "description" | "tags">;

/** What public post lists show. The content columns stay in the database. */
const POST_SUMMARY = {
  id: post.id,
  slug: post.slug,
  title: post.title,
  description: post.description,
  tags: post.tags,
  excerpt: post.excerpt,
  publishedAt: post.publishedAt,
  revisedAt: post.revisedAt,
};

/**
 * Draft/publish state, worked out in the database so lists never load
 * content. jsonb equality ignores key order, so an unchanged draft compares
 * equal to what's published.
 */
const PUBLISH_STATUS = {
  draftUpdatedAt: post.draftUpdatedAt,
  publishedAt: post.publishedAt,
  isPublished: sql<boolean>`${post.publishedContent} is not null`,
  hasUnpublishedChanges: sql<boolean>`(${post.draftContent} is not null and ${post.draftContent} is distinct from ${post.publishedContent})`,
};

/** The admin list: summary, publish state, and editing dates. */
const POST_ADMIN_SUMMARY = {
  ...POST_SUMMARY,
  ...PUBLISH_STATUS,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
};

/** Returned by writes: enough to name the post in a toast and link to it. */
const POST_REFERENCE = { id: post.id, slug: post.slug, title: post.title };

const NEWEST_PUBLISHED_FIRST = [desc(post.publishedAt), desc(post.id)];

export class PostsRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /** One page of published posts, newest first, optionally only those tagged `tag`. */
  public async listPublishedPosts({ page, tag }: PostsSearch) {
    const where = and(
      isNotNull(post.publishedAt),
      tag ? arrayContains(post.tags, [tag]) : undefined,
    );
    const total = await this.db.$count(post, where);
    const page_count = Math.max(1, Math.ceil(total / POSTS_PAGE_SIZE));
    // Past the end (e.g. after deleting posts) shows the last page instead.
    const current = Math.min(page, page_count);
    const items =
      total === 0
        ? []
        : await this.db
            .select(POST_SUMMARY)
            .from(post)
            .where(where)
            .orderBy(...NEWEST_PUBLISHED_FIRST)
            .limit(POSTS_PAGE_SIZE)
            .offset((current - 1) * POSTS_PAGE_SIZE);
    return { items, total, page: current, page_count };
  }

  /** Every tag on a published post, with how many use it; most used first. */
  public listPublishedTags() {
    const tagged = this.db
      .select({ tag: sql<string>`unnest(${post.tags})`.as("tag") })
      .from(post)
      .where(isNotNull(post.publishedAt))
      .as("tagged");
    return this.db
      .select({ tag: tagged.tag, count: count() })
      .from(tagged)
      .groupBy(tagged.tag)
      .orderBy(desc(count()), tagged.tag);
  }

  /** The newest `limit` published posts. */
  public listRecentPublishedPosts(limit: number) {
    return this.db
      .select(POST_SUMMARY)
      .from(post)
      .where(isNotNull(post.publishedAt))
      .orderBy(...NEWEST_PUBLISHED_FIRST)
      .limit(limit);
  }

  /** The newest `limit` published posts with their published content (for the feed). */
  public listFeedPosts(limit: number) {
    return this.db
      .select({ ...POST_SUMMARY, content: post.publishedContent })
      .from(post)
      .where(isNotNull(post.publishedAt))
      .orderBy(...NEWEST_PUBLISHED_FIRST)
      .limit(limit);
  }

  /**
   * Every post: unpublished ones first (Postgres sorts NULL `published_at`
   * first when descending), each group newest first.
   */
  public listAllPosts() {
    return this.db
      .select(POST_ADMIN_SUMMARY)
      .from(post)
      .orderBy(desc(post.publishedAt), desc(post.updatedAt), desc(post.id));
  }

  /** The `limit` most recently changed posts, drafts and published alike. */
  public listRecentlyEditedPosts(limit: number) {
    return this.db
      .select(POST_ADMIN_SUMMARY)
      .from(post)
      .orderBy(desc(post.updatedAt), desc(post.id))
      .limit(limit);
  }

  /** A post's details, publish state, and saved draft (for the editor). */
  public async getPostForEditor(id: string) {
    const rows = await this.db
      .select({ ...POST_ADMIN_SUMMARY, draftContent: post.draftContent })
      .from(post)
      .where(eq(post.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  /** A published post with its published content (never the draft). */
  public async getPublishedPost(slug: string) {
    const rows = await this.db
      .select({ ...POST_SUMMARY, content: post.publishedContent })
      .from(post)
      .where(and(eq(post.slug, slug), isNotNull(post.publishedAt)))
      .limit(1);
    return rows[0] ?? null;
  }

  /** The id of the post using `slug`, if any. */
  public async findPostIdBySlug(slug: string) {
    const rows = await this.db
      .select({ id: post.id })
      .from(post)
      .where(eq(post.slug, slug))
      .limit(1);
    return rows[0]?.id ?? null;
  }

  /** Creates an unpublished post with no content yet. */
  public async createPost(details: PostDetails) {
    const rows = await this.db
      .insert(post)
      .values(details)
      .returning(POST_REFERENCE);
    return rows[0];
  }

  public async updatePost(id: string, details: PostDetails) {
    const rows = await this.db
      .update(post)
      .set(details)
      .where(eq(post.id, id))
      .returning(POST_REFERENCE);
    return rows[0] ?? null;
  }

  public async deletePost(id: string) {
    const rows = await this.db
      .delete(post)
      .where(eq(post.id, id))
      .returning(POST_REFERENCE);
    return rows[0] ?? null;
  }

  /** Saves the draft. The published post is unchanged. */
  public async savePostDraft(id: string, content: RichTextDocument) {
    const rows = await this.db
      .update(post)
      .set({ draftContent: content, draftUpdatedAt: new Date() })
      .where(eq(post.id, id))
      .returning(PUBLISH_STATUS);
    return rows[0] ?? null;
  }

  /**
   * Saves `content` as the draft and publishes it. Going live sets
   * `publishedAt` (the post's date); publishing changes to a live post keeps
   * that date and sets `revisedAt` instead.
   */
  public async publishPost(id: string, content: RichTextDocument) {
    const [current] = await this.db
      .select({ publishedAt: post.publishedAt })
      .from(post)
      .where(eq(post.id, id))
      .limit(1);
    if (!current) return null;

    const now = new Date();
    const is_going_live = current.publishedAt === null;
    const rows = await this.db
      .update(post)
      .set({
        draftContent: content,
        draftUpdatedAt: now,
        publishedContent: content,
        excerpt: toPlainText(content, POST_EXCERPT_LENGTH) || null,
        // `undefined` leaves the column as it is.
        publishedAt: is_going_live ? now : undefined,
        revisedAt: is_going_live ? null : now,
      })
      .where(eq(post.id, id))
      .returning(PUBLISH_STATUS);
    return rows[0] ?? null;
  }

  /** Takes the post off the site; the draft is kept. Republishing gives it a new date. */
  public async unpublishPost(id: string) {
    const rows = await this.db
      .update(post)
      .set({
        publishedContent: null,
        excerpt: null,
        publishedAt: null,
        revisedAt: null,
      })
      .where(eq(post.id, id))
      .returning(PUBLISH_STATUS);
    return rows[0] ?? null;
  }
}
