import { EnhancedCase } from '../types/caseTypes';
import { CriminalCaseFactory } from './factories/CriminalCaseFactory';
import { CivilCaseFactory } from './factories/CivilCaseFactory';

// Re-export CaseScenario interface for backward compatibility
export type { CaseScenario } from './factories/BaseScenarioFactory';

/**
 * Main factory class for generating case scenarios.
 * Delegates to specialized factories while maintaining backward compatibility.
 * 
 * This is a thin wrapper that preserves the original public API
 * while delegating to CriminalCaseFactory and CivilCaseFactory.
 */
export class CaseScenarioFactory {

  /**
   * Generate replacement case based on type
   * 
   * @param caseType - Optional case type filter (e.g., 'robbery', 'negligence')
   * @param category - Category: 'criminal' or 'civil'
   * @returns Enhanced case with full scenario, evidence, participants, etc.
   */
  static generateReplacementCase(caseType?: string, category?: 'criminal' | 'civil'): EnhancedCase {
    if (category === 'civil') {
      return CivilCaseFactory.generateNYSCivilCase(caseType);
    }
    return CriminalCaseFactory.generateNYSCriminalCase(caseType);
  }

  /**
   * Generate a complete realistic NYS criminal case
   * 
   * @param caseType - Optional case type filter (e.g., 'robbery', 'murder', 'drug')
   * @returns Enhanced criminal case with charges, evidence, witnesses, participants
   */
  static generateNYSCriminalCase(caseType?: string): EnhancedCase {
    return CriminalCaseFactory.generateNYSCriminalCase(caseType);
  }

  /**
   * Generate a complete realistic NYS civil case
   * 
   * @param caseType - Optional case type filter (e.g., 'negligence', 'malpractice')
   * @returns Enhanced civil case with claims, evidence, witnesses, participants
   */
  static generateNYSCivilCase(caseType?: string): EnhancedCase {
    return CivilCaseFactory.generateNYSCivilCase(caseType);
  }
}
