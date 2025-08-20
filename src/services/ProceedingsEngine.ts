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
import { CourtroomAgent } from './agents/CourtroomAgent';

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

export class ProceedingsEngine {
  private currentCase: Case;
  private agents: Map<string, CourtroomAgent>;
  private settings: SimulationSettings;
  private isRunning: boolean = false;
  private eventQueue: ProceedingEvent[] = [];
  private phaseHandlers: Map<ProceedingPhase, () => Promise<void>>;
  private currentSpeaker: string | null = null;
  private sidebarActive: boolean = false;
  private aiCallbacks?: AICallbacks;

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
    
    this.initializeAgents();
    this.initializePhaseHandlers();
  }

  private initializeAgents(): void {
    for (const participant of this.currentCase.participants) {
      if (participant.aiControlled) {
        this.agents.set(participant.id, new CourtroomAgent(participant));
      }
    }
  }

  private initializePhaseHandlers(): void {
    this.phaseHandlers.set('pre-trial', this.handlePreTrial.bind(this));
    this.phaseHandlers.set('jury-selection', this.handleJurySelection.bind(this));
    this.phaseHandlers.set('opening-statements', this.handleOpeningStatements.bind(this));
    this.phaseHandlers.set('plaintiff-case', this.handlePlaintiffCase.bind(this));
    this.phaseHandlers.set('defense-case', this.handleDefenseCase.bind(this));
    this.phaseHandlers.set('closing-arguments', this.handleClosingArguments.bind(this));
    this.phaseHandlers.set('jury-deliberation', this.handleJuryDeliberation.bind(this));
    this.phaseHandlers.set('verdict', this.handleVerdict.bind(this));
    this.phaseHandlers.set('sentencing', this.handleSentencing.bind(this));
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
      await handler();
    }
  }

  private async handlePreTrial(): Promise<void> {
    await this.announcePhase('Pre-Trial Proceedings');
    
    const judge = this.findParticipantByRole('judge');
    if (judge) {
      await this.generateAndRecordStatement(
        judge, 
        'We are here for the pre-trial conference in the matter of ' + this.currentCase.title
      );
    }

    await this.handleMotions();
    await this.handleEvidenceDisclosure();
    await this.handleWitnessLists();
    
    this.transitionToPhase('jury-selection');
  }

  private async handleJurySelection(): Promise<void> {
    if (this.currentCase.type === 'criminal' || 
        (this.currentCase.type === 'civil' && this.settings.jurySize > 0)) {
      await this.announcePhase('Jury Selection');
      
      const juryMembers = this.currentCase.participants.filter(p => p.role === 'jury-member');
      const selectedJurors = juryMembers.slice(0, this.settings.jurySize);
      
      this.aiCallbacks?.setAIProcessing(true, 'Selecting jury members');
      this.aiCallbacks?.setAIProgress(0, selectedJurors.length);
      
      for (let i = 0; i < selectedJurors.length; i++) {
        const juror = selectedJurors[i];
        const agent = this.agents.get(juror.id);
        if (agent) {
          this.aiCallbacks?.setAIProcessing(true, `Evaluating juror ${i + 1}: ${juror.name}`);
          await agent.think('Being selected for jury duty in case: ' + this.currentCase.title);
          this.aiCallbacks?.setAIProgress(i + 1, selectedJurors.length);
          await this.delay(300); // Small delay to show progress
        }
      }
      
      this.aiCallbacks?.setAIProcessing(true, 'Judge finalizing jury selection');
      await this.generateAndRecordStatement(
        this.findParticipantByRole('judge'),
        `The jury has been selected. We have ${this.settings.jurySize} jurors for this case.`
      );
      
      this.aiCallbacks?.setAIProcessing(false);
    }
    
    this.transitionToPhase('opening-statements');
  }

  private async handleOpeningStatements(): Promise<void> {
    await this.announcePhase('Opening Statements');
    
    const prosecutor = this.findParticipantByRole('prosecutor') || 
                      this.findParticipantByRole('plaintiff-attorney');
    if (prosecutor) {
      const agent = this.agents.get(prosecutor.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `${prosecutor.name} preparing opening statement`);
        const thoughts = await agent.think('Preparing opening statement');
        const statement = await agent.generateStatement(
          `Opening statement for the ${this.currentCase.type} case: ${this.currentCase.summary}`
        );
        await this.generateAndRecordStatement(prosecutor, statement);
        this.aiCallbacks?.setAIProcessing(false);
      }
    }
    
    const defense = this.findParticipantByRole('defense-attorney');
    if (defense) {
      const agent = this.agents.get(defense.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `${defense.name} preparing defense opening statement`);
        const thoughts = await agent.think('Preparing defense opening statement');
        const statement = await agent.generateStatement(
          `Defense opening statement for: ${this.currentCase.summary}`
        );
        await this.generateAndRecordStatement(defense, statement);
        this.aiCallbacks?.setAIProcessing(false);
      }
    }
    
    this.transitionToPhase('plaintiff-case');
  }

  private async handlePlaintiffCase(): Promise<void> {
    await this.announcePhase("Plaintiff's Case");
    
    const prosecutor = this.findParticipantByRole('prosecutor') || 
                      this.findParticipantByRole('plaintiff-attorney');
    
    for (const evidence of this.currentCase.evidence.filter(e => e.submittedBy === prosecutor?.id)) {
      await this.presentEvidence(evidence, prosecutor!);
      
      if (this.settings.enableObjections) {
        await this.checkForObjections(evidence.description);
      }
    }
    
    const witnesses = this.currentCase.participants.filter(p => p.role === 'witness');
    for (const witness of witnesses.slice(0, 2)) {
      await this.examineWitness(witness, prosecutor!);
      
      const defense = this.findParticipantByRole('defense-attorney');
      if (defense) {
        await this.crossExamineWitness(witness, defense);
      }
    }
    
    this.transitionToPhase('defense-case');
  }

  private async handleDefenseCase(): Promise<void> {
    await this.announcePhase('Defense Case');
    
    const defense = this.findParticipantByRole('defense-attorney');
    
    if (defense) {
      for (const evidence of this.currentCase.evidence.filter(e => e.submittedBy === defense.id)) {
        await this.presentEvidence(evidence, defense);
        
        if (this.settings.enableObjections) {
          await this.checkForObjections(evidence.description);
        }
      }
      
      const defendant = this.findParticipantByRole('defendant');
      if (defendant && Math.random() > 0.3) {
        await this.examineWitness(defendant, defense);
        
        const prosecutor = this.findParticipantByRole('prosecutor') || 
                         this.findParticipantByRole('plaintiff-attorney');
        if (prosecutor) {
          await this.crossExamineWitness(defendant, prosecutor);
        }
      }
    }
    
    this.transitionToPhase('closing-arguments');
  }

  private async handleClosingArguments(): Promise<void> {
    await this.announcePhase('Closing Arguments');
    
    const prosecutor = this.findParticipantByRole('prosecutor') || 
                      this.findParticipantByRole('plaintiff-attorney');
    if (prosecutor) {
      const agent = this.agents.get(prosecutor.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `${prosecutor.name} preparing closing argument`);
        const statement = await agent.generateStatement(
          'Closing argument summarizing the evidence and why the defendant/respondent should be found liable/guilty'
        );
        await this.generateAndRecordStatement(prosecutor, statement);
        this.aiCallbacks?.setAIProcessing(false);
      }
    }
    
    const defense = this.findParticipantByRole('defense-attorney');
    if (defense) {
      const agent = this.agents.get(defense.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `${defense.name} preparing closing argument`);
        const statement = await agent.generateStatement(
          'Closing argument emphasizing reasonable doubt and why the defendant should be acquitted/found not liable'
        );
        await this.generateAndRecordStatement(defense, statement);
        this.aiCallbacks?.setAIProcessing(false);
      }
    }
    
    if (this.settings.jurySize > 0) {
      this.transitionToPhase('jury-deliberation');
    } else {
      this.transitionToPhase('verdict');
    }
  }

  private async handleJuryDeliberation(): Promise<void> {
    await this.announcePhase('Jury Deliberation');
    
    const juryMembers = this.currentCase.participants.filter(p => p.role === 'jury-member');
    const votes: Map<string, boolean> = new Map();
    
    for (const juror of juryMembers.slice(0, this.settings.jurySize)) {
      const agent = this.agents.get(juror.id);
      if (agent) {
        await agent.think('Deliberating on the evidence presented');
        const evidenceStrength = this.evaluateEvidenceStrength();
        votes.set(juror.id, evidenceStrength > 0.5);
      }
    }
    
    const guiltyVotes = Array.from(votes.values()).filter(v => v).length;
    const verdict = guiltyVotes > this.settings.jurySize / 2;
    
    this.currentCase.rulings.push({
      id: `verdict-${Date.now()}`,
      timestamp: new Date(),
      judge: 'jury',
      type: 'procedural',
      subject: 'verdict',
      decision: verdict ? 'granted' : 'denied',
      reasoning: `Jury voted ${guiltyVotes} to ${this.settings.jurySize - guiltyVotes}`,
    });
    
    this.transitionToPhase('verdict');
  }

  private async handleVerdict(): Promise<void> {
    await this.announcePhase('Verdict');
    
    const judge = this.findParticipantByRole('judge');
    const verdict = this.currentCase.rulings.find(r => r.subject === 'verdict');
    
    if (judge) {
      let statement: string;
      if (verdict?.decision === 'granted') {
        statement = 'The court finds the defendant guilty as charged.';
      } else {
        statement = 'The court finds the defendant not guilty.';
      }
      
      await this.generateAndRecordStatement(judge, statement);
    }
    
    if (verdict?.decision === 'granted' && this.currentCase.type === 'criminal') {
      this.transitionToPhase('sentencing');
    }
  }

  private async handleSentencing(): Promise<void> {
    await this.announcePhase('Sentencing');
    
    const judge = this.findParticipantByRole('judge');
    if (judge) {
      const agent = this.agents.get(judge.id);
      if (agent) {
        const statement = await agent.generateStatement(
          'Pronouncing sentence based on the severity of the crime and applicable sentencing guidelines'
        );
        await this.generateAndRecordStatement(judge, statement);
      }
    }
    
    this.isRunning = false;
  }

  private async presentEvidence(evidence: Evidence, presenter: Participant): Promise<void> {
    await this.generateAndRecordStatement(
      presenter,
      `I would like to present ${evidence.type} evidence: ${evidence.title}`
    );
    
    this.currentCase.transcript.push({
      id: `exhibit-${Date.now()}`,
      timestamp: new Date(),
      speaker: presenter.name,
      role: presenter.role,
      content: `Exhibit ${evidence.exhibit || evidence.id} presented: ${evidence.description}`,
      type: 'exhibit',
      metadata: { evidenceId: evidence.id },
    });
    
    for (const [agentId, agent] of this.agents) {
      await agent.processEvidence(evidence);
    }
  }

  private async examineWitness(witness: Participant, examiner: Participant): Promise<void> {
    const agent = this.agents.get(examiner.id);
    const witnessAgent = this.agents.get(witness.id);
    
    if (agent) {
      const question = await agent.generateStatement(
        `Direct examination question for ${witness.name} about the case facts`
      );
      await this.generateAndRecordStatement(examiner, question);
    }
    
    if (witnessAgent) {
      const answer = await witnessAgent.generateStatement(
        'Answering direct examination question truthfully based on my knowledge'
      );
      await this.generateAndRecordStatement(witness, answer);
    }
  }

  private async crossExamineWitness(witness: Participant, examiner: Participant): Promise<void> {
    const agent = this.agents.get(examiner.id);
    const witnessAgent = this.agents.get(witness.id);
    
    if (agent) {
      const question = await agent.generateStatement(
        `Cross-examination question challenging ${witness.name}\\'s testimony`
      );
      await this.generateAndRecordStatement(examiner, question);
    }
    
    if (witnessAgent) {
      const answer = await witnessAgent.generateStatement(
        'Responding to cross-examination while maintaining credibility'
      );
      await this.generateAndRecordStatement(witness, answer);
    }
  }

  private async checkForObjections(content: string): Promise<void> {
    const attorneys = this.currentCase.participants.filter(
      p => p.role === 'defense-attorney' || p.role === 'prosecutor' || p.role === 'plaintiff-attorney'
    );
    
    for (const attorney of attorneys) {
      const agent = this.agents.get(attorney.id);
      if (agent && Math.random() > 0.7) {
        const objectionTypes: ObjectionType[] = ['relevance', 'hearsay', 'speculation', 'leading-question'];
        const objectionType = objectionTypes[Math.floor(Math.random() * objectionTypes.length)];
        
        const shouldObject = await agent.evaluateObjection(content, objectionType);
        if (shouldObject) {
          await this.handleObjection(attorney, objectionType);
          break;
        }
      }
    }
  }

  private async handleObjection(attorney: Participant, objectionType: ObjectionType): Promise<void> {
    await this.generateAndRecordStatement(
      attorney,
      `Objection, your honor! ${objectionType}.`
    );
    
    const judge = this.findParticipantByRole('judge');
    if (judge) {
      const sustained = Math.random() > 0.5;
      const ruling: Ruling = {
        id: `ruling-${Date.now()}`,
        timestamp: new Date(),
        judge: judge.name,
        type: 'objection',
        subject: objectionType,
        decision: sustained ? 'sustained' : 'overruled',
      };
      
      this.currentCase.rulings.push(ruling);
      
      await this.generateAndRecordStatement(
        judge,
        ruling.decision === 'sustained' ? 'Sustained.' : 'Overruled. You may continue.'
      );
      
      for (const [id, agent] of this.agents) {
        agent.updateEmotionalState(
          `objection_${ruling.decision}`,
          id === attorney.id ? 1 : 0.5
        );
      }
    }
  }

  private async handleMotions(): Promise<void> {
    const attorneys = this.currentCase.participants.filter(
      p => p.role === 'defense-attorney' || p.role === 'prosecutor' || p.role === 'plaintiff-attorney'
    );
    
    for (const attorney of attorneys) {
      if (Math.random() > 0.6) {
        await this.generateAndRecordStatement(
          attorney,
          'Your honor, I would like to file a motion...'
        );
        
        const judge = this.findParticipantByRole('judge');
        if (judge) {
          await this.generateAndRecordStatement(
            judge,
            'Motion noted. We will address this matter.'
          );
        }
      }
    }
  }

  private async handleEvidenceDisclosure(): Promise<void> {
    await this.generateAndRecordStatement(
      this.findParticipantByRole('judge'),
      'Parties will now disclose evidence for discovery.'
    );
    
    for (const evidence of this.currentCase.evidence) {
      if (!evidence.privileged) {
        evidence.chainOfCustody.push('Disclosed in discovery');
      }
    }
  }

  private async handleWitnessLists(): Promise<void> {
    const witnesses = this.currentCase.participants.filter(p => p.role === 'witness');
    if (witnesses.length > 0) {
      await this.generateAndRecordStatement(
        this.findParticipantByRole('court-clerk'),
        `Witness list includes: ${witnesses.map(w => w.name).join(', ')}`
      );
    }
  }

  private async handleSidebar(participants: Participant[]): Promise<void> {
    this.sidebarActive = true;
    
    await this.generateAndRecordStatement(
      this.findParticipantByRole('judge'),
      'Counsel, please approach the bench.'
    );
    
    for (const participant of participants) {
      const agent = this.agents.get(participant.id);
      if (agent) {
        await agent.think('Discussing matter at sidebar');
      }
    }
    
    await this.delay(2000 / this.settings.realtimeSpeed);
    
    this.sidebarActive = false;
    
    await this.generateAndRecordStatement(
      this.findParticipantByRole('judge'),
      'Thank you, counsel. You may return.'
    );
  }

  private findParticipantByRole(role: ParticipantRole): Participant | undefined {
    return this.currentCase.participants.find(p => p.role === role);
  }

  private async generateAndRecordStatement(
    speaker: Participant | undefined, 
    content: string
  ): Promise<void> {
    if (!speaker) return;
    
    this.currentSpeaker = speaker.id;
    
    const entry: TranscriptEntry = {
      id: `transcript-${Date.now()}`,
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
    
    this.currentSpeaker = null;
  }

  private async announcePhase(phaseName: string): Promise<void> {
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

  private transitionToPhase(phase: ProceedingPhase): void {
    this.currentCase.currentPhase = phase;
  }

  private evaluateEvidenceStrength(): number {
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

  private async waitForUserInput(): Promise<void> {
    return new Promise(resolve => {
      const listener = () => {
        resolve();
        document.removeEventListener('keypress', listener);
      };
      document.addEventListener('keypress', listener);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getCurrentSpeaker(): string | null {
    return this.currentSpeaker;
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
}