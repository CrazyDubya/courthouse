import React from 'react';
import type { SaaSMetrics } from '../../types/caseTypes';
import { valuationCalculator } from '../../services/ValuationCalculator';

interface MetricsPanelProps {
  saasMetrics: SaaSMetrics;
}

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtitle,
  trend,
  trendLabel,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-500/10',
    green: 'border-green-500 bg-green-500/10',
    yellow: 'border-yellow-500 bg-yellow-500/10',
    red: 'border-red-500 bg-red-500/10',
    purple: 'border-purple-500 bg-purple-500/10',
  };

  const trendColor = trend && trend >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className={`p-4 rounded-lg border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-400 mb-1">{label}</div>
          <div className="text-2xl font-bold text-white mb-1">{value}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
        {trend !== undefined && (
          <div className={`text-right ${trendColor}`}>
            <div className="text-lg font-semibold">
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
            </div>
            {trendLabel && <div className="text-xs">{trendLabel}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ saasMetrics }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-4">SaaS Metrics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Annual Recurring Revenue"
          value={valuationCalculator.formatCompact(saasMetrics.arr)}
          subtitle={valuationCalculator.formatCurrency(saasMetrics.arr)}
          trend={saasMetrics.arrGrowthRate}
          trendLabel="YoY"
          color="blue"
        />

        <MetricCard
          label="Monthly Recurring Revenue"
          value={valuationCalculator.formatCompact(saasMetrics.mrr)}
          subtitle={valuationCalculator.formatCurrency(saasMetrics.mrr)}
          trend={saasMetrics.mrrGrowthRate}
          trendLabel="MoM"
          color="green"
        />

        <MetricCard
          label="Customer Churn Rate"
          value={valuationCalculator.formatPercentage(saasMetrics.customerChurnRate)}
          subtitle="Monthly"
          color={saasMetrics.customerChurnRate <= 5 ? 'green' : saasMetrics.customerChurnRate <= 10 ? 'yellow' : 'red'}
        />

        <MetricCard
          label="Revenue Churn Rate"
          value={valuationCalculator.formatPercentage(saasMetrics.revenueChurnRate)}
          subtitle="Monthly"
          color={saasMetrics.revenueChurnRate <= 5 ? 'green' : saasMetrics.revenueChurnRate <= 10 ? 'yellow' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Quick Ratio"
          value={saasMetrics.quickRatio.toFixed(2)}
          subtitle="(New + Expansion) / (Churned + Contraction)"
          color={saasMetrics.quickRatio >= 4 ? 'green' : saasMetrics.quickRatio >= 2 ? 'blue' : saasMetrics.quickRatio >= 1 ? 'yellow' : 'red'}
        />

        <MetricCard
          label="Rule of 40"
          value={saasMetrics.ruleOf40.toFixed(1)}
          subtitle="Growth Rate + Profit Margin"
          color={saasMetrics.ruleOf40 >= 40 ? 'green' : saasMetrics.ruleOf40 >= 20 ? 'blue' : 'yellow'}
        />

        <MetricCard
          label="Magic Number"
          value={saasMetrics.magicNumber.toFixed(2)}
          subtitle="Sales Efficiency"
          color={saasMetrics.magicNumber >= 1 ? 'green' : saasMetrics.magicNumber >= 0.75 ? 'blue' : 'yellow'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <MetricCard
          label="ARPU (Average Revenue Per User)"
          value={valuationCalculator.formatCurrency(saasMetrics.arpu)}
          subtitle="Monthly per user"
          color="purple"
        />

        <MetricCard
          label="ARPPU (Average Revenue Per Paying User)"
          value={valuationCalculator.formatCurrency(saasMetrics.arppu)}
          subtitle="Monthly per paying user"
          color="purple"
        />
      </div>

      <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="text-xs text-gray-400">
          Calculated at: {new Date(saasMetrics.calculatedAt).toLocaleString()} |
          Period: {new Date(saasMetrics.periodStart).toLocaleDateString()} - {new Date(saasMetrics.periodEnd).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};
