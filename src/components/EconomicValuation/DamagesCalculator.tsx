import React, { useState } from 'react';
import type { EconomicValuation, DamageCalculation } from '../../types/caseTypes';
import { valuationCalculator } from '../../services/ValuationCalculator';

interface DamagesCalculatorProps {
  valuation: EconomicValuation;
  onUpdate: (updates: Partial<EconomicValuation>) => Promise<void>;
}

export const DamagesCalculator: React.FC<DamagesCalculatorProps> = ({ valuation, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDamages, setEditedDamages] = useState<DamageCalculation>(valuation.damages);

  const handleSave = async () => {
    await onUpdate({ damages: editedDamages });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDamages(valuation.damages);
    setIsEditing(false);
  };

  const damages = isEditing ? editedDamages : valuation.damages;

  const updateField = (path: string[], value: number) => {
    const updated = { ...editedDamages };
    let current: any = updated;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }

    current[path[path.length - 1]] = value;

    // Recalculate subtotal and total
    const lostRevenueTotal = updated.lostRevenue.historical + updated.lostRevenue.projected;
    const lostCustomersTotal = updated.lostCustomers.lifetimeValue;
    const businessImpactTotal =
      updated.businessImpact.marketShareLoss +
      updated.businessImpact.brandDamage +
      updated.businessImpact.competitiveDisadvantage +
      updated.businessImpact.operationalDisruption;
    const mitigationTotal =
      updated.mitigationCosts.remediation +
      updated.mitigationCosts.customerRecovery +
      updated.mitigationCosts.reputationRepair +
      updated.mitigationCosts.legalAndCompliance +
      updated.mitigationCosts.other;

    updated.subtotal = lostRevenueTotal + lostCustomersTotal + businessImpactTotal + mitigationTotal;
    updated.interest = updated.interestRate ? updated.subtotal * updated.interestRate : 0;
    updated.total = updated.subtotal + (updated.interest || 0);

    setEditedDamages(updated);
  };

  const NumberInput: React.FC<{
    label: string;
    value: number;
    path: string[];
    disabled?: boolean;
  }> = ({ label, value, path, disabled = false }) => (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-gray-400">{label}</span>
      {isEditing && !disabled ? (
        <input
          type="number"
          value={value}
          onChange={(e) => updateField(path, parseFloat(e.target.value) || 0)}
          className="w-32 px-2 py-1 bg-gray-700 text-white rounded text-sm text-right"
        />
      ) : (
        <span className="text-sm text-white font-semibold">
          {valuationCalculator.formatCurrency(value)}
        </span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Damages Calculation</h3>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Edit Damages
            </button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 p-6 rounded-lg border-2 border-red-500">
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">Total Damages Claimed</div>
          <div className="text-4xl font-bold text-red-400">
            {valuationCalculator.formatCurrency(damages.total)}
          </div>
          {damages.interest && damages.interest > 0 && (
            <div className="text-sm text-gray-400 mt-2">
              Includes {valuationCalculator.formatCurrency(damages.interest)} in interest
              ({valuationCalculator.formatPercentage((damages.interestRate || 0) * 100)})
            </div>
          )}
        </div>
      </div>

      {/* Lost Revenue */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-red-400">📉</span> Lost Revenue
        </h4>

        <NumberInput
          label="Historical Lost Revenue"
          value={damages.lostRevenue.historical}
          path={['lostRevenue', 'historical']}
        />
        <NumberInput
          label="Projected Lost Revenue"
          value={damages.lostRevenue.projected}
          path={['lostRevenue', 'projected']}
        />

        <div className="mt-4 pt-4 border-t border-gray-700">
          <h5 className="text-sm font-semibold text-gray-400 mb-3">Revenue Breakdown</h5>
          <NumberInput
            label="Subscription Loss"
            value={damages.lostRevenue.breakdown.subscriptionLoss}
            path={['lostRevenue', 'breakdown', 'subscriptionLoss']}
          />
          <NumberInput
            label="Expansion Loss"
            value={damages.lostRevenue.breakdown.expansionLoss}
            path={['lostRevenue', 'breakdown', 'expansionLoss']}
          />
          <NumberInput
            label="One-Time Loss"
            value={damages.lostRevenue.breakdown.oneTimeLoss}
            path={['lostRevenue', 'breakdown', 'oneTimeLoss']}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
          <span className="text-white font-semibold">Subtotal - Lost Revenue</span>
          <span className="text-red-400 font-bold">
            {valuationCalculator.formatCurrency(
              damages.lostRevenue.historical + damages.lostRevenue.projected
            )}
          </span>
        </div>
      </div>

      {/* Lost Customers */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-red-400">👥</span> Lost Customer Value
        </h4>

        <NumberInput
          label="Number of Lost Customers"
          value={damages.lostCustomers.count}
          path={['lostCustomers', 'count']}
        />
        <NumberInput
          label="Total Lifetime Value Lost"
          value={damages.lostCustomers.lifetimeValue}
          path={['lostCustomers', 'lifetimeValue']}
        />

        {damages.lostCustomers.count > 0 && (
          <div className="mt-2 text-sm text-gray-400">
            Avg LTV per lost customer:{' '}
            {valuationCalculator.formatCurrency(
              damages.lostCustomers.lifetimeValue / damages.lostCustomers.count
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
          <span className="text-white font-semibold">Subtotal - Lost Customers</span>
          <span className="text-red-400 font-bold">
            {valuationCalculator.formatCurrency(damages.lostCustomers.lifetimeValue)}
          </span>
        </div>
      </div>

      {/* Business Impact */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-red-400">💼</span> Business Impact
        </h4>

        <NumberInput
          label="Market Share Loss"
          value={damages.businessImpact.marketShareLoss}
          path={['businessImpact', 'marketShareLoss']}
        />
        <NumberInput
          label="Brand Damage"
          value={damages.businessImpact.brandDamage}
          path={['businessImpact', 'brandDamage']}
        />
        <NumberInput
          label="Competitive Disadvantage"
          value={damages.businessImpact.competitiveDisadvantage}
          path={['businessImpact', 'competitiveDisadvantage']}
        />
        <NumberInput
          label="Operational Disruption"
          value={damages.businessImpact.operationalDisruption}
          path={['businessImpact', 'operationalDisruption']}
        />

        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
          <span className="text-white font-semibold">Subtotal - Business Impact</span>
          <span className="text-red-400 font-bold">
            {valuationCalculator.formatCurrency(
              damages.businessImpact.marketShareLoss +
                damages.businessImpact.brandDamage +
                damages.businessImpact.competitiveDisadvantage +
                damages.businessImpact.operationalDisruption
            )}
          </span>
        </div>
      </div>

      {/* Mitigation Costs */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h4 className="text-md font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-red-400">🔧</span> Mitigation Costs
        </h4>

        <NumberInput
          label="Remediation Costs"
          value={damages.mitigationCosts.remediation}
          path={['mitigationCosts', 'remediation']}
        />
        <NumberInput
          label="Customer Recovery Costs"
          value={damages.mitigationCosts.customerRecovery}
          path={['mitigationCosts', 'customerRecovery']}
        />
        <NumberInput
          label="Reputation Repair Costs"
          value={damages.mitigationCosts.reputationRepair}
          path={['mitigationCosts', 'reputationRepair']}
        />
        <NumberInput
          label="Legal & Compliance Costs"
          value={damages.mitigationCosts.legalAndCompliance}
          path={['mitigationCosts', 'legalAndCompliance']}
        />
        <NumberInput
          label="Other Costs"
          value={damages.mitigationCosts.other}
          path={['mitigationCosts', 'other']}
        />

        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between">
          <span className="text-white font-semibold">Subtotal - Mitigation Costs</span>
          <span className="text-red-400 font-bold">
            {valuationCalculator.formatCurrency(
              damages.mitigationCosts.remediation +
                damages.mitigationCosts.customerRecovery +
                damages.mitigationCosts.reputationRepair +
                damages.mitigationCosts.legalAndCompliance +
                damages.mitigationCosts.other
            )}
          </span>
        </div>
      </div>

      {/* Total Summary */}
      <div className="bg-gray-800 p-6 rounded-lg border-2 border-red-500">
        <h4 className="text-md font-semibold text-white mb-4">Damages Summary</h4>

        <div className="space-y-3">
          <div className="flex justify-between text-white">
            <span>Subtotal (all damages)</span>
            <span className="font-semibold">
              {valuationCalculator.formatCurrency(damages.subtotal)}
            </span>
          </div>

          {damages.interestRate && damages.interestRate > 0 && (
            <>
              <NumberInput
                label={`Interest Rate`}
                value={(damages.interestRate || 0) * 100}
                path={['interestRate']}
              />
              <div className="flex justify-between text-white">
                <span>Interest ({valuationCalculator.formatPercentage((damages.interestRate || 0) * 100)})</span>
                <span className="font-semibold">
                  {valuationCalculator.formatCurrency(damages.interest || 0)}
                </span>
              </div>
            </>
          )}

          <div className="pt-3 border-t-2 border-red-500 flex justify-between">
            <span className="text-lg font-bold text-white">TOTAL DAMAGES</span>
            <span className="text-lg font-bold text-red-400">
              {valuationCalculator.formatCurrency(damages.total)}
            </span>
          </div>
        </div>

        {damages.methodology && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Methodology</div>
            <div className="text-sm text-white">{damages.methodology}</div>
          </div>
        )}

        {damages.assumptions && damages.assumptions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Assumptions</div>
            <ul className="list-disc list-inside space-y-1">
              {damages.assumptions.map((assumption, idx) => (
                <li key={idx} className="text-sm text-white">
                  {assumption}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
