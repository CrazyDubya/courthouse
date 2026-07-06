import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Procedural seated/standing human silhouettes, built once from primitives
 * and cached at module scope — exactly like `materials/materialFactory.ts`
 * caches its `MeshStandardMaterial`s. Every seated principal, every
 * instanced juror, and every instanced gallery observer in the entire scene
 * points at the SAME three `BufferGeometry` objects (skin / cloth / hair);
 * only the per-figure transform and per-part color differ. The standing
 * bailiff points at a second, equally shared, trio.
 *
 * Each figure is split into three parts rather than one merged mesh because
 * that is the only way to give a single instance independently-colored skin,
 * clothing, and hair while still driving the crowd from InstancedMesh: an
 * instance's color is one uniform tint applied to its whole draw, so three
 * tints per person means three geometries per person (each shared, each
 * instanced), not three geometries per PERSON times N people.
 */

type V3 = readonly [number, number, number];

export interface FigurePartGeometry {
  skin: THREE.BufferGeometry;
  cloth: THREE.BufferGeometry;
  hair: THREE.BufferGeometry;
}

// ---------------------------------------------------------------------------
// Primitive builders. These run a handful of times total (at first use of
// each geometry set) — never per-frame, never per-instance — so clarity
// wins over micro-optimizing the construction code itself.
// ---------------------------------------------------------------------------

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _up = new THREE.Vector3(0, 1, 0);
const _mat = new THREE.Matrix4();
const _unitScale = new THREE.Vector3(1, 1, 1);

/** A capsule spanning exactly from point `a` to point `b`. */
function capsuleBetween(
  radius: number,
  a: V3,
  b: V3,
  capSegments = 3,
  radialSegments = 6
): THREE.BufferGeometry {
  _a.set(a[0], a[1], a[2]);
  _b.set(b[0], b[1], b[2]);
  const straightLength = Math.max(_a.distanceTo(_b) - radius * 2, 0.02);
  const geo = new THREE.CapsuleGeometry(radius, straightLength, capSegments, radialSegments);
  _dir.copy(_b).sub(_a).normalize();
  _quat.setFromUnitVectors(_up, _dir);
  _mid.copy(_a).add(_b).multiplyScalar(0.5);
  _mat.compose(_mid, _quat, _unitScale);
  geo.applyMatrix4(_mat);
  return geo;
}

function sphereAt(
  radius: number,
  center: V3,
  scale: V3 = [1, 1, 1],
  widthSegments = 12,
  heightSegments = 9
): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  geo.scale(scale[0], scale[1], scale[2]);
  geo.translate(center[0], center[1], center[2]);
  return geo;
}

function cylinderAt(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  center: V3,
  radialSegments = 8
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
  geo.translate(center[0], center[1], center[2]);
  return geo;
}

function boxAt(size: V3, center: V3): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(size[0], size[1], size[2]);
  geo.translate(center[0], center[1], center[2]);
  return geo;
}

function coneAt(radius: number, height: number, center: V3, radialSegments = 12): THREE.BufferGeometry {
  const geo = new THREE.ConeGeometry(radius, height, radialSegments);
  geo.translate(center[0], center[1], center[2]);
  return geo;
}

function mergeParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  // mergeGeometries only returns null when the inputs disagree on which
  // attributes they carry, which cannot happen here — every part above
  // comes from a stock THREE primitive with the same position/normal/uv
  // attribute set. The guard is defensive: never crash the scene over it.
  if (!merged) return new THREE.BufferGeometry();
  merged.computeBoundingSphere();
  return merged;
}

// ---------------------------------------------------------------------------
// Seated pose. Local space: origin = hip pivot at the seat surface, +Y up,
// +Z = the direction the figure faces. Shared by every principal (except the
// standing bailiff) AND every instanced juror/gallery observer.
// ---------------------------------------------------------------------------

function buildSeatedSkin(): THREE.BufferGeometry {
  return mergeParts([
    cylinderAt(0.075, 0.09, 0.14, [0, 0.94, 0.01], 8), // neck
    sphereAt(0.16, [0, 1.14, 0.015], [1, 1.05, 0.92], 14, 10), // head
    sphereAt(0.065, [-0.29, 0.5, 0.42]), // left hand, resting on lap
    sphereAt(0.065, [0.29, 0.5, 0.42]), // right hand, resting on lap
  ]);
}

function buildSeatedCloth(): THREE.BufferGeometry {
  return mergeParts([
    capsuleBetween(0.21, [0, 0.14, -0.01], [0, 0.82, 0.02], 4, 10), // torso
    capsuleBetween(0.075, [-0.25, 0.8, 0.04], [-0.33, 0.55, 0.16], 3, 6), // upper arm L
    capsuleBetween(0.075, [0.25, 0.8, 0.04], [0.33, 0.55, 0.16], 3, 6), // upper arm R
    capsuleBetween(0.068, [-0.33, 0.55, 0.16], [-0.29, 0.5, 0.42], 3, 6), // forearm L
    capsuleBetween(0.068, [0.33, 0.55, 0.16], [0.29, 0.5, 0.42], 3, 6), // forearm R
    capsuleBetween(0.13, [-0.13, 0.1, -0.02], [-0.14, 0.08, 0.42], 3, 8), // thigh L
    capsuleBetween(0.13, [0.13, 0.1, -0.02], [0.14, 0.08, 0.42], 3, 8), // thigh R
    capsuleBetween(0.095, [-0.14, 0.08, 0.42], [-0.15, -0.42, 0.5], 3, 6), // shin L
    capsuleBetween(0.095, [0.14, 0.08, 0.42], [0.15, -0.42, 0.5], 3, 6), // shin R
    boxAt([0.11, 0.08, 0.26], [-0.15, -0.47, 0.58]), // foot L
    boxAt([0.11, 0.08, 0.26], [0.15, -0.47, 0.58]), // foot R
  ]);
}

