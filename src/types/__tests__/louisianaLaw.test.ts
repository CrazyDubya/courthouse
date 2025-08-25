import { describe, it, expect } from 'vitest';
import { 
  LouisianaCaseFactory, 
  legalSystemComparisons, 
  louisianaLegalTerms 
} from '../louisianaLaw';
import type { LouisianaParish, LouisianaCourtType } from '../louisianaLaw';

describe('Louisiana Legal System', () => {
  describe('LouisianaCaseFactory', () => {
    describe('createLouisianaCivilCase', () => {
      it('should create a Louisiana civil case with default values', () => {
        const baseCase = {
          type: 'contract-dispute',
          claims: []
        };

        const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase);

        expect(louisianaCivilCase.parish).toBe('orleans');
        expect(louisianaCivilCase.courtType).toBe('district-court');
        expect(louisianaCivilCase.docketNumber).toBeTruthy();
        expect(louisianaCivilCase.legalSources).toContain('civil-code');
        expect(louisianaCivilCase.legalSources).toContain('code-civil-procedure');
        expect(louisianaCivilCase.proceedingType).toBe('ordinary-proceeding');
        expect(louisianaCivilCase.serviceMethod).toBe('citation');
      });

      it('should create a case with specified parish', () => {
        const baseCase = { type: 'contract-dispute', claims: [] };
        const parish: LouisianaParish = 'caddo';

        const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase, parish);

        expect(louisianaCivilCase.parish).toBe('caddo');
      });

      it('should set appropriate code articles for contract disputes', () => {
        const baseCase = { type: 'contract-dispute', claims: [] };

        const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase);

        expect(louisianaCivilCase.applicableCodeArticles).toContain('La. C.C. Art. 1993');
        expect(louisianaCivilCase.applicableCodeArticles).toContain('La. C.C. Art. 2018');
        expect(louisianaCivilCase.applicableCodeArticles).toContain('La. C.C. Art. 1934');
      });

      it('should set appropriate code articles for personal injury cases', () => {
        const baseCase = { type: 'personal-injury', claims: [] };

        const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase);

        expect(louisianaCivilCase.applicableCodeArticles).toContain('La. C.C. Art. 2315');
        expect(louisianaCivilCase.applicableCodeArticles).toContain('La. C.C. Art. 2316');
      });

      it('should set appropriate code articles for property disputes', () => {
        const baseCase = { type: 'property-dispute', claims: [] };

        const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase);

        expect(louisianaCivilCase.applicableCodeArticles).toContain('La. C.C. Art. 477');
        expect(louisianaCivilCase.applicableCodeArticles).toContain('La. C.C. Art. 526');
        expect(louisianaCivilCase.applicableCodeArticles).toContain('La. C.C. Art. 742');
      });

      it('should set appropriate code articles for family law cases', () => {
        const baseCase = { type: 'family-law', claims: [] };

        const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase);

        expect(louisianaCivilCase.applicableCodeArticles).toContain('La. C.C. Art. 2336');
        expect(louisianaCivilCase.applicableCodeArticles).toContain('La. C.C. Art. 2369');
      });

      it('should default to general fault liability for unknown case types', () => {
        const baseCase = { type: 'unknown-type', claims: [] };

        const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase);

        expect(louisianaCivilCase.applicableCodeArticles).toContain('La. C.C. Art. 2315');
      });

      it('should initialize discovery rules properly', () => {
        const baseCase = { type: 'contract-dispute', claims: [] };

        const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase);

        expect(louisianaCivilCase.discoveryRules.interrogatories).toBe(true);
        expect(louisianaCivilCase.discoveryRules.requestsForAdmission).toBe(true);
        expect(louisianaCivilCase.discoveryRules.requestsForProduction).toBe(true);
        expect(louisianaCivilCase.discoveryRules.depositions).toBe(true);
        expect(louisianaCivilCase.discoveryRules.mentalPhysicalExamination).toBe(false);
      });

      it('should set appeal information correctly', () => {
        const baseCase = { type: 'contract-dispute', claims: [] };

        const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase);

        expect(louisianaCivilCase.appealable).toBe(true);
        expect(louisianaCivilCase.appealDeadline).toBe(30);
        expect(louisianaCivilCase.appealType).toBe('appeal');
      });
    });

    describe('getLouisianaProcedureRules', () => {
      it('should return proper Louisiana procedure rules', () => {
        const procedureRules = LouisianaCaseFactory.getLouisianaProcedureRules();

        // Service rules
        expect(procedureRules.serviceRules.personalService).toBe(true);
        expect(procedureRules.serviceRules.substitutedService).toBe(true);
        expect(procedureRules.serviceRules.publicationService).toBe(true);
        expect(procedureRules.serviceRules.longArmJurisdiction).toBe(true);

        // Pleading rules
        expect(procedureRules.pleadingRules.petitionRequired).toBe(true);
        expect(procedureRules.pleadingRules.answerTimeLimit).toBe(15);
        expect(procedureRules.pleadingRules.reconventionalDemandAllowed).toBe(true);

        // Discovery rules
        expect(procedureRules.discoveryRules.interrogatoriesLimit).toBe(35);
        expect(procedureRules.discoveryRules.depositionTimeLimit).toBe(7);
        expect(procedureRules.discoveryRules.documentRequestLimit).toBe(50);
        expect(procedureRules.discoveryRules.admissionRequestLimit).toBe(30);

        // Trial rules
        expect(procedureRules.trialRules.juryTrialAvailable).toBe(true);
        expect(procedureRules.trialRules.jurySize).toBe(6);
        expect(procedureRules.trialRules.verdictRequirement).toBe('majority');

        // Post-judgment rules
        expect(procedureRules.postJudgmentRules.appealTimeLimit).toBe(30);
        expect(procedureRules.postJudgmentRules.executionStay).toBe(false);
        expect(procedureRules.postJudgmentRules.suspensiveBondRequired).toBe(true);
      });

      it('should include proper Louisiana exceptions', () => {
        const procedureRules = LouisianaCaseFactory.getLouisianaProcedureRules();

        const expectedExceptions = [
          'lack-of-jurisdiction',
          'improper-venue',
          'insufficiency-of-citation',
          'insufficiency-of-service',
          'no-cause-of-action',
          'no-right-to-bring-action'
        ];

        expect(procedureRules.pleadingRules.exceptionsAllowed).toEqual(expectedExceptions);
      });

      it('should include proper judgment types', () => {
        const procedureRules = LouisianaCaseFactory.getLouisianaProcedureRules();

        const expectedJudgmentTypes = [
          'money-judgment',
          'possessory-judgment',
          'declaratory-judgment'
        ];

        expect(procedureRules.trialRules.judgmentTypes).toEqual(expectedJudgmentTypes);
      });
    });
  });

  describe('Legal System Comparisons', () => {
    it('should include comparison for source of law', () => {
      const sourceComparison = legalSystemComparisons.find(c => c.topic === 'Source of Law');

      expect(sourceComparison).toBeDefined();
      expect(sourceComparison!.commonLawApproach).toContain('precedent');
      expect(sourceComparison!.louisianaApproach).toContain('civil code');
      expect(sourceComparison!.keyDifferences).toContain('Louisiana emphasizes codified law over judicial precedent');
    });

    it('should include comparison for property ownership', () => {
      const propertyComparison = legalSystemComparisons.find(c => c.topic === 'Property Ownership');

      expect(propertyComparison).toBeDefined();
      expect(propertyComparison!.commonLawApproach).toContain('Fee simple');
      expect(propertyComparison!.louisianaApproach).toContain('usufruct');
      expect(propertyComparison!.keyDifferences).toContain('Louisiana recognizes usufruct (right to use and enjoy)');
    });

    it('should include comparison for contract formation', () => {
      const contractComparison = legalSystemComparisons.find(c => c.topic === 'Contract Formation');

      expect(contractComparison).toBeDefined();
      expect(contractComparison!.commonLawApproach).toContain('consideration');
      expect(contractComparison!.louisianaApproach).toContain('cause');
      expect(contractComparison!.keyDifferences).toContain('Louisiana focuses on cause rather than consideration');
    });

    it('should include comparison for tort liability', () => {
      const tortComparison = legalSystemComparisons.find(c => c.topic === 'Tort Liability');

      expect(tortComparison).toBeDefined();
      expect(tortComparison!.commonLawApproach).toContain('Duty, breach, causation, damages');
      expect(tortComparison!.louisianaApproach).toContain('Article 2315');
      expect(tortComparison!.keyDifferences).toContain('Louisiana has broader fault-based liability');
    });

    it('should include comparison for marital property', () => {
      const maritalComparison = legalSystemComparisons.find(c => c.topic === 'Marital Property');

      expect(maritalComparison).toBeDefined();
      expect(maritalComparison!.commonLawApproach).toContain('separate property');
      expect(maritalComparison!.louisianaApproach).toContain('Community property');
      expect(maritalComparison!.keyDifferences).toContain('All property acquired during marriage is community property');
    });

    it('should have practical impact descriptions for all comparisons', () => {
      legalSystemComparisons.forEach(comparison => {
        expect(comparison.practicalImpact).toBeTruthy();
        expect(comparison.practicalImpact.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Louisiana Legal Terms Dictionary', () => {
    it('should define usufruct correctly', () => {
      const usufruct = louisianaLegalTerms['usufruct'];

      expect(usufruct).toBeDefined();
      expect(usufruct.definition).toContain('Right to use and enjoy property belonging to another');
      expect(usufruct.commonLawEquivalent).toBe('Life estate');
    });

    it('should define naked-ownership correctly', () => {
      const nakedOwnership = louisianaLegalTerms['naked-ownership'];

      expect(nakedOwnership).toBeDefined();
      expect(nakedOwnership.definition).toContain('Ownership of property subject to a usufruct');
      expect(nakedOwnership.commonLawEquivalent).toBe('Remainder interest');
    });

    it('should define synallagmatic-contract correctly', () => {
      const synallagmaticContract = louisianaLegalTerms['synallagmatic-contract'];

      expect(synallagmaticContract).toBeDefined();
      expect(synallagmaticContract.definition).toContain('Contract creating mutual obligations');
      expect(synallagmaticContract.commonLawEquivalent).toBe('Bilateral contract');
    });

    it('should define vices-of-consent correctly', () => {
      const vicesOfConsent = louisianaLegalTerms['vices-of-consent'];

      expect(vicesOfConsent).toBeDefined();
      expect(vicesOfConsent.definition).toContain('Defects in agreement formation');
      expect(vicesOfConsent.commonLawEquivalent).toBe('Contract defenses');
    });

    it('should define moral-damages correctly', () => {
      const moralDamages = louisianaLegalTerms['moral-damages'];

      expect(moralDamages).toBeDefined();
      expect(moralDamages.definition).toContain('mental or physical pain and suffering');
      expect(moralDamages.commonLawEquivalent).toBe('Pain and suffering damages');
    });

    it('should define reconventional-demand correctly', () => {
      const reconventionalDemand = louisianaLegalTerms['reconventional-demand'];

      expect(reconventionalDemand).toBeDefined();
      expect(reconventionalDemand.definition).toContain('Defendant\'s claim against plaintiff');
      expect(reconventionalDemand.commonLawEquivalent).toBe('Counterclaim');
    });

    it('should define exception correctly', () => {
      const exception = louisianaLegalTerms['exception'];

      expect(exception).toBeDefined();
      expect(exception.definition).toContain('Procedural objection');
      expect(exception.commonLawEquivalent).toBe('Motion to dismiss');
    });

    it('should define citation correctly', () => {
      const citation = louisianaLegalTerms['citation'];

      expect(citation).toBeDefined();
      expect(citation.definition).toContain('Official notice of lawsuit');
      expect(citation.commonLawEquivalent).toBe('Summons');
    });

    it('should define parish correctly', () => {
      const parish = louisianaLegalTerms['parish'];

      expect(parish).toBeDefined();
      expect(parish.definition).toContain('Political subdivision equivalent to county');
      expect(parish.commonLawEquivalent).toBe('County');
    });

    it('should define property terms correctly', () => {
      const immovable = louisianaLegalTerms['immovable'];
      const movable = louisianaLegalTerms['movable'];

      expect(immovable).toBeDefined();
      expect(immovable.definition).toContain('Real property that cannot be moved');
      expect(immovable.commonLawEquivalent).toBe('Real property');

      expect(movable).toBeDefined();
      expect(movable.definition).toContain('Personal property that can be moved');
      expect(movable.commonLawEquivalent).toBe('Personal property');
    });

    it('should have definitions for all terms', () => {
      Object.entries(louisianaLegalTerms).forEach(([term, definition]) => {
        expect(definition.definition).toBeTruthy();
        expect(definition.definition.length).toBeGreaterThan(0);
      });
    });

    it('should have common law equivalents where applicable', () => {
      const termsWithEquivalents = Object.entries(louisianaLegalTerms)
        .filter(([_, definition]) => definition.commonLawEquivalent);

      expect(termsWithEquivalents.length).toBeGreaterThan(0);
      
      termsWithEquivalents.forEach(([term, definition]) => {
        expect(definition.commonLawEquivalent).toBeTruthy();
        expect(definition.commonLawEquivalent!.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Louisiana Remedy System', () => {
    it('should map breach of contract to appropriate Louisiana remedies', () => {
      const baseCase = {
        type: 'contract-dispute',
        claims: [{ claimType: 'breach-of-contract' }]
      };

      const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase);
      const claim = louisianaCivilCase.claims[0];

      expect(claim.louisianaRemedies).toContain('specific-performance');
      expect(claim.louisianaRemedies).toContain('dissolution-of-contract');
      expect(claim.louisianaRemedies).toContain('reduction-of-price');
    });

    it('should map property disputes to appropriate Louisiana remedies', () => {
      const baseCase = {
        type: 'property-dispute',
        claims: [{ claimType: 'property-dispute' }]
      };

      const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase);
      const claim = louisianaCivilCase.claims[0];

      expect(claim.louisianaRemedies).toContain('possessory-action');
      expect(claim.louisianaRemedies).toContain('petitory-action');
      expect(claim.louisianaRemedies).toContain('boundary-action');
    });

    it('should default to general remedies for unknown claim types', () => {
      const baseCase = {
        type: 'unknown-dispute',
        claims: [{ claimType: 'unknown-claim' }]
      };

      const louisianaCivilCase = LouisianaCaseFactory.createLouisianaCivilCase(baseCase);
      const claim = louisianaCivilCase.claims[0];

      expect(claim.louisianaRemedies).toContain('declaratory-judgment');
      expect(claim.louisianaRemedies).toContain('injunctive-relief');
    });
  });
});