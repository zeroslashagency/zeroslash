import { NextResponse } from "next/server";

// Server-side proxy to Google Apps Script Web App
// Set GS_WEB_APP_URL in your .env.local to the Web App "exec" URL
export async function POST(req: Request) {
  try {
    const { email, name = "", wishlist = "" } = await req.json();

    // Basic validation
    const emailOk = typeof email === "string" && /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
    if (!emailOk) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const url =
      process.env.GS_WEB_APP_URL ||
      // allow public var in dev if needed
      process.env.NEXT_PUBLIC_GS_WEB_APP_URL ||
      // final fallback (provided by user) to avoid local env errors
      "https://script.google.com/macros/s/AKfycbyfhecGrDsUD7j5TLsXee2OsnlXb03l1uk1DIP6vJ-hGG0W-4ixOzYrr6zXsH5s_M3uWA/exec";

    // Helper to wrap fetch with timeout
    const withTimeout = async (input: RequestInfo | URL, init: RequestInit = {}, ms = 15000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(input, { ...init, signal: controller.signal });
        const text = await res.text();
        return { res, text } as const;
      } finally {
        clearTimeout(id);
      }
    };

    // Attempt 1: JSON POST (most common)
    const attempts: Array<() => Promise<{ label: string; res: Response; text: string }>> = [];

    attempts.push(async () => {
      const { res, text } = await withTimeout(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "zeroslash-waitlist-proxy/1.0",
        },
        body: JSON.stringify({ email, name, wishlist }),
      });
      return { label: "POST json", res, text };
    });

    // Attempt 2: form-encoded POST (some Apps Scripts expect this)
    const formBody = new URLSearchParams({ email, name, wishlist }).toString();
    attempts.push(async () => {
      const { res, text } = await withTimeout(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": "zeroslash-waitlist-proxy/1.0",
        },
        body: formBody,
      });
      return { label: "POST form", res, text };
    });

    // Attempt 3: GET with query params
    const qs = new URLSearchParams({ email, name, wishlist }).toString();
    attempts.push(async () => {
      const { res, text } = await withTimeout(`${url}?${qs}`, {
        method: "GET",
        headers: { "User-Agent": "zeroslash-waitlist-proxy/1.0" },
      });
      return { label: "GET query", res, text };
    });

    const errors: Array<{ label: string; status: number; statusText: string; text: string }> = [];
    for (const run of attempts) {
      try {
        const { label, res, text } = await run();
        if (res.ok) {
          // Some Apps Scripts return JSON or plain text. Try to parse JSON first.
          try {
            const parsed = JSON.parse(text);
            return NextResponse.json({ ok: true, data: parsed });
          } catch {
            return NextResponse.json({ ok: true, message: text });
          }
        }
        errors.push({ label, status: res.status, statusText: res.statusText, text });
      } catch (e: any) {
        errors.push({ label: "network/timeout", status: 0, statusText: e?.name || "Error", text: e?.message || String(e) });
      }
    }

    // If we got here, all attempts failed
    return NextResponse.json(
      {
        ok: false,
        error: "Apps Script error",
        attempts: errors,
        hint:
          "Verify GS_WEB_APP_URL points to a deployed Web App 'exec' URL with Anyone access. If Apps Script expects GET or form POST, these fallbacks were tried.",
      },
      { status: 502 }
    );
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
