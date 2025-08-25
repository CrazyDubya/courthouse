import { 
  AttorneyOffice, 
  WorkSession, 
  WorkType, 
  Participant, 
  Location, 
  OfficeResource 
} from '../types';
import { CourtroomAgent } from './agents/CourtroomAgent';

export interface OfficeManagerCallbacks {
  onWorkStarted?: (session: WorkSession) => void;
  onWorkProgress?: (session: WorkSession) => void;
  onWorkCompleted?: (session: WorkSession) => void;
  onLocationChanged?: (participant: Participant, from: Location, to: Location) => void;
}

export class OfficeManager {
  private offices: Map<string, AttorneyOffice>;
  private activeSessions: Map<string, WorkSession>;
  private agents: Map<string, CourtroomAgent>;
  private callbacks?: OfficeManagerCallbacks;
  private sessionCounter: number = 0;

  constructor(agents: Map<string, CourtroomAgent>, callbacks?: OfficeManagerCallbacks) {
    this.offices = new Map();
    this.activeSessions = new Map();
    this.agents = agents;
    this.callbacks = callbacks;
    this.initializeOffices();
  }

  private initializeOffices(): void {
    // Prosecutor's Office
    const prosOffice: AttorneyOffice = {
      id: 'prosecutor-office',
      type: 'prosecutor',
      location: '3rd Floor, District Attorney Building',
      description: 'Well-lit office with law books, case files, and computer terminals for legal research',
      occupants: [],
      resources: [
        { id: 'pros-paralegal', type: 'paralegal', name: 'Senior Paralegal Jennifer', available: true },
        { id: 'pros-library', type: 'law-library', name: 'Criminal Law Library', available: true },
        { id: 'pros-computer1', type: 'computer', name: 'Legal Research Terminal', available: true },
        { id: 'pros-filing', type: 'filing-system', name: 'Case Filing System', available: true }
      ],
      activeWork: [],
      maxCapacity: 4
    };

    // Defense Attorney's Office
    const defenseOffice: AttorneyOffice = {
      id: 'defense-office',
      type: 'defense',
      location: '5th Floor, Legal Defense Building',
      description: 'Private office with client meeting area, legal research materials, and secure document storage',
      occupants: [],
      resources: [
        { id: 'def-paralegal', type: 'paralegal', name: 'Defense Paralegal Maria', available: true },
        { id: 'def-library', type: 'law-library', name: 'Defense Law Library', available: true },
        { id: 'def-computer1', type: 'computer', name: 'Research Workstation', available: true },
        { id: 'def-conference', type: 'conference-room', name: 'Client Conference Room', available: true }
      ],
      activeWork: [],
      maxCapacity: 3
    };

    // Plaintiff Attorney's Office (Civil Cases)
    const plaintiffOffice: AttorneyOffice = {
      id: 'plaintiff-office',
      type: 'plaintiff',
      location: '2nd Floor, Civil Litigation Center',
      description: 'Modern office equipped for civil litigation with document scanning and video conferencing',
      occupants: [],
      resources: [
        { id: 'plf-paralegal', type: 'paralegal', name: 'Civil Paralegal David', available: true },
        { id: 'plf-library', type: 'law-library', name: 'Civil Procedure Library', available: true },
        { id: 'plf-computer1', type: 'computer', name: 'Document Prep System', available: true },
        { id: 'plf-filing', type: 'filing-system', name: 'Civil Case Files', available: true }
      ],
      activeWork: [],
      maxCapacity: 3
    };

    this.offices.set('prosecutor-office', prosOffice);
    this.offices.set('defense-office', defenseOffice);
    this.offices.set('plaintiff-office', plaintiffOffice);
  }

