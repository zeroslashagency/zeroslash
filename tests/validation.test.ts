import { describe, expect, it } from "vitest"
import { EMAIL_RE as API_EMAIL_RE } from "@/lib/api"
import { EMAIL_RE, isEmail, isOptionalPhone } from "@/lib/validation"

describe("isEmail", () => {
  it.each(["a@b.co", "first.last+tag@example.com", "  padded@example.in  "])("accepts %s", (v) => {
    expect(isEmail(v)).toBe(true)
  })

  it.each(["", "   ", "plain", "a@b", "a @b.co", "@b.co", "a@.co"])("rejects %j", (v) => {
    expect(isEmail(v)).toBe(false)
  })

  it("is the same rule the API routes enforce", () => {
    // The ProjectWizard bug came from the client and server using different rules.
    expect(API_EMAIL_RE).toBe(EMAIL_RE)
  })
})

describe("isOptionalPhone", () => {
  it.each(["", "   ", "+91 95002 55291", "(044) 123-4567", "9500255291"])("accepts %j", (v) => {
    expect(isOptionalPhone(v)).toBe(true)
  })

  it.each(["12345", "call me", "95002x55291"])("rejects %j", (v) => {
    expect(isOptionalPhone(v)).toBe(false)
  })
})
