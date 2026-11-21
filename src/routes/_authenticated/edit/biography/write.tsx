import { createFileRoute, useRouter } from "@tanstack/react-router";
import { BreadcrumbItem, BreadcrumbNav } from "~/components/_ui/breadcrumb-nav";
import Divider from "~/components/_ui/divider";
import Main from "~/components/_ui/main";
import { BiographySection } from "~/components/biography-section";
import { SiteSubtitleForm } from "~/components/forms/site-subtitle-form";
import { getBiographyEditor } from "~/server/functions/about.functions";
import { getSubtitleSetting } from "~/server/functions/site.functions";

export const Route = createFileRoute("/_authenticated/edit/biography/write")({
  component: RouteComponent,
  loader: async () => {
    const [biography, header] = await Promise.all([
      getBiographyEditor(),
      getSubtitleSetting(),
    ]);
    return { biography, header };
  },
});

function RouteComponent() {
  const { biography, header } = Route.useLoaderData();
  const router = useRouter();

  return (
    <Main>
      <BreadcrumbNav current_page_label="Edit">
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem to="/edit/biography">Biography</BreadcrumbItem>
      </BreadcrumbNav>
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold">Site Subtitle</h2>
        <SiteSubtitleForm
          subtitle={header.subtitle}
          is_default={header.is_default}
        />
      </section>
      <Divider />
      <BiographySection {...biography} on_changed={() => router.invalidate()} />
    </Main>
  );
}
