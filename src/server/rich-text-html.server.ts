// Server-only: turns a stored rich-text document into a standalone HTML string
// for places outside the site, such as the RSS feed. It follows the same rules
// as RichTextRenderer (known nodes only, safe links only, headings folded to
// h2/h3, top-level images only) but emits plain semantic HTML with no classes
// or screen-reader-only text, and resolves relative links so they still work
// in a feed reader.
import {
  effectiveCaption,
  imageMediaId,
  isSafeUrl,
  type RichTextDocument,
  type RichTextMediaMap,
  type SerializedRichTextNode,
} from "../lib/rich-text";

// Lexical's text format bit flags.
const IS_BOLD = 1;
const IS_ITALIC = 1 << 1;
const IS_STRIKETHROUGH = 1 << 2;
const IS_UNDERLINE = 1 << 3;
const IS_CODE = 1 << 4;
const IS_SUBSCRIPT = 1 << 5;
const IS_SUPERSCRIPT = 1 << 6;
const IS_HIGHLIGHT = 1 << 7;

/** Lexical documents nest a few levels deep; anything past this is dropped. */
const MAX_DEPTH = 32;

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

interface Context {
  /** Relative links resolve against this (the post's own URL). */
  base_url: string;
  /** Inside a code block, line breaks are newlines rather than <br>. */
  in_code: boolean;
  /** The document's images by media id (see resolveRichTextMedia). */
  media: RichTextMediaMap;
}

function absoluteUrl(url: string, base_url: string) {
  try {
    return new URL(url, base_url).href;
  } catch {
    return url;
  }
}

function textHtml(node: SerializedRichTextNode) {
  if (typeof node.text !== "string") return "";
  const format = typeof node.format === "number" ? node.format : 0;
  let html = escapeHtml(node.text);
  if (format & IS_STRIKETHROUGH) html = `<s>${html}</s>`;
  if (format & IS_UNDERLINE) html = `<u>${html}</u>`;
  if (format & IS_ITALIC) html = `<em>${html}</em>`;
  if (format & IS_BOLD) html = `<strong>${html}</strong>`;
  if (format & IS_SUBSCRIPT) html = `<sub>${html}</sub>`;
  if (format & IS_SUPERSCRIPT) html = `<sup>${html}</sup>`;
  if (format & IS_HIGHLIGHT) html = `<mark>${html}</mark>`;
  if (format & IS_CODE) html = `<code>${html}</code>`;
  return html;
}

function childrenHtml(
  node: SerializedRichTextNode,
  depth: number,
  context: Context,
) {
  if (!Array.isArray(node.children) || depth >= MAX_DEPTH) return "";
  return node.children
    .map((child) => nodeHtml(child, depth + 1, context))
    .join("");
}

/** A list item that only holds a nested list (how Lexical stores nesting). */
function isNestedListWrapper(node: SerializedRichTextNode) {
  const children = Array.isArray(node.children) ? node.children : [];
  return (
    children.length > 0 && children.every((child) => child?.type === "list")
  );
}

function listItemsHtml(
  list: SerializedRichTextNode,
  depth: number,
  context: Context,
) {
  if (!Array.isArray(list.children) || depth >= MAX_DEPTH) return "";
  // Lexical puts a nested list in its own item after the item it belongs to.
  // Moving it inside that item gives ordinary nested HTML, with no empty
  // bullet and no skipped number.
  const items: string[] = [];
  for (const child of list.children) {
    if (!child || typeof child !== "object") continue;
    const html =
      child.type === "listitem"
        ? childrenHtml(child, depth + 1, context)
        : nodeHtml(child, depth + 1, context);
    if (child.type === "listitem" && isNestedListWrapper(child) && items.length) {
      items[items.length - 1] += html;
    } else {
      items.push(html);
    }
  }
  return items.map((html) => `<li>${html}</li>`).join("");
}

function nodeHtml(
  node: SerializedRichTextNode,
  depth: number,
  context: Context,
): string {
  if (!node || typeof node !== "object") return "";

  switch (node.type) {
    case "text":
    case "code-highlight":
      return textHtml(node);
    case "tab":
      return "\t";
    case "linebreak":
      return context.in_code ? "\n" : "<br>";

    case "paragraph":
      // Empty paragraphs are spacing left in the editor.
      return Array.isArray(node.children) && node.children.length > 0
        ? `<p>${childrenHtml(node, depth, context)}</p>`
        : "";
    case "heading": {
      // The post title is the h1; deeper levels are folded into h3.
      const tag = node.tag === "h1" || node.tag === "h2" ? "h2" : "h3";
      return `<${tag}>${childrenHtml(node, depth, context)}</${tag}>`;
    }
    case "quote":
      return `<blockquote>${childrenHtml(node, depth, context)}</blockquote>`;
    case "list": {
      const items = listItemsHtml(node, depth, context);
      if (node.listType !== "number") return `<ul>${items}</ul>`;
      const start =
        typeof node.start === "number" &&
        Number.isInteger(node.start) &&
        node.start !== 1
          ? ` start="${node.start}"`
          : "";
      return `<ol${start}>${items}</ol>`;
    }
    case "listitem":
      // Only reached for an item outside a list; lists handle their own items.
      return `<li>${childrenHtml(node, depth, context)}</li>`;
    case "code": {
      const language =
        typeof node.language === "string" &&
        /^[\w#+.-]{1,40}$/.test(node.language)
          ? ` class="language-${escapeHtml(node.language)}"`
          : "";
      const code = childrenHtml(node, depth, { ...context, in_code: true });
      return `<pre><code${language}>${code}</code></pre>`;
    }
    case "link":
    case "autolink": {
      const url = typeof node.url === "string" ? node.url : "";
      const inner = childrenHtml(node, depth, context);
      // An unsafe or missing URL still shows its text, just not as a link.
      if (!isSafeUrl(url)) return inner;
      const href = escapeHtml(absoluteUrl(url, context.base_url));
      const title =
        typeof node.title === "string" && node.title
          ? ` title="${escapeHtml(node.title)}"`
          : "";
      return `<a href="${href}"${title}>${inner}</a>`;
    }
    case "image": {
      // Top level only (depth 1), like the renderer. Unknown or deleted
      // images are skipped. No srcset: feed readers mostly drop it.
      const id = depth === 1 ? imageMediaId(node) : null;
      const item = id ? context.media[id] : undefined;
      if (!item) return "";
      const src = escapeHtml(absoluteUrl(item.image.src, context.base_url));
      const text = effectiveCaption(node.caption, item.caption);
      const caption = text
        ? `<figcaption>${escapeHtml(text)}</figcaption>`
        : "";
      return `<figure><img src="${src}" alt="${escapeHtml(item.alt ?? "")}">${caption}</figure>`;
    }

    default:
      // Unknown block or inline: keep its text rather than drop it.
      return childrenHtml(node, depth, context);
  }
}

/**
 * The document as an HTML fragment. `base_url` is the absolute URL the content
 * lives at; links like "/projects" or "#notes" are resolved against it.
 * `media` has the document's images; any it doesn't have are left out.
 */
export function richTextToHtml(
  document: RichTextDocument,
  { base_url, media = {} }: { base_url: string; media?: RichTextMediaMap },
) {
  return childrenHtml(document.root, 0, { base_url, in_code: false, media });
}
