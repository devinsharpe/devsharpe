import { Prettify } from "~/lib/utils";
import { ClientOnly } from "@tanstack/react-router";
import { Placement } from "@floating-ui/react";
import {
  AlertTriangleIcon,
  CheckIcon,
  LucideIcon,
  OctagonXIcon,
  XIcon,
} from "lucide-react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import { createPortal } from "react-dom";
import { v7 as uuidv7 } from "uuid";
import Button from "~/components/_ui/button";

type ToastType = "basic" | "success" | "warning" | "danger";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  ttl?: number;
}

const ToastIconMap: Record<ToastType, LucideIcon | null> = {
  basic: null,
  success: CheckIcon,
  warning: AlertTriangleIcon,
  danger: OctagonXIcon,
};

interface ToastProps {
  toast: Toast;
  onDismiss: () => void;
}

function Toast({ onDismiss, toast }: ToastProps) {
  const Icon = useMemo(() => {
    return ToastIconMap[toast.type];
  }, [toast.type]);

  return (
    <output
      role="status"
      className="block pointer-events-none border bg-neutral-950 p-2 w-full"
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="size-4 shrink-0" />}
        <span className="grow">{toast.title}</span>
        <Button
          size="icon"
          className="pointer-events-auto"
          onClick={() => onDismiss()}
        >
          <XIcon strokeWidth={1.5} size={16} />
        </Button>
      </div>
      {toast.description && (
        <p className="text-sm text-neutral-300 mt-2">{toast.description}</p>
      )}
    </output>
  );
}

interface ToastContainerProps {
  onDismiss: (id: string) => void;
  placement: Placement;
  toasts: Toast[];
}

function ToastContainer({ onDismiss, toasts }: ToastContainerProps) {
  return (
    <section className="fixed top-0 inset-x-0 z-51 mx-auto pointer-events-none max-w-sm h-8 pt-2 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          onDismiss={() => onDismiss(toast.id)}
          toast={toast}
        />
      ))}
    </section>
  );
}

type NewToastArgument = Omit<Toast, "id" | "type">;

type NewToastFn = (t: Prettify<NewToastArgument>) => void;

type ToastContextValue = Record<ToastType, NewToastFn>;

const ToastContext = createContext<ToastContextValue | null>(null);

type ToastAction =
  | {
      type: "add-toast";
      data: Toast;
    }
  | {
      type: "dismiss-toast";
      data: { id: string };
    };

function toastReducer(state: Toast[], action: ToastAction) {
  switch (action.type) {
    case "add-toast":
      return [...state, action.data];
    case "dismiss-toast":
      return state.filter((toast) => toast.id !== action.data.id);
    default:
      break;
  }
  return state;
}

interface ToastProviderProps {
  children: ReactNode;
  placement: Placement;
}

function ToastProvider({ children, placement }: ToastProviderProps) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const handleNewToast = useCallback(
    (type: ToastType, data: NewToastArgument) => {
      const toast = { id: uuidv7(), type, ...data };
      dispatch({ type: "add-toast", data: toast });
      setTimeout(() => {
        handleDismissToast(toast.id);
      }, toast.ttl ?? 10_000);
    },
    [],
  );

  const handleDismissToast = useCallback((id: string) => {
    dispatch({ type: "dismiss-toast", data: { id } });
  }, []);

  return (
    <ToastContext.Provider
      value={{
        basic: (toast: NewToastArgument) => handleNewToast("basic", toast),
        success: (toast: NewToastArgument) => handleNewToast("success", toast),
        warning: (toast: NewToastArgument) => handleNewToast("basic", toast),
        danger: (toast: NewToastArgument) => handleNewToast("danger", toast),
      }}
    >
      {children}
      <ClientOnly>
        {createPortal(
          <ToastContainer
            placement={placement}
            toasts={toasts}
            onDismiss={handleDismissToast}
          />,
          document.body,
        )}
      </ClientOnly>
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

export { ToastProvider, useToast };
