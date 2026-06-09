import { NextResponse } from "next/server";

export const runtime = 'edge';

// Server-side proxy to Google Apps Script Web App for Add-ons submissions
// Set GS_ADDONS_WEB_APP_URL in your .env.local to the Web App "exec" URL
export async function POST(req: Request) {
  try {
    const { name = "", email = "", addon = "", phone = "" } = await req.json();

    const nameOk = typeof name === "string" && name.trim().length > 0;
    const emailOk = typeof email === "string" && /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
    const addonOk = typeof addon === "string" && addon.trim().length > 0;

    if (!nameOk || !emailOk || !addonOk) {
      return NextResponse.json(
        {
          ok: false,
          error: "Validation failed",
          fields: {
            name: nameOk ? undefined : "Required",
            email: emailOk ? undefined : "Invalid",
            addon: addonOk ? undefined : "Required",
          },
        },
        { status: 400 }
      );
    }

    const url = process.env.GS_ADDONS_WEB_APP_URL;

    if (!url) {
      return NextResponse.json(
        {
          ok: false,
          error: "Server configuration error: GS_ADDONS_WEB_APP_URL not set. Please configure environment variables in Vercel.",
        },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, addon, phone }),
        signal: controller.signal,
      });

      const text = await upstream.text();
      let parsed: any = null;
      try { parsed = JSON.parse(text); } catch {}

      if (!upstream.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: "Apps Script error",
            status: upstream.status,
            statusText: upstream.statusText,
            detail: text,
            parsed,
          },
          { status: 502 }
        );
      }

      if (parsed && typeof parsed === "object") {
        return NextResponse.json({ ok: true, upstream: parsed });
      }
      return NextResponse.json({ ok: true, message: text });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err: any) {
    const isAbort = err?.name === "AbortError";
    return NextResponse.json(
      { ok: false, error: isAbort ? "Upstream timeout" : "Server error", detail: String(err) },
      { status: 500 }
    );
  }
}
