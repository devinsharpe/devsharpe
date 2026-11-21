import { useRouter } from "@tanstack/react-router";
import Link from "./_ui/link";
import type { ErrorComponentProps } from "@tanstack/react-router";
import Main from "./_ui/main";

export function PendingView() {
  return <p className="muted">Loading…</p>;
}

export function NotFoundView() {
  return (
    <Main className="text-center">
      <section className="flex flex-col gap-4">
        <h2>Uh oh</h2>
        <p className="muted">That page or record doesn't exist.</p>
        <Link to="/" className="mx-auto">
          Return to Home
        </Link>
      </section>
    </Main>
  );
}

export function ErrorView({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <section className="stack">
      <h1>Something went wrong</h1>
      <p className="muted">
        {error instanceof Error ? error.message : String(error)}
      </p>
      <button
        onClick={() => {
          reset();
          void router.invalidate();
        }}
      >
        Try again
      </button>
    </section>
  );
}
