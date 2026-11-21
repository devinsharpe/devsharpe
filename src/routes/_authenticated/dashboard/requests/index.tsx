import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Divider from "~/components/_ui/divider";
import Link from "~/components/_ui/link";
import Main from "~/components/_ui/main";
import {
  ContactRequestItem,
  type ContactRequestSummary,
  useContactRequestActions,
} from "~/components/contact-request-item";
import { contactRequestsSearchSchema } from "~/lib/contact";
import { listContactRequests } from "~/server/functions/contact.functions";

export const Route = createFileRoute("/_authenticated/dashboard/requests/")({
  validateSearch: contactRequestsSearchSchema,
  // Keeps "?page=1" out of URLs.
  search: { middlewares: [stripSearchParams({ page: 1 })] },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listContactRequests({ data: deps }),
  component: RouteComponent,
});

function RouteComponent() {
  const { unread, unread_count, read, setup } = Route.useLoaderData();
  const actions = useContactRequestActions();

  const render_list = (items: ContactRequestSummary[]) => (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <ContactRequestItem
          key={item.id}
          item={item}
          is_busy={actions.busy_id === item.id}
          on_toggle_read={actions.toggle_read}
          on_delete={actions.remove}
        />
      ))}
    </ul>
  );

  return (
    <Main>
      <BreadcrumbNav current_page_label="Contact Requests">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
      </BreadcrumbNav>
      {setup.missing_turnstile.length > 0 && (
        <p className="border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/40 p-3 text-sm">
          The contact form is off: Turnstile isn't configured. Set{" "}
          {setup.missing_turnstile.map((name, index) => (
            <span key={name}>
              {index > 0 && " and "}
              <code>{name}</code>
            </span>
          ))}{" "}
          in the server environment, then restart the server.
        </p>
      )}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">
          New{unread_count > 0 && ` (${unread_count})`}
        </h2>
        {unread.length > 0 ? (
          render_list(unread)
        ) : (
          <p className="italic opacity-80">
            No new messages. Messages sent from the contact page show up here.
          </p>
        )}
        {unread_count > unread.length && (
          <p className="text-sm opacity-80">
            Showing the newest {unread.length}. Mark some as read to see the
            rest.
          </p>
        )}
      </section>
      <Divider />
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Read</h2>
        {read.items.length > 0 ? (
          render_list(read.items)
        ) : (
          <p className="italic opacity-80">Nothing marked read yet.</p>
        )}
        {read.page_count > 1 && (
          <nav
            aria-label="Pages of read messages"
            className="-mx-2 flex items-center justify-between gap-4"
          >
            {read.page > 1 ? (
              <Link
                to="/dashboard/requests"
                search={{ page: read.page - 1 }}
              >
                <ArrowLeftIcon strokeWidth={1.5} size={16} aria-hidden />
                Newer
              </Link>
            ) : (
              <span />
            )}
            <p className="text-sm opacity-80">
              Page {read.page} of {read.page_count}
            </p>
            {read.page < read.page_count ? (
              <Link
                to="/dashboard/requests"
                search={{ page: read.page + 1 }}
              >
                Older
                <ArrowRightIcon strokeWidth={1.5} size={16} aria-hidden />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>
    </Main>
  );
}
