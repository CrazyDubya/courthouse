import { v4 as uuidv4 } from 'uuid';

// Type definitions matching frontend
interface RevenueDataPoint {
  period: Date;
  amount: number;
  periodType: 'monthly' | 'quarterly' | 'annual';
  breakdown?: {
    newRevenue: number;
    expansionRevenue: number;
    contractionRevenue: number;
    churnedRevenue: number;
  };
}

interface RevenueProjection {
  period: Date;
  amount: number;
  confidence: number;
  assumptions: string[];
  growthRate?: number;
}

interface CustomerCohort {
  cohort: string;
  acquisitionDate: Date;
  initialCount: number;
  retentionRates: number[];
  lifetimeValue: number;
  acquisitionCost: number;
}

interface CustomerMetrics {
  total: number;
  active: number;
  churned: number;
  newCustomers: number;
  avgContractValue: number;
  avgContractLength: number;
  bySegment: Record<string, number>;
  byContractTerm: Record<string, number>;
  retention: {
    rate: number;
    netRetention: number;
    cohorts: CustomerCohort[];
  };
  cac: number;
  paybackPeriod: number;
  ltv: number;
  ltvCacRatio: number;
}

interface SaaSMetrics {
  arr: number;
  mrr: number;
  mrrGrowthRate: number;
  arrGrowthRate: number;
  customerChurnRate: number;
  revenueChurnRate: number;
  negativeChurnRate: number;
  quickRatio: number;
  magicNumber: number;
  ruleOf40: number;
  arpu: number;
  arppu: number;
  calculatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
}

interface DamageCalculation {
  lostRevenue: {
    historical: number;
    projected: number;
    breakdown: {
      subscriptionLoss: number;
      expansionLoss: number;
      oneTimeLoss: number;
    };
  };
  lostCustomers: {
    count: number;
    lifetimeValue: number;
    segmentImpact: Record<string, number>;
  };
  businessImpact: {
    marketShareLoss: number;
    brandDamage: number;
    competitiveDisadvantage: number;
    operationalDisruption: number;
  };
  mitigationCosts: {
    remediation: number;
    customerRecovery: number;
    reputationRepair: number;
    legalAndCompliance: number;
    other: number;
  };
  subtotal: number;
  interestRate?: number;
  interest?: number;
  total: number;
  methodology: string;
  assumptions: string[];
  supportingDocuments: string[];
}

interface ValuationAnalysis {
  method: 'dcf' | 'market-multiple' | 'asset-based' | 'revenue-multiple' | 'arr-multiple';
  baselineValue: number;
  currentValue: number;
  valueLoss: number;
  inputs: {
    discountRate?: number;
    growthRate?: number;
    multiple?: number;
    terminalValue?: number;
    comparableCompanies?: string[];
  };
  assumptions: string[];
  sensitivityAnalysis?: {
    scenario: string;
    value: number;
    probability: number;
  }[];
  calculatedBy: string;
  calculatedAt: Date;
}

interface EconomicValuation {
  id: string;
  caseId: string;
  saasMetrics?: SaaSMetrics;
  customerMetrics: CustomerMetrics;
  revenue: {
    historical: RevenueDataPoint[];
    projected: RevenueProjection[];
    revenueTypes: Record<string, number>;
  };
  valuations: ValuationAnalysis[];
  preferredValuation?: string;
  damages: DamageCalculation;
  impactTimeline: Array<{
    date: Date;
    event: string;
    economicImpact: number;
    description: string;
  }>;
  expertOpinions?: Array<{
    expertId: string;
    expertName: string;
    valuation: number;
    methodology: string;
    reasoning: string;
    submittedAt: Date;
  }>;
  llmAnalysis?: {
    summary: string;
    keyFindings: string[];
    risks: string[];
    opportunities: string[];
    analyzedAt: Date;
    model: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'draft' | 'under-review' | 'approved' | 'challenged';
  version: number;
}

/**
 * ValuationService: Handles economic valuation calculations for legal cases
 * Includes SaaS metrics (ARR, MRR, CLV), damage calculations, and business valuations
 */
export class ValuationService {
  private valuations: Map<string, EconomicValuation> = new Map();

  /**
   * Create a new economic valuation
   */
  createValuation(data: Partial<EconomicValuation>): EconomicValuation {
    const valuation: EconomicValuation = {
      id: data.id || uuidv4(),
      caseId: data.caseId!,
      saasMetrics: data.saasMetrics,
      customerMetrics: data.customerMetrics || this.getEmptyCustomerMetrics(),
      revenue: data.revenue || {
        historical: [],
        projected: [],
        revenueTypes: {},
      },
      valuations: data.valuations || [],
      preferredValuation: data.preferredValuation,
      damages: data.damages || this.getEmptyDamages(),
      impactTimeline: data.impactTimeline || [],
      expertOpinions: data.expertOpinions,
      llmAnalysis: data.llmAnalysis,
      createdAt: data.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy || 'system',
      status: data.status || 'draft',
      version: data.version || 1,
    };

    this.valuations.set(valuation.id, valuation);
    return valuation;
  }

