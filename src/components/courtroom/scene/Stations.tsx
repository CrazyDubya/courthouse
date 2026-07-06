import React from 'react';
import { Box } from '@react-three/drei';

// Court reporter station
export const CourtReporterStation: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  return (
    <group position={[-2, 0, -5]}>
      {/* Desk */}
      <Box args={[1.5, 0.1, 1]} position={[0, 0.7, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.3} metalness={0.1} />
      </Box>

      {/* Stenotype machine */}
      <Box args={[0.6, 0.2, 0.4]} position={[0, 0.8, 0]} castShadow>
        <meshStandardMaterial color="#2C2C2C" roughness={0.3} metalness={0.7} />
      </Box>

      {/* Chair */}
      <Box args={[0.6, 0.8, 0.6]} position={[0, 0.4, 0.8]} castShadow receiveShadow>
        <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
      </Box>

      {isActive && (
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[2, 1.2, 1.5]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
};

// Bailiff station
export const BailiffStation: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  return (
    <group position={[3, 0, -3]}>
      {/* Station platform */}
      <Box args={[1, 0.2, 1]} position={[0, 0.1, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
      </Box>

      {isActive && (
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 1.5]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
};
