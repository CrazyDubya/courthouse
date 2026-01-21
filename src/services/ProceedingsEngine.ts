import { 
  Case, 
  ProceedingPhase, 
  Participant, 
  TranscriptEntry, 
  Ruling,
  Evidence,
  SimulationSettings,
  ParticipantRole,
  ObjectionType
} from '../types';
import { 
  Motion, 
  MotionType, 
  MotionTemplate, 
  MotionRuling,
  MotionStatus 
} from '../types/motions';
import { CourtroomAgent } from './agents/CourtroomAgent';
import { MOTION_TEMPLATES } from '../data/motionTemplates';
import { CourtCalendar } from './CourtCalendar';
import { EnhancedJudgeProfile } from '../types/judge';
import { TestimonyGenerator, TestimonySequence } from './TestimonyGenerator';
import { DetailedWitness } from './WitnessFactory';
import { OfficeManager, OfficeManagerCallbacks } from './OfficeManager';
import { MotionProcessor } from './proceedings/MotionProcessor';
import { TrialExecutor } from './proceedings/TrialExecutor';
import { SentencingEngine } from './proceedings/SentencingEngine';
import { TrialPhaseManager } from './proceedings/TrialPhaseManager';

export interface ProceedingEvent {
  type: 'speech' | 'objection' | 'ruling' | 'evidence' | 'phase-change' | 'sidebar' | 'recess';
  speaker?: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface AICallbacks {
  setAIProcessing: (isProcessing: boolean, operation?: string) => void;
  setAIProgress: (current: number, total: number) => void;
}

/**
 * ProceedingsEngine - Facade for courtroom proceedings simulation.
 * Delegates to specialized modules: MotionProcessor, TrialExecutor, SentencingEngine, TrialPhaseManager.
 */
export class ProceedingsEngine {
  private currentCase: Case;
  private agents: Map<string, CourtroomAgent>;
  private settings: SimulationSettings;
  private isRunning: boolean = false;
  private eventQueue: ProceedingEvent[] = [];
  private phaseHandlers: Map<ProceedingPhase, () => Promise<void>>;
  private currentSpeaker: { value: string | null } = { value: null };
  private sidebarActive: { value: boolean } = { value: false };
  private aiCallbacks?: AICallbacks;
  private pendingMotions: Motion[] = [];
  private courtCalendar: CourtCalendar;
  private motionCounter: { value: number } = { value: 1 };
  private transcriptCounter: { value: number } = { value: 0 };
  private officeManager: OfficeManager;

  // Specialized modules
  private motionProcessor: MotionProcessor;
  private trialExecutor: TrialExecutor;
  private sentencingEngine: SentencingEngine;
  private trialPhaseManager: TrialPhaseManager;

  constructor(
    caseData: Case, 
    settings: SimulationSettings,
    aiCallbacks?: AICallbacks
  ) {
    this.currentCase = caseData;
    this.settings = settings;
    this.agents = new Map();
    this.phaseHandlers = new Map();
    this.aiCallbacks = aiCallbacks;
    this.courtCalendar = new CourtCalendar();
    
    this.initializeAgents();
    this.initializeOfficeManager();
    this.initializeModules();
    this.initializePhaseHandlers();
  }

  private initializeAgents(): void {
    for (const participant of this.currentCase.participants) {
      if (participant.aiControlled) {
        this.agents.set(participant.id, new CourtroomAgent(participant));
      }
    }
  }

  private initializeOfficeManager(): void {
    const callbacks: OfficeManagerCallbacks = {
      onWorkStarted: (session) => {
        console.log(`🏢 ${session.attorney.name} started ${session.type} in office`);
        this.aiCallbacks?.setAIProcessing(true, `${session.attorney.name} working on ${session.type}`);
      },
      onWorkProgress: (session) => {
        this.aiCallbacks?.setAIProcessing(true, `${session.attorney.name} ${session.progress}% complete with ${session.type}`);
      },
      onWorkCompleted: (session) => {
        console.log(`✅ ${session.attorney.name} completed ${session.type}`);
        if (session.output) {
          console.log(`📄 Output: ${session.output.content.substring(0, 100)}...`);
        }
      },
      onLocationChanged: (participant, from, to) => {
        console.log(`📍 ${participant.name} moved from ${from} to ${to}`);
      }
    };

    this.officeManager = new OfficeManager(this.agents, callbacks);
  }

  private initializeModules(): void {
    // Create shared dependencies for modules
    const sharedArgs = [
      this.currentCase,
      this.agents,
      this.settings,
      this.eventQueue,
      this.currentSpeaker,
      this.transcriptCounter,
      this.motionCounter,
      this.pendingMotions,
      this.courtCalendar,
      this.officeManager,
      this.sidebarActive,
      this.aiCallbacks
    ] as const;

    // Instantiate specialized modules
    this.motionProcessor = new MotionProcessor(...sharedArgs);
    this.trialExecutor = new TrialExecutor(...sharedArgs);
    this.sentencingEngine = new SentencingEngine(...sharedArgs);
    this.trialPhaseManager = new TrialPhaseManager(
      this.motionProcessor,
      this.trialExecutor,
      this.sentencingEngine,
      ...sharedArgs
    );
  }

