import type { ProjectSeed } from "../types";

/**
 * /projects, each list (active, then retired) in display order. A project's
 * write-up lives in content/projects/{id}.md and is published with it.
 */
export const projects: ProjectSeed[] = [
  // <-- Active -->
  {
    id: "devsharpe",
    name: "devsharpe.io",
    status: "active",
    description:
      "DevSharpe.io is, well, the site you're currently viewing. It's my portfolio and my own small publishing platform: posts, projects, photography collections, the gear and software I use, my work history, and a link-in-bio page, all managed from an admin dashboard I built for it. Under the hood it runs on TanStack Start and Postgres, with a rich-text editor that keeps drafts separate from what's published, a self-hosted media library served through imgproxy, an RSS feed, and a résumé available as both a PDF and generated Markdown. It's also where I try out new designs and packages.",
    appLink: "https://devsharpe.io",
    badges: [
      "TypeScript",
      "React",
      "TanStack Start",
      "Tailwind CSS",
      "Postgres",
      "Drizzle ORM",
      "Lexical",
      "Better Auth",
      "imgproxy",
      "Docker",
    ],
    startDate: "2021",
  },
  {
    id: "dqc",
    name: "dqc.dev",
    status: "active",
    description:
      "The website for the Digital Queer Collective, a community of 2SLGBTQIA+ technologists and policy strategists I co-founded. It shares the collective's mission, values, team, and projects, publishes its posts and its AI, ethics, and positionality statements, and takes contact requests and newsletter sign-ups. Next up is an archive of the Trans Formations Project's legislative data and newsletters.",
    appLink: "https://dqc.dev",
    badges: [
      "TypeScript",
      "React",
      "TanStack Start",
      "Tailwind CSS",
      "Postgres",
      "Drizzle ORM",
      "Resend",
      "Docker",
      "Gitea Actions",
      "Dokploy",
    ],
    startDate: "2024",
  },

  // <-- Retired -->
  {
    id: "birb",
    name: "Birb - Simple Social",
    status: "retired",
    description:
      "A social PWA that limits users to three text posts and one image per day, built to test whether removing the pressure to perform an idealized self changes how people engage with a feed. Monorepo across multiple databases with edge-deployed experimentation.",
    githubLink: "https://github.com/devinsharpe/Birb-Simple-Social",
    startDate: "2023",
    endDate: "2024",
  },
];
