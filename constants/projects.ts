export interface Project {
  name: string;
  description: string;
  links: {
    github: string;
    site?: string;
  };
  tech: string[];
}

const projects: Project[] = [
  {
    name: "Birb - Simple Social",
    description:
      "A new age social media PWA attempting to connect people in a simplier, healthier way. Post three text posts and 1 image a day without the pressures of making your online image 'perfect.' Managing multiple databases, maintaining multiple apps inside of a monorepo, and experimenting with the edge has been the learning thrill I'm always seeking out.",
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
    name: "T3 + DLC",
    description:
      "Taking the popular T3 stack and building out a starter template for any future projects I would like to take on. Focusing on developer experience without compromise client performance presented an interesting set of problems that excited me about the future of software development more.",
    links: {
      github: "https://github.com/devinsharpe/t3dlc"
    },
    tech: [
      "Next",
      "Playwright",
      "PostgreSQL",
      "React",
      "TRPC",
      "Turbo",
      "Typescript"
    ]
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
