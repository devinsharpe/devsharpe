import { revalidateLogic } from "@tanstack/react-form-start";
import { useServerFn } from "@tanstack/react-start";
import { CheckIcon, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "~/components/_ui/button";
import { Form } from "~/components/_ui/form";
import { Turnstile, type TurnstileHandle } from "~/components/turnstile";
import { useAppForm } from "~/forms/context.form";
import {
  CONTACT_TURNSTILE_ACTION,
  contactRequestInputSchema,
  type ContactRequestInput,
} from "~/lib/contact";
import { submitContactRequest } from "~/server/functions/contact.functions";

const EMPTY: ContactRequestInput = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

/** Shown in place of the form once a message is sent. */
function SentNotice({
  name,
  email,
  on_send_another,
}: {
  name: string;
  email: string;
  on_send_another: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Moves keyboard and screen reader focus from the vanished button to here.
  useEffect(() => ref.current?.focus(), []);

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      className="border border-neutral-300 dark:border-neutral-700 p-4 flex flex-col gap-2 outline-none"
    >
      <p className="flex items-center gap-2 font-semibold">
        <CheckIcon strokeWidth={1.5} size={16} aria-hidden />
        Message sent
      </p>
      <p>
        Thanks, {name}. I'll get back to you at{" "}
        <span className="font-medium break-all">{email}</span>.
      </p>
      <Button onClick={on_send_another}>Send another message</Button>
    </div>
  );
}

/** The public contact form, behind a Turnstile check. */
export function ContactForm({ turnstile_site_key }: { turnstile_site_key: string }) {
  const submit = useServerFn(submitContactRequest);
  const turnstile_ref = useRef<TurnstileHandle>(null);
  const [token, set_token] = useState<string | null>(null);
  const [error, set_error] = useState<string | null>(null);
  const [sent, set_sent] = useState<{ name: string; email: string } | null>(
    null,
  );

  const form = useAppForm({
    defaultValues: EMPTY,
    // Quiet until the first send, then re-checks as they fix things.
    validationLogic: revalidateLogic(),
    validators: { onDynamic: contactRequestInputSchema },
    onSubmit: async ({ value, formApi }) => {
      if (!token) {
        set_error("Wait for the check that you're human to finish, then send.");
        return;
      }
      set_error(null);
      try {
        await submit({ data: { ...value, turnstileToken: token } });
      } catch (reason) {
        set_error(
          reason instanceof Error && reason.message
            ? reason.message
            : "Your message couldn't be sent. Please try again.",
        );
        return;
      } finally {
        // A token passes once, sent or not, so ask for a new one.
        turnstile_ref.current?.reset();
      }
      set_sent({ name: value.name.trim(), email: value.email.trim() });
      formApi.reset(EMPTY);
    },
  });

  if (sent) {
    return (
      <SentNotice
        name={sent.name}
        email={sent.email}
        on_send_another={() => set_sent(null)}
      />
    );
  }

  return (
    <form.AppForm>
      <Form
        className="flex flex-col gap-4"
        // The messages below replace the browser's own.
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextField label="Name" autoComplete="name" />
            )}
          />
          <form.AppField
            name="email"
            children={(field) => (
              <field.TextField
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            )}
          />
          <form.AppField
            name="phone"
            children={(field) => (
              <field.TextField
                label="Phone (optional)"
                type="tel"
                autoComplete="tel"
              />
            )}
          />
        </div>
        <form.AppField
          name="message"
          children={(field) => <field.TextAreaField label="Message" rows={8} />}
        />
        <Turnstile
          ref={turnstile_ref}
          site_key={turnstile_site_key}
          action={CONTACT_TURNSTILE_ACTION}
          on_token={set_token}
        />
        {error && (
          <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        )}
        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={(is_submitting) => (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button
                type="submit"
                loading={is_submitting}
                disabled={!token}
              >
                <SendIcon strokeWidth={1.5} size={16} />
                <span>Send Message</span>
              </Button>
              {!token && !is_submitting && (
                <p className="text-sm opacity-80" aria-live="polite">
                  You can send once the check above says you're human.
                </p>
              )}
            </div>
          )}
        />
      </Form>
    </form.AppForm>
  );
}
