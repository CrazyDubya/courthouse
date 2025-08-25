import { ProceedingsEngine, ProceedingEvent, AICallbacks } from './ProceedingsEngine';
import { Case, SimulationSettings, Participant, TranscriptEntry, Ruling } from '../types';
import { 
  LouisianaCivilCase, 
  LouisianaCivilClaim, 
  LouisianaProcedure,
  LouisianaParish,
  LouisianaCourtType,
  legalSystemComparisons,
  louisianaLegalTerms,
  LouisianaCaseFactory 
} from '../types/louisianaLaw';

/**
 * Louisiana Civil Law Courtroom Simulation Engine
 * Handles proceedings under Louisiana's unique civil law system
 */
export class LouisianaCourtroom extends ProceedingsEngine {
  private louisianaCase: LouisianaCivilCase;
  private louisianaRules: LouisianaProcedure;

  constructor(
    caseData: Case,
    settings: SimulationSettings,
    aiCallbacks?: AICallbacks
  ) {
    super(caseData, settings, aiCallbacks);
    
    // Convert standard case to Louisiana format
    this.louisianaCase = LouisianaCaseFactory.createLouisianaCivilCase(caseData);
    this.louisianaRules = LouisianaCaseFactory.getLouisianaProcedureRules();
    
    // Override phase handlers for Louisiana procedure
    this.initializeLouisianaPhaseHandlers();
  }

  private initializeLouisianaPhaseHandlers(): void {
    // Override specific handlers for Louisiana procedure
    this.phaseHandlers.set('pre-trial', this.handleLouisianaPreTrial.bind(this));
    this.phaseHandlers.set('opening-statements', this.handleLouisianaOpeningStatements.bind(this));
    this.phaseHandlers.set('closing-arguments', this.handleLouisianaClosingArguments.bind(this));
    this.phaseHandlers.set('jury-deliberation', this.handleLouisianaJuryDeliberation.bind(this));
    this.phaseHandlers.set('verdict', this.handleLouisianaJudgment.bind(this));
  }

  /**
   * Louisiana Pre-Trial Proceedings
   * Uses Louisiana-specific terminology and procedures
   */
  private async handleLouisianaPreTrial(): Promise<void> {
    await this.announcePhase('Pre-Trial Conference');
    
    const judge = this.findParticipantByRole('judge');
    if (judge) {
      await this.generateAndRecordStatement(
        judge,
        `We are here for the pre-trial conference in the matter docketed as ${this.louisianaCase.docketNumber} in the District Court for ${this.getParishName(this.louisianaCase.parish)} Parish, Louisiana.`
      );

      // Explain Louisiana civil law context
      await this.generateAndRecordStatement(
        judge,
        'This matter will be decided under Louisiana civil law. The court will interpret applicable provisions of the Louisiana Civil Code and related statutes.'
      );
    }

    // Handle Louisiana-specific pre-trial matters
    await this.handleLouisianaExceptions();
    await this.handleLouisianaDiscovery(); 
    await this.handleLouisianaMotions();
    
    this.transitionToPhase('jury-selection');
  }

  /**
   * Handle Louisiana exceptions (similar to motions to dismiss)
   */
  private async handleLouisianaExceptions(): Promise<void> {
    const defendant = this.findParticipantByRole('defense-attorney');
    const judge = this.findParticipantByRole('judge');
    
    if (defendant && judge && Math.random() > 0.6) {
      await this.generateAndRecordStatement(
        judge,
        'The court will now address any exceptions filed by the defendant.'
      );

      const exceptionTypes = this.louisianaRules.pleadingRules.exceptionsAllowed;
      const randomException = exceptionTypes[Math.floor(Math.random() * exceptionTypes.length)];
      
      await this.generateAndRecordStatement(
        defendant,
        `Your Honor, defendant files an exception of ${randomException.replace(/-/g, ' ')}. Under Louisiana law, this exception challenges the legal sufficiency of plaintiff's petition.`
      );

      // Opposing counsel response
      const plaintiff = this.findParticipantByRole('plaintiff-attorney');
      if (plaintiff) {
        await this.generateAndRecordStatement(
          plaintiff,
          `Your Honor, plaintiff opposes defendant's exception. The petition states a valid cause of action under Louisiana Civil Code Article 2315 and related provisions.`
        );
      }

      // Judge ruling
      const sustained = Math.random() > 0.7; // 30% chance of sustaining exception
      await this.generateAndRecordStatement(
        judge,
        sustained ? 
          `The exception is sustained. Plaintiff may file an amended petition within 15 days.` :
          `The exception is overruled. The petition states a cause of action under Louisiana law.`
      );
    }
  }

