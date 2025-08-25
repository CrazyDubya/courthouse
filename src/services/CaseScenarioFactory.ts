import { Case, Participant } from '../types';
import { EnhancedCase } from '../types/caseTypes';
import { nysCriminalCharges, NYSCriminalCharge, generateNYSChargesFromFacts } from '../data/NYSCriminalCharges';
import { EvidenceFactory, EvidenceContext } from './EvidenceFactory';
import { WitnessFactory, DetailedWitness } from './WitnessFactory';
import { TestimonyGenerator, TestimonySequence } from './TestimonyGenerator';

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

export class CaseScenarioFactory {

  /**
   * Generate replacement case based on type
   */
  static generateReplacementCase(caseType?: string, category?: 'criminal' | 'civil'): EnhancedCase {
    if (category === 'civil') {
      return this.generateNYSCivilCase(caseType);
    }
    return this.generateNYSCriminalCase(caseType);
  }

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
    const enhancedCase: EnhancedCase = {
      id: `nys-civil-${Date.now()}`,
      title: scenario.basicInfo.title,
      type: 'civil',
      legalSystem: 'common-law',
      summary: scenario.narrative.summary,
      facts: scenario.narrative.detailedFacts,
      civil: {
        baseType: 'civil',
        causeOfAction: scenario.legalIssues.chargesOrClaims[0] || 'negligence',
        burdenOfProof: 'preponderance',
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

    return enhancedCase;
  }

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
    const enhancedCase: EnhancedCase = {
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
        defendantCustodyStatus: Math.random() > 0.3 ? 'released-bail' : 'remanded',
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

    return enhancedCase;
  }

  /**
   * Select a case scenario based on type or randomly
   */
  private static selectCaseScenario(caseType?: string): CaseScenario {
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
  private static getCaseScenarios(): CaseScenario[] {
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
  private static generateAllParticipants(witnesses: DetailedWitness[], scenario: CaseScenario): Participant[] {
    const participants: Participant[] = [];

    // Add witnesses as participants
    participants.push(...witnesses);

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
  private static generateProsecutor(scenario: CaseScenario): Participant {
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
  private static generateDefenseAttorney(scenario: CaseScenario): Participant {
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
  private static generateJudge(scenario: CaseScenario): Participant {
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
  private static generateDefendant(scenario: CaseScenario): Participant {
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
   * Generate jury members
   */
  private static generateJury(): Participant[] {
    const jurors: Participant[] = [];
    const names = [
      'Margaret Wu', 'Robert Jackson', 'Carmen Rodriguez', 'David Kim',
      'Lisa Thompson', 'Michael O\'Brien', 'Janet Williams', 'Steven Park',
      'Maria Gonzalez', 'James Murphy', 'Angela Davis', 'Thomas Lee'
    ];

    for (let i = 0; i < 12; i++) {
      jurors.push({
        id: `juror-${i + 1}`,
        name: names[i],
        role: 'jury-member',
        aiControlled: true,
        llmProvider: {
          provider: 'ollama',
          model: i < 6 ? 'llama3.2:3b' : 'smollm2:1.7b',
          baseUrl: 'http://localhost:11434',
          temperature: 0.5
        },
        personality: {
          assertiveness: Math.random() * 10,
          empathy: Math.random() * 10,
          analyticalThinking: Math.random() * 10,
          emotionalStability: Math.random() * 10,
          openness: Math.random() * 10,
          conscientiousness: Math.random() * 10,
          persuasiveness: Math.random() * 10
        },
        background: {
          age: 25 + Math.floor(Math.random() * 40),
          education: ['High school', 'Some college', 'Bachelor\'s degree', 'Graduate degree'][Math.floor(Math.random() * 4)],
          experience: ['Various occupations', 'Professional worker', 'Service industry', 'Retired'][Math.floor(Math.random() * 4)],
          personalHistory: 'Typical citizen called for jury duty',
          motivations: ['Civic duty', 'Fair judgment', 'Following evidence']
        },
        currentMood: 0.6,
        knowledge: ['Common sense', 'Life experience', 'Jury instructions'],
        objectives: ['Listen to evidence', 'Apply law as instructed', 'Reach fair verdict']
      });
    }

    return jurors;
  }

  /**
   * Generate court clerk
   */
  private static generateCourtClerk(): Participant {
    return {
      id: 'clerk-1',
      name: 'Ms. Patricia Rivera',
      role: 'court-clerk',
      aiControlled: true,
      personality: {
        assertiveness: 5,
        empathy: 7,
        analyticalThinking: 8,
        emotionalStability: 8,
        openness: 6,
        conscientiousness: 10,
        persuasiveness: 4
      },
      background: {
        age: 42,
        education: 'Paralegal certificate, Associate\'s degree',
        experience: '15 years as court clerk in criminal division',
        personalHistory: 'Expert in court procedures and record keeping',
        motivations: ['Accurate record keeping', 'Efficient court operations']
      },
      currentMood: 0.7,
      knowledge: ['Court procedures', 'Legal documentation', 'Case management'],
      objectives: ['Maintain accurate records', 'Support court proceedings']
    };
  }

  /**
   * Generate bailiff
   */
  private static generateBailiff(): Participant {
    return {
      id: 'bailiff-1',
      name: 'Officer Raymond Torres',
      role: 'bailiff',
      aiControlled: true,
      personality: {
        assertiveness: 8,
        empathy: 5,
        analyticalThinking: 6,
        emotionalStability: 9,
        openness: 4,
        conscientiousness: 9,
        persuasiveness: 3
      },
      background: {
        age: 51,
        education: 'Police academy, Associate\'s degree Criminal Justice',
        experience: '12 years court bailiff, 18 years law enforcement',
        personalHistory: 'Former NYPD patrol officer, expert in courtroom security',
        motivations: ['Courtroom security', 'Order maintenance', 'Public safety']
      },
      currentMood: 0.8,
      knowledge: ['Security procedures', 'Court protocols', 'Crowd control'],
      objectives: ['Maintain courtroom security', 'Protect all participants', 'Ensure order']
    };
  }

  /**
   * Generate testimony sequences for all witnesses
   */
  private static generateAllTestimonySequences(
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

  /**
   * Generate civil case scenarios
   */
  private static selectCivilCaseScenario(caseType?: string): CaseScenario {
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
   * Civil case scenarios
   */
  private static getCivilScenarios(): CaseScenario[] {
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
   * Convert witness to participant
   */
  private static convertWitnessToParticipant(witness: DetailedWitness): Participant {
    return {
      id: witness.id,
      name: witness.name,
      role: witness.role as any, // Cast to participant role
      aiControlled: true,
      llmProvider: {
        provider: 'ollama',
        model: 'qwen2.5:3b',
        baseUrl: 'http://localhost:11434',
        temperature: 0.6,
        maxRetries: 3
      },
      personality: {
        assertiveness: Math.random() * 10,
        empathy: Math.random() * 10,
        analyticalThinking: Math.random() * 10,
        emotionalStability: Math.random() * 10,
        openness: Math.random() * 10,
        conscientiousness: Math.random() * 10,
        persuasiveness: Math.random() * 10,
      },
      background: {
        age: 25 + Math.floor(Math.random() * 40),
        education: witness.background || 'High school diploma',
        experience: witness.occupation || 'Various experience',
        personalHistory: witness.relationship || 'Community member',
        motivations: ['Tell the truth', 'Fulfill civic duty'],
      },
      currentMood: witness.credibility.factors.sincerity / 10,
      knowledge: ['Personal experience', 'Relevant events'],
      objectives: ['Provide truthful testimony', 'Answer questions clearly']
    };
  }

  /**
   * Generate civil case participants
   */
  private static generateCivilParticipants(witnesses: DetailedWitness[], scenario: CaseScenario): Participant[] {
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
   * Generate discovery requests with proper sequestration
   */
  private static generateDiscoveryRequests(party: 'plaintiff' | 'defendant'): any[] {
    const baseRequests = [
      'Request for Production of Documents',
      'Interrogatories',
      'Request for Admissions',
      'Deposition Notices'
    ];

    return baseRequests.map((request, index) => ({
      id: `${party}-discovery-${index + 1}`,
      type: request,
      requestingParty: party,
      status: 'pending',
      deadline: new Date(Date.now() + (30 + index * 15) * 24 * 60 * 60 * 1000).toISOString(),
      sequestrationLevel: this.determineSequestrationLevel(request),
      accessibleTo: this.determineAccessRights(request, party)
    }));
  }

  /**
   * Determine evidence sequestration level
   */
  private static determineSequestrationLevel(requestType: string): 'public' | 'attorneys-only' | 'protective-order' {
    if (requestType.includes('Medical') || requestType.includes('Financial')) {
      return 'protective-order';
    }
    if (requestType.includes('Expert') || requestType.includes('Privilege')) {
      return 'attorneys-only';
    }
    return 'public';
  }

  /**
   * Determine who can access discovery materials
   */
  private static determineAccessRights(requestType: string, requestingParty: string): string[] {
    const baseAccess = [`${requestingParty}-attorney`, 'judge'];
    
    if (this.determineSequestrationLevel(requestType) === 'public') {
      baseAccess.push('opposing-attorney', 'jury');
    } else if (this.determineSequestrationLevel(requestType) === 'attorneys-only') {
      baseAccess.push('opposing-attorney');
    }
    
    return baseAccess;
  }

  private static generatePlaintiffAttorney(scenario: CaseScenario): Participant {
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

  private static generateDefendantAttorney(scenario: CaseScenario): Participant {
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

  private static generateCivilJudge(scenario: CaseScenario): Participant {
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

  private static generatePlaintiff(scenario: CaseScenario): Participant {
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