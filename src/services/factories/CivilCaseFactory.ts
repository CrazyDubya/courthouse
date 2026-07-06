import { Participant } from '../../types';
import { EnhancedCase } from '../../types/caseTypes';
import { EvidenceFactory, EvidenceContext } from '../EvidenceFactory';
import { WitnessFactory, DetailedWitness } from '../WitnessFactory';
import { BaseScenarioFactory, CaseScenario } from './BaseScenarioFactory';

/**
 * Civil case scenario factory for generating realistic NYS civil cases
 */
export class CivilCaseFactory extends BaseScenarioFactory {

  /**
   * Generate a complete realistic NYS civil case
   */
  static generateNYSCivilCase(caseType?: string): EnhancedCase {
    // Select civil case scenario
    const scenario = this.selectCivilCaseScenario(caseType);
    
    // Create evidence context for civil case
    const evidenceContext: EvidenceContext = {
      location: scenario.basicInfo.location,
      timeOfIncident: scenario.basicInfo.timeOfIncident,
      participants: ['plaintiff', 'defendant', 'witnesses'],
      charges: [], // No criminal charges in civil cases
      caseType: 'civil'
    };

    // Generate evidence package
    const evidenceList = EvidenceFactory.generateEvidencePackage(evidenceContext);
    
    // Generate witness list
    const witnesses = WitnessFactory.generateWitnessPackage(evidenceContext);
    
    // Generate all participants (attorneys, judge, jury, etc.)
    const allParticipants = this.generateCivilParticipants(witnesses, scenario);

    // Create enhanced civil case structure
    // Constructed case carries richer, factory-specific detail than the EnhancedCase
    // interface models (pre-existing schema divergence); runtime consumers use these fields.
    const enhancedCase = {
      id: `nys-civil-${Date.now()}`,
      title: scenario.basicInfo.title,
      type: 'civil',
      legalSystem: 'common-law',
      summary: scenario.narrative.summary,
      facts: scenario.narrative.detailedFacts,
      civil: {
        baseType: 'civil',
        causeOfAction: scenario.legalIssues.chargesOrClaims[0] || 'negligence',
        burdenOfProof: 'preponderance-of-evidence',
        jurisdiction: 'state',
        plaintiffCounsel: 'Private Practice',
        defendantCounsel: 'Insurance Defense',
        damagesRequested: Math.floor(Math.random() * 2000000) + 100000,
        injunctiveRelief: Math.random() > 0.7,
        classAction: false,
        juryTrial: true,
        expertWitnessesRequired: true,
        discoveryDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        mediationRequired: Math.random() > 0.5,
        settlementOffers: [],
        comparativeFault: Math.random() > 0.6
      },
      evidence: evidenceList,
      participants: allParticipants,
      currentPhase: 'case-preparation',
      transcript: [],
      rulings: [],
      // Discovery tracking for civil cases
      discoveryStatus: {
        plaintiffRequests: this.generateDiscoveryRequests('plaintiff'),
        defendantRequests: this.generateDiscoveryRequests('defendant'),
        completedRequests: [],
        pendingMotions: ['Motion to Compel Discovery'],
        expertDepositions: [],
        documentProduction: 'ongoing'
      }
    };

    return enhancedCase as unknown as EnhancedCase;
  }

  /**
   * Select a civil case scenario
   */
  protected static selectCivilCaseScenario(caseType?: string): CaseScenario {
    const civilScenarios = this.getCivilScenarios();
    
    if (caseType) {
      const filteredScenarios = civilScenarios.filter(s => 
        s.basicInfo.title.toLowerCase().includes(caseType.toLowerCase()) ||
        s.legalIssues.chargesOrClaims.some(c => c.toLowerCase().includes(caseType.toLowerCase()))
      );
      if (filteredScenarios.length > 0) {
        return filteredScenarios[Math.floor(Math.random() * filteredScenarios.length)];
      }
    }
    
    return civilScenarios[Math.floor(Math.random() * civilScenarios.length)];
  }

