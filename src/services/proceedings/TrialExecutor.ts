import { Participant, Evidence, ObjectionType, Ruling } from '../../types';
import { ProceedingsBase } from './ProceedingsBase';
import { DetailedWitness } from '../WitnessFactory';

/**
 * Handles witness examination, evidence presentation, and objections during trial.
 */
export class TrialExecutor extends ProceedingsBase {
  async presentEvidence(evidence: Evidence, presenter: Participant): Promise<void> {
    await this.generateAndRecordStatement(
      presenter,
      `I would like to present ${evidence.type} evidence: ${evidence.title}`
    );
    
    this.currentCase.transcript.push({
      id: `exhibit-${this.transcriptCounter.value++}`,
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

  async examineWitness(witness: Participant, examiner: Participant): Promise<void> {
    // Type guard for detailed witness
    const hasDetailedWitness = (p: Participant): p is Participant & { knowledge?: { directObservations?: string[] } } => {
      return 'knowledge' in p && typeof (p as any).knowledge === 'object';
    };
    
    const detailedWitness = hasDetailedWitness(witness) ? witness.knowledge?.directObservations : undefined;
    
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

  async crossExamineWitness(witness: Participant, examiner: Participant): Promise<void> {
    // Type guard for detailed witness
    const hasDetailedWitness = (p: Participant): p is Participant & { knowledge?: { directObservations?: string[] } } => {
      return 'knowledge' in p && typeof (p as any).knowledge === 'object';
    };
    
    const detailedWitness = hasDetailedWitness(witness) ? witness.knowledge?.directObservations : undefined;
    
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

  async checkForObjections(content: string): Promise<void> {
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

  async handleObjection(attorney: Participant, objectionType: ObjectionType): Promise<void> {
    await this.generateAndRecordStatement(
      attorney,
      `Objection, your honor! ${objectionType}.`
    );
    
    const judge = this.findParticipantByRole('judge');
    if (judge) {
      const sustained = Math.random() > 0.5;
      const ruling: Ruling = {
        id: `ruling-${this.transcriptCounter.value++}`,
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

  generateDirectExamPrompt(witness: Participant, examiner: Participant, questionIndex: number): string {
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

  generateWitnessAnswerPrompt(witness: Participant, examiner: Participant, question: string, questionIndex: number): string {
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

  generateCrossExamPrompt(witness: Participant, examiner: Participant, questionIndex: number): string {
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

  generateCrossAnswerPrompt(witness: Participant, examiner: Participant, question: string, questionIndex: number): string {
    const detailedWitness = (witness as any).detailedWitness as DetailedWitness | undefined;
    
    if (detailedWitness) {
      const credibility = detailedWitness.credibility.factors;
      return `Answer as ${witness.name} during cross-examination: "${question}". Be defensive but truthful. Your sincerity is ${credibility.sincerity}/10, so maintain credibility while being cautious about admitting weaknesses.`;
    }
    
    return `Answer the cross-examination question: "${question}" as ${witness.name}. Be cautious but honest, and don't volunteer information that wasn't asked for.`;
  }

  getFallbackQuestion(witness: Participant, examiner: Participant, questionIndex: number): string {
    const questions = [
      `Can you please state your name and describe your involvement in this case?`,
      `What did you observe on the date and time in question?`,
      `Can you provide more details about what you saw or heard?`,
      `Is there anything else relevant to this case that you witnessed?`
    ];
    return questions[questionIndex % questions.length];
  }

  getFallbackAnswer(witness: Participant, questionIndex: number): string {
    const answers = [
      `My name is ${witness.name}. I am here to testify about what I witnessed related to this case.`,
      `I was present during the events in question and observed the key interactions between the parties.`,
      `Based on what I saw, I can provide additional details about the timing and circumstances involved.`,
      `I believe I have shared all the relevant information I witnessed that day.`
    ];
    return answers[questionIndex % answers.length];
  }

  getFallbackCrossQuestion(witness: Participant, examiner: Participant, questionIndex: number): string {
    const questions = [
      `Isn't it true that your view of the events may have been obstructed?`,
      `You were quite far from the events you described, weren't you?`,
      `Your testimony today differs from your initial statement, doesn't it?`,
      `You have a personal interest in the outcome of this case, correct?`
    ];
    return questions[questionIndex % questions.length];
  }

  getFallbackCrossAnswer(witness: Participant, questionIndex: number): string {
    const answers = [
      `I had a clear view of what happened and am confident in what I observed.`,
      `I was close enough to clearly see and hear what took place.`,
      `My testimony is consistent with what I witnessed that day.`,
      `I am here to tell the truth about what I saw, regardless of the outcome.`
    ];
    return answers[questionIndex % answers.length];
  }

  getWitnessCountForAttorney(attorney: Participant): number {
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
}
