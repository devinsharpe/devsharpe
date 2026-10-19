import { createContext, useContext } from "react";

interface TooltipContextValue {
  item_ids: string[];
  register_item: (id: string) => void;
  deregister_item: (id: string) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip context must be used within a TooltipProvider");
  }
  return context;
}

function TooltipProvider() {}

export { TooltipProvider, useTooltipContext };
