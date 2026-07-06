import React from 'react';
import { Box, Plane, Sphere } from '@react-three/drei';
import { useCourtroomMaterials } from '../materials';

// Main courtroom floor and walls with welcoming features
export const CourtroomStructure: React.FC = () => {
  const materials = useCourtroomMaterials();

  return (
    <group>
      {/* Warm hardwood floor */}
      <Plane
        args={[24, 20]}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <primitive object={materials.woodFloor} attach="material" />
      </Plane>

      {/* Carpet runner down center aisle */}
      <Plane
        args={[2, 16]}
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <primitive object={materials.fabricCarpetRunner} attach="material" />
      </Plane>

      {/* Warm cream back wall */}
      <Plane
        args={[24, 12]}
        position={[0, 6, -10]}
        receiveShadow
      >
        <primitive object={materials.plasterWallCream} attach="material" />
      </Plane>

      {/* Side walls with warm beige */}
      <Plane
        args={[20, 12]}
        position={[-12, 6, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <primitive object={materials.plasterWallBeige} attach="material" />
      </Plane>

      <Plane
        args={[20, 12]}
        position={[12, 6, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <primitive object={materials.plasterWallBeige} attach="material" />
      </Plane>

      {/* Large windows on side walls for natural light */}
      <Box args={[0.1, 6, 4]} position={[-11.9, 6, -3]} castShadow>
        <primitive object={materials.glassWindowPane} attach="material" />
      </Box>

      <Box args={[0.1, 6, 4]} position={[-11.9, 6, 3]} castShadow>
        <primitive object={materials.glassWindowPane} attach="material" />
      </Box>

      <Box args={[0.1, 6, 4]} position={[11.9, 6, -3]} castShadow>
        <primitive object={materials.glassWindowPane} attach="material" />
      </Box>

      <Box args={[0.1, 6, 4]} position={[11.9, 6, 3]} castShadow>
        <primitive object={materials.glassWindowPane} attach="material" />
      </Box>

      {/* Window frames */}
      <Box args={[0.15, 6.2, 0.2]} position={[-11.85, 6, -5]} castShadow>
        <primitive object={materials.woodMahogany} attach="material" />
      </Box>

      <Box args={[0.15, 6.2, 0.2]} position={[-11.85, 6, -1]} castShadow>
        <primitive object={materials.woodMahogany} attach="material" />
      </Box>

      {/* American flag with pole */}
      <Box args={[0.05, 10, 0.05]} position={[-3, 5, -9.8]} castShadow>
        <primitive object={materials.brassPolished} attach="material" />
      </Box>
      <Box args={[0.1, 2, 1.5]} position={[-2.5, 8, -9.5]} castShadow>
        <primitive object={materials.fabricFlagStripe} attach="material" />
      </Box>

      {/* NY State flag with pole */}
      <Box args={[0.05, 10, 0.05]} position={[3, 5, -9.8]} castShadow>
        <primitive object={materials.brassPolished} attach="material" />
      </Box>
      <Box args={[0.1, 2, 1.5]} position={[2.5, 8, -9.5]} castShadow>
        <primitive object={materials.fabricFlagNavy} attach="material" />
      </Box>

      {/* Decorative plants in corners */}
      {/* Large potted plant left corner */}
      <Box args={[0.6, 0.8, 0.6]} position={[-10, 0.4, 8]} castShadow>
        <primitive object={materials.woodMahogany} attach="material" />
      </Box>
      <Sphere args={[1.2]} position={[-10, 1.5, 8]} castShadow>
        <primitive object={materials.foliageLeaf} attach="material" />
      </Sphere>

      {/* Large potted plant right corner */}
      <Box args={[0.6, 0.8, 0.6]} position={[10, 0.4, 8]} castShadow>
        <primitive object={materials.woodMahogany} attach="material" />
      </Box>
      <Sphere args={[1.2]} position={[10, 1.5, 8]} castShadow>
        <primitive object={materials.foliageLeaf} attach="material" />
      </Sphere>

      {/* Classical columns for grandeur but warmth */}
      <Box args={[0.8, 12, 0.8]} position={[-8, 6, -9]} castShadow>
        <primitive object={materials.marbleColumn} attach="material" />
      </Box>
      <Box args={[0.8, 12, 0.8]} position={[8, 6, -9]} castShadow>
        <primitive object={materials.marbleColumn} attach="material" />
      </Box>

      {/* Column capitals */}
      <Box args={[1.2, 0.5, 1.2]} position={[-8, 12, -9]} castShadow>
        <primitive object={materials.brassPolished} attach="material" />
      </Box>
      <Box args={[1.2, 0.5, 1.2]} position={[8, 12, -9]} castShadow>
        <primitive object={materials.brassPolished} attach="material" />
      </Box>
    </group>
  );
};
