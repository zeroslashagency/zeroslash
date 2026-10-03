import { NextResponse } from "next/server";
import { EMAIL_RE, failure, isBot, postUpstream, rateLimited, readJson, str } from "@/lib/api";

export const runtime = 'edge';

// Server-side proxy to Google Apps Script Web App for Add-ons submissions
// Set GS_ADDONS_WEB_APP_URL in your .env.local to the Web App "exec" URL
export async function POST(req: Request) {
  if (rateLimited(req, "addons")) return failure("addons", 429);

  try {
    const body = await readJson(req);
    if (!body) return failure("addons", 400);
    if (isBot(body)) return NextResponse.json({ ok: true });

    const name = str(body.name, 200);
    const email = str(body.email, 320);
    const addon = str(body.addon, 200);
    const phone = str(body.phone, 40);

    const nameOk = name.length > 0;
    const emailOk = EMAIL_RE.test(email);
    const addonOk = addon.length > 0;

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
    if (!url) return failure("addons", 500, "GS_ADDONS_WEB_APP_URL not set");

    const { res, text } = await postUpstream(url, { name, email, addon, phone });
    if (!res.ok) {
      return failure("addons", 502, { status: res.status, statusText: res.statusText, body: text.slice(0, 500) });
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return failure("addons", isAbort ? 504 : 500, err);
  }
}
