import * as THREE from "three"

export interface RibbonSpec {
  id: string
  brand: string
  color: string
  finish: "matte" | "satin"
  /** Path to crisp transparent PNG wordmark under /public/images/ribbon-logos/ */
  logoSrc: string
  /** Normalized horizontal center along the ribbon where the logo sits (0 = left tip, 1 = right anchor) */
  logoCenterU: number
  /** Height ratio of the logo relative to ribbon height (0..1) */
  logoScale: number
  /** Anchor position in world units (beyond the right viewport edge) */
  anchor: [number, number, number]
  /** Rest direction unit vector pointing down-left along the cascade */
  restDir: [number, number, number]
  /** Total ribbon length in world units */
  length: number
  /** Ribbon width in world units */
  width: number
  /** Subtle rest roll/twist in radians */
  baseTwist: number
  /** Subtle pillow camber across width */
  camber: number
}

/**
 * 20 depth-layered ribbons matching the exact staggered cascade composition:
 * - Left column logos: etisalat, Uber, STAR WARS, BURGER KING, boohoo, bottom crest
 * - Center column logos: SIRANEN, mashreq, UNDER ARMOUR, BINANCE, ESL, LEGO, GALITHIN
 * - Right column logos: sohub, RA, Whop, MRBEAST, twitch, STADIUM GOODS, NICKI MINAJ
 */
