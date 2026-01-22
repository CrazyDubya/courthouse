import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WitnessFactory, DetailedWitness, WitnessKnowledge, WitnessCredibility } from '../WitnessFactory';
import { EvidenceContext } from '../EvidenceFactory';

describe('WitnessFactory', () => {
  const mockCriminalContext: EvidenceContext = {
    location: '123 Main St, New York, NY',
    timeOfIncident: new Date('2024-01-15T22:30:00'),
    participants: ['defendant', 'victim', 'witnesses'],
    charges: [],
    caseType: 'criminal'
  };

  const mockCivilContext: EvidenceContext = {
    location: '456 Park Ave, New York, NY',
    timeOfIncident: new Date('2024-02-20T14:00:00'),
    participants: ['plaintiff', 'defendant', 'witnesses'],
    charges: [],
    caseType: 'civil'
  };

  describe('generateWitnessPackage', () => {
    it('should generate a complete witness list for criminal cases', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      expect(witnesses).toBeDefined();
      expect(Array.isArray(witnesses)).toBe(true);
      expect(witnesses.length).toBeGreaterThan(0);
    });

    it('should generate witnesses for civil cases', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCivilContext);
      
      expect(witnesses).toBeDefined();
      expect(Array.isArray(witnesses)).toBe(true);
      expect(witnesses.length).toBeGreaterThan(0);
    });

    it('should include police witnesses for criminal cases', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const policeWitnesses = witnesses.filter(w => w.witnessType === 'police');
      expect(policeWitnesses.length).toBeGreaterThan(0);
    });

    it('should include eyewitnesses', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const eyewitnesses = witnesses.filter(w => w.witnessType === 'eyewitness');
      expect(eyewitnesses.length).toBeGreaterThan(0);
    });

    it('should include victim witnesses for criminal cases', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const victimWitnesses = witnesses.filter(w => w.witnessType === 'victim');
      expect(victimWitnesses.length).toBeGreaterThan(0);
    });

    it('should include forensic expert witnesses for criminal cases', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const expertWitnesses = witnesses.filter(w => w.witnessType === 'expert');
      expect(expertWitnesses.length).toBeGreaterThan(0);
    });

    it('should include character witnesses', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const characterWitnesses = witnesses.filter(w => w.witnessType === 'character');
      expect(characterWitnesses.length).toBeGreaterThan(0);
    });

    it('should include expert witnesses', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const expertWitnesses = witnesses.filter(w => w.witnessType === 'expert');
      expect(expertWitnesses.length).toBeGreaterThan(0);
    });

    it('should generate diverse witness types', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const witnessTypes = new Set(witnesses.map(w => w.witnessType));
      expect(witnessTypes.size).toBeGreaterThan(3);
    });
  });

  describe('Witness Properties', () => {
    it('should generate witnesses with unique IDs', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const ids = witnesses.map(w => w.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should generate witnesses with names', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.name).toBeTruthy();
        expect(typeof witness.name).toBe('string');
      });
    });

    it('should set witness role correctly', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.role).toBe('witness');
      });
    });

    it('should set AI controlled flag', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.aiControlled).toBe(true);
      });
    });

    it('should generate personality traits', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.personality).toBeDefined();
      });
    });

    it('should generate background information', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.background).toBeDefined();
        expect(witness.background.age).toBeGreaterThan(0);
        expect(witness.background.education).toBeTruthy();
      });
    });

    it('should set current mood', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.currentMood).toBeDefined();
        expect(typeof witness.currentMood).toBe('number');
      });
    });
  });

  describe('Witness Knowledge', () => {
    it('should generate direct observations', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.knowledge).toBeDefined();
        expect(Array.isArray(witness.knowledge.directObservations)).toBe(true);
      });
    });

    it('should generate hearsay knowledge for witnesses with it', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const witnessesWithHearsay = witnesses.filter(w => 
        w.knowledge.hearsayKnowledge && w.knowledge.hearsayKnowledge.length > 0
      );
      expect(witnessesWithHearsay.length).toBeGreaterThan(0);
    });

    it('should generate opinions', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(Array.isArray(witness.knowledge.opinions)).toBe(true);
      });
    });

    it('should generate memory limitations', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(Array.isArray(witness.knowledge.memoryLimitations)).toBe(true);
      });
    });

    it('should include expert knowledge for expert witnesses', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const expertWitnesses = witnesses.filter(w => w.witnessType === 'expert');
      expertWitnesses.forEach(witness => {
        expect(witness.knowledge.expertKnowledge).toBeDefined();
        expect(Array.isArray(witness.knowledge.expertKnowledge)).toBe(true);
      });
    });
  });

  describe('Witness Credibility', () => {
    it('should generate credibility factors', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.credibility).toBeDefined();
        expect(witness.credibility.factors).toBeDefined();
      });
    });

    it('should set perception score in valid range', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        const perception = witness.credibility.factors.perception;
        expect(perception).toBeGreaterThanOrEqual(1);
        expect(perception).toBeLessThanOrEqual(10);
      });
    });

    it('should set memory score in valid range', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        const memory = witness.credibility.factors.memory;
        expect(memory).toBeGreaterThanOrEqual(1);
        expect(memory).toBeLessThanOrEqual(10);
      });
    });

    it('should set narration score in valid range', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        const narration = witness.credibility.factors.narration;
        expect(narration).toBeGreaterThanOrEqual(1);
        expect(narration).toBeLessThanOrEqual(10);
      });
    });

    it('should set sincerity score in valid range', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        const sincerity = witness.credibility.factors.sincerity;
        expect(sincerity).toBeGreaterThanOrEqual(1);
        expect(sincerity).toBeLessThanOrEqual(10);
      });
    });

    it('should generate impeachment risks', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(Array.isArray(witness.credibility.impeachmentRisks)).toBe(true);
      });
    });

    it('should generate strength factors', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(Array.isArray(witness.credibility.strengthFactors)).toBe(true);
      });
    });

    it('should generate biases', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(Array.isArray(witness.credibility.biases)).toBe(true);
      });
    });

    it('should generate motivations', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(Array.isArray(witness.credibility.motivations)).toBe(true);
      });
    });
  });

  describe('Witness Relationships', () => {
    it('should generate relationship to parties', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.relationshipToParties).toBeDefined();
        expect(typeof witness.relationshipToParties).toBe('object');
      });
    });

    it('should set availability for trial', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(typeof witness.availabilityForTrial).toBe('boolean');
      });
    });

    it('should set location during incident', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.locationDuringIncident).toBeTruthy();
        expect(typeof witness.locationDuringIncident).toBe('string');
      });
    });
  });

  describe('Police Witnesses', () => {
    it('should generate police officers with proper credentials', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const policeWitnesses = witnesses.filter(w => w.witnessType === 'police');
      policeWitnesses.forEach(officer => {
        expect(officer.background.education).toBeTruthy();
        expect(officer.background.education.toLowerCase()).toMatch(/police|nypd|detective|criminal justice/);
        expect(officer.background.experience).toBeTruthy();
      });
    });

    it('should give police witnesses high credibility factors', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const policeWitnesses = witnesses.filter(w => w.witnessType === 'police');
      policeWitnesses.forEach(officer => {
        expect(officer.credibility.factors.perception).toBeGreaterThanOrEqual(5);
      });
    });
  });

  describe('Expert Witnesses', () => {
    it('should generate expert witnesses with qualifications', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const expertWitnesses = witnesses.filter(w => w.witnessType === 'expert');
      expertWitnesses.forEach(expert => {
        expect(expert.expertQualifications).toBeDefined();
        expect(Array.isArray(expert.expertQualifications)).toBe(true);
      });
    });

    it('should set compensation flag for expert witnesses', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const expertWitnesses = witnesses.filter(w => w.witnessType === 'expert');
      expertWitnesses.forEach(expert => {
        if (expert.compensationExpected !== undefined) {
          expect(typeof expert.compensationExpected).toBe('boolean');
        }
      });
    });
  });

  describe('Witness Types', () => {
    it('should validate witness type enum', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const validTypes = ['eyewitness', 'character', 'expert', 'victim', 'police', 'forensic', 'family', 'accomplice'];
      witnesses.forEach(witness => {
        expect(validTypes).toContain(witness.witnessType);
      });
    });

    it('should not generate victim witnesses for civil cases', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCivilContext);
      
      const victimWitnesses = witnesses.filter(w => w.witnessType === 'victim');
      expect(victimWitnesses.length).toBe(0);
    });

    it('should handle civil cases appropriately', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCivilContext);
      
      expect(witnesses.length).toBeGreaterThan(0);
      expect(witnesses.some(w => w.witnessType !== 'victim')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty participants list', () => {
      const emptyContext: EvidenceContext = {
        ...mockCriminalContext,
        participants: []
      };
      
      const witnesses = WitnessFactory.generateWitnessPackage(emptyContext);
      expect(witnesses).toBeDefined();
      expect(Array.isArray(witnesses)).toBe(true);
    });

    it('should handle different case types', () => {
      const criminalWitnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      const civilWitnesses = WitnessFactory.generateWitnessPackage(mockCivilContext);
      
      expect(criminalWitnesses.length).toBeGreaterThan(0);
      expect(civilWitnesses.length).toBeGreaterThan(0);
    });

    it('should generate witnesses with varying credibility', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      const perceptionScores = witnesses.map(w => w.credibility.factors.perception);
      const uniqueScores = new Set(perceptionScores);
      
      // Should have some variation in credibility
      expect(uniqueScores.size).toBeGreaterThan(1);
    });

    it('should handle prior criminal records', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        if (witness.priorCriminalRecord) {
          expect(Array.isArray(witness.priorCriminalRecord)).toBe(true);
        }
      });
    });
  });

  describe('Data Consistency', () => {
    it('should ensure all witnesses have key knowledge properties', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.knowledge).toHaveProperty('directObservations');
        expect(witness.knowledge).toHaveProperty('opinions');
        expect(witness.knowledge).toHaveProperty('memoryLimitations');
        expect(Array.isArray(witness.knowledge.directObservations)).toBe(true);
      });
    });

    it('should ensure all witnesses have complete credibility structure', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.credibility).toHaveProperty('factors');
        expect(witness.credibility).toHaveProperty('impeachmentRisks');
        expect(witness.credibility).toHaveProperty('strengthFactors');
        expect(witness.credibility).toHaveProperty('biases');
        expect(witness.credibility).toHaveProperty('motivations');
      });
    });

    it('should ensure all credibility factors are present', () => {
      const witnesses = WitnessFactory.generateWitnessPackage(mockCriminalContext);
      
      witnesses.forEach(witness => {
        expect(witness.credibility.factors).toHaveProperty('perception');
        expect(witness.credibility.factors).toHaveProperty('memory');
        expect(witness.credibility.factors).toHaveProperty('narration');
        expect(witness.credibility.factors).toHaveProperty('sincerity');
      });
    });
  });
});
