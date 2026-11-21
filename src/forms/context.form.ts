import {
  createFormHook,
  createFormHookContexts,
} from "@tanstack/react-form-start";
import { Form } from "~/components/_ui/form";
import { FormActions } from "~/components/_ui/form-actions";
import { SelectField } from "~/components/_ui/select-field";
import { TextAreaField } from "~/components/_ui/text-area-field";
import { TextField } from "~/components/_ui/text-field";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    TextAreaField,
    SelectField,
  },
  formComponents: {
    Form,
    FormActions,
  },
  fieldContext,
  formContext,
});
