import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { AlertDialogProvider } from "~/components/_ui/alert-dialog";
import { getSession } from "~/server/functions/auth.functions";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    return { user: session.user };
  },
  // Lets admin pages ask before deleting or leaving (see useConfirm).
  component: () => (
    <AlertDialogProvider>
      <Outlet />
    </AlertDialogProvider>
  ),
});
