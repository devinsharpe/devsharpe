import {
  ComponentProps,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Button from "~/components/_ui/button";
import { ClientOnly, useLayoutEffect } from "@tanstack/react-router";
import { XIcon } from "lucide-react";
import { cn } from "~/lib/utils";

interface DialogContextValue {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

const useDialogContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialogContext must be used within a Dialog.Root");
  }
  return context;
};

const useDialogControls = () => {
  const dialog_el = useRef<HTMLDialogElement | null>(null);
  const [dialog_id, set_dialog_id] = useState<string | null>(null);
  const [is_dialog_open, set_is_dialog_open] = useState(false);

  useEffect(() => {
    if (dialog_id) {
      dialog_el.current = document.querySelector(`dialog#${dialog_id}`);
    } else {
      dialog_el.current = null;
    }
  }, [dialog_id]);

  const close_dialog = useCallback(() => {
    if (dialog_el.current) {
      dialog_el.current.close();
    }
  }, []);

  const open_dialog = useCallback(() => {
    if (dialog_el.current) {
      dialog_el.current.showModal();
    }
  }, []);

  const toggle_dialog = useCallback(() => {
    if (dialog_el.current) {
      if (dialog_el.current.open) dialog_el.current.close();
      else dialog_el.current.showModal();
    }
  }, []);

  return {
    is_dialog_open,
    set_is_dialog_open,
    dialog_id,
    set_dialog_id,
    close_dialog,
    open_dialog,
    toggle_dialog,
  };
};

interface DialogRootProps {
  children: ReactNode;
  idSetter?: (id: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Root({ children, idSetter, open, onOpenChange }: DialogRootProps) {
  const id = useId();
  const [localOpenState, setLocalOpenState] = useState(false);

  useEffect(() => {
    if (idSetter) idSetter(id);
  }, [id, idSetter]);

  const handleOpenChange = useCallback(
    (val: boolean) => {
      if (onOpenChange) onOpenChange(val);
      else setLocalOpenState(() => val);
    },
    [onOpenChange],
  );

  const resolvedOpenState = useMemo(() => {
    if (typeof open !== "undefined") return open;
    else return localOpenState;
  }, [open, localOpenState]);

  return (
    <DialogContext.Provider
      value={{
        id,
        open: resolvedOpenState,
        onOpenChange: handleOpenChange,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
}

interface ContentProps extends Omit<
  ComponentProps<"dialog">,
  "open" | "onClose"
> {}

function Content({ children, className, ...props }: ContentProps) {
  const context = useDialogContext();
  const content_ref = useRef<HTMLDialogElement | null>(null);

  useLayoutEffect(() => {
    if (!content_ref.current) return;
    if (context.open) {
      content_ref.current.showModal();
    } else {
      const dialog = content_ref.current;
      // requestClose (which also fires `cancel`) is new; older browsers
      // only have close().
      if (typeof dialog.requestClose === "function") dialog.requestClose();
      else dialog.close();
    }
  }, [context.open]);

  return (
    <ClientOnly>
      {createPortal(
        <dialog
          {...props}
          id={context.id}
          ref={content_ref}
          onCancel={() => context.onOpenChange(false)}
          onClose={() => context.onOpenChange(false)}
          className={cn(
            "fixed z-50 left-1/2 top-16 -translate-x-1/2 group overflow-y-auto max-h-[calc(100vh-8rem)] border p-2 container max-w-4xl",
            "bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100",
            "hidden open:flex opacity-0 open:opacity-100 transition duration-200 ease-in-out flex-col",
            "backdrop:bg-neutral-100/75 dark:backdrop:bg-neutral-900/75",
            className,
          )}
        >
          {children}
          <Button
            variant="default"
            size="icon"
            className="absolute top-2 right-2"
            aria-label="Close"
            onClick={() => context.onOpenChange(false)}
          >
            <XIcon className="size-4" aria-hidden />
          </Button>
        </dialog>,
        document.body,
        context.id,
      )}
    </ClientOnly>
  );
}

export default {
  Root,
  Content,
};
