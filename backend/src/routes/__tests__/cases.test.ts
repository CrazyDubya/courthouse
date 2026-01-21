import { describe, it, expect, beforeEach, vi, type MockedFunction } from 'vitest';
import express from 'express';
import request from 'supertest';
import createCaseRoutes from '../cases.js';
import { CaseService } from '../../services/CaseService.js';
import { Case } from '../../types/index.js';

describe('Case Routes', () => {
  let app: express.Application;
  let mockCaseService: CaseService;

  const mockCase: Case = {
    id: 'case-123',
    title: 'Test Case',
    type: 'civil',
    summary: 'This is a test case summary',
    participants: [
      {
        id: 'participant-1',
        name: 'John Doe',
        role: 'plaintiff',
        description: 'Plaintiff in the case',
        aiControlled: false
      }
    ],
    currentPhase: 'pre-trial',
    transcript: [],
    settings: {
      realtimeSpeed: 1.0,
      autoProgress: false,
      jurySize: 12,
      enableObjections: true,
      complexityLevel: 'intermediate'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  beforeEach(() => {
    mockCaseService = {
      getAllCases: vi.fn(),
      getCaseById: vi.fn(),
      createCase: vi.fn(),
      updateCase: vi.fn(),
      deleteCase: vi.fn(),
      addParticipant: vi.fn(),
      updateParticipant: vi.fn(),
      removeParticipant: vi.fn(),
      getTranscript: vi.fn(),
      addTranscriptEntry: vi.fn(),
      updatePhase: vi.fn()
    } as CaseService;

    app = express();
    app.use(express.json());
    app.use('/api/cases', createCaseRoutes(mockCaseService));
  });

  describe('GET /api/cases', () => {
    it('should return all cases', async () => {
      const cases = [mockCase];
      (mockCaseService.getAllCases as MockedFunction<typeof mockCaseService.getAllCases>).mockResolvedValue(cases);

      const response = await request(app)
        .get('/api/cases')
        .query({ userId: 'user-123', limit: '50', offset: '0' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(cases)));
      expect(mockCaseService.getAllCases).toHaveBeenCalledWith('user-123', 50, 0);
    });

    it('should handle service errors', async () => {
      (mockCaseService.getAllCases as MockedFunction<typeof mockCaseService.getAllCases>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/cases');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Database error');
    });

    it('should use default limit and offset', async () => {
      (mockCaseService.getAllCases as MockedFunction<typeof mockCaseService.getAllCases>).mockResolvedValue([]);

      await request(app).get('/api/cases');

      expect(mockCaseService.getAllCases).toHaveBeenCalledWith(undefined, 50, 0);
    });
  });

  describe('GET /api/cases/:id', () => {
    it('should return a case by id', async () => {
      (mockCaseService.getCaseById as MockedFunction<typeof mockCaseService.getCaseById>).mockResolvedValue(mockCase);

      const response = await request(app)
        .get('/api/cases/case-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(mockCase)));
      expect(mockCaseService.getCaseById).toHaveBeenCalledWith('case-123');
    });

    it('should return 404 if case not found', async () => {
      (mockCaseService.getCaseById as MockedFunction<typeof mockCaseService.getCaseById>).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/cases/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Case not found');
    });

    it('should handle service errors', async () => {
      (mockCaseService.getCaseById as MockedFunction<typeof mockCaseService.getCaseById>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/cases/case-123');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('POST /api/cases', () => {
    const validCaseData = {
      title: 'New Test Case',
      type: 'criminal',
      summary: 'A new test case summary',
      participants: [
        {
          name: 'Jane Smith',
          role: 'defendant',
          aiControlled: true
        }
      ]
    };

    it('should create a new case with valid data', async () => {
      const createdCase = { ...mockCase, ...validCaseData };
      (mockCaseService.createCase as MockedFunction<typeof mockCaseService.createCase>).mockResolvedValue(createdCase);

      const response = await request(app)
        .post('/api/cases')
        .send(validCaseData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(createdCase)));
      expect(mockCaseService.createCase).toHaveBeenCalledWith(validCaseData);
    });

    it('should reject case with missing title', async () => {
      const invalidData = { ...validCaseData, title: undefined };

      const response = await request(app)
        .post('/api/cases')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
      expect(response.body.details).toBeDefined();
    });

    it('should reject case with invalid type', async () => {
      const invalidData = { ...validCaseData, type: 'invalid-type' };

      const response = await request(app)
        .post('/api/cases')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject case with empty participants array', async () => {
      const invalidData = { ...validCaseData, participants: [] };

      const response = await request(app)
        .post('/api/cases')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject case with title too long', async () => {
      const invalidData = { ...validCaseData, title: 'a'.repeat(201) };

      const response = await request(app)
        .post('/api/cases')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should handle service errors', async () => {
      (mockCaseService.createCase as MockedFunction<typeof mockCaseService.createCase>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/cases')
        .send(validCaseData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });

    it('should accept optional settings', async () => {
      const dataWithSettings = {
        ...validCaseData,
        settings: {
          realtimeSpeed: 2.0,
          autoProgress: true,
          jurySize: 6,
          enableObjections: false,
          complexityLevel: 'simple'
        }
      };
      (mockCaseService.createCase as MockedFunction<typeof mockCaseService.createCase>).mockResolvedValue(mockCase);

      const response = await request(app)
        .post('/api/cases')
        .send(dataWithSettings);

      expect(response.status).toBe(201);
      expect(mockCaseService.createCase).toHaveBeenCalledWith(dataWithSettings);
    });

    it('should reject invalid settings values', async () => {
      const invalidData = {
        ...validCaseData,
        settings: { realtimeSpeed: 10 }
      };

      const response = await request(app)
        .post('/api/cases')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('PUT /api/cases/:id', () => {
    const updateData = {
      title: 'Updated Case Title',
      summary: 'Updated summary'
    };

    it('should update a case with valid data', async () => {
      const updatedCase = { ...mockCase, ...updateData };
      (mockCaseService.updateCase as MockedFunction<typeof mockCaseService.updateCase>).mockResolvedValue(updatedCase);

      const response = await request(app)
        .put('/api/cases/case-123')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(updatedCase)));
      expect(mockCaseService.updateCase).toHaveBeenCalledWith('case-123', updateData);
    });

    it('should return 404 if case not found', async () => {
      (mockCaseService.updateCase as MockedFunction<typeof mockCaseService.updateCase>).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/cases/nonexistent')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Case not found');
    });

    it('should reject invalid update data', async () => {
      const invalidData = { title: '' };

      const response = await request(app)
        .put('/api/cases/case-123')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should handle service errors', async () => {
      (mockCaseService.updateCase as MockedFunction<typeof mockCaseService.updateCase>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/cases/case-123')
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('DELETE /api/cases/:id', () => {
    it('should delete a case', async () => {
      (mockCaseService.deleteCase as MockedFunction<typeof mockCaseService.deleteCase>).mockResolvedValue(true);

      const response = await request(app)
        .delete('/api/cases/case-123');

      expect(response.status).toBe(204);
      expect(mockCaseService.deleteCase).toHaveBeenCalledWith('case-123');
    });

    it('should return 404 if case not found', async () => {
      (mockCaseService.deleteCase as MockedFunction<typeof mockCaseService.deleteCase>).mockResolvedValue(false);

      const response = await request(app)
        .delete('/api/cases/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Case not found');
    });

    it('should handle service errors', async () => {
      (mockCaseService.deleteCase as MockedFunction<typeof mockCaseService.deleteCase>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/api/cases/case-123');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('POST /api/cases/:id/participants', () => {
    const newParticipant = {
      name: 'New Participant',
      role: 'witness',
      aiControlled: false
    };

    it('should add a participant to a case', async () => {
      const updatedCase = { ...mockCase };
      (mockCaseService.addParticipant as MockedFunction<typeof mockCaseService.addParticipant>).mockResolvedValue(updatedCase);

      const response = await request(app)
        .post('/api/cases/case-123/participants')
        .send(newParticipant);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(updatedCase)));
      expect(mockCaseService.addParticipant).toHaveBeenCalledWith('case-123', newParticipant);
    });

    it('should return 404 if case not found', async () => {
      (mockCaseService.addParticipant as MockedFunction<typeof mockCaseService.addParticipant>).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/cases/nonexistent/participants')
        .send(newParticipant);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Case not found');
    });

    it('should handle service errors', async () => {
      (mockCaseService.addParticipant as MockedFunction<typeof mockCaseService.addParticipant>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/cases/case-123/participants')
        .send(newParticipant);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('PUT /api/cases/:id/participants/:participantId', () => {
    const updateData = {
      name: 'Updated Name',
      description: 'Updated description'
    };

    it('should update a participant', async () => {
      const updatedCase = { ...mockCase };
      (mockCaseService.updateParticipant as MockedFunction<typeof mockCaseService.updateParticipant>).mockResolvedValue(updatedCase);

      const response = await request(app)
        .put('/api/cases/case-123/participants/participant-1')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(updatedCase)));
      expect(mockCaseService.updateParticipant).toHaveBeenCalledWith(
        'case-123',
        'participant-1',
        updateData
      );
    });

    it('should return 404 if case or participant not found', async () => {
      (mockCaseService.updateParticipant as MockedFunction<typeof mockCaseService.updateParticipant>).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/cases/case-123/participants/nonexistent')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Case or participant not found');
    });

    it('should handle service errors', async () => {
      (mockCaseService.updateParticipant as MockedFunction<typeof mockCaseService.updateParticipant>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/cases/case-123/participants/participant-1')
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('DELETE /api/cases/:id/participants/:participantId', () => {
    it('should remove a participant', async () => {
      const updatedCase = { ...mockCase };
      (mockCaseService.removeParticipant as MockedFunction<typeof mockCaseService.removeParticipant>).mockResolvedValue(updatedCase);

      const response = await request(app)
        .delete('/api/cases/case-123/participants/participant-1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(updatedCase)));
      expect(mockCaseService.removeParticipant).toHaveBeenCalledWith('case-123', 'participant-1');
    });

    it('should return 404 if case or participant not found', async () => {
      (mockCaseService.removeParticipant as MockedFunction<typeof mockCaseService.removeParticipant>).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/cases/case-123/participants/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Case or participant not found');
    });

    it('should handle service errors', async () => {
      (mockCaseService.removeParticipant as MockedFunction<typeof mockCaseService.removeParticipant>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/api/cases/case-123/participants/participant-1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/cases/:id/transcript', () => {
    const mockTranscript = [
      { speaker: 'Judge', text: 'Court is in session', timestamp: new Date() }
    ];

    it('should return case transcript', async () => {
      (mockCaseService.getTranscript as MockedFunction<typeof mockCaseService.getTranscript>).mockResolvedValue(mockTranscript);

      const response = await request(app)
        .get('/api/cases/case-123/transcript');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(mockTranscript)));
      expect(mockCaseService.getTranscript).toHaveBeenCalledWith('case-123');
    });

    it('should return 404 if case not found', async () => {
      (mockCaseService.getTranscript as MockedFunction<typeof mockCaseService.getTranscript>).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/cases/nonexistent/transcript');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Case not found');
    });

    it('should handle service errors', async () => {
      (mockCaseService.getTranscript as MockedFunction<typeof mockCaseService.getTranscript>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/cases/case-123/transcript');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('POST /api/cases/:id/transcript', () => {
    const transcriptEntry = {
      speaker: 'Attorney',
      text: 'I object!',
      timestamp: new Date()
    };

    it('should add transcript entry', async () => {
      const updatedCase = { ...mockCase };
      (mockCaseService.addTranscriptEntry as MockedFunction<typeof mockCaseService.addTranscriptEntry>).mockResolvedValue(updatedCase);

      const response = await request(app)
        .post('/api/cases/case-123/transcript')
        .send(transcriptEntry);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(updatedCase)));
      expect(mockCaseService.addTranscriptEntry).toHaveBeenCalledWith(
        'case-123', 
        expect.objectContaining({
          speaker: transcriptEntry.speaker,
          text: transcriptEntry.text,
          timestamp: expect.any(String)
        })
      );
    });

    it('should return 404 if case not found', async () => {
      (mockCaseService.addTranscriptEntry as MockedFunction<typeof mockCaseService.addTranscriptEntry>).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/cases/nonexistent/transcript')
        .send(transcriptEntry);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Case not found');
    });

    it('should handle service errors', async () => {
      (mockCaseService.addTranscriptEntry as MockedFunction<typeof mockCaseService.addTranscriptEntry>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/cases/case-123/transcript')
        .send(transcriptEntry);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('PUT /api/cases/:id/phase', () => {
    it('should update case phase', async () => {
      const updatedCase = { ...mockCase, currentPhase: 'closing' };
      (mockCaseService.updatePhase as MockedFunction<typeof mockCaseService.updatePhase>).mockResolvedValue(updatedCase);

      const response = await request(app)
        .put('/api/cases/case-123/phase')
        .send({ phase: 'closing' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(JSON.parse(JSON.stringify(updatedCase)));
      expect(mockCaseService.updatePhase).toHaveBeenCalledWith('case-123', 'closing');
    });

    it('should return 400 if phase is missing', async () => {
      const response = await request(app)
        .put('/api/cases/case-123/phase')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Phase is required');
    });

    it('should return 404 if case not found', async () => {
      (mockCaseService.updatePhase as MockedFunction<typeof mockCaseService.updatePhase>).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/cases/nonexistent/phase')
        .send({ phase: 'closing' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Case not found');
    });

    it('should handle service errors', async () => {
      (mockCaseService.updatePhase as MockedFunction<typeof mockCaseService.updatePhase>).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/cases/case-123/phase')
        .send({ phase: 'closing' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });
});
