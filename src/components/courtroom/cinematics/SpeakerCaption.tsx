import React from 'react';
import { Html } from '@react-three/drei';
import { Participant } from '../../../types';
import { ROLE_LABELS } from './focusPoints';
import { useLatchedSpeaker } from './useLatchedSpeaker';
import { useFadeLifecycle } from './useFadeLifecycle';

const MAX_CAPTION_CHARS = 220;
const MS_PER_CHAR = 45;
const MIN_HOLD_MS = 2400;
const MAX_HOLD_MS = 9000;
const FADE_IN_MS = 420;
const FADE_OUT_MS = 750;
// Lift above the head anchor so the card floats clear of the face.
const VERTICAL_LIFT = 0.5;

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function holdDurationFor(text: string): number {
  return Math.max(MIN_HOLD_MS, Math.min(MAX_HOLD_MS, text.length * MS_PER_CHAR));
}

interface SpeakerCaptionProps {
  participants: Participant[];
}

/**
 * A quiet in-world caption — name · role header, then the spoken line —
 * anchored just above whoever last spoke, tying the words to the figure in
 * space. Reads the same latched-speaker state as CameraDirector, so the two
 * always agree; renders nothing with no case, no speech yet, or an unplaceable
 * speaker.
 *
 * Screen-space `<Html>` (no `transform`), so text stays crisp and legible at
 * any distance and never covers a face once lifted above the head. Fades in on
 * a new line, holds ~in proportion to its length, then fades out. Mount inside
 * <Canvas>.
 */
export const SpeakerCaption: React.FC<SpeakerCaptionProps> = ({ participants }) => {
  const latched = useLatchedSpeaker(participants);
  const holdMs = latched ? holdDurationFor(latched.content) : MIN_HOLD_MS;
  const { mounted, opacity, transitionMs } = useFadeLifecycle(
    latched?.key ?? null,
    FADE_IN_MS,
    holdMs,
    FADE_OUT_MS
  );

  if (!latched || !mounted) return null;

  const roleLabel = ROLE_LABELS[latched.role] ?? latched.role;

  return (
    <Html
      position={[latched.focus.x, latched.focus.y + VERTICAL_LIFT, latched.focus.z]}
      center
      occlude={false}
      zIndexRange={[20, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <div
        style={{
          transform: 'translateY(-100%)',
          opacity,
          transition: `opacity ${transitionMs}ms ease`,
          minWidth: 200,
          maxWidth: 320,
          padding: '8px 14px',
          background: 'rgba(11, 10, 8, 0.74)',
          border: '1px solid rgba(201, 162, 39, 0.32)',
          borderRadius: 3,
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
          color: '#f2ead8',
          fontFamily: 'Georgia, "Times New Roman", serif',
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#c9a227',
            marginBottom: 4,
            whiteSpace: 'nowrap',
          }}
        >
          {latched.name}
          {roleLabel ? ` · ${roleLabel}` : ''}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.4, fontStyle: 'italic' }}>
          {truncate(latched.content, MAX_CAPTION_CHARS)}
        </div>
      </div>
    </Html>
  );
};
