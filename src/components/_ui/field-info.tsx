import { cn } from "~/lib/utils";
import { AnyFieldApi } from "@tanstack/react-form-start";
import { ComponentProps, useMemo } from "react";

interface FieldInfoProps extends ComponentProps<"span"> {
  field: AnyFieldApi;
}

export default function FieldInfo({ field, ...props }: FieldInfoProps) {
  const errorMessages = useMemo(() => {
    if (field.state.meta.errors.length) {
      return field.state.meta.errors.reduce((acc, curr) => {
        if (curr && typeof curr === "object" && "message" in curr) {
          acc.push(curr.message);
        } else {
          acc.push(curr);
        }
        return acc;
      }, []);
    }
    return [];
  }, [field.state.meta.errors]);

  if (field.state.meta.isTouched && !field.state.meta.isValid) {
    return (
      <span
        {...props}
        className={cn("block text-rose-300 text-sm italic", props.className)}
      >
        {errorMessages.join(", ")}
      </span>
    );
  }
  return null;
}
