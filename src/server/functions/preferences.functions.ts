import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";
import * as z from "zod";

export type ColorTheme = "light" | "dark" | "auto";

export const getThemePreference = createServerFn().handler(() => {
  return (getCookie("color-theme") ?? "auto") as ColorTheme;
});

export const setThemePreference = createServerFn()
  .validator(z.literal(["light", "dark", "auto"]))
  .handler(({ data }) => {
    setCookie("color-theme", data);
    return data as ColorTheme;
  });