function buildSeatedHair(): THREE.BufferGeometry {
  return sphereAt(0.168, [0, 1.19, -0.02], [1, 0.6, 1.04], 14, 8);
}

let seatedGeometryCache: FigurePartGeometry | null = null;

/** Lazily builds (once) and returns the shared seated skin/cloth/hair trio. */
export function getSeatedFigureGeometry(): FigurePartGeometry {
  if (!seatedGeometryCache) {
    seatedGeometryCache = {
      skin: buildSeatedSkin(),
      cloth: buildSeatedCloth(),
      hair: buildSeatedHair(),
    };
  }
  return seatedGeometryCache;
}

// ---------------------------------------------------------------------------
// Standing pose (bailiff). Local space: origin = the floor at the figure's
// feet, +Y up, +Z = facing direction.
// ---------------------------------------------------------------------------

function buildStandingSkin(): THREE.BufferGeometry {
  return mergeParts([
    cylinderAt(0.08, 0.095, 0.14, [0, 1.56, 0.01], 8), // neck
    sphereAt(0.165, [0, 1.78, 0.015], [1, 1.05, 0.92], 14, 10), // head
    sphereAt(0.065, [-0.31, 0.86, 0.05]), // left hand
    sphereAt(0.065, [0.31, 0.86, 0.05]), // right hand
  ]);
}

function buildStandingCloth(): THREE.BufferGeometry {
  return mergeParts([
    capsuleBetween(0.22, [0, 0.92, -0.01], [0, 1.5, 0.02], 4, 10), // torso
    capsuleBetween(0.078, [-0.26, 1.48, 0.03], [-0.3, 1.16, 0.05], 3, 6), // upper arm L
    capsuleBetween(0.078, [0.26, 1.48, 0.03], [0.3, 1.16, 0.05], 3, 6), // upper arm R
    capsuleBetween(0.07, [-0.3, 1.16, 0.05], [-0.31, 0.86, 0.05], 3, 6), // forearm L
    capsuleBetween(0.07, [0.3, 1.16, 0.05], [0.31, 0.86, 0.05], 3, 6), // forearm R
    capsuleBetween(0.14, [-0.13, 0.92, 0], [-0.13, 0.48, 0.01], 3, 8), // thigh L
    capsuleBetween(0.14, [0.13, 0.92, 0], [0.13, 0.48, 0.01], 3, 8), // thigh R
    capsuleBetween(0.1, [-0.13, 0.48, 0.01], [-0.12, 0, 0.02], 3, 6), // shin L
    capsuleBetween(0.1, [0.13, 0.48, 0.01], [0.12, 0, 0.02], 3, 6), // shin R
    boxAt([0.12, 0.08, 0.28], [-0.12, -0.04, 0.1]), // foot L
    boxAt([0.12, 0.08, 0.28], [0.12, -0.04, 0.1]), // foot R
  ]);
}

function buildStandingHair(): THREE.BufferGeometry {
  return sphereAt(0.173, [0, 1.83, -0.02], [1, 0.6, 1.04], 14, 8);
}

let standingGeometryCache: FigurePartGeometry | null = null;

/** Lazily builds (once) and returns the shared standing skin/cloth/hair trio. */
export function getStandingFigureGeometry(): FigurePartGeometry {
  if (!standingGeometryCache) {
    standingGeometryCache = {
      skin: buildStandingSkin(),
      cloth: buildStandingCloth(),
      hair: buildStandingHair(),
    };
  }
  return standingGeometryCache;
}

// ---------------------------------------------------------------------------
// Small role-specific silhouette accents. These are one-off geometries used
// only by individually-rendered principals (never instanced), so they don't
// need the shared-cache treatment above — a component builds one via
// `useMemo` and disposes it on unmount.
// ---------------------------------------------------------------------------

/** Floor-length judicial robe skirt, flaring out from the waist. */
export function buildJudgeRobeSkirt(): THREE.BufferGeometry {
  return coneAt(0.42, 0.85, [0, -0.15, 0.05], 14);
}

/** Bailiff duty belt. */
export function buildBailiffBelt(): THREE.BufferGeometry {
  return boxAt([0.34, 0.08, 0.3], [0, 0.86, 0]);
}

/** Small badge accent on the bailiff's chest. */
export function buildBailiffBadge(): THREE.BufferGeometry {
  return sphereAt(0.05, [0.14, 1.35, 0.21]);
}
