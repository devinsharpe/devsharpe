import { ClientOnly } from "@tanstack/react-router";
import { EyeIcon, EyeOffIcon, SaveIcon, SendIcon } from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  hasRichTextContent,
  isWithinRichTextLimit,
  type RichTextDocument,
} from "~/lib/rich-text";
import { useConfirm } from "../_ui/alert-dialog";
import Button from "../_ui/button";
import { LocalTime } from "../_ui/local-time";
import { useToast } from "../_ui/toast";
import { RICH_TEXT_PROSE } from "./rich-text-classes";
import {
  type MediaViewStore,
  useCreateMediaViewStore,
  useRichTextMediaMap,
} from "./media-view-store";
import { RichTextEditor } from "./rich-text-editor";
import { RichTextRenderer } from "./rich-text-renderer";
import {
  type RichTextSnapshot,
  useRichTextDocument,
  useSaveShortcut,
  useUnsavedChangesGuard,
} from "./use-rich-text-document";

/** Draft/publish state of a document written in this editor. */
export interface PublishStatus {
  /** When the draft was last saved. */
  draftUpdatedAt: Date | null;
  /** When it went live; null while unpublished. */
  publishedAt: Date | null;
  isPublished: boolean;
  /** The saved draft differs from what's published (or was never published). */
  hasUnpublishedChanges: boolean;
}

type Action = "save" | "publish" | "unpublish";

/** The draft as it will look published, with images from the editor's store. */
function DraftPreview({
  snapshot,
  media_store,
}: {
  snapshot: RichTextSnapshot;
  media_store: MediaViewStore;
}) {
  const media = useRichTextMediaMap(media_store, snapshot.document);
  return (
    <RichTextRenderer
      document={snapshot.document}
      media={media}
      className={RICH_TEXT_PROSE}
    />
  );
}

function StatusLine({
  status,
  is_dirty,
}: {
  status: PublishStatus;
  is_dirty: boolean;
}) {
  return (
    <p className="text-sm opacity-80">
      {status.isPublished && status.publishedAt ? (
        <>
          Published <LocalTime date={status.publishedAt} />
        </>
      ) : (
        "Not published"
      )}
      {status.hasUnpublishedChanges && status.draftUpdatedAt && (
        <>
          {" · "}Draft saved <LocalTime date={status.draftUpdatedAt} />
          {status.isPublished && " (not published yet)"}
        </>
      )}
      {is_dirty && " · Unsaved changes"}
    </p>
  );
}

interface PublishingEditorProps {
  /** The page heading, e.g. the project or post name. */
  title: ReactNode;
  /** Shown under the status line, e.g. the public URL. */
  details?: ReactNode;
  /** "page" or "post": used in button labels and messages. */
  noun: string;
  /** The saved draft; loaded once, on mount. */
  initial_content: RichTextDocument | null;
  /** Controlled: update it with each status `on_status_change` reports. */
  status: PublishStatus;
  on_status_change: (status: PublishStatus) => void;
  save_draft: (content: RichTextDocument) => Promise<PublishStatus>;
  publish: (content: RichTextDocument) => Promise<PublishStatus>;
  unpublish: () => Promise<PublishStatus>;
  /** Asked before unpublishing, e.g. `Unpublish "Hello"?` and what's kept. */
  unpublish_confirmation: { title: string; description: string };
  /** Extra buttons after Publish/Unpublish, e.g. a link to the live page. */
  actions?: ReactNode;
  /** Accessible name for the writing area. */
  editor_label: string;
  placeholder: string;
  /** Lets Publish go ahead with nothing written (e.g. a photo collection's optional write-up). */
  allow_empty_publish?: boolean;
  /** Shown between the header and the writing area. */
  before_editor?: ReactNode;
}

/**
 * Writes a rich-text document whose draft is saved separately from what's
 * published: Save draft (⌘/Ctrl+S), Preview, Publish, and Unpublish, with a
 * prompt before leaving with unsaved changes.
 */
