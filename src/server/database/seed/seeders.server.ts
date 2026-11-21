// Seeds: turns the data in ./data and ./content into rows, through the same
// schemas and repositories the admin pages use. Preparing a seed validates
// every entry up front (no database needed); running it writes.
//
// Running never deletes anything, and leaves existing rows alone unless
// `update` is set:
//   - missing  → added (new list items go at the end of their list)
//   - matching → unchanged
//   - differs  → skipped, or overwritten with `update`
import { existsSync, readdirSync, readFileSync } from "node:fs";
import * as z from "zod";
import { positionInputSchema } from "~/lib/about";
import {
  cameraInputSchema,
  hardwareItemInputSchema,
  softwareItemInputSchema,
} from "~/lib/gear";
import { LINKS_MAX, linkInputSchema, linksProfileSchema } from "~/lib/links";
import { projectInputSchema } from "~/lib/projects";
import type { RichTextDocument } from "~/lib/rich-text";
import { siteSubtitleSchema } from "~/lib/site";
import type { AboutRepository } from "../../repositories/about.repository.server";
import type { GearRepository } from "../../repositories/gear.repository.server";
import type { LinksRepository } from "../../repositories/links.repository.server";
import type { ProjectsRepository } from "../../repositories/projects.repository.server";
import type { SiteRepository } from "../../repositories/site.repository.server";
import { cameras, hardware, software } from "./data/gear";
import { positions } from "./data/positions";
import { projects } from "./data/projects";
import { links, site } from "./data/site";
import { documentToMarkdown, markdownToDocument } from "./rich-text.server";

/** Every seed, in the order `npm run seed` runs them. */
export const SEED_NAMES = [
  "site",
  "biography",
  "positions",
  "projects",
  "hardware",
  "software",
  "cameras",
  "links",
] as const;
export type SeedName = (typeof SEED_NAMES)[number];

export interface SeedRepositories {
  about: AboutRepository;
  projects: ProjectsRepository;
  gear: GearRepository;
  links: LinksRepository;
  site: SiteRepository;
}

export interface SeedOptions {
  /** Overwrite rows that differ from the seed (otherwise they're skipped). */
  update: boolean;
}

export type SeedOutcome = "added" | "updated" | "unchanged" | "skipped";
export type SeedReport = (outcome: SeedOutcome, label: string, note?: string) => void;

export interface PreparedSeed {
  name: SeedName;
  /** One line per entry, printed by --dry-run. */
  preview: string[];
  run: (
    repos: SeedRepositories,
    options: SeedOptions,
    report: SeedReport,
  ) => Promise<void>;
}

/** Seed data that doesn't pass its form's validation. */
export class SeedDataError extends Error {
  constructor(public problems: string[]) {
    super(`${problems.length} problem(s) in the seed data`);
  }
}

const CONTENT_DIR = new URL("./content/", import.meta.url);
const PROJECT_PAGES_DIR = new URL("./projects/", CONTENT_DIR);

const describeError = (error: unknown) =>
  error instanceof z.ZodError
    ? z.prettifyError(error).replace(/\n/g, "\n    ")
    : error instanceof Error
      ? error.message
      : String(error);

/** Validates each entry, collecting every problem before giving up. */
function parseAll<T, R>(
  seed: SeedName,
  items: readonly T[],
  label: (item: T) => string,
  parse: (item: T) => R,
  key?: (row: R) => string,
): R[] {
  const problems: string[] = [];
  const rows: R[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    try {
      const row = parse(item);
      if (key) {
        const id = key(row);
        if (seen.has(id)) throw new Error(`"${id}" appears more than once`);
        seen.add(id);
      }
      rows.push(row);
    } catch (error) {
      problems.push(`${seed}: ${label(item)}: ${describeError(error)}`);
    }
  }
  if (problems.length > 0) throw new SeedDataError(problems);
  return rows;
}

/** Whether `existing` has a different value for any field the seed sets. */
function differs(seed: object, existing: object) {
  const current = existing as Record<string, unknown>;
  return Object.entries(seed).some(
    ([field, value]) =>
      JSON.stringify(value ?? null) !== JSON.stringify(current[field] ?? null),
  );
}

