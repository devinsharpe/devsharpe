// Client-safe module: constants and validation schemas shared by the database
// schema, the position server functions (inputs), and the admin biography
// forms (pre-checks). Nothing here may touch server-only APIs. Keep imports
// relative: drizzle-kit loads this file through the database schema.
import * as z from "zod";
import { richTextDocumentSchema } from "./rich-text";
import {
  commaList,
  identifierSchema,
  lineList,
  optionalText,
  optionalUrl,
  reorderIdsSchema,
  requiredText,
} from "./validation";

export const POSITION_TYPES = ["employment", "volunteer"] as const;
export type PositionType = (typeof POSITION_TYPES)[number];

export const POSITION_TYPE_LABELS: Record<PositionType, string> = {
  employment: "Employment",
  volunteer: "Volunteer",
};

export const OFFICE_TYPES = ["remote", "hybrid", "office"] as const;
export type OfficeType = (typeof OFFICE_TYPES)[number];

export const OFFICE_TYPE_LABELS: Record<OfficeType, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  office: "In Office",
};

export const positionInputSchema = z.object({
  id: identifierSchema,
  type: z.enum(POSITION_TYPES),
  title: requiredText("Title is required"),
  name: requiredText("Organization is required"),
  link: optionalUrl,
  team: optionalText(200),
  location: optionalText(200),
  officeType: z.enum(OFFICE_TYPES),
  startDate: requiredText("Start date is required", 40),
  endDate: optionalText(40),
  description: optionalText(4000),
  highlights: lineList(20, 500),
  technologies: commaList(40, 60),
});
/** Form-side shape: highlights are newline-separated, technologies comma-separated. */
export type PositionInput = z.input<typeof positionInputSchema>;

export const positionIdSchema = z.object({ id: identifierSchema });

export const positionReorderSchema = z.object({
  type: z.enum(POSITION_TYPES),
  ids: reorderIdsSchema,
});

export const positionListSchema = z
  .object({ type: z.enum(POSITION_TYPES) })
  .optional();

// <-- Biography -->
/** How many previous biographies the admin page lists (newest first). */
export const BIOGRAPHY_HISTORY_LIMIT = 20;

/** Saving a new biography version from the editor. */
export const biographyContentSchema = z.object({
  content: richTextDocumentSchema,
});

export const biographyVersionIdSchema = z.object({ id: z.uuid() });
