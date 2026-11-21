import { ClientOnly, isNotFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { EyeIcon, HistoryIcon, SaveIcon } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "~/lib/utils";
import {
  hasRichTextContent,
  isWithinRichTextLimit,
  type RichTextDocument,
  type RichTextMediaMap,
} from "~/lib/rich-text";
import {
  getBiographyEditor,
  getBiographyVersion,
  restoreBiography,
  saveBiography,
} from "~/server/functions/about.functions";
import Button from "./_ui/button";
import { useConfirm } from "./_ui/alert-dialog";
import Dialog from "./_ui/dialog";
import { formatLocalTime, LocalTime } from "./_ui/local-time";
import { useToast } from "./_ui/toast";
import { RICH_TEXT_PROSE } from "./rich-text/rich-text-classes";
import { RichTextEditor } from "./rich-text/rich-text-editor";
import { RichTextRenderer } from "./rich-text/rich-text-renderer";
import {
  useRichTextDocument,
  useSaveShortcut,
  useUnsavedChangesGuard,
} from "./rich-text/use-rich-text-document";

type BiographyEditorData = Awaited<ReturnType<typeof getBiographyEditor>>;
type PreviousBiography = BiographyEditorData["previous"][number];

function errorDescription(error: unknown) {
  if (isNotFound(error)) return "It no longer exists. Refresh the page and try again.";
  return error instanceof Error ? error.message : undefined;
}

interface PreviousBiographyItemProps {
  version: PreviousBiography;
  on_preview: () => void;
  on_restore: () => void;
  is_restoring: boolean;
  disabled: boolean;
}

function PreviousBiographyItem({
  version,
  on_preview,
  on_restore,
  is_restoring,
  disabled,
}: PreviousBiographyItemProps) {
  const date_id = useId();
  return (
    <li className="border border-neutral-300 dark:border-neutral-700 flex items-start gap-4 p-2">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <p id={date_id} className="text-sm opacity-80">
          <LocalTime date={version.createdAt} />
          {version.restoredFromCreatedAt && (
            <>
              {" · restored from "}
              <LocalTime date={version.restoredFromCreatedAt} />
            </>
          )}
        </p>
        <p className="text-sm line-clamp-2">{version.excerpt}</p>
      </div>
      <Button
        size="icon"
        aria-label="Preview this version"
        aria-describedby={date_id}
        title="Preview"
        onClick={on_preview}
      >
        <EyeIcon strokeWidth={1.5} size={16} />
      </Button>
      <Button
        size="icon"
        aria-label="Restore this version"
        aria-describedby={date_id}
        title="Restore"
        loading={is_restoring}
        disabled={disabled}
        onClick={on_restore}
      >
        <HistoryIcon strokeWidth={1.5} size={16} />
      </Button>
    </li>
  );
}

interface BiographySectionProps extends BiographyEditorData {
  /** Reloads the page's data; called after the current biography changes. */
  on_changed: () => Promise<void>;
}

/**
 * Admin editor for the homepage biography. Every save becomes a new version
 * (the newest is live); older versions can be previewed and restored.
 */
export function BiographySection({
  current,
  previous,
  previous_total,
  on_changed,
}: BiographySectionProps) {
  const save = useServerFn(saveBiography);
  const restore = useServerFn(restoreBiography);
  const fetch_version = useServerFn(getBiographyVersion);
  const toast = useToast();
  const confirm = useConfirm();
  const biography = useRichTextDocument();
  // Bumped to remount the editor with restored content (saving keeps it mounted).
  const [editor_key, set_editor_key] = useState(0);
  const [is_saving, set_is_saving] = useState(false);
  const [restoring_id, set_restoring_id] = useState<string | null>(null);
  const [preview, set_preview] = useState<{
    version: PreviousBiography;
    content: RichTextDocument | null;
    media: RichTextMediaMap;
  } | null>(null);
  const is_busy = is_saving || restoring_id !== null;

  const handle_save = async () => {
    const snapshot = biography.get_snapshot();
    if (!snapshot || is_busy || biography.is_saved(snapshot)) return;
    if (!hasRichTextContent(snapshot.document)) {
      toast.danger({ title: "Nothing to save yet", description: "Write something first." });
      return;
    }
    if (!isWithinRichTextLimit(snapshot.json)) {
      toast.danger({ title: "This biography is too large to save" });
      return;
    }

    set_is_saving(true);
    try {
      await save({ data: { content: snapshot.document } });
    } catch (error) {
      toast.danger({
        title: "Couldn't save the biography",
        description: errorDescription(error),
      });
      return;
    } finally {
      set_is_saving(false);
    }
    biography.mark_saved(snapshot);
    toast.success({
      title: "Biography saved",
      description: "It's now live on the homepage.",
    });
    await on_changed(); // The old version moves into the history.
  };

  const handle_restore = async (version: PreviousBiography) => {
    if (is_busy) return;
    const when = formatLocalTime(version.createdAt);
    const confirmed = await confirm({
      title: `Restore the biography from ${when}?`,
      description:
        (biography.is_dirty ? "Your unsaved changes will be lost. " : "") +
        "It goes live on the homepage, and the current biography stays in the history.",
      confirm_label: "Restore",
      // Only unsaved changes are lost for good.
      is_destructive: biography.is_dirty,
    });
    if (!confirmed) return;

    set_restoring_id(version.id);
    try {
      await restore({ data: { id: version.id } });
    } catch (error) {
      toast.danger({
        title: "Couldn't restore that biography",
        description: errorDescription(error),
      });
      set_restoring_id(null);
      return;
    }
    await on_changed(); // Loads the restored copy as `current`.
    biography.reset(); // ...which the remounted editor reports as the baseline.
    set_editor_key((key) => key + 1);
    set_preview(null);
    set_restoring_id(null);
    toast.success({
      title: "Biography restored",
      description: `The version from ${when} is live again.`,
    });
  };

  const open_preview = async (version: PreviousBiography) => {
    set_preview({ version, content: null, media: {} });
    try {
      const { content, media } = await fetch_version({
        data: { id: version.id },
      });
      // Ignore the result if the dialog was closed or switched meanwhile.
      set_preview((open) =>
        open?.version.id === version.id ? { version, content, media } : open,
      );
    } catch (error) {
      set_preview(null);
      toast.danger({
        title: "Couldn't load that biography",
        description: errorDescription(error),
      });
    }
  };

  useSaveShortcut(() => void handle_save());
  useUnsavedChangesGuard(biography.is_dirty);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold">Current Biography</h2>
          <p className="text-sm opacity-80">
            {current ? (
              <>
                Live on the homepage · saved <LocalTime date={current.createdAt} />
              </>
            ) : (
              "Not written yet"
            )}
            {biography.is_dirty && " · Unsaved changes"}
          </p>
        </div>
        <Button
          onClick={() => void handle_save()}
          disabled={!biography.is_dirty || is_busy}
          loading={is_saving}
          aria-keyshortcuts="Meta+S Control+S"
        >
          <SaveIcon strokeWidth={1.5} size={16} />
          Save Biography
        </Button>
      </div>
      <ClientOnly
        fallback={
          <div
            aria-hidden
            className="min-h-[27rem] border border-neutral-300 dark:border-neutral-700 animate-pulse"
          />
        }
      >
        <RichTextEditor
          key={editor_key}
          initial_content={current?.content ?? null}
          on_change={biography.on_change}
          label="Biography"
          placeholder="Introduce yourself…"
        />
      </ClientOnly>

      <h3 className="text-lg font-semibold">Previous Biographies</h3>
      {previous.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {previous.map((version) => (
            <PreviousBiographyItem
              key={version.id}
              version={version}
              on_preview={() => void open_preview(version)}
              on_restore={() => void handle_restore(version)}
              is_restoring={restoring_id === version.id}
              disabled={is_busy}
            />
          ))}
        </ul>
      ) : (
        <p className="italic opacity-80">
          No previous biographies yet. Each save keeps the one before it here.
        </p>
      )}
      {previous_total > previous.length && (
        <p className="text-sm opacity-80">
          Showing the {previous.length} most recent of {previous_total}.
        </p>
      )}

      <Dialog.Root
        open={preview !== null}
        onOpenChange={(open) => !open && set_preview(null)}
      >
        <Dialog.Content className="max-w-2xl gap-4">
          {preview && (
            <>
              <div className="-mx-2 px-2 pb-2 pr-12 border-b">
                <h2 className="text-2xl font-bold">Previous Biography</h2>
                <p className="text-sm opacity-80">
                  Saved <LocalTime date={preview.version.createdAt} />
                </p>
              </div>
              {preview.content ? (
                <RichTextRenderer
                  document={preview.content}
                  media={preview.media}
                  className={cn(RICH_TEXT_PROSE, "px-2")}
                />
              ) : (
                <p className="px-2 italic opacity-80">Loading…</p>
              )}
              <div className="-mx-2 px-2 pt-2 border-t flex justify-end gap-2">
                <Button onClick={() => set_preview(null)}>Close</Button>
                <Button
                  variant="success"
                  onClick={() => void handle_restore(preview.version)}
                  loading={restoring_id === preview.version.id}
                  disabled={!preview.content || is_busy}
                >
                  <HistoryIcon strokeWidth={1.5} size={16} />
                  Restore This Version
                </Button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Root>
    </section>
  );
}
