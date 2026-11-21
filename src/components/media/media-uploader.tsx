import { useBlocker } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ImageUpIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { type DragEvent, useEffect, useId, useRef, useState } from "react";
import {
  formatBytes,
  MEDIA_ACCEPT,
  MEDIA_MAX_BYTES,
  type MediaContentType,
  mediaTagsSchema,
  mediaTypeOf,
} from "~/lib/media";
import { cn } from "~/lib/utils";
import {
  cancelMediaUpload,
  completeMediaUpload,
  createMediaUpload,
} from "~/server/functions/media.functions";
import Button from "../_ui/button";
import { useConfirm } from "../_ui/alert-dialog";
import { SINGLE_LINE_CONTROL_HEIGHT } from "../_ui/input-field";
import { Select } from "../_ui/select";
import type { MediaCameraOption, MediaItem } from "./media-library-item";

const CONCURRENT_UPLOADS = 3;

type UploadStatus = "waiting" | "uploading" | "checking" | "error";

interface Upload {
  key: number;
  file: File;
  content_type: MediaContentType | null;
  /** The camera it's linked to once uploaded; "" for none. */
  camera_id: string;
  /** Its tags once uploaded, as typed (comma-separated). */
  tags: string;
  status: UploadStatus;
  /** 0–1, while uploading. */
  progress: number;
  error?: string;
}

/** Why a file can't be uploaded at all, checked before asking the server. */
function fileProblem(file: File, content_type: MediaContentType | null) {
  if (!content_type) return "Not a supported image type";
  if (file.size === 0) return "The file is empty";
  if (file.size > MEDIA_MAX_BYTES) {
    return `Larger than ${formatBytes(MEDIA_MAX_BYTES)}`;
  }
  return undefined;
}

const FIX_TAGS_MESSAGE = "Fix the tags above, then retry.";

/** Why the typed tags can't be used, if they can't. */
function tagsProblem(tags: string) {
  const result = mediaTagsSchema.safeParse(tags);
  return result.success ? undefined : result.error.issues[0]?.message;
}

/**
 * The image's size as displayed (browsers apply EXIF rotation, as imgproxy
 * does), or null if this browser can't decode it (e.g. HEIC outside Safari).
 */
function readImageSize(file: File) {
  return new Promise<{ width: number; height: number } | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    const finish = (size: { width: number; height: number } | null) => {
      URL.revokeObjectURL(url);
      resolve(size);
    };
    image.onload = () =>
      finish(
        image.naturalWidth && image.naturalHeight
          ? { width: image.naturalWidth, height: image.naturalHeight }
          : null,
      );
    image.onerror = () => finish(null);
    image.src = url;
  });
}

/**
 * PUTs the file to its presigned URL. XHR rather than fetch, for upload
 * progress. Content-Type must match what the URL was signed for.
 */
export function putFile(
  url: string,
  file: File,
  content_type: string,
  on_progress: (progress: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url);
    request.setRequestHeader("Content-Type", content_type);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) on_progress(event.loaded / event.total);
    };
    request.onload = () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error(`Storage refused the file (HTTP ${request.status}).`));
    // A CORS rejection looks like a network error to the page.
    request.onerror = () =>
      reject(
        new Error(
          "Couldn't reach storage. If this keeps happening, check the bucket's CORS settings.",
        ),
      );
    request.send(file);
  });
}

function statusLabel(upload: Upload) {
  switch (upload.status) {
    case "waiting":
      return "Waiting";
    case "uploading":
      return `${Math.round(upload.progress * 100)}%`;
    case "checking":
      return "Checking…";
    case "error":
      return "Failed";
  }
}

/** How many uploads are running (or waiting) and how many have failed. */
export interface UploadActivity {
  in_progress: number;
  failed: number;
}

