// Production migrations: applies the pending migrations in ./drizzle, the same
// ones `npm run migrate` (drizzle-kit) applies, with drizzle-orm's own
// migrator, so the production image needs neither drizzle-kit nor
// node_modules. Both record what's applied in the same table
// (drizzle.__drizzle_migrations), so either can follow the other.
//
// Bundled into .output/tools/migrate.mjs by docker/vite.tools.config.mjs and
// run by docker/start.mjs before the server starts. Rejects on failure.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const connection_string = process.env.DATABASE_URL;
if (!connection_string) {
  console.error("DATABASE_URL isn't set.");
  process.exit(1);
}

const db = drizzle({ connection: connection_string });
try {
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("Migrations are up to date.");
} finally {
  await db.$client.end();
}
