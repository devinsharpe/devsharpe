/**
 * Loads the site's content into the database from the files next to this
 * one: `data/*.ts` for the lists and settings, `content/*.md` for the
 * biography and project pages. Everything goes through the same validation
 * and repository code as the admin pages.
 *
 *   npm run seed                          # every seed, in order
 *   npm run seed -- projects cameras      # only these
 *   npm run seed -- --dry-run             # validate and print; no database access
 *   npm run seed -- --update              # also overwrite rows that differ
 *
 * Seeds: site, biography, positions, projects, hardware, software, cameras,
 * links. Photos, collections, and the rest of the media library aren't seeded.
 *
 * Safe to re-run. It never deletes anything, and new items go at the end of
 * their list. A row that differs from the seed is skipped unless `--update` is
 * given, which overwrites it (the biography gets a new version instead, so the
 * old one stays in its history). Rich text with images is never overwritten.
 */
import {
  type PreparedSeed,
  prepareSeeds,
  SEED_NAMES,
  SeedDataError,
  type SeedName,
  type SeedOutcome,
} from "./seeders.server";

const USAGE = `Usage: npm run seed -- [--dry-run] [--update] [${SEED_NAMES.join("|")} ...]`;
const FLAGS = new Set(["--dry-run", "--update", "--help"]);

const args = process.argv.slice(2);
const unknown = args.filter((arg) =>
  arg.startsWith("-") ? !FLAGS.has(arg) : !SEED_NAMES.includes(arg as SeedName),
);
if (args.includes("--help") || unknown.length > 0) {
  if (unknown.length > 0) console.error(`Unknown: ${unknown.join(", ")}`);
  console.log(USAGE);
  process.exit(unknown.length > 0 ? 1 : 0);
}

const dry_run = args.includes("--dry-run");
const update = args.includes("--update");
const chosen = new Set(args.filter((arg) => !arg.startsWith("-")));
// Always in the canonical order, whatever order they were named in.
const names = SEED_NAMES.filter((name) => chosen.size === 0 || chosen.has(name));

let seeds: PreparedSeed[];
try {
  seeds = prepareSeeds(names);
} catch (error) {
  if (!(error instanceof SeedDataError)) throw error;
  console.error(`The seed data has problems; nothing was written.\n`);
  for (const problem of error.problems) console.error(`  ${problem}`);
  process.exit(1);
}

if (dry_run) {
  for (const seed of seeds) {
    console.log(`${seed.name}`);
    for (const line of seed.preview) console.log(`  ${line}`);
  }
  console.log(`\nDry run: ${seeds.length} seed(s) validated, nothing written.`);
  process.exit(0);
}

// Imported lazily so a dry run never needs DATABASE_URL. It loads .env, and
// doesn't connect until the first query.
const { db } = await import("../index.server");
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL isn't set (in the environment or .env).");
  process.exit(1);
}
const [
  { AboutRepository },
  { ProjectsRepository },
  { GearRepository },
  { LinksRepository },
  { SiteRepository },
] = await Promise.all([
  import("../../repositories/about.repository.server"),
  import("../../repositories/projects.repository.server"),
  import("../../repositories/gear.repository.server"),
  import("../../repositories/links.repository.server"),
  import("../../repositories/site.repository.server"),
]);
const repos = {
  about: new AboutRepository(db),
  projects: new ProjectsRepository(db),
  gear: new GearRepository(db),
  links: new LinksRepository(db),
  site: new SiteRepository(db),
};

const totals: Record<SeedOutcome, number> = {
  added: 0,
  updated: 0,
  unchanged: 0,
  skipped: 0,
};
const report = (outcome: SeedOutcome, label: string, note?: string) => {
  totals[outcome]++;
  console.log(`  ${outcome.padEnd(9)} ${label}${note ? ` (${note})` : ""}`);
};

try {
  for (const seed of seeds) {
    console.log(seed.name);
    await seed.run(repos, { update }, report);
  }
  console.log(
    `\nDone: ${totals.added} added, ${totals.updated} updated, ` +
      `${totals.unchanged} unchanged, ${totals.skipped} skipped.`,
  );
  if (totals.skipped > 0 && !update) {
    console.log("Run with --update to overwrite the rows that differ.");
  }
} catch (error) {
  const code =
    (error as { code?: string })?.code ??
    (error as { cause?: { code?: string } })?.cause?.code;
  if (code === "42P01") {
    console.error("\nA table doesn't exist yet. Run `npm run migrate` first.");
  } else {
    console.error(error);
  }
  process.exitCode = 1;
} finally {
  await db.$client.end();
}