  /**
   * Get valuation by ID
   */
  getValuation(id: string): EconomicValuation | undefined {
    return this.valuations.get(id);
  }

  /**
   * Get valuations by case ID
   */
  getValuationsByCaseId(caseId: string): EconomicValuation[] {
    return Array.from(this.valuations.values()).filter(v => v.caseId === caseId);
  }

  /**
   * Update existing valuation
   */
  updateValuation(id: string, updates: Partial<EconomicValuation>): EconomicValuation | null {
    const valuation = this.valuations.get(id);
    if (!valuation) return null;

    const updated = {
      ...valuation,
      ...updates,
      id: valuation.id, // Preserve ID
      updatedAt: new Date(),
      version: valuation.version + 1,
    };

    this.valuations.set(id, updated);
    return updated;
  }

  /**
   * Delete valuation
   */
  deleteValuation(id: string): boolean {
    return this.valuations.delete(id);
  }

  /**
   * Calculate Annual Recurring Revenue (ARR)
   */
  calculateARR(revenueData: RevenueDataPoint[]): number {
    // Get most recent monthly data
    const monthlyData = revenueData
      .filter(r => r.periodType === 'monthly')
      .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

    if (monthlyData.length === 0) return 0;

    // Use last 12 months or annualize most recent month
    if (monthlyData.length >= 12) {
      return monthlyData.slice(0, 12).reduce((sum, r) => sum + r.amount, 0);
    } else {
      const avgMonthly = monthlyData.reduce((sum, r) => sum + r.amount, 0) / monthlyData.length;
      return avgMonthly * 12;
    }
  }

  /**
   * Calculate Monthly Recurring Revenue (MRR)
   */
  calculateMRR(revenueData: RevenueDataPoint[]): number {
    const monthlyData = revenueData
      .filter(r => r.periodType === 'monthly')
      .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

    return monthlyData.length > 0 ? monthlyData[0].amount : 0;
  }

  /**
   * Calculate MRR Growth Rate
   */
  calculateMRRGrowthRate(revenueData: RevenueDataPoint[]): number {
    const monthlyData = revenueData
      .filter(r => r.periodType === 'monthly')
      .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

    if (monthlyData.length < 2) return 0;

    const currentMRR = monthlyData[0].amount;
    const previousMRR = monthlyData[1].amount;

    return previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0;
  }

  /**
   * Calculate ARR Growth Rate (YoY)
   */
  calculateARRGrowthRate(revenueData: RevenueDataPoint[]): number {
    const arr = this.calculateARR(revenueData);

    const oldData = revenueData
      .filter(r => {
        const date = new Date(r.period);
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return date <= yearAgo;
      })
      .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());

    if (oldData.length === 0) return 0;

    const previousARR = this.calculateARR(oldData);
    return previousARR > 0 ? ((arr - previousARR) / previousARR) * 100 : 0;
  }

  /**
   * Calculate Customer Lifetime Value (CLV/LTV)
   */
  calculateCLV(
    avgContractValue: number,
    avgContractLength: number,
    retentionRate: number
  ): number {
    // CLV = (Monthly ARPU × Gross Margin) / Churn Rate
    // Simplified: ARPU × Contract Length × Retention
    return avgContractValue * avgContractLength * retentionRate;
  }

  /**
   * Calculate Customer Acquisition Cost (CAC) Payback Period
   */
  calculatePaybackPeriod(cac: number, avgMonthlyRevenue: number): number {
    return avgMonthlyRevenue > 0 ? cac / avgMonthlyRevenue : 0;
  }

  /**
   * Calculate Customer Churn Rate
   */
  calculateChurnRate(
    customersAtStart: number,
    customersLost: number
  ): number {
    return customersAtStart > 0 ? (customersLost / customersAtStart) * 100 : 0;
  }

  /**
   * Calculate Revenue Churn Rate
   */
  calculateRevenueChurnRate(
    mrrAtStart: number,
    mrrLost: number,
    mrrExpansion: number = 0
  ): number {
    return mrrAtStart > 0 ? ((mrrLost - mrrExpansion) / mrrAtStart) * 100 : 0;
  }

  /**
   * Calculate Quick Ratio
   * (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)
   */
  calculateQuickRatio(
    newMRR: number,
    expansionMRR: number,
    churnedMRR: number,
    contractionMRR: number
  ): number {
    const denominator = churnedMRR + contractionMRR;
    return denominator > 0 ? (newMRR + expansionMRR) / denominator : 0;
  }

