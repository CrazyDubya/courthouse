import type {
  EconomicValuation,
  SaaSMetrics,
  RevenueDataPoint,
  RevenueProjection,
  CustomerMetrics,
  ValuationAnalysis,
  DamageCalculation,
  ValuationMethod,
} from '../types/caseTypes';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * ValuationCalculator: Frontend service for economic valuation
 * Handles API calls to backend and client-side calculations
 */
export class ValuationCalculator {
  /**
   * Fetch all valuations
   */
  async getAllValuations(): Promise<EconomicValuation[]> {
    const response = await fetch(`${API_BASE_URL}/valuation`);
    if (!response.ok) throw new Error('Failed to fetch valuations');
    return response.json();
  }

  /**
   * Fetch valuation by ID
   */
  async getValuation(id: string): Promise<EconomicValuation> {
    const response = await fetch(`${API_BASE_URL}/valuation/${id}`);
    if (!response.ok) throw new Error('Failed to fetch valuation');
    return response.json();
  }

  /**
   * Fetch valuations for a case
   */
  async getValuationsByCaseId(caseId: string): Promise<EconomicValuation[]> {
    const response = await fetch(`${API_BASE_URL}/valuation/case/${caseId}`);
    if (!response.ok) throw new Error('Failed to fetch case valuations');
    return response.json();
  }

