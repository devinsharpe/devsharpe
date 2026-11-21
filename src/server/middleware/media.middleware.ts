import { createMiddleware } from "@tanstack/react-start";
import { MediaRepository } from "../repositories/media.repository.server";
import { db } from "../database/index.server";

export const media_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      media: new MediaRepository(db),
    },
  });
});
