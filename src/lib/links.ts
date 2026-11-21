// Client-safe module: the /links page (link-in-bio), shared by its server
// functions, the click endpoint, and the admin forms. Nothing here may touch
// server-only APIs. Keep imports relative: drizzle-kit loads the database
// schema, which may import lib modules.
import * as z from "zod";
import { optionalText, requiredText } from "./validation";

export const LINK_TITLE_MAX_LENGTH = 80;
export const LINK_URL_MAX_LENGTH = 2048;
export const LINKS_BIO_MAX_LENGTH = 160;
/** Links the page can hold. */
export const LINKS_MAX = 100;

/** Where the page counts clicks (a server route, so `sendBeacon` can reach it). */
export const LINK_CLICK_PATH = "/api/link-click";

const SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Whether a link can go on the page: a web address, mailto:, tel:, or a path
 * on this site ("/resume.pdf"). Anything else (javascript:, data:, …) is out.
 */
export function isLinkUrl(value: string) {
  if (value.startsWith("/")) {
    // "//host" and "/\host" are other sites, not paths.
    return !value.startsWith("//") && !value.startsWith("/\\");
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (!SCHEMES.has(url.protocol)) return false;
  if (url.protocol === "http:" || url.protocol === "https:") {
    return url.hostname.includes(".") || url.hostname === "localhost";
  }
  return url.pathname.trim() !== "";
}

/** "github.com/someone" → "https://github.com/someone"; anything else as typed. */
function withScheme(value: string) {
  return /^[\w-]+(\.[\w-]+)+([/?#]|$)/.test(value) ? `https://${value}` : value;
}

const linkUrl = z
  .string()
  .trim()
  .min(1, "Enter a URL")
  .max(LINK_URL_MAX_LENGTH)
  .transform(withScheme)
  .refine(
    isLinkUrl,
    "Use a web address (https://…), mailto:, tel:, or a path on this site (/…)",
  );

/** The form's Visibility select. Stored as a boolean. */
export const LINK_VISIBILITY_OPTIONS = [
  { value: "shown", label: "Shown on the page" },
  { value: "hidden", label: "Hidden (kept here, not on the page)" },
] as const;

/** One link, as edited in the admin form. */
export const linkInputSchema = z.object({
  title: requiredText("Title is required", LINK_TITLE_MAX_LENGTH),
  url: linkUrl,
  isVisible: z.enum(["shown", "hidden"]).transform((value) => value === "shown"),
});
export type LinkInput = z.input<typeof linkInputSchema>;

export const linkUpdateSchema = linkInputSchema.extend({ id: z.uuid() });

export const linkIdSchema = z.object({ id: z.uuid() });

export const linkVisibilitySchema = z.object({
  id: z.uuid(),
  isVisible: z.boolean(),
});

/** Every link, in its new order. */
export const linkOrderSchema = z.object({
  ids: z
    .array(z.uuid())
    .max(LINKS_MAX)
    .refine((ids) => new Set(ids).size === ids.length, "Duplicate links"),
});

/** The top of the page: a library photo (or none) and a short line. */
export const linksProfileSchema = z.object({
  bio: optionalText(LINKS_BIO_MAX_LENGTH),
  photoMediaId: z.uuid().nullable(),
});
export type LinksProfileInput = z.input<typeof linksProfileSchema>;

/** What the page sends when a link is clicked. */
export const linkClickSchema = z.object({ id: z.uuid() });

/** "1 click", "1,204 clicks". */
export const clickCount = (count: number) =>
  `${count.toLocaleString("en-US")} ${count === 1 ? "click" : "clicks"}`;

/** A link as people read it: "github.com/someone", "me@example.com", "/resume.pdf". */
export function displayUrl(url: string) {
  if (url.startsWith("/")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "mailto:" || parsed.protocol === "tel:") {
      return decodeURIComponent(parsed.pathname);
    }
    const path = `${parsed.pathname}${parsed.search}`.replace(/\/$/, "");
    return `${parsed.host.replace(/^www\./, "")}${path}`;
  } catch {
    return url;
  }
}
