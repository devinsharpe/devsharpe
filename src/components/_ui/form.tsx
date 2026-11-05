import { ComponentProps } from "react";

export interface FormProps extends ComponentProps<"form"> {}

function Form({ children, ...props }: FormProps) {
  return <form {...props}>{children}</form>;
}

export { Form };
