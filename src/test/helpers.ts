import type { Participant, Case, Evidence, SimulationSettings } from '../types';

/**
 * Test helpers for creating mock data in tests
 */

export const createMockParticipant = (overrides: Partial<Participant> = {}): Participant => ({
  id: 'test-participant-1',
  name: 'Test Participant',
  role: 'judge',
  aiControlled: true,
  personality: {
    assertiveness: 7,
    empathy: 6,
    analyticalThinking: 8,
    emotionalStability: 7,
    openness: 6,
    conscientiousness: 8,
    persuasiveness: 7,
  },
  background: {
    age: 45,
    education: 'JD from Test University',
    experience: '15 years in legal field',
    personalHistory: 'Test background',
    motivations: ['Justice', 'Fairness'],
  },
  currentMood: 0.7,
  knowledge: ['Criminal Law', 'Evidence Law'],
  objectives: ['Fair proceedings', 'Legal accuracy'],
  ...overrides,
});

export const createMockEvidence = (overrides: Partial<Evidence> = {}): Evidence => ({
  id: 'test-evidence-1',
  type: 'document',
  title: 'Test Evidence',
  description: 'Test evidence description',
  admissible: true,
  submittedBy: 'test-participant-1',
  chainOfCustody: ['Officer A', 'Evidence Clerk'],
  ...overrides,
});

export const createMockCase = (overrides: Partial<Case> = {}): Case => ({
  id: 'test-case-1',
  title: 'Test Case',
  type: 'criminal',
  legalSystem: 'common-law',
  summary: 'Test case summary',
  facts: ['Test fact 1', 'Test fact 2'],
  charges: ['Test charge'],
  evidence: [],
  participants: [],
  currentPhase: 'pre-trial',
  transcript: [],
  rulings: [],
  ...overrides,
});

export const createMockSettings = (overrides: Partial<SimulationSettings> = {}): SimulationSettings => ({
  realtimeSpeed: 1,
  autoProgress: false,
  detailLevel: 'standard',
  enableObjections: true,
  enableSidebar: true,
  jurySize: 6,
  allowUserIntervention: true,
  recordTranscript: true,
  ...overrides,
});

/**
 * Creates a complete mock case with participants and evidence
 */
export const createCompleteCase = (): Case => {
  const judge = createMockParticipant({
    id: 'judge-1',
    name: 'Judge Smith',
    role: 'judge',
  });

  const prosecutor = createMockParticipant({
    id: 'prosecutor-1',
    name: 'DA Johnson',
    role: 'prosecutor',
  });

  const defense = createMockParticipant({
    id: 'defense-1',
    name: 'Defense Attorney',
    role: 'defense-attorney',
  });

  const defendant = createMockParticipant({
    id: 'defendant-1',
    name: 'John Doe',
    role: 'defendant',
    aiControlled: false,
  });

  const evidence = createMockEvidence({
    id: 'evidence-1',
    title: 'Police Report',
    description: 'Initial incident report',
    submittedBy: prosecutor.id,
  });

  return createMockCase({
    title: 'State vs. John Doe',
    participants: [judge, prosecutor, defense, defendant],
    evidence: [evidence],
  });
};

/**
 * Delays execution for testing async operations
 */
export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Creates a mock AI callbacks object for testing ProceedingsEngine
 */
export const createMockAICallbacks = () => ({
  setAIProcessing: vi.fn(),
  setAIProgress: vi.fn(),
});

/**
 * Helper to wait for next tick in tests
 */
export const nextTick = (): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, 0));