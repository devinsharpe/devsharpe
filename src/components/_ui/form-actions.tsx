import { SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { ReactNode, useState } from "react";
import { useFormContext } from "~/forms/context.form";
import Button from "./button";

interface FormActionsProps {
  submit_label: string;
  submit_icon?: ReactNode;
  on_cancel: () => void;
  /** Rendered only when provided (i.e. when editing an existing record). */
  on_delete?: () => Promise<void>;
}

/** Dialog footer for app forms: [Delete] ··· [Cancel] [Submit]. */
export function FormActions({
  submit_label,
  submit_icon = <SaveIcon strokeWidth={1.5} size={16} />,
  on_cancel,
  on_delete,
}: FormActionsProps) {
  const form = useFormContext();
  const [is_deleting, set_is_deleting] = useState(false);

  return (
    <div className="-mx-2 px-2 pt-2 border-t flex items-center gap-2">
      {on_delete && (
        <Button
          variant="danger"
          loading={is_deleting}
          onClick={async () => {
            set_is_deleting(true);
            try {
              await on_delete();
            } finally {
              set_is_deleting(false);
            }
          }}
        >
          <Trash2Icon strokeWidth={1.5} size={16} />
          <span>Delete</span>
        </Button>
      )}
      <Button className="ml-auto" onClick={on_cancel}>
        <XIcon strokeWidth={1.5} size={16} />
        <span>Cancel</span>
      </Button>
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        children={([can_submit, is_submitting]) => (
          <Button
            type="submit"
            loading={is_submitting}
            disabled={!can_submit || is_deleting}
          >
            <span>{submit_label}</span>
            {submit_icon}
          </Button>
        )}
      />
    </div>
  );
}
