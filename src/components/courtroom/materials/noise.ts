/**
 * Seamless, tileable value noise + fbm / turbulence for procedural PBR textures.
 *
 * SYNTHESIS NOTE. This grafts the *layering* ideas from the "photoreal"
 * approach (multi-octave fbm / turbulence + Perlin's quintic fade for smooth,
 * less axis-aligned patterns — turbulence is the classic marble / wood-vein
 * input) onto the *seamlessness* discipline from the "performance" approach
 * (frequency is chosen ENTIRELY by lattice resolution, never by scaling the
 * sample coordinate, so the field is exactly periodic on the unit square and
 * a texture built from it never seams when `texture.repeat` is turned up on
 * the big surfaces — floor `repeat [8,7]`, walls `[4,2]`, carpet `[1,8]`).
 *
 * Each generator seeds its own field with a fixed constant, so a given
 * material preset renders the same texture every reload — deterministic
 * output keeps visual regressions and unit tests stable.
 */

/** Deterministic 32-bit PRNG (mulberry32). Same seed -> same texture, forever. */
export function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Quintic smoothstep (Perlin's improved interpolation curve). */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * A single seamless value-noise sampler on the unit square [0,1)^2, returning
 * values in [0, 1].
 *
 * The lattice wraps modulo (gridW, gridH), so `noise(u, v) === noise(u+1, v)`
 * and `=== noise(u, v+1)` EXACTLY. Passing an anisotropic grid (e.g.
 * gridW=128, gridH=8) yields directional streaks that still tile in both
 * axes — used for wood fine-grain and brushed-metal streaks.
 */
export function makeTileableNoise(
  seed: number,
  gridW: number,
  gridH: number = gridW
): (u: number, v: number) => number {
  const rand = mulberry32(seed);
  const lattice = new Float32Array(gridW * gridH);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rand();

  const at = (ix: number, iy: number) => {
    const x = ((ix % gridW) + gridW) % gridW;
    const y = ((iy % gridH) + gridH) % gridH;
    return lattice[y * gridW + x];
  };

  return (u: number, v: number): number => {
    const gx = u * gridW;
    const gy = v * gridH;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const tx = fade(gx - x0);
    const ty = fade(gy - y0);
    const a = lerp(at(x0, y0), at(x0 + 1, y0), tx);
    const b = lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), tx);
    return lerp(a, b, ty);
  };
}

export interface TileableField {
  /** Base-octave seamless noise in [0, 1]. */
  noise: (u: number, v: number) => number;
  /** Fractal Brownian motion in [0, 1] — soft, cloudy multi-scale variation. */
  fbm: (u: number, v: number) => number;
  /** Turbulence in [0, 1] — sum of |signed noise| octaves; sharp marble veins. */
  turbulence: (u: number, v: number) => number;
}

/**
 * A multi-octave seamless field. CRITICAL detail: each octave is its OWN
 * seamless lattice at double the previous resolution (base, base*2, base*4,
 * ...) rather than one lattice sampled at scaled coordinates. Summing
 * per-octave-seamless lattices stays exactly tileable; scaling a single
 * lattice's coordinates (the naive fbm) would break periodicity and seam on
 * repeated surfaces.
 */
export function makeTileableField(seed: number, baseGrid = 3, octaves = 5): TileableField {
  const grids: ((u: number, v: number) => number)[] = [];
  let g = baseGrid;
  for (let i = 0; i < octaves; i++) {
    grids.push(makeTileableNoise(seed + i * 1013904223, g, g));
    g *= 2;
  }

  const layer = (u: number, v: number, absolute: boolean): number => {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    for (let i = 0; i < grids.length; i++) {
      const n = grids[i](u, v);
      sum += amp * (absolute ? Math.abs(n * 2 - 1) : n);
      norm += amp;
      amp *= 0.5;
    }
    return norm > 0 ? sum / norm : 0;
  };

  return {
    noise: grids[0],
    fbm: (u, v) => layer(u, v, false),
    turbulence: (u, v) => layer(u, v, true),
  };
}
