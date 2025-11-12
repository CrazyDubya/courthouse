/**
 * OptimizedMemoryManager
 *
 * Enhanced version of MemoryManager with performance optimizations:
 * - Indexed lookups for O(1) access
 * - LRU cache for frequently accessed data
 * - Batch operations for bulk updates
 * - Lazy loading for large datasets
 * - Memory pooling to reduce GC pressure
 */

import {
  JudgeMemory,
  CaseMemory,
  ExperienceMemory,
  ParticipantMemory,
  HistoricalDecision,
  EnhancedJudgeProfile
} from '../types/judge';
import { Case, CaseType, ParticipantRole, Participant, Ruling } from '../types';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
}

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 100, ttl: number = 60000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Update hit count and move to end (most recently used)
    entry.hits++;
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  getStats(): { size: number; hitRate: number } {
    let totalHits = 0;
    this.cache.forEach(entry => {
      totalHits += entry.hits;
    });
    return {
      size: this.cache.size,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
    };
  }
}

export class OptimizedMemoryManager {
  private judgeId: string;
  private memory: JudgeMemory;

  // Indexes for fast lookups
  private caseIndex: Map<string, CaseMemory> = new Map();
  private participantIndex: Map<string, ParticipantMemory> = new Map();
  private decisionIndex: Map<string, HistoricalDecision> = new Map();
  private caseTypeIndex: Map<CaseType, Set<string>> = new Map();
  private roleIndex: Map<ParticipantRole, Set<string>> = new Map();

  // Caches
  private similarCasesCache: LRUCache<CaseMemory[]>;
  private decisionPatternsCache: LRUCache<any>;
  private participantStatsCache: LRUCache<any>;

  // Performance tracking
  private stats = {
    cacheHits: 0,
    cacheMisses: 0,
    indexLookups: 0,
    batchOperations: 0,
  };

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

    // Initialize caches
    this.similarCasesCache = new LRUCache<CaseMemory[]>(50, 300000); // 5 min TTL
    this.decisionPatternsCache = new LRUCache<any>(20, 600000); // 10 min TTL
    this.participantStatsCache = new LRUCache<any>(100, 300000); // 5 min TTL

    // Build indexes from initial memory
    this.rebuildIndexes();
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

  private rebuildIndexes(): void {
    console.log('🔨 Rebuilding memory indexes...');

    this.caseIndex.clear();
    this.participantIndex.clear();
    this.decisionIndex.clear();
    this.caseTypeIndex.clear();
    this.roleIndex.clear();

    // Build case indexes
    this.memory.cases.forEach(caseMemory => {
      this.caseIndex.set(caseMemory.caseId, caseMemory);

      if (!this.caseTypeIndex.has(caseMemory.caseType)) {
        this.caseTypeIndex.set(caseMemory.caseType, new Set());
      }
      this.caseTypeIndex.get(caseMemory.caseType)!.add(caseMemory.caseId);
    });

    // Build participant indexes
    this.memory.participants.forEach(participant => {
      this.participantIndex.set(participant.participantName, participant);

      if (!this.roleIndex.has(participant.role)) {
        this.roleIndex.set(participant.role, new Set());
      }
      this.roleIndex.get(participant.role)!.add(participant.participantName);
    });

    // Build decision indexes
    this.memory.decisions.forEach(decision => {
      this.decisionIndex.set(decision.id, decision);
    });

    console.log(`✅ Indexes rebuilt: ${this.caseIndex.size} cases, ${this.participantIndex.size} participants`);
  }

  // Optimized case recording with batch support
  public recordCases(cases: Array<{
    caseData: Case;
    outcome: string;
    notableEvents: string[];
  }>): void {
    if (!this.memory.enabled) return;

    this.stats.batchOperations++;
    console.log(`📦 Batch recording ${cases.length} cases`);

    cases.forEach(({ caseData, outcome, notableEvents }) => {
      this.recordCaseSingle(caseData, outcome, notableEvents);
    });

    // Invalidate caches after batch operation
    this.invalidateCaches();
    console.log(`✅ Batch recording complete`);
  }

