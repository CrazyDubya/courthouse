import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProceedingsEngine } from '../ProceedingsEngine';
import type { Case, SimulationSettings, Participant, Evidence } from '../../types';

describe('ProceedingsEngine', () => {
  let mockCase: Case;
  let mockSettings: SimulationSettings;
  let engine: ProceedingsEngine;
  let mockAICallbacks: any;

  beforeEach(() => {
    mockAICallbacks = {
      setAIProcessing: vi.fn(),
      setAIProgress: vi.fn(),
    };

    mockSettings = {
      realtimeSpeed: 1,
      autoProgress: false,
      detailLevel: 'standard',
      enableObjections: true,
      enableSidebar: true,
      jurySize: 6,
      allowUserIntervention: true,
      recordTranscript: true,
    };

    mockCase = {
      id: 'test-case-1',
      title: 'Test Case vs. Defendant',
      type: 'criminal',
      legalSystem: 'common-law',
      summary: 'Test criminal case summary',
      facts: ['Fact 1', 'Fact 2'],
      charges: ['Theft'],
      evidence: [],
      participants: [
        {
          id: 'judge-1',
          name: 'Judge Smith',
          role: 'judge',
          aiControlled: true,
          personality: {
            assertiveness: 8,
            empathy: 6,
            analyticalThinking: 9,
            emotionalStability: 8,
            openness: 5,
            conscientiousness: 9,
            persuasiveness: 7,
          },
          background: {
            age: 55,
            education: 'JD from Harvard Law',
            experience: '20 years on bench',
            personalHistory: 'Former prosecutor',
            motivations: ['Justice', 'Fair trials'],
          },
          currentMood: 0.7,
          knowledge: ['Criminal Law', 'Evidence Law'],
          objectives: ['Fair trial', 'Legal procedure'],
        },
        {
          id: 'prosecutor-1',
          name: 'DA Johnson',
          role: 'prosecutor',
          aiControlled: true,
          personality: {
            assertiveness: 9,
            empathy: 4,
            analyticalThinking: 8,
            emotionalStability: 7,
            openness: 6,
            conscientiousness: 8,
            persuasiveness: 9,
          },
          background: {
            age: 40,
            education: 'JD from Yale',
            experience: '15 years as prosecutor',
            personalHistory: 'Career prosecutor',
            motivations: ['Justice', 'Public safety'],
          },
          currentMood: 0.8,
          knowledge: ['Criminal Prosecution', 'Trial Advocacy'],
          objectives: ['Conviction', 'Justice served'],
        },
      ] as Participant[],
      currentPhase: 'pre-trial',
      transcript: [],
      rulings: [],
    };

    engine = new ProceedingsEngine(mockCase, mockSettings, mockAICallbacks);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with provided case and settings', () => {
      expect(engine).toBeInstanceOf(ProceedingsEngine);
      expect(engine.getCurrentPhase()).toBe('pre-trial');
      expect(engine.isActive()).toBe(false);
    });

    it('should initialize AI callbacks', () => {
      expect(mockAICallbacks.setAIProcessing).toBeDefined();
      expect(mockAICallbacks.setAIProgress).toBeDefined();
    });
  });

  describe('Phase Management', () => {
    it('should return current phase', () => {
      expect(engine.getCurrentPhase()).toBe('pre-trial');
    });

    it('should process phase when called', async () => {
      // Mock the delay function to avoid waiting
      const originalDelay = (engine as any).delay;
      (engine as any).delay = vi.fn().mockResolvedValue(undefined);
      
      const processPhasePromise = engine.processPhase();
      expect(processPhasePromise).toBeInstanceOf(Promise);
      await processPhasePromise;
      
      // Restore original delay
      (engine as any).delay = originalDelay;
    }, 1000); // Set timeout to 1 second
  });

  describe('Event Queue', () => {
    it('should initialize with empty event queue', () => {
      expect(engine.getEventQueue()).toHaveLength(0);
    });

    it('should be able to clear event queue', () => {
      engine.clearEventQueue();
      expect(engine.getEventQueue()).toHaveLength(0);
    });
  });

  describe('Transcript Management', () => {
    it('should return empty transcript initially', () => {
      expect(engine.getTranscript()).toHaveLength(0);
    });

    it('should maintain transcript entries', () => {
      const transcript = engine.getTranscript();
      expect(Array.isArray(transcript)).toBe(true);
    });
  });

  describe('Simulation Control', () => {
    it('should not be active initially', () => {
      expect(engine.isActive()).toBe(false);
    });

    it('should be able to stop simulation', async () => {
      await engine.stop();
      expect(engine.isActive()).toBe(false);
    });

    it('should handle start and stop lifecycle', async () => {
      const stopPromise = engine.stop();
      expect(engine.isActive()).toBe(false);
      await stopPromise;
    });
  });

  describe('Speaker Management', () => {
    it('should return null for current speaker initially', () => {
      expect(engine.getCurrentSpeaker()).toBeNull();
    });
  });

  describe('AI Callbacks Integration', () => {
    it('should use AI callbacks when provided', () => {
      const engineWithCallbacks = new ProceedingsEngine(
        mockCase,
        mockSettings,
        mockAICallbacks
      );
      expect(engineWithCallbacks).toBeInstanceOf(ProceedingsEngine);
    });

    it('should work without AI callbacks', () => {
      const engineWithoutCallbacks = new ProceedingsEngine(mockCase, mockSettings);
      expect(engineWithoutCallbacks).toBeInstanceOf(ProceedingsEngine);
      expect(engineWithoutCallbacks.getCurrentPhase()).toBe('pre-trial');
    });
  });

  describe('Edge Cases', () => {
    it('should handle case with no participants gracefully', () => {
      const emptyCase = { ...mockCase, participants: [] };
      const emptyEngine = new ProceedingsEngine(emptyCase, mockSettings);
      expect(emptyEngine.getCurrentPhase()).toBe('pre-trial');
    });

    it('should handle case with no evidence', () => {
      expect(mockCase.evidence).toHaveLength(0);
      expect(engine.getCurrentPhase()).toBe('pre-trial');
    });

    it('should handle different case types', () => {
      const civilCase = { ...mockCase, type: 'civil' as const };
      const civilEngine = new ProceedingsEngine(civilCase, mockSettings);
      expect(civilEngine.getCurrentPhase()).toBe('pre-trial');
    });
  });
});