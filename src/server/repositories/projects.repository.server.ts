import { asc, desc, eq, getColumns, sql } from "drizzle-orm";
import type { RichTextDocument } from "../../lib/rich-text";
import { AppDatabase } from "../database/index.server";
import { buildReorderQuery, nextSortOrder } from "../database/ordering.server";
import {
  NewProjectItem,
  project,
  projectPage,
  type ProjectPage,
} from "../database/schema.server";

/** What the editor shows about a page's saved and published versions. */
export function toProjectPageStatus(page: ProjectPage | null) {
  return {
    draftUpdatedAt: page?.draftUpdatedAt ?? null,
    publishedAt: page?.publishedAt ?? null,
    isPublished: page?.publishedContent != null,
    // Both columns come back from jsonb with normalized key order, so equal
    // documents always stringify identically.
    hasUnpublishedChanges:
      page?.draftContent != null &&
      JSON.stringify(page.draftContent) !==
        JSON.stringify(page.publishedContent),
  };
}
export type ProjectPageStatus = ReturnType<typeof toProjectPageStatus>;

export class ProjectsRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  /** Active projects first, then retired; each group in its own sort order. */
  public listProjects() {
    return this.db
      .select()
      .from(project)
      .orderBy(desc(project.isActive), asc(project.sortOrder), asc(project.id));
  }

  /**
   * Projects plus whether each has a published detail page (publishing
   * requires text, so published means there's something to read).
   */
  private selectWithPageStatus() {
    return this.db
      .select({
        ...getColumns(project),
        hasPublishedPage: sql<boolean>`${projectPage.publishedContent} is not null`,
      })
      .from(project)
      .leftJoin(projectPage, eq(projectPage.projectId, project.id));
  }

  /** Same order as `listProjects`, with `hasPublishedPage`. */
  public listProjectsWithPageStatus() {
    return this.selectWithPageStatus().orderBy(
      desc(project.isActive),
      asc(project.sortOrder),
      asc(project.id),
    );
  }

  /** The first `limit` active projects, in their sort order, with `hasPublishedPage`. */
  public listActiveProjects(limit: number) {
    return this.selectWithPageStatus()
      .where(eq(project.isActive, true))
      .orderBy(asc(project.sortOrder), asc(project.id))
      .limit(limit);
  }

  public async getProject(id: string) {
    const rows = await this.db
      .select()
      .from(project)
      .where(eq(project.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  public async createProject(item: NewProjectItem) {
    const is_active = item.isActive ?? true;
    const rows = await this.db
      .insert(project)
      .values({
        ...item,
        sortOrder: nextSortOrder(
          project,
          project.sortOrder,
          eq(project.isActive, is_active),
        ),
      })
      .returning();
    return rows[0];
  }

  public async updateProject({ id, ...item }: NewProjectItem) {
    const existing = await this.getProject(id);
    if (!existing) return null;
    // Switching between active and retired moves it to the end of the other list.
    const sortOrder =
      item.isActive === undefined || existing.isActive === item.isActive
        ? undefined
        : nextSortOrder(
            project,
            project.sortOrder,
            eq(project.isActive, item.isActive),
          );
    const rows = await this.db
      .update(project)
      .set({ ...item, sortOrder })
      .where(eq(project.id, id))
      .returning();
    return rows[0] ?? null;
  }

  public async deleteProject(id: string) {
    const rows = await this.db
      .delete(project)
      .where(eq(project.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /** Sets `sort_order` to each id's index in `ids`, within one group. */
  public async reorderProjects(is_active: boolean, ids: string[]) {
    if (!ids.length) return;
    await this.db.execute(
      buildReorderQuery(
        project,
        project.id,
        ids,
        eq(project.isActive, is_active),
      ),
    );
  }

  public async getProjectPage(project_id: string) {
    const rows = await this.db
      .select()
      .from(projectPage)
      .where(eq(projectPage.projectId, project_id))
      .limit(1);
    return rows[0] ?? null;
  }

  /** Saves the draft, creating the page on first save. The public page is unchanged. */
  public async saveProjectPageDraft(
    project_id: string,
    content: RichTextDocument,
  ) {
    const now = new Date();
    const draft = { draftContent: content, draftUpdatedAt: now };
    const rows = await this.db
      .insert(projectPage)
      .values({ projectId: project_id, ...draft })
      .onConflictDoUpdate({
        target: projectPage.projectId,
        set: { ...draft, updatedAt: now },
      })
      .returning();
    return rows[0];
  }

  /** Saves `content` as the draft and makes it the public page, in one write. */
  public async publishProjectPage(
    project_id: string,
    content: RichTextDocument,
  ) {
    const now = new Date();
    const page = {
      draftContent: content,
      draftUpdatedAt: now,
      publishedContent: content,
      publishedAt: now,
    };
    const rows = await this.db
      .insert(projectPage)
      .values({ projectId: project_id, ...page })
      .onConflictDoUpdate({
        target: projectPage.projectId,
        set: { ...page, updatedAt: now },
      })
      .returning();
    return rows[0];
  }

  /** Takes the public page down; the draft is kept. */
  public async unpublishProjectPage(project_id: string) {
    const rows = await this.db
      .update(projectPage)
      .set({ publishedContent: null, publishedAt: null })
      .where(eq(projectPage.projectId, project_id))
      .returning();
    return rows[0] ?? null;
  }
}
