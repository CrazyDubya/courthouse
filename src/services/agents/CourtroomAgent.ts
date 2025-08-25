import { 
  Participant, 
  AgentMemory, 
  AgentAction, 
  Case, 
  Evidence, 
  TranscriptEntry,
  ObjectionType,
  ParticipantRole 
} from '../../types';
import { BaseLLMProvider, LLMMessage, LLMProviderFactory } from '../llm/LLMProvider';

export class CourtroomAgent {
  private participant: Participant;
  private llmProvider: BaseLLMProvider | null;
  private memory: AgentMemory;
  private currentCase: Case | null = null;
  private cognitiveLoad: number = 0;
  private emotionalState: Map<string, number>;
  private dailyRoutine: string[] = [];
  private currentThoughts: string[] = [];

  constructor(participant: Participant) {
    this.participant = participant;
    this.llmProvider = participant.aiControlled && participant.llmProvider 
      ? LLMProviderFactory.create(participant.llmProvider)
      : null;
    
    this.memory = {
      shortTerm: [],
      longTerm: [],
      workingMemory: new Map(),
      beliefs: new Map(),
      relationships: new Map(),
    };

    this.emotionalState = new Map([
      ['stress', 0.3],
      ['confidence', 0.5],
      ['frustration', 0.2],
      ['satisfaction', 0.5],
    ]);

    this.initializeAgent();
  }

  private initializeAgent() {
    this.memory.longTerm = [
      `I am ${this.participant.name}, a ${this.participant.role}.`,
      `My education: ${this.participant.background.education}`,
      `My experience: ${this.participant.background.experience}`,
      ...this.participant.background.motivations.map(m => `I am motivated by: ${m}`),
    ];

    this.memory.beliefs.set('justice', 0.8);
    this.memory.beliefs.set('truth', 0.9);
    this.memory.beliefs.set('fairness', 0.7);

    this.generateDailyRoutine();
  }

  private generateDailyRoutine() {
    const routines: Record<ParticipantRole, string[]> = {
      'judge': [
        'Review case files and legal precedents',
        'Prepare for court proceedings',
        'Study relevant laws and regulations',
        'Deliberate on complex legal matters',
        'Write judicial opinions',
      ],
      'prosecutor': [
        'Review evidence and witness statements',
        'Prepare opening and closing arguments',
        'Interview witnesses',
        'Research case law',
        'Strategize prosecution approach',
      ],
      'defense-attorney': [
        'Meet with client to discuss case',
        'Investigate alternative theories',
        'Prepare cross-examination questions',
        'Research precedents for defense',
        'Draft motions and briefs',
      ],
      'plaintiff-attorney': [
        'Gather supporting documentation',
        'Interview plaintiff and witnesses',
        'Calculate damages',
        'Research similar cases',
        'Prepare exhibits',
      ],
      'defendant': [
        'Reflect on the case',
        'Prepare testimony',
        'Consult with attorney',
        'Manage stress and anxiety',
        'Maintain hope for favorable outcome',
      ],
      'plaintiff': [
        'Document experiences',
        'Prepare for testimony',
        'Gather supporting evidence',
        'Consult with attorney',
        'Seek emotional support',
      ],
      'witness': [
        'Review relevant events',
        'Prepare testimony',
        'Ensure accuracy of statements',
        'Manage pre-testimony anxiety',
        'Coordinate with legal teams',
      ],
      'jury-member': [
        'Listen attentively to proceedings',
        'Take notes on evidence',
        'Avoid external influences',
        'Deliberate with fellow jurors',
        'Form objective opinions',
      ],
      'bailiff': [
        'Maintain courtroom security',
        'Assist judge with proceedings',
        'Manage evidence handling',
        'Ensure orderly conduct',
        'Coordinate with court staff',
      ],
      'court-clerk': [
        'Maintain court records',
        'Manage case files',
        'Schedule proceedings',
        'Process legal documents',
        'Assist with administrative tasks',
      ],
      'observer': [
        'Observe proceedings',
        'Take notes',
        'Form opinions',
        'Discuss with others',
        'Learn about legal system',
      ],
    };

    this.dailyRoutine = routines[this.participant.role] || routines['observer'];
  }

