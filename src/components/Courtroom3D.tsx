import React, { useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Text3D, Center, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Participant } from '../types';

interface Props {
  participants: Participant[];
  activeSpeaker?: string;
}

const JudgeBench: React.FC = () => {
  return (
    <group position={[0, 1.5, -8]}>
      <Box args={[6, 3, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[5.5, 0.1, 1.8]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#3C2414" />
      </Box>
      <Box args={[1, 1.5, 1]} position={[0, 2.25, 0]}>
        <meshStandardMaterial color="#654321" />
      </Box>
    </group>
  );
};

const WitnessStand: React.FC = () => {
  return (
    <group position={[-4, 0.75, -6]}>
      <Box args={[2, 1.5, 2]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      <Box args={[1.8, 0.1, 1.8]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#3C2414" />
      </Box>
    </group>
  );
};

const AttorneyTable: React.FC<{ position: [number, number, number]; label: string }> = ({ position, label }) => {
  return (
    <group position={position}>
      <Box args={[3, 0.1, 1.5]} position={[0, 0.75, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      <Box args={[0.1, 0.75, 0.1]} position={[-1.4, 0.375, -0.7]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[0.1, 0.75, 0.1]} position={[1.4, 0.375, -0.7]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[0.1, 0.75, 0.1]} position={[-1.4, 0.375, 0.7]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      <Box args={[0.1, 0.75, 0.1]} position={[1.4, 0.375, 0.7]}>
        <meshStandardMaterial color="#654321" />
      </Box>
    </group>
  );
};

const JuryBox: React.FC<{ jurySize: number }> = ({ jurySize }) => {
  const positions: [number, number, number][] = [];
  const rows = Math.ceil(jurySize / 6);
  
  for (let row = 0; row < rows; row++) {
    const seatsInRow = Math.min(6, jurySize - row * 6);
    for (let seat = 0; seat < seatsInRow; seat++) {
      positions.push([
        6 + seat * 0.8,
        0.5 + row * 0.8,
        -4 - row * 0.8
      ]);
    }
  }

  return (
    <group>
      <Box args={[6, 0.1, 3]} position={[8, 0.4, -4]}>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      <Box args={[0.1, 2, 3]} position={[5, 1, -4]}>
        <meshStandardMaterial color="#654321" />
      </Box>
      {positions.map((pos, index) => (
        <Box key={index} args={[0.6, 0.8, 0.6]} position={pos}>
          <meshStandardMaterial color="#3C2414" />
        </Box>
      ))}
    </group>
  );
};

const GallerySeating: React.FC = () => {
  const rows = 3;
  const seatsPerRow = 8;
  const seats = [];

  for (let row = 0; row < rows; row++) {
    for (let seat = 0; seat < seatsPerRow; seat++) {
      seats.push(
        <Box 
          key={`${row}-${seat}`}
          args={[0.6, 0.6, 0.6]} 
          position={[-4 + seat * 1, 0.3, 4 + row * 1.2]}
        >
          <meshStandardMaterial color="#3C2414" />
        </Box>
      );
    }
  }

  return <group>{seats}</group>;
};

const CharacterModel: React.FC<{ participant: Participant; position: [number, number, number]; isActive: boolean }> = ({ 
  participant, 
  position, 
  isActive 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <group position={position}>
      <Box args={[0.4, 1.6, 0.4]} position={[0, 0.8, 0]} ref={meshRef}>
        <meshStandardMaterial 
          color={isActive ? '#FFD700' : '#404040'} 
          emissive={isActive ? '#FFD700' : '#000000'}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </Box>
      <Box args={[0.3, 0.3, 0.3]} position={[0, 1.8, 0]}>
        <meshStandardMaterial color="#FDB5A7" />
      </Box>
      <Center position={[0, 2.3, 0]}>
        <Text3D
          font="/fonts/helvetiker_regular.typeface.json"
          size={0.1}
          height={0.01}
          curveSegments={12}
        >
          {participant.name}
          <meshStandardMaterial color="white" />
        </Text3D>
      </Center>
    </group>
  );
};

export const Courtroom3D: React.FC<Props> = ({ participants, activeSpeaker }) => {
  const getParticipantPosition = (role: string): [number, number, number] => {
    const positions: Record<string, [number, number, number]> = {
      'judge': [0, 2, -8],
      'prosecutor': [-3, 0, -2],
      'plaintiff': [-3, 0, -2],
      'defendant': [3, 0, -2],
      'defense-attorney': [2, 0, -2],
      'plaintiff-attorney': [-2, 0, -2],
      'witness': [-4, 1, -6],
      'bailiff': [-6, 0, -7],
      'court-clerk': [2, 0, -7],
    };
    return positions[role] || [0, 0, 0];
  };

  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 8, 12]} fov={60} />
        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
        />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <pointLight position={[0, 5, 0]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <Plane args={[30, 30]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <meshStandardMaterial color="#8B7355" />
          </Plane>
          
          <Plane args={[30, 15]} rotation={[0, 0, 0]} position={[0, 7.5, -10]} receiveShadow>
            <meshStandardMaterial color="#D2B48C" />
          </Plane>
          
          <Plane args={[15, 15]} rotation={[0, Math.PI / 2, 0]} position={[-15, 7.5, 0]} receiveShadow>
            <meshStandardMaterial color="#D2B48C" />
          </Plane>
          
          <Plane args={[15, 15]} rotation={[0, -Math.PI / 2, 0]} position={[15, 7.5, 0]} receiveShadow>
            <meshStandardMaterial color="#D2B48C" />
          </Plane>
          
          <JudgeBench />
          <WitnessStand />
          <AttorneyTable position={[-3, 0, -2]} label="Prosecution" />
          <AttorneyTable position={[3, 0, -2]} label="Defense" />
          <JuryBox jurySize={6} />
          <GallerySeating />
          
          {participants.map((participant) => (
            <CharacterModel
              key={participant.id}
              participant={participant}
              position={getParticipantPosition(participant.role)}
              isActive={activeSpeaker === participant.id}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
};