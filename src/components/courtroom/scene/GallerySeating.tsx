import React from 'react';
import { Instance, Instances, Plane } from '@react-three/drei';
import { useCourtroomMaterials } from '../materials';

// Gallery seating for observers
export const GallerySeating: React.FC = () => {
  const materials = useCourtroomMaterials();
  const rows = 4;
  const rowIndices = Array.from({ length: rows }, (_, rowIndex) => rowIndex);

  return (
    <group position={[0, 0, 3]}>
      {/* Instanced benches (solid wood pews) — one draw call for all rows */}
      <Instances castShadow receiveShadow>
        <boxGeometry args={[12, 0.5, 0.8]} />
        <primitive object={materials.woodMahogany} attach="material" />
        {rowIndices.map((rowIndex) => (
          <Instance key={rowIndex} position={[0, 0.25, rowIndex * 1.5]} />
        ))}
      </Instances>

      {/* Instanced backrests — one draw call for all rows */}
      <Instances castShadow receiveShadow>
        <boxGeometry args={[12, 1.5, 0.2]} />
        <primitive object={materials.woodWalnutDark} attach="material" />
        {rowIndices.map((rowIndex) => (
          <Instance key={rowIndex} position={[0, 1, rowIndex * 1.5 - 0.3]} />
        ))}
      </Instances>

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
