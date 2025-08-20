import { v4 as uuidv4 } from 'uuid';
import { Case, Participant, TranscriptEntry, ProceedingPhase } from '../types/index.js';

export class CaseService {
  private cases: Map<string, Case> = new Map();

  async getAllCases(userId?: string, limit = 50, offset = 0): Promise<Case[]> {
    let allCases = Array.from(this.cases.values());
    
    if (userId) {
      allCases = allCases.filter(case_ => case_.userId === userId);
    }
    
    allCases.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    
    return allCases.slice(offset, offset + limit);
  }

  async getCaseById(id: string): Promise<Case | null> {
    return this.cases.get(id) || null;
  }

  async createCase(caseData: Partial<Case>): Promise<Case> {
    const id = uuidv4();
    const now = new Date();
    
    const newCase: Case = {
      id,
      title: caseData.title || '',
      type: caseData.type || 'civil',
      summary: caseData.summary || '',
      participants: caseData.participants?.map(p => ({
        ...p,
        id: p.id || uuidv4()
      })) || [],
      evidence: [],
      transcript: [],
      rulings: [],
      currentPhase: 'pre-trial',
      settings: caseData.settings,
      createdAt: now,
      updatedAt: now,
      userId: caseData.userId
    };

    this.cases.set(id, newCase);
    return newCase;
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case | null> {
    const existingCase = this.cases.get(id);
    if (!existingCase) return null;

    const updatedCase: Case = {
      ...existingCase,
      ...updates,
      id,
      participants: updates.participants?.map(p => ({
        ...p,
        id: p.id || uuidv4()
      })) || existingCase.participants,
      updatedAt: new Date()
    };

    this.cases.set(id, updatedCase);
    return updatedCase;
  }

  async deleteCase(id: string): Promise<boolean> {
    return this.cases.delete(id);
  }

  async addParticipant(caseId: string, participant: Omit<Participant, 'id'>): Promise<Case | null> {
    const case_ = this.cases.get(caseId);
    if (!case_) return null;

    const newParticipant: Participant = {
      ...participant,
      id: uuidv4()
    };

    case_.participants.push(newParticipant);
    case_.updatedAt = new Date();

    this.cases.set(caseId, case_);
    return case_;
  }

  async updateParticipant(
    caseId: string, 
    participantId: string, 
    updates: Partial<Participant>
  ): Promise<Case | null> {
    const case_ = this.cases.get(caseId);
    if (!case_) return null;

    const participantIndex = case_.participants.findIndex(p => p.id === participantId);
    if (participantIndex === -1) return null;

    case_.participants[participantIndex] = {
      ...case_.participants[participantIndex],
      ...updates,
      id: participantId
    };
    case_.updatedAt = new Date();

    this.cases.set(caseId, case_);
    return case_;
  }

  async removeParticipant(caseId: string, participantId: string): Promise<Case | null> {
    const case_ = this.cases.get(caseId);
    if (!case_) return null;

    const initialLength = case_.participants.length;
    case_.participants = case_.participants.filter(p => p.id !== participantId);
    
    if (case_.participants.length === initialLength) return null;

    case_.updatedAt = new Date();
    this.cases.set(caseId, case_);
    return case_;
  }

  async getTranscript(caseId: string): Promise<TranscriptEntry[] | null> {
    const case_ = this.cases.get(caseId);
    return case_?.transcript || null;
  }

  async addTranscriptEntry(
    caseId: string, 
    entry: Omit<TranscriptEntry, 'id' | 'timestamp'>
  ): Promise<Case | null> {
    const case_ = this.cases.get(caseId);
    if (!case_) return null;

    const newEntry: TranscriptEntry = {
      ...entry,
      id: uuidv4(),
      timestamp: new Date()
    };

    case_.transcript.push(newEntry);
    case_.updatedAt = new Date();

    this.cases.set(caseId, case_);
    return case_;
  }

  async updatePhase(caseId: string, phase: ProceedingPhase): Promise<Case | null> {
    const case_ = this.cases.get(caseId);
    if (!case_) return null;

    case_.currentPhase = phase;
    case_.updatedAt = new Date();

    this.cases.set(caseId, case_);
    return case_;
  }

  async getCaseStats(): Promise<{
    totalCases: number;
    casesByType: { civil: number; criminal: number };
    casesByPhase: Record<ProceedingPhase, number>;
  }> {
    const allCases = Array.from(this.cases.values());
    
    const casesByType = {
      civil: allCases.filter(c => c.type === 'civil').length,
      criminal: allCases.filter(c => c.type === 'criminal').length
    };

    const casesByPhase: Record<ProceedingPhase, number> = {
      'pre-trial': 0,
      'jury-selection': 0,
      'opening-statements': 0,
      'plaintiff-case': 0,
      'defense-case': 0,
      'closing-arguments': 0,
      'jury-deliberation': 0,
      'verdict': 0,
      'sentencing': 0
    };

    allCases.forEach(case_ => {
      casesByPhase[case_.currentPhase]++;
    });

    return {
      totalCases: allCases.length,
      casesByType,
      casesByPhase
    };
  }
}