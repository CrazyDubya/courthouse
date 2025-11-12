import express, { Request, Response } from 'express';
import { valuationService } from '../services/ValuationService';

const router = express.Router();

/**
 * GET /api/valuation
 * Get all economic valuations
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const valuations = valuationService.getAllValuations();
    res.json(valuations);
  } catch (error: any) {
    console.error('Error fetching valuations:', error);
    res.status(500).json({ error: 'Failed to fetch valuations', details: error.message });
  }
});

/**
 * GET /api/valuation/:id
 * Get economic valuation by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const valuation = valuationService.getValuation(id);

    if (!valuation) {
      return res.status(404).json({ error: 'Valuation not found' });
    }

    res.json(valuation);
  } catch (error: any) {
    console.error('Error fetching valuation:', error);
    res.status(500).json({ error: 'Failed to fetch valuation', details: error.message });
  }
});

/**
 * GET /api/valuation/case/:caseId
 * Get valuations for a specific case
 */
router.get('/case/:caseId', (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const valuations = valuationService.getValuationsByCaseId(caseId);
    res.json(valuations);
  } catch (error: any) {
    console.error('Error fetching case valuations:', error);
    res.status(500).json({ error: 'Failed to fetch case valuations', details: error.message });
  }
});

/**
 * POST /api/valuation
 * Create a new economic valuation
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const valuation = valuationService.createValuation(req.body);
    res.status(201).json(valuation);
  } catch (error: any) {
    console.error('Error creating valuation:', error);
    res.status(500).json({ error: 'Failed to create valuation', details: error.message });
  }
});

/**
 * PUT /api/valuation/:id
 * Update an existing valuation
 */
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const valuation = valuationService.updateValuation(id, req.body);

    if (!valuation) {
      return res.status(404).json({ error: 'Valuation not found' });
    }

    res.json(valuation);
  } catch (error: any) {
    console.error('Error updating valuation:', error);
    res.status(500).json({ error: 'Failed to update valuation', details: error.message });
  }
});

/**
 * DELETE /api/valuation/:id
 * Delete a valuation
 */
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = valuationService.deleteValuation(id);

    if (!success) {
      return res.status(404).json({ error: 'Valuation not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting valuation:', error);
    res.status(500).json({ error: 'Failed to delete valuation', details: error.message });
  }
});

/**
 * POST /api/valuation/calculate/saas-metrics
 * Calculate SaaS metrics (ARR, MRR, etc.)
 */
router.post('/calculate/saas-metrics', (req: Request, res: Response) => {
  try {
    const { revenueData, customerMetrics, profitMargin, salesAndMarketingSpend } = req.body;

    if (!revenueData || !customerMetrics) {
      return res.status(400).json({ error: 'Missing required data: revenueData and customerMetrics' });
    }

    const saasMetrics = valuationService.calculateSaaSMetrics(
      revenueData,
      customerMetrics,
      profitMargin,
      salesAndMarketingSpend
    );

    res.json(saasMetrics);
  } catch (error: any) {
    console.error('Error calculating SaaS metrics:', error);
    res.status(500).json({ error: 'Failed to calculate SaaS metrics', details: error.message });
  }
});

/**
 * POST /api/valuation/calculate/arr
 * Calculate Annual Recurring Revenue
 */
router.post('/calculate/arr', (req: Request, res: Response) => {
  try {
    const { revenueData } = req.body;

    if (!revenueData) {
      return res.status(400).json({ error: 'Missing required data: revenueData' });
    }

    const arr = valuationService.calculateARR(revenueData);
    res.json({ arr });
  } catch (error: any) {
    console.error('Error calculating ARR:', error);
    res.status(500).json({ error: 'Failed to calculate ARR', details: error.message });
  }
});

/**
 * POST /api/valuation/calculate/mrr
 * Calculate Monthly Recurring Revenue
 */
router.post('/calculate/mrr', (req: Request, res: Response) => {
  try {
    const { revenueData } = req.body;

    if (!revenueData) {
      return res.status(400).json({ error: 'Missing required data: revenueData' });
    }

    const mrr = valuationService.calculateMRR(revenueData);
    res.json({ mrr });
  } catch (error: any) {
    console.error('Error calculating MRR:', error);
    res.status(500).json({ error: 'Failed to calculate MRR', details: error.message });
  }
});

