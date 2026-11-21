// Dialogs the editor's image blocks open: the library details (alt text,
// caption, tags) and the caption for this one page. One of each serves every
// image, and they're portalled out of the editor, so typing in them isn't
// treated as editing the document.
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { NodeKey } from "lexical";
import { SaveIcon } from "lucide-react";
import {
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { MEDIA_CAPTION_MAX_LENGTH } from "~/lib/media";
import { cn } from "~/lib/utils";
import Button from "../_ui/button";
import Dialog from "../_ui/dialog";
import { MediaDetailsDialog } from "../media/media-details-dialog";
import type { MediaItem } from "../media/media-library-item";
import { SET_IMAGE_CAPTION_COMMAND } from "./image-commands";
import { useMediaViewStore } from "./media-view-store";

export interface CaptionTarget {
  node_key: NodeKey;
  /** The file name, to say which image this is. */
  name: string;
  /** The image's own caption in this document ("" for none), or null. */
  caption: string | null;
  library_caption: string | null;
}

interface ImageActions {
  edit_details: (item: MediaItem) => void;
  edit_caption: (target: CaptionTarget) => void;
}

const ImageActionsContext = createContext<ImageActions | null>(null);

export function useImageActions() {
  const actions = useContext(ImageActionsContext);
  if (!actions) {
    throw new Error("useImageActions must be used inside a RichTextEditor");
  }
  return actions;
}

type CaptionChoice = "library" | "custom" | "none";

const RADIO = "mt-1 size-4 shrink-0 accent-neutral-900 dark:accent-neutral-100";

function CaptionForm({
  target,
  on_close,
}: {
  target: CaptionTarget;
  on_close: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const own = target.caption;
  const [choice, set_choice] = useState<CaptionChoice>(
    own === null ? "library" : own.trim() ? "custom" : "none",
  );
  // Starts from the library caption, so it's easy to adapt for this page.
  const [text, set_text] = useState(own?.trim() ? own : (target.library_caption ?? ""));
  const [error, set_error] = useState<string | null>(null);
  const text_ref = useRef<HTMLTextAreaElement>(null);
  const name = useId();
  const error_id = useId();

  const save = (event: FormEvent) => {
    event.preventDefault();
    let caption: string | null = null;
    if (choice === "none") caption = "";
    if (choice === "custom") {
      caption = text.trim();
      if (!caption) {
        set_error("Write a caption, or pick another option.");
        text_ref.current?.focus();
        return;
      }
    }
    editor.dispatchCommand(SET_IMAGE_CAPTION_COMMAND, {
      node_key: target.node_key,
      caption,
    });
    on_close();
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <div className="-mx-2 px-2 pb-2 pr-12 border-b">
        <h2 className="text-2xl font-bold">Caption on This Page</h2>
        <p className="text-sm opacity-80">
          For <span className="break-all">{target.name}</span> here only. Its
          library caption stays as it is.
        </p>
      </div>
      <fieldset className="px-2 flex flex-col gap-3">
        <legend className="sr-only">Caption</legend>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            className={RADIO}
            checked={choice === "library"}
            onChange={() => set_choice("library")}
          />
          <span className="flex flex-col">
            <span className="font-medium">Use the library caption</span>
            <span className="text-sm opacity-80">
              {target.library_caption
                ? `“${target.library_caption}”`
                : "None yet. Add one in the image's details."}
            </span>
          </span>
        </label>
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name={name}
              className={RADIO}
              checked={choice === "custom"}
              onChange={() => set_choice("custom")}
            />
            <span className="font-medium">Write one for this page</span>
          </label>
          <textarea
            ref={text_ref}
            aria-label="Caption for this page"
            aria-invalid={!!error}
            aria-describedby={error ? error_id : undefined}
            rows={3}
            maxLength={MEDIA_CAPTION_MAX_LENGTH}
            value={text}
            // Typing here means this is the caption wanted.
            onFocus={() => set_choice("custom")}
            onChange={(event) => {
              set_text(event.target.value);
              set_error(null);
            }}
            className={cn(
              "ml-6 w-[calc(100%-1.5rem)] border outline-offset-2 px-2 py-1 resize-y",
              "focus:outline-neutral-900 dark:focus:outline-white focus:outline-1",
              "aria-invalid:border-rose-700 dark:aria-invalid:border-rose-300",
              choice !== "custom" && "opacity-60",
            )}
          />
          {error && (
            <p id={error_id} className="ml-6 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}
        </div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            className={RADIO}
            checked={choice === "none"}
            onChange={() => set_choice("none")}
          />
          <span className="font-medium">No caption here</span>
        </label>
      </fieldset>
      <div className="-mx-2 px-2 pt-2 border-t flex justify-end gap-2">
        <Button onClick={on_close}>Cancel</Button>
        <Button type="submit" variant="success">
          <SaveIcon strokeWidth={1.5} size={16} />
          Save Caption
        </Button>
      </div>
    </form>
  );
}

export function ImageActionsProvider({ children }: { children: ReactNode }) {
  const store = useMediaViewStore();
  const [details, set_details] = useState<MediaItem | null>(null);
  const [caption, set_caption] = useState<CaptionTarget | null>(null);
  const actions = useMemo(
    () => ({ edit_details: set_details, edit_caption: set_caption }),
    [],
  );

  return (
    <ImageActionsContext.Provider value={actions}>
      {children}
      <MediaDetailsDialog
        item={details}
        // No camera picker here; the photo keeps the camera it has.
        cameras={[]}
        on_close={() => set_details(null)}
        // Saving updates the library, so it shows wherever the image is used.
        on_changed={async () => {
          if (details) store.refresh(details.id);
        }}
      />
      <Dialog.Root
        open={caption !== null}
        onOpenChange={(open) => !open && set_caption(null)}
      >
        <Dialog.Content className="max-w-xl gap-2">
          {caption && (
            <CaptionForm
              key={caption.node_key}
              target={caption}
              on_close={() => set_caption(null)}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>
    </ImageActionsContext.Provider>
  );
}
