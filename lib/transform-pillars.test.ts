import test from "node:test"
import assert from "node:assert/strict"
import {
  TRANSFORM_PILLARS,
  computeCardTilt,
  findPillarById,
  getAdjacentPillarId,
  NEUTRAL_TILT,
} from "./transform-pillars"

test("computeCardTilt returns neutral tilt when reducedMotion is enabled", () => {
  const tilt = computeCardTilt({
    clientX: 100,
    clientY: 20,
    rect: { left: 0, top: 0, width: 300, height: 400 },
    reducedMotion: true,
  })
  assert.deepEqual(tilt, NEUTRAL_TILT)
})

test("computeCardTilt clamps pointer outside card bounds to maxDeg", () => {
  const tilt = computeCardTilt({
    clientX: 900,
    clientY: -100,
    rect: { left: 100, top: 100, width: 300, height: 400 },
    maxDeg: 6,
  })
  assert.equal(tilt.rotateY, 6)
  assert.equal(tilt.rotateX, 6)
  assert.equal(tilt.glowX, 100)
  assert.equal(tilt.glowY, 0)
})

test("computeCardTilt stays centered when pointer sits in the exact middle", () => {
  const tilt = computeCardTilt({
    clientX: 250,
    clientY: 300,
    rect: { left: 100, top: 100, width: 300, height: 400 },
    maxDeg: 5.5,
  })
  assert.equal(tilt.rotateX, 0)
  assert.equal(tilt.rotateY, 0)
  assert.equal(tilt.glowX, 50)
  assert.equal(tilt.glowY, 50)
})

test("findPillarById and getAdjacentPillarId navigate predictably across pillars", () => {
  assert.equal(TRANSFORM_PILLARS.length, 3)
  assert.equal(findPillarById("build")?.title, "Build")
  assert.equal(findPillarById(null), null)
  assert.equal(getAdjacentPillarId("design", 1), "build")
  assert.equal(getAdjacentPillarId("grow", 1), "design")
  assert.equal(getAdjacentPillarId("design", -1), "grow")
})
