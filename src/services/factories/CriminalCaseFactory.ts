import { Case, Participant } from '../../types';
import { EnhancedCase } from '../../types/caseTypes';
import { nysCriminalCharges, NYSCriminalCharge, generateNYSChargesFromFacts } from '../../data/NYSCriminalCharges';
import { EvidenceFactory, EvidenceContext } from '../EvidenceFactory';
import { WitnessFactory, DetailedWitness } from '../WitnessFactory';
import { TestimonyGenerator, TestimonySequence } from '../TestimonyGenerator';
import { BaseScenarioFactory, CaseScenario } from './BaseScenarioFactory';

export class CriminalCaseFactory extends BaseScenarioFactory {

  /**
   * Generate a complete realistic NYS criminal case
   */
  static generateNYSCriminalCase(caseType?: string): EnhancedCase {
    // Select case scenario
    const scenario = this.selectCaseScenario(caseType);
    
    // Generate charges based on facts
    const charges = generateNYSChargesFromFacts(scenario.narrative.detailedFacts);
    
    // Create evidence context
    const evidenceContext: EvidenceContext = {
      location: scenario.basicInfo.location,
      timeOfIncident: scenario.basicInfo.timeOfIncident,
      participants: ['defendant', 'victim', 'witnesses'],
      charges: charges,
      caseType: 'criminal'
    };

    // Generate evidence package
    const evidenceList = EvidenceFactory.generateEvidencePackage(evidenceContext);
    
    // Generate witness list
    const witnesses = WitnessFactory.generateWitnessPackage(evidenceContext);
    
    // Generate all participants (attorneys, judge, jury, etc.)
    const allParticipants = this.generateAllParticipants(witnesses, scenario);

    // Create enhanced case structure
    // Constructed case carries richer, factory-specific detail than the EnhancedCase
    // interface models (pre-existing schema divergence); runtime consumers use these fields.
    const enhancedCase = {
      id: `nys-criminal-${Date.now()}`,
      title: scenario.basicInfo.title,
      type: 'criminal',
      legalSystem: 'common-law',
      summary: scenario.narrative.summary,
      facts: scenario.narrative.detailedFacts,
      criminal: {
        baseType: 'criminal',
        charges: charges,
        burdenOfProof: 'beyond-reasonable-doubt',
        jurisdiction: 'state',
        districtAttorney: 'Manhattan District Attorney\'s Office',
        investigatingAgency: ['NYPD', 'Detective Bureau'],
        defendantCustodyStatus: Math.random() > 0.3 ? 'released-bail' : 'in-custody',
        bailAmount: Math.floor(Math.random() * 100000) + 10000,
        priorConvictions: scenario.narrative.criminalHistory || [],
        grandJuryIndictment: charges.some(c => c.classification.includes('Felony')),
        plea: 'not-guilty',
        sentencingGuidelines: 'New York State Sentencing Guidelines',
        victimImpactStatements: true,
        capitalCase: charges.some(c => c.crimeType === 'murder-first'),
        juvenileDefendant: false,
        mentalHealthConcerns: scenario.narrative.mitigatingFactors?.includes('mental health') || false
      },
      evidence: evidenceList,
      participants: allParticipants,
      currentPhase: 'case-preparation',
      transcript: [],
      rulings: [],
      // Additional metadata for realistic trial
      scenario: scenario,
      testimonySequences: this.generateAllTestimonySequences(witnesses, evidenceList)
    };

    return enhancedCase as unknown as EnhancedCase;
  }

  /**
   * Select a case scenario based on type or randomly
   */
  protected static selectCaseScenario(caseType?: string): CaseScenario {
    const scenarios = this.getCaseScenarios();
    
    if (caseType) {
      const filteredScenarios = scenarios.filter(s => 
        s.basicInfo.title.toLowerCase().includes(caseType.toLowerCase())
      );
      if (filteredScenarios.length > 0) {
        return filteredScenarios[Math.floor(Math.random() * filteredScenarios.length)];
      }
    }
    
    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }

