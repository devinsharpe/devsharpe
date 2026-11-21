import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import { ComingSoon } from "~/components/_ui/coming-soon";
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
          Photo Collections
        </BreadcrumbItem>
      </BreadcrumbNav>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Zines</h2>
        <ComingSoon>
          Zines will live here, alongside your photo collections.
        </ComingSoon>
      </section>
    </Main>
  );
}
