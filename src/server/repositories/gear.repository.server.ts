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

  private listCameras(p: PaginationArg) {
    const pagination = buildPaginationQueryAugments(p);
    return this.db
      .select()
      .from(camera)
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  private listHardwareItems(p: PaginationArg) {
    const pagination = buildPaginationQueryAugments(p);

    return this.db
      .select()
      .from(hardwareItem)
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  private listSoftwareItems(p: PaginationArg) {
    const pagination = buildPaginationQueryAugments(p);

    return this.db
      .select()
      .from(softwareItem)
      .limit(pagination.limit)
      .offset(pagination.offset);
  }

  public list(type: GearType, pagination?: PaginationArg) {
    switch (type) {
      case "hardware-item":
        return this.listHardwareItems(pagination);
      case "software-item":
        return this.listSoftwareItems(pagination);
      case "camera":
        return this.listCameras(pagination);
      default:
        throw new Error("Invalid gear type");
    }
  }

  public validateNewHardwareItem(item: unknown): item is NewHardwareItem {
    return hardwareItemInsertSchema.validate(item);
  }
}
