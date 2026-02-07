import React, { useRef, useMemo, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Box,
  Plane,
  Sphere,
  Text,
  PerspectiveCamera,
  Environment,
} from '@react-three/drei';
import * as THREE from 'three';
import { Participant, ParticipantRole } from '../types';
import { useCourtroomStore } from '../store/useCourtroomStore';
import {
  getSharedMaterials,
  getSharedGeometries,
  disposeSharedResources,
} from './courtroomMaterials';

interface Props {
  participants: Participant[];
  activeSpeaker?: string;
}

// ---------------------------------------------------------------------------
// Role → 3D position map (used by characters, camera, and lighting)
// ---------------------------------------------------------------------------

const ROLE_POSITIONS: Record<string, [number, number, number]> = {
  judge: [0, 5.5, -8],
  prosecutor: [-3, 1, -1],
  'defense-attorney': [3, 1, -1],
  'plaintiff-attorney': [-3, 1, -1],
  witness: [-4, 2, -6],
  defendant: [2.5, 1, -3.5],
  plaintiff: [-2.5, 1, -3.5],
  bailiff: [3, 1, -3],
  'court-clerk': [-2, 1, -5],
};

const ROLE_COLORS: Record<string, number> = {
  judge: 0x1a1a2e,
  prosecutor: 0x8b0000,
  'defense-attorney': 0x003366,
  'plaintiff-attorney': 0xcc6600,
  witness: 0x2e7d32,
  defendant: 0x555555,
  plaintiff: 0x3a6b35,
  bailiff: 0x333366,
  'court-clerk': 0x4a4a4a,
  'jury-member': 0x444444,
  observer: 0x666666,
};

// ---------------------------------------------------------------------------
// Adaptive quality – reduces detail when FPS drops below threshold
// ---------------------------------------------------------------------------

interface QualityLevel {
  shadowMapSize: number;
  enableFog: boolean;
  enableEnvironment: boolean;
  enableDecorations: boolean;
  enableDetailObjects: boolean;
  maxTextLabels: number;
  enableCharacterAnimations: boolean;
}

const QUALITY_HIGH: QualityLevel = {
  shadowMapSize: 2048,
  enableFog: true,
  enableEnvironment: true,
  enableDecorations: true,
  enableDetailObjects: true,
  maxTextLabels: 20,
  enableCharacterAnimations: true,
};

const QUALITY_MEDIUM: QualityLevel = {
  shadowMapSize: 1024,
  enableFog: true,
  enableEnvironment: false,
  enableDecorations: true,
  enableDetailObjects: false,
  maxTextLabels: 6,
  enableCharacterAnimations: true,
};

const QUALITY_LOW: QualityLevel = {
  shadowMapSize: 512,
  enableFog: false,
  enableEnvironment: false,
  enableDecorations: false,
  enableDetailObjects: false,
  maxTextLabels: 0,
  enableCharacterAnimations: false,
};

const AdaptiveQualityController: React.FC<{
  onQualityChange: (q: QualityLevel) => void;
}> = ({ onQualityChange }) => {
  const frameTimesRef = useRef<number[]>([]);
  const currentQualityRef = useRef<QualityLevel>(QUALITY_HIGH);
  const cooldownRef = useRef(0);

  useFrame((_, delta) => {
    frameTimesRef.current.push(delta);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    cooldownRef.current++;
    if (cooldownRef.current < 120) return;
    cooldownRef.current = 0;

    const avgDelta =
      frameTimesRef.current.reduce((a, b) => a + b, 0) /
      frameTimesRef.current.length;
    const avgFps = 1 / avgDelta;

    let next = currentQualityRef.current;
    if (avgFps < 24) {
      next = QUALITY_LOW;
    } else if (avgFps < 45) {
      next = QUALITY_MEDIUM;
    } else {
      next = QUALITY_HIGH;
    }

    if (next !== currentQualityRef.current) {
      currentQualityRef.current = next;
      onQualityChange(next);
    }
  });

  return null;
};

// ---------------------------------------------------------------------------
// Camera auto-focus: smoothly lerps toward active speaker
// ---------------------------------------------------------------------------

