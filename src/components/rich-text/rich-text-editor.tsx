// Lexical-based block editor for long-form pages. Client-only: render it
// inside <ClientOnly>. Produces the same JSON that RichTextRenderer displays.
import { TRANSFORMERS } from "@lexical/markdown";
import {
  type InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { type EditorThemeClasses, HISTORY_MERGE_TAG } from "lexical";
import { useEffect, useId, useState } from "react";
import { isSafeUrl, type RichTextDocument } from "~/lib/rich-text";
import { cn } from "~/lib/utils";
import { ImageActionsProvider } from "./image-actions";
import { ImageNode, ImagesPlugin } from "./image-node";
import {
  type MediaViewStore,
  MediaViewStoreProvider,
  useCreateMediaViewStore,
} from "./media-view-store";
import { RICH_TEXT_CLASSES, RICH_TEXT_PROSE } from "./rich-text-classes";
import { RICH_TEXT_NODES } from "./rich-text-nodes";
import { RichTextToolbar } from "./rich-text-toolbar";

const THEME: EditorThemeClasses = {
  text: {
    bold: RICH_TEXT_CLASSES.bold,
    italic: RICH_TEXT_CLASSES.italic,
    underline: RICH_TEXT_CLASSES.underline,
    strikethrough: RICH_TEXT_CLASSES.strikethrough,
    underlineStrikethrough: RICH_TEXT_CLASSES.underlineStrikethrough,
    code: RICH_TEXT_CLASSES.code,
    highlight: RICH_TEXT_CLASSES.highlight,
  },
  code: RICH_TEXT_CLASSES.code_block,
  list: { nested: { listitem: RICH_TEXT_CLASSES.nested_list_item } },
};

/** The page title is the h1, so headings are limited to h2 and h3 (e.g. "# " → h2). */
function HeadingLevelPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(
    () =>
      editor.registerNodeTransform(HeadingNode, (node) => {
        const tag = node.getTag();
        if (tag === "h1") node.setTag("h2");
        else if (tag !== "h2" && tag !== "h3") node.setTag("h3");
      }),
    [editor],
  );
  return null;
}

/**
 * Reports the document once on mount (the loaded content) and again after
 * every content change. Selection-only updates and Lexical's own setup
 * updates (tagged history-merge) are skipped.
 */
function ChangePlugin({
  on_change,
}: {
  on_change: (document: RichTextDocument) => void;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const report = () =>
      on_change(
        editor.getEditorState().toJSON() as unknown as RichTextDocument,
      );
    report();
    return editor.registerUpdateListener(
      ({ dirtyElements, dirtyLeaves, tags }) => {
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
        if (tags.has(HISTORY_MERGE_TAG)) return;
        report();
      },
    );
  }, [editor, on_change]);
  return null;
}

interface RichTextEditorProps {
  /** Loaded once, on mount; later changes to this prop are ignored. */
  initial_content: RichTextDocument | null;
  /** Stable callback (useCallback); see ChangePlugin for when it fires. */
  on_change: (document: RichTextDocument) => void;
  /** Accessible name for the writing area. */
  label: string;
  placeholder?: string;
  className?: string;
  /**
   * Where the document's images are looked up. Pass one shared with a
   * preview (useRichTextMediaMap); by default the editor keeps its own.
   */
  media_store?: MediaViewStore;
}

export function RichTextEditor({
  initial_content,
  on_change,
  label,
  placeholder = "Start writing…",
  className,
  media_store,
}: RichTextEditorProps) {
  const content_id = useId();
  const own_media_store = useCreateMediaViewStore();
  // Built once: LexicalComposer only reads its config on the first render.
  const [initial_config] = useState<InitialConfigType>(() => ({
    namespace: "RichTextEditor",
    // Images render with React, so they're added here rather than in
    // RICH_TEXT_NODES (which headless scripts load).
    nodes: [...RICH_TEXT_NODES, ImageNode],
    theme: THEME,
    onError: (error) => console.error(error),
    // An empty root has no paragraph to type into; let Lexical create one.
    editorState: initial_content?.root.children.length
      ? JSON.stringify(initial_content)
      : undefined,
  }));

  return (
    <LexicalComposer initialConfig={initial_config}>
      <MediaViewStoreProvider value={media_store ?? own_media_store}>
        <ImageActionsProvider>
          <div
            className={cn(
              "flex flex-col border border-neutral-300 dark:border-neutral-700 focus-within:border-neutral-800 dark:focus-within:border-white transition-colors",
              className,
            )}
          >
            <RichTextToolbar
              controls={content_id}
              className="border-b border-neutral-300 dark:border-neutral-700"
            />
            <div className="relative">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    id={content_id}
                    aria-label={label}
                    aria-placeholder={placeholder}
                    placeholder={
                      <div
                        aria-hidden
                        className="pointer-events-none absolute top-4 left-4 select-none opacity-60"
                      >
                        {placeholder}
                      </div>
                    }
                    className={cn(RICH_TEXT_PROSE, "min-h-96 p-4 outline-none")}
                  />
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
          </div>
        </ImageActionsProvider>
      </MediaViewStoreProvider>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin validateUrl={isSafeUrl} />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <HeadingLevelPlugin />
      <ImagesPlugin />
      <ChangePlugin on_change={on_change} />
    </LexicalComposer>
  );
}
