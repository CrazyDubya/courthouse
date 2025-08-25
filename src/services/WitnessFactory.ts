import { Participant, PersonalityTraits, Background } from '../types';
import { EvidenceContext } from './EvidenceFactory';

export interface WitnessKnowledge {
  directObservations: string[];
  hearsayKnowledge: string[];
  opinions: string[];
  expertKnowledge?: string[];
  priorInconsistencies?: string[];
  memoryLimitations: string[];
}

export interface WitnessCredibility {
  factors: {
    perception: number; // 1-10 (lighting, distance, obstruction)
    memory: number; // 1-10 (time elapsed, stress, intoxication)
    narration: number; // 1-10 (consistency, detail, plausibility)
    sincerity: number; // 1-10 (bias, interest, demeanor)
  };
  impeachmentRisks: string[];
  strengthFactors: string[];
  biases: string[];
  motivations: string[];
}

export interface DetailedWitness extends Participant {
  witnessType: 'eyewitness' | 'character' | 'expert' | 'victim' | 'police' | 'forensic' | 'family' | 'accomplice';
  knowledge: WitnessKnowledge;
  credibility: WitnessCredibility;
  relationshipToParties: Record<string, string>; // party_id -> relationship
  availabilityForTrial: boolean;
  locationDuringIncident: string;
  priorCriminalRecord?: string[];
  expertQualifications?: string[];
  compensationExpected?: boolean;
}

export class WitnessFactory {
  
  /**
   * Generate a complete witness list for a case
   */
  static generateWitnessPackage(context: EvidenceContext): DetailedWitness[] {
    const witnesses: DetailedWitness[] = [];

    // Essential witnesses for any criminal case
    witnesses.push(...this.generatePoliceWitnesses(context));
    witnesses.push(...this.generateEyewitnesses(context));
    
    if (context.caseType === 'criminal') {
      witnesses.push(...this.generateVictimWitnesses(context));
      witnesses.push(...this.generateForensicWitnesses(context));
    }

    // Character witnesses for defense
    witnesses.push(...this.generateCharacterWitnesses(context));

    // Expert witnesses based on evidence types
    witnesses.push(...this.generateExpertWitnesses(context));

    return witnesses;
  }

