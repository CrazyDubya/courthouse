import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { getSeatedFigureGeometry, getStandingFigureGeometry } from '../geometry';
import { buildFigureAppearance } from '../appearance';
import { jurySeatPosition, observerSeatPositions } from '../layout';
import { ParticipantRole } from '../../../../types';

describe('characters smoke test', () => {
  it('builds seated + standing geometry sets without throwing, with sane vertex counts', () => {
    const seated = getSeatedFigureGeometry();
    const standing = getStandingFigureGeometry();
    for (const geo of [seated.skin, seated.cloth, seated.hair, standing.skin, standing.cloth, standing.hair]) {
      expect(geo).toBeInstanceOf(THREE.BufferGeometry);
      const posCount = geo.getAttribute('position').count;
      expect(posCount).toBeGreaterThan(0);
    }
    // Same module-level cache instance on repeat calls (module singleton).
    expect(getSeatedFigureGeometry()).toBe(seated);
    expect(getStandingFigureGeometry()).toBe(standing);
  });

  it('produces deterministic, stable appearance for the same id', () => {
    const a1 = buildFigureAppearance('juror-42', 'jury-member');
    const a2 = buildFigureAppearance('juror-42', 'jury-member');
    expect(a2).toEqual(a1);
  });

  it('varies appearance across different ids', () => {
    const ids = Array.from({ length: 20 }, (_, i) => `p-${i}`);
    const skinTones = new Set(ids.map((id) => buildFigureAppearance(id, 'observer').skinColor));
    const clothColors = new Set(ids.map((id) => buildFigureAppearance(id, 'observer').clothColor));
    expect(skinTones.size).toBeGreaterThan(1);
    expect(clothColors.size).toBeGreaterThan(1);
  });

  it('gives judges a fixed black robe color regardless of id', () => {
    const j1 = buildFigureAppearance('judge-a', 'judge' as ParticipantRole);
    const j2 = buildFigureAppearance('judge-b', 'judge' as ParticipantRole);
    expect(j1.clothColor).toBe(j2.clothColor);
  });

  it('lays out jury seats in rows of 6 matching the furniture formula', () => {
    for (let i = 0; i < 12; i++) {
      const [x, y, z] = jurySeatPosition(i);
      const seat = i % 6;
      const row = Math.floor(i / 6);
      expect(x).toBeCloseTo(6 + seat * 1.2);
      expect(y).toBeCloseTo(0.5 + row * 1 + 0.3);
      expect(z).toBeCloseTo(-4 - row * 1);
    }
  });

  it('never overlaps the aisle and never overflows for small or large observer counts', () => {
    for (const count of [0, 1, 2, 7, 8, 23, 64]) {
      const seats = observerSeatPositions(count);
      expect(seats.length).toBe(count);
      for (const [x] of seats) {
        expect(Math.abs(x)).toBeGreaterThanOrEqual(0.8);
        expect(Math.abs(x)).toBeLessThanOrEqual(5.5 + 1e-9);
      }
    }
  });
});
