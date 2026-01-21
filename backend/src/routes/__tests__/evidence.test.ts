import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { promises as fs } from 'fs';
import path from 'path';
import createEvidenceRoutes from '../evidence.js';

vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn(),
    unlink: vi.fn(),
    access: vi.fn()
  }
}));

describe('Evidence Routes', () => {
  let app: express.Application;

  const mockEvidence = {
    id: 'evidence-123',
    title: 'Test Evidence',
    type: 'document',
    description: 'A test evidence item',
    submittedBy: 'attorney-1',
    caseId: 'case-123',
    exhibit: 'A-1',
    admissible: true,
    privileged: false,
    chainOfCustody: ['Created: 2024-01-01 by attorney-1'],
    createdAt: new Date('2024-01-01')
  };

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/evidence', createEvidenceRoutes());
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/evidence', () => {
    it('should return all evidence with default pagination', async () => {
      const response = await request(app).get('/api/evidence');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('evidence');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('offset');
      expect(response.body.limit).toBe(50);
      expect(response.body.offset).toBe(0);
    });

    it('should filter evidence by caseId', async () => {
      const response = await request(app)
        .get('/api/evidence')
        .query({ caseId: 'case-123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('evidence');
    });

    it('should filter evidence by type', async () => {
      const response = await request(app)
        .get('/api/evidence')
        .query({ type: 'document' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('evidence');
    });

    it('should filter evidence by submittedBy', async () => {
      const response = await request(app)
        .get('/api/evidence')
        .query({ submittedBy: 'attorney-1' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('evidence');
    });

    it('should support custom pagination', async () => {
      const response = await request(app)
        .get('/api/evidence')
        .query({ limit: '10', offset: '5' });

      expect(response.status).toBe(200);
      expect(response.body.limit).toBe(10);
      expect(response.body.offset).toBe(5);
    });

    it('should handle service errors', async () => {
      vi.spyOn(Array, 'from').mockImplementationOnce(() => {
        throw new Error('Internal error');
      });

      const response = await request(app).get('/api/evidence');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/evidence/:id', () => {
    it('should return 404 for non-existent evidence', async () => {
      const response = await request(app).get('/api/evidence/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Evidence not found');
    });

    it('should handle service errors', async () => {
      vi.spyOn(Map.prototype, 'get').mockImplementationOnce(() => {
        throw new Error('Internal error');
      });

      const response = await request(app).get('/api/evidence/evidence-123');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/evidence', () => {
    const validEvidenceData = {
      title: 'New Evidence',
      type: 'document',
      description: 'A new evidence item',
      submittedBy: 'attorney-1',
      caseId: 'case-123',
      exhibit: 'B-1',
      admissible: true,
      privileged: false,
      chainOfCustody: []
    };

    it('should create evidence without files', async () => {
      const response = await request(app)
        .post('/api/evidence')
        .send(validEvidenceData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('evidence');
      expect(response.body.evidence).toHaveProperty('id');
      expect(response.body.evidence.title).toBe(validEvidenceData.title);
    });

    it('should reject evidence with missing title', async () => {
      const invalidData = { ...validEvidenceData, title: undefined };

      const response = await request(app)
        .post('/api/evidence')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject evidence with invalid type', async () => {
      const invalidData = { ...validEvidenceData, type: 'invalid-type' };

      const response = await request(app)
        .post('/api/evidence')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject evidence with missing description', async () => {
      const invalidData = { ...validEvidenceData, description: undefined };

      const response = await request(app)
        .post('/api/evidence')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject evidence with missing submittedBy', async () => {
      const invalidData = { ...validEvidenceData, submittedBy: undefined };

      const response = await request(app)
        .post('/api/evidence')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should reject evidence with missing caseId', async () => {
      const invalidData = { ...validEvidenceData, caseId: undefined };

      const response = await request(app)
        .post('/api/evidence')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });

    it('should accept valid evidence types', async () => {
      const validTypes = ['document', 'video', 'audio', 'photo', 'testimony', 'physical'];

      for (const type of validTypes) {
        const data = { ...validEvidenceData, type };
        const response = await request(app)
          .post('/api/evidence')
          .send(data);

        expect(response.status).toBe(201);
      }
    });

    it('should default admissible to true', async () => {
      const dataWithoutAdmissible = { ...validEvidenceData };
      delete dataWithoutAdmissible.admissible;

      const response = await request(app)
        .post('/api/evidence')
        .send(dataWithoutAdmissible);

      expect(response.status).toBe(201);
      expect(response.body.evidence.admissible).toBe(true);
    });

    it('should default privileged to false', async () => {
      const dataWithoutPrivileged = { ...validEvidenceData };
      delete dataWithoutPrivileged.privileged;

      const response = await request(app)
        .post('/api/evidence')
        .send(dataWithoutPrivileged);

      expect(response.status).toBe(201);
      expect(response.body.evidence.privileged).toBe(false);
    });

    it('should handle validation errors with details', async () => {
      const response = await request(app)
        .post('/api/evidence')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
      expect(response.body.details).toBeDefined();
      expect(Array.isArray(response.body.details)).toBe(true);
    });
  });

  describe('PUT /api/evidence/:id', () => {
    beforeEach(async () => {
      const createData = {
        title: 'Test Evidence',
        type: 'document',
        description: 'Test description',
        submittedBy: 'attorney-1',
        caseId: 'case-123'
      };
      await request(app).post('/api/evidence').send(createData);
    });

    it('should return 404 for non-existent evidence', async () => {
      const response = await request(app)
        .put('/api/evidence/nonexistent')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Evidence not found');
    });

    it('should update evidence title', async () => {
      const createResponse = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Original Title',
          type: 'document',
          description: 'Test',
          submittedBy: 'attorney-1',
          caseId: 'case-123'
        });

      const evidenceId = createResponse.body.evidence.id;

      const response = await request(app)
        .put(`/api/evidence/${evidenceId}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should update evidence description', async () => {
      const createResponse = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Test',
          type: 'document',
          description: 'Original',
          submittedBy: 'attorney-1',
          caseId: 'case-123'
        });

      const evidenceId = createResponse.body.evidence.id;

      const response = await request(app)
        .put(`/api/evidence/${evidenceId}`)
        .send({ description: 'Updated Description' });

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated Description');
    });

    it('should add chain of custody entry', async () => {
      const createResponse = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Test',
          type: 'document',
          description: 'Test',
          submittedBy: 'attorney-1',
          caseId: 'case-123'
        });

      const evidenceId = createResponse.body.evidence.id;

      const response = await request(app)
        .put(`/api/evidence/${evidenceId}`)
        .send({ chainOfCustodyEntry: 'Evidence reviewed by Judge' });

      expect(response.status).toBe(200);
      expect(response.body.chainOfCustody).toContain('Evidence reviewed by Judge');
    });

    it('should reject invalid title length', async () => {
      const createResponse = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Test',
          type: 'document',
          description: 'Test',
          submittedBy: 'attorney-1',
          caseId: 'case-123'
        });

      const evidenceId = createResponse.body.evidence.id;

      const response = await request(app)
        .put(`/api/evidence/${evidenceId}`)
        .send({ title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation error');
    });
  });

  describe('DELETE /api/evidence/:id', () => {
    it('should return 404 for non-existent evidence', async () => {
      const response = await request(app).delete('/api/evidence/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Evidence not found');
    });

    it('should delete evidence without file', async () => {
      const createResponse = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Test',
          type: 'document',
          description: 'Test',
          submittedBy: 'attorney-1',
          caseId: 'case-123'
        });

      const evidenceId = createResponse.body.evidence.id;

      const response = await request(app).delete(`/api/evidence/${evidenceId}`);

      expect(response.status).toBe(204);

      const getResponse = await request(app).get(`/api/evidence/${evidenceId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should attempt to delete associated file', async () => {
      const createResponse = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Test',
          type: 'document',
          description: 'Test',
          submittedBy: 'attorney-1',
          caseId: 'case-123'
        });

      const evidenceId = createResponse.body.evidence.id;
      const evidence = createResponse.body.evidence;
      evidence.filePath = '/tmp/test-file.pdf';

      const response = await request(app).delete(`/api/evidence/${evidenceId}`);

      expect(response.status).toBe(204);
    });
  });

  describe('GET /api/evidence/:id/file', () => {
    it('should return 404 for non-existent evidence', async () => {
      const response = await request(app).get('/api/evidence/nonexistent/file');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Evidence file not found');
    });

    it('should return 404 for evidence without file', async () => {
      const createResponse = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Test',
          type: 'testimony',
          description: 'Test',
          submittedBy: 'attorney-1',
          caseId: 'case-123'
        });

      const evidenceId = createResponse.body.evidence.id;

      const response = await request(app).get(`/api/evidence/${evidenceId}/file`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Evidence file not found');
    });
  });

  describe('POST /api/evidence/:id/chain-of-custody', () => {
    it('should add chain of custody entry', async () => {
      const createResponse = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Test',
          type: 'document',
          description: 'Test',
          submittedBy: 'attorney-1',
          caseId: 'case-123'
        });

      const evidenceId = createResponse.body.evidence.id;

      const response = await request(app)
        .post(`/api/evidence/${evidenceId}/chain-of-custody`)
        .send({
          entry: 'Evidence transferred to forensic lab',
          actor: 'Detective Smith'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Chain of custody entry added');
      expect(response.body.evidence.chainOfCustody.length).toBeGreaterThan(0);
      const lastEntry = response.body.evidence.chainOfCustody[response.body.evidence.chainOfCustody.length - 1];
      expect(lastEntry).toContain('Evidence transferred to forensic lab');
      expect(lastEntry).toContain('Detective Smith');
    });

    it('should return 400 if entry is missing', async () => {
      const createResponse = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Test',
          type: 'document',
          description: 'Test',
          submittedBy: 'attorney-1',
          caseId: 'case-123'
        });

      const evidenceId = createResponse.body.evidence.id;

      const response = await request(app)
        .post(`/api/evidence/${evidenceId}/chain-of-custody`)
        .send({ actor: 'Detective Smith' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Entry and actor are required');
    });

    it('should return 400 if actor is missing', async () => {
      const createResponse = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Test',
          type: 'document',
          description: 'Test',
          submittedBy: 'attorney-1',
          caseId: 'case-123'
        });

      const evidenceId = createResponse.body.evidence.id;

      const response = await request(app)
        .post(`/api/evidence/${evidenceId}/chain-of-custody`)
        .send({ entry: 'Evidence transferred' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Entry and actor are required');
    });

    it('should return 404 for non-existent evidence', async () => {
      const response = await request(app)
        .post('/api/evidence/nonexistent/chain-of-custody')
        .send({
          entry: 'Test entry',
          actor: 'Test actor'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Evidence not found');
    });
  });

  describe('Evidence type validation', () => {
    const validTypes = ['document', 'video', 'audio', 'photo', 'testimony', 'physical'];

    validTypes.forEach(type => {
      it(`should accept ${type} as valid evidence type`, async () => {
        const response = await request(app)
          .post('/api/evidence')
          .send({
            title: `Test ${type}`,
            type,
            description: 'Test description',
            submittedBy: 'attorney-1',
            caseId: 'case-123'
          });

        expect(response.status).toBe(201);
        expect(response.body.evidence.type).toBe(type);
      });
    });
  });

  describe('Chain of custody tracking', () => {
    it('should initialize with creation entry', async () => {
      const response = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Test',
          type: 'document',
          description: 'Test',
          submittedBy: 'attorney-1',
          caseId: 'case-123'
        });

      expect(response.status).toBe(201);
      expect(response.body.evidence.chainOfCustody).toBeDefined();
      expect(response.body.evidence.chainOfCustody.length).toBeGreaterThan(0);
      expect(response.body.evidence.chainOfCustody[0]).toContain('Created');
    });

    it('should preserve existing chain of custody entries', async () => {
      const initialChain = ['Initial entry'];
      const response = await request(app)
        .post('/api/evidence')
        .send({
          title: 'Test',
          type: 'document',
          description: 'Test',
          submittedBy: 'attorney-1',
          caseId: 'case-123',
          chainOfCustody: initialChain
        });

      expect(response.status).toBe(201);
      expect(response.body.evidence.chainOfCustody).toContain('Initial entry');
    });
  });
});
