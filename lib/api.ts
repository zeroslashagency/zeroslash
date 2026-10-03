import { NextResponse } from "next/server"

/**
 * Shared helpers for the form proxy routes (/api/contact, /api/addons,
 * /api/project, /api/waitlist).
 *
 * Upstream detail (Apps Script bodies, stack traces, env var names) is logged
 * server-side only. The browser gets a short, generic message.
 */

export { EMAIL_RE } from "./validation"

/** Generic client-facing failure. Details go to the server log, not the response. */
export function failure(scope: string, status: number, detail?: unknown) {
  if (detail !== undefined) console.error(`[api/${scope}]`, detail)
  const error =
    status === 400
      ? "Invalid request"
      : status === 429
        ? "Too many requests. Please try again shortly."
        : "Something went wrong. Please try again later."
  return NextResponse.json({ ok: false, error }, { status })
}

/* ------------------------------------------------------------------ *
 * Best-effort rate limit
 *
 * In-memory, so it is per isolate on edge runtimes: it blunts a single client
 * hammering one instance but is not a global guarantee. Pair it with a
 * platform rule (Cloudflare WAF rate limiting) for real protection.
 * ------------------------------------------------------------------ */

const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

export function rateLimited(req: Request, scope: string): boolean {
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  const key = `${scope}:${ip}`
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(key, recent)

  // Keep the map from growing without bound on a long-lived isolate.
  if (hits.size > 5_000) {
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k)
    }
  }
  return recent.length > MAX_PER_WINDOW
}

/**
 * Honeypot check. Forms render a visually hidden `website` input that humans
 * never fill. A non-empty value means a bot; the route answers `ok` without
 * forwarding so the bot gets no signal.
 */
export function isBot(body: Record<string, unknown>): boolean {
  const trap = body.website
  return typeof trap === "string" && trap.trim().length > 0
}

/** Parse a JSON object body, rejecting oversized or non-object payloads. */
export async function readJson(req: Request, maxBytes = 16_384): Promise<Record<string, unknown> | null> {
  const text = await req.text()
  if (text.length > maxBytes) return null
  try {
    const parsed: unknown = JSON.parse(text)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

export const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "")

/** POST JSON upstream with a timeout. Returns the response and its text. */
export async function postUpstream(url: string, payload: unknown, ms = 15_000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    const text = await res.text()
    return { res, text }
  } finally {
    clearTimeout(id)
  }
}