/** "Uploading 2… · 1 failed", or null when nothing is running or failed. */
export function uploadActivityLabel({ in_progress, failed }: UploadActivity) {
  const parts = [
    in_progress > 0 && `Uploading ${in_progress}…`,
    failed > 0 && `${failed} failed`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

interface MediaUploaderProps {
  disabled?: boolean;
  /** Cameras new uploads can be linked to. */
  cameras: ReadonlyArray<MediaCameraOption>;
  /** Called with each file once it's in the library. */
  on_uploaded: (item: MediaItem) => Promise<void>;
  /** Called whenever the running or failed counts change. */
  on_activity_change?: (activity: UploadActivity) => void;
}

/**
 * Pick or drop images to upload. Files go straight from the browser to the
 * bucket (a few at a time); the server only hands out URLs and checks results.
 */
export function MediaUploader({
  disabled,
  cameras,
  on_uploaded,
  on_activity_change,
}: MediaUploaderProps) {
  const create_upload = useServerFn(createMediaUpload);
  const complete_upload = useServerFn(completeMediaUpload);
  const cancel_upload = useServerFn(cancelMediaUpload);
  const confirm = useConfirm();
  const [uploads, set_uploads] = useState<Upload[]>([]);
  const [is_dragging, set_is_dragging] = useState(false);
  const [camera_id, set_camera_id] = useState("");
  const [tags, set_tags] = useState("");
  const tags_problem = tagsProblem(tags);
  const field_id = useId();
  const next_key = useRef(0);
  const waiting = useRef<Upload[]>([]);
  const active = useRef(0);
  // Uploads outlive the render that started them; always use the latest.
  const latest = useRef({
    create_upload,
    complete_upload,
    cancel_upload,
    on_uploaded,
    on_activity_change,
  });
  useEffect(() => {
    latest.current = {
      create_upload,
      complete_upload,
      cancel_upload,
      on_uploaded,
      on_activity_change,
    };
  });

  const patch = (key: number, changes: Partial<Upload>) =>
    set_uploads((list) =>
      list.map((upload) => (upload.key === key ? { ...upload, ...changes } : upload)),
    );
  const dismiss = (key: number) =>
    set_uploads((list) => list.filter((upload) => upload.key !== key));

  const run = async (upload: Upload, content_type: MediaContentType) => {
    const { create_upload, complete_upload, cancel_upload } = latest.current;
    let pending_id: string | null = null;
    let item: MediaItem;
    patch(upload.key, { status: "uploading", progress: 0, error: undefined });
    try {
      const size = await readImageSize(upload.file);
      const { id, upload_url } = await create_upload({
        data: {
          filename: upload.file.name,
          contentType: content_type,
          byteSize: upload.file.size,
          width: size?.width ?? null,
          height: size?.height ?? null,
          cameraId: upload.camera_id,
          tags: upload.tags,
        },
      });
      pending_id = id;
      await putFile(upload_url, upload.file, content_type, (progress) =>
        patch(upload.key, { progress }),
      );
      patch(upload.key, { status: "checking", progress: 1 });
      item = await complete_upload({ data: { id } });
    } catch (error) {
      if (pending_id) {
        void cancel_upload({ data: { id: pending_id } }).catch(() => undefined);
      }
      patch(upload.key, {
        status: "error",
        error: error instanceof Error ? error.message : "The upload failed.",
      });
      return;
    }
    dismiss(upload.key);
    await latest.current.on_uploaded(item);
  };

  const pump = () => {
    while (active.current < CONCURRENT_UPLOADS && waiting.current.length > 0) {
      const upload = waiting.current.shift()!;
      active.current += 1;
      void run(upload, upload.content_type!).finally(() => {
        active.current -= 1;
        pump();
      });
    }
  };

  const enqueue = (upload: Upload) => {
    waiting.current.push(upload);
    pump();
  };

  const add_files = (files: Iterable<File> | ArrayLike<File>) => {
    if (disabled) return;
    const added = Array.from(files, (file): Upload => {
      const content_type = mediaTypeOf(file);
      const error =
        fileProblem(file, content_type) ??
        (tags_problem ? FIX_TAGS_MESSAGE : undefined);
      return {
        key: next_key.current++,
        file,
        content_type,
        camera_id,
        tags,
        status: error ? "error" : "waiting",
        progress: 0,
        error,
      };
    });
    if (added.length === 0) return;
    set_uploads((list) => [...list, ...added]);
    for (const upload of added) if (upload.status === "waiting") enqueue(upload);
  };

  // A retry takes the camera and tags as they are now (e.g. after fixing them).
  const retry = (upload: Upload) => {
    if (tags_problem) {
      patch(upload.key, { error: FIX_TAGS_MESSAGE });
      return;
    }
    const changes = {
      status: "waiting",
      progress: 0,
      error: undefined,
      camera_id,
      tags,
    } satisfies Partial<Upload>;
    patch(upload.key, changes);
    enqueue({ ...upload, ...changes });
  };

  const in_progress = uploads.filter((upload) => upload.status !== "error").length;
  const failed = uploads.length - in_progress;
  useEffect(() => {
    latest.current.on_activity_change?.({ in_progress, failed });
  }, [in_progress, failed]);

  // Leaving the page would cut uploads off midway.
  const busy = useRef(false);
  useEffect(() => {
    busy.current = in_progress > 0;
  }, [in_progress]);
  useBlocker({
    shouldBlockFn: async () =>
      busy.current &&
      !(await confirm({
        title: "Leave while photos upload?",
        description: "Uploads are still in progress. Leaving this page stops them.",
        confirm_label: "Leave page",
        cancel_label: "Stay",
        is_destructive: true,
      })),
    enableBeforeUnload: () => busy.current,
  });

  const on_drag_over = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    if (!disabled) set_is_dragging(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {cameras.length > 0 && (
            <div className="flex flex-col">
              <label htmlFor={`${field_id}-camera`}>Taken with</label>
              <Select
                id={`${field_id}-camera`}
                value={camera_id}
                disabled={disabled}
                aria-describedby={`${field_id}-hint`}
                onChange={(event) => set_camera_id(event.target.value)}
              >
                <option value="">No camera</option>
                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex flex-col">
            <label htmlFor={`${field_id}-tags`}>Tags (comma-separated)</label>
            <input
              id={`${field_id}-tags`}
              type="text"
              value={tags}
              disabled={disabled}
              placeholder="iceland, landscape"
              aria-invalid={tags_problem ? true : undefined}
              aria-describedby={
                tags_problem
                  ? `${field_id}-hint ${field_id}-tags-error`
                  : `${field_id}-hint`
              }
              onChange={(event) => set_tags(event.target.value)}
              className={cn(
                "w-full border outline-offset-2 px-2 py-1",
                SINGLE_LINE_CONTROL_HEIGHT,
                "focus:outline-neutral-900 dark:focus:outline-white focus:outline-1",
                "disabled:opacity-60",
              )}
            />
            {tags_problem && (
              <p
                id={`${field_id}-tags-error`}
                className="text-sm text-rose-700 dark:text-rose-300"
              >
                {tags_problem}
              </p>
            )}
          </div>
        </div>
        <p id={`${field_id}-hint`} className="text-sm opacity-80">
          These apply to the photos you add next. Each photo's details can
          change them later.
        </p>
      </div>
      <label
        onDragEnter={on_drag_over}
        onDragOver={on_drag_over}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            set_is_dragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          set_is_dragging(false);
          add_files(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 border border-dashed p-8 text-center transition-colors",
          "focus-within:outline focus-within:outline-offset-2 focus-within:outline-neutral-800 dark:focus-within:outline-white",
          is_dragging
            ? "border-neutral-900 bg-neutral-200 dark:border-white dark:bg-neutral-800"
            : "border-neutral-400 dark:border-neutral-600",
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-neutral-800 dark:hover:border-white",
        )}
      >
        <ImageUpIcon strokeWidth={1.5} size={24} aria-hidden />
        <span>
          <span className="font-medium underline">Choose photos</span> or drop
          them here
        </span>
        <span className="text-sm opacity-80">
          JPEG, PNG, WebP, AVIF, GIF, or HEIC, up to{" "}
          {formatBytes(MEDIA_MAX_BYTES)} each
        </span>
        <input
          type="file"
          multiple
          accept={MEDIA_ACCEPT}
          disabled={disabled}
          className="sr-only"
          onChange={(event) => {
            add_files(event.currentTarget.files ?? []);
            // Lets the same file be picked again after a failure.
            event.currentTarget.value = "";
          }}
        />
      </label>

      {/* Announces progress; each file's row shows it visually. */}
      <p aria-live="polite" className="sr-only">
        {in_progress > 0 &&
          `Uploading ${in_progress} ${in_progress === 1 ? "file" : "files"}…`}
        {in_progress > 0 && failed > 0 && " "}
        {failed > 0 && `${failed} ${failed === 1 ? "upload" : "uploads"} failed.`}
      </p>

      {uploads.length > 0 && (
        <ul className="flex flex-col gap-2">
          {uploads.map((upload) => (
            <li
              key={upload.key}
              className="border border-neutral-300 dark:border-neutral-700 flex items-center gap-4 p-2"
            >
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <p className="text-sm truncate">
                  <span className="font-medium">{upload.file.name}</span>{" "}
                  <span className="opacity-80">{formatBytes(upload.file.size)}</span>
                </p>
                {upload.status === "error" ? (
                  <p className="text-sm text-rose-700 dark:text-rose-300">
                    {upload.error}
                  </p>
                ) : (
                  <div
                    role="progressbar"
                    aria-label={`Uploading ${upload.file.name}`}
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
                )}
              </div>
              <span aria-hidden className="text-sm opacity-80 tabular-nums">
                {statusLabel(upload)}
              </span>
              {upload.status === "error" &&
                !fileProblem(upload.file, upload.content_type) && (
                  <Button
                    size="icon"
                    aria-label={`Retry ${upload.file.name}`}
                    title="Retry"
                    onClick={() => retry(upload)}
                  >
                    <RotateCcwIcon strokeWidth={1.5} size={16} />
                  </Button>
                )}
              {upload.status === "error" && (
                <Button
                  size="icon"
                  aria-label={`Dismiss ${upload.file.name}`}
                  title="Dismiss"
                  onClick={() => dismiss(upload.key)}
                >
                  <XIcon strokeWidth={1.5} size={16} />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
