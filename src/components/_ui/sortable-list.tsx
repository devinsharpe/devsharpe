import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "~/lib/utils";

/** Spread onto the element that should act as the drag handle. */
export interface SortableHandleProps {
  onPointerDown: (e: PointerEvent<HTMLElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
  onLostPointerCapture: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
  className: string;
  "aria-label": string;
  "aria-keyshortcuts": string;
  "data-sortable-handle": string;
}

interface DragState {
  /** Index of the dragged item in the list as shown when the drag began. */
  index: number;
  /** Index the item would land at if dropped now. */
  target: number;
  start_y: number;
  dy: number;
  /** Page-relative vertical centers of every item at drag start. */
  centers: number[];
  /** How far neighbours slide to make room: dragged height + list gap. */
  shift: number;
}

interface SortableListProps<T extends { id: string }> {
  items: T[];
  /** Human-readable name, used for the handle label and announcements. */
  item_label: (item: T) => string;
  /** Persist the new order. The list shows it optimistically until this settles. */
  on_reorder: (items: T[]) => Promise<void>;
  render_item: (item: T, drag_handle: SortableHandleProps) => ReactNode;
  className?: string;
}

function move<T>(items: T[], from: number, to: number) {
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Vertical list reorderable by dragging a handle (mouse, touch, or pen) or by
 * focusing the handle and pressing ArrowUp / ArrowDown.
 */
export function SortableList<T extends { id: string }>({
  items,
  item_label,
  on_reorder,
  render_item,
  className,
}: SortableListProps<T>) {
  const elements = useRef(new Map<string, HTMLElement>());
  const [optimistic, set_optimistic] = useState<T[] | null>(null);
  const [announcement, set_announcement] = useState("");
  const latest_request = useRef(0);
  const refocus_id = useRef<string | null>(null);

  // Pointer events can outpace renders, so handlers read the ref; state drives rendering.
  const drag_ref = useRef<DragState | null>(null);
  const [drag, set_drag_state] = useState<DragState | null>(null);
  const set_drag = (next: DragState | null) => {
    drag_ref.current = next;
    set_drag_state(next);
  };

  const shown = optimistic ?? items;

  // Moving a focused node in the DOM can blur it; keep keyboard users on their handle.
  useLayoutEffect(() => {
    if (!refocus_id.current) return;
    elements.current
      .get(refocus_id.current)
      ?.querySelector<HTMLElement>("[data-sortable-handle]")
      ?.focus();
    refocus_id.current = null;
  });

  const commit = async (from: number, to: number) => {
    if (from === to) return;
    const next = move(shown, from, to);
    set_optimistic(next);
    set_announcement(
      `Moved ${item_label(shown[from])} to position ${to + 1} of ${next.length}`,
    );
    const request = ++latest_request.current;
    try {
      await on_reorder(next);
    } finally {
      // A newer reorder may still be in flight; let it own the optimistic state.
      if (request === latest_request.current) set_optimistic(null);
    }
  };

  const handle_props = (item: T, index: number): SortableHandleProps => ({
    onPointerDown: (e) => {
      if (e.button !== 0 || shown.length < 2) return;
      const rects = shown.map((it) =>
        elements.current.get(it.id)?.getBoundingClientRect(),
      );
      if (rects.some((rect) => !rect)) return;
      const measured = rects as DOMRect[];
      e.currentTarget.setPointerCapture(e.pointerId);
      const gap =
        measured.length > 1 ? measured[1].top - measured[0].bottom : 0;
      set_drag({
        index,
        target: index,
        start_y: e.pageY,
        dy: 0,
        centers: measured.map(
          (rect) => rect.top + window.scrollY + rect.height / 2,
        ),
        shift: measured[index].height + gap,
      });
    },
    onPointerMove: (e) => {
      const current = drag_ref.current;
      if (!current || current.index !== index) return;
      const { centers } = current;
      // Keep the dragged item within the bounds of the list.
      const dy = Math.min(
        Math.max(e.pageY - current.start_y, centers[0] - centers[index]),
        centers[centers.length - 1] - centers[index],
      );
      const center = centers[index] + dy;
      let target = 0;
      for (let k = 0; k < centers.length; k++) {
        if (k !== index && centers[k] < center) target++;
      }
      set_drag({ ...current, dy, target });
    },
    onPointerUp: () => {
      const current = drag_ref.current;
      if (!current || current.index !== index) return;
      set_drag(null);
      void commit(current.index, current.target);
    },
    onPointerCancel: () => set_drag(null),
    onLostPointerCapture: () => {
      if (drag_ref.current) set_drag(null);
    },
    onKeyDown: (e) => {
      if (drag_ref.current) {
        if (e.key === "Escape") set_drag(null);
        return;
      }
      const to =
        e.key === "ArrowUp" ? index - 1 : e.key === "ArrowDown" ? index + 1 : -1;
      if (to < 0 || to >= shown.length) return;
      e.preventDefault();
      refocus_id.current = item.id;
      void commit(index, to);
    },
    className: cn(
      "touch-none",
      drag?.index === index ? "cursor-grabbing" : "cursor-grab",
    ),
    "aria-label": `Reorder ${item_label(item)}`,
    "aria-keyshortcuts": "ArrowUp ArrowDown",
    "data-sortable-handle": "",
  });

  const offset_for = (k: number) => {
    if (!drag) return 0;
    if (k === drag.index) return drag.dy;
    if (drag.index < drag.target && k > drag.index && k <= drag.target) {
      return -drag.shift;
    }
    if (drag.target < drag.index && k >= drag.target && k < drag.index) {
      return drag.shift;
    }
    return 0;
  };

  return (
    <div className={cn("flex flex-col gap-4", drag && "select-none", className)}>
      {shown.map((item, k) => (
        <div
          key={item.id}
          ref={(el) => {
            if (!el) return;
            elements.current.set(item.id, el);
            return () => {
              elements.current.delete(item.id);
            };
          }}
          // Transitions only while dragging, so the drop snaps into the new DOM order.
          className={cn(
            drag && k !== drag.index && "motion-safe:transition-transform duration-150",
            drag?.index === k &&
              "relative z-10 bg-neutral-100 dark:bg-neutral-900 shadow-lg",
          )}
          style={drag ? { transform: `translateY(${offset_for(k)}px)` } : undefined}
        >
          {render_item(item, handle_props(item, k))}
        </div>
      ))}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
