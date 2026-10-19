import { createFileRoute } from "@tanstack/react-router";
import { LogInIcon } from "lucide-react";
import Button from "~/components/_ui/button";
import Main from "~/components/_ui/main";
import { auth_client } from "~/lib/auth-client";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Main>
      <Button
        className="mx-auto"
        onClick={() => auth_client.signIn.social({ provider: "dqc" })}
      >
        <LogInIcon strokeWidth={1.5} size={16} />
        <span>Sign In with DQC</span>
      </Button>
    </Main>
  );
}
