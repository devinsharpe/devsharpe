export interface ProjectLink {
  type: "github" | "app";
  link: string;
}

export interface Project {
  slug: string;
  name: string;
  description: string;
  links: ProjectLink[];
  badges: string[];
  dates: { start: string; end?: string };
  is_active: boolean;
}
