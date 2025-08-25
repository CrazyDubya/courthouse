import { 
  JudgeMemory, 
  CaseMemory, 
  ExperienceMemory, 
  ParticipantMemory, 
  HistoricalDecision,
  EnhancedJudgeProfile 
} from '../types/judge';
import { Case, CaseType, ParticipantRole, Participant, Ruling } from '../types';

export class MemoryManager {
  private judgeId: string;
  private memory: JudgeMemory;

  constructor(judgeId: string, initialMemory?: Partial<JudgeMemory>) {
    this.judgeId = judgeId;
    this.memory = {
      cases: [],
      experience: this.initializeExperience(),
      participants: [],
      decisions: [],
      enabled: true,
      retentionPeriod: 1825, // 5 years default
      ...initialMemory
    };
  }

  private initializeExperience(): ExperienceMemory {
    return {
      totalCasesPresided: 0,
      casesByType: {
        'criminal': 0,
        'civil': 0,
        'family': 0,
        'corporate': 0,
        'constitutional': 0
      },
      convictionRate: 0,
      plaintiffWinRate: 0,
      appealRate: 0,
      reversalRate: 0,
      averageSentenceLength: 0,
      averageDamageAward: 0,
      motionsGranted: 0,
      motionsDenied: 0,
      objectionsIssued: 0,
      contemptCitations: 0,
      yearsOnBench: 0,
      careerStartDate: new Date(),
      retirementEligible: false
    };
  }

  // Memory toggle for one-off simulations
  public toggleMemory(enabled: boolean): void {
    this.memory.enabled = enabled;
  }

  public isMemoryEnabled(): boolean {
    return this.memory.enabled;
  }

  // Case Memory Management
  public recordCase(caseData: Case, outcome: string, notableEvents: string[]): void {
    if (!this.memory.enabled) return;

    const caseMemory: CaseMemory = {
      caseId: caseData.id,
      caseType: caseData.type,
      participants: caseData.participants.map(p => p.name),
      outcome,
      notableEvents,
      personalNotes: this.generatePersonalNotes(caseData, outcome, notableEvents),
      timestamp: new Date()
    };

    this.memory.cases.push(caseMemory);
    this.updateExperienceFromCase(caseData, outcome);
    this.cleanupOldCases();
  }

  private generatePersonalNotes(caseData: Case, outcome: string, events: string[]): string {
    const notes = [];
    
    if (events.length > 5) {
      notes.push("Complex case with many procedural issues");
    }
    
    if (events.some(e => e.includes('objection'))) {
      notes.push("Contentious atmosphere between attorneys");
    }
    
    if (caseData.evidence.length > 10) {
      notes.push("Evidence-heavy case requiring careful analysis");
    }
    
    return notes.join('; ');
  }

  private updateExperienceFromCase(caseData: Case, outcome: string): void {
    this.memory.experience.totalCasesPresided++;
    this.memory.experience.casesByType[caseData.type]++;
    
    // Update conviction rate for criminal cases
    if (caseData.type === 'criminal') {
      const criminalCases = this.memory.experience.casesByType.criminal;
      const convictions = this.memory.cases.filter(c => 
        c.caseType === 'criminal' && 
        (c.outcome.includes('guilty') || c.outcome.includes('convicted'))
      ).length;
      this.memory.experience.convictionRate = convictions / criminalCases;
    }
    
    // Update plaintiff win rate for civil cases
    if (caseData.type === 'civil') {
      const civilCases = this.memory.experience.casesByType.civil;
      const plaintiffWins = this.memory.cases.filter(c => 
        c.caseType === 'civil' && 
        (c.outcome.includes('plaintiff') || c.outcome.includes('awarded'))
      ).length;
      this.memory.experience.plaintiffWinRate = plaintiffWins / civilCases;
    }
  }

  public getCaseHistory(caseType?: CaseType): CaseMemory[] {
    if (!this.memory.enabled) return [];
    
    if (caseType) {
      return this.memory.cases.filter(c => c.caseType === caseType);
    }
    return this.memory.cases;
  }