/** Add, leave, skip, or overwrite one keyed row (see the top of this file). */
async function upsert<T extends object>(
  row: T,
  label: string,
  { update }: SeedOptions,
  report: SeedReport,
  store: {
    get: () => Promise<object | null>;
    create: () => Promise<unknown>;
    update: () => Promise<unknown>;
  },
) {
  const existing = await store.get();
  if (!existing) {
    await store.create();
    report("added", label);
  } else if (!differs(row, existing)) {
    report("unchanged", label);
  } else if (!update) {
    report("skipped", label, "differs from the seed; --update overwrites it");
  } else {
    await store.update();
    report("updated", label);
  }
}

/** A document as Markdown for comparing; spaces at the ends of lines don't count. */
function comparableMarkdown(document: RichTextDocument) {
  return documentToMarkdown(document)?.replace(/[ \t]+$/gm, "") ?? null;
}

/** Rich text from content/, with its Markdown as the editor would write it (for comparing). */
function readRichText(file: URL, label: string) {
  const document = markdownToDocument(readFileSync(file, "utf8"), label);
  return { document, markdown: comparableMarkdown(document) };
}

/**
 * Compares a saved document with a seed's: "same", "differs", or "images"
 * when it has images (Markdown can't hold them, so it's never overwritten).
 */
function compareRichText(saved: RichTextDocument, seed_markdown: string | null) {
  const saved_markdown = comparableMarkdown(saved);
  if (saved_markdown === null) return "images" as const;
  return saved_markdown === seed_markdown ? ("same" as const) : ("differs" as const);
}

const range = (start: string, end: string | null) => `${start}–${end ?? "Current"}`;

// <-- Seeds -->

function prepareSite(): PreparedSeed {
  const [subtitle] = parseAll("site", [site], () => "subtitle", (seed) =>
    siteSubtitleSchema.parse({ subtitle: seed.subtitle }).subtitle,
  );
  // Only set when the seed gives one (null clears it, so leave it alone).
  const links_bio =
    site.linksBio === undefined
      ? undefined
      : parseAll("site", [site], () => "linksBio", (seed) =>
          linksProfileSchema.shape.bio.parse(seed.linksBio),
        )[0];

  return {
    name: "site",
    preview: [
      `subtitle   "${subtitle}"`,
      ...(links_bio === undefined ? [] : [`links bio  "${links_bio ?? ""}"`]),
    ],
    run: async ({ site: repo }, options, report) => {
      const settings = await repo.getSettings();
      await upsert({ subtitle }, "subtitle", options, report, {
        get: async () =>
          settings?.subtitle == null ? null : { subtitle: settings.subtitle },
        create: () => repo.updateSubtitle(subtitle),
        update: () => repo.updateSubtitle(subtitle),
      });
      if (links_bio === undefined) return;
      // Saving the bio saves the photo too; keep whichever one is chosen.
      const save_bio = () =>
        repo.updateLinksProfile({
          bio: links_bio,
          photoMediaId: settings?.linksPhotoMediaId ?? null,
        });
      await upsert({ linksBio: links_bio }, "links bio", options, report, {
        get: async () =>
          settings?.linksBio == null ? null : { linksBio: settings.linksBio },
        create: save_bio,
        update: save_bio,
      });
    },
  };
}

function prepareBiography(): PreparedSeed {
  const [biography] = parseAll("biography", [new URL("biography.md", CONTENT_DIR)], () => "content/biography.md", (file) =>
    readRichText(file, "content/biography.md"),
  );
  return {
    name: "biography",
    preview: [`content/biography.md  ${biography.document.root.children.length} blocks`],
    run: async ({ about }, { update }, report) => {
      const current = await about.getCurrentBiography();
      if (!current) {
        await about.createBiographyVersion(biography.document);
        report("added", "biography");
        return;
      }
      const comparison = compareRichText(current.content, biography.markdown);
      if (comparison === "same") report("unchanged", "biography");
      else if (comparison === "images") {
        report("skipped", "biography", "the current one has images; edit it in the admin");
      } else if (!update) {
        report("skipped", "biography", "differs from the seed; --update saves the seed as a new version");
      } else {
        // A new version: the current one stays in the history, restorable from the admin.
        await about.createBiographyVersion(biography.document);
        report("updated", "biography", "the previous version is in the history");
      }
    },
  };
}

