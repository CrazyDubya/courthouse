import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { getSeatedFigureGeometry } from './geometry';
import { FigureAppearance } from './appearance';
import { V3 } from './layout';
import {
  IDLE_BREATH_SPEED,
  IDLE_BREATH_AMPLITUDE,
  IDLE_SWAY_SPEED,
  IDLE_SWAY_AMPLITUDE,
  CROWD_ROLE_EMPHASIS,
} from './animation';

export interface CrowdSeatDatum {
  key: string;
  role: 'jury-member' | 'observer';
  position: V3;
  rotationY: number;
  appearance: FigureAppearance;
}

interface CrowdInstancedFiguresProps {
  seats: CrowdSeatDatum[];
  /** Role of the current speaker (coarse fallback — see the emphasis note). */
  activeRole: string;
  /** Exact speaking participant's id, when known. When set, only that one
   * juror/observer emphasizes instead of the whole role — the precise
   * single-figure highlight. Omitting it falls back to role-level emphasis. */
  activeSpeakerId?: string;
}

// Scratch objects reused across every instance, every frame. Writing
// hundreds of instance matrices a second must not allocate hundreds of
// objects a second. Only one crowd is mounted, so module-level scratch is
// safe (useFrame runs synchronously and is never re-entrant).
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _projScreen = new THREE.Matrix4();
const _frustum = new THREE.Frustum();
const BALD_SCALE = 0.0001;

/**
 * Every juror AND every gallery observer, rendered in exactly three draw
 * calls (skin / cloth / hair) no matter how many people are in the room.
 * One `InstancedMesh` per part, one shared geometry per part (from
 * `getSeatedFigureGeometry`, the same trio the seated principals use), and a
 * single `useFrame` writing every instance's matrix with zero per-frame
 * allocation. Jurors and observers are combined into ONE set of instanced
 * meshes — the per-instance matrix already encodes each seat's position and
 * facing, so there is no need to split the crowd by role at the draw-call
 * level.
 *
 * The whole crowd shares one generous bounding sphere; when it falls outside
 * the camera frustum the per-frame animation early-outs entirely. A later
 * optimization pass can split that into jury vs. gallery spheres, or add
 * per-instance distance culling, without restructuring the inner loop.
 */
