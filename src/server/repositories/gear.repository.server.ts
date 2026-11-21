import { asc, eq, getColumns } from "drizzle-orm";
import { AppDatabase } from "../database/index.server";
import { buildReorderQuery, nextSortOrder } from "../database/ordering.server";
import {
  camera,
  disclosureMessage,
  hardwareItem,
  NewCameraItem,
  NewHardwareItem,
  NewSoftwareItem,
  softwareItem,
} from "../database/schema.server";
import { buildPaginationQueryAugments, PaginationArg } from "~/lib/pagination";
import type { GearKind } from "~/lib/gear";

const GEAR_TABLES = {
  hardware: hardwareItem,
  software: softwareItem,
  camera,
} as const;

type GearTable = (typeof GEAR_TABLES)[GearKind];

export class GearRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  // <-- Cameras -->
  /** Every camera, in display order (the public /uses page). */
  public listAllCameras() {
    return this.db
      .select()
      .from(camera)
      .orderBy(asc(camera.sortOrder), asc(camera.id));
  }

  public listCameras(p: PaginationArg) {
    const pagination = buildPaginationQueryAugments(p);
    return this.db
      .select()
      .from(camera)
      .orderBy(asc(camera.sortOrder), asc(camera.id))
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  public async getCamera(id: string) {
    const cameras = await this.db
      .select()
      .from(camera)
      .where(eq(camera.id, id))
      .limit(1);
    return cameras.length ? cameras[0] : null;
  }

  public async createCamera(item: NewCameraItem) {
    const rows = await this.db
      .insert(camera)
      .values({ ...item, sortOrder: nextSortOrder(camera, camera.sortOrder) })
      .returning();
    return rows[0];
  }

  public async updateCamera({ id, ...item }: NewCameraItem) {
    const rows = await this.db
      .update(camera)
      .set(item)
      .where(eq(camera.id, id))
      .returning();
    return rows[0] ?? null;
  }

  public async deleteCamera(id: string) {
    const rows = await this.db
      .delete(camera)
      .where(eq(camera.id, id))
      .returning();
    return rows[0] ?? null;
  }

  // <-- Hardware Items -->
  /** Every hardware item, in display order (the public /uses page). */
  public listAllHardwareItems() {
    return this.db
      .select()
      .from(hardwareItem)
      .orderBy(asc(hardwareItem.sortOrder), asc(hardwareItem.id));
  }

  public listHardwareItems(p: PaginationArg) {
    const pagination = buildPaginationQueryAugments(p);

    return this.db
      .select()
      .from(hardwareItem)
      .orderBy(asc(hardwareItem.sortOrder), asc(hardwareItem.id))
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  public async getHardwareItem(id: string) {
    const hardware_items = await this.db
      .select()
      .from(hardwareItem)
      .where(eq(hardwareItem.id, id))
      .limit(1);
    return hardware_items.length ? hardware_items[0] : null;
  }

  public async createHardwareItem(item: NewHardwareItem) {
    const new_item = await this.db
      .insert(hardwareItem)
      .values({ ...item, sortOrder: nextSortOrder(hardwareItem, hardwareItem.sortOrder) })
      .returning();
    return new_item[0];
  }

  public async updateHardwareItem({ id, ...item }: NewHardwareItem) {
    const rows = await this.db
      .update(hardwareItem)
      .set(item)
      .where(eq(hardwareItem.id, id))
      .returning();
    return rows[0] ?? null;
  }

  public async deleteHardwareItem(id: string) {
    const rows = await this.db
      .delete(hardwareItem)
      .where(eq(hardwareItem.id, id))
      .returning();
    return rows[0] ?? null;
  }

  // <-- Software Items -->
  /** Every software item, in display order, with its disclosure note (if any): the public /uses page. */
  public listPublicSoftwareItems() {
    return this.db
      .select({
        ...getColumns(softwareItem),
        disclosure: {
          message: disclosureMessage.message,
          link: disclosureMessage.link,
        },
      })
      .from(softwareItem)
      .leftJoin(
        disclosureMessage,
        eq(softwareItem.disclosureMessageId, disclosureMessage.id),
      )
      .orderBy(asc(softwareItem.sortOrder), asc(softwareItem.id));
  }

  public listSoftwareItems(p: PaginationArg) {
    const pagination = buildPaginationQueryAugments(p);

    return this.db
      .select()
      .from(softwareItem)
      .orderBy(asc(softwareItem.sortOrder), asc(softwareItem.id))
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  public async getSoftwareItem(id: string) {
    const software_items = await this.db
      .select()
      .from(softwareItem)
      .where(eq(softwareItem.id, id))
      .limit(1);
    return software_items.length ? software_items[0] : null;
  }

  public async createSoftwareItem(item: NewSoftwareItem) {
    const rows = await this.db
      .insert(softwareItem)
      .values({ ...item, sortOrder: nextSortOrder(softwareItem, softwareItem.sortOrder) })
      .returning();
    return rows[0];
  }

  public async updateSoftwareItem({ id, ...item }: NewSoftwareItem) {
    const rows = await this.db
      .update(softwareItem)
      .set(item)
      .where(eq(softwareItem.id, id))
      .returning();
    return rows[0] ?? null;
  }

  public async deleteSoftwareItem(id: string) {
    const rows = await this.db
      .delete(softwareItem)
      .where(eq(softwareItem.id, id))
      .returning();
    return rows[0] ?? null;
  }

  // <-- Ordering -->
  /** Sets `sort_order` to each id's position in `ids`, in one statement. */
  public async reorder(kind: GearKind, ids: string[]) {
    if (!ids.length) return;
    const table = GEAR_TABLES[kind];
    await this.db.execute(buildReorderQuery(table, table.id, ids));
  }
}

/** A software item as /uses shows it. */
export type PublicSoftwareItem = Awaited<
  ReturnType<GearRepository["listPublicSoftwareItems"]>
>[number];
