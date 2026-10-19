import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
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
      <p>Hello "/_authenticated/dashboard/posts/comments"!</p>
    </Main>
  );
}
