"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import {
  RIBBON_SPECS,
  createFabricNormalTexture,
  createRibbonTexture,
} from "./ribbonCatalog"
import {
  SEG_X,
  createRibbonSim,
  stepRibbonPhysics,
  type PointerPhysicsState,
  type RibbonSim,
} from "./ribbonPhysics"

interface BrandRibbonsStageProps {
  onWebglFallback?: () => void
}

const _raycaster = new THREE.Raycaster()
const _ndc = new THREE.Vector2()
const _dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
const _hitPoint = new THREE.Vector3()
const _prevWorld = new THREE.Vector3()

function detectSoftwareGl(): boolean {
  try {
    const probe = document.createElement("canvas")
    const gl = probe.getContext("webgl2")
    if (!gl) return true
    const ext = gl.getExtension("WEBGL_debug_renderer_info")
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER
    const gpu = String(gl.getParameter(param) || "")
    gl.getExtension("WEBGL_lose_context")?.loseContext()
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu)
  } catch {
    return true
  }
}

export default function BrandRibbonsStage({ onWebglFallback }: BrandRibbonsStageProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const fallbackRef = useRef(onWebglFallback)
  fallbackRef.current = onWebglFallback

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const isSoftwareGl = detectSoftwareGl()

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: "high-performance",
      })
    } catch {
      fallbackRef.current?.()
      return
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NeutralToneMapping
    renderer.toneMappingExposure = 0.98
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2))
    renderer.shadowMap.enabled = !isSoftwareGl
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    renderer.domElement.style.display = "block"
    renderer.domElement.style.touchAction = "pan-y"

    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 16 / 10, 0.5, 45)
    camera.position.set(-0.15, 0.12, 11.4)
    camera.lookAt(-0.15, 0.12, 0)

    // Subtle procedural studio reflections (low intensity to keep brand colors true and vivid)
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const envRT = pmremGenerator.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envRT.texture
    pmremGenerator.dispose()

    // Balanced studio lighting for tactile fabric folds without washing out pigments
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.36)
    scene.add(ambientLight)

    const hemiLight = new THREE.HemisphereLight(0xfcfcff, 0xcac6be, 0.42)
    scene.add(hemiLight)

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.25)
    keyLight.position.set(-4.5, 8.0, 10.0)
    keyLight.castShadow = !isSoftwareGl
    keyLight.shadow.mapSize.set(2048, 2048)
    keyLight.shadow.camera.near = 2
    keyLight.shadow.camera.far = 30
    keyLight.shadow.camera.left = -10
    keyLight.shadow.camera.right = 11
    keyLight.shadow.camera.top = 7
    keyLight.shadow.camera.bottom = -7
    keyLight.shadow.bias = -0.0005
    keyLight.shadow.normalBias = 0.02
    keyLight.shadow.radius = 3.5
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xeef4ff, 0.42)
    rimLight.position.set(6.5, -3.0, 5.5)
    scene.add(rimLight)

    // Studio backdrop plane catching soft fabric shadows from foreground ribbons
    const shadowCatcherGeo = new THREE.PlaneGeometry(34, 22)
    const shadowCatcherMat = new THREE.ShadowMaterial({ opacity: 0.12 })
    const shadowCatcher = new THREE.Mesh(shadowCatcherGeo, shadowCatcherMat)
    shadowCatcher.position.set(0, 0, -1.45)
    shadowCatcher.receiveShadow = true
    scene.add(shadowCatcher)

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
    const fabricNormalMap = createFabricNormalTexture()
    const sims: RibbonSim[] = []
    const meshes: THREE.Mesh[] = []
    const materials: THREE.MeshPhysicalMaterial[] = []
    const textures: THREE.CanvasTexture[] = []

    const ribbonGroup = new THREE.Group()
    scene.add(ribbonGroup)

    let needsImmediatePaint = false
    let paintQueued = false
    let disposed = false
    let contextLost = false
    const onLogoLoaded = () => {
      needsImmediatePaint = true
      if (!paintQueued && !disposed && !contextLost) {
        paintQueued = true
        requestAnimationFrame(() => {
          paintQueued = false
          if (!disposed && !contextLost) {
            renderer.render(scene, camera)
          }
        })
      }
    }

    RIBBON_SPECS.forEach((spec, idx) => {
      const sim = createRibbonSim(spec, idx)
      const texture = createRibbonTexture(spec, maxAnisotropy, onLogoLoaded)
      const isSatin = spec.finish === "satin"

      const material = new THREE.MeshPhysicalMaterial({
        map: texture,
        normalMap: fabricNormalMap,
        normalScale: new THREE.Vector2(isSatin ? 0.16 : 0.28, isSatin ? 0.16 : 0.28),
        side: THREE.DoubleSide,
        roughness: isSatin ? 0.42 : 0.72,
        metalness: 0.02,
        sheen: isSatin ? 0.42 : 0.22,
        sheenRoughness: isSatin ? 0.45 : 0.75,
        sheenColor: new THREE.Color(spec.color).lerp(new THREE.Color(0xffffff), 0.3),
        clearcoat: isSatin ? 0.08 : 0.0,
        clearcoatRoughness: 0.38,
        envMapIntensity: isSatin ? 0.2 : 0.1,
      })

      const mesh = new THREE.Mesh(sim.geometry, material)
      mesh.castShadow = !isSoftwareGl
      mesh.receiveShadow = !isSoftwareGl
      mesh.userData.ribbonIndex = idx
      mesh.frustumCulled = false

      ribbonGroup.add(mesh)
      sims.push(sim)
      meshes.push(mesh)
      materials.push(material)
      textures.push(texture)
    })

    if (!isSoftwareGl) {
      renderer.compile(scene, camera)
    }

    const pointerState: PointerPhysicsState = {
      active: false,
      worldPos: new THREE.Vector3(99, 99, 0),
      worldVel: new THREE.Vector3(),
      draggingRibbon: -1,
      draggingNode: -1,
      dragTarget: new THREE.Vector3(),
    }

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    let reducedMotion = reducedMotionQuery.matches
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotion = e.matches
    }
    reducedMotionQuery.addEventListener("change", handleMotionChange)

    let lastW = 0
    let lastH = 0
    let lastBaseH = 0
    let resizeRaf = 0

    const updateSize = () => {
      if (disposed) return
      const rect = container.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      const sectionRect = container.closest("section")?.getBoundingClientRect()
      const baseH = Math.max(1, Math.floor(sectionRect?.height || h))
      if (w === lastW && h === lastH && baseH === lastBaseH) return
      lastW = w
      lastH = h
      lastBaseH = baseH
      camera.aspect = w / baseH
      const narrowBoost = w < 640 ? 4.4 : w < 960 ? 1.8 : 0
      camera.position.z = 11.4 + narrowBoost
      camera.position.x = w < 640 ? 1.35 : -0.15
      camera.position.y = w < 640 ? -0.78 : 0.12
      camera.lookAt(camera.position.x, camera.position.y, 0)
      if (h > baseH) {
        camera.setViewOffset(w, baseH, 0, 0, w, h)
      } else {
        camera.clearViewOffset()
      }
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    }
    updateSize()

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(updateSize)
    })
    ro.observe(container)

    const updateNdc = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect()
      _ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1
      _ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1
    }

    const onPointerMove = (e: PointerEvent) => {
      updateNdc(e.clientX, e.clientY)
      _raycaster.setFromCamera(_ndc, camera)
      if (_raycaster.ray.intersectPlane(_dragPlane, _hitPoint)) {
        if (pointerState.active) {
          _prevWorld.copy(pointerState.worldPos)
          pointerState.worldVel.subVectors(_hitPoint, _prevWorld).multiplyScalar(18)
        } else {
          pointerState.worldVel.set(0, 0, 0)
        }
        pointerState.worldPos.copy(_hitPoint)
        pointerState.active = true
        if (pointerState.draggingRibbon !== -1) {
          pointerState.dragTarget.copy(_hitPoint)
        }
      }

      if (pointerState.draggingRibbon === -1) {
        const hits = _raycaster.intersectObjects(meshes, false)
        renderer.domElement.style.cursor = hits.length > 0 ? "grab" : "default"
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      if (reducedMotion) return
      updateNdc(e.clientX, e.clientY)
      _raycaster.setFromCamera(_ndc, camera)
      const hits = _raycaster.intersectObjects(meshes, false)
      if (hits.length > 0) {
        const hit = hits[0]
        const rIdx = hit.object.userData.ribbonIndex as number
        const uvX = hit.uv?.x ?? 0.5
        const nodeIdx = THREE.MathUtils.clamp(Math.round((1 - uvX) * SEG_X), 2, SEG_X)
        pointerState.draggingRibbon = rIdx
        pointerState.draggingNode = nodeIdx
        pointerState.dragTarget.copy(hit.point)
        pointerState.active = true
        renderer.domElement.style.cursor = "grabbing"
        renderer.domElement.setPointerCapture?.(e.pointerId)
      }
    }

    const releaseDrag = (e?: PointerEvent) => {
      if (pointerState.draggingRibbon !== -1) {
        pointerState.draggingRibbon = -1
        pointerState.draggingNode = -1
        renderer.domElement.style.cursor = "grab"
        if (e) {
          try {
            renderer.domElement.releasePointerCapture?.(e.pointerId)
          } catch {
            // ignore
          }
        }
      }
    }

    const onPointerLeave = () => {
      pointerState.active = false
      pointerState.worldVel.set(0, 0, 0)
      if (pointerState.draggingRibbon === -1) {
        renderer.domElement.style.cursor = "default"
      }
    }

    const canvas = renderer.domElement
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointerup", releaseDrag)
    canvas.addEventListener("pointercancel", releaseDrag)
    canvas.addEventListener("pointerleave", onPointerLeave)

    const onContextLost = (e: Event) => {
      e.preventDefault()
      contextLost = true
    }
    const onContextRestored = () => {
      contextLost = false
    }
    canvas.addEventListener("webglcontextlost", onContextLost)
    canvas.addEventListener("webglcontextrestored", onContextRestored)

    let visible = true
    let frameId = 0
    const startTime = performance.now()
    let lastTime = startTime

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext
      if (typeof gl.fenceSync !== "function") {
        frameId = window.setTimeout(cb, 80)
        return
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0)
      gl.flush()
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync)
          return
        }
        const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5)
        } else {
          if (sync) gl.deleteSync(sync)
          frameId = window.setTimeout(cb, 80)
        }
      }
      frameId = window.setTimeout(poll, 5)
    }

    const tick = () => {
      if (disposed) return
      const now = performance.now()
      const dt = (now - lastTime) / 1000
      lastTime = now
      const elapsed = (now - startTime) / 1000

      if ((visible || needsImmediatePaint) && !contextLost) {
        needsImmediatePaint = false
        pointerState.worldVel.multiplyScalar(0.82)
        stepRibbonPhysics(sims, pointerState, elapsed, dt || 0.016, reducedMotion)
        renderer.render(scene, camera)
      }

      if (isSoftwareGl) {
        afterDraw(tick)
      } else {
        frameId = requestAnimationFrame(tick)
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = visible
        visible = entry.isIntersecting
        if (!wasVisible && visible) {
          lastTime = performance.now()
        }
      },
      { threshold: 0.02 },
    )
    io.observe(container)

    stepRibbonPhysics(sims, pointerState, 0, 0.016, reducedMotion)
    renderer.render(scene, camera)
    if (isSoftwareGl) {
      afterDraw(tick)
    } else {
      frameId = requestAnimationFrame(tick)
    }

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      cancelAnimationFrame(resizeRaf)
      clearTimeout(frameId)
      io.disconnect()
      ro.disconnect()
      reducedMotionQuery.removeEventListener("change", handleMotionChange)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointerup", releaseDrag)
      canvas.removeEventListener("pointercancel", releaseDrag)
      canvas.removeEventListener("pointerleave", onPointerLeave)
      canvas.removeEventListener("webglcontextlost", onContextLost)
      canvas.removeEventListener("webglcontextrestored", onContextRestored)

      sims.forEach((s) => s.geometry.dispose())
      materials.forEach((m) => m.dispose())
      textures.forEach((t) => t.dispose())
      fabricNormalMap.dispose()
      shadowCatcherGeo.dispose()
      shadowCatcherMat.dispose()
      envRT.dispose()
      renderer.dispose()
      if (canvas.parentElement === container) {
        container.removeChild(canvas)
      }
    }
  }, [])

  return <div ref={mountRef} className="w-full h-full" />
}