  /**
   * Get civil case scenarios
   */
  protected static getCivilScenarios(): CaseScenario[] {
    return [
      // Personal Injury Case
      {
        basicInfo: {
          title: 'Martinez v. Yellow Cab Company',
          caseNumber: '2024-CV-003421',
          court: 'New York County Supreme Court, Part 12',
          judge: 'Hon. Michael Thompson',
          location: 'Intersection of Broadway and 42nd Street, Manhattan',
          timeOfIncident: '3:45 PM on February 14, 2024',
          arrestDate: 'N/A - Civil Matter'
        },
        narrative: {
          summary: 'Plaintiff sustained severe injuries in taxi collision, seeking damages for permanent disability and lost wages.',
          detailedFacts: [
            'Plaintiff Maria Martinez was crossing Broadway at 42nd Street in marked crosswalk',
            'Defendant taxi driver ran red light while texting on cell phone',
            'Taxi struck plaintiff at approximately 25 mph causing multiple fractures',
            'Plaintiff suffered broken pelvis, fractured ribs, and traumatic brain injury',
            'Emergency surgery at Bellevue Hospital, 3-month ICU stay',
            'Plaintiff required extensive physical therapy and rehabilitation',
            'Permanent partial disability preventing return to teaching career',
            'Traffic cameras captured entire collision sequence',
            'Driver cited for reckless driving and using mobile device',
            'Taxi company had 15 prior safety violations in 2023'
          ],
          mitigatingFactors: [
            'Plaintiff was in marked crosswalk with walk signal',
            'Multiple independent witnesses confirm defendant fault',
            'Clear video evidence of defendant\'s negligence'
          ],
          aggravatingFactors: [
            'Plaintiff contributory negligence - not paying attention',
            'Pre-existing back condition may have worsened injuries',
            'Plaintiff refused some recommended medical treatments'
          ]
        },
        legalIssues: {
          chargesOrClaims: [
            'Negligence against taxi driver',
            'Vicarious liability against Yellow Cab Company',
            'Negligent hiring and supervision'
          ],
          potentialDefenses: [
            'Comparative negligence by plaintiff',
            'Assumption of risk',
            'Pre-existing medical conditions',
            'Failure to mitigate damages'
          ],
          evidentiaryIssues: [
            'Traffic camera footage admissibility',
            'Cell phone records to prove texting',
            'Medical records and expert testimony',
            'Economic loss calculations'
          ],
          proceduralIssues: [
            'Joint and several liability apportionment',
            'Statute of limitations compliance',
            'Insurance coverage limits',
            'Settlement negotiations timing'
          ]
        },
        trialStrategy: {
          prosecutionTheory: 'Defendant taxi driver\'s reckless behavior and company\'s negligent supervision caused plaintiff\'s devastating permanent injuries requiring substantial compensation.',
          defenseTheory: 'Plaintiff\'s own negligence contributed to accident; injuries were pre-existing or exaggerated; claimed damages are excessive and unproven.',
          keyEvidence: [
            'Traffic camera video of collision',
            'Cell phone records showing texting',
            'Medical records and treatment history',
            'Economic loss calculations'
          ],
          keyWitnesses: [
            'Plaintiff Maria Martinez',
            'Eyewitness pedestrians',
            'Treating physicians',
            'Economic damages expert'
          ]
        }
      },

      // Medical Malpractice Case
      {
        basicInfo: {
          title: 'Johnson v. Mount Sinai Hospital',
          caseNumber: '2024-CV-004156',
          court: 'New York County Supreme Court, Part 25',
          judge: 'Hon. Patricia Wu',
          location: 'Mount Sinai Hospital, 1 Gustave L. Levy Place, Manhattan',
          timeOfIncident: '9:30 AM on March 8, 2024',
          arrestDate: 'N/A - Civil Matter'
        },
        narrative: {
          summary: 'Patient died from surgical complications allegedly caused by surgeon\'s failure to follow standard of care during routine procedure.',
          detailedFacts: [
            'Patient Robert Johnson, 54, admitted for routine gallbladder surgery',
            'Surgeon Dr. Patricia Williams performed laparoscopic cholecystectomy',
            'During surgery, common bile duct was accidentally severed',
            'Surgeon failed to recognize injury during procedure',
            'Patient developed severe infection and liver failure post-op',
            'Second surgery required to repair bile duct injury',
            'Patient died from complications of liver failure after 12 days',
            'Hospital\'s peer review found surgeon deviated from standard care',
            'Surgeon had 3 prior similar complications in past 2 years',
            'Family not informed of surgical complications until patient critical'
          ],
          mitigatingFactors: [
            'Patient had complex anatomy making surgery difficult',
            'Emergency complications can occur in any surgery',
            'Hospital provided aggressive treatment to save patient'
          ],
          aggravatingFactors: [
            'Surgeon\'s pattern of similar complications',
            'Failure to obtain proper informed consent',
            'Delayed recognition and repair of injury',
            'Inadequate post-operative monitoring'
          ]
        },
        legalIssues: {
          chargesOrClaims: [
            'Medical malpractice against surgeon',
            'Hospital liability for credentialing',
            'Lack of informed consent',
            'Wrongful death'
          ],
          potentialDefenses: [
            'Standard of care was met',
            'Complication was known risk',
            'Patient\'s pre-existing conditions',
            'Proper informed consent obtained'
          ],
          evidentiaryIssues: [
            'Standard of care expert testimony',
            'Hospital credentialing records',
            'Informed consent documentation',
            'Medical records and pathology'
          ],
          proceduralIssues: [
            'Medical malpractice certificate of merit',
            'Discovery of hospital peer review',
            'Expert witness qualifications',
            'Damages calculation for wrongful death'
          ]
        },
        trialStrategy: {
          prosecutionTheory: 'Surgeon\'s repeated pattern of negligence and hospital\'s failure to properly supervise resulted in preventable death of healthy patient.',
          defenseTheory: 'Surgery met standard of care; complications were known risks properly disclosed; patient\'s conditions contributed to outcome.',
          keyEvidence: [
            'Hospital peer review findings',
            'Surgeon\'s prior complication history',
            'Medical records and pathology',
            'Standard of care literature'
          ],
          keyWitnesses: [
            'Surviving family members',
            'Medical expert witnesses',
            'Hospital administrators',
            'Treating physicians'
          ]
        }
      }
    ];
  }

