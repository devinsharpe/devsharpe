// Admin: the PDF résumé visitors download from /employment, the previous
// ones, and the Markdown version written from the positions and projects.
import { SiMarkdown } from "@icons-pack/react-simple-icons";
import { useBlocker, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArchiveRestoreIcon,
  DownloadIcon,
  FileTextIcon,
  FileUpIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatBytes } from "~/lib/media";
import {
  isPdfFile,
  RESUME_ACCEPT,
  RESUME_CONTENT_TYPE,
  RESUME_MAX_BYTES,
} from "~/lib/resume";
import {
  cancelResumeUpload,
  completeResumeUpload,
  createResumeUpload,
  deleteResume,
  getResumeLibrary,
  makeResumeCurrent,
} from "~/server/functions/resume.functions";
import Button from "./_ui/button";
import { useConfirm } from "./_ui/alert-dialog";
import Link from "./_ui/link";
import { LocalTime } from "./_ui/local-time";
import { useToast } from "./_ui/toast";
import { putFile } from "./media/media-uploader";

type ResumeLibrary = Awaited<ReturnType<typeof getResumeLibrary>>;
type ResumeSummary = NonNullable<ResumeLibrary["current"]>;

/** Previous résumés shown before "View All". */
const PREVIOUS_SHOWN = 3;

/** Made current again later than it was uploaded (by more than a minute). */
const wasRestored = (item: ResumeSummary) =>
  item.madeCurrentAt !== null &&
  item.madeCurrentAt.getTime() - item.createdAt.getTime() > 60_000;

/** Why a file can't be uploaded, checked before asking the server. */
function fileProblem(file: File) {
  if (!isPdfFile(file)) return "That isn't a PDF. Choose a .pdf file.";
  if (file.size === 0) return "The file is empty.";
  if (file.size > RESUME_MAX_BYTES) {
    return `Résumés can be up to ${formatBytes(RESUME_MAX_BYTES)}.`;
  }
  return null;
}

interface Upload {
  name: string;
  status: "uploading" | "checking";
  /** 0–1, while uploading. */
  progress: number;
}

interface ResumeRowProps {
  item: ResumeSummary;
  is_current: boolean;
  disabled: boolean;
  on_make_current: (item: ResumeSummary) => void;
  on_delete: (item: ResumeSummary) => void;
}

function ResumeRow({
  item,
  is_current,
  disabled,
  on_make_current,
  on_delete,
}: ResumeRowProps) {
  return (
    <li className="border border-neutral-300 dark:border-neutral-700 flex items-center gap-3 p-2">
      <FileTextIcon strokeWidth={1.5} size={20} className="shrink-0" aria-hidden />
      <div className="flex flex-col flex-1 min-w-0">
        <p className="font-medium truncate" title={item.originalName}>
          {item.originalName}
        </p>
        <p className="text-sm opacity-80">
          {formatBytes(item.byteSize)} · uploaded <LocalTime date={item.createdAt} />
          {is_current && wasRestored(item) && item.madeCurrentAt && (
            <>
              {" "}
              · made current <LocalTime date={item.madeCurrentAt} />
            </>
          )}
        </p>
      </div>
      <div className="flex gap-2">
        {/* The admin-only route for one specific file. */}
        <Link
          href={`/resume.pdf?id=${encodeURIComponent(item.id)}`}
          download
          size="icon"
          aria-label={`Download ${item.originalName}`}
          title="Download"
        >
          <DownloadIcon strokeWidth={1.5} size={16} />
        </Link>
        {!is_current && (
          <Button
            size="icon"
            aria-label={`Make ${item.originalName} the current résumé`}
            title="Make current"
            disabled={disabled}
            onClick={() => on_make_current(item)}
          >
            <ArchiveRestoreIcon strokeWidth={1.5} size={16} />
          </Button>
        )}
        <Button
          size="icon"
          aria-label={`Delete ${item.originalName}`}
          title="Delete"
          disabled={disabled}
          onClick={() => on_delete(item)}
        >
          <Trash2Icon strokeWidth={1.5} size={16} />
        </Button>
      </div>
    </li>
  );
}

