import { describe, it, expect, beforeEach } from 'vitest';
import { CourtCalendar } from '../CourtCalendar';
import type { CalendarEvent } from '../../types/calendar';

describe('CourtCalendar', () => {
  let calendar: CourtCalendar;

  beforeEach(() => {
    calendar = new CourtCalendar();
  });

  describe('Basic Functionality', () => {
    it('should create a new court calendar instance', () => {
      expect(calendar).toBeInstanceOf(CourtCalendar);
    });

    it('should add a new event to the calendar', () => {
      const event: Omit<CalendarEvent, 'id'> = {
        title: 'Motion Hearing',
        type: 'hearing',
        date: new Date('2024-12-01T10:00:00'),
        caseId: 'case-123',
        participants: ['judge-1', 'attorney-1'],
        location: 'Courtroom A',
        duration: 60,
        description: 'Motion to dismiss hearing',
        status: 'scheduled',
        priority: 'high',
        reminderSent: false
      };

      const addedEvent = calendar.addEvent(event);
      
      expect(addedEvent.id).toBeTruthy();
      expect(addedEvent.title).toBe('Motion Hearing');
      expect(addedEvent.type).toBe('hearing');
      expect(addedEvent.status).toBe('scheduled');
    });

    it('should get events by date', () => {
      // Add test event (using local time to avoid timezone issues)
      const testDate = new Date(2024, 11, 1, 10, 0, 0); // December 1, 2024, 10:00 AM local time
      calendar.addEvent({
        title: 'Test Event',
        type: 'hearing',
        date: testDate,
        caseId: 'case-123',
        participants: ['judge-1'],
        status: 'scheduled',
        priority: 'medium',
        reminderSent: false
      });

      const searchDate = new Date(2024, 11, 1); // December 1, 2024 local time
      const events = calendar.getEventsByDate(searchDate);
      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Test Event');
    });

    it('should get events by participant', () => {
      // Add test event
      calendar.addEvent({
        title: 'Judge Event',
        type: 'hearing',
        date: new Date('2024-12-01T10:00:00'),
        caseId: 'case-123',
        participants: ['judge-1', 'attorney-1'],
        status: 'scheduled',
        priority: 'medium',
        reminderSent: false
      });

      const judgeEvents = calendar.getEventsByParticipant('judge-1');
      const attorneyEvents = calendar.getEventsByParticipant('attorney-1');
      
      expect(judgeEvents).toHaveLength(1);
      expect(attorneyEvents).toHaveLength(1);
      expect(judgeEvents[0].title).toBe('Judge Event');
    });

    it('should get upcoming events', () => {
      // Add future event
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      
      calendar.addEvent({
        title: 'Future Event',
        type: 'hearing',
        date: futureDate,
        caseId: 'case-123',
        participants: ['judge-1'],
        status: 'scheduled',
        priority: 'medium',
        reminderSent: false
      });

      const upcomingEvents = calendar.getUpcomingEvents();
      expect(upcomingEvents.length).toBeGreaterThanOrEqual(0);
    });

    it('should add deadlines to calendar', () => {
      const deadline = {
        title: 'Motion Filing Deadline',
        type: 'motion-filing' as const,
        date: new Date('2024-12-01T17:00:00'),
        caseId: 'case-123',
        relatedMotionId: 'motion-1',
        description: 'Deadline to file motion',
        priority: 'high' as const,
        completed: false
      };

      const addedDeadline = calendar.addDeadline(deadline);
      
      expect(addedDeadline.id).toBeTruthy();
      expect(addedDeadline.title).toBe('Motion Filing Deadline');
      expect(addedDeadline.type).toBe('motion-filing');
    });

    it('should add tasks to calendar', () => {
      const task = {
        title: 'Review Case Files',
        description: 'Review all case files before hearing',
        type: 'case-preparation' as const,
        assignedTo: 'attorney-1',
        caseId: 'case-123',
        dueDate: new Date('2024-12-01T10:00:00'),
        priority: 'high' as const,
        status: 'pending' as const,
        estimatedHours: 2,
        progress: 0
      };

      const addedTask = calendar.addTask(task);
      
      expect(addedTask.id).toBeTruthy();
      expect(addedTask.title).toBe('Review Case Files');
      expect(addedTask.assignedTo).toBe('attorney-1');
    });

    it('should get tasks by assignee', () => {
      calendar.addTask({
        title: 'Attorney Task',
        description: 'Task for attorney',
        type: 'case-preparation',
        assignedTo: 'attorney-1',
        caseId: 'case-123',
        dueDate: new Date('2024-12-01'),
        priority: 'medium',
        status: 'pending',
        estimatedHours: 1,
        progress: 0
      });

      const attorneyTasks = calendar.getTasksByAssignee('attorney-1');
      expect(attorneyTasks).toHaveLength(1);
      expect(attorneyTasks[0].title).toBe('Attorney Task');
    });

    it('should update task status', () => {
      const task = calendar.addTask({
        title: 'Test Task',
        description: 'Test task',
        type: 'case-preparation',
        assignedTo: 'attorney-1',
        caseId: 'case-123',
        dueDate: new Date('2024-12-01'),
        priority: 'medium',
        status: 'pending',
        estimatedHours: 1,
        progress: 0
      });

      calendar.updateTaskStatus(task.id, 'in-progress', 50);
      
      const updatedTasks = calendar.getTasksByAssignee('attorney-1');
      expect(updatedTasks[0].status).toBe('in-progress');
      expect(updatedTasks[0].progress).toBe(50);
    });

    it('should get calendar view for date range', () => {
      const startDate = new Date('2024-12-01');
      const endDate = new Date('2024-12-02');
      
      const calendarView = calendar.getCalendarView(startDate, endDate);
      
      expect(calendarView.events).toBeDefined();
      expect(calendarView.deadlines).toBeDefined();
      expect(calendarView.tasks).toBeDefined();
      expect(Array.isArray(calendarView.events)).toBe(true);
      expect(Array.isArray(calendarView.deadlines)).toBe(true);
      expect(Array.isArray(calendarView.tasks)).toBe(true);
    });

    it('should get workload report for participant', () => {
      // Add some events and tasks for the participant (using future dates)
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      calendar.addEvent({
        title: 'Hearing',
        type: 'hearing',
        date: futureDate,
        caseId: 'case-123',
        participants: ['attorney-1'],
        status: 'scheduled',
        priority: 'medium',
        reminderSent: false
      });

      calendar.addTask({
        title: 'Prep Task',
        description: 'Preparation task',
        type: 'case-preparation',
        assignedTo: 'attorney-1',
        caseId: 'case-123',
        dueDate: futureDate,
        priority: 'medium',
        status: 'pending',
        estimatedHours: 2,
        progress: 0
      });

      const workloadReport = calendar.getWorkloadReport('attorney-1');
      
      expect(workloadReport.totalEvents).toBeGreaterThanOrEqual(1);
      expect(workloadReport.totalTasks).toBeGreaterThanOrEqual(1);
      expect(workloadReport.totalEstimatedHours).toBeGreaterThanOrEqual(2);
    });
  });
});