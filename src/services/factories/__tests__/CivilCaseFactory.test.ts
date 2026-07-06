import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CivilCaseFactory } from '../CivilCaseFactory';
import { EnhancedCase } from '../../../types/caseTypes';

describe('CivilCaseFactory', () => {
  describe('generateNYSCivilCase', () => {
    it('should generate a complete civil case with required fields', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase).toBeDefined();
      expect(civilCase.id).toMatch(/^nys-civil-\d+$/);
      expect(civilCase.type).toBe('civil');
      expect(civilCase.title).toBeTruthy();
      expect(civilCase.summary).toBeTruthy();
      expect(civilCase.facts).toBeTruthy();
      expect(civilCase.legalSystem).toBe('common-law');
    });

    it('should generate civil-specific properties', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.civil).toBeDefined();
      expect(civilCase.civil?.baseType).toBe('civil');
      expect(civilCase.civil?.causeOfAction).toBeTruthy();
      expect(civilCase.civil?.burdenOfProof).toBe('preponderance-of-evidence');
      expect(civilCase.civil?.jurisdiction).toBe('state');
    });

    it('should set appropriate damages requested', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      const damages = civilCase.civil?.damagesRequested;
      expect(damages).toBeGreaterThanOrEqual(100000);
      expect(damages).toBeLessThanOrEqual(2100000);
    });

    it('should generate evidence package', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.evidence).toBeDefined();
      expect(Array.isArray(civilCase.evidence)).toBe(true);
      expect(civilCase.evidence.length).toBeGreaterThan(0);
    });

    it('should generate witness package', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      const witnesses = civilCase.participants.filter(p => p.role === 'witness');
      expect(witnesses.length).toBeGreaterThan(0);
    });

    it('should generate all required participants', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.participants).toBeDefined();
      expect(civilCase.participants.length).toBeGreaterThan(0);
      
      const roles = civilCase.participants.map(p => p.role);
      expect(roles).toContain('judge');
    });

    it('should initialize case in preparation phase', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.currentPhase).toBe('case-preparation');
    });

    it('should initialize empty transcript and rulings', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.transcript).toEqual([]);
      expect(civilCase.rulings).toEqual([]);
    });

    it('should set plaintiff counsel information', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.civil?.plaintiffCounsel).toBe('Private Practice');
    });

    it('should set defendant counsel information', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.civil?.defendantCounsel).toBe('Insurance Defense');
    });

    it('should set injunctive relief flag', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(typeof civilCase.civil?.injunctiveRelief).toBe('boolean');
    });

    it('should set class action flag', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.civil?.classAction).toBe(false);
    });

    it('should set jury trial flag', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.civil?.juryTrial).toBe(true);
    });

    it('should require expert witnesses', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.civil?.expertWitnessesRequired).toBe(true);
    });

    it('should set valid discovery deadline', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      const deadline = civilCase.civil?.discoveryDeadline;
      expect(deadline).toBeTruthy();
      
      const deadlineDate = new Date(deadline!);
      const now = new Date();
      expect(deadlineDate.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should set mediation required flag', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(typeof civilCase.civil?.mediationRequired).toBe('boolean');
    });

    it('should initialize empty settlement offers', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(Array.isArray(civilCase.civil?.settlementOffers)).toBe(true);
      expect(civilCase.civil?.settlementOffers).toEqual([]);
    });

    it('should set comparative fault flag', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(typeof civilCase.civil?.comparativeFault).toBe('boolean');
    });

    it('should include discovery status', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.discoveryStatus).toBeDefined();
      expect(civilCase.discoveryStatus.plaintiffRequests).toBeDefined();
      expect(civilCase.discoveryStatus.defendantRequests).toBeDefined();
      expect(Array.isArray(civilCase.discoveryStatus.completedRequests)).toBe(true);
      expect(Array.isArray(civilCase.discoveryStatus.pendingMotions)).toBe(true);
      expect(Array.isArray(civilCase.discoveryStatus.expertDepositions)).toBe(true);
      expect(civilCase.discoveryStatus.documentProduction).toBe('ongoing');
    });
  });

  describe('selectCivilCaseScenario', () => {
    it('should select scenario matching case type when provided', () => {
      const caseWithType = CivilCaseFactory.generateNYSCivilCase('negligence');
      expect(caseWithType).toBeDefined();
    });

    it('should generate random scenario when no case type provided', () => {
      const case1 = CivilCaseFactory.generateNYSCivilCase();
      const case2 = CivilCaseFactory.generateNYSCivilCase();
      
      expect(case1).toBeDefined();
      expect(case2).toBeDefined();
    });

    it('should handle case type in cause of action', () => {
      const caseWithType = CivilCaseFactory.generateNYSCivilCase('breach');
      expect(caseWithType).toBeDefined();
      expect(caseWithType.type).toBe('civil');
    });
  });

  describe('Discovery Request Generation', () => {
    it('should generate plaintiff discovery requests', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.discoveryStatus.plaintiffRequests).toBeDefined();
      expect(typeof civilCase.discoveryStatus.plaintiffRequests).toBe('object');
    });

    it('should generate defendant discovery requests', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.discoveryStatus.defendantRequests).toBeDefined();
      expect(typeof civilCase.discoveryStatus.defendantRequests).toBe('object');
    });

    it('should include common discovery motions', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.discoveryStatus.pendingMotions).toContain('Motion to Compel Discovery');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined case type gracefully', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase(undefined);
      
      expect(civilCase).toBeDefined();
      expect(civilCase.type).toBe('civil');
    });

    it('should handle non-matching case type', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase('nonexistent-type');
      
      expect(civilCase).toBeDefined();
      expect(civilCase.type).toBe('civil');
    });

    it('should generate unique case IDs when generated sequentially', async () => {
      const case1 = CivilCaseFactory.generateNYSCivilCase();
      await new Promise(resolve => setTimeout(resolve, 10));
      const case2 = CivilCaseFactory.generateNYSCivilCase();
      
      expect(case1.id).not.toBe(case2.id);
    });

    it('should handle varying damages amounts', () => {
      const cases = Array.from({ length: 10 }, () => 
        CivilCaseFactory.generateNYSCivilCase()
      );
      
      const damagesAmounts = cases.map(c => c.civil?.damagesRequested);
      expect(new Set(damagesAmounts).size).toBeGreaterThan(1);
    });
  });

  describe('Data Validation', () => {
    it('should validate cause of action is set', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.civil?.causeOfAction).toBeTruthy();
      expect(typeof civilCase.civil?.causeOfAction).toBe('string');
    });

    it('should validate burden of proof for civil cases', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.civil?.burdenOfProof).toBe('preponderance-of-evidence');
    });

    it('should validate evidence items have required properties', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      civilCase.evidence.forEach(evidence => {
        expect(evidence).toHaveProperty('id');
        expect(evidence).toHaveProperty('type');
      });
    });

    it('should validate participants have required properties', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      civilCase.participants.forEach(participant => {
        expect(participant).toHaveProperty('id');
        expect(participant).toHaveProperty('name');
        expect(participant).toHaveProperty('role');
      });
    });

    it('should ensure judge exists in participants', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      const judge = civilCase.participants.find(p => p.role === 'judge');
      expect(judge).toBeDefined();
      expect(judge?.name).toBeTruthy();
    });

    it('should validate discovery deadline is in future', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      const deadline = new Date(civilCase.civil?.discoveryDeadline!);
      const now = new Date();
      
      expect(deadline.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should validate discovery deadline is approximately 90 days out', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      const deadline = new Date(civilCase.civil?.discoveryDeadline!);
      const now = new Date();
      
      const diffDays = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(85);
      expect(diffDays).toBeLessThan(95);
    });
  });

  describe('Civil Case Types', () => {
    it('should handle personal injury cases', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase('injury');
      
      expect(civilCase).toBeDefined();
      expect(civilCase.type).toBe('civil');
    });

    it('should handle contract cases', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase('contract');
      
      expect(civilCase).toBeDefined();
      expect(civilCase.type).toBe('civil');
    });

    it('should handle property cases', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase('property');
      
      expect(civilCase).toBeDefined();
      expect(civilCase.type).toBe('civil');
    });
  });

  describe('Discovery Process', () => {
    it('should set document production to ongoing', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.discoveryStatus.documentProduction).toBe('ongoing');
    });

    it('should initialize completed requests as empty', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.discoveryStatus.completedRequests).toEqual([]);
    });

    it('should initialize expert depositions as empty', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(civilCase.discoveryStatus.expertDepositions).toEqual([]);
    });

    it('should have pending motions list', () => {
      const civilCase = CivilCaseFactory.generateNYSCivilCase();
      
      expect(Array.isArray(civilCase.discoveryStatus.pendingMotions)).toBe(true);
      expect(civilCase.discoveryStatus.pendingMotions.length).toBeGreaterThan(0);
    });
  });
});