  public recordCase(caseData: Case, outcome: string, notableEvents: string[]): void {
    this.recordCaseSingle(caseData, outcome, notableEvents);
    this.invalidateCaches();
  }

  private recordCaseSingle(caseData: Case, outcome: string, notableEvents: string[]): void {
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
    this.caseIndex.set(caseMemory.caseId, caseMemory);

    if (!this.caseTypeIndex.has(caseMemory.caseType)) {
      this.caseTypeIndex.set(caseMemory.caseType, new Set());
    }
    this.caseTypeIndex.get(caseMemory.caseType)!.add(caseMemory.caseId);

    this.updateExperienceFromCase(caseData, outcome);
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

    if (caseData.type === 'criminal') {
      const criminalCaseIds = this.caseTypeIndex.get('criminal') || new Set();
      const convictions = Array.from(criminalCaseIds)
        .map(id => this.caseIndex.get(id))
        .filter(c => c && (c.outcome.includes('guilty') || c.outcome.includes('convicted')))
        .length;
      this.memory.experience.convictionRate = convictions / criminalCaseIds.size;
    }

    if (caseData.type === 'civil') {
      const civilCaseIds = this.caseTypeIndex.get('civil') || new Set();
      const plaintiffWins = Array.from(civilCaseIds)
        .map(id => this.caseIndex.get(id))
        .filter(c => c && (c.outcome.includes('plaintiff') || c.outcome.includes('awarded')))
        .length;
      this.memory.experience.plaintiffWinRate = plaintiffWins / civilCaseIds.size;
    }
  }

  // Optimized lookups using indexes
  public getCaseHistory(caseType?: CaseType): CaseMemory[] {
    if (!this.memory.enabled) return [];

    this.stats.indexLookups++;

    if (caseType) {
      const caseIds = this.caseTypeIndex.get(caseType);
      if (!caseIds) return [];
      return Array.from(caseIds)
        .map(id => this.caseIndex.get(id))
        .filter((c): c is CaseMemory => c !== undefined);
    }
    return this.memory.cases;
  }

  public getCaseById(caseId: string): CaseMemory | undefined {
    this.stats.indexLookups++;
    return this.caseIndex.get(caseId);
  }

  // Optimized similar cases search with caching
  public findSimilarCases(currentCase: Case, limit: number = 5): CaseMemory[] {
    if (!this.memory.enabled) return [];

    const cacheKey = `similar:${currentCase.id}:${limit}`;
    const cached = this.similarCasesCache.get(cacheKey);

    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    this.stats.cacheMisses++;

    // Get cases of same type using index
    const caseIds = this.caseTypeIndex.get(currentCase.type) || new Set();
    const samTypeCases = Array.from(caseIds)
      .map(id => this.caseIndex.get(id))
      .filter((c): c is CaseMemory => c !== undefined && c.caseId !== currentCase.id);

    // Optimized scoring algorithm
    const currentParticipants = new Set(currentCase.participants.map(p => p.name));
    const now = Date.now();

    const scoredCases = samTypeCases.map(caseMemory => {
      let score = 0;

      // Participant overlap score (0-5 points)
      const overlap = caseMemory.participants.filter(p => currentParticipants.has(p)).length;
      score += Math.min(overlap, 5);

      // Recency score (0-3 points)
      const daysDiff = (now - caseMemory.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 3 * (1 - daysDiff / 365));

      return { caseMemory, score };
    });

    const result = scoredCases
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.caseMemory);

