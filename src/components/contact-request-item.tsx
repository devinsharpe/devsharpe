// Admin: one message from the contact form, and the actions on it.
import { isNotFound, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { MailIcon, MailOpenIcon, ReplyIcon, Trash2Icon } from "lucide-react";
import { type ComponentProps, useId, useState } from "react";
import { replyHref, telHref } from "~/lib/contact";
import { cn } from "~/lib/utils";
import {
  deleteContactRequest,
  type listContactRequests,
  setContactRequestRead,
} from "~/server/functions/contact.functions";
import Button from "./_ui/button";
import { useConfirm } from "./_ui/alert-dialog";
import Link from "./_ui/link";
import { LocalTime } from "./_ui/local-time";
import { useToast } from "./_ui/toast";

export type ContactRequestSummary = Awaited<
  ReturnType<typeof listContactRequests>
>["unread"][number];

/** Mark read/unread and delete, with toasts; refreshes the page's data after. */
export function useContactRequestActions() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const set_read = useServerFn(setContactRequestRead);
  const delete_request = useServerFn(deleteContactRequest);
  const [busy_id, set_busy_id] = useState<string | null>(null);

  const run = async (
    item: ContactRequestSummary,
    action: () => Promise<unknown>,
    failure: string,
  ) => {
    set_busy_id(item.id);
    try {
      await action();
      return true;
    } catch (reason) {
      toast.danger({
        title: failure,
        description: isNotFound(reason)
          ? "It's already been deleted."
          : reason instanceof Error
            ? reason.message
            : undefined,
      });
      return false;
    } finally {
      await router.invalidate();
      set_busy_id(null);
    }
  };

  return {
    busy_id,
    toggle_read: (item: ContactRequestSummary) => {
      const read = item.readAt === null;
      return run(
        item,
        () => set_read({ data: { id: item.id, read } }),
        read ? "Couldn't mark it read" : "Couldn't mark it unread",
      );
    },
    remove: async (item: ContactRequestSummary) => {
      const confirmed = await confirm({
        title: `Delete the message from ${item.name}?`,
        description: "This can't be undone.",
        confirm_label: "Delete message",
        is_destructive: true,
      });
      if (!confirmed) return;
      const deleted = await run(
        item,
        () => delete_request({ data: { id: item.id } }),
        "Couldn't delete the message",
      );
      if (deleted) toast.success({ title: `Deleted the message from ${item.name}` });
    },
  };
}

interface ContactRequestItemProps extends ComponentProps<"li"> {
  item: ContactRequestSummary;
  /** Shortens long messages to a few lines (the dashboard). */
  is_compact?: boolean;
  is_busy?: boolean;
  on_toggle_read: (item: ContactRequestSummary) => void;
  on_delete: (item: ContactRequestSummary) => void;
}

/** One contact request in an admin list; render inside a <ul>. */
export function ContactRequestItem({
  item,
  is_compact = false,
  is_busy = false,
  on_toggle_read,
  on_delete,
  className,
  ...props
}: ContactRequestItemProps) {
  const title_id = useId();
  const is_new = item.readAt === null;

  return (
    <li
      {...props}
      className={cn(
        "border border-neutral-300 dark:border-neutral-700 flex flex-col gap-2 p-2",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col flex-1 min-w-0">
          <p className="opacity-80 text-sm">
            {is_new && <span className="font-semibold">New · </span>}
            Received <LocalTime date={item.createdAt} />
          </p>
          <p id={title_id} className="font-medium break-words">
            {item.name}
          </p>
          <p className="text-sm flex flex-wrap gap-x-3">
            <a href={replyHref(item.email)} className="underline break-all">
              {item.email}
            </a>
            {item.phone && (
              <a href={telHref(item.phone)} className="underline">
                {item.phone}
              </a>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={replyHref(item.email)}
            size="icon"
            aria-label="Reply by email"
            aria-describedby={title_id}
            title="Reply by email"
          >
            <ReplyIcon strokeWidth={1.5} size={16} />
          </Link>
          <Button
            size="icon"
            aria-label={is_new ? "Mark as read" : "Mark as unread"}
            aria-describedby={title_id}
            title={is_new ? "Mark as read" : "Mark as unread"}
            disabled={is_busy}
            onClick={() => on_toggle_read(item)}
          >
            {is_new ? (
              <MailOpenIcon strokeWidth={1.5} size={16} />
            ) : (
              <MailIcon strokeWidth={1.5} size={16} />
            )}
          </Button>
          <Button
            size="icon"
            aria-label="Delete"
            aria-describedby={title_id}
            title="Delete"
            disabled={is_busy}
            onClick={() => on_delete(item)}
          >
            <Trash2Icon strokeWidth={1.5} size={16} />
          </Button>
        </div>
      </div>
      {/* Plain text, exactly as sent (React escapes it). */}
      <p
        className={cn(
          "whitespace-pre-wrap break-words",
          is_compact && "line-clamp-4",
        )}
      >
        {item.message}
      </p>
    </li>
  );
}