  /**
   * Get predefined realistic case scenarios
   */
  protected static getCaseScenarios(): CaseScenario[] {
    return [
      // Robbery Case
      {
        basicInfo: {
          title: 'People v. Marcus Williams',
          caseNumber: '2024-CR-001847',
          court: 'New York County Supreme Court, Part 62',
          judge: 'Hon. Patricia Morrison',
          location: 'Corner of Amsterdam Avenue and 125th Street, Manhattan',
          timeOfIncident: '11:15 PM on March 15, 2024',
          arrestDate: 'March 16, 2024 at 2:30 AM'
        },
        narrative: {
          summary: 'Defendant allegedly robbed victim at knifepoint outside subway station, causing serious physical injury when victim resisted.',
          detailedFacts: [
            'Victim Luis Garcia was walking home from his job at a restaurant in Harlem',
            'Defendant Marcus Williams approached victim from behind near subway entrance',
            'Defendant displayed 8-inch kitchen knife and demanded victim\'s wallet and phone',
            'Victim initially complied but defendant stabbed victim twice in chest after taking property',
            'Defendant fled on foot northbound on Amsterdam Avenue',
            'Victim sustained punctured lung and required emergency surgery at Harlem Hospital',
            'NYPD responded to 911 call and canvassed area for suspect',
            'Defendant was arrested 3 hours later at his apartment with victim\'s property and bloody clothing',
            'Defendant made spontaneous statement to police: "I didn\'t mean to hurt him that bad"',
            'Search warrant recovered murder weapon from defendant\'s bedroom closet'
          ],
          criminalHistory: [
            'Prior conviction for Petit Larceny (2019)',
            'Violation of Probation (2020)',
            'Assault in the Third Degree - charges dismissed (2022)'
          ],
          mitigatingFactors: [
            'Defendant struggled with heroin addiction for 5 years',
            'Recently lost job due to COVID-19 economic impact',
            'Caring for elderly mother with dementia',
            'No prior violent felony convictions'
          ],
          aggravatingFactors: [
            'Serious physical injury to victim',
            'Use of deadly weapon',
            'Crime committed near public transportation',
            'Defendant was on probation at time of offense'
          ]
        },
        legalIssues: {
          chargesOrClaims: [
            'Robbery in the First Degree (NYPL § 160.15)',
            'Assault in the First Degree (NYPL § 120.10)',
            'Criminal Possession of a Weapon in the Fourth Degree (NYPL § 265.01)'
          ],
          potentialDefenses: [
            'Mistaken identity',
            'Intoxication defense for intent element',
            'Duress (threatened by drug dealers)',
            'Mental disease or defect'
          ],
          evidentiaryIssues: [
            'Admissibility of defendant\'s spontaneous statement',
            'Chain of custody for physical evidence',
            'Eyewitness identification reliability',
            'Search warrant validity for apartment'
          ],
          proceduralIssues: [
            'Speedy trial issues under CPL Article 30',
            'Miranda rights compliance',
            'Grand jury proceedings',
            'Bail determination factors'
          ]
        },
        trialStrategy: {
          prosecutionTheory: 'Defendant committed premeditated robbery with deadly weapon, escalating to attempted murder when victim complied, showing depraved indifference to human life.',
          defenseTheory: 'Defendant was misidentified by traumatized victim; alternative perpetrator committed crime; defendant\'s addiction impaired his judgment and intent.',
          keyEvidence: [
            'Victim\'s identification testimony',
            'DNA evidence on weapon',
            'Defendant\'s spontaneous statement',
            'Medical evidence of victim\'s injuries'
          ],
          keyWitnesses: [
            'Victim Luis Garcia',
            'Eyewitness Rosa Martinez',
            'Arresting Officer Michael Torres',
            'Medical Examiner Dr. Patricia Chen'
          ]
        }
      },

      // Murder Case
      {
        basicInfo: {
          title: 'People v. Sarah Chen',
          caseNumber: '2024-CR-002153',
          court: 'New York County Supreme Court, Part 73',
          judge: 'Hon. Robert Thompson',
          location: 'Defendant\'s apartment at 245 East 84th Street, Manhattan',
          timeOfIncident: '2:30 AM on April 8, 2024',
          arrestDate: 'April 8, 2024 at 6:45 AM'
        },
        narrative: {
          summary: 'Defendant allegedly murdered her boyfriend during domestic dispute, claiming self-defense after years of abuse.',
          detailedFacts: [
            'Defendant Sarah Chen lived with victim Michael Rodriguez for 3 years',
            'History of domestic violence incidents documented by NYPD (4 prior calls)',
            'On night of incident, defendant and victim argued about defendant\'s desire to leave relationship',
            'Neighbors heard shouting, breaking glass, and victim threatening to kill defendant',
            'Defendant stabbed victim 3 times with kitchen knife during struggle',
            'Defendant called 911 immediately after incident, rendered first aid',
            'Victim transported to NY Presbyterian but died from blood loss',
            'Defendant cooperative with police, admitted to stabbing in self-defense',
            'Crime scene showed signs of struggle throughout apartment',
            'Defendant had fresh bruises on neck and defensive wounds on arms'
          ],
          criminalHistory: [
            'No prior criminal record',
            'Multiple domestic violence calls as victim (2021-2024)',
            'Order of protection filed against victim (expired 2023)'
          ],
          mitigatingFactors: [
            'Documented history of domestic violence victimization',
            'Defendant\'s injuries consistent with self-defense',
            'Defendant called 911 and attempted to save victim',
            'Strong community support and character witnesses',
            'Psychological evaluation shows PTSD from abuse'
          ],
          aggravatingFactors: [
            'Defendant initiated argument that led to violence',
            'Three stab wounds suggest excessive force',
            'Victim was attempting to leave when stabbed',
            'Defendant had opportunity to flee apartment'
          ]
        },
        legalIssues: {
          chargesOrClaims: [
            'Murder in the Second Degree (NYPL § 125.25)',
            'Manslaughter in the First Degree (lesser included)',
            'Criminal Possession of a Weapon in the Fourth Degree (NYPL § 265.01)'
          ],
          potentialDefenses: [
            'Self-defense under Penal Law § 35.15',
            'Battered Woman Syndrome',
            'Extreme emotional disturbance',
            'Defense of others (protecting children)'
          ],
          evidentiaryIssues: [
            'Prior domestic violence evidence under Molineux',
            'Defendant\'s statements to 911 and police',
            'Psychological expert testimony on domestic violence',
            'Crime scene reconstruction evidence'
          ],
          proceduralIssues: [
            'Grand jury presentation of justification defense',
            'Bail considerations for domestic violence homicide',
            'Victim impact statements from victim\'s family',
            'Media coverage and venue change motions'
          ]
        },
        trialStrategy: {
          prosecutionTheory: 'Defendant committed intentional murder during argument, using excessive force that went beyond any claim of self-defense, showing depraved indifference to victim\'s life.',
          defenseTheory: 'Defendant acted in justified self-defense after years of abuse, reasonably believing she was in imminent danger of death or serious injury from violent abuser.',
          keyEvidence: [
            'Defendant\'s 911 call and cooperation',
            'Medical evidence of defendant\'s injuries',
            'History of domestic violence calls',
            'Crime scene reconstruction'
          ],
          keyWitnesses: [
            'Defendant Sarah Chen',
            'Neighbor witness to argument',
            'Responding EMT/Police officers',
            'Domestic violence expert Dr. Amanda Foster'
          ]
        }
      },

      // Drug Possession Case
      {
        basicInfo: {
          title: 'People v. Jerome Washington',
          caseNumber: '2024-CR-001234',
          court: 'New York County Supreme Court, Part 58',
          judge: 'Hon. Maria Rodriguez',
          location: 'Traffic stop on FDR Drive near 23rd Street exit',
          timeOfIncident: '3:45 PM on February 12, 2024',
          arrestDate: 'February 12, 2024 at 4:15 PM'
        },
        narrative: {
          summary: 'Defendant arrested during traffic stop when police discovered large quantity of cocaine, leading to A-1 felony drug charges under Rockefeller Drug Laws.',
          detailedFacts: [
            'NYPD conducted traffic stop for expired registration and speeding',
            'Officer observed nervous behavior and requested consent to search vehicle',
            'Defendant refused consent; officer called for K-9 unit',
            'Drug-detection dog alerted to trunk of vehicle',
            'Search warrant obtained and executed at scene',
            'Police recovered 9.2 ounces of cocaine in vacuum-sealed packages',
            'Defendant denied knowledge of drugs, claimed borrowed car from friend',
            'Laboratory analysis confirmed 89% pure cocaine hydrochloride',
            'Street value estimated at $25,000-$30,000',
            'Defendant\'s fingerprints found on exterior of drug packages'
          ],
          criminalHistory: [
            'Prior conviction for Criminal Sale of a Controlled Substance 5th Degree (2018)',
            'Violation of Probation (2019)',
            'Criminal Possession of a Controlled Substance 7th Degree (2021)'
          ],
          mitigatingFactors: [
            'Defendant has stable employment as construction worker',
            'Supporting girlfriend and two young children',
            'Entered drug treatment program voluntarily in 2022',
            'Letters of support from employer and community'
          ],
          aggravatingFactors: [
            'Large quantity indicates intent to distribute',
            'Prior drug convictions show pattern of behavior',
            'Sophisticated packaging suggests professional operation',
            'Crime committed while on probation'
          ]
        },
        legalIssues: {
          chargesOrClaims: [
            'Criminal Possession of a Controlled Substance in the First Degree (NYPL § 220.21)',
            'Criminal Possession of a Controlled Substance in the Second Degree (lesser included)',
            'Criminal Sale of a Controlled Substance in the Second Degree (NYPL § 220.41)'
          ],
          potentialDefenses: [
            'Unlawful search and seizure under Fourth Amendment',
            'Lack of knowledge of drugs in vehicle',
            'Constructive possession insufficient',
            'Chain of custody defects'
          ],
          evidentiaryIssues: [
            'Validity of initial traffic stop',
            'K-9 alert reliability and handler certification',
            'Search warrant probable cause determination',
            'Laboratory chain of custody and testing procedures'
          ],
          proceduralIssues: [
            'Mapp/Dunaway hearing on search and seizure',
            'Rockefellar Drug Law mandatory minimums',
            'Drug Offender Sentencing Alternative eligibility',
            'Cooperation agreement negotiations'
          ]
        },
        trialStrategy: {
          prosecutionTheory: 'Defendant knowingly possessed large quantity of cocaine for distribution, as evidenced by professional packaging, quantity, and defendant\'s fingerprints on packages.',
          defenseTheory: 'Unlawful police search violated defendant\'s constitutional rights; defendant had no knowledge of drugs planted in borrowed vehicle by unknown third parties.',
          keyEvidence: [
            'Search warrant and supporting affidavit',
            'Laboratory analysis of cocaine',
            'Defendant\'s fingerprints on packages',
            'K-9 certification records'
          ],
          keyWitnesses: [
            'Arresting Officer Detective Adams',
            'K-9 Handler Officer Martinez',
            'Laboratory technician Dr. Foster',
            'Character witnesses for defendant'
          ]
        }
      }
    ];
  }

