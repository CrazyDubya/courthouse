import * as THREE from 'three';
import {
  canvasToColorTexture,
  canvasToDataTexture,
  createSafeCanvas2D,
  heightCanvasToNormalMap,
  setScalarPixel,
} from './canvasUtils';
import { clamp01, hexToRgb, mixRgb } from './colorUtils';
import { makeTileableField, makeTileableNoise, mulberry32 } from './noise';

/**
 * Procedural PBR texture generators.
 *
 * Every generator:
 *  1. paints a color canvas AND a parallel grayscale height canvas from the
 *     SAME seamless noise field (grain / veins / weave / patina line up with
 *     their own bump),
 *  2. runs the height canvas through the Sobel pass in `canvasUtils` to derive
 *     a tangent-space normal map,
 *  3. optionally paints a roughness canvas for materials whose "wear" story is
 *     partly about a duller / shinier surface, not just color (brushed-metal
 *     patina, worn carpet pile),
 *  4. returns `null` if a 2D context isn't available anywhere in the pipeline
 *     — callers fall back to a flat-color material.
 *
 * All frequencies are expressed in whole cycles / cells per tile and all
 * fields are seamless (see `noise.ts`), so every map tiles cleanly when
 * `texture.repeat` is turned up. Patterns are tuned to read as a designed,
 * dignified set under warm practical lighting, not to pass a pixel-peep.
 */

export interface GeneratedTextureSet {
  map: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture | null;
  roughnessMap?: THREE.CanvasTexture | null;
}

// ---------------------------------------------------------------------------
// Wood grain — benches, tables, floor, trim.
// ---------------------------------------------------------------------------

export interface WoodGrainOptions {
  size?: number;
  seed?: number;
  /** Hex colors from dark grain to light figure; base tone sits between them. */
  darkColor: string;
  lightColor: string;
  /** Whole growth-ring cycles across the tile, along the cross-grain axis. */
  ringFrequency?: number;
  /** Which canvas axis the grain runs along. */
  grainDirection?: 'horizontal' | 'vertical';
  /** Draw darker plank-seam lines across the grain (floor boards). */
  plankSeams?: boolean;
  repeat?: [number, number];
}

export function generateWoodGrainTextureSet(opts: WoodGrainOptions): GeneratedTextureSet | null {
  const size = opts.size ?? 512;
  const seed = opts.seed ?? 1;
  const ringFrequency = Math.max(1, Math.round(opts.ringFrequency ?? 10));
  const direction = opts.grainDirection ?? 'vertical';
  const repeat = opts.repeat ?? [1, 1];

  const colorOut = createSafeCanvas2D(size, size);
  const heightOut = createSafeCanvas2D(size, size);
  if (!colorOut || !heightOut) return null;

  const dark = hexToRgb(opts.darkColor);
  const light = hexToRgb(opts.lightColor);
  const warpField = makeTileableField(seed + 17, 2, 4);
  const knotField = makeTileableField(seed + 97, 3, 4);
  // Anisotropic fine grain: many cells ALONG the grain, few across, so the
  // streaks run with the grain and still tile in both axes.
  const fineGrain =
    direction === 'vertical'
      ? makeTileableNoise(seed + 53, 128, 10)
      : makeTileableNoise(seed + 53, 10, 128);

  const colorImg = colorOut.ctx.createImageData(size, size);
  const heightImg = heightOut.ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const across = direction === 'vertical' ? u : v;

      // Turbulence-warped rings: the ring coordinate wavers like real growth
      // rings instead of drawing perfect concentric stripes. Warp is measured
      // in ring cycles; ringFrequency is an integer so the sine tiles.
      const warp = (warpField.turbulence(u, v) - 0.5) * 0.8;
      const ring = Math.sin((across * ringFrequency + warp) * Math.PI * 2);
      let t = ring * 0.5 + 0.5;

      const fine = fineGrain(u, v) - 0.5;
      t = clamp01(t + fine * 0.22);

      // Sparse knots: rare dark blemishes where turbulence spikes.
      const knot = knotField.fbm(u, v);
      const knotBoost = knot > 0.8 ? (knot - 0.8) / 0.2 : 0;
      t = clamp01(t - knotBoost * 0.55);

      // Tile-aligned plank seams: 4 planks across, seam at each plank edge.
      let seamDarken = 0;
      if (opts.plankSeams) {
        const planks = 4;
        const f = (across * planks) % 1;
        const d = Math.min(f, 1 - f);
        if (d < 0.012) seamDarken = 0.5 * (1 - d / 0.012);
      }

      const [r, g, b] = mixRgb(dark, light, t);
      const idx = (y * size + x) * 4;
      colorImg.data[idx] = r * (1 - seamDarken);
      colorImg.data[idx + 1] = g * (1 - seamDarken);
      colorImg.data[idx + 2] = b * (1 - seamDarken);
      colorImg.data[idx + 3] = 255;

      const heightVal = clamp01(0.5 + (t - 0.5) * 0.6 + fine * 0.4 - seamDarken * 0.5 - knotBoost * 0.3);
      setScalarPixel(heightImg.data, idx, heightVal);
    }
  }

  colorOut.ctx.putImageData(colorImg, 0, 0);
  heightOut.ctx.putImageData(heightImg, 0, 0);

  return {
    map: canvasToColorTexture(colorOut.canvas, repeat),
    normalMap: heightCanvasToNormalMap(heightOut.canvas, 1.4),
  };
}

