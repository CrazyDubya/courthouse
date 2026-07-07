import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Lightformer } from '@react-three/drei';
import { Participant } from '../types';
import { useCourtroomActivity } from './courtroom/hooks/useCourtroomActivity';
import {
  DynamicLighting,
  CourtroomStructure,
  EnhancedJudgeBench,
  EnhancedWitnessStand,
  EnhancedAttorneyTable,
  EnhancedJuryBox,
  GallerySeating,
  CourtReporterStation,
  BailiffStation,
} from './courtroom/scene';
import { CourtroomCharacters } from './courtroom/characters';
import { PerfHud } from './courtroom/perf/PerfHud';
import { CameraDirector, SpeakerCaption, StatusChyron, PhaseBanner, AmbienceToggle } from './courtroom/cinematics';

interface Props {
  participants: Participant[];
  activeSpeaker?: string;
}

export const ImprovedCourtroom3D: React.FC<Props> = ({ participants, activeSpeaker }) => {
  const { activeRole, thinkingRoles } = useCourtroomActivity(participants, activeSpeaker);

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 8, 12], fov: 60 }}
        // Clamp the device pixel ratio: uncapped, this rendered at full retina/4K
        // DPR. `performance.min` lets R3F drop DPR toward 1 under load and recover.
        dpr={[1, 2]}
        gl={{ powerPreference: 'high-performance', antialias: true }}
        performance={{ min: 0.5 }}
      >
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

        {/* Procedural human figures: one per participant, seated/standing at
            the furniture above. Principals render individually; jurors and
            gallery observers are combined into a handful of instanced draw
            calls. Renders nothing when `participants` is empty. */}
        <CourtroomCharacters
          participants={participants}
          activeRole={activeRole}
          thinkingRoles={thinkingRoles}
          activeSpeakerId={activeSpeaker}
        />

        {/* Cinematics: speaker-following camera + in-world caption. Both derive
            the current speaker from the store's append-only events log
            (useLatchedSpeaker), so they HOLD the last speaker across the
            activeSpeaker->null gap instead of flickering. */}
        <CameraDirector participants={participants} />
        <SpeakerCaption participants={participants} />

        {/* Camera controls */}
        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={25}
          target={[0, 2, -4]}
        />

        {/* Environment mapping: a procedurally-rendered warm room instead of
            the old preset="apartment", which fetched a PolyHaven HDRI from a
            CDN at runtime (network dependency + first-paint stall). Rendered
            once locally (frames={1}); the lightformers approximate the side
            windows + a soft ceiling so brass/metal keep their reflections. */}
        <Environment resolution={64} frames={1}>
          <color attach="background" args={['#e9dcc4']} />
          <Lightformer intensity={1.1} position={[-10, 6, 0]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} color="#fff4e0" />
          <Lightformer intensity={1.1} position={[10, 6, 0]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} color="#fff4e0" />
          <Lightformer intensity={0.7} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[12, 12, 1]} color="#fff8dc" />
        </Environment>

        {/* Warm fog for depth */}
        <fog attach="fog" args={['#FFF8DC', 25, 60]} />

        {/* Renderer stats overlay — hidden by default, press 'P' to toggle */}
        <PerfHud />
      </Canvas>

      {/* Always-on "who + phase" readout (bottom-left), transient phase title
          card, and off-by-default procedural ambience toggle. Plain DOM
          overlays that read the store directly; no Canvas context needed. */}
      <StatusChyron participants={participants} />
      <PhaseBanner />
      <AmbienceToggle />
    </div>
  );
};
