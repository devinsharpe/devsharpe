// The editor's node for an image from the media library. It's saved as
// { type: "image", mediaId }, plus `caption` when this use of the photo has
// its own ("" for none): alt text, the library caption, and URLs come from
// the library wherever the document is shown. Images are blocks, kept at the
// top level of the document, the only place the renderer shows them.
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot, mergeRegister } from "@lexical/utils";
import {
  $applyNodeReplacement,
  $getNodeByKey,
  COMMAND_PRIORITY_EDITOR,
  DecoratorNode,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import { type ReactNode, useEffect } from "react";
import { RICH_TEXT_IMAGE_TYPE } from "~/lib/rich-text";
import { ImageBlock } from "./image-block";
import { INSERT_IMAGE_COMMAND, SET_IMAGE_CAPTION_COMMAND } from "./image-commands";

export type SerializedImageNode = Spread<
  { mediaId: string; caption?: string },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<ReactNode> {
  __mediaId: string;
  /** This document's own caption ("" for none), or null for the library's. */
  __caption: string | null;

  static getType() {
    return RICH_TEXT_IMAGE_TYPE;
  }

  static clone(node: ImageNode) {
    return new ImageNode(node.__mediaId, node.__caption, node.__key);
  }

  static importJSON(json: SerializedImageNode) {
    // Stored JSON isn't trusted; a bad id shows as a missing image.
    const media_id = typeof json.mediaId === "string" ? json.mediaId : "";
    const caption = typeof json.caption === "string" ? json.caption : null;
    return $createImageNode(media_id, caption).updateFromJSON(json);
  }

  constructor(media_id = "", caption: string | null = null, key?: NodeKey) {
    super(key);
    this.__mediaId = media_id;
    this.__caption = caption;
  }

  exportJSON(): SerializedImageNode {
    const caption = this.getCaption();
    return {
      ...super.exportJSON(),
      type: RICH_TEXT_IMAGE_TYPE,
      version: 1,
      mediaId: this.getMediaId(),
      // Left out when using the library caption, so it can change there.
      ...(caption !== null && { caption }),
    };
  }

  getMediaId() {
    return this.getLatest().__mediaId;
  }

  getCaption() {
    return this.getLatest().__caption;
  }

  setCaption(caption: string | null) {
    const writable = this.getWritable();
    writable.__caption = caption;
    return writable;
  }

  createDOM() {
    return document.createElement("div");
  }

  updateDOM() {
    return false;
  }

  isInline(): false {
    return false;
  }

  // A line break when copied as plain text, like other blocks.
  getTextContent() {
    return "\n";
  }

  decorate(): ReactNode {
    return (
      <ImageBlock
        node_key={this.__key}
        media_id={this.__mediaId}
        caption={this.__caption}
      />
    );
  }
}

export function $createImageNode(media_id: string, caption: string | null = null) {
  return $applyNodeReplacement(new ImageNode(media_id, caption));
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}

/** Handles the image commands and keeps images at the top level; returns the cleanup. */
export function registerImages(editor: LexicalEditor) {
  return mergeRegister(
    editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (media_id) => {
        // Splits the block at the caret if needed; the caret ends up after the image.
        $insertNodeToNearestRoot($createImageNode(media_id));
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    editor.registerCommand(
      SET_IMAGE_CAPTION_COMMAND,
      ({ node_key, caption }) => {
        const node = $getNodeByKey(node_key);
        if (!$isImageNode(node)) return false;
        node.setCaption(caption);
        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    ),
    // Pasting can put an image inside a list or quote, where it wouldn't be
    // published. Move it out, right after that block.
    editor.registerNodeTransform(ImageNode, (node) => {
      const top = node.getTopLevelElementOrThrow();
      if (!top.is(node)) top.insertAfter(node);
    }),
  );
}

export function ImagesPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => registerImages(editor), [editor]);
  return null;
}
