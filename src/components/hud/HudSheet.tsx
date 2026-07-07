import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import { useIsMobile } from './useIsMobile';
import { glassPanelStyle } from './theme';

interface HudSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  /** Desktop-only card width, e.g. 'w-80'. */
  widthClassName?: string;
  /** Override the scrollable body's padding/spacing classes. */
  bodyClassName?: string;
  /** Which edge the panel rises from / anchors near on desktop. */
  anchor?: 'top' | 'bottom';
  align?: 'center' | 'right';
}

/**
 * The one surface every HUD control panel is built from: a frosted-glass card
 * that rises from the bottom dock (or drops from the top bar) on desktop, and
 * becomes a full-width swipe-to-dismiss sheet on mobile. Keeps every
 * popover/panel behaving and looking identically — the "mobile-first bottom
 * sheet that scales gracefully up to a desktop popover" from the brief, reused
 * for all four dock panels plus the top bar's agent roster.
 */
export const HudSheet: React.FC<HudSheetProps> = ({
  open,
  onClose,
  title,
  icon,
  children,
  widthClassName = 'w-80',
  bodyClassName = 'px-4 sm:px-5 py-3 space-y-3',
  anchor = 'bottom',
  align = 'center',
}) => {
  const isMobile = useIsMobile();
  const [closeHover, setCloseHover] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (anchor === 'bottom') {
      if (info.offset.y > 80 || info.velocity.y > 500) onClose();
    } else if (info.offset.y < -80 || info.velocity.y < -500) {
      onClose();
    }
  };

  const desktopInitial = anchor === 'bottom' ? { y: 20, opacity: 0 } : { y: -20, opacity: 0 };
  const mobileInitial = anchor === 'bottom' ? { y: '100%' } : { y: '-100%' };

  return (
    <AnimatePresence>
      {open && (
        <React.Fragment>
          {/* Dim backdrop on mobile (true sheet); an invisible click-catcher
              on desktop so clicking over the scene closes the popover without
              a scrim. Sits BELOW the bars (z-65) so a dock/topbar button stays
              clickable while a sheet is open — one click switches panels. */}
          <motion.div
            key="hud-sheet-backdrop"
            className="fixed inset-0 z-[65]"
            style={{ pointerEvents: 'auto', background: isMobile ? 'rgba(0,0,0,0.5)' : 'transparent' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="hud-sheet-panel"
            role="dialog"
            aria-label={title}
            className={
              isMobile
                ? `pointer-events-auto fixed inset-x-0 z-[95] flex flex-col ${
                    anchor === 'bottom' ? 'bottom-0 rounded-t-3xl' : 'top-0 rounded-b-3xl'
                  } max-h-[78vh]`
                : `pointer-events-auto fixed z-[95] flex flex-col rounded-2xl max-h-[70vh] ${widthClassName}`
            }
            style={{
              left: isMobile ? undefined : align === 'center' ? '50%' : undefined,
              right: isMobile ? undefined : align === 'right' ? 16 : undefined,
              transform: isMobile ? undefined : align === 'center' ? 'translateX(-50%)' : undefined,
              bottom: isMobile ? undefined : anchor === 'bottom' ? 104 : undefined,
              top: isMobile ? undefined : anchor === 'top' ? 72 : undefined,
              paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : undefined,
              paddingTop: isMobile && anchor === 'top' ? 'env(safe-area-inset-top)' : undefined,
              ...glassPanelStyle(true),
            }}
            initial={isMobile ? mobileInitial : desktopInitial}
            animate={isMobile ? { y: 0 } : { y: 0, opacity: 1 }}
            exit={isMobile ? mobileInitial : desktopInitial}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag={isMobile ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: anchor === 'top' ? 0.4 : 0, bottom: anchor === 'bottom' ? 0.4 : 0 }}
            onDragEnd={isMobile ? handleDragEnd : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            {isMobile && anchor === 'bottom' && (
              <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-[#c9a227]/30" />
              </div>
            )}
            <div className="flex items-center justify-between px-4 sm:px-5 pt-3 pb-2 shrink-0 border-b border-[#c9a227]/15">
              <div className="flex items-center gap-2 text-[#c9a227]">
                {icon}
                <h3 className="font-serif text-[11px] tracking-[0.18em] uppercase text-[#f2ead8]">{title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                onMouseEnter={() => setCloseHover(true)}
                onMouseLeave={() => setCloseHover(false)}
                style={{ backgroundColor: closeHover ? 'rgba(255, 255, 255, 0.06)' : 'transparent' }}
                className={`p-1 rounded-full transition-colors ${closeHover ? 'text-[#f2ead8]' : 'text-[#f2ead8]/50'}`}
              >
                <HiX className="w-4 h-4" />
              </button>
            </div>
            <div className={`overflow-y-auto text-[#f2ead8] ${bodyClassName}`}>{children}</div>
            {isMobile && anchor === 'top' && (
              <div className="flex justify-center pb-2 pt-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-[#c9a227]/30" />
              </div>
            )}
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
