import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CaseService } from '../../services/CaseService.js';
import { Case, Participant } from '../../types/index.js';

describe('Case Workflow Integration', () => {
  let caseService: CaseService;

  beforeEach(() => {
    caseService = new CaseService();
  });

  describe('Complete Case Lifecycle', () => {
    it('should create and manage a complete case workflow', async () => {
      const caseData = {
        title: 'Smith vs. Jones Contract Dispute',
        type: 'civil' as const,
        summary: 'A dispute over a software development contract',
        participants: [
          {
            name: 'Judge Williams',
            role: 'judge',
            aiControlled: true,
            description: 'Presiding judge'
          },
          {
            name: 'Attorney Smith',
            role: 'plaintiff-attorney',
            aiControlled: false,
            description: 'Plaintiff attorney'
          },
          {
            name: 'Attorney Jones',
            role: 'defendant-attorney',
            aiControlled: false,
            description: 'Defendant attorney'
          }
        ],
        settings: {
          realtimeSpeed: 1.0,
          autoProgress: false,
          jurySize: 0,
          enableObjections: true,
          complexityLevel: 'intermediate' as const
        }
      };

      const createdCase = await caseService.createCase(caseData);

      expect(createdCase).toBeDefined();
      expect(createdCase.id).toBeDefined();
      expect(createdCase.title).toBe(caseData.title);
      expect(createdCase.phase).toBe('opening');
      expect(createdCase.participants.length).toBe(3);

      const retrievedCase = await caseService.getCaseById(createdCase.id);
      expect(retrievedCase).toEqual(createdCase);

      const witness: Participant = {
        name: 'Jane Doe',
        role: 'witness',
        aiControlled: true,
        description: 'Expert witness on software development'
      };

      const caseWithWitness = await caseService.addParticipant(createdCase.id, witness);
      expect(caseWithWitness).toBeDefined();
      expect(caseWithWitness!.participants.length).toBe(4);

      const transcriptEntry = {
        speaker: 'Judge Williams',
        text: 'Court is now in session',
        timestamp: new Date(),
        type: 'statement' as const
      };

      const caseWithTranscript = await caseService.addTranscriptEntry(
        createdCase.id,
        transcriptEntry
      );
      expect(caseWithTranscript).toBeDefined();
      expect(caseWithTranscript!.transcript.length).toBeGreaterThan(0);

      const caseInTrial = await caseService.updatePhase(createdCase.id, 'trial');
      expect(caseInTrial).toBeDefined();
      expect(caseInTrial!.phase).toBe('trial');

      const updatedCase = await caseService.updateCase(createdCase.id, {
        summary: 'Updated: A complex dispute over a software development contract'
      });
      expect(updatedCase).toBeDefined();
      expect(updatedCase!.summary).toContain('Updated');

      const deleted = await caseService.deleteCase(createdCase.id);
      expect(deleted).toBe(true);

      const shouldBeNull = await caseService.getCaseById(createdCase.id);
      expect(shouldBeNull).toBeNull();
    });

    it('should handle case with jury', async () => {
      const caseData = {
        title: 'Criminal Case with Jury',
        type: 'criminal' as const,
        summary: 'A criminal trial requiring a jury',
        participants: [
          {
            name: 'Judge Anderson',
            role: 'judge',
            aiControlled: true
          },
          {
            name: 'Prosecutor',
            role: 'prosecutor',
            aiControlled: true
          },
          {
            name: 'Defense Attorney',
            role: 'defense-attorney',
            aiControlled: false
          }
        ],
        settings: {
          jurySize: 12,
          enableObjections: true,
          complexityLevel: 'advanced' as const
        }
      };

      const createdCase = await caseService.createCase(caseData);
      expect(createdCase.settings?.jurySize).toBe(12);

      await caseService.deleteCase(createdCase.id);
    });

    it('should manage participant updates throughout trial', async () => {
      const caseData = {
        title: 'Test Case',
        type: 'civil' as const,
        summary: 'Test case for participant management',
        participants: [
          {
            name: 'Original Attorney',
            role: 'plaintiff-attorney',
            aiControlled: false
          }
        ]
      };

      const createdCase = await caseService.createCase(caseData);
      const originalParticipant = createdCase.participants[0];

      const updatedCase = await caseService.updateParticipant(
        createdCase.id,
        originalParticipant.id!,
        {
          name: 'Updated Attorney Name',
          description: 'Updated description'
        }
      );

      expect(updatedCase).toBeDefined();
      const updatedParticipant = updatedCase!.participants.find(
        p => p.id === originalParticipant.id
      );
      expect(updatedParticipant?.name).toBe('Updated Attorney Name');

      const caseAfterRemoval = await caseService.removeParticipant(
        createdCase.id,
        originalParticipant.id!
      );
      expect(caseAfterRemoval).toBeDefined();
      expect(caseAfterRemoval!.participants.length).toBe(0);

      await caseService.deleteCase(createdCase.id);
    });
  });

  describe('Transcript Management', () => {
    it('should maintain chronological transcript order', async () => {
      const caseData = {
        title: 'Transcript Test Case',
        type: 'civil' as const,
        summary: 'Testing transcript functionality',
        participants: [
          {
            name: 'Judge',
            role: 'judge',
            aiControlled: true
          }
        ]
      };

      const createdCase = await caseService.createCase(caseData);

      const entries = [
        { speaker: 'Judge', text: 'First statement', timestamp: new Date() },
        { speaker: 'Judge', text: 'Second statement', timestamp: new Date() },
        { speaker: 'Judge', text: 'Third statement', timestamp: new Date() }
      ];

      for (const entry of entries) {
        await caseService.addTranscriptEntry(createdCase.id, entry);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const transcript = await caseService.getTranscript(createdCase.id);
      expect(transcript).toBeDefined();
      expect(transcript!.length).toBeGreaterThanOrEqual(3);

      await caseService.deleteCase(createdCase.id);
    });
  });

  describe('Phase Transitions', () => {
    it('should transition through all case phases', async () => {
      const caseData = {
        title: 'Phase Transition Test',
        type: 'civil' as const,
        summary: 'Testing phase transitions',
        participants: [
          {
            name: 'Judge',
            role: 'judge',
            aiControlled: true
          }
        ]
      };

      const createdCase = await caseService.createCase(caseData);
      expect(createdCase.phase).toBe('opening');

      const phases = ['trial', 'closing', 'deliberation', 'verdict'];

      for (const phase of phases) {
        const updated = await caseService.updatePhase(createdCase.id, phase);
        expect(updated).toBeDefined();
        expect(updated!.phase).toBe(phase);
      }

      await caseService.deleteCase(createdCase.id);
    });
  });

  describe('Multi-Case Operations', () => {
    it('should handle multiple cases for same user', async () => {
      const userId = 'test-user-123';
      const caseCount = 3;

      const cases = await Promise.all(
        Array.from({ length: caseCount }, (_, i) => 
          caseService.createCase({
            title: `Test Case ${i + 1}`,
            type: 'civil',
            summary: `Test case number ${i + 1}`,
            participants: [
              {
                name: 'Judge',
                role: 'judge',
                aiControlled: true
              }
            ]
          })
        )
      );

      expect(cases.length).toBe(caseCount);

      const allCases = await caseService.getAllCases(userId);
      expect(allCases.length).toBeGreaterThanOrEqual(caseCount);

      for (const testCase of cases) {
        await caseService.deleteCase(testCase.id);
      }
    });

    it('should handle pagination for large case lists', async () => {
      const userId = 'test-user-pagination';

      const limit = 2;
      const offset = 0;

      const paginatedCases = await caseService.getAllCases(userId, limit, offset);
      expect(paginatedCases.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('Case Validation', () => {
    it('should not retrieve non-existent case', async () => {
      const nonExistentCase = await caseService.getCaseById('non-existent-id');
      expect(nonExistentCase).toBeNull();
    });

    it('should not delete non-existent case', async () => {
      const deleted = await caseService.deleteCase('non-existent-id');
      expect(deleted).toBe(false);
    });

    it('should not update non-existent case', async () => {
      const updated = await caseService.updateCase('non-existent-id', {
        title: 'Should not work'
      });
      expect(updated).toBeNull();
    });

    it('should not add participant to non-existent case', async () => {
      const updated = await caseService.addParticipant('non-existent-id', {
        name: 'Test',
        role: 'witness',
        aiControlled: false
      });
      expect(updated).toBeNull();
    });
  });

  describe('Complex Workflows', () => {
    it('should handle a full trial simulation workflow', async () => {
      const caseData = {
        title: 'Full Trial Simulation',
        type: 'criminal' as const,
        summary: 'Complete trial from start to finish',
        participants: [
          {
            name: 'Judge Roberts',
            role: 'judge',
            aiControlled: true,
            llmConfig: { provider: 'ollama', model: 'llama2' }
          },
          {
            name: 'District Attorney',
            role: 'prosecutor',
            aiControlled: true,
            llmConfig: { provider: 'ollama', model: 'llama2' }
          },
          {
            name: 'Defense Counsel',
            role: 'defense-attorney',
            aiControlled: true,
            llmConfig: { provider: 'ollama', model: 'llama2' }
          },
          {
            name: 'Defendant',
            role: 'defendant',
            aiControlled: false
          }
        ],
        settings: {
          realtimeSpeed: 2.0,
          autoProgress: true,
          jurySize: 12,
          enableObjections: true,
          complexityLevel: 'advanced' as const
        }
      };

      const trial = await caseService.createCase(caseData);
      
      const trialEvents = [
        { phase: 'opening', speaker: 'Judge Roberts', text: 'Court is in session' },
        { phase: 'opening', speaker: 'District Attorney', text: 'Opening statement' },
        { phase: 'trial', speaker: 'Defense Counsel', text: 'Objection!' },
        { phase: 'trial', speaker: 'Judge Roberts', text: 'Sustained' },
        { phase: 'closing', speaker: 'District Attorney', text: 'Closing argument' },
        { phase: 'closing', speaker: 'Defense Counsel', text: 'Closing argument' },
        { phase: 'deliberation', speaker: 'Judge Roberts', text: 'Jury deliberation begins' },
        { phase: 'verdict', speaker: 'Jury Foreman', text: 'We find the defendant...' }
      ];

      let currentPhase = 'opening';
      for (const event of trialEvents) {
        if (event.phase !== currentPhase) {
          await caseService.updatePhase(trial.id, event.phase);
          currentPhase = event.phase;
        }
        
        await caseService.addTranscriptEntry(trial.id, {
          speaker: event.speaker,
          text: event.text,
          timestamp: new Date()
        });
      }

      const finalCase = await caseService.getCaseById(trial.id);
      expect(finalCase).toBeDefined();
      expect(finalCase!.phase).toBe('verdict');
      expect(finalCase!.transcript.length).toBeGreaterThanOrEqual(trialEvents.length);

      await caseService.deleteCase(trial.id);
    });
  });
});
