import { CriminalCharge, CrimeType, CrimeCategory } from '../types/caseTypes';

/**
 * New York State Criminal Charges based on New York Penal Law (NYPL)
 * Classifications: A-E Felonies, A-B Misdemeanors, Violations
 * Includes proper sentencing guidelines under NYS law
 */

export interface NYSCriminalCharge extends CriminalCharge {
  nyplSection: string;
  classification: 'A-I Felony' | 'A-II Felony' | 'B Felony' | 'C Felony' | 'D Felony' | 'E Felony' | 'A Misdemeanor' | 'B Misdemeanor' | 'Violation';
  determinateSentencing: boolean;
  youthfulOffenderEligible: boolean;
  drugOffenderEligible?: boolean;
  persistentFelonyOffender?: boolean;
  mandatoryMinimum?: string;
  rockfellerDrugLaw?: boolean;
}

export const nysCriminalCharges: Record<string, NYSCriminalCharge> = {
  // ARTICLE 125 - HOMICIDE
  'murder-first': {
    id: 'murder-first-nys',
    crimeType: 'murder-first' as CrimeType,
    category: 'felony' as CrimeCategory,
    classification: 'A-I Felony',
    title: 'Murder in the First Degree',
    description: 'Intentional murder with aggravating circumstances including murder of police officer, judge, witness, or during commission of specified felonies',
    nyplSection: 'NYPL § 125.27',
    statuteReference: 'NY Penal Law § 125.27',
    elements: [
      'With intent to cause death of another person',
      'Causes the death of such person or third person',
      'AND victim was police officer, peace officer engaged in official duties',
      'OR murder committed during specified felonies (robbery, burglary, kidnapping, arson, rape, etc.)',
      'OR murder for hire',
      'OR defendant previously convicted of murder',
      'OR victim was witness to crime and killed to prevent testimony'
    ],
    minimumSentence: 'Life imprisonment without parole OR Death penalty',
    maximumSentence: 'Life imprisonment without parole OR Death penalty',
    determinateSentencing: false,
    fineRange: { min: 0, max: 0 }, // No fines for A-I felonies
    probationEligible: false,
    enhancementFactors: [
      'Multiple victims',
      'Torture',
      'Terrorism',
      'Killing of pregnant woman knowing of pregnancy'
    ],
    juvenileEligible: false,
    youthfulOffenderEligible: false,
    capitalEligible: true,
    mandatoryMinimum: 'Life without parole'
  },

  'murder-second': {
    id: 'murder-second-nys',
    crimeType: 'murder-second' as CrimeType,
    category: 'felony' as CrimeCategory,
    classification: 'A-II Felony',
    title: 'Murder in the Second Degree',
    description: 'Intentional murder or depraved indifference murder',
    nyplSection: 'NYPL § 125.25',
    statuteReference: 'NY Penal Law § 125.25',
    elements: [
      'With intent to cause death of another person, causes death of such person or third person',
      'OR under circumstances evincing depraved indifference to human life, recklessly engages in conduct creating grave risk of death and causes death'
    ],
    minimumSentence: '15 years to life',
    maximumSentence: '25 years to life',
    determinateSentencing: false,
    fineRange: { min: 0, max: 0 },
    probationEligible: false,
    enhancementFactors: [
      'Use of firearm',
      'Multiple victims',
      'Victim under 14 years old'
    ],
    juvenileEligible: true,
    youthfulOffenderEligible: false,
    capitalEligible: false,
    mandatoryMinimum: '15 years to life'
  },

  'manslaughter-first': {
    id: 'manslaughter-first-nys',
    crimeType: 'manslaughter-first' as CrimeType,
    category: 'felony' as CrimeCategory,
    classification: 'B Felony',
    title: 'Manslaughter in the First Degree',
    description: 'Intentional killing under extreme emotional disturbance',
    nyplSection: 'NYPL § 125.20',
    statuteReference: 'NY Penal Law § 125.20',
    elements: [
      'With intent to cause serious physical injury to another person',
      'Causes death of such person or third person',
      'OR with intent to cause death of another person, causes death under extreme emotional disturbance'
    ],
    minimumSentence: '5 years',
    maximumSentence: '25 years',
    determinateSentencing: true,
    fineRange: { min: 0, max: 5000 },
    probationEligible: false,
    enhancementFactors: ['Use of weapon', 'Prior violent felony'],
    juvenileEligible: true,
    youthfulOffenderEligible: true,
    capitalEligible: false
  },

  // ARTICLE 160 - ROBBERY
  'robbery-first': {
    id: 'robbery-first-nys',
    crimeType: 'robbery-first' as CrimeType,
    category: 'felony' as CrimeCategory,
    classification: 'B Felony',
    title: 'Robbery in the First Degree',
    description: 'Robbery with serious physical injury, deadly weapon, or dangerous instrument',
    nyplSection: 'NYPL § 160.15',
    statuteReference: 'NY Penal Law § 160.15',
    elements: [
      'Forcibly steals property',
      'AND in the course of commission causes serious physical injury to non-participant',
      'OR is armed with deadly weapon',
      'OR uses or threatens immediate use of dangerous instrument',
      'OR displays what appears to be pistol, revolver, rifle, shotgun, machine gun or other firearm'
    ],
    minimumSentence: '5 years',
    maximumSentence: '25 years',
    determinateSentencing: true,
    fineRange: { min: 0, max: 5000 },
    probationEligible: false,
    enhancementFactors: [
      'Firearm possession',
      'Multiple victims',
      'Serious physical injury caused'
    ],
    juvenileEligible: true,
    youthfulOffenderEligible: true,
    capitalEligible: false,
    mandatoryMinimum: '5 years'
  },

  'robbery-second': {
    id: 'robbery-second-nys',
    crimeType: 'robbery-second' as CrimeType,
    category: 'felony' as CrimeCategory,
    classification: 'C Felony',
    title: 'Robbery in the Second Degree',
    description: 'Robbery aided by another person or causing physical injury',
    nyplSection: 'NYPL § 160.10',
    statuteReference: 'NY Penal Law § 160.10',
    elements: [
      'Forcibly steals property',
      'AND is aided by another person actually present',
      'OR in course of commission or immediate flight causes physical injury to non-participant'
    ],
    minimumSentence: '3.5 years',
    maximumSentence: '15 years',
    determinateSentencing: true,
    fineRange: { min: 0, max: 5000 },
    probationEligible: false,
    enhancementFactors: ['Multiple participants', 'Physical injury'],
    juvenileEligible: true,
    youthfulOffenderEligible: true,
    capitalEligible: false
  },

  'robbery-third': {
    id: 'robbery-third-nys',
    crimeType: 'robbery-third' as CrimeType,
    category: 'felony' as CrimeCategory,
    classification: 'D Felony',
    title: 'Robbery in the Third Degree',
    description: 'Forcible stealing of property',
    nyplSection: 'NYPL § 160.05',
    statuteReference: 'NY Penal Law § 160.05',
    elements: [
      'Forcibly steals property'
    ],
    minimumSentence: '2-3 years',
    maximumSentence: '7 years',
    determinateSentencing: true,
    fineRange: { min: 0, max: 5000 },
    probationEligible: true,
    enhancementFactors: ['Prior felony conviction', 'Value of property'],
    juvenileEligible: true,
    youthfulOffenderEligible: true,
    capitalEligible: false
  },

  // ARTICLE 220 - CONTROLLED SUBSTANCES
  'drug-possession-a1': {
    id: 'drug-possession-a1-nys',
    crimeType: 'drug-possession-a1' as CrimeType,
    category: 'felony' as CrimeCategory,
    classification: 'A-I Felony',
    title: 'Criminal Possession of a Controlled Substance in the First Degree',
    description: 'Possession of large quantities of narcotics',
    nyplSection: 'NYPL § 220.21',
    statuteReference: 'NY Penal Law § 220.21',
    elements: [
      'Knowingly and unlawfully possesses narcotic drug',
      'With intent to sell and aggregate weight 8+ ounces',
      'OR methadone 2,880+ milligrams with intent to sell',
      'OR stimulant 10+ ounces with intent to sell'
    ],
    minimumSentence: '15-25 years to life',
    maximumSentence: '15-25 years to life',
    determinateSentencing: false,
    fineRange: { min: 0, max: 100000 },
    probationEligible: false,
    enhancementFactors: ['School grounds', 'Near playground'],
    juvenileEligible: false,
    youthfulOffenderEligible: false,
    capitalEligible: false,
    rockfellerDrugLaw: true,
    drugOffenderEligible: true,
    mandatoryMinimum: '15 years to life'
  },

  // ARTICLE 155 - LARCENY
  'grand-larceny-fourth': {
    id: 'grand-larceny-fourth-nys',
    crimeType: 'theft-grand' as CrimeType,
    category: 'felony' as CrimeCategory,
    classification: 'E Felony',
    title: 'Grand Larceny in the Fourth Degree',
    description: 'Theft of property exceeding $1,000 or specific items regardless of value',
    nyplSection: 'NYPL § 155.30',
    statuteReference: 'NY Penal Law § 155.30',
    elements: [
      'Steals property',
      'AND value exceeds $1,000',
      'OR property consists of public record, writing or instrument',
      'OR property consists of secret scientific material',
      'OR property consists of credit card or debit card',
      'OR property obtained by extortion'
    ],
    minimumSentence: '1-3 years',
    maximumSentence: '4 years',
    determinateSentencing: true,
    fineRange: { min: 0, max: 5000 },
    probationEligible: true,
    enhancementFactors: ['Prior larceny conviction', 'Organized retail theft'],
    juvenileEligible: true,
    youthfulOffenderEligible: true,
    capitalEligible: false
  },

  'petit-larceny': {
    id: 'petit-larceny-nys',
    crimeType: 'theft-petty' as CrimeType,
    category: 'misdemeanor' as CrimeCategory,
    classification: 'A Misdemeanor',
    title: 'Petit Larceny',
    description: 'Theft of property not exceeding $1,000',
    nyplSection: 'NYPL § 155.25',
    statuteReference: 'NY Penal Law § 155.25',
    elements: [
      'Steals property'
    ],
    minimumSentence: 'Up to 1 year',
    maximumSentence: '1 year',
    determinateSentencing: true,
    fineRange: { min: 0, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['Prior larceny conviction'],
    juvenileEligible: true,
    youthfulOffenderEligible: true,
    capitalEligible: false
  },

  // ARTICLE 120 - ASSAULT
  'assault-first': {
    id: 'assault-first-nys',
    crimeType: 'assault-aggravated' as CrimeType,
    category: 'felony' as CrimeCategory,
    classification: 'B Felony',
    title: 'Assault in the First Degree',
    description: 'Assault causing serious physical injury with weapon or depraved indifference',
    nyplSection: 'NYPL § 120.10',
    statuteReference: 'NY Penal Law § 120.10',
    elements: [
      'With intent to cause serious physical injury to another person',
      'Causes such injury by means of deadly weapon or dangerous instrument',
      'OR with intent to disfigure another person seriously and permanently',
      'OR under circumstances evincing depraved indifference to human life, recklessly causes serious physical injury'
    ],
    minimumSentence: '5 years',
    maximumSentence: '25 years',
    determinateSentencing: true,
    fineRange: { min: 0, max: 5000 },
    probationEligible: false,
    enhancementFactors: ['Firearm use', 'Peace officer victim', 'Hate crime'],
    juvenileEligible: true,
    youthfulOffenderEligible: true,
    capitalEligible: false
  },

  'assault-second': {
    id: 'assault-second-nys',
    crimeType: 'assault-aggravated' as CrimeType,
    category: 'felony' as CrimeCategory,
    classification: 'D Felony',
    title: 'Assault in the Second Degree',
    description: 'Assault causing serious physical injury or assault with weapon',
    nyplSection: 'NYPL § 120.05',
    statuteReference: 'NY Penal Law § 120.05',
    elements: [
      'With intent to cause serious physical injury, causes such injury',
      'OR with intent to cause physical injury by means of deadly weapon, causes such injury',
      'OR recklessly causes serious physical injury by means of deadly weapon'
    ],
    minimumSentence: '2-3 years',
    maximumSentence: '7 years',
    determinateSentencing: true,
    fineRange: { min: 0, max: 5000 },
    probationEligible: true,
    enhancementFactors: ['Weapon type', 'Victim vulnerability'],
    juvenileEligible: true,
    youthfulOffenderEligible: true,
    capitalEligible: false
  },

  'assault-third': {
    id: 'assault-third-nys',
    crimeType: 'assault-simple' as CrimeType,
    category: 'misdemeanor' as CrimeCategory,
    classification: 'A Misdemeanor',
    title: 'Assault in the Third Degree',
    description: 'Intentional or reckless causing of physical injury',
    nyplSection: 'NYPL § 120.00',
    statuteReference: 'NY Penal Law § 120.00',
    elements: [
      'With intent to cause physical injury to another person, causes such injury',
      'OR recklessly causes physical injury to another person',
      'OR with criminal negligence, causes physical injury by means of deadly weapon'
    ],
    minimumSentence: 'Up to 1 year',
    maximumSentence: '1 year',
    determinateSentencing: true,
    fineRange: { min: 0, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['Domestic violence', 'Repeat offense'],
    juvenileEligible: true,
    youthfulOffenderEligible: true,
    capitalEligible: false
  }
};

/**
 * Generate appropriate NYS criminal charges based on case facts
 */
export function generateNYSChargesFromFacts(facts: string[]): NYSCriminalCharge[] {
  const charges: NYSCriminalCharge[] = [];
  const factText = facts.join(' ').toLowerCase();

  // Analyze facts for murder/homicide
  if (factText.includes('killed') || factText.includes('death') || factText.includes('murder')) {
    if (factText.includes('police') || factText.includes('officer')) {
      charges.push(nysCriminalCharges['murder-first']);
    } else if (factText.includes('intentional') || factText.includes('planned')) {
      charges.push(nysCriminalCharges['murder-second']);
    } else {
      charges.push(nysCriminalCharges['manslaughter-first']);
    }
  }

  // Analyze for robbery
  if (factText.includes('robbery') || factText.includes('forcibly') && factText.includes('property')) {
    if (factText.includes('weapon') || factText.includes('gun') || factText.includes('knife')) {
      charges.push(nysCriminalCharges['robbery-first']);
    } else if (factText.includes('injury') || factText.includes('aided')) {
      charges.push(nysCriminalCharges['robbery-second']);
    } else {
      charges.push(nysCriminalCharges['robbery-third']);
    }
  }

  // Analyze for theft/larceny
  if (factText.includes('theft') || factText.includes('stole') || factText.includes('stolen')) {
    if (factText.includes('over $1000') || factText.includes('over 1000') || factText.includes('credit card')) {
      charges.push(nysCriminalCharges['grand-larceny-fourth']);
    } else {
      charges.push(nysCriminalCharges['petit-larceny']);
    }
  }

  // Analyze for assault
  if (factText.includes('assault') || factText.includes('attacked') || factText.includes('beat')) {
    if (factText.includes('serious') && factText.includes('injury') && factText.includes('weapon')) {
      charges.push(nysCriminalCharges['assault-first']);
    } else if (factText.includes('serious') || factText.includes('weapon')) {
      charges.push(nysCriminalCharges['assault-second']);
    } else if (factText.includes('injury')) {
      charges.push(nysCriminalCharges['assault-third']);
    }
  }

  // Analyze for drug offenses
  if (factText.includes('drugs') || factText.includes('narcotics') || factText.includes('cocaine') || factText.includes('heroin')) {
    if (factText.includes('8 ounces') || factText.includes('large quantity') || factText.includes('selling')) {
      charges.push(nysCriminalCharges['drug-possession-a1']);
    }
  }

  // If no specific charges found, default to appropriate charge based on general facts
  if (charges.length === 0) {
    if (factText.includes('property') || factText.includes('missing')) {
      charges.push(nysCriminalCharges['petit-larceny']);
    }
  }

  return charges;
}

/**
 * Get sentencing recommendations based on NYS guidelines
 */
export function getNYSSentencingRecommendation(charge: NYSCriminalCharge, priorRecord: boolean = false, circumstances: string[] = []): string {
  let recommendation = `For ${charge.title}, the defendant faces `;

  if (charge.determinateSentencing) {
    recommendation += `a determinate sentence of ${charge.minimumSentence} to ${charge.maximumSentence}.`;
  } else {
    recommendation += `an indeterminate sentence of ${charge.minimumSentence}.`;
  }

  if (charge.mandatoryMinimum) {
    recommendation += ` This charge carries a mandatory minimum of ${charge.mandatoryMinimum}.`;
  }

  if (priorRecord) {
    recommendation += ` Given the defendant's prior criminal record, enhanced penalties may apply.`;
  }

  if (charge.rockfellerDrugLaw) {
    recommendation += ` This offense is subject to the Rockefeller Drug Laws, limiting judicial discretion in sentencing.`;
  }

  return recommendation;
}