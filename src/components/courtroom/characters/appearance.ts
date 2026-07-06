import { ParticipantRole } from '../../../types';

/**
 * Deterministic per-participant look: height/build, skin tone, hair
 * color/style, and clothing color, all derived from a hash of the
 * participant's `id`. Same id -> same appearance on every render, every
 * remount, every session — nothing here reads `Math.random()`.
 */
export interface FigureAppearance {
  skinColor: string;
  hairColor: string;
  clothColor: string;
  /** Secondary accent (tie / blouse / trim) — currently informational, easy
   * to wire into an extra instanced part later without touching callers. */
  accentColor: string;
  /** Overall height multiplier, applied on the figure's local Y axis. */
  heightScale: number;
  /** Overall build (width/depth) multiplier, applied on local X/Z. */
  buildScale: number;
  /** True => the hair mesh is collapsed to ~0 scale instead of being hidden
   * via a conditional render, so instanced crowds can stay one draw call. */
  bald: boolean;
  /** Idle breathing-cycle phase offset, radians. */
  phase: number;
  /** Idle sway-cycle phase offset, radians (deliberately decorrelated from
   * `phase` so breathing and sway don't lock into the same beat). */
  swayPhase: number;
}

// ---------------------------------------------------------------------------
// Deterministic hash + seeded PRNG. FNV-1a for the string -> 32-bit seed,
// mulberry32 for the seed -> reproducible stream of floats. Both are tiny,
// allocation-free, and stable across engines/runs — the two properties that
// matter for "same id -> same person, forever".
// ---------------------------------------------------------------------------
function hashStringToSeed(id: string): number {
  let h = 0x811c9dc5; // FNV-1a offset basis
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(options: readonly T[], rnd: () => number): T {
  const index = Math.floor(rnd() * options.length) % options.length;
  return options[index];
}

// Palettes are intentionally muted/desaturated — courtroom attire, not a
// cartoon crowd. Every array is a small, hand-picked set so the "random"
// pick always lands on something plausible.
const SKIN_TONES = [
  '#3b2314', '#5a3825', '#7a4b30', '#9c6b47',
  '#c08552', '#d9a066', '#e8c39e', '#f2d5b8',
] as const;

const HAIR_COLORS = [
  '#0b0a08', '#2a1c14', '#4a3222', '#6b4a2f',
  '#8a6642', '#b89050', '#5c5c5c', '#c9c2b0',
] as const;

const SUIT_COLORS = ['#20232b', '#1c2340', '#2a2620', '#232a26', '#2e2622'] as const;

const EVERYDAY_COLORS = [
  '#5c7a8c', '#7a3b3f', '#4f6b4a', '#8a6a2e', '#5a5566',
  '#3d5a63', '#7a5548', '#6b4f6b', '#8c8c78', '#4a5a70',
] as const;

const ROBE_COLOR = '#0d0d10';
const UNIFORM_COLOR = '#1a2233';

function clothColorForRole(role: ParticipantRole, rnd: () => number): string {
  switch (role) {
    case 'judge':
      return ROBE_COLOR;
    case 'prosecutor':
    case 'plaintiff-attorney':
    case 'defense-attorney':
      return pick(SUIT_COLORS, rnd);
    case 'bailiff':
      return UNIFORM_COLOR;
    case 'court-clerk':
      // Business-appropriate but not a courtroom advocate's suit — draw
      // from both palettes so clerks read as "staff", not "attorney".
      return pick([...SUIT_COLORS, ...EVERYDAY_COLORS], rnd);
    case 'witness':
    case 'defendant':
    case 'plaintiff':
    case 'jury-member':
    case 'observer':
    default:
      return pick(EVERYDAY_COLORS, rnd);
  }
}

export function buildFigureAppearance(id: string, role: ParticipantRole): FigureAppearance {
  const rnd = mulberry32(hashStringToSeed(id));

  const skinColor = pick(SKIN_TONES, rnd);
  const hairColor = pick(HAIR_COLORS, rnd);
  const clothColor = clothColorForRole(role, rnd);
  const accentColor = pick(EVERYDAY_COLORS, rnd);

  const heightScale = 0.92 + rnd() * 0.16; // 0.92 .. 1.08
  const buildScale = 0.9 + rnd() * 0.25; // 0.90 .. 1.15
  // Judges and bailiffs keep a full head of hair under robe/cap either way;
  // everyone else gets a modest, deterministic chance of being bald.
  const bald = role !== 'judge' && role !== 'bailiff' && rnd() < 0.14;

  const phase = rnd() * Math.PI * 2;
  const swayPhase = rnd() * Math.PI * 2;

  return {
    skinColor,
    hairColor,
    clothColor,
    accentColor,
    heightScale,
    buildScale,
    bald,
    phase,
    swayPhase,
  };
}
