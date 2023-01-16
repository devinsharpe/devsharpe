import {
  UilFileDownload,
  UilFileInfoAlt,
  UilGithub,
  UilHeart,
  UilLink,
  UilLinkedin,
  UilTwitter
} from "@iconscout/react-unicons";

import Image from "next/image";
import type { NextPage } from "next";

import constants from "../constants";

const Home: NextPage = () => {
  return (
    <main className="page-container">
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
            I&apos;m Devin Sharpe, a full stack developer &amp; proud cat dad 🐱
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
          <div className="grid w-full p-2 grid-cols-2 gap-4 overflow-y-scroll max-h-[24rem] md:max-h-[30rem] lg:max-h-full md:grid-cols-3 2xl:grid-cols-4 md:overflow-y-auto">
            {constants.skills.map((skill) => (
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
                  <p className="mt-2 text-xs text-center transition duration-100 opacity-0 text-zinc-600 group-hover:opacity-100">
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
            have dedicated over 4 years of my life to software development, and
            I currently spend my time learning new technologies and building new
            things at&nbsp;
            <a
              href="https://www.washingtonpost.com/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              The Washington Post.
            </a>
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {constants.bioImages.map((image) => (
              <div key={image.link}>
                <Image
                  src={image.link}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="rounded-lg aspect-square"
                />
              </div>
            ))}
          </div>
          <p>
            I love seeing new features go from being standup ideas to valuable
            experiences for users. I currently work with Typescript, React, and
            Fastify for most of my work and personal projects. My web
            development career began with Python, Django, and Vue. I regularly
            fallback on these technologies for simple, personal projects. I have
            thoroughly explored Electron, and React Native is currently on my
            radar. Of course, new technologies fascinate me, and I&apos;m always
            ready to learn something new.
          </p>
          <h4 className="pt-4 text-xl font-bold border-t-2 border-dashed border-zinc-400 md:text-2xl text-zinc-800">
            Work Experience
          </h4>
          {constants.workHistory.map((emp) => (
            <div className="p-4 rounded-lg bg-emerald-200/50" key={emp.company}>
              <h5 className="text-lg">
                <span>{emp.title}</span>&nbsp;
                <span className="text-emerald-600">@</span>&nbsp;
                <a
                  href={emp.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-light underline"
                >
                  {emp.company}
                </a>
              </h5>
              <p className="m-0 text-sm">
                {emp.start} - {emp.end}
              </p>
              <ul className="mt-2 space-y-0 list-custom">
                {emp.responsibilities.map((responsibility) => (
                  <li className="m-0" key={responsibility}>
                    {responsibility}
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
            {constants.projects.map((project) => (
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
  );
};

export default Home;
