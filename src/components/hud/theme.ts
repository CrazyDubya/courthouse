import type { CSSProperties } from 'react';

/**
 * Shared visual language for the Immersive HUD: near-black frosted glass
 * chrome with a warm gold accent, deliberately matching the in-scene
 * cinematics (StatusChyron / PhaseBanner / SpeakerCaption / AmbienceToggle
 * all render on the same #c9a227-on-near-black palette) so scene and chrome
 * read as one system. Centralizing the recurring class strings + the glass
 * material here keeps every sheet/bar/button consistent.
 */

export const GOLD = '#c9a227';
export const GOLD_BRIGHT = '#e0bc4a';
export const INK = '#0b0a08';
export const PARCHMENT = '#f2ead8';

export const sectionLabel =
  'text-[10.5px] uppercase tracking-[0.16em] text-[#c9a227]/85 font-medium';

export const glassField =
  'w-full rounded-lg bg-black/30 border border-[#c9a227]/25 px-3 py-2 text-sm text-[#f2ead8] placeholder:text-[#f2ead8]/30 focus:outline-none focus:border-[#c9a227]/60 transition-colors';

/**
 * The premium tactile-glass material used by every HUD surface: a layered
 * near-black gradient (thick glass with depth, not a flat chip), an inner
 * top highlight (light catching the surface), a deep drop shadow, and a soft
 * gold halo. `hot` brightens the border + halo for an engaged surface (an
 * open sheet, a live rail). Returned as inline `style` so it is immune to the
 * Tailwind pipeline and to index.css's un-layered `button` rule.
 */
export function glassPanelStyle(hot = false): CSSProperties {
  return {
    background:
      'linear-gradient(165deg, rgba(24,21,16,0.80) 0%, rgba(13,12,10,0.84) 58%, rgba(8,8,7,0.86) 100%)',
    border: `1px solid rgba(201,162,39,${hot ? 0.5 : 0.22})`,
    backdropFilter: 'blur(22px) saturate(150%)',
    WebkitBackdropFilter: 'blur(22px) saturate(150%)',
    boxShadow: [
      'inset 0 1px 0 rgba(255,255,255,0.08)',
      '0 20px 50px -18px rgba(0,0,0,0.72)',
      `0 0 34px -10px rgba(201,162,39,${hot ? 0.3 : 0.14})`,
    ].join(', '),
  };
}
