import { AnyFieldApi } from "@tanstack/react-form-start";
import { type ComponentProps } from "react";
import { cn } from "~/lib/utils";

function useFormFieldId(formId: string, field: AnyFieldApi) {
  return `${formId}__${field.name}`;
}

interface InputFieldProps extends ComponentProps<"input"> {
  field: AnyFieldApi;
  formId: string;
}

function InputField({ field, formId, className, ...props }: InputFieldProps) {
  const id = useFormFieldId(formId, field);

  return (
    <input
      {...props}
      className={cn(
        "w-full border outline-offset-2 px-2 py-1",
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
