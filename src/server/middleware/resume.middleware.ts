import { createMiddleware } from "@tanstack/react-start";
import { ResumeRepository } from "../repositories/resume.repository.server";
import { db } from "../database/index.server";

export const resume_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      resumes: new ResumeRepository(db),
    },
  });
});
