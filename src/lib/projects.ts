// Client-safe module: constants and validation schemas shared by the project
// server functions (inputs) and the admin project forms (pre-checks). Nothing
// here may touch server-only APIs. Keep imports relative: drizzle-kit loads
// the database schema, which may import from lib modules.
import * as z from "zod";
import { richTextDocumentSchema } from "./rich-text";
import {
  commaList,
  identifierSchema,
  optionalText,
  optionalUrl,
  reorderIdsSchema,
  requiredText,
} from "./validation";

/** Projects are listed in two groups, backed by the `is_active` column. */
export const PROJECT_STATUSES = ["active", "retired"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  retired: "Retired",
};

export const toProjectStatus = (is_active: boolean): ProjectStatus =>
  is_active ? "active" : "retired";

export const projectInputSchema = z
  .object({
    /** URL slug: /projects/{id}. */
    id: identifierSchema,
    name: requiredText("Name is required"),
    status: z.enum(PROJECT_STATUSES),
    description: optionalText(4000),
    appLink: optionalUrl,
    githubLink: optionalUrl,
    badges: commaList(20, 40),
    startDate: requiredText("Start date is required", 40),
    endDate: optionalText(40),
  })
  .transform(({ status, ...project }) => ({
    ...project,
    isActive: status === "active",
  }));
/** Form-side shape: `status` select, badges comma-separated. */
export type ProjectInput = z.input<typeof projectInputSchema>;

export const projectIdSchema = z.object({ id: identifierSchema });

export const projectSlugSchema = z.object({
  slug: z.string().min(1).max(120),
});

export const projectReorderSchema = z.object({
  status: z.enum(PROJECT_STATUSES),
  ids: reorderIdsSchema,
});

/** A short list of active projects, e.g. for the dashboard. */
export const projectListLimitSchema = z.object({
  limit: z.number().int().min(1).max(50),
});

/** Saving or publishing a project's detail page from the editor. */
export const projectPageContentSchema = z.object({
  id: identifierSchema,
  content: richTextDocumentSchema,
});
