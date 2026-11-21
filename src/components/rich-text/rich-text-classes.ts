// Class names shared by the Lexical editor (as its theme) and the public
// renderer, so a page looks the same while writing it as it does published.
// Kept free of Lexical imports so the public page doesn't bundle the editor.

/** Wrapper for a rich-text document. `rich-text` hooks the rules in styles.css. */
export const RICH_TEXT_PROSE =
  "rich-text prose prose-neutral dark:prose-invert max-w-none";

export const RICH_TEXT_CLASSES = {
  bold: "font-semibold",
  italic: "italic",
  underline: "underline underline-offset-2",
  strikethrough: "line-through",
  underlineStrikethrough: "[text-decoration-line:underline_line-through]",
  code: "bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 text-[0.875em] font-normal",
  highlight: "bg-yellow-200 text-neutral-900",
  // `not-prose` opts code blocks out of the typography plugin, so the editor's
  // <code> block and the published <pre> are styled by these classes alone.
  code_block:
    "not-prose block my-6 overflow-x-auto whitespace-pre border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 p-4 text-sm leading-relaxed",
  // Lexical nests a list inside an extra <li>; hide that item's marker.
  nested_list_item: "list-none",
  // Tall photos are capped to the screen, keeping their aspect ratio.
  image: "mx-auto block h-auto w-auto max-w-full max-h-[80vh]",
  figcaption: "text-center",
} as const;

/** How wide a document's images are shown (Main's width, less its padding). */
export const RICH_TEXT_IMAGE_SIZES = "(min-width: 56rem) 53rem, calc(100vw - 3rem)";
