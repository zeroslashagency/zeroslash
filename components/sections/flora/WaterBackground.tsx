"use client"

import { useEffect, useRef, useState } from "react"

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform float uAspect;
  uniform float uDark;
  uniform vec3 uColor;
  varying vec2 vUv;

  float pool(vec2 uv, vec2 centre, vec2 radius, float seed) {
    float t = uTime;
    float mobile = 1.0 - smoothstep(.65, 1.0, uAspect);
    // Each body travels as a whole, independently of its internal refraction.
    centre += vec2(sin(t * .21 + seed) * .10, cos(t * .19 + seed) * .08) * mix(1.0, .60, mobile);
    vec2 delta = uv - centre;
    float angleOfBody = sin(t * .13 + seed) * .15 * mix(1.0, uAspect, mobile);
    float c = cos(angleOfBody);
    float s = sin(angleOfBody);
    vec2 metric = delta * vec2(uAspect, 1.0);
    metric = mat2(c, -s, s, c) * metric;
    vec2 q = metric / (radius * vec2(uAspect, 1.0));
    q.y += .16 * sin(q.x * 2.5 + t * .25 + seed);
    float angle = atan(q.y, q.x);
    float boundary = 1.0 + .15 * sin(angle * 3.0 + seed + t * .18)
                         + .07 * sin(angle * 5.0 - seed - t * .21);
    float distanceToEdge = length(q) - boundary;
    float aa = max(fwidth(distanceToEdge), .002);
    return 1.0 - smoothstep(-aa, aa, distanceToEdge);
  }

  float surface(vec2 p) {
    p += vec2(sin(p.y * 2.1 + uTime * .13), cos(p.x * 1.7 - uTime * .12)) * .16;
    return sin(p.x * 3.8 + p.y * 2.5 - uTime * .46) * .48
         + sin(p.x * -2.4 + p.y * 4.7 + uTime * .36) * .26;
  }

  void main() {
    float mobile = 1.0 - smoothstep(.65, 1.0, uAspect);
    vec2 leftRadius = vec2(mix(.28, .22, mobile), .43);
    float mask = pool(vUv, vec2(.08, .51), leftRadius, .4);
    if (mask <= 0.0) discard;
    vec2 p = (vUv - .5) * vec2(min(uAspect, 1.5) * 3.0, 3.0);
    float h = surface(p);
    vec2 slope = vec2(surface(p + vec2(.018, 0.0)) - h,
                      surface(p + vec2(0.0, .018)) - h) / .018;
    vec3 normal = normalize(vec3(-slope * .32, 1.0));
    float reflection = pow(max(dot(normal, normalize(vec3(-.5, .7, 1.0))), 0.0), 7.0);
    // Open curved bands follow the refracted current rather than concentric contours.
    vec2 refracted = p + slope * .16;
    float phase = refracted.y * 5.8 + sin(refracted.x * 2.7 + uTime * .22) * 1.7
                + refracted.x * .9 - uTime * .42;
    float current = .5 + .5 * sin(phase);
    float lightBand = smoothstep(.63, .94, current);
    float darkBand = 1.0 - smoothstep(.10, .36, current);
    vec3 deep = uColor * .48;
    vec3 lightAccent = min(uColor * 1.34 + vec3(.045), vec3(.96));
    vec3 tint = mix(uColor * .90, deep, darkBand * .75);
    tint = mix(tint, lightAccent, lightBand * .88);
    tint *= .84 + normal.z * .16;
    tint = mix(tint, lightAccent, reflection * .20);
    float quiet = mix(.45, 1.0, smoothstep(.22, .64, vUv.x));
    float alpha = mask * (.40 + darkBand * .12 + lightBand * .06) * quiet * mix(1.0, .68, uDark);
    gl_FragColor = vec4(tint, alpha);
    #include <colorspace_fragment>
  }

