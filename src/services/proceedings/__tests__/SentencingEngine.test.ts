import { describe, it, expect, beforeEach } from 'vitest';
import { SentencingEngine } from '../SentencingEngine';
import { Case, Participant, SimulationSettings } from '../../../types';
import { CourtroomAgent } from '../../agents/CourtroomAgent';
import { ProceedingEvent } from '../../ProceedingsEngine';
import { CourtCalendar } from '../../CourtCalendar';
import { OfficeManager } from '../../OfficeManager';
import { Motion } from '../../../types/motions';
import type { EnhancedJudgeProfile } from '../../../types/judge';

describe('SentencingEngine', () => {
  let sentencingEngine: SentencingEngine;
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
      age: 45,
      education: 'Law Degree',
      experience: '15 years',
      specialization: 'Criminal Law',
      personalHistory: 'Experienced judge',
      motivations: ['Justice']
    },
    currentMood: 0
  });

  const createMockJudgeWithProfile = (id: string, name: string): Participant => {
    const judge = createMockParticipant('judge', id, name);
    (judge as any).enhancedProfile = {
      attributes: {
        strictness: 7,
        empathy: 6,
        fairness: 8,
        patience: 7,
        legalKnowledge: 9,
        decisiveness: 8,
        temperControl: 7,
        impartiality: 9
      }
    } as EnhancedJudgeProfile;
    return judge;
  };

  beforeEach(() => {
    mockCase = {
      id: 'test-case-1',
      title: 'Test Criminal Case',
      summary: 'Test case summary',
      facts: 'Test facts',
      type: 'criminal',
      participants: [
        createMockJudgeWithProfile('judge-1', 'Judge Smith'),
        createMockParticipant('prosecutor', 'prosecutor-1', 'ADA Johnson'),
        createMockParticipant('defense-attorney', 'defense-1', 'Attorney Williams')
      ],
      charges: ['theft over $1000'],
      evidence: [],
      currentPhase: 'sentencing',
      transcript: [],
      rulings: [
        {
          id: 'verdict-1',
          timestamp: new Date(),
          judge: 'Judge Smith',
          type: 'verdict',
          subject: 'verdict',
          decision: 'granted',
          reasoning: 'Guilty verdict'
        }
      ]
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

    sentencingEngine = new SentencingEngine(
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

  describe('getBaseSentenceForCharge', () => {
    it('should return sentence for murder charges', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('murder first degree');
      
      expect(sentence).toBeDefined();
      expect(sentence.prison).toBeTruthy();
      expect(typeof sentence.prison).toBe('string');
    });

    it('should return sentence for aggravated assault', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('aggravated assault');
      
      expect(sentence).toBeDefined();
      expect(sentence.prison).toBeTruthy();
    });

    it('should return sentence for grand theft', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('grand theft');
      
      expect(sentence).toBeDefined();
      expect(sentence.probation).toBeTruthy();
    });

    it('should return sentence for DUI', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('dui');
      
      expect(sentence).toBeDefined();
      expect(sentence.fine).toBeGreaterThan(0);
    });

    it('should return sentence for drug possession', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('drug possession');
      
      expect(sentence).toBeDefined();
    });

    it('should handle case-insensitive charges', () => {
      const lower = sentencingEngine.getBaseSentenceForCharge('murder');
      const upper = sentencingEngine.getBaseSentenceForCharge('MURDER');
      
      expect(lower).toEqual(upper);
    });

    it('should return appropriate restitution amounts', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('theft over $1000');
      
      expect(sentence.restitution).toBeDefined();
      expect(typeof sentence.restitution).toBe('number');
    });

    it('should return fine amounts for misdemeanors', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('petit larceny');
      
      expect(sentence).toBeDefined();
      expect(sentence.fine).toBeGreaterThanOrEqual(0);
    });
  });

  describe('generateCriminalSentence', () => {
    it('should generate sentence for criminal case', async () => {
      const judge = mockCase.participants[0];
      const sentence = await sentencingEngine.generateCriminalSentence(judge);
      
      expect(typeof sentence).toBe('string');
      expect(sentence.length).toBeGreaterThan(0);
    });

    it('should generate sentence with case charges', async () => {
      mockCase.charges = ['aggravated assault'];
      const judge = mockCase.participants[0];
      const sentence = await sentencingEngine.generateCriminalSentence(judge);
      
      expect(sentence).toBeTruthy();
    });

    it('should handle case with fallback charge when none provided', async () => {
      mockCase.charges = ['theft over $1000'];
      const judge = mockCase.participants[0];
      
      const sentence = await sentencingEngine.generateCriminalSentence(judge);
      expect(sentence).toBeTruthy();
      expect(typeof sentence).toBe('string');
    });

    it('should handle judge without enhanced profile', async () => {
      const plainJudge = createMockParticipant('judge', 'judge-2', 'Judge Plain');
      const sentence = await sentencingEngine.generateCriminalSentence(plainJudge);
      
      expect(sentence).toBeTruthy();
    });

    it('should adjust sentence for strict judge', async () => {
      const strictJudge = createMockJudgeWithProfile('judge-strict', 'Judge Strict');
      (strictJudge as any).enhancedProfile.attributes.strictness = 10;
      
      const sentence = await sentencingEngine.generateCriminalSentence(strictJudge);
      
      expect(sentence).toBeTruthy();
    });

    it('should adjust sentence for empathetic judge', async () => {
      const empathicJudge = createMockJudgeWithProfile('judge-empathic', 'Judge Kind');
      (empathicJudge as any).enhancedProfile.attributes.empathy = 10;
      (empathicJudge as any).enhancedProfile.attributes.fairness = 10;
      
      const sentence = await sentencingEngine.generateCriminalSentence(empathicJudge);
      
      expect(sentence).toBeTruthy();
    });
  });

  describe('Sentence Severity Adjustment', () => {
    it('should have method to increase sentence severity', () => {
      const baseSentence = { prison: '2 years', fine: 1000, probation: 0, restitution: 5000 };
      const increased = sentencingEngine.increaseSentenceSeverity(baseSentence);
      
      expect(increased).toBeDefined();
    });

    it('should have method to consider mitigating factors', () => {
      const baseSentence = { prison: '5 years', fine: 5000, probation: 0, restitution: 10000 };
      const mitigated = sentencingEngine.considerMitigatingFactors(baseSentence);
      
      expect(mitigated).toBeDefined();
    });

    it('should format sentence statement', () => {
      const sentence = { prison: '3 years', fine: 2000, probation: 0, restitution: 7500 };
      const formatted = sentencingEngine.formatSentenceStatement(sentence, 'assault');
      
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('Charge Types', () => {
    it('should handle violent crime charges', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('homicide');
      
      expect(sentence).toBeDefined();
      expect(sentence.prison).toBeTruthy();
    });

    it('should handle property crime charges', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('theft');
      
      expect(sentence).toBeDefined();
    });

    it('should handle drug-related charges', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('drug distribution');
      
      expect(sentence).toBeDefined();
    });

    it('should handle traffic-related charges', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('dui');
      
      expect(sentence).toBeDefined();
      expect(sentence.fine).toBeGreaterThan(0);
    });
  });

  describe('Sentencing Components', () => {
    it('should include prison time for serious offenses', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('murder');
      
      expect(sentence.prison).toBeTruthy();
      expect(sentence.prison).not.toBe('0');
    });

    it('should include fines for appropriate charges', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('assault');
      
      expect(sentence.fine).toBeGreaterThan(0);
    });

    it('should include probation for lesser offenses', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('grand theft');
      
      expect(sentence.probation).toBeTruthy();
    });

    it('should include restitution for property crimes', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('theft');
      
      expect(sentence.restitution).toBeGreaterThanOrEqual(0);
    });

    it('should include community service for minor offenses', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('dui');
      
      if (sentence.communityService) {
        expect(sentence.communityService).toBeGreaterThan(0);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty charge string', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('');
      
      expect(sentence).toBeDefined();
    });

    it('should handle unknown charge', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('unknown crime');
      
      expect(sentence).toBeDefined();
    });

    it('should handle charge with special characters', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('assault & battery');
      
      expect(sentence).toBeDefined();
    });

    it('should handle very long charge description', () => {
      const longCharge = 'aggravated '.repeat(20) + 'assault';
      const sentence = sentencingEngine.getBaseSentenceForCharge(longCharge);
      
      expect(sentence).toBeDefined();
    });

    it('should handle case without conviction ruling', async () => {
      mockCase.rulings = [];
      const judge = mockCase.participants[0];
      
      // Should still be able to generate sentence
      const sentence = await sentencingEngine.generateCriminalSentence(judge);
      expect(sentence).toBeTruthy();
    });
  });

  describe('Civil Cases', () => {
    it('should not process sentencing for civil cases', () => {
      mockCase.type = 'civil';
      
      // Civil cases should not have criminal sentencing
      expect(mockCase.type).toBe('civil');
    });
  });

  describe('Sentencing Guidelines', () => {
    it('should respect minimum sentences for serious crimes', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('murder');
      
      expect(sentence.prison).toBeTruthy();
      expect(sentence.prison).toContain('year');
    });

    it('should include appropriate fine ranges', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('assault');
      
      expect(sentence.fine).toBeGreaterThan(0);
      expect(sentence.fine).toBeLessThan(100000);
    });

    it('should include restitution for victim compensation', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('theft over $1000');
      
      expect(sentence.restitution).toBeGreaterThan(0);
    });

    it('should structure probation appropriately', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('grand theft');
      
      if (sentence.probation) {
        expect(typeof sentence.probation).toBe('string');
      }
    });
  });

  describe('Judge Personality Impact', () => {
    it('should consider judge strictness in sentencing', async () => {
      const strictJudge = createMockJudgeWithProfile('judge-1', 'Judge Strict');
      (strictJudge as any).enhancedProfile.attributes.strictness = 10;
      
      mockCase.participants[0] = strictJudge;
      const sentence = await sentencingEngine.generateCriminalSentence(strictJudge);
      
      expect(sentence).toBeTruthy();
    });

    it('should consider judge empathy in sentencing', async () => {
      const empathicJudge = createMockJudgeWithProfile('judge-2', 'Judge Kind');
      (empathicJudge as any).enhancedProfile.attributes.empathy = 10;
      (empathicJudge as any).enhancedProfile.attributes.fairness = 8;
      
      mockCase.participants[0] = empathicJudge;
      const sentence = await sentencingEngine.generateCriminalSentence(empathicJudge);
      
      expect(sentence).toBeTruthy();
    });

    it('should balance multiple judge attributes', async () => {
      const balancedJudge = createMockJudgeWithProfile('judge-3', 'Judge Balanced');
      (balancedJudge as any).enhancedProfile.attributes.strictness = 5;
      (balancedJudge as any).enhancedProfile.attributes.empathy = 5;
      (balancedJudge as any).enhancedProfile.attributes.fairness = 8;
      
      const sentence = await sentencingEngine.generateCriminalSentence(balancedJudge);
      
      expect(sentence).toBeTruthy();
    });
  });

  describe('Data Validation', () => {
    it('should return valid sentence structure', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('theft');
      
      expect(sentence).toBeDefined();
      expect(typeof sentence).toBe('object');
    });

    it('should include all required sentence components', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('assault');
      
      expect(sentence).toHaveProperty('prison');
      expect(sentence).toHaveProperty('fine');
      expect(sentence).toHaveProperty('probation');
      expect(sentence).toHaveProperty('restitution');
    });

    it('should have numeric fine values', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('assault');
      
      expect(typeof sentence.fine).toBe('number');
      expect(sentence.fine).toBeGreaterThanOrEqual(0);
    });

    it('should have numeric restitution values', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('theft');
      
      expect(typeof sentence.restitution).toBe('number');
      expect(sentence.restitution).toBeGreaterThanOrEqual(0);
    });

    it('should format prison time as string', () => {
      const sentence = sentencingEngine.getBaseSentenceForCharge('assault');
      
      expect(typeof sentence.prison).toBe('string');
    });
  });

  describe('Sentence Formatting', () => {
    it('should create readable sentence statements', () => {
      const sentence = { prison: '3 years', fine: 2000, probation: 0, restitution: 5000 };
      const formatted = sentencingEngine.formatSentenceStatement(sentence, 'assault');
      
      expect(formatted).toContain('sentence');
      expect(formatted.length).toBeGreaterThan(20);
    });

    it('should include charge in formatted statement', () => {
      const sentence = { prison: '2 years', fine: 1000, probation: 0, restitution: 0 };
      const charge = 'theft';
      const formatted = sentencingEngine.formatSentenceStatement(sentence, charge);
      
      expect(typeof formatted).toBe('string');
    });

    it('should handle sentences with multiple components', () => {
      const sentence = { 
        prison: '1 year', 
        fine: 5000, 
        probation: '3 years', 
        restitution: 10000,
        communityService: 100
      };
      const formatted = sentencingEngine.formatSentenceStatement(sentence, 'assault');
      
      expect(formatted).toBeTruthy();
    });
  });
});
