import {
  and,
  asc,
  count,
  desc,
  eq,
  exists,
  inArray,
  isNotNull,
  type SQL,
  sql,
} from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  COLLECTIONS_PAGE_SIZE,
  PHOTOS_PAGE_SIZE,
  type ViewKind,
} from "../../lib/photography";
import type { RichTextDocument } from "../../lib/rich-text";
import type { AppDatabase } from "../database/index.server";
import {
  camera,
  media,
  type NewPhotoCollection,
  pageView,
  photoCollection,
  photoCollectionItem,
} from "../database/schema.server";

type CollectionDetails = Pick<
  NewPhotoCollection,
  "slug" | "title" | "description"
>;

const IS_PUBLISHED = isNotNull(photoCollection.publishedAt);

/** How many photos a collection has (a correlated subquery). */
const PHOTO_COUNT = sql<number>`(select count(*)::int from ${photoCollectionItem} where ${photoCollectionItem.collectionId} = ${photoCollection.id})`;

/** The chosen cover, else the first photo; null for an empty collection. */
const COVER_ID = sql<string | null>`coalesce(${photoCollection.coverMediaId}, (select ${photoCollectionItem.mediaId} from ${photoCollectionItem} where ${photoCollectionItem.collectionId} = ${photoCollection.id} order by ${photoCollectionItem.sortOrder}, ${photoCollectionItem.createdAt}, ${photoCollectionItem.mediaId} limit 1))`;

/** Counted visits to a collection's or photo's page. */
const viewsOf = (kind: ViewKind, id: AnyPgColumn) =>
  sql<number>`coalesce((select ${pageView.views} from ${pageView} where ${pageView.kind} = ${kind} and ${pageView.targetId} = ${id}), 0)`;

/** What collection cards show. */
const COLLECTION_SUMMARY = {
  id: photoCollection.id,
  slug: photoCollection.slug,
  title: photoCollection.title,
  description: photoCollection.description,
  publishedAt: photoCollection.publishedAt,
  coverId: COVER_ID,
  photoCount: PHOTO_COUNT,
};

/**
 * Draft/publish state of the write-up, worked out in the database. jsonb
 * equality ignores key order, so an unchanged draft equals what's published.
 */
const PUBLISH_STATUS = {
  draftUpdatedAt: photoCollection.draftUpdatedAt,
  publishedAt: photoCollection.publishedAt,
  isPublished: sql<boolean>`${photoCollection.publishedAt} is not null`,
  hasUnpublishedChanges: sql<boolean>`(${photoCollection.draftContent} is not null and ${photoCollection.draftContent} is distinct from ${photoCollection.publishedContent})`,
};

/** The admin list: summary, publish state, views, and editing dates. */
const COLLECTION_ADMIN_SUMMARY = {
  ...COLLECTION_SUMMARY,
  ...PUBLISH_STATUS,
  views: viewsOf("collection", photoCollection.id),
  createdAt: photoCollection.createdAt,
  updatedAt: photoCollection.updatedAt,
};

/** Returned by writes: enough to name the collection in a toast and link to it. */
const COLLECTION_REFERENCE = {
  id: photoCollection.id,
  slug: photoCollection.slug,
  title: photoCollection.title,
};

const IN_ORDER = [
  asc(photoCollectionItem.sortOrder),
  asc(photoCollectionItem.createdAt),
  asc(photoCollectionItem.mediaId),
] as const;

function paging(total: number, page: number, size: number) {
  const page_count = Math.max(1, Math.ceil(total / size));
  // Past the end (e.g. after deleting some) shows the last page instead.
  const current = Math.min(page, page_count);
  return { page: current, page_count, offset: (current - 1) * size };
}

