"use client"

import { useEffect, useRef, useState } from "react"

export default function Flower3D({ color }: { color: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const colorRef = useRef(color)
  const updateColorRef = useRef<((color: string) => void) | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    colorRef.current = color
    updateColorRef.current?.(color)
  }, [color])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let disposed = false
    let cleanup = () => {}

    void import("three").then((THREE) => {
      if (disposed) return
      let renderer: InstanceType<typeof THREE.WebGLRenderer>
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" })
      } catch {
        setFailed(true)
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setClearColor(0x000000, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.3
      host.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30)
      camera.position.set(0, 0.15, 7.5)
      camera.lookAt(0, 0.15, 0)
      scene.add(new THREE.HemisphereLight(0xffffff, 0x65735d, 2.2))
      const light = new THREE.DirectionalLight(0xfff4e6, 3)
      light.position.set(-3, 5, 5)
      scene.add(light)
      const fill = new THREE.DirectionalLight(0xdedbff, 1.5)
      fill.position.set(3, 1, -2)
      scene.add(fill)

      const flower = new THREE.Group()
      scene.add(flower)
      const petals = new THREE.MeshPhysicalMaterial({ color: colorRef.current, roughness: 0.48, metalness: 0, clearcoat: 0.18, side: THREE.DoubleSide })
      const foliage = new THREE.MeshStandardMaterial({ color: "#62745b", roughness: 0.75, side: THREE.DoubleSide })
      const heart = new THREE.MeshStandardMaterial({ color: "#d6bf72", roughness: 0.7 })
      const target = new THREE.Color(colorRef.current)

      // A tapered surface with a cupped centre and gently curled edges.
      function petalGeometry(length: number, width: number, bend: number) {
        const positions: number[] = []
        const indices: number[] = []
        const rows = 24
        const columns = 12
        for (let row = 0; row <= rows; row++) {
          const t = row / rows
          const spread = Math.pow(Math.sin(Math.PI * t), 0.7) * width
          for (let column = 0; column <= columns; column++) {
            const s = column / columns * 2 - 1
            positions.push(s * spread, t * length, bend * Math.sin(t * Math.PI * 0.85) + s * s * 0.15 * Math.sin(Math.PI * t))
          }
        }
        for (let row = 0; row < rows; row++) {
          for (let column = 0; column < columns; column++) {
            const a = row * (columns + 1) + column
            const b = a + columns + 1
            indices.push(a, b, a + 1, b, b + 1, a + 1)
          }
        }
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
        geometry.setIndex(indices)
        geometry.computeVertexNormals()
        return geometry
      }

      const bloom = new THREE.Group()
      bloom.position.set(0.1, 0.8, 0)
      bloom.rotation.set(-0.12, -0.16, 0.12)
      flower.add(bloom)
      const outerGeometry = petalGeometry(1.12, 0.43, 0.3)
      const innerGeometry = petalGeometry(0.76, 0.29, 0.36)
      for (let ring = 0; ring < 2; ring++) {
        const count = ring === 0 ? 7 : 6
        for (let index = 0; index < count; index++) {
          const petal = new THREE.Mesh(ring === 0 ? outerGeometry : innerGeometry, petals)
          petal.rotation.z = index / count * Math.PI * 2 + ring * 0.42
          petal.position.z = ring * 0.12
          bloom.add(petal)
        }
      }
      const centre = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 16), heart)
      centre.scale.z = 0.6
      centre.position.z = 0.27
      bloom.add(centre)
      const pollenGeometry = new THREE.SphereGeometry(0.034, 8, 6)
      for (let index = 0; index < 28; index++) {
        const angle = index * 2.39996
        const radius = Math.sqrt(index / 28) * 0.16
        const pollen = new THREE.Mesh(pollenGeometry, heart)
        pollen.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.36 + (1 - radius / 0.16) * 0.03)
        bloom.add(pollen)
      }
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.16, -1.75, -0.05),
        new THREE.Vector3(-0.08, -0.9, -0.04),
        new THREE.Vector3(0.07, 0, -0.04),
        new THREE.Vector3(0.1, 0.8, 0),
      ])
      flower.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 40, 0.035, 8, false), foliage))
      const leafGeometry = petalGeometry(0.94, 0.22, 0.13)
      const leftLeaf = new THREE.Mesh(leafGeometry, foliage)
      leftLeaf.position.set(-0.04, -0.65, -0.03)
      leftLeaf.rotation.set(0.1, -0.2, 0.95)
      flower.add(leftLeaf)
      const rightLeaf = new THREE.Mesh(leafGeometry, foliage)
      rightLeaf.position.set(-0.1, -1.03, -0.02)
      rightLeaf.rotation.set(-0.15, 0.3, -0.95)
      rightLeaf.scale.setScalar(0.82)
      flower.add(rightLeaf)

      const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
      let visible = false
      let contextUnavailable = false
      let frame = 0
      let elapsed = 0
      let lastTime = 0
      let pointerX = 0
      let pointerY = 0
      function render(time: number) {
        frame = 0
        if (!visible || document.hidden || disposed || contextUnavailable) return
        if (!motion.matches) {
          elapsed += lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0
          flower.rotation.y += (pointerX * 0.13 - flower.rotation.y) * 0.035
          flower.rotation.x += (-pointerY * 0.07 - flower.rotation.x) * 0.035
          flower.rotation.z = Math.sin(elapsed * 0.65) * 0.018
          petals.color.lerp(target, 0.055)
        }
        lastTime = time
        renderer.render(scene, camera)
        if (!motion.matches) frame = requestAnimationFrame(render)
      }
      function requestRender() {
        if (frame || !visible || document.hidden || disposed || contextUnavailable) return
        lastTime = 0
        frame = requestAnimationFrame(render)
      }
      function stop() {
        cancelAnimationFrame(frame)
        frame = 0
        lastTime = 0
      }
      function resize() {
        const { width, height } = host!.getBoundingClientRect()
        if (!width || !height) return
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
        requestRender()
      }
      updateColorRef.current = (nextColor) => {
        target.set(nextColor)
        if (motion.matches) petals.color.copy(target)
        requestRender()
      }
      function onPointerMove(event: PointerEvent) {
        if (motion.matches || event.pointerType !== "mouse") return
        const bounds = host!.getBoundingClientRect()
        pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
        pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      }
      function resetPointer() { pointerX = 0; pointerY = 0 }
      function visibilityChange() { if (document.hidden) stop(); else requestRender() }
      function motionChange() {
        stop()
        if (motion.matches) {
          flower.rotation.set(0, 0, 0)
          petals.color.copy(target)
        }
        requestRender()
      }
      function contextLost(event: Event) {
        event.preventDefault()
        contextUnavailable = true
        stop()
        setFailed(true)
      }
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible) requestRender(); else stop()
      })
      observer.observe(host)
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(host)
      host.addEventListener("pointermove", onPointerMove)
      host.addEventListener("pointerleave", resetPointer)
      renderer.domElement.addEventListener("webglcontextlost", contextLost)
      document.addEventListener("visibilitychange", visibilityChange)
      motion.addEventListener("change", motionChange)
      resize()

      cleanup = () => {
        stop()
        observer.disconnect()
        resizeObserver.disconnect()
        host.removeEventListener("pointermove", onPointerMove)
        host.removeEventListener("pointerleave", resetPointer)
        renderer.domElement.removeEventListener("webglcontextlost", contextLost)
        document.removeEventListener("visibilitychange", visibilityChange)
        motion.removeEventListener("change", motionChange)
        updateColorRef.current = null
        const geometries = new Set<InstanceType<typeof THREE.BufferGeometry>>()
        scene.traverse((object) => { if (object instanceof THREE.Mesh) geometries.add(object.geometry) })
        geometries.forEach((geometry) => geometry.dispose())
        petals.dispose()
        foliage.dispose()
        heart.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    }).catch(() => { if (!disposed) setFailed(true) })

    return () => { disposed = true; cleanup() }
  }, [])

  return <div ref={hostRef} className="flora-flower" aria-hidden="true" hidden={failed} />
}