const CameraController: React.FC<{
  activeRole: string;
  controlsRef: React.RefObject<any>;
}> = React.memo(({ activeRole, controlsRef }) => {
  const targetRef = useRef(new THREE.Vector3(0, 2, -4));
  const prevRoleRef = useRef('');

  useFrame(() => {
    if (!controlsRef.current) return;

    // Only update target when speaker changes
    if (activeRole && activeRole !== prevRoleRef.current) {
      prevRoleRef.current = activeRole;
      const pos = ROLE_POSITIONS[activeRole];
      if (pos) {
        targetRef.current.set(pos[0] * 0.5, pos[1] + 1, pos[2] * 0.5);
      }
    } else if (!activeRole && prevRoleRef.current !== '') {
      prevRoleRef.current = '';
      targetRef.current.set(0, 2, -4);
    }

    // Smooth lerp toward target
    const controls = controlsRef.current;
    if (controls.target) {
      controls.target.lerp(targetRef.current, 0.03);
      controls.update();
    }
  });

  return null;
});

CameraController.displayName = 'CameraController';

// ---------------------------------------------------------------------------
// Dynamic Lighting – spotlight follows active speaker
// ---------------------------------------------------------------------------

const DynamicLighting: React.FC<{ activeSpeaker?: string }> = React.memo(
  ({ activeSpeaker }) => {
    const spotlightRef = useRef<THREE.SpotLight>(null);
    const prevSpeakerRef = useRef<string | undefined>(undefined);

    useFrame(() => {
      if (prevSpeakerRef.current === activeSpeaker) return;
      prevSpeakerRef.current = activeSpeaker;

      if (spotlightRef.current && activeSpeaker) {
        const position = ROLE_POSITIONS[activeSpeaker];
        if (position) {
          spotlightRef.current.target.position.set(
            position[0],
            position[1],
            position[2]
          );
          spotlightRef.current.target.updateMatrixWorld();
        }
      }
    });

    return (
      <>
        <ambientLight intensity={0.5} color="#fff8dc" />

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

        <spotLight
          position={[0, 8, -6]}
          target-position={[0, 3, -8]}
          intensity={0.8}
          angle={Math.PI / 5}
          penumbra={0.6}
          color="#ffeaa7"
          castShadow
        />

        <spotLight
          ref={spotlightRef}
          position={[0, 15, 0]}
          intensity={activeSpeaker ? 1.2 : 0}
          angle={Math.PI / 6}
          penumbra={0.7}
          color="#ffeaa7"
        />

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

        <pointLight position={[-12, 6, -3]} intensity={0.3} color="#fffacd" />
        <pointLight position={[12, 6, 3]} intensity={0.3} color="#fffacd" />
      </>
    );
  }
);

DynamicLighting.displayName = 'DynamicLighting';

// ---------------------------------------------------------------------------
// Character Model – animated person sprite with speaking/thinking indicators
// ---------------------------------------------------------------------------

