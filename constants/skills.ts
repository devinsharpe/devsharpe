export interface Skill {
  image: string;
  name: string;
  link: string;
  exp: number;
  isFavorite: boolean;
}

const skills: Skill[] = [
  {
    image: "/logos/typescript.svg",
    name: "Typescript",
    link: "https://www.typescriptlang.org/",
    exp: 4,
    isFavorite: true,
  },
  {
    image: "/logos/react.svg",
    name: "React",
    link: "https://reactjs.org/",
    exp: 5,
    isFavorite: true,
  },
  {
    image: "/logos/next.svg",
    name: "Next.js",
    link: "https://nextjs.org/",
    exp: 3,
    isFavorite: true,
  },
  {
    image: "/logos/node.svg",
    name: "NodeJS",
    link: "https://nodejs.org/",
    exp: 5,
    isFavorite: false,
  },
  {
    image: "/logos/javascript.svg",
    name: "Javascript",
    link: "https://www.javascript.com/",
    exp: 7,
    isFavorite: false,
  },

  {
    image: "/logos/vue.svg",
    name: "Vue",
    link: "https://vuejs.org/",
    exp: 4,
    isFavorite: false,
  },
  {
    image: "/logos/fastify.svg",
    name: "Fastify",
    link: "https://www.fastify.io/",
    exp: 4,
    isFavorite: true,
  },

  {
    image: "/logos/electron.svg",
    name: "Electron",
    link: "https://www.electronjs.org/",
    exp: 2,
    isFavorite: true,
  },
  {
    image: "/logos/python.svg",
    name: "Python",
    link: "https://www.python.org/",
    exp: 4,
    isFavorite: false,
  },
  {
    image: "/logos/django.svg",
    name: "Django",
    link: "https://www.djangoproject.com/",
    exp: 4,
    isFavorite: false,
  },
  {
    image: "/logos/git.svg",
    name: "Git",
    link: "https://git-scm.com/",
    exp: 6,
    isFavorite: false,
  },
  {
    image: "/logos/mongo.svg",
    name: "MongoDB",
    link: "https://www.mongodb.com/",
    exp: 2,
    isFavorite: false,
  },
  {
    image: "/logos/postgresql.svg",
    name: "PostgreSQL",
    link: "https://www.postgresql.org/",
    exp: 5,
    isFavorite: false,
  },
  {
    image: "/logos/tailwind.svg",
    name: "TailwindCSS",
    link: "https://tailwindcss.com/",
    exp: 5,
    isFavorite: false,
  },
  {
    image: "/logos/html.svg",
    name: "HTML",
    link: "https://html.spec.whatwg.org/",
    exp: 7,
    isFavorite: false,
  },
  {
    image: "/logos/css.svg",
    name: "CSS",
    link: "https://www.w3.org/TR/CSS/",
    exp: 7,
    isFavorite: false,
  },
];

export default skills;