  async think(context: string): Promise<string[]> {
    if (!this.llmProvider) {
      return this.generateDefaultThoughts(context);
    }

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(),
      },
      {
        role: 'user',
        content: `Current context: ${context}\\n\\nWhat are your thoughts? Consider your role, personality, and current emotional state. Provide 3-5 internal thoughts.`,
      },
    ];

    try {
      const response = await this.llmProvider.generateResponse(messages);
      this.currentThoughts = response.content.split('\\n').filter(t => t.trim());
      this.updateCognitiveLoad(0.1);
      return this.currentThoughts;
    } catch (error) {
      console.error('Error generating thoughts:', error);
      return this.generateDefaultThoughts(context);
    }
  }

  async planAction(context: string, availableActions: string[]): Promise<AgentAction> {
    if (!this.llmProvider) {
      return this.generateDefaultAction(context, availableActions);
    }

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(),
      },
      {
        role: 'user',
        content: `Current context: ${context}
Available actions: ${availableActions.join(', ')}
Recent memory: ${this.memory.shortTerm.slice(-5).join('; ')}
Current thoughts: ${this.currentThoughts.join('; ')}

What action should you take? Provide your action, confidence level (0-1), and reasoning.
Format: ACTION|CONFIDENCE|REASONING`,
      },
    ];

    try {
      const response = await this.llmProvider.generateResponse(messages);
      const [action, confidence, reasoning] = response.content.split('|');
      
      return {
        type: this.parseActionType(action),
        content: action.trim(),
        confidence: parseFloat(confidence) || 0.5,
        reasoning: reasoning?.trim(),
      };
    } catch (error) {
      console.error('Error planning action:', error);
      return this.generateDefaultAction(context, availableActions);
    }
  }

  async generateStatement(context: string, targetRole?: ParticipantRole): Promise<string> {
    // Always use fallback statements for now - LLM dependency removed
    const fallbackStatement = this.generateDefaultStatement(context);
    
    // Try LLM with very short timeout, but don't block on it
    if (this.llmProvider) {
      try {
        const messages: LLMMessage[] = [
          {
            role: 'system',
            content: this.buildSystemPrompt(),
          },
          {
            role: 'user',
            content: `Context: ${context}
${targetRole ? `Speaking to: ${targetRole}` : ''}
Your current emotional state: ${Array.from(this.emotionalState.entries()).map(([k, v]) => `${k}: ${v}`).join(', ')}

Generate an appropriate statement for the current courtroom context. Be concise and professional.`,
          },
        ];

        // Generous timeout with retry logic for Ollama
        const response = await this.withRetry(
          () => this.llmProvider.generateResponse(messages),
          3, // 3 retry attempts
          25000, // 25 second timeout per attempt
          `${this.participant.name}`
        );
        this.updateMemory(response.content);
        return response.content;
      } catch (error) {
        // LLM failed - use fallback and log the error
        console.log(`🤖 LLM failed for ${this.participant.name}, using fallback:`, error.message);
        return fallbackStatement;
      }
    }

    return fallbackStatement;
  }

  // Timeout wrapper utility
  private async withTimeout<T>(
    promise: Promise<T>, 
    timeoutMs: number, 
    timeoutMessage: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
      )
    ]);
  }

  // Retry wrapper with exponential backoff
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number,
    timeoutMs: number,
    context: string
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔄 ${context} - Attempt ${attempt}/${maxAttempts}`);
        
        const result = await this.withTimeout(
          operation(),
          timeoutMs,
          `${context} timeout on attempt ${attempt}`
        );
        
        if (attempt > 1) {
          console.log(`✅ ${context} - Success on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        console.log(`⚠️  ${context} - Failed attempt ${attempt}: ${error.message}`);
        
        if (attempt < maxAttempts) {
          // Exponential backoff: 1s, 2s, 4s
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ ${context} - Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.log(`❌ ${context} - All attempts failed, throwing error`);
    throw lastError!;
  }

  async evaluateObjection(statement: string, objectionType: ObjectionType): Promise<boolean> {
    if (!this.llmProvider) {
      return Math.random() > 0.5;
    }

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `You are a ${this.participant.role} evaluating whether to object to a statement.`,
      },
      {
        role: 'user',
        content: `Statement: "${statement}"
Potential objection: ${objectionType}
Your legal knowledge level: ${this.participant.background.experience}

Should you object? Respond with YES or NO and brief reasoning.`,
      },
    ];

    try {
      const response = await this.withRetry(
        () => this.llmProvider.generateResponse(messages),
        3, // 3 retry attempts
        20000, // 20 second timeout per attempt
        `${this.participant.name} evaluating objection`
      );
      return response.content.toUpperCase().includes('YES');
    } catch (error) {
      console.error('Error evaluating objection:', error);
      return Math.random() > 0.7;
    }
  }

  async processEvidence(evidence: Evidence): Promise<void> {
    const analysis = `Evidence: ${evidence.title} - ${evidence.description}`;
    this.memory.shortTerm.push(analysis);
    
    if (this.memory.shortTerm.length > 20) {
      const itemToArchive = this.memory.shortTerm.shift();
      if (itemToArchive && Math.random() > 0.3) {
        this.memory.longTerm.push(itemToArchive);
      }
    }

    this.memory.workingMemory.set(evidence.id, {
      importance: this.evaluateEvidenceImportance(evidence),
      relevance: this.evaluateEvidenceRelevance(evidence),
      credibility: Math.random() * 0.5 + 0.5,
    });
  }

  private evaluateEvidenceImportance(evidence: Evidence): number {
    const typeWeights: Record<string, number> = {
      'document': 0.7,
      'video': 0.9,
      'testimony': 0.6,
      'physical': 0.8,
      'image': 0.7,
      'audio': 0.75,
    };
    return typeWeights[evidence.type] || 0.5;
  }

  private evaluateEvidenceRelevance(evidence: Evidence): number {
    return Math.random() * 0.4 + 0.6;
  }

  updateEmotionalState(event: string, impact: number): void {
    const emotionImpacts: Record<string, Record<string, number>> = {
      'objection_sustained': {
        'frustration': 0.2,
        'confidence': -0.1,
        'stress': 0.1,
      },
      'objection_overruled': {
        'satisfaction': 0.1,
        'confidence': 0.1,
        'stress': -0.05,
      },
      'strong_evidence_presented': {
        'stress': 0.15,
        'confidence': -0.2,
      },
      'witness_supportive': {
        'confidence': 0.2,
        'satisfaction': 0.15,
        'stress': -0.1,
      },
    };

    const impacts = emotionImpacts[event] || {};
    for (const [emotion, change] of Object.entries(impacts)) {
      const current = this.emotionalState.get(emotion) || 0.5;
      this.emotionalState.set(emotion, Math.max(0, Math.min(1, current + change * impact)));
    }
  }

  private updateMemory(content: string): void {
    this.memory.shortTerm.push(content);
    if (this.memory.shortTerm.length > 10) {
      this.memory.shortTerm.shift();
    }
  }

  private updateCognitiveLoad(delta: number): void {
    this.cognitiveLoad = Math.max(0, Math.min(1, this.cognitiveLoad + delta));
  }

  private buildSystemPrompt(): string {
    return `You are ${this.participant.name}, a ${this.participant.role} in a courtroom.

Background:
- Education: ${this.participant.background.education}
- Experience: ${this.participant.background.experience}
- Age: ${this.participant.background.age}

Personality traits:
- Assertiveness: ${this.participant.personality.assertiveness}/10
- Empathy: ${this.participant.personality.empathy}/10
- Analytical thinking: ${this.participant.personality.analyticalThinking}/10
- Emotional stability: ${this.participant.personality.emotionalStability}/10
- Persuasiveness: ${this.participant.personality.persuasiveness}/10

Current motivations: ${this.participant.background.motivations.join(', ')}

Act according to your role and personality. Be professional and follow courtroom decorum.`;
  }

  private parseActionType(action: string): AgentAction['type'] {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('object')) return 'object';
    if (actionLower.includes('motion')) return 'motion';
    if (actionLower.includes('exhibit')) return 'exhibit';
    if (actionLower.includes('think')) return 'think';
    if (actionLower.includes('react')) return 'react';
    return 'speak';
  }

  private generateDefaultThoughts(context: string): string[] {
    return [
      `Processing: ${context}`,
      `Considering my role as ${this.participant.role}`,
      `Evaluating the best course of action`,
    ];
  }

  private generateDefaultAction(context: string, availableActions: string[]): AgentAction {
    return {
      type: 'speak',
      content: availableActions[0] || 'Continue',
      confidence: 0.5,
      reasoning: 'Default action based on context',
    };
  }

  private generateDefaultStatement(context: string): string {
    // Enhanced fallback statements based on context and role
    const contextKey = this.getContextualKey(context);
    
    const statements: Record<ParticipantRole, Record<string, string[]>> = {
      'judge': {
        'opening': [
          'We are now ready to begin this trial. Prosecution, please proceed with your opening statement.',
          'Ladies and gentlemen of the jury, you will now hear opening statements from both sides.',
          'Counsel, please present your opening statements to the jury.'
        ],
        'closing': [
          'Ladies and gentlemen of the jury, you will now hear closing arguments from both sides.',
          'The evidence phase is complete. We proceed to closing arguments.',
          'Counsel, please present your final arguments to the jury.'
        ],
        'motion': [
          'I have reviewed the motion and supporting papers. Counsel, please present your arguments.',
          'The court will hear arguments on the pending motion.',
          'Counsel, please proceed with your motion argument.'
        ],
        'default': [
          'Please proceed with your next witness.',
          'Sustained. The jury will disregard.',
          'Overruled. You may continue.',
          'The objection is noted. Please move on.'
        ]
      },
      'prosecutor': {
        'opening': [
          'Ladies and gentlemen of the jury, the evidence in this case will prove beyond a reasonable doubt that the defendant committed the crimes charged.',
          'Your Honor, members of the jury, at the conclusion of this trial, I will ask you to find the defendant guilty as charged.',
          'The evidence will show that on the night in question, the defendant\'s actions constituted a clear violation of New York State law.'
        ],
        'closing': [
          'Ladies and gentlemen, the evidence has proven beyond a reasonable doubt that the defendant is guilty of all charges.',
          'The facts are clear, the evidence is overwhelming, and justice demands a guilty verdict.',
          'Based on the testimony and evidence presented, we ask you to hold the defendant accountable for these crimes.'
        ],
        'witness': [
          'Officer, please tell the jury what you observed at the scene.',
          'Can you identify the defendant for the court?',
          'What did you do next in your investigation?'
        ],
        'default': [
          'Objection, your honor - relevance.',
          'The People have no further questions.',
          'We would like to admit this exhibit into evidence.'
        ]
      },
      'defense-attorney': {
        'opening': [
          'Ladies and gentlemen of the jury, my client is presumed innocent until proven guilty beyond a reasonable doubt.',
          'The prosecution\'s case is built on speculation and insufficient evidence. The defense will show reasonable doubt exists.',
          'At the end of this trial, I will ask you to find my client not guilty because the prosecution has failed to meet their burden.'
        ],
        'closing': [
          'The prosecution has failed to prove guilt beyond a reasonable doubt. You must find my client not guilty.',
          'The evidence does not support the charges. There is reasonable doubt, and you must acquit.',
          'Justice requires that you return a verdict of not guilty based on the lack of credible evidence.'
        ],
        'witness': [
          'Isn\'t it true that you didn\'t have a clear view of the events?',
          'You\'ve changed your story since your initial statement, haven\'t you?',
          'You cannot be certain of your identification, can you?'
        ],
        'default': [
          'Objection - leading the witness.',
          'I have no further questions for this witness.',
          'Your Honor, I move for a directed verdict.'
        ]
      },
      'plaintiff-attorney': {
        'opening': [
          'Members of the jury, the evidence will show that the defendant\'s negligence caused significant harm to my client.',
          'At the conclusion of this trial, we will ask you to hold the defendant accountable for the damages they caused.',
          'The facts will demonstrate that the defendant breached their duty of care, resulting in serious injury to the plaintiff.'
        ],
        'closing': [
          'The evidence clearly shows the defendant\'s liability. We ask for fair compensation for our client\'s injuries.',
          'Justice requires that the defendant be held responsible for the harm they caused.',
          'Based on the evidence, we request that you award damages that fully compensate our client.'
        ],
        'witness': [
          'Please describe for the jury how this incident has affected your life.',
          'Can you tell us about your medical treatment following the accident?',
          'What ongoing difficulties do you face as a result of this incident?'
        ],
        'default': [
          'Objection - assumes facts not in evidence.',
          'We have no further questions.',
          'I would like to present Plaintiff\'s Exhibit A.'
        ]
      },
      'witness': {
        'direct': [
          'I was present at the scene on the night in question.',
          'I clearly observed what happened.',
          'Yes, I can identify the person I saw.',
          'The events occurred just as I described.'
        ],
        'cross': [
          'I\'m telling the truth to the best of my ability.',
          'I remember the events clearly.',
          'My testimony today is consistent with what I observed.',
          'I have no reason to lie about what I saw.'
        ],
        'default': [
          'Yes, that\'s correct.',
          'No, that did not happen.',
          'I don\'t recall those specific details.',
          'To the best of my knowledge, yes.'
        ]
      },
      'defendant': {
        'testimony': [
          'I did not commit the crimes I\'m charged with.',
          'I was not at the location during the time in question.',
          'I have been honest about my whereabouts that evening.',
          'The identification is mistaken - it was not me.'
        ],
        'default': [
          'Not guilty, your honor.',
          'I understand my rights.',
          'Yes, your honor.',
          'No, your honor.'
        ]
      },
      'plaintiff': {
        'testimony': [
          'The accident has completely changed my life.',
          'I was not at fault for what happened.',
          'The pain and suffering has been tremendous.',
          'I just want to be made whole again.'
        ],
        'default': [
          'Yes, that\'s exactly what happened.',
          'The defendant was clearly negligent.',
          'I\'ve suffered significant damages.',
          'That is correct, your honor.'
        ]
      },
      'jury-member': {
        'default': ['[Listening attentively]', '[Taking notes]', '[Observing evidence]']
      },
      'bailiff': {
        'default': ['All rise for the Honorable Judge.', 'Please be seated.', 'Order in the court.']
      },
      'court-clerk': {
        'default': ['Case number called.', 'Exhibit marked for identification.', 'So noted by the court.']
      },
      'observer': {
        'default': ['[Observing proceedings silently]']
      }
    };

    const roleStatements = statements[this.participant.role] || { default: ['[No statement available]'] };
    const contextualStatements = roleStatements[contextKey] || roleStatements.default || ['[No statement available]'];
    
    return contextualStatements[Math.floor(Math.random() * contextualStatements.length)];
  }

  private getContextualKey(context: string): string {
    const contextLower = context.toLowerCase();
    
    if (contextLower.includes('opening statement') || contextLower.includes('opening')) return 'opening';
    if (contextLower.includes('closing argument') || contextLower.includes('closing')) return 'closing';
    if (contextLower.includes('motion') || contextLower.includes('pretrial')) return 'motion';
    if (contextLower.includes('witness examination') || contextLower.includes('direct examination')) return 'witness';
    if (contextLower.includes('cross examination') || contextLower.includes('cross-examination')) return 'cross';
    if (contextLower.includes('testimony') || contextLower.includes('testify')) return 'testimony';
    if (contextLower.includes('direct examination')) return 'direct';
    
    return 'default';
  }

  getMemorySummary(): string {
    return `Short-term: ${this.memory.shortTerm.slice(-3).join('; ')}
Long-term highlights: ${this.memory.longTerm.slice(0, 3).join('; ')}
Beliefs: ${Array.from(this.memory.beliefs.entries()).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
  }

  getEmotionalStateSummary(): string {
    return Array.from(this.emotionalState.entries())
      .map(([emotion, level]) => `${emotion}: ${(level * 100).toFixed(0)}%`)
      .join(', ');
  }

  setCurrentCase(caseData: Case | null): void {
    this.currentCase = caseData;
    if (caseData) {
      // Update agent knowledge with case-specific NYS law context
      this.updateCaseSpecificKnowledge(caseData);
    }
  }

  private updateCaseSpecificKnowledge(caseData: Case): void {
    let caseKnowledge: string[] = [];
    
    // Add case type specific knowledge
    if (caseData.type === 'criminal' && caseData.charges) {
      caseKnowledge.push(`Criminal case under NY Penal Law`);
      caseData.charges.forEach(charge => {
        caseKnowledge.push(`Charge: ${charge} - NY Penal Law criminal offense`);
      });
    } else if (caseData.type === 'civil') {
      caseKnowledge.push(`Civil case under NY CPLR procedures`);
      caseKnowledge.push(`Burden: Preponderance of evidence`);
    }
    
    // Add jurisdiction info
    if (caseData.legalSystem === 'common-law') {
      caseKnowledge.push(`New York State common law applies`);
    }
    
    // Update working memory
    this.memory.workingMemory.set('case-law-context', {
      importance: 0.9,
      relevance: 1.0,
      details: caseKnowledge.join('; ')
    });
  }
}