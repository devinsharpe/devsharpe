// Commands for image nodes, kept apart from ImageNode so the image block and
// its dialogs can dispatch them without importing the node (which imports them).
import { createCommand, type LexicalCommand, type NodeKey } from "lexical";

/** Inserts the library image with this media id as a block at the caret. */
export const INSERT_IMAGE_COMMAND: LexicalCommand<string> = createCommand(
  "INSERT_IMAGE_COMMAND",
);

/**
 * Sets the caption one image shows in this document: text of its own, "" for
 * none, or null to use the library caption.
 */
export const SET_IMAGE_CAPTION_COMMAND: LexicalCommand<{
  node_key: NodeKey;
  caption: string | null;
}> = createCommand("SET_IMAGE_CAPTION_COMMAND");
