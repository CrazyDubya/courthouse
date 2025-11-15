import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Case,
  Participant,
  Evidence,
  SimulationSettings,
  LLMConfig,
  ProceedingPhase,
  TranscriptEntry,
  ParticipantRole
} from '../types';
import type { EconomicValuation } from '../types/caseTypes';
import { ProceedingsEngine, ProceedingEvent } from '../services/ProceedingsEngine';

interface CourtroomState {
  currentCase: Case | null;
  userRole: ParticipantRole | null;
  proceedingsEngine: ProceedingsEngine | null;
  simulationSettings: SimulationSettings;
  llmConfigs: Map<string, LLMConfig>;
  activeSpeaker: string | null;
  events: ProceedingEvent[];
  isSimulationRunning: boolean;
  isProcessingAI: boolean;
  currentAIOperation: string | null;
  aiProgress: { current: number; total: number } | null;
  
  // LLM Monitoring
  activeLLMAgents: Map<string, {
    participantId: string;
    name: string;
    role: ParticipantRole;
    model: string;
    status: 'idle' | 'thinking' | 'speaking' | 'error';
    lastActivity: Date;
    responseTime?: number;
    error?: string;
  }>;
  llmConnectionStatus: Map<string, {
    provider: string;
    status: 'connected' | 'disconnected' | 'error';
    url: string;
    lastPing: Date;
    responseTime: number;
    errorMessage?: string;
  }>;
  
  // Sidebar state
  isLeftSidebarCollapsed: boolean;
  isRightSidebarCollapsed: boolean;
  leftSidebarWidth: number;
  rightSidebarWidth: number;

  // Economic valuation state
  economicValuation: EconomicValuation | null;
  showValuationPanel: boolean;

  setCurrentCase: (caseData: Case) => void;
  setUserRole: (role: ParticipantRole | null) => void;
  updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
  addEvidence: (evidence: Evidence) => void;
  removeEvidence: (evidenceId: string) => void;
  updateSimulationSettings: (settings: Partial<SimulationSettings>) => void;
  setLLMConfig: (provider: string, config: LLMConfig) => void;

  // Economic valuation methods
  setEconomicValuation: (valuation: EconomicValuation | null) => void;
  toggleValuationPanel: () => void;
  setShowValuationPanel: (show: boolean) => void;
  
  startSimulation: () => Promise<void>;
  stopSimulation: () => void;
  pauseSimulation: () => void;
  nextPhase: () => void;
  
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  clearTranscript: () => void;
  
  processUserInput: (input: string) => void;
  triggerObjection: (type: string) => void;
  presentEvidence: (evidenceId: string) => void;
  
  setAIProcessing: (isProcessing: boolean, operation?: string) => void;
  setAIProgress: (current: number, total: number) => void;
  
  // LLM Monitoring methods
  updateAgentStatus: (participantId: string, status: 'idle' | 'thinking' | 'speaking' | 'error', responseTime?: number, error?: string) => void;
  updateConnectionStatus: (provider: string, status: 'connected' | 'disconnected' | 'error', responseTime?: number, errorMessage?: string) => void;
  initializeLLMMonitoring: () => void;
  
  saveCase: () => void;
  loadCase: (caseId: string) => void;
  exportTranscript: () => string;
  
  // Sidebar management
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarWidth: (width: number) => void;
  setRightSidebarWidth: (width: number) => void;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  setRightSidebarCollapsed: (collapsed: boolean) => void;
}

