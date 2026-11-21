import { createServerFn } from "@tanstack/react-start";
import { notFound } from "@tanstack/react-router";
import { hasRichTextContent } from "~/lib/rich-text";
import { setResponseStatus } from "@tanstack/react-start/server";
import {
  projectIdSchema,
  projectInputSchema,
  projectListLimitSchema,
  projectPageContentSchema,
  projectReorderSchema,
  projectSlugSchema,
} from "~/lib/projects";
import { resolveRichTextMedia } from "~/server/media/rich-text-media.server";
import { ensure_auth_middleware } from "~/server/middleware/auth.middleware";
import { media_middleware } from "~/server/middleware/media.middleware";
import { projects_middleware } from "~/server/middleware/projects.middleware";
import { toProjectPageStatus } from "~/server/repositories/projects.repository.server";

export const listProjects = createServerFn({ method: "GET" })
  .middleware([projects_middleware])
  .handler(({ context }) => context.projects.listProjects());

/** Public /projects list: every project, flagged with whether it has a page to read. */
export const listPublicProjects = createServerFn({ method: "GET" })
  .middleware([projects_middleware])
  .handler(({ context }) => context.projects.listProjectsWithPageStatus());

export const listActiveProjects = createServerFn({ method: "GET" })
  .validator(projectListLimitSchema)
  .middleware([projects_middleware])
  .handler(({ context, data }) => context.projects.listActiveProjects(data.limit));

export const getProject = createServerFn({ method: "GET" })
  .validator(projectSlugSchema)
  .middleware([projects_middleware])
  .handler(async ({ context, data }) => {
    const project = await context.projects.getProject(data.slug);
    if (!project) throw notFound();
    return project;
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectInputSchema)
  .handler(async ({ context, data }) => {
    if (await context.projects.getProject(data.id)) {
      setResponseStatus(409);
      throw new Error(`A project with the slug "${data.id}" already exists`);
    }
    return await context.projects.createProject(data);
  });

export const updateProject = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectInputSchema)
  .handler(async ({ context, data }) => {
    const project = await context.projects.updateProject(data);
    if (!project) throw notFound();
    return project;
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectIdSchema)
  .handler(async ({ context, data }) => {
    const project = await context.projects.deleteProject(data.id);
    if (!project) throw notFound();
    return project;
  });

export const reorderProjects = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectReorderSchema)
  .handler(async ({ context, data }) => {
    await context.projects.reorderProjects(data.status === "active", data.ids);
    return { success: true };
  });

/** Public detail page: the project plus its published write-up (and its images), if any. */
export const getPublishedProjectPage = createServerFn({ method: "GET" })
  .validator(projectSlugSchema)
  .middleware([projects_middleware, media_middleware])
  .handler(async ({ context, data }) => {
    const [project, page] = await Promise.all([
      context.projects.getProject(data.slug),
      context.projects.getProjectPage(data.slug),
    ]);
    if (!project) throw notFound();
    const content = page?.publishedContent ?? null;
    return {
      project,
      content,
      media: await resolveRichTextMedia(context.media, [content]),
      publishedAt: page?.publishedAt ?? null,
    };
  });

/** Admin editor: the project, its saved draft, and publish status. */
export const getProjectPageEditor = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectIdSchema)
  .handler(async ({ context, data }) => {
    const [project, page] = await Promise.all([
      context.projects.getProject(data.id),
      context.projects.getProjectPage(data.id),
    ]);
    if (!project) throw notFound();
    return {
      project,
      content: page?.draftContent ?? null,
      status: toProjectPageStatus(page),
    };
  });

export const saveProjectPageDraft = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectPageContentSchema)
  .handler(async ({ context, data }) => {
    if (!(await context.projects.getProject(data.id))) throw notFound();
    const page = await context.projects.saveProjectPageDraft(
      data.id,
      data.content,
    );
    return toProjectPageStatus(page);
  });

export const publishProjectPage = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectPageContentSchema)
  .handler(async ({ context, data }) => {
    if (!hasRichTextContent(data.content)) {
      setResponseStatus(400);
      throw new Error("Write something before publishing.");
    }
    if (!(await context.projects.getProject(data.id))) throw notFound();
    const page = await context.projects.publishProjectPage(
      data.id,
      data.content,
    );
    return toProjectPageStatus(page);
  });

export const unpublishProjectPage = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectIdSchema)
  .handler(async ({ context, data }) => {
    const page = await context.projects.unpublishProjectPage(data.id);
    if (!page) throw notFound();
    return toProjectPageStatus(page);
  });
