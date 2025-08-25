import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiLightningBolt, 
  HiWifi,
  HiX,
  HiCheck,
  HiClock,
  HiExclamation,
  HiChevronDown,
  HiChevronUp,
  HiDesktopComputer
} from 'react-icons/hi';
import { useCourtroomStore } from '../store/useCourtroomStore';
import { ParticipantRole } from '../types';

interface AgentStatus {
  id: string;
  name: string;
  role: ParticipantRole;
  model: string;
  status: 'idle' | 'thinking' | 'speaking' | 'error';
  lastActivity: Date;
  responseTime?: number;
  error?: string;
}

interface LLMConnection {
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  url: string;
  lastPing: Date;
  responseTime: number;
}

export const LLMStatusIndicator: React.FC = () => {
  const { 
    currentCase, 
    isProcessingAI, 
    currentAIOperation, 
    aiProgress,
    activeSpeaker,
    activeLLMAgents,
    llmConnectionStatus,
    updateAgentStatus,
    updateConnectionStatus
  } = useCourtroomStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Convert store data to component format
  const agentStatuses: AgentStatus[] = Array.from(activeLLMAgents.values()).map(agent => ({
    id: agent.participantId,
    name: agent.name,
    role: agent.role,
    model: agent.model,
    status: activeSpeaker === agent.name ? 'speaking' : agent.status,
    lastActivity: agent.lastActivity,
    responseTime: agent.responseTime,
    error: agent.error
  }));

  const llmConnections: LLMConnection[] = Array.from(llmConnectionStatus.values()).map(conn => ({
    provider: conn.provider,
    status: conn.status,
    url: conn.url,
    lastPing: conn.lastPing,
    responseTime: conn.responseTime
  }));

  // Ping Ollama server to check connection
  const pingOllamaServer = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch('http://localhost:11434/api/version', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      const responseTime = Date.now() - startTime;
      const status = response.ok ? 'connected' : 'error';
      
      updateConnectionStatus('ollama', status, responseTime);
    } catch (error) {
      updateConnectionStatus('ollama', 'disconnected', 0, (error as Error).message);
    }
  };

  // Periodic health check
  useEffect(() => {
    pingOllamaServer(); // Initial check
    const interval = setInterval(pingOllamaServer, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Update agent statuses based on AI processing
  useEffect(() => {
    if (isProcessingAI && currentAIOperation) {
      const operationParts = currentAIOperation.toLowerCase();
      agentStatuses.forEach(agent => {
        if (operationParts.includes(agent.name.toLowerCase()) || 
            operationParts.includes(agent.role)) {
          updateAgentStatus(agent.id, 'thinking');
        }
      });
    }
    setLastUpdate(new Date());
  }, [isProcessingAI, currentAIOperation, updateAgentStatus]);

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'thinking': return 'text-yellow-400';
      case 'speaking': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'thinking': return <HiClock className="animate-spin" />;
      case 'speaking': return <HiLightningBolt className="animate-pulse" />;
      case 'error': return <HiExclamation />;
      default: return <HiCheck />;
    }
  };

  const getConnectionIcon = (status: LLMConnection['status']) => {
    switch (status) {
      case 'connected': return <HiWifi className="text-green-400" />;
      case 'error': return <HiExclamation className="text-yellow-400" />;
      default: return <HiX className="text-red-400" />;
    }
  };

  const activeAgents = agentStatuses.filter(a => a.status !== 'idle').length;
  const totalAgents = agentStatuses.length;

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Compact View */}
      <motion.div
        className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div 
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <HiDesktopComputer className="text-blue-400" />
            <span className="font-medium text-white text-sm">
              LLM Agents
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {isProcessingAI && (
              <motion.div 
                className="w-2 h-2 bg-yellow-400 rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}
            <span className="text-xs text-gray-400">
              {activeAgents}/{totalAgents}
            </span>
            <div className="text-gray-400">
              {isExpanded ? <HiChevronUp /> : <HiChevronDown />}
            </div>
          </div>
        </div>

        {/* Progress Bar for AI Processing */}
        {isProcessingAI && aiProgress && (
          <div className="px-3 pb-2">
            <div className="w-full bg-gray-800 rounded-full h-1">
              <motion.div
                className="h-1 bg-yellow-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(aiProgress.current / aiProgress.total) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1 truncate">
              {currentAIOperation || 'Processing...'}
            </div>
          </div>
        )}
      </motion.div>

      {/* Expanded View */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-w-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Connection Status */}
            <div className="p-3 border-b border-gray-700">
              <h3 className="font-medium text-white mb-2 text-sm">Connection Status</h3>
              {llmConnections.map(conn => (
                <div key={conn.provider} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {getConnectionIcon(conn.status)}
                    <span className="text-gray-300">{conn.provider}</span>
                  </div>
                  <div className="text-gray-400">
                    {conn.responseTime > 0 && `${conn.responseTime}ms`}
                  </div>
                </div>
              ))}
            </div>

            {/* Agent List */}
            <div className="p-3 max-h-60 overflow-y-auto">
              <h3 className="font-medium text-white mb-2 text-sm">Active Agents</h3>
              <div className="space-y-2">
                {agentStatuses.map(agent => (
                  <motion.div
                    key={agent.id}
                    className="flex items-center gap-2 p-2 bg-gray-800 rounded text-xs"
                    animate={agent.status === 'thinking' ? { 
                      boxShadow: ['0 0 0 rgba(251, 191, 36, 0)', '0 0 10px rgba(251, 191, 36, 0.3)', '0 0 0 rgba(251, 191, 36, 0)'] 
                    } : {}}
                    transition={agent.status === 'thinking' ? { repeat: Infinity, duration: 2 } : {}}
                  >
                    <div className={`${getStatusColor(agent.status)}`}>
                      {getStatusIcon(agent.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">{agent.name}</div>
                      <div className="text-gray-400 capitalize">{agent.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400">{agent.model}</div>
                      <div className="text-gray-500 text-xs">
                        {agent.status === 'thinking' ? 'Processing...' : 
                         agent.status === 'speaking' ? 'Speaking' :
                         agent.status === 'error' ? 'Error' : 'Ready'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {agentStatuses.length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No AI agents active
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-gray-700 text-xs text-gray-500 text-center">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};