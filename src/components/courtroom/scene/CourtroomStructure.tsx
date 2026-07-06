import React from 'react';
import { Box, Plane, Sphere } from '@react-three/drei';

// Main courtroom floor and walls with welcoming features
export const CourtroomStructure: React.FC = () => {
  return (
    <group>
      {/* Warm hardwood floor */}
      <Plane
        args={[24, 20]}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#DEB887" roughness={0.7} />
      </Plane>

      {/* Carpet runner down center aisle */}
      <Plane
        args={[2, 16]}
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#8B0000" roughness={0.9} />
      </Plane>

      {/* Warm cream back wall */}
      <Plane
        args={[24, 12]}
        position={[0, 6, -10]}
        receiveShadow
      >
        <meshStandardMaterial color="#FFF8DC" roughness={0.9} />
      </Plane>

      {/* Side walls with warm beige */}
      <Plane
        args={[20, 12]}
        position={[-12, 6, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#F5F5DC" roughness={0.9} />
      </Plane>

      <Plane
        args={[20, 12]}
        position={[12, 6, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#F5F5DC" roughness={0.9} />
      </Plane>

      {/* Large windows on side walls for natural light */}
      <Box args={[0.1, 6, 4]} position={[-11.9, 6, -3]} castShadow>
        <meshStandardMaterial color="#E6F3FF" transparent opacity={0.3} roughness={0.1} />
      </Box>

      <Box args={[0.1, 6, 4]} position={[-11.9, 6, 3]} castShadow>
        <meshStandardMaterial color="#E6F3FF" transparent opacity={0.3} roughness={0.1} />
      </Box>

      <Box args={[0.1, 6, 4]} position={[11.9, 6, -3]} castShadow>
        <meshStandardMaterial color="#E6F3FF" transparent opacity={0.3} roughness={0.1} />
      </Box>

      <Box args={[0.1, 6, 4]} position={[11.9, 6, 3]} castShadow>
        <meshStandardMaterial color="#E6F3FF" transparent opacity={0.3} roughness={0.1} />
      </Box>

      {/* Window frames */}
      <Box args={[0.15, 6.2, 0.2]} position={[-11.85, 6, -5]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.4} />
      </Box>

      <Box args={[0.15, 6.2, 0.2]} position={[-11.85, 6, -1]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.4} />
      </Box>

      {/* American flag with pole */}
      <Box args={[0.05, 10, 0.05]} position={[-3, 5, -9.8]} castShadow>
        <meshStandardMaterial color="#DAA520" roughness={0.3} metalness={0.5} />
      </Box>
      <Box args={[0.1, 2, 1.5]} position={[-2.5, 8, -9.5]} castShadow>
        <meshStandardMaterial color="#B22234" roughness={0.6} />
      </Box>

      {/* NY State flag with pole */}
      <Box args={[0.05, 10, 0.05]} position={[3, 5, -9.8]} castShadow>
        <meshStandardMaterial color="#DAA520" roughness={0.3} metalness={0.5} />
      </Box>
      <Box args={[0.1, 2, 1.5]} position={[2.5, 8, -9.5]} castShadow>
        <meshStandardMaterial color="#003f7f" roughness={0.6} />
      </Box>

      {/* Decorative plants in corners */}
      {/* Large potted plant left corner */}
      <Box args={[0.6, 0.8, 0.6]} position={[-10, 0.4, 8]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </Box>
      <Sphere args={[1.2]} position={[-10, 1.5, 8]} castShadow>
        <meshStandardMaterial color="#228B22" roughness={0.8} />
      </Sphere>

      {/* Large potted plant right corner */}
      <Box args={[0.6, 0.8, 0.6]} position={[10, 0.4, 8]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.6} />
      </Box>
      <Sphere args={[1.2]} position={[10, 1.5, 8]} castShadow>
        <meshStandardMaterial color="#228B22" roughness={0.8} />
      </Sphere>

      {/* Classical columns for grandeur but warmth */}
      <Box args={[0.8, 12, 0.8]} position={[-8, 6, -9]} castShadow>
        <meshStandardMaterial color="#F5DEB3" roughness={0.3} />
      </Box>
      <Box args={[0.8, 12, 0.8]} position={[8, 6, -9]} castShadow>
        <meshStandardMaterial color="#F5DEB3" roughness={0.3} />
      </Box>

      {/* Column capitals */}
      <Box args={[1.2, 0.5, 1.2]} position={[-8, 12, -9]} castShadow>
        <meshStandardMaterial color="#DAA520" roughness={0.2} metalness={0.3} />
      </Box>
      <Box args={[1.2, 0.5, 1.2]} position={[8, 12, -9]} castShadow>
        <meshStandardMaterial color="#DAA520" roughness={0.2} metalness={0.3} />
      </Box>
    </group>
  );
};
