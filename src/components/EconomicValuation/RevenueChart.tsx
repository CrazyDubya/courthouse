import React from 'react';
import type { RevenueDataPoint, RevenueProjection } from '../../types/caseTypes';
import { valuationCalculator } from '../../services/ValuationCalculator';

interface RevenueChartProps {
  historicalRevenue: RevenueDataPoint[];
  projectedRevenue: RevenueProjection[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  historicalRevenue,
  projectedRevenue,
}) => {
  // Combine and sort all data points
  const allDataPoints = [
    ...historicalRevenue.map(r => ({
      date: new Date(r.period),
      amount: r.amount,
      type: 'historical' as const,
    })),
    ...projectedRevenue.map(r => ({
      date: new Date(r.period),
      amount: r.amount,
      type: 'projected' as const,
      confidence: r.confidence,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Calculate max value for scaling
  const maxValue = Math.max(...allDataPoints.map(d => d.amount), 1);
  const minValue = Math.min(...allDataPoints.map(d => d.amount), 0);
  const range = maxValue - minValue;

  // Calculate stats
  const totalHistorical = historicalRevenue.reduce((sum, r) => sum + r.amount, 0);
  const avgHistorical = historicalRevenue.length > 0 ? totalHistorical / historicalRevenue.length : 0;
  const totalProjected = projectedRevenue.reduce((sum, r) => sum + r.amount, 0);
  const avgProjected = projectedRevenue.length > 0 ? totalProjected / projectedRevenue.length : 0;

  // Calculate growth rate
  const growthRate = avgHistorical > 0 ? ((avgProjected - avgHistorical) / avgHistorical) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Revenue Analysis</h3>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Total Historical</div>
            <div className="text-xl font-bold text-blue-400">
              {valuationCalculator.formatCurrency(totalHistorical)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Avg: {valuationCalculator.formatCurrency(avgHistorical)}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Total Projected</div>
            <div className="text-xl font-bold text-green-400">
              {valuationCalculator.formatCurrency(totalProjected)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Avg: {valuationCalculator.formatCurrency(avgProjected)}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Growth Rate</div>
            <div className={`text-xl font-bold ${growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {growthRate >= 0 ? '↑' : '↓'} {Math.abs(growthRate).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Historical to Projected</div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Data Points</div>
            <div className="text-xl font-bold text-purple-400">
              {allDataPoints.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {historicalRevenue.length} historical, {projectedRevenue.length} projected
            </div>
          </div>
        </div>
      </div>

      {/* Simple Bar Chart */}
      {allDataPoints.length > 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-end justify-between h-64 gap-1">
            {allDataPoints.map((point, index) => {
              const heightPercent = range > 0 ? ((point.amount - minValue) / range) * 100 : 0;
              const isHistorical = point.type === 'historical';
              const confidence = 'confidence' in point ? point.confidence : 1;

              return (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t transition-all ${
                      isHistorical
                        ? 'bg-blue-500 hover:bg-blue-400'
                        : 'bg-green-500 hover:bg-green-400'
                    }`}
                    style={{
                      height: `${heightPercent}%`,
                      opacity: isHistorical ? 1 : 0.5 + (confidence * 0.5),
                    }}
                  />

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                    <div className="font-semibold">{valuationCalculator.formatCurrency(point.amount)}</div>
                    <div className="text-gray-400">{point.date.toLocaleDateString()}</div>
                    {!isHistorical && (
                      <div className="text-gray-400">
                        Confidence: {valuationCalculator.formatPercentage(confidence * 100)}
                      </div>
                    )}
                  </div>

                  {/* Date label (show every few bars to avoid crowding) */}
                  {(index % Math.ceil(allDataPoints.length / 8) === 0 || index === allDataPoints.length - 1) && (
                    <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                      {point.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-8 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-400">Historical Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 opacity-75 rounded"></div>
              <span className="text-sm text-gray-400">Projected Revenue</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="text-center text-gray-400">
            No revenue data available. Add revenue data points to see the chart.
          </div>
        </div>
      )}

      {/* Revenue Breakdown Table */}
      {historicalRevenue.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-md font-semibold text-white">Historical Revenue Details</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Period</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">New</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Expansion</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Churned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {historicalRevenue
                  .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime())
                  .map((revenue, index) => (
                    <tr key={index} className="hover:bg-gray-750">
                      <td className="px-4 py-3 text-sm text-white">
                        {new Date(revenue.period).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-white font-semibold">
                        {valuationCalculator.formatCurrency(revenue.amount)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-green-400">
                        {revenue.breakdown?.newRevenue
                          ? valuationCalculator.formatCurrency(revenue.breakdown.newRevenue)
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-blue-400">
                        {revenue.breakdown?.expansionRevenue
                          ? valuationCalculator.formatCurrency(revenue.breakdown.expansionRevenue)
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-red-400">
                        {revenue.breakdown?.churnedRevenue
                          ? valuationCalculator.formatCurrency(revenue.breakdown.churnedRevenue)
                          : '-'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
