import { createFileRoute } from "@tanstack/react-router";
import Main from "~/components/_ui/main";

export const Route = createFileRoute("/links")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Main>
      <p>Hello "/links"!</p>
    </Main>
  );
}
