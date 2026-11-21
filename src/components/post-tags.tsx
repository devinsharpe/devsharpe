import { Link } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

interface PostTagsProps {
  tags: string[];
  className?: string;
}

/** A post's tags, each linking to /posts filtered by it. */
export function PostTags({ tags, className }: PostTagsProps) {
  if (tags.length === 0) return null;
  return (
    <ul aria-label="Tags" className={cn("flex flex-wrap gap-2 text-sm", className)}>
      {tags.map((tag) => (
        <li key={tag}>
          <Link
            to="/posts"
            search={{ tag }}
            className="block border border-neutral-300 dark:border-neutral-700 px-2 hover:border-neutral-800 dark:hover:border-white transition-colors"
          >
            #{tag}
          </Link>
        </li>
      ))}
    </ul>
  );
}
