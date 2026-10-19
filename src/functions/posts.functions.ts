// Server-function boundary. Static imports of this file are safe from anywhere:
// in the client bundle each `createServerFn` becomes an RPC stub and the
// `.server` imports below are stripped out.
import { createServerFn } from '@tanstack/react-start'
import { notFound, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import {
  commentInputSchema,
  postIdSchema,
  postInputSchema,
  postsSearchSchema,
} from '~/lib/posts'
import {
  computeInsights,
  findComments,
  findPost,
  findPosts,
  insertComment,
  insertPost,
} from '~/server/posts.server'

export const listPosts = createServerFn({ method: 'GET' })
  .validator(postsSearchSchema)
  .handler(({ data }) => findPosts(data))

export const getPost = createServerFn({ method: 'GET' })
  .validator(postIdSchema)
  .handler(({ data }) => {
    const post = findPost(data.id)
    if (!post) throw notFound()
    return post
  })

export const getComments = createServerFn({ method: 'GET' })
  .validator(z.object({ postId: z.string().min(1).max(120) }))
  .handler(({ data }) => findComments(data.postId))

export const addComment = createServerFn({ method: 'POST' })
  .validator(commentInputSchema)
  .handler(({ data }) => {
    const comment = insertComment(data)
    if (!comment) throw notFound()
    return comment
  })

export const createPost = createServerFn({ method: 'POST' })
  .validator(postInputSchema)
  .handler(({ data }) => {
    const post = insertPost(data)
    // Callers must use `useServerFn` so the router performs this redirect.
    throw redirect({ to: '/posts/$postId', params: { postId: post.id } })
  })

export const getInsights = createServerFn({ method: 'GET' }).handler(() =>
  computeInsights(),
)
