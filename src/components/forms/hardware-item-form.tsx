import { useForm, useSelector } from "@tanstack/react-form-start";
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
import { TextField } from "../_ui/text-field";
import { useAppForm } from "~/forms/context.form";
import { Form } from "../_ui/form";
import { useServerFn } from "@tanstack/react-start";
import { parseNewHardwareItem } from "~/server/functions/gear.functions";

interface HardwareItemFormProps extends ComponentProps<"form"> {}

function HardwareItemForm({ className, ...props }: HardwareItemFormProps) {
  const id = useId();
  const validate_hardware_item = useServerFn(parseNewHardwareItem);

  const form = useAppForm({
    defaultValues: {
      id: "",
      name: "",
      purpose: "",
      link: "",
    } as NewHardwareItem,
  });

  const name_value = useSelector(form.store, (state) => state.values.name);

  useEffect(() => {
    form.setFieldValue("id", slugify(name_value, { lower: true }));
  }, [name_value]);

  return (
    <Form className="flex flex-col gap-2 pb-4 px-2" id={id}>
      <form.AppField
        name="id"
        children={() => (
          <TextField
            label="Identifier"
            placeholder="apple-macbook-pro"
            disabled
          />
        )}
      />
      <form.AppField
        name="name"
        children={() => (
          <TextField label="Name" placeholder="Apple MacBook Pro" />
        )}
      />
      <form.AppField
        name="purpose"
        children={() => (
          <TextField label="Purpose" placeholder="Primary Computer" />
        )}
      />
      <form.AppField
        name="link"
        children={() => (
          <TextField label="Link" placeholder="https://a.co/d/..." />
        )}
      />
    </Form>
  );
}

export { HardwareItemForm };