const CharacterModel: React.FC<{
  participant: Participant;
  isSpeaking: boolean;
  isThinking: boolean;
  position: [number, number, number];
  quality: QualityLevel;
}> = React.memo(({ participant, isSpeaking, isThinking, position, quality }) => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => getSharedGeometries(), []);
  const mat = useMemo(() => getSharedMaterials(), []);

  // Per-character body material (needs unique emissive for animation)
  const bodyMat = useMemo(() => {
    const roleColor = ROLE_COLORS[participant.role] || 0x555555;
    const m = new THREE.MeshStandardMaterial({
      color: roleColor,
      roughness: 0.6,
      emissive: new THREE.Color(0x000000),
    });
    return m;
  }, [participant.role]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !quality.enableCharacterAnimations) return;

    if (isSpeaking) {
      // Speaking bob – subtle vertical oscillation
      groupRef.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * 4) * 0.05;
      bodyMat.emissive.setRGB(0.1, 0.15, 0.05);
    } else if (isThinking) {
      bodyMat.emissive.setRGB(0.05, 0.05, 0.15);
    } else {
      // Idle breathing
      groupRef.current.position.y =
        position[1] + Math.sin(clock.elapsedTime * 1.5) * 0.01;
      if (bodyMat.emissive.r !== 0 || bodyMat.emissive.g !== 0) {
        bodyMat.emissive.setRGB(0, 0, 0);
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh geometry={geo.characterBody} castShadow>
        <primitive object={bodyMat} attach="material" />
      </mesh>

      {/* Shoulders */}
      <mesh
        geometry={geo.characterShoulders}
        position={[0, 0.65, 0]}
      >
        <primitive object={bodyMat} attach="material" />
      </mesh>

      {/* Head */}
      <mesh geometry={geo.characterHead} position={[0, 0.9, 0]} castShadow>
        <primitive object={mat.characterHead} attach="material" />
      </mesh>

      {/* Name label */}
      {quality.maxTextLabels > 0 && (
        <Text
          position={[0, 1.4, 0]}
          fontSize={0.12}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {participant.name}
        </Text>
      )}

      {/* Speaking indicator – pulsing ring */}
      {isSpeaking && (
        <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshBasicMaterial
            color={0x00ff88}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}

      {/* Thinking indicator – floating dots */}
      {isThinking && quality.enableCharacterAnimations && (
        <group position={[0.4, 1.3, 0]}>
          <mesh geometry={geo.thinkingDot} position={[0, 0, 0]}>
            <primitive object={mat.thinkingBubble} attach="material" />
          </mesh>
          <mesh geometry={geo.thinkingDot} position={[0.15, 0.12, 0]}>
            <primitive object={mat.thinkingBubble} attach="material" />
          </mesh>
          <mesh geometry={geo.thinkingBubble} position={[0.35, 0.3, 0]}>
            <primitive object={mat.thinkingBubble} attach="material" />
          </mesh>
        </group>
      )}
    </group>
  );
});

CharacterModel.displayName = 'CharacterModel';

// ---------------------------------------------------------------------------
// Phase transition overlay – shows phase name briefly when phase changes
// ---------------------------------------------------------------------------

const PhaseOverlay: React.FC<{ phase: string }> = React.memo(({ phase }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const opacityRef = useRef(1);
  const prevPhaseRef = useRef(phase);
  const timerRef = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (phase !== prevPhaseRef.current) {
      prevPhaseRef.current = phase;
      opacityRef.current = 1;
      timerRef.current = 0;
    }

    timerRef.current += delta;

    // Hold for 1.5s, then fade over 1s
    if (timerRef.current > 1.5) {
      opacityRef.current = Math.max(0, opacityRef.current - delta * 1.0);
    }

    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    material.opacity = opacityRef.current * 0.6;
    meshRef.current.visible = opacityRef.current > 0.01;
  });

  const formattedPhase = phase
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <group position={[0, 6, 0]}>
      {/* Background plane */}
      <mesh ref={meshRef} position={[0, 0, 4]}>
        <planeGeometry args={[8, 1.5]} />
        <meshBasicMaterial
          color={0x000000}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Phase text */}
      {opacityRef.current > 0.01 && (
        <Text
          position={[0, 0, 4.01]}
          fontSize={0.5}
          color="#FFD700"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {formattedPhase}
        </Text>
      )}
    </group>
  );
});

PhaseOverlay.displayName = 'PhaseOverlay';

// ---------------------------------------------------------------------------
// Judge Bench
// ---------------------------------------------------------------------------

