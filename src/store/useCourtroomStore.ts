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
  
  setCurrentCase: (caseData: Case) => void;
  setUserRole: (role: ParticipantRole | null) => void;
  updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
  addEvidence: (evidence: Evidence) => void;
  removeEvidence: (evidenceId: string) => void;
  updateSimulationSettings: (settings: Partial<SimulationSettings>) => void;
  setLLMConfig: (provider: string, config: LLMConfig) => void;
  
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
  
  saveCase: () => void;
  loadCase: (caseId: string) => void;
  exportTranscript: () => string;
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

      setCurrentCase: (caseData) => {
        set({ currentCase: caseData });
        const engine = new ProceedingsEngine(caseData, get().simulationSettings, {
          setAIProcessing: get().setAIProcessing,
          setAIProgress: get().setAIProgress,
        });
        set({ proceedingsEngine: engine });
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
        const engine = get().proceedingsEngine;
        if (!engine) return;
        
        set({ isSimulationRunning: true });
        
        const updateLoop = setInterval(() => {
          const currentEngine = get().proceedingsEngine;
          if (currentEngine) {
            const newEvents = currentEngine.getEventQueue();
            if (newEvents.length > 0) {
              set((state) => ({ events: [...state.events, ...newEvents] }));
              currentEngine.clearEventQueue();
            }
            
            const speaker = currentEngine.getCurrentSpeaker();
            set({ activeSpeaker: speaker });
            
            if (!currentEngine.isActive()) {
              clearInterval(updateLoop);
              set({ isSimulationRunning: false });
            }
          }
        }, 100);
        
        await engine.start();
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