  /**
   * Generate police officer witnesses
   */
  private static generatePoliceWitnesses(context: EvidenceContext): DetailedWitness[] {
    const officers: DetailedWitness[] = [];

    // Responding officers
    officers.push({
      id: `officer-torres-${Date.now()}`,
      name: 'Officer Michael Torres',
      role: 'witness',
      witnessType: 'police',
      aiControlled: true,
      personality: this.generatePolicePersonality(),
      background: {
        age: 34,
        education: 'Police Academy (2015), Associate\'s Degree Criminal Justice',
        experience: '8 years NYPD, 4 years patrol, 4 years detective bureau',
        specialization: 'Crime scene processing, suspect apprehension',
        personalHistory: 'Former military (Army MP), decorated officer with 3 commendations',
        motivations: ['Professional duty', 'Public safety', 'Career advancement']
      },
      currentMood: 0.7,
      knowledge: {
        directObservations: [
          'Arrived at scene 10:47 PM in response to 911 call',
          'Observed defendant at scene with visible blood on clothing',
          'Found victim on ground with apparent stab wounds',
          'Defendant stated spontaneously "I didn\'t mean to hurt anyone"',
          'Recovered knife from defendant\'s jacket pocket',
          'Scene secured and evidence preserved'
        ],
        hearsayKnowledge: [
          'Dispatcher reported knife attack in progress',
          'Other officers mentioned defendant seemed intoxicated',
          'Witness at scene told me defendant ran from building'
        ],
        opinions: [
          'Defendant appeared under influence of alcohol or drugs',
          'Scene was consistent with violent struggle',
          'Defendant\'s demeanor showed awareness of wrongdoing'
        ],
        memoryLimitations: [
          'Exact time of arrival within 2-3 minutes',
          'Exact wording of defendant\'s statement may vary slightly',
          'Multiple tasks being performed simultaneously'
        ]
      },
      credibility: {
        factors: {
          perception: 8, // Good lighting, close proximity
          memory: 7,   // Professional training, but stressful situation
          narration: 9, // Detailed notes, professional reporting
          sincerity: 8  // Professional obligation, some pro-prosecution bias
        },
        impeachmentRisks: [
          'Prior excessive force complaint (dismissed)',
          'Minor inconsistency in report vs. testimony timing'
        ],
        strengthFactors: [
          'Professional training in observation',
          'Contemporary notes and reports',
          '8 years experience',
          'No relationship to parties'
        ],
        biases: ['Pro-prosecution', 'Law enforcement solidarity'],
        motivations: ['Professional duty', 'Career advancement', 'Public safety']
      },
      relationshipToParties: {
        'defendant-1': 'Arresting officer',
        'victim-1': 'Responding to call for service'
      },
      availabilityForTrial: true,
      locationDuringIncident: 'En route to scene in patrol car',
      objectives: ['Present accurate testimony', 'Support prosecution case', 'Maintain professional credibility']
    });

    // Detective witness
    officers.push({
      id: `detective-adams-${Date.now()}`,
      name: 'Detective Sarah Adams',
      role: 'witness',
      witnessType: 'police',
      aiControlled: true,
      personality: this.generateDetectivePersonality(),
      background: {
        age: 41,
        education: 'CUNY Bachelor\'s Criminal Justice, NYPD Detective School',
        experience: '15 years NYPD, 8 years detective bureau, specialized in violent crimes',
        specialization: 'Homicide investigation, interview techniques, evidence collection',
        personalHistory: 'Promoted to detective after exemplary patrol performance, solved 78% of assigned cases',
        motivations: ['Justice for victims', 'Professional excellence', 'Solving complex cases']
      },
      currentMood: 0.6,
      knowledge: {
        directObservations: [
          'Conducted search of defendant\'s apartment pursuant to warrant',
          'Recovered additional bloody clothing in bedroom closet',
          'Interviewed defendant after Miranda warnings given',
          'Defendant initially denied involvement, later admitted "pushing" victim',
          'Collected physical evidence including knife and clothing'
        ],
        hearsayKnowledge: [
          'Patrol officers described defendant as uncooperative initially',
          'Crime scene technicians reported blood spatter patterns',
          'Medical examiner preliminary findings'
        ],
        opinions: [
          'Defendant\'s story changed significantly during interview',
          'Physical evidence contradicts defendant\'s claims of self-defense',
          'Defendant showed consciousness of guilt by concealing evidence'
        ],
        memoryLimitations: [
          'Interview conducted over 3 hours - exact sequence may vary',
          'Multiple evidence items processed - specific times approximate'
        ]
      },
      credibility: {
        factors: {
          perception: 9, // Trained investigator
          memory: 8,   // Professional experience, detailed notes
          narration: 9, // Methodical, professional approach
          sincerity: 7  // Professional but some confirmation bias
        },
        impeachmentRisks: [
          'Pressure to close case quickly',
          'Prior case overturned due to Miranda violation (different case)'
        ],
        strengthFactors: [
          '15 years experience',
          'Specialized training',
          'Detailed investigation notes',
          'Systematic evidence collection'
        ],
        biases: ['Pro-prosecution', 'Confirmation bias once theory formed'],
        motivations: ['Case clearance statistics', 'Professional reputation', 'Justice']
      },
      relationshipToParties: {
        'defendant-1': 'Investigating detective',
        'victim-1': 'Case investigator'
      },
      availabilityForTrial: true,
      locationDuringIncident: 'Off duty at home, called in later',
      objectives: ['Present thorough investigation', 'Support case theory', 'Maintain professional credibility']
    });

    return officers;
  }