// ---------------------------------------------------------------------------
// Veined marble / stone — columns.
// ---------------------------------------------------------------------------

export interface MarbleOptions {
  size?: number;
  seed?: number;
  baseColor: string;
  veinColor: string;
  /** Whole vein cycles across the tile. */
  veinFrequency?: number;
  repeat?: [number, number];
}

export function generateMarbleTextureSet(opts: MarbleOptions): GeneratedTextureSet | null {
  const size = opts.size ?? 512;
  const seed = opts.seed ?? 2;
  const cycles = Math.max(1, Math.round(opts.veinFrequency ?? 6));
  const crossCycles = Math.max(1, Math.round(cycles * 0.6));
  const repeat = opts.repeat ?? [1, 1];

  const colorOut = createSafeCanvas2D(size, size);
  const heightOut = createSafeCanvas2D(size, size);
  if (!colorOut || !heightOut) return null;

  const base = hexToRgb(opts.baseColor);
  const vein = hexToRgb(opts.veinColor);
  const warpField = makeTileableField(seed + 41, 2, 6);
  const blotchField = makeTileableField(seed + 71, 2, 3);

  const colorImg = colorOut.ctx.createImageData(size, size);
  const heightImg = heightOut.ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;

      // Turbulence-warped sinusoidal veins, sharpened to thin dark lines.
      const warp = (warpField.turbulence(u, v) - 0.5) * 2.2;
      const veinPattern = Math.sin(
        (u * cycles + warp) * Math.PI * 2 + Math.sin(v * crossCycles * Math.PI * 2)
      );
      const veinIntensity = Math.pow(clamp01(1 - Math.abs(veinPattern)), 6);

      // Large, soft blotches: gentle overall color variation in the stone.
      const blotch = blotchField.fbm(u, v) - 0.5;

      const tinted: [number, number, number] = [
        base[0] * (1 + blotch * 0.08),
        base[1] * (1 + blotch * 0.08),
        base[2] * (1 + blotch * 0.08),
      ];
      const [r, g, b] = mixRgb(tinted, vein, veinIntensity * 0.85);
      const idx = (y * size + x) * 4;
      colorImg.data[idx] = r;
      colorImg.data[idx + 1] = g;
      colorImg.data[idx + 2] = b;
      colorImg.data[idx + 3] = 255;

      const heightVal = clamp01(0.5 - veinIntensity * 0.25 + blotch * 0.15);
      setScalarPixel(heightImg.data, idx, heightVal);
    }
  }

  colorOut.ctx.putImageData(colorImg, 0, 0);
  heightOut.ctx.putImageData(heightImg, 0, 0);

  return {
    map: canvasToColorTexture(colorOut.canvas, repeat),
    normalMap: heightCanvasToNormalMap(heightOut.canvas, 1.1),
  };
}

// ---------------------------------------------------------------------------
// Brushed metal — brass (seals, nameplates, gilding) and dark gunmetal
// (microphones, stenotype, laptop).
// ---------------------------------------------------------------------------

export interface BrushedMetalOptions {
  size?: number;
  seed?: number;
  baseColor: string;
  patinaColor: string;
  /** 0 = pristine, 1 = heavily weathered. */
  patinaAmount?: number;
  /** Contrast of the brushed streaks; higher reads as more heavily worked metal. */
  streakContrast?: number;
  repeat?: [number, number];
}