  /**
   * Generate civil case participants
   */
  protected static generateCivilParticipants(witnesses: DetailedWitness[], scenario: CaseScenario): Participant[] {
    const participants: Participant[] = [];
    
    // Convert witnesses to participants
    witnesses.forEach(witness => {
      participants.push(this.convertWitnessToParticipant(witness));
    });

    // Add plaintiff attorney
    participants.push(this.generatePlaintiffAttorney(scenario));
    
    // Add defendant attorney  
    participants.push(this.generateDefendantAttorney(scenario));

    // Add judge
    participants.push(this.generateCivilJudge(scenario));

    // Add plaintiff (if not already in witnesses)
    const plaintiffExists = witnesses.some(w => w.role === 'plaintiff');
    if (!plaintiffExists) {
      participants.push(this.generatePlaintiff(scenario));
    }

    // Add jury members
    participants.push(...this.generateJury());

    // Add court personnel
    participants.push(this.generateCourtClerk());
    participants.push(this.generateBailiff());

    return participants;
  }

  /**
   * Generate plaintiff attorney participant
   */
  protected static generatePlaintiffAttorney(scenario: CaseScenario): Participant {
    return {
      id: 'plaintiff-attorney-1',
      name: 'Sarah Kim, Esq.',
      role: 'plaintiff-attorney',
      aiControlled: true,
      llmProvider: {
        provider: 'ollama',
        model: 'smollm2:1.7b',
        baseUrl: 'http://localhost:11434',
        temperature: 0.8,
        maxRetries: 3
      },
      personality: {
        assertiveness: 9,
        empathy: 8,
        analyticalThinking: 8,
        emotionalStability: 7,
        openness: 7,
        conscientiousness: 8,
        persuasiveness: 9
      },
      background: {
        age: 41,
        education: 'Columbia Law School J.D., Barnard College B.A.',
        experience: '16 years personal injury law, certified trial attorney',
        specialization: 'Personal injury, medical malpractice, wrongful death',
        personalHistory: 'Former insurance defense attorney turned plaintiff advocate',
        motivations: ['Justice for injured clients', 'Fair compensation', 'Hold defendants accountable']
      },
      currentMood: 0.7,
      knowledge: [
        'NY Civil Practice Law and Rules (CPLR)',
        'Personal injury damages calculation',
        'Medical terminology and evidence',
        'Insurance law and coverage',
        scenario.trialStrategy.prosecutionTheory
      ],
      objectives: [
        'Prove defendant liability',
        'Maximize client damages',
        'Present compelling evidence narrative',
        'Obtain favorable verdict or settlement'
      ],
      currentLocation: 'courtroom',
      isPresent: true
    };
  }