  /**
   * Generate all participants for the case
   */
  protected static generateAllParticipants(witnesses: DetailedWitness[], scenario: CaseScenario): Participant[] {
    const participants: Participant[] = [];

    // Add witnesses as participants. Witnesses carry a richer `knowledge` shape
    // (WitnessKnowledge) than the base Participant; downstream consumers detect and
    // use that via structural type guards, so we preserve the objects as-is.
    participants.push(...(witnesses as unknown as Participant[]));

    // Add attorneys
    participants.push(this.generateProsecutor(scenario));
    participants.push(this.generateDefenseAttorney(scenario));

    // Add judge
    participants.push(this.generateJudge(scenario));

    // Add defendant (if not already in witnesses)
    const defendantExists = witnesses.some(w => w.role === 'defendant');
    if (!defendantExists) {
      participants.push(this.generateDefendant(scenario));
    }

    // Add jury members
    participants.push(...this.generateJury());

    // Add court personnel
    participants.push(this.generateCourtClerk());
    participants.push(this.generateBailiff());

    return participants;
  }

  /**
   * Generate prosecutor participant
   */
  protected static generateProsecutor(scenario: CaseScenario): Participant {
    return {
      id: 'prosecutor-1',
      name: 'ADA Jennifer Martinez',
      role: 'prosecutor',
      aiControlled: true,
      llmProvider: {
        provider: 'ollama',
        model: 'llama3.2:3b',
        baseUrl: 'http://localhost:11434',
        temperature: 0.7,
        maxRetries: 3
      },
      personality: {
        assertiveness: 9,
        empathy: 5,
        analyticalThinking: 9,
        emotionalStability: 8,
        openness: 6,
        conscientiousness: 9,
        persuasiveness: 9
      },
      background: {
        age: 36,
        education: 'NYU Law School J.D., Harvard College B.A.',
        experience: '11 years as prosecutor, 5 years in Major Crimes Unit',
        specialization: 'Violent crimes prosecution, white collar crime',
        personalHistory: 'Former federal prosecutor, successful conviction rate of 87%',
        motivations: ['Justice for victims', 'Public safety', 'Career advancement', 'Upholding the law']
      },
      currentMood: 0.7,
      knowledge: [
        'NYS Criminal Procedure Law',
        'Evidence law and trial advocacy',
        'Cross-examination techniques',
        'Jury psychology',
        scenario.trialStrategy.prosecutionTheory
      ],
      objectives: [
        'Prove defendant\'s guilt beyond reasonable doubt',
        'Present compelling evidence narrative',
        'Discredit defense theory',
        'Obtain appropriate sentence'
      ],
      currentLocation: 'courtroom',
      isPresent: true
    };
  }

