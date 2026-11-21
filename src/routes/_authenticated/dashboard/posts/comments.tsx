import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import { ComingSoon } from "~/components/_ui/coming-soon";
import Main from "~/components/_ui/main";

export const Route = createFileRoute(
  "/_authenticated/dashboard/posts/comments",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Main>
      <BreadcrumbNav current_page_label="Comments">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem to="/dashboard/posts">Posts</BreadcrumbItem>
      </BreadcrumbNav>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Comments</h2>
        <ComingSoon>
          Comments on your posts will show up here for you to read and manage.
        </ComingSoon>
      </section>
    </Main>
  );
}
