/**
 * Shared idle/emphasis tuning for every figure in the scene — principals and
 * the instanced crowd both import these so a "breathe a bit slower" note
 * only has to be applied in one place.
 */

// Idle, always-on motion. Kept tiny: this reads as "alive", not "fidgeting".
export const IDLE_BREATH_SPEED = 0.9; // rad/s
export const IDLE_BREATH_AMPLITUDE = 0.012; // world units of vertical bob
export const IDLE_SWAY_SPEED = 0.35; // rad/s
export const IDLE_SWAY_AMPLITUDE = 0.035; // radians of yaw drift

// Active-speaker emphasis (principals — exact role match, exact figure).
export const ACTIVE_LEAN_ANGLE = 0.09; // radians of forward pitch while speaking
export const ACTIVE_LIFT = 0.05; // extra uniform scale while speaking ("sits up")
export const ACTIVE_SMOOTHING = 5; // 1/s exponential-approach rate toward the target emphasis
export const THINKING_EMPHASIS = 0.35; // fraction of full emphasis while an LLM agent "thinks"

// Crowd emphasis (jury/gallery — role-level only, no specific seat id).
export const CROWD_ROLE_EMPHASIS = 0.4;
