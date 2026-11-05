import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./relations.server";

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  relations,
});

export type AppDatabase = typeof db;
