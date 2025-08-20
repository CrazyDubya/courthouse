import React, { useState, useEffect } from 'react';
import { ParticipantRole } from '../types';
import { ollamaInstanceManager, OllamaInstance } from '../services/OllamaInstanceManager';
import { performanceMonitor } from '../services/PerformanceMonitor';

interface OllamaInstancePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OllamaInstancePanel: React.FC<OllamaInstancePanelProps> = ({ isOpen, onClose }) => {
  const [instances, setInstances] = useState<OllamaInstance[]>([]);
  const [roleAssignments, setRoleAssignments] = useState<Map<ParticipantRole, string>>(new Map());
  const [stats, setStats] = useState({ total: 0, healthy: 0, unhealthy: 0 });
  const [selectedRole, setSelectedRole] = useState<ParticipantRole>('judge');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'instances' | 'performance'>('instances');

  const roles: ParticipantRole[] = [
    'judge', 'prosecutor', 'defense-attorney', 'plaintiff-attorney',
    'witness', 'jury-member', 'court-clerk', 'bailiff'
  ];

  useEffect(() => {
    if (isOpen) {
      refreshData();
      const interval = setInterval(refreshData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const refreshData = () => {
    setInstances(ollamaInstanceManager.getAllInstances());
    setRoleAssignments(ollamaInstanceManager.getRoleAssignments());
    setStats(ollamaInstanceManager.getInstanceStats());
    setPerformanceStats(performanceMonitor.getCurrentSystemStatus());
  };

  const handleRoleAssignment = async () => {
    if (selectedRole && selectedInstanceId) {
      const success = await ollamaInstanceManager.assignRoleToInstance(selectedRole, selectedInstanceId);
      if (success) {
        refreshData();
      } else {
        alert('Failed to assign role to instance');
      }
    }
  };

  const handleRestartInstance = async (instanceId: string) => {
    const success = await ollamaInstanceManager.restartInstance(instanceId);
    if (success) {
      refreshData();
    } else {
      alert('Failed to restart instance');
    }
  };

  const getInstanceStatusColor = (isHealthy: boolean) => {
    return isHealthy ? 'text-green-500' : 'text-red-500';
  };

  const getInstanceStatusIcon = (isHealthy: boolean) => {
    return isHealthy ? '✅' : '❌';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Ollama Instance Manager</h2>
            <div className="flex space-x-4 mt-2">
              <button
                onClick={() => setActiveTab('instances')}
                className={`px-3 py-1 rounded text-sm ${activeTab === 'instances' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Instances
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`px-3 py-1 rounded text-sm ${activeTab === 'performance' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Performance
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {activeTab === 'instances' && (
          <>
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
            <div className="text-gray-300 text-sm">Total Instances</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.healthy}</div>
            <div className="text-gray-300 text-sm">Healthy</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.unhealthy}</div>
            <div className="text-gray-300 text-sm">Unhealthy</div>
          </div>
        </div>

        {/* Instance List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Instance Status</h3>
          <div className="bg-gray-700 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-600">
                <tr>
                  <th className="text-left p-3 text-gray-300">Status</th>
                  <th className="text-left p-3 text-gray-300">Model</th>
                  <th className="text-left p-3 text-gray-300">Port</th>
                  <th className="text-left p-3 text-gray-300">Assigned Roles</th>
                  <th className="text-left p-3 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {instances.map((instance) => (
                  <tr key={instance.id} className="border-t border-gray-600">
                    <td className="p-3">
                      <span className={getInstanceStatusColor(instance.isHealthy)}>
                        {getInstanceStatusIcon(instance.isHealthy)} 
                        {instance.isHealthy ? 'Healthy' : 'Unhealthy'}
                      </span>
                    </td>
                    <td className="p-3 text-white font-medium">{instance.model}</td>
                    <td className="p-3 text-gray-300">{instance.port}</td>
                    <td className="p-3 text-gray-300">
                      {instance.assignedRoles.join(', ') || 'None'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleRestartInstance(instance.id)}
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm text-white"
                        disabled={instance.isHealthy}
                      >
                        Restart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role Assignment */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Role Assignment</h3>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as ParticipantRole)}
                  className="w-full bg-gray-600 text-white p-2 rounded"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-2">Instance</label>
                <select
                  value={selectedInstanceId}
                  onChange={(e) => setSelectedInstanceId(e.target.value)}
                  className="w-full bg-gray-600 text-white p-2 rounded"
                >
                  <option value="">Select instance</option>
                  {instances
                    .filter(instance => instance.isHealthy)
                    .map((instance) => (
                      <option key={instance.id} value={instance.id}>
                        {instance.model} (port {instance.port})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleRoleAssignment}
                  disabled={!selectedRole || !selectedInstanceId}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded text-white w-full"
                >
                  Assign Role
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Current Role Mappings */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Current Role Mappings</h3>
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              {roles.map((role) => {
                const assignedInstanceId = roleAssignments.get(role);
                const assignedInstance = instances.find(i => i.id === assignedInstanceId);
                return (
                  <div key={role} className="flex justify-between items-center py-2 border-b border-gray-600">
                    <span className="text-gray-300 capitalize">
                      {role.replace('-', ' ')}
                    </span>
                    <span className="text-white">
                      {assignedInstance 
                        ? `${assignedInstance.model} (${assignedInstance.port})`
                        : 'Not assigned'
                      }
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2">💡 Tips for Multi-Model Setup</h4>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• <strong>Judge:</strong> Use llama3:latest for consistent judicial decisions</li>
            <li>• <strong>Attorneys:</strong> Use mistral:7b for analytical legal reasoning</li>
            <li>• <strong>Jury:</strong> Use llama3.2:3b or smollm2:1.7b for efficiency</li>
            <li>• <strong>Witnesses:</strong> Use gemma2:9b or qwen2.5:3b for variety</li>
            <li>• Start additional Ollama servers with: <code className="bg-gray-600 px-1 rounded">ollama serve --port 11435</code></li>
          </ul>
        </div>
          </>
        )}

        {activeTab === 'performance' && (
          <>
            {/* Performance Dashboard */}
            {performanceStats && (
              <div className="space-y-6">
                {/* System Status */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {performanceStats.memoryUsage.toFixed(1)}%
                    </div>
                    <div className="text-gray-300 text-sm">Memory Usage</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {performanceStats.cpuUsage.toFixed(1)}%
                    </div>
                    <div className="text-gray-300 text-sm">CPU Usage</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {performanceStats.activeInstances}
                    </div>
                    <div className="text-gray-300 text-sm">Active Instances</div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {performanceStats.avgResponseTime.toFixed(0)}ms
                    </div>
                    <div className="text-gray-300 text-sm">Avg Response</div>
                  </div>
                </div>

                {/* Model Performance */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Model Performance</h3>
                  <div className="space-y-2">
                    {instances.map((instance) => {
                      const modelStats = performanceMonitor.getModelPerformanceStats(instance.model, 300000);
                      return (
                        <div key={instance.id} className="flex justify-between items-center py-2 border-b border-gray-600 last:border-b-0">
                          <span className="text-gray-300 font-medium">{instance.model}</span>
                          <div className="flex space-x-4 text-sm">
                            <span className="text-blue-400">
                              {modelStats.avgResponseTime.toFixed(0)}ms avg
                            </span>
                            <span className="text-green-400">
                              {modelStats.requestCount} requests
                            </span>
                            <span className={modelStats.successRate > 90 ? 'text-green-400' : 'text-yellow-400'}>
                              {modelStats.successRate.toFixed(1)}% success
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Performing Models */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">🏆 Top Performing Models</h3>
                  <div className="space-y-2">
                    {performanceMonitor.getTopPerformingModels(5).map((model, index) => (
                      <div key={model.model} className="flex justify-between items-center py-2">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊'}
                          </span>
                          <span className="text-white font-medium">{model.model}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 text-sm">{model.avgResponseTime.toFixed(0)}ms</div>
                          <div className="text-gray-400 text-xs">{model.requestCount} requests</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Performance Data */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">📊 Performance Data</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const data = performanceMonitor.exportMetrics();
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `ollama-performance-${Date.now()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white text-sm"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => {
                        const data = performanceMonitor.exportMetrics();
                        const csvContent = [
                          'timestamp,model,responseTime,port,isHealthy',
                          ...data.performanceMetrics.map(m => 
                            `${m.timestamp},${m.model},${m.responseTime},${m.port},${m.isHealthy}`
                          )
                        ].join('\\n');
                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `ollama-performance-${Date.now()}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white text-sm"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};