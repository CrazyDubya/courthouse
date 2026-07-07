import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoHideOptions {
  /** ms of no interaction before the surface fades to its handle. */
  hideDelay?: number;
  /** Forces the surface visible and suspends the hide timer — used for
   *  "transport prominent when idle" (trial not running) and for keeping a
   *  bar open while one of its own sheets is open. */
  pinned?: boolean;
}

interface AutoHideBind {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  /** Tap-to-summon on touch devices: reveal immediately, then re-arm the
   *  hide timer since there's no "pointer left" event to hang it on. */
  onTouchStart: () => void;
}

interface UseAutoHideResult {
  visible: boolean;
  show: () => void;
  scheduleHide: () => void;
  bind: AutoHideBind;
}

/**
 * Drives "summon on demand, fade when idle" for a single HUD surface (the top
 * identity bar, the bottom command dock). Hovering (desktop) or tapping
 * (mobile) reveals it; it holds open while pinned or actively hovered/focused,
 * and fades `hideDelay` ms after the pointer leaves (or after a tap, on
 * touch). Starts visible on mount so first-time users see the chrome exists
 * before it settles into its ambient, auto-hidden state.
 */
export function useAutoHide({ hideDelay = 3200, pinned = false }: UseAutoHideOptions = {}): UseAutoHideResult {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearTimer();
    setVisible(true);
  }, [clearTimer]);

  const scheduleHide = useCallback(() => {
    clearTimer();
    if (pinned) return;
    timerRef.current = window.setTimeout(() => setVisible(false), hideDelay);
  }, [clearTimer, pinned, hideDelay]);

  // Settle into the ambient hidden state shortly after mount, unless pinned.
  useEffect(() => {
    scheduleHide();
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pinning always wins: force visible while pinned, resume the countdown the
  // moment it is released.
  useEffect(() => {
    if (pinned) show();
    else scheduleHide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinned]);

  const bind: AutoHideBind = {
    onMouseEnter: show,
    onMouseLeave: scheduleHide,
    onFocus: show,
    onTouchStart: () => {
      show();
      scheduleHide();
    },
  };

  return { visible, show, scheduleHide, bind };
}
