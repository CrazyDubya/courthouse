import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CriminalCaseFactory } from '../CriminalCaseFactory';
import { EnhancedCase } from '../../../types/caseTypes';

describe('CriminalCaseFactory', () => {
  describe('generateNYSCriminalCase', () => {
    it('should generate a complete criminal case with required fields', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase).toBeDefined();
      expect(criminalCase.id).toMatch(/^nys-criminal-\d+$/);
      expect(criminalCase.type).toBe('criminal');
      expect(criminalCase.title).toBeTruthy();
      expect(criminalCase.summary).toBeTruthy();
      expect(criminalCase.facts).toBeTruthy();
      expect(criminalCase.legalSystem).toBe('common-law');
    });

    it('should generate criminal-specific properties', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.criminal).toBeDefined();
      expect(criminalCase.criminal?.baseType).toBe('criminal');
      expect(criminalCase.criminal?.charges).toBeDefined();
      expect(Array.isArray(criminalCase.criminal?.charges)).toBe(true);
      expect(criminalCase.criminal?.burdenOfProof).toBe('beyond-reasonable-doubt');
      expect(criminalCase.criminal?.jurisdiction).toBe('state');
    });

    it('should generate charges array from case facts', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      const charges = criminalCase.criminal?.charges || [];
      expect(Array.isArray(charges)).toBe(true);
      
      if (charges.length > 0) {
        charges.forEach(charge => {
          expect(charge.statuteReference || charge.nyplSection).toBeTruthy();
          expect(charge.description).toBeTruthy();
          expect(charge.classification).toBeTruthy();
        });
      }
    });

    it('should generate evidence package', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.evidence).toBeDefined();
      expect(Array.isArray(criminalCase.evidence)).toBe(true);
      expect(criminalCase.evidence.length).toBeGreaterThan(0);
    });

    it('should generate witness package', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      const witnesses = criminalCase.participants.filter(p => p.role === 'witness');
      expect(witnesses.length).toBeGreaterThan(0);
    });

    it('should generate all required participants', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.participants).toBeDefined();
      expect(criminalCase.participants.length).toBeGreaterThan(0);
      
      const roles = criminalCase.participants.map(p => p.role);
      expect(roles).toContain('judge');
      expect(roles).toContain('prosecutor');
      expect(roles).toContain('defense-attorney');
    });

    it('should set custody status correctly', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      const custodyStatus = criminalCase.criminal?.defendantCustodyStatus;
      expect(custodyStatus).toMatch(/^(released-bail|in-custody)$/);
    });

    it('should set appropriate bail amount', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      const bailAmount = criminalCase.criminal?.bailAmount;
      expect(bailAmount).toBeGreaterThanOrEqual(10000);
      expect(bailAmount).toBeLessThanOrEqual(110000);
    });

    it('should initialize case in preparation phase', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.currentPhase).toBe('case-preparation');
    });

    it('should initialize empty transcript and rulings', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.transcript).toEqual([]);
      expect(criminalCase.rulings).toEqual([]);
    });

    it('should set district attorney information', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.criminal?.districtAttorney).toBe('Manhattan District Attorney\'s Office');
      expect(criminalCase.criminal?.investigatingAgency).toContain('NYPD');
    });

    it('should set plea to not guilty by default', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.criminal?.plea).toBe('not-guilty');
    });

    it('should handle grand jury indictment for felonies', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      const hasFelonicCharge = criminalCase.criminal?.charges.some(c => 
        c.classification.includes('Felony')
      );
      
      if (hasFelonicCharge) {
        expect(criminalCase.criminal?.grandJuryIndictment).toBe(true);
      }
    });

    it('should handle victim impact statements', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.criminal?.victimImpactStatements).toBe(true);
    });

    it('should correctly identify capital cases', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      const hasFirstDegreeMurder = criminalCase.criminal?.charges.some(c => 
        c.crimeType === 'murder-first'
      );
      
      expect(criminalCase.criminal?.capitalCase).toBe(hasFirstDegreeMurder);
    });

    it('should set juvenile defendant flag', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.criminal?.juvenileDefendant).toBe(false);
    });

    it('should include scenario metadata', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.scenario).toBeDefined();
      expect(criminalCase.scenario.basicInfo).toBeDefined();
      expect(criminalCase.scenario.narrative).toBeDefined();
      expect(criminalCase.scenario.legalIssues).toBeDefined();
    });

    it('should generate testimony sequences', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.testimonySequences).toBeDefined();
    });
  });

  describe('selectCaseScenario', () => {
    it('should select scenario matching case type when provided', () => {
      const caseWithType = CriminalCaseFactory.generateNYSCriminalCase('assault');
      expect(caseWithType).toBeDefined();
    });

    it('should generate random scenario when no case type provided', () => {
      const case1 = CriminalCaseFactory.generateNYSCriminalCase();
      const case2 = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(case1).toBeDefined();
      expect(case2).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined case type gracefully', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase(undefined);
      
      expect(criminalCase).toBeDefined();
      expect(criminalCase.type).toBe('criminal');
    });

    it('should handle non-matching case type', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase('nonexistent-type');
      
      expect(criminalCase).toBeDefined();
      expect(criminalCase.type).toBe('criminal');
    });

    it('should generate unique case IDs when generated sequentially', async () => {
      const case1 = CriminalCaseFactory.generateNYSCriminalCase();
      await new Promise(resolve => setTimeout(resolve, 10));
      const case2 = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(case1.id).not.toBe(case2.id);
    });

    it('should handle cases with charges', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      const charges = criminalCase.criminal?.charges || [];
      expect(Array.isArray(charges)).toBe(true);
    });

    it('should handle prior convictions array', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(Array.isArray(criminalCase.criminal?.priorConvictions)).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should generate valid sentencing guidelines', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      expect(criminalCase.criminal?.sentencingGuidelines).toBe('New York State Sentencing Guidelines');
    });

    it('should validate charge structure', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      const charges = criminalCase.criminal?.charges || [];
      charges.forEach(charge => {
        expect(charge).toHaveProperty('nyplSection');
        expect(charge).toHaveProperty('description');
        expect(charge).toHaveProperty('classification');
      });
    });

    it('should validate evidence items have required properties', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      criminalCase.evidence.forEach(evidence => {
        expect(evidence).toHaveProperty('id');
        expect(evidence).toHaveProperty('type');
      });
    });

    it('should validate participants have required properties', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      criminalCase.participants.forEach(participant => {
        expect(participant).toHaveProperty('id');
        expect(participant).toHaveProperty('name');
        expect(participant).toHaveProperty('role');
      });
    });

    it('should ensure judge exists in participants', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      const judge = criminalCase.participants.find(p => p.role === 'judge');
      expect(judge).toBeDefined();
      expect(judge?.name).toBeTruthy();
    });

    it('should ensure prosecutor exists in participants', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      const prosecutor = criminalCase.participants.find(p => p.role === 'prosecutor');
      expect(prosecutor).toBeDefined();
      expect(prosecutor?.name).toBeTruthy();
    });

    it('should ensure defense attorney exists in participants', () => {
      const criminalCase = CriminalCaseFactory.generateNYSCriminalCase();
      
      const defense = criminalCase.participants.find(p => p.role === 'defense-attorney');
      expect(defense).toBeDefined();
      expect(defense?.name).toBeTruthy();
    });
  });
});
