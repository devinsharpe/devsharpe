import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";
import { fetchPositions } from "~/server/about.server";

export const listPositions = createServerFn({ method: "GET" })
  .validator(z.object({ type: z.enum(["employment", "volunteer"]) }).optional())
  .handler(({ data }) => {
    return fetchPositions(data?.type);
  });
