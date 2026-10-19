import { createFileRoute } from '@tanstack/react-router'

// Server route: a raw HTTP contract (probes, uptime checks), not app data.
export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: () => Response.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } }),
    },
  },
})
