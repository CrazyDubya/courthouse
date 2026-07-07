import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Participant, ParticipantRole } from '../../../types';
import { useCourtroomStore } from '../../../store/useCourtroomStore';
import { resolveFocusPoint } from './focusPoints';

export interface LatchedSpeaker {
  id: string;
  role: ParticipantRole;
  name: string;
  content: string;
  /** World-space head-height anchor. Only reassigned when the speaker/line
   * actually changes, so it's safe to hold onto and copy from across frames. */
  focus: THREE.Vector3;
  /** Changes exactly once per newly-spoken line. Key effects/remounts off
   * this rather than object identity. */
  key: string;
}

/**
 * THE flicker fix. Derives "who most recently spoke, and what they said"
 * straight from the store's append-only `events` log (last `type:'speech'`
 * entry) instead of the live `activeSpeaker`, which the engine resets to
 * `null` for ~1s+ between every line. Because `events` only ever grows (and
 * only via a fresh array reference), the last speech entry IS the held state
 * — there's no null gap to patch, because this layer never reads the value
 * that goes null.
 *
 * The single source of truth shared by CameraDirector, SpeakerCaption and
 * StatusChyron, so all three always agree on the current subject. Read-only;
 * never touches the store or the proceedings engine. Undefined/empty-safe —
 * returns null with no case, no speech yet, or an unplaceable speaker.
 */
export function useLatchedSpeaker(participants: Participant[]): LatchedSpeaker | null {
  const currentCase = useCourtroomStore((s) => s.currentCase);
  const events = useCourtroomStore((s) => s.events);
  const latchRef = useRef<LatchedSpeaker | null>(null);
  // `events` is a global log that outlives a single case; track the case id so
  // a case switch drops stale state instead of latching the previous case's
  // last line, without flickering on in-place edits to the same case.
  const caseIdRef = useRef<string | null>(null);

  return useMemo(() => {
    if (!currentCase) {
      latchRef.current = null;
      caseIdRef.current = null;
      return null;
    }
    if (caseIdRef.current !== currentCase.id) {
      caseIdRef.current = currentCase.id;
      latchRef.current = null;
    }

    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i];
      if (event.type !== 'speech' || !event.speaker) continue;

      const key = `${event.speaker}-${i}`;
      // Already holding exactly this line — return the cached object, no new
      // Vector3 allocation.
      if (latchRef.current && latchRef.current.key === key) {
        return latchRef.current;
      }

      const participant = participants.find((p) => p.id === event.speaker);
      if (!participant) break;

      const focus = new THREE.Vector3();
      if (!resolveFocusPoint(participant.role, participant.id, participants, focus)) break;

      latchRef.current = {
        id: participant.id,
        role: participant.role,
        name: participant.name,
        content: event.content,
        focus,
        key,
      };
      return latchRef.current;
    }

    // No resolvable speech — hold whatever we last had (null if nothing yet).
    return latchRef.current;
  }, [currentCase, events, participants]);
}
