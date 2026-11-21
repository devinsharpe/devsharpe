import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  type Placement,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import {
  type ComponentProps,
  createContext,
  type HTMLProps,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import Button, { type ButtonProps } from "~/components/_ui/button";
import { cn } from "~/lib/utils";

/**
 * A non-modal dialog anchored to its trigger button, for small forms and
 * details (e.g. editing a link). Opens on click; Escape, clicking outside, or
 * tabbing away closes it, and focus returns to the trigger.
 *
 *   <Popover.Root>
 *     <Popover.Trigger aria-label="…">…</Popover.Trigger>
 *     <Popover.Content aria-label="…">… <Popover.Close>Cancel</Popover.Close></Popover.Content>
 *   </Popover.Root>
 *
 * Content renders in place (no portal), so it also works inside <Dialog>.
 */

interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  floating: ReturnType<typeof useFloating>;
  interactions: ReturnType<typeof useInteractions>;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within a Popover.Root");
  }
  return context;
}

interface PopoverRootProps {
  children: ReactNode;
  /** Controls the open state; leave unset to let the popover manage it. */
  open?: boolean;
  /** Called on every open/close, controlled or not. */
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
}

function Root({
  children,
  open,
  onOpenChange,
  placement = "bottom-start",
}: PopoverRootProps) {
  const [local_open, set_local_open] = useState(false);
  const is_open = open ?? local_open;

  const setOpen = useCallback(
    (next: boolean) => {
      set_local_open(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const floating = useFloating({
    open: is_open,
    onOpenChange: setOpen,
    placement,
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const interactions = useInteractions([
    useClick(floating.context),
    useDismiss(floating.context),
    useRole(floating.context, { role: "dialog" }),
  ]);

  return (
    <PopoverContext.Provider
      value={{ open: is_open, setOpen, floating, interactions }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

function Trigger({
  children,
  size,
  variant,
  loading,
  className,
  ...props
}: ButtonProps) {
  const { floating, interactions } = usePopoverContext();
  return (
    <Button
      size={size}
      variant={variant}
      loading={loading}
      className={className}
      ref={floating.refs.setReference}
      // Merges our handlers (onClick, …) with the popover's.
      {...interactions.getReferenceProps(props as HTMLProps<Element>)}
    >
      {children}
    </Button>
  );
}

interface PopoverContentProps extends ComponentProps<"div"> {
  /** What to focus on open: a ref, or a tabbable index (default: the first). */
  initialFocus?: ComponentProps<typeof FloatingFocusManager>["initialFocus"];
}

/** Give it an accessible name with `aria-label` or `aria-labelledby`. */
function Content({
  children,
  className,
  style,
  initialFocus,
  ...props
}: PopoverContentProps) {
  const { open, floating, interactions } = usePopoverContext();
  if (!open) return null;

  return (
    <FloatingFocusManager
      context={floating.context}
      modal={false}
      initialFocus={initialFocus}
    >
      <div
        ref={floating.refs.setFloating}
        style={{ ...floating.floatingStyles, ...style }}
        {...interactions.getFloatingProps(props)}
        className={cn(
          "z-20 flex w-max max-w-[calc(100vw-2rem)] flex-col gap-2 border border-neutral-300 dark:border-neutral-700 p-3 shadow-lg focus:outline-none",
          "bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100",
          className,
        )}
      >
        {children}
      </div>
    </FloatingFocusManager>
  );
}

/** A button that closes the popover (after running its own onClick). */
function Close({ children, onClick, ...props }: ButtonProps) {
  const { setOpen } = usePopoverContext();
  return (
    <Button
      {...props}
      onClick={(event) => {
        onClick?.(event);
        setOpen(false);
      }}
    >
      {children}
    </Button>
  );
}

export default {
  Root,
  Trigger,
  Content,
  Close,
};
