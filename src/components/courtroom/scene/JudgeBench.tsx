import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere } from '@react-three/drei';
import { useCourtroomMaterials, useFreshCourtroomMaterial } from '../materials';

// Enhanced judge bench with proper elevation and details
export const EnhancedJudgeBench: React.FC<{ isActive?: boolean; isThinking?: boolean }> = ({ isActive, isThinking }) => {
  const materials = useCourtroomMaterials();
  // Fresh (non-shared) clone: this material's `.emissive` is mutated every
  // frame below. A shared instance would make every other mesh using the
  // `woodWalnutDark` preset glow along with the bench.
  const bodyMaterial = useFreshCourtroomMaterial('woodWalnutDark');
  const glowState = useRef('');

  // Animate glow effect for thinking state. Only the pulsing "thinking" state
  // needs a per-frame write; the steady active/idle colors are written once on
  // transition (tracked via glowState) so idle frames touch no material uniform.
  useFrame(({ clock }) => {
    if (isThinking) {
      const intensity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.3;
      bodyMaterial.emissive.setRGB(intensity * 0.2, intensity * 0.2, 0);
      glowState.current = 'thinking';
    } else if (isActive) {
      if (glowState.current !== 'active') {
        // Warm gold to match the palette — the old teal read muddy on wood.
        bodyMaterial.emissive.setRGB(0.18, 0.13, 0.03);
        glowState.current = 'active';
      }
    } else if (glowState.current !== 'idle') {
      bodyMaterial.emissive.setRGB(0, 0, 0);
      glowState.current = 'idle';
    }
  });

  return (
    <group position={[0, 2.5, -8]}>
      {/* Main bench structure - elevated and imposing */}
      <Box args={[8, 4, 2.5]} position={[0, 0, 0]} castShadow receiveShadow>
        <primitive object={bodyMaterial} attach="material" />
      </Box>

      {/* Bench top surface */}
      <Box args={[7.5, 0.2, 2.2]} position={[0, 2, 0]} castShadow receiveShadow>
        <primitive object={materials.woodEbony} attach="material" />
      </Box>

      {/* Judge's chair: a real seat + backrest instead of the old solid
          1.5-tall platform block — the seated judge figure (hips on the seat
          surface, world y≈4.68) now reads head-and-shoulders above the bench
          top instead of being embedded inside a box. */}
      <Box args={[1.6, 0.15, 1.2]} position={[0, 2.1, -0.6]} castShadow receiveShadow>
        <primitive object={materials.woodWalnutDark} attach="material" />
      </Box>
      <Box args={[1.7, 1.2, 0.15]} position={[0, 2.95, -1.1]} castShadow receiveShadow>
        <primitive object={materials.woodWalnutDark} attach="material" />
      </Box>

      {/* Nameplate area */}
      <Box args={[3, 0.3, 0.1]} position={[0, 1.5, 1.2]} castShadow receiveShadow>
        <primitive object={materials.brassBrushed} attach="material" />
      </Box>

      {/* Court seal: flattened into a wall medallion behind/above the chair —
          the old full sphere (r=1.2) physically intersected the judge's torso. */}
      <Sphere args={[1.2]} scale={[1, 1, 0.18]} position={[0, 3.4, -1.75]} castShadow>
        <primitive object={materials.brassBrushed} attach="material" />
      </Sphere>

      {/* Gavel rest */}
      <Box args={[0.3, 0.1, 0.3]} position={[1.5, 2.2, 0.5]} castShadow>
        <primitive object={materials.woodMahogany} attach="material" />
      </Box>
    </group>
  );
};
