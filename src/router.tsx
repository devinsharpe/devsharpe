import { createRouter } from '@tanstack/react-router'
import type { ComponentType } from 'react'
import { routeTree } from './routeTree.gen'
import { ErrorView, NotFoundView, PendingView } from '~/components/status'

// Called once per request on the server and once in the browser.
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPendingComponent: PendingView,
    defaultErrorComponent: ErrorView,
    defaultNotFoundComponent: NotFoundView,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
  interface StaticDataRouteOption {
    /** Renders the page without the site header and footer (e.g. /links). */
    is_standalone?: boolean
    /**
     * This route's crumb in the page's breadcrumbs (components/_ui/breadcrumbs.tsx),
     * linking to the route's path. A label, or a component that returns one
     * when it depends on the page (e.g. a post's title, from
     * `Route.useLoaderData()`). Routes without one add no crumb, so a
     * section's crumb goes on its layout route (`posts/route.tsx`), not on its
     * index route.
     */
    breadcrumb?: string | ComponentType
  }
}
