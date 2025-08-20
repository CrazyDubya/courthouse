import React, { useState } from 'react';
import { useCourtroomStore } from '../store/useCourtroomStore';
import { ParticipantRole, LLMProvider, ObjectionType } from '../types';
import { motion } from 'framer-motion';

export const ControlPanel: React.FC = () => {
  const {
    currentCase,
    userRole,
    simulationSettings,
    isSimulationRunning,
    isProcessingAI,
    currentAIOperation,
    aiProgress,
    setUserRole,
    updateSimulationSettings,
    startSimulation,
    stopSimulation,
    pauseSimulation,
    nextPhase,
    processUserInput,
    triggerObjection,
    exportTranscript,
  } = useCourtroomStore();

  const [userInput, setUserInput] = useState('');
  const [selectedObjection, setSelectedObjection] = useState<ObjectionType>('relevance');

  const availableRoles: ParticipantRole[] = [
    'judge', 'prosecutor', 'defense-attorney', 'plaintiff-attorney', 
    'defendant', 'plaintiff', 'witness', 'jury-member', 'observer'
  ];

  const objectionTypes: ObjectionType[] = [
    'relevance', 'hearsay', 'speculation', 'leading-question',
    'argumentative', 'asked-and-answered', 'compound-question', 'foundation', 'privilege'
  ];

  const handleSubmitInput = () => {
    if (userInput.trim()) {
      processUserInput(userInput);
      setUserInput('');
    }
  };

  const handleExportTranscript = () => {
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
    <motion.div 
      className="bg-gray-900 text-white p-6 rounded-lg shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4">Simulation Controls</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Phase</h3>
        <p className="text-yellow-400 text-xl capitalize">
          {currentCase?.currentPhase.replace('-', ' ') || 'Not Started'}
        </p>
      </div>

      {/* AI Processing Status */}
      {isProcessingAI && (
        <div className="mb-6 bg-blue-900/50 border border-blue-600 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2 text-blue-400">AI Processing</h3>
          <div className="flex items-center space-x-2 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
            <span className="text-blue-300">
              {currentAIOperation || 'Generating AI response...'}
            </span>
          </div>
          {aiProgress && (
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(aiProgress.current / aiProgress.total) * 100}%` }}
              ></div>
              <p className="text-xs text-gray-400 mt-1">
                {aiProgress.current} / {aiProgress.total}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Your Role</h3>
        <select
          value={userRole || ''}
          onChange={(e) => setUserRole(e.target.value as ParticipantRole || null)}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          disabled={isSimulationRunning}
        >
          <option value="">AI Controlled (Observer)</option>
          {availableRoles.map(role => (
            <option key={role} value={role}>
              {role.replace('-', ' ').charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Simulation Speed</h3>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={simulationSettings.realtimeSpeed}
          onChange={(e) => updateSimulationSettings({ realtimeSpeed: parseFloat(e.target.value) })}
          className="w-full"
        />
        <p className="text-sm text-gray-400 mt-1">{simulationSettings.realtimeSpeed}x speed</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Settings</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={simulationSettings.autoProgress}
              onChange={(e) => updateSimulationSettings({ autoProgress: e.target.checked })}
              className="mr-2"
            />
            Auto Progress
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={simulationSettings.enableObjections}
              onChange={(e) => updateSimulationSettings({ enableObjections: e.target.checked })}
              className="mr-2"
            />
            Enable Objections
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={simulationSettings.enableSidebar}
              onChange={(e) => updateSimulationSettings({ enableSidebar: e.target.checked })}
              className="mr-2"
            />
            Enable Sidebar Conferences
          </label>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Jury Size</h3>
        <input
          type="number"
          min="6"
          max="12"
          value={simulationSettings.jurySize}
          onChange={(e) => updateSimulationSettings({ jurySize: parseInt(e.target.value) })}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
          disabled={isSimulationRunning}
        />
      </div>

      <div className="mb-6 space-y-2">
        <button
          onClick={startSimulation}
          disabled={isSimulationRunning || !currentCase}
          className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded transition-colors"
        >
          {isSimulationRunning ? 'Running...' : 'Start Simulation'}
        </button>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={pauseSimulation}
            disabled={!isSimulationRunning}
            className="py-2 px-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded transition-colors"
          >
            Pause
          </button>
          
          <button
            onClick={stopSimulation}
            disabled={!isSimulationRunning}
            className="py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded transition-colors"
          >
            Stop
          </button>
        </div>
        
        <button
          onClick={nextPhase}
          disabled={isSimulationRunning || !currentCase}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors"
        >
          Next Phase
        </button>
      </div>

      {userRole && userRole !== 'observer' && userRole !== 'jury-member' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Your Actions</h3>
          
          <div className="mb-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitInput()}
              placeholder="Enter your statement..."
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
            />
            <button
              onClick={handleSubmitInput}
              className="w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              Speak
            </button>
          </div>
          
          {(userRole === 'prosecutor' || userRole === 'defense-attorney' || userRole === 'plaintiff-attorney') && (
            <div className="flex gap-2">
              <select
                value={selectedObjection}
                onChange={(e) => setSelectedObjection(e.target.value as ObjectionType)}
                className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded"
              >
                {objectionTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace('-', ' ').charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
              <button
                onClick={() => triggerObjection(selectedObjection)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition-colors"
              >
                Object!
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleExportTranscript}
          disabled={!currentCase || currentCase.transcript.length === 0}
          className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded transition-colors"
        >
          Export Transcript
        </button>
      </div>
    </motion.div>
  );
};