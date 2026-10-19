import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Main from "~/components/_ui/main";

export const Route = createFileRoute("/_authenticated/dashboard/projects/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Main>
      <BreadcrumbNav current_page_label="Projects">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
      </BreadcrumbNav>
      <p>Hello "/_authenticated/dashboard/projects/"!</p>
    </Main>
  );
}
