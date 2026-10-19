import type { ReactNode } from "react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";

import appCss from "~/styles/styles.css?url";
import Header from "~/components/_ui/header";
import { ToastProvider } from "~/components/_ui/toast";
import Footer from "~/components/_ui/footer";
import { getSiteTitle } from "~/functions/site.functions";
import { getThemePreference } from "~/functions/preferences.functions";

export const Route = createRootRoute({
  // The site name comes from server env, so it goes through a server function.
  loader: async () => ({
    title: await getSiteTitle(),
  }),
  head: ({ loaderData }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: loaderData?.title.title ?? "Dispatch" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [
      {
        defer: true,
        "data-domain": "devsharpe.io",
        src: "https://analytics.dqc.dev/js/script.js",
      },
    ],
  }),
  // The shell renders even when a route errors or is not found.
  shellComponent: RootDocument,
  component: () => <Outlet />,
});

function RootDocument({ children }: { children: ReactNode }) {
  const {
    title: { title, subtitle },
  } = Route.useLoaderData();

  return (
    <html lang="en" className="overscroll-none">
      <head>
        <HeadContent />
      </head>
      <body className="root flex min-h-dvh flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <Header title={title} subtitle={subtitle} />
        <ToastProvider placement="top">{children}</ToastProvider>
        <Footer />
        <TanStackRouterDevtools />
        <TanStackDevtools
          config={{ hideUntilHover: true }}
          plugins={[formDevtoolsPlugin()]}
        />
        <Scripts />
      </body>
    </html>
  );
}