  /**
   * Generate civilian eyewitnesses
   */
  private static generateEyewitnesses(context: EvidenceContext): DetailedWitness[] {
    return [
      {
        id: `eyewitness-martinez-${Date.now()}`,
        name: 'Rosa Martinez',
        role: 'witness',
        witnessType: 'eyewitness',
        aiControlled: true,
        personality: {
          assertiveness: 6,
          empathy: 8,
          analyticalThinking: 5,
          emotionalStability: 4, // Traumatized by witnessing violence
          openness: 7,
          conscientiousness: 8,
          persuasiveness: 5
        },
        background: {
          age: 52,
          education: 'High school diploma, community college courses',
          experience: 'Works as home health aide, lived in neighborhood 20 years',
          personalHistory: 'Single mother, raised 3 children, active in community church',
          motivations: ['Civic duty', 'Justice', 'Community safety', 'Fear of retaliation']
        },
        currentMood: 0.3, // Nervous about testifying
        knowledge: {
          directObservations: [
            'Was walking home from grocery store around 10:30 PM',
            'Heard shouting from alley between buildings',
            'Saw two men struggling near dumpster',
            'Recognized defendant from neighborhood - seen him before',
            'Saw defendant strike victim multiple times',
            'Victim fell to ground, defendant ran toward main street',
            'Called 911 immediately after'
          ],
          hearsayKnowledge: [
            'Neighbors said defendant has been "acting strange" lately',
            'Store owner mentioned thefts in area recently'
          ],
          opinions: [
            'Defendant was definitely the aggressor',
            'Victim was trying to defend himself',
            'Looked like defendant was robbing victim'
          ],
          memoryLimitations: [
            'Lighting was poor - mostly streetlight',
            'Was approximately 40 feet away',
            'Was scared and shaking',
            'Whole incident lasted maybe 2-3 minutes'
          ]
        },
        credibility: {
          factors: {
            perception: 6, // Poor lighting, moderate distance
            memory: 5,   // Traumatic event, some time elapsed
            narration: 7, // Consistent story, good detail
            sincerity: 9  // No apparent bias, civic-minded
          },
          impeachmentRisks: [
            'Vision problems - needs reading glasses',
            'Was carrying heavy groceries',
            'Initial 911 call described "fight" not "attack"'
          ],
          strengthFactors: [
            'Long-time neighborhood resident',
            'No relationship to parties',
            'Called 911 immediately',
            'Consistent statements over time'
          ],
          biases: ['Pro-victim sympathy', 'Anti-violence community values'],
          motivations: ['Justice', 'Community safety', 'Civic duty', 'Fear']
        },
        relationshipToParties: {
          'defendant-1': 'Neighborhood resident - seen him around',
          'victim-1': 'No prior relationship'
        },
        availabilityForTrial: true,
        locationDuringIncident: 'Walking home on sidewalk near scene',
        objectives: ['Tell the truth', 'Protect community', 'Not be intimidated']
      },
      {
        id: `eyewitness-park-${Date.now()}`,
        name: 'James Park',
        role: 'witness',
        witnessType: 'eyewitness',
        aiControlled: true,
        personality: {
          assertiveness: 7,
          empathy: 5,
          analyticalThinking: 8,
          emotionalStability: 6,
          openness: 6,
          conscientiousness: 7,
          persuasiveness: 6
        },
        background: {
          age: 28,
          education: 'Bachelor\'s degree in Engineering, NYU',
          experience: 'Software developer, moved to area 2 years ago',
          personalHistory: 'Lives alone, works from home, good observer of details',
          motivations: ['Truth', 'Justice', 'Civic responsibility']
        },
        currentMood: 0.6,
        knowledge: {
          directObservations: [
            'Was on fire escape smoking cigarette around 10:25 PM',
            'Had clear view of alley from 3rd floor apartment',
            'Saw defendant approach victim from behind',
            'Victim appeared surprised, turned around quickly',
            'Saw glinting of metal object in defendant\'s hand',
            'Victim raised hands in defensive posture',
            'Defendant made stabbing motions toward victim',
            'Took photos with phone camera but too dark to see clearly'
          ],
          hearsayKnowledge: [
            'Landlord mentioned this alley has had trouble before',
            'Other tenants talked about seeing suspicious activity'
          ],
          opinions: [
            'Defendant definitely initiated the encounter',
            'Victim did not appear to threaten defendant first',
            'Movement was consistent with stabbing motion'
          ],
          memoryLimitations: [
            'Was 3 stories up - about 35 feet away',
            'Some view obstructed by fire escape railings',
            'Phone photos too dark to show detail'
          ]
        },
        credibility: {
          factors: {
            perception: 7, // Good vantage point, unobstructed view
            memory: 8,   // Recent college graduate, good attention to detail
            narration: 8, // Methodical, technical background
            sincerity: 8  // No apparent bias or motive to lie
          },
          impeachmentRisks: [
            'Was smoking marijuana (may affect credibility)',
            'Phone photos don\'t clearly show what he describes'
          ],
          strengthFactors: [
            'Excellent vantage point',
            'Technical/engineering background - detail-oriented',
            'No relationship to either party',
            'Attempted to document with photos'
          ],
          biases: ['None apparent'],
          motivations: ['Truth', 'Civic duty', 'Justice']
        },
        relationshipToParties: {
          'defendant-1': 'No prior relationship',
          'victim-1': 'No prior relationship'
        },
        availabilityForTrial: true,
        locationDuringIncident: 'On fire escape of apartment building',
        objectives: ['Provide accurate testimony', 'Fulfill civic duty']
      }
    ];
  }