  /**
   * Handle Louisiana discovery under Code of Civil Procedure
   */
  private async handleLouisianaDiscovery(): Promise<void> {
    const judge = this.findParticipantByRole('judge');
    if (!judge) return;

    await this.generateAndRecordStatement(
      judge,
      `Discovery will proceed under Louisiana Code of Civil Procedure. Interrogatories are limited to ${this.louisianaRules.discoveryRules.interrogatoriesLimit}, and depositions to ${this.louisianaRules.discoveryRules.depositionTimeLimit} hours per witness.`
    );

    // Simulate discovery disputes
    if (Math.random() > 0.7) {
      const plaintiff = this.findParticipantByRole('plaintiff-attorney');
      if (plaintiff) {
        await this.generateAndRecordStatement(
          plaintiff,
          'Plaintiff moves to compel discovery responses. Defendant has failed to respond to properly served interrogatories and requests for production of documents.'
        );
        
        await this.generateAndRecordStatement(
          judge,
          'Motion to compel is granted. Defendant shall provide complete responses within 10 days or face sanctions under Louisiana law.'
        );
      }
    }
  }

  /**
   * Handle Louisiana-specific motions
   */
  private async handleLouisianaMotions(): Promise<void> {
    // Louisiana has different motion practice than common law states
    const judge = this.findParticipantByRole('judge');
    if (!judge) return;

    await this.generateAndRecordStatement(
      judge,
      'The court will address any motions filed under Louisiana Code of Civil Procedure.'
    );

    // Example Louisiana-specific motion
    const defendant = this.findParticipantByRole('defense-attorney');
    if (defendant && Math.random() > 0.5) {
      await this.generateAndRecordStatement(
        defendant,
        'Defendant files a motion for summary judgment under La. C.C.P. Art. 966. There are no genuine issues of material fact, and defendant is entitled to judgment as a matter of law under the Louisiana Civil Code.'
      );

      const plaintiff = this.findParticipantByRole('plaintiff-attorney');
      if (plaintiff) {
        await this.generateAndRecordStatement(
          plaintiff,
          'Plaintiff opposes the motion. Genuine issues of material fact exist regarding fault under Louisiana Civil Code Article 2315.'
        );
      }

      const granted = Math.random() > 0.8; // 20% chance of granting summary judgment
      await this.generateAndRecordStatement(
        judge,
        granted ?
          'Summary judgment is granted. No genuine issues of material fact exist under Louisiana law.' :
          'Summary judgment is denied. Material factual disputes must be resolved by the trier of fact.'
      );
    }
  }

  /**
   * Louisiana opening statements emphasizing civil law approach
   */
  private async handleLouisianaOpeningStatements(): Promise<void> {
    await this.announcePhase('Opening Statements');
    
    const judge = this.findParticipantByRole('judge');
    if (judge) {
      await this.generateAndRecordStatement(
        judge,
        'Ladies and gentlemen of the jury, this case will be decided under Louisiana civil law. You will apply the provisions of the Louisiana Civil Code as I instruct you, not common law principles from other states.'
      );
    }

    const plaintiff = this.findParticipantByRole('plaintiff-attorney');
    if (plaintiff) {
      const agent = this.agents.get(plaintiff.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `${plaintiff.name} preparing Louisiana opening statement`);
        
        const statement = await agent.generateStatement(
          `Opening statement for civil case under Louisiana law. Explain how evidence proves liability under Louisiana Civil Code provisions. Reference specific code articles and Louisiana jurisprudence. Emphasize that this is civil law, not common law.`
        );
        await this.generateAndRecordStatement(plaintiff, statement);
        this.aiCallbacks?.setAIProcessing(false);
      }
    }
    
