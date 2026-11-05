import { eq } from "drizzle-orm";
import { AppDatabase } from "../database/index.server";
import {
  camera,
  hardwareItem,
  hardwareItemInsertSchema,
  NewHardwareItem,
  softwareItem,
} from "../database/schema.server";
import { buildPaginationQueryAugments, PaginationArg } from "~/lib/pagination";

type GearType = "hardware-item" | "software-item" | "camera";

export class GearRepository {
  private db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  public listCameras(p: PaginationArg) {
    const pagination = buildPaginationQueryAugments(p);
    return this.db
      .select()
      .from(camera)
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  public listHardwareItems(p: PaginationArg) {
    const pagination = buildPaginationQueryAugments(p);

    return this.db
      .select()
      .from(hardwareItem)
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  public listSoftwareItems(p: PaginationArg) {
    const pagination = buildPaginationQueryAugments(p);

    return this.db
      .select()
      .from(softwareItem)
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  public async createHardwareItem(item: NewHardwareItem) {
    const new_item = await this.db
      .insert(hardwareItem)
      .values(item)
      .returning();
    return new_item[0];
  }

  public async getCamera(id: string) {
    const cameras = await this.db
      .select()
      .from(camera)
      .where(eq(camera.id, id))
      .limit(1);
    return cameras.length ? cameras[0] : null;
  }

  public async getHardwareItem(id: string) {
    const hardware_items = await this.db
      .select()
      .from(hardwareItem)
      .where(eq(hardwareItem.id, id))
      .limit(1);
    return hardware_items.length ? hardware_items[0] : null;
  }

  public validateNewHardwareItem(item: unknown) {
    return hardwareItemInsertSchema.safeParse(item);
  }
}
