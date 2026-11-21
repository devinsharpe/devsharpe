// Server-only: checks Cloudflare Turnstile tokens (the "are you human?" widget
// in front of the contact form) with Cloudflare's siteverify API.
import { randomUUID } from "node:crypto";
import { getServerEnv } from "./env.server";

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** Per attempt; there's one retry. */
const SITEVERIFY_TIMEOUT_MS = 8_000;

/** Codes that mean the visitor's token is no good (not that we're misconfigured). */
const TOKEN_ERRORS = new Set([
  "missing-input-response",
  "invalid-input-response",
  "timeout-or-duplicate",
]);

interface SiteverifyResponse {
  success: boolean;
  "error-codes"?: string[];
  /** The widget's action. Cloudflare's test keys leave it out. */
  action?: string;
  hostname?: string;
  challenge_ts?: string;
}

export type TurnstileResult =
  | { ok: true }
  /** The token is missing, expired, already used, or made for another action. */
  | { ok: false; reason: "rejected"; codes: string[] }
  /** Couldn't check: misconfigured keys, or Cloudflare unreachable. */
  | { ok: false; reason: "unavailable"; detail: string };

/** The env vars Turnstile still needs, by name; empty when it's set up. */
export function missingTurnstileConfig() {
  const { turnstile } = getServerEnv();
  const missing: string[] = [];
  if (!turnstile.siteKey) missing.push("VITE_CLOUDFLARE_SITEKEY");
  if (!turnstile.secretKey) missing.push("CLOUDFLARE_SECRET_KEY");
  return missing;
}

/**
 * Checks a token from the widget. Each token passes once, within 5 minutes
 * of being issued, so the form needs a fresh one for every send.
 */
export async function verifyTurnstileToken(
  token: string,
  expected_action: string,
): Promise<TurnstileResult> {
  const { secretKey } = getServerEnv().turnstile;
  if (!secretKey) {
    return { ok: false, reason: "unavailable", detail: "no secret key" };
  }
  // The same key on the retry lets Cloudflare check the same token twice.
  const body = JSON.stringify({
    secret: secretKey,
    response: token,
    idempotency_key: randomUUID(),
  });

  let detail = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    let data: SiteverifyResponse;
    try {
      const response = await fetch(SITEVERIFY_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
      });
      if (response.status >= 500) {
        detail = `siteverify answered ${response.status}`;
        continue;
      }
      data = (await response.json()) as SiteverifyResponse;
    } catch (error) {
      detail = error instanceof Error ? error.message : String(error);
      continue;
    }

    const codes = data["error-codes"] ?? [];
    if (data.success !== true) {
      if (codes.includes("internal-error")) {
        detail = "siteverify internal-error";
        continue;
      }
      if (codes.length > 0 && codes.every((code) => TOKEN_ERRORS.has(code))) {
        return { ok: false, reason: "rejected", codes };
      }
      // e.g. invalid-input-secret: ours to fix, not the visitor's.
      return {
        ok: false,
        reason: "unavailable",
        detail: `siteverify refused: ${codes.join(", ") || "no error codes"}`,
      };
    }
    // A token from a widget on another form doesn't count for this one.
    if (data.action && data.action !== expected_action) {
      return { ok: false, reason: "rejected", codes: ["action-mismatch"] };
    }
    return { ok: true };
  }
  return { ok: false, reason: "unavailable", detail };
}
