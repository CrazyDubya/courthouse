import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CourtroomAgent } from '../CourtroomAgent';
import type { Participant, Evidence } from '../../../types';

describe('CourtroomAgent', () => {
  let mockParticipant: Participant;
  let agent: CourtroomAgent;

  beforeEach(() => {
    mockParticipant = {
      id: 'agent-1',
      name: 'Test Attorney',
      role: 'defense-attorney',
      aiControlled: false, // Start without LLM to test fallback behavior
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
        education: 'JD from Stanford Law',
        experience: '10 years in criminal defense',
        specialization: 'Criminal Defense',
        personalHistory: 'Former public defender',
        motivations: ['Client advocacy', 'Justice', 'Due process'],
      },
      currentMood: 0.7,
      knowledge: ['Criminal Law', 'Constitutional Law', 'Trial Advocacy'],
      objectives: ['Client acquittal', 'Fair trial'],
    };

    agent = new CourtroomAgent(mockParticipant);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with participant data', () => {
      expect(agent).toBeInstanceOf(CourtroomAgent);
    });

    it('should initialize memory structures', () => {
      const memorySummary = agent.getMemorySummary();
      expect(memorySummary).toContain('Test Attorney');
      expect(memorySummary).toContain('defense-attorney');
    });

    it('should initialize emotional state', () => {
      const emotionalState = agent.getEmotionalStateSummary();
      expect(emotionalState).toContain('stress');
      expect(emotionalState).toContain('confidence');
      expect(emotionalState).toContain('frustration');
      expect(emotionalState).toContain('satisfaction');
    });
  });

  describe('Thinking Process', () => {
    it('should generate thoughts for given context', async () => {
      const context = 'Preparing for opening statement';
      const thoughts = await agent.think(context);
      
      expect(Array.isArray(thoughts)).toBe(true);
      expect(thoughts.length).toBeGreaterThan(0);
      expect(thoughts[0]).toContain(context);
    });

    it('should handle empty context', async () => {
      const thoughts = await agent.think('');
      expect(Array.isArray(thoughts)).toBe(true);
      expect(thoughts.length).toBeGreaterThan(0);
    });
  });

  describe('Action Planning', () => {
    it('should plan action from available options', async () => {
      const context = 'Cross-examination of witness';
      const availableActions = ['ask-question', 'object', 'pass'];
      
      const action = await agent.planAction(context, availableActions);
      
      expect(action).toHaveProperty('type');
      expect(action).toHaveProperty('content');
      expect(action).toHaveProperty('confidence');
      expect(action.confidence).toBeGreaterThanOrEqual(0);
      expect(action.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle empty available actions', async () => {
      const action = await agent.planAction('test context', []);
      expect(action).toHaveProperty('type');
      expect(action).toHaveProperty('content');
    });
  });

  describe('Statement Generation', () => {
    it('should generate appropriate statements', async () => {
      const context = 'Opening statement for criminal defense case';
      const statement = await agent.generateStatement(context);
      
      expect(typeof statement).toBe('string');
      expect(statement.length).toBeGreaterThan(0);
    });

    it('should generate statements for different roles', async () => {
      const judgeParticipant = { ...mockParticipant, role: 'judge' as const };
      const judgeAgent = new CourtroomAgent(judgeParticipant);
      
      const statement = await judgeAgent.generateStatement('Court proceeding');
      expect(typeof statement).toBe('string');
      expect(statement.length).toBeGreaterThan(0);
    });

    it('should generate role-appropriate default statements', async () => {
      const statement = await agent.generateStatement('Default context');
      expect(typeof statement).toBe('string');
      
      // Should contain defense-attorney specific language
      const defenseStatements = ['innocent', 'dismiss', 'objection'];
      const containsDefenseLanguage = defenseStatements.some(term => 
        statement.toLowerCase().includes(term)
      );
      expect(containsDefenseLanguage).toBe(true);
    });
  });

  describe('Objection Evaluation', () => {
    it('should evaluate objections with boolean result', async () => {
      const statement = 'The witness is clearly lying about what happened';
      const objectionType = 'speculation';
      
      const shouldObject = await agent.evaluateObjection(statement, objectionType);
      expect(typeof shouldObject).toBe('boolean');
    });

    it('should handle different objection types', async () => {
      const statement = 'What did the defendant tell you after the incident?';
      const objections: Array<'hearsay' | 'relevance' | 'leading-question'> = ['hearsay', 'relevance', 'leading-question'];
      
      for (const objectionType of objections) {
        const result = await agent.evaluateObjection(statement, objectionType);
        expect(typeof result).toBe('boolean');
      }
    });
  });

  describe('Evidence Processing', () => {
    it('should process evidence and update memory', async () => {
      const evidence: Evidence = {
        id: 'evidence-1',
        type: 'document',
        title: 'Police Report',
        description: 'Initial police report from crime scene',
        admissible: true,
        submittedBy: 'prosecutor-1',
        chainOfCustody: ['Police Officer A', 'Evidence Clerk'],
      };

      await agent.processEvidence(evidence);
      
      const memorySummary = agent.getMemorySummary();
      expect(memorySummary).toContain('Police Report');
    });

    it('should handle different evidence types', async () => {
      const evidenceTypes: Evidence[] = [
        {
          id: 'vid-1',
          type: 'video',
          title: 'Security Camera Footage',
          description: 'CCTV footage from store',
          admissible: true,
          submittedBy: 'prosecutor-1',
          chainOfCustody: ['Store Manager'],
        },
        {
          id: 'doc-1',
          type: 'document',
          title: 'Medical Records',
          description: 'Hospital records of victim',
          admissible: true,
          submittedBy: 'prosecutor-1',
          chainOfCustody: ['Hospital Staff'],
        },
      ];

      for (const evidence of evidenceTypes) {
        await agent.processEvidence(evidence);
      }

      const memorySummary = agent.getMemorySummary();
      expect(memorySummary).toContain('Security Camera Footage');
    });
  });

  describe('Emotional State Management', () => {
    it('should update emotional state based on events', () => {
      const initialState = agent.getEmotionalStateSummary();
      
      agent.updateEmotionalState('objection_sustained', 1.0);
      
      const updatedState = agent.getEmotionalStateSummary();
      expect(updatedState).not.toBe(initialState);
    });

    it('should handle different event types', () => {
      const events = ['objection_overruled', 'strong_evidence_presented', 'witness_supportive'];
      
      events.forEach(event => {
        agent.updateEmotionalState(event, 0.5);
        const state = agent.getEmotionalStateSummary();
        expect(state).toContain('%');
      });
    });

    it('should maintain emotional values within bounds', () => {
      // Apply extreme updates
      agent.updateEmotionalState('objection_sustained', 10.0);
      agent.updateEmotionalState('strong_evidence_presented', -10.0);
      
      const state = agent.getEmotionalStateSummary();
      const percentages = state.match(/\d+%/g);
      
      if (percentages) {
        percentages.forEach(percent => {
          const value = parseInt(percent.replace('%', ''));
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(100);
        });
      }
    });
  });

  describe('Memory System', () => {
    it('should provide memory summary', () => {
      const summary = agent.getMemorySummary();
      expect(summary).toContain('Short-term:');
      expect(summary).toContain('Long-term highlights:');
      expect(summary).toContain('Beliefs:');
    });

    it('should include participant information in memory', () => {
      const summary = agent.getMemorySummary();
      expect(summary).toContain('defense-attorney');
      expect(summary).toContain('Stanford Law');
    });
  });

  describe('Role-Specific Behavior', () => {
    it('should generate role-appropriate actions for different participants', async () => {
      const roles: Array<{role: any, expectedBehavior: string[]}> = [
        { role: 'judge', expectedBehavior: ['order', 'overruled', 'sustained', 'proceed'] },
        { role: 'prosecutor', expectedBehavior: ['objection', 'state', 'evidence'] },
        { role: 'witness', expectedBehavior: ['yes', 'no', 'recall'] },
      ];

      for (const { role, expectedBehavior } of roles) {
        const roleParticipant = { ...mockParticipant, role };
        const roleAgent = new CourtroomAgent(roleParticipant);
        
        const statement = await roleAgent.generateStatement('Test context');
        const statementLower = statement.toLowerCase();
        
        const matchesBehavior = expectedBehavior.some(behavior => 
          statementLower.includes(behavior)
        );
        expect(matchesBehavior).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle missing participant properties gracefully', () => {
      const minimalParticipant = {
        ...mockParticipant,
        background: {
          ...mockParticipant.background,
          motivations: [],
        },
      };
      
      const minimalAgent = new CourtroomAgent(minimalParticipant);
      expect(minimalAgent.getMemorySummary()).toBeDefined();
    });

    it('should handle invalid emotional state updates', () => {
      agent.updateEmotionalState('invalid_event', 0.5);
      const state = agent.getEmotionalStateSummary();
      expect(state).toBeDefined();
      expect(state.length).toBeGreaterThan(0);
    });
  });
});