export const CrowdInstancedFigures: React.FC<CrowdInstancedFiguresProps> = ({
  seats,
  activeRole,
  activeSpeakerId,
}) => {
  const { camera } = useThree();
  const { skin, cloth, hair } = useMemo(() => getSeatedFigureGeometry(), []);

  const skinMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.02 }),
    []
  );
  const clothMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.92, metalness: 0.03 }),
    []
  );
  const hairMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.05 }),
    []
  );
  useEffect(
    () => () => {
      skinMaterial.dispose();
      clothMaterial.dispose();
      hairMaterial.dispose();
    },
    [skinMaterial, clothMaterial, hairMaterial]
  );

  const skinRef = useRef<THREE.InstancedMesh>(null);
  const clothRef = useRef<THREE.InstancedMesh>(null);
  const hairRef = useRef<THREE.InstancedMesh>(null);

  const count = seats.length;

  // Generous bounding sphere around every seat, recomputed only when the
  // roster changes. Used purely to early-out the per-frame update when the
  // entire crowd is off-camera.
  const boundingSphere = useMemo(() => {
    const sphere = new THREE.Sphere(new THREE.Vector3(), 0);
    if (count === 0) return sphere;
    const box = new THREE.Box3();
    const p = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const pos = seats[i].position;
      box.expandByPoint(p.set(pos[0], pos[1], pos[2]));
    }
    box.getBoundingSphere(sphere);
    sphere.radius += 2.5; // cover head height + breathing/sway + lean
    return sphere;
  }, [seats, count]);

  // Per-instance COLOR only changes when the roster changes (a new case
  // loads, a participant is added/removed) — never per-frame. Per-instance
  // TRANSFORM changes every frame for idle animation, written in useFrame.
  useEffect(() => {
    const skinMesh = skinRef.current;
    const clothMesh = clothRef.current;
    const hairMesh = hairRef.current;
    if (!skinMesh || !clothMesh || !hairMesh) return;

    for (let i = 0; i < count; i++) {
      const a = seats[i].appearance;
      skinMesh.setColorAt(i, _color.set(a.skinColor));
      clothMesh.setColorAt(i, _color.set(a.clothColor));
      hairMesh.setColorAt(i, _color.set(a.hairColor));
    }
    if (skinMesh.instanceColor) skinMesh.instanceColor.needsUpdate = true;
    if (clothMesh.instanceColor) clothMesh.instanceColor.needsUpdate = true;
    if (hairMesh.instanceColor) hairMesh.instanceColor.needsUpdate = true;
  }, [seats, count]);

  useFrame((state) => {
    const skinMesh = skinRef.current;
    const clothMesh = clothRef.current;
    const hairMesh = hairRef.current;
    if (!skinMesh || !clothMesh || !hairMesh || count === 0) return;

    // Early-out: whole crowd off-screen -> skip all matrix writes this frame.
    _projScreen.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    _frustum.setFromProjectionMatrix(_projScreen);
    if (!_frustum.intersectsSphere(boundingSphere)) return;

    const t = state.clock.elapsedTime;

    // Intentionally flat and branch-light per instance (no closures, no
    // per-instance object creation) so a per-seat frustum/distance early-out
    // can be dropped in here later without restructuring anything around it.
    for (let i = 0; i < count; i++) {
      const seat = seats[i];
      const a = seat.appearance;

      // Emphasis: when an exact speaker id is known, only that single figure
      // reacts (full lean); otherwise every figure of the speaking role gets
      // a small, uniform "paying attention" lift — there can be a dozen
      // jurors / dozens of observers sharing one role.
      const isActiveFigure =
        seat.role === activeRole && (!activeSpeakerId || seat.key === activeSpeakerId);
      const emphasis = isActiveFigure ? (activeSpeakerId ? 1 : CROWD_ROLE_EMPHASIS) : 0;

      const breathe = Math.sin(t * IDLE_BREATH_SPEED + a.phase) * IDLE_BREATH_AMPLITUDE;
      const sway = Math.sin(t * IDLE_SWAY_SPEED + a.swayPhase) * IDLE_SWAY_AMPLITUDE * (1 + emphasis);

      _dummy.position.set(seat.position[0], seat.position[1] + breathe, seat.position[2]);
      _dummy.rotation.set(-emphasis * 0.08, seat.rotationY + sway, 0);
      _dummy.scale.set(a.buildScale, a.heightScale * (1 + emphasis * 0.03), a.buildScale);
      _dummy.updateMatrix();
      clothMesh.setMatrixAt(i, _dummy.matrix);
      skinMesh.setMatrixAt(i, _dummy.matrix);

      if (a.bald) {
        // Collapse the hair instance instead of skipping it — every index
        // needs a matrix written every frame since all three meshes share
        // the same instance count.
        _dummy.scale.set(BALD_SCALE, BALD_SCALE, BALD_SCALE);
        _dummy.updateMatrix();
      }
      hairMesh.setMatrixAt(i, _dummy.matrix);
    }

    clothMesh.instanceMatrix.needsUpdate = true;
    skinMesh.instanceMatrix.needsUpdate = true;
    hairMesh.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <group name="courtroom-crowd">
      {/* Keyed on `count`: an InstancedMesh sizes its buffers once at
          construction, so a roster-size change intentionally remounts to a
          fresh instance with the right capacity. The geometry/material
          objects are module-level singletons (see geometry.ts) passed via
          `args`, not JSX children, so this remount never re-creates or
          disposes them. */}
      <instancedMesh
        key={`cloth-${count}`}
        ref={clothRef}
        args={[cloth, clothMaterial, count]}
        castShadow
        receiveShadow
      />
      <instancedMesh key={`skin-${count}`} ref={skinRef} args={[skin, skinMaterial, count]} castShadow />
      <instancedMesh key={`hair-${count}`} ref={hairRef} args={[hair, hairMaterial, count]} castShadow />
    </group>
  );
};