export const RIBBON_SPECS: readonly RibbonSpec[] = [
  {
    id: "sohub-top",
    brand: "sohub",
    color: "#9da3ad",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/sohub-top.png",
    logoCenterU: 0.72,
    logoScale: 0.76,
    anchor: [7.1, 3.82, -0.95],
    restDir: [-0.974, -0.225, 0],
    length: 9.2,
    width: 0.46,
    baseTwist: -0.05,
    camber: 0.028,
  },
  {
    id: "sirius",
    brand: "SIRANEN",
    color: "#2d2f35",
    finish: "matte",
    logoSrc: "/images/ribbon-logos/sirius.png",
    logoCenterU: 0.56,
    logoScale: 0.78,
    anchor: [7.1, 3.42, -0.85],
    restDir: [-0.968, -0.25, 0],
    length: 9.2,
    width: 0.46,
    baseTwist: 0.05,
    camber: 0.026,
  },
  {
    id: "etisalat",
    brand: "etisalat",
    color: "#e61d14",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/etisalat.png",
    logoCenterU: 0.24,
    logoScale: 0.76,
    anchor: [7.0, 2.95, -0.75],
    restDir: [-0.972, -0.235, 0],
    length: 9.9,
    width: 0.46,
    baseTwist: -0.05,
    camber: 0.03,
  },
  {
    id: "ra-crest",
    brand: "RA",
    color: "#379c44",
    finish: "matte",
    logoSrc: "/images/ribbon-logos/ra-crest.png",
    logoCenterU: 0.68,
    logoScale: 0.78,
    anchor: [7.1, 2.94, -0.65],
    restDir: [-0.958, -0.285, 0],
    length: 7.5,
    width: 0.46,
    baseTwist: -0.07,
    camber: 0.028,
  },
  {
    id: "mashreq",
    brand: "mashreq",
    color: "#ef6616",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/mashreq.png",
    logoCenterU: 0.36,
    logoScale: 0.74,
    anchor: [7.0, 2.54, -0.55],
    restDir: [-0.966, -0.258, 0],
    length: 8.6,
    width: 0.46,
    baseTwist: 0.05,
    camber: 0.03,
  },
  {
    id: "whop",
    brand: "Whop",
    color: "#c41e18",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/whop.png",
    logoCenterU: 0.6,
    logoScale: 0.76,
    anchor: [7.0, 2.42, -0.45],
    restDir: [-0.952, -0.306, 0],
    length: 7.0,
    width: 0.46,
    baseTwist: -0.05,
    camber: 0.028,
  },
  {
    id: "under-armour",
    brand: "UNDER ARMOUR",
    color: "#df2016",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/under-armour.png",
    logoCenterU: 0.44,
    logoScale: 0.82,
    anchor: [7.0, 2.0, -0.35],
    restDir: [-0.964, -0.265, 0],
    length: 8.4,
    width: 0.46,
    baseTwist: 0.04,
    camber: 0.028,
  },
  {
    id: "uber",
    brand: "Uber",
    color: "#1a1b1f",
    finish: "matte",
    logoSrc: "/images/ribbon-logos/uber.png",
    logoCenterU: 0.2,
    logoScale: 0.76,
    anchor: [7.0, 1.62, -0.25],
    restDir: [-0.966, -0.258, 0],
    length: 9.7,
    width: 0.48,
    baseTwist: 0.05,
    camber: 0.03,
  },
  {
    id: "mrbeast",
    brand: "MRBEAST",
    color: "#de5a84",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/mrbeast.png",
    logoCenterU: 0.58,
    logoScale: 0.76,
    anchor: [7.0, 1.92, -0.15],
    restDir: [-0.946, -0.324, 0],
    length: 6.8,
    width: 0.46,
    baseTwist: -0.05,
    camber: 0.028,
  },
  {
    id: "binance",
    brand: "BINANCE",
    color: "#e6b422",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/binance.png",
    logoCenterU: 0.62,
    logoScale: 0.74,
    anchor: [7.0, 1.44, -0.05],
    restDir: [-0.956, -0.292, 0],
    length: 8.0,
    width: 0.46,
    baseTwist: 0.05,
    camber: 0.028,
  },
  {
    id: "esl",
    brand: "ESL",
    color: "#d8bf28",
    finish: "matte",
    logoSrc: "/images/ribbon-logos/esl.png",
    logoCenterU: 0.36,
    logoScale: 0.76,
    anchor: [7.0, 1.02, 0.05],
    restDir: [-0.962, -0.273, 0],
    length: 8.7,
    width: 0.46,
    baseTwist: 0.05,
    camber: 0.028,
  },
  {
    id: "twitch",
    brand: "twitch",
    color: "#7c4be8",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/twitch.png",
    logoCenterU: 0.6,
    logoScale: 0.8,
    anchor: [7.0, 1.22, 0.15],
    restDir: [-0.938, -0.346, 0],
    length: 6.9,
    width: 0.48,
    baseTwist: -0.05,
    camber: 0.03,
  },
  {
    id: "star-wars",
    brand: "STAR WARS",
    color: "#151619",
    finish: "matte",
    logoSrc: "/images/ribbon-logos/star-wars.png",
    logoCenterU: 0.18,
    logoScale: 0.8,
    anchor: [7.0, 0.56, 0.25],
    restDir: [-0.97, -0.242, 0],
    length: 9.7,
    width: 0.46,
    baseTwist: -0.04,
    camber: 0.028,
  },
  {
    id: "burger-king",
    brand: "BURGER KING",
    color: "#1d60dc",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/burger-king.png",
    logoCenterU: 0.16,
    logoScale: 0.84,
    anchor: [7.0, 0.24, 0.35],
    restDir: [-0.967, -0.254, 0],
    length: 9.1,
    width: 0.47,
    baseTwist: 0.05,
    camber: 0.028,
  },
  {
    id: "lego",
    brand: "LEGO",
    color: "#178748",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/lego.png",
    logoCenterU: 0.14,
    logoScale: 0.86,
    anchor: [7.0, 0.22, 0.45],
    restDir: [-0.958, -0.285, 0],
    length: 8.1,
    width: 0.47,
    baseTwist: 0.05,
    camber: 0.028,
  },
  {
    id: "stadium-goods",
    brand: "STADIUM GOODS",
    color: "#18191d",
    finish: "matte",
    logoSrc: "/images/ribbon-logos/stadium-goods.png",
    logoCenterU: 0.62,
    logoScale: 0.8,
    anchor: [7.0, 0.44, 0.55],
    restDir: [-0.942, -0.336, 0],
    length: 6.8,
    width: 0.48,
    baseTwist: -0.05,
    camber: 0.026,
  },
  {
    id: "galithin",
    brand: "GALITHIN",
    color: "#6d1124",
    finish: "matte",
    logoSrc: "/images/ribbon-logos/galithin.png",
    logoCenterU: 0.48,
    logoScale: 0.76,
    anchor: [7.0, 0.08, 0.65],
    restDir: [-0.958, -0.285, 0],
    length: 8.0,
    width: 0.47,
    baseTwist: 0.04,
    camber: 0.03,
  },
  {
    id: "boohoo",
    brand: "boohoo",
    color: "#b4b9c2",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/boohoo.png",
    logoCenterU: 0.24,
    logoScale: 0.8,
    anchor: [7.0, -0.44, 0.75],
    restDir: [-0.964, -0.265, 0],
    length: 8.4,
    width: 0.47,
    baseTwist: -0.04,
    camber: 0.03,
  },
  {
    id: "nicki-minaj",
    brand: "NICKI MINAJ",
    color: "#c580ae",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/nicki-minaj.png",
    logoCenterU: 0.56,
    logoScale: 0.74,
    anchor: [7.0, -0.14, 0.85],
    restDir: [-0.948, -0.318, 0],
    length: 7.2,
    width: 0.47,
    baseTwist: 0.05,
    camber: 0.03,
  },
  {
    id: "orange-tail",
    brand: "ZEROSLASH",
    color: "#e84c14",
    finish: "satin",
    logoSrc: "/images/ribbon-logos/orange-tail.png",
    logoCenterU: 0.24,
    logoScale: 0.8,
    anchor: [7.0, -0.68, 0.95],
    restDir: [-0.962, -0.273, 0],
    length: 8.1,
    width: 0.46,
    baseTwist: 0.05,
    camber: 0.03,
  },
] as const

