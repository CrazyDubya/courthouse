import React, { useState, useEffect } from 'react';
import type { EconomicValuation, SaaSMetrics } from '../../types/caseTypes';
import { valuationCalculator } from '../../services/ValuationCalculator';
import { MetricsPanel } from './MetricsPanel';
import { RevenueChart } from './RevenueChart';
import { CustomerMetricsView } from './CustomerMetricsView';
import { DamagesCalculator } from './DamagesCalculator';

interface EconomicValuationDashboardProps {
  caseId: string;
  onClose?: () => void;
}

export const EconomicValuationDashboard: React.FC<EconomicValuationDashboardProps> = ({
  caseId,
  onClose,
}) => {
  const [valuation, setValuation] = useState<EconomicValuation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'customers' | 'damages'>('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadValuation();
  }, [caseId]);

  const loadValuation = async () => {
    try {
      setLoading(true);
      setError(null);
      const valuations = await valuationCalculator.getValuationsByCaseId(caseId);

      if (valuations.length > 0) {
        setValuation(valuations[0]);
      } else {
        // Create a new valuation for this case
        const newValuation = await valuationCalculator.createValuation({
          caseId,
          createdBy: 'user',
        });
        setValuation(newValuation);
      }
    } catch (err) {
      console.error('Error loading valuation:', err);
      setError('Failed to load economic valuation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (valuation) {
      valuationCalculator.downloadCSV(valuation);
    }
  };

  const handleRefreshMetrics = async () => {
    if (!valuation) return;

    try {
      setLoading(true);

      // Recalculate SaaS metrics if we have data
      if (valuation.revenue.historical.length > 0) {
        const saasMetrics = await valuationCalculator.calculateSaaSMetrics(
          valuation.revenue.historical,
          valuation.customerMetrics
        );

        const updated = await valuationCalculator.updateValuation(valuation.id, {
          saasMetrics,
        });

        setValuation(updated);
      }
    } catch (err) {
      console.error('Error refreshing metrics:', err);
      setError('Failed to refresh metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-400">Loading economic valuation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg text-red-400 mb-4">{error}</div>
        <button
          onClick={loadValuation}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!valuation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-400">No valuation data available</div>
      </div>
    );
  }

  const healthScore = valuation.saasMetrics
    ? valuationCalculator.calculateHealthScore(valuation.saasMetrics)
    : 0;
  const healthStatus = valuationCalculator.getHealthStatus(healthScore);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Economic Valuation</h2>
            <p className="text-sm text-gray-400 mt-1">
              Case ID: {caseId} | Status: <span className="text-blue-400">{valuation.status}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {valuation.saasMetrics && (
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded">
                <span className="text-sm text-gray-400">Health Score:</span>
                <span className={`text-lg font-bold text-${healthStatus.color}-400`}>
                  {healthScore}
                </span>
                <span className={`text-xs text-${healthStatus.color}-400`}>
                  {healthStatus.label}
                </span>
              </div>
            )}
            <button
              onClick={handleRefreshMetrics}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
            >
              Export CSV
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'revenue'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Revenue Analysis
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'customers'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Customer Metrics
          </button>
          <button
            onClick={() => setActiveTab('damages')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'damages'
                ? 'bg-gray-900 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Damages
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {valuation.saasMetrics && <MetricsPanel saasMetrics={valuation.saasMetrics} />}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Customers</span>
                    <span className="text-white font-semibold">
                      {valuation.customerMetrics.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Customers</span>
                    <span className="text-white font-semibold">
                      {valuation.customerMetrics.active.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Customer LTV</span>
                    <span className="text-white font-semibold">
                      {valuationCalculator.formatCurrency(valuation.customerMetrics.ltv)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CAC</span>
                    <span className="text-white font-semibold">
                      {valuationCalculator.formatCurrency(valuation.customerMetrics.cac)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">LTV:CAC Ratio</span>
                    <span className="text-white font-semibold">
                      {valuation.customerMetrics.ltvCacRatio.toFixed(2)}x
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Total Damages</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lost Revenue (Historical)</span>
                    <span className="text-red-400 font-semibold">
                      {valuationCalculator.formatCurrency(valuation.damages.lostRevenue.historical)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lost Revenue (Projected)</span>
                    <span className="text-red-400 font-semibold">
                      {valuationCalculator.formatCurrency(valuation.damages.lostRevenue.projected)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lost Customer Value</span>
                    <span className="text-red-400 font-semibold">
                      {valuationCalculator.formatCurrency(valuation.damages.lostCustomers.lifetimeValue)}
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Total Damages</span>
                      <span className="text-red-500 font-bold text-lg">
                        {valuationCalculator.formatCurrency(valuation.damages.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {valuation.llmAnalysis && (
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">LLM Analysis</h3>
                <p className="text-gray-300 mb-4">{valuation.llmAnalysis.summary}</p>

                {valuation.llmAnalysis.keyFindings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">Key Findings</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {valuation.llmAnalysis.keyFindings.map((finding, idx) => (
                        <li key={idx} className="text-gray-300">{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'revenue' && (
          <RevenueChart
            historicalRevenue={valuation.revenue.historical}
            projectedRevenue={valuation.revenue.projected}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerMetricsView customerMetrics={valuation.customerMetrics} />
        )}

        {activeTab === 'damages' && (
          <DamagesCalculator
            valuation={valuation}
            onUpdate={async (updated) => {
              const result = await valuationCalculator.updateValuation(valuation.id, updated);
              setValuation(result);
            }}
          />
        )}
      </div>
    </div>
  );
};
