import { LINK_CLICK_PATH } from "~/lib/links";

const STORAGE_PREFIX = "links-clicked:";

// Links counted since this tab loaded the page, for when sessionStorage is
// blocked (private windows in some browsers, or storage turned off).
const counted_this_load = new Set<string>();

function hasBeenCounted(key: string) {
  if (counted_this_load.has(key)) return true;
  try {
    return window.sessionStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

function markCounted(key: string) {
  counted_this_load.add(key);
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Storage is blocked; the in-memory set still covers this tab.
  }
}

/**
 * Counts a click on a /links link, once per link per browser tab session.
 * Uses `sendBeacon`, which still goes out while the browser leaves the page
 * for the link. The server skips clicks while signed in.
 */
export function recordLinkClick(id: string) {
  const key = `${STORAGE_PREFIX}${id}`;
  if (hasBeenCounted(key)) return;
  markCounted(key);
  const body = JSON.stringify({ id });
  try {
    if (navigator.sendBeacon?.(LINK_CLICK_PATH, body)) return;
  } catch {
    // Fall through to fetch.
  }
  // No beacon (or the browser refused to queue it): keepalive lets the request
  // outlive the page too.
  fetch(LINK_CLICK_PATH, { method: "POST", body, keepalive: true }).catch(
    () => {},
  );
}
