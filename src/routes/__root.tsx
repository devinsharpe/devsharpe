import { lazy, type ReactNode, Suspense } from "react";
import {
  ClientOnly,
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

import appCss from "~/styles/styles.css?url";
import Header from "~/components/_ui/header";
import { ToastProvider } from "~/components/_ui/toast";
import Footer from "~/components/_ui/footer";
import { getSiteTitle } from "~/server/functions/site.functions";
import { getThemePreference } from "~/server/functions/preferences.functions";

// Dev only. `import.meta.env.DEV` is false in production builds, so this
// import (and the devtools packages) are dropped from them entirely.
const Devtools = import.meta.env.DEV
  ? lazy(() => import("~/components/_ui/devtools"))
  : null;

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
      <body className="root flex min-h-dvh flex-col bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        <Header title={title} subtitle={subtitle} />
        <ToastProvider placement="top">{children}</ToastProvider>
        <Footer />
        {Devtools && (
          // Browser only: the devtools throw if they're loaded on the server.
          <ClientOnly>
            <Suspense>
              <Devtools />
            </Suspense>
          </ClientOnly>
        )}
        <Scripts />
      </body>
    </html>
  );
}
