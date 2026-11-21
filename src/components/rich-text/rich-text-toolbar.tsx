import { $createCodeNode, $isCodeNode } from "@lexical/code";
import { $isLinkNode } from "@lexical/link";
import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  type TextFormatType,
  UNDO_COMMAND,
} from "lexical";
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  type LucideIcon,
  Redo2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
} from "lucide-react";
import { type KeyboardEvent, useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import Button from "../_ui/button";
import { Select } from "../_ui/select";
import { ImagePicker } from "./image-picker";
import { LinkPopover } from "./link-popover";

const BLOCK_TYPES = {
  paragraph: "Paragraph",
  h2: "Heading",
  h3: "Subheading",
  quote: "Quote",
  bullet: "Bulleted list",
  number: "Numbered list",
  code: "Code block",
} as const;
type BlockType = keyof typeof BLOCK_TYPES;

type InlineFormat = Extract<
  TextFormatType,
  "bold" | "italic" | "underline" | "strikethrough" | "code"
>;

const INLINE_FORMATS: Array<{
  format: InlineFormat;
  label: string;
  icon: LucideIcon;
  /** Shortcut Lexical's rich-text plugin already handles. */
  key?: string;
}> = [
  { format: "bold", label: "Bold", icon: BoldIcon, key: "B" },
  { format: "italic", label: "Italic", icon: ItalicIcon, key: "I" },
  { format: "underline", label: "Underline", icon: UnderlineIcon, key: "U" },
  { format: "strikethrough", label: "Strikethrough", icon: StrikethroughIcon },
  { format: "code", label: "Inline code", icon: CodeIcon },
];

interface SelectionState {
  block: BlockType;
  formats: Record<InlineFormat, boolean>;
  is_link: boolean;
}

const INITIAL_STATE: SelectionState = {
  block: "paragraph",
  formats: {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    code: false,
  },
  is_link: false,
};

/** Reads the toolbar state from the current selection; call inside a read/update. */
function $readSelectionState(): SelectionState | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return null;

  const anchor = selection.anchor.getNode();
  const element =
    anchor.getKey() === "root"
      ? anchor
      : ($findMatchingParent(anchor, (node) => {
          const parent = node.getParent();
          return parent !== null && $isRootOrShadowRoot(parent);
        }) ?? anchor.getTopLevelElementOrThrow());

  let block: BlockType = "paragraph";
  if ($isListNode(element)) {
    const list = $getNearestNodeOfType(anchor, ListNode) ?? element;
    block = list.getListType() === "number" ? "number" : "bullet";
  } else if ($isHeadingNode(element)) {
    block = element.getTag() === "h2" || element.getTag() === "h1" ? "h2" : "h3";
  } else if ($isQuoteNode(element)) {
    block = "quote";
  } else if ($isCodeNode(element)) {
    block = "code";
  }

  return {
    block,
    formats: {
      bold: selection.hasFormat("bold"),
      italic: selection.hasFormat("italic"),
      underline: selection.hasFormat("underline"),
      strikethrough: selection.hasFormat("strikethrough"),
      code: selection.hasFormat("code"),
    },
    is_link: $findMatchingParent(anchor, $isLinkNode) !== null,
  };
}

const TOOLBAR_BUTTON =
  "border-transparent aria-pressed:border-neutral-800 dark:aria-pressed:border-white aria-pressed:bg-neutral-200 dark:aria-pressed:bg-neutral-800";
// The link button opens a popover (aria-expanded), so it shows "in a link"
// with the same look instead of aria-pressed.
const TOOLBAR_BUTTON_ACTIVE =
  "border-neutral-800 dark:border-white bg-neutral-200 dark:bg-neutral-800";

function Separator() {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      className="mx-1 h-6 w-px bg-neutral-300 dark:bg-neutral-700"
    />
  );
}

