import React from 'react';
import { usePhaseBeat } from './usePhaseBeat';
import { useFadeLifecycle } from './useFadeLifecycle';

const FADE_IN_MS = 550;
const HOLD_MS = 2500;
const FADE_OUT_MS = 900;

/**
 * A brief, elegant title card on every phase transition — "Opening
 * Statements", "Verdict" — styled like a documentary chapter card: thin gold
 * rules, small-caps serif, then gone after ~2.5s. Consumes the phase-change
 * events the rest of the scene ignores. Plain DOM overlay; mount in the root
 * div (a sibling of <Canvas>).
 */
export const PhaseBanner: React.FC = () => {
  const beat = usePhaseBeat();
  const { mounted, opacity, transitionMs } = useFadeLifecycle(
    beat?.key ?? null,
    FADE_IN_MS,
    HOLD_MS,
    FADE_OUT_MS
  );

  if (!beat || !mounted) return null;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: '16%',
        left: '50%',
        transform: 'translateX(-50%)',
        opacity,
        transition: `opacity ${transitionMs}ms ease`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
        zIndex: 30,
      }}
    >
      <div style={{ width: 46, height: 1, background: 'rgba(201, 162, 39, 0.7)' }} />
      <div
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 22,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#f2ead8',
          textShadow: '0 2px 12px rgba(0, 0, 0, 0.65)',
          whiteSpace: 'nowrap',
        }}
      >
        {beat.phase}
      </div>
      <div style={{ width: 46, height: 1, background: 'rgba(201, 162, 39, 0.7)' }} />
    </div>
  );
};