  /**
   * Generate victim witnesses
   */
  private static generateVictimWitnesses(context: EvidenceContext): DetailedWitness[] {
    return [
      {
        id: `victim-garcia-${Date.now()}`,
        name: 'Luis Garcia',
        role: 'witness',
        witnessType: 'victim',
        aiControlled: true,
        personality: {
          assertiveness: 4, // Traumatized
          empathy: 7,
          analyticalThinking: 6,
          emotionalStability: 3, // PTSD from attack
          openness: 5,
          conscientiousness: 8,
          persuasiveness: 6
        },
        background: {
          age: 31,
          education: 'High school, trade school certification in HVAC',
          experience: 'HVAC technician, 8 years experience, steady employment',
          personalHistory: 'Married, 2 young children, no criminal record, hardworking family man',
          motivations: ['Justice', 'Family protection', 'Trauma recovery']
        },
        currentMood: 0.3, // Still traumatized
        knowledge: {
          directObservations: [
            'Was walking home from work around 10:30 PM',
            'Defendant approached from behind without warning',
            'Defendant demanded money and phone',
            'I handed over wallet immediately to avoid confrontation',
            'Defendant appeared agitated, pupils dilated',
            'Defendant stabbed me even after I complied',
            'Felt burning pain in chest and abdomen',
            'Fell to ground, defendant ran away',
            'Remember sirens and paramedics arriving'
          ],
          hearsayKnowledge: [
            'Police told me I lost a lot of blood',
            'Doctor said knife missed vital organs by inches'
          ],
          opinions: [
            'Defendant seemed like he was on drugs',
            'Attack was unprovoked - I cooperated fully',
            'Defendant intended to hurt me regardless of compliance'
          ],
          memoryLimitations: [
            'Was in shock and losing blood',
            'Some memory gaps from trauma',
            'Pain medication affects recall of hospital period'
          ]
        },
        credibility: {
          factors: {
            perception: 7, // Close proximity, direct involvement
            memory: 6,   // Trauma can affect memory
            narration: 7, // Victim of crime, compelling witness
            sincerity: 9  // Genuine victim, no apparent motive to lie
          },
          impeachmentRisks: [
            'Memory gaps from trauma',
            'Pain medication affecting recall',
            'Emotional state may affect accuracy'
          ],
          strengthFactors: [
            'Direct victim with no motive to lie',
            'Compelling personal account',
            'Physical injuries corroborate testimony',
            'Consistent statements from incident to trial'
          ],
          biases: ['Strong bias against defendant', 'Desire for justice'],
          motivations: ['Justice', 'Closure', 'Protection of family']
        },
        relationshipToParties: {
          'defendant-1': 'Victim of attack',
        },
        availabilityForTrial: true,
        locationDuringIncident: 'Walking on sidewalk when attacked',
        objectives: ['Obtain justice', 'Tell truth about attack', 'Prevent future victimization']
      }
    ];
  }

