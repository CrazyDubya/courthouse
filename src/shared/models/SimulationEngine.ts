import {
  SimulationState,
  TrialPhase,
  Role,
  ActionType,
  CourtroomAction,
  ObjectionType,
  RulingType,
  Case,
  Character
} from '../types/index.js';
import { LLMManager } from '../llm/providers.js';
import { nanoid } from 'nanoid';

export class SimulationEngine {
  private state: SimulationState;
  private caseData: Case;
  private characters: Map<Role, Character>;
  private llmManager: LLMManager;
  private actionHistory: CourtroomAction[];
  private callbacks: Map<string, Function>;

  constructor(caseData: Case, characters: Character[], llmManager: LLMManager) {
    this.caseData = caseData;
    this.characters = new Map(characters.map(char => [char.role, char]));
    this.llmManager = llmManager;
    this.actionHistory = [];
    this.callbacks = new Map();
    
    this.state = {
      caseId: caseData.id,
      currentPhase: TrialPhase.PRE_TRIAL,
      currentActor: Role.JUDGE,
      evidenceIntroduced: [],
      objectionsPending: [],
      sidebarActive: false,
      juryDeliberating: false,
      completed: false
    };
  }

  // Event subscription system
  on(event: string, callback: Function): void {
    this.callbacks.set(event, callback);
  }

  private emit(event: string, data: any): void {
    const callback = this.callbacks.get(event);
    if (callback) {
      callback(data);
    }
  }

  // Start the simulation
  async start(): Promise<void> {
    this.emit('simulation:started', { caseId: this.caseData.id });
    
    if (this.caseData.settings.preTrial) {
      await this.runPreTrial();
    }
    
    await this.runTrial();
  }

  // Pre-trial phase
  private async runPreTrial(): Promise<void> {
    this.state.currentPhase = TrialPhase.PRE_TRIAL;
    this.emit('phase:changed', { phase: TrialPhase.PRE_TRIAL });

    // Judge sets ground rules
    await this.generateAction(Role.JUDGE, ActionType.OPENING_STATEMENT, 
      'Setting the ground rules and procedures for this case');

    // Discovery phase (if not already completed)
    await this.conductDiscovery();
    
    // Pre-trial motions
    await this.handlePreTrialMotions();
  }

  // Main trial phase
  private async runTrial(): Promise<void> {
    const phases = [
      TrialPhase.JURY_SELECTION,
      TrialPhase.OPENING_STATEMENTS,
      TrialPhase.PROSECUTION_CASE,
      TrialPhase.DEFENSE_CASE,
      TrialPhase.REBUTTAL,
      TrialPhase.CLOSING_STATEMENTS,
      TrialPhase.JURY_INSTRUCTIONS,
      TrialPhase.JURY_DELIBERATION,
      TrialPhase.VERDICT
    ];

    for (const phase of phases) {
      if (this.state.completed) break;
      
      this.state.currentPhase = phase;
      this.emit('phase:changed', { phase });
      
      await this.runPhase(phase);
    }
  }

  private async runPhase(phase: TrialPhase): Promise<void> {
    switch (phase) {
      case TrialPhase.JURY_SELECTION:
        await this.conductJurySelection();
        break;
      case TrialPhase.OPENING_STATEMENTS:
        await this.conductOpeningStatements();
        break;
      case TrialPhase.PROSECUTION_CASE:
        await this.conductCasePresentation(Role.PROSECUTOR);
        break;
      case TrialPhase.DEFENSE_CASE:
        await this.conductCasePresentation(Role.DEFENSE_LAWYER);
        break;
      case TrialPhase.REBUTTAL:
        await this.conductRebuttal();
        break;
      case TrialPhase.CLOSING_STATEMENTS:
        await this.conductClosingStatements();
        break;
      case TrialPhase.JURY_INSTRUCTIONS:
        await this.giveJuryInstructions();
        break;
      case TrialPhase.JURY_DELIBERATION:
        await this.conductJuryDeliberation();
        break;
      case TrialPhase.VERDICT:
        await this.deliverVerdict();
        break;
    }
  }

  private async conductDiscovery(): Promise<void> {
    // Handle evidence sharing with privilege considerations
    const prosecution = this.characters.get(Role.PROSECUTOR);
    const defense = this.characters.get(Role.DEFENSE_LAWYER);

    if (prosecution && defense) {
      // Prosecution shares evidence
      for (const evidence of this.caseData.evidence.filter(e => e.submittedBy === Role.PROSECUTOR)) {
        if (evidence.privileges.length === 0) {
          await this.generateAction(Role.PROSECUTOR, ActionType.EVIDENCE_INTRODUCTION,
            `Sharing evidence: ${evidence.title}`);
        }
      }

      // Defense shares evidence
      for (const evidence of this.caseData.evidence.filter(e => e.submittedBy === Role.DEFENSE_LAWYER)) {
        if (evidence.privileges.length === 0) {
          await this.generateAction(Role.DEFENSE_LAWYER, ActionType.EVIDENCE_INTRODUCTION,
            `Sharing evidence: ${evidence.title}`);
        }
      }
    }
  }

