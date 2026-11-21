// What an image node looks like in the editor: the image as it will be
// published, plus controls for its caption on this page, its library
// details, and removing it.
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
  $createNodeSelection,
  $getNodeByKey,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  type NodeKey,
} from "lexical";
import { CaptionsIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { effectiveCaption } from "~/lib/rich-text";
import { cn } from "~/lib/utils";
import Button from "../_ui/button";
import { useImageActions } from "./image-actions";
import {
  toRichTextMedia,
  useMediaView,
  useMediaViewStore,
} from "./media-view-store";
import { RichTextFigure } from "./rich-text-figure";

/**
 * Lexical handles key presses for everything inside the editor, so Enter on
 * one of these buttons would also add a paragraph (and cancel the click).
 * Stopping the event here, before it reaches the editor, leaves it to the button.
 */
function isolateActivationKeys(element: HTMLElement | null) {
  if (!element) return;
  const stop = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") event.stopPropagation();
  };
  element.addEventListener("keydown", stop);
  return () => element.removeEventListener("keydown", stop);
}

function Notice({
  className,
  children,
  actions,
}: {
  className?: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div
      className={cn(
        "not-prose my-8 flex flex-wrap items-center justify-between gap-2 border border-dashed border-neutral-400 dark:border-neutral-600 p-4 text-sm",
        className,
      )}
    >
      <p>{children}</p>
      <div ref={isolateActivationKeys} className="flex gap-2">
        {actions}
      </div>
    </div>
  );
}

interface ImageBlockProps {
  node_key: NodeKey;
  media_id: string;
  /** Its own caption in this document ("" for none), or null for the library's. */
  caption: string | null;
}

export function ImageBlock({ node_key, media_id, caption }: ImageBlockProps) {
  const [editor] = useLexicalComposerContext();
  const store = useMediaViewStore();
  const { edit_details, edit_caption } = useImageActions();
  const entry = useMediaView(store, media_id);
  const [is_selected, set_selected, clear_selection] =
    useLexicalNodeSelection(node_key);
  const ref = useRef<HTMLDivElement>(null);

  // A click on the image selects it (Shift adds it to the selection), so
  // Backspace or Delete removes it. Clicks on its buttons are theirs.
  useEffect(
    () =>
      editor.registerCommand(
        CLICK_COMMAND,
        (event) => {
          const target = event.target;
          if (!(target instanceof Element) || !ref.current?.contains(target)) {
            return false;
          }
          if (target.closest("button, a")) return false;
          if (!event.shiftKey) clear_selection();
          set_selected(true);
          return true;
        },
        COMMAND_PRIORITY_LOW,
      ),
    [editor, clear_selection, set_selected],
  );

  const remove = useCallback(() => {
    editor.update(() => {
      if (!$getNodeByKey(node_key)) return;
      // The same path as Backspace on a selected image, so the caret lands nearby.
      const selection = $createNodeSelection();
      selection.add(node_key);
      $setSelection(selection);
      selection.deleteNodes();
    });
    editor.focus();
  }, [editor, node_key]);

  const outline =
    is_selected && "outline-2 outline-offset-4 outline-neutral-800 dark:outline-white";
  const remove_button = <Button onClick={remove}>Remove</Button>;

  let content: ReactNode;
  if (entry.status === "loading") {
    content = (
      <div
        role="img"
        aria-label="Loading image…"
        className={cn(
          "my-8 aspect-[3/2] w-full animate-pulse bg-neutral-200 dark:bg-neutral-800",
          outline,
        )}
      />
    );
  } else if (entry.status === "error") {
    content = (
      <Notice
        className={outline || undefined}
        actions={
          <>
            <Button onClick={() => store.request(media_id)}>Try again</Button>
            {remove_button}
          </>
        }
      >
        Couldn't load this image.
      </Notice>
    );
  } else if (entry.status === "missing") {
    content = (
      <Notice className={outline || undefined} actions={remove_button}>
        This image is no longer in the media library, so it won't be published.
      </Notice>
    );
  } else {
    const { item } = entry;
    const media = toRichTextMedia(item);
    content = media ? (
      <RichTextFigure
        media={media}
        caption={effectiveCaption(caption, item.caption)}
        draggable={false}
        className={cn("group relative", outline)}
      >
        {!item.altText && (
          <span className="absolute top-2 left-2 bg-neutral-900/80 px-1 text-xs text-neutral-100">
            No alt text
          </span>
        )}
        <div
          ref={isolateActivationKeys}
          className={cn(
            "not-prose absolute top-2 right-2 flex gap-1 bg-neutral-50 dark:bg-neutral-950 transition-opacity",
            "opacity-0 group-hover:opacity-100 focus-within:opacity-100",
            is_selected && "opacity-100",
          )}
        >
          <Button
            size="icon"
            aria-label={`Caption on this page for ${item.originalName}`}
            title={
              caption === null
                ? "Caption on this page (using the library's)"
                : "Caption on this page (its own)"
            }
            onClick={() =>
              edit_caption({
                node_key,
                name: item.originalName,
                caption,
                library_caption: item.caption,
              })
            }
          >
            <CaptionsIcon strokeWidth={1.5} size={16} />
          </Button>
          <Button
            size="icon"
            aria-label={`Edit library details for ${item.originalName}`}
            title="Edit alt text and library details"
            onClick={() => edit_details(item)}
          >
            <PencilIcon strokeWidth={1.5} size={16} />
          </Button>
          <Button
            size="icon"
            aria-label={`Remove ${item.originalName} from the page`}
            title="Remove from the page"
            onClick={remove}
          >
            <Trash2Icon strokeWidth={1.5} size={16} />
          </Button>
        </div>
      </RichTextFigure>
    ) : (
      <Notice className={outline || undefined} actions={remove_button}>
        <span className="break-all">{item.originalName}</span>: previews (and
        publishing images) need imgproxy to be configured.
      </Notice>
    );
  }

  return <div ref={ref}>{content}</div>;
}