  /**
   * Generate forensic witnesses
   */
  private static generateForensicWitnesses(context: EvidenceContext): DetailedWitness[] {
    return [
      {
        id: `medical-examiner-${Date.now()}`,
        name: 'Dr. Patricia Chen',
        role: 'witness',
        witnessType: 'expert',
        aiControlled: true,
        personality: this.generateExpertPersonality(),
        background: {
          age: 47,
          education: 'MD from Columbia, Forensic Pathology Fellowship at NYU',
          experience: '18 years forensic pathology, Chief Medical Examiner 5 years',
          specialization: 'Forensic pathology, cause and manner of death determination',
          personalHistory: 'Published researcher, testified in over 200 cases',
          motivations: ['Scientific accuracy', 'Justice through forensic science', 'Professional reputation']
        },
        currentMood: 0.8, // Professional confidence
        knowledge: {
          directObservations: [
            'Performed autopsy on victim within 24 hours of death',
            'Documented 3 stab wounds: 2 to chest, 1 to abdomen',
            'Measured wound depths and angles',
            'Collected trace evidence from wounds',
            'Defensive wounds on victim\'s hands and forearms'
          ],
          expertKnowledge: [
            'Cause of death: Exsanguination from stab wounds',
            'Manner of death: Homicide',
            'Time of death: 10:30 PM ± 30 minutes',
            'Wound patterns consistent with 8-inch knife blade',
            'Force required indicates intent to cause serious injury'
          ],
          opinions: [
            'Wounds were made with significant force',
            'Pattern suggests victim was facing attacker initially',
            'Defensive wounds indicate victim tried to protect himself'
          ],
          memoryLimitations: [
            'Autopsy performed among many others - relies on notes and photos',
            'Time estimates are approximate ranges, not exact'
          ]
        },
        credibility: {
          factors: {
            perception: 10, // Medical training, controlled examination
            memory: 9,    // Professional notes and documentation
            narration: 10, // Expert in field
            sincerity: 9   // Professional obligation, scientific objectivity
          },
          impeachmentRisks: [
            'Heavy caseload may affect attention to detail',
            'Prior testimony challenged in appellate court (different case)'
          ],
          strengthFactors: [
            '18 years experience',
            'Board certified forensic pathologist',
            'Chief Medical Examiner',
            'Published expert',
            'Detailed autopsy notes and photographs'
          ],
          biases: ['Pro-science', 'Professional reputation'],
          motivations: ['Scientific accuracy', 'Professional duty', 'Justice']
        },
        relationshipToParties: {},
        availabilityForTrial: true,
        locationDuringIncident: 'Not present',
        expertQualifications: [
          'MD from Columbia College of Physicians and Surgeons',
          'Forensic Pathology Fellowship NYU Medical Center',
          'Board Certified by American Board of Pathology',
          'Chief Medical Examiner NYC for 5 years',
          'Published 47 peer-reviewed articles',
          'Testified as expert in over 200 cases'
        ],
        objectives: ['Provide accurate scientific testimony', 'Educate jury on forensic findings']
      }
    ];
  }

