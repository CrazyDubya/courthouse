import { describe, it, expect, beforeEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import valuationRouter from '../valuation.js';
import { valuationService } from '../../services/ValuationService';

vi.mock('../../services/ValuationService', () => ({
  valuationService: {
    getAllValuations: vi.fn(),
    getValuation: vi.fn(),
    getValuationsByCaseId: vi.fn(),
    createValuation: vi.fn(),
    updateValuation: vi.fn(),
    deleteValuation: vi.fn(),
    calculateSaaSMetrics: vi.fn(),
    calculateARR: vi.fn(),
    calculateMRR: vi.fn(),
    calculateCLV: vi.fn(),
    projectRevenue: vi.fn(),
    calculateValuation: vi.fn(),
    calculateDamages: vi.fn()
  }
}));

describe('Valuation Routes', () => {
  let app: express.Application;

  const mockValuation = {
    id: 'val-123',
    caseId: 'case-123',
    method: 'dcf',
    inputs: {
      cashFlows: [100000, 120000, 150000],
      discountRate: 0.1
    },
    result: {
      value: 350000,
      confidence: 0.85
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/valuation', valuationRouter);
  });

  describe('GET /api/valuation', () => {
    it('should return all valuations', async () => {
      const valuations = [mockValuation];
      (valuationService.getAllValuations as any).mockReturnValue(valuations);

      const response = await request(app).get('/api/valuation');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(valuations);
      expect(valuationService.getAllValuations).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      (valuationService.getAllValuations as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/api/valuation');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch valuations');
      expect(response.body.details).toBe('Database error');
    });
  });

  describe('GET /api/valuation/:id', () => {
    it('should return valuation by id', async () => {
      (valuationService.getValuation as any).mockReturnValue(mockValuation);

      const response = await request(app).get('/api/valuation/val-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockValuation);
      expect(valuationService.getValuation).toHaveBeenCalledWith('val-123');
    });

    it('should return 404 if valuation not found', async () => {
      (valuationService.getValuation as any).mockReturnValue(null);

      const response = await request(app).get('/api/valuation/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Valuation not found');
    });

    it('should handle service errors', async () => {
      (valuationService.getValuation as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/api/valuation/val-123');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch valuation');
    });
  });

  describe('GET /api/valuation/case/:caseId', () => {
    it('should return valuations for a case', async () => {
      const valuations = [mockValuation];
      (valuationService.getValuationsByCaseId as any).mockReturnValue(valuations);

      const response = await request(app).get('/api/valuation/case/case-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(valuations);
      expect(valuationService.getValuationsByCaseId).toHaveBeenCalledWith('case-123');
    });

    it('should handle service errors', async () => {
      (valuationService.getValuationsByCaseId as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).get('/api/valuation/case/case-123');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch case valuations');
    });
  });

  describe('POST /api/valuation', () => {
    const validValuationData = {
      caseId: 'case-123',
      method: 'dcf',
      inputs: { cashFlows: [100000], discountRate: 0.1 }
    };

    it('should create a new valuation', async () => {
      (valuationService.createValuation as any).mockReturnValue(mockValuation);

      const response = await request(app)
        .post('/api/valuation')
        .send(validValuationData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockValuation);
      expect(valuationService.createValuation).toHaveBeenCalledWith(validValuationData);
    });

    it('should handle service errors', async () => {
      (valuationService.createValuation as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/valuation')
        .send(validValuationData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to create valuation');
    });
  });

  describe('PUT /api/valuation/:id', () => {
    const updateData = {
      result: { value: 400000, confidence: 0.9 }
    };

    it('should update a valuation', async () => {
      const updatedValuation = { ...mockValuation, ...updateData };
      (valuationService.updateValuation as any).mockReturnValue(updatedValuation);

      const response = await request(app)
        .put('/api/valuation/val-123')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedValuation);
      expect(valuationService.updateValuation).toHaveBeenCalledWith('val-123', updateData);
    });

    it('should return 404 if valuation not found', async () => {
      (valuationService.updateValuation as any).mockReturnValue(null);

      const response = await request(app)
        .put('/api/valuation/nonexistent')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Valuation not found');
    });

    it('should handle service errors', async () => {
      (valuationService.updateValuation as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .put('/api/valuation/val-123')
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to update valuation');
    });
  });

  describe('DELETE /api/valuation/:id', () => {
    it('should delete a valuation', async () => {
      (valuationService.deleteValuation as any).mockReturnValue(true);

      const response = await request(app).delete('/api/valuation/val-123');

      expect(response.status).toBe(204);
      expect(valuationService.deleteValuation).toHaveBeenCalledWith('val-123');
    });

    it('should return 404 if valuation not found', async () => {
      (valuationService.deleteValuation as any).mockReturnValue(false);

      const response = await request(app).delete('/api/valuation/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Valuation not found');
    });

    it('should handle service errors', async () => {
      (valuationService.deleteValuation as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app).delete('/api/valuation/val-123');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to delete valuation');
    });
  });

  describe('POST /api/valuation/calculate/saas-metrics', () => {
    it('should calculate SaaS metrics', async () => {
      const requestData = {
        revenueData: { monthly: [10000, 12000, 15000] },
        customerMetrics: { total: 100, churnRate: 0.05 },
        profitMargin: 0.2,
        salesAndMarketingSpend: 5000
      };

      const metrics = {
        arr: 144000,
        mrr: 12000,
        ltv: 50000,
        cac: 50
      };

      (valuationService.calculateSaaSMetrics as any).mockReturnValue(metrics);

      const response = await request(app)
        .post('/api/valuation/calculate/saas-metrics')
        .send(requestData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(metrics);
      expect(valuationService.calculateSaaSMetrics).toHaveBeenCalledWith(
        requestData.revenueData,
        requestData.customerMetrics,
        requestData.profitMargin,
        requestData.salesAndMarketingSpend
      );
    });

    it('should return 400 if required data is missing', async () => {
      const response = await request(app)
        .post('/api/valuation/calculate/saas-metrics')
        .send({ revenueData: {} });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required data: revenueData and customerMetrics');
    });

    it('should handle service errors', async () => {
      (valuationService.calculateSaaSMetrics as any).mockImplementation(() => {
        throw new Error('Calculation error');
      });

      const response = await request(app)
        .post('/api/valuation/calculate/saas-metrics')
        .send({
          revenueData: {},
          customerMetrics: {}
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to calculate SaaS metrics');
    });
  });

  describe('POST /api/valuation/calculate/arr', () => {
    it('should calculate ARR', async () => {
      const revenueData = { monthly: [10000, 12000, 15000] };
      (valuationService.calculateARR as any).mockReturnValue(144000);

      const response = await request(app)
        .post('/api/valuation/calculate/arr')
        .send({ revenueData });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ arr: 144000 });
      expect(valuationService.calculateARR).toHaveBeenCalledWith(revenueData);
    });

    it('should return 400 if revenueData is missing', async () => {
      const response = await request(app)
        .post('/api/valuation/calculate/arr')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required data: revenueData');
    });
  });

  describe('POST /api/valuation/calculate/mrr', () => {
    it('should calculate MRR', async () => {
      const revenueData = { monthly: [10000, 12000, 15000] };
      (valuationService.calculateMRR as any).mockReturnValue(12000);

      const response = await request(app)
        .post('/api/valuation/calculate/mrr')
        .send({ revenueData });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ mrr: 12000 });
      expect(valuationService.calculateMRR).toHaveBeenCalledWith(revenueData);
    });

    it('should return 400 if revenueData is missing', async () => {
      const response = await request(app)
        .post('/api/valuation/calculate/mrr')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required data: revenueData');
    });
  });

  describe('POST /api/valuation/calculate/clv', () => {
    it('should calculate CLV', async () => {
      const requestData = {
        avgContractValue: 1000,
        avgContractLength: 12,
        retentionRate: 0.9
      };
      (valuationService.calculateCLV as any).mockReturnValue(50000);

      const response = await request(app)
        .post('/api/valuation/calculate/clv')
        .send(requestData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ clv: 50000 });
      expect(valuationService.calculateCLV).toHaveBeenCalledWith(
        requestData.avgContractValue,
        requestData.avgContractLength,
        requestData.retentionRate
      );
    });

    it('should return 400 if required data is missing', async () => {
      const response = await request(app)
        .post('/api/valuation/calculate/clv')
        .send({ avgContractValue: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required data');
    });
  });

  describe('POST /api/valuation/calculate/projection', () => {
    it('should project revenue', async () => {
      const requestData = {
        historicalData: [10000, 12000, 15000],
        months: 12,
        growthRate: 0.1,
        confidence: 0.8
      };
      const projections = [16500, 18150, 19965];
      (valuationService.projectRevenue as any).mockReturnValue(projections);

      const response = await request(app)
        .post('/api/valuation/calculate/projection')
        .send(requestData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ projections });
      expect(valuationService.projectRevenue).toHaveBeenCalledWith(
        requestData.historicalData,
        requestData.months,
        requestData.growthRate,
        requestData.confidence
      );
    });

    it('should return 400 if required data is missing', async () => {
      const response = await request(app)
        .post('/api/valuation/calculate/projection')
        .send({ historicalData: [10000] });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required data');
    });
  });

  describe('POST /api/valuation/calculate/valuation', () => {
    const validMethods = ['dcf', 'market-multiple', 'asset-based', 'revenue-multiple', 'arr-multiple'];

    it('should calculate valuation using valid method', async () => {
      const requestData = {
        method: 'dcf',
        inputs: { cashFlows: [100000], discountRate: 0.1 }
      };
      const result = { value: 350000, confidence: 0.85 };
      (valuationService.calculateValuation as any).mockReturnValue(result);

      const response = await request(app)
        .post('/api/valuation/calculate/valuation')
        .send(requestData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(result);
      expect(valuationService.calculateValuation).toHaveBeenCalledWith(
        requestData.method,
        requestData.inputs
      );
    });

    it('should test all valid methods', async () => {
      (valuationService.calculateValuation as any).mockReturnValue({ value: 100000 });

      for (const method of validMethods) {
        const response = await request(app)
          .post('/api/valuation/calculate/valuation')
          .send({ method, inputs: {} });

        expect(response.status).toBe(200);
      }
    });

    it('should return 400 for invalid method', async () => {
      const response = await request(app)
        .post('/api/valuation/calculate/valuation')
        .send({ method: 'invalid-method', inputs: {} });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid method');
    });

    it('should return 400 if method or inputs are missing', async () => {
      const response = await request(app)
        .post('/api/valuation/calculate/valuation')
        .send({ method: 'dcf' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required data: method and inputs');
    });
  });

  describe('POST /api/valuation/calculate/damages', () => {
    it('should calculate damages', async () => {
      const requestData = {
        lostRevenue: 100000,
        lostCustomers: 50,
        mitigationCosts: { legal: 10000 },
        businessImpact: { reputation: 5000 },
        interestRate: 0.05
      };
      const damages = {
        total: 115000,
        breakdown: {
          lostRevenue: 100000,
          lostCustomers: 10000,
          mitigation: 5000
        }
      };
      (valuationService.calculateDamages as any).mockReturnValue(damages);

      const response = await request(app)
        .post('/api/valuation/calculate/damages')
        .send(requestData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(damages);
      expect(valuationService.calculateDamages).toHaveBeenCalledWith(
        requestData.lostRevenue,
        requestData.lostCustomers,
        requestData.mitigationCosts,
        requestData.businessImpact,
        requestData.interestRate
      );
    });

    it('should use default values for optional fields', async () => {
      const requestData = {
        lostRevenue: 100000,
        lostCustomers: 50
      };
      (valuationService.calculateDamages as any).mockReturnValue({ total: 100000 });

      const response = await request(app)
        .post('/api/valuation/calculate/damages')
        .send(requestData);

      expect(response.status).toBe(200);
      expect(valuationService.calculateDamages).toHaveBeenCalledWith(
        requestData.lostRevenue,
        requestData.lostCustomers,
        {},
        {},
        undefined
      );
    });

    it('should return 400 if required data is missing', async () => {
      const response = await request(app)
        .post('/api/valuation/calculate/damages')
        .send({ lostRevenue: 100000 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required data');
    });
  });

  describe('POST /api/valuation/:id/analyze', () => {
    it('should analyze valuation (placeholder)', async () => {
      (valuationService.getValuation as any).mockReturnValue(mockValuation);
      (valuationService.updateValuation as any).mockReturnValue(mockValuation);

      const response = await request(app)
        .post('/api/valuation/val-123/analyze');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('llmAnalysis');
      expect(valuationService.getValuation).toHaveBeenCalledWith('val-123');
    });

    it('should return 404 if valuation not found', async () => {
      (valuationService.getValuation as any).mockReturnValue(null);

      const response = await request(app)
        .post('/api/valuation/nonexistent/analyze');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Valuation not found');
    });

    it('should handle service errors', async () => {
      (valuationService.getValuation as any).mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .post('/api/valuation/val-123/analyze');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to analyze valuation');
    });
  });
});
