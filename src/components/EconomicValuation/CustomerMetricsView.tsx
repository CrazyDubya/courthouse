import React from 'react';
import type { CustomerMetrics } from '../../types/caseTypes';
import { valuationCalculator } from '../../services/ValuationCalculator';

interface CustomerMetricsViewProps {
  customerMetrics: CustomerMetrics;
}

export const CustomerMetricsView: React.FC<CustomerMetricsViewProps> = ({ customerMetrics }) => {
  const activeRate = customerMetrics.total > 0
    ? (customerMetrics.active / customerMetrics.total) * 100
    : 0;
  const churnRate = customerMetrics.total > 0
    ? (customerMetrics.churned / customerMetrics.total) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Customer Metrics</h3>

        {/* Customer Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Total Customers</div>
            <div className="text-3xl font-bold text-white">
              {customerMetrics.total.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Active Customers</div>
            <div className="text-3xl font-bold text-green-400">
              {customerMetrics.active.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {activeRate.toFixed(1)}% of total
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Churned Customers</div>
            <div className="text-3xl font-bold text-red-400">
              {customerMetrics.churned.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {churnRate.toFixed(1)}% churn rate
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">New Customers</div>
            <div className="text-3xl font-bold text-blue-400">
              {customerMetrics.newCustomers.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
            <div className="text-sm text-gray-400 mb-1">Avg Contract Value</div>
            <div className="text-2xl font-bold text-white">
              {valuationCalculator.formatCurrency(customerMetrics.avgContractValue)}
            </div>
            <div className="text-xs text-gray-500 mt-1">Per customer</div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-green-500">
            <div className="text-sm text-gray-400 mb-1">Customer Lifetime Value</div>
            <div className="text-2xl font-bold text-white">
              {valuationCalculator.formatCurrency(customerMetrics.ltv)}
            </div>
            <div className="text-xs text-gray-500 mt-1">LTV per customer</div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500">
            <div className="text-sm text-gray-400 mb-1">Customer Acquisition Cost</div>
            <div className="text-2xl font-bold text-white">
              {valuationCalculator.formatCurrency(customerMetrics.cac)}
            </div>
            <div className="text-xs text-gray-500 mt-1">CAC per customer</div>
          </div>
        </div>

        {/* Key Ratios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">LTV:CAC Ratio</div>
            <div className="text-3xl font-bold text-white mb-2">
              {customerMetrics.ltvCacRatio.toFixed(2)}x
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  customerMetrics.ltvCacRatio >= 3
                    ? 'bg-green-500'
                    : customerMetrics.ltvCacRatio >= 1
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((customerMetrics.ltvCacRatio / 5) * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {customerMetrics.ltvCacRatio >= 3
                ? '✓ Excellent (>3:1)'
                : customerMetrics.ltvCacRatio >= 1
                ? '⚠ Fair (1-3:1)'
                : '✗ Poor (<1:1)'}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">CAC Payback Period</div>
            <div className="text-3xl font-bold text-white mb-2">
              {customerMetrics.paybackPeriod.toFixed(1)} months
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  customerMetrics.paybackPeriod <= 12
                    ? 'bg-green-500'
                    : customerMetrics.paybackPeriod <= 18
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((24 / customerMetrics.paybackPeriod) * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {customerMetrics.paybackPeriod <= 12
                ? '✓ Excellent (<12 months)'
                : customerMetrics.paybackPeriod <= 18
                ? '⚠ Fair (12-18 months)'
                : '✗ Poor (>18 months)'}
            </div>
          </div>
        </div>

        {/* Contract Length */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
          <div className="text-sm text-gray-400 mb-1">Average Contract Length</div>
          <div className="text-2xl font-bold text-white">
            {customerMetrics.avgContractLength.toFixed(1)} months
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(customerMetrics.avgContractLength / 12).toFixed(1)} years
          </div>
        </div>
      </div>

      {/* Retention Metrics */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h4 className="text-md font-semibold text-white mb-4">Retention Metrics</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-sm text-gray-400 mb-2">Retention Rate</div>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-white">
                {valuationCalculator.formatPercentage(customerMetrics.retention.rate * 100)}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${customerMetrics.retention.rate * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-2">Net Retention Rate</div>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-white">
                {valuationCalculator.formatPercentage(customerMetrics.retention.netRetention * 100)}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      customerMetrics.retention.netRetention >= 1.1
                        ? 'bg-green-500'
                        : customerMetrics.retention.netRetention >= 0.9
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(customerMetrics.retention.netRetention * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {customerMetrics.retention.netRetention >= 1.1
                ? 'Excellent - Negative churn!'
                : customerMetrics.retention.netRetention >= 0.9
                ? 'Good retention'
                : 'Needs improvement'}
            </div>
          </div>
        </div>

        {/* Cohort Analysis */}
        {customerMetrics.retention.cohorts.length > 0 && (
          <div>
            <h5 className="text-sm font-semibold text-gray-400 mb-3">Cohort Analysis</h5>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-400 uppercase">Cohort</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Initial</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">LTV</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">CAC</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-400 uppercase">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {customerMetrics.retention.cohorts.map((cohort, index) => {
                    const latestRetention = cohort.retentionRates[cohort.retentionRates.length - 1] || 0;
                    return (
                      <tr key={index} className="hover:bg-gray-750">
                        <td className="px-3 py-2 text-white">{cohort.cohort}</td>
                        <td className="px-3 py-2 text-right text-white">{cohort.initialCount}</td>
                        <td className="px-3 py-2 text-right text-green-400">
                          {valuationCalculator.formatCurrency(cohort.lifetimeValue)}
                        </td>
                        <td className="px-3 py-2 text-right text-purple-400">
                          {valuationCalculator.formatCurrency(cohort.acquisitionCost)}
                        </td>
                        <td className="px-3 py-2 text-right text-white">
                          {valuationCalculator.formatPercentage(latestRetention * 100)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Customer Segmentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* By Segment */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h4 className="text-md font-semibold text-white mb-4">Customers by Segment</h4>
          <div className="space-y-3">
            {Object.entries(customerMetrics.bySegment).map(([segment, count]) => {
              const percentage = customerMetrics.total > 0 ? (count / customerMetrics.total) * 100 : 0;
              return (
                <div key={segment}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400 capitalize">{segment}</span>
                    <span className="text-sm text-white font-semibold">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Contract Term */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h4 className="text-md font-semibold text-white mb-4">Customers by Contract Term</h4>
          <div className="space-y-3">
            {Object.entries(customerMetrics.byContractTerm).map(([term, count]) => {
              const percentage = customerMetrics.total > 0 ? (count / customerMetrics.total) * 100 : 0;
              return (
                <div key={term}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400 capitalize">{term}</span>
                    <span className="text-sm text-white font-semibold">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
