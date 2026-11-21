// The Lexical node types a rich-text document may contain, apart from images
// (ImageNode renders with React, so the editor adds it). Shared by the editor
// and by scripts that build documents headlessly (e.g. the biography seed),
// so both produce JSON the editor can load. No React imports here.
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

export const RICH_TEXT_NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  CodeNode,
  CodeHighlightNode,
];