  /**
   * Calculate Rule of 40
   * Growth Rate % + Profit Margin %
   */
  calculateRuleOf40(growthRate: number, profitMargin: number): number {
    return growthRate + profitMargin;
  }

  /**
   * Calculate comprehensive SaaS metrics
   */
  calculateSaaSMetrics(
    revenueData: RevenueDataPoint[],
    customerMetrics: CustomerMetrics,
    profitMargin: number = 20,
    salesAndMarketingSpend: number = 0
  ): SaaSMetrics {
    const arr = this.calculateARR(revenueData);
    const mrr = this.calculateMRR(revenueData);
    const mrrGrowthRate = this.calculateMRRGrowthRate(revenueData);
    const arrGrowthRate = this.calculateARRGrowthRate(revenueData);

    // Get latest revenue breakdown for Quick Ratio
    const latestRevenue = revenueData
      .filter(r => r.breakdown)
      .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())[0];

    const newMRR = latestRevenue?.breakdown?.newRevenue || 0;
    const expansionMRR = latestRevenue?.breakdown?.expansionRevenue || 0;
    const churnedMRR = latestRevenue?.breakdown?.churnedRevenue || 0;
    const contractionMRR = latestRevenue?.breakdown?.contractionRevenue || 0;

    const quickRatio = this.calculateQuickRatio(newMRR, expansionMRR, churnedMRR, contractionMRR);

    const customerChurnRate = customerMetrics.churned / customerMetrics.total * 100;
    const revenueChurnRate = this.calculateRevenueChurnRate(mrr, churnedMRR, expansionMRR);
    const negativeChurnRate = expansionMRR - churnedMRR;

    const arpu = customerMetrics.active > 0 ? mrr / customerMetrics.active : 0;
    const arppu = arpu; // Assuming all active customers are paying

    // Magic Number = Net New ARR / Sales & Marketing Spend
    const netNewARR = arr - (arr / (1 + arrGrowthRate / 100));
    const magicNumber = salesAndMarketingSpend > 0 ? netNewARR / salesAndMarketingSpend : 0;

    const ruleOf40 = this.calculateRuleOf40(arrGrowthRate, profitMargin);

    const periodEnd = new Date();
    const periodStart = new Date(periodEnd);
    periodStart.setMonth(periodStart.getMonth() - 1);

