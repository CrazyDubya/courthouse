import React from 'react';
import { Box, Plane } from '@react-three/drei';

// Gallery seating for observers
export const GallerySeating: React.FC = () => {
  const rows = 4;

  return (
    <group position={[0, 0, 3]}>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <group key={rowIndex} position={[0, 0, rowIndex * 1.5]}>
          {/* Bench */}
          <Box
            args={[12, 0.5, 0.8]}
            position={[0, 0.25, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#8B4513" roughness={0.4} metalness={0.1} />
          </Box>

          {/* Backrest */}
          <Box
            args={[12, 1.5, 0.2]}
            position={[0, 1, -0.3]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
          </Box>
        </group>
      ))}

      {/* Center aisle */}
      <Plane
        args={[1, 8]}
        position={[0, 0.01, 3]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#D2B48C" roughness={0.8} />
      </Plane>
    </group>
  );
};
