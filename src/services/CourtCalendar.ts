import { 
  Motion, 
  MotionCalendarEntry, 
  MotionWorkflow, 
  MotionTimelineEntry,
  MotionStatus,
  DiscoveryType 
} from '../types/motions';
import { Case, CaseType, ParticipantRole } from '../types';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: Date;
  startTime?: string;
  endTime?: string;
  duration?: number; // minutes
  
  // Participants
  judge?: string;
  participants: string[];
  required_attendees: string[];
  optional_attendees: string[];
  
  // Location and logistics
  courtroom?: string;
  location?: string;
  virtual_hearing: boolean;
  recording_permitted: boolean;
  
  // Case and matter information
  caseId?: string;
  motionId?: string;
  matter_type: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Status and workflow
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  confirmation_required: boolean;
  reminder_sent: boolean;
  
  // Documentation
  description: string;
  preparation_requirements: string[];
  documents_required: string[];
  
  // Outcome tracking
  completed: boolean;
  outcome?: string;
  next_steps?: string[];
  follow_up_required?: boolean;
}

export type CalendarEventType = 
  | 'motion-hearing'
  | 'case-management-conference'
  | 'pre-trial-conference'
  | 'status-conference'
  | 'settlement-conference'
  | 'trial'
  | 'sentencing'
  | 'arraignment'
  | 'plea-hearing'
  | 'discovery-deadline'
  | 'filing-deadline'
  | 'response-deadline'
  | 'expert-disclosure'
  | 'witness-list-deadline'
  | 'dispositive-motion-deadline'
  | 'trial-preparation-deadline';

export interface Deadline {
  id: string;
  title: string;
  type: DeadlineType;
  date: Date;
  time?: string;
  
  // Responsible parties
  responsible_party: string; // Participant ID
  affected_parties: string[];
  
  // Case context
  caseId: string;
  motionId?: string;
  discovery_type?: DiscoveryType;
  
  // Requirements
  description: string;
  requirements: string[];
  format_requirements?: string;
  filing_location?: string;
  
  // Status tracking
  completed: boolean;
  completion_date?: Date;
  extension_requested?: boolean;
  extension_granted?: boolean;
  new_deadline?: Date;
  
  // Consequences
  penalty_for_missing: string;
  automatic_consequences: string[];
  judicial_discretion_factors: string[];
  
  // Notifications
  advance_notice_days: number[];
  reminders_sent: Date[];
  final_warning_sent?: Date;
}

export type DeadlineType = 
  | 'motion-filing'
  | 'motion-response'
  | 'motion-reply'
  | 'discovery-request'
  | 'discovery-response'
  | 'expert-disclosure'
  | 'witness-list'
  | 'exhibit-list'
  | 'pre-trial-brief'
  | 'settlement-demand'
  | 'jury-instructions'
  | 'verdict-forms'
  | 'sentencing-memo'
  | 'appeal-notice'
  | 'post-trial-motion';

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  
  // Assignment
  assignedTo: string; // Participant ID
  assignedBy?: string;
  assignedDate: Date;
  dueDate?: Date;
  
  // Case context
  caseId: string;
  motionId?: string;
  phase: string;
  
  // Task details
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimatedHours?: number;
  complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  
  // Dependencies
  dependsOn: string[]; // Other task IDs
  blocks: string[]; // Task IDs this blocks
  prerequisites: string[];
  
  // Status and progress
  status: TaskStatus;
  progress: number;
  startedDate?: Date;
  completedDate?: Date;
  
  // Collaboration
  collaborators: string[];
  reviewRequired: boolean;
  reviewer?: string;
  approvalRequired: boolean;
  approver?: string;
  
  // Documentation
  attachments: string[];
  notes: string[];
  timeLogged: number; // minutes
  
  // Quality control
  checklist: TaskChecklistItem[];
  qualityScore?: number;
  revisionCount: number;
}

export type TaskType = 
  | 'legal-research'
  | 'draft-motion'
  | 'draft-response'
  | 'draft-reply'
  | 'client-interview'
  | 'witness-interview'
  | 'document-review'
  | 'evidence-analysis'
  | 'expert-consultation'
  | 'settlement-negotiation'
  | 'trial-preparation'
  | 'discovery-request'
  | 'discovery-response'
  | 'case-strategy'
  | 'file-organization'
  | 'court-appearance'
  | 'administrative';

