import { createMiddleware } from "@tanstack/react-start";
import { PostsRepository } from "../repositories/posts.repository.server";
import { db } from "../database/index.server";

export const posts_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      posts: new PostsRepository(db),
    },
  });
});
