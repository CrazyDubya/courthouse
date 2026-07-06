import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

// Enhanced attorney tables with nameplates and details
export const EnhancedAttorneyTable: React.FC<{
  position: [number, number, number];
  label: string;
  isActive?: boolean;
  isThinking?: boolean;
}> = ({ position, label, isActive, isThinking }) => {
  const tableRef = useRef<THREE.Mesh>(null);

  // Animate glow effect for thinking/active state
  useFrame(({ clock }) => {
    const material = tableRef.current?.material as THREE.MeshStandardMaterial | undefined;
    if (material?.emissive) {
      if (isThinking) {
        const intensity = 0.5 + Math.sin(clock.elapsedTime * 2.5) * 0.3;
        material.emissive.setRGB(intensity * 0.3, intensity * 0.3, 0);
      } else if (isActive) {
        material.emissive.setRGB(0, 0.3, 0.5);
      } else {
        material.emissive.setRGB(0, 0, 0);
      }
    }
  });

  return (
    <group position={position}>
      {/* Main table */}
      <Box args={[3.5, 0.15, 2]} position={[0, 0.75, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          ref={tableRef}
          color="#8B4513"
          roughness={0.2}
          metalness={0.1}
          emissive="#000000"
        />
      </Box>

      {/* Table legs */}
      {([[-1.6, 0.375, -0.9], [1.6, 0.375, -0.9], [-1.6, 0.375, 0.9], [1.6, 0.375, 0.9]] as [number, number, number][]).map((legPos, i) => (
        <Box key={i} args={[0.1, 0.75, 0.1]} position={legPos} castShadow receiveShadow>
          <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
        </Box>
      ))}

      {/* Nameplate */}
      <Box args={[2, 0.2, 0.1]} position={[0, 0.9, -0.9]} castShadow>
        <meshStandardMaterial color="#B8860B" roughness={0.1} metalness={0.8} />
      </Box>

      {/* Papers and documents */}
      <Box args={[1.5, 0.02, 1]} position={[-0.5, 0.82, 0.2]} castShadow>
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </Box>

      {/* Laptop/briefcase */}
      <Box args={[0.8, 0.05, 0.6]} position={[0.8, 0.82, -0.2]} castShadow>
        <meshStandardMaterial color="#2C2C2C" roughness={0.3} metalness={0.7} />
      </Box>

      {/* Water glass */}
      <Sphere args={[0.08]} position={[1.2, 0.9, 0.5]} castShadow>
        <meshStandardMaterial color="#E6F3FF" transparent opacity={0.7} roughness={0.1} />
      </Sphere>

      {/* Chair */}
      <Box args={[0.8, 1.2, 0.8]} position={[0, 0.6, 1.5]} castShadow receiveShadow>
        <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
      </Box>

      {/* Active speaker glow */}
      {isActive && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 1.5, 2.5]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.12} />
        </mesh>
      )}

      {/* Table label */}
      <Text
        position={[0, 1.1, -0.8]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.2}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};
