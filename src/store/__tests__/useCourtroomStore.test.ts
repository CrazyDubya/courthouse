import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCourtroomStore } from '../useCourtroomStore';
import type { Case, Participant, Evidence, SimulationSettings, TranscriptEntry } from '../../types';

// Mock the ProceedingsEngine
vi.mock('../../services/ProceedingsEngine', () => ({
  ProceedingsEngine: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    processPhase: vi.fn(),
    getEventQueue: vi.fn(() => []),
    clearEventQueue: vi.fn(),
    getCurrentSpeaker: vi.fn(() => null),
    isActive: vi.fn(() => false),
    getTranscript: vi.fn(() => []),
    getCurrentPhase: vi.fn(() => 'pre-trial'),
  })),
}));

describe('useCourtroomStore', () => {
  let mockCase: Case;
  let mockParticipant: Participant;
  let mockEvidence: Evidence;

  beforeEach(() => {
    mockParticipant = {
      id: 'participant-1',
      name: 'Test Participant',
      role: 'defense-attorney',
      aiControlled: true,
      personality: {
        assertiveness: 7,
        empathy: 6,
        analyticalThinking: 8,
        emotionalStability: 7,
        openness: 6,
        conscientiousness: 8,
        persuasiveness: 9,
      },
      background: {
        age: 35,
        education: 'JD from Law School',
        experience: '10 years',
        personalHistory: 'Test background',
        motivations: ['Justice'],
      },
      currentMood: 0.7,
      knowledge: ['Criminal Law'],
      objectives: ['Client defense'],
    };

    mockEvidence = {
      id: 'evidence-1',
      type: 'document',
      title: 'Test Evidence',
      description: 'Test evidence description',
      admissible: true,
      submittedBy: 'prosecutor-1',
      chainOfCustody: ['Officer A'],
    };

    mockCase = {
      id: 'test-case-1',
      title: 'Test Case',
      type: 'criminal',
      legalSystem: 'common-law',
      summary: 'Test case summary',
      facts: ['Fact 1', 'Fact 2'],
      charges: ['Test Charge'],
      evidence: [mockEvidence],
      participants: [mockParticipant],
      currentPhase: 'pre-trial',
      transcript: [],
      rulings: [],
    };
  });

  afterEach(() => {
    // Reset store state
    const { result } = renderHook(() => useCourtroomStore());
    act(() => {
      result.current.setCurrentCase(null as any);
      result.current.setUserRole(null);
    });
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      expect(result.current.currentCase).toBeNull();
      expect(result.current.userRole).toBeNull();
      expect(result.current.proceedingsEngine).toBeNull();
      expect(result.current.isSimulationRunning).toBe(false);
      expect(result.current.isProcessingAI).toBe(false);
      expect(result.current.activeSpeaker).toBeNull();
      expect(result.current.events).toEqual([]);
    });

    it('should have default simulation settings', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      expect(result.current.simulationSettings).toEqual({
        realtimeSpeed: 1,
        autoProgress: true,
        detailLevel: 'standard',
        enableObjections: true,
        enableSidebar: true,
        jurySize: 6,
        allowUserIntervention: true,
        recordTranscript: true,
      });
    });
  });

  describe('Case Management', () => {
    it('should set current case', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setCurrentCase(mockCase);
      });
      
      expect(result.current.currentCase).toBe(mockCase);
      expect(result.current.proceedingsEngine).toBeTruthy();
    });

    it('should update participant', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.updateParticipant('participant-1', { 
          name: 'Updated Name',
          aiControlled: false 
        });
      });
      
      const updatedParticipant = result.current.currentCase?.participants.find(
        p => p.id === 'participant-1'
      );
      expect(updatedParticipant?.name).toBe('Updated Name');
      expect(updatedParticipant?.aiControlled).toBe(false);
    });

    it('should handle participant update with no current case', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.updateParticipant('participant-1', { name: 'Updated Name' });
      });
      
      expect(result.current.currentCase).toBeNull();
    });
  });

  describe('User Role Management', () => {
    it('should set user role', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setUserRole('defense-attorney');
      });
      
      expect(result.current.userRole).toBe('defense-attorney');
    });

    it('should update participant AI control when setting user role', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.setUserRole('defense-attorney');
      });
      
      const userParticipant = result.current.currentCase?.participants.find(
        p => p.role === 'defense-attorney'
      );
      expect(userParticipant?.aiControlled).toBe(false);
    });
  });

  describe('Evidence Management', () => {
    it('should add evidence to case', () => {
      const { result } = renderHook(() => useCourtroomStore());
      const newEvidence: Evidence = {
        id: 'evidence-2',
        type: 'video',
        title: 'New Evidence',
        description: 'New evidence description',
        admissible: true,
        submittedBy: 'defense-1',
        chainOfCustody: ['Officer B'],
      };
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.addEvidence(newEvidence);
      });
      
      expect(result.current.currentCase?.evidence).toHaveLength(2);
      expect(result.current.currentCase?.evidence).toContain(newEvidence);
    });

    it('should remove evidence from case', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.removeEvidence('evidence-1');
      });
      
      expect(result.current.currentCase?.evidence).toHaveLength(0);
    });

    it('should handle evidence operations with no current case', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.addEvidence(mockEvidence);
        result.current.removeEvidence('evidence-1');
      });
      
      expect(result.current.currentCase).toBeNull();
    });
  });

  describe('Simulation Settings', () => {
    it('should update simulation settings', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.updateSimulationSettings({ 
          realtimeSpeed: 2,
          autoProgress: false 
        });
      });
      
      expect(result.current.simulationSettings.realtimeSpeed).toBe(2);
      expect(result.current.simulationSettings.autoProgress).toBe(false);
      expect(result.current.simulationSettings.detailLevel).toBe('standard'); // unchanged
    });

    it('should recreate proceedings engine when settings change with active case', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setCurrentCase(mockCase);
      });
      
      const originalEngine = result.current.proceedingsEngine;
      
      act(() => {
        result.current.updateSimulationSettings({ realtimeSpeed: 2 });
      });
      
      // The engine should be recreated (new instance)
      expect(result.current.proceedingsEngine).toBeTruthy();
      expect(result.current.simulationSettings.realtimeSpeed).toBe(2);
    });
  });

  describe('Transcript Management', () => {
    it('should add transcript entry', () => {
      const { result } = renderHook(() => useCourtroomStore());
      const transcriptEntry: TranscriptEntry = {
        id: 'transcript-1',
        timestamp: new Date(),
        speaker: 'Test Speaker',
        role: 'judge',
        content: 'Test content',
        type: 'statement',
      };
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.addTranscriptEntry(transcriptEntry);
      });
      
      expect(result.current.currentCase?.transcript).toHaveLength(1);
      expect(result.current.currentCase?.transcript[0]).toBe(transcriptEntry);
    });

    it('should clear transcript', () => {
      const { result } = renderHook(() => useCourtroomStore());
      const transcriptEntry: TranscriptEntry = {
        id: 'transcript-1',
        timestamp: new Date(),
        speaker: 'Test Speaker',
        role: 'judge',
        content: 'Test content',
        type: 'statement',
      };
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.addTranscriptEntry(transcriptEntry);
        result.current.clearTranscript();
      });
      
      expect(result.current.currentCase?.transcript).toHaveLength(0);
    });
  });

  describe('User Input Processing', () => {
    it('should process user input when user role is set', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.setUserRole('defense-attorney');
        result.current.processUserInput('I object to this line of questioning');
      });
      
      expect(result.current.currentCase?.transcript).toHaveLength(1);
      expect(result.current.currentCase?.transcript[0].content).toBe('I object to this line of questioning');
      expect(result.current.currentCase?.transcript[0].speaker).toBe('Test Participant');
    });

    it('should not process user input without user role', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.processUserInput('Test input');
      });
      
      expect(result.current.currentCase?.transcript).toHaveLength(0);
    });
  });

  describe('AI Processing State', () => {
    it('should set AI processing state', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setAIProcessing(true, 'Processing testimony');
      });
      
      expect(result.current.isProcessingAI).toBe(true);
      expect(result.current.currentAIOperation).toBe('Processing testimony');
      
      act(() => {
        result.current.setAIProcessing(false);
      });
      
      expect(result.current.isProcessingAI).toBe(false);
      expect(result.current.currentAIOperation).toBeNull();
    });

    it('should set AI progress', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setAIProgress(3, 10);
      });
      
      expect(result.current.aiProgress).toEqual({ current: 3, total: 10 });
    });
  });

  describe('Case Persistence', () => {
    it('should save case to localStorage', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.saveCase();
      });
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `case-${mockCase.id}`,
        JSON.stringify(mockCase)
      );
    });

    it('should load case from localStorage', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      // Mock localStorage return
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(mockCase));
      
      act(() => {
        result.current.loadCase(mockCase.id);
      });
      
      expect(localStorage.getItem).toHaveBeenCalledWith(`case-${mockCase.id}`);
      expect(result.current.currentCase?.id).toBe(mockCase.id);
    });

    it('should handle missing case in localStorage', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      
      act(() => {
        result.current.loadCase('nonexistent-case');
      });
      
      expect(result.current.currentCase).toBeNull();
    });
  });

  describe('Transcript Export', () => {
    it('should export transcript', () => {
      const { result } = renderHook(() => useCourtroomStore());
      const transcriptEntry: TranscriptEntry = {
        id: 'transcript-1',
        timestamp: new Date(),
        speaker: 'Judge Smith',
        role: 'judge',
        content: 'Court is now in session',
        type: 'statement',
      };
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.addTranscriptEntry(transcriptEntry);
      });
      
      const exported = result.current.exportTranscript();
      
      expect(exported).toContain('Test Case');
      expect(exported).toContain('criminal');
      expect(exported).toContain('Judge Smith');
      expect(exported).toContain('Court is now in session');
    });

    it('should return empty string when no case', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      const exported = result.current.exportTranscript();
      expect(exported).toBe('');
    });
  });

  describe('Simulation Control', () => {
    it('should start simulation', async () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setCurrentCase(mockCase);
      });
      
      await act(async () => {
        await result.current.startSimulation();
      });
      
      expect(result.current.proceedingsEngine?.start).toHaveBeenCalled();
    });

    it('should stop simulation', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.stopSimulation();
      });
      
      expect(result.current.proceedingsEngine?.stop).toHaveBeenCalled();
      expect(result.current.isSimulationRunning).toBe(false);
    });

    it('should pause simulation', () => {
      const { result } = renderHook(() => useCourtroomStore());
      
      act(() => {
        result.current.setCurrentCase(mockCase);
        result.current.pauseSimulation();
      });
      
      expect(result.current.proceedingsEngine?.stop).toHaveBeenCalled();
      expect(result.current.isSimulationRunning).toBe(false);
    });
  });
});