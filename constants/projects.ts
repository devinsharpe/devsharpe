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
      "I undertook the development of a modern social media PWA with the aim of fostering genuine connections among individuals in a simpler and healthier manner. This platform allows users to freely share three text posts and one image per day, alleviating the burdens of projecting an artificially perfect online image. The project involved managing multiple databases, maintaining multiple apps within a monorepo, and engaging in cutting-edge experimentation at the edge, offering me the exhilarating learning experience I constantly seek.",
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
      "I embarked on a project to leverage the popular T3 stack and construct a comprehensive starter template to streamline my future ventures. Emphasizing an exceptional developer experience while simultaneously upholding top-notch client performance posed a captivating array of challenges that ignited my enthusiasm for the future of software development.",
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
