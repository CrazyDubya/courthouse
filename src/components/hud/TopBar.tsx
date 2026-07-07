import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiDesktopComputer, HiWifi, HiX, HiCheck, HiClock, HiExclamation } from 'react-icons/hi';
import { useCourtroomStore } from '../../store/useCourtroomStore';
import { useAutoHide } from './useAutoHide';
import { usePhaseBeat } from '../courtroom/cinematics';
import { HudSheet } from './HudSheet';
import { sectionLabel, glassPanelStyle } from './theme';

function titleCaseSlug(slug: string | undefined): string {
  if (!slug) return '';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

interface TopBarProps {
  onNewCase: () => void;
}

/**
 * Case identity + live agent status, floating top-center. Auto-hides like the
 * dock, but also flashes into view on every phase change (reusing the
 * cinematics' own `usePhaseBeat`) so the beat registers in the chrome too —
 * without repeating the in-scene phase banner's text.
 */
export const TopBar: React.FC<TopBarProps> = ({ onNewCase }) => {
  const {
    currentCase,
    isProcessingAI,
    currentAIOperation,
    aiProgress,
    activeSpeaker,
    activeLLMAgents,
    llmConnectionStatus,
    updateAgentStatus,
    updateConnectionStatus,
  } = useCourtroomStore();

  const [agentsOpen, setAgentsOpen] = useState(false);
  const [agentsHover, setAgentsHover] = useState(false);
  const [newCaseHover, setNewCaseHover] = useState(false);
  const beat = usePhaseBeat();
  const { visible, bind, show } = useAutoHide({ pinned: agentsOpen });

  useEffect(() => {
    if (beat) show();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat?.key]);

  const agentStatuses = Array.from(activeLLMAgents.values()).map((agent) => ({
    ...agent,
    status: activeSpeaker === agent.name ? ('speaking' as const) : agent.status,
  }));
  const connections = Array.from(llmConnectionStatus.values());
  const activeAgents = agentStatuses.filter((a) => a.status !== 'idle').length;

  // Health-check the local Ollama server, same cadence as the original
  // LLMStatusIndicator (ported verbatim so the connection badge stays live).
  useEffect(() => {
    const pingOllama = async () => {
      const start = Date.now();
      try {
        const res = await fetch('http://localhost:11434/api/version', {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        updateConnectionStatus('ollama', res.ok ? 'connected' : 'error', Date.now() - start);
      } catch (err) {
        updateConnectionStatus('ollama', 'disconnected', 0, (err as Error).message);
      }
    };
    pingOllama();
    const interval = setInterval(pingOllama, 10000);
    return () => clearInterval(interval);
  }, [updateConnectionStatus]);

  // Reflect the current AI operation onto the matching agent's status.
  useEffect(() => {
    if (!isProcessingAI || !currentAIOperation) return;
    const op = currentAIOperation.toLowerCase();
    agentStatuses.forEach((agent) => {
      if (op.includes(agent.name.toLowerCase()) || op.includes(agent.role)) {
        updateAgentStatus(agent.participantId, 'thinking');
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProcessingAI, currentAIOperation]);

  if (!currentCase) return null;

  const phaseLabel = beat?.phase ?? titleCaseSlug(currentCase.currentPhase);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex justify-center"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 8px)' }}
    >
      <AnimatePresence>
        {!visible && (
          <motion.button
            key="topbar-nub"
            type="button"
            aria-label="Show trial info"
            // Invisible ≥44px hit area around the small gold hairline visual,
            // so the summon target is actually tappable on a phone.
            className="pointer-events-auto flex h-11 w-28 items-center justify-center"
            style={{ backgroundColor: 'transparent', border: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseEnter={bind.onMouseEnter}
            onClick={bind.onTouchStart}
            onTouchStart={bind.onTouchStart}
          >
            <span
              className="h-1.5 w-16 rounded-full"
              style={{ backgroundColor: 'rgba(201, 162, 39, 0.45)' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.div
            key="topbar"
            className="pointer-events-auto flex items-center gap-3 sm:gap-5 rounded-2xl px-4 py-2.5 sm:px-5 mt-1"
            style={{ maxWidth: '94vw', ...glassPanelStyle() }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onMouseEnter={bind.onMouseEnter}
            onMouseLeave={bind.onMouseLeave}
          >
            <div className="min-w-0">
              <h1 className="font-serif text-[13px] sm:text-[15px] text-[#f2ead8] truncate max-w-[38vw] sm:max-w-xs">
                {currentCase.title}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <motion.span
                  key={beat?.key ?? phaseLabel}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] uppercase tracking-[0.14em] text-[#c9a227] whitespace-nowrap"
                >
                  {phaseLabel}
                </motion.span>
                <span className="text-[10px] text-[#f2ead8]/40">&middot;</span>
                <span className="text-[10px] uppercase tracking-[0.1em] text-[#f2ead8]/50 whitespace-nowrap">
                  {currentCase.type}
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-[#c9a227]/20 hidden sm:block" />

            <button
              type="button"
              onClick={() => setAgentsOpen((v) => !v)}
              onMouseEnter={() => setAgentsHover(true)}
              onMouseLeave={() => setAgentsHover(false)}
              style={{ backgroundColor: agentsHover ? 'rgba(255, 255, 255, 0.06)' : 'transparent' }}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 transition-colors ${
                agentsHover ? 'text-[#f2ead8]' : 'text-[#f2ead8]/80'
              }`}
            >
              <HiDesktopComputer className="text-[15px]" />
              <span className="text-xs whitespace-nowrap">
                {activeAgents}/{agentStatuses.length}
              </span>
              {isProcessingAI && (
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-[#c9a227]"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
              )}
            </button>

            <button
              type="button"
              onClick={onNewCase}
              onMouseEnter={() => setNewCaseHover(true)}
              onMouseLeave={() => setNewCaseHover(false)}
              style={{
                backgroundColor: 'transparent',
                borderColor: newCaseHover ? 'rgba(201, 162, 39, 0.5)' : 'rgba(201, 162, 39, 0.25)',
              }}
              className={`text-xs uppercase tracking-wide border rounded-full px-3 py-1.5 transition-colors whitespace-nowrap ${
                newCaseHover ? 'text-[#f2ead8]' : 'text-[#f2ead8]/60'
              }`}
            >
              New Case
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <HudSheet
        open={agentsOpen}
        onClose={() => setAgentsOpen(false)}
        title="LLM Agents"
        icon={<HiDesktopComputer className="w-4 h-4" />}
        anchor="top"
        align="right"
        widthClassName="w-80"
      >
        {isProcessingAI && (
          <div className="rounded-lg border border-[#c9a227]/25 bg-black/25 p-3">
            <div className="flex items-center gap-2 text-xs text-[#f2ead8]/90">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-[#c9a227]/40 border-t-[#c9a227] animate-spin" />
              {currentAIOperation || 'Generating AI response...'}
            </div>
            {aiProgress && (
              <div className="mt-2 h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-[#c9a227]"
                  animate={{ width: `${(aiProgress.current / aiProgress.total) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        )}

        <div>
          <div className={sectionLabel}>Connections</div>
          <div className="space-y-1.5 mt-1.5">
            {connections.map((conn) => (
              <div key={conn.provider} className="flex items-center justify-between text-xs text-[#f2ead8]/80">
                <span className="flex items-center gap-1.5">
                  {conn.status === 'connected' ? (
                    <HiWifi className="text-emerald-400" />
                  ) : conn.status === 'error' ? (
                    <HiExclamation className="text-amber-400" />
                  ) : (
                    <HiX className="text-red-400" />
                  )}
                  {conn.provider}
                </span>
                <span className="text-[#f2ead8]/40">{conn.responseTime > 0 ? `${conn.responseTime}ms` : ''}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className={sectionLabel}>Active Agents</div>
          {agentStatuses.length === 0 && (
            <div className="text-xs text-[#f2ead8]/40 py-2">No AI agents active</div>
          )}
          <div className="space-y-1.5 mt-1.5">
            {agentStatuses.map((agent) => (
              <div
                key={agent.participantId}
                className="flex items-center gap-2 rounded-lg bg-black/20 px-2.5 py-2 text-xs"
              >
                <span
                  className={
                    agent.status === 'thinking'
                      ? 'text-amber-400'
                      : agent.status === 'speaking'
                        ? 'text-[#c9a227]'
                        : agent.status === 'error'
                          ? 'text-red-400'
                          : 'text-[#f2ead8]/40'
                  }
                >
                  {agent.status === 'thinking' ? (
                    <HiClock className="animate-spin" />
                  ) : agent.status === 'error' ? (
                    <HiExclamation />
                  ) : (
                    <HiCheck />
                  )}
                </span>
                <span className="flex-1 min-w-0 truncate text-[#f2ead8]/90">{agent.name}</span>
                <span className="text-[#f2ead8]/40 capitalize whitespace-nowrap">
                  {agent.role.replace('-', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </HudSheet>
    </div>
  );
};
