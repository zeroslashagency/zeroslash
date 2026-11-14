import * as THREE from "three"
import type { RibbonSpec } from "./ribbonCatalog"

export const SEG_X = 52
export const SEG_Y = 8
const ROWS = SEG_X + 1
const COLS = SEG_Y + 1

// Module-level scratch vectors to guarantee zero GC allocations per frame
const _dir = new THREE.Vector3()
const _tan = new THREE.Vector3()
const _side = new THREE.Vector3()
const _camForward = new THREE.Vector3(0, 0, 1)
const _diff = new THREE.Vector3()
const _corr = new THREE.Vector3()
const _toNode = new THREE.Vector3()

export interface RibbonSim {
  spec: RibbonSpec
  index: number
  phase: number
  segLen: number
  /** Top-edge and bottom-edge coupled Verlet rails */
  topPos: Float32Array
  topPrev: Float32Array
  topRest: Float32Array
  botPos: Float32Array
  botPrev: Float32Array
  botRest: Float32Array
  geometry: THREE.BufferGeometry
}

export interface PointerPhysicsState {
  active: boolean
  worldPos: THREE.Vector3
  worldVel: THREE.Vector3
  draggingRibbon: number
  draggingNode: number
  dragTarget: THREE.Vector3
}

/**
 * High-resolution 2D cloth grid (53 x 9 vertices per ribbon) with outward-facing +Z normals,
 * upright undistorted UVs (u=0 left tip -> u=1 right anchor, v=0 bottom -> v=1 top).
 */
function createRibbonGeometry(): THREE.BufferGeometry {
  const vertexCount = ROWS * COLS
  const positions = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)
  const uvs = new Float32Array(vertexCount * 2)

  for (let i = 0; i < ROWS; i++) {
    const u = 1 - i / SEG_X
    for (let c = 0; c < COLS; c++) {
      const idx = i * COLS + c
      const v = c / SEG_Y
      uvs[idx * 2] = u
      uvs[idx * 2 + 1] = v
      normals[idx * 3] = 0
      normals[idx * 3 + 1] = 0
      normals[idx * 3 + 2] = 1
    }
  }

  const indices: number[] = []
  for (let i = 0; i < SEG_X; i++) {
    const r0 = i * COLS
    const r1 = (i + 1) * COLS
    for (let c = 0; c < SEG_Y; c++) {
      // +Z front-facing CCW winding
      indices.push(r1 + c, r0 + c, r0 + c + 1)
      indices.push(r1 + c, r0 + c + 1, r1 + c + 1)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3))
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  return geometry
}

export function createRibbonSim(spec: RibbonSpec, index: number): RibbonSim {
  const topPos = new Float32Array(ROWS * 3)
  const topPrev = new Float32Array(ROWS * 3)
  const topRest = new Float32Array(ROWS * 3)
  const botPos = new Float32Array(ROWS * 3)
  const botPrev = new Float32Array(ROWS * 3)
  const botRest = new Float32Array(ROWS * 3)

  _dir.set(spec.restDir[0], spec.restDir[1], 0).normalize()
  _side.crossVectors(_dir, _camForward).normalize()
  const halfW = spec.width * 0.5
  const segLen = spec.length / SEG_X

  // Smooth S-curve cascade drape from right off-screen anchor toward lower-left
  for (let i = 0; i < ROWS; i++) {
    const t = i / SEG_X
    const dist = i * segLen

    // Natural graceful S-curve drape: gently undulating fabric arch from right off-screen to lower-left
    const drapeY =
      Math.sin(t * Math.PI * 1.15) * 0.32 -
      t * t * 0.36 +
      Math.sin(t * Math.PI * 2.4 + index * 0.55) * 0.14
    const zWave = Math.sin(t * Math.PI * 1.6 + index * 0.9) * 0.045

    const cx = spec.anchor[0] + _dir.x * dist
    const cy = spec.anchor[1] + _dir.y * dist + drapeY
    const cz = spec.anchor[2] + zWave

    const twist = spec.baseTwist * (0.35 + 0.65 * t)
    const sx = _side.x * Math.cos(twist)
    const sy = _side.y * Math.cos(twist)
    const sz = Math.sin(twist) * 0.16

    const o = i * 3
    topPos[o] = topPrev[o] = topRest[o] = cx + sx * halfW
    topPos[o + 1] = topPrev[o + 1] = topRest[o + 1] = cy + sy * halfW
    topPos[o + 2] = topPrev[o + 2] = topRest[o + 2] = cz + sz * halfW

    botPos[o] = botPrev[o] = botRest[o] = cx - sx * halfW
    botPos[o + 1] = botPrev[o + 1] = botRest[o + 1] = cy - sy * halfW
    botPos[o + 2] = botPrev[o + 2] = botRest[o + 2] = cz - sz * halfW
  }

  const geometry = createRibbonGeometry()
  const sim: RibbonSim = {
    spec,
    index,
    phase: index * 0.85 + 0.3,
    segLen,
    topPos,
    topPrev,
    topRest,
    botPos,
    botPrev,
    botRest,
    geometry,
  }
  syncRibbonGeometry(sim, 0)
  return sim
}

