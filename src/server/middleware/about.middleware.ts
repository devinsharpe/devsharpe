import { createMiddleware } from "@tanstack/react-start";
import { AboutRepository } from "../repositories/about.repository.server";
import { db } from "../database/index.server";

export const about_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      about: new AboutRepository(db),
    },
  });
});
