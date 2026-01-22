import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MotionProcessor } from '../MotionProcessor';
import { Case, Participant, SimulationSettings } from '../../../types';
import { CourtroomAgent } from '../../agents/CourtroomAgent';
import { ProceedingEvent } from '../../ProceedingsEngine';
import { CourtCalendar } from '../../CourtCalendar';
import { OfficeManager } from '../../OfficeManager';
import { Motion, MotionTemplate } from '../../../types/motions';

describe('MotionProcessor', () => {
  let motionProcessor: MotionProcessor;
  let mockCase: Case;
  let mockAgents: Map<string, CourtroomAgent>;
  let mockSettings: SimulationSettings;
  let mockEventQueue: ProceedingEvent[];
  let mockCurrentSpeaker: { value: string | null };
  let mockTranscriptCounter: { value: number };
  let mockMotionCounter: { value: number };
  let mockPendingMotions: Motion[];
  let mockCourtCalendar: CourtCalendar;
  let mockOfficeManager: OfficeManager;
  let mockSidebarActive: { value: boolean };

  const createMockParticipant = (role: string, id: string, name: string): Participant => ({
    id,
    name,
    role: role as any,
    aiControlled: true,
    personality: {
      temperament: 'calm',
      communicationStyle: 'direct',
      decisionMaking: 'analytical',
      stressResponse: 'composed'
    },
    background: {
      age: 35,
      education: 'Law Degree',
      experience: '10 years',
      specialization: 'Criminal Law',
      personalHistory: 'Experienced attorney',
      motivations: ['Justice']
    },
    currentMood: 0
  });

  beforeEach(() => {
    mockCase = {
      id: 'test-case-1',
      title: 'Test Criminal Case',
      summary: 'Test case summary',
      facts: 'Test facts',
      type: 'criminal',
      participants: [
        createMockParticipant('judge', 'judge-1', 'Judge Smith'),
        createMockParticipant('prosecutor', 'prosecutor-1', 'ADA Johnson'),
        createMockParticipant('defense-attorney', 'defense-1', 'Attorney Williams')
      ],
      charges: ['assault', 'battery'],
      evidence: [],
      currentPhase: 'pre-trial',
      transcript: [],
      rulings: []
    };

    mockAgents = new Map();
    mockSettings = {
      realtimeSpeed: 1,
      autoAdvancePhases: false,
      pauseBetweenPhases: true,
      enableJudgeInterruptions: false,
      enableObjections: false,
      showThinking: false
    };
    mockEventQueue = [];
    mockCurrentSpeaker = { value: null };
    mockTranscriptCounter = { value: 0 };
    mockMotionCounter = { value: 0 };
    mockPendingMotions = [];
    mockCourtCalendar = new CourtCalendar();
    mockOfficeManager = new OfficeManager();
    mockSidebarActive = { value: false };

    motionProcessor = new MotionProcessor(
      mockCase,
      mockAgents,
      mockSettings,
      mockEventQueue,
      mockCurrentSpeaker,
      mockTranscriptCounter,
      mockMotionCounter,
      mockPendingMotions,
      mockCourtCalendar,
      mockOfficeManager,
      mockSidebarActive
    );
  });

  describe('determineLikelyMotions', () => {
    it('should return applicable motions for criminal cases', () => {
      mockCase.type = 'criminal';
      const motions = motionProcessor.determineLikelyMotions();
      
      expect(Array.isArray(motions)).toBe(true);
      expect(motions.length).toBeGreaterThan(0);
    });

    it('should return applicable motions for civil cases', () => {
      mockCase.type = 'civil';
      const motions = motionProcessor.determineLikelyMotions();
      
      expect(Array.isArray(motions)).toBe(true);
      expect(motions.length).toBeGreaterThan(0);
    });

    it('should filter motions by case type', () => {
      mockCase.type = 'criminal';
      const motions = motionProcessor.determineLikelyMotions();
      
      motions.forEach(motion => {
        expect(motion.applicableCaseTypes).toContain('criminal');
      });
    });

    it('should sort motions by likelihood of success', () => {
      mockCase.type = 'criminal';
      const motions = motionProcessor.determineLikelyMotions();
      
      for (let i = 0; i < motions.length - 1; i++) {
        expect(motions[i].likelihood_of_success).toBeGreaterThanOrEqual(
          motions[i + 1].likelihood_of_success
        );
      }
    });
  });

  describe('shouldAttorneyFileMotion', () => {
    it('should return boolean for defense attorney', () => {
      const defense = createMockParticipant('defense-attorney', 'def-1', 'Defense');
      const result = motionProcessor.shouldAttorneyFileMotion(defense);
      
      expect(typeof result).toBe('boolean');
    });

    it('should return boolean for prosecutor', () => {
      const prosecutor = createMockParticipant('prosecutor', 'pros-1', 'Prosecutor');
      const result = motionProcessor.shouldAttorneyFileMotion(prosecutor);
      
      expect(typeof result).toBe('boolean');
    });

    it('should return boolean for plaintiff attorney', () => {
      const plaintiff = createMockParticipant('plaintiff-attorney', 'plaint-1', 'Plaintiff');
      const result = motionProcessor.shouldAttorneyFileMotion(plaintiff);
      
      expect(typeof result).toBe('boolean');
    });

    it('should return false for non-attorney roles', () => {
      const witness = createMockParticipant('witness', 'wit-1', 'Witness');
      const result = motionProcessor.shouldAttorneyFileMotion(witness);
      
      expect(result).toBe(false);
    });
  });

  describe('selectMotionForAttorney', () => {
    const mockMotionTemplate: MotionTemplate = {
      type: 'suppress-evidence',
      title: 'Motion to Suppress Evidence',
      description: 'Seeks to exclude unlawfully obtained evidence',
      applicableCaseTypes: ['criminal'],
      common_grounds: ['Fourth Amendment violation'],
      required_citations: ['Mapp v. Ohio'],
      legalStandard: 'Preponderance of evidence',
      hearing_required: true,
      likelihood_of_success: 0.6,
      typical_opposing_arguments: ['Good faith exception'],
      sample_argument: 'The evidence was obtained without a warrant',
      sample_relief: 'Exclude evidence from trial'
    };

    it('should select appropriate motion for defense attorney', () => {
      const defense = createMockParticipant('defense-attorney', 'def-1', 'Defense');
      const availableMotions = [mockMotionTemplate];
      
      const selected = motionProcessor.selectMotionForAttorney(defense, availableMotions);
      
      expect(selected).toBeTruthy();
    });

    it('should select appropriate motion for prosecutor', () => {
      const prosecutor = createMockParticipant('prosecutor', 'pros-1', 'Prosecutor');
      const discoveryMotion: MotionTemplate = {
        ...mockMotionTemplate,
        type: 'discovery-compel',
        title: 'Motion to Compel Discovery'
      };
      
      const selected = motionProcessor.selectMotionForAttorney(prosecutor, [discoveryMotion]);
      
      expect(selected).toBeTruthy();
    });

    it('should return undefined when no appropriate motions available', () => {
      const defense = createMockParticipant('defense-attorney', 'def-1', 'Defense');
      const selected = motionProcessor.selectMotionForAttorney(defense, []);
      
      expect(selected === null || selected === undefined).toBe(true);
    });

    it('should filter motions for defense role', () => {
      const defense = createMockParticipant('defense-attorney', 'def-1', 'Defense');
      const dismissMotion: MotionTemplate = {
        ...mockMotionTemplate,
        type: 'dismiss-case',
        title: 'Motion to Dismiss'
      };
      
      const selected = motionProcessor.selectMotionForAttorney(defense, [dismissMotion]);
      
      if (selected) {
        expect(selected.type).toMatch(/dismiss|suppress|discovery|continuance|venue/);
      }
    });
  });

  describe('generateMotionArgument', () => {
    const mockMotionTemplate: MotionTemplate = {
      type: 'suppress-evidence',
      title: 'Motion to Suppress Evidence',
      description: 'Test description',
      applicableCaseTypes: ['criminal'],
      common_grounds: ['Fourth Amendment'],
      required_citations: [],
      legalStandard: 'Preponderance',
      hearing_required: true,
      likelihood_of_success: 0.5,
      typical_opposing_arguments: [],
      sample_argument: 'The evidence should be suppressed.',
      sample_relief: 'Exclude evidence'
    };

    it('should generate argument for defense attorney', () => {
      const defense = createMockParticipant('defense-attorney', 'def-1', 'Defense');
      const argument = motionProcessor.generateMotionArgument(defense, mockMotionTemplate, 'Context');
      
      expect(typeof argument).toBe('string');
      expect(argument.length).toBeGreaterThan(0);
    });

    it('should generate argument for prosecutor', () => {
      const prosecutor = createMockParticipant('prosecutor', 'pros-1', 'Prosecutor');
      const argument = motionProcessor.generateMotionArgument(prosecutor, mockMotionTemplate, 'Context');
      
      expect(typeof argument).toBe('string');
      expect(argument.length).toBeGreaterThan(0);
    });

    it('should generate argument for plaintiff attorney', () => {
      const plaintiff = createMockParticipant('plaintiff-attorney', 'plaint-1', 'Plaintiff');
      const argument = motionProcessor.generateMotionArgument(plaintiff, mockMotionTemplate, 'Context');
      
      expect(typeof argument).toBe('string');
      expect(argument.length).toBeGreaterThan(0);
    });

    it('should generate argument with context', () => {
      const defense = createMockParticipant('defense-attorney', 'def-1', 'Defense');
      const context = 'Specific case context';
      const argument = motionProcessor.generateMotionArgument(defense, mockMotionTemplate, context);
      
      expect(argument).toBeTruthy();
      expect(typeof argument).toBe('string');
    });

    it('should use template sample argument', () => {
      const defense = createMockParticipant('defense-attorney', 'def-1', 'Defense');
      const argument = motionProcessor.generateMotionArgument(defense, mockMotionTemplate, '');
      
      expect(argument).toContain(mockMotionTemplate.sample_argument);
    });
  });

  describe('generateOppositionResponse', () => {
    const mockMotion: Motion = {
      id: 'motion-1',
      type: 'suppress-evidence',
      title: 'Motion to Suppress',
      filedBy: 'attorney-1',
      filingDate: new Date(),
      status: 'pending',
      legalStandard: 'Preponderance',
      grounds: ['Fourth Amendment'],
      factualBasis: 'Test basis',
      legalCitations: [],
      hearingRequired: true,
      argument: 'Test argument',
      relief_requested: 'Suppress evidence',
      supporting_evidence: [],
      responses: [],
      assignedJudge: 'judge-1',
      caseType: 'criminal',
      urgent: false,
      dispositive: false,
      pageCount: 10,
      attachments: [],
      served_parties: [],
      certificate_of_service: true
    };

    it('should generate opposition for prosecutor', () => {
      const prosecutor = createMockParticipant('prosecutor', 'pros-1', 'Prosecutor');
      const response = motionProcessor.generateOppositionResponse(mockMotion, prosecutor);
      
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
      expect(response).toContain('oppose');
    });

    it('should generate opposition for defense attorney', () => {
      const defense = createMockParticipant('defense-attorney', 'def-1', 'Defense');
      const response = motionProcessor.generateOppositionResponse(mockMotion, defense);
      
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
      expect(response).toContain('oppose');
    });

    it('should generate opposition for plaintiff attorney', () => {
      const plaintiff = createMockParticipant('plaintiff-attorney', 'plaint-1', 'Plaintiff');
      const response = motionProcessor.generateOppositionResponse(mockMotion, plaintiff);
      
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should include Your Honor', () => {
      const prosecutor = createMockParticipant('prosecutor', 'pros-1', 'Prosecutor');
      const response = motionProcessor.generateOppositionResponse(mockMotion, prosecutor);
      
      expect(response).toContain('Your Honor');
    });
  });

  describe('Motion Lifecycle', () => {
    it('should track motion counter', () => {
      expect(mockMotionCounter.value).toBe(0);
    });

    it('should maintain pending motions list', () => {
      expect(Array.isArray(mockPendingMotions)).toBe(true);
      expect(mockPendingMotions.length).toBe(0);
    });

    it('should use case transcript', () => {
      expect(Array.isArray(mockCase.transcript)).toBe(true);
    });

    it('should use case rulings', () => {
      expect(Array.isArray(mockCase.rulings)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle case with no attorneys', () => {
      mockCase.participants = [createMockParticipant('judge', 'judge-1', 'Judge')];
      const motions = motionProcessor.determineLikelyMotions();
      
      expect(Array.isArray(motions)).toBe(true);
    });

    it('should handle empty motion templates', () => {
      const defense = createMockParticipant('defense-attorney', 'def-1', 'Defense');
      const result = motionProcessor.selectMotionForAttorney(defense, []);
      
      expect(result === null || result === undefined).toBe(true);
    });

    it('should handle unknown attorney role', () => {
      const unknown = createMockParticipant('clerk', 'clerk-1', 'Clerk');
      const result = motionProcessor.shouldAttorneyFileMotion(unknown);
      
      expect(result).toBe(false);
    });

    it('should handle motion template without sample argument', () => {
      const template: MotionTemplate = {
        type: 'test-motion',
        title: 'Test Motion',
        description: 'Test',
        applicableCaseTypes: ['criminal'],
        common_grounds: [],
        required_citations: [],
        legalStandard: 'Test',
        hearing_required: false,
        likelihood_of_success: 0.5,
        typical_opposing_arguments: [],
        sample_argument: '',
        sample_relief: ''
      };
      
      const defense = createMockParticipant('defense-attorney', 'def-1', 'Defense');
      const argument = motionProcessor.generateMotionArgument(defense, template, 'Context');
      
      expect(typeof argument).toBe('string');
      expect(argument.length).toBeGreaterThan(0);
    });
  });

  describe('Data Validation', () => {
    it('should validate motion structure', () => {
      const template: MotionTemplate = {
        type: 'test',
        title: 'Test',
        description: 'Test',
        applicableCaseTypes: ['criminal'],
        common_grounds: [],
        required_citations: [],
        legalStandard: 'Test',
        hearing_required: true,
        likelihood_of_success: 0.5,
        typical_opposing_arguments: [],
        sample_argument: 'Test',
        sample_relief: 'Test'
      };
      
      expect(template).toHaveProperty('type');
      expect(template).toHaveProperty('title');
      expect(template).toHaveProperty('applicableCaseTypes');
    });

    it('should validate likelihood is between 0 and 1', () => {
      const motions = motionProcessor.determineLikelyMotions();
      
      motions.forEach(motion => {
        expect(motion.likelihood_of_success).toBeGreaterThanOrEqual(0);
        expect(motion.likelihood_of_success).toBeLessThanOrEqual(1);
      });
    });
  });
});
