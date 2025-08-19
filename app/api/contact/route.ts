import { NextResponse } from "next/server";

export const runtime = 'edge';

// Server-side proxy to Google Apps Script Web App for Contact form
// Set GS_CONTACT_WEB_APP_URL in your .env.local to the Web App "exec" URL
export async function POST(req: Request) {
  try {
    const {
      fullName = "",
      email = "",
      phone = "",
      source = "",
      message = "",
      subscribe = false,
    } = await req.json();

    // Basic validation
    const nameOk = typeof fullName === "string" && fullName.trim().length > 0;
    const emailOk = typeof email === "string" && /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
    const messageOk = typeof message === "string" && message.trim().length > 0;

    if (!nameOk || !emailOk || !messageOk) {
      return NextResponse.json(
        {
          ok: false,
          error: "Validation failed",
          fields: {
            fullName: nameOk ? undefined : "Required",
            email: emailOk ? undefined : "Invalid",
            message: messageOk ? undefined : "Required",
          },
        },
        { status: 400 }
      );
    }

    const url =
      process.env.GS_CONTACT_WEB_APP_URL ||
      "https://script.google.com/macros/s/AKfycbyLGTKzQBMmuIOSwTjRcP73_eCsmKpQW2da5ILkoqFH7V-EFCle9SQBgB6YzuzeXVCYBA/exec";
      process.env.NEXT_PUBLIC_GS_CONTACT_WEB_APP_URL ||
      // Fallback to the user's provided /exec URL to avoid local env errors
      "https://script.google.com/macros/s/AKfycbyLGTKzQBMmuIOSwTjRcP73_eCsmKpQW2da5ILkoqFH7V-EFCle9SQBgB6YzuzeXVCYBA/exec";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, source, message, subscribe }),
        signal: controller.signal,
      });

      const text = await upstream.text();
      // Try to parse JSON for better diagnostics if available
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

      // If Apps Script returned JSON { ok: true }, forward it; else include raw text
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
