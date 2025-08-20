import { v4 as uuidv4 } from 'uuid';
import { Case, ProceedingPhase, Participant } from '../types/index.js';

export interface SessionState {
  id: string;
  caseId: string;
  userId?: string;
  status: 'active' | 'paused' | 'completed' | 'terminated';
  currentPhase: ProceedingPhase;
  currentSpeaker?: string;
  isAutoProgress: boolean;
  settings: {
    realtimeSpeed: number;
    enableObjections: boolean;
    jurySize: number;
  };
  aiProcessing: {
    isProcessing: boolean;
    operation?: string;
    progress?: { current: number; total: number };
    activeRequests: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
}

export interface SessionEvent {
  id: string;
  sessionId: string;
  type: 'phase_change' | 'speaker_change' | 'ai_start' | 'ai_complete' | 'user_action' | 'system_event';
  data: Record<string, any>;
  timestamp: Date;
}

export class SessionService {
  private sessions = new Map<string, SessionState>();
  private sessionEvents = new Map<string, SessionEvent[]>();
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.startCleanupTimer();
  }

  async createSession(caseId: string, userId?: string): Promise<SessionState> {
    const sessionId = uuidv4();
    const now = new Date();

    const session: SessionState = {
      id: sessionId,
      caseId,
      userId,
      status: 'active',
      currentPhase: 'pre-trial',
      isAutoProgress: false,
      settings: {
        realtimeSpeed: 1.0,
        enableObjections: true,
        jurySize: 12
      },
      aiProcessing: {
        isProcessing: false,
        activeRequests: []
      },
      createdAt: now,
      updatedAt: now,
      lastActivity: now
    };

    this.sessions.set(sessionId, session);
    this.sessionEvents.set(sessionId, []);

    await this.addSessionEvent(sessionId, {
      type: 'system_event',
      data: { event: 'session_created', caseId, userId }
    });

    console.log(`Session ${sessionId} created for case ${caseId}`);
    return session;
  }

  async getSession(sessionId: string): Promise<SessionState | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.lastActivity = new Date();
    return session;
  }

  async updateSession(sessionId: string, updates: Partial<SessionState>): Promise<SessionState | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const updatedSession: SessionState = {
      ...session,
      ...updates,
      id: sessionId,
      updatedAt: new Date(),
      lastActivity: new Date()
    };

    this.sessions.set(sessionId, updatedSession);

    await this.addSessionEvent(sessionId, {
      type: 'system_event',
      data: { event: 'session_updated', updates }
    });

    return updatedSession;
  }

  async pauseSession(sessionId: string): Promise<SessionState | null> {
    const session = await this.updateSession(sessionId, { status: 'paused' });
    
    if (session) {
      await this.addSessionEvent(sessionId, {
        type: 'user_action',
        data: { action: 'pause_session' }
      });
    }

    return session;
  }

  async resumeSession(sessionId: string): Promise<SessionState | null> {
    const session = await this.updateSession(sessionId, { status: 'active' });
    
    if (session) {
      await this.addSessionEvent(sessionId, {
        type: 'user_action',
        data: { action: 'resume_session' }
      });
    }

    return session;
  }

  async terminateSession(sessionId: string): Promise<boolean> {
    const session = await this.updateSession(sessionId, { status: 'terminated' });
    
    if (session) {
      await this.addSessionEvent(sessionId, {
        type: 'user_action',
        data: { action: 'terminate_session' }
      });

      console.log(`Session ${sessionId} terminated`);
      return true;
    }

    return false;
  }

  async updatePhase(sessionId: string, phase: ProceedingPhase): Promise<SessionState | null> {
    const session = await this.updateSession(sessionId, { currentPhase: phase });
    
    if (session) {
      await this.addSessionEvent(sessionId, {
        type: 'phase_change',
        data: { oldPhase: session.currentPhase, newPhase: phase }
      });
    }

    return session;
  }

  async updateCurrentSpeaker(sessionId: string, speakerId?: string): Promise<SessionState | null> {
    const session = await this.updateSession(sessionId, { currentSpeaker: speakerId });
    
    if (session) {
      await this.addSessionEvent(sessionId, {
        type: 'speaker_change',
        data: { speakerId }
      });
    }

    return session;
  }

  async setAIProcessing(
    sessionId: string, 
    isProcessing: boolean, 
    operation?: string, 
    progress?: { current: number; total: number }
  ): Promise<SessionState | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.aiProcessing.isProcessing = isProcessing;
    session.aiProcessing.operation = operation;
    session.aiProcessing.progress = progress;
    session.lastActivity = new Date();

    this.sessions.set(sessionId, session);

    await this.addSessionEvent(sessionId, {
      type: isProcessing ? 'ai_start' : 'ai_complete',
      data: { operation, progress }
    });

    return session;
  }

  async addActiveRequest(sessionId: string, requestId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session && !session.aiProcessing.activeRequests.includes(requestId)) {
      session.aiProcessing.activeRequests.push(requestId);
      session.lastActivity = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  async removeActiveRequest(sessionId: string, requestId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.aiProcessing.activeRequests = session.aiProcessing.activeRequests.filter(
        id => id !== requestId
      );
      session.lastActivity = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  async getUserSessions(userId: string): Promise<SessionState[]> {
    const userSessions = Array.from(this.sessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

    return userSessions;
  }

  async getActiveSessions(): Promise<SessionState[]> {
    const activeSessions = Array.from(this.sessions.values())
      .filter(session => session.status === 'active')
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

    return activeSessions;
  }

  async getSessionEvents(sessionId: string, limit = 100, offset = 0): Promise<SessionEvent[]> {
    const events = this.sessionEvents.get(sessionId) || [];
    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
  }

  private async addSessionEvent(sessionId: string, eventData: {
    type: SessionEvent['type'];
    data: Record<string, any>;
  }): Promise<void> {
    const events = this.sessionEvents.get(sessionId) || [];
    
    const event: SessionEvent = {
      id: uuidv4(),
      sessionId,
      ...eventData,
      timestamp: new Date()
    };

    events.push(event);

    const MAX_EVENTS_PER_SESSION = 1000;
    if (events.length > MAX_EVENTS_PER_SESSION) {
      events.splice(0, events.length - MAX_EVENTS_PER_SESSION);
    }

    this.sessionEvents.set(sessionId, events);
  }

  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    pausedSessions: number;
    completedSessions: number;
    terminatedSessions: number;
  }> {
    const allSessions = Array.from(this.sessions.values());
    
    return {
      totalSessions: allSessions.length,
      activeSessions: allSessions.filter(s => s.status === 'active').length,
      pausedSessions: allSessions.filter(s => s.status === 'paused').length,
      completedSessions: allSessions.filter(s => s.status === 'completed').length,
      terminatedSessions: allSessions.filter(s => s.status === 'terminated').length
    };
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000); // Run every hour
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
      
      if (timeSinceLastActivity > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
        this.sessionEvents.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      this.sessionEvents.delete(sessionId);
      console.log(`Session ${sessionId} deleted`);
    }
    return deleted;
  }
}