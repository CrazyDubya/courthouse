import { useEffect, useState } from 'react';

export interface FadeLifecycle {
  /** Whether anything should be rendered at all right now. */
  mounted: boolean;
  /** Opacity to animate toward, using `transitionMs`. */
  opacity: number;
  /** CSS transition-duration (ms) for the next opacity change. */
  transitionMs: number;
}

const HIDDEN: FadeLifecycle = { mounted: false, opacity: 0, transitionMs: 0 };

/**
 * One-shot fade-in → hold → fade-out timeline keyed off `activeKey`. A new
 * non-null key restarts the cycle; null hides immediately. Shared by the
 * speaker caption and the phase banner so both dissolve the same understated
 * way. Pure timer/state bookkeeping — no store access, no per-frame work,
 * works in DOM or in-Canvas components alike.
 */
export function useFadeLifecycle(
  activeKey: string | null,
  fadeInMs: number,
  holdMs: number,
  fadeOutMs: number
): FadeLifecycle {
  const [state, setState] = useState<FadeLifecycle>(HIDDEN);

  useEffect(() => {
    if (activeKey == null) {
      setState(HIDDEN);
      return;
    }

    // Commit at opacity 0 first so the browser has a value to transition FROM;
    // the rAF flips it to 1 next paint, which is what animates.
    setState({ mounted: true, opacity: 0, transitionMs: fadeInMs });
    const raf = requestAnimationFrame(() => {
      setState({ mounted: true, opacity: 1, transitionMs: fadeInMs });
    });
    const holdTimer = setTimeout(() => {
      setState({ mounted: true, opacity: 0, transitionMs: fadeOutMs });
    }, fadeInMs + holdMs);
    const hideTimer = setTimeout(() => {
      setState(HIDDEN);
    }, fadeInMs + holdMs + fadeOutMs);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
      clearTimeout(hideTimer);
    };
  }, [activeKey, fadeInMs, holdMs, fadeOutMs]);

  return state;
}
