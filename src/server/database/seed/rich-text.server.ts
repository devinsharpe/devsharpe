// Seeds: rich text written as Markdown, turned into the same Lexical JSON the
// editor saves. It runs the editor's own Markdown transformers and node types
// headlessly, so a seeded document loads in the editor exactly as if it had
// been typed there.
//
// Supported Markdown: paragraphs, `##`/`###` headings, `>` quotes, `-`/`1.`
// lists, fenced code, **bold**, *italic*, `code`, ~~strike~~, and
// [links](https://…) (http(s), mailto:, or /paths only). No images: those live
// in the media library, which isn't seeded.
import { $isLinkNode } from "@lexical/link";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { $dfs } from "@lexical/utils";
import { createEditor } from "lexical";
import { RICH_TEXT_NODES } from "~/components/rich-text/rich-text-nodes";
import {
  hasRichTextContent,
  isSafeUrl,
  isWithinRichTextLimit,
  type RichTextDocument,
  richTextDocumentSchema,
  type SerializedRichTextNode,
} from "~/lib/rich-text";

function headlessEditor() {
  return createEditor({
    namespace: "Seed",
    nodes: RICH_TEXT_NODES,
    onError: (error) => {
      throw error;
    },
  });
}

function collectLinks(node: SerializedRichTextNode, links: string[] = []) {
  if (node.type === "link" || node.type === "autolink") {
    links.push(typeof node.url === "string" ? node.url : "");
  }
  for (const child of node.children ?? []) collectLinks(child, links);
  return links;
}

/**
 * Markdown → a rich-text document, checked the way the editor's save server
 * functions check one. Throws, naming `label`, if it wouldn't save.
 */
export function markdownToDocument(markdown: string, label: string) {
  const editor = headlessEditor();
  editor.update(
    () => {
      $convertFromMarkdownString(markdown.trim(), TRANSFORMERS);
      // Links made in the editor get Lexical's default rel; match them.
      for (const { node } of $dfs()) {
        if ($isLinkNode(node) && node.getRel() === null) node.setRel("noreferrer");
      }
    },
    { discrete: true },
  );
  const document: RichTextDocument = richTextDocumentSchema.parse(
    editor.getEditorState().toJSON(),
  );
  const problems = [
    !hasRichTextContent(document) && "it has no text",
    !isWithinRichTextLimit(JSON.stringify(document)) && "it's too large",
    ...collectLinks(document.root)
      .filter((url) => !isSafeUrl(url))
      .map((url) => `"${url}" isn't an allowed link (use http(s), mailto:, or a /path)`),
  ].filter(Boolean);
  if (problems.length > 0) {
    throw new Error(`${label}: ${problems.join("; ")}`);
  }
  return document;
}

/**
 * A saved document as Markdown, for telling whether it already matches a
 * seed. Null if it has something Markdown can't hold (an image), so it can't
 * be compared or safely replaced.
 */
export function documentToMarkdown(document: RichTextDocument) {
  try {
    const editor = headlessEditor();
    editor.setEditorState(editor.parseEditorState(JSON.stringify(document)));
    return editor
      .getEditorState()
      .read(() => $convertToMarkdownString(TRANSFORMERS))
      .trim();
  } catch {
    return null;
  }
}