function solveRailStep(
  pos: Float32Array,
  prev: Float32Array,
  rest: Float32Array,
  segLen: number,
  phase: number,
  edgePhaseOffset: number,
  anchorZ: number,
  isDraggedRibbon: boolean,
  draggingNode: number,
  dragTarget: THREE.Vector3,
  railOffsetY: number,
  pointer: PointerPhysicsState,
  elapsed: number,
  dtSq: number,
) {
  for (let i = 1; i < ROWS; i++) {
    const o = i * 3
    const t = i / SEG_X

    const px = pos[o]
    const py = pos[o + 1]
    const pz = pos[o + 2]

    const vx = (px - prev[o]) * 0.94
    const vy = (py - prev[o + 1]) * 0.94
    const vz = (pz - prev[o + 2]) * 0.94

    prev[o] = px
    prev[o + 1] = py
    prev[o + 2] = pz

    // Traveling flag breeze (Anchor u=1 -> Tip u=0) with independent edge flutter
    const mobility = 0.14 + 0.86 * Math.pow(t, 1.55)
    const waveArg = elapsed * 2.15 - (1 - t) * 4.8 + phase + edgePhaseOffset
    const gustArg = elapsed * 0.85 + phase * 1.4 + t * 2.1

    const windX = Math.sin(gustArg) * 0.24
    const windY = Math.sin(waveArg) * 0.72 + Math.cos(gustArg * 1.3) * 0.34
    const windZ = Math.cos(waveArg * 1.15) * 0.22

    const guideStiff = isDraggedRibbon ? 5.2 : 16.5
    const ax = (rest[o] - px) * guideStiff + windX * mobility
    const ay = (rest[o + 1] - py) * guideStiff + windY * mobility - 0.18 * mobility
    const az = (rest[o + 2] - pz) * guideStiff + windZ * mobility

    let nx = px + vx + ax * dtSq
    let ny = py + vy + ay * dtSq
    let nz = pz + vz + az * dtSq

    // Hover push force (screen-plane cursor repulsion)
    if (pointer.active && pointer.draggingRibbon === -1) {
      _toNode.set(nx - pointer.worldPos.x, ny - pointer.worldPos.y, 0)
      const dist = _toNode.length()
      const radius = 1.85
      if (dist < radius && dist > 0.0001) {
        const falloff = 1 - dist / radius
        const push = (0.042 + Math.min(pointer.worldVel.length() * 0.012, 0.08)) * falloff * falloff
        _toNode.divideScalar(dist)
        nx += _toNode.x * push
        ny += _toNode.y * push
      }
    }

    // Clamp Z excursion strictly within layer lane so neighboring ribbons never intersect
    const zDelta = nz - rest[o + 2]
    if (zDelta > 0.036) nz = rest[o + 2] + 0.036
    else if (zDelta < -0.036) nz = rest[o + 2] - 0.036
    void anchorZ

    pos[o] = nx
    pos[o + 1] = ny
    pos[o + 2] = nz
  }

  // Smooth bell-curve pointer drag across neighboring cloth nodes (prevents sharp single-vertex pinch)
  if (isDraggedRibbon && draggingNode > 0 && draggingNode < ROWS) {
    const dragO = draggingNode * 3
    const dx = dragTarget.x - pos[dragO]
    const dy = dragTarget.y + railOffsetY - pos[dragO + 1]
    const dragRadius = 9
    const iStart = Math.max(1, draggingNode - dragRadius)
    const iEnd = Math.min(SEG_X, draggingNode + dragRadius)
    for (let i = iStart; i <= iEnd; i++) {
      const dist = Math.abs(i - draggingNode)
      const w = Math.pow(Math.cos((dist / (dragRadius + 1)) * Math.PI * 0.5), 1.45)
      const o = i * 3
      const pull = 0.38 * w
      pos[o] += dx * pull
      pos[o + 1] += dy * pull
    }
  }

  // Structural length constraints interleaved with mild longitudinal bending stiffness for silky cloth curvature
  for (let iter = 0; iter < 6; iter++) {
    pos[0] = rest[0]
    pos[1] = rest[1]
    pos[2] = rest[2]

    if (iter < 3) {
      const bend = isDraggedRibbon ? 0.16 : 0.09
      for (let i = 1; i < SEG_X; i++) {
        const o = i * 3
        const p = (i - 1) * 3
        const n = (i + 1) * 3
        pos[o] += ((pos[p] + pos[n]) * 0.5 - pos[o]) * bend
        pos[o + 1] += ((pos[p + 1] + pos[n + 1]) * 0.5 - pos[o + 1]) * bend
        pos[o + 2] += ((pos[p + 2] + pos[n + 2]) * 0.5 - pos[o + 2]) * bend
      }
    }

    for (let i = 0; i < SEG_X; i++) {
      const o0 = i * 3
      const o1 = (i + 1) * 3
      _diff.set(pos[o1] - pos[o0], pos[o1 + 1] - pos[o0 + 1], pos[o1 + 2] - pos[o0 + 2])
      const dist = _diff.length()
      if (dist > 0.00001) {
        const factor = (dist - segLen) / dist
        _corr.copy(_diff).multiplyScalar(factor)
        if (i === 0) {
          pos[o1] -= _corr.x
          pos[o1 + 1] -= _corr.y
          pos[o1 + 2] -= _corr.z
        } else {
          pos[o0] += _corr.x * 0.5
          pos[o0 + 1] += _corr.y * 0.5
          pos[o0 + 2] += _corr.z * 0.5
          pos[o1] -= _corr.x * 0.5
          pos[o1 + 1] -= _corr.y * 0.5
          pos[o1 + 2] -= _corr.z * 0.5
        }
      }
    }
  }
}

