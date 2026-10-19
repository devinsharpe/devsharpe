import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { relationParts } from "./schema.server";

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  relations: { ...relationParts },
});

export type AppDatabase = typeof db;
