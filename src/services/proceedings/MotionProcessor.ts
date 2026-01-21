import { Participant } from '../../types';
import { Motion, MotionType, MotionTemplate, MotionRuling, MotionStatus } from '../../types/motions';
import { ProceedingsBase } from './ProceedingsBase';
import { MOTION_TEMPLATES } from '../../data/motionTemplates';
import { EnhancedJudgeProfile } from '../../types/judge';

/**
 * Handles motion filing, processing, and judicial rulings.
 */
export class MotionProcessor extends ProceedingsBase {
  async handleMotions(): Promise<void> {
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

  determineLikelyMotions(): MotionTemplate[] {
    const applicableMotions = MOTION_TEMPLATES.filter(template => 
      template.applicableCaseTypes.includes(this.currentCase.type)
    );

    // Sort by likelihood of being filed in this case type
    return applicableMotions.sort((a, b) => b.likelihood_of_success - a.likelihood_of_success);
  }

  shouldAttorneyFileMotion(attorney: Participant): boolean {
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

  selectMotionForAttorney(attorney: Participant, availableMotions: MotionTemplate[]): MotionTemplate | null {
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

  async fileMotion(attorney: Participant, template: MotionTemplate, judge: Participant): Promise<void> {
    const motion: Motion = {
      id: `motion-${this.motionCounter.value++}`,
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

  generateMotionArgument(attorney: Participant, template: MotionTemplate, contextualizedArgument: string): string {
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

  async processMotion(motion: Motion, judge: Participant): Promise<void> {
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

  generateOppositionResponse(motion: Motion, opposingCounsel: Participant): string {
    const oppositionStatements: Record<string, string> = {
      'prosecutor': `Your Honor, the People oppose this motion. The defense has failed to establish any legal basis for the relief requested. The motion should be denied.`,
      'defense-attorney': `Your Honor, the defense respectfully opposes this motion. The prosecution's arguments lack merit and the motion should be denied in the interests of justice.`,
      'plaintiff-attorney': `Your Honor, plaintiff opposes this motion. Defendant has not met their burden of proof and the motion lacks legal foundation.`
    };

    return oppositionStatements[opposingCounsel.role] || 
      `Your Honor, we respectfully oppose this motion. The moving party has failed to meet the required legal standard.`;
  }

  generateSimpleJudicialRuling(motion: Motion, ruling: MotionRuling, judge: Participant): string {
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

  generateFallbackRuling(motion: Motion): MotionRuling {
    // Simple fallback logic when AI fails
    const decision: MotionStatus = Math.random() > 0.6 ? 'granted' : 'denied';
    
    return {
      id: `ruling-${this.transcriptCounter.value++}`,
      motionId: motion.id,
      decision,
      legal_reasoning: `The court has reviewed the motion and finds that it should be ${decision} based on the legal standards and evidence presented.`,
      precedent_cases: [],
      rulingDate: new Date(),
      effectiveDate: new Date()
    };
  }

  async generateJudgeRuling(motion: Motion, judge: Participant): Promise<MotionRuling> {
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
      id: `ruling-${this.transcriptCounter.value++}`,
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

  generateReasoningBasedOnPersonality(
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

  async generateDetailedJudicialRuling(motion: Motion, ruling: MotionRuling, judge: Participant): Promise<string> {
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

  generateFactualBasis(template: MotionTemplate): string[] {
    // Generate case-specific factual basis based on the case facts
    return this.currentCase.facts.slice(0, 2).map(fact => 
      `${fact} supports the ${template.title.toLowerCase()}`
    );
  }

  contextualizeMotionArgument(template: MotionTemplate, motion: Motion): string {
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

  determineLikelyMotionsForAttorney(attorney: Participant): string {
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
}