function preparePositions(): PreparedSeed {
  const rows = parseAll(
    "positions",
    positions,
    (seed) => seed.id,
    (seed) =>
      positionInputSchema.parse({
        id: seed.id,
        type: seed.type,
        title: seed.title,
        name: seed.name,
        link: seed.link ?? "",
        team: seed.team ?? "",
        location: seed.location ?? "",
        officeType: seed.officeType,
        startDate: seed.startDate,
        endDate: seed.endDate ?? "",
        description: seed.description ?? "",
        highlights: (seed.highlights ?? []).join("\n"),
        technologies: (seed.technologies ?? []).join(", "),
      }),
    (row) => row.id,
  );

  return {
    name: "positions",
    preview: rows.map(
      (row) =>
        `${row.type.padEnd(10)} ${row.id.padEnd(32)} ${row.title} @ ${row.name} (${range(row.startDate, row.endDate)})`,
    ),
    run: async ({ about }, options, report) => {
      for (const row of rows) {
        await upsert(row, row.id, options, report, {
          get: () => about.getPosition(row.id),
          create: () => about.createPosition(row),
          update: () => about.updatePosition(row),
        });
      }
    },
  };
}

function prepareProjects(): PreparedSeed {
  const rows = parseAll(
    "projects",
    projects,
    (seed) => seed.id,
    (seed) =>
      projectInputSchema.parse({
        id: seed.id,
        name: seed.name,
        status: seed.status,
        description: seed.description ?? "",
        appLink: seed.appLink ?? "",
        githubLink: seed.githubLink ?? "",
        badges: (seed.badges ?? []).join(", "),
        startDate: seed.startDate,
        endDate: seed.endDate ?? "",
      }),
    (row) => row.id,
  );

  // A write-up for a project that isn't in the list is probably a typo'd name.
  const page_files = existsSync(PROJECT_PAGES_DIR)
    ? readdirSync(PROJECT_PAGES_DIR).filter((file) => file.endsWith(".md"))
    : [];
  const ids = new Set(rows.map((row) => row.id));
  const orphans = page_files.filter((file) => !ids.has(file.slice(0, -3)));
  if (orphans.length > 0) {
    throw new SeedDataError(
      orphans.map((file) => `projects: content/projects/${file} doesn't match a project id`),
    );
  }
  const pages = new Map(
    parseAll(
      "projects",
      page_files,
      (file) => `content/projects/${file}`,
      (file) =>
        [
          file.slice(0, -3),
          readRichText(new URL(file, PROJECT_PAGES_DIR), `content/projects/${file}`),
        ] as const,
    ),
  );

  return {
    name: "projects",
    preview: rows.map(
      (row) =>
        `${(row.isActive ? "active" : "retired").padEnd(8)} ${row.id.padEnd(12)} ${row.name} (${range(row.startDate, row.isActive ? null : row.endDate)})` +
        (pages.has(row.id) ? "  + page" : ""),
    ),
    run: async ({ projects: repo }, options, report) => {
      for (const row of rows) {
        await upsert(row, row.id, options, report, {
          get: () => repo.getProject(row.id),
          create: () => repo.createProject(row),
          update: () => repo.updateProject(row),
        });

        const page = pages.get(row.id);
        if (!page) continue;
        const label = `${row.id} page`;
        const publish = () => repo.publishProjectPage(row.id, page.document);
        const saved = await repo.getProjectPage(row.id);
        if (!saved?.publishedContent && !saved?.draftContent) {
          await publish();
          report("added", label);
          continue;
        }
        // Both the public page and the draft have to match: an unpublished
        // page, or an edit in progress, counts as a difference.
        const comparisons = [
          saved.publishedContent
            ? compareRichText(saved.publishedContent, page.markdown)
            : "differs",
          saved.draftContent
            ? compareRichText(saved.draftContent, page.markdown)
            : "same",
        ];
        const comparison = comparisons.includes("images")
          ? "images"
          : comparisons.every((result) => result === "same")
            ? "same"
            : "differs";
        if (comparison === "same") report("unchanged", label);
        else if (comparison === "images") {
          report("skipped", label, "it has images; edit it in the admin");
        } else if (!options.update) {
          report("skipped", label, "differs from the seed; --update publishes the seed over it");
        } else {
          await publish();
          report("updated", label, "published; the old draft is replaced");
        }
      }
    },
  };
}

