import { v4 as uuidv4 } from 'uuid';
import { Case, Participant, TranscriptEntry, ProceedingPhase } from '../types/index.js';

/**
 * Service for managing legal cases in the courtroom simulator.
 * Handles case CRUD operations, participant management, transcript tracking, and phase transitions.
 * 
 * @class CaseService
 * @example
 * const caseService = new CaseService();
 * const newCase = await caseService.createCase({ title: 'Smith vs Jones', type: 'civil', ... });
 */
export class CaseService {
  private cases: Map<string, Case> = new Map();

  /**
   * Retrieves all cases with optional filtering and pagination.
   * 
   * @param userId - Optional user ID to filter cases
   * @param limit - Maximum number of cases to return (default: 50)
   * @param offset - Number of cases to skip for pagination (default: 0)
   * @returns Promise resolving to array of cases, sorted by updatedAt descending
   * @example
   * const cases = await caseService.getAllCases('user-123', 10, 0);
   */
  async getAllCases(userId?: string, limit = 50, offset = 0): Promise<Case[]> {
    let allCases = Array.from(this.cases.values());
    
    if (userId) {
      allCases = allCases.filter(case_ => case_.userId === userId);
    }
    
    allCases.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    
    return allCases.slice(offset, offset + limit);
  }

  /**
   * Retrieves a specific case by its ID.
   * 
   * @param id - Unique case identifier
   * @returns Promise resolving to the case or null if not found
   */
  async getCaseById(id: string): Promise<Case | null> {
    return this.cases.get(id) || null;
  }

  /**
   * Creates a new legal case.
   * Automatically generates UUID for case and participants, sets timestamps,
   * and initializes case to 'pre-trial' phase.
   * 
   * @param caseData - Partial case data including title, type, summary, participants
   * @returns Promise resolving to the newly created case
   * @example
   * const newCase = await caseService.createCase({
   *   title: 'Smith vs Jones',
   *   type: 'civil',
   *   summary: 'Contract dispute',
   *   participants: [{ name: 'Judge', role: 'judge', aiControlled: true }]
   * });
   */
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

  /**
   * Updates an existing case with new data.
   * Automatically updates the updatedAt timestamp.
   * 
   * @param id - Case identifier
   * @param updates - Partial case data to update
   * @returns Promise resolving to updated case or null if not found
   */
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

  /**
   * Deletes a case by its ID.
   * 
   * @param id - Case identifier
   * @returns Promise resolving to true if deleted, false if not found
   */
  async deleteCase(id: string): Promise<boolean> {
    return this.cases.delete(id);
  }

  /**
   * Adds a participant to an existing case.
   * Automatically generates UUID for the participant.
   * 
   * @param caseId - Case identifier
   * @param participant - Participant data without ID
   * @returns Promise resolving to updated case or null if case not found
   * @example
   * await caseService.addParticipant('case-123', {
   *   name: 'Jane Doe',
   *   role: 'witness',
   *   aiControlled: true
   * });
   */
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

  /**
   * Updates a participant in a case.
   * 
   * @param caseId - Case identifier
   * @param participantId - Participant identifier
   * @param updates - Partial participant data to update
   * @returns Promise resolving to updated case or null if case/participant not found
   */
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

  /**
   * Removes a participant from a case.
   * 
   * @param caseId - Case identifier
   * @param participantId - Participant identifier
   * @returns Promise resolving to updated case or null if case/participant not found
   */
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

  /**
   * Retrieves the transcript for a case.
   * 
   * @param caseId - Case identifier
   * @returns Promise resolving to transcript entries or null if case not found
   */
  async getTranscript(caseId: string): Promise<TranscriptEntry[] | null> {
    const case_ = this.cases.get(caseId);
    return case_?.transcript || null;
  }

  /**
   * Adds a new entry to the case transcript.
   * Automatically generates ID and timestamp for the entry.
   * 
   * @param caseId - Case identifier
   * @param entry - Transcript entry data without ID and timestamp
   * @returns Promise resolving to updated case or null if case not found
   * @example
   * await caseService.addTranscriptEntry('case-123', {
   *   speaker: 'Judge',
   *   content: 'Court is in session',
   *   type: 'statement'
   * });
   */
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

  /**
   * Updates the current phase of a case.
   * Valid phases: pre-trial, jury-selection, opening-statements, plaintiff-case,
   * defense-case, closing-arguments, jury-deliberation, verdict, sentencing.
   * 
   * @param caseId - Case identifier
   * @param phase - New proceeding phase
   * @returns Promise resolving to updated case or null if case not found
   */
  async updatePhase(caseId: string, phase: ProceedingPhase): Promise<Case | null> {
    const case_ = this.cases.get(caseId);
    if (!case_) return null;

    case_.currentPhase = phase;
    case_.updatedAt = new Date();

    this.cases.set(caseId, case_);
    return case_;
  }

  /**
   * Retrieves statistics about all cases in the system.
   * Provides counts by type (civil/criminal) and by current phase.
   * 
   * @returns Promise resolving to case statistics
   * @example
   * const stats = await caseService.getCaseStats();
   * console.log(`Total cases: ${stats.totalCases}`);
   * console.log(`Civil: ${stats.casesByType.civil}, Criminal: ${stats.casesByType.criminal}`);
   */
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