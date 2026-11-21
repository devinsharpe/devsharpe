import { createServerFn } from "@tanstack/react-start";
import { ensure_auth_middleware } from "~/server/middleware/auth.middleware";
import { gear_middleware } from "~/server/middleware/gear.middleware";
import { setResponseStatus } from "@tanstack/react-start/server";
import { notFound } from "@tanstack/react-router";
import { paginationSchema } from "~/lib/pagination";
import {
  cameraInputSchema,
  gearIdSchema,
  gearReorderSchema,
  hardwareItemInputSchema,
  softwareItemInputSchema,
} from "~/lib/gear";

// <-- Public /uses page: every item, in display order (the admin lists are paginated) -->
export const listCameras = createServerFn({ method: "GET" })
  .middleware([gear_middleware])
  .handler(({ context }) => context.gear.listAllCameras());

/** Software, each with its disclosure note (if any). */
export const listDailySoftware = createServerFn({ method: "GET" })
  .middleware([gear_middleware])
  .handler(({ context }) => context.gear.listPublicSoftwareItems());

export const listHardware = createServerFn({ method: "GET" })
  .middleware([gear_middleware])
  .handler(({ context }) => context.gear.listAllHardwareItems());

function conflict(label: string, id: string): never {
  setResponseStatus(409);
  throw new Error(`A ${label} with the identifier "${id}" already exists`);
}

// <-- Hardware Items -->
export const listHardwareItems = createServerFn({ method: "GET" })
  .validator(paginationSchema)
  .middleware([gear_middleware])
  .handler(({ context, data }) => {
    return context.gear.listHardwareItems(data);
  });

export const createHardwareItem = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(hardwareItemInputSchema)
  .handler(async ({ context, data }) => {
    if (await context.gear.getHardwareItem(data.id)) {
      conflict("hardware item", data.id);
    }
    return await context.gear.createHardwareItem(data);
  });

export const updateHardwareItem = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(hardwareItemInputSchema)
  .handler(async ({ context, data }) => {
    const item = await context.gear.updateHardwareItem(data);
    if (!item) throw notFound();
    return item;
  });

export const deleteHardwareItem = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(gearIdSchema)
  .handler(async ({ context, data }) => {
    const item = await context.gear.deleteHardwareItem(data.id);
    if (!item) throw notFound();
    return item;
  });

// <-- Software Items -->
export const listSoftwareItems = createServerFn({ method: "GET" })
  .validator(paginationSchema)
  .middleware([gear_middleware])
  .handler(({ context, data }) => {
    return context.gear.listSoftwareItems(data);
  });

export const createSoftwareItem = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(softwareItemInputSchema)
  .handler(async ({ context, data }) => {
    if (await context.gear.getSoftwareItem(data.id)) {
      conflict("software item", data.id);
    }
    return await context.gear.createSoftwareItem(data);
  });

export const updateSoftwareItem = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(softwareItemInputSchema)
  .handler(async ({ context, data }) => {
    const item = await context.gear.updateSoftwareItem(data);
    if (!item) throw notFound();
    return item;
  });

export const deleteSoftwareItem = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(gearIdSchema)
  .handler(async ({ context, data }) => {
    const item = await context.gear.deleteSoftwareItem(data.id);
    if (!item) throw notFound();
    return item;
  });

// <-- Cameras -->
export const listCameraItems = createServerFn({ method: "GET" })
  .validator(paginationSchema)
  .middleware([gear_middleware])
  .handler(({ context, data }) => {
    return context.gear.listCameras(data);
  });

export const createCamera = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(cameraInputSchema)
  .handler(async ({ context, data }) => {
    if (await context.gear.getCamera(data.id)) {
      conflict("camera", data.id);
    }
    return await context.gear.createCamera(data);
  });

export const updateCamera = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(cameraInputSchema)
  .handler(async ({ context, data }) => {
    const item = await context.gear.updateCamera(data);
    if (!item) throw notFound();
    return item;
  });

export const deleteCamera = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(gearIdSchema)
  .handler(async ({ context, data }) => {
    const item = await context.gear.deleteCamera(data.id);
    if (!item) throw notFound();
    return item;
  });

// <-- Ordering -->
export const reorderGear = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, gear_middleware])
  .validator(gearReorderSchema)
  .handler(async ({ context, data }) => {
    await context.gear.reorder(data.kind, data.ids);
    return { success: true };
  });