  private async handlePreTrialMotions(): Promise<void> {
    // Generate pre-trial motions based on case
    const motions = ['Motion to Suppress Evidence', 'Motion to Dismiss', 'Motion for Summary Judgment'];
    
    for (const motion of motions) {
      if (Math.random() > 0.7) { // 30% chance for each motion
        await this.generateAction(Role.DEFENSE_LAWYER, ActionType.OPENING_STATEMENT,
          `Filing ${motion}`);
        
        await this.generateAction(Role.JUDGE, ActionType.RULING,
          `Ruling on ${motion}`);
      }
    }
  }

  private async conductJurySelection(): Promise<void> {
    await this.generateAction(Role.JUDGE, ActionType.OPENING_STATEMENT,
      'Beginning jury selection process');
    
    // Simulate jury selection questions
    const roles = [Role.PROSECUTOR, Role.DEFENSE_LAWYER];
    for (let i = 0; i < this.caseData.settings.jurySize; i++) {
      for (const role of roles) {
        await this.generateAction(role, ActionType.DIRECT_EXAMINATION,
          `Questioning potential juror #${i + 1}`);
      }
    }
  }

  private async conductOpeningStatements(): Promise<void> {
    // Prosecution opening statement
    await this.generateAction(Role.PROSECUTOR, ActionType.OPENING_STATEMENT,
      'Delivering opening statement for the prosecution');
    
    // Defense opening statement
    await this.generateAction(Role.DEFENSE_LAWYER, ActionType.OPENING_STATEMENT,
      'Delivering opening statement for the defense');
  }

  private async conductCasePresentation(presentingRole: Role): Promise<void> {
    const witnesses = this.caseData.witnessLists[presentingRole] || [];
    
    for (const witness of witnesses) {
      await this.callWitness(witness, presentingRole);
    }
  }

  private async callWitness(witnessName: string, callingRole: Role): Promise<void> {
    this.state.currentWitness = witnessName;
    
    // Call witness
    await this.generateAction(callingRole, ActionType.WITNESS_CALL,
      `Calling ${witnessName} to the stand`);
    
    // Direct examination
    await this.generateAction(callingRole, ActionType.DIRECT_EXAMINATION,
      `Conducting direct examination of ${witnessName}`);
    
    // Cross examination
    const opposingRole = this.getOpposingRole(callingRole);
    if (opposingRole) {
      await this.generateAction(opposingRole, ActionType.CROSS_EXAMINATION,
        `Conducting cross examination of ${witnessName}`);
    }
    
    // Handle potential objections during examination
    await this.handlePotentialObjections();
    
    this.state.currentWitness = null;
  }

  private async handlePotentialObjections(): Promise<void> {
    if (!this.caseData.settings.allowObjections) return;
    
    // Random chance of objections
    if (Math.random() > 0.8) { // 20% chance
      const objectionTypes = Object.values(ObjectionType);
      const objection = objectionTypes[Math.floor(Math.random() * objectionTypes.length)];
      
      const opposingRole = this.getOpposingRole(this.state.currentActor);
      if (opposingRole) {
        await this.generateAction(opposingRole, ActionType.OBJECTION,
          `Objection: ${objection}`);
        
        // Judge ruling
        const ruling = Math.random() > 0.5 ? RulingType.SUSTAINED : RulingType.OVERRULED;
        await this.generateAction(Role.JUDGE, ActionType.RULING,
          `${ruling} - ${this.getRulingExplanation(objection, ruling)}`);
      }
    }
  }

  private async conductRebuttal(): Promise<void> {
    // Prosecution rebuttal if it's a criminal case
    if (this.caseData.type === 'criminal') {
      await this.generateAction(Role.PROSECUTOR, ActionType.DIRECT_EXAMINATION,
        'Presenting rebuttal evidence');
    }
  }

  private async conductClosingStatements(): Promise<void> {
    // Prosecution closing
    await this.generateAction(Role.PROSECUTOR, ActionType.CLOSING_STATEMENT,
      'Delivering closing argument for the prosecution');
    
    // Defense closing
    await this.generateAction(Role.DEFENSE_LAWYER, ActionType.CLOSING_STATEMENT,
      'Delivering closing argument for the defense');
  }

  private async giveJuryInstructions(): Promise<void> {
    await this.generateAction(Role.JUDGE, ActionType.RULING,
      'Instructing the jury on applicable law and deliberation procedures');
  }

  private async conductJuryDeliberation(): Promise<void> {
    this.state.juryDeliberating = true;
    this.emit('jury:deliberation:started', {});
    
    // Simulate jury deliberation
    await this.generateAction(Role.JURY_MEMBER, ActionType.JURY_DELIBERATION,
      'Jury beginning deliberations');
    
    // Simulate deliberation time (shortened for simulation)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    this.state.juryDeliberating = false;
  }

