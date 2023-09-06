import type { GetStaticProps, NextPage } from "next";
import {
  ChevronDown,
  ChevronUp,
  FileDown,
  Github,
  Heart,
  LinkIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { BioImage } from "../constants/bioImages";
import Image from "next/image";
import type { Project } from "../constants/projects";
import type { Skill } from "../constants/skills";
import type { WorkHistory } from "../constants/workHistory";
import constants from "../constants";

const ProjectListItem: React.FC<{ project: Project }> = ({ project }) => {
  return (
    <article className="group rounded-lg border-2 border-zinc-300/50 bg-zinc-100 px-6 py-4 hover:border-emerald-600/50 dark:border-zinc-600/50 dark:bg-zinc-700 dark:hover:border-emerald-400/50">
      <div className="flex items-center justify-between">
        <h5 className="text-xl font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 md:text-2xl">
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
                <LinkIcon />
                <span className="sr-only">{`${project.name} site link`}</span>
              </a>
            )}
            {project.links.github && (
              <a href={project.links.github} target="_blank" rel="noreferrer">
                <Github />
                <span className="sr-only">{`${project.name} repository link`}</span>
              </a>
            )}
          </div>
        )}
      </div>
      <p className="mt-4">{project.description}</p>

      <div className="mt-2 flex flex-wrap items-center justify-start">
        {project.tech.map((tech) => (
          <p
            className="mr-2 mt-2 rounded-full bg-zinc-200/50 px-4 py-1 dark:bg-zinc-600"
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
    <li className="group flex items-center justify-between gap-2 rounded-lg border-2 border-zinc-300/50 bg-zinc-100 px-6 py-3 hover:border-emerald-600/50 dark:border-zinc-600/50 dark:bg-zinc-700 dark:hover:border-emerald-400/50">
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
          <Heart className="h-5 text-zinc-500 group-hover:text-rose-600" />
        )}
      </div>

      <div className="flex items-center space-x-2">
        <p className="text-center text-xs text-zinc-600 opacity-0 transition duration-100 group-hover:opacity-100 dark:text-zinc-300">
          Yrs Exp
        </p>
        {[...new Array(skill.exp)].map((_, index) => (
          <div
            className="h-2 w-2 rounded-full bg-zinc-300 transition-colors duration-150 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400"
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
  history,
}) => {
  return (
    <div className="group rounded-lg border-2 border-zinc-300/50 bg-zinc-100 px-4 py-6 hover:border-emerald-600/50 dark:border-zinc-600/50 dark:bg-zinc-700 dark:hover:border-emerald-400/50">
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
      <ul className="list-custom mb-0 mt-2 space-y-0">
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
      <div className="mx-auto max-w-4xl py-32">
        <h2 className="text-center font-display text-xl font-bold tracking-wide text-zinc-600 dark:text-zinc-300 md:text-3xl">
          Hello!
        </h2>
        <h3 className="text-center font-display text-3xl font-bold text-black dark:text-white md:text-6xl">
          I&apos;m Devin Sharpe &mdash; full stack developer &amp; proud cat dad
          🐱
        </h3>
      </div>

      <section>
        <article className="section-body prose-lg">
          <h4 className="font-display text-2xl font-bold md:text-4xl">
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
            &nbsp;I have been spending a lot of my time lately working on two
            new applications,&nbsp;
            <a
              href="https://www.birb.social/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Birb &mdash; Simple Social
            </a>
            &nbsp;and&nbsp;
            <a
              href="https://ikigai.devsharpe.io/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Ikigai
            </a>
            ; my greater goal with software development is create applications
            and experiences that help users connect with something larger than
            themselves. Whether that&apos;s accomplished by connecting old
            friends, creating free time, or easing their anxiety about their
            obligations and life trajectory.
          </p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {bioImages.map((image) => (
              <div key={image.link}>
                <Image
                  src={image.link}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  className="aspect-square rounded-lg"
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
        <article className="section-body prose-lg">
          <div className="flex items-center justify-between">
            <h4 className="m-0 font-display text-2xl font-bold md:text-4xl">
              Employment History
            </h4>
            <a
              href="/resume - devin sharpe - 20230712.pdf"
              target="_blank"
              rel="noreferrer"
              download
              aria-label="Download resume"
              className="flex items-center justify-center rounded-lg bg-zinc-800 p-2 text-center text-white hover:bg-black dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              <FileDown />
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
            <h4 className="m-0 font-display text-2xl font-bold md:text-4xl">
              Skills &amp; Technology
            </h4>
            <button
              aria-label="Show More Skills"
              className="flex items-center justify-center rounded-lg bg-zinc-800 p-2 text-center text-white hover:bg-black dark:bg-zinc-700 dark:hover:bg-zinc-600"
              onClick={() => setShowSkills(!showSkills)}
            >
              {showSkills ? <ChevronUp /> : <ChevronDown />}
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
              className="mx-auto flex items-center justify-center space-x-2 rounded-lg bg-zinc-800 px-6 py-2 text-center text-white hover:bg-black dark:bg-zinc-700 dark:hover:bg-zinc-600"
              onClick={() => setShowSkills(false)}
            >
              <span>Show Less Skills</span>
              <ChevronUp />
            </button>
          )}
        </div>
      </section>

      <section>
        <div className="section-body">
          <h4 className="m-0 font-display text-2xl font-bold md:text-4xl">
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