export function stepRibbonPhysics(
  sims: RibbonSim[],
  pointer: PointerPhysicsState,
  elapsed: number,
  dt: number,
  reducedMotion: boolean,
) {
  const safeDt = Math.min(dt, 0.033)
  const dtSq = safeDt * safeDt

  for (let s = 0; s < sims.length; s++) {
    const sim = sims[s]
    const { topPos, topPrev, topRest, botPos, botPrev, botRest, segLen, phase, spec } = sim

    if (reducedMotion) {
      topPos.set(topRest)
      topPrev.set(topRest)
      botPos.set(botRest)
      botPrev.set(botRest)
      syncRibbonGeometry(sim, 0)
      continue
    }

    const isDragged = pointer.draggingRibbon === s
    const halfW = spec.width * 0.5

    solveRailStep(
      topPos,
      topPrev,
      topRest,
      segLen,
      phase,
      0.0,
      spec.anchor[2],
      isDragged,
      pointer.draggingNode,
      pointer.dragTarget,
      halfW * 0.9,
      pointer,
      elapsed,
      dtSq,
    )
    solveRailStep(
      botPos,
      botPrev,
      botRest,
      segLen,
      phase,
      0.7,
      spec.anchor[2],
      isDragged,
      pointer.draggingNode,
      pointer.dragTarget,
      -halfW * 0.9,
      pointer,
      elapsed,
      dtSq,
    )

    // Cross-width spring constraint keeping ribbon width true while allowing subtle twist
    for (let i = 1; i < ROWS; i++) {
      const o = i * 3
      _diff.set(topPos[o] - botPos[o], topPos[o + 1] - botPos[o + 1], topPos[o + 2] - botPos[o + 2])
      const dist = _diff.length()
      if (dist > 0.0001) {
        const factor = ((dist - spec.width) / dist) * 0.45
        _corr.copy(_diff).multiplyScalar(factor)
        topPos[o] -= _corr.x
        topPos[o + 1] -= _corr.y
        topPos[o + 2] -= _corr.z
        botPos[o] += _corr.x
        botPos[o + 1] += _corr.y
        botPos[o + 2] += _corr.z
      }
    }

    syncRibbonGeometry(sim, elapsed)
  }
}

