import { NextResponse } from "next/server";
import { EMAIL_RE, failure, isBot, rateLimited, readJson, str } from "@/lib/api";

export const runtime = 'edge';

// Server-side proxy to Google Apps Script Web App
// Set GS_WAITLIST_WEB_APP_URL in your .env.local to the Web App "exec" URL
export async function POST(req: Request) {
  if (rateLimited(req, "waitlist")) return failure("waitlist", 429);

  try {
    const body = await readJson(req);
    if (!body) return failure("waitlist", 400);
    if (isBot(body)) return NextResponse.json({ ok: true });

    const email = str(body.email, 320);
    const name = str(body.name, 200);
    const wishlist = str(body.wishlist, 2000);

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const url = process.env.GS_WAITLIST_WEB_APP_URL;
    if (!url) return failure("waitlist", 500, "GS_WAITLIST_WEB_APP_URL not set");

    const withTimeout = async (init: RequestInit, ms = 15000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(url, { ...init, signal: controller.signal });
        const text = await res.text();
        return { res, text } as const;
      } finally {
        clearTimeout(id);
      }
    };

    // JSON first, then form-encoded for Apps Scripts that read e.parameter.
    // Both keep the payload in the body; the old GET fallback put the email
    // in the query string, where it lands in upstream and proxy logs.
    const attempts: Array<{ label: string; init: RequestInit }> = [
      {
        label: "POST json",
        init: {
          method: "POST",
          headers: { "Content-Type": "application/json", "User-Agent": "zeroslash-waitlist-proxy/1.0" },
          body: JSON.stringify({ email, name, wishlist }),
        },
      },
      {
        label: "POST form",
        init: {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "User-Agent": "zeroslash-waitlist-proxy/1.0",
          },
          body: new URLSearchParams({ email, name, wishlist }).toString(),
        },
      },
    ];

    const errors: Array<{ label: string; status: number; text: string }> = [];
    for (const { label, init } of attempts) {
      try {
        const { res, text } = await withTimeout(init);
        if (res.ok) return NextResponse.json({ ok: true });
        errors.push({ label, status: res.status, text: text.slice(0, 300) });
      } catch (e: unknown) {
        errors.push({ label, status: 0, text: e instanceof Error ? `${e.name}: ${e.message}` : String(e) });
      }
    }

    return failure("waitlist", 502, errors);
  } catch (err: unknown) {
    return failure("waitlist", 500, err);
  }
}
