import { createMiddleware } from "@tanstack/react-start";
import { SiteRepository } from "../repositories/site.repository.server";
import { db } from "../database/index.server";

export const site_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      site: new SiteRepository(db),
    },
  });
});
