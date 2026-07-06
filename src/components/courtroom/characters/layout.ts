/**
 * Named, independently-tunable seat anchors for every role. Numbers here are
 * lifted from the actual furniture in `scene/*.tsx` wherever a piece of
 * furniture exposes an exact chair position (attorney tables, court-reporter
 * desk, bailiff platform); the rest are the approximate anchors from the
 * design brief, since the bench/witness-stand geometry doesn't expose a
 * single unambiguous "hip" point. Nothing downstream does math to derive a
 * position — every figure just reads one of these constants — so visual
 * tuning later is a one-line change here, not a hunt through component code.
 */

export type V3 = readonly [number, number, number];

// A rotationY of 0 faces local "forward" (+Z) toward world +Z. The four
// values below are the only facings the courtroom needs; see the derivation
// note on each for how it maps to a world direction.
export const FACING_POS_Z = 0; // faces +Z
export const FACING_NEG_Z = Math.PI; // faces -Z
export const FACING_POS_X = Math.PI / 2; // faces +X
export const FACING_NEG_X = -Math.PI / 2; // faces -X

// ---- Judge ----------------------------------------------------------------
export const JUDGE_POSITION: V3 = [0, 4.2, -8.7];
export const JUDGE_FACING = FACING_POS_Z; // toward the gallery/camera

// ---- Attorneys --------------------------------------------------------------
// Matches EnhancedAttorneyTable's chair Box exactly: table position + local
// chair offset [0, 0.6, 1.5].
export const PROSECUTOR_TABLE_CHAIR: V3 = [-3, 0.6, -0.5];
export const DEFENSE_TABLE_CHAIR: V3 = [3, 0.6, -0.5];
export const ATTORNEY_FACING = FACING_NEG_Z; // toward the judge

// ---- Parties (seated beside their attorney) --------------------------------
export const PLAINTIFF_SEAT: V3 = [-4.2, 0.6, -0.3];
export const DEFENDANT_SEAT: V3 = [4.2, 0.6, -0.3];
export const PARTY_FACING = FACING_NEG_Z; // toward the judge

// ---- Witness ----------------------------------------------------------------
export const WITNESS_POSITION: V3 = [-4, 2.0, -6];
export const WITNESS_FACING = FACING_POS_X; // toward the well/jury

// ---- Court clerk / reporter -------------------------------------------------
// Matches CourtReporterStation's chair Box exactly: station position + local
// chair offset [0, 0.4, 0.8].
export const CLERK_POSITION: V3 = [-2, 0.4, -4.2];
export const CLERK_FACING = FACING_POS_X;

// ---- Bailiff ----------------------------------------------------------------
// Matches BailiffStation's platform position exactly; feet at y = 0.
export const BAILIFF_POSITION: V3 = [3, 0, -3];
export const BAILIFF_FACING = FACING_POS_Z; // watching the room; arbitrary, tune freely

// ---- Jury box ---------------------------------------------------------------
export const JURY_SEATS_PER_ROW = 6;
export const JURY_SEAT_SPACING_X = 1.2;
export const JURY_ORIGIN: V3 = [6, 0.5, -4];
export const JURY_SEAT_LIFT = 0.3;
export const JURY_ROW_STEP = 1;
export const JURY_FACING = FACING_NEG_X; // toward the well

/** World position for juror seat `index` (0-based, fills rows of 6). */
export function jurySeatPosition(index: number): V3 {
  const seat = index % JURY_SEATS_PER_ROW;
  const row = Math.floor(index / JURY_SEATS_PER_ROW);
  return [
    JURY_ORIGIN[0] + seat * JURY_SEAT_SPACING_X,
    JURY_ORIGIN[1] + row * JURY_ROW_STEP + JURY_SEAT_LIFT,
    JURY_ORIGIN[2] - row * JURY_ROW_STEP,
  ];
}

// ---- Gallery ------------------------------------------------------------------
export const GALLERY_ORIGIN_Z = 3;
export const GALLERY_ROWS = 4;
export const GALLERY_ROW_STEP = 1.5;
export const GALLERY_SEAT_Y = 0.5;
export const GALLERY_HALF_WIDTH = 5.5;
export const GALLERY_AISLE_HALF_WIDTH = 0.8;
export const GALLERY_FACING = FACING_NEG_Z;

/**
 * Evenly spreads `count` observers across the fixed 4-row gallery, splitting
 * each row into its two half-benches (left/right of the center aisle) so
 * seats never overlap the aisle and never overflow the benches no matter how
 * many observer participants exist — packing gets tighter, not wider.
 */
export function observerSeatPositions(count: number): V3[] {
  if (count <= 0) return [];
  const perRow = Math.ceil(count / GALLERY_ROWS);
  const perLeftSide = Math.ceil(perRow / 2);
  const halfBenchWidth = GALLERY_HALF_WIDTH - GALLERY_AISLE_HALF_WIDTH;

  const positions: V3[] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / perRow);
    const withinRow = i % perRow;
    const onLeft = withinRow < perLeftSide;
    const slotsOnThisSide = onLeft ? perLeftSide : perRow - perLeftSide;
    const slot = onLeft ? withinRow : withinRow - perLeftSide;
    const t = slotsOnThisSide > 1 ? slot / (slotsOnThisSide - 1) : 0.5;
    const side = onLeft ? -1 : 1;
    const x = side * (GALLERY_AISLE_HALF_WIDTH + t * halfBenchWidth);
    const z = GALLERY_ORIGIN_Z + row * GALLERY_ROW_STEP;
    positions.push([x, GALLERY_SEAT_Y, z]);
  }
  return positions;
}