    return {
      arr,
      mrr,
      mrrGrowthRate,
      arrGrowthRate,
      customerChurnRate,
      revenueChurnRate,
      negativeChurnRate,
      quickRatio,
      magicNumber,
      ruleOf40,
      arpu,
      arppu,
      calculatedAt: new Date(),
      periodStart,
      periodEnd,
    };
  }

  /**
   * Project revenue based on historical data and growth assumptions
   */
  projectRevenue(
    historicalData: RevenueDataPoint[],
    months: number,
    growthRate: number,
    confidence: number = 0.8
  ): RevenueProjection[] {
    const projections: RevenueProjection[] = [];

    if (historicalData.length === 0) return projections;

    const latestRevenue = historicalData
      .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())[0];

    let baseAmount = latestRevenue.amount;
    const monthlyGrowth = growthRate / 100 / 12;

    for (let i = 1; i <= months; i++) {
      const period = new Date(latestRevenue.period);
      period.setMonth(period.getMonth() + i);

      baseAmount = baseAmount * (1 + monthlyGrowth);

      projections.push({
        period,
        amount: Math.round(baseAmount * 100) / 100,
        confidence: Math.max(0.1, confidence - (i * 0.02)), // Decrease confidence over time
        assumptions: [
          `Monthly growth rate: ${(monthlyGrowth * 100).toFixed(2)}%`,
          `Based on historical trend`,
          `No major market disruptions`,
        ],
        growthRate: monthlyGrowth * 100,
      });
    }

    return projections;
  }

  /**
   * Calculate business valuation using multiple methods
   */
  calculateValuation(
    method: 'dcf' | 'market-multiple' | 'asset-based' | 'revenue-multiple' | 'arr-multiple',
    inputs: {
      arr?: number;
      mrr?: number;
      revenue?: number;
      growthRate?: number;
      discountRate?: number;
      multiple?: number;
      netAssets?: number;
      projectedCashFlows?: number[];
    }
  ): ValuationAnalysis {
    let value = 0;
    let assumptions: string[] = [];

    switch (method) {
      case 'arr-multiple':
        value = (inputs.arr || 0) * (inputs.multiple || 5);
        assumptions = [
          `ARR: $${inputs.arr?.toLocaleString()}`,
          `Multiple: ${inputs.multiple}x`,
          'Typical SaaS valuation range: 3-10x ARR',
        ];
        break;

      case 'revenue-multiple':
        value = (inputs.revenue || 0) * (inputs.multiple || 3);
        assumptions = [
          `Revenue: $${inputs.revenue?.toLocaleString()}`,
          `Multiple: ${inputs.multiple}x`,
          'Based on comparable company analysis',
        ];
        break;

      case 'dcf':
        // Simplified DCF calculation
        const cashFlows = inputs.projectedCashFlows || [];
        const discountRate = inputs.discountRate || 0.1;

        value = cashFlows.reduce((sum, cf, index) => {
          const discountFactor = Math.pow(1 + discountRate, index + 1);
          return sum + (cf / discountFactor);
        }, 0);

        assumptions = [
          `Discount rate: ${(discountRate * 100).toFixed(1)}%`,
          `Projection period: ${cashFlows.length} years`,
          'Terminal growth rate: 3%',
        ];
        break;

      case 'asset-based':
        value = inputs.netAssets || 0;
        assumptions = [
          `Net assets: $${inputs.netAssets?.toLocaleString()}`,
          'Book value approach',
          'May not reflect intangible value',
        ];
        break;

      case 'market-multiple':
        const ebitda = (inputs.revenue || 0) * 0.25; // Assume 25% EBITDA margin
        value = ebitda * (inputs.multiple || 8);
        assumptions = [
          `Revenue: $${inputs.revenue?.toLocaleString()}`,
          `EBITDA multiple: ${inputs.multiple}x`,
          'Assumed 25% EBITDA margin',
        ];
        break;
    }

    return {
      method,
      baselineValue: value,
      currentValue: value,
      valueLoss: 0,
      inputs,
      assumptions,
      calculatedBy: 'ValuationService',
      calculatedAt: new Date(),
    };
  }

  /**
   * Calculate damages based on revenue loss and business impact
   */
  calculateDamages(
    lostRevenue: { historical: number; projected: number; breakdown: any },
    lostCustomers: { count: number; avgLTV: number },
    mitigationCosts: any,
    businessImpact: any,
    interestRate: number = 0.05
  ): DamageCalculation {
    const subtotal =
      lostRevenue.historical +
      lostRevenue.projected +
      (lostCustomers.count * lostCustomers.avgLTV) +
      (mitigationCosts.remediation || 0) +
      (mitigationCosts.customerRecovery || 0) +
      (mitigationCosts.reputationRepair || 0) +
      (mitigationCosts.legalAndCompliance || 0) +
      (mitigationCosts.other || 0) +
      (businessImpact.marketShareLoss || 0) +
      (businessImpact.brandDamage || 0) +
      (businessImpact.competitiveDisadvantage || 0) +
      (businessImpact.operationalDisruption || 0);

    const interest = subtotal * interestRate;
    const total = subtotal + interest;

    return {
      lostRevenue,
      lostCustomers: {
        count: lostCustomers.count,
        lifetimeValue: lostCustomers.avgLTV * lostCustomers.count,
        segmentImpact: {},
      },
      businessImpact,
      mitigationCosts,
      subtotal,
      interestRate,
      interest,
      total,
      methodology: 'Revenue loss + Customer LTV loss + Mitigation costs + Business impact',
      assumptions: [
        `Interest rate: ${(interestRate * 100).toFixed(1)}%`,
        'Customer LTV based on historical data',
        'Business impact includes market position degradation',
      ],
      supportingDocuments: [],
    };
  }

  /**
   * Helper: Get empty customer metrics structure
   */
  private getEmptyCustomerMetrics(): CustomerMetrics {
    return {
      total: 0,
      active: 0,
      churned: 0,
      newCustomers: 0,
      avgContractValue: 0,
      avgContractLength: 0,
      bySegment: {},
      byContractTerm: {},
      retention: {
        rate: 0,
        netRetention: 0,
        cohorts: [],
      },
      cac: 0,
      paybackPeriod: 0,
      ltv: 0,
      ltvCacRatio: 0,
    };
  }

  /**
   * Helper: Get empty damages structure
   */
  private getEmptyDamages(): DamageCalculation {
    return {
      lostRevenue: {
        historical: 0,
        projected: 0,
        breakdown: {
          subscriptionLoss: 0,
          expansionLoss: 0,
          oneTimeLoss: 0,
        },
      },
      lostCustomers: {
        count: 0,
        lifetimeValue: 0,
        segmentImpact: {},
      },
      businessImpact: {
        marketShareLoss: 0,
        brandDamage: 0,
        competitiveDisadvantage: 0,
        operationalDisruption: 0,
      },
      mitigationCosts: {
        remediation: 0,
        customerRecovery: 0,
        reputationRepair: 0,
        legalAndCompliance: 0,
        other: 0,
      },
      subtotal: 0,
      total: 0,
      methodology: '',
      assumptions: [],
      supportingDocuments: [],
    };
  }

  /**
   * Get all valuations
   */
  getAllValuations(): EconomicValuation[] {
    return Array.from(this.valuations.values());
  }
}

// Singleton instance
export const valuationService = new ValuationService();