export function ResumeManager({ library }: { library: ResumeLibrary }) {
  const { current, previous, setup } = library;
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const create_upload = useServerFn(createResumeUpload);
  const complete_upload = useServerFn(completeResumeUpload);
  const cancel_upload = useServerFn(cancelResumeUpload);
  const make_current = useServerFn(makeResumeCurrent);
  const delete_resume = useServerFn(deleteResume);
  const input_ref = useRef<HTMLInputElement>(null);
  const [upload, set_upload] = useState<Upload | null>(null);
  const [error, set_error] = useState<string | null>(null);
  const [is_busy, set_is_busy] = useState(false);
  const [show_all, set_show_all] = useState(false);
  const shown_previous = show_all ? previous : previous.slice(0, PREVIOUS_SHOWN);

  // Leaving the page would cut the upload off midway.
  const is_uploading = useRef(false);
  useEffect(() => {
    is_uploading.current = upload !== null;
  }, [upload]);
  useBlocker({
    shouldBlockFn: async () =>
      is_uploading.current &&
      !(await confirm({
        title: "Leave while the résumé uploads?",
        description: "Leaving this page stops the upload.",
        confirm_label: "Leave page",
        cancel_label: "Stay",
        is_destructive: true,
      })),
    enableBeforeUnload: () => is_uploading.current,
  });

  const upload_file = async (file: File) => {
    const problem = fileProblem(file);
    set_error(problem);
    if (problem) return;
    set_upload({ name: file.name, status: "uploading", progress: 0 });
    let pending_id: string | null = null;
    try {
      const { id, upload_url } = await create_upload({
        data: { filename: file.name, byteSize: file.size },
      });
      pending_id = id;
      await putFile(upload_url, file, RESUME_CONTENT_TYPE, (progress) =>
        set_upload((value) => value && { ...value, progress }),
      );
      set_upload((value) => value && { ...value, status: "checking", progress: 1 });
      await complete_upload({ data: { id } });
    } catch (reason) {
      if (pending_id) {
        void cancel_upload({ data: { id: pending_id } }).catch(() => undefined);
      }
      set_upload(null);
      set_error(reason instanceof Error ? reason.message : "The upload failed.");
      return;
    }
    set_upload(null);
    toast.success({
      title: "Résumé uploaded",
      description: "It's the one visitors download now.",
    });
    await router.invalidate();
  };

  const run = async (action: () => Promise<unknown>, failure: string) => {
    set_is_busy(true);
    set_error(null);
    try {
      await action();
    } catch (reason) {
      toast.danger({
        title: failure,
        description: reason instanceof Error ? reason.message : undefined,
      });
    } finally {
      await router.invalidate();
      set_is_busy(false);
    }
  };

  const handle_make_current = (item: ResumeSummary) =>
    run(
      () => make_current({ data: { id: item.id } }),
      "Couldn't make that résumé current",
    );

  const handle_delete = async (item: ResumeSummary) => {
    const is_current = item.id === current?.id;
    const next = is_current ? previous[0] : undefined;
    const consequence = !is_current
      ? ""
      : next
        ? `"${next.originalName}" will become the current résumé. `
        : "Visitors will only be able to download the Markdown version. ";
    const confirmed = await confirm({
      title: `Delete "${item.originalName}"?`,
      description: `${consequence}This can't be undone.`,
      confirm_label: "Delete résumé",
      is_destructive: true,
    });
    if (!confirmed) return;
    void run(() => delete_resume({ data: { id: item.id } }), "Couldn't delete the résumé");
  };

  const disabled = is_busy || upload !== null;
  const row = (item: ResumeSummary, is_current: boolean) => (
    <ResumeRow
      key={item.id}
      item={item}
      is_current={is_current}
      disabled={disabled}
      on_make_current={handle_make_current}
      on_delete={handle_delete}
    />
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">Résumé</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/resume.md" download>
            <SiMarkdown strokeWidth={1.5} size={16} />
            <span>Download Markdown</span>
          </Link>
          <Button
            disabled={!setup.can_upload || disabled}
            onClick={() => input_ref.current?.click()}
          >
            <FileUpIcon strokeWidth={1.5} size={16} />
            <span>{current ? "Upload New PDF" : "Upload PDF"}</span>
          </Button>
          <input
            ref={input_ref}
            type="file"
            accept={RESUME_ACCEPT}
            hidden
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              // Lets the same file be picked again after a failure.
              event.currentTarget.value = "";
              if (file) void upload_file(file);
            }}
          />
        </div>
      </div>
      <p className="text-sm opacity-80">
        Visitors download these from the employment page. The Markdown version
        is written fresh each time from your positions and projects. PDFs can
        be up to {formatBytes(RESUME_MAX_BYTES)}.
      </p>
      {!setup.can_upload && (
        <p className="border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/40 p-3 text-sm">
          PDF uploads are off: media storage isn't configured. Set{" "}
          {setup.missing_storage.map((name, index) => (
            <span key={name}>
              {index > 0 && ", "}
              <code>{name}</code>
            </span>
          ))}{" "}
          in the server environment, then restart the server.
        </p>
      )}
      {upload && (
        <div className="flex flex-col gap-1">
          <p className="text-sm truncate">
            <span className="font-medium">{upload.name}</span>{" "}
            <span className="opacity-80" aria-live="polite">
              {upload.status === "checking"
                ? "Checking…"
                : `Uploading… ${Math.round(upload.progress * 100)}%`}
            </span>
          </p>
          <div
            role="progressbar"
            aria-label={`Uploading ${upload.name}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(upload.progress * 100)}
            className="h-1 w-full bg-neutral-300 dark:bg-neutral-700"
          >
            <div
              className="h-full bg-neutral-900 dark:bg-white transition-[width]"
              style={{ width: `${upload.progress * 100}%` }}
            />
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      <h3 className="text-lg font-semibold">Current Résumé</h3>
      {current ? (
        <ul>{row(current, true)}</ul>
      ) : (
        <p className="italic opacity-80">
          No PDF yet, so visitors only see the Markdown download.
        </p>
      )}
      <h3 className="text-lg font-semibold">Previous Résumés</h3>
      {previous.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {shown_previous.map((item) => row(item, false))}
        </ul>
      ) : (
        <p className="italic opacity-80">
          {current
            ? "None yet. Uploading a new PDF keeps this one here."
            : "None yet."}
        </p>
      )}
      {previous.length > PREVIOUS_SHOWN && (
        <Button aria-expanded={show_all} onClick={() => set_show_all((value) => !value)}>
          {show_all ? "Show Fewer" : `View All (${previous.length})`}
        </Button>
      )}
    </section>
  );
}
