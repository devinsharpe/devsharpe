export interface Project {
  name: string;
  description: string;
  links: {
    github: string;
    site: string;
  };
  tech: string[];
}

const projects: Project[] = [
  {
    name: "Birb - Simple Social",
    description:
      "A new age social media PWA attempting to connect people in a simplier, healthier way. Post three text posts and 1 image a day without hte pressures of making your online image 'perfect.' Managing multiple databases, maintaining multiple apps inside of a monorepo, and experimenting with the edge has been the learning thrill I'm always seeking out.",
    links: {
      github: "https://github.com/devinsharpe/Birb-Simple-Social",
      site: "https://birb.social/"
    },
    tech: [
      "Typescript",
      "React",
      "Next",
      "AuthJS",
      "Tensorflow",
      "Vercel",
      "Edge"
    ]
  },
  {
    name: "Task'd",
    description:
      "Task'd is a Next/React PWA built to help more organize my life. Here I manage my tasks, projects, and time trackers. Time tracking functionality comes from the lovely Toggl API, while the task management is done through Supabase/PostgreSQL and Next API endpoints.",
    links: {
      github: "https://github.com/devinsharpe/taskd",
      site: "https://taskd-web.vercel.app/"
    },
    tech: ["Typescript", "React", "Next", "PostgreSQL"]
  },
  {
    name: "DevSharpe.io",
    description:
      "DevSharpe.io is, well, the site you're currently viewing. This is my portfolio site meant to display my talents, help other developers, and allow me to experiment with new designs and packages.",
    links: {
      github: "https://github.com/devinsharpe/devsharpe",
      site: "/#top"
    },
    tech: ["Typescript", "React", "Next"]
  }
];

export default projects;
