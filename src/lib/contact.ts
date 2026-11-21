// Client-safe module: the public contact form and the admin inbox, shared by
// the forms and the contact server functions. Keep imports relative: drizzle-kit
// may load lib modules through the database schema.
import * as z from "zod";
import { optionalText } from "./validation";

export const CONTACT_NAME_MAX_LENGTH = 100;
// The longest address SMTP allows.
export const CONTACT_EMAIL_MAX_LENGTH = 254;
export const CONTACT_PHONE_MAX_LENGTH = 40;
export const CONTACT_MESSAGE_MAX_LENGTH = 5000;

/** The Turnstile widget's action; the server checks tokens were made for it. */
export const CONTACT_TURNSTILE_ACTION = "contact";

/** Requests per page in the admin's "Read" list. */
export const CONTACT_REQUESTS_PAGE_SIZE = 20;

/** Digits and the usual separators, then an optional extension ("x12", "ext. 12"). */
const PHONE_PATTERN = /^\+?[\d\s().-]+(?:\s*(?:x|ext\.?)\s*\d{1,6})?$/i;
const PHONE_EXTENSION = /\s*(?:x|ext\.?)\s*/i;

const phoneSchema = optionalText(CONTACT_PHONE_MAX_LENGTH).refine(
  (value) =>
    value === null ||
    (PHONE_PATTERN.test(value) &&
      value.split(PHONE_EXTENSION)[0].replace(/\D/g, "").length >= 7),
  "Enter a phone number, e.g. +1 555 123 4567, or leave it empty",
);

/** What a visitor fills in. Also validates the form as they type. */
export const contactRequestInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(
      CONTACT_NAME_MAX_LENGTH,
      `Keep it under ${CONTACT_NAME_MAX_LENGTH} characters`,
    ),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address so I can reply")
    .max(CONTACT_EMAIL_MAX_LENGTH, "That email address is too long")
    .pipe(z.email("Enter an email address, e.g. you@example.com")),
  phone: phoneSchema,
  message: z
    .string()
    .trim()
    .min(1, "Write a message")
    .max(
      CONTACT_MESSAGE_MAX_LENGTH,
      `Keep it under ${CONTACT_MESSAGE_MAX_LENGTH.toLocaleString("en-US")} characters`,
    ),
});
export type ContactRequestInput = z.input<typeof contactRequestInputSchema>;

/** What the form sends: the fields plus the Turnstile token. */
export const contactSubmissionSchema = contactRequestInputSchema.extend({
  // Turnstile tokens are at most 2048 characters.
  turnstileToken: z
    .string()
    .min(1, "Complete the check that you're human")
    .max(2048),
});

export const contactRequestIdSchema = z.object({ id: z.uuid() });

export const contactRequestReadSchema = contactRequestIdSchema.extend({
  read: z.boolean(),
});

/** /dashboard/requests?page= (the "Read" list). A bad value falls back to 1. */
export const contactRequestsSearchSchema = z.object({
  page: z.number().int().min(1).max(10_000).default(1).catch(1),
});

/** mailto: for replying. The address passed the email check above. */
export function replyHref(email: string) {
  const address = encodeURIComponent(email).replace(/%40/g, "@");
  return `mailto:${address}?subject=${encodeURIComponent("Re: Your message")}`;
}

/** tel: with only what a dialer reads, e.g. "tel:+15551234567;ext=12". */
export function telHref(phone: string) {
  const [number, extension] = phone.split(PHONE_EXTENSION);
  const digits = number.replace(/[^\d+]/g, "");
  const ext = extension?.replace(/\D/g, "");
  return `tel:${digits}${ext ? `;ext=${ext}` : ""}`;
}
