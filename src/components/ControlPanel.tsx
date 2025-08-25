import React, { useState } from 'react';
import { useCourtroomStore } from '../store/useCourtroomStore';
import { ParticipantRole, LLMProvider, ObjectionType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiPlay, HiPause, HiStop, HiChevronDown, HiChevronRight,
  HiMicrophone, HiExclamation, HiDocumentDownload,
  HiCog, HiUsers, HiLightningBolt, HiViewBoards,
  HiUser, HiOutlineSparkles
} from 'react-icons/hi';

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isIconOnly?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  icon, 
  children, 
  defaultOpen = true,
  isIconOnly = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isIconOnly) {
    return (
      <div className="flex flex-col items-center space-y-2 mb-4">
        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-300">
          {icon}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        {isOpen ? <HiChevronDown className="w-4 h-4" /> : <HiChevronRight className="w-4 h-4" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ControlPanel: React.FC = () => {
  const {
    currentCase,
    userRole,
    simulationSettings,
    isSimulationRunning,
    isProcessingAI,
    currentAIOperation,
    aiProgress,
    isLeftSidebarCollapsed,
    leftSidebarWidth,
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

  // Determine if we should show icon-only mode
  const isIconOnly = isLeftSidebarCollapsed || leftSidebarWidth < 150;

  const getPhaseDescription = (phase: string | undefined): string => {
    switch (phase) {
      case 'pre-trial':
        return 'Court addresses pre-trial motions, evidence admissibility, and procedural matters before trial begins.';
      case 'jury-selection':
        return 'Attorneys question potential jurors to select an impartial jury for the case.';
      case 'opening-statements':
        return 'Both sides present their opening arguments to outline their case to the jury.';
      case 'plaintiff-case':
        return 'Prosecution/Plaintiff presents evidence and calls witnesses to prove their case.';
      case 'defense-case':
        return 'Defense presents evidence and witnesses to counter the plaintiff\'s case.';
      case 'closing-arguments':
        return 'Both sides make final arguments summarizing evidence and asking for verdict.';
      case 'jury-deliberation':
        return 'Jury discusses the case privately to reach a unanimous decision.';
      case 'verdict':
        return 'Jury announces their decision on guilt/liability and damages if applicable.';
      case 'sentencing':
        return 'Judge determines appropriate punishment for convicted defendants.';
      default:
        return 'Courtroom simulation ready to begin.';
    }
  };

  const getRoleDescription = (role: ParticipantRole | null): string => {
    switch (role) {
      case 'judge':
        return 'Presides over proceedings, makes legal rulings, and ensures fair trial.';
      case 'prosecutor':
        return 'Represents the state/government in criminal cases, seeks to prove guilt.';
      case 'defense-attorney':
        return 'Defends the accused, challenges evidence, protects client rights.';
      case 'plaintiff-attorney':
        return 'Represents the plaintiff in civil cases, seeks damages/remedies.';
      case 'defendant':
        return 'Person accused of crime or being sued, has right to defense.';
      case 'plaintiff':
        return 'Person bringing civil lawsuit, seeking damages or relief.';
      case 'witness':
        return 'Provides testimony about facts relevant to the case.';
      case 'jury-member':
        return 'Listens to evidence and decides on verdict based on facts presented.';
      case 'observer':
        return 'Watches proceedings without participating in the trial.';
      default:
        return 'AI controls all participants. You can observe the automated simulation.';
    }
  };

  const getRoleTips = (role: ParticipantRole): string => {
    switch (role) {
      case 'judge':
        return 'Maintain neutrality, make rulings on objections, control courtroom proceedings.';
      case 'prosecutor':
        return 'Present evidence methodically, object to improper defense tactics, prove guilt beyond reasonable doubt.';
      case 'defense-attorney':
        return 'Challenge prosecution evidence, create reasonable doubt, protect client\'s constitutional rights.';
      case 'plaintiff-attorney':
        return 'Prove liability by preponderance of evidence, demonstrate damages clearly.';
      case 'defendant':
        return 'Work with your attorney, answer questions honestly, exercise your right to remain silent.';
      case 'plaintiff':
        return 'Provide clear testimony about damages and how they occurred.';
      case 'witness':
        return 'Answer questions truthfully, stick to facts you personally observed.';
      case 'jury-member':
        return 'Listen carefully to all evidence, deliberate based on facts presented, not emotions.';
      default:
        return 'Observe courtroom etiquette and procedures.';
    }
  };

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
      className={`bg-gray-900 text-white ${isIconOnly ? 'p-2' : 'p-6'} h-full overflow-y-auto`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!isIconOnly && (
        <h2 className="text-2xl font-bold mb-6">Simulation Controls</h2>
      )}
      
      {/* Current Phase Status */}
      <CollapsibleSection
        title="Current Phase"
        icon={<HiViewBoards className="w-5 h-5" />}
        isIconOnly={isIconOnly}
        defaultOpen={true}
      >
        <div className="space-y-2">
          <p className="text-yellow-400 text-xl capitalize">
            {currentCase?.currentPhase.replace('-', ' ') || 'Not Started'}
          </p>
          
          {/* Phase Description */}
          <div className="text-sm text-gray-400 bg-gray-800 p-2 rounded">
            {getPhaseDescription(currentCase?.currentPhase)}
          </div>
          
          {/* Auto Mode Status */}
          {simulationSettings.autoProgress && isSimulationRunning && (
            <div className="text-green-400 text-sm flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Auto Mode: Simulation proceeding automatically</span>
            </div>
          )}
          
          {/* Manual Mode Instructions */}
          {!simulationSettings.autoProgress && (
            <div className="text-blue-400 text-sm">
              Manual Mode: Use "Next Phase" to advance
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* AI Processing Status */}
      {isProcessingAI && (
        <CollapsibleSection
          title="AI Processing"
          icon={<HiOutlineSparkles className="w-5 h-5 animate-spin" />}
          isIconOnly={isIconOnly}
          defaultOpen={true}
        >
          <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              <span className="text-blue-300 text-sm">
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
        </CollapsibleSection>
      )}

      {/* Your Role */}
      <CollapsibleSection
        title="Your Role"
        icon={<HiUser className="w-5 h-5" />}
        isIconOnly={isIconOnly}
        defaultOpen={!isIconOnly}
      >
        <div className="space-y-3">
          <select
            value={userRole || ''}
            onChange={(e) => setUserRole(e.target.value as ParticipantRole || null)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
            disabled={isSimulationRunning}
          >
            <option value="">AI Controlled (Observer)</option>
            {availableRoles.map(role => (
              <option key={role} value={role}>
                {role.replace('-', ' ').charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
          
          {/* Role Description */}
          <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
            <strong>Your responsibility:</strong> {getRoleDescription(userRole)}
          </div>
          
          {/* Role-specific tips */}
          {userRole && userRole !== 'observer' && (
            <div className="text-xs text-blue-300 bg-blue-900/20 border border-blue-800 p-2 rounded">
              💡 <strong>Tip:</strong> {getRoleTips(userRole)}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Simulation Speed */}
      <CollapsibleSection
        title="Speed"
        icon={<HiLightningBolt className="w-5 h-5" />}
        isIconOnly={isIconOnly}
        defaultOpen={false}
      >
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
      </CollapsibleSection>

      {/* Settings */}
      <CollapsibleSection
        title="Settings"
        icon={<HiCog className="w-5 h-5" />}
        isIconOnly={isIconOnly}
        defaultOpen={false}
      >
        <div className="space-y-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={simulationSettings.autoProgress}
              onChange={(e) => updateSimulationSettings({ autoProgress: e.target.checked })}
              className="mr-2"
            />
            Auto Progress
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={simulationSettings.enableObjections}
              onChange={(e) => updateSimulationSettings({ enableObjections: e.target.checked })}
              className="mr-2"
            />
            Enable Objections
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={simulationSettings.enableSidebar}
              onChange={(e) => updateSimulationSettings({ enableSidebar: e.target.checked })}
              className="mr-2"
            />
            Enable Sidebar Conferences
          </label>
        </div>
      </CollapsibleSection>

      {/* Jury Size */}
      <CollapsibleSection
        title="Jury Size"
        icon={<HiUsers className="w-5 h-5" />}
        isIconOnly={isIconOnly}
        defaultOpen={false}
      >
        <input
          type="number"
          min="6"
          max="12"
          value={simulationSettings.jurySize}
          onChange={(e) => updateSimulationSettings({ jurySize: parseInt(e.target.value) })}
          className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
          disabled={isSimulationRunning}
        />
      </CollapsibleSection>

      {/* Simulation Controls */}
      <CollapsibleSection
        title="Controls"
        icon={<HiPlay className="w-5 h-5" />}
        isIconOnly={isIconOnly}
        defaultOpen={true}
      >
        <div className="space-y-2">
          <button
            onClick={startSimulation}
            disabled={isSimulationRunning || !currentCase}
            className="w-full py-2 px-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded transition-colors text-sm flex items-center justify-center space-x-2"
          >
            <HiPlay className="w-4 h-4" />
            <span>{isSimulationRunning ? 'Running...' : 'Start'}</span>
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={pauseSimulation}
              disabled={!isSimulationRunning}
              className="py-2 px-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 rounded transition-colors text-sm flex items-center justify-center space-x-1"
            >
              <HiPause className="w-4 h-4" />
              <span>Pause</span>
            </button>
            
            <button
              onClick={stopSimulation}
              disabled={!isSimulationRunning}
              className="py-2 px-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded transition-colors text-sm flex items-center justify-center space-x-1"
            >
              <HiStop className="w-4 h-4" />
              <span>Stop</span>
            </button>
          </div>
          
          <button
            onClick={nextPhase}
            disabled={isSimulationRunning || !currentCase}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded transition-colors text-sm"
          >
            Next Phase
          </button>
        </div>
      </CollapsibleSection>

      {/* User Actions */}
      {userRole && userRole !== 'observer' && userRole !== 'jury-member' && (
        <CollapsibleSection
          title="Your Actions"
          icon={<HiMicrophone className="w-5 h-5" />}
          isIconOnly={isIconOnly}
          defaultOpen={true}
        >
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitInput()}
                placeholder="Enter your statement..."
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
              />
              <button
                onClick={handleSubmitInput}
                className="w-full mt-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm flex items-center justify-center space-x-2"
              >
                <HiMicrophone className="w-4 h-4" />
                <span>Speak</span>
              </button>
            </div>
            
            {(userRole === 'prosecutor' || userRole === 'defense-attorney' || userRole === 'plaintiff-attorney') && (
              <div className="space-y-2">
                <select
                  value={selectedObjection}
                  onChange={(e) => setSelectedObjection(e.target.value as ObjectionType)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                >
                  {objectionTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('-', ' ').charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => triggerObjection(selectedObjection)}
                  className="w-full py-2 px-3 bg-orange-600 hover:bg-orange-700 rounded transition-colors text-sm flex items-center justify-center space-x-2"
                >
                  <HiExclamation className="w-4 h-4" />
                  <span>Object!</span>
                </button>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Export */}
      <CollapsibleSection
        title="Export"
        icon={<HiDocumentDownload className="w-5 h-5" />}
        isIconOnly={isIconOnly}
        defaultOpen={false}
      >
        <button
          onClick={handleExportTranscript}
          disabled={!currentCase || currentCase.transcript.length === 0}
          className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded transition-colors text-sm flex items-center justify-center space-x-2"
        >
          <HiDocumentDownload className="w-4 h-4" />
          <span>Export Transcript</span>
        </button>
      </CollapsibleSection>
    </motion.div>
  );
};