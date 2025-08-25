import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryManager } from '../MemoryManager';
import { createMockCase, createMockParticipant } from '../../test/helpers';
import type { Case, Participant } from '../../types';

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;
  let mockCase: Case;
  let mockParticipant: Participant;

  beforeEach(() => {
    memoryManager = new MemoryManager('test-judge-1');
    mockCase = createMockCase();
    mockParticipant = createMockParticipant();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with proper default values', () => {
      expect(memoryManager.isMemoryEnabled()).toBe(true);
      expect(memoryManager.getCaseHistory()).toEqual([]);
      expect(memoryManager.getDecisionHistory()).toEqual([]);
      expect(memoryManager.getParticipantsByRole('judge')).toEqual([]);
    });

    it('should accept initial memory configuration', () => {
      const customMemory = new MemoryManager('test-judge-2', {
        enabled: false,
        retentionPeriod: 365
      });
      
      expect(customMemory.isMemoryEnabled()).toBe(false);
    });
  });

  describe('Memory Toggle', () => {
    it('should toggle memory on and off', () => {
      expect(memoryManager.isMemoryEnabled()).toBe(true);
      
      memoryManager.toggleMemory(false);
      expect(memoryManager.isMemoryEnabled()).toBe(false);
      
      memoryManager.toggleMemory(true);
      expect(memoryManager.isMemoryEnabled()).toBe(true);
    });
  });

  describe('Case Memory Management', () => {
    it('should record a case when memory is enabled', () => {
      memoryManager.recordCase(mockCase, 'guilty verdict', ['objection sustained', 'witness testimony']);
      
      const caseHistory = memoryManager.getCaseHistory();
      expect(caseHistory).toHaveLength(1);
      expect(caseHistory[0].caseId).toBe(mockCase.id);
      expect(caseHistory[0].outcome).toBe('guilty verdict');
      expect(caseHistory[0].notableEvents).toContain('objection sustained');
    });

    it('should not record a case when memory is disabled', () => {
      memoryManager.toggleMemory(false);
      memoryManager.recordCase(mockCase, 'guilty verdict', ['objection sustained']);
      
      expect(memoryManager.getCaseHistory()).toHaveLength(0);
    });

    it('should filter case history by case type', () => {
      const criminalCase = createMockCase({ type: 'criminal' });
      const civilCase = createMockCase({ type: 'civil' });
      
      memoryManager.recordCase(criminalCase, 'guilty', []);
      memoryManager.recordCase(civilCase, 'plaintiff wins', []);
      
      const criminalHistory = memoryManager.getCaseHistory('criminal');
      const civilHistory = memoryManager.getCaseHistory('civil');
      
      expect(criminalHistory).toHaveLength(1);
      expect(civilHistory).toHaveLength(1);
      expect(criminalHistory[0].caseType).toBe('criminal');
      expect(civilHistory[0].caseType).toBe('civil');
    });

    it('should find similar cases based on type and participants', () => {
      const participant1 = createMockParticipant({ name: 'John Doe' });
      const participant2 = createMockParticipant({ name: 'Jane Smith' });
      
      const case1 = createMockCase({ 
        type: 'criminal', 
        participants: [participant1] 
      });
      const case2 = createMockCase({ 
        type: 'criminal', 
        participants: [participant1, participant2] 
      });
      const case3 = createMockCase({ 
        type: 'civil', 
        participants: [participant1] 
      });
      
      memoryManager.recordCase(case1, 'guilty', []);
      memoryManager.recordCase(case2, 'not guilty', []);
      memoryManager.recordCase(case3, 'plaintiff wins', []);
      
      const currentCase = createMockCase({ 
        type: 'criminal', 
        participants: [participant1] 
      });
      
      const similarCases = memoryManager.findSimilarCases(currentCase, 5);
      
      expect(similarCases).toHaveLength(2); // Only criminal cases
      expect(similarCases.every(c => c.caseType === 'criminal')).toBe(true);
    });
  });

  describe('Participant Memory Management', () => {
    it('should record participant interaction', () => {
      memoryManager.recordParticipantInteraction(mockParticipant, 'guilty verdict', 'excellent');
      
      const participantHistory = memoryManager.getParticipantHistory(mockParticipant.name);
      expect(participantHistory).toBeDefined();
      expect(participantHistory!.participantName).toBe(mockParticipant.name);
      expect(participantHistory!.casesWithParticipant).toBe(1);
      expect(participantHistory!.credibilityScore).toBe(9); // Excellent performance
      expect(participantHistory!.relationship).toBe('respected');
    });

    it('should update existing participant stats', () => {
      // First interaction
      memoryManager.recordParticipantInteraction(mockParticipant, 'guilty verdict', 'excellent');
      
      // Second interaction
      memoryManager.recordParticipantInteraction(mockParticipant, 'not guilty verdict', 'good');
      
      const participantHistory = memoryManager.getParticipantHistory(mockParticipant.name);
      expect(participantHistory!.casesWithParticipant).toBe(2);
      expect(participantHistory!.credibilityScore).toBe(8); // Average of 9 and 7
    });

    it('should track problematic participants', () => {
      memoryManager.recordParticipantInteraction(mockParticipant, 'mistrial', 'problematic');
      
      const participantHistory = memoryManager.getParticipantHistory(mockParticipant.name);
      expect(participantHistory!.relationship).toBe('problematic');
      expect(participantHistory!.notableQualities).toContain('disruptive');
    });

    it('should filter participants by role', () => {
      const judge = createMockParticipant({ name: 'Judge Smith', role: 'judge' });
      const prosecutor = createMockParticipant({ name: 'DA Jones', role: 'prosecutor' });
      
      memoryManager.recordParticipantInteraction(judge, 'case decided', 'good');
      memoryManager.recordParticipantInteraction(prosecutor, 'conviction', 'excellent');
      
      const judges = memoryManager.getParticipantsByRole('judge');
      const prosecutors = memoryManager.getParticipantsByRole('prosecutor');
      
      expect(judges).toHaveLength(1);
      expect(prosecutors).toHaveLength(1);
      expect(judges[0].participantName).toBe('Judge Smith');
      expect(prosecutors[0].participantName).toBe('DA Jones');
    });
  });

  describe('Decision Memory Management', () => {
    it('should record judicial decisions', () => {
      memoryManager.recordDecision(
        'case-1',
        'ruling',
        'Motion to Dismiss',
        'Motion granted',
        'Legal precedent clearly supports dismissal',
        ['experienced with similar cases', 'confident in legal analysis'],
        8
      );
      
      const decisions = memoryManager.getDecisionHistory();
      expect(decisions).toHaveLength(1);
      expect(decisions[0].subject).toBe('Motion to Dismiss');
      expect(decisions[0].decision).toBe('Motion granted');
      expect(decisions[0].confidence).toBe(8);
    });

    it('should filter decisions by case ID', () => {
      memoryManager.recordDecision('case-1', 'ruling', 'Motion 1', 'Granted', 'Reason 1', [], 7);
      memoryManager.recordDecision('case-2', 'ruling', 'Motion 2', 'Denied', 'Reason 2', [], 6);
      memoryManager.recordDecision('case-1', 'objection', 'Objection 1', 'Sustained', 'Reason 3', [], 8);
      
      const case1Decisions = memoryManager.getDecisionHistory('case-1');
      expect(case1Decisions).toHaveLength(2);
      expect(case1Decisions.every(d => d.caseId === 'case-1')).toBe(true);
    });

    it('should analyze decision patterns', () => {
      memoryManager.recordDecision('case-1', 'motion', 'Motion 1', 'granted', 'Reason 1', ['factor-a'], 8);
      memoryManager.recordDecision('case-2', 'motion', 'Motion 2', 'denied', 'Reason 2', ['factor-b'], 6);
      memoryManager.recordDecision('case-3', 'motion', 'Motion 3', 'granted', 'Reason 3', ['factor-a'], 9);
      
      const patterns = memoryManager.getDecisionPatterns('motion');
      
      expect(patterns.totalDecisions).toBe(3);
      expect(patterns.averageConfidence).toBeCloseTo((8 + 6 + 9) / 3);
      expect(patterns.mostCommonFactors).toContain('factor-a');
      expect(patterns.decisionDistribution.granted).toBe(2);
      expect(patterns.decisionDistribution.denied).toBe(1);
    });
  });

  describe('Decision Influence', () => {
    it('should calculate decision influence based on memory', () => {
      // Set up some experience
      const experiencedParticipant = createMockParticipant({ name: 'Experienced Attorney' });
      memoryManager.recordParticipantInteraction(experiencedParticipant, 'victory', 'excellent');
      
      // Record some similar cases
      const similarCase = createMockCase({ type: 'criminal' });
      memoryManager.recordCase(similarCase, 'conviction', []);
      
      const influence = memoryManager.getDecisionInfluence({
        participants: [experiencedParticipant],
        caseType: 'criminal',
        subject: 'motion to suppress'
      });
      
      expect(influence.participantBias).toBeGreaterThan(0); // Positive bias for respected participant
      expect(influence.precedentStrength).toBeGreaterThan(0); // Has similar cases
      expect(influence.confidence).toBeGreaterThan(5); // Base confidence increased
    });

    it('should return neutral influence when memory is disabled', () => {
      memoryManager.toggleMemory(false);
      
      const influence = memoryManager.getDecisionInfluence({
        participants: [mockParticipant],
        caseType: 'criminal',
        subject: 'motion to suppress'
      });
      
      expect(influence.experienceWeight).toBe(0);
      expect(influence.participantBias).toBe(0);
      expect(influence.precedentStrength).toBe(0);
      expect(influence.confidence).toBe(5); // Base confidence
    });
  });

  describe('Memory Maintenance', () => {
    it('should clean up old cases based on retention period', () => {
      // Mock dates for testing
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2000); // Older than retention period
      
      const newDate = new Date();
      newDate.setDate(newDate.getDate() - 100); // Within retention period
      
      // Create mock case memories
      const oldCaseMemory = {
        caseId: 'old-case',
        caseType: 'criminal' as const,
        participants: ['participant'],
        outcome: 'guilty',
        notableEvents: [],
        personalNotes: 'old case',
        timestamp: oldDate
      };
      
      const newCaseMemory = {
        caseId: 'new-case',
        caseType: 'criminal' as const,
        participants: ['participant'],
        outcome: 'not guilty',
        notableEvents: [],
        personalNotes: 'new case',
        timestamp: newDate
      };
      
      // Directly access memory to set up test data
      const memory = memoryManager.exportMemory();
      memory.cases = [oldCaseMemory, newCaseMemory];
      memoryManager.importMemory(memory);
      
      memoryManager.cleanupOldCases();
      
      const remainingCases = memoryManager.getCaseHistory();
      expect(remainingCases).toHaveLength(1);
      expect(remainingCases[0].caseId).toBe('new-case');
    });

    it('should export and import memory correctly', () => {
      memoryManager.recordCase(mockCase, 'guilty', ['event']);
      memoryManager.recordParticipantInteraction(mockParticipant, 'conviction', 'good');
      
      const exportedMemory = memoryManager.exportMemory();
      
      const newMemoryManager = new MemoryManager('test-judge-2');
      newMemoryManager.importMemory(exportedMemory);
      
      expect(newMemoryManager.getCaseHistory()).toHaveLength(1);
      expect(newMemoryManager.getParticipantHistory(mockParticipant.name)).toBeDefined();
    });

    it('should provide memory statistics', () => {
      memoryManager.recordCase(mockCase, 'guilty', []);
      memoryManager.recordParticipantInteraction(mockParticipant, 'conviction', 'good');
      memoryManager.recordDecision('case-1', 'ruling', 'subject', 'decision', 'reasoning', [], 7);
      
      const stats = memoryManager.getMemoryStats();
      
      expect(stats.enabled).toBe(true);
      expect(stats.totalCases).toBe(1);
      expect(stats.totalParticipants).toBe(1);
      expect(stats.totalDecisions).toBe(1);
      expect(stats.experience).toBeDefined();
      expect(stats.retentionPeriod).toBe(1825);
    });
  });
});