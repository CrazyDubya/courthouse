import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ParticipantRole } from '../../../types';
import { buildFigureAppearance } from './appearance';
import {
  getSeatedFigureGeometry,
  getStandingFigureGeometry,
  buildJudgeRobeSkirt,
  buildBailiffBelt,
  buildBailiffBadge,
} from './geometry';
import {
  IDLE_BREATH_SPEED,
  IDLE_BREATH_AMPLITUDE,
  IDLE_SWAY_SPEED,
  IDLE_SWAY_AMPLITUDE,
  ACTIVE_LEAN_ANGLE,
  ACTIVE_LIFT,
  ACTIVE_SMOOTHING,
  THINKING_EMPHASIS,
} from './animation';
import { V3 } from './layout';

interface PrincipalFigureProps {
  /** Participant id — the seed for this figure's deterministic appearance. */
  id: string;
  role: ParticipantRole;
  position: V3;
  rotationY: number;
  isActive: boolean;
  isThinking: boolean;
}

/**
 * One individually-rendered principal (judge, attorneys, parties, witness,
 * clerk, bailiff). At most a handful of these exist at once, so — unlike the
 * jury/gallery crowd — each gets its own small mesh trio instead of an
 * instanced slot. They still point at the SAME shared geometry every other
 * figure in the scene uses (`getSeatedFigureGeometry` /
 * `getStandingFigureGeometry`); only this figure's material colors and this
 * group's transform are unique to it.
 */
export const PrincipalFigure: React.FC<PrincipalFigureProps> = ({
  id,
  role,
  position,
  rotationY,
  isActive,
  isThinking,
}) => {
  const appearance = useMemo(() => buildFigureAppearance(id, role), [id, role]);
  const standing = role === 'bailiff';
  const parts = useMemo(
    () => (standing ? getStandingFigureGeometry() : getSeatedFigureGeometry()),
    [standing]
  );

  const skinMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: appearance.skinColor, roughness: 0.8, metalness: 0.02 }),
    [appearance.skinColor]
  );
  const clothMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: appearance.clothColor, roughness: 0.9, metalness: 0.05 }),
    [appearance.clothColor]
  );
  const hairMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: appearance.hairColor, roughness: 0.55, metalness: 0.05 }),
    [appearance.hairColor]
  );
  // Brass-ish accent for the bailiff's belt/badge. Fixed color (it's a
  // uniform fitting, not a personal choice) so it doesn't need `appearance`.
  const accentMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#c9a227', roughness: 0.4, metalness: 0.7 }),
    []
  );

  useEffect(
    () => () => {
      skinMaterial.dispose();
      clothMaterial.dispose();
      hairMaterial.dispose();
      accentMaterial.dispose();
    },
    [skinMaterial, clothMaterial, hairMaterial, accentMaterial]
  );

  // Role-specific silhouette accents — one-off geometries, never instanced,
  // so they don't belong in the shared cache in `geometry.ts`.
  const judgeRobeSkirt = useMemo(() => (role === 'judge' ? buildJudgeRobeSkirt() : null), [role]);
  const bailiffBelt = useMemo(() => (role === 'bailiff' ? buildBailiffBelt() : null), [role]);
  const bailiffBadge = useMemo(() => (role === 'bailiff' ? buildBailiffBadge() : null), [role]);
  useEffect(
    () => () => {
      judgeRobeSkirt?.dispose();
      bailiffBelt?.dispose();
      bailiffBadge?.dispose();
    },
    [judgeRobeSkirt, bailiffBelt, bailiffBadge]
  );

  const groupRef = useRef<THREE.Group>(null);
  // Smoothed 0..1 "how much is this figure emphasizing speech right now" —
  // ramps toward isActive/isThinking instead of snapping, so the lean-in
  // doesn't pop when the active speaker changes.
  const emphasisRef = useRef(0);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const t = state.clock.elapsedTime;
    const breathe = Math.sin(t * IDLE_BREATH_SPEED + appearance.phase) * IDLE_BREATH_AMPLITUDE;
    const sway = Math.sin(t * IDLE_SWAY_SPEED + appearance.swayPhase) * IDLE_SWAY_AMPLITUDE;

    const target = isActive ? 1 : isThinking ? THINKING_EMPHASIS : 0;
    emphasisRef.current += (target - emphasisRef.current) * Math.min(1, delta * ACTIVE_SMOOTHING);
    const emphasis = emphasisRef.current;

    // Complements the scene's existing spotlight/gold-glow treatment for the
    // active role: lean forward and "sit up" a touch rather than glowing —
    // two different visual channels pointing at the same person.
    group.position.set(position[0], position[1] + breathe, position[2]);
    group.rotation.set(-emphasis * ACTIVE_LEAN_ANGLE, rotationY + sway * (1 - emphasis * 0.5), 0);
    group.scale.setScalar(1 + emphasis * ACTIVE_LIFT);
  });

  const bodyScale: V3 = [appearance.buildScale, appearance.heightScale, appearance.buildScale];

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={parts.cloth} material={clothMaterial} scale={bodyScale} castShadow receiveShadow />
      <mesh geometry={parts.skin} material={skinMaterial} scale={bodyScale} castShadow />
      {!appearance.bald && (
        <mesh geometry={parts.hair} material={hairMaterial} scale={bodyScale} castShadow />
      )}
      {judgeRobeSkirt && <mesh geometry={judgeRobeSkirt} material={clothMaterial} castShadow />}
      {bailiffBelt && <mesh geometry={bailiffBelt} material={accentMaterial} castShadow />}
      {bailiffBadge && <mesh geometry={bailiffBadge} material={accentMaterial} castShadow />}
    </group>
  );
};
