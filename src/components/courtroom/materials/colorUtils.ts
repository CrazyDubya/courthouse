/** Tiny color-math helpers shared by every procedural texture generator. */

export type RGB = [number, number, number];

/** Parses a `#rrggbb` (or `rrggbb`) hex string into a byte-valued RGB tuple. */
export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const value = parseInt(clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

export function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

export function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Linearly blends two byte-valued colors; `t` is clamped to [0, 1]. */
export function mixRgb(a: RGB, b: RGB, t: number): RGB {
  const s = clamp01(t);
  return [lerp(a[0], b[0], s), lerp(a[1], b[1], s), lerp(a[2], b[2], s)];
}

/** Returns a byte-clamped copy of `rgb` shifted by `amount` (negative darkens). */
export function lightenRgb(rgb: RGB, amount: number): RGB {
  return [clampByte(rgb[0] + amount), clampByte(rgb[1] + amount), clampByte(rgb[2] + amount)];
}
