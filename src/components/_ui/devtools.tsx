import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

/**
 * One devtools shell; the router and form panels are tabs inside it. Load it
 * lazily, in the browser only: the devtools throw if they're imported on the
 * server, which takes down every page in a production build.
 */
export default function Devtools() {
  return (
    <TanStackDevtools
      plugins={[
        {
          name: "TanStack Router",
          render: <TanStackRouterDevtoolsPanel />,
        },
        formDevtoolsPlugin(),
      ]}
    />
  );
}
