import { createServerFn } from "@tanstack/react-start";
import { auth_fn_middleware } from "~/server/auth.server";
// import {
//   hardwareItem,
//   hardwareItemInsertSchema,
// } from "~/server/database/schema.server";
import { fetchCameras, fetchDailySoftware } from "~/server/gear.server";
// import { ensureSession } from "./auth.functions";
// import { db } from "~/server/database/index.server";
// import { auth_fn_middleware } from "~/server/auth.server";
import { gear_middleware } from "~/server/middleware/gear.middleware";

export const listCameras = createServerFn({ method: "GET" }).handler(() =>
  fetchCameras(),
);

export const listDailySoftware = createServerFn({ method: "GET" }).handler(() =>
  fetchDailySoftware(),
);

// <-- Hardware Items -->
export const listHardware = createServerFn({ method: "GET" })
  .middleware([gear_middleware])
  .handler(({ context }) => {
    ``;
    return context.gear.list("hardware-item");
  });

export const validateNewHardwareItem = createServerFn({ method: "POST" })
  .middleware([auth_fn_middleware, gear_middleware])
  .handler(({ context, data }) => {
    return context.gear.validateNewHardwareItem(data);
  });

export const createHardwareItem = createServerFn({ method: "POST" }).middleware(
  [auth_fn_middleware, gear_middleware],
).validator((data) => )

// export const createHardwareItem = createServerFn({ method: "POST" })
//   .validator(hardwareItemInsertSchema)
//   .middleware([auth_fn_middleware])
//   .handler(async ({ data }) => {
//     await ensureSession();
//     const item = await db.insert(hardwareItem).values(data).returning();
//     return item;
//   });
