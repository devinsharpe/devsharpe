// Client-safe module: validation schemas shared by the gear server functions
// (inputs) and the admin gear forms (pre-checks). Nothing here may touch
// server-only APIs.
import * as z from "zod";
import {
  identifierSchema as identifier,
  optionalText,
  optionalUrl,
  reorderIdsSchema,
  requiredText,
} from "./validation";

export const hardwareItemInputSchema = z.object({
  id: identifier,
  name: requiredText("Name is required"),
  purpose: requiredText("Purpose is required"),
  link: optionalUrl,
});
export type HardwareItemInput = z.input<typeof hardwareItemInputSchema>;

export const softwareItemInputSchema = z.object({
  id: identifier,
  name: requiredText("Name is required"),
  purpose: requiredText("Purpose is required"),
  description: optionalText(2000),
  link: optionalUrl,
});
export type SoftwareItemInput = z.input<typeof softwareItemInputSchema>;

export const cameraInputSchema = z.object({
  id: identifier,
  name: requiredText("Name is required"),
  purpose: optionalText(200),
  shortDescription: optionalText(200),
  description: optionalText(2000),
});
export type CameraInput = z.input<typeof cameraInputSchema>;

export const gearIdSchema = z.object({ id: identifier });

export const GEAR_KINDS = ["hardware", "software", "camera"] as const;
export type GearKind = (typeof GEAR_KINDS)[number];

/** The full list of ids for one gear kind, in their new display order. */
export const gearReorderSchema = z.object({
  kind: z.enum(GEAR_KINDS),
  ids: reorderIdsSchema,
});
export type GearReorderInput = z.input<typeof gearReorderSchema>;
