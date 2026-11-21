import { createMiddleware } from "@tanstack/react-start";
import { ProjectsRepository } from "../repositories/projects.repository.server";
import { db } from "../database/index.server";

export const projects_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      projects: new ProjectsRepository(db),
    },
  });
});
