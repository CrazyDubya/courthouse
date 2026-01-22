import { Participant } from '../../types';
import { ProceedingsBase } from './ProceedingsBase';

/**
 * Handles all sentencing-related logic for criminal cases.
 */
export class SentencingEngine extends ProceedingsBase {
  async handleSentencing(): Promise<void> {
    await this.announcePhase('Sentencing/Penalty Phase');
    
    const judge = this.findParticipantByRole('judge');
    if (!judge) {
      return;
    }

    // Only criminal cases have sentencing phase
    if (this.currentCase.type !== 'criminal') {
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
      id: `victim-impact-${this.transcriptCounter.value++}`,
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
      id: `sentence-${this.transcriptCounter.value++}`,
      timestamp: new Date(),
      judge: judge.name,
      type: 'procedural',
      subject: 'sentencing',
      decision: 'granted',
      reasoning: 'Sentence imposed based on statutory guidelines and case factors'
    });

    this.aiCallbacks?.setAIProcessing(false);
  }

  async generateCriminalSentence(judge: Participant): Promise<string> {
    // Type guard for enhanced judge profile
    const hasEnhancedProfile = (p: Participant): p is Participant & { enhancedProfile?: EnhancedJudgeProfile } => {
      return 'enhancedProfile' in p && typeof (p as any).enhancedProfile === 'object';
    };
    
    // Analyze the charges to determine appropriate sentence
    const charges = this.currentCase.charges || ['theft over $1000'];
    const firstCharge = charges[0];
    
    // Determine sentence based on charge severity and judge personality
    const enhancedJudge = hasEnhancedProfile(judge) ? judge.enhancedProfile : undefined;
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

  getBaseSentenceForCharge(charge: string): any {
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

  increaseSentenceSeverity(sentence: any): any {
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

  considerMitigatingFactors(sentence: any): any {
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

  formatSentenceStatement(sentence: any, charge: string): string {
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
}
