import { describe, it, expect, afterEach } from 'vitest';
import * as THREE from 'three';
import {
  MATERIAL_PRESET_KEYS,
  getSharedCourtroomMaterial,
  createFreshCourtroomMaterial,
  disposeAllCourtroomMaterials,
} from '../index';

// These run in the repo's jsdom env, where <canvas>.getContext('2d') returns
// null (no `canvas` package installed). That is exactly the crash-safety path:
// every generator must fall back to a flat-color material instead of throwing.
// No mocks — the environment itself exercises the fallback.
describe('courtroom material factory', () => {
  afterEach(() => {
    disposeAllCourtroomMaterials();
  });

  it('builds every preset without throwing (canvas-null fallback path)', () => {
    for (const key of MATERIAL_PRESET_KEYS) {
      const material = getSharedCourtroomMaterial(key);
      expect(material).toBeInstanceOf(THREE.MeshStandardMaterial);
    }
  });

  it('returns the SAME shared instance for a given key', () => {
    const a = getSharedCourtroomMaterial('woodFloor');
    const b = getSharedCourtroomMaterial('woodFloor');
    expect(a).toBe(b);
  });

  it('gives a fresh, distinct instance that still shares the template texture map', () => {
    const shared = getSharedCourtroomMaterial('woodMahogany');
    const fresh = createFreshCourtroomMaterial('woodMahogany');
    expect(fresh).not.toBe(shared);
    // clone() reuses the (possibly null) texture references — it never
    // re-rasterizes the source canvas.
    expect(fresh.map).toBe(shared.map);
  });

  it('mutating a fresh clone .emissive does not bleed into the shared template', () => {
    const shared = getSharedCourtroomMaterial('woodWalnutDark');
    const before = shared.emissive.clone();
    const fresh = createFreshCourtroomMaterial('woodWalnutDark');
    fresh.emissive.setRGB(0.4, 0.4, 0);
    expect(shared.emissive.equals(before)).toBe(true);
    expect(fresh.emissive.equals(before)).toBe(false);
  });
});
