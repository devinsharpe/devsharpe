export interface EmploymentPosition {
  id: string;
  name: string;
  title: string;
  link: string;
  team?: string;
  location?: string;
  office_type: "remote" | "hybrid" | "office";
  description?: string;
  highlights: Array<string>;
  technologies: Array<string>;
  dates: {
    start: string;
    end?: string;
  };
  type: "employment" | "volunteer";
}
