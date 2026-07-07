import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { BottomDock } from './BottomDock';
import { SettingsSheet } from './panels/SettingsSheet';
import { RoleSheet } from './panels/RoleSheet';
import { TranscriptSheet } from './panels/TranscriptSheet';
import { MoreSheet } from './panels/MoreSheet';
import type { HudPanelId } from './types';

interface HudRootProps {
  /** Return to the case-selection screen (App flips `showSetup` back on). */
  onNewCase: () => void;
}

/**
 * Orchestrates the full-bleed trial HUD: a translucent top bar (case identity
 * + phase + agent status), a bottom command dock (transport, settings, role,
 * transcript, more), and the four glass sheets those dock buttons summon. The
 * root is `pointer-events-none` so empty space over the 3D scene stays
 * orbit-draggable; only the actual bars/buttons/sheets opt back into
 * `pointer-events-auto`.
 */
export const HudRoot: React.FC<HudRootProps> = ({ onNewCase }) => {
  const [openPanel, setOpenPanel] = useState<HudPanelId>(null);

  const togglePanel = (id: Exclude<HudPanelId, null>) =>
    setOpenPanel((current) => (current === id ? null : id));
  const closePanel = () => setOpenPanel(null);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      <TopBar onNewCase={onNewCase} />
      <BottomDock openPanel={openPanel} onTogglePanel={togglePanel} />

      <SettingsSheet open={openPanel === 'settings'} onClose={closePanel} />
      <RoleSheet open={openPanel === 'role'} onClose={closePanel} />
      <TranscriptSheet open={openPanel === 'transcript'} onClose={closePanel} />
      <MoreSheet open={openPanel === 'more'} onClose={closePanel} />
    </div>
  );
};
