import { lazy, type ReactNode, Suspense } from "react";
import {
  ClientOnly,
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useMatches,
} from "@tanstack/react-router";

import appCss from "~/styles/styles.css?url";
import Header from "~/components/_ui/header";
import { ToastProvider } from "~/components/_ui/toast";
import Footer from "~/components/_ui/footer";
import { getSiteTitle } from "~/server/functions/site.functions";
import { getThemePreference } from "~/server/functions/preferences.functions";
import { POSTS_FEED_PATH, postsFeedTitle } from "~/lib/posts";
import {
  shareCardPath,
  shareImageMeta,
  withoutTrailingSlash,
} from "~/lib/share";

// Dev only. `import.meta.env.DEV` is false in production builds, so this
// import (and the devtools packages) are dropped from them entirely.
const Devtools = import.meta.env.DEV
  ? lazy(() => import("~/components/_ui/devtools"))
  : null;

export const Route = createRootRoute({
  // The first crumb on every page (see components/_ui/breadcrumbs.tsx).
  staticData: { breadcrumb: "Home" },
  // The site name comes from server env, so it goes through a server function.
  loader: async () => ({
    title: await getSiteTitle(),
  }),
  head: ({ loaderData, matches }) => {
    const site_title = loaderData?.title.title ?? "Dispatch";
    const subtitle = loaderData?.title.subtitle;
    const origin = loaderData?.title.origin;
    const path = withoutTrailingSlash(matches.at(-1)?.pathname ?? "/");
    // A page whose own crumb is fixed (e.g. /uses, "Gear") previews as that.
    // A crumb from the page's data (a post's title) can't be read here, so
    // those pages set og:title themselves.
    const crumb = matches
      .slice(1)
      .findLast((match) => match.staticData?.breadcrumb)?.staticData.breadcrumb;
    return {
      // Defaults for every page. A page's own head wins, tag by tag.
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: site_title },
        {
          property: "og:title",
          content: typeof crumb === "string" ? crumb : site_title,
        },
        ...(subtitle
          ? [
              { name: "description", content: subtitle },
              { property: "og:description", content: subtitle },
            ]
          : []),
        { property: "og:site_name", content: site_title },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        // Link previews need absolute URLs. The image is the page's
        // generated card (routes/og/$.ts) unless the page sets its own.
        ...(origin
          ? [
              { property: "og:url", content: origin + path },
              ...shareImageMeta(origin + shareCardPath(path)),
            ]
          : []),
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        // The site icon (routes/favicon[.]svg.ts and the others). The .ico's
        // size keeps browsers that read SVG from preferring it.
        { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        // Lets browsers and feed readers find the RSS feed from any page.
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: postsFeedTitle(site_title),
          href: POSTS_FEED_PATH,
        },
      ],
      scripts: [
        {
          defer: true,
          "data-domain": "devsharpe.io",
          src: "https://analytics.dqc.dev/js/script.js",
        },
      ],
    };
  },
  // The shell renders even when a route errors or is not found.
  shellComponent: RootDocument,
  component: () => <Outlet />,
});

function RootDocument({ children }: { children: ReactNode }) {
  const {
    title: { title, subtitle },
  } = Route.useLoaderData();
  // A page like /links stands on its own, without the site's header and footer.
  const is_standalone = useMatches({
    select: (matches) =>
      matches.some((match) => match.staticData?.is_standalone === true),
  });

  return (
    <html lang="en" className="overscroll-none">
      <head>
        <HeadContent />
      </head>
      <body className="root flex min-h-dvh flex-col bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
        {!is_standalone && <Header title={title} subtitle={subtitle} />}
        <ToastProvider placement="top">{children}</ToastProvider>
        {!is_standalone && <Footer />}
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
