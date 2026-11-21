// Server-only: the résumé downloads. /resume.pdf passes the uploaded PDF
// through from the bucket (which stays private); /resume.md is written fresh
// from the positions and projects in the database.
import { resumeIdSchema } from "../lib/resume";
import { toIdentifier } from "../lib/validation";
import { auth } from "./auth.server";
import { db } from "./database/index.server";
import type {
  PositionItem,
  ProjectItem,
  Resume,
} from "./database/schema.server";
import { getServerEnv } from "./env.server";
import { etagFor, matchesEtag, readSavedSubtitle } from "./feed.server";
import { getMediaStorage } from "./media/storage.server";
import { AboutRepository } from "./repositories/about.repository.server";
import { ProjectsRepository } from "./repositories/projects.repository.server";
import { ResumeRepository } from "./repositories/resume.repository.server";

// <-- Markdown -->

/** Characters that can change meaning anywhere in a line. */
const INLINE_SPECIALS = /[\\`*[\]<>~|]/g;
const WORD_CHAR = /[\p{L}\p{N}]/u;

/**
 * One line of plain text, safe to put anywhere in a line of Markdown:
 * whitespace (newlines too) collapses to single spaces, and characters that
 * would start formatting, links, or HTML are escaped.
 */
function inline(value: string) {
  return (
    value
      .replace(/\s+/g, " ")
      .trim()
      .replace(INLINE_SPECIALS, "\\$&")
      // Inside a word (snake_case) an underscore is literal; elsewhere it's emphasis.
      .replace(/_/g, (match, offset: number, whole: string) =>
        WORD_CHAR.test(whole[offset - 1] ?? "") &&
        WORD_CHAR.test(whole[offset + 1] ?? "")
          ? match
          : "\\_",
      )
      // "&amp;" would show as "&".
      .replace(/&(?=#?[\p{L}\p{N}]+;)/gu, "\\&")
  );
}

/**
 * `inline`, for text that starts a line (a paragraph or list item), where it
 * mustn't read as a heading, list, rule, or setext underline.
 */
function lineText(value: string) {
  return inline(value)
    .replace(/^(#{1,6}|[-+])(?=\s|$)/, "\\$1")
    .replace(/^(\d{1,9})([.)])(?=\s|$)/, "$1\\$2")
    .replace(/^(-+|=+)$/, "\\$1");
}

/** An ATX heading from escaped Markdown; a trailing " #" would otherwise be dropped. */
function heading(level: 1 | 2 | 3, markdown: string) {
  return `${"#".repeat(level)} ${markdown.replace(/(\s)(#+)$/, "$1\\$2")}`;
}

/**
 * An http(s) URL for a link destination, or null. Parsing percent-encodes
 * spaces, quotes, and angle brackets; parentheses are encoded too, since an
 * unmatched one would end the destination.
 */
function linkUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.href.replaceAll("(", "%28").replaceAll(")", "%29");
  } catch {
    return null;
  }
}

function link(text: string, url: string | null) {
  const href = linkUrl(url);
  return href ? `[${inline(text)}](${href})` : inline(text);
}

/** Paragraphs as typed (blank lines between), each joined onto one line as the site shows it. */
function paragraphs(value: string | null) {
  if (!value) return [];
  return value
    .split(/\n\s*\n/)
    .map(lineText)
    .filter(Boolean);
}

function dateRange(start: string, end: string | null) {
  return end ? `${start} – ${end}` : start;
}

function place(position: PositionItem) {
  const location = position.location?.trim();
  const arrangement =
    position.officeType === "remote"
      ? "Remote"
      : position.officeType === "hybrid"
        ? "Hybrid"
        : null;
  if (location && arrangement) return `${location} (${arrangement})`;
  return location || arrangement;
}

/** "*a · b · c*", from the parts that are there. */
function details(parts: Array<string | null | undefined>) {
  const present = parts.map((part) => part?.trim()).filter(Boolean) as string[];
  return present.length ? `*${present.map(inline).join(" · ")}*` : null;
}

function positionBlock(position: PositionItem) {
  const lines = [
    heading(3, `${inline(position.title)} — ${link(position.name, position.link)}`),
  ];
  const meta = details([
    position.team,
    dateRange(position.startDate, position.endDate ?? "Present"),
    place(position),
  ]);
  if (meta) lines.push("", meta);
  for (const paragraph of paragraphs(position.description)) {
    lines.push("", paragraph);
  }
  const highlights = position.highlights.map(lineText).filter(Boolean);
  if (highlights.length) {
    lines.push("", ...highlights.map((highlight) => `- ${highlight}`));
  }
  if (position.technologies.length) {
    lines.push(
      "",
      `**Technologies:** ${position.technologies.map(inline).join(", ")}`,
    );
  }
  return lines.join("\n");
}

type ResumeProject = ProjectItem & { hasPublishedPage: boolean };

function projectBlock(project: ResumeProject, origin: string) {
  const lines = [heading(3, inline(project.name))];
  const meta = details([
    // As on the projects page: active projects run to the present.
    dateRange(project.startDate, project.isActive ? "Present" : project.endDate),
  ]);
  if (meta) lines.push("", meta);
  for (const paragraph of paragraphs(project.description)) {
    lines.push("", paragraph);
  }
  const links = [
    linkUrl(project.appLink) && link("Website", project.appLink),
    linkUrl(project.githubLink) && link("Source code", project.githubLink),
    project.hasPublishedPage &&
      link("Write-up", `${origin}/projects/${encodeURIComponent(project.id)}`),
  ].filter(Boolean);
  if (links.length) lines.push("", links.join(" · "));
  if (project.badges.length) {
    lines.push("", `**Built with:** ${project.badges.map(inline).join(", ")}`);
  }
  return lines.join("\n");
}

export interface ResumeContent {
  name: string;
  subtitle: string;
  /** The site's public origin, e.g. "https://example.com". */
  origin: string;
  positions: PositionItem[];
  projects: ResumeProject[];
}

/** The résumé as Markdown. Empty sections are left out. */
export function renderResumeMarkdown({
  name,
  subtitle,
  origin,
  positions,
  projects,
}: ResumeContent) {
  const blocks = [heading(1, inline(name))];
  if (subtitle.trim()) blocks.push(lineText(subtitle));
  const site = linkUrl(origin);
  if (site) blocks.push(`<${site}>`);

  const section = (title: string, items: string[]) => {
    if (items.length) blocks.push(heading(2, title), ...items);
  };
  section(
    "Employment",
    positions
      .filter((position) => position.type === "employment")
      .map(positionBlock),
  );
  section(
    "Volunteering",
    positions
      .filter((position) => position.type === "volunteer")
      .map(positionBlock),
  );
  section(
    "Projects",
    projects.map((project) => projectBlock(project, origin)),
  );
  return `${blocks.join("\n\n")}\n`;
}

/** Reads everything the Markdown résumé shows, in the site's own order. */
export async function buildResumeMarkdown(origin: string) {
  const env = getServerEnv();
  const [positions, projects, saved_subtitle] = await Promise.all([
    new AboutRepository(db).listPositions(),
    new ProjectsRepository(db).listProjectsWithPageStatus(),
    readSavedSubtitle(),
  ]);
  return renderResumeMarkdown({
    name: env.siteTitle,
    subtitle: saved_subtitle ?? env.siteSubtitle,
    origin,
    positions,
    projects,
  });
}

// <-- Responses -->

/** e.g. "jane-doe-resume.md", from the site title. */
export function resumeFilename(extension: "pdf" | "md") {
  const prefix = toIdentifier(getServerEnv().siteTitle);
  return `${prefix ? `${prefix}-` : ""}resume.${extension}`;
}

/**
 * An attachment header for any file name: a plain ASCII fallback, plus the
 * exact name (RFC 6266) for browsers that read it.
 */
export function attachmentDisposition(filename: string) {
  const fallback = filename.replace(/[^\x20-\x7e]|["\\%]/g, "_");
  const encoded = encodeURIComponent(filename).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

// Downloads are revalidated every time (cheap with the ETag), so a new
// upload or edit shows up right away.
const PUBLIC_CACHE = "public, no-cache";

function textResponse(status: number, message: string) {
  return new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** GET /resume.md */
export async function serveMarkdownResume(request: Request, origin: string) {
  const markdown = await buildResumeMarkdown(origin);
  const etag = await etagFor(markdown);
  const headers = { "Cache-Control": PUBLIC_CACHE, ETag: etag };
  if (matchesEtag(request.headers.get("if-none-match"), etag)) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(markdown, {
    headers: {
      ...headers,
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": attachmentDisposition(resumeFilename("md")),
      "X-Content-Type-Options": "nosniff",
    },
  });
}

/**
 * GET /resume.pdf: the current résumé. With `?id=`, a specific one (current
 * or previous), for the admin only; anyone else gets a 404, as if it weren't
 * there.
 */
export async function servePdfResume(request: Request) {
  const resumes = new ResumeRepository(db);
  const requested_id = new URL(request.url).searchParams.get("id");
  let item: Resume | null;
  if (requested_id === null) {
    item = await resumes.getCurrentResume();
  } else {
    const session = await auth.api.getSession({ headers: request.headers });
    item =
      session && resumeIdSchema.safeParse({ id: requested_id }).success
        ? await resumes.getResume(requested_id)
        : null;
    if (item?.status !== "ready") item = null;
  }
  if (!item) return textResponse(404, "There's no résumé to download yet.");

  const { storage } = getMediaStorage();
  if (!storage) {
    return textResponse(503, "Résumé downloads aren't available right now.");
  }
  // Each upload has its own id and its file never changes, so the id is the version.
  const etag = `"${item.id}"`;
  const headers = {
    // A specific version is the admin's; keep it out of shared caches.
    "Cache-Control": requested_id === null ? PUBLIC_CACHE : "private, no-store",
    ETag: etag,
  };
  if (
    requested_id === null &&
    matchesEtag(request.headers.get("if-none-match"), etag)
  ) {
    return new Response(null, { status: 304, headers });
  }

  let object: Awaited<ReturnType<typeof storage.open>>;
  try {
    object = await storage.open(item.storageKey);
  } catch (error) {
    console.error("Couldn't read the résumé from storage.", error);
    return textResponse(502, "Couldn't fetch the résumé. Try again shortly.");
  }
  if (!object) {
    console.error(`Résumé ${item.id} is missing from storage (${item.storageKey}).`);
    return textResponse(404, "There's no résumé to download yet.");
  }
  return new Response(object.body, {
    headers: {
      ...headers,
      "Content-Type": "application/pdf",
      ...(object.byteSize !== null && {
        "Content-Length": String(object.byteSize),
      }),
      // Visitors get a tidy name; the admin gets the name it was uploaded with.
      "Content-Disposition": attachmentDisposition(
        requested_id === null ? resumeFilename("pdf") : item.originalName,
      ),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
