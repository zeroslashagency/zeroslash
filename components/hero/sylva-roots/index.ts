/**
 * Typed boundary for the ported Sylva root scene.
 *
 * The scene body itself is JavaScript carried over from the authored source; this
 * is the only surface the React host is allowed to touch.
 */

export interface SylvaSceneHandle {
  /** Tear down the renderer, listeners, geometries, materials and textures. */
  dispose: () => void
  /** Pause or resume the render loop (scroll and tab-visibility gating). */
  setActive: (on: boolean) => void
}

export interface CreateSceneOptions {
  canvas: HTMLCanvasElement
  /** Element the scene measures for sizing; also the pointer reference frame. */
  container: HTMLElement
  /** Fired after the second painted frame, used to fade the canvas in. */
  onReady?: () => void
}

/** Returns null when WebGL is unavailable or the scene fails to build. */
export type CreateScene = (opts: CreateSceneOptions) => SylvaSceneHandle | null