function prepareHardware(): PreparedSeed {
  const rows = parseAll("hardware", hardware, (seed) => seed.id, (seed) =>
    hardwareItemInputSchema.parse({ ...seed, link: seed.link ?? "" }),
    (row) => row.id,
  );
  return {
    name: "hardware",
    preview: rows.map((row) => `${row.id.padEnd(40)} ${row.purpose}: ${row.name}`),
    run: async ({ gear }, options, report) => {
      for (const row of rows) {
        await upsert(row, row.id, options, report, {
          get: () => gear.getHardwareItem(row.id),
          create: () => gear.createHardwareItem(row),
          update: () => gear.updateHardwareItem(row),
        });
      }
    },
  };
}

function prepareSoftware(): PreparedSeed {
  const rows = parseAll("software", software, (seed) => seed.id, (seed) =>
    softwareItemInputSchema.parse({
      ...seed,
      description: seed.description ?? "",
      link: seed.link ?? "",
    }),
    (row) => row.id,
  );
  return {
    name: "software",
    preview: rows.map((row) => `${row.id.padEnd(12)} ${row.purpose}: ${row.name}`),
    run: async ({ gear }, options, report) => {
      for (const row of rows) {
        await upsert(row, row.id, options, report, {
          get: () => gear.getSoftwareItem(row.id),
          create: () => gear.createSoftwareItem(row),
          update: () => gear.updateSoftwareItem(row),
        });
      }
    },
  };
}

function prepareCameras(): PreparedSeed {
  const rows = parseAll("cameras", cameras, (seed) => seed.id, (seed) =>
    cameraInputSchema.parse({
      ...seed,
      purpose: seed.purpose ?? "",
      shortDescription: seed.shortDescription ?? "",
      description: seed.description ?? "",
    }),
    (row) => row.id,
  );
  return {
    name: "cameras",
    preview: rows.map(
      (row) => `${row.id.padEnd(24)} ${row.name}${row.shortDescription ? ` ${row.shortDescription}` : ""}`,
    ),
    run: async ({ gear }, options, report) => {
      for (const row of rows) {
        await upsert(row, row.id, options, report, {
          get: () => gear.getCamera(row.id),
          create: () => gear.createCamera(row),
          update: () => gear.updateCamera(row),
        });
      }
    },
  };
}

function prepareLinks(): PreparedSeed {
  if (links.length > LINKS_MAX) {
    throw new SeedDataError([`links: the page holds up to ${LINKS_MAX} links`]);
  }
  const rows = parseAll(
    "links",
    links,
    (seed) => seed.url,
    (seed) =>
      linkInputSchema.parse({
        title: seed.title,
        url: seed.url,
        isVisible: seed.hidden ? "hidden" : "shown",
      }),
    (row) => row.url,
  );
  return {
    name: "links",
    preview: rows.map(
      (row) => `${row.title.padEnd(28)} ${row.url}${row.isVisible ? "" : "  (hidden)"}`,
    ),
    run: async ({ links: repo }, options, report) => {
      // Links have generated ids, so they're matched by URL.
      const saved = new Map(
        (await repo.listAllLinks()).map((link) => [link.url, link]),
      );
      for (const row of rows) {
        const existing = saved.get(row.url);
        await upsert(row, row.url, options, report, {
          get: async () => existing ?? null,
          create: () => repo.createLink(row),
          update: () => repo.updateLink(existing!.id, row),
        });
      }
    },
  };
}

const PREPARE: Record<SeedName, () => PreparedSeed> = {
  site: prepareSite,
  biography: prepareBiography,
  positions: preparePositions,
  projects: prepareProjects,
  hardware: prepareHardware,
  software: prepareSoftware,
  cameras: prepareCameras,
  links: prepareLinks,
};

/** Validates the named seeds' data. Throws a SeedDataError listing every problem. */
export function prepareSeeds(names: readonly SeedName[]) {
  const problems: string[] = [];
  const prepared: PreparedSeed[] = [];
  for (const name of names) {
    try {
      prepared.push(PREPARE[name]());
    } catch (error) {
      if (error instanceof SeedDataError) problems.push(...error.problems);
      else problems.push(`${name}: ${describeError(error)}`);
    }
  }
  if (problems.length > 0) throw new SeedDataError(problems);
  return prepared;
}