/**
 * Creates a seamless micro-woven satin/twill normal map shared across all ribbons
 * so directional light shimmers smoothly over fabric threads without painted stripes.
 */
export function createFabricNormalTexture(): THREE.DataTexture {
  const size = 128
  const data = new Uint8Array(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const warp = Math.sin(((x + y * 0.5) / 4) * Math.PI * 2) * 0.12
      const weft = Math.sin((y / 6) * Math.PI * 2) * 0.08
      const nx = Math.round((0.5 + warp * 0.5) * 255)
      const ny = Math.round((0.5 + weft * 0.5) * 255)
      const i = (y * size + x) * 4
      data[i] = nx
      data[i + 1] = ny
      data[i + 2] = 255
      data[i + 3] = 255
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(56, 4)
  tex.needsUpdate = true
  return tex
}

/**
 * Generates an undistorted 1:1 aspect-matched fabric texture backed by the
 * real PNG wordmark logo under /public/images/ribbon-logos/<id>.png.
 */
export function createRibbonTexture(
  spec: RibbonSpec,
  maxAnisotropy: number,
  onLoaded?: () => void,
): THREE.CanvasTexture {
  const w = 2048
  const h = Math.max(112, Math.round(w * (spec.width / spec.length)))
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = Math.max(1, maxAnisotropy)
  texture.wrapS = THREE.ClampToEdgeWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping

  const paintBase = () => {
    if (!ctx) return
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = spec.color
    ctx.fillRect(0, 0, w, h)

    const topHem = ctx.createLinearGradient(0, 0, 0, h * 0.14)
    topHem.addColorStop(0, "rgba(0,0,0,0.2)")
    topHem.addColorStop(0.45, "rgba(255,255,255,0.06)")
    topHem.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = topHem
    ctx.fillRect(0, 0, w, h * 0.14)

    const botHem = ctx.createLinearGradient(0, h * 0.86, 0, h)
    botHem.addColorStop(0, "rgba(0,0,0,0)")
    botHem.addColorStop(0.55, "rgba(255,255,255,0.05)")
    botHem.addColorStop(1, "rgba(0,0,0,0.26)")
    ctx.fillStyle = botHem
    ctx.fillRect(0, h * 0.86, w, h * 0.14)
  }

  paintBase()
  texture.needsUpdate = true

  if (typeof window !== "undefined" && ctx) {
    const img = new window.Image()
    img.decoding = "async"
    img.onload = () => {
      paintBase()
      const drawH = h * spec.logoScale
      const drawW = drawH * (img.naturalWidth / Math.max(1, img.naturalHeight))
      const drawX = w * spec.logoCenterU - drawW * 0.5
      const drawY = (h - drawH) * 0.5
      ctx.drawImage(img, drawX, drawY, drawW, drawH)
      texture.needsUpdate = true
      onLoaded?.()
    }
    img.src = spec.logoSrc
  }

  return texture
}
