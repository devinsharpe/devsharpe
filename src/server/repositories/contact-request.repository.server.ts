import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { CONTACT_REQUESTS_PAGE_SIZE } from "~/lib/contact";
import { AppDatabase } from "../database/index.server";
import { contactRequest } from "../database/schema.server";

const NEWEST_FIRST = [
  desc(contactRequest.createdAt),
  desc(contactRequest.id),
] as const;

export class ContactRequestRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /** Saves a message from the contact form. */
  public async createContactRequest(item: {
    name: string;
    email: string;
    phone: string | null;
    message: string;
  }) {
    const rows = await this.db
      .insert(contactRequest)
      .values(item)
      .returning({ id: contactRequest.id });
    return rows[0];
  }

  public countUnread() {
    return this.db.$count(contactRequest, isNull(contactRequest.readAt));
  }

  /** The newest `limit` requests not yet marked read. */
  public listUnread(limit: number) {
    return this.db
      .select()
      .from(contactRequest)
      .where(isNull(contactRequest.readAt))
      .orderBy(...NEWEST_FIRST)
      .limit(limit);
  }

  /** One page of the requests marked read, newest first. */
  public async listRead(page: number) {
    const where = isNotNull(contactRequest.readAt);
    const total = await this.db.$count(contactRequest, where);
    const page_count = Math.max(
      1,
      Math.ceil(total / CONTACT_REQUESTS_PAGE_SIZE),
    );
    // Past the end (e.g. after deleting some) shows the last page instead.
    const current = Math.min(page, page_count);
    const items =
      total === 0
        ? []
        : await this.db
            .select()
            .from(contactRequest)
            .where(where)
            .orderBy(...NEWEST_FIRST)
            .limit(CONTACT_REQUESTS_PAGE_SIZE)
            .offset((current - 1) * CONTACT_REQUESTS_PAGE_SIZE);
    return { items, total, page: current, page_count };
  }

  /** Marks a request read (now) or new again. Null if it doesn't exist. */
  public async setRead(id: string, read: boolean) {
    const rows = await this.db
      .update(contactRequest)
      .set({ readAt: read ? new Date() : null })
      .where(
        and(
          eq(contactRequest.id, id),
          // Marking read again keeps the first time it was read.
          read ? isNull(contactRequest.readAt) : undefined,
        ),
      )
      .returning({ id: contactRequest.id });
    if (rows[0]) return rows[0];
    // Already read: still a success, as long as it exists.
    const existing = await this.db
      .select({ id: contactRequest.id })
      .from(contactRequest)
      .where(eq(contactRequest.id, id))
      .limit(1);
    return existing[0] ?? null;
  }

  public async deleteContactRequest(id: string) {
    const rows = await this.db
      .delete(contactRequest)
      .where(eq(contactRequest.id, id))
      .returning({ id: contactRequest.id, name: contactRequest.name });
    return rows[0] ?? null;
  }
}