export type TaskStatus = 
  | 'not-started'
  | 'in-progress'
  | 'waiting-review'
  | 'waiting-approval'
  | 'waiting-input'
  | 'blocked'
  | 'completed'
  | 'cancelled'
  | 'overdue';

export interface TaskChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
  notes?: string;
}

export class CourtCalendar {
  private events: CalendarEvent[] = [];
  private deadlines: Deadline[] = [];
  private tasks: TaskItem[] = [];

  // Calendar Event Management
  public addEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...event
    };
    
    this.events.push(newEvent);
    this.checkForConflicts(newEvent);
    return newEvent;
  }

  public scheduleMotionHearing(
    motion: Motion, 
    judge: string, 
    preferredDate?: Date,
    duration: number = 60
  ): CalendarEvent {
    const hearingDate = preferredDate || this.getNextAvailableDate(judge, duration);
    
    return this.addEvent({
      title: `Motion Hearing: ${motion.title}`,
      type: 'motion-hearing',
      date: hearingDate,
      duration,
      judge,
      participants: [motion.filedBy, motion.filedAgainst || ''].filter(Boolean),
      required_attendees: [motion.filedBy, motion.filedAgainst || ''].filter(Boolean),
      optional_attendees: [],
      virtual_hearing: false,
      recording_permitted: true,
      caseId: motion.id.split('-')[0], // Extract case ID
      motionId: motion.id,
      matter_type: motion.type,
      priority: motion.urgent ? 'urgent' : 'normal',
      status: 'scheduled',
      confirmation_required: true,
      reminder_sent: false,
      description: `Hearing on ${motion.title}`,
      preparation_requirements: [
        'Review motion and supporting documents',
        'Prepare oral argument',
        'Research recent case law',
        'Prepare for questions from the court'
      ],
      documents_required: [
        'Motion and supporting exhibits',
        'Response brief (if applicable)',
        'Reply brief (if applicable)',
        'Relevant case law'
      ],
      completed: false
    });
  }

  public getEventsByDate(date: Date): CalendarEvent[] {
    // Normalize dates to local timezone for comparison
    const targetYear = date.getFullYear();
    const targetMonth = date.getMonth();
    const targetDay = date.getDate();
    
    return this.events.filter(event => {
      const eventYear = event.date.getFullYear();
      const eventMonth = event.date.getMonth();
      const eventDay = event.date.getDate();
      
      return eventYear === targetYear && 
             eventMonth === targetMonth && 
             eventDay === targetDay;
    });
  }

  public getEventsByParticipant(participantId: string): CalendarEvent[] {
    return this.events.filter(event => 
      event.participants.includes(participantId) ||
      event.required_attendees.includes(participantId)
    );
  }

  public getUpcomingEvents(days: number = 30): CalendarEvent[] {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.events.filter(event => 
      event.date >= new Date() && event.date <= futureDate
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Deadline Management
  public addDeadline(deadline: Omit<Deadline, 'id'>): Deadline {
    const newDeadline: Deadline = {
      id: `deadline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...deadline
    };
    
    this.deadlines.push(newDeadline);
    this.scheduleReminders(newDeadline);
    return newDeadline;
  }

  public createMotionDeadlines(motion: Motion): Deadline[] {
    const deadlines: Deadline[] = [];
    
    // Response deadline
    if (motion.responseDeadline) {
      deadlines.push(this.addDeadline({
        title: `Response to ${motion.title}`,
        type: 'motion-response',
        date: motion.responseDeadline,
        responsible_party: motion.filedAgainst || '',
        affected_parties: [motion.filedBy],
        caseId: motion.id.split('-')[0],
        motionId: motion.id,
        description: `Response to ${motion.title} due`,
        requirements: [
          'Address all arguments in motion',
          'Cite supporting legal authority',
          'Provide factual counter-arguments',
          'Follow local court rules for formatting'
        ],
        completed: false,
        penalty_for_missing: 'Motion may be granted as unopposed',
        automatic_consequences: ['Default consideration of motion'],
        judicial_discretion_factors: ['Good cause for extension', 'Prejudice to movant'],
        advance_notice_days: [14, 7, 3, 1]
      }));
    }
    
    // Reply deadline
    if (motion.replyDeadline) {
      deadlines.push(this.addDeadline({
        title: `Reply to Response for ${motion.title}`,
        type: 'motion-reply',
        date: motion.replyDeadline,
        responsible_party: motion.filedBy,
        affected_parties: [motion.filedAgainst || ''],
        caseId: motion.id.split('-')[0],
        motionId: motion.id,
        description: `Reply brief for ${motion.title} due`,
        requirements: [
          'Respond only to new arguments in response',
          'No new arguments or evidence',
          'Comply with page limits',
          'File by deadline or waive reply right'
        ],
        completed: false,
        penalty_for_missing: 'Waiver of reply right',
        automatic_consequences: ['Motion submitted on existing briefs'],
        judicial_discretion_factors: ['Significance of new arguments'],
        advance_notice_days: [7, 3, 1]
      }));
    }
    
    return deadlines;
  }

  public getOverdueDeadlines(): Deadline[] {
    const now = new Date();
    return this.deadlines.filter(deadline => 
      !deadline.completed && deadline.date < now
    );
  }

  public getUpcomingDeadlines(days: number = 14): Deadline[] {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    return this.deadlines.filter(deadline => 
      !deadline.completed && 
      deadline.date >= new Date() && 
      deadline.date <= futureDate
    ).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Task Management
  public addTask(task: Omit<TaskItem, 'id'>): TaskItem {
    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...task
    };
    
    this.tasks.push(newTask);
    return newTask;
  }

  public createMotionTasks(motion: Motion, assignedAttorney: string): TaskItem[] {
    const tasks: TaskItem[] = [];
    
    // Research task
    tasks.push(this.addTask({
      title: `Legal Research for ${motion.title}`,
      description: `Research legal authorities and precedents for ${motion.type}`,
      type: 'legal-research',
      assignedTo: assignedAttorney,
      assignedDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      caseId: motion.id.split('-')[0],
      motionId: motion.id,
      phase: 'pre-trial',
      priority: motion.urgent ? 'high' : 'normal',
      estimatedHours: 8,
      complexity: 'moderate',
      dependsOn: [],
      blocks: [],
      prerequisites: ['Access to legal database', 'Case file review'],
      status: 'not-started',
      progress: 0,
      collaborators: [],
      reviewRequired: true,
      approvalRequired: false,
      attachments: [],
      notes: [],
      timeLogged: 0,
      checklist: [
        { id: '1', description: 'Research controlling case law', completed: false, required: true },
        { id: '2', description: 'Review applicable statutes', completed: false, required: true },
        { id: '3', description: 'Find supporting precedents', completed: false, required: true },
        { id: '4', description: 'Identify counter-arguments', completed: false, required: true },
        { id: '5', description: 'Organize research findings', completed: false, required: true }
      ],
      revisionCount: 0
    }));
    
    // Drafting task
    tasks.push(this.addTask({
      title: `Draft ${motion.title}`,
      description: `Draft the motion brief and supporting documents`,
      type: 'draft-motion',
      assignedTo: assignedAttorney,
      assignedDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      caseId: motion.id.split('-')[0],
      motionId: motion.id,
      phase: 'pre-trial',
      priority: motion.urgent ? 'high' : 'normal',
      estimatedHours: 12,
      complexity: 'complex',
      dependsOn: [tasks[0].id],
      blocks: [],
      prerequisites: ['Completed legal research', 'Case facts summary'],
      status: 'not-started',
      progress: 0,
      collaborators: [],
      reviewRequired: true,
      approvalRequired: true,
      attachments: [],
      notes: [],
      timeLogged: 0,
      checklist: [
        { id: '1', description: 'Draft factual background', completed: false, required: true },
        { id: '2', description: 'Draft legal argument', completed: false, required: true },
        { id: '3', description: 'Cite supporting authorities', completed: false, required: true },
        { id: '4', description: 'Format according to court rules', completed: false, required: true },
        { id: '5', description: 'Proofread and edit', completed: false, required: true },
        { id: '6', description: 'Prepare exhibits', completed: false, required: false }
      ],
      revisionCount: 0
    }));
    
    return tasks;
  }

  public getTasksByAssignee(participantId: string): TaskItem[] {
    return this.tasks.filter(task => task.assignedTo === participantId);
  }

  public getOverdueTasks(): TaskItem[] {
    const now = new Date();
    return this.tasks.filter(task => 
      task.dueDate && 
      task.dueDate < now && 
      task.status !== 'completed' && 
      task.status !== 'cancelled'
    );
  }

  public updateTaskStatus(taskId: string, status: TaskStatus, progress?: number): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      if (progress !== undefined) {
        task.progress = progress;
      }
      if (status === 'completed') {
        task.completedDate = new Date();
        task.progress = 100;
      }
    }
  }

  // Utility Methods
  private getNextAvailableDate(judge: string, duration: number): Date {
    const today = new Date();
    let candidateDate = new Date(today);
    candidateDate.setDate(candidateDate.getDate() + 14); // Start 2 weeks out
    
    // Simple scheduling - find next available slot
    while (this.hasConflict(judge, candidateDate, duration)) {
      candidateDate.setDate(candidateDate.getDate() + 1);
    }
    
    return candidateDate;
  }

  private hasConflict(judge: string, date: Date, duration: number): boolean {
    const existingEvents = this.events.filter(event => 
      event.judge === judge && 
      event.date.toDateString() === date.toDateString()
    );
    
    // Simplified conflict detection
    return existingEvents.length > 0;
  }

  private checkForConflicts(newEvent: CalendarEvent): void {
    const conflicts = this.events.filter(event => 
      event.id !== newEvent.id &&
      event.date.toDateString() === newEvent.date.toDateString() &&
      (event.judge === newEvent.judge || 
       event.participants.some(p => newEvent.participants.includes(p)))
    );
    
    if (conflicts.length > 0) {
      console.warn(`Scheduling conflict detected for event ${newEvent.id}`);
    }
  }

  private scheduleReminders(deadline: Deadline): void {
    // Default to standard reminder schedule if advance_notice_days is missing
    const reminderDays = deadline.advance_notice_days || [7, 3, 1];
    
    reminderDays.forEach(days => {
      const reminderDate = new Date(deadline.date);
      reminderDate.setDate(reminderDate.getDate() - days);
      
      if (reminderDate > new Date()) {
        // In a real implementation, this would schedule actual reminders
        console.log(`Reminder scheduled for ${reminderDate.toISOString()} for deadline ${deadline.id}`);
      }
    });
  }

  // Calendar Views and Reports
  public getCalendarView(startDate: Date, endDate: Date): {
    events: CalendarEvent[];
    deadlines: Deadline[];
    tasks: TaskItem[];
  } {
    return {
      events: this.events.filter(e => e.date >= startDate && e.date <= endDate),
      deadlines: this.deadlines.filter(d => d.date >= startDate && d.date <= endDate),
      tasks: this.tasks.filter(t => t.dueDate && t.dueDate >= startDate && t.dueDate <= endDate)
    };
  }

  public getWorkloadReport(participantId: string): {
    upcomingEvents: CalendarEvent[];
    upcomingDeadlines: Deadline[];
    activeTasks: TaskItem[];
    overdueTasks: TaskItem[];
    workloadScore: number;
    totalEvents: number;
    totalTasks: number;
    totalEstimatedHours: number;
  } {
    const upcomingEvents = this.getEventsByParticipant(participantId)
      .filter(e => e.date >= new Date());
    
    const upcomingDeadlines = this.deadlines
      .filter(d => d.responsible_party === participantId && !d.completed && d.date >= new Date());
    
    const activeTasks = this.getTasksByAssignee(participantId)
      .filter(t => t.status !== 'completed' && t.status !== 'cancelled');
    
    const overdueTasks = activeTasks
      .filter(t => t.dueDate && t.dueDate < new Date());
    
    // Calculate totals
    const totalEvents = upcomingEvents.length;
    const totalTasks = activeTasks.length;
    const totalEstimatedHours = activeTasks
      .reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
    
    // Simple workload scoring
    const workloadScore = (
      upcomingEvents.length * 2 +
      upcomingDeadlines.length * 3 +
      activeTasks.length * 1 +
      overdueTasks.length * 5
    );
    
    return {
      upcomingEvents,
      upcomingDeadlines,
      activeTasks,
      overdueTasks,
      workloadScore,
      totalEvents,
      totalTasks,
      totalEstimatedHours
    };
  }
}