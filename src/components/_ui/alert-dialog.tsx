// Asks before something that can't be taken back (deleting, unpublishing,
// leaving with unsaved work), in place of `window.confirm`.
//
//   const confirm = useConfirm();
//   const confirmed = await confirm({
//     title: `Delete "${item.name}"?`,
//     description: "This can't be undone.",
//     confirm_label: "Delete",
//     is_destructive: true,
//   });
//   if (!confirmed) return;
//
// `useConfirm` needs an <AlertDialogProvider> above it (the admin layout has
// one). Unlike Dialog there's no close button: you pick one of the two
// actions, and Escape cancels. It's a native modal <dialog>, so it opens
// above any Dialog that's already open, and focus goes back where it was.
import { useHydrated, useLayoutEffect } from "@tanstack/react-router";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "~/lib/utils";
import Button from "./button";

export interface ConfirmOptions {
  /** The question, e.g. `Delete "Iceland"?`. */
  title: string;
  /** What happens if they go ahead. Strings become a paragraph. */
  description?: ReactNode;
  /** Names the action, e.g. "Delete photo"; avoid a bare "OK". */
  confirm_label: string;
  /** Defaults to "Cancel". */
  cancel_label?: string;
  /**
   * Styles the action as `danger` and puts focus on Cancel, so a stray Enter
   * doesn't go ahead.
   */
  is_destructive?: boolean;
}

interface AlertDialogProps extends ConfirmOptions {
  open: boolean;
  on_confirm: () => void;
  on_cancel: () => void;
}

/** The dialog itself, controlled by `open`. Most code wants `useConfirm` instead. */
export function AlertDialog({
  open,
  title,
  description,
  confirm_label,
  cancel_label = "Cancel",
  is_destructive = false,
  on_confirm,
  on_cancel,
}: AlertDialogProps) {
  const title_id = useId();
  const description_id = useId();
  const is_hydrated = useHydrated();
  const dialog_ref = useRef<HTMLDialogElement>(null);
  const cancel_ref = useRef<HTMLButtonElement>(null);
  const confirm_ref = useRef<HTMLButtonElement>(null);
  // Read by the close handler, which can fire after `open` turned false.
  const open_ref = useRef(open);

  useLayoutEffect(() => {
    open_ref.current = open;
    const dialog = dialog_ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      (is_destructive ? cancel_ref : confirm_ref).current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, is_hydrated, is_destructive]);

  // Portals need the document, so nothing renders on the server.
  if (!is_hydrated) return null;

  return createPortal(
    <dialog
      ref={dialog_ref}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={title_id}
      aria-describedby={description ? description_id : undefined}
      onCancel={(event) => {
        // Escape. The state change closes it, so it isn't closed twice.
        event.preventDefault();
        event.stopPropagation();
        on_cancel();
      }}
      onClose={(event) => {
        event.stopPropagation();
        // Closed some other way while still meant to be open: that's a no.
        if (open_ref.current) on_cancel();
      }}
      className={cn(
        "fixed inset-0 z-50 m-auto h-fit w-[calc(100%-2rem)] max-w-md border p-4",
        "bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100",
        "hidden open:flex flex-col gap-4",
        "backdrop:bg-neutral-100/75 dark:backdrop:bg-neutral-900/75",
      )}
    >
      <h2 id={title_id} className="text-lg font-semibold break-words">
        {title}
      </h2>
      {description && (
        <div
          id={description_id}
          className="flex flex-col gap-2 text-sm opacity-90 break-words"
        >
          {typeof description === "string" ? <p>{description}</p> : description}
        </div>
      )}
      <div className="flex flex-wrap justify-end gap-2">
        <Button ref={cancel_ref} onClick={on_cancel}>
          {cancel_label}
        </Button>
        <Button
          ref={confirm_ref}
          variant={is_destructive ? "danger" : "default"}
          onClick={on_confirm}
        >
          {confirm_label}
        </Button>
      </div>
    </dialog>,
    document.body,
  );
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

/** Lets everything below it ask with `useConfirm`. Renders one shared AlertDialog. */
export function AlertDialogProvider({ children }: { children: ReactNode }) {
  // The last question stays rendered while closed, so its text doesn't
  // vanish a frame before the dialog does.
  const [state, set_state] = useState<{
    open: boolean;
    options: ConfirmOptions | null;
  }>({ open: false, options: null });
  const pending = useRef<((answer: boolean) => void) | null>(null);

  const answer = useCallback((value: boolean) => {
    const resolve = pending.current;
    pending.current = null;
    set_state((current) => ({ ...current, open: false }));
    resolve?.(value);
  }, []);

  const confirm = useCallback<Confirm>((options) => {
    // A new question replaces one still waiting, which counts as cancelled.
    pending.current?.(false);
    return new Promise<boolean>((resolve) => {
      pending.current = resolve;
      set_state({ open: true, options });
    });
  }, []);

  // Leaving the admin with a question open answers it "no".
  useEffect(
    () => () => {
      pending.current?.(false);
      pending.current = null;
    },
    [],
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state.options && (
        <AlertDialog
          {...state.options}
          open={state.open}
          on_confirm={() => answer(true)}
          on_cancel={() => answer(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}

/** Returns `confirm(options)`, which resolves true if they went ahead. */
export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm must be used inside an AlertDialogProvider");
  }
  return confirm;
}
