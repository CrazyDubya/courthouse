import * as THREE from 'three';
import { clamp01 } from './colorUtils';

/**
 * Low-level, environment-safe canvas helpers shared by every procedural
 * texture generator in this module. Noise lives in `noise.ts`; color math in
 * `colorUtils.ts`; this file is strictly "get a 2D canvas, turn a canvas into
 * a THREE.Texture, and derive a normal map from a height field."
 *
 * `createSafeCanvas2D` is defensive on purpose — `getContext('2d')` cannot be
 * trusted to succeed:
 *  - SSR / non-DOM evaluation has no `document` at all.
 *  - jsdom (this repo's unit-test environment, no `canvas` package installed)
 *    returns `null` from `getContext('2d')` and logs a "Not implemented"
 *    virtual-console notice — verified empirically in this repo. It does NOT
 *    throw here, but other jsdom / headless configurations DO throw
 *    synchronously, so we guard both a falsy return AND a thrown error.
 *  - a browser that has exhausted its 2D-context budget can hand back `null`.
 *
 * Every generator funnels through `createSafeCanvas2D` and propagates `null`
 * on any of the above; callers (see `presets.ts`) fall back to a flat-color
 * `MeshStandardMaterial` with no maps, so tests and any non-DOM render path
 * stay crash-free.
 */

export interface SafeCanvas2D {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export function createSafeCanvas2D(width: number, height: number): SafeCanvas2D | null {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    return { canvas, ctx };
  } catch {
    return null;
  }
}

/**
 * Converts a color-only canvas into a THREE.CanvasTexture. Color (albedo)
 * maps are sRGB data, so `colorSpace` is set accordingly.
 */
export function canvasToColorTexture(
  canvas: HTMLCanvasElement,
  repeat: [number, number]
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4; // mild, cheap on effectively every GPU; sharpens grazing angles
  tex.needsUpdate = true;
  return tex;
}

/**
 * Converts a scalar-field canvas (normal, roughness, height) into a
 * THREE.CanvasTexture. These encode data, not color, so colorSpace is left at
 * its linear default — sRGB-decoding a normal map would corrupt the vectors.
 */
export function canvasToDataTexture(
  canvas: HTMLCanvasElement,
  repeat: [number, number]
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Derives a tangent-space normal map from a height field via a single 3x3
 * Sobel pass (the "photoreal" idea: bump always agrees with the painted
 * height because both come from the same signal). `heightCanvas` encodes
 * height as luminance (R≈G≈B, written by the generators). Sampling wraps at
 * the edges (modulo width/height), so the normal map tiles seamlessly.
 *
 * Returns `null` if a 2D context can't be obtained — callers treat that the
 * same as "no normal map" and fall back cleanly.
 */
export function heightCanvasToNormalMap(
  heightCanvas: HTMLCanvasElement,
  strength = 1.6
): THREE.CanvasTexture | null {
  const w = heightCanvas.width;
  const h = heightCanvas.height;
  const srcCtx = heightCanvas.getContext('2d');
  if (!srcCtx) return null;

  const out = createSafeCanvas2D(w, h);
  if (!out) return null;
  const { canvas: normalCanvas, ctx: dstCtx } = out;

  const src = srcCtx.getImageData(0, 0, w, h).data;
  const dstImage = dstCtx.createImageData(w, h);
  const dst = dstImage.data;

  const heightAt = (x: number, y: number) => {
    const xi = ((x % w) + w) % w;
    const yi = ((y % h) + h) % h;
    return src[(yi * w + xi) * 4] / 255;
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Sobel operator: 3x3 gradient estimate, wrapped at the edges.
      const tl = heightAt(x - 1, y - 1);
      const t = heightAt(x, y - 1);
      const tr = heightAt(x + 1, y - 1);
      const l = heightAt(x - 1, y);
      const r = heightAt(x + 1, y);
      const bl = heightAt(x - 1, y + 1);
      const b = heightAt(x, y + 1);
      const br = heightAt(x + 1, y + 1);

      const dx = tr + 2 * r + br - (tl + 2 * l + bl);
      const dy = bl + 2 * b + br - (tl + 2 * t + tr);

      let nx = -dx * strength;
      let ny = -dy * strength;
      let nz = 1;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;

      const idx = (y * w + x) * 4;
      dst[idx] = Math.round((nx * 0.5 + 0.5) * 255);
      dst[idx + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      dst[idx + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      dst[idx + 3] = 255;
    }
  }

  dstCtx.putImageData(dstImage, 0, 0);
  return canvasToDataTexture(normalCanvas, [1, 1]);
}

/** Writes a 0..1 scalar as a neutral gray pixel (R=G=B=value*255, A=255).
 * Used for height and roughness fields so the same helper works whether three
 * samples the R, G, or B channel of a standalone data map. */
export function setScalarPixel(data: Uint8ClampedArray, idx: number, value: number): void {
  const v = Math.round(clamp01(value) * 255);
  data[idx] = v;
  data[idx + 1] = v;
  data[idx + 2] = v;
  data[idx + 3] = 255;
}