    const defense = this.findParticipantByRole('defense-attorney');
    if (defense) {
      const agent = this.agents.get(defense.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `${defense.name} preparing Louisiana defense opening`);
        
        const statement = await agent.generateStatement(
          `Defense opening statement under Louisiana civil law. Challenge plaintiff's interpretation of Louisiana Civil Code provisions. Emphasize burden of proof and explain why defendant should not be held liable under Louisiana law.`
        );
        await this.generateAndRecordStatement(defense, statement);
        this.aiCallbacks?.setAIProcessing(false);
      }
    }
    
    this.transitionToPhase('plaintiff-case');
  }

  /**
   * Louisiana closing arguments with civil law focus
   */
  private async handleLouisianaClosingArguments(): Promise<void> {
    await this.announcePhase('Closing Arguments');
    
    const plaintiff = this.findParticipantByRole('plaintiff-attorney');
    if (plaintiff) {
      const agent = this.agents.get(plaintiff.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `${plaintiff.name} preparing Louisiana closing argument`);
        
        const statement = await agent.generateStatement(
          `Closing argument under Louisiana civil law. Summarize how evidence satisfies elements under Louisiana Civil Code Article 2315. Explain damages including moral damages available under Louisiana law. Reference Louisiana jurisprudence.`
        );
        await this.generateAndRecordStatement(plaintiff, statement);
        this.aiCallbacks?.setAIProcessing(false);
      }
    }
    
    const defense = this.findParticipantByRole('defense-attorney');
    if (defense) {
      const agent = this.agents.get(defense.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `${defense.name} preparing Louisiana defense closing`);
        
        const statement = await agent.generateStatement(
          `Defense closing argument under Louisiana civil law. Challenge plaintiff's proof under Louisiana Civil Code standards. Argue that evidence does not establish fault or causation under Louisiana law. Question damage calculations.`
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

  /**
   * Louisiana jury deliberation with 6-person jury and majority verdict
   */
  private async handleLouisianaJuryDeliberation(): Promise<void> {
    await this.announcePhase('Jury Deliberation');
    
    const judge = this.findParticipantByRole('judge');
    if (judge) {
      await this.generateAndRecordStatement(
        judge,
        `Members of the jury, you will deliberate under Louisiana law. You must decide if plaintiff has proven their case by a preponderance of the evidence under the Louisiana Civil Code. A verdict of five out of six jurors is required.`
      );
    }
    
    // Louisiana typically uses 6-person juries in civil cases
    const louisianaJurySize = 6;
    const juryMembers = this.currentCase.participants.filter(p => p.role === 'jury-member').slice(0, louisianaJurySize);
    const votes: Map<string, boolean> = new Map();
    
    this.aiCallbacks?.setAIProcessing(true, 'Louisiana jury deliberating');
    
    for (let i = 0; i < juryMembers.length; i++) {
      const juror = juryMembers[i];
      const agent = this.agents.get(juror.id);
      if (agent) {
        this.aiCallbacks?.setAIProcessing(true, `Juror ${i + 1} applying Louisiana civil law`);
        
        await agent.think('Deliberating under Louisiana civil law. Must apply Louisiana Civil Code provisions as instructed by judge, not common law principles.');
        
        const evidenceStrength = this.evaluateEvidenceStrength();
        const personalBias = (juror.personality.analyticalThinking + juror.personality.conscientiousness) / 20;
        const adjustedStrength = evidenceStrength + personalBias - 0.05;
        
        votes.set(juror.id, adjustedStrength > 0.5); // Preponderance standard
      }
    }
    
    const favorableVotes = Array.from(votes.values()).filter(v => v).length;
    
    // Louisiana requires 5 out of 6 jurors for civil verdict
    const verdict = favorableVotes >= 5;
    const reasoning = `Louisiana jury voted ${favorableVotes} for plaintiff, ${louisianaJurySize - favorableVotes} for defendant. ${verdict ? 'Five-sixths majority achieved' : 'Required majority not achieved'}`;
    
    this.currentCase.rulings.push({
      id: `louisiana-verdict-${Date.now()}`,
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

  /**
   * Louisiana judgment with civil law terminology
   */
  private async handleLouisianaJudgment(): Promise<void> {
    await this.announcePhase('Judgment');
    
    const judge = this.findParticipantByRole('judge');
    const verdict = this.currentCase.rulings.find(r => r.subject === 'verdict');
    
    if (judge) {
      let statement: string;
      
      if (verdict?.decision === 'granted') {
        statement = `The court renders judgment in favor of plaintiff. Having established liability under Louisiana Civil Code Article 2315, plaintiff is awarded damages as proven by a preponderance of the evidence. This judgment is executory and may be enforced under Louisiana law.`;
      } else {
        statement = `The court renders judgment in favor of defendant. Plaintiff has failed to establish the elements of liability under Louisiana Civil Code provisions. Plaintiff's petition is dismissed with prejudice.`;
      }
      
      await this.generateAndRecordStatement(judge, statement);
      
      // Explain Louisiana appeal rights
      await this.generateAndRecordStatement(
        judge,
        `Either party may appeal this judgment to the Louisiana Court of Appeal within ${this.louisianaCase.appealDeadline} days. A suspensive bond may be required to stay execution of this judgment.`
      );
    }
    
    this.isRunning = false;
  }

  /**
   * Generate educational content about Louisiana vs Common Law differences
   */
  async generateLegalSystemExplanation(): Promise<TranscriptEntry[]> {
    const explanations: TranscriptEntry[] = [];
    
    // Select a few key differences to explain
    const selectedComparisons = legalSystemComparisons.slice(0, 3);
    
    for (const comparison of selectedComparisons) {
      explanations.push({
        id: `explanation-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        speaker: 'Legal Expert',
        role: 'observer',
        content: `${comparison.topic}: In common law states, ${comparison.commonLawApproach}. In Louisiana, ${comparison.louisianaApproach}. Key differences: ${comparison.keyDifferences.join('; ')}. Practical impact: ${comparison.practicalImpact}`,
        type: 'statement',
        metadata: { 
          type: 'educational',
          category: 'legal-system-comparison'
        }
      });
    }
    
    return explanations;
  }

  /**
   * Provide Louisiana legal terminology explanations
   */
  getLouisianaTermDefinitions(terms: string[]): Record<string, string> {
    const definitions: Record<string, string> = {};
    
    for (const term of terms) {
      const definition = louisianaLegalTerms[term];
      if (definition) {
        definitions[term] = definition.commonLawEquivalent ?
          `${definition.definition} (Common law equivalent: ${definition.commonLawEquivalent})` :
          definition.definition;
      }
    }
    
    return definitions;
  }

  /**
   * Get parish name for display
   */
  private getParishName(parish: LouisianaParish): string {
    const parishNames: Record<LouisianaParish, string> = {
      'orleans': 'Orleans',
      'jefferson': 'Jefferson',
      'caddo': 'Caddo',
      'calcasieu': 'Calcasieu',
      'lafayette': 'Lafayette',
      'east-baton-rouge': 'East Baton Rouge',
      'rapides': 'Rapides',
      'ouachita': 'Ouachita',
      'tangipahoa': 'Tangipahoa',
      'st-tammany': 'St. Tammany',
      'terrebonne': 'Terrebonne',
      'other': 'Parish'
    };
    
    return parishNames[parish];
  }

  /**
   * Get Louisiana case information for display
   */
  getLouisianaCase(): LouisianaCivilCase {
    return this.louisianaCase;
  }

  /**
   * Get Louisiana procedure rules
   */
  getLouisianaRules(): LouisianaProcedure {
    return this.louisianaRules;
  }
}