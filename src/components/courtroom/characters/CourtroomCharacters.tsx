import React, { useMemo } from 'react';
import { Participant, ParticipantRole } from '../../../types';
import { PrincipalFigure } from './PrincipalFigure';
import { CrowdInstancedFigures, CrowdSeatDatum } from './CrowdInstancedFigures';
import { buildFigureAppearance } from './appearance';
import {
  V3,
  JUDGE_POSITION,
  JUDGE_FACING,
  PROSECUTOR_TABLE_CHAIR,
  DEFENSE_TABLE_CHAIR,
  ATTORNEY_FACING,
  PLAINTIFF_SEAT,
  DEFENDANT_SEAT,
  PARTY_FACING,
  WITNESS_POSITION,
  WITNESS_FACING,
  CLERK_POSITION,
  CLERK_FACING,
  BAILIFF_POSITION,
  BAILIFF_FACING,
  jurySeatPosition,
  JURY_FACING,
  observerSeatPositions,
  GALLERY_FACING,
} from './layout';

interface PrincipalSlot {
  role: ParticipantRole;
  position: V3;
  rotationY: number;
  /** Direction extra same-role participants fan out along (rare — e.g. two
   * co-defendants). Defaults to +X. */
  fanAxis?: V3;
}

// One anchor per principal role. `prosecutor` and `plaintiff-attorney` share
// an anchor (a case is either criminal-with-prosecutor or
// civil-with-plaintiff-attorney, never both) as do `plaintiff`/`defendant`
// with their own seats.
const PRINCIPAL_SLOTS: PrincipalSlot[] = [
  { role: 'judge', position: JUDGE_POSITION, rotationY: JUDGE_FACING },
  { role: 'prosecutor', position: PROSECUTOR_TABLE_CHAIR, rotationY: ATTORNEY_FACING },
  { role: 'plaintiff-attorney', position: PROSECUTOR_TABLE_CHAIR, rotationY: ATTORNEY_FACING },
  { role: 'defense-attorney', position: DEFENSE_TABLE_CHAIR, rotationY: ATTORNEY_FACING },
  { role: 'plaintiff', position: PLAINTIFF_SEAT, rotationY: PARTY_FACING, fanAxis: [-1, 0, 0] },
  { role: 'defendant', position: DEFENDANT_SEAT, rotationY: PARTY_FACING, fanAxis: [1, 0, 0] },
  { role: 'witness', position: WITNESS_POSITION, rotationY: WITNESS_FACING },
  { role: 'court-clerk', position: CLERK_POSITION, rotationY: CLERK_FACING },
  { role: 'bailiff', position: BAILIFF_POSITION, rotationY: BAILIFF_FACING },
];

const FAN_OUT_STEP = 0.85;
// Beyond this many extra same-role participants, additional figures stack at
// the last fan-out slot rather than wandering into neighboring furniture.
const MAX_FAN_OUT = 3;

interface PrincipalNode {
  id: string;
  role: ParticipantRole;
  position: V3;
  rotationY: number;
}

function buildPrincipalNodes(participants: Participant[]): PrincipalNode[] {
  const nodes: PrincipalNode[] = [];
  for (const slot of PRINCIPAL_SLOTS) {
    const matches = participants.filter((p) => p.role === slot.role);
    matches.forEach((participant, i) => {
      const offset = Math.min(i, MAX_FAN_OUT) * FAN_OUT_STEP;
      const axis = slot.fanAxis ?? ([1, 0, 0] as V3);
      const position: V3 = [
        slot.position[0] + axis[0] * offset,
        slot.position[1] + axis[1] * offset,
        slot.position[2] + axis[2] * offset,
      ];
      nodes.push({ id: participant.id, role: slot.role, position, rotationY: slot.rotationY });
    });
  }
  return nodes;
}

function buildCrowdSeats(participants: Participant[]): CrowdSeatDatum[] {
  const jurors = participants.filter((p) => p.role === 'jury-member');
  const observers = participants.filter((p) => p.role === 'observer');

  const seats: CrowdSeatDatum[] = jurors.map((participant, i) => ({
    key: participant.id,
    role: 'jury-member' as const,
    position: jurySeatPosition(i),
    rotationY: JURY_FACING,
    appearance: buildFigureAppearance(participant.id, participant.role),
  }));

  const observerPositions = observerSeatPositions(observers.length);
  observers.forEach((participant, i) => {
    seats.push({
      key: participant.id,
      role: 'observer' as const,
      position: observerPositions[i],
      rotationY: GALLERY_FACING,
      appearance: buildFigureAppearance(participant.id, participant.role),
    });
  });

  return seats;
}

interface CourtroomCharactersProps {
  participants: Participant[];
  /** Role of the current speaker, or '' — as derived by useCourtroomActivity. */
  activeRole: string;
  /** Roles whose LLM agent is currently "thinking" — as derived by useCourtroomActivity. */
  thinkingRoles: string[];
  /** Optional exact speaking participant id (the scene's own `activeSpeaker`).
   * When provided, emphasis singles out that one figure — crucial for the
   * crowd, where up to a dozen jurors / dozens of observers share one role.
   * Omitting it degrades gracefully to role-level emphasis. */
  activeSpeakerId?: string;
}

/**
 * Populates the courtroom with a procedurally-generated human figure per
 * participant: principals (judge, attorneys, parties, witness, clerk,
 * bailiff) as individually-rendered figures, and every juror + gallery
 * observer combined into a small, fixed number of instanced draw calls (see
 * `CrowdInstancedFigures`). Drop this in alongside the furniture in
 * `ImprovedCourtroom3D`; it renders nothing if there are no participants.
 */
export const CourtroomCharacters: React.FC<CourtroomCharactersProps> = ({
  participants,
  activeRole,
  thinkingRoles,
  activeSpeakerId,
}) => {
  const principals = useMemo(
    () => (participants?.length ? buildPrincipalNodes(participants) : []),
    [participants]
  );
  const crowdSeats = useMemo(
    () => (participants?.length ? buildCrowdSeats(participants) : []),
    [participants]
  );

  if (!participants || participants.length === 0) return null;

  return (
    <group name="courtroom-characters">
      {principals.map((node) => (
        <PrincipalFigure
          key={node.id}
          id={node.id}
          role={node.role}
          position={node.position}
          rotationY={node.rotationY}
          isActive={activeSpeakerId ? node.id === activeSpeakerId : activeRole === node.role}
          isThinking={thinkingRoles.includes(node.role)}
        />
      ))}
      <CrowdInstancedFigures
        seats={crowdSeats}
        activeRole={activeRole}
        activeSpeakerId={activeSpeakerId}
      />
    </group>
  );
};
