import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Reactive viewport check shared across the HUD. Listens for resize so a
 * window drag or a phone rotation reclassifies mobile vs desktop instead of
 * freezing whatever the width happened to be on first render — every HUD
 * surface flips between its desktop corner/popover layout and its mobile
 * bottom-sheet / tab-bar layout off this one signal.
 */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < breakpoint
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  return isMobile;
}
