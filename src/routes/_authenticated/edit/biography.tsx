import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Button from "~/components/_ui/button";
import Main from "~/components/_ui/main";

export const Route = createFileRoute("/_authenticated/edit/biography")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Main>
      <BreadcrumbNav current_page_label="Biography">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
      </BreadcrumbNav>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Current Biography</h2>
        <h3 className="text-lg font-semibold">Previous Biographies</h3>
        <Button>View All</Button>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Current Résumés</h2>
        <h3 className="text-lg font-semibold">Previous Résumés</h3>
        <Button>View All</Button>
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Employment History</h2>
      </section>
    </Main>
  );
}