const EnhancedJudgeBench: React.FC<{
  isActive?: boolean;
  isThinking?: boolean;
}> = React.memo(({ isActive, isThinking }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => getSharedMaterials(), []);

  const benchMat = useMemo(() => {
    const m = mat.darkWood.clone();
    m.emissive = new THREE.Color(0x000000);
    return m;
  }, [mat]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    if (isThinking) {
      const intensity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.3;
      benchMat.emissive.setRGB(intensity * 0.2, intensity * 0.2, 0);
    } else if (isActive) {
      benchMat.emissive.setRGB(0, 0.2, 0.3);
    } else {
      if (benchMat.emissive.r !== 0 || benchMat.emissive.g !== 0) {
        benchMat.emissive.setRGB(0, 0, 0);
      }
    }
  });

  return (
    <group position={[0, 2.5, -8]}>
      <Box args={[8, 4, 2.5]} castShadow receiveShadow>
        <primitive object={benchMat} attach="material" ref={meshRef} />
      </Box>
      <Box args={[7.5, 0.2, 2.2]} position={[0, 2, 0]} castShadow receiveShadow>
        <primitive object={mat.benchTop} attach="material" />
      </Box>
      <Box args={[2, 1.5, 1.5]} position={[0, 2.75, -0.5]} castShadow receiveShadow>
        <primitive object={mat.darkWood} attach="material" />
      </Box>
      <Box args={[3, 0.3, 0.1]} position={[0, 1.5, 1.2]} castShadow>
        <primitive object={mat.brassGold} attach="material" />
      </Box>
      <Sphere args={[1.2]} position={[0, 3, -1.5]} castShadow>
        <primitive object={mat.brassGold} attach="material" />
      </Sphere>
      <Box args={[0.3, 0.1, 0.3]} position={[1.5, 2.2, 0.5]}>
        <primitive object={mat.lightWood} attach="material" />
      </Box>
      {isActive && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[8.5, 4.5, 3]} />
          <primitive object={mat.activeGlow} attach="material" />
        </mesh>
      )}
    </group>
  );
});

EnhancedJudgeBench.displayName = 'EnhancedJudgeBench';

// ---------------------------------------------------------------------------
// Witness Stand
// ---------------------------------------------------------------------------

const EnhancedWitnessStand: React.FC<{ isActive?: boolean }> = React.memo(
  ({ isActive }) => {
    const mat = useMemo(() => getSharedMaterials(), []);

    return (
      <group position={[-4, 1, -6]}>
        <Box args={[2.5, 2, 2.5]} castShadow receiveShadow>
          <primitive object={mat.lightWood} attach="material" />
        </Box>
        <Box args={[2.2, 0.2, 2.2]} position={[0, 1, 0]} castShadow receiveShadow>
          <primitive object={mat.benchTop} attach="material" />
        </Box>
        <Box args={[0.1, 1, 0.1]} position={[0.8, 1.5, 0.8]}>
          <primitive object={mat.darkMetal} attach="material" />
        </Box>
        <Sphere args={[0.15]} position={[0.8, 2.5, 0.8]}>
          <primitive object={mat.darkMetal} attach="material" />
        </Sphere>
        <Box args={[0.3, 0.05, 0.2]} position={[-0.8, 1.2, 0.5]}>
          <primitive object={mat.navyBook} attach="material" />
        </Box>
        {isActive && (
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[3, 2.5, 3]} />
            <primitive object={mat.activeGlowStrong} attach="material" />
          </mesh>
        )}
      </group>
    );
  }
);

EnhancedWitnessStand.displayName = 'EnhancedWitnessStand';

// ---------------------------------------------------------------------------
// Attorney Table
// ---------------------------------------------------------------------------

const TABLE_LEG_POSITIONS: [number, number, number][] = [
  [-1.6, 0.375, -0.9],
  [1.6, 0.375, -0.9],
  [-1.6, 0.375, 0.9],
  [1.6, 0.375, 0.9],
];

