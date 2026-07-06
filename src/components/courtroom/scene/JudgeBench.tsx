import React from 'react';
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

  // Animate glow effect for thinking state
  useFrame(({ clock }) => {
    if (isThinking) {
      const intensity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.3;
      bodyMaterial.emissive.setRGB(intensity * 0.2, intensity * 0.2, 0);
    } else if (isActive) {
      bodyMaterial.emissive.setRGB(0, 0.2, 0.3);
    } else {
      bodyMaterial.emissive.setRGB(0, 0, 0);
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

      {/* Judge's chair area (elevated platform) */}
      <Box args={[2, 1.5, 1.5]} position={[0, 2.75, -0.5]} castShadow receiveShadow>
        <primitive object={materials.woodWalnutDark} attach="material" />
      </Box>

      {/* Nameplate area */}
      <Box args={[3, 0.3, 0.1]} position={[0, 1.5, 1.2]} castShadow receiveShadow>
        <primitive object={materials.brassBrushed} attach="material" />
      </Box>

      {/* Court seal behind judge */}
      <Sphere args={[1.2]} position={[0, 3, -1.5]} castShadow>
        <primitive object={materials.brassBrushed} attach="material" />
      </Sphere>

      {/* Gavel rest */}
      <Box args={[0.3, 0.1, 0.3]} position={[1.5, 2.2, 0.5]} castShadow>
        <primitive object={materials.woodMahogany} attach="material" />
      </Box>

      {/* Active speaker glow effect */}
      {isActive && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[8.5, 4.5, 3]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
};
