import { Participant } from '../../types';
import { ProceedingsBase } from './ProceedingsBase';
import { MotionProcessor } from './MotionProcessor';
import { TrialExecutor } from './TrialExecutor';
import { SentencingEngine } from './SentencingEngine';
import { MAX_PEREMPTORY_CHALLENGES, JURY_POOL_BUFFER } from './constants';

/**
 * Manages all trial phases from case preparation to verdict.
 * Coordinates between MotionProcessor, TrialExecutor, and SentencingEngine.
 */
export class TrialPhaseManager extends ProceedingsBase {
  private motionProcessor: MotionProcessor;
  private trialExecutor: TrialExecutor;
  private sentencingEngine: SentencingEngine;

  constructor(
    motionProcessor: MotionProcessor,
    trialExecutor: TrialExecutor,
    sentencingEngine: SentencingEngine,
    ...baseArgs: ConstructorParameters<typeof ProceedingsBase>
  ) {
    super(...baseArgs);
    this.motionProcessor = motionProcessor;
    this.trialExecutor = trialExecutor;
    this.sentencingEngine = sentencingEngine;
  }

  async handleCasePreparation(): Promise<void> {
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

  async handlePreTrial(): Promise<void> {
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
        this.motionProcessor.handleMotions(),
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

  async handleJurySelection(): Promise<void> {
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
      
      this.aiCallbacks?.setAIProcessing(true, 'Conducting voir dire examination');
      
      for (let i = 0; i < Math.min(juryPool.length, this.settings.jurySize + JURY_POOL_BUFFER) && selectedJurors.length < this.settings.jurySize; i++) {
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
        
        if (prosecutor && challengesUsed.prosecution < MAX_PEREMPTORY_CHALLENGES && Math.random() < 0.2) {
          await this.generateAndRecordStatement(
            prosecutor,
            'Your Honor, the People exercise a peremptory challenge to this juror.'
          );
          challengesUsed.prosecution++;
          challenged = true;
        }
        
        if (!challenged && defense && challengesUsed.defense < MAX_PEREMPTORY_CHALLENGES && Math.random() < 0.2) {
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

  async handleOpeningStatements(): Promise<void> {
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

  async handlePlaintiffCase(): Promise<void> {
    await this.announcePhase('Plaintiff/Prosecution Case-in-Chief');
    
    const prosecutor = this.findParticipantByRole('prosecutor') || 
                      this.findParticipantByRole('plaintiff-attorney');
    
    if (prosecutor) {
      for (const evidence of this.currentCase.evidence.filter(e => e.submittedBy === prosecutor.id)) {
        await this.trialExecutor.presentEvidence(evidence, prosecutor);
        
        if (this.settings.enableObjections) {
          await this.trialExecutor.checkForObjections(evidence.description);
        }
      }
      
      const witnesses = this.currentCase.participants.filter(
        w => w.role === 'witness' && !w.name.toLowerCase().includes('defense')
      );
      
      for (const witness of witnesses) {
        await this.trialExecutor.examineWitness(witness, prosecutor);
        
        const defense = this.findParticipantByRole('defense-attorney');
        if (defense) {
          await this.trialExecutor.crossExamineWitness(witness, defense);
        }
      }
    }
    
    this.transitionToPhase('defense-case');
  }

  async handleDefenseCase(): Promise<void> {
    await this.announcePhase('Defense Case');
    
    const defense = this.findParticipantByRole('defense-attorney');
    
    if (defense) {
      for (const evidence of this.currentCase.evidence.filter(e => e.submittedBy === defense.id)) {
        await this.trialExecutor.presentEvidence(evidence, defense);
        
        if (this.settings.enableObjections) {
          await this.trialExecutor.checkForObjections(evidence.description);
        }
      }
      
      const defendant = this.findParticipantByRole('defendant');
      if (defendant && Math.random() > 0.3) {
        await this.trialExecutor.examineWitness(defendant, defense);
        
        const prosecutor = this.findParticipantByRole('prosecutor') || 
                         this.findParticipantByRole('plaintiff-attorney');
        if (prosecutor) {
          await this.trialExecutor.crossExamineWitness(defendant, prosecutor);
        }
      }
    }
    
    this.transitionToPhase('closing-arguments');
  }

  async handleClosingArguments(): Promise<void> {
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

  async handleJuryDeliberation(): Promise<void> {
    await this.announcePhase('Jury Deliberation');
    
    const judge = this.findParticipantByRole('judge');
    if (judge) {
      let instructions: string;
      if (this.currentCase.type === 'criminal') {
        instructions = `Ladies and gentlemen of the jury, you must determine whether the prosecution has proven each element of the charged crimes beyond a reasonable doubt. The defendant is presumed innocent and this presumption remains unless the prosecution meets its burden. If you have any reasonable doubt as to the defendant's guilt, you must vote to acquit. Remember, reasonable doubt does not mean all possible doubt, but doubt based on reason and common sense. You will now retire to the jury room to begin your deliberations. Please select a foreperson to guide your discussions.`;
      } else {
        instructions = `Ladies and gentlemen of the jury, in this civil case you must determine liability and, if appropriate, damages. The plaintiff must prove their case by a preponderance of the evidence, meaning it is more likely than not that the defendant is liable. This is a lower standard than beyond a reasonable doubt in criminal cases. If you find for the plaintiff, you must then determine appropriate damages to compensate for proven losses. Please retire to deliberate and reach a unanimous verdict if possible under New York law.`;
      }
      
      await this.generateAndRecordStatement(judge, instructions);
    }
    
    this.aiCallbacks?.setAIProcessing(true, 'Jury is deliberating');
    
    await this.delay(5000 / this.settings.realtimeSpeed);
    
    if (judge) {
      await this.generateAndRecordStatement(
        judge,
        'The jury has reached a verdict. Please return to the courtroom.'
      );
    }
    
    this.aiCallbacks?.setAIProcessing(false);
    this.transitionToPhase('verdict');
  }

  async handleVerdict(): Promise<void> {
    await this.announcePhase('Verdict');
    
    const judge = this.findParticipantByRole('judge');
    if (judge) {
      await this.generateAndRecordStatement(
        judge,
        'Will the jury foreperson please rise and announce the verdict?'
      );
    }
    
    const evidenceStrength = this.evaluateEvidenceStrength();
    const guilty = evidenceStrength > 0.6;
    
    const jury = this.currentCase.participants.find(p => p.role === 'jury-member');
    if (jury) {
      let verdictText: string;
      if (this.currentCase.type === 'criminal') {
        verdictText = guilty 
          ? `In the matter of ${this.currentCase.title}, we the jury find the defendant GUILTY of the charged offenses.`
          : `In the matter of ${this.currentCase.title}, we the jury find the defendant NOT GUILTY of the charged offenses.`;
      } else {
        verdictText = guilty
          ? `In the matter of ${this.currentCase.title}, we the jury find in favor of the plaintiff and award damages in the amount of $${Math.floor(Math.random() * 500000) + 50000}.`
          : `In the matter of ${this.currentCase.title}, we the jury find in favor of the defendant. Plaintiff shall take nothing.`;
      }
      
      await this.generateAndRecordStatement(jury, verdictText);
    }
    
    this.currentCase.rulings.push({
      id: `verdict-${this.transcriptCounter.value++}`,
      timestamp: new Date(),
      judge: judge?.name || 'Jury',
      type: 'verdict',
      subject: 'verdict',
      decision: guilty ? 'granted' : 'denied',
      reasoning: guilty ? 'Guilty verdict' : 'Not guilty verdict'
    });
    
    if (judge) {
      await this.generateAndRecordStatement(
        judge,
        'The verdict is accepted and recorded. Thank you for your service.'
      );
    }
    
    if (this.currentCase.type === 'criminal' && guilty) {
      this.transitionToPhase('sentencing');
    }
  }

  async handleSentencing(): Promise<void> {
    await this.sentencingEngine.handleSentencing();
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

  async handleSidebar(participants: Participant[]): Promise<void> {
    this.sidebarActive.value = true;
    
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
    
    this.sidebarActive.value = false;
    
    await this.generateAndRecordStatement(
      this.findParticipantByRole('judge'),
      'Thank you, counsel. You may return.'
    );
  }

  developTrialStrategyForAttorney(attorney: Participant): string {
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

  generateJurorOccupation(): string {
    const occupations = [
      'teacher', 'nurse', 'accountant', 'engineer', 'retail manager',
      'social worker', 'mechanic', 'librarian', 'photographer', 'chef',
      'electrician', 'office administrator', 'sales representative', 'consultant'
    ];
    return occupations[Math.floor(Math.random() * occupations.length)];
  }

  generateVoirDireQuestion(side: 'prosecution' | 'defense', caseType: string): string {
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
}
