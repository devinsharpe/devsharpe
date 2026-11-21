import { useEffect } from "react";
import type { ViewKind } from "~/lib/photography";
import { recordView } from "~/server/functions/photography.functions";

const STORAGE_PREFIX = "photography-viewed:";

// Pages counted since this tab loaded the app, for when sessionStorage is
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

function markCounted(key: string, is_counted: boolean) {
  if (is_counted) counted_this_load.add(key);
  else counted_this_load.delete(key);
  try {
    if (is_counted) window.sessionStorage.setItem(key, "1");
    else window.sessionStorage.removeItem(key);
  } catch {
    // Storage is blocked; the in-memory set still covers this tab.
  }
}

/**
 * Counts a visit to a public collection or photo page, once per page per
 * browser tab session. It runs in the browser only, so link prefetches and
 * bots that don't run scripts aren't counted; the server also skips visits
 * while signed in.
 */
export function useRecordView(kind: ViewKind, id: string) {
  useEffect(() => {
    const key = `${STORAGE_PREFIX}${kind}:${id}`;
    if (hasBeenCounted(key)) return;
    // Marked first so a second run (React's dev double effects, or a quick
    // back-and-forth) doesn't count the same visit twice.
    markCounted(key, true);
    recordView({ data: { kind, id } }).catch(() => {
      // Not counted after all; a later visit can try again.
      markCounted(key, false);
    });
  }, [kind, id]);
}
