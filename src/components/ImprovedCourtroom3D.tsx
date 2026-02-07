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
import { Participant } from '../types';
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
// Adaptive quality – reduces detail when FPS drops below threshold
// ---------------------------------------------------------------------------

interface QualityLevel {
  shadowMapSize: number;
  enableFog: boolean;
  enableEnvironment: boolean;
  enableDecorations: boolean;
  enableDetailObjects: boolean;
  maxTextLabels: number;
}

const QUALITY_HIGH: QualityLevel = {
  shadowMapSize: 2048,
  enableFog: true,
  enableEnvironment: true,
  enableDecorations: true,
  enableDetailObjects: true,
  maxTextLabels: 20,
};

const QUALITY_MEDIUM: QualityLevel = {
  shadowMapSize: 1024,
  enableFog: true,
  enableEnvironment: false,
  enableDecorations: true,
  enableDetailObjects: false,
  maxTextLabels: 6,
};

const QUALITY_LOW: QualityLevel = {
  shadowMapSize: 512,
  enableFog: false,
  enableEnvironment: false,
  enableDecorations: false,
  enableDetailObjects: false,
  maxTextLabels: 0,
};

const AdaptiveQualityController: React.FC<{
  onQualityChange: (q: QualityLevel) => void;
}> = ({ onQualityChange }) => {
  const frameTimesRef = useRef<number[]>([]);
  const currentQualityRef = useRef<QualityLevel>(QUALITY_HIGH);
  const cooldownRef = useRef(0);

  useFrame((_, delta) => {
    // Collect frame times (rolling window of 60 frames)
    frameTimesRef.current.push(delta);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    // Only evaluate every 120 frames to avoid thrashing
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
// Dynamic Lighting – spotlight follows active speaker
// ---------------------------------------------------------------------------

const SPEAKER_POSITIONS: Record<string, [number, number, number]> = {
  judge: [0, 6, -8],
  prosecutor: [-3, 2, -2],
  'defense-attorney': [3, 2, -2],
  witness: [-4, 2, -6],
  defendant: [2, 2, -4],
};

const DynamicLighting: React.FC<{ activeSpeaker?: string }> = React.memo(
  ({ activeSpeaker }) => {
    const spotlightRef = useRef<THREE.SpotLight>(null);
    const prevSpeakerRef = useRef<string | undefined>(undefined);

    useFrame(() => {
      // Only update when speaker changes
      if (prevSpeakerRef.current === activeSpeaker) return;
      prevSpeakerRef.current = activeSpeaker;

      if (spotlightRef.current && activeSpeaker) {
        const position = SPEAKER_POSITIONS[activeSpeaker];
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
        {/* Warm ambient */}
        <ambientLight intensity={0.5} color="#fff8dc" />

        {/* Key directional light with shadow */}
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

        {/* Active speaker spotlight */}
        <spotLight
          ref={spotlightRef}
          position={[0, 15, 0]}
          intensity={activeSpeaker ? 1.2 : 0}
          angle={Math.PI / 6}
          penumbra={0.7}
          color="#ffeaa7"
        />

        {/* Side fill lights (no shadows – cheaper) */}
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

        {/* Window rim lights (no shadows) */}
        <pointLight position={[-12, 6, -3]} intensity={0.3} color="#fffacd" />
        <pointLight position={[12, 6, 3]} intensity={0.3} color="#fffacd" />
      </>
    );
  }
);

DynamicLighting.displayName = 'DynamicLighting';

// ---------------------------------------------------------------------------
// Judge Bench – animated emissive glow, shared materials
// ---------------------------------------------------------------------------

const EnhancedJudgeBench: React.FC<{
  isActive?: boolean;
  isThinking?: boolean;
}> = React.memo(({ isActive, isThinking }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => getSharedMaterials(), []);

  // Dedicated emissive material (needs per-instance clone for animation)
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
      // Only reset if currently non-zero
      if (benchMat.emissive.r !== 0 || benchMat.emissive.g !== 0) {
        benchMat.emissive.setRGB(0, 0, 0);
      }
    }
  });

  return (
    <group position={[0, 2.5, -8]}>
      {/* Main bench */}
      <Box args={[8, 4, 2.5]} castShadow receiveShadow>
        <primitive object={benchMat} attach="material" ref={meshRef} />
      </Box>

      {/* Bench top */}
      <Box args={[7.5, 0.2, 2.2]} position={[0, 2, 0]} castShadow receiveShadow>
        <primitive object={mat.benchTop} attach="material" />
      </Box>

      {/* Judge chair platform */}
      <Box args={[2, 1.5, 1.5]} position={[0, 2.75, -0.5]} castShadow receiveShadow>
        <primitive object={mat.darkWood} attach="material" />
      </Box>

      {/* Nameplate – metallic gold */}
      <Box args={[3, 0.3, 0.1]} position={[0, 1.5, 1.2]} castShadow>
        <primitive object={mat.brassGold} attach="material" />
      </Box>

      {/* Court seal */}
      <Sphere args={[1.2]} position={[0, 3, -1.5]} castShadow>
        <primitive object={mat.brassGold} attach="material" />
      </Sphere>

      {/* Gavel rest – small, no shadow */}
      <Box args={[0.3, 0.1, 0.3]} position={[1.5, 2.2, 0.5]}>
        <primitive object={mat.lightWood} attach="material" />
      </Box>

      {/* Active glow overlay */}
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

        {/* Microphone stand – no shadow (too small) */}
        <Box args={[0.1, 1, 0.1]} position={[0.8, 1.5, 0.8]}>
          <primitive object={mat.darkMetal} attach="material" />
        </Box>
        <Sphere args={[0.15]} position={[0.8, 2.5, 0.8]}>
          <primitive object={mat.darkMetal} attach="material" />
        </Sphere>

        {/* Bible – no shadow */}
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

  // Per-instance clone for animated emissive
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
      {/* Table top */}
      <Box args={[3.5, 0.15, 2]} position={[0, 0.75, 0]} castShadow receiveShadow>
        <primitive object={tableMat} attach="material" />
      </Box>

      {/* Table legs – shared geometry, no shadow */}
      {TABLE_LEG_POSITIONS.map((legPos, i) => (
        <mesh key={i} geometry={geo.tableLeg} position={legPos}>
          <primitive object={mat.darkWood} attach="material" />
        </mesh>
      ))}

      {/* Nameplate */}
      <Box args={[2, 0.2, 0.1]} position={[0, 0.9, -0.9]} castShadow>
        <primitive object={mat.brassGold} attach="material" />
      </Box>

      {/* Papers – no shadow */}
      <Box args={[1.5, 0.02, 1]} position={[-0.5, 0.82, 0.2]}>
        <primitive object={mat.whitePaper} attach="material" />
      </Box>

      {/* Laptop – no shadow */}
      <Box args={[0.8, 0.05, 0.6]} position={[0.8, 0.82, -0.2]}>
        <primitive object={mat.darkMetal} attach="material" />
      </Box>

      {/* Water glass – no shadow */}
      <Sphere args={[0.08]} position={[1.2, 0.9, 0.5]}>
        <primitive object={mat.waterGlass} attach="material" />
      </Sphere>

      {/* Chair */}
      <Box args={[0.8, 1.2, 0.8]} position={[0, 0.6, 1.5]} castShadow receiveShadow>
        <primitive object={mat.chairFabric} attach="material" />
      </Box>

      {/* Active glow */}
      {isActive && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 1.5, 2.5]} />
          <primitive object={mat.activeGlowMedium} attach="material" />
        </mesh>
      )}

      {/* Label */}
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
// Jury Box – Instanced seats using shared geometries
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

  // Use InstancedMesh for the seat platforms
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
      {/* Platform */}
      <Box args={[8, 0.3, 4]} position={[8.5, 0.15, -4]} castShadow receiveShadow>
        <primitive object={mat.lightWood} attach="material" />
      </Box>

      {/* Railings */}
      <Box args={[8, 1.5, 0.2]} position={[8.5, 1, -6]} castShadow receiveShadow>
        <primitive object={mat.darkWood} attach="material" />
      </Box>
      <Box args={[0.2, 1.5, 4]} position={[4.5, 1, -4]} castShadow receiveShadow>
        <primitive object={mat.darkWood} attach="material" />
      </Box>

      {/* Instanced seats */}
      <instancedMesh
        ref={seatMeshRef}
        args={[geo.jurySeat, undefined, seatPositions.length]}
        castShadow
        receiveShadow
      >
        <primitive object={mat.darkWood} attach="material" />
      </instancedMesh>

      {/* Instanced backrests */}
      <instancedMesh
        ref={backrestMeshRef}
        args={[geo.juryBackrest, undefined, seatPositions.length]}
        castShadow
        receiveShadow
      >
        <primitive object={mat.darkWood} attach="material" />
      </instancedMesh>

      {/* Seat numbers – only when quality allows */}
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

      {/* Active juror glows */}
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
      {/* Instanced benches */}
      <instancedMesh
        ref={benchMeshRef}
        args={[geo.galleryBench, undefined, ROWS]}
        castShadow
        receiveShadow
      >
        <primitive object={mat.lightWood} attach="material" />
      </instancedMesh>

      {/* Instanced backrests */}
      <instancedMesh
        ref={backrestMeshRef}
        args={[geo.galleryBackrest, undefined, ROWS]}
        castShadow
        receiveShadow
      >
        <primitive object={mat.darkWood} attach="material" />
      </instancedMesh>

      {/* Center aisle */}
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

        {/* Stenotype – no shadow */}
        <Box args={[0.6, 0.2, 0.4]} position={[0, 0.8, 0]}>
          <primitive object={mat.darkMetal} attach="material" />
        </Box>

        {/* Chair */}
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
// Courtroom Structure – walls, floor, windows, columns, decorations
// ---------------------------------------------------------------------------

const CourtroomStructure: React.FC<{ quality: QualityLevel }> = React.memo(
  ({ quality }) => {
    const mat = useMemo(() => getSharedMaterials(), []);

    return (
      <group>
        {/* Hardwood floor with texture */}
        <Plane
          args={[24, 20]}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <primitive object={mat.hardwoodFloor} attach="material" />
        </Plane>

        {/* Carpet runner with texture */}
        <Plane
          args={[2, 16]}
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <primitive object={mat.carpetRunner} attach="material" />
        </Plane>

        {/* Walls */}
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

        {/* Windows – no shadow (transparent) */}
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

        {/* Window frames – shared geometry, no shadow */}
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

        {/* Flags */}
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

        {/* Decorative elements – skip when quality is low */}
        {quality.enableDecorations && (
          <>
            {/* Potted plants */}
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

        {/* Classical columns with marble texture */}
        <Box args={[0.8, 12, 0.8]} position={[-8, 6, -9]} castShadow>
          <primitive object={mat.marble} attach="material" />
        </Box>
        <Box args={[0.8, 12, 0.8]} position={[8, 6, -9]} castShadow>
          <primitive object={mat.marble} attach="material" />
        </Box>

        {/* Column capitals */}
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
  const { activeLLMAgents, isProcessingAI, currentAIOperation } =
    useCourtroomStore();

  const [quality, setQuality] = useState<QualityLevel>(QUALITY_HIGH);

  const handleQualityChange = useCallback((q: QualityLevel) => {
    setQuality(q);
  }, []);

  // Memoize active role lookup
  const activeRole = useMemo(() => {
    if (!activeSpeaker) return '';
    const participant = participants.find((p) => p.id === activeSpeaker);
    return participant?.role || '';
  }, [activeSpeaker, participants]);

  // Memoize thinking participants – avoids recompute every render
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

  // Cleanup shared GPU resources on unmount
  useEffect(() => {
    return () => {
      disposeSharedResources();
    };
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 60 }}>
        {/* Adaptive quality controller */}
        <AdaptiveQualityController onQualityChange={handleQualityChange} />

        {/* Lighting */}
        <DynamicLighting activeSpeaker={activeRole} />

        {/* Scene structure */}
        <CourtroomStructure quality={quality} />

        {/* Judge bench */}
        <EnhancedJudgeBench
          isActive={activeRole === 'judge'}
          isThinking={thinkingRoles.includes('judge')}
        />

        {/* Witness stand */}
        <EnhancedWitnessStand isActive={activeRole === 'witness'} />

        {/* Attorney tables */}
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

        {/* Jury box with instanced seats */}
        <EnhancedJuryBox
          jurySize={juryMembers.length}
          activeJurors={activeJurors}
          quality={quality}
        />

        {/* Court staff */}
        <CourtReporterStation isActive={activeRole === 'court-clerk'} />
        <BailiffStation isActive={activeRole === 'bailiff'} />

        {/* Gallery */}
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

        {/* Environment – conditionally loaded */}
        {quality.enableEnvironment && <Environment preset="apartment" />}

        {/* Fog – conditionally enabled */}
        {quality.enableFog && (
          <fog attach="fog" args={['#FFF8DC', 25, 60]} />
        )}
      </Canvas>
    </div>
  );
};
