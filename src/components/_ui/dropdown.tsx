import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
  type RefObject,
} from "react";
import {
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useListItem,
  useListNavigation,
  FloatingFocusManager,
  FloatingList,
  type FloatingContext,
  type ReferenceType,
  useClick,
} from "@floating-ui/react";
import type { ButtonProps } from "~/components/_ui/button";
import Button from "~/components/_ui/button";
import { cn } from "~/lib/utils";
import Link, { type LinkProps } from "~/components/_ui/link";

type ContentDirection = "horizontal" | "vertical";

interface DropdownContextValue {
  open: boolean;
  onOpenChange: (open?: boolean) => void;
  direction: ContentDirection;
  activeIndex: number | null;
  floatingContext: FloatingContext;
  triggerRefSetter: (node: ReferenceType | null) => void;
  getTriggerProps: (
    userProps?: React.HTMLProps<Element>,
  ) => Record<string, unknown>;
  contentRefSetter: (node: HTMLElement | null) => void;
  getContentProps: (
    userProps?: React.HTMLProps<HTMLElement>,
  ) => Record<string, unknown>;
  items: RefObject<(HTMLElement | null)[]>;
  getItemProps: (
    userProps?: Omit<React.HTMLProps<HTMLElement>, "selected" | "active">,
  ) => Record<string, unknown>;
  floatingStyles: CSSProperties;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdownContext must be used within a Dropdown.Root");
  }
  return context;
};

interface DropdownRootProps {
  children: ReactNode;
  direction?: ContentDirection;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Root({
  children,
  direction = "vertical",
  open,
  onOpenChange,
}: DropdownRootProps) {
  // <-- Open Values -->
  const [localOpen, setLocalOpen] = useState(false);

  const openValue = useMemo(() => {
    if (typeof open === "undefined") return localOpen;
    return open;
  }, [localOpen, open]);

  const handleOpenChange = useCallback(
    (val?: boolean) => {
      if (typeof onOpenChange === "undefined")
        return setLocalOpen(typeof val === "undefined" ? !openValue : val);
      return onOpenChange(typeof val === "undefined" ? !openValue : val);
    },
    [openValue, onOpenChange],
  );

  // <-- Items -->

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const elementsRef = useRef<(HTMLElement | null)[]>([]);

  // <-- Floating UI Config -->

  const {
    refs,
    floatingStyles,
    context: floatingContext,
  } = useFloating({
    open: openValue,
    onOpenChange: handleOpenChange,
    placement: "bottom-start",
    middleware: [offset(8), shift()],
  });

  const clickInteraction = useClick(floatingContext);
  const listNavigationInteraction = useListNavigation(floatingContext, {
    activeIndex,
    onNavigate: setActiveIndex,
    listRef: elementsRef,
    loop: true,
    focusItemOnOpen: true,
    orientation: direction,
  });
  const dismissInteraction = useDismiss(floatingContext);
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [clickInteraction, dismissInteraction, listNavigationInteraction],
  );

  return (
    <DropdownContext.Provider
      value={{
        open: openValue,
        onOpenChange: handleOpenChange,
        direction,
        activeIndex,
        floatingContext,
        triggerRefSetter: refs.setReference,
        getTriggerProps: getReferenceProps,
        contentRefSetter: refs.setFloating,
        getContentProps: getFloatingProps,
        items: elementsRef,
        getItemProps,
        floatingStyles,
      }}
    >
      {children}
    </DropdownContext.Provider>
  );
}

function Trigger({ children, ...props }: ButtonProps) {
  const context = useDropdownContext();
  return (
    <Button
      {...props}
      ref={context.triggerRefSetter}
      {...context.getTriggerProps()}
    >
      {children}
    </Button>
  );
}

interface ContentProps extends ComponentProps<"div"> {}

function Content({ children, className, ...props }: ContentProps) {
  const context = useDropdownContext();
  const id = useId();
  if (context.open)
    return (
      <FloatingFocusManager context={context.floatingContext} modal={false}>
        <div
          {...props}
          id={id}
          className={cn(
            "flex max-w-[clamp(0rem,calc(100dvw-(--spacing(8))),var(--container-lg))] flex-wrap gap-2 border bg-neutral-100 dark:bg-neutral-900 p-2 focus:outline-none md:gap-1",
            {
              "flex-row items-stretch": context.direction === "horizontal",
              "flex-col items-start": context.direction === "vertical",
            },
            className,
          )}
          ref={context.contentRefSetter}
          style={context.floatingStyles}
          {...context.getContentProps()}
        >
          <FloatingList elementsRef={context.items}>{children}</FloatingList>
        </div>
      </FloatingFocusManager>
    );
  return <></>;
}

type ItemButtonProps = { as: "button" } & ButtonProps;
type ItemLinkProps = { as: "link" } & LinkProps;
type ItemProps = ItemButtonProps | ItemLinkProps;

function Item({ as, children, className, ...props }: ItemProps) {
  const context = useDropdownContext();
  const { ref, index } = useListItem();

  const isActive = useMemo(() => {
    return context.activeIndex === index;
  }, [context.activeIndex, index]);

  const Comp = useMemo(() => {
    switch (as) {
      case "button":
        return Button;
      case "link":
        return Link;
      default:
        return null;
    }
  }, [as]);

  const handleClick = useCallback(
    (e: MouseEvent) => {
      context.onOpenChange();
      if (props.onClick && as === "button") {
        (props.onClick as MouseEventHandler<HTMLButtonElement>)(
          e as MouseEvent<HTMLButtonElement>,
        );
      } else if (props.onClick && as === "link") {
        (props.onClick as MouseEventHandler<HTMLAnchorElement>)(
          e as MouseEvent<HTMLAnchorElement>,
        );
      }
      if (context.getItemProps().onClick) {
        (context.getItemProps().onClick as MouseEventHandler)(e);
      }
    },
    [as, context.onOpenChange, props.onClick, context.getItemProps],
  );

  if (Comp === null) {
    return <></>;
  }

  return (
    <Comp
      {...(props as Record<string, unknown>)}
      className={cn(
        {
          "w-full": context.direction === "vertical",
        },
        className,
      )}
      ref={ref}
      aria-selected={isActive}
      {...context.getItemProps()}
      onClick={handleClick}
    >
      {children as ReactNode}
    </Comp>
  );
}

export default {
  Root,
  Trigger,
  Content,
  Item,
};
