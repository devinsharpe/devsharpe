import { createServerFn } from "@tanstack/react-start";
import { ensure_auth_middleware } from "~/server/middleware/auth.middleware";
import { fetchCameras, fetchDailySoftware } from "~/server/gear.server";
import { gear_middleware } from "~/server/middleware/gear.middleware";
import * as z from "zod";
import { setResponseStatus } from "@tanstack/react-start/server";
import { notFound } from "@tanstack/react-router";
import { paginationSchema } from "~/lib/pagination";

export const listCameras = createServerFn({ method: "GET" }).handler(() =>
  fetchCameras(),
);

export const listDailySoftware = createServerFn({ method: "GET" }).handler(() =>
  fetchDailySoftware(),
);

// <-- Hardware Items -->
// Validators & Parsers
export const parseNewHardwareItem = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(z.unknown())
  .handler(({ context, data }) => {
    const result = context.gear.validateNewHardwareItem(data);
    if (!result.success) {
      setResponseStatus(400);
      throw new Error("Bad Request");
    }
    return { success: result.success, data: result.data };
  });

// C_UD
export const createHardwareItem = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(async (data) => (await parseNewHardwareItem({ data })).data)
  .handler(async ({ context, data }) => {
    return await context.gear.createHardwareItem(data);
  });

export const listHardwareItems = createServerFn({ method: "GET" })
  .validator(paginationSchema)
  .middleware([gear_middleware])
  .handler(({ context, data }) => {
    return context.gear.listHardwareItems(data);
  });

export const updateHardwareItem = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(async (data) => (await parseNewHardwareItem({ data })).data)
  .handler(async ({ context, data }) => {
    const item = await context.gear.getHardwareItem(data.id);
    if (!item) throw notFound();
    return item;
  });

export const deleteHardwareItem = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(z.string())
  .handler(({ context, data }) => {});