  async sendToOffice(attorney: Participant, workType: WorkType, duration: number = 300000): Promise<string> {
    const officeType = this.getOfficeTypeForRole(attorney.role);
    const office = this.offices.get(`${officeType}-office`);
    
    if (!office) {
      throw new Error(`No office found for ${attorney.role}`);
    }

    if (office.occupants.length >= office.maxCapacity) {
      throw new Error(`Office is at capacity`);
    }

    // Move attorney to office
    const fromLocation = attorney.currentLocation;
    attorney.currentLocation = `${officeType}-office` as Location;
    attorney.isPresent = false;
    
    office.occupants.push(attorney);

    // Create work session
    const session: WorkSession = {
      id: `session-${this.sessionCounter++}`,
      attorney,
      type: workType,
      startTime: new Date(),
      duration,
      progress: 0,
      description: this.generateWorkDescription(workType, attorney),
      isComplete: false
    };

    this.activeSessions.set(session.id, session);
    office.activeWork.push(session);

    this.callbacks?.onLocationChanged?.(attorney, fromLocation, attorney.currentLocation);
    this.callbacks?.onWorkStarted?.(session);

    console.log(`📋 ${attorney.name} sent to ${office.location} for ${workType}`);

    // Start processing the work session
    this.processWorkSession(session);

    return session.id;
  }

  async returnToCourtroom(attorney: Participant): Promise<void> {
    const fromLocation = attorney.currentLocation;
    const office = this.offices.get(attorney.currentLocation);
    
    if (office) {
      // Remove from office
      office.occupants = office.occupants.filter(p => p.id !== attorney.id);
      
      // Complete any active work sessions
      const activeSessions = office.activeWork.filter(w => w.attorney.id === attorney.id);
      for (const session of activeSessions) {
        if (!session.isComplete) {
          session.isComplete = true;
          session.progress = Math.min(100, session.progress + 20); // Partial completion
          this.callbacks?.onWorkCompleted?.(session);
        }
      }
      office.activeWork = office.activeWork.filter(w => w.attorney.id !== attorney.id);
    }

    // Return to courtroom
    attorney.currentLocation = 'courtroom';
    attorney.isPresent = true;

    this.callbacks?.onLocationChanged?.(attorney, fromLocation, 'courtroom');
    console.log(`⚖️  ${attorney.name} returned to courtroom from ${fromLocation}`);
  }

  private async processWorkSession(session: WorkSession): Promise<void> {
    const progressInterval = Math.max(1000, session.duration / 10);
    const progressIncrement = 10;

    const interval = setInterval(async () => {
      if (session.isComplete) {
        clearInterval(interval);
        return;
      }

      session.progress = Math.min(100, session.progress + progressIncrement);
      this.callbacks?.onWorkProgress?.(session);

      // Generate work output periodically
      if (session.progress === 50) {
        await this.generateWorkOutput(session);
      }

      if (session.progress >= 100) {
        session.isComplete = true;
        await this.completeWorkSession(session);
        clearInterval(interval);
      }
    }, progressInterval);
  }

  private async generateWorkOutput(session: WorkSession): Promise<void> {
    const agent = this.agents.get(session.attorney.id);
    
    if (agent && session.attorney.aiControlled) {
      try {
        // Generate work output using the LLM agent
        const context = `You are working in your office on ${session.type}. ${session.description}`;
        const output = await agent.generateStatement(context);
        
        session.output = {
          type: this.getOutputType(session.type),
          content: output,
          impact: this.getWorkImpact(session.type)
        };

        // Add knowledge to attorney
        session.attorney.knowledge.push(`Completed ${session.type}: ${output.substring(0, 100)}...`);
        
        console.log(`📄 ${session.attorney.name} completed ${session.type}: ${session.output.content.substring(0, 50)}...`);
      } catch (error) {
        console.error(`Error generating work output for ${session.attorney.name}:`, error);
        // Use fallback
        session.output = {
          type: this.getOutputType(session.type),
          content: this.getFallbackOutput(session.type),
          impact: this.getWorkImpact(session.type)
        };
      }
    }
  }

  private async completeWorkSession(session: WorkSession): Promise<void> {
    console.log(`✅ ${session.attorney.name} completed ${session.type} work session`);
    this.callbacks?.onWorkCompleted?.(session);
  }

  private getOfficeTypeForRole(role: string): string {
    switch (role) {
      case 'prosecutor': return 'prosecutor';
      case 'defense-attorney': return 'defense';
      case 'plaintiff-attorney': return 'plaintiff';
      default: throw new Error(`No office type for role: ${role}`);
    }
  }

