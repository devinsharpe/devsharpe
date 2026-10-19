// Server-only (the `.server.ts` suffix makes the build reject client imports).
//
// Env is read on every call, never at module scope, so a module-level read can
// never be inlined into a client bundle or evaluated before the process env is set.
export function getServerEnv() {
  return {
    siteTitle: process.env.SITE_TITLE ?? 'Devin Sharpe',
    siteSubtitle: process.env.SITE_SUBTITLE ?? "",
  }
}
