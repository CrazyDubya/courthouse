import { useEffect, useRef, useState } from 'react';
import { useCourtroomStore } from '../../../store/useCourtroomStore';

export interface PhaseBeat {
  /** Human-readable phase name straight from the engine, already Title-Case
   * (e.g. "Opening Statements", "Verdict"). */
  phase: string;
  /** Unique per occurrence, so a repeated phase name still restarts a
   * fade/gavel and consumers can fire exactly once per transition. */
  key: string;
}

/**
 * Surfaces the store's otherwise-ignored `phase-change` events as a one-shot
 * beat for the phase banner, the status chyron's persistent label, and the
 * gavel cue. Scans only the newly-appended slice of `events` (usually 0-1
 * phase-change per batch) rather than re-scanning the whole log. The latest
 * beat persists in state, so the chyron can show the current phase
 * indefinitely after the banner has faded. Read-only.
 */
export function usePhaseBeat(): PhaseBeat | null {
  const events = useCourtroomStore((s) => s.events);
  const scannedRef = useRef(0);
  const [beat, setBeat] = useState<PhaseBeat | null>(null);

  useEffect(() => {
    // Self-healing if `events` ever shrinks (future reset): loop no-ops and
    // the cursor snaps back down.
    if (events.length < scannedRef.current) scannedRef.current = 0;
    for (let i = scannedRef.current; i < events.length; i++) {
      const event = events[i];
      if (event.type === 'phase-change') {
        setBeat({ phase: event.content, key: `phase-${i}` });
      }
    }
    scannedRef.current = events.length;
  }, [events]);

  return beat;
}
