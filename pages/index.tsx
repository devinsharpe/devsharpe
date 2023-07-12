import type { GetStaticProps, NextPage } from "next";
import {
  UilAngleDown,
  UilAngleUp,
  UilFileDownload,
  UilGithub,
  UilHeart,
  UilLink
} from "@iconscout/react-unicons";
import { useMemo, useState } from "react";

import { BioImage } from "../constants/bioImages";
import Image from "next/image";
import { Project } from "../constants/projects";
import { Skill } from "../constants/skills";
import { WorkHistory } from "../constants/workHistory";
import constants from "../constants";

const ProjectListItem: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <article className="px-6 py-4 border-2 rounded-lg hover:border-emerald-600/50 dark:hover:border-emerald-400/50 bg-zinc-100 dark:bg-zinc-700 dark:border-zinc-600/50 border-zinc-300/50 group">
      <div className="flex items-center justify-between">
        <h5 className="text-xl font-semibold md:text-2xl group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
          {project.name}
        </h5>
        {project.links && (
          <div className="flex items-center space-x-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            {project.links.site && (
              <a
                href={project.links.site}
                target={
                  project.links.site.slice(0, 2) === "/#" ? "_self" : "_blank"
                }
                rel="noreferrer"
              >
                <UilLink />
                <span className="sr-only">{`${project.name} site link`}</span>
              </a>
            )}
            {project.links.github && (
              <a href={project.links.github} target="_blank" rel="noreferrer">
                <UilGithub />
                <span className="sr-only">{`${project.name} repository link`}</span>
              </a>
            )}
          </div>
        )}
      </div>
      <p className="mt-4">{project.description}</p>

      <div className="flex flex-wrap items-center justify-start mt-2">
        {project.tech.map((tech) => (
          <p
            className="px-4 py-1 mt-2 mr-2 rounded-full bg-zinc-200/50 dark:bg-zinc-600"
            key={tech}
          >
            {tech}
          </p>
        ))}
      </div>
    </article>
  );
};

const SkillListItem: React.FC<{
  skill: Skill;
}> = ({ skill }) => {
  return (
    <li className="flex items-center justify-between gap-2 px-6 py-3 border-2 rounded-lg hover:border-emerald-600/50 dark:hover:border-emerald-400/50 bg-zinc-100 dark:bg-zinc-700 dark:border-zinc-600/50 border-zinc-300/50 group">
      <div className="flex items-center space-x-2">
        <Image
          src={skill.image}
          height="32"
          width="32"
          alt={`${skill.name} Logo`}
        />
        <a
          href={skill.link}
          target="_blank"
          rel="noreferrer"
          className="text-lg hover:underline focus:underline group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
          tabIndex={-1}
        >
          {skill.name}
        </a>
        {skill.isFavorite && (
          <UilHeart className="h-5 text-zinc-500 group-hover:text-rose-600" />
        )}
      </div>

      <div className="flex items-center space-x-2">
        <p className="text-xs text-center transition duration-100 opacity-0 text-zinc-600 dark:text-zinc-300 group-hover:opacity-100">
          Yrs Exp
        </p>
        {[...new Array(skill.exp)].map((_, index) => (
          <div
            className="w-2 h-2 transition-colors duration-150 rounded-full bg-zinc-300 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400"
            key={index}
          >
            <p className="sr-only">{skill.exp} years of experience</p>
          </div>
        ))}
      </div>
    </li>
  );
};

