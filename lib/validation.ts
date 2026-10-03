// Shared by client forms and API routes so both sides accept the same input.
// Keep this file free of server-only imports.

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const PHONE_RE = /^[0-9+()\-.\s]{7,}$/

export const isEmail = (v: string) => EMAIL_RE.test(v.trim())

/** Empty is allowed; phone is optional everywhere it is collected. */
export const isOptionalPhone = (v: string) => !v.trim() || PHONE_RE.test(v.trim())