`

export default function WaterBackground({ color }: { color: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const colorRef = useRef(color)
  const updateRef = useRef<((next: string) => void) | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    colorRef.current = color
    updateRef.current?.(color)
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
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" })
      } catch {
        setFailed(true)
        return
      }
      renderer.setClearColor(0, 0)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.domElement.style.width = "100%"
      renderer.domElement.style.height = "100%"
      renderer.domElement.style.display = "block"
      host.appendChild(renderer.domElement)
      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 2)
      camera.position.z = 1
      const target = new THREE.Color(colorRef.current)
      const uniforms = {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uDark: { value: document.documentElement.classList.contains("dark") ? 1 : 0 },
        uColor: { value: target.clone() },
      }
      const geometry = new THREE.PlaneGeometry(2, 2)
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false, depthTest: false })
      scene.add(new THREE.Mesh(geometry, material))
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
      let visible = false
      let lost = false
      let frame = 0
      let previous = 0
      let lastDraw = Number.NEGATIVE_INFINITY
      let forceDraw = false
      const frameInterval = 1000 / 30
      function render(time: number) {
        frame = 0
        if (disposed || lost || !visible || document.hidden) return
        const delta = previous ? Math.min((time - previous) / 1000, .05) : 0
        previous = time
        if (!motion.matches) {
          uniforms.uTime.value += delta
          uniforms.uColor.value.lerp(target, 1 - Math.exp(-delta * 4))
        }
        if (forceDraw || time - lastDraw >= frameInterval - .1) {
          renderer.render(scene, camera)
          // Keep cadence aligned when display refresh does not divide evenly into 30 Hz.
          lastDraw = forceDraw || !Number.isFinite(lastDraw)
            ? time
            : lastDraw + Math.floor((time - lastDraw + .1) / frameInterval) * frameInterval
          forceDraw = false
        }
        if (!motion.matches) frame = requestAnimationFrame(render)
      }
      function requestRender() {
        if (disposed || lost || !visible || document.hidden) return
        forceDraw = true
        if (frame) return
        previous = 0
        frame = requestAnimationFrame(render)
      }
      function stop() {
        cancelAnimationFrame(frame)
        frame = 0
        previous = 0
        lastDraw = Number.NEGATIVE_INFINITY
        forceDraw = false
      }
      function resize() {
        const { width, height } = host!.getBoundingClientRect()
        if (!width || !height) return
        uniforms.uAspect.value = width / height
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1))
        renderer.setSize(width, height, false)
        requestRender()
      }
      function visibilityChange() { if (document.hidden) stop(); else requestRender() }
      function motionChange() {
        stop()
        uniforms.uColor.value.copy(target)
        requestRender()
      }
      function contextLost(event: Event) {
        event.preventDefault()
        lost = true
        stop()
        setFailed(true)
      }
      updateRef.current = (next) => {
        target.set(next)
        if (motion.matches) uniforms.uColor.value.copy(target)
        requestRender()
      }
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible) requestRender(); else stop()
      })
      intersection.observe(host)
      const size = new ResizeObserver(resize)
      size.observe(host)
      const theme = new MutationObserver(() => {
        uniforms.uDark.value = document.documentElement.classList.contains("dark") ? 1 : 0
        requestRender()
      })
      theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
      document.addEventListener("visibilitychange", visibilityChange)
      motion.addEventListener("change", motionChange)
      renderer.domElement.addEventListener("webglcontextlost", contextLost)
      resize()
      cleanup = () => {
        stop()
        updateRef.current = null
        intersection.disconnect()
        size.disconnect()
        theme.disconnect()
        document.removeEventListener("visibilitychange", visibilityChange)
        motion.removeEventListener("change", motionChange)
        renderer.domElement.removeEventListener("webglcontextlost", contextLost)
        geometry.dispose()
        material.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    }).catch(() => { if (!disposed) setFailed(true) })
    return () => { disposed = true; cleanup() }
  }, [])

  return <div ref={hostRef} className="flora-water" aria-hidden="true" hidden={failed} />
}