export function generateBrushedMetalTextureSet(opts: BrushedMetalOptions): GeneratedTextureSet | null {
  const size = opts.size ?? 384;
  const seed = opts.seed ?? 3;
  const patinaAmount = opts.patinaAmount ?? 0.18;
  const streakContrast = opts.streakContrast ?? 0.12;
  const repeat = opts.repeat ?? [1, 1];

  const colorOut = createSafeCanvas2D(size, size);
  const heightOut = createSafeCanvas2D(size, size);
  const roughOut = createSafeCanvas2D(size, size);
  if (!colorOut || !heightOut || !roughOut) return null;

  const base = hexToRgb(opts.baseColor);
  const patina = hexToRgb(opts.patinaColor);
  // Anisotropic streak field: smooth across u, detailed along v -> long
  // horizontal brush streaks. Seamless in both axes.
  const streakField = makeTileableNoise(seed + 11, 6, Math.max(96, Math.round(size * 0.6)));
  const microField = makeTileableField(seed + 5, 4, 3);
  const patinaField = makeTileableField(seed + 71, 2, 4);

  const colorImg = colorOut.ctx.createImageData(size, size);
  const heightImg = heightOut.ctx.createImageData(size, size);
  const roughImg = roughOut.ctx.createImageData(size, size);

  const cx = size / 2;
  const cy = size / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;

      const streak = (streakField(u, v) - 0.5) * streakContrast * 2 + (microField.fbm(u, v) - 0.5) * 0.05;

      // Patina pools where the field is high AND toward the worn edges.
      const edgeDist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy)) / maxDist;
      const patinaMask =
        clamp01((patinaField.fbm(u, v) - 0.55) * 2 + (edgeDist - 0.6) * 0.8) * patinaAmount;

      const shaded: [number, number, number] = [
        base[0] * (1 + streak),
        base[1] * (1 + streak),
        base[2] * (1 + streak),
      ];
      const [r, g, b] = mixRgb(shaded, patina, patinaMask);
      const idx = (y * size + x) * 4;
      colorImg.data[idx] = r;
      colorImg.data[idx + 1] = g;
      colorImg.data[idx + 2] = b;
      colorImg.data[idx + 3] = 255;

      const heightVal = clamp01(0.5 + streak * 1.5 - patinaMask * 0.35);
      setScalarPixel(heightImg.data, idx, heightVal);

      // Patina reads duller (higher roughness); the brush ripple keeps
      // specular highlights from being perfectly mirror-flat.
      const roughVal = clamp01(0.22 + patinaMask * 0.55 + Math.abs(streak) * 0.4);
      setScalarPixel(roughImg.data, idx, roughVal);
    }
  }

  colorOut.ctx.putImageData(colorImg, 0, 0);
  heightOut.ctx.putImageData(heightImg, 0, 0);
  roughOut.ctx.putImageData(roughImg, 0, 0);

  return {
    map: canvasToColorTexture(colorOut.canvas, repeat),
    normalMap: heightCanvasToNormalMap(heightOut.canvas, 2.2),
    roughnessMap: canvasToDataTexture(roughOut.canvas, repeat),
  };
}

// ---------------------------------------------------------------------------
// Woven fabric — carpet runners, upholstered chairs, flags.
// ---------------------------------------------------------------------------

export interface WovenFabricOptions {
  size?: number;
  seed?: number;
  baseColor: string;
  wornColor: string;
  /** Pixel size of one over/under weave cell. Smaller = finer weave (flags). */
  threadSize?: number;
  /** 0 = pristine, 1 = heavily worn traffic pattern. */
  wearAmount?: number;
  repeat?: [number, number];
}

