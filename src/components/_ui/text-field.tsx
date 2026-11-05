import { ComponentProps } from "react";
import { useFieldContext } from "~/forms/context.form";
import { InputField, useFormFieldId } from "./input-field";
import FieldInfo from "./field-info";

interface TextFieldProps extends ComponentProps<"fieldset"> {
  label: string;
  placeholder?: string;
}

export function TextField({
  label,
  className,
  placeholder,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const field_id = useFormFieldId(field);

  return (
    <fieldset name={`fieldset__${field_id}`} {...props}>
      <label htmlFor={field_id}>{label}</label>
      <InputField field={field} placeholder={placeholder} />
      <FieldInfo field={field} />
    </fieldset>
  );
}
