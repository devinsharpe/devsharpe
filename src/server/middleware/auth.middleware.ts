import { createMiddleware } from "@tanstack/react-start";
import {
  getRequestHeaders,
  setResponseStatus,
} from "@tanstack/react-start/server";
import { auth } from "../auth.server";

export const auth_fn_middleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });

    return next({
      context: { ...session },
    });
  },
);

export const ensure_auth_middleware = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) {
    setResponseStatus(401);
    throw new Error("Unauthorized");
  }
  return next({
    context: { ...session },
  });
});
