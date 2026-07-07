import { describe, it, expect, beforeEach } from 'vitest';
import { TrialExecutor } from '../TrialExecutor';
import { Case, Participant, SimulationSettings } from '../../../types';
import { CourtroomAgent } from '../../agents/CourtroomAgent';
import { ProceedingEvent } from '../../ProceedingsEngine';
import { CourtCalendar } from '../../CourtCalendar';
import { OfficeManager } from '../../OfficeManager';

/**
 * Behavior-preservation test for the depth-1 prefetch ("buffered speech") in
 * examineWitness/crossExamineWitness. A buffered loop that pre-generates the
 * next statement while the current one's reading delay plays MUST still record
 * statements in the same order (Q, A, Q, A, ...) and pair each answer with its
 * own question. The agents here are LLM test-doubles — the loop is what's under
 * test, not the agent.
 */
describe('TrialExecutor buffered examination', () => {
  let executor: TrialExecutor;
  let mockCase: Case;
  let agents: Map<string, CourtroomAgent>;
  let settings: SimulationSettings;
  let eventQueue: ProceedingEvent[];

  const participant = (role: string, id: string, name: string): Participant =>
    ({
      id, name, role: role as any, aiControlled: true,
      personality: { temperament: 'calm', communicationStyle: 'direct', decisionMaking: 'analytical', stressResponse: 'composed' },
      background: { age: 35, education: 'X', experience: 'Y', specialization: 'Z', personalHistory: 'H', motivations: ['Justice'] },
      currentMood: 0,
    } as unknown as Participant);

  const examiner = participant('prosecutor', 'pros-1', 'ADA Reed');
  const witness = participant('witness', 'wit-1', 'Witness Vale');

  // Records every prompt the witness agent was asked to answer, so we can prove
  // each answer was generated from its own (already-recorded) question.
  let witnessPrompts: string[];

  const fakeAgent = (reply: (prompt: string) => string): CourtroomAgent =>
    ({ generateStatement: async (prompt: string) => reply(prompt) } as unknown as CourtroomAgent);

  beforeEach(() => {
    witnessPrompts = [];
    let qn = 0;
    let an = 0;

    agents = new Map();
    // Examiner emits uniquely-numbered questions: Q0, Q1, Q2...
    agents.set(examiner.id, fakeAgent(() => `Q${qn++}`));
    // Witness records the answer-prompt it received (which embeds the question)
    // and emits uniquely-numbered answers: A0, A1, A2...
    agents.set(witness.id, fakeAgent((prompt) => { witnessPrompts.push(prompt); return `A${an++}`; }));

    mockCase = {
      id: 'case-1', title: 'T', summary: 'S', facts: 'F', type: 'criminal',
      participants: [examiner, witness],
      charges: ['x'], evidence: [], currentPhase: 'plaintiff-case', transcript: [], rulings: [],
    } as unknown as Case;

    settings = {
      realtimeSpeed: 1000, // shrink the reading delays so the test is fast
      autoAdvancePhases: false, pauseBetweenPhases: false, enableJudgeInterruptions: false,
      enableObjections: false, showThinking: false,
    } as SimulationSettings;

    eventQueue = [];

    executor = new TrialExecutor(
      mockCase, agents, settings, eventQueue,
      { value: null }, { value: 0 }, { value: 0 }, [],
      new CourtCalendar(), new OfficeManager(), { value: false }
    );
  });

  it('records Q/A statements in strict order, alternating examiner and witness', async () => {
    await executor.examineWitness(witness, examiner);

    const statements = mockCase.transcript.filter((t) => t.type === 'statement');
    expect(statements.length).toBeGreaterThanOrEqual(4); // >= 2 exchanges * 2
    expect(statements.length % 2).toBe(0);

    statements.forEach((entry, i) => {
      const expectedSpeaker = i % 2 === 0 ? examiner.name : witness.name;
      expect(entry.speaker).toBe(expectedSpeaker);
      // Content is the exact Q/A the agents produced, in order: Q0, A0, Q1, A1...
      const n = Math.floor(i / 2);
      expect(entry.content).toBe(i % 2 === 0 ? `Q${n}` : `A${n}`);
    });
  });

  it('pairs each answer with its own question (buffering never cross-wires)', async () => {
    await executor.examineWitness(witness, examiner);

    // The i-th answer must have been generated from a prompt embedding the i-th
    // question ("Qi") — proving depth-1 prefetch kept answer i tied to question i.
    witnessPrompts.forEach((prompt, i) => {
      expect(prompt).toContain(`Q${i}`);
    });
    // One answer prompt per exchange.
    const questionCount = mockCase.transcript.filter((t) => t.type === 'statement' && t.speaker === examiner.name).length;
    expect(witnessPrompts.length).toBe(questionCount);
  });

  it('falls back without throwing when generation rejects', async () => {
    // A rejecting examiner agent must degrade to the canned fallback, not crash
    // the loop (the prefetched promise must never surface an unhandled rejection).
    agents.set(examiner.id, { generateStatement: async () => { throw new Error('llm down'); } } as unknown as CourtroomAgent);

    await expect(executor.examineWitness(witness, examiner)).resolves.toBeUndefined();
    const questions = mockCase.transcript.filter((t) => t.type === 'statement' && t.speaker === examiner.name);
    expect(questions.length).toBeGreaterThanOrEqual(2);
    // Fallback questions are non-empty strings, never the thrown error.
    questions.forEach((q) => expect(typeof q.content === 'string' && q.content.length > 0).toBe(true));
  });
});
