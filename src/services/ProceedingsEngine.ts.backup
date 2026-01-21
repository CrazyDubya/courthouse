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
  private pendingMotions: Motion[] = [];
  private courtCalendar: CourtCalendar;
  private motionCounter: number = 1;
  private transcriptCounter: number = 0;
  private officeManager: OfficeManager;

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
    this.initializePhaseHandlers();
    this.initializeOfficeManager();
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

  private initializePhaseHandlers(): void {
    this.phaseHandlers.set('case-preparation', this.handleCasePreparation.bind(this));
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

  private async handleCasePreparation(): Promise<void> {
    console.log('🔍 Starting Case Preparation Phase - Attorney Preparation');
    await this.announcePhase('Case Preparation');
    
    const judge = this.findParticipantByRole('judge');
    const attorneys = this.currentCase.participants.filter(
      p => p.role === 'defense-attorney' || p.role === 'prosecutor' || p.role === 'plaintiff-attorney'
    );
    
    if (judge) {
      await this.generateAndRecordStatement(
        judge,
        'This court is now scheduling case preparation. Counsel will have time to review evidence, prepare motions, identify witnesses, and organize their case strategy according to New York State procedures.'
      );
    }

    this.aiCallbacks?.setAIProcessing(true, 'Attorneys reviewing evidence and preparing strategies');

    // Phase 1: Evidence Review and Organization (Parallel Office Work)
    console.log('📋 Phase 1: Evidence Review and Organization - Attorneys going to offices');
    const evidenceReviewWork = attorneys.map(attorney => 
      this.officeManager.sendToOffice(attorney, 'evidence-review', 10000) // 10 second work session
    );
    
    await Promise.all(evidenceReviewWork);
    console.log('📋 Evidence review complete - attorneys returning to courtroom');
    
    // Return all attorneys to courtroom
    for (const attorney of attorneys) {
      await this.officeManager.returnToCourtroom(attorney);
    }

    // Phase 2: Motion Preparation and Research (Parallel Office Work)
    console.log('📚 Phase 2: Motion Preparation and Legal Research - Attorneys working in parallel');
    const motionWork = attorneys.map(attorney => 
      this.officeManager.sendToOffice(attorney, 'motion-drafting', 12000) // 12 second work session
    );
    
    await Promise.all(motionWork);
    
    // Return attorneys to courtroom
    for (const attorney of attorneys) {
      await this.officeManager.returnToCourtroom(attorney);
    }

    // Phase 3: Witness Preparation (Parallel Office Work)
    console.log('👥 Phase 3: Witness Preparation - Attorneys meeting with witnesses');
    const witnessWork = attorneys.map(attorney => 
      this.officeManager.sendToOffice(attorney, 'witness-prep', 15000) // 15 second work session
    );
    
    await Promise.all(witnessWork);
    
    // Return attorneys to courtroom
    for (const attorney of attorneys) {
      await this.officeManager.returnToCourtroom(attorney);
    }

    // Phase 4: Trial Strategy Development (Parallel Office Work)
    console.log('🎯 Phase 4: Trial Strategy Development - Final preparation');
    const strategyWork = attorneys.map(attorney => 
      this.officeManager.sendToOffice(attorney, 'strategy-session', 8000) // 8 second work session
    );
    
    await Promise.all(strategyWork);
    
    // Return attorneys to courtroom - ready for trial
    for (const attorney of attorneys) {
      await this.officeManager.returnToCourtroom(attorney);
    }

    // Judge sets court calendar and deadlines
    if (judge) {
      const calendarDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
      await this.generateAndRecordStatement(
        judge,
        `Case preparation is complete. This court sets the following schedule: Pre-trial motions must be filed by ${calendarDate.toLocaleDateString()}, with opposition papers due 10 days thereafter. Trial is scheduled to commence following resolution of all pre-trial matters.`
      );
    }

    console.log('✅ Case Preparation Phase Complete');
    this.aiCallbacks?.setAIProcessing(false);
    
    // Advance to pre-trial phase
    this.transitionToPhase('pre-trial');
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

    try {
      console.log('Starting pre-trial motions handling');
      await Promise.race([
        this.handleMotions(),
        new Promise<void>((_, reject) => 
          setTimeout(() => reject(new Error('Motions timeout')), 30000)
        )
      ]);
      console.log('Completed pre-trial motions');
    } catch (error) {
      console.error('Skipping motions due to error:', error);
      // Simple fallback - just announce no motions filed
      if (judge) {
        await this.generateAndRecordStatement(judge, 'No pre-trial motions have been filed. We will proceed.');
      }
    }

    await this.handleEvidenceDisclosure();
    await this.handleWitnessLists();
    
    this.transitionToPhase('jury-selection');
  }

  private async handleJurySelection(): Promise<void> {
    if (this.currentCase.type === 'criminal' || 
        (this.currentCase.type === 'civil' && this.settings.jurySize > 0)) {
      console.log('🔍 Starting Jury Selection (Voir Dire)');
      await this.announcePhase('Jury Selection');
      
      const judge = this.findParticipantByRole('judge');
      const prosecutor = this.findParticipantByRole('prosecutor') || 
                        this.findParticipantByRole('plaintiff-attorney');
      const defense = this.findParticipantByRole('defense-attorney');
      
      if (judge) {
        await this.generateAndRecordStatement(
          judge,
          'We will now proceed with jury selection. I will call potential jurors for voir dire examination. Counsel may question the panel and exercise challenges as permitted by law.'
        );
      }

      const juryPool = this.currentCase.participants.filter(p => p.role === 'jury-member');
      const selectedJurors: Participant[] = [];
      let challengesUsed = { prosecution: 0, defense: 0 };
      const maxPeremptoryCharlenges = 3;
      
      this.aiCallbacks?.setAIProcessing(true, 'Conducting voir dire examination');
      
      for (let i = 0; i < Math.min(juryPool.length, this.settings.jurySize + 6) && selectedJurors.length < this.settings.jurySize; i++) {
        const juror = juryPool[i];
        
        this.aiCallbacks?.setAIProcessing(true, `Examining juror ${i + 1}: ${juror.name}`);
        
        if (judge) {
          await this.generateAndRecordStatement(
            judge,
            `Juror number ${i + 1}, please state your name and occupation for the record.`
          );
        }
        
        await this.generateAndRecordStatement(
          juror,
          `My name is ${juror.name}. I work as a ${this.generateJurorOccupation()}.`
        );
        
        // Basic qualification check
        const hasConflict = Math.random() < 0.15;
        if (hasConflict) {
          await this.generateAndRecordStatement(
            juror,
            'Your Honor, I believe I may have a conflict that might affect my ability to be impartial.'
          );
          
          if (judge) {
            await this.generateAndRecordStatement(
              judge,
              'Thank you for your honesty. This juror is excused for cause.'
            );
          }
          continue;
        }
        
        // Attorney questioning (simplified)
        if (prosecutor && Math.random() < 0.5) {
          await this.generateAndRecordStatement(
            prosecutor, 
            this.generateVoirDireQuestion('prosecution', this.currentCase.type)
          );
          
          await this.generateAndRecordStatement(
            juror,
            'I understand the question and can be fair and impartial.'
          );
        }
        
        // Challenge phase
        let challenged = false;
        
        if (prosecutor && challengesUsed.prosecution < maxPeremptoryCharlenges && Math.random() < 0.2) {
          await this.generateAndRecordStatement(
            prosecutor,
            'Your Honor, the People exercise a peremptory challenge to this juror.'
          );
          challengesUsed.prosecution++;
          challenged = true;
        }
        
        if (!challenged && defense && challengesUsed.defense < maxPeremptoryCharlenges && Math.random() < 0.2) {
          await this.generateAndRecordStatement(
            defense,
            'Your Honor, the defense exercises a peremptory challenge to this juror.'
          );
          challengesUsed.defense++;
          challenged = true;
        }
        
        if (challenged) {
          if (judge) {
            await this.generateAndRecordStatement(judge, 'Juror is excused.');
          }
        } else {
          selectedJurors.push(juror);
          if (judge) {
            await this.generateAndRecordStatement(
              judge,
              `Juror ${juror.name} is accepted and will serve on this jury.`
            );
          }
        }
        
        await this.delay(200 / this.settings.realtimeSpeed);
      }
      
      // Jury oath
      if (judge && selectedJurors.length > 0) {
        await this.generateAndRecordStatement(
          judge,
          `Ladies and gentlemen, please raise your right hand to take the jury oath. Do you solemnly swear that you will well and truly try the matter in issue and render a true verdict according to the evidence and the law?`
        );
        
        if (selectedJurors.length > 0) {
          await this.generateAndRecordStatement(selectedJurors[0], 'We do.');
        }
        
        await this.generateAndRecordStatement(
          judge,
          `You are now sworn as jurors. Please take your seats in the jury box.`
        );
      }
      
      console.log(`✅ Jury selection complete: ${selectedJurors.length} jurors selected`);
      this.aiCallbacks?.setAIProcessing(false);
    } else {
      console.log('Case type does not require jury selection');
      
      const judge = this.findParticipantByRole('judge');
      if (judge) {
        await this.generateAndRecordStatement(
          judge,
          'This matter will be tried as a bench trial. The Court will serve as both judge and jury in determining the facts and applying the law.'
        );
      }
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
        await agent.think('Preparing opening statement');
        
        let prompt: string;
        if (this.currentCase.type === 'criminal') {
          prompt = `Opening statement for criminal prosecution. Explain how the evidence will prove beyond a reasonable doubt that defendant committed the charged crimes: ${this.currentCase.summary}. Remind jury of the high burden of proof and that defendant is presumed innocent.`;
        } else {
          prompt = `Opening statement for civil plaintiff. Explain how the evidence will prove by a preponderance of evidence that defendant is liable for damages: ${this.currentCase.summary}. Outline the damages sought and legal theories.`;
        }
        
        const statement = await agent.generateStatement(prompt);
        await this.generateAndRecordStatement(prosecutor, statement);
        this.aiCallbacks?.setAIProcessing(false);
      }
    }
    
    const defense = this.findParticipantByRole('defense-attorney');
    if (defense) {
      const agent = this.agents.get(defense.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `${defense.name} preparing defense opening statement`);
        await agent.think('Preparing defense opening statement');
        
        let prompt: string;
        if (this.currentCase.type === 'criminal') {
          prompt = `Defense opening statement for criminal case. Emphasize presumption of innocence, burden of proof beyond reasonable doubt, and holes in prosecution's case: ${this.currentCase.summary}. Remind jury they must acquit if any reasonable doubt exists.`;
        } else {
          prompt = `Defense opening statement for civil case. Challenge plaintiff's evidence and damages claims: ${this.currentCase.summary}. Explain why defendant should not be held liable or why damages are excessive.`;
        }
        
        const statement = await agent.generateStatement(prompt);
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
        
        let prompt: string;
        if (this.currentCase.type === 'criminal') {
          prompt = `Criminal prosecution closing argument. Summarize how the evidence proves guilt beyond a reasonable doubt. Address each element of the crimes charged. Emphasize the strength and credibility of the evidence presented.`;
        } else {
          prompt = `Civil plaintiff closing argument. Summarize how the evidence proves liability by a preponderance of the evidence. Quantify damages and explain why defendant should be held responsible for plaintiff's losses.`;
        }
        
        const statement = await agent.generateStatement(prompt);
        await this.generateAndRecordStatement(prosecutor, statement);
        this.aiCallbacks?.setAIProcessing(false);
      }
    }
    
    const defense = this.findParticipantByRole('defense-attorney');
    if (defense) {
      const agent = this.agents.get(defense.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `${defense.name} preparing closing argument`);
        
        let prompt: string;
        if (this.currentCase.type === 'criminal') {
          prompt = `Criminal defense closing argument. Emphasize reasonable doubt, presumption of innocence, and weaknesses in prosecution's case. Argue that the evidence does not prove guilt beyond a reasonable doubt and jury must acquit.`;
        } else {
          prompt = `Civil defense closing argument. Challenge plaintiff's evidence and damage calculations. Argue that defendant is not liable or that damages are excessive/not proven by preponderance of evidence.`;
        }
        
        const statement = await agent.generateStatement(prompt);
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
    
    // Determine burden of proof threshold based on case type
    let threshold = 0.5; // Default civil standard (preponderance)
    let standardDescription = 'preponderance of the evidence';
    
    if (this.currentCase.type === 'criminal') {
      threshold = 0.85; // Higher threshold for "beyond reasonable doubt"
      standardDescription = 'beyond a reasonable doubt';
    }
    
    this.aiCallbacks?.setAIProcessing(true, 'Jury deliberating');
    this.aiCallbacks?.setAIProgress(0, juryMembers.length);
    
    for (let i = 0; i < juryMembers.slice(0, this.settings.jurySize).length; i++) {
      const juror = juryMembers[i];
      const agent = this.agents.get(juror.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `Juror ${i + 1} deliberating on evidence`);
        
        // Each juror considers the evidence against the burden of proof
        await agent.think(`Deliberating on evidence presented. Must decide if ${this.currentCase.type === 'criminal' ? 'prosecution' : 'plaintiff'} has proven their case ${standardDescription}.`);
        
        const evidenceStrength = this.evaluateEvidenceStrength();
        const personalBias = (juror.personality.analyticalThinking + juror.personality.conscientiousness) / 20;
        const adjustedStrength = evidenceStrength + personalBias - 0.05; // Slight random factor
        
        votes.set(juror.id, adjustedStrength > threshold);
        this.aiCallbacks?.setAIProgress(i + 1, this.settings.jurySize);
        
        await this.delay(500 / this.settings.realtimeSpeed); // Deliberation time
      }
    }
    
    const favorableVotes = Array.from(votes.values()).filter(v => v).length;
    const unfavorableVotes = this.settings.jurySize - favorableVotes;
    
    // Determine verdict based on case type requirements
    let verdict: boolean;
    let reasoning: string;
    
    if (this.currentCase.type === 'criminal') {
      // Criminal cases typically require unanimity for conviction
      verdict = favorableVotes === this.settings.jurySize;
      reasoning = `Jury voted ${favorableVotes} guilty, ${unfavorableVotes} not guilty. ${verdict ? 'Unanimous guilty verdict' : 'Not guilty verdict (unanimity required)'}`;
    } else {
      // Civil cases typically require simple majority
      verdict = favorableVotes > this.settings.jurySize / 2;
      reasoning = `Jury voted ${favorableVotes} for plaintiff, ${unfavorableVotes} for defendant. ${verdict ? 'Majority for plaintiff' : 'Majority for defendant'}`;
    }
    
    this.currentCase.rulings.push({
      id: `verdict-${this.transcriptCounter++}`,
      timestamp: new Date(),
      judge: 'jury',
      type: 'procedural',
      subject: 'verdict',
      decision: verdict ? 'granted' : 'denied',
      reasoning: reasoning,
    });
    
    this.aiCallbacks?.setAIProcessing(false);
    this.transitionToPhase('verdict');
  }

  private async handleVerdict(): Promise<void> {
    await this.announcePhase('Verdict');
    
    const judge = this.findParticipantByRole('judge');
    const verdict = this.currentCase.rulings.find(r => r.subject === 'verdict');
    
    if (judge) {
      let statement: string;
      
      if (this.currentCase.type === 'criminal') {
        // Criminal verdict
        if (verdict?.decision === 'granted') {
          statement = 'The court finds the defendant guilty beyond a reasonable doubt on the charges presented.';
        } else {
          statement = 'The court finds the defendant not guilty. The prosecution has not proven guilt beyond a reasonable doubt.';
        }
      } else if (this.currentCase.type === 'civil') {
        // Civil verdict/judgment
        if (verdict?.decision === 'granted') {
          statement = 'The court finds in favor of the plaintiff by a preponderance of the evidence and awards damages as appropriate.';
        } else {
          statement = 'The court finds in favor of the defendant. The plaintiff has not proven their case by a preponderance of the evidence.';
        }
      } else {
        // Generic verdict
        statement = verdict?.decision === 'granted' ? 
          'The court finds in favor of the moving party.' : 
          'The court finds against the moving party.';
      }
      
      await this.generateAndRecordStatement(judge, statement);
    }
    
    // Only criminal cases proceed to sentencing phase
    if (verdict?.decision === 'granted' && this.currentCase.type === 'criminal') {
      this.transitionToPhase('sentencing');
    } else {
      // Civil cases and not-guilty criminal cases end here
      this.isRunning = false;
    }
  }

  private async handleSentencing(): Promise<void> {
    await this.announcePhase('Sentencing/Penalty Phase');
    
    const judge = this.findParticipantByRole('judge');
    if (!judge) {
      this.isRunning = false;
      return;
    }

    // Only criminal cases have sentencing phase
    if (this.currentCase.type !== 'criminal') {
      this.isRunning = false;
      return;
    }

    await this.generateAndRecordStatement(
      judge,
      'The court will now proceed to the penalty phase to determine appropriate sentencing.'
    );

    // Victim impact statements
    await this.handleVictimImpactStatements(judge);

    // Prosecution sentencing recommendations
    await this.handleProsecutionSentencingArgument(judge);

    // Defense mitigation evidence and argument
    await this.handleDefenseMitigationArgument(judge);

    // Judge considers sentencing factors
    await this.handleJudgeSentencingDeliberation(judge);

    // Final sentencing pronouncement
    await this.pronounceSentence(judge);
    
    this.isRunning = false;
  }

  private async handleVictimImpactStatements(judge: Participant): Promise<void> {
    // Check if victim impact statements should be presented
    const convictionRuling = this.currentCase.rulings.find(r => r.subject === 'verdict' && r.decision === 'granted');
    if (!convictionRuling) return;

    await this.generateAndRecordStatement(
      judge,
      'The court will now hear victim impact statements to understand the full impact of the defendant\'s actions.'
    );

    // Simulate victim or victim representative statement
    const victimStatement = 'The victim\'s family describes the profound impact of the crime on their lives, including emotional trauma, financial hardship, and ongoing fear for their safety.';
    
    this.currentCase.transcript.push({
      id: `victim-impact-${this.transcriptCounter++}`,
      timestamp: new Date(),
      speaker: 'Victim Representative',
      role: 'witness',
      content: victimStatement,
      type: 'statement',
      metadata: { phase: 'victim-impact' }
    });

    await this.generateAndRecordStatement(
      judge,
      'The court acknowledges the impact on the victim and will consider this in sentencing.'
    );
  }

  private async handleProsecutionSentencingArgument(judge: Participant): Promise<void> {
    const prosecutor = this.findParticipantByRole('prosecutor');
    if (!prosecutor) return;

    await this.generateAndRecordStatement(
      judge,
      'The prosecution may now present their sentencing recommendation.'
    );

    const agent = this.agents.get(prosecutor.id);
    if (agent) {
      this.aiCallbacks?.setAIProcessing(true, 'Prosecution preparing sentencing argument');
      
      const argument = await agent.generateStatement(
        'Present sentencing argument emphasizing aggravating factors: severity of crime, impact on victim, defendant\'s criminal history, need for deterrence and public safety. Recommend appropriate sentence within guidelines.'
      );
      
      await this.generateAndRecordStatement(prosecutor, argument);
      this.aiCallbacks?.setAIProcessing(false);
    }
  }

  private async handleDefenseMitigationArgument(judge: Participant): Promise<void> {
    const defense = this.findParticipantByRole('defense-attorney');
    if (!defense) return;

    await this.generateAndRecordStatement(
      judge,
      'The defense may now present mitigating factors for the court\'s consideration.'
    );

    const agent = this.agents.get(defense.id);
    if (agent) {
      this.aiCallbacks?.setAIProcessing(true, 'Defense preparing mitigation argument');
      
      const argument = await agent.generateStatement(
        'Present mitigation argument emphasizing: defendant\'s personal background, lack of prior criminal history, expression of remorse, family circumstances, potential for rehabilitation. Request lenient sentence or alternative to incarceration.'
      );
      
      await this.generateAndRecordStatement(defense, argument);
      this.aiCallbacks?.setAIProcessing(false);
    }
  }

  private async handleJudgeSentencingDeliberation(judge: Participant): Promise<void> {
    this.aiCallbacks?.setAIProcessing(true, 'Judge considering sentencing factors');
    
    await this.generateAndRecordStatement(
      judge,
      'The court will now consider all factors in determining an appropriate sentence, including the nature of the crime, impact on victims, defendant\'s background, and the goals of sentencing.'
    );

    // Judge deliberates (simulate thinking time)
    const agent = this.agents.get(judge.id);
    if (agent) {
      await agent.think('Weighing aggravating and mitigating factors to determine appropriate sentence within legal guidelines');
    }

    await this.delay(2000 / this.settings.realtimeSpeed); // Deliberation time
    this.aiCallbacks?.setAIProcessing(false);
  }

  private async pronounceSentence(judge: Participant): Promise<void> {
    const agent = this.agents.get(judge.id);
    if (!agent) return;

    this.aiCallbacks?.setAIProcessing(true, 'Judge pronouncing sentence');

    await this.generateAndRecordStatement(
      judge,
      'The defendant will please rise for sentencing.'
    );

    // Generate comprehensive sentence based on case type and severity
    const sentence = await this.generateCriminalSentence(judge);
    
    await this.generateAndRecordStatement(judge, sentence);

    // Add sentencing ruling to case
    this.currentCase.rulings.push({
      id: `sentence-${this.transcriptCounter++}`,
      timestamp: new Date(),
      judge: judge.name,
      type: 'procedural',
      subject: 'sentencing',
      decision: 'granted',
      reasoning: 'Sentence imposed based on statutory guidelines and case factors'
    });

    this.aiCallbacks?.setAIProcessing(false);
  }

  private async generateCriminalSentence(judge: Participant): Promise<string> {
    // Analyze the charges to determine appropriate sentence
    const charges = this.currentCase.charges || ['theft over $1000'];
    const firstCharge = charges[0];
    
    // Determine sentence based on charge severity and judge personality
    const enhancedJudge = (judge as any).enhancedProfile;
    let baseSentence = this.getBaseSentenceForCharge(firstCharge);
    
    if (enhancedJudge) {
      // Adjust sentence based on judge's personality
      if (enhancedJudge.attributes.strictness > 7) {
        baseSentence = this.increaseSentenceSeverity(baseSentence);
      }
      if (enhancedJudge.attributes.empathy > 7 && enhancedJudge.attributes.fairness > 6) {
        baseSentence = this.considerMitigatingFactors(baseSentence);
      }
    }
    
    return this.formatSentenceStatement(baseSentence, firstCharge);
  }

  private getBaseSentenceForCharge(charge: string): any {
    // Simplified sentencing based on charge type
    if (charge.toLowerCase().includes('murder') || charge.toLowerCase().includes('homicide')) {
      return { prison: '25 years to life', fine: 0, probation: 0, restitution: 50000 };
    } else if (charge.toLowerCase().includes('assault') && charge.toLowerCase().includes('aggravated')) {
      return { prison: '4 years', fine: 5000, probation: 0, restitution: 25000 };
    } else if (charge.toLowerCase().includes('theft') && charge.toLowerCase().includes('grand')) {
      return { prison: '0', fine: 2000, probation: '3 years', restitution: 10000 };
    } else if (charge.toLowerCase().includes('dui')) {
      return { prison: '0', fine: 1000, probation: '2 years', restitution: 0, communityService: 80 };
    } else if (charge.toLowerCase().includes('drug') && charge.toLowerCase().includes('possession')) {
      return { prison: '0', fine: 500, probation: '18 months', restitution: 0, treatment: true };
    } else {
      // Default sentence for misdemeanors
      return { prison: '0', fine: 1000, probation: '1 year', restitution: 5000 };
    }
  }

  private increaseSentenceSeverity(sentence: any): any {
    // Strict judges impose harsher sentences
    if (sentence.prison && sentence.prison !== '0') {
      // Increase prison time by 25%
      const years = parseInt(sentence.prison);
      if (!isNaN(years)) {
        sentence.prison = `${Math.ceil(years * 1.25)} years`;
      }
    }
    if (sentence.fine) {
      sentence.fine = Math.ceil(sentence.fine * 1.5);
    }
    return sentence;
  }

  private considerMitigatingFactors(sentence: any): any {
    // Empathetic and fair judges may reduce sentences
    if (sentence.prison && sentence.prison !== '0') {
      const years = parseInt(sentence.prison);
      if (!isNaN(years)) {
        sentence.prison = `${Math.max(1, Math.floor(years * 0.8))} years`;
      }
    }
    if (sentence.fine) {
      sentence.fine = Math.floor(sentence.fine * 0.8);
    }
    return sentence;
  }

  private formatSentenceStatement(sentence: any, charge: string): string {
    const parts: string[] = [];
    
    parts.push(`Having been found guilty of ${charge}, and after considering all factors in aggravation and mitigation,`);
    
    if (sentence.prison && sentence.prison !== '0') {
      parts.push(`the defendant is sentenced to ${sentence.prison} in state prison`);
    } else {
      parts.push('the defendant is sentenced to probation');
    }
    
    if (sentence.probation && sentence.probation !== '0') {
      parts.push(`with ${sentence.probation} formal probation`);
    }
    
    if (sentence.fine && sentence.fine > 0) {
      parts.push(`a fine of $${sentence.fine.toLocaleString()}`);
    }
    
    if (sentence.restitution && sentence.restitution > 0) {
      parts.push(`restitution to the victim in the amount of $${sentence.restitution.toLocaleString()}`);
    }
    
    if (sentence.communityService && sentence.communityService > 0) {
      parts.push(`${sentence.communityService} hours of community service`);
    }
    
    if (sentence.treatment) {
      parts.push('completion of court-approved substance abuse treatment program');
    }
    
    parts.push('The defendant has the right to appeal this sentence within 30 days.');
    
    return parts.join(', ') + '.';
  }

  private async presentEvidence(evidence: Evidence, presenter: Participant): Promise<void> {
    await this.generateAndRecordStatement(
      presenter,
      `I would like to present ${evidence.type} evidence: ${evidence.title}`
    );
    
    this.currentCase.transcript.push({
      id: `exhibit-${this.transcriptCounter++}`,
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
    // Check if witness has detailed witness knowledge (from WitnessFactory)
    const detailedWitness = (witness as any).knowledge?.directObservations;
    
    const agent = this.agents.get(examiner.id);
    const witnessAgent = this.agents.get(witness.id);
    
    if (agent && witnessAgent) {
      // Generate 3-4 realistic Q&A exchanges instead of just one
      const examExchanges = Math.min(4, Math.max(2, Math.floor(Math.random() * 3) + 2));
      
      for (let i = 0; i < examExchanges; i++) {
        // Generate specific questions based on witness type and role
        let questionPrompt = this.generateDirectExamPrompt(witness, examiner, i);
        
        try {
          const question = await Promise.race([
            agent.generateStatement(questionPrompt),
            new Promise<string>((resolve) => 
              setTimeout(() => resolve(this.getFallbackQuestion(witness, examiner, i)), 10000)
            )
          ]);
          
          await this.generateAndRecordStatement(examiner, question);
          
          // Generate realistic witness answer
          let answerPrompt = this.generateWitnessAnswerPrompt(witness, examiner, question, i);
          
          const answer = await Promise.race([
            witnessAgent.generateStatement(answerPrompt),
            new Promise<string>((resolve) => 
              setTimeout(() => resolve(this.getFallbackAnswer(witness, i)), 10000)
            )
          ]);
          
          await this.generateAndRecordStatement(witness, answer);
          
          // Small delay between Q&A exchanges
          await this.delay(800 / this.settings.realtimeSpeed);
          
        } catch (error) {
          console.error('Error in witness examination:', error);
          // Use fallback Q&A
          await this.generateAndRecordStatement(examiner, this.getFallbackQuestion(witness, examiner, i));
          await this.generateAndRecordStatement(witness, this.getFallbackAnswer(witness, i));
        }
      }
    }
  }

  private async crossExamineWitness(witness: Participant, examiner: Participant): Promise<void> {
    // Check if witness has detailed witness knowledge (from WitnessFactory)
    const detailedWitness = (witness as any).knowledge?.directObservations;
    
    const agent = this.agents.get(examiner.id);
    const witnessAgent = this.agents.get(witness.id);
    
    if (agent && witnessAgent) {
      // Generate 2-3 realistic cross-examination Q&A exchanges
      const crossExchanges = Math.min(3, Math.max(2, Math.floor(Math.random() * 2) + 2));
      
      for (let i = 0; i < crossExchanges; i++) {
        // Generate challenging cross-examination questions
        let questionPrompt = this.generateCrossExamPrompt(witness, examiner, i);
        
        try {
          const question = await Promise.race([
            agent.generateStatement(questionPrompt),
            new Promise<string>((resolve) => 
              setTimeout(() => resolve(this.getFallbackCrossQuestion(witness, examiner, i)), 10000)
            )
          ]);
          
          await this.generateAndRecordStatement(examiner, question);
          
          // Generate defensive witness answer for cross-examination
          let answerPrompt = this.generateCrossAnswerPrompt(witness, examiner, question, i);
          
          const answer = await Promise.race([
            witnessAgent.generateStatement(answerPrompt),
            new Promise<string>((resolve) => 
              setTimeout(() => resolve(this.getFallbackCrossAnswer(witness, i)), 10000)
            )
          ]);
          
          await this.generateAndRecordStatement(witness, answer);
          
          // Small delay between Q&A exchanges
          await this.delay(800 / this.settings.realtimeSpeed);
          
        } catch (error) {
          console.error('Error in cross-examination:', error);
          // Use fallback Q&A
          await this.generateAndRecordStatement(examiner, this.getFallbackCrossQuestion(witness, examiner, i));
          await this.generateAndRecordStatement(witness, this.getFallbackCrossAnswer(witness, i));
        }
      }
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
        id: `ruling-${this.transcriptCounter++}`,
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
    console.log('Starting handleMotions');
    this.aiCallbacks?.setAIProcessing(true, 'Processing pre-trial motions');
    
    const attorneys = this.currentCase.participants.filter(
      p => p.role === 'defense-attorney' || p.role === 'prosecutor' || p.role === 'plaintiff-attorney'
    );
    
    const judge = this.findParticipantByRole('judge');
    if (!judge) return;

    await this.generateAndRecordStatement(
      judge,
      'We will now address any pre-trial motions. Counsel, please present your motions.'
    );

    // Determine likely motions based on case type and circumstances
    const likelyMotions = this.determineLikelyMotions();
    
    let motionsFiled = 0;
    const maxMotions = Math.min(3, likelyMotions.length); // Limit to 3 motions for simulation

    for (const attorney of attorneys) {
      if (motionsFiled >= maxMotions) break;
      
      // Each attorney has a chance to file motions based on their role and case circumstances
      const shouldFileMotion = this.shouldAttorneyFileMotion(attorney);
      
      if (shouldFileMotion && likelyMotions.length > 0) {
        const motionTemplate = this.selectMotionForAttorney(attorney, likelyMotions);
        if (motionTemplate) {
          await this.fileMotion(attorney, motionTemplate, judge);
          motionsFiled++;
          
          // Small delay between motions
          await this.delay(1000 / this.settings.realtimeSpeed);
        }
      }
    }

    if (this.pendingMotions.length === 0) {
      await this.generateAndRecordStatement(
        judge,
        'No pre-trial motions have been filed. We will proceed with the case.'
      );
    } else {
      await this.generateAndRecordStatement(
        judge,
        `The court has received ${this.pendingMotions.length} motion(s). We will address each in turn.`
      );
      
      // Process each motion
      for (const motion of this.pendingMotions) {
        await this.processMotion(motion, judge);
      }
    }
    
    this.aiCallbacks?.setAIProcessing(false);
  }

  private determineLikelyMotions(): MotionTemplate[] {
    const applicableMotions = MOTION_TEMPLATES.filter(template => 
      template.applicableCaseTypes.includes(this.currentCase.type)
    );

    // Sort by likelihood of being filed in this case type
    return applicableMotions.sort((a, b) => b.likelihood_of_success - a.likelihood_of_success);
  }

  private shouldAttorneyFileMotion(attorney: Participant): boolean {
    // Defense attorneys more likely to file motions
    if (attorney.role === 'defense-attorney') {
      return Math.random() > 0.3; // 70% chance
    }
    // Prosecutors file fewer motions but still some
    if (attorney.role === 'prosecutor') {
      return Math.random() > 0.6; // 40% chance  
    }
    // Civil plaintiff attorneys
    if (attorney.role === 'plaintiff-attorney') {
      return Math.random() > 0.5; // 50% chance
    }
    return false;
  }

  private selectMotionForAttorney(attorney: Participant, availableMotions: MotionTemplate[]): MotionTemplate | null {
    // Filter motions appropriate for this attorney's role
    let appropriateMotions = availableMotions;

    if (attorney.role === 'defense-attorney') {
      // Defense typically files suppression, dismissal, discovery motions
      appropriateMotions = availableMotions.filter(m => 
        m.type.includes('suppress') || 
        m.type.includes('dismiss') || 
        m.type.includes('discovery') ||
        m.type.includes('continuance') ||
        m.type.includes('venue')
      );
    } else if (attorney.role === 'prosecutor') {
      // Prosecution typically files discovery, in limine, compel motions
      appropriateMotions = availableMotions.filter(m => 
        m.type.includes('discovery') || 
        m.type.includes('limine') ||
        m.type.includes('compel') ||
        m.type.includes('exclude')
      );
    }

    if (appropriateMotions.length === 0) {
      appropriateMotions = availableMotions;
    }

    // Select motion with some randomness but preference for higher success rate
    const weightedChoice = appropriateMotions[Math.floor(Math.random() * appropriateMotions.length)];
    return weightedChoice;
  }

  private async fileMotion(attorney: Participant, template: MotionTemplate, judge: Participant): Promise<void> {
    const motion: Motion = {
      id: `motion-${this.motionCounter++}`,
      type: template.type,
      title: template.title,
      filedBy: attorney.id,
      filingDate: new Date(),
      status: 'pending',
      legalStandard: template.legalStandard,
      grounds: template.common_grounds.slice(0, 2), // Take first 2 grounds
      factualBasis: this.generateFactualBasis(template),
      legalCitations: template.required_citations.slice(0, 3),
      hearingRequired: template.hearing_required,
      argument: template.sample_argument,
      relief_requested: template.sample_relief,
      supporting_evidence: [],
      responses: [],
      assignedJudge: judge.id,
      caseType: this.currentCase.type,
      urgent: false,
      dispositive: template.type.includes('dismiss') || template.type.includes('summary-judgment'),
      pageCount: Math.floor(Math.random() * 10) + 5,
      attachments: [],
      served_parties: this.getOpposingParties(attorney.id),
      certificate_of_service: true
    };

    this.pendingMotions.push(motion);

    // Add to court calendar
    this.courtCalendar.scheduleMotionHearing(
      motion, 
      judge.id, 
      attorney.id, 
      this.getOpposingParties(attorney.id)[0] || 'opposing-counsel'
    );

    await this.generateAndRecordStatement(
      attorney,
      `Your honor, I am filing a ${template.title}. ${template.description}`
    );

    // Use template-based motion argument instead of LLM generation
    const contextualizedArgument = this.contextualizeMotionArgument(template, motion);
    const motionArgument = this.generateMotionArgument(attorney, template, contextualizedArgument);
    await this.generateAndRecordStatement(attorney, motionArgument);
  }

  private generateMotionArgument(attorney: Participant, template: MotionTemplate, contextualizedArgument: string): string {
    const roleBasedArguments: Record<string, string> = {
      'defense-attorney': template.sample_argument || 
        `Your Honor, this motion should be granted because the prosecution has failed to meet the required legal standards. ${contextualizedArgument}`,
      'prosecutor': template.sample_argument || 
        `Your Honor, the People request that this motion be denied as it lacks merit. ${contextualizedArgument}`,
      'plaintiff-attorney': template.sample_argument || 
        `Your Honor, the facts and law support granting this motion in favor of the plaintiff. ${contextualizedArgument}`
    };

    return roleBasedArguments[attorney.role] || template.sample_argument || 
      `Your Honor, based on the facts and applicable law, this motion should be granted. ${contextualizedArgument}`;
  }

  private async processMotion(motion: Motion, judge: Participant): Promise<void> {
    this.aiCallbacks?.setAIProcessing(true, `Judge considering ${motion.title}`);

    await this.generateAndRecordStatement(
      judge,
      `The court will now address the ${motion.title} filed by ${this.findParticipantById(motion.filedBy)?.name}.`
    );

    // Opposing counsel response (simplified, no LLM dependency)
    const opposingParties = this.getOpposingParties(motion.filedBy);
    if (opposingParties.length > 0) {
      const opposingCounsel = this.findParticipantById(opposingParties[0]);
      if (opposingCounsel) {
        const oppositionResponse = this.generateOppositionResponse(motion, opposingCounsel);
        await this.generateAndRecordStatement(opposingCounsel, oppositionResponse);
      }
    }

    // Generate judge ruling (simplified, no LLM dependency)
    const ruling = this.generateFallbackRuling(motion);
    motion.ruling = ruling;
    motion.status = ruling.decision;

    // Generate judicial ruling statement
    const detailedRuling = this.generateSimpleJudicialRuling(motion, ruling, judge);
    await this.generateAndRecordStatement(judge, detailedRuling);

    // Record the ruling in case rulings
    this.currentCase.rulings.push({
      id: ruling.id,
      timestamp: ruling.rulingDate,
      judge: judge.name,
      type: 'motion',
      subject: motion.type,
      decision: ruling.decision,
      reasoning: ruling.legal_reasoning
    });

    this.aiCallbacks?.setAIProcessing(false);
  }

  private generateOppositionResponse(motion: Motion, opposingCounsel: Participant): string {
    const oppositionStatements: Record<string, string> = {
      'prosecutor': `Your Honor, the People oppose this motion. The defense has failed to establish any legal basis for the relief requested. The motion should be denied.`,
      'defense-attorney': `Your Honor, the defense respectfully opposes this motion. The prosecution's arguments lack merit and the motion should be denied in the interests of justice.`,
      'plaintiff-attorney': `Your Honor, plaintiff opposes this motion. Defendant has not met their burden of proof and the motion lacks legal foundation.`
    };

    return oppositionStatements[opposingCounsel.role] || 
      `Your Honor, we respectfully oppose this motion. The moving party has failed to meet the required legal standard.`;
  }

  private generateSimpleJudicialRuling(motion: Motion, ruling: MotionRuling, judge: Participant): string {
    const rulingStatements = {
      'granted': [
        `After careful consideration of the motion and opposition, the court finds that the moving party has met their burden. The ${motion.title} is GRANTED.`,
        `The court has reviewed the arguments and applicable law. The motion is well-taken and is hereby GRANTED.`,
        `Based on the record before the court, the ${motion.title} is GRANTED for the reasons stated in the moving papers.`
      ],
      'denied': [
        `After reviewing the motion and opposition, the court finds that the moving party has not established grounds for relief. The ${motion.title} is DENIED.`,
        `The court has considered the arguments but finds them insufficient. The motion is DENIED.`,
        `The moving party has failed to meet the applicable legal standard. The ${motion.title} is DENIED.`
      ]
    };

    const statements = rulingStatements[ruling.decision] || rulingStatements['denied'];
    return statements[Math.floor(Math.random() * statements.length)];
  }

  private generateFallbackRuling(motion: Motion): MotionRuling {
    // Simple fallback logic when AI fails
    const decision: MotionStatus = Math.random() > 0.6 ? 'granted' : 'denied';
    
    return {
      id: `ruling-${this.transcriptCounter++}`,
      motionId: motion.id,
      decision,
      legal_reasoning: `The court has reviewed the motion and finds that it should be ${decision} based on the legal standards and evidence presented.`,
      precedent_cases: [],
      rulingDate: new Date(),
      effectiveDate: new Date()
    };
  }

  private async generateJudgeRuling(motion: Motion, judge: Participant): Promise<MotionRuling> {
    const enhancedJudge = (judge as any).enhancedProfile as EnhancedJudgeProfile | undefined;
    
    let decision: MotionStatus;
    let reasoning: string;

    if (enhancedJudge) {
      // Use enhanced judge personality and memory to make decision
      const template = MOTION_TEMPLATES.find(t => t.type === motion.type);
      const baseSuccessRate = template?.likelihood_of_success || 0.5;
      
      // Adjust success rate based on judge's personality and experience
      let adjustedRate = baseSuccessRate;
      
      // Analytical judges are more likely to grant well-reasoned motions
      if (enhancedJudge.attributes.analyticalSkill > 7) {
        adjustedRate += 0.1;
      }
      
      // Strict judges are less likely to grant defense motions
      if (enhancedJudge.attributes.strictness > 7 && motion.type.includes('dismiss')) {
        adjustedRate -= 0.15;
      }
      
      // Fair judges consider all arguments equally
      if (enhancedJudge.attributes.fairness > 8) {
        adjustedRate += 0.05;
      }

      // Experience matters for complex motions
      if (enhancedJudge.memory.experience.yearsOnBench > 10 && motion.type.includes('suppress')) {
        adjustedRate += 0.1;
      }

      decision = Math.random() < adjustedRate ? 'granted' : 'denied';
      
      reasoning = this.generateReasoningBasedOnPersonality(motion, enhancedJudge, decision);
    } else {
      // Fallback to basic decision making
      const template = MOTION_TEMPLATES.find(t => t.type === motion.type);
      decision = Math.random() < (template?.likelihood_of_success || 0.5) ? 'granted' : 'denied';
      reasoning = `The court finds that the motion ${decision === 'granted' ? 'meets' : 'does not meet'} the required legal standard.`;
    }

    return {
      id: `ruling-${this.transcriptCounter++}`,
      judge: judge.id,
      rulingDate: new Date(),
      decision,
      legal_reasoning: reasoning,
      factual_findings: [`Motion filed by ${this.findParticipantById(motion.filedBy)?.name}`],
      legal_conclusions: [decision === 'granted' ? 'Motion has merit' : 'Motion lacks sufficient basis'],
      appealable: motion.dispositive,
      interlocutory: !motion.dispositive,
      case_dispositive: motion.dispositive && decision === 'granted'
    };
  }

  private generateReasoningBasedOnPersonality(
    motion: Motion, 
    judge: EnhancedJudgeProfile, 
    decision: MotionStatus
  ): string {
    const reasons = [];
    
    if (judge.attributes.analyticalSkill > 7) {
      reasons.push("After careful analysis of the legal arguments");
    }
    
    if (judge.attributes.fairness > 7) {
      reasons.push("considering the interests of all parties");
    }
    
    if (judge.memory.experience.yearsOnBench > 10) {
      reasons.push("drawing upon substantial judicial experience");
    }
    
    const personalityFactor = judge.quirks.includes('cites_precedent_frequently') 
      ? "and relevant case law" 
      : "and applicable legal standards";
    
    return `${reasons.join(', ')} ${personalityFactor}, the court ${decision} this motion. The legal standard has ${decision === 'granted' ? 'been satisfied' : 'not been met'} based on the evidence and arguments presented.`;
  }

  private async generateDetailedJudicialRuling(motion: Motion, ruling: MotionRuling, judge: Participant): Promise<string> {
    const agent = this.agents.get(judge.id);
    
    if (agent) {
      try {
        const rulingPrompt = `As Judge ${judge.name}, provide a detailed ruling on the ${motion.title} in ${this.currentCase.title}. 
        
        Motion grounds: ${motion.grounds.join('; ')}
        Legal standard: ${motion.legalStandard}
        Case context: ${this.currentCase.summary}
        
        Your decision: ${ruling.decision.toUpperCase()}
        
        Provide specific legal reasoning explaining why you ${ruling.decision} this motion, citing relevant law and applying it to the facts of this case. Be thorough but concise.`;
        
        const detailedRuling = await Promise.race([
          agent.generateStatement(rulingPrompt),
          new Promise<string>((resolve) => 
            setTimeout(() => resolve(`After careful consideration of the arguments and applicable law, the court ${ruling.decision} the ${motion.title}. ${ruling.legal_reasoning}`), 15000)
          )
        ]);
        
        return detailedRuling;
      } catch (error) {
        console.error('Error generating detailed judicial ruling:', error);
        return `After careful consideration of the arguments and applicable law, the court ${ruling.decision} the ${motion.title}. ${ruling.legal_reasoning}`;
      }
    }
    
    return `The court ${ruling.decision} the ${motion.title}. ${ruling.legal_reasoning}`;
  }

  private generateFactualBasis(template: MotionTemplate): string[] {
    // Generate case-specific factual basis based on the case facts
    return this.currentCase.facts.slice(0, 2).map(fact => 
      `${fact} supports the ${template.title.toLowerCase()}`
    );
  }

  private contextualizeMotionArgument(template: MotionTemplate, motion: Motion): string {
    let argument = template.sample_argument || '';
    let facts = template.sample_facts || '';
    
    // Replace placeholder text with actual case details
    const today = new Date().toLocaleDateString();
    const charges = this.currentCase.charges || ['the charged offense'];
    const firstCharge = charges[0] || 'the charged offense';
    
    // Replace common placeholders
    argument = argument.replace(/\[date\]/g, today);
    argument = argument.replace(/\[offense\]/g, firstCharge);
    argument = argument.replace(/\[specific issue\]/g, 'the charges in this case');
    argument = argument.replace(/\[specific cause of action\]/g, firstCharge);
    
    facts = facts.replace(/\[date\]/g, today);
    facts = facts.replace(/\[offense\]/g, firstCharge);
    
    // Add case-specific context
    if (this.currentCase.summary) {
      argument += ` Based on the facts of this case: ${this.currentCase.summary.substring(0, 100)}...`;
    }
    
    return `${facts} ${argument}`;
  }

  private getOpposingParties(filingPartyId: string): string[] {
    const filingParty = this.findParticipantById(filingPartyId);
    if (!filingParty) return [];

    const opposingRoles: ParticipantRole[] = [];
    
    if (filingParty.role === 'defense-attorney') {
      opposingRoles.push('prosecutor', 'plaintiff-attorney');
    } else if (filingParty.role === 'prosecutor') {
      opposingRoles.push('defense-attorney');
    } else if (filingParty.role === 'plaintiff-attorney') {
      opposingRoles.push('defense-attorney');
    }

    return this.currentCase.participants
      .filter(p => opposingRoles.includes(p.role))
      .map(p => p.id);
  }

  private findParticipantById(id: string): Participant | undefined {
    return this.currentCase.participants.find(p => p.id === id);
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
      id: `transcript-${this.transcriptCounter++}-${speaker.id}`,
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

  /**
   * Helper methods for generating realistic examination prompts
   */
  private generateDirectExamPrompt(witness: Participant, examiner: Participant, questionIndex: number): string {
    const detailedWitness = (witness as any).detailedWitness as DetailedWitness | undefined;
    const witnessType = witness.role === 'defendant' ? 'defendant' : 'witness';
    
    if (detailedWitness) {
      const observations = detailedWitness.knowledge.directObservations || [];
      const expertise = detailedWitness.knowledge.expertKnowledge || [];
      
      if (questionIndex === 0) {
        return `Direct examination opening: Ask ${witness.name} to state their name and relationship to this case. Establish their credibility as a ${detailedWitness.witnessType} witness.`;
      } else if (observations.length > questionIndex - 1) {
        return `Direct examination: Ask ${witness.name} about what they observed: "${observations[questionIndex - 1]}". Get specific details about time, location, and circumstances.`;
      } else if (expertise.length > 0 && questionIndex > 1) {
        return `Direct examination: Ask ${witness.name} about their expertise in ${expertise[0]} and how it relates to this case. Establish their qualifications.`;
      }
    }
    
    // Fallback prompts based on witness type
    const prompts = {
      defendant: [
        `Ask the defendant to explain their whereabouts and actions on the date in question.`,
        `Ask the defendant to describe their relationship to any other parties involved.`,
        `Ask the defendant about their understanding of the charges against them.`
      ],
      witness: [
        `Ask the witness to describe what they saw or heard that is relevant to this case.`,
        `Ask the witness about the circumstances surrounding their observations.`,
        `Ask the witness to clarify any important details about timing or location.`
      ]
    };
    
    const questionSet = prompts[witnessType] || prompts.witness;
    return questionSet[questionIndex % questionSet.length];
  }

  private generateWitnessAnswerPrompt(witness: Participant, examiner: Participant, question: string, questionIndex: number): string {
    const detailedWitness = (witness as any).detailedWitness as DetailedWitness | undefined;
    
    if (detailedWitness) {
      const credibility = detailedWitness.credibility;
      const observations = detailedWitness.knowledge.directObservations || [];
      
      if (questionIndex === 0) {
        return `Answer as ${witness.name}: State your name clearly and explain your role/relationship to this case. Be confident and clear.`;
      } else {
        const observation = observations[questionIndex - 1] || 'the events in question';
        return `Answer as ${witness.name}: Provide detailed, credible testimony about ${observation}. Your memory is ${credibility.factors.memory}/10, so answer accordingly. Be honest about what you remember clearly vs. what is unclear.`;
      }
    }
    
    return `Answer the question: "${question}" as ${witness.name}. Be truthful, specific, and provide helpful details while staying within your knowledge.`;
  }

  private generateCrossExamPrompt(witness: Participant, examiner: Participant, questionIndex: number): string {
    const detailedWitness = (witness as any).detailedWitness as DetailedWitness | undefined;
    
    if (detailedWitness) {
      const impeachmentRisks = detailedWitness.credibility.impeachmentRisks || [];
      const biases = detailedWitness.credibility.biases || [];
      
      if (impeachmentRisks.length > questionIndex) {
        return `Cross-examination: Challenge ${witness.name} on potential impeachment: "${impeachmentRisks[questionIndex]}". Ask pointed questions to expose inconsistencies or bias.`;
      } else if (biases.length > 0) {
        return `Cross-examination: Question ${witness.name} about potential bias: "${biases[0]}". Challenge their motives or interests in the case outcome.`;
      }
    }
    
    const crossPrompts = [
      `Challenge ${witness.name}'s ability to clearly see or hear the events they described.`,
      `Question ${witness.name} about inconsistencies between their testimony and known facts.`,
      `Challenge ${witness.name}'s memory or bias regarding the events in question.`
    ];
    
    return crossPrompts[questionIndex % crossPrompts.length];
  }

  private generateCrossAnswerPrompt(witness: Participant, examiner: Participant, question: string, questionIndex: number): string {
    const detailedWitness = (witness as any).detailedWitness as DetailedWitness | undefined;
    
    if (detailedWitness) {
      const credibility = detailedWitness.credibility.factors;
      return `Answer as ${witness.name} during cross-examination: "${question}". Be defensive but truthful. Your sincerity is ${credibility.sincerity}/10, so maintain credibility while being cautious about admitting weaknesses.`;
    }
    
    return `Answer the cross-examination question: "${question}" as ${witness.name}. Be cautious but honest, and don't volunteer information that wasn't asked for.`;
  }

  private getFallbackQuestion(witness: Participant, examiner: Participant, questionIndex: number): string {
    const questions = [
      `Can you please state your name and describe your involvement in this case?`,
      `What did you observe on the date and time in question?`,
      `Can you provide more details about what you saw or heard?`,
      `Is there anything else relevant to this case that you witnessed?`
    ];
    return questions[questionIndex % questions.length];
  }

  private getFallbackAnswer(witness: Participant, questionIndex: number): string {
    const answers = [
      `My name is ${witness.name}. I am here to testify about what I witnessed related to this case.`,
      `I was present during the events in question and observed the key interactions between the parties.`,
      `Based on what I saw, I can provide additional details about the timing and circumstances involved.`,
      `I believe I have shared all the relevant information I witnessed that day.`
    ];
    return answers[questionIndex % answers.length];
  }

  private getFallbackCrossQuestion(witness: Participant, examiner: Participant, questionIndex: number): string {
    const questions = [
      `Isn't it true that your view of the events may have been obstructed?`,
      `You were quite far from the events you described, weren't you?`,
      `Your testimony today differs from your initial statement, doesn't it?`,
      `You have a personal interest in the outcome of this case, correct?`
    ];
    return questions[questionIndex % questions.length];
  }

  private getFallbackCrossAnswer(witness: Participant, questionIndex: number): string {
    const answers = [
      `I had a clear view of what happened and am confident in what I observed.`,
      `I was close enough to clearly see and hear what took place.`,
      `My testimony is consistent with what I witnessed that day.`,
      `I am here to tell the truth about what I saw, regardless of the outcome.`
    ];
    return answers[questionIndex % answers.length];
  }

  // Case Preparation Helper Methods
  private determineLikelyMotionsForAttorney(attorney: Participant): string {
    if (attorney.role === 'prosecutor') {
      const motions = [
        'Motion in Limine to exclude prejudicial evidence',
        'Motion for Protective Order regarding witness testimony',
        'Motion to Admit prior bad acts evidence'
      ];
      return motions[Math.floor(Math.random() * motions.length)];
    } else if (attorney.role === 'defense-attorney') {
      const motions = [
        'Motion to Suppress Evidence obtained in violation of Miranda rights',
        'Motion to Dismiss for insufficient evidence',
        'Motion for Change of Venue due to pretrial publicity'
      ];
      return motions[Math.floor(Math.random() * motions.length)];
    } else if (attorney.role === 'plaintiff-attorney') {
      const motions = [
        'Motion for Summary Judgment on liability',
        'Motion to Compel Discovery responses',
        'Motion in Limine to exclude defendant expert testimony'
      ];
      return motions[Math.floor(Math.random() * motions.length)];
    }
    return 'pre-trial motions';
  }

  private getWitnessCountForAttorney(attorney: Participant): number {
    // Return realistic witness counts based on role
    if (attorney.role === 'prosecutor') {
      return Math.floor(Math.random() * 3) + 2; // 2-4 witnesses
    } else if (attorney.role === 'defense-attorney') {
      return Math.floor(Math.random() * 2) + 1; // 1-2 witnesses
    } else if (attorney.role === 'plaintiff-attorney') {
      return Math.floor(Math.random() * 2) + 2; // 2-3 witnesses
    }
    return 2;
  }

  private developTrialStrategyForAttorney(attorney: Participant): string {
    if (attorney.role === 'prosecutor') {
      const strategies = [
        'proving beyond a reasonable doubt through eyewitness testimony and physical evidence',
        'establishing a clear timeline of events and defendant\'s opportunity to commit the crime',
        'demonstrating defendant\'s intent through circumstantial evidence and witness testimony'
      ];
      return strategies[Math.floor(Math.random() * strategies.length)];
    } else if (attorney.role === 'defense-attorney') {
      const strategies = [
        'challenging the credibility of prosecution witnesses and highlighting inconsistencies',
        'establishing reasonable doubt regarding my client\'s presence at the scene',
        'presenting alibi evidence and character witnesses to support my client\'s innocence'
      ];
      return strategies[Math.floor(Math.random() * strategies.length)];
    } else if (attorney.role === 'plaintiff-attorney') {
      const strategies = [
        'proving negligence through expert testimony and demonstrating damages',
        'establishing liability and seeking appropriate compensation for my client',
        'showing breach of duty and causation through documentary evidence'
      ];
      return strategies[Math.floor(Math.random() * strategies.length)];
    }
    return 'presenting a compelling case to the jury';
  }

  // Jury Selection Helper Methods
  private generateJurorOccupation(): string {
    const occupations = [
      'teacher', 'nurse', 'accountant', 'engineer', 'retail manager',
      'social worker', 'mechanic', 'librarian', 'photographer', 'chef',
      'electrician', 'office administrator', 'sales representative', 'consultant'
    ];
    return occupations[Math.floor(Math.random() * occupations.length)];
  }

  private generateVoirDireQuestion(side: 'prosecution' | 'defense', caseType: string): string {
    if (side === 'prosecution') {
      const questions = [
        'Have you or anyone close to you ever been the victim of a similar crime?',
        'Do you have any feelings about law enforcement that might affect your judgment?',
        'Can you hold the prosecution to the burden of proving guilt beyond a reasonable doubt?',
        'Would you be able to convict someone based solely on circumstantial evidence if it convinces you beyond a reasonable doubt?'
      ];
      return questions[Math.floor(Math.random() * questions.length)];
    } else {
      const questions = [
        'Do you understand that the defendant is presumed innocent until proven guilty?',
        'Would you be able to find the defendant not guilty if the prosecution fails to meet their burden of proof?',
        'Have you ever had a negative experience with someone charged with a crime that might affect your judgment?',
        'Can you consider the possibility that witnesses might be mistaken or not telling the truth?'
      ];
      return questions[Math.floor(Math.random() * questions.length)];
    }
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