export class PhotographyRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  // <-- Public -->

  /** One page of published collections, newest first. */
  public async listPublishedCollections(page: number) {
    const total = await this.db.$count(photoCollection, IS_PUBLISHED);
    const { offset, ...pages } = paging(total, page, COLLECTIONS_PAGE_SIZE);
    const items =
      total === 0
        ? []
        : await this.db
            .select(COLLECTION_SUMMARY)
            .from(photoCollection)
            .where(IS_PUBLISHED)
            .orderBy(desc(photoCollection.publishedAt), desc(photoCollection.id))
            .limit(COLLECTIONS_PAGE_SIZE)
            .offset(offset);
    return { items, total, ...pages };
  }

  /** The newest `limit` published collections. */
  public listLatestCollections(limit: number) {
    return this.db
      .select(COLLECTION_SUMMARY)
      .from(photoCollection)
      .where(IS_PUBLISHED)
      .orderBy(desc(photoCollection.publishedAt), desc(photoCollection.id))
      .limit(limit);
  }

  /** A published collection with its published write-up (never the draft). */
  public async getPublishedCollection(slug: string) {
    const rows = await this.db
      .select({ ...COLLECTION_SUMMARY, content: photoCollection.publishedContent })
      .from(photoCollection)
      .where(and(eq(photoCollection.slug, slug), IS_PUBLISHED))
      .limit(1);
    return rows[0] ?? null;
  }

  /** A collection's photos (library rows), in order. */
  public async listCollectionPhotos(collection_id: string) {
    const rows = await this.db
      .select()
      .from(photoCollectionItem)
      .innerJoin(media, eq(media.id, photoCollectionItem.mediaId))
      .where(
        and(
          eq(photoCollectionItem.collectionId, collection_id),
          eq(media.status, "ready"),
        ),
      )
      .orderBy(...IN_ORDER);
    return rows.map((row) => row.media);
  }

  /** Just the ids of a collection's photos, in order. */
  public async listCollectionPhotoIds(collection_id: string) {
    const rows = await this.db
      .select({ id: photoCollectionItem.mediaId })
      .from(photoCollectionItem)
      .innerJoin(media, eq(media.id, photoCollectionItem.mediaId))
      .where(
        and(
          eq(photoCollectionItem.collectionId, collection_id),
          eq(media.status, "ready"),
        ),
      )
      .orderBy(...IN_ORDER);
    return rows.map((row) => row.id);
  }

  /**
   * A photo as seen in one published collection: the photo, its camera, and
   * where it sits (for previous/next). Null unless the collection is
   * published and has the photo.
   */
  public async getPublishedPhoto(slug: string, photo_id: string) {
    const [collection] = await this.db
      .select(COLLECTION_REFERENCE)
      .from(photoCollection)
      .where(and(eq(photoCollection.slug, slug), IS_PUBLISHED))
      .limit(1);
    if (!collection) return null;
    const ids = await this.listCollectionPhotoIds(collection.id);
    const index = ids.indexOf(photo_id);
    if (index < 0) return null;
    const [row] = await this.db
      .select()
      .from(media)
      .leftJoin(camera, eq(camera.id, media.cameraId))
      .where(eq(media.id, photo_id))
      .limit(1);
    if (!row) return null;
    return {
      collection,
      photo: row.media,
      camera: row.camera ? { id: row.camera.id, name: row.camera.name } : null,
      index,
      total: ids.length,
      previous_id: ids[index - 1] ?? null,
      next_id: ids[index + 1] ?? null,
    };
  }

  public async getCamera(id: string) {
    const rows = await this.db
      .select({ id: camera.id, name: camera.name })
      .from(camera)
      .where(eq(camera.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * One page of the photos taken with a camera that are in a published
   * collection, newest uploads first. Each comes with the slug of the first
   * published collection that has it, for its link.
   */
  public async listPublishedPhotosByCamera(camera_id: string, page: number) {
    const placement = this.db
      .selectDistinctOn([media.id], {
        mediaId: media.id,
        createdAt: media.createdAt,
        slug: photoCollection.slug,
      })
      .from(photoCollectionItem)
      .innerJoin(
        photoCollection,
        and(eq(photoCollection.id, photoCollectionItem.collectionId), IS_PUBLISHED),
      )
      .innerJoin(
        media,
        and(
          eq(media.id, photoCollectionItem.mediaId),
          eq(media.status, "ready"),
          eq(media.cameraId, camera_id),
        ),
      )
      .orderBy(media.id, asc(photoCollection.publishedAt))
      .as("placement");
    const [{ total }] = await this.db.select({ total: count() }).from(placement);
    const { offset, ...pages } = paging(total, page, PHOTOS_PAGE_SIZE);
    const rows =
      total === 0
        ? []
        : await this.db
            .select()
            .from(placement)
            .innerJoin(media, eq(media.id, placement.mediaId))
            .orderBy(desc(placement.createdAt), desc(placement.mediaId))
            .limit(PHOTOS_PAGE_SIZE)
            .offset(offset);
    const items = rows.map((row) => ({
      slug: row.placement.slug,
      photo: row.media,
    }));
    return { items, total, ...pages };
  }

  public async isPublicCollection(id: string) {
    const rows = await this.db
      .select({ id: photoCollection.id })
      .from(photoCollection)
      .where(and(eq(photoCollection.id, id), IS_PUBLISHED))
      .limit(1);
    return rows.length > 0;
  }

  /** Whether a published collection shows this photo. */
  public async isPublicPhoto(media_id: string) {
    const rows = await this.db
      .select({ id: photoCollectionItem.mediaId })
      .from(photoCollectionItem)
      .innerJoin(
        photoCollection,
        and(eq(photoCollection.id, photoCollectionItem.collectionId), IS_PUBLISHED),
      )
      .where(eq(photoCollectionItem.mediaId, media_id))
      .limit(1);
    return rows.length > 0;
  }

  /** Adds one visit to a page's count. */
  public async recordView(kind: ViewKind, id: string) {
    const now = new Date();
    await this.db
      .insert(pageView)
      .values({ kind, targetId: id, views: 1, lastViewedAt: now })
      .onConflictDoUpdate({
        target: [pageView.kind, pageView.targetId],
        set: { views: sql`${pageView.views} + 1`, lastViewedAt: now },
      });
  }

  // <-- Admin -->

  /**
   * Every collection: unpublished ones first (Postgres sorts NULL
   * `published_at` first when descending), each group newest first.
   */
  public listAllCollections() {
    return this.db
      .select(COLLECTION_ADMIN_SUMMARY)
      .from(photoCollection)
      .orderBy(
        desc(photoCollection.publishedAt),
        desc(photoCollection.updatedAt),
        desc(photoCollection.id),
      );
  }

  /** The `limit` published collections with the most views. */
  public listMostViewedCollections(limit: number) {
    return this.db
      .select(COLLECTION_ADMIN_SUMMARY)
      .from(photoCollection)
      .where(IS_PUBLISHED)
      .orderBy(
        desc(viewsOf("collection", photoCollection.id)),
        desc(photoCollection.publishedAt),
        desc(photoCollection.id),
      )
      .limit(limit);
  }

  /**
   * One page of the photos in any collection, most viewed first, with the
   * collections each is in.
   */
  public async listCollectedPhotos(page: number, size = PHOTOS_PAGE_SIZE) {
    const collected: SQL = and(
      eq(media.status, "ready"),
      exists(
        this.db
          .select({ one: sql`1` })
          .from(photoCollectionItem)
          .where(eq(photoCollectionItem.mediaId, media.id)),
      ),
    )!;
    const total = await this.db.$count(media, collected);
    const { offset, ...pages } = paging(total, page, size);
    if (total === 0) return { items: [], total, ...pages };

    const views = viewsOf("photo", media.id);
    const ranked = await this.db
      .select({ id: media.id, views })
      .from(media)
      .where(collected)
      .orderBy(desc(views), desc(media.createdAt), desc(media.id))
      .limit(size)
      .offset(offset);
    const ids = ranked.map((row) => row.id);
    const [rows, memberships] = await Promise.all([
      this.db.select().from(media).where(inArray(media.id, ids)),
      this.db
        .select({
          mediaId: photoCollectionItem.mediaId,
          id: photoCollection.id,
          slug: photoCollection.slug,
          title: photoCollection.title,
          isPublished: PUBLISH_STATUS.isPublished,
        })
        .from(photoCollectionItem)
        .innerJoin(
          photoCollection,
          eq(photoCollection.id, photoCollectionItem.collectionId),
        )
        .where(inArray(photoCollectionItem.mediaId, ids))
        .orderBy(desc(photoCollection.publishedAt), asc(photoCollection.title)),
    ]);
    const by_id = new Map(rows.map((row) => [row.id, row]));
    const items = ranked.flatMap(({ id, views }) => {
      const row = by_id.get(id);
      if (!row) return [];
      const collections = memberships
        .filter((membership) => membership.mediaId === id)
        .map(({ mediaId: _mediaId, ...membership }) => membership);
      return [{ row, views, collections }];
    });
    return { items, total, ...pages };
  }

  /** A collection's details, publish state, cover choice, and saved draft (for the editor). */
  public async getCollectionForEditor(id: string) {
    const rows = await this.db
      .select({
        ...COLLECTION_ADMIN_SUMMARY,
        coverMediaId: photoCollection.coverMediaId,
        draftContent: photoCollection.draftContent,
      })
      .from(photoCollection)
      .where(eq(photoCollection.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  /** The id of the collection using `slug`, if any. */
  public async findCollectionIdBySlug(slug: string) {
    const rows = await this.db
      .select({ id: photoCollection.id })
      .from(photoCollection)
      .where(eq(photoCollection.slug, slug))
      .limit(1);
    return rows[0]?.id ?? null;
  }

  /** Creates an unpublished collection with no photos yet. */
  public async createCollection(details: CollectionDetails) {
    const rows = await this.db
      .insert(photoCollection)
      .values(details)
      .returning(COLLECTION_REFERENCE);
    return rows[0];
  }

  public async updateCollection(id: string, details: CollectionDetails) {
    const rows = await this.db
      .update(photoCollection)
      .set(details)
      .where(eq(photoCollection.id, id))
      .returning(COLLECTION_REFERENCE);
    return rows[0] ?? null;
  }

  /** Deletes the collection (its photos stay in the library) and its view count. */
  public async deleteCollection(id: string) {
    const rows = await this.db
      .delete(photoCollection)
      .where(eq(photoCollection.id, id))
      .returning(COLLECTION_REFERENCE);
    if (rows[0]) {
      await this.db
        .delete(pageView)
        .where(and(eq(pageView.kind, "collection"), eq(pageView.targetId, id)));
    }
    return rows[0] ?? null;
  }

  /** Saves the write-up's draft. The published collection is unchanged. */
  public async saveDraft(id: string, content: RichTextDocument) {
    const rows = await this.db
      .update(photoCollection)
      .set({ draftContent: content, draftUpdatedAt: new Date() })
      .where(eq(photoCollection.id, id))
      .returning(PUBLISH_STATUS);
    return rows[0] ?? null;
  }

  /**
   * Saves `content` as the draft and publishes it, putting the collection on
   * the site. Going live sets `publishedAt` (its date); publishing changes
   * to a live collection keeps that date.
   */
  public async publishCollection(id: string, content: RichTextDocument) {
    const [current] = await this.db
      .select({ publishedAt: photoCollection.publishedAt })
      .from(photoCollection)
      .where(eq(photoCollection.id, id))
      .limit(1);
    if (!current) return null;
    const now = new Date();
    const rows = await this.db
      .update(photoCollection)
      .set({
        draftContent: content,
        draftUpdatedAt: now,
        publishedContent: content,
        // `undefined` leaves the column as it is.
        publishedAt: current.publishedAt === null ? now : undefined,
      })
      .where(eq(photoCollection.id, id))
      .returning(PUBLISH_STATUS);
    return rows[0] ?? null;
  }

  /** Takes the collection off the site; the draft and photos are kept. */
  public async unpublishCollection(id: string) {
    const rows = await this.db
      .update(photoCollection)
      .set({ publishedContent: null, publishedAt: null })
      .where(eq(photoCollection.id, id))
      .returning(PUBLISH_STATUS);
    return rows[0] ?? null;
  }

  public async countPhotos(collection_id: string) {
    return this.db.$count(
      photoCollectionItem,
      eq(photoCollectionItem.collectionId, collection_id),
    );
  }

  /**
   * Adds library photos to the end of a collection, in the order given.
   * Photos it already has, and ids not in the library, are skipped.
   */
  public async addPhotos(collection_id: string, media_ids: string[]) {
    const ready = await this.db
      .select({ id: media.id })
      .from(media)
      .where(and(eq(media.status, "ready"), inArray(media.id, media_ids)));
    const ready_ids = new Set(ready.map((row) => row.id));
    const ids = media_ids.filter((id) => ready_ids.has(id));
    if (ids.length === 0) return 0;
    const [{ next }] = await this.db
      .select({
        next: sql<number>`coalesce(max(${photoCollectionItem.sortOrder}), -1) + 1`,
      })
      .from(photoCollectionItem)
      .where(eq(photoCollectionItem.collectionId, collection_id));
    const added = await this.db
      .insert(photoCollectionItem)
      .values(
        ids.map((mediaId, index) => ({
          collectionId: collection_id,
          mediaId,
          sortOrder: Number(next) + index,
        })),
      )
      .onConflictDoNothing()
      .returning({ mediaId: photoCollectionItem.mediaId });
    return added.length;
  }

  /** Takes a photo out of a collection (it stays in the library). */
  public async removePhoto(collection_id: string, media_id: string) {
    const rows = await this.db
      .delete(photoCollectionItem)
      .where(
        and(
          eq(photoCollectionItem.collectionId, collection_id),
          eq(photoCollectionItem.mediaId, media_id),
        ),
      )
      .returning({ mediaId: photoCollectionItem.mediaId });
    if (rows.length === 0) return false;
    // A removed photo can't stay the cover.
    await this.db
      .update(photoCollection)
      .set({ coverMediaId: null })
      .where(
        and(
          eq(photoCollection.id, collection_id),
          eq(photoCollection.coverMediaId, media_id),
        ),
      );
    return true;
  }

  public async hasPhoto(collection_id: string, media_id: string) {
    const rows = await this.db
      .select({ id: photoCollectionItem.mediaId })
      .from(photoCollectionItem)
      .where(
        and(
          eq(photoCollectionItem.collectionId, collection_id),
          eq(photoCollectionItem.mediaId, media_id),
        ),
      )
      .limit(1);
    return rows.length > 0;
  }

  /** Sets the cover to one of its photos, or null for the first photo. */
  public async setCover(collection_id: string, media_id: string | null) {
    const rows = await this.db
      .update(photoCollection)
      .set({ coverMediaId: media_id })
      .where(eq(photoCollection.id, collection_id))
      .returning({ id: photoCollection.id });
    return rows.length > 0;
  }

  /** Sets each photo's position to its index in `media_ids`, in one statement. */
  public async reorderPhotos(collection_id: string, media_ids: string[]) {
    if (media_ids.length === 0) return;
    const rows = sql.join(
      media_ids.map((id, index) => sql`(${id}::uuid, ${index}::integer)`),
      sql`, `,
    );
    await this.db.execute(sql`update ${photoCollectionItem}
      set ${sql.identifier("sort_order")} = new_order.sort_order
      from (values ${rows}) as new_order(media_id, sort_order)
      where ${photoCollectionItem.collectionId} = ${collection_id}
        and ${photoCollectionItem.mediaId} = new_order.media_id`);
  }
}