  private generateWorkDescription(workType: WorkType, attorney: Participant): string {
    const descriptions = {
      'research': `Researching case law and legal precedents relevant to the case`,
      'witness-prep': `Preparing witnesses for testimony, reviewing their statements and potential cross-examination`,
      'motion-drafting': `Drafting legal motions and reviewing procedural requirements`,
      'evidence-review': `Reviewing evidence, organizing exhibits, and preparing presentation strategy`,
      'strategy-session': `Developing case strategy and identifying strengths and weaknesses`,
      'client-meeting': `Meeting with client to discuss case developments and strategy`,
      'document-preparation': `Preparing legal documents, briefs, and filing requirements`
    };

    return descriptions[workType] || `Working on ${workType} for the case`;
  }

  private getOutputType(workType: WorkType): 'motion' | 'research-memo' | 'witness-notes' | 'strategy-plan' {
    const mapping = {
      'research': 'research-memo' as const,
      'witness-prep': 'witness-notes' as const,
      'motion-drafting': 'motion' as const,
      'evidence-review': 'strategy-plan' as const,
      'strategy-session': 'strategy-plan' as const,
      'client-meeting': 'witness-notes' as const,
      'document-preparation': 'motion' as const
    };

    return mapping[workType] || 'strategy-plan';
  }

  private getWorkImpact(workType: WorkType): string[] {
    const impacts = {
      'research': ['Enhanced legal arguments', 'Better case law citations', 'Stronger motions'],
      'witness-prep': ['More confident witnesses', 'Clearer testimony', 'Better cross-examination defense'],
      'motion-drafting': ['Professional legal filings', 'Procedural compliance', 'Strategic advantage'],
      'evidence-review': ['Organized evidence presentation', 'Strategic exhibit planning', 'Weakness identification'],
      'strategy-session': ['Cohesive case strategy', 'Risk assessment', 'Tactical planning'],
      'client-meeting': ['Client satisfaction', 'Clear communication', 'Informed decisions'],
      'document-preparation': ['Professional documentation', 'Compliance with rules', 'Effective filings']
    };

    return impacts[workType] || ['General case preparation'];
  }

  private getFallbackOutput(workType: WorkType): string {
    const fallbacks = {
      'research': 'I have reviewed relevant case law and identified key precedents that support our position. This research will strengthen our legal arguments.',
      'witness-prep': 'I have met with our witnesses and reviewed their testimony. They are now better prepared for direct examination and potential cross-examination.',
      'motion-drafting': 'I have prepared the necessary legal motions with proper citations and formatting. These filings comply with all procedural requirements.',
      'evidence-review': 'I have organized our evidence and planned the most effective presentation strategy. Our exhibits are now properly sequenced and cataloged.',
      'strategy-session': 'I have developed a comprehensive case strategy that addresses both our strengths and potential weaknesses. Our approach is now clearly defined.',
      'client-meeting': 'I have met with our client and discussed the current status of the case. They are now fully informed of recent developments.',
      'document-preparation': 'I have prepared all necessary legal documents and ensured they meet court requirements and deadlines.'
    };

    return fallbacks[workType] || 'I have completed the requested work and am prepared to proceed with the case.';
  }

  // Public methods for monitoring and control
  getOfficeStatus(officeId: string): AttorneyOffice | undefined {
    return this.offices.get(officeId);
  }

  getAllOffices(): AttorneyOffice[] {
    return Array.from(this.offices.values());
  }

  getActiveWorkSessions(): WorkSession[] {
    return Array.from(this.activeSessions.values());
  }

  async processAllOfficeWork(): Promise<void> {
    const allSessions = Array.from(this.activeSessions.values())
      .filter(session => !session.isComplete);
    
    // Process all office work in parallel
    const workPromises = allSessions.map(session => 
      this.processWorkSession(session)
    );

    await Promise.all(workPromises);
  }

  isAttorneyInOffice(attorney: Participant): boolean {
    return !attorney.isPresent && attorney.currentLocation !== 'courtroom';
  }

  getAttorneyWorkSessions(attorney: Participant): WorkSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.attorney.id === attorney.id);
  }
}