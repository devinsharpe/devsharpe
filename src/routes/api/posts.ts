import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SORTS, TAGS } from '~/lib/posts'
import { findPosts } from '~/server/posts.server'

// Query strings are all strings, so this HTTP contract coerces where the
// in-app search schema (which receives parsed JSON) does not need to.
const querySchema = z.object({
  q: z.string().trim().max(80).optional(),
  tag: z.enum(TAGS).optional(),
  sort: z.enum(SORTS).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
})

// Same business logic as the `listPosts` server function, called directly
// rather than over HTTP, so SSR never depends on this endpoint.
export const Route = createFileRoute('/api/posts')({
  server: {
    handlers: {
      GET: ({ request }) => {
        const parsed = querySchema.safeParse(
          Object.fromEntries(new URL(request.url).searchParams),
        )
        if (!parsed.success) {
          return Response.json({ error: z.flattenError(parsed.error) }, { status: 400 })
        }
        return Response.json(findPosts(parsed.data), {
          // Identical for every caller, so a shared cache is safe.
          headers: { 'Cache-Control': 'public, max-age=30' },
        })
      },
    },
  },
})
