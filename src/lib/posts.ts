// Client-safe module: types, constants and validation schemas shared by the
// router (search params), server functions (inputs) and forms (pre-checks).
// Nothing here may touch server-only APIs.
import { z } from 'zod'

export const TAGS = ['routing', 'ssr', 'server-functions', 'deployment'] as const
export type Tag = (typeof TAGS)[number]

export const SORTS = ['newest', 'oldest', 'title'] as const
export type Sort = (typeof SORTS)[number]

export const PAGE_SIZE = 4

export interface Post {
  id: string
  title: string
  excerpt: string
  body: string
  tag: Tag
  author: string
  publishedAt: string
}

export interface Comment {
  id: string
  postId: string
  author: string
  body: string
  createdAt: string
}

/** URL state for /posts. Bad or missing values fall back instead of throwing. */
export const postsSearchSchema = z.object({
  q: z.string().trim().max(80).optional().catch(undefined),
  tag: z.enum(TAGS).optional().catch(undefined),
  sort: z.enum(SORTS).default('newest').catch('newest'),
  page: z.number().int().min(1).default(1).catch(1),
})
export type PostsSearch = z.infer<typeof postsSearchSchema>

export const postIdSchema = z.object({ id: z.string().min(1).max(120) })

export const commentInputSchema = z.object({
  postId: z.string().min(1).max(120),
  author: z.string().trim().min(1, 'Name is required').max(40),
  body: z.string().trim().min(1, 'Say something').max(500),
})

export const postInputSchema = z.object({
  title: z.string().trim().min(3, 'At least 3 characters').max(120),
  excerpt: z.string().trim().min(10, 'At least 10 characters').max(200),
  body: z.string().trim().min(20, 'At least 20 characters').max(5000),
  tag: z.enum(TAGS),
})

export interface Insights {
  totalPosts: number
  totalComments: number
  byTag: Array<{ tag: Tag; count: number }>
}