export const useCourtroomStore = create<CourtroomState>()(
  persist(
    (set, get) => ({
      currentCase: null,
      userRole: null,
      proceedingsEngine: null,
      simulationSettings: {
        realtimeSpeed: 1,
        autoProgress: true,
        detailLevel: 'standard',
        enableObjections: true,
        enableSidebar: true,
        jurySize: 6,
        allowUserIntervention: true,
        recordTranscript: true,
      },
      llmConfigs: new Map(),
      activeSpeaker: null,
      events: [],
      isSimulationRunning: false,
      isProcessingAI: false,
      currentAIOperation: null,
      aiProgress: null,
      
      // LLM Monitoring initial state
      activeLLMAgents: new Map(),
      llmConnectionStatus: new Map([
        ['ollama', {
          provider: 'Ollama',
          status: 'disconnected',
          url: 'http://localhost:11434',
          lastPing: new Date(),
          responseTime: 0
        }]
      ]),
      
      // Sidebar initial state
      isLeftSidebarCollapsed: false,
      isRightSidebarCollapsed: false,
      leftSidebarWidth: 320, // w-80 equivalent
      rightSidebarWidth: 384, // w-96 equivalent

      // Economic valuation initial state
      economicValuation: null,
      showValuationPanel: false,

      setCurrentCase: (caseData) => {
        console.log('📋 Setting current case:', caseData.title);
        console.log('📋 Case phase:', caseData.currentPhase);
        console.log('📋 Participants count:', caseData.participants.length);
        
        set({ currentCase: caseData });
        
        try {
          const engine = new ProceedingsEngine(caseData, get().simulationSettings, {
            setAIProcessing: get().setAIProcessing,
            setAIProgress: get().setAIProgress,
          });
          console.log('⚙️ Created ProceedingsEngine successfully');
          set({ proceedingsEngine: engine });
        } catch (error) {
          console.error('❌ Error creating ProceedingsEngine:', error);
        }
        
        // Initialize LLM monitoring for new case
        get().initializeLLMMonitoring();
      },

      setUserRole: (role) => {
        set({ userRole: role });
        if (role && get().currentCase) {
          const userParticipant = get().currentCase?.participants.find(p => p.role === role);
          if (userParticipant) {
            get().updateParticipant(userParticipant.id, { aiControlled: false });
          }
        }
      },

      updateParticipant: (participantId, updates) => {
        set((state) => {
          if (!state.currentCase) return state;
          
          const participants = state.currentCase.participants.map(p =>
            p.id === participantId ? { ...p, ...updates } : p
          );
          
          return {
            currentCase: {
              ...state.currentCase,
              participants,
            },
          };
        });
      },

      addEvidence: (evidence) => {
        set((state) => {
          if (!state.currentCase) return state;
          
          return {
            currentCase: {
              ...state.currentCase,
              evidence: [...state.currentCase.evidence, evidence],
            },
          };
        });
      },

      removeEvidence: (evidenceId) => {
        set((state) => {
          if (!state.currentCase) return state;
          
          return {
            currentCase: {
              ...state.currentCase,
              evidence: state.currentCase.evidence.filter(e => e.id !== evidenceId),
            },
          };
        });
      },

      updateSimulationSettings: (settings) => {
        set((state) => ({
          simulationSettings: {
            ...state.simulationSettings,
            ...settings,
          },
        }));
        
        if (get().proceedingsEngine && get().currentCase) {
          const newEngine = new ProceedingsEngine(
            get().currentCase!,
            get().simulationSettings,
            {
              setAIProcessing: get().setAIProcessing,
              setAIProgress: get().setAIProgress,
            }
          );
          set({ proceedingsEngine: newEngine });
        }
      },

      setLLMConfig: (provider, config) => {
        set((state) => {
          const configs = new Map(state.llmConfigs);
          configs.set(provider, config);
          return { llmConfigs: configs };
        });
      },

      startSimulation: async () => {
        console.log('🚀 Starting simulation...');
        const engine = get().proceedingsEngine;
        const currentCase = get().currentCase;
        
        console.log('Engine exists:', !!engine);
        console.log('Case exists:', !!currentCase);
        console.log('Current phase:', currentCase?.currentPhase);
        
        if (!engine) {
          console.error('❌ No proceedings engine found!');
          return;
        }
        
        if (!currentCase) {
          console.error('❌ No current case found!');
          return;
        }
        
        console.log('✅ Setting simulation running to true');
        set({ isSimulationRunning: true });
        
        const updateLoop = setInterval(() => {
          const currentEngine = get().proceedingsEngine;
          if (currentEngine) {
            const newEvents = currentEngine.getEventQueue();
            if (newEvents.length > 0) {
              console.log(`📝 Processing ${newEvents.length} new events`);
              set((state) => ({ events: [...state.events, ...newEvents] }));
              currentEngine.clearEventQueue();
            }
            
            const speaker = currentEngine.getCurrentSpeaker();
            set({ activeSpeaker: speaker });
            
            if (!currentEngine.isActive()) {
              console.log('🏁 Simulation completed');
              clearInterval(updateLoop);
              set({ isSimulationRunning: false });
            }
          }
        }, 100);
        
        try {
          console.log('🎬 Calling engine.start()...');
          await engine.start();
          console.log('✅ Engine started successfully');
        } catch (error) {
          console.error('❌ Error starting engine:', error);
          clearInterval(updateLoop);
          set({ isSimulationRunning: false });
        }
      },

      stopSimulation: () => {
        const engine = get().proceedingsEngine;
        if (engine) {
          engine.stop();
        }
        set({ isSimulationRunning: false });
      },

      pauseSimulation: () => {
        const engine = get().proceedingsEngine;
        if (engine) {
          engine.stop();
        }
        set({ isSimulationRunning: false });
      },

      nextPhase: () => {
        const engine = get().proceedingsEngine;
        if (engine && !get().isSimulationRunning) {
          engine.processPhase();
        }
      },

      addTranscriptEntry: (entry) => {
        set((state) => {
          if (!state.currentCase) return state;
          
          return {
            currentCase: {
              ...state.currentCase,
              transcript: [...state.currentCase.transcript, entry],
            },
          };
        });
      },

      clearTranscript: () => {
        set((state) => {
          if (!state.currentCase) return state;
          
          return {
            currentCase: {
              ...state.currentCase,
              transcript: [],
            },
          };
        });
      },

      processUserInput: (input) => {
        const userRole = get().userRole;
        if (!userRole || !get().currentCase) return;
        
        const userParticipant = get().currentCase?.participants.find(p => p.role === userRole);
        if (userParticipant) {
          const entry: TranscriptEntry = {
            id: `user-${Date.now()}`,
            timestamp: new Date(),
            speaker: userParticipant.name,
            role: userParticipant.role,
            content: input,
            type: 'statement',
          };
          
          get().addTranscriptEntry(entry);
        }
      },

      triggerObjection: (type) => {
        const userRole = get().userRole;
        if (!userRole || !get().currentCase) return;
        
        const userParticipant = get().currentCase?.participants.find(p => p.role === userRole);
        if (userParticipant && (userRole === 'prosecutor' || userRole === 'defense-attorney' || userRole === 'plaintiff-attorney')) {
          const entry: TranscriptEntry = {
            id: `objection-${Date.now()}`,
            timestamp: new Date(),
            speaker: userParticipant.name,
            role: userParticipant.role,
            content: `Objection! ${type}`,
            type: 'objection',
          };
          
          get().addTranscriptEntry(entry);
        }
      },

      presentEvidence: (evidenceId) => {
        const evidence = get().currentCase?.evidence.find(e => e.id === evidenceId);
        const userRole = get().userRole;
        if (!evidence || !userRole || !get().currentCase) return;
        
        const userParticipant = get().currentCase?.participants.find(p => p.role === userRole);
        if (userParticipant) {
          const entry: TranscriptEntry = {
            id: `exhibit-${Date.now()}`,
            timestamp: new Date(),
            speaker: userParticipant.name,
            role: userParticipant.role,
            content: `Presenting evidence: ${evidence.title}`,
            type: 'exhibit',
            metadata: { evidenceId },
          };
          
          get().addTranscriptEntry(entry);
        }
      },

      saveCase: () => {
        const currentCase = get().currentCase;
        if (currentCase) {
          localStorage.setItem(`case-${currentCase.id}`, JSON.stringify(currentCase));
        }
      },

      loadCase: (caseId) => {
        const savedCase = localStorage.getItem(`case-${caseId}`);
        if (savedCase) {
          const caseData = JSON.parse(savedCase) as Case;
          get().setCurrentCase(caseData);
        }
      },

      setAIProcessing: (isProcessing, operation) => {
        set({ 
          isProcessingAI: isProcessing, 
          currentAIOperation: operation || null 
        });
      },

      setAIProgress: (current, total) => {
        set({ 
          aiProgress: { current, total } 
        });
      },

      // LLM Monitoring methods
      updateAgentStatus: (participantId, status, responseTime, error) => {
        set((state) => {
          const currentCase = state.currentCase;
          if (!currentCase) return state;
          
          const participant = currentCase.participants.find(p => p.id === participantId);
          if (!participant || !participant.aiControlled) return state;
          
          const agents = new Map(state.activeLLMAgents);
          agents.set(participantId, {
            participantId,
            name: participant.name,
            role: participant.role,
            model: participant.llmProvider?.model || 'unknown',
            status,
            lastActivity: new Date(),
            responseTime,
            error
          });
          
          return { activeLLMAgents: agents };
        });
      },

      updateConnectionStatus: (provider, status, responseTime, errorMessage) => {
        set((state) => {
          const connections = new Map(state.llmConnectionStatus);
          const existing = connections.get(provider);
          if (existing) {
            connections.set(provider, {
              ...existing,
              status,
              lastPing: new Date(),
              responseTime: responseTime || 0,
              errorMessage
            });
          }
          return { llmConnectionStatus: connections };
        });
      },

      initializeLLMMonitoring: () => {
        const currentCase = get().currentCase;
        if (!currentCase) return;
        
        const agents = new Map();
        currentCase.participants
          .filter(p => p.aiControlled && p.llmProvider)
          .forEach(p => {
            agents.set(p.id, {
              participantId: p.id,
              name: p.name,
              role: p.role,
              model: p.llmProvider?.model || 'unknown',
              status: 'idle' as const,
              lastActivity: new Date()
            });
          });
        
        set({ activeLLMAgents: agents });
      },

      exportTranscript: () => {
        const currentCase = get().currentCase;
        if (!currentCase) return '';
        
        let transcript = `Case: ${currentCase.title}\\n`;
        transcript += `Type: ${currentCase.type}\\n`;
        transcript += `Legal System: ${currentCase.legalSystem}\\n\\n`;
        transcript += 'TRANSCRIPT\\n';
        transcript += '==========\\n\\n';
        
        for (const entry of currentCase.transcript) {
          const timestamp = new Date(entry.timestamp).toLocaleTimeString();
          transcript += `[${timestamp}] ${entry.speaker} (${entry.role}): ${entry.content}\\n\\n`;
        }
        
        return transcript;
      },

      // Sidebar management methods
      toggleLeftSidebar: () => {
        set((state) => ({
          isLeftSidebarCollapsed: !state.isLeftSidebarCollapsed
        }));
      },

      toggleRightSidebar: () => {
        set((state) => ({
          isRightSidebarCollapsed: !state.isRightSidebarCollapsed
        }));
      },

      setLeftSidebarWidth: (width: number) => {
        set({ leftSidebarWidth: Math.max(80, Math.min(500, width)) }); // Constrain between 80px and 500px
      },

      setRightSidebarWidth: (width: number) => {
        set({ rightSidebarWidth: Math.max(200, Math.min(600, width)) }); // Constrain between 200px and 600px
      },

      setLeftSidebarCollapsed: (collapsed: boolean) => {
        set({ isLeftSidebarCollapsed: collapsed });
      },

      setRightSidebarCollapsed: (collapsed: boolean) => {
        set({ isRightSidebarCollapsed: collapsed });
      },

      // Economic valuation methods
      setEconomicValuation: (valuation: EconomicValuation | null) => {
        set({ economicValuation: valuation });
      },

      toggleValuationPanel: () => {
        set((state) => ({ showValuationPanel: !state.showValuationPanel }));
      },

      setShowValuationPanel: (show: boolean) => {
        set({ showValuationPanel: show });
      },
    }),
    {
      name: 'courtroom-storage',
      partialize: (state) => ({
        simulationSettings: state.simulationSettings,
        llmConfigs: Array.from(state.llmConfigs.entries()),
      }),
    }
  )
);