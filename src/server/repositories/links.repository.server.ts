import { and, asc, eq, sql } from "drizzle-orm";
import type { AppDatabase } from "../database/index.server";
import { buildReorderQuery, nextSortOrder } from "../database/ordering.server";
import { linkItem, type NewLinkItem } from "../database/schema.server";

type LinkDetails = Pick<NewLinkItem, "title" | "url" | "isVisible">;

const IN_ORDER = [asc(linkItem.sortOrder), asc(linkItem.createdAt), asc(linkItem.id)];

/** What the public page shows for a link. */
const PUBLIC_LINK = {
  id: linkItem.id,
  title: linkItem.title,
  url: linkItem.url,
};

/** Returned by writes: enough to name the link in a toast. */
const LINK_REFERENCE = { id: linkItem.id, name: linkItem.title };

export class LinksRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /** The links on the page, in order. */
  public listVisibleLinks() {
    return this.db
      .select(PUBLIC_LINK)
      .from(linkItem)
      .where(eq(linkItem.isVisible, true))
      .orderBy(...IN_ORDER);
  }

  /** Admin: every link, hidden ones too, with click counts. */
  public listAllLinks() {
    return this.db.select().from(linkItem).orderBy(...IN_ORDER);
  }

  public async listLinkIds() {
    const rows = await this.db
      .select({ id: linkItem.id })
      .from(linkItem)
      .orderBy(...IN_ORDER);
    return rows.map((row) => row.id);
  }

  public countLinks() {
    return this.db.$count(linkItem);
  }

  /** Adds a link at the end of the list. */
  public async createLink(details: LinkDetails) {
    const rows = await this.db
      .insert(linkItem)
      .values({
        ...details,
        sortOrder: nextSortOrder(linkItem, linkItem.sortOrder),
      })
      .returning(LINK_REFERENCE);
    return rows[0];
  }

  public async updateLink(id: string, details: LinkDetails) {
    const rows = await this.db
      .update(linkItem)
      .set(details)
      .where(eq(linkItem.id, id))
      .returning(LINK_REFERENCE);
    return rows[0] ?? null;
  }

  public async setVisibility(id: string, is_visible: boolean) {
    const rows = await this.db
      .update(linkItem)
      .set({ isVisible: is_visible })
      .where(eq(linkItem.id, id))
      .returning(LINK_REFERENCE);
    return rows[0] ?? null;
  }

  public async deleteLink(id: string) {
    const rows = await this.db
      .delete(linkItem)
      .where(eq(linkItem.id, id))
      .returning(LINK_REFERENCE);
    return rows[0] ?? null;
  }

  /** Sets each link's position to its index in `ids`, in one statement. */
  public async reorderLinks(ids: string[]) {
    if (ids.length === 0) return;
    await this.db.execute(
      buildReorderQuery(linkItem, linkItem.id, ids, undefined, "uuid"),
    );
  }

  /**
   * Adds one to a link's count. Hidden or unknown links aren't counted.
   * Doesn't touch `updated_at`, which tracks edits.
   */
  public async recordClick(id: string) {
    const rows = await this.db
      .update(linkItem)
      .set({
        clicks: sql`${linkItem.clicks} + 1`,
        lastClickedAt: new Date(),
        updatedAt: sql`${linkItem.updatedAt}`,
      })
      .where(and(eq(linkItem.id, id), eq(linkItem.isVisible, true)))
      .returning({ id: linkItem.id });
    return rows.length > 0;
  }
}
