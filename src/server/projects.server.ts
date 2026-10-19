import { Project } from "~/types/projects.types";

const seedProjects: Array<Project> = [
  {
    slug: "devsharpe",
    name: "devsharpe.io",
    description:
      "DevSharpe.io is, well, the site you're currently viewing. This is my portfolio site meant to display my talents, help other developers, and allow me to experiment with new designs and packages.",
    links: [
      { type: "app", link: "https://devsharpe.io" },
      {
        type: "github",
        link: "https://github.com/devinsharpe/devinsharpe",
      },
    ],
    badges: ["Typescript", "React", "Tanstack Start"],
    dates: { start: "2021" },
    is_active: true,
  },
  {
    slug: "dqc",
    name: "dqc.dev",
    description:
      "DevSharpe.io is, well, the site you're currently viewing. This is my portfolio site meant to display my talents, help other developers, and allow me to experiment with new designs and packages.",
    links: [{ type: "app", link: "https://dqc.dev" }],
    badges: [],
    dates: { start: "2024" },
    is_active: true,
  },
  {
    slug: "birb",
    name: "Birb - Simple Social",
    description:
      "A social PWA that limits users to three text posts and one image per day, built to test whether removing the pressure to perform an idealized self changes how people engage with a feed. Monorepo across multiple databases with edge-deployed experimentation.",
    links: [
      {
        type: "github",
        link: "https://github.com/devinsharpe/Birb-Simple-Social",
      },
    ],
    badges: [],
    dates: { start: "2023", end: "2024" },
    is_active: false,
  },
  {
    slug: "euphoria",
    name: "Euphoria",
    description:
      "I started to become exhausted with managing my life and obligations with multiple apps, so I decided to explore creating a task and time management application. Euphoria allows users to manage life's many projects by logging time entries, create tasks, and collaborate with other team members. I took this opportunity to spend time with technologies I thoroughly enjoy and exploring the software problems our industry tends to shy away from.",
    links: [
      {
        type: "github",
        link: "https://github.com/devinsharpe/euphoria",
      },
    ],
    badges: [],
    dates: { start: "2023", end: "2024" },
    is_active: false,
  },
];

export async function findProject(slug: string): Promise<Array<Project>> {
  return seedProjects.filter((p) => p.slug === slug);
}

export async function fetchProjects(): Promise<Array<Project>> {
  return seedProjects;
}
