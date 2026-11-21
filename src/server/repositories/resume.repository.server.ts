import { and, asc, desc, eq, lt } from "drizzle-orm";
import { AppDatabase } from "../database/index.server";
import { resume } from "../database/schema.server";

/** Current first: the ready résumé made current most recently. */
const CURRENT_FIRST = [desc(resume.madeCurrentAt), desc(resume.createdAt)] as const;

/** What the admin sees about a résumé (no storage key). */
const SUMMARY_COLUMNS = {
  id: resume.id,
  originalName: resume.originalName,
  byteSize: resume.byteSize,
  madeCurrentAt: resume.madeCurrentAt,
  createdAt: resume.createdAt,
};

export class ResumeRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /** The résumé /resume.pdf serves, or null if none has been uploaded. */
  public async getCurrentResume() {
    const rows = await this.db
      .select()
      .from(resume)
      .where(eq(resume.status, "ready"))
      .orderBy(...CURRENT_FIRST)
      .limit(1);
    return rows[0] ?? null;
  }

  /** Ready résumés, current first, then the previous ones newest first. */
  public listReadyResumes(limit: number) {
    return this.db
      .select(SUMMARY_COLUMNS)
      .from(resume)
      .where(eq(resume.status, "ready"))
      .orderBy(...CURRENT_FIRST)
      .limit(limit);
  }

  public async getResume(id: string) {
    const rows = await this.db
      .select()
      .from(resume)
      .where(eq(resume.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  /** Records an upload before the browser sends the file. */
  public async createPendingResume(item: {
    id: string;
    storageKey: string;
    originalName: string;
    byteSize: number;
  }) {
    const rows = await this.db
      .insert(resume)
      .values({ ...item, status: "pending" })
      .returning();
    return rows[0];
  }

  /** A checked upload becomes the current résumé. */
  public async markResumeReady(id: string) {
    const rows = await this.db
      .update(resume)
      .set({ status: "ready", madeCurrentAt: new Date() })
      .where(and(eq(resume.id, id), eq(resume.status, "pending")))
      .returning();
    return rows[0] ?? null;
  }

  /** Makes a previous résumé the current one again. */
  public async makeResumeCurrent(id: string) {
    const rows = await this.db
      .update(resume)
      .set({ madeCurrentAt: new Date() })
      .where(and(eq(resume.id, id), eq(resume.status, "ready")))
      .returning();
    return rows[0] ?? null;
  }

  public async deleteResume(id: string) {
    const rows = await this.db
      .delete(resume)
      .where(eq(resume.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /** Uploads that were started before `before` and never finished. */
  public listStalePendingResumes(before: Date, limit: number) {
    return this.db
      .select({ id: resume.id, storageKey: resume.storageKey })
      .from(resume)
      .where(and(eq(resume.status, "pending"), lt(resume.createdAt, before)))
      .orderBy(asc(resume.createdAt))
      .limit(limit);
  }
}
