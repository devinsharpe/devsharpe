// Server-only data layer. Both the server functions (used by loaders and forms)
// and the public /api routes call into this module, so there is one source of
// business logic and SSR never has to fetch its own HTTP API.
//
// The store is in-memory and seeded on first use, so it lives for the life of
// the Node process and resets on restart (and is not shared across instances).
// Replace it with a real database behind these same function signatures and
// nothing above this file changes.
import { getServerEnv } from './env.server'
import { PAGE_SIZE } from '~/lib/posts'
import type { Comment, Insights, Post, PostsSearch, Tag } from '~/lib/posts'

interface Db {
  posts: Array<Post>
  comments: Array<Comment>
}

const seedPosts: Array<Post> = [
  {
    id: 'file-based-routing',
    title: 'File-based routing without the ceremony',
    excerpt: 'Routes are files; the route tree is generated and fully typed.',
    body: 'Every file under src/routes becomes a route.\n\nThe generated route tree gives Link, useSearch and useParams their types, so a renamed path is a compile error rather than a 404.',
    tag: 'routing',
    author: 'Devin',
    publishedAt: '2026-08-02T09:00:00.000Z',
  },
  {
    id: 'search-params-are-state',
    title: 'Search params are application state',
    excerpt: 'Validate the URL once and every consumer gets typed, defaulted values.',
    body: 'validateSearch turns an untrusted query string into a typed object.\n\nPair it with loaderDeps so the loader cache is keyed on exactly the params that matter.',
    tag: 'routing',
    author: 'Devin',
    publishedAt: '2026-08-09T09:00:00.000Z',
  },
  {
    id: 'loaders-are-isomorphic',
    title: 'Loaders run in two places',
    excerpt: 'Route loaders execute on the server for SSR and in the browser on navigation.',
    body: 'That is why secrets and databases never go directly in a loader.\n\nA loader calls a server function; the build swaps the implementation for an RPC stub in the client bundle.',
    tag: 'server-functions',
    author: 'Devin',
    publishedAt: '2026-08-16T09:00:00.000Z',
  },
  {
    id: 'typed-server-functions',
    title: 'Server functions as typed RPC',
    excerpt: 'Validate input with a schema, return plain data, throw redirects and not-founds.',
    body: 'createServerFn gives you a function that only ever runs on the server.\n\nInput is validated at the boundary, and the handler return type flows to the caller.',
    tag: 'server-functions',
    author: 'Devin',
    publishedAt: '2026-08-23T09:00:00.000Z',
  },
  {
    id: 'streaming-ssr',
    title: 'Streaming the slow parts',
    excerpt: 'Send the shell and critical data first; let the rest arrive as it resolves.',
    body: 'Await the data the page cannot render without. Leave the rest as an unawaited promise.\n\nThe document starts flushing immediately and the deferred value is streamed into the page when it settles.',
    tag: 'ssr',
    author: 'Devin',
    publishedAt: '2026-08-30T09:00:00.000Z',
  },
  {
    id: 'selective-ssr',
    title: 'Choosing an SSR mode per route',
    excerpt: 'Full SSR, data-only, or client-only: pick what each route needs.',
    body: 'Marketing pages want full SSR. A canvas or chart wants server data but a client render. A dashboard behind local state may want neither.\n\nChildren can only be more restrictive than their parent.',
    tag: 'ssr',
    author: 'Devin',
    publishedAt: '2026-09-06T09:00:00.000Z',
  },
  {
    id: 'one-model-many-runtimes',
    title: 'One application model, many runtimes',
    excerpt: 'Swap the deployment plugin, not the application code.',
    body: 'Node, Bun and Workers differ in how they start and where env comes from, not in how routes and server functions are written.\n\nKeep env reads inside handlers and keep runtime-specific choices in vite.config.ts.',
    tag: 'deployment',
    author: 'Devin',
    publishedAt: '2026-09-13T09:00:00.000Z',
  },
  {
    id: 'server-only-boundaries',
    title: 'Making server-only code unimportable',
    excerpt: 'Use .server.ts files and server functions so secrets cannot reach the client.',
    body: 'Import protection fails the build if a client module reaches a .server file.\n\nThat turns a silent secret leak into a loud compile-time error.',
    tag: 'deployment',
    author: 'Devin',
    publishedAt: '2026-09-18T09:00:00.000Z',
  },
]

function seed(): Db {
  return {
    posts: structuredClone(seedPosts),
    comments: [
      {
        id: crypto.randomUUID(),
        postId: 'streaming-ssr',
        author: 'Sam',
        body: 'The deferred comments below only appeared after the page painted.',
        createdAt: '2026-09-07T12:00:00.000Z',
      },
    ],
  }
}

// Lazy so seeding happens on first use, not at import time. Also survives
// dev-server module reloads.
const g = globalThis as typeof globalThis & { __dispatchDb?: Db }
function getDb(): Db {
  return (g.__dispatchDb ??= seed())
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function findPosts({ q, tag, sort, page }: PostsSearch) {
  const needle = q?.toLowerCase()
  const filtered = getDb().posts.filter(
    (p) =>
      (!tag || p.tag === tag) &&
      (!needle ||
        p.title.toLowerCase().includes(needle) ||
        p.excerpt.toLowerCase().includes(needle)),
  )
  filtered.sort((a, b) =>
    sort === 'title'
      ? a.title.localeCompare(b.title)
      : sort === 'oldest'
        ? a.publishedAt.localeCompare(b.publishedAt)
        : b.publishedAt.localeCompare(a.publishedAt),
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const items = filtered
    .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
    .map(({ body: _body, ...summary }) => summary)
  return { items, total: filtered.length, page: current, pageCount }
}

export function findPost(id: string): Post | undefined {
  return getDb().posts.find((p) => p.id === id)
}

/** Deliberately slow so the streaming boundary on the post page is observable. */
export async function findComments(postId: string): Promise<Array<Comment>> {
  await sleep(getServerEnv().commentsLatencyMs)
  return getDb().comments
    .filter((c) => c.postId === postId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function insertComment(input: Pick<Comment, 'postId' | 'author' | 'body'>) {
  if (!findPost(input.postId)) return undefined
  const comment: Comment = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  }
  getDb().comments.push(comment)
  return comment
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function insertPost(input: Pick<Post, 'title' | 'excerpt' | 'body' | 'tag'>) {
  const base = slugify(input.title) || 'post'
  let id = base
  for (let n = 2; findPost(id); n++) id = `${base}-${n}`
  const post: Post = {
    id,
    author: 'Devin',
    publishedAt: new Date().toISOString(),
    ...input,
  }
  getDb().posts.push(post)
  return post
}

export function computeInsights(): Insights {
  const counts = new Map<Tag, number>()
  for (const p of getDb().posts) counts.set(p.tag, (counts.get(p.tag) ?? 0) + 1)
  return {
    totalPosts: getDb().posts.length,
    totalComments: getDb().comments.length,
    byTag: [...counts].map(([tag, count]) => ({ tag, count })),
  }
}
