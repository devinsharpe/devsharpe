import { createRouter } from '@tanstack/react-router'
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
}
