import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./relations.server";

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL!,
    // Idle connections don't keep the process running, so it exits as soon
    // as the server closes on shutdown (instead of waiting out their timeout,
    // which outlasts `docker stop`'s grace period).
    allowExitOnIdle: true,
  },
  relations,
});

export type AppDatabase = typeof db;
