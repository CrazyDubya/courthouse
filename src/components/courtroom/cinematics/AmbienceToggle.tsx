import React, { useEffect, useRef, useState } from 'react';
import { usePhaseBeat } from './usePhaseBeat';
import { startCourtroomAmbience, AmbienceHandle } from './courtroomAmbience';

interface AudioContextWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

/**
 * Off-by-default ambience control: a soft room-tone bed plus a gavel rap on
 * phase changes. Nothing plays until this button is clicked (browsers require
 * a user gesture to start audio); a second click tears everything down
 * cleanly. Plain DOM, mounts in the root div next to <Canvas>.
 */
export const AmbienceToggle: React.FC = () => {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const handleRef = useRef<AmbienceHandle | null>(null);
  const beat = usePhaseBeat();
  const lastBeatKeyRef = useRef<string | null>(null);

  // Fire the gavel once per phase-change beat, only while enabled.
  useEffect(() => {
    if (!on || !beat || !handleRef.current) return;
    if (lastBeatKeyRef.current === beat.key) return;
    lastBeatKeyRef.current = beat.key;
    handleRef.current.gavel();
  }, [on, beat]);

  // Teardown if unmounted while on.
  useEffect(
    () => () => {
      handleRef.current?.stop();
      handleRef.current = null;
      ctxRef.current?.close().catch(() => {});
      ctxRef.current = null;
    },
    []
  );

  const toggle = () => {
    if (on) {
      handleRef.current?.stop();
      handleRef.current = null;
      setOn(false);
      const ctx = ctxRef.current;
      ctxRef.current = null;
      ctx?.close().catch(() => {});
      return;
    }

    try {
      const AudioContextCtor =
        window.AudioContext || (window as AudioContextWindow).webkitAudioContext;
      if (!AudioContextCtor) return;
      const ctx = new AudioContextCtor();
      ctxRef.current = ctx;
      handleRef.current = startCourtroomAmbience(ctx);
      setOn(true);
    } catch {
      // WebAudio unavailable/blocked — fail silently; every other cinematic
      // still works.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      title={on ? 'Mute courtroom ambience' : 'Play courtroom ambience'}
      style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        zIndex: 30,
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid rgba(201, 162, 39, 0.4)',
        background: on ? 'rgba(201, 162, 39, 0.18)' : 'rgba(11, 10, 8, 0.6)',
        color: '#f2ead8',
        fontSize: 11,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontFamily: 'Georgia, "Times New Roman", serif',
        cursor: 'pointer',
        backdropFilter: 'blur(2px)',
      }}
    >
      {on ? '♪ Ambience on' : '♪ Ambience off'}
    </button>
  );
};
