import React from 'react';
import { HiDotsHorizontal, HiDocumentDownload, HiCurrencyDollar } from 'react-icons/hi';
import { useCourtroomStore } from '../../../store/useCourtroomStore';
import { HudSheet } from '../HudSheet';
import { HudButton } from '../HudButton';
import { sectionLabel } from '../theme';

interface MoreSheetProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Secondary actions that do not need their own dock slot: transcript export
 * and the Economic Valuation dashboard toggle. Uses the exact Blob/anchor
 * download from the original ControlPanel.
 */
export const MoreSheet: React.FC<MoreSheetProps> = ({ open, onClose }) => {
  const { currentCase, exportTranscript, showValuationPanel, toggleValuationPanel } = useCourtroomStore();

  const handleExport = () => {
    const transcript = exportTranscript();
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${currentCase?.id || 'case'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <HudSheet open={open} onClose={onClose} title="More" icon={<HiDotsHorizontal className="w-4 h-4" />} widthClassName="w-72">
      <div>
        <div className={sectionLabel}>Export</div>
        <HudButton
          variant="secondary"
          onClick={handleExport}
          disabled={!currentCase || currentCase.transcript.length === 0}
          className="mt-1.5"
        >
          <HiDocumentDownload className="w-4 h-4" /> Export Transcript
        </HudButton>
      </div>

      <div className="pt-2 border-t border-[#c9a227]/15">
        <div className={sectionLabel}>Economic Valuation</div>
        <p className="text-xs text-[#f2ead8]/50 mt-1 mb-1.5 leading-relaxed">
          ARR, MRR, customer metrics, and damages calculations for this case.
        </p>
        <HudButton
          variant="primary"
          onClick={() => {
            toggleValuationPanel();
            onClose();
          }}
        >
          <HiCurrencyDollar className="w-4 h-4" /> {showValuationPanel ? 'Hide Valuation' : 'Show Valuation'}
        </HudButton>
      </div>
    </HudSheet>
  );
};
