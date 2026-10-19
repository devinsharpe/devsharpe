import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import * as z from "zod";
import { fetchProjects, findProject } from "~/server/projects.server";

export const listProjects = createServerFn({ method: "GET" }).handler(() =>
  fetchProjects(),
);

export const getProject = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string() }))
  .handler(({ data }) => {
    const project = findProject(data.slug);
    if (!project) throw notFound();
    return project;
  });