export function generateWovenFabricTextureSet(opts: WovenFabricOptions): GeneratedTextureSet | null {
  const size = opts.size ?? 512;
  const seed = opts.seed ?? 4;
  const threadSize = opts.threadSize ?? 6;
  const wearAmount = opts.wearAmount ?? 0.25;
  const repeat = opts.repeat ?? [1, 1];

  const colorOut = createSafeCanvas2D(size, size);
  const heightOut = createSafeCanvas2D(size, size);
  const roughOut = createSafeCanvas2D(size, size);
  if (!colorOut || !heightOut || !roughOut) return null;

  const base = hexToRgb(opts.baseColor);
  const worn = hexToRgb(opts.wornColor);
  const wearField = makeTileableField(seed + 13, 2, 4);

  // Whole number of weave cells across the tile so the over/under checker
  // wraps cleanly. Per-cell jitter breaks up mechanical repetition.
  const threads = Math.max(2, Math.round(size / threadSize));
  const jitterRand = mulberry32(seed);
  const threadJitter = new Float32Array(threads * threads);
  for (let i = 0; i < threadJitter.length; i++) threadJitter[i] = (jitterRand() - 0.5) * 0.16;

  const colorImg = colorOut.ctx.createImageData(size, size);
  const heightImg = heightOut.ctx.createImageData(size, size);
  const roughImg = roughOut.ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;

      const cellX = Math.floor(u * threads);
      const cellY = Math.floor(v * threads);
      const over = (cellX + cellY) % 2 === 0;
      const jitter = threadJitter[(cellY % threads) * threads + (cellX % threads)];
      const weaveShade = (over ? 0.1 : -0.1) + jitter;

      // Wear concentrated toward the center (foot traffic down a runner, or
      // the seat of a chair cushion).
      const centerBias = 1 - Math.min(1, Math.abs(u - 0.5) / 0.35);
      const wearField01 = wearField.fbm(u, v) * Math.max(0, centerBias);
      const wearMask = clamp01((wearField01 - 0.35) * 1.6) * wearAmount;

      const shaded: [number, number, number] = [
        base[0] * (1 + weaveShade),
        base[1] * (1 + weaveShade),
        base[2] * (1 + weaveShade),
      ];
      const [r, g, b] = mixRgb(shaded, worn, wearMask);
      const idx = (y * size + x) * 4;
      colorImg.data[idx] = r;
      colorImg.data[idx + 1] = g;
      colorImg.data[idx + 2] = b;
      colorImg.data[idx + 3] = 255;

      const heightVal = clamp01(0.5 + weaveShade * 1.4 - wearMask * 0.3);
      setScalarPixel(heightImg.data, idx, heightVal);

      const roughVal = clamp01(0.88 - wearMask * 0.3);
      setScalarPixel(roughImg.data, idx, roughVal);
    }
  }

  colorOut.ctx.putImageData(colorImg, 0, 0);
  heightOut.ctx.putImageData(heightImg, 0, 0);
  roughOut.ctx.putImageData(roughImg, 0, 0);

  return {
    map: canvasToColorTexture(colorOut.canvas, repeat),
    normalMap: heightCanvasToNormalMap(heightOut.canvas, 1.8),
    roughnessMap: canvasToDataTexture(roughOut.canvas, repeat),
  };
}

// ---------------------------------------------------------------------------
// Mottled plaster — walls, and (reused at a smaller amplitude) foliage
// canopy color variation / paper fiber.
// ---------------------------------------------------------------------------

export interface MottledSurfaceOptions {
  size?: number;
  seed?: number;
  baseColor: string;
  /** Amplitude of large, soft trowel-mark blotches. */
  blotchAmount?: number;
  /** Amplitude of fine stipple grain. */
  stippleAmount?: number;
  repeat?: [number, number];
}

export function generateMottledSurfaceTextureSet(opts: MottledSurfaceOptions): GeneratedTextureSet | null {
  const size = opts.size ?? 512;
  const seed = opts.seed ?? 5;
  const blotchAmount = opts.blotchAmount ?? 0.05;
  const stippleAmount = opts.stippleAmount ?? 0.035;
  const repeat = opts.repeat ?? [1, 1];

  const colorOut = createSafeCanvas2D(size, size);
  const heightOut = createSafeCanvas2D(size, size);
  if (!colorOut || !heightOut) return null;

  const base = hexToRgb(opts.baseColor);
  const blotchField = makeTileableField(seed, 2, 4);
  // Seamless fine grain instead of pure per-pixel random, so plaster tiles
  // cleanly on the big repeated wall planes.
  const stippleField = makeTileableNoise(seed + 29, Math.min(size, 128), Math.min(size, 128));

  const colorImg = colorOut.ctx.createImageData(size, size);
  const heightImg = heightOut.ctx.createImageData(size, size);

  for (let y = 0; y < size; y++) {
    const v = y / size;
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const blotch = (blotchField.fbm(u, v) - 0.5) * 2 * blotchAmount;
      const stipple = (stippleField(u, v) - 0.5) * 2 * stippleAmount;
      const tone = 1 + blotch + stipple;

      const idx = (y * size + x) * 4;
      colorImg.data[idx] = base[0] * tone;
      colorImg.data[idx + 1] = base[1] * tone;
      colorImg.data[idx + 2] = base[2] * tone;
      colorImg.data[idx + 3] = 255;

      setScalarPixel(heightImg.data, idx, clamp01(0.5 + blotch * 1.5 + stipple));
    }
  }

  colorOut.ctx.putImageData(colorImg, 0, 0);
  heightOut.ctx.putImageData(heightImg, 0, 0);

  return {
    map: canvasToColorTexture(colorOut.canvas, repeat),
    normalMap: heightCanvasToNormalMap(heightOut.canvas, 0.7),
  };
}
