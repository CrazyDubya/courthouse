import React, { useEffect, useRef } from 'react';
import { useCourtroomStore } from '../store/useCourtroomStore';
import { motion, AnimatePresence } from 'framer-motion';
import { TranscriptEntry } from '../types';

export const TranscriptViewer: React.FC = () => {
  const { currentCase } = useCourtroomStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentCase?.transcript]);

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
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
    return colors[role] || 'text-gray-300';
  };

  const getEntryIcon = (type: TranscriptEntry['type']): string => {
    const icons: Record<TranscriptEntry['type'], string> = {
      'statement': '💬',
      'question': '❓',
      'objection': '⚠️',
      'ruling': '⚖️',
      'exhibit': '📎',
      'sidebar': '🤐',
    };
    return icons[type] || '💬';
  };

  return (
    <motion.div 
      className="bg-gray-900 text-white p-6 rounded-lg shadow-xl h-full flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">Court Transcript</h2>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {currentCase?.transcript.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-lg ${
                entry.type === 'objection' ? 'bg-red-900/20 border border-red-700' :
                entry.type === 'ruling' ? 'bg-purple-900/20 border border-purple-700' :
                entry.type === 'exhibit' ? 'bg-blue-900/20 border border-blue-700' :
                entry.type === 'sidebar' ? 'bg-gray-800 border border-gray-700 italic' :
                'bg-gray-800'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-xl mt-1">{getEntryIcon(entry.type)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold ${getRoleColor(entry.role)}`}>
                      {entry.speaker}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({entry.role.replace('-', ' ')})
                    </span>
                    <span className="text-xs text-gray-600 ml-auto">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-200 leading-relaxed">
                    {entry.content}
                  </p>
                  {entry.metadata && (
                    <div className="mt-2 text-xs text-gray-500">
                      {Object.entries(entry.metadata).map(([key, value]) => (
                        <span key={key} className="mr-3">
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
    </motion.div>
  );
};