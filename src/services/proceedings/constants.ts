/**
 * Litigation constants for trial proceedings
 */

// Jury Selection Constants
export const MAX_PEREMPTORY_CHALLENGES = 3; // Default for New York State
export const JURY_POOL_BUFFER = 6; // Extra jurors beyond needed size

// Phase Timeouts (milliseconds)
export const PHASE_TIMEOUT_MS = 120000; // 2 minutes

// Objection Probability
export const OBJECTION_PROBABILITY = 0.7; // 70% chance to check for objections

// Motion Probabilities by Role
export const MOTION_FILING_PROBABILITY = {
  'defense-attorney': 0.7,  // 70% chance
  'prosecutor': 0.4,         // 40% chance
  'plaintiff-attorney': 0.5, // 50% chance
} as const;

// Witness Examination Ranges
export const DIRECT_EXAM_QUESTIONS = { min: 2, max: 4 };
export const CROSS_EXAM_QUESTIONS = { min: 2, max: 3 };

// Delays (before applying realtime speed multiplier)
export const PHASE_ANNOUNCEMENT_DELAY_MS = 1000;
export const SIDEBAR_DURATION_MS = 2000;
export const DELIBERATION_DURATION_MS = 5000;
export const QA_EXCHANGE_DELAY_MS = 800;
export const MOTION_FILING_DELAY_MS = 1000;
export const VOIR_DIRE_DELAY_MS = 200;

// Statement generation timing
export const MIN_STATEMENT_DISPLAY_TIME_MS = 1000;
export const MS_PER_CHARACTER = 50;
