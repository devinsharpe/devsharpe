import { asc, desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { PositionType } from "~/lib/about";
import type { RichTextDocument } from "~/lib/rich-text";
import { AppDatabase } from "../database/index.server";
import { buildReorderQuery, nextSortOrder } from "../database/ordering.server";
import {
  biographyVersion,
  NewPositionItem,
  position,
} from "../database/schema.server";

/** Newest first; the first row is the current biography. */
const NEWEST_BIOGRAPHY_FIRST = [
  desc(biographyVersion.createdAt),
  desc(biographyVersion.id),
] as const;

export class AboutRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  // <-- Positions (employment & volunteer history) -->
  public listPositions(type?: PositionType) {
    return this.db
      .select()
      .from(position)
      .where(type ? eq(position.type, type) : undefined)
      .orderBy(asc(position.sortOrder), asc(position.id));
  }

  public async getPosition(id: string) {
    const rows = await this.db
      .select()
      .from(position)
      .where(eq(position.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  public async createPosition(item: NewPositionItem) {
    const rows = await this.db
      .insert(position)
      .values({
        ...item,
        sortOrder: nextSortOrder(
          position,
          position.sortOrder,
          eq(position.type, item.type),
        ),
      })
      .returning();
    return rows[0];
  }

  public async updatePosition({ id, ...item }: NewPositionItem) {
    const existing = await this.getPosition(id);
    if (!existing) return null;
    // Switching between employment and volunteer moves it to the end of the other list.
    const sortOrder =
      existing.type === item.type
        ? undefined
        : nextSortOrder(
            position,
            position.sortOrder,
            eq(position.type, item.type),
          );
    const rows = await this.db
      .update(position)
      .set({ ...item, sortOrder })
      .where(eq(position.id, id))
      .returning();
    return rows[0] ?? null;
  }

  public async deletePosition(id: string) {
    const rows = await this.db
      .delete(position)
      .where(eq(position.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /** Sets `sort_order` to each id's index in `ids`, within one position type. */
  public async reorderPositions(type: PositionType, ids: string[]) {
    if (!ids.length) return;
    await this.db.execute(
      buildReorderQuery(position, position.id, ids, eq(position.type, type)),
    );
  }

  // <-- Biography (versioned; newest is current) -->
  public async getCurrentBiography() {
    const rows = await this.db
      .select()
      .from(biographyVersion)
      .orderBy(...NEWEST_BIOGRAPHY_FIRST)
      .limit(1);
    return rows[0] ?? null;
  }

  public async getBiographyVersion(id: string) {
    const rows = await this.db
      .select()
      .from(biographyVersion)
      .where(eq(biographyVersion.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  /** Versions before the current one, newest first, with each restore's source date. */
  public listPreviousBiographies(limit: number) {
    const source = alias(biographyVersion, "source");
    return this.db
      .select({
        id: biographyVersion.id,
        content: biographyVersion.content,
        createdAt: biographyVersion.createdAt,
        restoredFromCreatedAt: source.createdAt,
      })
      .from(biographyVersion)
      .leftJoin(source, eq(source.id, biographyVersion.restoredFromId))
      .orderBy(...NEWEST_BIOGRAPHY_FIRST)
      .offset(1)
      .limit(limit);
  }

  public countBiographyVersions() {
    return this.db.$count(biographyVersion);
  }

  /** Saves a new current biography. */
  public async createBiographyVersion(
    content: RichTextDocument,
    restored_from_id: string | null = null,
  ) {
    const rows = await this.db
      .insert(biographyVersion)
      .values({ content, restoredFromId: restored_from_id })
      .returning();
    return rows[0];
  }

  /** Makes a copy of an older version the current one; history is kept. */
  public async restoreBiographyVersion(id: string) {
    const version = await this.getBiographyVersion(id);
    if (!version) return null;
    return this.createBiographyVersion(version.content, version.id);
  }
}
