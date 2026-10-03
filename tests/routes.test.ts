import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { POST as projectPOST } from "@/app/api/project/route"
import { POST as contactPOST } from "@/app/api/contact/route"

let n = 0
// Unique IP per request so the in-memory rate limiter never interferes.
const req = (body: unknown) => {
  n++
  return new Request("http://localhost/api", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "cf-connecting-ip": `10.0.${Math.floor(n / 250)}.${n % 250}` },
  })
}

describe("POST /api/project", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    process.env.GS_PROJECT_WEB_APP_URL = "https://upstream.test/exec"
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    delete process.env.GS_PROJECT_WEB_APP_URL
  })

  it("rejects a missing email, matching the wizard's required field", async () => {
    const res = await projectPOST(req({ name: "Asha", email: "" }))
    expect(res.status).toBe(400)
    expect((await res.json()).fields.email).toBe("Invalid")
  })

  it("rejects malformed JSON", async () => {
    expect((await projectPOST(req("{nope"))).status).toBe(400)
  })

  it("silently accepts honeypot hits without calling upstream", async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
    const res = await projectPOST(req({ name: "Bot", email: "bot@x.co", website: "spam" }))
    expect(res.status).toBe(200)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("forwards sanitized fields upstream on success", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }))
    vi.stubGlobal("fetch", fetchSpy)
    const res = await projectPOST(
      req({ name: "  Asha  ", email: "asha@example.com", addons: ["SEO Setup", 42], extra: "dropped" })
    )
    expect(res.status).toBe(200)
    const sent = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(sent.name).toBe("Asha")
    expect(sent.addons).toEqual(["SEO Setup"])
    expect(sent).not.toHaveProperty("extra")
  })

  it("returns 502 with a generic message when upstream fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("secret stack", { status: 500 })))
    const res = await projectPOST(req({ name: "Asha", email: "asha@example.com" }))
    expect(res.status).toBe(502)
    expect(JSON.stringify(await res.json())).not.toContain("secret stack")
  })

  it("returns 500 when the upstream URL is not configured", async () => {
    delete process.env.GS_PROJECT_WEB_APP_URL
    const res = await projectPOST(req({ name: "Asha", email: "asha@example.com" }))
    expect(res.status).toBe(500)
  })
})

describe("POST /api/contact", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}))
  afterEach(() => vi.restoreAllMocks())

  it("reports each invalid field", async () => {
    // Validation must run before the upstream URL is needed.
    delete process.env.GS_CONTACT_WEB_APP_URL
    const res = await contactPOST(req({ fullName: "", email: "x", message: "" }))
    expect(res.status).toBe(400)
    const { fields } = await res.json()
    expect(fields).toMatchObject({ fullName: "Required", email: "Invalid", message: "Required" })
  })
})
