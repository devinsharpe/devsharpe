// Server-only: counting clicks on /links. The page posts here with
// navigator.sendBeacon as a visitor follows a link, which still goes out when
// the page is being left, and can't set the headers a server function needs.
import { linkClickSchema } from "../lib/links";
import { auth } from "./auth.server";
import { db } from "./database/index.server";
import { LinksRepository } from "./repositories/links.repository.server";

/** A click is `{"id":"<uuid>"}`; anything much bigger isn't one. */
const MAX_BODY_BYTES = 1024;

const reply = (status: number) =>
  new Response(null, { status, headers: { "cache-control": "no-store" } });

/**
 * POST /api/link-click. Counts the click unless it's from another site, the
 * body isn't a link id, or the visitor is signed in. A hidden or unknown link
 * isn't counted either, but gets the same answer (204), like a counted one.
 */
export async function recordLinkClick(request: Request) {
  // Browsers mark their own same-site requests; other sites can't fake it.
  if (request.headers.get("sec-fetch-site") !== "same-origin") return reply(403);
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    return reply(413);
  }
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return reply(413);
  let parsed;
  try {
    parsed = linkClickSchema.safeParse(JSON.parse(body));
  } catch {
    return reply(400);
  }
  if (!parsed.success) return reply(400);

  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) await new LinksRepository(db).recordClick(parsed.data.id);
  return reply(204);
}
