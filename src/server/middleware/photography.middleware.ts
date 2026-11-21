import { createMiddleware } from "@tanstack/react-start";
import { PhotographyRepository } from "../repositories/photography.repository.server";
import { db } from "../database/index.server";

export const photography_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      photography: new PhotographyRepository(db),
    },
  });
});
