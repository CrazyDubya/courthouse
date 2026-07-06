import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
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

interface Props {
  participants: Participant[];
  activeSpeaker?: string;
}

export const ImprovedCourtroom3D: React.FC<Props> = ({ participants, activeSpeaker }) => {
  const { activeRole, thinkingRoles } = useCourtroomActivity(participants, activeSpeaker);

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
