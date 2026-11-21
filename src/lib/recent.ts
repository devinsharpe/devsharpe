// Browser-only "recently viewed" list. Callers must be client-only code paths
// (effects, or loaders of a route with `ssr: false`).
const KEY = 'dispatch:recent'
export interface RecentPost {
  id: string
  title: string
}

export function readRecent(): Array<RecentPost> {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Array<RecentPost>) : []
  } catch {
    return []
  }
}

export function rememberPost(post: RecentPost) {
  try {
    const next = [post, ...readRecent().filter((p) => p.id !== post.id)].slice(0, 5)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // Storage can be unavailable (private mode, quota); the feature is optional.
  }
}
