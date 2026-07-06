import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createFreshCourtroomMaterial, getSharedCourtroomMaterial } from './materialFactory';
import { MATERIAL_PRESET_KEYS, MaterialPresetKey } from './presets';

export type CourtroomMaterialMap = Record<MaterialPresetKey, THREE.MeshStandardMaterial>;

/**
 * Shared, memoized PBR materials for every procedural surface in the
 * courtroom scene.
 *
 * Consumption pattern in a scene component:
 *
 * ```tsx
 * const materials = useCourtroomMaterials();
 * <Box args={[24, 20]}>
 *   <primitive object={materials.woodFloor} attach="material" />
 * </Box>
 * ```
 *
 * The returned object reference is stable across re-renders (useMemo with
 * an empty dep array), and every material inside it is the SAME object
 * every component instance gets — that's the point. A jury box with a
 * dozen seats and four rows of gallery pews should point at one
 * `woodWalnutDark` / `fabricChair` material each, not forty near-identical
 * copies; fewer distinct materials also means fewer WebGL program
 * switches per frame.
 *
 * Do not call `.clone()` on a value from this map and then mutate the
 * clone's `map`/`normalMap`/`roughnessMap` — those textures are shared by
 * reference across every consumer. Scalar mutation (color, roughness) on a
 * clone is fine; for anything animated every frame, use
 * `useFreshCourtroomMaterial` instead so the shared instance is never
 * touched.
 */
export function useCourtroomMaterials(): CourtroomMaterialMap {
  return useMemo(() => {
    const map = {} as CourtroomMaterialMap;
    for (const key of MATERIAL_PRESET_KEYS) {
      map[key] = getSharedCourtroomMaterial(key);
    }
    return map;
  }, []);
}

/**
 * A fresh, per-instance MeshStandardMaterial for surfaces that animate their
 * own material state every frame — currently the emissive "thinking/active"
 * pulse on JudgeBench's main body and AttorneyTable's tabletop.
 *
 * Created exactly once per component instance via a ref (NOT useMemo: under
 * React 19 StrictMode the memo initializer can run twice and orphan a
 * throwaway material — the ref guarantees a single instance) and disposed on
 * unmount. Disposing only frees the small Material wrapper; the shared
 * map / normalMap / roughnessMap textures it points at are owned by the
 * module caches and used by many other materials, so they are untouched.
 *
 * The clone shares its texture maps with every other consumer of `key` but
 * owns an independent `.emissive` Color, so mutating it in a `useFrame`
 * callback is safe and scoped to this one mesh:
 *
 * ```tsx
 * const tableTop = useFreshCourtroomMaterial('woodMahogany');
 * useFrame(({ clock }) => {
 *   tableTop.emissive.setRGB(...);
 * });
 * ...
 * <primitive object={tableTop} attach="material" />
 * ```
 *
 * `key` is expected to be a stable literal (it is, at every call site); a
 * changing key will not swap the material, matching the "one animated
 * surface, one material" contract.
 */
export function useFreshCourtroomMaterial(key: MaterialPresetKey): THREE.MeshStandardMaterial {
  const ref = useRef<THREE.MeshStandardMaterial | null>(null);
  if (ref.current === null) {
    ref.current = createFreshCourtroomMaterial(key);
  }
  useEffect(() => {
    const material = ref.current;
    return () => {
      material?.dispose();
    };
  }, []);
  return ref.current;
}
