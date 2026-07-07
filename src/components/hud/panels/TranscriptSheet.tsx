import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChatAlt2 } from 'react-icons/hi';
import { useCourtroomStore } from '../../../store/useCourtroomStore';
import { TranscriptEntry } from '../../../types';
import { HudSheet } from '../HudSheet';

interface TranscriptSheetProps {
  open: boolean;
  onClose: () => void;
}

const ROLE_COLOR: Record<string, string> = {
  judge: 'text-purple-300',
  prosecutor: 'text-red-300',
  'defense-attorney': 'text-blue-300',
  'plaintiff-attorney': 'text-orange-300',
  defendant: 'text-yellow-300',
  plaintiff: 'text-green-300',
  witness: 'text-cyan-300',
  'jury-member': 'text-gray-300',
  bailiff: 'text-indigo-300',
  'court-clerk': 'text-pink-300',
  observer: 'text-gray-400',
};

const ENTRY_ICON: Record<TranscriptEntry['type'], string> = {
  statement: '💬',
  question: '❓',
  objection: '⚠️',
  ruling: '⚖️',
  exhibit: '📎',
  sidebar: '🤐',
};

const ENTRY_TINT: Record<TranscriptEntry['type'], string> = {
  statement: 'border-white/10 bg-white/[0.03]',
  question: 'border-white/10 bg-white/[0.03]',
  objection: 'border-red-500/30 bg-red-500/[0.06]',
  ruling: 'border-purple-500/30 bg-purple-500/[0.06]',
  exhibit: 'border-blue-500/30 bg-blue-500/[0.06]',
  sidebar: 'border-white/10 bg-white/[0.03] italic',
};

/**
 * The full court transcript, restyled onto the HUD's glass sheet. Same
 * entry-type icons / role colors / auto-scroll-to-bottom behavior as the
 * original TranscriptViewer, just no longer boxed in an opaque always-on
 * sidebar — it is summoned from the dock's "Log" button instead.
 */
export const TranscriptSheet: React.FC<TranscriptSheetProps> = ({ open, onClose }) => {
  const currentCase = useCourtroomStore((s) => s.currentCase);
  // Re-render tick: the proceedings engine pushes into currentCase.transcript
  // IN PLACE (same array/case reference), so a selector on currentCase alone
  // never fires for engine statements and an open sheet would freeze mid-trial.
  // The events log IS replaced immutably once per statement — subscribe to its
  // length so new lines re-render (and auto-scroll) this sheet.
  const eventCount = useCourtroomStore((s) => s.events.length);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [open, eventCount, currentCase?.transcript.length]);

  return (
    <HudSheet
      open={open}
      onClose={onClose}
      title="Court Transcript"
      icon={<HiChatAlt2 className="w-4 h-4" />}
      widthClassName="w-full sm:w-[420px]"
      bodyClassName="px-0"
    >
      <div ref={scrollRef} className="max-h-[60vh] sm:max-h-[52vh] overflow-y-auto px-4 sm:px-5 py-2 space-y-2">
        <AnimatePresence initial={false}>
          {currentCase?.transcript.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`rounded-lg border p-2.5 ${ENTRY_TINT[entry.type] ?? ''}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-base leading-none mt-0.5">{ENTRY_ICON[entry.type] ?? '💬'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-semibold ${ROLE_COLOR[entry.role] ?? 'text-[#f2ead8]'}`}>
                      {entry.speaker}
                    </span>
                    <span className="text-[10px] text-[#f2ead8]/35 capitalize">
                      ({entry.role.replace('-', ' ')})
                    </span>
                    <span className="text-[10px] text-[#f2ead8]/30 ml-auto whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-[#f2ead8]/85 leading-relaxed mt-0.5">{entry.content}</p>
                  {entry.metadata && (
                    <div className="mt-1.5 text-[10px] text-[#f2ead8]/35 flex flex-wrap gap-x-3">
                      {Object.entries(entry.metadata).map(([key, value]) => (
                        <span key={key}>
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {(!currentCase || currentCase.transcript.length === 0) && (
          <div className="text-center text-[#f2ead8]/40 py-10 text-sm">
            No transcript entries yet.
            <br />
            Start the simulation to see the proceedings.
          </div>
        )}
      </div>
    </HudSheet>
  );
};
