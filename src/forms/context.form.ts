import {
  createFormHook,
  createFormHookContexts,
} from "@tanstack/react-form-start";
import { Form } from "~/components/_ui/form";
import { TextField } from "~/components/_ui/text-field";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
  },
  formComponents: {
    Form,
  },
  fieldContext,
  formContext,
});
