import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { resolveFocusPoint, ROLE_LABELS } from '../focusPoints';
import { JUDGE_POSITION, jurySeatPosition } from '../../characters/layout';
import { Participant, ParticipantRole } from '../../../../types';

// Minimal participant shape (strictNullChecks off; only id/role are read here).
const p = (id: string, role: ParticipantRole): Participant =>
  ({ id, role, name: id } as unknown as Participant);

const ALL_ROLES: ParticipantRole[] = [
  'judge', 'prosecutor', 'plaintiff', 'defendant', 'defense-attorney',
  'plaintiff-attorney', 'witness', 'jury-member', 'bailiff', 'court-clerk', 'observer',
];

describe('cinematics focus points', () => {
  it('resolves a finite head-height point for every participant role', () => {
    const out = new THREE.Vector3();
    for (const role of ALL_ROLES) {
      const parts = [p('x', role)];
      const ok = resolveFocusPoint(role, 'x', parts, out);
      expect(ok, `role ${role} should resolve`).toBe(true);
      expect(Number.isFinite(out.x) && Number.isFinite(out.y) && Number.isFinite(out.z)).toBe(true);
      // Head height is always above the floor.
      expect(out.y).toBeGreaterThan(0);
    }
  });

  it('anchors the judge above the bench seat (layout anchor + seated head lift)', () => {
    const out = new THREE.Vector3();
    resolveFocusPoint('judge', 'j', [p('j', 'judge')], out);
    expect(out.x).toBeCloseTo(JUDGE_POSITION[0]);
    expect(out.z).toBeCloseTo(JUDGE_POSITION[2]);
    expect(out.y).toBeGreaterThan(JUDGE_POSITION[1]); // lifted to head height
  });

  it('gives the standing bailiff a taller lift than a seated role at the same floor', () => {
    const bailiff = new THREE.Vector3();
    resolveFocusPoint('bailiff', 'b', [p('b', 'bailiff')], bailiff);
    // Bailiff floor anchor is y=0; standing head lift should put the head well above a seated 1.15.
    expect(bailiff.y).toBeGreaterThan(1.15);
  });

  it('maps distinct jurors to distinct seats by their order among jury-members', () => {
    const jurors = [p('j0', 'jury-member'), p('j1', 'jury-member')];
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    resolveFocusPoint('jury-member', 'j0', jurors, a);
    resolveFocusPoint('jury-member', 'j1', jurors, b);
    // Seat 0 and seat 1 differ, and match the furniture seat formula (x, z).
    expect(a.x).toBeCloseTo(jurySeatPosition(0)[0]);
    expect(b.x).toBeCloseTo(jurySeatPosition(1)[0]);
    expect(a.equals(b)).toBe(false);
  });

  it('has a human-readable label for every role', () => {
    for (const role of ALL_ROLES) {
      expect(ROLE_LABELS[role], `label for ${role}`).toBeTruthy();
    }
  });
});
