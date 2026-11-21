import { useBlocker } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RichTextDocument } from "~/lib/rich-text";
import { useConfirm } from "../_ui/alert-dialog";

export interface RichTextSnapshot {
  document: RichTextDocument;
  json: string;
}

/**
 * Tracks a RichTextEditor's latest document against the last saved one. Pass
 * `on_change` to the editor: its first report (the loaded content) becomes the
 * saved baseline, so `is_dirty` means "differs from what's saved".
 */
export function useRichTextDocument() {
  const latest = useRef<RichTextSnapshot | null>(null);
  const saved_json = useRef<string | null>(null);
  const [is_dirty, set_is_dirty] = useState(false);

  const on_change = useCallback((document: RichTextDocument) => {
    const json = JSON.stringify(document);
    latest.current = { document, json };
    saved_json.current ??= json;
    set_is_dirty(json !== saved_json.current);
  }, []);

  /** The latest document, or null until the editor has mounted. */
  const get_snapshot = useCallback(() => latest.current, []);

  /** Whether `snapshot` matches what was last saved (or loaded). */
  const is_saved = useCallback(
    (snapshot: RichTextSnapshot) => snapshot.json === saved_json.current,
    [],
  );

  /** Records a successful save. Edits made while it was in flight stay dirty. */
  const mark_saved = useCallback((snapshot: RichTextSnapshot) => {
    saved_json.current = snapshot.json;
    set_is_dirty(latest.current?.json !== snapshot.json);
  }, []);

  /** Starts over, e.g. right before remounting the editor with other content. */
  const reset = useCallback(() => {
    latest.current = null;
    saved_json.current = null;
    set_is_dirty(false);
  }, []);

  return { is_dirty, on_change, get_snapshot, is_saved, mark_saved, reset };
}

/** ⌘/Ctrl+S calls `save` from anywhere on the page. */
export function useSaveShortcut(save: () => void) {
  const save_ref = useRef(save);
  useEffect(() => {
    save_ref.current = save;
  });
  useEffect(() => {
    const on_key_down = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey &&
        event.key.toLowerCase() === "s"
      ) {
        event.preventDefault();
        save_ref.current();
      }
    };
    window.addEventListener("keydown", on_key_down);
    return () => window.removeEventListener("keydown", on_key_down);
  }, []);
}

/** Asks before leaving (in-app navigation or closing the tab) while `is_dirty`. */
export function useUnsavedChangesGuard(is_dirty: boolean) {
  const confirm = useConfirm();
  const dirty_ref = useRef(is_dirty);
  useEffect(() => {
    dirty_ref.current = is_dirty;
  }, [is_dirty]);
  useBlocker({
    shouldBlockFn: async () =>
      dirty_ref.current &&
      !(await confirm({
        title: "Leave without saving?",
        description: "You have unsaved changes. They'll be lost if you leave this page.",
        confirm_label: "Leave page",
        cancel_label: "Stay",
        is_destructive: true,
      })),
    enableBeforeUnload: () => dirty_ref.current,
  });
}