const EnhancedAttorneyTable: React.FC<{
  position: [number, number, number];
  label: string;
  isActive?: boolean;
  isThinking?: boolean;
}> = React.memo(({ position, label, isActive, isThinking }) => {
  const mat = useMemo(() => getSharedMaterials(), []);
  const geo = useMemo(() => getSharedGeometries(), []);

  const tableMat = useMemo(() => {
    const m = mat.lightWood.clone();
    m.emissive = new THREE.Color(0x000000);
    return m;
  }, [mat]);

  useFrame(({ clock }) => {
    if (isThinking) {
      const intensity = 0.5 + Math.sin(clock.elapsedTime * 2.5) * 0.3;
      tableMat.emissive.setRGB(intensity * 0.3, intensity * 0.3, 0);
    } else if (isActive) {
      tableMat.emissive.setRGB(0, 0.3, 0.5);
    } else {
      if (tableMat.emissive.r !== 0 || tableMat.emissive.g !== 0) {
        tableMat.emissive.setRGB(0, 0, 0);
      }
    }
  });

  return (
    <group position={position}>
      <Box args={[3.5, 0.15, 2]} position={[0, 0.75, 0]} castShadow receiveShadow>
        <primitive object={tableMat} attach="material" />
      </Box>
      {TABLE_LEG_POSITIONS.map((legPos, i) => (
        <mesh key={i} geometry={geo.tableLeg} position={legPos}>
          <primitive object={mat.darkWood} attach="material" />
        </mesh>
      ))}
      <Box args={[2, 0.2, 0.1]} position={[0, 0.9, -0.9]} castShadow>
        <primitive object={mat.brassGold} attach="material" />
      </Box>
      <Box args={[1.5, 0.02, 1]} position={[-0.5, 0.82, 0.2]}>
        <primitive object={mat.whitePaper} attach="material" />
      </Box>
      <Box args={[0.8, 0.05, 0.6]} position={[0.8, 0.82, -0.2]}>
        <primitive object={mat.darkMetal} attach="material" />
      </Box>
      <Sphere args={[0.08]} position={[1.2, 0.9, 0.5]}>
        <primitive object={mat.waterGlass} attach="material" />
      </Sphere>
      <Box args={[0.8, 1.2, 0.8]} position={[0, 0.6, 1.5]} castShadow receiveShadow>
        <primitive object={mat.chairFabric} attach="material" />
      </Box>
      {isActive && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 1.5, 2.5]} />
          <primitive object={mat.activeGlowMedium} attach="material" />
        </mesh>
      )}
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
});

EnhancedAttorneyTable.displayName = 'EnhancedAttorneyTable';

// ---------------------------------------------------------------------------
// Jury Box – Instanced seats
// ---------------------------------------------------------------------------

