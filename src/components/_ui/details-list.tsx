import { cn } from "~/lib/utils";
import {
  type ComponentProps,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Button from "~/components/_ui/button";
import { ChevronsUpDownIcon } from "lucide-react";

const DetailsContext = createContext<{
  itemIds: string[];
  focusedItem: string | null;
  focusItem: (id: string) => void;
  deregisterItem: (id: string) => void;
  registerItem: (id: string) => void;
} | null>(null);

const useDetailsContext = () => {
  const context = useContext(DetailsContext);
  if (!context) {
    throw new Error("Details context must be used within a DetailsProvider");
  }
  return context;
};

interface DetailsProps {
  children: ReactNode;
}

function Details({ children }: DetailsProps) {
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  const [itemIds, setItemIds] = useState<string[]>([]);

  const focusItem = useCallback(
    (id: string) => {
      if (itemIds.includes(id)) {
        setFocusedItem((item) => {
          if (item === id) return null;
          return id;
        });
      }
    },
    [itemIds],
  );

  const deregisterItem = useCallback((id: string) => {
    setItemIds((items) => items.filter((item) => item !== id));
  }, []);

  const registerItem = useCallback((id: string) => {
    setItemIds((ids) => [...ids, id]);
  }, []);

  return (
    <DetailsContext.Provider
      value={{
        itemIds,
        focusedItem,
        focusItem,
        deregisterItem,
        registerItem,
      }}
    >
      <dl
        className={cn(
          "not-prose group/details border-y border-neutral-400 dark:border-neutral-600",
        )}
        data-focused-item={focusedItem ?? ""}
      >
        {children}
      </dl>
    </DetailsContext.Provider>
  );
}

const DetailsItemContext = createContext<{
  id: string;
  isOpen: boolean;
} | null>(null);

const useDetailsItemContext = () => {
  const context = useContext(DetailsItemContext);
  if (!context) {
    throw new Error(
      "Details Item context must be within a details item provider",
    );
  }
  return context;
};

interface DetailsItemProps extends ComponentProps<"div"> {
  id: string;
}

function DetailsItem({ id, className, children, ...props }: DetailsItemProps) {
  const detailsContext = useDetailsContext();

  const isOpen = useMemo(() => {
    return id === detailsContext.focusedItem;
  }, [id, detailsContext.focusedItem]);

  useEffect(() => {
    detailsContext.registerItem(id);
    return () => {
      detailsContext.deregisterItem(id);
    };
  }, [id, detailsContext.deregisterItem, detailsContext.registerItem]);

  return (
    <DetailsItemContext.Provider value={{ id, isOpen }}>
      <div
        className={cn(
          "border-x-2 border-y border-neutral-400 dark:border-neutral-600 transition-[margin] duration-200 ease-in",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </DetailsItemContext.Provider>
  );
}

function DetailsTrigger({
  children,
  className,
  ...props
}: ComponentProps<"dt">) {
  const { focusItem } = useDetailsContext();
  const { id } = useDetailsItemContext();

  return (
    <dt
      id={`${id}-trigger`}
      className={cn(
        "flex items-center justify-between p-2 font-medium",
        className,
      )}
      {...props}
    >
      {children}
      <Button size="icon" onClick={() => focusItem(id)}>
        <ChevronsUpDownIcon className="size-4" />
      </Button>
    </dt>
  );
}

function DetailsContent({
  children,
  className,
  ...props
}: ComponentProps<"dd">) {
  const { id, isOpen } = useDetailsItemContext();

  return (
    <dd
      id={`${id}-content`}
      className={cn(
        `overflow-hidden px-2 transition-[max-height,padding] delay-200 duration-200 ease-in-out`,
        {
          "max-h-0": !isOpen,
          "max-h-40 pb-4": isOpen,
        },
        className,
      )}
      {...props}
    >
      {children}
    </dd>
  );
}

export { Details, DetailsItem, DetailsTrigger, DetailsContent };
