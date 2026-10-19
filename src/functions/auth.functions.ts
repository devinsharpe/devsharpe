import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth, auth_fn_middleware } from "~/server/auth.server";

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return session;
  },
);

export const ensureSession = createServerFn({ method: "GET" })
  .middleware([auth_fn_middleware])
  .handler(async ({ context }) => {
    if (!context.session || !context.user) {
      throw new Error("Unauthorized");
    }

    return { session: context.session!, user: context.user! };
  });
