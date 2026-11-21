import { createMiddleware } from "@tanstack/react-start";
import { db } from "../database/index.server";
import { LinksRepository } from "../repositories/links.repository.server";

export const links_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      links: new LinksRepository(db),
    },
  });
});
