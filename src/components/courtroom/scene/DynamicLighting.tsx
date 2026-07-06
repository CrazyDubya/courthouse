import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Enhanced lighting setup with dynamic spotlights
export const DynamicLighting: React.FC<{ activeSpeaker?: string }> = ({ activeSpeaker }) => {
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const prevSpeaker = useRef<string | undefined>(undefined);
  const activePositions = useMemo(() => ({
    'judge': [0, 6, -8],
    'prosecutor': [-3, 2, -2],
    'defense-attorney': [3, 2, -2],
    'witness': [-4, 2, -6],
    'defendant': [2, 2, -4]
  }), []);

  useFrame(() => {
    // The follow-spot target only moves when the active speaker changes; the
    // previous version re-set the target and called updateMatrixWorld() 60x/sec
    // for a stationary target.
    if (activeSpeaker === prevSpeaker.current) return;
    // Don't advance prevSpeaker until the light ref is attached, so we retry
    // next frame rather than skipping the one positioning update.
    if (!spotlightRef.current) return;
    prevSpeaker.current = activeSpeaker;
    if (activeSpeaker) {
      const position = activePositions[activeSpeaker as keyof typeof activePositions];
      if (position) {
        spotlightRef.current.target.position.set(position[0], position[1], position[2]);
        spotlightRef.current.target.updateMatrixWorld();
      }
    }
  });

  return (
    <>
      {/* Warm ambient lighting for overall scene */}
      <ambientLight intensity={0.5} color="#fff8dc" />

      {/* Main directional light (simulating warm natural light) */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.6}
        color="#fff8dc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Judge bench warm uplighting. No castShadow: the directional key light
          already provides the scene's shadows; a shadow-casting spotlight adds a
          whole extra shadow-map pass for a subtle effect. */}
      <spotLight
        position={[0, 8, -6]}
        target-position={[0, 3, -8]}
        intensity={0.8}
        angle={Math.PI / 5}
        penumbra={0.6}
        color="#ffeaa7"
      />

      {/* Active speaker gentle spotlight (target moved in useFrame). No
          castShadow — same reasoning as the uplight. */}
      <spotLight
        ref={spotlightRef}
        position={[0, 15, 0]}
        intensity={activeSpeaker ? 1.2 : 0}
        angle={Math.PI / 6}
        penumbra={0.7}
        color="#ffeaa7"
      />

      {/* Courtroom warm general illumination */}
      <spotLight
        position={[-8, 12, 0]}
        target-position={[0, 0, 0]}
        intensity={0.4}
        angle={Math.PI / 3}
        penumbra={0.9}
        color="#fff8dc"
      />

      <spotLight
        position={[8, 12, 0]}
        target-position={[0, 0, 0]}
        intensity={0.4}
        angle={Math.PI / 3}
        penumbra={0.9}
        color="#fff8dc"
      />

      {/* Soft window lighting simulation */}
      <pointLight
        position={[-12, 6, -3]}
        intensity={0.3}
        color="#fffacd"
      />

      <pointLight
        position={[-12, 6, 3]}
        intensity={0.3}
        color="#fffacd"
      />

      <pointLight
        position={[12, 6, -3]}
        intensity={0.3}
        color="#fffacd"
      />

      <pointLight
        position={[12, 6, 3]}
        intensity={0.3}
        color="#fffacd"
      />
    </>
  );
};