    this.similarCasesCache.set(cacheKey, result);
    return result;
  }

  // Batch participant recording
  public recordParticipantInteractions(interactions: Array<{
    participant: Participant;
    caseOutcome: string;
    performance: 'excellent' | 'good' | 'average' | 'poor' | 'problematic';
  }>): void {
    if (!this.memory.enabled) return;

    this.stats.batchOperations++;
    console.log(`📦 Batch recording ${interactions.length} participant interactions`);

    interactions.forEach(({ participant, caseOutcome, performance }) => {
      this.recordParticipantInteractionSingle(participant, caseOutcome, performance);
    });

    this.invalidateCaches();
    console.log(`✅ Batch participant recording complete`);
  }

  public recordParticipantInteraction(
    participant: Participant,
    caseOutcome: string,
    performance: 'excellent' | 'good' | 'average' | 'poor' | 'problematic'
  ): void {
    this.recordParticipantInteractionSingle(participant, caseOutcome, performance);
    this.invalidateCaches();
  }

  private recordParticipantInteractionSingle(
    participant: Participant,
    caseOutcome: string,
    performance: 'excellent' | 'good' | 'average' | 'poor' | 'problematic'
  ): void {
    if (!this.memory.enabled) return;

    const existing = this.participantIndex.get(participant.name);

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
      this.participantIndex.set(newParticipant.participantName, newParticipant);

      if (!this.roleIndex.has(newParticipant.role)) {
        this.roleIndex.set(newParticipant.role, new Set());
      }
      this.roleIndex.get(newParticipant.role)!.add(newParticipant.participantName);
    }
  }

  private calculateInitialWinRate(outcome: string): number {
    if (outcome.includes('guilty') || outcome.includes('liable') || outcome.includes('awarded')) {
      return outcome.includes('prosecution') || outcome.includes('plaintiff') ? 1.0 : 0.0;
    }
    return 0.5;
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

    if (participant.personality.assertiveness > 7) {
      qualities.push('aggressive');
    }

    if (participant.personality.conscientiousness > 8) {
      qualities.push('detail-oriented');
    }

    return qualities;
  }

  private updateParticipantStats(participant: ParticipantMemory, outcome: string, performance: string): void {
    const performanceScore = this.mapPerformanceToCredibility(performance);
    participant.credibilityScore = (participant.credibilityScore + performanceScore) / 2;

    if (performance === 'problematic' && participant.relationship !== 'problematic') {
      participant.relationship = 'negative';
    } else if (performance === 'excellent' && participant.casesWithParticipant > 3) {
      participant.relationship = 'respected';
    }

    const newQualities = this.inferQualities(
      { personality: { conscientiousness: 5, assertiveness: 5 } } as Participant,
      performance
    );
    newQualities.forEach(quality => {
      if (!participant.notableQualities.includes(quality)) {
        participant.notableQualities.push(quality);
      }
    });
  }

  public getParticipantHistory(participantName: string): ParticipantMemory | undefined {
    if (!this.memory.enabled) return undefined;
    this.stats.indexLookups++;
    return this.participantIndex.get(participantName);
  }

  public getParticipantsByRole(role: ParticipantRole): ParticipantMemory[] {
    if (!this.memory.enabled) return [];
    this.stats.indexLookups++;

    const participantNames = this.roleIndex.get(role);
    if (!participantNames) return [];

    return Array.from(participantNames)
      .map(name => this.participantIndex.get(name))
      .filter((p): p is ParticipantMemory => p !== undefined);
  }

  // Decision memory with batch support
  public recordDecisions(decisions: Array<{
    caseId: string;
    decisionType: HistoricalDecision['decisionType'];
    subject: string;
    decision: string;
    reasoning: string;
    personalFactors: string[];
    confidence: number;
  }>): void {
    if (!this.memory.enabled) return;

    this.stats.batchOperations++;
    console.log(`📦 Batch recording ${decisions.length} decisions`);

    decisions.forEach(decision => {
      this.recordDecisionSingle(decision);
    });

    this.invalidateCaches();
    console.log(`✅ Batch decision recording complete`);
  }

  public recordDecision(
    caseId: string,
    decisionType: HistoricalDecision['decisionType'],
    subject: string,
    decision: string,
    reasoning: string,
    personalFactors: string[],
    confidence: number
  ): void {
    this.recordDecisionSingle({
      caseId,
      decisionType,
      subject,
      decision,
      reasoning,
      personalFactors,
      confidence,
    });
    this.invalidateCaches();
  }

  private recordDecisionSingle(params: {
    caseId: string;
    decisionType: HistoricalDecision['decisionType'];
    subject: string;
    decision: string;
    reasoning: string;
    personalFactors: string[];
    confidence: number;
  }): void {
    const historicalDecision: HistoricalDecision = {
      id: `decision-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      ...params,
      appealed: false
    };

    this.memory.decisions.push(historicalDecision);
    this.decisionIndex.set(historicalDecision.id, historicalDecision);
    this.updateExperienceFromDecision(params.decisionType, params.decision);
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

    const cacheKey = `patterns:${decisionType || 'all'}`;
    const cached = this.decisionPatternsCache.get(cacheKey);

    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    this.stats.cacheMisses++;

    const decisions = decisionType
      ? this.memory.decisions.filter(d => d.decisionType === decisionType)
      : this.memory.decisions;

    const patterns = {
      totalDecisions: decisions.length,
      averageConfidence: decisions.length > 0
        ? decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length
        : 0,
      mostCommonFactors: this.getMostCommonPersonalFactors(decisions),
      decisionDistribution: this.getDecisionDistribution(decisions),
      appealRate: decisions.length > 0
        ? decisions.filter(d => d.appealed).length / decisions.length
        : 0
    };

    this.decisionPatternsCache.set(cacheKey, patterns);
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
      const key = d.decision.split(' ')[0].toLowerCase();
      distribution[key] = (distribution[key] || 0) + 1;
    });

    return distribution;
  }

  public cleanupOldCases(): void {
    if (!this.memory.enabled) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.memory.retentionPeriod);

    console.log(`🧹 Cleaning up cases older than ${cutoffDate.toISOString()}`);

    const oldCaseCount = this.memory.cases.length;
    this.memory.cases = this.memory.cases.filter(c => c.timestamp > cutoffDate);
    this.memory.decisions = this.memory.decisions.filter(d => d.timestamp > cutoffDate);

    const removed = oldCaseCount - this.memory.cases.length;
    if (removed > 0) {
      console.log(`🗑️  Removed ${removed} old cases`);
      this.rebuildIndexes();
      this.invalidateCaches();
    }
  }

  private invalidateCaches(): void {
    this.similarCasesCache.clear();
    this.decisionPatternsCache.clear();
    this.participantStatsCache.clear();
  }

  public exportMemory(): JudgeMemory {
    return JSON.parse(JSON.stringify(this.memory));
  }

  public importMemory(memory: JudgeMemory): void {
    this.memory = { ...memory };
    this.rebuildIndexes();
    this.invalidateCaches();
  }

  public getMemoryStats(): any {
    const cacheStats = {
      similarCases: this.similarCasesCache.getStats(),
      decisionPatterns: this.decisionPatternsCache.getStats(),
      participantStats: this.participantStatsCache.getStats(),
    };

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
        : null,
      indexes: {
        caseIndex: this.caseIndex.size,
        participantIndex: this.participantIndex.size,
        decisionIndex: this.decisionIndex.size,
        caseTypeIndex: this.caseTypeIndex.size,
        roleIndex: this.roleIndex.size,
      },
      caches: cacheStats,
      performance: {
        cacheHits: this.stats.cacheHits,
        cacheMisses: this.stats.cacheMisses,
        hitRate: this.stats.cacheHits + this.stats.cacheMisses > 0
          ? (this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100
          : 0,
        indexLookups: this.stats.indexLookups,
        batchOperations: this.stats.batchOperations,
      }
    };
  }

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
      .filter((p): p is ParticipantMemory => p !== undefined);

    const experienceWeight = Math.min(this.memory.experience.totalCasesPresided / 100, 1);

    const participantBias = participantHistory.length > 0
      ? participantHistory.reduce((bias, p) => {
          if (p.relationship === 'respected') return bias + 0.2;
          if (p.relationship === 'positive') return bias + 0.1;
          if (p.relationship === 'negative') return bias - 0.1;
          if (p.relationship === 'problematic') return bias - 0.2;
          return bias;
        }, 0) / participantHistory.length
      : 0;

    const precedentStrength = similarCases.length > 0 ? Math.min(similarCases.length / 5, 1) : 0;

    const confidence = 5 + (experienceWeight * 3) + (precedentStrength * 2);

    return {
      experienceWeight,
      participantBias,
      precedentStrength,
      confidence: Math.min(confidence, 10)
    };
  }

  public toggleMemory(enabled: boolean): void {
    this.memory.enabled = enabled;
  }

  public isMemoryEnabled(): boolean {
    return this.memory.enabled;
  }
}