  /**
   * Generate defendant attorney participant
   */
  protected static generateDefendantAttorney(scenario: CaseScenario): Participant {
    return {
      id: 'defendant-attorney-1',
      name: 'Michael Rodriguez, Esq.',
      role: 'defense-attorney',
      aiControlled: true,
      llmProvider: {
        provider: 'ollama',
        model: 'smollm2:1.7b',
        baseUrl: 'http://localhost:11434',
        temperature: 0.8,
        maxRetries: 3
      },
      personality: {
        assertiveness: 8,
        empathy: 5,
        analyticalThinking: 9,
        emotionalStability: 8,
        openness: 6,
        conscientiousness: 9,
        persuasiveness: 8
      },
      background: {
        age: 38,
        education: 'NYU Law School J.D., Cornell University B.A.',
        experience: '13 years insurance defense, civil litigation',
        specialization: 'Insurance defense, professional liability, premises liability',
        personalHistory: 'Partner at major insurance defense firm',
        motivations: ['Zealous client advocacy', 'Minimize liability exposure', 'Cost-effective resolution']
      },
      currentMood: 0.6,
      knowledge: [
        'NY insurance law',
        'Comparative fault defense strategies',
        'Medical evidence analysis',
        'Damages mitigation techniques',
        scenario.trialStrategy.defenseTheory
      ],
      objectives: [
        'Establish comparative fault',
        'Challenge damages claims',
        'Minimize client liability',
        'Obtain defense verdict'
      ],
      currentLocation: 'courtroom',
      isPresent: true
    };
  }

  /**
   * Generate civil judge participant
   */
  protected static generateCivilJudge(scenario: CaseScenario): Participant {
    return {
      id: 'judge-1',
      name: scenario.basicInfo.judge,
      role: 'judge',
      aiControlled: true,
      llmProvider: {
        provider: 'ollama',
        model: 'smollm2:1.7b',
        baseUrl: 'http://localhost:11434',
        temperature: 0.6,
        maxRetries: 3
      },
      personality: {
        assertiveness: 8,
        empathy: 7,
        analyticalThinking: 10,
        emotionalStability: 9,
        openness: 7,
        conscientiousness: 10,
        persuasiveness: 7
      },
      background: {
        age: 55,
        education: 'Fordham Law School J.D., Fordham University B.A.',
        experience: '10 years on bench, 18 years civil practice',
        specialization: 'Civil litigation, tort law, evidence',
        personalHistory: 'Former civil litigator, appointed to bench 2014',
        motivations: ['Judicial fairness', 'Efficient case management', 'Justice', 'Legal precedent']
      },
      currentMood: 0.8,
      knowledge: [
        'CPLR civil procedure',
        'Evidence law',
        'Tort law principles',
        'Damages calculation',
        'Trial management',
        'Discovery supervision - SHOULD NOT advocate for either party but ensure fair discovery process'
      ],
      objectives: [
        'Ensure fair trial',
        'Manage discovery disputes neutrally',
        'Apply law correctly', 
        'Maintain courtroom order',
        'Supervise evidence sequestration properly'
      ],
      currentLocation: 'courtroom',
      isPresent: true
    };
  }

  /**
   * Generate plaintiff participant
   */
  protected static generatePlaintiff(scenario: CaseScenario): Participant {
    return {
      id: 'plaintiff-1',
      name: 'Maria Martinez',
      role: 'plaintiff',
      aiControlled: true,
      llmProvider: {
        provider: 'ollama',
        model: 'qwen2.5:3b',
        baseUrl: 'http://localhost:11434',
        temperature: 0.6,
        maxRetries: 3
      },
      personality: {
        assertiveness: 5,
        empathy: 8,
        analyticalThinking: 5,
        emotionalStability: 4,
        openness: 7,
        conscientiousness: 7,
        persuasiveness: 6
      },
      background: {
        age: 34,
        education: 'Bachelor\'s degree in Education',
        experience: 'Elementary school teacher, first-time plaintiff',
        personalHistory: 'Dedicated teacher, mother of two, active in community',
        motivations: ['Recovery of medical expenses', 'Lost income replacement', 'Justice for injuries']
      },
      currentMood: 0.4,
      knowledge: ['Basic legal rights', 'Personal injury impact'],
      objectives: ['Prove extent of injuries', 'Recover fair compensation', 'Move forward with life']
    };
  }
}
