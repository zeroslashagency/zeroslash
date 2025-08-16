import { NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name = "",
      email = "",
      category = "",
      websiteType = "",
      pages = "",
      style = "",
      addons = [] as string[],
    } = body || {};

    // Basic validation
    const emailOk = !email || (typeof email === "string" && /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email));
    if (!emailOk) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const url =
      process.env.GS_PROJECT_WEB_APP_URL ||
      process.env.NEXT_PUBLIC_GS_PROJECT_WEB_APP_URL ||
      "https://script.google.com/macros/s/AKfycbysNvKTuGVBKw9OkAWf82S3DCKaE1oENOkR3HGD1g9CNXovsp9papXRSxZYVvC4Mri5/exec";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const upstream = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, websiteType, pages, style, addons }),
        signal: controller.signal,
      });
      const text = await upstream.text();
      if (!upstream.ok) {
        return NextResponse.json(
          {
            ok: false,
            error: "Apps Script error",
            status: upstream.status,
            statusText: upstream.statusText,
            detail: text,
          },
          { status: 502 }
        );
      }
      return NextResponse.json({ ok: true, message: text });
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