function syncRibbonGeometry(sim: RibbonSim, elapsed: number) {
  const { topPos, botPos, spec, geometry, phase } = sim
  const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute
  const arr = posAttr.array as Float32Array
  const notchDepth = spec.width * 0.52
  const notchStartRow = SEG_X - 4

  for (let i = 0; i < ROWS; i++) {
    const o = i * 3
    const t = i / SEG_X

    const bx = botPos[o]
    const by = botPos[o + 1]
    const bz = botPos[o + 2]
    const tx = topPos[o]
    const ty = topPos[o + 1]
    const tz = topPos[o + 2]

    // Tangent direction along centerline for the swallowtail notch cutout
    if (i === 0) {
      _tan.set(
        (topPos[3] + botPos[3] - tx - bx) * 0.5,
        (topPos[4] + botPos[4] - ty - by) * 0.5,
        (topPos[5] + botPos[5] - tz - bz) * 0.5,
      )
    } else {
      const p = (i - 1) * 3
      _tan.set(
        (tx + bx - topPos[p] - botPos[p]) * 0.5,
        (ty + by - topPos[p + 1] - botPos[p + 1]) * 0.5,
        (tz + bz - topPos[p + 2] - botPos[p + 2]) * 0.5,
      )
    }
    _tan.normalize()

    const tipFold = Math.pow(t, 1.35)
    const camberTaper = t < 0.88 ? 1 : 1 - (t - 0.88) / 0.12
    const notchRowBlend = i > notchStartRow ? (i - notchStartRow) / (SEG_X - notchStartRow) : 0

    for (let c = 0; c < COLS; c++) {
      const v = c / SEG_Y
      const idx = (i * COLS + c) * 3

      // Smooth interpolation between bottom edge (v=0) and top edge (v=1)
      let x = bx + (tx - bx) * v
      let y = by + (ty - by) * v
      let z = bz + (tz - bz) * v

      // Pillowed fabric camber across width + diagonal cloth ripple waves (tapered flat at swallowtail tip)
      const arch = Math.sin(v * Math.PI) * spec.camber * camberTaper
      const clothFold =
        Math.sin(t * 11.5 - elapsed * 2.2 + phase + v * 2.8) * 0.03 * (0.15 + 0.85 * tipFold)
      z += arch + clothFold

      // Clean non-folding 3D swallowtail V-cut notch graduated across the last 4 segments
      if (notchRowBlend > 0) {
        const vDistFromCenter = 1 - Math.abs(v * 2 - 1) // 0 at outer edges, 1 at center apex
        const pullBack = vDistFromCenter * notchDepth * notchRowBlend
        x -= _tan.x * pullBack
        y -= _tan.y * pullBack
        z -= _tan.z * pullBack
      }

      arr[idx] = x
      arr[idx + 1] = y
      arr[idx + 2] = z
    }
  }

  posAttr.needsUpdate = true
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
}
