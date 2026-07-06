import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Text } from '@react-three/drei';
import { useCourtroomMaterials, useFreshCourtroomMaterial } from '../materials';

// Enhanced attorney tables with nameplates and details
export const EnhancedAttorneyTable: React.FC<{
  position: [number, number, number];
  label: string;
  isActive?: boolean;
  isThinking?: boolean;
}> = ({ position, label, isActive, isThinking }) => {
  const materials = useCourtroomMaterials();
  // Fresh (non-shared) clone: the tabletop's `.emissive` is mutated every
  // frame below. A shared instance would make every mesh using the
  // `woodMahogany` preset (benches, plant pots, window frames...) glow too.
  const topMaterial = useFreshCourtroomMaterial('woodMahogany');

  // Animate glow effect for thinking/active state
  useFrame(({ clock }) => {
    if (isThinking) {
      const intensity = 0.5 + Math.sin(clock.elapsedTime * 2.5) * 0.3;
      topMaterial.emissive.setRGB(intensity * 0.3, intensity * 0.3, 0);
    } else if (isActive) {
      topMaterial.emissive.setRGB(0, 0.3, 0.5);
    } else {
      topMaterial.emissive.setRGB(0, 0, 0);
    }
  });

  return (
    <group position={position}>
      {/* Main table */}
      <Box args={[3.5, 0.15, 2]} position={[0, 0.75, 0]} castShadow receiveShadow>
        <primitive object={topMaterial} attach="material" />
      </Box>

      {/* Table legs */}
      {([[-1.6, 0.375, -0.9], [1.6, 0.375, -0.9], [-1.6, 0.375, 0.9], [1.6, 0.375, 0.9]] as [number, number, number][]).map((legPos, i) => (
        <Box key={i} args={[0.1, 0.75, 0.1]} position={legPos} castShadow receiveShadow>
          <primitive object={materials.woodWalnutDark} attach="material" />
        </Box>
      ))}

      {/* Nameplate */}
      <Box args={[2, 0.2, 0.1]} position={[0, 0.9, -0.9]} castShadow>
        <primitive object={materials.brassBrushed} attach="material" />
      </Box>

      {/* Papers and documents */}
      <Box args={[1.5, 0.02, 1]} position={[-0.5, 0.82, 0.2]} castShadow>
        <primitive object={materials.paperWhite} attach="material" />
      </Box>

      {/* Laptop/briefcase */}
      <Box args={[0.8, 0.05, 0.6]} position={[0.8, 0.82, -0.2]} castShadow>
        <primitive object={materials.metalDarkBrushed} attach="material" />
      </Box>

      {/* Water glass */}
      <Sphere args={[0.08]} position={[1.2, 0.9, 0.5]} castShadow>
        <primitive object={materials.glassWaterClear} attach="material" />
      </Sphere>

      {/* Chair */}
      <Box args={[0.8, 1.2, 0.8]} position={[0, 0.6, 1.5]} castShadow receiveShadow>
        <primitive object={materials.fabricChair} attach="material" />
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
