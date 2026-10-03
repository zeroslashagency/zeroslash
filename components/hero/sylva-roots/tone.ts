/**
 * Art direction and performance dials for the hero root scene.
 *
 * This is the one file to edit for how the scene looks or how hard it works.
 * Nothing here requires reopening the shaders.
 */

/**
 * Geometry density and renderer cost.
 *
 * These are the source's "small" tier numbers, which it only used on narrow or
 * low-area viewports. We run them everywhere: at background scale behind a
 * headline the difference is not readable, and it costs roughly a third of the
 * fill of the full tier.
 */
export const DENSITY = {
  bladesNear: 88_000,
  bladesFar: 26_000,
  /* Ferns and flowers are the readable "extra elements" — individual silhouettes
     you can actually pick out, unlike blades which merge into texture at this
     scale. Raised well past the small tier because the frame was reading as one
     undifferentiated mound. */
  fernsNear: 44,
  fernsFar: 15,
  flowersNear: 210,
  flowersFar: 72,
  motes: 3_200,
  pixelRatioCap: 1.6,
  antialias: false,
} as const

/**
 * The drifting cloud haze that sits behind the roots.
 *
 * Switched off. In practice this layer did not read as weather — it read as a
 * pale film laid over the whole hero, and because it crossed the type column and
 * the moss alike, the only way to see it was to make it heavy enough to grey out
 * the thing it was meant to sit behind. Every attempt to tune it traded root
 * contrast for atmosphere, which is the wrong trade in a composition whose
 * subject is the root.
 *
 * `strength: 0` short-circuits the build entirely (see `buildCloud`), so this
 * costs no quad, no shader compile, and no fragment pass. The uniforms below are
 * kept so the layer can be revived by raising `strength` alone.
 */
export const CLOUD = {
  /** Peak opacity of the thickest wisp. Zero disables the layer outright. */
  strength: 0,
  /** Horizontal drift in world units per second. */
  drift: 5.2,
  /** Noise feature size; larger means broader, softer banks. */
  scale: 1.35,
  /**
   * The colour the wisps are painted in.
   *
   * This has to sit *below* the paper's luminance, not at it. An off-white cloud
   * over a cream plate is invisible by definition — measured on the real page, a
   * near-white layer changed the empty upper frame by 0.005 luminance, i.e. not
   * at all, and only did anything where it happened to cross the darker moss.
   *
   * A touch of grey-green instead reads as vapour over the paper as well as over
   * the form, and the green keeps it in the same family as the moss rather than
   * looking like a smudge of dirty white.
   */
  tint: [0.86, 0.875, 0.845],
  /** Fraction of the quad's height that stays clear at the top. */
  topFade: 0.42,
} as const

/**
 * Which behaviours are alive.
 *
 * Deliberately separate from DENSITY. The source gated the butterfly behind the
 * same `small` flag that cuts the blade counts, so running its cheap tier would
 * have silently dropped the butterfly. Splitting the two axes is what lets the
 * hero run light and still keep every moving part.
 */
export const FEATURES = {
  butterflies: 2,
  pointerSpray: true,
  pointerBend: true,
  wind: true,
  growthIntro: true,
} as const

/**
 * Below this width the scene plays its growth intro once, settles, then holds a
 * still frame with the render loop cancelled. Everything is still built and
 * visible, just no longer animating — no ongoing GPU or battery cost on phones.
 */
export const STILL_BELOW_PX = 900

/**
 * The light rig, retargeted from the source's dark-green page to the hero's
 * cream plate.
 *
 * The scene has no THREE.Light objects at all: lighting is hand-rolled in GLSL,
 * so re-lighting it means moving these uniform colours. Source values, authored
 * for a #4a4d44 background, are kept alongside for reference.
 */
export const CREAM_TONE = {
  /** Warm key. Source: [1.14, 1.06, 0.88] — trimmed so highlights do not blow out on paper. */
  key: [1.02, 0.97, 0.86],
  /** Bounce off the floor of the hero. Source: [0.78, 0.78, 0.62]. */
  fill: [0.74, 0.77, 0.64],
  /**
   * Ambient. Source: [0.086, 0.090, 0.080] — lifted roughly 9x.
   *
   * This is the single most important value in the file. Measured on the real
   * hero: at the source's ambient, moss behind the left column came out at mean
   * luminance 83, which black Playfair type cannot survive. Lifting it keeps
   * unlit faces near the paper instead of going to silhouette.
   *
   * But lifted to 0.74 it overshot in the other direction: with unlit faces
   * sitting that close to the paper, the root had no shaded side left and the
   * whole form washed out to near-white — legible type over an invisible scene.
   * 0.58 restores the tonal range that makes the arch read as a solid object.
   * The type stays safe because the roots now live on the right half, away from
   * the ink, and the scrim in the wrapper covers the corners where they meet.
   */
  amb: [0.58, 0.6, 0.53],
  /**
   * Distance haze, retargeted to the cream itself so depth fades into the
   * paper. Source: [0.176, 0.195, 0.145], which would fog the far ridge grey-green.
   */
  haze: [0.9, 0.9, 0.87],
  /** Far ridge sits in slightly paler air, so it reads as further off. */
  hazeFar: [0.925, 0.925, 0.91],
  /** ACES exposure. Source: 1.30. */
  exposure: 1.06,
} as const
