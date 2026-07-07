import React from 'react';
import { Participant } from '../../../types';
import { useCourtroomStore } from '../../../store/useCourtroomStore';
import { ROLE_LABELS } from './focusPoints';
import { useLatchedSpeaker } from './useLatchedSpeaker';
import { usePhaseBeat } from './usePhaseBeat';

function titleCaseSlug(slug: string | undefined): string {
  if (!slug) return '';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface StatusChyronProps {
  participants: Participant[];
}

/**
 * A minimal, always-on broadcast readout in the bottom-left: the current
 * phase (persistent) and who is speaking (● Name — Role). This is the
 * "always know who + what phase" backstop — it holds steady through the null
 * gaps and after the in-world caption has faded, so a glance answers both
 * questions without reading floating text. Plain DOM, mounts in the root div;
 * renders nothing until a case is loaded.
 */
export const StatusChyron: React.FC<StatusChyronProps> = ({ participants }) => {
  const currentCase = useCourtroomStore((s) => s.currentCase);
  const latched = useLatchedSpeaker(participants);
  const beat = usePhaseBeat();

  if (!currentCase) return null;

  const phaseLabel = beat?.phase ?? titleCaseSlug(currentCase.currentPhase);
  const roleLabel = latched ? ROLE_LABELS[latched.role] ?? latched.role : null;

  return (
    <div
      style={{
        position: 'absolute',
        left: 14,
        bottom: 14,
        zIndex: 20,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontFamily: 'Georgia, "Times New Roman", serif',
        maxWidth: 'min(360px, 60vw)',
      }}
    >
      {phaseLabel && (
        <div
          style={{
            alignSelf: 'flex-start',
            padding: '3px 10px',
            borderRadius: 999,
            background: 'rgba(11, 10, 8, 0.62)',
            border: '1px solid rgba(201, 162, 39, 0.35)',
            color: '#c9a227',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(2px)',
          }}
        >
          {phaseLabel}
        </div>
      )}
      {latched && (
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            padding: '5px 12px',
            borderRadius: 4,
            background: 'rgba(11, 10, 8, 0.62)',
            borderLeft: '3px solid #c9a227',
            color: '#f2ead8',
            backdropFilter: 'blur(2px)',
            transition: 'opacity 300ms ease',
          }}
        >
          <span aria-hidden style={{ color: '#c9a227', fontSize: 9, lineHeight: 1 }}>
            {'●'}
          </span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{latched.name}</span>
          {roleLabel && (
            <span style={{ fontSize: 11, opacity: 0.75 }}>{'—'} {roleLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};
