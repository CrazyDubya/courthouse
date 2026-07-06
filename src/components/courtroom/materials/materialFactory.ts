import * as THREE from 'three';
import { MATERIAL_PRESETS, MaterialPresetKey } from './presets';

/**
 * Module-level cache: one MeshStandardMaterial per preset key, generated
 * lazily on first request. Because this lives at module scope (not inside a
 * component), it is shared across every component instance and every
 * remount within the same page load — dozens of jury seats, gallery pews,
 * and table legs all end up pointing at the same handful of material
 * objects instead of each constructing (and each rasterizing a canvas for)
 * their own copy.
 */
const sharedMaterialCache = new Map<MaterialPresetKey, THREE.MeshStandardMaterial>();

/**
 * Returns the single shared MeshStandardMaterial instance for `key`,
 * building (and caching) it on first use. The same object is returned on
 * every subsequent call for the same key.
 *
 * Do not mutate per-instance state (`.emissive`, `.opacity` pulses, etc.) on
 * the object returned here — it is shared by every mesh using this preset.
 * Use `createFreshCourtroomMaterial` for surfaces that animate their own
 * material (see JudgeBench / AttorneyTable).
 */
export function getSharedCourtroomMaterial(key: MaterialPresetKey): THREE.MeshStandardMaterial {
  const cached = sharedMaterialCache.get(key);
  if (cached) return cached;
  const material = MATERIAL_PRESETS[key].build();
  sharedMaterialCache.set(key, material);
  return material;
}

/**
 * Returns a brand-new MeshStandardMaterial for `key`, cloned from the shared
 * template. `THREE.Material#clone()` copies scalar/color properties
 * (including creating an independent `.emissive` Color) into the new
 * instance while reusing the same map/normalMap/roughnessMap texture
 * references — cloning never re-rasterizes the source canvas, so this is
 * cheap no matter how expensive the underlying generator was.
 *
 * Use this for meshes that mutate their own material every frame (e.g. the
 * emissive "thinking/active" pulse on JudgeBench's body and AttorneyTable's
 * tabletop) so the animation is scoped to that one mesh instead of bleeding
 * into every other mesh sharing the preset.
 */
export function createFreshCourtroomMaterial(key: MaterialPresetKey): THREE.MeshStandardMaterial {
  const template = getSharedCourtroomMaterial(key);
  return template.clone();
}

/**
 * Test / hot-reload utility: disposes every cached shared material (and its
 * textures) and clears the cache so the next request rebuilds from scratch.
 * Not used during normal app operation — materials live for the lifetime of
 * the page.
 */
export function disposeAllCourtroomMaterials(): void {
  sharedMaterialCache.forEach((material) => {
    material.map?.dispose();
    material.normalMap?.dispose();
    material.roughnessMap?.dispose();
    material.dispose();
  });
  sharedMaterialCache.clear();
}

/**
 * Runtime accounting for a dev HUD / tests: how many shared materials are
 * live, how many UNIQUE GPU texture uploads back them (multiple materials
 * sharing one texture `.source` — e.g. the two plaster walls — are counted
 * once), and an approximate RGBA8 + mip-chain byte total. Purely diagnostic;
 * nothing in the render path depends on it.
 */
export function debugTextureBudget(): {
  materials: number;
  uniqueTextures: number;
  approxBytes: number;
} {
  const seenSources = new Set<unknown>();
  let approxBytes = 0;
  const account = (tex: THREE.Texture | null) => {
    if (!tex) return;
    const source = tex.source ?? tex.image;
    if (seenSources.has(source)) return;
    seenSources.add(source);
    const img = tex.image as { width?: number; height?: number } | undefined;
    const w = img?.width ?? 0;
    const h = img?.height ?? 0;
    approxBytes += Math.round(w * h * 4 * 1.34); // RGBA8 + ~4/3 mip chain
  };
  sharedMaterialCache.forEach((material) => {
    account(material.map);
    account(material.normalMap);
    account(material.roughnessMap);
  });
  return {
    materials: sharedMaterialCache.size,
    uniqueTextures: seenSources.size,
    approxBytes,
  };
}
