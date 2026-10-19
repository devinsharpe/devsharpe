import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Main from "~/components/_ui/main";

export const Route = createFileRoute(
  "/_authenticated/dashboard/collections/zines",
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Main>
      <BreadcrumbNav current_page_label="Zines">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem to="/dashboard/collections">
          Photograph Collections
        </BreadcrumbItem>
      </BreadcrumbNav>
      <p>Hello "/_authenticated/dashboard/collections/zines"!</p>
    </Main>
  );
}
