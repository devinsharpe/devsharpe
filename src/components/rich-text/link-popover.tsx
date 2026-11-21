import {
  $createLinkNode,
  $isLinkNode,
  $toggleLink,
} from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent } from "@lexical/utils";
import {
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  KEY_MODIFIER_COMMAND,
} from "lexical";
import { Link2Icon, Link2OffIcon } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import { isSafeUrl } from "~/lib/rich-text";
import { cn } from "~/lib/utils";
import Button from "../_ui/button";
import { SINGLE_LINE_CONTROL_HEIGHT } from "../_ui/input-field";
import Popover from "../_ui/popover";

/** Accepts "example.com" as https://example.com; leaves paths, anchors and schemes alone. */
function normalizeUrl(input: string) {
  const url = input.trim();
  if (!url || url.startsWith("/") || url.startsWith("#")) return url;
  return /^[a-z][a-z\d+.-]*:/i.test(url) ? url : `https://${url}`;
}

const INPUT_CLASSES = cn(
  "w-full border border-neutral-300 dark:border-neutral-700 outline-offset-2 px-2 py-1 text-sm",
  SINGLE_LINE_CONTROL_HEIGHT,
  "bg-neutral-50 dark:bg-neutral-950",
  "focus:outline-neutral-900 dark:focus:outline-white focus:outline-1",
  "aria-invalid:border-rose-700 dark:aria-invalid:border-rose-300",
);

interface LinkPopoverProps {
  /** Whether the caret is inside a link (from the toolbar's selection state). */
  is_link: boolean;
  disabled?: boolean;
  /** Classes for the toolbar trigger button. */
  className?: string;
  /** Classes added to the trigger while the caret is inside a link. */
  active_className?: string;
}

/**
 * Toolbar control for adding, editing, and removing links. Opens from the
 * button or with ⌘/Ctrl+K. With the caret inside a link it edits that link;
 * with text selected it links the selection; with nothing selected it inserts
 * a new link (the text defaults to the address).
 */
export function LinkPopover({
  is_link,
  disabled,
  className,
  active_className,
}: LinkPopoverProps) {
  const [editor] = useLexicalComposerContext();
  const [open, set_open] = useState(false);
  const [url, set_url] = useState("");
  const [text, set_text] = useState("");
  const [needs_text, set_needs_text] = useState(false);
  // Fixed when the popover opens, so it can't drift while focus is in here.
  const [editing, set_editing] = useState(false);
  const [error, set_error] = useState<string | null>(null);
  const url_ref = useRef<HTMLInputElement>(null);
  const url_id = useId();
  const text_id = useId();
  const error_id = useId();

  const handle_open_change = useCallback(
    (next: boolean) => {
      if (next) {
        // Start from the link under the caret, if any.
        const current = editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return { url: "", editing: false, needs_text: true };
          }
          const link = $findMatchingParent(
            selection.anchor.getNode(),
            $isLinkNode,
          );
          return {
            url: link?.getURL() ?? "",
            editing: link !== null,
            needs_text: !link && selection.isCollapsed(),
          };
        });
        set_url(current.url);
        set_editing(current.editing);
        set_needs_text(current.needs_text);
        set_text("");
        set_error(null);
      }
      set_open(next);
    },
    [editor],
  );

  useEffect(
    () =>
      editor.registerCommand(
        KEY_MODIFIER_COMMAND,
        (event) => {
          const is_shortcut =
            (event.metaKey || event.ctrlKey) &&
            !event.shiftKey &&
            !event.altKey &&
            event.key.toLowerCase() === "k";
          if (!is_shortcut || disabled) return false;
          event.preventDefault();
          handle_open_change(true);
          return true;
        },
        COMMAND_PRIORITY_NORMAL,
      ),
    [editor, disabled, handle_open_change],
  );

  // Put the caret back in the editor. Focus leaves the popover first, so the
  // popover doesn't also return focus to its trigger.
  const close_to_editor = () => {
    editor.focus();
    set_open(false);
  };

  const apply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const href = normalizeUrl(url);
    if (!href) {
      set_error("Enter a link address.");
      url_ref.current?.focus();
      return;
    }
    if (!isSafeUrl(href)) {
      set_error("Use an http(s) or mailto: link, or a path starting with /.");
      url_ref.current?.focus();
      return;
    }
    editor.update(() => {
      // Never focused yet? Add the link at the end of the page.
      const current = $getSelection();
      const selection = $isRangeSelection(current)
        ? current
        : $getRoot().selectEnd();
      const in_link =
        $findMatchingParent(selection.anchor.getNode(), $isLinkNode) !== null;
      if (selection.isCollapsed() && !in_link) {
        selection.insertNodes([
          $createLinkNode(href).append($createTextNode(text.trim() || href)),
        ]);
      } else {
        // Links the selected text, or updates the link under the caret.
        $toggleLink(href);
      }
    });
    close_to_editor();
  };

  const remove = () => {
    editor.update(() => $toggleLink(null));
    close_to_editor();
  };

  const label = is_link ? "Edit link" : "Add link";
  const content_label = editing ? "Edit link" : "Add link";

  return (
    <Popover.Root open={open} onOpenChange={handle_open_change}>
      <Popover.Trigger
        size="icon"
        className={cn(className, is_link && active_className)}
        aria-label={label}
        title={`${label} (⌘/Ctrl+K)`}
        aria-keyshortcuts="Meta+K Control+K"
        disabled={disabled}
      >
        <Link2Icon strokeWidth={1.5} size={16} />
      </Popover.Trigger>
      <Popover.Content
        aria-label={content_label}
        initialFocus={url_ref}
        className="w-80"
      >
        <form onSubmit={apply} noValidate className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor={url_id} className="text-sm">
              Link address
            </label>
            <input
              ref={url_ref}
              id={url_id}
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://… or /path"
              value={url}
              onChange={(event) => {
                set_url(event.target.value);
                set_error(null);
              }}
              aria-invalid={error !== null}
              aria-describedby={error ? error_id : undefined}
              className={INPUT_CLASSES}
            />
            {error && (
              <p
                id={error_id}
                className="text-sm italic text-rose-700 dark:text-rose-300"
              >
                {error}
              </p>
            )}
          </div>
          {needs_text && (
            <div className="flex flex-col gap-1">
              <label htmlFor={text_id} className="text-sm">
                Text to show <span className="opacity-80">(optional)</span>
              </label>
              <input
                id={text_id}
                type="text"
                autoComplete="off"
                placeholder="Defaults to the address"
                value={text}
                onChange={(event) => set_text(event.target.value)}
                className={INPUT_CLASSES}
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            {editing && (
              <Button variant="warning" size="sm" onClick={remove}>
                <Link2OffIcon strokeWidth={1.5} size={14} />
                Remove
              </Button>
            )}
            <Popover.Close size="sm" className="ml-auto">
              Cancel
            </Popover.Close>
            <Button type="submit" variant="success" size="sm">
              {editing ? "Update" : "Add link"}
            </Button>
          </div>
        </form>
      </Popover.Content>
    </Popover.Root>
  );
}
