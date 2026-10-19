import { Link } from '@tanstack/react-router'
import type { Post } from '~/lib/posts'

export function PostCard({ post }: { post: Omit<Post, 'body'> }) {
  return (
    <article className="card">
      <p className="meta">
        <span className="tag">{post.tag}</span>
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toISOString().slice(0, 10)}
        </time>
      </p>
      <h2>
        <Link to="/posts/$postId" params={{ postId: post.id }}>
          {post.title}
        </Link>
      </h2>
      <p className="muted">{post.excerpt}</p>
    </article>
  )
}