/** Left/right arrows move between toolbar controls (all stay in the tab order too). */
function handleArrowKeys(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  // Direct children only: the link popover renders inside the toolbar, and
  // its fields need the arrow keys.
  const controls = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      ":scope > button:not(:disabled), :scope > div > select:not(:disabled)",
    ),
  );
  const index = controls.indexOf(event.target as HTMLElement);
  if (index === -1) return;
  event.preventDefault();
  const step = event.key === "ArrowRight" ? 1 : -1;
  controls[(index + step + controls.length) % controls.length]?.focus();
}

interface RichTextToolbarProps {
  /** id of the editable area these controls act on. */
  controls: string;
  className?: string;
}

export function RichTextToolbar({ controls, className }: RichTextToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [state, set_state] = useState(INITIAL_STATE);
  const [can_undo, set_can_undo] = useState(false);
  const [can_redo, set_can_redo] = useState(false);

  useEffect(
    () =>
      mergeRegister(
        editor.registerUpdateListener(({ editorState }) => {
          const next = editorState.read($readSelectionState);
          if (next) set_state(next);
        }),
        editor.registerCommand(
          CAN_UNDO_COMMAND,
          (payload) => {
            set_can_undo(payload);
            return false;
          },
          COMMAND_PRIORITY_LOW,
        ),
        editor.registerCommand(
          CAN_REDO_COMMAND,
          (payload) => {
            set_can_redo(payload);
            return false;
          },
          COMMAND_PRIORITY_LOW,
        ),
      ),
    [editor],
  );

  const set_block = (block: BlockType) => {
    if (block === state.block) return;
    if (block === "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      return;
    }
    if (block === "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      return;
    }
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      if (block === "code" && !selection.isCollapsed()) {
        // Turn a multi-block selection into one code block of its plain text.
        const text = selection.getTextContent();
        selection.insertNodes([$createCodeNode()]);
        const inside = $getSelection();
        if ($isRangeSelection(inside)) inside.insertRawText(text);
        return;
      }
      $setBlocksType(selection, () => {
        switch (block) {
          case "h2":
          case "h3":
            return $createHeadingNode(block);
          case "quote":
            return $createQuoteNode();
          case "code":
            return $createCodeNode();
          default:
            return $createParagraphNode();
        }
      });
    });
  };

  const in_code_block = state.block === "code";

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      aria-controls={controls}
      onKeyDown={handleArrowKeys}
      className={cn("flex flex-wrap items-center gap-1 p-1", className)}
    >
      <Select
        aria-label="Block type"
        value={state.block}
        onChange={(event) => set_block(event.target.value as BlockType)}
        className="border-neutral-300 dark:border-neutral-700 text-sm"
      >
        {Object.entries(BLOCK_TYPES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Separator />
      {INLINE_FORMATS.map(({ format, label, icon: Icon, key }) => (
        <Button
          key={format}
          size="icon"
          className={TOOLBAR_BUTTON}
          aria-label={label}
          title={key ? `${label} (⌘/Ctrl+${key})` : label}
          aria-keyshortcuts={key ? `Meta+${key} Control+${key}` : undefined}
          aria-pressed={state.formats[format]}
          disabled={in_code_block}
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, format)}
        >
          <Icon strokeWidth={1.5} size={16} />
        </Button>
      ))}
      <LinkPopover
        is_link={state.is_link}
        disabled={in_code_block}
        className={TOOLBAR_BUTTON}
        active_className={TOOLBAR_BUTTON_ACTIVE}
      />
      <ImagePicker disabled={in_code_block} className={TOOLBAR_BUTTON} />
      <Separator />
      <Button
        size="icon"
        className={TOOLBAR_BUTTON}
        aria-label="Undo"
        title="Undo (⌘/Ctrl+Z)"
        aria-keyshortcuts="Meta+Z Control+Z"
        disabled={!can_undo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <Undo2Icon strokeWidth={1.5} size={16} />
      </Button>
      <Button
        size="icon"
        className={TOOLBAR_BUTTON}
        aria-label="Redo"
        title="Redo (⌘/Ctrl+Shift+Z)"
        aria-keyshortcuts="Meta+Shift+Z Control+Shift+Z"
        disabled={!can_redo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <Redo2Icon strokeWidth={1.5} size={16} />
      </Button>
    </div>
  );
}
