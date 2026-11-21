// The shapes of the seed data in ./data. Each mirrors its admin form, with
// optional fields left out instead of blank, and lists as arrays. The seeders
// run every entry through that form's own schema before writing anything.
import type { OfficeType, PositionType } from "~/lib/about";
import type { ProjectStatus } from "~/lib/projects";

/** The header subtitle and the line under the name on /links. */
export interface SiteSeed {
  subtitle: string;
  linksBio?: string;
}

export interface PositionSeed {
  /** Fixed once created (the admin form derives it from name + start). */
  id: string;
  type: PositionType;
  title: string;
  /** The organization. */
  name: string;
  link?: string;
  team?: string;
  location?: string;
  officeType: OfficeType;
  startDate: string;
  /** Left out while it's current. */
  endDate?: string;
  description?: string;
  highlights?: string[];
  technologies?: string[];
}

export interface ProjectSeed {
  /** The URL slug: /projects/{id}. Its write-up, if any, is content/projects/{id}.md. */
  id: string;
  name: string;
  status: ProjectStatus;
  description?: string;
  appLink?: string;
  githubLink?: string;
  badges?: string[];
  startDate: string;
  endDate?: string;
}

export interface HardwareSeed {
  id: string;
  name: string;
  purpose: string;
  link?: string;
}

export interface SoftwareSeed {
  id: string;
  name: string;
  purpose: string;
  description?: string;
  link?: string;
}

export interface CameraSeed {
  id: string;
  name: string;
  purpose?: string;
  /** Shown after the name, e.g. "+ Moment Camera App". */
  shortDescription?: string;
  description?: string;
}

/** A link on /links. Matched to existing links by URL. */
export interface LinkSeed {
  title: string;
  url: string;
  /** Kept in the admin list but not shown on the page. */
  hidden?: boolean;
}
