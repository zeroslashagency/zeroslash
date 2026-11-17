export type MascotMood = "idle" | "talk" | "wink"
export type TalkPhase = 0 | 1 | 2 | 3
export type ContactDisplay = "face" | "text"
export type IdleCue = "talk" | "text" | "glance"

export const MAX_GAZE_OFFSET_PX = 2.8

/**
 * Maps a scroll delta (currentY - prevY) to a clamped vertical pupil offset.
 * Downward scrolling produces positive Y (looking down); upward scrolling produces negative Y.
 */
export function computeScrollGaze(
  deltaY: number,
  reducedMotion = false,
  maxOffset = MAX_GAZE_OFFSET_PX
): number {
  if (reducedMotion || Math.abs(deltaY) < 0.5) return 0
  const scaled = deltaY * 0.14
  return Math.max(-maxOffset, Math.min(maxOffset, Number(scaled.toFixed(2))))
}

/**
 * Resolves the active facial expression priority:
 * hover/focus ("wink") > periodic speech cycle ("talk") > default ("idle").
 */
export function resolveMascotMood(opts: {
  hovered: boolean
  focused: boolean
  talkPhase: TalkPhase
  reducedMotion?: boolean
}): MascotMood {
  if (opts.hovered || opts.focused) return "wink"
  if (opts.reducedMotion) return "idle"
  if (opts.talkPhase > 0) return "talk"
  return "idle"
}

/**
 * Resolves whether the corner dome currently renders the mascot face OR the text label
 * (never both simultaneously). Hover/focus always surfaces the interactive winking face.
 */
export function resolveContactDisplay(opts: {
  hovered: boolean
  focused: boolean
  showTextPhase: boolean
  reducedMotion?: boolean
}): ContactDisplay {
  if (opts.hovered || opts.focused) return "face"
  if (opts.reducedMotion) return "text"
  return opts.showTextPhase ? "text" : "face"
}

/**
 * Picks a realistic non-repetitive next idle cue ("talk", "text", or "glance")
 * avoiding consecutive identical cues so behavior never feels robotic or loopy.
 */
export function pickNextIdleCue(
  lastCue: IdleCue | null,
  rand = Math.random()
): IdleCue {
  const pool: IdleCue[] = ["talk", "text", "glance"]
  const candidates = lastCue ? pool.filter((c) => c !== lastCue) : pool
  const idx = Math.min(candidates.length - 1, Math.floor(rand * candidates.length))
  return candidates[idx]
}

/**
 * Computes whether the floating contact dome should be visible at the current scroll metrics.
 */
export function shouldShowContactDome(opts: {
  scrollY: number
  heroHeight: number | null
  footerInView: boolean
}): boolean {
  const pastHero =
    opts.heroHeight !== null ? opts.scrollY > opts.heroHeight - 120 : opts.scrollY > 200
  return pastHero && !opts.footerInView
}
