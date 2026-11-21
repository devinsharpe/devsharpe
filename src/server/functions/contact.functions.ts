import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import * as z from "zod";
import {
  CONTACT_TURNSTILE_ACTION,
  contactRequestIdSchema,
  contactRequestReadSchema,
  contactRequestsSearchSchema,
  contactSubmissionSchema,
} from "~/lib/contact";
import { getServerEnv } from "~/server/env.server";
import { ensure_auth_middleware } from "~/server/middleware/auth.middleware";
import { contact_middleware } from "~/server/middleware/contact.middleware";
import {
  missingTurnstileConfig,
  verifyTurnstileToken,
} from "~/server/turnstile.server";

/** New requests listed on /dashboard/requests; past this, the count says how many more. */
const UNREAD_LIST_LIMIT = 100;

/** Public: the Turnstile site key for /contact, or null while the form is off. */
export const getContactForm = createServerFn({ method: "GET" }).handler(() => {
  const is_set_up = missingTurnstileConfig().length === 0;
  return {
    turnstile_site_key: is_set_up ? getServerEnv().turnstile.siteKey : null,
  };
});

/** Public: the contact form. Saves the message once Turnstile vouches for the sender. */
export const submitContactRequest = createServerFn({ method: "POST" })
  .middleware([contact_middleware])
  .validator(contactSubmissionSchema)
  .handler(async ({ context, data }) => {
    const { turnstileToken, ...request } = data;
    if (missingTurnstileConfig().length > 0) {
      setResponseStatus(503);
      throw new Error(
        "The contact form isn't switched on yet. Please try again later.",
      );
    }
    const check = await verifyTurnstileToken(
      turnstileToken,
      CONTACT_TURNSTILE_ACTION,
    );
    if (!check.ok && check.reason === "unavailable") {
      console.error(`Couldn't check a contact form token: ${check.detail}`);
      setResponseStatus(503);
      throw new Error(
        "Your message couldn't be sent right now. Please try again in a few minutes.",
      );
    }
    if (!check.ok) {
      setResponseStatus(400);
      throw new Error(
        "The check that you're human expired or didn't pass. It's been reset; once it's done, send your message again.",
      );
    }
    await context.contactRequests.createContactRequest(request);
    return { success: true as const };
  });

/** Admin: new requests (all of them, up to a limit) and a page of read ones. */
export const listContactRequests = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, contact_middleware])
  .validator(contactRequestsSearchSchema)
  .handler(async ({ context, data }) => {
    const [unread, unread_count, read] = await Promise.all([
      context.contactRequests.listUnread(UNREAD_LIST_LIMIT),
      context.contactRequests.countUnread(),
      context.contactRequests.listRead(data.page),
    ]);
    return {
      unread,
      unread_count,
      read,
      setup: { missing_turnstile: missingTurnstileConfig() },
    };
  });

/** Admin: the newest few new requests, for the dashboard. */
export const getContactRequestOverview = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, contact_middleware])
  .validator(z.object({ limit: z.number().int().min(1).max(20) }))
  .handler(async ({ context, data }) => {
    const [recent, unread_count] = await Promise.all([
      context.contactRequests.listUnread(data.limit),
      context.contactRequests.countUnread(),
    ]);
    return { recent, unread_count };
  });

/** Admin: marks a request read, or new again. */
export const setContactRequestRead = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, contact_middleware])
  .validator(contactRequestReadSchema)
  .handler(async ({ context, data }) => {
    const row = await context.contactRequests.setRead(data.id, data.read);
    if (!row) throw notFound();
    return { success: true as const };
  });

export const deleteContactRequest = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, contact_middleware])
  .validator(contactRequestIdSchema)
  .handler(async ({ context, data }) => {
    const row = await context.contactRequests.deleteContactRequest(data.id);
    if (!row) throw notFound();
    return { name: row.name };
  });
