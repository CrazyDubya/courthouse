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
    if (!this.llmProvider) {
      return this.generateDefaultStatement(context);
    }

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

    try {
      const response = await this.llmProvider.generateResponse(messages);
      this.updateMemory(response.content);
      return response.content;
    } catch (error) {
      console.error('Error generating statement:', error);
      return this.generateDefaultStatement(context);
    }
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
      const response = await this.llmProvider.generateResponse(messages);
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
    const statements: Record<ParticipantRole, string[]> = {
      'judge': ['Order in the court', 'Objection overruled', 'Sustained', 'Please proceed'],
      'prosecutor': ['Objection, your honor', 'The state rests', 'I would like to present evidence'],
      'defense-attorney': ['Objection, speculation', 'My client is innocent', 'I move to dismiss'],
      'plaintiff-attorney': ['We seek justice', 'The evidence clearly shows', 'My client has suffered'],
      'witness': ['Yes', 'No', "I don't recall", 'To the best of my knowledge'],
      'defendant': ['Not guilty', 'I plead the fifth', "I don't remember"],
      'plaintiff': ['That is correct', 'Yes, your honor', 'The defendant caused'],
      'jury-member': ['[Observing quietly]', '[Taking notes]'],
      'bailiff': ['All rise', 'Please be seated', 'Order'],
      'court-clerk': ['Case number', 'Entered into evidence', 'So noted'],
      'observer': ['[Watching proceedings]'],
    };

    const roleStatements = statements[this.participant.role] || ['[No statement]'];
    return roleStatements[Math.floor(Math.random() * roleStatements.length)];
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
}