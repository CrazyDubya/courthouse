import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnhancedJudgeFactory } from '../EnhancedJudgeFactory';
import type { JudgeMBTI, JudicialTemperament, JudgeSpecialization } from '../../types/judge';

describe('EnhancedJudgeFactory', () => {
  describe('createJudge', () => {
    it('should create a judge with required name parameter', () => {
      const judge = EnhancedJudgeFactory.createJudge('Judge Smith');
      
      expect(judge).toBeDefined();
      expect(judge.id).toBeTruthy();
      expect(judge.name).toBe('Judge Smith');
      expect(judge.mbtiType).toBeTruthy();
      expect(judge.temperament).toBeTruthy();
      expect(judge.specialization).toBeTruthy();
      expect(judge.attributes).toBeDefined();
      expect(judge.quirks).toBeDefined();
      expect(judge.memory).toBeDefined();
      expect(judge.currentState).toBeDefined();
    });

    it('should create a judge with specified personality template', () => {
      const judge = EnhancedJudgeFactory.createJudge('Judge Smith', 'strict-traditionalist');
      
      expect(judge.name).toBe('Judge Smith');
      expect(judge).toBeDefined();
    });

    it('should create a judge with memory enabled by default', () => {
      const judge = EnhancedJudgeFactory.createJudge('Judge Smith');
      
      expect(judge.memory.enabled).toBe(true);
    });

    it('should create a judge with memory disabled when specified', () => {
      const judge = EnhancedJudgeFactory.createJudge('Judge Smith', undefined, false);
      
      expect(judge.memory.enabled).toBe(false);
    });

    it('should create a judge with valid attribute values', () => {
      const judge = EnhancedJudgeFactory.createJudge('Judge Smith');
      
      Object.values(judge.attributes).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      });
    });

    it('should create judges with different characteristics on multiple calls', () => {
      const judge1 = EnhancedJudgeFactory.createJudge('Judge Smith');
      const judge2 = EnhancedJudgeFactory.createJudge('Judge Jones');
      
      // Names should be different
      expect(judge1.name).toBe('Judge Smith');
      expect(judge2.name).toBe('Judge Jones');
    });
  });

  describe('Judge Memory System', () => {
    it('should initialize judge with enabled memory system', () => {
      const judge = EnhancedJudgeFactory.createJudge('Judge Smith');
      
      expect(judge.memory.enabled).toBe(true);
      expect(judge.memory.cases).toEqual([]);
      expect(judge.memory.participants).toEqual([]);
      expect(judge.memory.decisions).toEqual([]);
      expect(judge.memory.retentionPeriod).toBe(1825); // 5 years
    });

    it('should initialize judge with proper experience memory', () => {
      const judge = EnhancedJudgeFactory.createJudge('Judge Smith');
      
      expect(judge.memory.experience.totalCasesPresided).toBeGreaterThanOrEqual(0);
      expect(judge.memory.experience.convictionRate).toBeGreaterThanOrEqual(0);
      expect(judge.memory.experience.plaintiffWinRate).toBeGreaterThanOrEqual(0);
      expect(judge.memory.experience.careerStartDate).toBeInstanceOf(Date);
    });
  });

  describe('Judicial State', () => {
    it('should initialize judge with proper current state', () => {
      const judge = EnhancedJudgeFactory.createJudge('Judge Smith');
      
      expect(judge.currentState.currentMood).toBeGreaterThanOrEqual(-10);
      expect(judge.currentState.currentMood).toBeLessThanOrEqual(10);
      expect(judge.currentState.energyLevel).toBeGreaterThanOrEqual(1);
      expect(judge.currentState.energyLevel).toBeLessThanOrEqual(10);
      expect(judge.currentState.sessionStartTime).toBeInstanceOf(Date);
    });
  });

  describe('Quirks Generation', () => {
    it('should generate quirks based on personality type', () => {
      const judge = EnhancedJudgeFactory.createJudge('Judge Smith');
      
      expect(typeof judge.quirks.strictOnTime).toBe('boolean');
      expect(typeof judge.quirks.allowsFood).toBe('boolean');
      expect(typeof judge.quirks.usesHumor).toBe('boolean');
      expect(judge.quirks.proProsecution).toBeGreaterThanOrEqual(-5);
      expect(judge.quirks.proProsecution).toBeLessThanOrEqual(5);
    });
  });

  describe('Career Information', () => {
    it('should initialize career information properly', () => {
      const judge = EnhancedJudgeFactory.createJudge('Judge Smith');
      
      expect(judge.appointedDate).toBeInstanceOf(Date);
      expect(judge.appointingAuthority).toBeTruthy();
      expect(Array.isArray(judge.previousCareer)).toBe(true);
      expect(judge.lawSchool).toBeTruthy();
      expect(judge.graduationYear).toBeGreaterThan(1970);
      expect(judge.graduationYear).toBeLessThan(new Date().getFullYear());
    });
  });

  describe('Reputation and Ratings', () => {
    it('should initialize reputation scores within valid ranges', () => {
      const judge = EnhancedJudgeFactory.createJudge('Judge Smith');
      
      expect(judge.reputationScore).toBeGreaterThanOrEqual(1);
      expect(judge.reputationScore).toBeLessThanOrEqual(10);
      expect(judge.attorneyRating).toBeGreaterThanOrEqual(1);
      expect(judge.attorneyRating).toBeLessThanOrEqual(10);
      expect(judge.reversalRating).toBeGreaterThanOrEqual(1);
      expect(judge.reversalRating).toBeLessThanOrEqual(10);
      expect(judge.politicalLeanings).toBeGreaterThanOrEqual(-10);
      expect(judge.politicalLeanings).toBeLessThanOrEqual(10);
    });
  });
});