import React from 'react';
import { Box } from '@react-three/drei';
import { useCourtroomMaterials } from '../materials';

// Court reporter station
export const CourtReporterStation: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  const materials = useCourtroomMaterials();

  return (
    <group position={[-2, 0, -5]}>
      {/* Desk */}
      <Box args={[1.5, 0.1, 1]} position={[0, 0.7, 0]} castShadow receiveShadow>
        <primitive object={materials.woodMahogany} attach="material" />
      </Box>

      {/* Stenotype machine */}
      <Box args={[0.6, 0.2, 0.4]} position={[0, 0.8, 0]} castShadow>
        <primitive object={materials.metalDarkBrushed} attach="material" />
      </Box>

      {/* Chair */}
      <Box args={[0.6, 0.8, 0.6]} position={[0, 0.4, 0.8]} castShadow receiveShadow>
        <primitive object={materials.fabricChair} attach="material" />
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
  const materials = useCourtroomMaterials();

  return (
    <group position={[3, 0, -3]}>
      {/* Station platform */}
      <Box args={[1, 0.2, 1]} position={[0, 0.1, 0]} castShadow receiveShadow>
        <primitive object={materials.woodWalnutDark} attach="material" />
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
