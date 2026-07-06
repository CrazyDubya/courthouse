import React from 'react';
import { Box, Text } from '@react-three/drei';

// Enhanced jury box with individual seats
export const EnhancedJuryBox: React.FC<{
  jurySize: number;
  activeJurors?: string[];
}> = ({ jurySize, activeJurors = [] }) => {
  const positions: [number, number, number][] = [];
  const rows = Math.ceil(jurySize / 6);

  for (let row = 0; row < rows; row++) {
    const seatsInRow = Math.min(6, jurySize - row * 6);
    for (let seat = 0; seat < seatsInRow; seat++) {
      positions.push([
        6 + seat * 1.2,
        0.5 + row * 1,
        -4 - row * 1
      ]);
    }
  }

  return (
    <group>
      {/* Jury box platform */}
      <Box args={[8, 0.3, 4]} position={[8.5, 0.15, -4]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.3} metalness={0.1} />
      </Box>

      {/* Jury box railings */}
      <Box args={[8, 1.5, 0.2]} position={[8.5, 1, -6]} castShadow receiveShadow>
        <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
      </Box>

      <Box args={[0.2, 1.5, 4]} position={[4.5, 1, -4]} castShadow receiveShadow>
        <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
      </Box>

      {/* Individual jury seats */}
      {positions.map((position, index) => (
        <group key={index} position={position}>
          {/* Seat */}
          <Box args={[0.8, 0.1, 0.8]} position={[0, 0.3, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
          </Box>

          {/* Backrest */}
          <Box args={[0.8, 1, 0.1]} position={[0, 0.8, -0.35]} castShadow receiveShadow>
            <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
          </Box>

          {/* Seat number */}
          <Text
            position={[0, 0.4, 0.4]}
            rotation={[-Math.PI / 3, 0, 0]}
            fontSize={0.1}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
          >
            {index + 1}
          </Text>

          {/* Active juror glow */}
          {activeJurors.includes(`juror-${index + 1}`) && (
            <mesh position={[0, 0.3, 0]}>
              <boxGeometry args={[1, 1.5, 1]} />
              <meshBasicMaterial color="#FFD700" transparent opacity={0.1} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};