const WorkHistoryArticle: React.FC<{ history: WorkHistory }> = ({
  history
}) => {
  return (
    <div className="px-4 py-6 border-2 rounded-lg group bg-zinc-100 dark:bg-zinc-700 border-zinc-300/50 hover:border-emerald-600/50 dark:hover:border-emerald-400/50 dark:border-zinc-600/50">
      <h5 className="text-lg">
        <span>{history.title}</span>&nbsp;
        <span className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
          &#64;
        </span>
        &nbsp;
        <a
          href={history.link}
          target="_blank"
          rel="noreferrer"
          className="font-light underline group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
        >
          {history.company}
        </a>
      </h5>
      <p className="m-0 text-sm">
        {history.start} - {history.end}
      </p>
      <ul className="mt-2 mb-0 space-y-0 list-custom">
        {history.responsibilities.map((responsibility) => (
          <li className="m-0" key={responsibility}>
            {responsibility}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Home: NextPage<{
  bioImages: BioImage[];
  projects: Project[];
  skills: Skill[];
  workHistory: WorkHistory[];
}> = ({ bioImages, projects, skills, workHistory }) => {
  const [showSkills, setShowSkills] = useState(false);
  const filteredSkills = useMemo(() => {
    if (showSkills) return skills;
    else return skills.slice(0, 5);
  }, [showSkills, skills]);

  return (
    <main className="page-container">
      <div className="max-w-4xl py-32 mx-auto">
        <h2 className="text-xl font-bold tracking-wide text-center md:text-3xl font-display text-zinc-600 dark:text-zinc-300">
          Hello!
        </h2>
        <h3 className="text-3xl font-bold text-center text-black md:text-6xl font-display dark:text-white">
          I&apos;m Devin Sharpe &mdash; full stack developer &amp; proud cat dad
          🐱
        </h3>
      </div>

      <section>
        <article className="prose-lg section-body">
          <h4 className="text-2xl font-bold md:text-4xl font-display">
            Who Am I?
          </h4>
          <p>
            Hey! Welcome to devsharpe.io. I&apos;m Devin Sharpe, a passionate
            full-stack web developer from Atlanta, GA. I&apos;m not afraid of
            new codebases, making architecture changes, or approaching
            interesting UX challenges. I have dedicated over 4 years of my life
            to software development, and I recently spent time learning new
            technologies and building new things at&nbsp;
            <a
              href="https://www.washingtonpost.com/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              The Washington Post.
            </a>
            &nbsp;I have been spending a lot of my time lately working on a
            project called&nbsp;
            <a
              href="https://www.birb.social/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Birb &mdash; Simple Social;
            </a>
            &nbsp;my greater goal is to create a social media app for me and
            friends to use as a getaway from the &apos;content machine&apos; and
            alogorithmic culture found elsewhere on the web.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {bioImages.map((image) => (
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
        </article>
      </section>

      <section>
        <article className="prose-lg section-body">
          <div className="flex items-center justify-between">
            <h4 className="m-0 text-2xl font-bold md:text-4xl font-display">
              Employment History
            </h4>
            <a
              href="/resume - devin sharpe - 20230712.pdf"
              target="_blank"
              rel="noreferrer"
              download
              aria-label="Download resume"
              className="flex items-center justify-center p-2 text-center text-white rounded-lg bg-zinc-800 hover:bg-black dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              <UilFileDownload />
            </a>
          </div>
          {workHistory.map((history) => (
            <WorkHistoryArticle history={history} key={history.company} />
          ))}
        </article>
      </section>

      <section>
        <div className="section-body">
          <div className="flex items-center justify-between">
            <h4 className="m-0 text-2xl font-bold md:text-4xl font-display">
              Skills &amp; Technology
            </h4>
            <button
              aria-label="Show More Skills"
              className="flex items-center justify-center p-2 text-center text-white rounded-lg bg-zinc-800 hover:bg-black dark:bg-zinc-700 dark:hover:bg-zinc-600"
              onClick={() => setShowSkills(!showSkills)}
            >
              {showSkills ? <UilAngleUp /> : <UilAngleDown />}
            </button>
          </div>
          <ul className="space-y-2">
            {filteredSkills.map((skill) => (
              <SkillListItem key={skill.name} skill={skill} />
            ))}
          </ul>
          {showSkills && (
            <button
              aria-label="Show More Skills"
              className="flex items-center justify-center px-6 py-2 mx-auto space-x-2 text-center text-white rounded-lg bg-zinc-800 hover:bg-black dark:bg-zinc-700 dark:hover:bg-zinc-600"
              onClick={() => setShowSkills(false)}
            >
              <span>Show Less Skills</span>
              <UilAngleUp />
            </button>
          )}
        </div>
      </section>

      <section>
        <div className="section-body">
          <h4 className="m-0 text-2xl font-bold md:text-4xl font-display">
            Projects
          </h4>
          <div className="space-y-2">
            {projects.map((project) => (
              <ProjectListItem project={project} key={project.name} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return { props: { ...constants } };
};

export default Home;
