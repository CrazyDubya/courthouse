import { describe, it, expect } from 'vitest';
import { 
  MOTION_TEMPLATES,
  CRIMINAL_MOTIONS,
  CIVIL_MOTIONS,
  getMotionTemplate,
  getMotionsByCategory,
  getCriminalMotions,
  getCivilMotions,
  getCommonMotions,
  getDispositivMotions,
  getDiscoveryMotions
} from '../motionTemplates';
import type { MotionType, CaseType } from '../../types/motions';

describe('Motion Templates', () => {
  describe('MOTION_TEMPLATES', () => {
    it('should have motion templates defined', () => {
      expect(MOTION_TEMPLATES).toBeDefined();
      expect(Array.isArray(MOTION_TEMPLATES)).toBe(true);
      expect(MOTION_TEMPLATES.length).toBeGreaterThan(0);
    });

    it('should have valid structure for all motion templates', () => {
      MOTION_TEMPLATES.forEach(template => {
        expect(template.type).toBeTruthy();
        expect(template.applicableCaseTypes).toBeDefined();
        expect(Array.isArray(template.applicableCaseTypes)).toBe(true);
        expect(template.title).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.legalStandard).toBeTruthy();
        expect(template.common_grounds).toBeDefined();
        expect(Array.isArray(template.common_grounds)).toBe(true);
        expect(template.required_citations).toBeDefined();
        expect(Array.isArray(template.required_citations)).toBe(true);
        expect(template.typical_evidence).toBeDefined();
        expect(Array.isArray(template.typical_evidence)).toBe(true);
        expect(typeof template.hearing_required).toBe('boolean');
        expect(typeof template.response_time_days).toBe('number');
        expect(template.response_time_days).toBeGreaterThan(0);
        expect(typeof template.likelihood_of_success).toBe('number');
        expect(template.likelihood_of_success).toBeGreaterThanOrEqual(0);
        expect(template.likelihood_of_success).toBeLessThanOrEqual(1);
        expect(template.typical_judicial_concerns).toBeDefined();
        expect(Array.isArray(template.typical_judicial_concerns)).toBe(true);
        expect(template.best_practices).toBeDefined();
        expect(Array.isArray(template.best_practices)).toBe(true);
        expect(template.common_mistakes).toBeDefined();
        expect(Array.isArray(template.common_mistakes)).toBe(true);
        expect(template.sample_argument).toBeTruthy();
        expect(template.sample_relief).toBeTruthy();
        expect(template.sample_facts).toBeTruthy();
      });
    });

    it('should include both criminal and civil motions', () => {
      const criminalMotions = MOTION_TEMPLATES.filter(t => 
        t.applicableCaseTypes.includes('criminal'));
      const civilMotions = MOTION_TEMPLATES.filter(t => 
        t.applicableCaseTypes.includes('civil'));

      expect(criminalMotions.length).toBeGreaterThan(0);
      expect(civilMotions.length).toBeGreaterThan(0);
    });

    it('should have unique motion types', () => {
      const motionTypes = MOTION_TEMPLATES.map(t => t.type);
      const uniqueTypes = [...new Set(motionTypes)];
      
      expect(motionTypes.length).toBe(uniqueTypes.length);
    });
  });

  describe('Motion Categories', () => {
    it('should define criminal motions correctly', () => {
      expect(CRIMINAL_MOTIONS).toBeDefined();
      expect(Array.isArray(CRIMINAL_MOTIONS)).toBe(true);
      expect(CRIMINAL_MOTIONS.length).toBeGreaterThan(0);
      
      // Should include common criminal motions
      expect(CRIMINAL_MOTIONS).toContain('motion-to-dismiss-criminal');
      expect(CRIMINAL_MOTIONS).toContain('motion-to-suppress-evidence');
      expect(CRIMINAL_MOTIONS).toContain('motion-for-discovery');
    });

    it('should define civil motions correctly', () => {
      expect(CIVIL_MOTIONS).toBeDefined();
      expect(Array.isArray(CIVIL_MOTIONS)).toBe(true);
      expect(CIVIL_MOTIONS.length).toBeGreaterThan(0);
      
      // Should include common civil motions
      expect(CIVIL_MOTIONS).toContain('motion-to-dismiss-civil');
      expect(CIVIL_MOTIONS).toContain('motion-for-summary-judgment');
      expect(CIVIL_MOTIONS).toContain('motion-to-compel');
    });

    it('should not have overlap between criminal and civil motion lists', () => {
      const overlap = CRIMINAL_MOTIONS.filter(motion => CIVIL_MOTIONS.includes(motion));
      expect(overlap.length).toBe(0);
    });
  });

  describe('getMotionTemplate', () => {
    it('should retrieve motion template by type', () => {
      const motionType: MotionType = 'motion-to-dismiss-criminal';
      const template = getMotionTemplate(motionType);
      
      expect(template).toBeDefined();
      expect(template!.type).toBe(motionType);
    });

    it('should return undefined for non-existent motion type', () => {
      const template = getMotionTemplate('non-existent-motion' as MotionType);
      expect(template).toBeUndefined();
    });

    it('should return templates for defined motion types', () => {
      const template1 = getMotionTemplate('motion-to-dismiss-criminal');
      expect(template1).toBeDefined();
      expect(template1!.type).toBe('motion-to-dismiss-criminal');

      const template2 = getMotionTemplate('motion-for-summary-judgment');
      expect(template2).toBeDefined();
      expect(template2!.type).toBe('motion-for-summary-judgment');
    });
  });

  describe('getMotionsByCategory', () => {
    it('should return criminal motions for criminal case type', () => {
      const criminalMotions = getMotionsByCategory('criminal');
      
      expect(criminalMotions.length).toBeGreaterThan(0);
      criminalMotions.forEach(motion => {
        expect(motion.applicableCaseTypes).toContain('criminal');
      });
    });

    it('should return civil motions for civil case type', () => {
      const civilMotions = getMotionsByCategory('civil');
      
      expect(civilMotions.length).toBeGreaterThan(0);
      civilMotions.forEach(motion => {
        expect(motion.applicableCaseTypes).toContain('civil');
      });
    });

    it('should return family motions for family case type', () => {
      const familyMotions = getMotionsByCategory('family');
      
      familyMotions.forEach(motion => {
        expect(motion.applicableCaseTypes).toContain('family');
      });
    });

    it('should return corporate motions for corporate case type', () => {
      const corporateMotions = getMotionsByCategory('corporate');
      
      corporateMotions.forEach(motion => {
        expect(motion.applicableCaseTypes).toContain('corporate');
      });
    });

    it('should return constitutional motions for constitutional case type', () => {
      const constitutionalMotions = getMotionsByCategory('constitutional');
      
      constitutionalMotions.forEach(motion => {
        expect(motion.applicableCaseTypes).toContain('constitutional');
      });
    });
  });

  describe('getCriminalMotions', () => {
    it('should return only criminal motions', () => {
      const criminalMotions = getCriminalMotions();
      
      expect(criminalMotions.length).toBeGreaterThan(0);
      criminalMotions.forEach(motion => {
        expect(CRIMINAL_MOTIONS).toContain(motion.type);
      });
    });

    it('should include motion to suppress evidence', () => {
      const criminalMotions = getCriminalMotions();
      const suppressMotion = criminalMotions.find(m => m.type === 'motion-to-suppress-evidence');
      
      expect(suppressMotion).toBeDefined();
      expect(suppressMotion!.applicableCaseTypes).toContain('criminal');
    });

    it('should include motion to dismiss criminal', () => {
      const criminalMotions = getCriminalMotions();
      const dismissMotion = criminalMotions.find(m => m.type === 'motion-to-dismiss-criminal');
      
      expect(dismissMotion).toBeDefined();
      expect(dismissMotion!.applicableCaseTypes).toContain('criminal');
    });
  });

  describe('getCivilMotions', () => {
    it('should return only civil motions', () => {
      const civilMotions = getCivilMotions();
      
      expect(civilMotions.length).toBeGreaterThan(0);
      civilMotions.forEach(motion => {
        expect(CIVIL_MOTIONS).toContain(motion.type);
      });
    });

    it('should include motion for summary judgment', () => {
      const civilMotions = getCivilMotions();
      const summaryJudgmentMotion = civilMotions.find(m => m.type === 'motion-for-summary-judgment');
      
      expect(summaryJudgmentMotion).toBeDefined();
      expect(summaryJudgmentMotion!.applicableCaseTypes).toContain('civil');
    });

    it('should include motion to compel', () => {
      const civilMotions = getCivilMotions();
      const compelMotion = civilMotions.find(m => m.type === 'motion-to-compel');
      
      expect(compelMotion).toBeDefined();
      expect(compelMotion!.applicableCaseTypes).toContain('civil');
    });
  });

  describe('getCommonMotions', () => {
    it('should return motions with high likelihood of success', () => {
      const commonMotions = getCommonMotions();
      
      commonMotions.forEach(motion => {
        expect(motion.likelihood_of_success).toBeGreaterThan(0.3);
      });
    });

    it('should be sorted by likelihood of success in descending order', () => {
      const commonMotions = getCommonMotions();
      
      if (commonMotions.length > 1) {
        for (let i = 1; i < commonMotions.length; i++) {
          expect(commonMotions[i-1].likelihood_of_success).toBeGreaterThanOrEqual(
            commonMotions[i].likelihood_of_success
          );
        }
      }
    });
  });

  describe('getDispositivMotions', () => {
    it('should return motions that could end the case', () => {
      const dispositivMotions = getDispositivMotions();
      
      dispositivMotions.forEach(motion => {
        const isDispositive = motion.type.includes('dismiss') || 
                            motion.type.includes('summary-judgment') ||
                            motion.type.includes('default-judgment');
        expect(isDispositive).toBe(true);
      });
    });

    it('should include motion to dismiss', () => {
      const dispositivMotions = getDispositivMotions();
      const dismissMotions = dispositivMotions.filter(m => 
        m.type.includes('dismiss'));
      
      expect(dismissMotions.length).toBeGreaterThan(0);
    });

    it('should include summary judgment motions', () => {
      const dispositivMotions = getDispositivMotions();
      const summaryJudgmentMotions = dispositivMotions.filter(m => 
        m.type.includes('summary-judgment'));
      
      expect(summaryJudgmentMotions.length).toBeGreaterThan(0);
    });
  });

  describe('getDiscoveryMotions', () => {
    it('should return discovery-related motions', () => {
      const discoveryMotions = getDiscoveryMotions();
      
      discoveryMotions.forEach(motion => {
        const isDiscoveryRelated = motion.type.includes('discovery') ||
                                 motion.type.includes('compel') ||
                                 motion.type.includes('protective') ||
                                 motion.type.includes('bill-of-particulars');
        expect(isDiscoveryRelated).toBe(true);
      });
    });

    it('should include motion for discovery', () => {
      const discoveryMotions = getDiscoveryMotions();
      const discoveryMotion = discoveryMotions.find(m => 
        m.type === 'motion-for-discovery');
      
      expect(discoveryMotion).toBeDefined();
    });

    it('should include motion to compel', () => {
      const discoveryMotions = getDiscoveryMotions();
      const compelMotion = discoveryMotions.find(m => 
        m.type === 'motion-to-compel' || m.type === 'motion-to-compel-discovery');
      
      expect(compelMotion).toBeDefined();
    });
  });

  describe('Motion Template Content Quality', () => {
    it('should have meaningful sample arguments', () => {
      MOTION_TEMPLATES.forEach(template => {
        expect(template.sample_argument.length).toBeGreaterThan(50);
        // Sample arguments should contain legal terminology
        const hasLegalTerms = template.sample_argument.toLowerCase().includes('court') ||
                            template.sample_argument.toLowerCase().includes('motion') ||
                            template.sample_argument.toLowerCase().includes('defendant') ||
                            template.sample_argument.toLowerCase().includes('plaintiff') ||
                            template.sample_argument.toLowerCase().includes('evidence');
        expect(hasLegalTerms).toBe(true);
      });
    });

    it('should have specific relief requested', () => {
      MOTION_TEMPLATES.forEach(template => {
        expect(template.sample_relief.length).toBeGreaterThan(20);
      });
    });

    it('should have relevant sample facts', () => {
      MOTION_TEMPLATES.forEach(template => {
        expect(template.sample_facts.length).toBeGreaterThan(30);
      });
    });

    it('should have appropriate page limits for complex motions', () => {
      const complexMotions = MOTION_TEMPLATES.filter(t => 
        t.type.includes('summary-judgment') || 
        t.type.includes('dismiss'));
      
      complexMotions.forEach(motion => {
        if (motion.page_limit) {
          expect(motion.page_limit).toBeGreaterThanOrEqual(15);
        }
      });
    });

    it('should have reasonable response time requirements', () => {
      MOTION_TEMPLATES.forEach(template => {
        expect(template.response_time_days).toBeGreaterThanOrEqual(7);
        expect(template.response_time_days).toBeLessThanOrEqual(45);
      });
    });

    it('should have helpful best practices', () => {
      MOTION_TEMPLATES.forEach(template => {
        expect(template.best_practices.length).toBeGreaterThan(0);
        template.best_practices.forEach(practice => {
          expect(practice.length).toBeGreaterThan(10);
        });
      });
    });

    it('should identify common mistakes', () => {
      MOTION_TEMPLATES.forEach(template => {
        expect(template.common_mistakes.length).toBeGreaterThan(0);
        template.common_mistakes.forEach(mistake => {
          expect(mistake.length).toBeGreaterThan(10);
        });
      });
    });

    it('should list typical judicial concerns', () => {
      MOTION_TEMPLATES.forEach(template => {
        expect(template.typical_judicial_concerns.length).toBeGreaterThan(0);
        template.typical_judicial_concerns.forEach(concern => {
          expect(concern.length).toBeGreaterThan(10);
        });
      });
    });
  });

  describe('Legal Standards', () => {
    it('should use appropriate legal standards for criminal motions', () => {
      const criminalMotions = getCriminalMotions();
      
      criminalMotions.forEach(motion => {
        const validCriminalStandards = [
          'beyond-reasonable-doubt',
          'preponderance-of-evidence',
          'clear-and-convincing'
        ];
        expect(validCriminalStandards).toContain(motion.legalStandard);
      });
    });

    it('should use appropriate legal standards for civil motions', () => {
      const civilMotions = getCivilMotions();
      
      civilMotions.forEach(motion => {
        const validCivilStandards = [
          'preponderance-of-evidence',
          'clear-and-convincing',
          'substantial-evidence'
        ];
        expect(validCivilStandards).toContain(motion.legalStandard);
      });
    });
  });
});