import { Dialog, Menu, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import {
  UilChannel,
  UilEnvelope,
  UilFileDownload,
  UilFileInfoAlt,
  UilGithub,
  UilHeart,
  UilLink,
  UilLinkedin,
  UilMessage,
  UilTimes,
  UilTwitter,
} from "@iconscout/react-unicons";

import { ChevronDownIcon } from "@heroicons/react/outline";
import Head from "next/head";
import Image from "next/image";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const nameInputRef = useRef(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [projects, setProjects] = useState<
    {
      name: string;
      description: string;
      links: { github?: string; site?: string };
      tech: string[];
    }[]
  >([
    {
      name: "Task'd",
      description:
        "Task'd is a Next/React PWA built to help more organize my life. Here I manage my tasks, projects, and time trackers. Time tracking functionality comes from the lovely Toggl API, while the task management is done through Supabase/PostgreSQL and Next API endpoints.",
      links: {
        github: "https://github.com/devinsharpe/taskd",
        site: "https://taskd-web.vercel.app/",
      },
      tech: ["Typescript", "React", "Next", "PostgreSQL"],
    },
    {
      name: "PriorityRewards",
      description:
        "PriorityRewards is a suite of applications to create one cohesive product - a customer engagement platform for FuturePOS clients. Customers can sign up for exclusive rewards and promotions, while clients are able to drive foot traffic to their restaurants via deals and marketing messages.",
      links: {
        github: "https://github.com/devinsharpe/priority-rewards",
      },
      tech: ["Typescript", "React", "Next", "Fastify", "Electron", "MongoDB"],
    },
    {
      name: "DevSharpe.io",
      description:
        "DevSharpe.io is, well, the site you're currently viewing. This is my portfolio site meant to display my talents, help other developers, and allow me to experiment with new designs and packages.",
      links: {
        github: "https://github.com/devinsharpe/devsharpe",
        site: "#top",
      },
      tech: ["Typescript", "React", "Next"],
    },
  ]);
  const [skills, setSkills] = useState<
    {
      image: string;
      name: string;
      link: string;
      exp: number;
      isFavorite: boolean;
    }[]
  >([
    {
      image: "/logos/typescript.svg",
      name: "Typescript",
      link: "https://www.typescriptlang.org/",
      exp: 2,
      isFavorite: true,
    },
    {
      image: "/logos/javascript.svg",
      name: "Javascript",
      link: "https://www.javascript.com/",
      exp: 5,
      isFavorite: false,
    },
    {
      image: "/logos/react.svg",
      name: "React",
      link: "https://reactjs.org/",
      exp: 3,
      isFavorite: true,
    },
    {
      image: "/logos/next.svg",
      name: "Next.js",
      link: "https://nextjs.org/",
      exp: 2,
      isFavorite: true,
    },
    {
      image: "/logos/vue.svg",
      name: "Vue",
      link: "https://vuejs.org/",
      exp: 3,
      isFavorite: false,
    },
    {
      image: "/logos/fastify.svg",
      name: "Fastify",
      link: "https://www.fastify.io/",
      exp: 2,
      isFavorite: true,
    },
    {
      image: "/logos/node.svg",
      name: "NodeJS",
      link: "https://nodejs.org/",
      exp: 3,
      isFavorite: false,
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
      exp: 3,
      isFavorite: false,
    },
    {
      image: "/logos/mongo.svg",
      name: "MongoDB",
      link: "https://www.mongodb.com/",
      exp: 1,
      isFavorite: false,
    },
    {
      image: "/logos/postgresql.svg",
      name: "PostgreSQL",
      link: "https://www.postgresql.org/",
      exp: 3,
      isFavorite: false,
    },
    {
      image: "/logos/tailwind.svg",
      name: "TailwindCSS",
      link: "https://tailwindcss.com/",
      exp: 3,
      isFavorite: false,
    },
    {
      image: "/logos/html.svg",
      name: "HTML",
      link: "https://html.spec.whatwg.org/",
      exp: 5,
      isFavorite: false,
    },
    {
      image: "/logos/css.svg",
      name: "CSS",
      link: "https://www.w3.org/TR/CSS/",
      exp: 5,
      isFavorite: false,
    },
  ]);

  return (
    <>
      <Head>
        <title>DevSharpe 👋</title>
        <meta
          name="description"
          content="Devin Sharpe's portfolio site - A place of fun, excitement, and weird design decisions."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-4 mx-4 mt-4 bg-white rounded-lg shadow-lg text-zinc-800">
        <h1 className="text-xl font-bold">DevSharpe</h1>
        <div className="flex items-stretch">
          <button
            type="button"
            className="flex items-center justify-center h-10 px-4 text-white rounded-l-lg bg-zinc-800 hover:bg-black whitespace-nowrap"
            onClick={() => setIsContactOpen(true)}
          >
            Contact Me
          </button>

          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="flex items-center justify-center h-10 leading-none text-white border-l border-white rounded-r-lg bg-zinc-800 aspect-square hover:bg-black">
                <ChevronDownIcon className="w-6 h-6 text-white" />
              </Menu.Button>
            </div>

            <Menu.Items
              as="div"
              className="absolute right-0 text-white rounded-lg top-12 bg-zinc-800"
            >
              <Menu.Item
                as="a"
                href="https://twitter.com/messages/compose?recipient_id=2312246869"
                target="_blank"
                rel="noreferrer"
                className="flex items-center px-4 py-2 space-x-2 border-b whitespace-nowrap hover:text-cyan-400"
              >
                <UilTwitter />
                <p>Twitter</p>
              </Menu.Item>
              <Menu.Item
                as="a"
                href="https://www.linkedin.com/in/devin-sharpe-8912b0191/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center px-4 py-2 space-x-2 border-b whitespace-nowrap hover:text-blue-400"
              >
                <UilLinkedin />
                <p>LinkedIn</p>
              </Menu.Item>
              <Menu.Item
                as="a"
                href="mailto:devin@devsharpe.io"
                target="_blank"
                rel="noreferrer"
                className="flex items-center px-4 py-2 space-x-2 whitespace-nowrap hover:text-emerald-400"
              >
                <UilEnvelope />
                <p>Email</p>
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </nav>

      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto text-center"
        initialFocus={nameInputRef}
        open={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      >
        <Dialog.Overlay className="fixed inset-0 bg-zinc-200/50" />

        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block w-full max-w-sm p-6 my-8 space-y-4 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl md:max-w-md rounded-xl">
          <Dialog.Title className="flex items-center space-x-2 text-2xl font-bold md:text-4xl text-zinc-800">
            <UilChannel className="w-8 h-8" />
            <span>Reach Out</span>
          </Dialog.Title>

          <button
            type="button"
            className="absolute top-0 p-2 rounded-full right-4 bg-zinc-100 focus:outline-emerald-600 hover:text-emerald-600 hover:bg-zinc-50"
            onClick={() => setIsContactOpen(false)}
          >
            <UilTimes />
          </button>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <fieldset className="space-y-2">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                className="w-full rounded bg-zinc-100 focus:border-emerald-600 focus:ring-emerald-600"
                name="name"
                id="name"
                placeholder="Jane Doe"
                ref={nameInputRef}
              />
            </fieldset>
            <fieldset className="space-y-2">
              <label htmlFor="email">Email Address</label>
              <input
                type="text"
                className="w-full rounded bg-zinc-100 focus:border-emerald-600 focus:ring-emerald-600"
                name="email"
                id="email"
                placeholder="jane_doe@email.com"
              />
            </fieldset>
            <fieldset className="space-y-2">
              <label htmlFor="message">Message</label>
              <textarea
                className="w-full h-24 rounded bg-zinc-100 focus:border-emerald-600 focus:ring-emerald-600"
                name="message"
                id="message"
                placeholder="Lorem ipsum dolor sit amet..."
              ></textarea>
            </fieldset>
          </form>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsContactOpen(false)}
              className="flex items-center justify-center px-4 py-2 space-x-2 rounded hover:bg-zinc-200"
            >
              <UilTimes />
              <span>Close</span>
            </button>
            <button
              onClick={() => setIsContactOpen(false)}
              className="flex items-center justify-center w-full p-2 space-x-2 text-white rounded bg-zinc-800 hover:bg-black"
            >
              <span>Send Message</span>
              <UilMessage />
            </button>
          </div>
        </div>
      </Dialog>
      <div id="top"></div>
      <main className="container px-8 mx-auto mt-32 space-y-16 min-h-[calc(100vh-12rem)] pb-16">
        <section className="relative flex flex-col items-start justify-center w-full h-[calc(100vh-12rem)] p-4 overflow-hidden bg-emerald-200 border-4 border-white shadow-lg md:p-8 rounded-xl">
          <div className="absolute bottom-0 z-30 flex items-center justify-center px-4 py-2 space-x-4 text-white -translate-x-1/2 bg-white shadow left-1/2 rounded-t-xl">
            <a
              href="https://www.linkedin.com/in/devin-sharpe-8912b0191/"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-200 text-zinc-600 hover:text-emerald-600"
            >
              <UilLinkedin className="w-6 h-6 md:w-8 md:h-8" />
              <span className="sr-only">LinkedIn</span>
            </a>
            <a
              href="https://github.com/devinsharpe"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-200 text-zinc-600 hover:text-emerald-600"
            >
              <UilGithub className="w-6 h-6 md:w-8 md:h-8" />
              <span className="sr-only">Github</span>
            </a>
            <a
              href="https://twitter.com/Devin_Sharpe"
              target="_blank"
              rel="noreferrer"
              className="transition-colors duration-200 text-zinc-600 hover:text-emerald-600"
            >
              <UilTwitter className="w-6 h-6 md:w-8 md:h-8" />
              <span className="sr-only">Twitter</span>
            </a>
            <a
              href="/resume - devin sharpe.pdf"
              target="_blank"
              rel="noreferrer"
              download
              className="transition-colors duration-200 text-zinc-600 hover:text-emerald-600"
            >
              <UilFileInfoAlt className="w-6 h-6 md:w-8 md:h-8" />
              <span className="sr-only">Resume Download</span>
            </a>
          </div>
          <div className="absolute inset-0 z-20 flex flex-col items-start justify-center p-6 space-y-4 md:p-12 pb-28 md:pb-28">
            <h2 className="text-3xl font-bold md:text-6xl font-display lg:w-1/2 text-emerald-800">
              I&apos;m Devin Sharpe, a full stack developer &amp; proud cat dad
              🐱
            </h2>
            <p className="p-4 text-xl rounded-lg md:text-2xl bg-emerald-400/25 lg:w-1/2">
              I&apos;m always looking for a new codebase to explore
              containing&nbsp;
              <a
                href="https://www.typescriptlang.org/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-emerald-800"
              >
                Typescript
              </a>
              ,&nbsp;
              <a
                href="https://reactjs.org/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-emerald-800"
              >
                React
              </a>
              , or&nbsp;
              <a
                href="https://nodejs.org/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-emerald-800"
              >
                NodeJS
              </a>
            </p>
          </div>
          <div className="shape-blob bg-emerald-400" />
          <div className="shape-blob one bg-emerald-300" />
          <div className="shape-blob two bg-emerald-300/50" />
        </section>

        <section className="items-start justify-between space-y-8 lg:space-y-0 lg:space-x-8 lg:flex">
          <section className="p-2 space-y-4 border-2 border-dashed rounded-lg lg:w-1/2 border-zinc-400 md:p-6">
            <h4 className="p-2 text-2xl font-bold md:text-4xl text-zinc-800">
              Skills
            </h4>
            <div className="grid w-full p-2 grid-cols-2 gap-4 overflow-y-scroll max-h-[36rem] lg:max-h-full md:grid-cols-3 2xl:grid-cols-4 md:overflow-y-auto">
              {skills.map((skill) => (
                <div
                  className="relative flex flex-col items-center justify-center p-2 space-y-2 transition-transform duration-150 bg-white rounded-lg md:p-4 hover:scale-105 group aspect-square"
                  key={skill.name}
                >
                  <Image
                    src={skill.image}
                    height="48"
                    width="48"
                    alt={`${skill.name} Logo`}
                  />
                  <a
                    href={skill.link}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline focus:underline"
                    tabIndex={-1}
                  >
                    {skill.name}
                  </a>
                  <div>
                    <div className="flex items-center justify-center space-x-1">
                      {[...new Array(skill.exp)].map((_, index) => (
                        <div
                          className="w-2 h-2 transition-colors duration-150 rounded-full bg-zinc-300 group-hover:bg-emerald-600"
                          key={index}
                        >
                          <p className="sr-only">
                            {skill.exp} years of experience
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-center text-zinc-600">
                      Yrs Exp
                    </p>
                  </div>

                  {skill.isFavorite && (
                    <>
                      <UilHeart className="absolute top-0 right-4 text-zinc-400 group-hover:text-rose-400" />
                      <p className="sr-only">
                        ${skill.name} is a preferred technology
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          <article className="p-2 space-y-4 prose-lg text-black rounded-lg lg:w-1/2 md:p-6">
            <h4 className="text-2xl font-bold md:text-4xl font-display text-zinc-800">
              Who Am I?
            </h4>
            <p>
              Hi! I&apos;m Devin Sharpe, a passionate full-stack web developer
              from Atlanta, GA. I&apos;m not afraid of new codebases, making
              architecture changes, or approaching interesting UX challenges. I
              have been a developer for three years and currently spend my
              working hours developing software and restuarant POS integrations
              at&nbsp;
              <a
                href="https://priority1pos.com/"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Priority1 POS.
              </a>
            </p>
            <div className="flex items-center justify-start py-2 space-x-4 overflow-x-scroll hide-scrollbar">
              <div className="h-32 rounded-lg aspect-square bg-zinc-200"></div>
              <div className="h-32 rounded-lg aspect-square bg-zinc-200"></div>
              <div className="h-32 rounded-lg aspect-square bg-zinc-200"></div>
              <div className="h-32 rounded-lg aspect-square bg-zinc-200"></div>
              <div className="h-32 rounded-lg aspect-square bg-zinc-200"></div>
              <div className="h-32 rounded-lg aspect-square bg-zinc-200"></div>
            </div>
            <p>
              I love seeing new features go from being standup ideas to valuable
              experiences for users. I currently work with Typescript, React,
              and Fastify for most of my work and personal projects. My web
              development career began with Python, Django, and Vue. I regularly
              fallback on these technologies for simple, personal projects. I
              have thoroughly explored Electron, and React Native is currently
              on my radar. Of course, new technologies fascinate me, and
              I&apos;m always ready to learn something new.
            </p>
            <h4 className="pt-4 text-xl font-bold border-t-2 border-dashed border-zinc-400 md:text-2xl text-zinc-800">
              Work Experience
            </h4>
            <div className="p-4 rounded-lg bg-emerald-200/50">
              <h5 className="text-lg">
                <span>Web Developer</span>&nbsp;
                <span className="text-emerald-600">@</span>&nbsp;
                <a
                  href="https://priority1pos.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-light underline"
                >
                  Priority1 POS
                </a>
              </h5>
              <p className="m-0 text-sm">July 2018 - present</p>
              <ul className="mt-2 space-y-0 list-custom">
                <li className="m-0">
                  Maintains and collaborates on several web applications for
                  internal and client use
                </li>
                <li>
                  Designed and developed 10+ applications using React and
                  Typescript
                </li>
                <li>
                  Collaborated on and developed 4 desktop applications using
                  Electron
                </li>
                <li>
                  Deployed various projects to AWS servers with full CI/CD
                  pipeline
                </li>
                <li>
                  Assisted with multiple internal optimizations by automating
                  various tasks using Python or TS Node
                </li>
              </ul>
            </div>
            <a
              href="/resume - devin sharpe.pdf"
              target="_blank"
              rel="noreferrer"
              download
              className="flex items-center justify-center w-full p-2 space-x-2 text-center text-white rounded-lg bg-zinc-800 hover:bg-black"
            >
              <UilFileDownload />
              <span>Download Resume</span>
            </a>
          </article>
        </section>

        <div className="items-start justify-between space-y-8 md:space-y-0 md:space-x-8 lg:flex">
          <section>
            <h4 className="relative bottom-0 p-2 text-2xl font-bold md:text-4xl font-display text-zinc-800">
              Projects
            </h4>
            <div className="grid grid-cols-1 gap-4 mt-4 lg:grid-cols-2">
              {projects.map((project) => (
                <article
                  className="relative flex flex-col justify-between p-4 pr-16 bg-white border-4 border-white rounded-lg shadow-lg text-zinc-800 md:p-6 md:pr-16"
                  key={project.name}
                >
                  <div>
                    <h5 className="text-xl font-semibold md:text-2xl">
                      {project.name}
                    </h5>
                    <p className="mt-4">{project.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-start mt-2">
                    {project.tech.map((tech) => (
                      <p
                        className="px-4 py-1 mt-2 mr-2 rounded-full bg-zinc-200/50"
                        key={tech}
                      >
                        {tech}
                      </p>
                    ))}
                  </div>
                  {project.links && (
                    <div className="absolute inset-y-0 flex flex-col justify-center right-4">
                      <div className="flex flex-col justify-center space-y-2">
                        {project.links.site && (
                          <a
                            href={project.links.site}
                            target={
                              project.links.site.charAt(0) === "#"
                                ? "_self"
                                : "_blank"
                            }
                            rel="noreferrer"
                          >
                            <UilLink />
                            <span className="sr-only">{`${project.name} site link`}</span>
                          </a>
                        )}
                        {project.links.github && (
                          <a
                            href={project.links.github}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <UilGithub />
                            <span className="sr-only">{`${project.name} repository link`}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Home;
