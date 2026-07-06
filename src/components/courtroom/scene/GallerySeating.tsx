import React from 'react';
import { Box, Plane } from '@react-three/drei';
import { useCourtroomMaterials } from '../materials';

// Gallery seating for observers
export const GallerySeating: React.FC = () => {
  const materials = useCourtroomMaterials();
  const rows = 4;

  return (
    <group position={[0, 0, 3]}>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <group key={rowIndex} position={[0, 0, rowIndex * 1.5]}>
          {/* Bench (solid wood pew) */}
          <Box
            args={[12, 0.5, 0.8]}
            position={[0, 0.25, 0]}
            castShadow
            receiveShadow
          >
            <primitive object={materials.woodMahogany} attach="material" />
          </Box>

          {/* Backrest */}
          <Box
            args={[12, 1.5, 0.2]}
            position={[0, 1, -0.3]}
            castShadow
            receiveShadow
          >
            <primitive object={materials.woodWalnutDark} attach="material" />
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
        <primitive object={materials.fabricCarpetAisleTan} attach="material" />
      </Plane>
    </group>
  );
};
