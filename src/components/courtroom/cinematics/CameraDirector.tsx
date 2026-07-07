import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Participant } from '../../../types';
import { useCourtroomStore } from '../../../store/useCourtroomStore';
import { useLatchedSpeaker } from './useLatchedSpeaker';

// Exponential-damping rate: 1 - e^(-RATE*t) reaches ~95% by t≈1s, ~99% by
// ~1.5s. Frame-rate independent, never overshoots — a slow, deliberate
// re-orientation, never a cut.
const EASE_RATE = 3;
// Below this world distance a re-frame is imperceptible (e.g. prosecutor and
// plaintiff-attorney share one chair anchor) — skip the ease entirely.
const MIN_REFRAME_SQ = 0.05 * 0.05;
// Snap-and-stop once this close, so an invisible micro-lerp doesn't run
// forever fighting the next manual orbit.
const STOP_EPSILON_SQ = 0.01 * 0.01;

/**
 * Minimal structural view of drei's OrbitControls. Using a runtime-checked
 * guard instead of importing the concrete type from `three-stdlib` (a
 * transitive-only dep) keeps this robust against drei version bumps — R3F
 * only types `state.controls` as a generic EventDispatcher.
 */
interface DrivenControls {
  target: THREE.Vector3;
  update: () => void;
  addEventListener: (type: string, listener: (event: unknown) => void) => void;
  removeEventListener: (type: string, listener: (event: unknown) => void) => void;
}

function isDrivenControls(controls: unknown): controls is DrivenControls {
  const c = controls as Partial<DrivenControls> | null;
  return (
    !!c &&
    c.target instanceof THREE.Vector3 &&
    typeof c.update === 'function' &&
    typeof c.addEventListener === 'function'
  );
}

interface CameraDirectorProps {
  participants: Participant[];
  /** Explicit on/off. When omitted, mirrors `isSimulationRunning` — "default
   * ON during a running simulation" without threading the flag through. */
  enabled?: boolean;
}

/**
 * Restrained speaker-following camera. On every NEW spoken line it eases the
 * shared OrbitControls `target` toward the speaker's head-height anchor over
 * ~1s, then stops and hands full orbit/pan/zoom back to the user. HOLDS the
 * last framing across the store's null gaps (it reacts only to
 * `useLatchedSpeaker`, which never goes null). Any manual input cancels an
 * in-flight ease immediately.
 *
 * Only ever writes `controls.target` (never the camera position), then calls
 * the same `controls.update()` OrbitControls calls itself — so retargeting
 * reads as a gentle pan/tilt that preserves the user's distance/angle, never
 * a dolly or a cut. Requires `<OrbitControls makeDefault />` upstream so
 * `useThree(s => s.controls)` resolves. Renders nothing; allocation-free per
 * frame.
 */
export const CameraDirector: React.FC<CameraDirectorProps> = ({ participants, enabled }) => {
  const isSimulationRunning = useCourtroomStore((s) => s.isSimulationRunning);
  const effectiveEnabled = enabled ?? isSimulationRunning;

  const controls = useThree((s) => s.controls);
  const latched = useLatchedSpeaker(participants);

  const desiredTarget = useRef(new THREE.Vector3());
  const easingRef = useRef(false);
  const lastKeyRef = useRef<string | null>(null);

  // Manual input always wins: release the ease the instant the user grabs the
  // controls, so we never pull against their hand.
  useEffect(() => {
    if (!isDrivenControls(controls)) return;
    const onUserStart = () => {
      easingRef.current = false;
    };
    controls.addEventListener('start', onUserStart);
    return () => controls.removeEventListener('start', onUserStart);
  }, [controls]);

  // New line — set the goal and start easing. The ONLY place desiredTarget is
  // written; happens on a store change, never inside useFrame.
  useEffect(() => {
    if (!effectiveEnabled || !latched) return;
    if (lastKeyRef.current === latched.key) return;
    if (!isDrivenControls(controls)) return;
    lastKeyRef.current = latched.key;
    desiredTarget.current.copy(latched.focus);
    if (controls.target.distanceToSquared(desiredTarget.current) < MIN_REFRAME_SQ) {
      easingRef.current = false;
      return;
    }
    easingRef.current = true;
  }, [effectiveEnabled, latched, controls]);

  // Toggled off mid-ease — stop where we are, don't snap back.
  useEffect(() => {
    if (!effectiveEnabled) easingRef.current = false;
  }, [effectiveEnabled]);

  useFrame((_state, delta) => {
    if (!effectiveEnabled || !easingRef.current) return;
    if (!isDrivenControls(controls)) return;

    const target = controls.target;
    const alpha = 1 - Math.exp(-EASE_RATE * delta);
    target.lerp(desiredTarget.current, alpha);
    controls.update();

    if (target.distanceToSquared(desiredTarget.current) < STOP_EPSILON_SQ) {
      target.copy(desiredTarget.current);
      controls.update();
      easingRef.current = false;
    }
  });

  return null;
};
