import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { GearRepository } from "../repositories/gear.repository.server";
import { db } from "../database/index.server";
import { hardwareItemInsertSchema } from "../database/schema.server";

export const gear_middleware = createMiddleware().server(({ next }) => {
  const repo = new GearRepository(db);
  return next({
    context: {
      gear: repo,
    },
  });
});
