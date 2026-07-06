import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced judge bench with proper elevation and details
export const EnhancedJudgeBench: React.FC<{ isActive?: boolean; isThinking?: boolean }> = ({ isActive, isThinking }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animate glow effect for thinking state
  useFrame(({ clock }) => {
    const material = meshRef.current?.material as THREE.MeshStandardMaterial | undefined;
    if (material?.emissive) {
      if (isThinking) {
        const intensity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.3;
        material.emissive.setRGB(intensity * 0.2, intensity * 0.2, 0);
      } else if (isActive) {
        material.emissive.setRGB(0, 0.2, 0.3);
      } else {
        material.emissive.setRGB(0, 0, 0);
      }
    }
  });

  return (
    <group position={[0, 2.5, -8]}>
      {/* Main bench structure - elevated and imposing */}
      <Box args={[8, 4, 2.5]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          ref={meshRef}
          color="#654321"
          roughness={0.3}
          metalness={0.1}
          emissive="#000000"
        />
      </Box>

      {/* Bench top surface */}
      <Box args={[7.5, 0.2, 2.2]} position={[0, 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3C2414" roughness={0.2} metalness={0.05} />
      </Box>

      {/* Judge's chair area (elevated platform) */}
      <Box args={[2, 1.5, 1.5]} position={[0, 2.75, -0.5]} castShadow receiveShadow>
        <meshStandardMaterial color="#654321" roughness={0.3} metalness={0.1} />
      </Box>

      {/* Nameplate area */}
      <Box args={[3, 0.3, 0.1]} position={[0, 1.5, 1.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#B8860B" roughness={0.1} metalness={0.8} />
      </Box>

      {/* Court seal behind judge */}
      <Sphere args={[1.2]} position={[0, 3, -1.5]} castShadow>
        <meshStandardMaterial color="#B8860B" roughness={0.1} metalness={0.8} />
      </Sphere>

      {/* Gavel rest */}
      <Box args={[0.3, 0.1, 0.3]} position={[1.5, 2.2, 0.5]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.4} />
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
