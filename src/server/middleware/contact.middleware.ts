import { createMiddleware } from "@tanstack/react-start";
import { ContactRequestRepository } from "../repositories/contact-request.repository.server";
import { db } from "../database/index.server";

export const contact_middleware = createMiddleware().server(({ next }) => {
  return next({
    context: {
      contactRequests: new ContactRequestRepository(db),
    },
  });
});
