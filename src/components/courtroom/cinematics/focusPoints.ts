import * as THREE from 'three';
import { Participant, ParticipantRole } from '../../../types';
import {
  V3,
  JUDGE_POSITION,
  PROSECUTOR_TABLE_CHAIR,
  DEFENSE_TABLE_CHAIR,
  PLAINTIFF_SEAT,
  DEFENDANT_SEAT,
  WITNESS_POSITION,
  CLERK_POSITION,
  BAILIFF_POSITION,
  JURY_ORIGIN,
  jurySeatPosition,
  observerSeatPositions,
} from '../characters/layout';

/**
 * Head-height lift from a seat/floor anchor up to roughly where the figure's
 * head sphere sits, matching the procedural rig in `characters/geometry.ts`
 * (seated heads ~1.15 above the seat anchor; the standing bailiff ~1.75 above
 * his floor anchor). Reusing the layout.ts anchors + this lift keeps camera
 * targets and captions honest to where the actual head mesh is, and moves for
 * free if a seat is ever retuned in layout.ts.
 */
const SEATED_HEAD_LIFT = 1.15;
const STANDING_HEAD_LIFT = 1.75;

// Base seat/floor anchor per singly-occupied role, lifted verbatim from
// layout.ts (jurors + observers are crowds, resolved separately below).
const ROLE_ANCHOR: Partial<Record<ParticipantRole, V3>> = {
  judge: JUDGE_POSITION,
  prosecutor: PROSECUTOR_TABLE_CHAIR,
  'plaintiff-attorney': PROSECUTOR_TABLE_CHAIR,
  'defense-attorney': DEFENSE_TABLE_CHAIR,
  plaintiff: PLAINTIFF_SEAT,
  defendant: DEFENDANT_SEAT,
  witness: WITNESS_POSITION,
  'court-clerk': CLERK_POSITION,
  bailiff: BAILIFF_POSITION,
};

/** Human-readable role labels for captions / the status chyron. */
export const ROLE_LABELS: Partial<Record<ParticipantRole, string>> = {
  judge: 'Judge',
  prosecutor: 'Prosecutor',
  'plaintiff-attorney': "Plaintiff's Counsel",
  'defense-attorney': 'Defense Counsel',
  plaintiff: 'Plaintiff',
  defendant: 'Defendant',
  witness: 'Witness',
  'jury-member': 'Juror',
  'court-clerk': 'Court Clerk',
  bailiff: 'Bailiff',
  observer: 'Observer',
};

/**
 * Resolves a world-space, head-height focus point for a speaking participant,
 * writing into a caller-owned `THREE.Vector3` (no allocation). Returns whether
 * a point could be resolved at all so callers can HOLD their current framing
 * rather than snap somewhere wrong.
 *
 * Jurors and observers are rendered as instanced crowds, so their exact seat
 * is recovered by finding this participant's index within its same-role subset
 * of `participants` (same order the crowd renderer seats them) and reading the
 * matching seat from layout.ts. Falls back to the section origin if the id
 * can't be matched.
 */
export function resolveFocusPoint(
  role: ParticipantRole,
  participantId: string | undefined,
  participants: Participant[],
  out: THREE.Vector3
): boolean {
  if (role === 'jury-member') {
    let index = 0;
    if (participantId) {
      const jurors = participants.filter((p) => p.role === 'jury-member');
      const found = jurors.findIndex((p) => p.id === participantId);
      if (found >= 0) index = found;
    }
    const seat = jurySeatPosition(index);
    out.set(seat[0], seat[1] + SEATED_HEAD_LIFT, seat[2]);
    return true;
  }

  if (role === 'observer') {
    const observers = participants.filter((p) => p.role === 'observer');
    let index = 0;
    if (participantId) {
      const found = observers.findIndex((p) => p.id === participantId);
      if (found >= 0) index = found;
    }
    const seats = observerSeatPositions(Math.max(observers.length, 1));
    const seat = seats[index] ?? JURY_ORIGIN;
    out.set(seat[0], seat[1] + SEATED_HEAD_LIFT, seat[2]);
    return true;
  }

  const anchor = ROLE_ANCHOR[role];
  if (!anchor) return false;

  const lift = role === 'bailiff' ? STANDING_HEAD_LIFT : SEATED_HEAD_LIFT;
  out.set(anchor[0], anchor[1] + lift, anchor[2]);
  return true;
}
