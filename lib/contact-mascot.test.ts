import test from "node:test"
import assert from "node:assert/strict"
import {
  computeScrollGaze,
  MAX_GAZE_OFFSET_PX,
  pickNextIdleCue,
  resolveContactDisplay,
  resolveMascotMood,
  shouldShowContactDome,
} from "./contact-mascot"

test("computeScrollGaze clamps downward and upward gaze and respects reduced motion", () => {
  assert.equal(computeScrollGaze(0), 0)
  assert.equal(computeScrollGaze(0.2), 0)
  assert.equal(computeScrollGaze(80), MAX_GAZE_OFFSET_PX)
  assert.equal(computeScrollGaze(-80), -MAX_GAZE_OFFSET_PX)
  assert.ok(computeScrollGaze(10) > 0 && computeScrollGaze(10) < MAX_GAZE_OFFSET_PX)
  assert.equal(computeScrollGaze(50, true), 0)
})

test("resolveMascotMood prioritizes hover/focus wink over idle talking", () => {
  assert.equal(
    resolveMascotMood({ hovered: true, focused: false, talkPhase: 2 }),
    "wink"
  )
  assert.equal(
    resolveMascotMood({ hovered: false, focused: true, talkPhase: 0 }),
    "wink"
  )
  assert.equal(
    resolveMascotMood({ hovered: false, focused: false, talkPhase: 2 }),
    "talk"
  )
  assert.equal(
    resolveMascotMood({ hovered: false, focused: false, talkPhase: 0 }),
    "idle"
  )
  assert.equal(
    resolveMascotMood({
      hovered: false,
      focused: false,
      talkPhase: 2,
      reducedMotion: true,
    }),
    "idle"
  )
})

test("resolveContactDisplay keeps face and text mutually exclusive", () => {
  assert.equal(
    resolveContactDisplay({ hovered: false, focused: false, showTextPhase: false }),
    "face"
  )
  assert.equal(
    resolveContactDisplay({ hovered: false, focused: false, showTextPhase: true }),
    "text"
  )
  assert.equal(
    resolveContactDisplay({ hovered: true, focused: false, showTextPhase: true }),
    "face"
  )
  assert.equal(
    resolveContactDisplay({
      hovered: false,
      focused: false,
      showTextPhase: false,
      reducedMotion: true,
    }),
    "text"
  )
})

test("pickNextIdleCue never repeats the immediate previous cue", () => {
  for (const prev of ["talk", "text", "glance"] as const) {
    for (const r of [0, 0.25, 0.5, 0.75, 0.99]) {
      const next = pickNextIdleCue(prev, r)
      assert.notEqual(next, prev)
    }
  }
})

test("shouldShowContactDome shows past hero and hides when footer is visible", () => {
  assert.equal(
    shouldShowContactDome({ scrollY: 400, heroHeight: 900, footerInView: false }),
    false
  )
  assert.equal(
    shouldShowContactDome({ scrollY: 820, heroHeight: 900, footerInView: false }),
    true
  )
  assert.equal(
    shouldShowContactDome({ scrollY: 3200, heroHeight: 900, footerInView: true }),
    false
  )
})
