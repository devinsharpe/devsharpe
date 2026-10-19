import { useForm } from "@tanstack/react-form-start";
import {
  ChangeEventHandler,
  ComponentProps,
  useCallback,
  useEffect,
  useId,
} from "react";
import { type NewHardwareItem } from "~/server/database/schema.server";
import FieldInfo from "../_ui/field-info";
import slugify from "slugify";
import { InputField } from "../_ui/input-field";

interface HardwareItemFormProps extends ComponentProps<"form"> {}

function HardwareItemForm({ className, ...props }: HardwareItemFormProps) {
  const id = useId();

  const form = useForm({
    defaultValues: {
      id: "",
      name: "",
      purpose: "",
      link: "",
    } as NewHardwareItem,
  });

  const handleNameChange = useCallback<
    ChangeEventHandler<HTMLInputElement, HTMLInputElement>
  >(
    (e) => {
      form.setFieldValue("name", e.target.value);
      form.setFieldValue("id", slugify(e.target.value, { lower: true }));
    },
    [form],
  );

  return (
    <form className="flex flex-col gap-2 pb-4 px-2">
      <form.Field
        name="id"
        children={(field) => (
          <fieldset className="w-full">
            <label htmlFor={`${id}__${field.name}`}>Identifier</label>
            <InputField field={field} formId={id} disabled />
            <FieldInfo field={field} />
          </fieldset>
        )}
      />
      <form.Field
        name="name"
        children={(field) => (
          <fieldset className="w-full">
            <label htmlFor={`${id}__${field.name}`}>Name</label>
            <input
              className="w-full border focus:border-opacity-50 focus:outline-white focus:outline-1 outline-offset-2 px-2 py-1"
              placeholder="MacBook Pro 14-inch"
              id={`${id}__${field.name}`}
              value={field.state.value}
              onBlur={() => field.handleBlur()}
              onChange={handleNameChange}
            />
            <FieldInfo field={field} />
          </fieldset>
        )}
      />
      <form.Field
        name="purpose"
        children={(field) => (
          <fieldset className="w-full">
            <label htmlFor={`${id}__${field.name}`}>Purpose</label>
            <input
              className="w-full border focus:border-opacity-50 focus:outline-white focus:outline-1 outline-offset-2 px-2 py-1"
              placeholder="Primary Computer"
              id={`${id}__${field.name}`}
              value={field.state.value}
              onBlur={() => field.handleBlur()}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </fieldset>
        )}
      />
      <form.Field
        name="link"
        children={(field) => (
          <fieldset className="w-full">
            <label htmlFor={`${id}__${field.name}`}>Link</label>
            <input
              className="w-full border focus:border-opacity-50 focus:outline-white focus:outline-1 outline-offset-2 px-2 py-1"
              placeholder="https://a.co/d/..."
              id={`${id}__${field.name}`}
              value={field.state.value ?? ""}
              onBlur={() => field.handleBlur()}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldInfo field={field} />
          </fieldset>
        )}
      />
    </form>
  );
}

export { HardwareItemForm };