  public findSimilarCases(currentCase: Case, limit: number = 5): CaseMemory[] {
    if (!this.memory.enabled) return [];
    
    return this.memory.cases
      .filter(c => c.caseType === currentCase.type)
      .sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        
        // Score based on participant overlap
        const currentParticipants = currentCase.participants.map(p => p.name);
        scoreA += a.participants.filter(p => currentParticipants.includes(p)).length;
        scoreB += b.participants.filter(p => currentParticipants.includes(p)).length;
        
        // Score based on recency
        const daysDiffA = (Date.now() - a.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        const daysDiffB = (Date.now() - b.timestamp.getTime()) / (1000 * 60 * 60 * 24);
        scoreA += Math.max(0, 365 - daysDiffA) / 365;
        scoreB += Math.max(0, 365 - daysDiffB) / 365;
        
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  // Participant Memory Management
  public recordParticipantInteraction(participant: Participant, caseOutcome: string, performance: 'excellent' | 'good' | 'average' | 'poor' | 'problematic'): void {
    if (!this.memory.enabled) return;

    const existing = this.memory.participants.find(p => p.participantName === participant.name);
    
    if (existing) {
      existing.casesWithParticipant++;
      existing.lastAppearance = new Date();
      this.updateParticipantStats(existing, caseOutcome, performance);
    } else {
      const newParticipant: ParticipantMemory = {
        participantName: participant.name,
        role: participant.role,
        casesWithParticipant: 1,
        winRate: this.calculateInitialWinRate(caseOutcome),
        credibilityScore: this.mapPerformanceToCredibility(performance),
        notableQualities: this.inferQualities(participant, performance),
        lastAppearance: new Date(),
        relationship: this.mapPerformanceToRelationship(performance),
        personalNotes: `First appearance: ${performance} performance`
      };
      this.memory.participants.push(newParticipant);
    }
  }

  private calculateInitialWinRate(outcome: string): number {
    if (outcome.includes('guilty') || outcome.includes('liable') || outcome.includes('awarded')) {
      return outcome.includes('prosecution') || outcome.includes('plaintiff') ? 1.0 : 0.0;
    }
    return 0.5; // Neutral for unclear outcomes
  }

  private mapPerformanceToCredibility(performance: string): number {
    const credibilityMap = {
      'excellent': 9,
      'good': 7,
      'average': 5,
      'poor': 3,
      'problematic': 1
    };
    return credibilityMap[performance as keyof typeof credibilityMap] || 5;
  }

  private mapPerformanceToRelationship(performance: string): ParticipantMemory['relationship'] {
    if (performance === 'excellent') return 'respected';
    if (performance === 'good') return 'positive';
    if (performance === 'problematic') return 'problematic';
    if (performance === 'poor') return 'negative';
    return 'neutral';
  }

  private inferQualities(participant: Participant, performance: string): string[] {
    const qualities = [];
    
    if (performance === 'excellent') {
      qualities.push('well-prepared', 'professional', 'respectful');
    } else if (performance === 'good') {
      qualities.push('competent', 'prepared');
    } else if (performance === 'poor') {
      qualities.push('unprepared', 'disorganized');
    } else if (performance === 'problematic') {
      qualities.push('disruptive', 'unprofessional', 'contemptuous');
    }
    
    // Add role-specific qualities
    if (participant.role === 'prosecutor' || participant.role === 'plaintiff-attorney') {
      if (participant.personality.assertiveness > 7) {
        qualities.push('aggressive');
      }
    }
    
    if (participant.personality.conscientiousness > 8) {
      qualities.push('detail-oriented');
    }
    
    return qualities;
  }

  private updateParticipantStats(participant: ParticipantMemory, outcome: string, performance: string): void {
    // Update credibility based on performance
    const performanceScore = this.mapPerformanceToCredibility(performance);
    participant.credibilityScore = (participant.credibilityScore + performanceScore) / 2;
    
    // Update relationship based on repeated interactions
    if (performance === 'problematic' && participant.relationship !== 'problematic') {
      participant.relationship = 'negative';
    } else if (performance === 'excellent' && participant.casesWithParticipant > 3) {
      participant.relationship = 'respected';
    }
    
    // Add new qualities
    const newQualities = this.inferQualities({ personality: { conscientiousness: 5, assertiveness: 5 } } as Participant, performance);
    newQualities.forEach(quality => {
      if (!participant.notableQualities.includes(quality)) {
        participant.notableQualities.push(quality);
      }
    });
  }

  public getParticipantHistory(participantName: string): ParticipantMemory | undefined {
    if (!this.memory.enabled) return undefined;
    return this.memory.participants.find(p => p.participantName === participantName);
  }

  public getParticipantsByRole(role: ParticipantRole): ParticipantMemory[] {
    if (!this.memory.enabled) return [];
    return this.memory.participants.filter(p => p.role === role);
  }

  // Decision Memory Management
  public recordDecision(
    caseId: string,
    decisionType: HistoricalDecision['decisionType'],
    subject: string,
    decision: string,
    reasoning: string,
    personalFactors: string[],
    confidence: number
  ): void {
    if (!this.memory.enabled) return;

    const historicalDecision: HistoricalDecision = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      caseId,
      decisionType,
      subject,
      decision,
      reasoning,
      personalFactors,
      confidence,
      appealed: false
    };

    this.memory.decisions.push(historicalDecision);
    this.updateExperienceFromDecision(decisionType, decision);
  }

  private updateExperienceFromDecision(type: HistoricalDecision['decisionType'], decision: string): void {
    if (type === 'motion') {
      if (decision.includes('granted') || decision.includes('sustained')) {
        this.memory.experience.motionsGranted++;
      } else {
        this.memory.experience.motionsDenied++;
      }
    }
    
    if (type === 'objection') {
      this.memory.experience.objectionsIssued++;
    }
    
    if (decision.includes('contempt')) {
      this.memory.experience.contemptCitations++;
    }
  }

  public getDecisionHistory(caseId?: string): HistoricalDecision[] {
    if (!this.memory.enabled) return [];
    
    if (caseId) {
      return this.memory.decisions.filter(d => d.caseId === caseId);
    }
    return this.memory.decisions;
  }

  public getDecisionPatterns(decisionType?: HistoricalDecision['decisionType']): any {
    if (!this.memory.enabled) return {};
    
    const decisions = decisionType 
      ? this.memory.decisions.filter(d => d.decisionType === decisionType)
      : this.memory.decisions;
      
    const patterns = {
      totalDecisions: decisions.length,
      averageConfidence: decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length,
      mostCommonFactors: this.getMostCommonPersonalFactors(decisions),
      decisionDistribution: this.getDecisionDistribution(decisions),
      appealRate: decisions.filter(d => d.appealed).length / decisions.length
    };
    
    return patterns;
  }

  private getMostCommonPersonalFactors(decisions: HistoricalDecision[]): string[] {
    const factorCounts: Record<string, number> = {};
    
    decisions.forEach(d => {
      d.personalFactors.forEach(factor => {
        factorCounts[factor] = (factorCounts[factor] || 0) + 1;
      });
    });
    
    return Object.entries(factorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([factor]) => factor);
  }

  private getDecisionDistribution(decisions: HistoricalDecision[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    decisions.forEach(d => {
      const key = d.decision.split(' ')[0].toLowerCase(); // First word of decision
      distribution[key] = (distribution[key] || 0) + 1;
    });
    
    return distribution;
  }

  // Memory maintenance
  public cleanupOldCases(): void {
    if (!this.memory.enabled) return;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.memory.retentionPeriod);
    
    this.memory.cases = this.memory.cases.filter(c => c.timestamp > cutoffDate);
    this.memory.decisions = this.memory.decisions.filter(d => d.timestamp > cutoffDate);
  }

  public exportMemory(): JudgeMemory {
    return JSON.parse(JSON.stringify(this.memory));
  }

  public importMemory(memory: JudgeMemory): void {
    this.memory = { ...memory };
  }

  public getMemoryStats(): any {
    return {
      enabled: this.memory.enabled,
      totalCases: this.memory.cases.length,
      totalParticipants: this.memory.participants.length,
      totalDecisions: this.memory.decisions.length,
      experience: this.memory.experience,
      retentionPeriod: this.memory.retentionPeriod,
      oldestCase: this.memory.cases.length > 0 
        ? Math.min(...this.memory.cases.map(c => c.timestamp.getTime()))
        : null,
      newestCase: this.memory.cases.length > 0
        ? Math.max(...this.memory.cases.map(c => c.timestamp.getTime()))
        : null
    };
  }

  // Influence decision making based on memory
  public getDecisionInfluence(context: {
    participants: Participant[];
    caseType: CaseType;
    subject: string;
  }): {
    experienceWeight: number;
    participantBias: number;
    precedentStrength: number;
    confidence: number;
  } {
    if (!this.memory.enabled) {
      return {
        experienceWeight: 0,
        participantBias: 0,
        precedentStrength: 0,
        confidence: 5
      };
    }

    const similarCases = this.findSimilarCases({ 
      type: context.caseType, 
      participants: context.participants 
    } as Case);
    
    const participantHistory = context.participants
      .map(p => this.getParticipantHistory(p.name))
      .filter(Boolean) as ParticipantMemory[];
    
    const experienceWeight = Math.min(this.memory.experience.totalCasesPresided / 100, 1);
    
    const participantBias = participantHistory.reduce((bias, p) => {
      if (p.relationship === 'respected') return bias + 0.2;
      if (p.relationship === 'positive') return bias + 0.1;
      if (p.relationship === 'negative') return bias - 0.1;
      if (p.relationship === 'problematic') return bias - 0.2;
      return bias;
    }, 0) / participantHistory.length || 0;
    
    const precedentStrength = similarCases.length > 0 ? Math.min(similarCases.length / 5, 1) : 0;
    
    const confidence = 5 + (experienceWeight * 3) + (precedentStrength * 2);
    
    return {
      experienceWeight,
      participantBias,
      precedentStrength,
      confidence: Math.min(confidence, 10)
    };
  }
}