  /**
   * Generate character witnesses for defense
   */
  private static generateCharacterWitnesses(context: EvidenceContext): DetailedWitness[] {
    return [
      {
        id: `character-witness-${Date.now()}`,
        name: 'Father Miguel Rodriguez',
        role: 'witness',
        witnessType: 'character',
        aiControlled: true,
        personality: {
          assertiveness: 5,
          empathy: 9,
          analyticalThinking: 7,
          emotionalStability: 8,
          openness: 8,
          conscientiousness: 9,
          persuasiveness: 7
        },
        background: {
          age: 58,
          education: 'Seminary degree, Master\'s in Divinity',
          experience: '25 years as parish priest, community outreach coordinator',
          personalHistory: 'Respected community leader, known for work with troubled youth',
          motivations: ['Truth', 'Redemption', 'Community healing', 'Defendant\'s welfare']
        },
        currentMood: 0.6,
        knowledge: {
          directObservations: [
            'Known defendant for 3 years through community center',
            'Defendant volunteered weekly helping elderly parishioners',
            'Never saw defendant act violently or aggressively',
            'Defendant sought counseling for alcohol problems 6 months ago',
            'Defendant was making progress in sobriety program'
          ],
          hearsayKnowledge: [
            'Other volunteers spoke well of defendant\'s character',
            'Community members respected defendant\'s work ethic'
          ],
          opinions: [
            'This behavior is completely out of character',
            'Defendant has potential for rehabilitation',
            'Defendant was struggling with personal problems recently'
          ],
          memoryLimitations: [
            'Interactions were in group settings mostly',
            'Specific dates and times may not be precise'
          ]
        },
        credibility: {
          factors: {
            perception: 8, // Regular interaction, good observation
            memory: 7,   // Many interactions over time
            narration: 9, // Honest, trustworthy reputation
            sincerity: 10 // No motive to lie, moral obligation to truth
          },
          impeachmentRisks: [
            'Did not witness the incident',
            'May not know defendant\'s private life fully',
            'Religious bias toward forgiveness'
          ],
          strengthFactors: [
            'Respected community figure',
            'No personal benefit from testimony',
            'Moral obligation to honesty',
            'Regular contact with defendant over years'
          ],
          biases: ['Forgiveness and redemption', 'Benefit of the doubt'],
          motivations: ['Truth', 'Mercy', 'Defendant\'s rehabilitation']
        },
        relationshipToParties: {
          'defendant-1': 'Community mentor and counselor'
        },
        availabilityForTrial: true,
        locationDuringIncident: 'At parish residence',
        objectives: ['Testify truthfully to defendant\'s character', 'Advocate for rehabilitation']
      }
    ];
  }

  /**
   * Generate expert witnesses
   */
  private static generateExpertWitnesses(context: EvidenceContext): DetailedWitness[] {
    return [
      {
        id: `dna-expert-${Date.now()}`,
        name: 'Dr. Amanda Foster',
        role: 'witness',
        witnessType: 'expert',
        aiControlled: true,
        personality: this.generateExpertPersonality(),
        background: {
          age: 39,
          education: 'PhD Molecular Biology Harvard, Post-doc in Forensic Genetics',
          experience: '12 years DNA analysis, 8 years as laboratory director',
          specialization: 'Forensic DNA analysis, STR typing, mixture interpretation',
          personalHistory: 'Published researcher, testified in over 150 cases nationwide',
          motivations: ['Scientific accuracy', 'Justice through forensics', 'Professional excellence']
        },
        currentMood: 0.8,
        knowledge: {
          expertKnowledge: [
            'Analyzed DNA from blood on murder weapon',
            'Victim\'s DNA profile matches with probability 1 in 7.8 billion',
            'Defendant\'s DNA found under victim\'s fingernails',
            'Statistical probability 1 in 2.1 billion for defendant match',
            'No evidence of contamination or degradation'
          ],
          directObservations: [
            'Received evidence samples with proper chain of custody',
            'Extracted DNA using standard protocols',
            'Generated STR profiles using validated methods',
            'Compared profiles using FBI CODIS database standards'
          ],
          opinions: [
            'DNA evidence is highly reliable when properly collected',
            'Statistical probabilities indicate virtual certainty of matches',
            'Laboratory procedures followed all quality standards'
          ],
          memoryLimitations: [
            'Analysis performed weeks ago - relies on laboratory notes',
            'Multiple samples processed - specific details in reports'
          ]
        },
        credibility: {
          factors: {
            perception: 10, // Laboratory controlled conditions
            memory: 9,    // Detailed laboratory records
            narration: 10, // Scientific expert
            sincerity: 9   // Scientific objectivity
          },
          impeachmentRisks: [
            'Laboratory contamination in other cases (different lab)',
            'Cross-contamination if chain of custody broken'
          ],
          strengthFactors: [
            'PhD in relevant field',
            '12 years specialized experience',
            'Laboratory director credentials',
            'Published expert with peer review',
            'Detailed laboratory protocols'
          ],
          biases: ['Pro-science methodology', 'Professional reputation'],
          motivations: ['Scientific accuracy', 'Professional reputation', 'Justice']
        },
        relationshipToParties: {},
        availabilityForTrial: true,
        locationDuringIncident: 'Not present',
        expertQualifications: [
          'PhD Molecular Biology, Harvard University',
          'Post-doctoral fellowship in Forensic Genetics',
          'Laboratory Director certification',
          'Published 32 peer-reviewed articles on DNA forensics',
          'Testified as DNA expert in over 150 cases',
          'Member of American Society of Crime Laboratory Directors'
        ],
        compensationExpected: true, // Expert witness fee
        objectives: ['Explain DNA evidence clearly', 'Educate jury on statistical significance']
      }
    ];
  }

