import { isNotFound } from "@tanstack/react-router";
import { useToast } from "~/components/_ui/toast";

export interface RecordFormProps<T> {
  /** The record being edited; omit to create a new one. */
  item?: T;
  on_cancel: () => void;
  /** Called after a successful create, update, or delete. */
  on_saved: () => void | Promise<void>;
}

type MutationAction = "create" | "update" | "delete";

const PAST_TENSE: Record<MutationAction, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
};

/**
 * Runs a create/update/delete mutation and reports the outcome with a toast.
 * Resolves `true` on success so callers can close the dialog / refresh.
 */
export function useMutationFeedback(noun: string) {
  const toast = useToast();

  return async function run(
    action: MutationAction,
    mutation: () => Promise<{ name: string }>,
  ) {
    try {
      const result = await mutation();
      toast.success({ title: `${PAST_TENSE[action]} ${result.name}` });
      return true;
    } catch (error) {
      toast.danger({
        title: `Couldn't ${action} ${noun}`,
        description: isNotFound(error)
          ? "It no longer exists. Refresh the page and try again."
          : error instanceof Error
            ? error.message
            : undefined,
      });
      return false;
    }
  };
}
