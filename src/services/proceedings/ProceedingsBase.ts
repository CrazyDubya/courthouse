import { 
  Case, 
  ProceedingPhase, 
  Participant, 
  TranscriptEntry, 
  SimulationSettings,
  ParticipantRole
} from '../../types';
import { CourtroomAgent } from '../agents/CourtroomAgent';
import { ProceedingEvent, AICallbacks } from '../ProceedingsEngine';
import { CourtCalendar } from '../CourtCalendar';
import { OfficeManager } from '../OfficeManager';
import { Motion } from '../../types/motions';

/**
 * Base class for all proceedings modules.
 * Provides shared state access and common utility methods.
 */
export abstract class ProceedingsBase {
  protected currentCase: Case;
  protected agents: Map<string, CourtroomAgent>;
  protected settings: SimulationSettings;
  protected eventQueue: ProceedingEvent[];
  protected currentSpeaker: { value: string | null };
  protected transcriptCounter: { value: number };
  protected motionCounter: { value: number };
  protected pendingMotions: Motion[];
  protected courtCalendar: CourtCalendar;
  protected officeManager: OfficeManager;
  protected aiCallbacks?: AICallbacks;
  protected sidebarActive: { value: boolean };

  constructor(
    currentCase: Case,
    agents: Map<string, CourtroomAgent>,
    settings: SimulationSettings,
    eventQueue: ProceedingEvent[],
    currentSpeaker: { value: string | null },
    transcriptCounter: { value: number },
    motionCounter: { value: number },
    pendingMotions: Motion[],
    courtCalendar: CourtCalendar,
    officeManager: OfficeManager,
    sidebarActive: { value: boolean },
    aiCallbacks?: AICallbacks
  ) {
    this.currentCase = currentCase;
    this.agents = agents;
    this.settings = settings;
    this.eventQueue = eventQueue;
    this.currentSpeaker = currentSpeaker;
    this.transcriptCounter = transcriptCounter;
    this.motionCounter = motionCounter;
    this.pendingMotions = pendingMotions;
    this.courtCalendar = courtCalendar;
    this.officeManager = officeManager;
    this.sidebarActive = sidebarActive;
    this.aiCallbacks = aiCallbacks;
  }

  protected async generateAndRecordStatement(
    speaker: Participant | undefined, 
    content: string
  ): Promise<void> {
    if (!speaker) return;
    
    this.currentSpeaker.value = speaker.id;
    
    const entry: TranscriptEntry = {
      id: `transcript-${this.transcriptCounter.value++}-${speaker.id}`,
      timestamp: new Date(),
      speaker: speaker.name,
      role: speaker.role,
      content: content,
      type: 'statement',
    };
    
    this.currentCase.transcript.push(entry);
    
    this.eventQueue.push({
      type: 'speech',
      speaker: speaker.id,
      content: content,
    });
    
    await this.delay(Math.max(1000, content.length * 50) / this.settings.realtimeSpeed);
    
    this.currentSpeaker.value = null;
  }

  /**
   * Generates a statement via the agent, resolving to a canned `fallback` on
   * timeout or error. NEVER rejects — this is what makes it safe to start ahead
   * of playback (prefetch): an in-flight buffered generation can't surface an
   * unhandled rejection. Semantics match the prior inline `Promise.race` against
   * a fallback, so buffered generation is content-identical to the serial path.
   */
  protected async generateOrFallback(
    agent: CourtroomAgent,
    prompt: string,
    fallback: string,
    timeoutMs = 10000
  ): Promise<string> {
    try {
      return await Promise.race([
        agent.generateStatement(prompt),
        new Promise<string>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
      ]);
    } catch {
      return fallback;
    }
  }

  protected async announcePhase(phaseName: string): Promise<void> {
    const judge = this.findParticipantByRole('judge');
    if (judge) {
      await this.generateAndRecordStatement(
        judge,
        `We will now proceed to ${phaseName}.`
      );
    }
    
    this.eventQueue.push({
      type: 'phase-change',
      content: phaseName,
    });
  }

  protected transitionToPhase(phase: ProceedingPhase): void {
    this.currentCase.currentPhase = phase;
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected findParticipantByRole(role: ParticipantRole): Participant | undefined {
    return this.currentCase.participants.find(p => p.role === role);
  }

  protected findParticipantById(id: string): Participant | undefined {
    return this.currentCase.participants.find(p => p.id === id);
  }

  protected getOpposingParties(filingPartyId: string): string[] {
    const filingParty = this.findParticipantById(filingPartyId);
    if (!filingParty) return [];
    
    // For prosecutor, get defense attorney
    if (filingParty.role === 'prosecutor') {
      const defenseAttorney = this.findParticipantByRole('defense-attorney');
      return defenseAttorney ? [defenseAttorney.id] : [];
    }
    
    // For defense attorney, get prosecutor
    if (filingParty.role === 'defense-attorney') {
      const prosecutor = this.findParticipantByRole('prosecutor');
      return prosecutor ? [prosecutor.id] : [];
    }
    
    // For plaintiff attorney, get defense attorney (civil case)
    if (filingParty.role === 'plaintiff-attorney') {
      const defenseAttorney = this.findParticipantByRole('defense-attorney');
      return defenseAttorney ? [defenseAttorney.id] : [];
    }
    
    return [];
  }

  protected evaluateEvidenceStrength(): number {
    let totalStrength = 0;
    let evidenceCount = 0;
    
    for (const evidence of this.currentCase.evidence) {
      if (evidence.admissible) {
        const weight = evidence.type === 'video' ? 0.9 :
                       evidence.type === 'document' ? 0.7 :
                       evidence.type === 'testimony' ? 0.5 : 0.6;
        totalStrength += weight;
        evidenceCount++;
      }
    }
    
    return evidenceCount > 0 ? totalStrength / evidenceCount : 0.5;
  }
}