  /**
   * Generate personality traits for police officers
   */
  private static generatePolicePersonality(): PersonalityTraits {
    return {
      assertiveness: 8,
      empathy: 5,
      analyticalThinking: 7,
      emotionalStability: 7,
      openness: 5,
      conscientiousness: 8,
      persuasiveness: 7
    };
  }

  /**
   * Generate personality traits for detectives
   */
  private static generateDetectivePersonality(): PersonalityTraits {
    return {
      assertiveness: 7,
      empathy: 6,
      analyticalThinking: 9,
      emotionalStability: 8,
      openness: 6,
      conscientiousness: 9,
      persuasiveness: 7
    };
  }

  /**
   * Generate personality traits for expert witnesses
   */
  private static generateExpertPersonality(): PersonalityTraits {
    return {
      assertiveness: 6,
      empathy: 5,
      analyticalThinking: 10,
      emotionalStability: 8,
      openness: 7,
      conscientiousness: 9,
      persuasiveness: 8
    };
  }

  /**
   * Assess witness credibility for jury impact
   */
  static assessOverallCredibility(witness: DetailedWitness): number {
    const factors = witness.credibility.factors;
    const weightedScore = (
      factors.perception * 0.25 +
      factors.memory * 0.25 +
      factors.narration * 0.25 +
      factors.sincerity * 0.25
    );

    // Adjust for impeachment risks
    const riskPenalty = witness.credibility.impeachmentRisks.length * 0.5;
    
    // Adjust for strength factors
    const strengthBonus = witness.credibility.strengthFactors.length * 0.3;

    return Math.max(1, Math.min(10, weightedScore - riskPenalty + strengthBonus));
  }

  /**
   * Generate witness availability and scheduling
   */
  static checkWitnessAvailability(witness: DetailedWitness): {available: boolean, constraints: string[]} {
    const constraints: string[] = [];

    if (witness.witnessType === 'expert') {
      constraints.push('Requires 2 weeks notice for scheduling');
      if (witness.compensationExpected) {
        constraints.push('Expert witness fee required');
      }
    }

    if (witness.witnessType === 'police') {
      constraints.push('Subject to court duty schedule');
    }

    if (witness.currentMood < 0.4) {
      constraints.push('May require victim advocate support');
    }

    return {
      available: witness.availabilityForTrial,
      constraints
    };
  }

  /**
   * Generate impeachment materials for witness
   */
  static generateImpeachmentEvidence(witness: DetailedWitness): string[] {
    const impeachment: string[] = [];

    // Prior inconsistent statements
    if (witness.knowledge.priorInconsistencies) {
      impeachment.push(...witness.knowledge.priorInconsistencies);
    }

    // Character for truthfulness
    if (witness.priorCriminalRecord) {
      witness.priorCriminalRecord.forEach(record => {
        if (record.includes('fraud') || record.includes('perjury') || record.includes('false')) {
          impeachment.push(`Prior conviction for ${record} - affects credibility`);
        }
      });
    }

    // Bias and interest
    witness.credibility.biases.forEach(bias => {
      impeachment.push(`Bias: ${bias}`);
    });

    // Capacity issues
    if (witness.credibility.factors.perception < 5) {
      impeachment.push('Poor perception conditions affect reliability');
    }

    if (witness.credibility.factors.memory < 5) {
      impeachment.push('Memory limitations affect accuracy');
    }

    return impeachment;
  }
}