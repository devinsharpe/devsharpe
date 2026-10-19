import type { LinkComponentProps } from "@tanstack/react-router";

export interface Camera {
  id: string;
  name: string;
  subtitle?: string;
  image_src?: string;
  description: string;
}

export interface Hardware {
  label: string;
  name: string;
  link?: string;
}

export interface DailySoftware {
  tool: string;
  name: string;
  link?: string;
  description: string;
  disclosure_link?: LinkComponentProps["to"];
}
