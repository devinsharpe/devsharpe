import { createMiddleware } from "@tanstack/react-start";
import { GearRepository } from "../repositories/gear.repository.server";
import { db } from "../database/index.server";

export const gear_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      gear: new GearRepository(db),
    },
  });
});