const EnhancedJuryBox: React.FC<{
  jurySize: number;
  activeJurors?: string[];
  quality: QualityLevel;
}> = React.memo(({ jurySize, activeJurors = [], quality }) => {
  const mat = useMemo(() => getSharedMaterials(), []);
  const geo = useMemo(() => getSharedGeometries(), []);

  const seatPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const rows = Math.ceil(jurySize / 6);
    for (let row = 0; row < rows; row++) {
      const seatsInRow = Math.min(6, jurySize - row * 6);
      for (let seat = 0; seat < seatsInRow; seat++) {
        positions.push([6 + seat * 1.2, 0.5 + row * 1, -4 - row * 1]);
      }
    }
    return positions;
  }, [jurySize]);

  const seatMeshRef = useRef<THREE.InstancedMesh>(null);
  const backrestMeshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    if (seatMeshRef.current) {
      seatPositions.forEach(([x, y, z], i) => {
        dummy.position.set(x, y + 0.3, z);
        dummy.updateMatrix();
        seatMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      seatMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (backrestMeshRef.current) {
      seatPositions.forEach(([x, y, z], i) => {
        dummy.position.set(x, y + 0.8, z - 0.35);
        dummy.updateMatrix();
        backrestMeshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      backrestMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [seatPositions]);

  return (
    <group>
      <Box args={[8, 0.3, 4]} position={[8.5, 0.15, -4]} castShadow receiveShadow>
        <primitive object={mat.lightWood} attach="material" />
      </Box>
      <Box args={[8, 1.5, 0.2]} position={[8.5, 1, -6]} castShadow receiveShadow>
        <primitive object={mat.darkWood} attach="material" />
      </Box>
      <Box args={[0.2, 1.5, 4]} position={[4.5, 1, -4]} castShadow receiveShadow>
        <primitive object={mat.darkWood} attach="material" />
      </Box>

      <instancedMesh
        ref={seatMeshRef}
        args={[geo.jurySeat, undefined, seatPositions.length]}
        castShadow
        receiveShadow
      >
        <primitive object={mat.darkWood} attach="material" />
      </instancedMesh>

      <instancedMesh
        ref={backrestMeshRef}
        args={[geo.juryBackrest, undefined, seatPositions.length]}
        castShadow
        receiveShadow
      >
        <primitive object={mat.darkWood} attach="material" />
      </instancedMesh>

      {quality.maxTextLabels > 0 &&
        seatPositions.slice(0, quality.maxTextLabels).map(([x, y, z], index) => (
          <Text
            key={index}
            position={[x, y + 0.4, z + 0.4]}
            rotation={[-Math.PI / 3, 0, 0]}
            fontSize={0.1}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
          >
            {index + 1}
          </Text>
        ))}

      {seatPositions.map(([x, y, z], index) =>
        activeJurors.includes(`juror-${index + 1}`) ? (
          <mesh key={`glow-${index}`} position={[x, y + 0.3, z]} geometry={geo.juryGlow}>
            <primitive object={mat.activeGlow} attach="material" />
          </mesh>
        ) : null
      )}
    </group>
  );
});

EnhancedJuryBox.displayName = 'EnhancedJuryBox';

// ---------------------------------------------------------------------------
// Gallery Seating – Instanced benches
// ---------------------------------------------------------------------------

const GallerySeating: React.FC = React.memo(() => {
  const mat = useMemo(() => getSharedMaterials(), []);
  const geo = useMemo(() => getSharedGeometries(), []);
  const ROWS = 4;

  const benchMeshRef = useRef<THREE.InstancedMesh>(null);
  const backrestMeshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const dummy = new THREE.Object3D();

    if (benchMeshRef.current) {
      for (let r = 0; r < ROWS; r++) {
        dummy.position.set(0, 0.25, 3 + r * 1.5);
        dummy.updateMatrix();
        benchMeshRef.current.setMatrixAt(r, dummy.matrix);
      }
      benchMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    if (backrestMeshRef.current) {
      for (let r = 0; r < ROWS; r++) {
        dummy.position.set(0, 1, 3 + r * 1.5 - 0.3);
        dummy.updateMatrix();
        backrestMeshRef.current.setMatrixAt(r, dummy.matrix);
      }
      backrestMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  return (
    <group>
      <instancedMesh
        ref={benchMeshRef}
        args={[geo.galleryBench, undefined, ROWS]}
        castShadow
        receiveShadow
      >
        <primitive object={mat.lightWood} attach="material" />
      </instancedMesh>

      <instancedMesh
        ref={backrestMeshRef}
        args={[geo.galleryBackrest, undefined, ROWS]}
        castShadow
        receiveShadow
      >
        <primitive object={mat.darkWood} attach="material" />
      </instancedMesh>

      <Plane
        args={[1, 8]}
        position={[0, 0.01, 6]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <primitive object={mat.aisleRunner} attach="material" />
      </Plane>
    </group>
  );
});

GallerySeating.displayName = 'GallerySeating';

// ---------------------------------------------------------------------------
// Court Reporter Station
// ---------------------------------------------------------------------------

const CourtReporterStation: React.FC<{ isActive?: boolean }> = React.memo(
  ({ isActive }) => {
    const mat = useMemo(() => getSharedMaterials(), []);
    return (
      <group position={[-2, 0, -5]}>
        <Box args={[1.5, 0.1, 1]} position={[0, 0.7, 0]} castShadow receiveShadow>
          <primitive object={mat.lightWood} attach="material" />
        </Box>
        <Box args={[0.6, 0.2, 0.4]} position={[0, 0.8, 0]}>
          <primitive object={mat.darkMetal} attach="material" />
        </Box>
        <Box args={[0.6, 0.8, 0.6]} position={[0, 0.4, 0.8]} castShadow receiveShadow>
          <primitive object={mat.chairFabric} attach="material" />
        </Box>
        {isActive && (
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[2, 1.2, 1.5]} />
            <primitive object={mat.activeGlow} attach="material" />
          </mesh>
        )}
      </group>
    );
  }
);

CourtReporterStation.displayName = 'CourtReporterStation';

// ---------------------------------------------------------------------------
// Bailiff Station
// ---------------------------------------------------------------------------

const BailiffStation: React.FC<{ isActive?: boolean }> = React.memo(
  ({ isActive }) => {
    const mat = useMemo(() => getSharedMaterials(), []);
    return (
      <group position={[3, 0, -3]}>
        <Box args={[1, 0.2, 1]} position={[0, 0.1, 0]} castShadow receiveShadow>
          <primitive object={mat.darkWood} attach="material" />
        </Box>
        {isActive && (
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 1.5]} />
            <primitive object={mat.activeGlow} attach="material" />
          </mesh>
        )}
      </group>
    );
  }
);

BailiffStation.displayName = 'BailiffStation';

// ---------------------------------------------------------------------------
// Courtroom Structure
// ---------------------------------------------------------------------------

const CourtroomStructure: React.FC<{ quality: QualityLevel }> = React.memo(
  ({ quality }) => {
    const mat = useMemo(() => getSharedMaterials(), []);

    return (
      <group>
        <Plane
          args={[24, 20]}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <primitive object={mat.hardwoodFloor} attach="material" />
        </Plane>
        <Plane
          args={[2, 16]}
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <primitive object={mat.carpetRunner} attach="material" />
        </Plane>

        <Plane args={[24, 12]} position={[0, 6, -10]} receiveShadow>
          <primitive object={mat.creamWall} attach="material" />
        </Plane>
        <Plane
          args={[20, 12]}
          position={[-12, 6, 0]}
          rotation={[0, Math.PI / 2, 0]}
          receiveShadow
        >
          <primitive object={mat.beigeWall} attach="material" />
        </Plane>
        <Plane
          args={[20, 12]}
          position={[12, 6, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          receiveShadow
        >
          <primitive object={mat.beigeWall} attach="material" />
        </Plane>

        <Box args={[0.1, 6, 4]} position={[-11.9, 6, -3]}>
          <primitive object={mat.windowGlass} attach="material" />
        </Box>
        <Box args={[0.1, 6, 4]} position={[-11.9, 6, 3]}>
          <primitive object={mat.windowGlass} attach="material" />
        </Box>
        <Box args={[0.1, 6, 4]} position={[11.9, 6, -3]}>
          <primitive object={mat.windowGlass} attach="material" />
        </Box>
        <Box args={[0.1, 6, 4]} position={[11.9, 6, 3]}>
          <primitive object={mat.windowGlass} attach="material" />
        </Box>

        {quality.enableDetailObjects && (
          <>
            <Box args={[0.15, 6.2, 0.2]} position={[-11.85, 6, -5]}>
              <primitive object={mat.lightWood} attach="material" />
            </Box>
            <Box args={[0.15, 6.2, 0.2]} position={[-11.85, 6, -1]}>
              <primitive object={mat.lightWood} attach="material" />
            </Box>
          </>
        )}

        <Box args={[0.05, 10, 0.05]} position={[-3, 5, -9.8]}>
          <primitive object={mat.flagPoleGold} attach="material" />
        </Box>
        <Box args={[0.1, 2, 1.5]} position={[-2.5, 8, -9.5]}>
          <primitive object={mat.americanFlag} attach="material" />
        </Box>
        <Box args={[0.05, 10, 0.05]} position={[3, 5, -9.8]}>
          <primitive object={mat.flagPoleGold} attach="material" />
        </Box>
        <Box args={[0.1, 2, 1.5]} position={[2.5, 8, -9.5]}>
          <primitive object={mat.nyFlag} attach="material" />
        </Box>

        {quality.enableDecorations && (
          <>
            <Box args={[0.6, 0.8, 0.6]} position={[-10, 0.4, 8]}>
              <primitive object={mat.lightWood} attach="material" />
            </Box>
            <Sphere args={[1.2]} position={[-10, 1.5, 8]}>
              <primitive object={mat.greenFoliage} attach="material" />
            </Sphere>
            <Box args={[0.6, 0.8, 0.6]} position={[10, 0.4, 8]}>
              <primitive object={mat.lightWood} attach="material" />
            </Box>
            <Sphere args={[1.2]} position={[10, 1.5, 8]}>
              <primitive object={mat.greenFoliage} attach="material" />
            </Sphere>
          </>
        )}

        <Box args={[0.8, 12, 0.8]} position={[-8, 6, -9]} castShadow>
          <primitive object={mat.marble} attach="material" />
        </Box>
        <Box args={[0.8, 12, 0.8]} position={[8, 6, -9]} castShadow>
          <primitive object={mat.marble} attach="material" />
        </Box>
        <Box args={[1.2, 0.5, 1.2]} position={[-8, 12, -9]}>
          <primitive object={mat.columnCapital} attach="material" />
        </Box>
        <Box args={[1.2, 0.5, 1.2]} position={[8, 12, -9]}>
          <primitive object={mat.columnCapital} attach="material" />
        </Box>
      </group>
    );
  }
);

CourtroomStructure.displayName = 'CourtroomStructure';

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export const ImprovedCourtroom3D: React.FC<Props> = ({
  participants,
  activeSpeaker,
}) => {
  const { activeLLMAgents, isProcessingAI, currentAIOperation, currentCase } =
    useCourtroomStore();

  const [quality, setQuality] = useState<QualityLevel>(QUALITY_HIGH);
  const controlsRef = useRef<any>(null);

  const handleQualityChange = useCallback((q: QualityLevel) => {
    setQuality(q);
  }, []);

  // Memoize active role lookup
  const activeRole = useMemo(() => {
    if (!activeSpeaker) return '';
    const participant = participants.find((p) => p.id === activeSpeaker);
    return participant?.role || '';
  }, [activeSpeaker, participants]);

  // Memoize thinking participants
  const thinkingRoles = useMemo(() => {
    const roles: string[] = [];

    activeLLMAgents.forEach((agent) => {
      if (agent.status === 'thinking') {
        roles.push(agent.role);
      }
    });

    if (isProcessingAI && currentAIOperation) {
      const operation = currentAIOperation.toLowerCase();
      participants.forEach((p) => {
        if (
          (operation.includes(p.name.toLowerCase()) ||
            operation.includes(p.role)) &&
          !roles.includes(p.role)
        ) {
          roles.push(p.role);
        }
      });
    }

    return roles;
  }, [activeLLMAgents, isProcessingAI, currentAIOperation, participants]);

  // Memoize jury-related values
  const juryMembers = useMemo(
    () => participants.filter((p) => p.role === 'jury-member'),
    [participants]
  );

  const activeJurors = useMemo(
    () => (activeRole === 'jury-member' && activeSpeaker ? [activeSpeaker] : []),
    [activeRole, activeSpeaker]
  );

  // Get non-jury courtroom participants for character rendering
  const courtroomCharacters = useMemo(
    () =>
      participants.filter(
        (p) =>
          p.role !== 'jury-member' &&
          p.role !== 'observer' &&
          p.isPresent
      ),
    [participants]
  );

  // Current phase for overlay
  const currentPhase = currentCase?.currentPhase || 'case-preparation';

  // Cleanup shared GPU resources on unmount
  useEffect(() => {
    return () => {
      disposeSharedResources();
    };
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 60 }}>
        <AdaptiveQualityController onQualityChange={handleQualityChange} />

        <CameraController
          activeRole={activeRole}
          controlsRef={controlsRef}
        />

        <DynamicLighting activeSpeaker={activeRole} />

        <CourtroomStructure quality={quality} />

        <EnhancedJudgeBench
          isActive={activeRole === 'judge'}
          isThinking={thinkingRoles.includes('judge')}
        />
        <EnhancedWitnessStand isActive={activeRole === 'witness'} />

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

        <EnhancedJuryBox
          jurySize={juryMembers.length}
          activeJurors={activeJurors}
          quality={quality}
        />

        <CourtReporterStation isActive={activeRole === 'court-clerk'} />
        <BailiffStation isActive={activeRole === 'bailiff'} />

        <GallerySeating />

        {/* Character sprites for courtroom participants */}
        {courtroomCharacters.map((p) => {
          const pos = ROLE_POSITIONS[p.role];
          if (!pos) return null;
          return (
            <CharacterModel
              key={p.id}
              participant={p}
              isSpeaking={p.id === activeSpeaker}
              isThinking={thinkingRoles.includes(p.role)}
              position={pos}
              quality={quality}
            />
          );
        })}

        {/* Phase transition overlay */}
        <PhaseOverlay phase={currentPhase} />

        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={25}
          target={[0, 2, -4]}
        />

        {quality.enableEnvironment && <Environment preset="apartment" />}
        {quality.enableFog && <fog attach="fog" args={['#FFF8DC', 25, 60]} />}
      </Canvas>
    </div>
  );
};
