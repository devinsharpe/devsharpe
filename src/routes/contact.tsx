import { createFileRoute } from "@tanstack/react-router";
import Main from "~/components/_ui/main";
import { ContactForm } from "~/components/forms/contact-form";
import { getContactForm } from "~/server/functions/contact.functions";

export const Route = createFileRoute("/contact")({
  staticData: { breadcrumb: "Contact" },
  component: RouteComponent,
  loader: () => getContactForm(),
});

function RouteComponent() {
  const { turnstile_site_key } = Route.useLoaderData();

  return (
    <Main>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Get in Touch</h2>
        <p>
          Have a question, an opportunity, or just want to say hi? Send me a
          message and I'll reply by email.
        </p>
        {turnstile_site_key ? (
          <ContactForm turnstile_site_key={turnstile_site_key} />
        ) : (
          <p className="italic opacity-80">
            The contact form isn't available right now. Please check back soon.
          </p>
        )}
      </section>
    </Main>
  );
}