  /**
   * Create new valuation
   */
  async createValuation(data: Partial<EconomicValuation>): Promise<EconomicValuation> {
    const response = await fetch(`${API_BASE_URL}/valuation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create valuation');
    return response.json();
  }

  /**
   * Update valuation
   */
  async updateValuation(id: string, data: Partial<EconomicValuation>): Promise<EconomicValuation> {
    const response = await fetch(`${API_BASE_URL}/valuation/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update valuation');
    return response.json();
  }

  /**
   * Delete valuation
   */
  async deleteValuation(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/valuation/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete valuation');
  }

  /**
   * Calculate SaaS metrics (ARR, MRR, churn, etc.)
   */
  async calculateSaaSMetrics(
    revenueData: RevenueDataPoint[],
    customerMetrics: CustomerMetrics,
    profitMargin?: number,
    salesAndMarketingSpend?: number
  ): Promise<SaaSMetrics> {
    const response = await fetch(`${API_BASE_URL}/valuation/calculate/saas-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        revenueData,
        customerMetrics,
        profitMargin,
        salesAndMarketingSpend,
      }),
    });
    if (!response.ok) throw new Error('Failed to calculate SaaS metrics');
    return response.json();
  }

  /**
   * Calculate ARR
   */
  async calculateARR(revenueData: RevenueDataPoint[]): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/valuation/calculate/arr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revenueData }),
    });
    if (!response.ok) throw new Error('Failed to calculate ARR');
    const data = await response.json();
    return data.arr;
  }

  /**
   * Calculate MRR
   */
  async calculateMRR(revenueData: RevenueDataPoint[]): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/valuation/calculate/mrr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revenueData }),
    });
    if (!response.ok) throw new Error('Failed to calculate MRR');
    const data = await response.json();
    return data.mrr;
  }

  /**
   * Calculate CLV (Customer Lifetime Value)
   */
  async calculateCLV(
    avgContractValue: number,
    avgContractLength: number,
    retentionRate: number
  ): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/valuation/calculate/clv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avgContractValue, avgContractLength, retentionRate }),
    });
    if (!response.ok) throw new Error('Failed to calculate CLV');
    const data = await response.json();
    return data.clv;
  }

  /**
   * Project revenue
   */
  async projectRevenue(
    historicalData: RevenueDataPoint[],
    months: number,
    growthRate: number,
    confidence?: number
  ): Promise<RevenueProjection[]> {
    const response = await fetch(`${API_BASE_URL}/valuation/calculate/projection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ historicalData, months, growthRate, confidence }),
    });
    if (!response.ok) throw new Error('Failed to project revenue');
    const data = await response.json();
    return data.projections;
  }

  /**
   * Calculate business valuation
   */
  async calculateValuation(
    method: ValuationMethod,
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
  ): Promise<ValuationAnalysis> {
    const response = await fetch(`${API_BASE_URL}/valuation/calculate/valuation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, inputs }),
    });
    if (!response.ok) throw new Error('Failed to calculate valuation');
    return response.json();
  }

  /**
   * Calculate damages
   */
  async calculateDamages(
    lostRevenue: {
      historical: number;
      projected: number;
      breakdown: {
        subscriptionLoss: number;
        expansionLoss: number;
        oneTimeLoss: number;
      };
    },
    lostCustomers: {
      count: number;
      avgLTV: number;
    },
    mitigationCosts: any,
    businessImpact: any,
    interestRate?: number
  ): Promise<DamageCalculation> {
    const response = await fetch(`${API_BASE_URL}/valuation/calculate/damages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lostRevenue,
        lostCustomers,
        mitigationCosts,
        businessImpact,
        interestRate,
      }),
    });
    if (!response.ok) throw new Error('Failed to calculate damages');
    return response.json();
  }

  /**
   * Request LLM analysis
   */
  async analyzeLLM(valuationId: string): Promise<EconomicValuation> {
    const response = await fetch(`${API_BASE_URL}/valuation/${valuationId}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to analyze valuation');
    return response.json();
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, decimals: number = 0): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  }

  /**
   * Format percentage for display
   */
  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Format large numbers (K, M, B)
   */
  formatCompact(value: number): string {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(value);
  }

  /**
   * Calculate month-over-month growth
   */
  calculateMoMGrowth(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Calculate year-over-year growth
   */
  calculateYoYGrowth(current: number, yearAgo: number): number {
    if (yearAgo === 0) return 0;
    return ((current - yearAgo) / yearAgo) * 100;
  }

  /**
   * Calculate average from array of numbers
   */
  calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Calculate median from array of numbers
   */
  calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Generate chart data for revenue trends
   */
  generateRevenueChartData(historical: RevenueDataPoint[], projected: RevenueProjection[]) {
    const historicalData = historical.map(r => ({
      date: new Date(r.period).toLocaleDateString(),
      value: r.amount,
      type: 'historical' as const,
    }));

    const projectedData = projected.map(r => ({
      date: new Date(r.period).toLocaleDateString(),
      value: r.amount,
      type: 'projected' as const,
      confidence: r.confidence,
    }));

    return {
      labels: [...historicalData, ...projectedData].map(d => d.date),
      historical: historicalData.map(d => d.value),
      projected: [
        ...new Array(historicalData.length).fill(null),
        ...projectedData.map(d => d.value),
      ],
    };
  }

  /**
   * Generate chart data for customer metrics
   */
  generateCustomerChartData(customerMetrics: CustomerMetrics) {
    return {
      total: customerMetrics.total,
      active: customerMetrics.active,
      churned: customerMetrics.churned,
      new: customerMetrics.newCustomers,
      segments: Object.entries(customerMetrics.bySegment).map(([name, count]) => ({
        name,
        count,
      })),
      contractTerms: Object.entries(customerMetrics.byContractTerm).map(([term, count]) => ({
        term,
        count,
      })),
    };
  }

  /**
   * Calculate health score (0-100)
   */
  calculateHealthScore(saasMetrics: SaaSMetrics): number {
    let score = 0;

    // ARR growth (30 points)
    if (saasMetrics.arrGrowthRate >= 100) score += 30;
    else if (saasMetrics.arrGrowthRate >= 50) score += 25;
    else if (saasMetrics.arrGrowthRate >= 20) score += 20;
    else if (saasMetrics.arrGrowthRate >= 0) score += 10;

    // Churn rate (30 points)
    if (saasMetrics.customerChurnRate <= 2) score += 30;
    else if (saasMetrics.customerChurnRate <= 5) score += 25;
    else if (saasMetrics.customerChurnRate <= 10) score += 15;
    else if (saasMetrics.customerChurnRate <= 15) score += 5;

    // Quick ratio (20 points)
    if (saasMetrics.quickRatio >= 4) score += 20;
    else if (saasMetrics.quickRatio >= 2) score += 15;
    else if (saasMetrics.quickRatio >= 1) score += 10;
    else if (saasMetrics.quickRatio >= 0.5) score += 5;

    // Rule of 40 (20 points)
    if (saasMetrics.ruleOf40 >= 40) score += 20;
    else if (saasMetrics.ruleOf40 >= 30) score += 15;
    else if (saasMetrics.ruleOf40 >= 20) score += 10;
    else if (saasMetrics.ruleOf40 >= 10) score += 5;

    return score;
  }

  /**
   * Get health status label
   */
  getHealthStatus(score: number): { label: string; color: string } {
    if (score >= 80) return { label: 'Excellent', color: 'green' };
    if (score >= 60) return { label: 'Good', color: 'blue' };
    if (score >= 40) return { label: 'Fair', color: 'yellow' };
    if (score >= 20) return { label: 'Poor', color: 'orange' };
    return { label: 'Critical', color: 'red' };
  }

  /**
   * Export valuation to CSV
   */
  exportToCSV(valuation: EconomicValuation): string {
    const rows: string[][] = [];

    // Header
    rows.push(['Economic Valuation Report']);
    rows.push(['Case ID', valuation.caseId]);
    rows.push(['Generated', new Date(valuation.createdAt).toLocaleDateString()]);
    rows.push([]);

    // SaaS Metrics
    if (valuation.saasMetrics) {
      rows.push(['SaaS Metrics']);
      rows.push(['ARR', this.formatCurrency(valuation.saasMetrics.arr)]);
      rows.push(['MRR', this.formatCurrency(valuation.saasMetrics.mrr)]);
      rows.push(['ARR Growth', this.formatPercentage(valuation.saasMetrics.arrGrowthRate)]);
      rows.push(['MRR Growth', this.formatPercentage(valuation.saasMetrics.mrrGrowthRate)]);
      rows.push(['Customer Churn', this.formatPercentage(valuation.saasMetrics.customerChurnRate)]);
      rows.push(['Quick Ratio', valuation.saasMetrics.quickRatio.toFixed(2)]);
      rows.push([]);
    }

    // Customer Metrics
    rows.push(['Customer Metrics']);
    rows.push(['Total Customers', valuation.customerMetrics.total.toString()]);
    rows.push(['Active Customers', valuation.customerMetrics.active.toString()]);
    rows.push(['Churned Customers', valuation.customerMetrics.churned.toString()]);
    rows.push(['Avg Contract Value', this.formatCurrency(valuation.customerMetrics.avgContractValue)]);
    rows.push(['Customer LTV', this.formatCurrency(valuation.customerMetrics.ltv)]);
    rows.push(['CAC', this.formatCurrency(valuation.customerMetrics.cac)]);
    rows.push([]);

    // Damages
    rows.push(['Damages']);
    rows.push(['Lost Revenue (Historical)', this.formatCurrency(valuation.damages.lostRevenue.historical)]);
    rows.push(['Lost Revenue (Projected)', this.formatCurrency(valuation.damages.lostRevenue.projected)]);
    rows.push(['Lost Customers Value', this.formatCurrency(valuation.damages.lostCustomers.lifetimeValue)]);
    rows.push(['Mitigation Costs', this.formatCurrency(
      Object.values(valuation.damages.mitigationCosts).reduce((a, b) => a + b, 0)
    )]);
    rows.push(['Total Damages', this.formatCurrency(valuation.damages.total)]);

    return rows.map(row => row.join(',')).join('\n');
  }

  /**
   * Download CSV file
   */
  downloadCSV(valuation: EconomicValuation, filename?: string): void {
    const csv = this.exportToCSV(valuation);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `valuation-${valuation.id}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const valuationCalculator = new ValuationCalculator();
