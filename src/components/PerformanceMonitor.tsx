import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBackendAPIClient } from '../services/BackendAPIClient';
import { getWebSocketClient } from '../services/WebSocketClient';
import { FiActivity, FiCpu, FiDatabase, FiZap, FiCheckCircle, FiAlertTriangle, FiX } from 'react-icons/fi';

interface PerformanceMetrics {
  status: string;
  services: {
    llm: {
      providers: Record<string, { available: boolean; models?: string[] }>;
    };
    queue: {
      pending: number;
      processing: number;
      completed: number;
      failed: number;
    };
    sessions: {
      active: number;
      total: number;
    };
    ollama: Array<{
      port: number;
      healthy: boolean;
      models: string[];
      activeRequests: number;
    }>;
    circuitBreakers: Record<string, { state: string; failures: number }>;
  };
  uptime: number;
  timestamp: string;
}

interface QueueStatusData {
  position: number;
  total: number;
  estimatedWait?: number;
}

export const PerformanceMonitor: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Initial load
    fetchMetrics();

    // Set up WebSocket listeners
    const wsClient = getWebSocketClient();
    setWsConnected(wsClient.isConnected());

    const handleQueueStatus = (status: QueueStatusData) => {
      setQueueStatus(status);
    };

    const handleConnected = () => setWsConnected(true);
    const handleDisconnected = () => setWsConnected(false);

    wsClient.on('queue:status', handleQueueStatus);
    wsClient.on('connected', handleConnected);
    wsClient.on('disconnected', handleDisconnected);

    // Auto-refresh every 5 seconds
    const interval = autoRefresh ? setInterval(fetchMetrics, 5000) : null;

    return () => {
      if (interval) clearInterval(interval);
      wsClient.off('queue:status', handleQueueStatus);
      wsClient.off('connected', handleConnected);
      wsClient.off('disconnected', handleDisconnected);
    };
  }, [autoRefresh]);

  const fetchMetrics = async () => {
    try {
      const apiClient = getBackendAPIClient();
      const data = await apiClient.getStatus();
      setMetrics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusColor = (status: string | boolean): string => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-400' : 'text-red-400';
    }
    if (status === 'ok' || status === 'closed' || status === 'open') return 'text-green-400';
    if (status === 'half-open') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? <FiCheckCircle className="text-green-400" /> : <FiAlertTriangle className="text-red-400" />;
  };

  if (loading && !metrics) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-center">
          <FiActivity className="animate-spin mr-2" />
          <span>Loading performance metrics...</span>
        </div>
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="bg-gray-900 border border-red-700 rounded-lg p-6 text-white">
        <div className="flex items-center text-red-400">
          <FiAlertTriangle className="mr-2" />
          <span>Error: {error}</span>
        </div>
        <button
          onClick={fetchMetrics}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-white relative"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiActivity className="text-blue-400 mr-2 text-xl" />
          <h2 className="text-xl font-bold">Performance Monitor</h2>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh
          </label>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded transition-colors"
              aria-label="Close"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FiZap />}
          label="Backend Status"
          value={metrics?.status || 'Unknown'}
          color={getStatusColor(metrics?.status || '')}
        />
        <StatCard
          icon={<FiDatabase />}
          label="WebSocket"
          value={wsConnected ? 'Connected' : 'Disconnected'}
          color={getStatusColor(wsConnected)}
        />
        <StatCard
          icon={<FiCpu />}
          label="Uptime"
          value={metrics ? formatUptime(metrics.uptime) : 'N/A'}
          color="text-blue-400"
        />
        <StatCard
          icon={<FiActivity />}
          label="Active Sessions"
          value={metrics?.services.sessions.active || 0}
          color="text-purple-400"
        />
      </div>

      {/* LLM Providers */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FiCpu className="mr-2" />
          LLM Providers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {metrics?.services.llm.providers &&
            Object.entries(metrics.services.llm.providers).map(([name, provider]) => (
              <div key={name} className="bg-gray-800 rounded p-3 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium capitalize">{name}</span>
                  {getStatusIcon(provider.available)}
                </div>
                {provider.models && provider.models.length > 0 && (
                  <div className="text-xs text-gray-400">
                    {provider.models.length} model{provider.models.length > 1 ? 's' : ''} available
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Ollama Instances */}
      {metrics?.services.ollama && metrics.services.ollama.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FiDatabase className="mr-2" />
            Ollama Instances
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {metrics.services.ollama.map((instance, index) => (
              <div key={index} className="bg-gray-800 rounded p-3 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Port {instance.port}</span>
                  {getStatusIcon(instance.healthy)}
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Active: {instance.activeRequests}</div>
                  <div className="text-xs">{instance.models.length} models loaded</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Queue Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FiActivity className="mr-2" />
          Request Queue
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QueueStat label="Pending" value={metrics?.services.queue.pending || 0} color="text-yellow-400" />
          <QueueStat label="Processing" value={metrics?.services.queue.processing || 0} color="text-blue-400" />
          <QueueStat label="Completed" value={metrics?.services.queue.completed || 0} color="text-green-400" />
          <QueueStat label="Failed" value={metrics?.services.queue.failed || 0} color="text-red-400" />
        </div>
        {queueStatus && queueStatus.position > 0 && (
          <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded text-sm">
            Your position in queue: {queueStatus.position} of {queueStatus.total}
            {queueStatus.estimatedWait && ` (~${Math.round(queueStatus.estimatedWait / 1000)}s wait)`}
          </div>
        )}
      </div>

      {/* Circuit Breakers */}
      {metrics?.services.circuitBreakers && Object.keys(metrics.services.circuitBreakers).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FiZap className="mr-2" />
            Circuit Breakers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(metrics.services.circuitBreakers).map(([name, breaker]) => (
              <div key={name} className="bg-gray-800 rounded p-3 border border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(breaker.state)}`}>
                    {breaker.state}
                  </span>
                </div>
                <div className="text-xs text-gray-400">Failures: {breaker.failures}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 text-right">
        Last updated: {metrics ? new Date(metrics.timestamp).toLocaleTimeString() : 'Never'}
      </div>
    </motion.div>
  );
};

// Helper Components
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={color}>{icon}</span>
    </div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
);

const QueueStat: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="bg-gray-800 rounded p-3 border border-gray-700">
    <div className="text-sm text-gray-400 mb-1">{label}</div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
  </div>
);