  /**
   * Generate defense attorney participant
   */
  protected static generateDefenseAttorney(scenario: CaseScenario): Participant {
    return {
      id: 'defense-1',
      name: 'David Chen, Esq.',
      role: 'defense-attorney',
      aiControlled: true,
      llmProvider: {
        provider: 'ollama',
        model: 'qwen2.5:3b',
        baseUrl: 'http://localhost:11434',
        temperature: 0.8,
        maxRetries: 3
      },
      personality: {
        assertiveness: 8,
        empathy: 8,
        analyticalThinking: 9,
        emotionalStability: 7,
        openness: 8,
        conscientiousness: 8,
        persuasiveness: 9
      },
      background: {
        age: 44,
        education: 'Columbia Law School J.D., Yale College B.A.',
        experience: '18 years criminal defense, former public defender',
        specialization: 'Felony defense, appellate practice, constitutional law',
        personalHistory: 'Partner at Chen & Associates, published expert on Fourth Amendment',
        motivations: ['Protecting constitutional rights', 'Client advocacy', 'Justice system integrity']
      },
      currentMood: 0.6,
      knowledge: [
        'Criminal defense strategy',
        'Constitutional law',
        'Search and seizure law',
        'Cross-examination of police',
        scenario.trialStrategy.defenseTheory
      ],
      objectives: [
        'Create reasonable doubt',
        'Challenge prosecution evidence',
        'Present viable defense theory',
        'Minimize client\'s exposure'
      ],
      currentLocation: 'courtroom',
      isPresent: true
    };
  }

