import {
  and,
  arrayContains,
  asc,
  count,
  desc,
  eq,
  exists,
  inArray,
  lt,
  or,
  sql,
} from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { MEDIA_PAGE_SIZE, type MediaLibrarySearch } from "../../lib/media";
import { RICH_TEXT_IMAGE_TYPE } from "../../lib/rich-text";
import type { AppDatabase } from "../database/index.server";
import {
  biographyVersion,
  camera,
  media,
  type NewMedia,
  photoCollection,
  photoCollectionItem,
  post,
  project,
  projectPage,
  siteSettings,
} from "../database/schema.server";

/** A page whose content shows a library image. */
export interface MediaUse {
  kind: "post" | "project" | "biography" | "collection" | "links";
  /** The post's, project's, or collection's id; the biography and /links have just one. */
  id: string;
  title: string;
  /** In what visitors see now, rather than only in a saved draft. */
  is_live: boolean;
}

type PendingMedia = Required<
  Pick<
    NewMedia,
    | "id"
    | "storageKey"
    | "originalName"
    | "contentType"
    | "byteSize"
    | "width"
    | "height"
    | "cameraId"
    | "tags"
  >
>;

export class MediaRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /** One page of the library (uploaded and checked items), newest first. */
  public async listReadyMedia({ page, tag }: MediaLibrarySearch) {
    const where = and(
      eq(media.status, "ready"),
      tag ? arrayContains(media.tags, [tag]) : undefined,
    );
    const total = await this.db.$count(media, where);
    const page_count = Math.max(1, Math.ceil(total / MEDIA_PAGE_SIZE));
    const current = Math.min(page, page_count);
    const items =
      total === 0
        ? []
        : await this.db
            .select()
            .from(media)
            .where(where)
            .orderBy(desc(media.createdAt), desc(media.id))
            .limit(MEDIA_PAGE_SIZE)
            .offset((current - 1) * MEDIA_PAGE_SIZE);
    return { items, total, page: current, page_count };
  }

  /** The library items with these ids, in no particular order. Pending uploads are left out. */
  public async listReadyMediaByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return await this.db
      .select()
      .from(media)
      .where(and(eq(media.status, "ready"), inArray(media.id, ids)));
  }

  public async getMedia(id: string) {
    const rows = await this.db
      .select()
      .from(media)
      .where(eq(media.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  /** Records an upload that's about to start; it stays out of the library until checked. */
  public async createPendingMedia(item: PendingMedia) {
    const rows = await this.db
      .insert(media)
      .values({ ...item, status: "pending" })
      .returning();
    return rows[0];
  }

  /** Adds a checked upload to the library. */
  public async markMediaReady(id: string) {
    const rows = await this.db
      .update(media)
      .set({ status: "ready" })
      .where(and(eq(media.id, id), eq(media.status, "pending")))
      .returning();
    return rows[0] ?? null;
  }

  public async updateMediaDetails(
    id: string,
    details: {
      altText: string | null;
      caption: string | null;
      location: string | null;
      cameraId: string | null;
      tags: string[];
    },
  ) {
    const rows = await this.db
      .update(media)
      .set(details)
      .where(and(eq(media.id, id), eq(media.status, "ready")))
      .returning();
    return rows[0] ?? null;
  }

  public async deleteMedia(id: string) {
    const rows = await this.db
      .delete(media)
      .where(eq(media.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /**
   * The posts, project pages, photo collections, and current biography that
   * show this image, live or in a saved draft. Images only show at the top
   * level of a document, so that's where this looks (a jsonb containment
   * check). A collection also counts when the image is one of its photos.
   */
  public async findMediaUsage(id: string): Promise<MediaUse[]> {
    const needle = JSON.stringify([{ type: RICH_TEXT_IMAGE_TYPE, mediaId: id }]);
    const shows = (column: AnyPgColumn) =>
      sql<boolean>`coalesce(${column} -> 'root' -> 'children' @> ${needle}::jsonb, false)`;
    const in_collection = exists(
      this.db
        .select({ one: sql`1` })
        .from(photoCollectionItem)
        .where(
          and(
            eq(photoCollectionItem.collectionId, photoCollection.id),
            eq(photoCollectionItem.mediaId, id),
          ),
        ),
    );
    const [posts, pages, collections, biography, links_photo] = await Promise.all([
      this.db
        .select({
          id: post.id,
          title: post.title,
          is_live: shows(post.publishedContent),
        })
        .from(post)
        .where(or(shows(post.publishedContent), shows(post.draftContent)))
        .orderBy(asc(post.title)),
      this.db
        .select({
          id: project.id,
          title: project.name,
          is_live: shows(projectPage.publishedContent),
        })
        .from(projectPage)
        .innerJoin(project, eq(project.id, projectPage.projectId))
        .where(
          or(shows(projectPage.publishedContent), shows(projectPage.draftContent)),
        )
        .orderBy(asc(project.name)),
      this.db
        .select({
          id: photoCollection.id,
          title: photoCollection.title,
          // Its photos and cover are live while it's published; its write-up
          // only once published.
          is_live: sql<boolean>`(${photoCollection.publishedAt} is not null and (${in_collection} or ${shows(photoCollection.publishedContent)}))`,
        })
        .from(photoCollection)
        .where(
          or(
            in_collection,
            shows(photoCollection.publishedContent),
            shows(photoCollection.draftContent),
          ),
        )
        .orderBy(asc(photoCollection.title)),
      // Only the current version: older ones are history.
      this.db
        .select({ is_live: shows(biographyVersion.content) })
        .from(biographyVersion)
        .orderBy(desc(biographyVersion.createdAt), desc(biographyVersion.id))
        .limit(1),
      // The photo at the top of /links.
      this.db
        .select({ id: siteSettings.id })
        .from(siteSettings)
        .where(eq(siteSettings.linksPhotoMediaId, id))
        .limit(1),
    ]);
    return [
      ...posts.map((row) => ({ kind: "post" as const, ...row })),
      ...pages.map((row) => ({ kind: "project" as const, ...row })),
      ...collections.map((row) => ({ kind: "collection" as const, ...row })),
      ...(biography[0]?.is_live
        ? [{ kind: "biography" as const, id: "biography", title: "Homepage biography", is_live: true }]
        : []),
      ...(links_photo.length > 0
        ? [{ kind: "links" as const, id: "links", title: "Links page photo", is_live: true }]
        : []),
    ];
  }

  /** Every tag in the library, with how many items use it; most used first. */
  public listMediaTags() {
    const tagged = this.db
      .select({ tag: sql<string>`unnest(${media.tags})`.as("tag") })
      .from(media)
      .where(eq(media.status, "ready"))
      .as("tagged");
    return this.db
      .select({ tag: tagged.tag, count: count() })
      .from(tagged)
      .groupBy(tagged.tag)
      .orderBy(desc(count()), tagged.tag);
  }

  /** Every camera a photo can be linked to, in their display order. */
  public listCameraOptions() {
    return this.db
      .select({ id: camera.id, name: camera.name })
      .from(camera)
      .orderBy(asc(camera.sortOrder), asc(camera.id));
  }

  public async cameraExists(id: string) {
    const rows = await this.db
      .select({ id: camera.id })
      .from(camera)
      .where(eq(camera.id, id))
      .limit(1);
    return rows.length > 0;
  }

  /** Uploads started before `before` that never finished, oldest first. */
  public listStalePendingMedia(before: Date, limit: number) {
    return this.db
      .select({ id: media.id, storageKey: media.storageKey })
      .from(media)
      .where(and(eq(media.status, "pending"), lt(media.createdAt, before)))
      .orderBy(asc(media.createdAt))
      .limit(limit);
  }
}
