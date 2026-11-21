// Cloudflare Turnstile: the "are you human?" check in front of public forms.
// It hands back a token, which the server checks (server/turnstile.server.ts).
import {
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { cn } from "~/lib/utils";

// Cloudflare asks that api.js is always loaded from here, never bundled,
// cached, or proxied, so it keeps working when they update it.
const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface TurnstileRenderOptions {
  sitekey: string;
  action?: string;
  theme?: "auto" | "light" | "dark";
  size?: "normal" | "flexible" | "compact";
  /** Off: the token goes through `callback`, not a hidden input. */
  "response-field"?: boolean;
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  "error-callback"?: (code: string) => void;
}

interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileRenderOptions): string | undefined;
  reset(widget_id: string): void;
  remove(widget_id: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;

/** Adds api.js to the page once, however many widgets there are. */
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.turnstile
        ? resolve(window.turnstile)
        : reject(new Error("Turnstile loaded but didn't start."));
    script.onerror = () => {
      script.remove();
      reject(new Error("Turnstile couldn't load."));
    };
    document.head.append(script);
  }).catch((error: unknown) => {
    // Lets the next widget try again (e.g. after a network blip).
    loading = null;
    throw error;
  });
  return loading;
}

export interface TurnstileHandle {
  /** Asks for a new token; call after each send, since a token works once. */
  reset(): void;
}

interface TurnstileProps {
  site_key: string;
  /** Checked by the server, so a token from one form can't be used on another. */
  action: string;
  /** A fresh token, or null once it expires or the check fails. */
  on_token: (token: string | null) => void;
  ref?: Ref<TurnstileHandle>;
  className?: string;
}

export function Turnstile({
  site_key,
  action,
  on_token,
  ref,
  className,
}: TurnstileProps) {
  const container_ref = useRef<HTMLDivElement>(null);
  const widget_id = useRef<string | null>(null);
  // The latest callback, without re-rendering the widget when it changes.
  const on_token_ref = useRef(on_token);
  useEffect(() => {
    on_token_ref.current = on_token;
  });
  const [problem, set_problem] = useState<string | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      reset() {
        on_token_ref.current(null);
        if (widget_id.current) window.turnstile?.reset(widget_id.current);
      },
    }),
    [],
  );

  useEffect(() => {
    let is_cancelled = false;
    set_problem(null);
    loadTurnstile().then(
      (api) => {
        if (is_cancelled || !container_ref.current) return;
        widget_id.current =
          api.render(container_ref.current, {
            sitekey: site_key,
            action,
            theme: "auto",
            // Its fixed 300 × 65 size, rather than stretching to the form's width.
            size: "normal",
            "response-field": false,
            callback: (token) => {
              set_problem(null);
              on_token_ref.current(token);
            },
            "expired-callback": () => on_token_ref.current(null),
            "timeout-callback": () => on_token_ref.current(null),
            // The widget shows the error and retries on its own.
            "error-callback": () => {
              on_token_ref.current(null);
              set_problem(
                "The check ran into a problem. It'll try again; if it keeps failing, reload the page.",
              );
            },
          }) ?? null;
      },
      () => {
        if (is_cancelled) return;
        set_problem(
          "The check that you're human couldn't load. Check your connection, allow challenges.cloudflare.com in any content blocker, then reload the page.",
        );
      },
    );
    return () => {
      is_cancelled = true;
      if (widget_id.current) window.turnstile?.remove(widget_id.current);
      widget_id.current = null;
      on_token_ref.current(null);
    };
  }, [site_key, action]);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Holds the widget's height (65px) so the form doesn't jump when it appears. */}
      <div ref={container_ref} className="min-h-[65px]" />
      {problem && (
        <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">
          {problem}
        </p>
      )}
    </div>
  );
}
