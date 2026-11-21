import { ComponentProps } from "react";
import { useFieldContext } from "~/forms/context.form";
import { useFormFieldId } from "~/hooks/useFormFieldId";
import { cn } from "~/lib/utils";
import FieldInfo from "./field-info";

interface TextAreaFieldProps extends ComponentProps<"fieldset"> {
  label: string;
  placeholder?: string;
  rows?: number;
}

export function TextAreaField({
  label,
  placeholder,
  rows = 4,
  ...props
}: TextAreaFieldProps) {
  const field = useFieldContext<string>();
  const field_id = useFormFieldId(field);

  return (
    <fieldset name={`fieldset__${field_id}`} {...props}>
      <label htmlFor={field_id}>{label}</label>
      <textarea
        className={cn(
          "w-full border outline-offset-2 px-2 py-1 resize-y",
          "focus:outline-neutral-900 dark:focus:outline-white focus:outline-1",
          "disabled:opacity-60",
        )}
        id={field_id}
        rows={rows}
        placeholder={placeholder}
        value={field.state.value}
        onBlur={() => field.handleBlur()}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldInfo field={field} />
    </fieldset>
  );
}
