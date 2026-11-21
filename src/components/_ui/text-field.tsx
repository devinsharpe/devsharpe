import { ComponentProps, HTMLInputTypeAttribute } from "react";
import { useFieldContext } from "~/forms/context.form";
import { InputField, useFormFieldId } from "./input-field";
import FieldInfo from "./field-info";

interface TextFieldProps extends ComponentProps<"fieldset"> {
  label: string;
  placeholder?: string;
  /** e.g. "email" or "tel", for the right keyboard on phones. */
  type?: HTMLInputTypeAttribute;
  /** Lets browsers fill it in, e.g. "name" or "email". */
  autoComplete?: string;
}

export function TextField({
  label,
  className,
  placeholder,
  type,
  autoComplete,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const field_id = useFormFieldId(field);

  return (
    <fieldset name={`fieldset__${field_id}`} {...props}>
      <label htmlFor={field_id}>{label}</label>
      <InputField
        field={field}
        placeholder={placeholder}
        type={type}
        autoComplete={autoComplete}
      />
      <FieldInfo field={field} />
    </fieldset>
  );
}
