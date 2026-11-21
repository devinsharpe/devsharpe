import { ComponentProps } from "react";
import { useFieldContext } from "~/forms/context.form";
import { useFormFieldId } from "~/hooks/useFormFieldId";
import FieldInfo from "./field-info";
import { Select } from "./select";

interface SelectFieldProps extends ComponentProps<"fieldset"> {
  label: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

export function SelectField({ label, options, ...props }: SelectFieldProps) {
  const field = useFieldContext<string>();
  const field_id = useFormFieldId(field);

  return (
    <fieldset name={`fieldset__${field_id}`} {...props}>
      <label htmlFor={field_id}>{label}</label>
      <Select
        id={field_id}
        value={field.state.value}
        onBlur={() => field.handleBlur()}
        onChange={(e) => field.handleChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <FieldInfo field={field} />
    </fieldset>
  );
}
