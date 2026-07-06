import React from 'react';
import { Box, Sphere } from '@react-three/drei';

// Enhanced witness stand with better positioning
export const EnhancedWitnessStand: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  return (
    <group position={[-4, 1, -6]}>
      {/* Main witness box */}
      <Box args={[2.5, 2, 2.5]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.3} metalness={0.1} />
      </Box>

      {/* Witness chair platform */}
      <Box args={[2.2, 0.2, 2.2]} position={[0, 1, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3C2414" roughness={0.2} metalness={0.05} />
      </Box>

      {/* Microphone */}
      <Box args={[0.1, 1, 0.1]} position={[0.8, 1.5, 0.8]} castShadow>
        <meshStandardMaterial color="#2C2C2C" roughness={0.1} metalness={0.9} />
      </Box>

      <Sphere args={[0.15]} position={[0.8, 2.5, 0.8]} castShadow>
        <meshStandardMaterial color="#2C2C2C" roughness={0.1} metalness={0.9} />
      </Sphere>

      {/* Bible/swearing-in book */}
      <Box args={[0.3, 0.05, 0.2]} position={[-0.8, 1.2, 0.5]} castShadow>
        <meshStandardMaterial color="#000080" roughness={0.6} />
      </Box>

      {/* Active speaker glow */}
      {isActive && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3, 2.5, 3]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  );
};