  private async deliverVerdict(): Promise<void> {
    // Generate verdict based on case strength and evidence
    const verdict = this.calculateVerdict();
    this.state.verdict = verdict;
    
    await this.generateAction(Role.JURY_MEMBER, ActionType.VERDICT,
      `We the jury find the defendant: ${verdict}`);
    
    this.state.completed = true;
    this.emit('simulation:completed', { verdict });
  }

  private calculateVerdict(): string {
    // Simplified verdict calculation
    // In a real system, this would be more sophisticated
    const evidenceStrength = this.caseData.evidence.length;
    const objectionsSustained = this.actionHistory.filter(
      action => action.type === ActionType.RULING && action.content.includes('Sustained')
    ).length;
    
    const score = evidenceStrength - objectionsSustained + Math.random() * 2;
    
    if (this.caseData.type === 'criminal') {
      return score > 3 ? 'GUILTY' : 'NOT GUILTY';
    } else {
      return score > 3 ? 'LIABLE' : 'NOT LIABLE';
    }
  }

  private async generateAction(
    role: Role, 
    type: ActionType, 
    prompt: string,
    target?: Role
  ): Promise<CourtroomAction> {
    const character = this.characters.get(role);
    if (!character) {
      throw new Error(`No character found for role: ${role}`);
    }

    // Build context for LLM
    const context = this.buildContext(role, type);
    
    // Generate response using LLM
    let content: string;
    try {
      const response = await this.llmManager.generateCharacterResponse(
        character.id,
        prompt,
        context
      );
      content = response.content;
    } catch (error) {
      console.error(`Error generating response for ${role}:`, error);
      content = `[${role} ${type}] - ${prompt}`;
    }

    const action: CourtroomAction = {
      id: nanoid(),
      type,
      timestamp: new Date(),
      actor: role,
      target: target || null,
      content
    };

    this.actionHistory.push(action);
    this.state.currentActor = role;
    
    this.emit('action:generated', action);
    
    return action;
  }

  private buildContext(role: Role, type: ActionType): string {
    const recentActions = this.actionHistory.slice(-5);
    const evidence = this.caseData.evidence.map(e => `${e.title}: ${e.description}`).join('\n');
    
    return `
Current Phase: ${this.state.currentPhase}
Recent Actions:
${recentActions.map(a => `${a.actor}: ${a.content}`).join('\n')}

Case Evidence:
${evidence}

Case Background:
${this.caseData.background}

Your role: ${role}
Action type: ${type}
    `.trim();
  }

  private getOpposingRole(role: Role): Role | undefined {
    const oppositions: Partial<Record<Role, Role>> = {
      [Role.PROSECUTOR]: Role.DEFENSE_LAWYER,
      [Role.DEFENSE_LAWYER]: Role.PROSECUTOR,
      [Role.PLAINTIFF_LAWYER]: Role.DEFENSE_LAWYER,
      [Role.PLAINTIFF]: Role.DEFENDANT,
      [Role.DEFENDANT]: Role.PLAINTIFF
    };
    
    return oppositions[role];
  }

  private getRulingExplanation(objection: ObjectionType, ruling: RulingType): string {
    const explanations: Record<string, string> = {
      [`${ObjectionType.HEARSAY}_${RulingType.SUSTAINED}`]: 'The statement is hearsay and inadmissible',
      [`${ObjectionType.HEARSAY}_${RulingType.OVERRULED}`]: 'The statement falls under an exception to hearsay',
      [`${ObjectionType.RELEVANCE}_${RulingType.SUSTAINED}`]: 'The question is not relevant to the case',
      [`${ObjectionType.RELEVANCE}_${RulingType.OVERRULED}`]: 'The question has probative value',
      [`${ObjectionType.LEADING}_${RulingType.SUSTAINED}`]: 'The question is leading the witness',
      [`${ObjectionType.LEADING}_${RulingType.OVERRULED}`]: 'Leading questions are permitted on cross-examination'
    };
    
    return explanations[`${objection}_${ruling}`] || 'Court ruling on objection';
  }

  // Public methods for external control
  getState(): SimulationState {
    return { ...this.state };
  }

  getActionHistory(): CourtroomAction[] {
    return [...this.actionHistory];
  }

  async pauseSimulation(): Promise<void> {
    this.emit('simulation:paused', {});
  }

  async resumeSimulation(): Promise<void> {
    this.emit('simulation:resumed', {});
  }

  async requestSidebar(): Promise<void> {
    if (!this.caseData.settings.allowSidebars) return;
    
    this.state.sidebarActive = true;
    await this.generateAction(Role.JUDGE, ActionType.SIDEBAR,
      'Court will now have a sidebar conference');
  }

  async endSidebar(): Promise<void> {
    this.state.sidebarActive = false;
    await this.generateAction(Role.JUDGE, ActionType.RULING,
      'Sidebar conference concluded, proceeding with trial');
  }
}