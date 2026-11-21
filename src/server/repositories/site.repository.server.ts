import { eq } from "drizzle-orm";
import { AppDatabase } from "../database/index.server";
import { siteSettings } from "../database/schema.server";

/** The settings table always has at most one row, with id 1. */
const SETTINGS_ID = 1;

export class SiteRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  public async getSettings() {
    const rows = await this.db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, SETTINGS_ID))
      .limit(1);
    return rows[0] ?? null;
  }

  /** The top of /links: the line under the name and the library photo. */
  public async updateLinksProfile(profile: {
    bio: string | null;
    photoMediaId: string | null;
  }) {
    const values = {
      linksBio: profile.bio,
      linksPhotoMediaId: profile.photoMediaId,
    };
    const rows = await this.db
      .insert(siteSettings)
      .values({ id: SETTINGS_ID, ...values })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { ...values, updatedAt: new Date() },
      })
      .returning();
    return rows[0];
  }

  public async updateSubtitle(subtitle: string) {
    const rows = await this.db
      .insert(siteSettings)
      .values({ id: SETTINGS_ID, subtitle })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { subtitle, updatedAt: new Date() },
      })
      .returning();
    return rows[0];
  }
}
