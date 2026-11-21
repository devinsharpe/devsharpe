import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function closeDialog(id: string) {
  const element = document.querySelector<HTMLDialogElement>(`dialog#${id}`);
  if (element) element.requestClose();
}
