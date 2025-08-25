import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Box, 
  Plane, 
  Sphere,
  Text,
  PerspectiveCamera,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';
import { Participant } from '../types';
import { useCourtroomStore } from '../store/useCourtroomStore';

interface Props {
  participants: Participant[];
  activeSpeaker?: string;
}

// Enhanced lighting setup with dynamic spotlights
const DynamicLighting: React.FC<{ activeSpeaker?: string }> = ({ activeSpeaker }) => {
  const spotlightRef = useRef<THREE.SpotLight>(null);
  const activePositions = useMemo(() => ({
    'judge': [0, 6, -8],
    'prosecutor': [-3, 2, -2],
    'defense-attorney': [3, 2, -2],
    'witness': [-4, 2, -6],
    'defendant': [2, 2, -4]
  }), []);

  useFrame(() => {
    if (spotlightRef.current && activeSpeaker) {
      const position = activePositions[activeSpeaker as keyof typeof activePositions];
      if (position) {
        spotlightRef.current.target.position.set(position[0], position[1], position[2]);
        spotlightRef.current.target.updateMatrixWorld();
      }
    }
  });

  return (
    <>
      {/* Warm ambient lighting for overall scene */}
      <ambientLight intensity={0.5} color="#fff8dc" />
      
      {/* Main directional light (simulating warm natural light) */}
      <directionalLight
        position={[10, 20, 5]}
        intensity={0.6}
        color="#fff8dc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Judge bench warm uplighting */}
      <spotLight
        position={[0, 8, -6]}
        target-position={[0, 3, -8]}
        intensity={0.8}
        angle={Math.PI / 5}
        penumbra={0.6}
        color="#ffeaa7"
        castShadow
      />
      
      {/* Active speaker gentle spotlight */}
      <spotLight
        ref={spotlightRef}
        position={[0, 15, 0]}
        intensity={activeSpeaker ? 1.2 : 0}
        angle={Math.PI / 6}
        penumbra={0.7}
        color="#ffeaa7"
        castShadow
      />
      
      {/* Courtroom warm general illumination */}
      <spotLight
        position={[-8, 12, 0]}
        target-position={[0, 0, 0]}
        intensity={0.4}
        angle={Math.PI / 3}
        penumbra={0.9}
        color="#fff8dc"
      />
      
      <spotLight
        position={[8, 12, 0]}
        target-position={[0, 0, 0]}
        intensity={0.4}
        angle={Math.PI / 3}
        penumbra={0.9}
        color="#fff8dc"
      />
      
      {/* Soft window lighting simulation */}
      <pointLight
        position={[-12, 6, -3]}
        intensity={0.3}
        color="#fffacd"
      />
      
      <pointLight
        position={[-12, 6, 3]}
        intensity={0.3}
        color="#fffacd"
      />
      
      <pointLight
        position={[12, 6, -3]}
        intensity={0.3}
        color="#fffacd"
      />
      
      <pointLight
        position={[12, 6, 3]}
        intensity={0.3}
        color="#fffacd"
      />
    </>
  );
};

