export interface Project {
  name: string;
  description: string;
  isActive: boolean;
  links: {
    github: string;
    site?: string;
  };
  tech: string[];
}

const projects: Project[] = [
  {
    name: "Euphoria",
    description:
      "I started to become exhausted with managing my life and obligations with multiple apps, so I decided to explore creating a task and time management application. Euphoria allows users to manage life's many projects by logging time entries, create tasks, and collaborate with other team members. I took this opportunity to spend time with technologies I thoroughly enjoy and exploring the software problems our industry tends to shy away from.",
    links: {
      github: "https://github.com/devinsharpe/euphoria",
      site: "https://euphoria.devsharpe.io",
    },
    tech: ["SolidJS", "PostgreSQL", "Drizzle ORM", "Typescript"],
    isActive: true,
  },
  {
    name: "Birb - Simple Social",
    description:
      "I undertook the development of a modern social media PWA with the aim of fostering genuine connections among individuals in a simpler and healthier manner. This platform allows users to freely share three text posts and one image per day, alleviating the burdens of projecting an artificially perfect online image. The project involved managing multiple databases, maintaining multiple apps within a monorepo, and engaging in cutting-edge experimentation at the edge, offering me the exhilarating learning experience I constantly seek.",
    links: {
      github: "https://github.com/devinsharpe/Birb-Simple-Social",
      site: "https://birb.social/",
    },
    tech: [
      "Typescript",
      "React",
      "Next",
      "AuthJS",
      "Tensorflow",
      "Vercel",
      "Edge",
    ],
    isActive: false,
  },
  {
    name: "DevSharpe.io",
    description:
      "DevSharpe.io is, well, the site you're currently viewing. This is my portfolio site meant to display my talents, help other developers, and allow me to experiment with new designs and packages.",
    links: {
      github: "https://github.com/devinsharpe/devsharpe",
      site: "/#top",
    },
    tech: ["Typescript", "React", "Next"],
    isActive: true,
  },
];

export default projects;
