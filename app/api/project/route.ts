import { NextResponse } from "next/server";
import { EMAIL_RE, failure, isBot, postUpstream, rateLimited, readJson, str } from "@/lib/api";

export const runtime = 'edge';

// Server-side proxy to Google Apps Script Web App for Project Wizard submissions
// Set GS_PROJECT_WEB_APP_URL in your .env.local to the Web App "exec" URL
export async function POST(req: Request) {
  if (rateLimited(req, "project")) return failure("project", 429);

  try {
    const body = await readJson(req);
    if (!body) return failure("project", 400);
    if (isBot(body)) return NextResponse.json({ ok: true });

    const name = str(body.name, 200);
    const email = str(body.email, 320);
    const phone = str(body.phone, 50);
    const category = str(body.category, 200);
    const websiteType = str(body.websiteType, 200);
    const pages = str(body.pages, 50);
    const style = str(body.style, 200);
    const addons = Array.isArray(body.addons)
      ? body.addons.filter((a): a is string => typeof a === "string").slice(0, 50).map((a) => a.slice(0, 200))
      : [];

    // The wizard already requires both; enforce it here too so an empty body
    // can't write a blank row.
    const nameOk = name.length > 0;
    const emailOk = EMAIL_RE.test(email);
    if (!nameOk || !emailOk) {
      return NextResponse.json(
        {
          ok: false,
          error: "Validation failed",
          fields: {
            name: nameOk ? undefined : "Required",
            email: emailOk ? undefined : "Invalid",
          },
        },
        { status: 400 }
      );
    }

    const url = process.env.GS_PROJECT_WEB_APP_URL;
    if (!url) return failure("project", 500, "GS_PROJECT_WEB_APP_URL not set");

    const { res, text } = await postUpstream(url, { name, email, phone, category, websiteType, pages, style, addons });
    if (!res.ok) {
      return failure("project", 502, { status: res.status, statusText: res.statusText, body: text.slice(0, 500) });
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === "AbortError";
    return failure("project", isAbort ? 504 : 500, err);
  }
}
