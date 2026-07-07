import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiPlay,
  HiPause,
  HiStop,
  HiChevronDoubleRight,
  HiCog,
  HiUser,
  HiChatAlt2,
  HiDotsHorizontal,
} from 'react-icons/hi';
import { useCourtroomStore } from '../../store/useCourtroomStore';
import { useAutoHide } from './useAutoHide';
import { useIsMobile } from './useIsMobile';
import { glassPanelStyle } from './theme';
import type { HudPanelId } from './types';

interface DockButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  /** Gold-filled call-to-action treatment (the Start button when idle). */
  emphasize?: boolean;
  /** Small pulsing dot — ambient "something's happening" without stating what. */
  pulse?: boolean;
  /** Numeric badge — unseen transcript lines. */
  badgeCount?: number;
  isMobile: boolean;
}

const DockButton: React.FC<DockButtonProps> = ({
  icon,
  label,
  onClick,
  disabled,
  active,
  emphasize,
  pulse,
  badgeCount,
  isMobile,
}) => {
  const [hovered, setHovered] = useState(false);

  // Background is inline, not a Tailwind class: index.css carries an
  // un-layered `button { background-color: #f9f9f9 }` (under
  // prefers-color-scheme: light) that otherwise beats any layered Tailwind
  // utility on a <button>, regardless of specificity. See HudButton.tsx.
  const background =
    emphasize && !disabled
      ? hovered
        ? '#e0bc4a'
        : '#c9a227'
      : active
        ? 'rgba(201, 162, 39, 0.18)'
        : hovered
          ? 'rgba(255, 255, 255, 0.06)'
          : 'transparent';
  const color = emphasize && !disabled ? '#0b0a08' : hovered || active ? '#f2ead8' : 'rgba(242, 234, 216, 0.75)';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.06, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 20 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: background, color }}
      className={[
        'relative flex shrink-0 transition-colors disabled:opacity-30 disabled:cursor-not-allowed',
        isMobile
          ? 'flex-col items-center justify-center gap-1 min-w-[44px] py-1.5 rounded-xl'
          : 'flex-row items-center gap-1.5 px-3 py-2 rounded-full',
      ].join(' ')}
    >
      <span className={isMobile ? 'text-[18px] leading-none' : 'text-[15px] leading-none'}>{icon}</span>
      <span
        className={
          isMobile
            ? 'text-[8.5px] uppercase tracking-wide leading-none'
            : 'text-xs font-medium leading-none whitespace-nowrap'
        }
      >
        {label}
      </span>
      {pulse && (
        <motion.span
          className="absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: '#c9a227' }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.3 }}
        />
      )}
      {!!badgeCount && badgeCount > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-[3px] rounded-full text-[9px] font-bold flex items-center justify-center"
          style={{ backgroundColor: '#c9a227', color: '#0b0a08' }}
        >
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </motion.button>
  );
};

interface BottomDockProps {
  openPanel: HudPanelId;
  onTogglePanel: (id: Exclude<HudPanelId, null>) => void;
}

/**
 * The trial's command bar: transport (Start/Pause, Stop, Next Phase) plus four
 * summonable sheets (Settings, Role, Transcript, More). Prominent and pinned
 * open while the trial is idle/paused (the "what do I do next" call to action);
 * once running and left alone, it fades to a slim gold handle and reappears on
 * hover (desktop) or tap (mobile) — the persistent handle is never removed, so
 * the dock is never more than one hover/tap away.
 */
export const BottomDock: React.FC<BottomDockProps> = ({ openPanel, onTogglePanel }) => {
  const {
    currentCase,
    isSimulationRunning,
    isProcessingAI,
    simulationSettings,
    startSimulation,
    pauseSimulation,
    stopSimulation,
    nextPhase,
  } = useCourtroomStore();

  const isMobile = useIsMobile();
  const idle = !isSimulationRunning;
  const { visible, bind } = useAutoHide({ pinned: idle || openPanel !== null });

  // Emphasize the transcript button while new lines land and the sheet is not
  // already open — "transcript emphasized during dialogue" without re-stating
  // what was said (that is the in-scene caption's job).
  const transcriptLength = currentCase?.transcript.length ?? 0;
  const [seenLength, setSeenLength] = useState(transcriptLength);
  useEffect(() => {
    if (openPanel === 'transcript') setSeenLength(transcriptLength);
  }, [openPanel, transcriptLength]);
  const unseenCount = openPanel === 'transcript' ? 0 : Math.max(0, transcriptLength - seenLength);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 10px)' }}
    >
      {/* Persistent summon handle — always present, never governed by the fade,
          so the dock is never truly unreachable. */}
      <AnimatePresence>
        {!visible && (
          <motion.button
            key="dock-nub"
            type="button"
            aria-label="Show trial controls"
            // The VISUAL is the small gold hairline inside; the button itself is
            // an invisible ≥44px hit area so it's actually tappable on a phone.
            className="pointer-events-auto flex h-11 w-24 items-center justify-center"
            style={{ backgroundColor: 'transparent', border: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseEnter={bind.onMouseEnter}
            onClick={bind.onTouchStart}
            onTouchStart={bind.onTouchStart}
          >
            <span
              className="h-1.5 w-12 rounded-full"
              style={{ backgroundColor: 'rgba(201, 162, 39, 0.5)' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.div
            key="dock"
            className="pointer-events-auto mb-2 flex items-center gap-0.5 sm:gap-1 rounded-3xl px-2 py-1.5 sm:px-2.5"
            style={{ maxWidth: '96vw', ...glassPanelStyle() }}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onMouseEnter={bind.onMouseEnter}
            onMouseLeave={bind.onMouseLeave}
          >
            {isSimulationRunning ? (
              <DockButton isMobile={isMobile} icon={<HiPause />} label="Pause" onClick={pauseSimulation} />
            ) : (
              <DockButton
                isMobile={isMobile}
                icon={<HiPlay />}
                label="Start"
                onClick={startSimulation}
                disabled={!currentCase}
                emphasize={!!currentCase}
              />
            )}
            <DockButton
              isMobile={isMobile}
              icon={<HiStop />}
              label="Stop"
              onClick={stopSimulation}
              disabled={!isSimulationRunning}
            />
            <DockButton
              isMobile={isMobile}
              icon={<HiChevronDoubleRight />}
              label="Next"
              onClick={nextPhase}
              disabled={isSimulationRunning || !currentCase}
            />

            <span className="mx-0.5 sm:mx-1 h-6 w-px bg-[#c9a227]/20" />

            <DockButton
              isMobile={isMobile}
              icon={<HiCog />}
              label={`${simulationSettings.realtimeSpeed}x`}
              onClick={() => onTogglePanel('settings')}
              active={openPanel === 'settings'}
            />
            <DockButton
              isMobile={isMobile}
              icon={<HiUser />}
              label="Role"
              onClick={() => onTogglePanel('role')}
              active={openPanel === 'role'}
            />
            <DockButton
              isMobile={isMobile}
              icon={<HiChatAlt2 />}
              label="Log"
              onClick={() => onTogglePanel('transcript')}
              active={openPanel === 'transcript'}
              badgeCount={unseenCount}
            />
            <DockButton
              isMobile={isMobile}
              icon={<HiDotsHorizontal />}
              label="More"
              onClick={() => onTogglePanel('more')}
              active={openPanel === 'more'}
              pulse={isProcessingAI}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