  /**
   * Generate judge participant
   */
  protected static generateJudge(scenario: CaseScenario): Participant {
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
        empathy: 6,
        analyticalThinking: 10,
        emotionalStability: 9,
        openness: 7,
        conscientiousness: 10,
        persuasiveness: 7
      },
      background: {
        age: 58,
        education: 'Fordham Law School J.D., St. John\'s University B.A.',
        experience: '12 years on bench, 20 years practicing attorney',
        specialization: 'Criminal law, evidence, trial procedure',
        personalHistory: 'Former prosecutor, appointed to bench 2012',
        motivations: ['Judicial fairness', 'Legal accuracy', 'Court efficiency', 'Justice']
      },
      currentMood: 0.8,
      knowledge: [
        'NYS criminal procedure',
        'Evidence law',
        'Constitutional law',
        'Sentencing guidelines',
        'Trial management'
      ],
      objectives: [
        'Ensure fair trial',
        'Apply law correctly',
        'Maintain courtroom order',
        'Protect constitutional rights'
      ],
      currentLocation: 'courtroom',
      isPresent: true
    };
  }

  /**
   * Generate defendant participant
   */
  protected static generateDefendant(scenario: CaseScenario): Participant {
    const defendantName = scenario.basicInfo.title.split(' v. ')[1] || 'John Doe';
    
    return {
      id: 'defendant-1',
      name: defendantName,
      role: 'defendant',
      aiControlled: true,
      llmProvider: {
        provider: 'ollama',
        model: 'qwen2.5:3b',
        baseUrl: 'http://localhost:11434',
        temperature: 0.6,
        maxRetries: 3
      },
      personality: {
        assertiveness: 4,
        empathy: 6,
        analyticalThinking: 5,
        emotionalStability: 3, // Stress of trial
        openness: 6,
        conscientiousness: 5,
        persuasiveness: 4
      },
      background: {
        age: 29,
        education: 'High school diploma',
        experience: 'Various jobs, currently unemployed',
        personalHistory: scenario.narrative.criminalHistory?.join('; ') || 'No significant criminal history',
        motivations: ['Avoiding conviction', 'Maintaining innocence', 'Protecting family']
      },
      currentMood: 0.3, // Anxious about trial
      knowledge: ['Basic legal rights', 'Facts of the case', 'Personal history'],
      objectives: ['Prove innocence', 'Avoid prison', 'Clear name']
    };
  }

  /**
   * Generate testimony sequences for all witnesses
   */
  protected static generateAllTestimonySequences(
    witnesses: DetailedWitness[], 
    evidenceList: any[]
  ): TestimonySequence[] {
    const sequences: TestimonySequence[] = [];

    witnesses.forEach(witness => {
      // Determine which side calls the witness
      const isDefenseWitness = witness.witnessType === 'character' || 
                              witness.relationshipToParties['defendant-1']?.includes('mentor');
      
      const directExaminer = isDefenseWitness ? 'Defense Attorney' : 'Prosecutor';
      const crossExaminer = isDefenseWitness ? 'Prosecutor' : 'Defense Attorney';

      const sequence = TestimonyGenerator.generateCompleteTestimony(
        witness, 
        directExaminer, 
        crossExaminer, 
        evidenceList
      );

      sequences.push(sequence);
    });

    return sequences;
  }
}
