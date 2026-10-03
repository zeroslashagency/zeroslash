import { afterEach, describe, expect, it, vi } from "vitest"
import { failure, isBot, rateLimited, readJson, str } from "@/lib/api"

const post = (body: string, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/x", { method: "POST", body, headers })

describe("readJson", () => {
  it("parses a JSON object", async () => {
    expect(await readJson(post('{"a":1}'))).toEqual({ a: 1 })
  })

  it.each(["not json", "[1,2]", "null", '"str"', "42"])("rejects non-object body %s", async (body) => {
    expect(await readJson(post(body))).toBeNull()
  })

  it("rejects oversized payloads", async () => {
    expect(await readJson(post(JSON.stringify({ a: "x".repeat(100) })), 50)).toBeNull()
  })
})

describe("str", () => {
  it("trims and caps length", () => {
    expect(str("  hello  ")).toBe("hello")
    expect(str("abcdef", 3)).toBe("abc")
  })

  it("returns empty for non-strings", () => {
    expect(str(42)).toBe("")
    expect(str(undefined)).toBe("")
    expect(str({ toString: () => "x" })).toBe("")
  })
})

describe("isBot", () => {
  it("flags a filled honeypot", () => {
    expect(isBot({ website: "http://spam" })).toBe(true)
  })

  it("passes empty or missing honeypot", () => {
    expect(isBot({ website: "" })).toBe(false)
    expect(isBot({ website: "   " })).toBe(false)
    expect(isBot({})).toBe(false)
  })
})

describe("failure", () => {
  afterEach(() => vi.restoreAllMocks())

  it("returns generic messages and never leaks detail", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {})
    const res = failure("contact", 500, "GS_CONTACT_WEB_APP_URL not set")
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(JSON.stringify(body)).not.toContain("GS_CONTACT_WEB_APP_URL")
    expect(log).toHaveBeenCalledOnce()
  })

  it("maps 400 and 429 to specific messages", async () => {
    expect((await failure("x", 400).json()).error).toBe("Invalid request")
    expect((await failure("x", 429).json()).error).toMatch(/too many/i)
  })
})

describe("rateLimited", () => {
  it("allows 5 requests per window per IP and scope, then blocks", () => {
    const req = () => post("{}", { "cf-connecting-ip": "203.0.113.7" })
    for (let i = 0; i < 5; i++) expect(rateLimited(req(), "rl-test")).toBe(false)
    expect(rateLimited(req(), "rl-test")).toBe(true)
    // Separate scope and separate IP are tracked independently.
    expect(rateLimited(req(), "rl-other")).toBe(false)
    expect(rateLimited(post("{}", { "cf-connecting-ip": "203.0.113.8" }), "rl-test")).toBe(false)
  })

  it("uses the first x-forwarded-for hop", () => {
    const req = () => post("{}", { "x-forwarded-for": "198.51.100.1, 10.0.0.1" })
    for (let i = 0; i < 5; i++) rateLimited(req(), "xff-test")
    expect(rateLimited(post("{}", { "x-forwarded-for": "198.51.100.1" }), "xff-test")).toBe(true)
  })
})