/**
 * POST /api/valuation/calculate/clv
 * Calculate Customer Lifetime Value
 */
router.post('/calculate/clv', (req: Request, res: Response) => {
  try {
    const { avgContractValue, avgContractLength, retentionRate } = req.body;

    if (!avgContractValue || !avgContractLength || !retentionRate) {
      return res.status(400).json({
        error: 'Missing required data: avgContractValue, avgContractLength, retentionRate'
      });
    }

    const clv = valuationService.calculateCLV(avgContractValue, avgContractLength, retentionRate);
    res.json({ clv });
  } catch (error: any) {
    console.error('Error calculating CLV:', error);
    res.status(500).json({ error: 'Failed to calculate CLV', details: error.message });
  }
});

/**
 * POST /api/valuation/calculate/projection
 * Project future revenue
 */
router.post('/calculate/projection', (req: Request, res: Response) => {
  try {
    const { historicalData, months, growthRate, confidence } = req.body;

    if (!historicalData || !months || growthRate === undefined) {
      return res.status(400).json({
        error: 'Missing required data: historicalData, months, growthRate'
      });
    }

    const projections = valuationService.projectRevenue(
      historicalData,
      months,
      growthRate,
      confidence
    );

    res.json({ projections });
  } catch (error: any) {
    console.error('Error projecting revenue:', error);
    res.status(500).json({ error: 'Failed to project revenue', details: error.message });
  }
});

/**
 * POST /api/valuation/calculate/valuation
 * Calculate business valuation using specified method
 */
router.post('/calculate/valuation', (req: Request, res: Response) => {
  try {
    const { method, inputs } = req.body;

    if (!method || !inputs) {
      return res.status(400).json({ error: 'Missing required data: method and inputs' });
    }

    const validMethods = ['dcf', 'market-multiple', 'asset-based', 'revenue-multiple', 'arr-multiple'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        error: `Invalid method. Must be one of: ${validMethods.join(', ')}`
      });
    }

    const valuation = valuationService.calculateValuation(method, inputs);
    res.json(valuation);
  } catch (error: any) {
    console.error('Error calculating valuation:', error);
    res.status(500).json({ error: 'Failed to calculate valuation', details: error.message });
  }
});

/**
 * POST /api/valuation/calculate/damages
 * Calculate total damages
 */
router.post('/calculate/damages', (req: Request, res: Response) => {
  try {
    const {
      lostRevenue,
      lostCustomers,
      mitigationCosts,
      businessImpact,
      interestRate
    } = req.body;

    if (!lostRevenue || !lostCustomers) {
      return res.status(400).json({
        error: 'Missing required data: lostRevenue and lostCustomers'
      });
    }

    const damages = valuationService.calculateDamages(
      lostRevenue,
      lostCustomers,
      mitigationCosts || {},
      businessImpact || {},
      interestRate
    );

    res.json(damages);
  } catch (error: any) {
    console.error('Error calculating damages:', error);
    res.status(500).json({ error: 'Failed to calculate damages', details: error.message });
  }
});

/**
 * POST /api/valuation/:id/analyze
 * Run LLM analysis on valuation data (placeholder for future LLM integration)
 */
router.post('/:id/analyze', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const valuation = valuationService.getValuation(id);

    if (!valuation) {
      return res.status(404).json({ error: 'Valuation not found' });
    }

    // TODO: Integrate with LLM service for analysis
    // For now, return a placeholder response
    const llmAnalysis = {
      summary: 'LLM analysis not yet implemented',
      keyFindings: ['Placeholder finding'],
      risks: ['Placeholder risk'],
      opportunities: ['Placeholder opportunity'],
      analyzedAt: new Date(),
      model: 'placeholder',
    };

    const updated = valuationService.updateValuation(id, { llmAnalysis });
    res.json(updated);
  } catch (error: any) {
    console.error('Error analyzing valuation:', error);
    res.status(500).json({ error: 'Failed to analyze valuation', details: error.message });
  }
});

export default router;
