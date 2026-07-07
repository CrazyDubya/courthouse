import React from 'react';
import { HiCog } from 'react-icons/hi';
import { useCourtroomStore } from '../../../store/useCourtroomStore';
import { HudSheet } from '../HudSheet';
import { sectionLabel, glassField } from '../theme';

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Speed, trial-flow toggles, and jury size — everything that lived in
 * ControlPanel's "Speed" / "Settings" / "Jury Size" sections, unified into one
 * sheet since they are all `simulationSettings` and rarely touched mid-trial.
 */
export const SettingsSheet: React.FC<SettingsSheetProps> = ({ open, onClose }) => {
  const { simulationSettings, updateSimulationSettings, isSimulationRunning } = useCourtroomStore();

  return (
    <HudSheet open={open} onClose={onClose} title="Settings" icon={<HiCog className="w-4 h-4" />} widthClassName="w-80">
      <div>
        <div className={sectionLabel}>Speed</div>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={simulationSettings.realtimeSpeed}
          onChange={(e) => updateSimulationSettings({ realtimeSpeed: parseFloat(e.target.value) })}
          className="w-full accent-[#c9a227] mt-1.5"
        />
        <div className="text-xs text-[#f2ead8]/60 mt-1">{simulationSettings.realtimeSpeed}x realtime</div>
      </div>

      <div className="pt-2 border-t border-[#c9a227]/15 space-y-2">
        <div className={sectionLabel}>Trial Options</div>
        <label className="flex items-center gap-2 text-sm text-[#f2ead8]/85">
          <input
            type="checkbox"
            checked={simulationSettings.autoProgress}
            onChange={(e) => updateSimulationSettings({ autoProgress: e.target.checked })}
            className="accent-[#c9a227]"
          />
          Auto Progress
        </label>
        <label className="flex items-center gap-2 text-sm text-[#f2ead8]/85">
          <input
            type="checkbox"
            checked={simulationSettings.enableObjections}
            onChange={(e) => updateSimulationSettings({ enableObjections: e.target.checked })}
            className="accent-[#c9a227]"
          />
          Enable Objections
        </label>
        <label className="flex items-center gap-2 text-sm text-[#f2ead8]/85">
          <input
            type="checkbox"
            checked={simulationSettings.enableSidebar}
            onChange={(e) => updateSimulationSettings({ enableSidebar: e.target.checked })}
            className="accent-[#c9a227]"
          />
          Enable Sidebar Conferences
        </label>
      </div>

      <div className="pt-2 border-t border-[#c9a227]/15">
        <div className={sectionLabel}>Jury Size</div>
        <input
          type="number"
          min="6"
          max="12"
          value={simulationSettings.jurySize}
          onChange={(e) => updateSimulationSettings({ jurySize: parseInt(e.target.value, 10) })}
          disabled={isSimulationRunning}
          className={`${glassField} mt-1.5`}
        />
      </div>
    </HudSheet>
  );
};