export function PublishingEditor({
  title,
  details,
  noun,
  initial_content,
  status,
  on_status_change,
  save_draft,
  publish,
  unpublish,
  unpublish_confirmation,
  actions,
  editor_label,
  placeholder,
  allow_empty_publish = false,
  before_editor,
}: PublishingEditorProps) {
  const toast = useToast();
  const confirm = useConfirm();
  const [pending, set_pending] = useState<Action | null>(null);
  const [is_previewing, set_is_previewing] = useState(false);
  const draft = useRichTextDocument();
  const { is_dirty } = draft;
  // Shared by the editor and the preview, so images aren't looked up twice.
  const media_store = useCreateMediaViewStore();
  const Noun = noun.charAt(0).toUpperCase() + noun.slice(1);

  const write = async (action: "save" | "publish") => {
    const snapshot = draft.get_snapshot();
    if (!snapshot || pending) return;
    if (action === "save" && draft.is_saved(snapshot)) return;
    if (
      action === "publish" &&
      !allow_empty_publish &&
      !hasRichTextContent(snapshot.document)
    ) {
      toast.danger({
        title: "Nothing to publish yet",
        description: "Write something first.",
      });
      return;
    }
    if (!isWithinRichTextLimit(snapshot.json)) {
      toast.danger({
        title: `This ${noun} is too large to save`,
        description: "Trim it down (long code blocks add up quickly) and try again.",
      });
      return;
    }

    set_pending(action);
    try {
      const mutation = action === "save" ? save_draft : publish;
      on_status_change(await mutation(snapshot.document));
      draft.mark_saved(snapshot);
      toast.success({
        title: action === "save" ? "Draft saved" : `${Noun} published`,
      });
    } catch (error) {
      toast.danger({
        title:
          action === "save"
            ? "Couldn't save the draft"
            : `Couldn't publish the ${noun}`,
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      set_pending(null);
    }
  };

  const take_down = async () => {
    if (pending) return;
    const confirmed = await confirm({
      ...unpublish_confirmation,
      confirm_label: "Unpublish",
      is_destructive: true,
    });
    if (!confirmed) return;
    set_pending("unpublish");
    try {
      on_status_change(await unpublish());
      toast.success({ title: `${Noun} unpublished` });
    } catch (error) {
      toast.danger({
        title: `Couldn't unpublish the ${noun}`,
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      set_pending(null);
    }
  };

  useSaveShortcut(() => void write("save"));
  useUnsavedChangesGuard(is_dirty);

  // Read on each render; toggling preview re-renders with the latest document.
  const preview = is_previewing ? draft.get_snapshot() : null;
  const is_up_to_date =
    status.isPublished && !is_dirty && !status.hasUnpublishedChanges;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <StatusLine status={status} is_dirty={is_dirty} />
          {details}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            aria-pressed={is_previewing}
            onClick={() => set_is_previewing((previewing) => !previewing)}
          >
            {is_previewing ? (
              <EyeOffIcon strokeWidth={1.5} size={16} />
            ) : (
              <EyeIcon strokeWidth={1.5} size={16} />
            )}
            {is_previewing ? "Keep writing" : "Preview"}
          </Button>
          <Button
            onClick={() => write("save")}
            disabled={!is_dirty || pending !== null}
            loading={pending === "save"}
            aria-keyshortcuts="Meta+S Control+S"
          >
            <SaveIcon strokeWidth={1.5} size={16} />
            Save draft
          </Button>
          <Button
            variant="success"
            onClick={() => write("publish")}
            disabled={is_up_to_date || pending !== null}
            loading={pending === "publish"}
          >
            <SendIcon strokeWidth={1.5} size={16} />
            {status.isPublished ? "Publish changes" : "Publish"}
          </Button>
          {status.isPublished && (
            <Button
              variant="warning"
              onClick={take_down}
              disabled={pending !== null}
              loading={pending === "unpublish"}
            >
              Unpublish
            </Button>
          )}
          {actions}
        </div>
      </div>
      {before_editor}
      <ClientOnly
        fallback={
          <div
            aria-hidden
            className="min-h-[27rem] border border-neutral-300 dark:border-neutral-700 animate-pulse"
          />
        }
      >
        {/* Hidden, not unmounted, while previewing so undo history survives. */}
        <div hidden={is_previewing}>
          <RichTextEditor
            initial_content={initial_content}
            on_change={draft.on_change}
            label={editor_label}
            placeholder={placeholder}
            media_store={media_store}
          />
        </div>
        {is_previewing && (
          <section
            aria-label="Preview"
            className="border border-dashed border-neutral-300 dark:border-neutral-700 p-4"
          >
            {preview && (
              <DraftPreview snapshot={preview} media_store={media_store} />
            )}
          </section>
        )}
      </ClientOnly>
      <p className="text-sm opacity-80">
        Markdown shortcuts work as you type: <code>##</code> heading,{" "}
        <code>-</code> or <code>1.</code> list, <code>&gt;</code> quote,{" "}
        <code>```</code> code block, <code>**bold**</code>,{" "}
        <code>*italic*</code>, <code>`code`</code>. The image button adds a
        photo from the media library. Press ⌘/Ctrl+S to save the draft.
      </p>
    </>
  );
}
