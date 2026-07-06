import { Participant } from '../../types';
import { DetailedWitness } from '../WitnessFactory';

export interface CaseScenario {
  basicInfo: {
    title: string;
    caseNumber: string;
    court: string;
    judge: string;
    location: string;
    timeOfIncident: string;
    arrestDate: string;
  };
  narrative: {
    summary: string;
    detailedFacts: string[];
    criminalHistory?: string[];
    mitigatingFactors?: string[];
    aggravatingFactors?: string[];
  };
  legalIssues: {
    chargesOrClaims: string[];
    potentialDefenses: string[];
    evidentiaryIssues: string[];
    proceduralIssues: string[];
  };
  trialStrategy: {
    prosecutionTheory: string;
    defenseTheory: string;
    keyEvidence: string[];
    keyWitnesses: string[];
  };
}

/**
 * Base factory class with shared logic for case generation
 */
export abstract class BaseScenarioFactory {
  
  /**
   * Convert witness to participant format
   */
  protected static convertWitnessToParticipant(witness: DetailedWitness): Participant {
    return {
      id: witness.id,
      name: witness.name,
      role: witness.role,
      aiControlled: witness.aiControlled,
      llmProvider: witness.llmProvider,
      personality: witness.personality,
      background: witness.background,
      currentMood: witness.currentMood,
      knowledge: witness.knowledge.directObservations,
      objectives: witness.objectives,
      currentLocation: 'courtroom'
    };
  }

  /**
   * Generate jury members
   */
  protected static generateJury(): Participant[] {
    const jurors: Participant[] = [];
    const jurorNames = [
      'Robert Chen', 'Maria Lopez', 'James Wilson', 'Lisa Anderson',
      'Michael Brown', 'Jennifer Davis', 'David Martinez', 'Sarah Johnson',
      'Thomas Garcia', 'Patricia Rodriguez', 'Christopher Lee', 'Nancy White'
    ];

    for (let i = 0; i < 12; i++) {
      jurors.push({
        id: `juror-${i + 1}`,
        name: jurorNames[i],
        role: 'jury-member',
        aiControlled: true,
        llmProvider: {
          provider: 'ollama',
          model: 'qwen2.5:3b',
          baseUrl: 'http://localhost:11434',
          temperature: 0.6,
          maxRetries: 3
        },
        personality: {
          assertiveness: Math.floor(Math.random() * 4) + 4,
          empathy: Math.floor(Math.random() * 4) + 5,
          analyticalThinking: Math.floor(Math.random() * 4) + 5,
          emotionalStability: Math.floor(Math.random() * 3) + 6,
          openness: Math.floor(Math.random() * 4) + 5,
          conscientiousness: Math.floor(Math.random() * 3) + 6,
          persuasiveness: Math.floor(Math.random() * 4) + 4
        },
        background: {
          age: Math.floor(Math.random() * 40) + 25,
          education: ['High school', 'Some college', 'Bachelor\'s degree', 'Graduate degree'][Math.floor(Math.random() * 4)],
          experience: 'Jury service',
          personalHistory: 'Average citizen selected for jury duty',
          motivations: ['Civic duty', 'Fair trial', 'Justice']
        },
        currentMood: 0.6,
        knowledge: ['Basic legal concepts', 'Jury instructions'],
        objectives: ['Evaluate evidence fairly', 'Follow judge\'s instructions', 'Reach just verdict']
      });
    }

    return jurors;
  }

  /**
   * Generate court clerk participant
   */
  protected static generateCourtClerk(): Participant {
    return {
      id: 'court-clerk-1',
      name: 'Eleanor Martinez',
      role: 'court-clerk',
      aiControlled: true,
      llmProvider: {
        provider: 'ollama',
        model: 'qwen2.5:3b',
        baseUrl: 'http://localhost:11434',
        temperature: 0.5,
        maxRetries: 3
      },
      personality: {
        assertiveness: 6,
        empathy: 7,
        analyticalThinking: 8,
        emotionalStability: 8,
        openness: 6,
        conscientiousness: 9,
        persuasiveness: 5
      },
      background: {
        age: 42,
        education: 'Associate degree in Legal Studies',
        experience: '18 years as court clerk',
        personalHistory: 'Experienced court administrator, expert in legal procedures',
        motivations: ['Court efficiency', 'Accurate record keeping', 'Professional service']
      },
      currentMood: 0.75,
      knowledge: ['Court procedures', 'Legal documentation', 'Case management'],
      objectives: ['Maintain accurate records', 'Support judge and attorneys', 'Ensure procedural compliance']
    };
  }

  /**
   * Generate bailiff participant
   */
  protected static generateBailiff(): Participant {
    return {
      id: 'bailiff-1',
      name: 'Officer James Reynolds',
      role: 'bailiff',
      aiControlled: true,
      llmProvider: {
        provider: 'ollama',
        model: 'qwen2.5:3b',
        baseUrl: 'http://localhost:11434',
        temperature: 0.5,
        maxRetries: 3
      },
      personality: {
        assertiveness: 8,
        empathy: 6,
        analyticalThinking: 6,
        emotionalStability: 9,
        openness: 5,
        conscientiousness: 9,
        persuasiveness: 6
      },
      background: {
        age: 48,
        education: 'High school diploma, Law enforcement training',
        experience: '22 years in law enforcement, 12 as court bailiff',
        personalHistory: 'Former NYPD patrol officer, expert in courtroom security',
        motivations: ['Courtroom security', 'Order maintenance', 'Public safety']
      },
      currentMood: 0.8,
      knowledge: ['Security procedures', 'Court protocols', 'Crowd control'],
      objectives: ['Maintain courtroom security', 'Protect all participants', 'Ensure order']
    };
  }

  /**
   * Generate discovery requests
   */
  protected static generateDiscoveryRequests(party: 'plaintiff' | 'defendant'): any[] {
    const baseRequests = [
      { type: 'interrogatories', deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() },
      { type: 'document-production', deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString() },
      { type: 'admissions', deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString() }
    ];
    
    return baseRequests.map(req => ({
      ...req,
      requestingParty: party,
      status: 'pending',
      sequestrationLevel: this.determineSequestrationLevel(req.type),
      accessRights: this.determineAccessRights(req.type, party)
    }));
  }

  /**
   * Determine sequestration level for discovery
   */
  protected static determineSequestrationLevel(requestType: string): 'public' | 'attorneys-only' | 'protective-order' {
    if (requestType === 'interrogatories') return 'attorneys-only';
    if (requestType === 'document-production') return 'attorneys-only';
    return 'public';
  }

  /**
   * Determine access rights for discovery
   */
  protected static determineAccessRights(requestType: string, requestingParty: string): string[] {
    return [requestingParty, 'judge', 'court-clerk'];
  }
}
