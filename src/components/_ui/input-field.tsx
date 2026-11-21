import { AnyFieldApi } from "@tanstack/react-form-start";
import { type ComponentProps } from "react";
import { useFormFieldId } from "~/hooks/useFormFieldId";
import { cn } from "~/lib/utils";

/**
 * Height for one-line controls: a line of text + py-1 + the 1px borders, i.e.
 * the height an input gets on its own. Set explicitly because native <select>s
 * ignore line-height and would otherwise render shorter than inputs.
 */
export const SINGLE_LINE_CONTROL_HEIGHT = "h-[calc(1lh+0.5rem+2px)]";

interface InputFieldProps extends ComponentProps<"input"> {
  field: AnyFieldApi;
}

function InputField({ field, className, ...props }: InputFieldProps) {
  const id = useFormFieldId(field);

  return (
    <input
      {...props}
      className={cn(
        "w-full border outline-offset-2 px-2 py-1",
        SINGLE_LINE_CONTROL_HEIGHT,
        "focus:outline-neutral-900 dark:focus:outline-white focus:outline-1",
        "disabled:opacity-60",
        className,
      )}
      id={id}
      value={field.state.value}
      onBlur={() => field.handleBlur()}
      onChange={(e) => field.handleChange(e.target.value)}
    />
  );
}

export { InputField, useFormFieldId };