  private initializePhaseHandlers(): void {
    // Delegate all phase handlers to TrialPhaseManager
    this.phaseHandlers.set('case-preparation', () => this.trialPhaseManager.handleCasePreparation());
    this.phaseHandlers.set('pre-trial', () => this.trialPhaseManager.handlePreTrial());
    this.phaseHandlers.set('jury-selection', () => this.trialPhaseManager.handleJurySelection());
    this.phaseHandlers.set('opening-statements', () => this.trialPhaseManager.handleOpeningStatements());
    this.phaseHandlers.set('plaintiff-case', () => this.trialPhaseManager.handlePlaintiffCase());
    this.phaseHandlers.set('defense-case', () => this.trialPhaseManager.handleDefenseCase());
    this.phaseHandlers.set('closing-arguments', () => this.trialPhaseManager.handleClosingArguments());
    this.phaseHandlers.set('jury-deliberation', () => this.trialPhaseManager.handleJuryDeliberation());
    this.phaseHandlers.set('verdict', () => this.trialPhaseManager.handleVerdict());
    this.phaseHandlers.set('sentencing', () => this.trialPhaseManager.handleSentencing());
  }

  async start(): Promise<void> {
    this.isRunning = true;
    
    while (this.isRunning && this.currentCase.currentPhase !== 'sentencing') {
      await this.processPhase();
      
      if (this.settings.autoProgress) {
        await this.delay(1000 / this.settings.realtimeSpeed);
      } else {
        await this.waitForUserInput();
      }
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
  }

  async processPhase(): Promise<void> {
    const handler = this.phaseHandlers.get(this.currentCase.currentPhase);
    if (handler) {
      try {
        console.log(`🎬 Starting phase: ${this.currentCase.currentPhase}`);
        await Promise.race([
          handler(),
          new Promise<void>((_, reject) => 
            setTimeout(() => reject(new Error(`Phase ${this.currentCase.currentPhase} timeout`)), 120000)
          )
        ]);
        console.log(`✅ Completed phase: ${this.currentCase.currentPhase}`);
      } catch (error) {
        console.error(`❌ Error in phase ${this.currentCase.currentPhase}:`, error);
        // Skip to next phase on error to prevent hanging
        this.skipToNextPhase();
      }
    } else {
      console.error(`⚠️  No handler found for phase: ${this.currentCase.currentPhase}`);
      console.log(`Available phases:`, Array.from(this.phaseHandlers.keys()));
      // Skip to next phase if current phase has no handler
      this.skipToNextPhase();
    }
  }

  private skipToNextPhase(): void {
    const phaseOrder: ProceedingPhase[] = [
      'case-preparation', 'pre-trial', 'jury-selection', 'opening-statements', 
      'plaintiff-case', 'defense-case', 'closing-arguments',
      'jury-deliberation', 'verdict', 'sentencing'
    ];
    
    const currentIndex = phaseOrder.indexOf(this.currentCase.currentPhase);
    if (currentIndex >= 0 && currentIndex < phaseOrder.length - 1) {
      this.transitionToPhase(phaseOrder[currentIndex + 1]);
    } else {
      this.isRunning = false;
    }
  }

  private transitionToPhase(phase: ProceedingPhase): void {
    this.currentCase.currentPhase = phase;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async waitForUserInput(): Promise<void> {
    return new Promise(resolve => {
      const listener = () => {
        resolve();
        document.removeEventListener('keypress', listener);
      };
      document.addEventListener('keypress', listener);
    });
  }

  // Public API - Maintain backward compatibility
  getCurrentSpeaker(): string | null {
    return this.currentSpeaker.value;
  }

  getEventQueue(): ProceedingEvent[] {
    return [...this.eventQueue];
  }

  clearEventQueue(): void {
    this.eventQueue = [];
  }

  getTranscript(): TranscriptEntry[] {
    return this.currentCase.transcript;
  }

  getCurrentPhase(): ProceedingPhase {
    return this.currentCase.currentPhase;
  }

  isActive(): boolean {
    return this.isRunning;
  }

  // Office Manager Integration
  getOfficeManager(): OfficeManager {
    return this.officeManager;
  }

  getOfficeStatus(): any {
    return {
      offices: this.officeManager.getAllOffices(),
      activeSessions: this.officeManager.getActiveWorkSessions(),
      attorneyLocations: this.currentCase.participants
        .filter(p => ['prosecutor', 'defense-attorney', 'plaintiff-attorney'].includes(p.role))
        .map(p => ({
          name: p.name,
          role: p.role,
          location: p.currentLocation,
          isPresent: p.isPresent
        }))
    };
  }
}