import { NextResponse } from "next/server";
import { EMAIL_RE, failure, isBot, postUpstream, rateLimited, readJson, str } from "@/lib/api";

export const runtime = 'edge';

// Server-side proxy to Google Apps Script Web App for Contact form
// Set GS_CONTACT_WEB_APP_URL in your .env.local to the Web App "exec" URL
export async function POST(req: Request) {
  if (rateLimited(req, "contact")) return failure("contact", 429);

  try {
    const body = await readJson(req);
    if (!body) return failure("contact", 400);
    if (isBot(body)) return NextResponse.json({ ok: true });

    const fullName = str(body.fullName, 200);
    const email = str(body.email, 320);
    const phone = str(body.phone, 40);
    const source = str(body.source, 200);
    const message = str(body.message, 5000);
    const subscribe = body.subscribe === true;

    const nameOk = fullName.length > 0;
    const emailOk = EMAIL_RE.test(email);
    const messageOk = message.length > 0;

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

    const url = process.env.GS_CONTACT_WEB_APP_URL;
    if (!url) return failure("contact", 500, "GS_CONTACT_WEB_APP_URL not set");

    const { res, text } = await postUpstream(url, { fullName, email, phone, source, message, subscribe });
    if (!res.ok) {
      return failure("contact", 502, { status: res.status, statusText: res.statusText, body: text.slice(0, 500) });
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return failure("contact", isAbort ? 504 : 500, err);
  }
}
