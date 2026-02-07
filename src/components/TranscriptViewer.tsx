import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useCourtroomStore } from '../store/useCourtroomStore';
import { motion, AnimatePresence } from 'framer-motion';
import { TranscriptEntry, ParticipantRole } from '../types';

// Move lookup maps outside component to avoid recreation on every render
const ROLE_COLORS: Record<string, string> = {
  'judge': 'text-purple-400',
  'prosecutor': 'text-red-400',
  'defense-attorney': 'text-blue-400',
  'plaintiff-attorney': 'text-orange-400',
  'defendant': 'text-yellow-400',
  'plaintiff': 'text-green-400',
  'witness': 'text-cyan-400',
  'jury-member': 'text-gray-400',
  'bailiff': 'text-indigo-400',
  'court-clerk': 'text-pink-400',
  'observer': 'text-gray-500',
};

const ENTRY_ICONS: Record<string, string> = {
  'statement': '\u{1F4AC}',
  'question': '\u{2753}',
  'objection': '\u{26A0}\uFE0F',
  'ruling': '\u{2696}\uFE0F',
  'exhibit': '\u{1F4CE}',
  'sidebar': '\u{1F910}',
};

const ENTRY_BG: Record<string, string> = {
  'objection': 'bg-red-900/20 border border-red-700',
  'ruling': 'bg-purple-900/20 border border-purple-700',
  'exhibit': 'bg-blue-900/20 border border-blue-700',
  'sidebar': 'bg-gray-800 border border-gray-700 italic',
};

function getRoleColor(role: string): string {
  return ROLE_COLORS[role] || 'text-gray-300';
}

function getEntryIcon(type: string): string {
  return ENTRY_ICONS[type] || '\u{1F4AC}';
}

function getEntryBg(type: string): string {
  return ENTRY_BG[type] || 'bg-gray-800';
}

// Maximum entries rendered at once (windowed rendering for performance)
const MAX_VISIBLE_ENTRIES = 100;

// Memoized single transcript entry to avoid re-rendering the whole list
const TranscriptItem: React.FC<{ entry: TranscriptEntry }> = React.memo(
  ({ entry }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`p-3 rounded-lg ${getEntryBg(entry.type)}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-xl mt-1" role="img" aria-label={entry.type}>
          {getEntryIcon(entry.type)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold ${getRoleColor(entry.role)}`}>
              {entry.speaker}
            </span>
            <span className="text-xs text-gray-500">
              ({entry.role.replace(/-/g, ' ')})
            </span>
            <span className="text-xs text-gray-600 ml-auto flex-shrink-0">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-gray-200 leading-relaxed">
            {entry.content}
          </p>
          {entry.metadata && (
            <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-3">
              {Object.entries(entry.metadata).map(([key, value]) => (
                <span key={key}>
                  {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
);

TranscriptItem.displayName = 'TranscriptItem';

export const TranscriptViewer: React.FC = () => {
  const { currentCase } = useCourtroomStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries arrive
  const transcriptLength = currentCase?.transcript.length || 0;
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptLength]);

  // Window the transcript: only render the last MAX_VISIBLE_ENTRIES
  const visibleEntries = useMemo(() => {
    if (!currentCase) return [];
    const t = currentCase.transcript;
    return t.length > MAX_VISIBLE_ENTRIES
      ? t.slice(t.length - MAX_VISIBLE_ENTRIES)
      : t;
  }, [currentCase?.transcript, transcriptLength]);

  const truncatedCount = useMemo(() => {
    if (!currentCase) return 0;
    return Math.max(0, currentCase.transcript.length - MAX_VISIBLE_ENTRIES);
  }, [currentCase?.transcript, transcriptLength]);

  return (
    <div
      className="bg-gray-900 text-white p-6 rounded-lg shadow-xl h-full flex flex-col"
    >
      <h2 className="text-2xl font-bold mb-4">Court Transcript</h2>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar"
      >
        {truncatedCount > 0 && (
          <div className="text-center text-gray-500 text-xs py-2">
            {truncatedCount} earlier entries hidden
          </div>
        )}

        <AnimatePresence initial={false}>
          {visibleEntries.map((entry) => (
            <TranscriptItem key={entry.id} entry={entry} />
          ))}
        </AnimatePresence>

        {visibleEntries.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No transcript entries yet.</p>
            <p className="text-sm mt-2">Start the simulation to see the proceedings.</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1f2937;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4b5563;
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }
        `
      }} />
    </div>
  );
};