// Enhanced judge bench with proper elevation and details
const EnhancedJudgeBench: React.FC<{ isActive?: boolean; isThinking?: boolean }> = ({ isActive, isThinking }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Animate glow effect for thinking state
  useFrame(({ clock }) => {
    if (meshRef.current && meshRef.current.material && isThinking) {
      const intensity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.3;
      if (meshRef.current.material.emissive) {
        meshRef.current.material.emissive.setRGB(intensity * 0.2, intensity * 0.2, 0);
      }
    } else if (meshRef.current && meshRef.current.material && isActive) {
      if (meshRef.current.material.emissive) {
        meshRef.current.material.emissive.setRGB(0, 0.2, 0.3);
      }
    } else if (meshRef.current && meshRef.current.material) {
      if (meshRef.current.material.emissive) {
        meshRef.current.material.emissive.setRGB(0, 0, 0);
      }
    }
  });
  
  return (
    <group position={[0, 2.5, -8]}>
      {/* Main bench structure - elevated and imposing */}
      <Box args={[8, 4, 2.5]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial 
          ref={meshRef}
          color="#654321" 
          roughness={0.3} 
          metalness={0.1}
          emissive="#000000"
        />
      </Box>
      
      {/* Bench top surface */}
      <Box args={[7.5, 0.2, 2.2]} position={[0, 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3C2414" roughness={0.2} metalness={0.05} />
      </Box>
      
      {/* Judge's chair area (elevated platform) */}
      <Box args={[2, 1.5, 1.5]} position={[0, 2.75, -0.5]} castShadow receiveShadow>
        <meshStandardMaterial color="#654321" roughness={0.3} metalness={0.1} />
      </Box>
      
      {/* Nameplate area */}
      <Box args={[3, 0.3, 0.1]} position={[0, 1.5, 1.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#B8860B" roughness={0.1} metalness={0.8} />
      </Box>
      
      {/* Court seal behind judge */}
      <Sphere args={[1.2]} position={[0, 3, -1.5]} castShadow>
        <meshStandardMaterial color="#B8860B" roughness={0.1} metalness={0.8} />
      </Sphere>
      
      {/* Gavel rest */}
      <Box args={[0.3, 0.1, 0.3]} position={[1.5, 2.2, 0.5]} castShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.4} />
      </Box>
      
      {/* Active speaker glow effect */}
      {isActive && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[8.5, 4.5, 3]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
};

// Enhanced witness stand with better positioning
const EnhancedWitnessStand: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
  return (
    <group position={[-4, 1, -6]}>
      {/* Main witness box */}
      <Box args={[2.5, 2, 2.5]} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" roughness={0.3} metalness={0.1} />
      </Box>
      
      {/* Witness chair platform */}
      <Box args={[2.2, 0.2, 2.2]} position={[0, 1, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#3C2414" roughness={0.2} metalness={0.05} />
      </Box>
      
      {/* Microphone */}
      <Box args={[0.1, 1, 0.1]} position={[0.8, 1.5, 0.8]} castShadow>
        <meshStandardMaterial color="#2C2C2C" roughness={0.1} metalness={0.9} />
      </Box>
      
      <Sphere args={[0.15]} position={[0.8, 2.5, 0.8]} castShadow>
        <meshStandardMaterial color="#2C2C2C" roughness={0.1} metalness={0.9} />
      </Sphere>
      
      {/* Bible/swearing-in book */}
      <Box args={[0.3, 0.05, 0.2]} position={[-0.8, 1.2, 0.5]} castShadow>
        <meshStandardMaterial color="#000080" roughness={0.6} />
      </Box>
      
      {/* Active speaker glow */}
      {isActive && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3, 2.5, 3]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  );
};

// Enhanced attorney tables with nameplates and details
const EnhancedAttorneyTable: React.FC<{ 
  position: [number, number, number]; 
  label: string;
  isActive?: boolean;
  isThinking?: boolean;
}> = ({ position, label, isActive, isThinking }) => {
  const tableRef = useRef<THREE.Mesh>(null);
  
  // Animate glow effect for thinking/active state
  useFrame(({ clock }) => {
    if (tableRef.current && tableRef.current.material && isThinking) {
      const intensity = 0.5 + Math.sin(clock.elapsedTime * 2.5) * 0.3;
      if (tableRef.current.material.emissive) {
        tableRef.current.material.emissive.setRGB(intensity * 0.3, intensity * 0.3, 0);
      }
    } else if (tableRef.current && tableRef.current.material && isActive) {
      if (tableRef.current.material.emissive) {
        tableRef.current.material.emissive.setRGB(0, 0.3, 0.5);
      }
    } else if (tableRef.current && tableRef.current.material) {
      if (tableRef.current.material.emissive) {
        tableRef.current.material.emissive.setRGB(0, 0, 0);
      }
    }
  });
  
  return (
    <group position={position}>
      {/* Main table */}
      <Box args={[3.5, 0.15, 2]} position={[0, 0.75, 0]} castShadow receiveShadow>
        <meshStandardMaterial 
          ref={tableRef}
          color="#8B4513" 
          roughness={0.2} 
          metalness={0.1}
          emissive="#000000"
        />
      </Box>
      
      {/* Table legs */}
      {[[-1.6, 0.375, -0.9], [1.6, 0.375, -0.9], [-1.6, 0.375, 0.9], [1.6, 0.375, 0.9]].map((legPos, i) => (
        <Box key={i} args={[0.1, 0.75, 0.1]} position={legPos} castShadow receiveShadow>
          <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
        </Box>
      ))}
      
      {/* Nameplate */}
      <Box args={[2, 0.2, 0.1]} position={[0, 0.9, -0.9]} castShadow>
        <meshStandardMaterial color="#B8860B" roughness={0.1} metalness={0.8} />
      </Box>
      
      {/* Papers and documents */}
      <Box args={[1.5, 0.02, 1]} position={[-0.5, 0.82, 0.2]} castShadow>
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </Box>
      
      {/* Laptop/briefcase */}
      <Box args={[0.8, 0.05, 0.6]} position={[0.8, 0.82, -0.2]} castShadow>
        <meshStandardMaterial color="#2C2C2C" roughness={0.3} metalness={0.7} />
      </Box>
      
      {/* Water glass */}
      <Sphere args={[0.08]} position={[1.2, 0.9, 0.5]} castShadow>
        <meshStandardMaterial color="#E6F3FF" transparent opacity={0.7} roughness={0.1} />
      </Sphere>
      
      {/* Chair */}
      <Box args={[0.8, 1.2, 0.8]} position={[0, 0.6, 1.5]} castShadow receiveShadow>
        <meshStandardMaterial color="#654321" roughness={0.4} metalness={0.1} />
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

// Enhanced jury box with individual seats
const EnhancedJuryBox: React.FC<{ 
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

// Gallery seating for observers
const GallerySeating: React.FC = () => {
  const rows = 4;
  const seatsPerRow = 8;
  
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

// Court reporter station
const CourtReporterStation: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
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
const BailiffStation: React.FC<{ isActive?: boolean }> = ({ isActive }) => {
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

// Main courtroom floor and walls with welcoming features
const CourtroomStructure: React.FC = () => {
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

export const ImprovedCourtroom3D: React.FC<Props> = ({ participants, activeSpeaker }) => {
  const { activeLLMAgents, isProcessingAI, currentAIOperation } = useCourtroomStore();
  
  const getActiveParticipantRole = (speakerId: string): string => {
    const participant = participants.find(p => p.id === speakerId);
    return participant?.role || '';
  };

  const getThinkingParticipants = (): string[] => {
    const thinkingRoles: string[] = [];
    
    // Check which agents are currently thinking
    Array.from(activeLLMAgents.values()).forEach(agent => {
      if (agent.status === 'thinking') {
        thinkingRoles.push(agent.role);
      }
    });
    
    // Also check if current AI operation mentions specific roles
    if (isProcessingAI && currentAIOperation) {
      const operation = currentAIOperation.toLowerCase();
      participants.forEach(p => {
        if (operation.includes(p.name.toLowerCase()) || operation.includes(p.role)) {
          if (!thinkingRoles.includes(p.role)) {
            thinkingRoles.push(p.role);
          }
        }
      });
    }
    
    return thinkingRoles;
  };

  const activeRole = activeSpeaker ? getActiveParticipantRole(activeSpeaker) : '';
  const thinkingRoles = getThinkingParticipants();

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 60 }}>
        {/* Dynamic lighting based on active speaker */}
        <DynamicLighting activeSpeaker={activeRole} />
        
        {/* Courtroom structure */}
        <CourtroomStructure />
        
        {/* Enhanced judge bench - properly elevated and detailed */}
        <EnhancedJudgeBench 
          isActive={activeRole === 'judge'} 
          isThinking={thinkingRoles.includes('judge')}
        />
        
        {/* Enhanced witness stand */}
        <EnhancedWitnessStand isActive={activeRole === 'witness'} />
        
        {/* Attorney tables with proper labeling */}
        <EnhancedAttorneyTable 
          position={[-3, 0, -2]} 
          label="PROSECUTION"
          isActive={activeRole === 'prosecutor'}
          isThinking={thinkingRoles.includes('prosecutor')}
        />
        <EnhancedAttorneyTable 
          position={[3, 0, -2]} 
          label="DEFENSE"
          isActive={activeRole === 'defense-attorney'}
          isThinking={thinkingRoles.includes('defense-attorney')}
        />
        
        {/* Enhanced jury box */}
        <EnhancedJuryBox 
          jurySize={participants.filter(p => p.role === 'jury-member').length}
          activeJurors={activeRole === 'jury-member' ? [activeSpeaker || ''] : []}
        />
        
        {/* Court staff stations */}
        <CourtReporterStation isActive={activeRole === 'court-clerk'} />
        <BailiffStation isActive={activeRole === 'bailiff'} />
        
        {/* Gallery seating */}
        <GallerySeating />
        
        {/* Camera controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={25}
          target={[0, 2, -4]}
        />
        
        {/* Environment mapping for natural lighting */}
        <Environment preset="apartment" />
        
        {/* Warm fog for depth */}
        <fog attach="fog" args={['#FFF8DC', 25, 60]} />
      </Canvas>
    </div>
  );
};