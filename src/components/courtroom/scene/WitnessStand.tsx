import React from 'react';
import { Box, Sphere } from '@react-three/drei';
import { useCourtroomMaterials } from '../materials';

// Enhanced witness stand with better positioning
export const EnhancedWitnessStand: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  const materials = useCourtroomMaterials();

  return (
    <group position={[-4, 1, -6]}>
      {/* Main witness box */}
      <Box args={[2.5, 2, 2.5]} position={[0, 0, 0]} castShadow receiveShadow>
        <primitive object={materials.woodMahogany} attach="material" />
      </Box>

      {/* Witness chair platform */}
      <Box args={[2.2, 0.2, 2.2]} position={[0, 1, 0]} castShadow receiveShadow>
        <primitive object={materials.woodEbony} attach="material" />
      </Box>

      {/* Microphone */}
      <Box args={[0.1, 1, 0.1]} position={[0.8, 1.5, 0.8]} castShadow>
        <primitive object={materials.metalDarkBrushed} attach="material" />
      </Box>

      <Sphere args={[0.15]} position={[0.8, 2.5, 0.8]} castShadow>
        <primitive object={materials.metalDarkBrushed} attach="material" />
      </Sphere>

      {/* Bible/swearing-in book */}
      <Box args={[0.3, 0.05, 0.2]} position={[-0.8, 1.2, 0.5]} castShadow>
        <primitive object={materials.accentNavy} attach="material" />
      </Box>

    </group>
  );
};
