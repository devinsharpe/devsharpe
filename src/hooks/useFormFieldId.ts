import { AnyFieldApi } from "@tanstack/react-form-start";

export function useFormFieldId(field: AnyFieldApi) {
  return `${field.form.formId}__${field.name}`;
}
