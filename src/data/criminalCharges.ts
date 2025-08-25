import { CriminalCharge, CrimeType, CrimeCategory } from '../types/caseTypes';

export const criminalCharges: Record<CrimeType, CriminalCharge> = {
  // Theft-related charges
  'theft-grand': {
    id: 'theft-grand-001',
    crimeType: 'theft-grand',
    category: 'felony',
    title: 'Grand Theft',
    description: 'Taking personal property of another valued over $1,000 with intent to permanently deprive',
    statuteReference: 'Penal Code § 487',
    elements: [
      'Taking personal property of another',
      'Property value exceeds $1,000',
      'Intent to permanently deprive owner',
      'Without consent of owner'
    ],
    minimumSentence: '1 year probation',
    maximumSentence: '3 years prison',
    fineRange: { min: 1000, max: 10000 },
    probationEligible: true,
    enhancementFactors: ['Prior theft convictions', 'Value over $50,000', 'Organized retail theft'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'theft-petty': {
    id: 'theft-petty-001',
    crimeType: 'theft-petty',
    category: 'misdemeanor',
    title: 'Petty Theft',
    description: 'Taking personal property of another valued under $1,000 with intent to permanently deprive',
    statuteReference: 'Penal Code § 484',
    elements: [
      'Taking personal property of another',
      'Property value under $1,000',
      'Intent to permanently deprive owner',
      'Without consent of owner'
    ],
    minimumSentence: 'Fine only',
    maximumSentence: '6 months jail',
    fineRange: { min: 50, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['Prior theft convictions', 'Retail theft'],
    juvenileEligible: true,
    capitalEligible: false
  },

  // Assault charges
  'assault-aggravated': {
    id: 'assault-aggravated-001',
    crimeType: 'assault-aggravated',
    category: 'felony',
    title: 'Aggravated Assault',
    description: 'Assault with a deadly weapon or assault causing great bodily injury',
    statuteReference: 'Penal Code § 245',
    elements: [
      'Assault upon another person',
      'Use of deadly weapon OR great bodily injury inflicted',
      'Willful act',
      'Present ability to apply force'
    ],
    minimumSentence: '2 years prison',
    maximumSentence: '4 years prison',
    fineRange: { min: 1000, max: 10000 },
    probationEligible: false,
    enhancementFactors: ['Great bodily injury', 'Firearm use', 'Peace officer victim'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'assault-simple': {
    id: 'assault-simple-001',
    crimeType: 'assault-simple',
    category: 'misdemeanor',
    title: 'Simple Assault',
    description: 'Unlawful attempt to commit violent injury upon another person',
    statuteReference: 'Penal Code § 240',
    elements: [
      'Unlawful attempt to commit violent injury',
      'Present ability to apply force',
      'Awareness of facts that would lead reasonable person to realize act would result in force'
    ],
    minimumSentence: 'Fine only',
    maximumSentence: '6 months jail',
    fineRange: { min: 100, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['Peace officer victim', 'Domestic violence'],
    juvenileEligible: true,
    capitalEligible: false
  },

  // Burglary charges
  'burglary-first-degree': {
    id: 'burglary-first-001',
    crimeType: 'burglary-first-degree',
    category: 'felony',
    title: 'First Degree Burglary',
    description: 'Entering inhabited dwelling with intent to commit theft or felony',
    statuteReference: 'Penal Code § 459',
    elements: [
      'Entry into building or structure',
      'Building was inhabited dwelling',
      'Intent to commit theft or felony',
      'Entry was unlawful'
    ],
    minimumSentence: '2 years prison',
    maximumSentence: '6 years prison',
    fineRange: { min: 1000, max: 10000 },
    probationEligible: false,
    enhancementFactors: ['Occupied dwelling', 'Armed with weapon', 'Great bodily injury'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'burglary-second-degree': {
    id: 'burglary-second-001',
    crimeType: 'burglary-second-degree',
    category: 'felony',
    title: 'Second Degree Burglary',
    description: 'Entering commercial building or uninhabited structure with intent to commit theft or felony',
    statuteReference: 'Penal Code § 459',
    elements: [
      'Entry into building or structure',
      'Building was commercial or uninhabited',
      'Intent to commit theft or felony',
      'Entry was unlawful'
    ],
    minimumSentence: '1 year probation',
    maximumSentence: '3 years prison',
    fineRange: { min: 500, max: 10000 },
    probationEligible: true,
    enhancementFactors: ['Prior burglary convictions', 'Large loss amount'],
    juvenileEligible: true,
    capitalEligible: false
  },

  // Drug offenses
  'possession-controlled-substance': {
    id: 'possession-controlled-001',
    crimeType: 'possession-controlled-substance',
    category: 'misdemeanor',
    title: 'Possession of Controlled Substance',
    description: 'Unlawful possession of controlled substance for personal use',
    statuteReference: 'Health & Safety Code § 11350',
    elements: [
      'Possession of controlled substance',
      'Knowledge of presence and nature of substance',
      'Substance is controlled under law',
      'Possession was unlawful'
    ],
    minimumSentence: 'Fine and/or treatment',
    maximumSentence: '1 year jail',
    fineRange: { min: 100, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['Large quantity', 'Near school', 'Prior drug convictions'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'possession-with-intent': {
    id: 'possession-intent-001',
    crimeType: 'possession-with-intent',
    category: 'felony',
    title: 'Possession with Intent to Distribute',
    description: 'Possession of controlled substance with intent to sell or distribute',
    statuteReference: 'Health & Safety Code § 11351',
    elements: [
      'Possession of controlled substance',
      'Intent to sell or distribute',
      'Knowledge of presence and nature of substance',
      'Substance is controlled under law'
    ],
    minimumSentence: '2 years prison',
    maximumSentence: '4 years prison',
    fineRange: { min: 1000, max: 20000 },
    probationEligible: false,
    enhancementFactors: ['Large quantity', 'Near school', 'Armed with weapon', 'Organized trafficking'],
    juvenileEligible: true,
    capitalEligible: false
  },

  // DUI offenses
  'dui-first': {
    id: 'dui-first-001',
    crimeType: 'dui-first',
    category: 'misdemeanor',
    title: 'Driving Under the Influence - First Offense',
    description: 'Operating motor vehicle while under influence of alcohol or drugs',
    statuteReference: 'Vehicle Code § 23152',
    elements: [
      'Driving or operating motor vehicle',
      'Under influence of alcohol and/or drugs',
      'Blood alcohol content 0.08% or higher OR impairment affecting driving ability'
    ],
    minimumSentence: '3 months probation',
    maximumSentence: '6 months jail',
    fineRange: { min: 390, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['High BAC (0.15+)', 'Refusal to test', 'Accident with injury'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'dui-repeat': {
    id: 'dui-repeat-001',
    crimeType: 'dui-repeat',
    category: 'misdemeanor',
    title: 'Driving Under the Influence - Repeat Offense',
    description: 'Operating motor vehicle while under influence with prior DUI convictions',
    statuteReference: 'Vehicle Code § 23152',
    elements: [
      'Driving or operating motor vehicle',
      'Under influence of alcohol and/or drugs',
      'Blood alcohol content 0.08% or higher OR impairment affecting driving ability',
      'Prior DUI conviction within 10 years'
    ],
    minimumSentence: '90 days jail',
    maximumSentence: '1 year jail',
    fineRange: { min: 390, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['Multiple priors', 'High BAC', 'Refusal to test', 'Accident with injury'],
    juvenileEligible: true,
    capitalEligible: false
  },

  // Fraud offenses
  'fraud-identity': {
    id: 'fraud-identity-001',
    crimeType: 'fraud-identity',
    category: 'felony',
    title: 'Identity Theft',
    description: 'Willfully obtaining personal identifying information of another to commit fraud',
    statuteReference: 'Penal Code § 530.5',
    elements: [
      'Willfully obtaining personal identifying information',
      'Information belonged to another person',
      'Use without permission',
      'Intent to defraud'
    ],
    minimumSentence: '1 year probation',
    maximumSentence: '3 years prison',
    fineRange: { min: 1000, max: 10000 },
    probationEligible: true,
    enhancementFactors: ['Elder victim', 'Large financial loss', 'Organized scheme'],
    juvenileEligible: true,
    capitalEligible: false
  },

  // Placeholder entries for other crime types (to satisfy TypeScript)
  'murder-first-degree': {
    id: 'murder-first-001',
    crimeType: 'murder-first-degree',
    category: 'felony',
    title: 'First Degree Murder',
    description: 'Unlawful killing with premeditation and malice aforethought',
    statuteReference: 'Penal Code § 187',
    elements: ['Unlawful killing', 'Malice aforethought', 'Premeditation', 'Deliberation'],
    minimumSentence: '25 years to life',
    maximumSentence: 'Life without parole or death',
    fineRange: { min: 0, max: 10000 },
    probationEligible: false,
    enhancementFactors: ['Multiple victims', 'Special circumstances', 'Torture'],
    juvenileEligible: false,
    capitalEligible: true
  },

  'murder-second-degree': {
    id: 'murder-second-001',
    crimeType: 'murder-second-degree',
    category: 'felony',
    title: 'Second Degree Murder',
    description: 'Unlawful killing with malice aforethought but without premeditation',
    statuteReference: 'Penal Code § 187',
    elements: ['Unlawful killing', 'Malice aforethought', 'No premeditation'],
    minimumSentence: '15 years to life',
    maximumSentence: 'Life without parole',
    fineRange: { min: 0, max: 10000 },
    probationEligible: false,
    enhancementFactors: ['Use of firearm', 'Gang enhancement'],
    juvenileEligible: false,
    capitalEligible: false
  },

  'manslaughter': {
    id: 'manslaughter-001',
    crimeType: 'manslaughter',
    category: 'felony',
    title: 'Voluntary Manslaughter',
    description: 'Unlawful killing in heat of passion without malice aforethought',
    statuteReference: 'Penal Code § 192',
    elements: ['Unlawful killing', 'Heat of passion', 'Adequate provocation', 'No cooling period'],
    minimumSentence: '3 years prison',
    maximumSentence: '11 years prison',
    fineRange: { min: 1000, max: 10000 },
    probationEligible: false,
    enhancementFactors: ['Use of weapon', 'Prior violence'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'domestic-violence': {
    id: 'domestic-violence-001',
    crimeType: 'domestic-violence',
    category: 'misdemeanor',
    title: 'Domestic Violence',
    description: 'Willful infliction of corporal injury upon intimate partner',
    statuteReference: 'Penal Code § 273.5',
    elements: ['Willful infliction of corporal injury', 'Victim is intimate partner', 'Injury resulted'],
    minimumSentence: 'Probation with counseling',
    maximumSentence: '1 year jail',
    fineRange: { min: 100, max: 6000 },
    probationEligible: true,
    enhancementFactors: ['Great bodily injury', 'Prior domestic violence', 'Strangulation'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'robbery-armed': {
    id: 'robbery-armed-001',
    crimeType: 'robbery-armed',
    category: 'felony',
    title: 'Armed Robbery',
    description: 'Taking personal property by force while armed with weapon',
    statuteReference: 'Penal Code § 211',
    elements: ['Taking personal property', 'From person or presence', 'Force or fear', 'Armed with weapon'],
    minimumSentence: '3 years prison',
    maximumSentence: '9 years prison',
    fineRange: { min: 1000, max: 10000 },
    probationEligible: false,
    enhancementFactors: ['Firearm use', 'Great bodily injury', 'Multiple victims'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'robbery-strong-arm': {
    id: 'robbery-strongarm-001',
    crimeType: 'robbery-strong-arm',
    category: 'felony',
    title: 'Strong Arm Robbery',
    description: 'Taking personal property by force without weapon',
    statuteReference: 'Penal Code § 211',
    elements: ['Taking personal property', 'From person or presence', 'Force or fear', 'No weapon used'],
    minimumSentence: '2 years prison',
    maximumSentence: '5 years prison',
    fineRange: { min: 1000, max: 10000 },
    probationEligible: true,
    enhancementFactors: ['Great bodily injury', 'Multiple victims', 'Elder victim'],
    juvenileEligible: true,
    capitalEligible: false
  },

  // Additional placeholder entries to satisfy all CrimeType values
  'vandalism': {
    id: 'vandalism-001',
    crimeType: 'vandalism',
    category: 'misdemeanor',
    title: 'Vandalism',
    description: 'Maliciously damaging or destroying property of another',
    statuteReference: 'Penal Code § 594',
    elements: ['Maliciously damaging property', 'Property belonged to another', 'Willful act'],
    minimumSentence: 'Fine and restitution',
    maximumSentence: '1 year jail',
    fineRange: { min: 100, max: 10000 },
    probationEligible: true,
    enhancementFactors: ['High damage amount', 'Historic property', 'Repeat offense'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'arson': {
    id: 'arson-001',
    crimeType: 'arson',
    category: 'felony',
    title: 'Arson',
    description: 'Willfully and maliciously setting fire to property',
    statuteReference: 'Penal Code § 451',
    elements: ['Willfully setting fire', 'Malicious intent', 'Property of another or own with intent to defraud'],
    minimumSentence: '2 years prison',
    maximumSentence: '6 years prison',
    fineRange: { min: 1000, max: 50000 },
    probationEligible: false,
    enhancementFactors: ['Inhabited structure', 'Great bodily injury', 'Multiple fires'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'trafficking-drugs': {
    id: 'trafficking-001',
    crimeType: 'trafficking-drugs',
    category: 'felony',
    title: 'Drug Trafficking',
    description: 'Transporting controlled substances for sale',
    statuteReference: 'Health & Safety Code § 11352',
    elements: ['Transporting controlled substances', 'Intent to sell', 'Knowledge of nature', 'Crossing boundaries'],
    minimumSentence: '3 years prison',
    maximumSentence: '5 years prison',
    fineRange: { min: 5000, max: 20000 },
    probationEligible: false,
    enhancementFactors: ['Large quantity', 'Interstate transport', 'Organized operation'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'manufacturing-drugs': {
    id: 'manufacturing-001',
    crimeType: 'manufacturing-drugs',
    category: 'felony',
    title: 'Manufacturing Controlled Substances',
    description: 'Manufacturing or producing controlled substances',
    statuteReference: 'Health & Safety Code § 11379.6',
    elements: ['Manufacturing controlled substances', 'Intent to sell or distribute', 'Use of equipment/chemicals'],
    minimumSentence: '3 years prison',
    maximumSentence: '7 years prison',
    fineRange: { min: 5000, max: 50000 },
    probationEligible: false,
    enhancementFactors: ['Large operation', 'Environmental damage', 'Near schools'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'fraud-credit-card': {
    id: 'fraud-cc-001',
    crimeType: 'fraud-credit-card',
    category: 'felony',
    title: 'Credit Card Fraud',
    description: 'Fraudulent use of credit card or account information',
    statuteReference: 'Penal Code § 484e',
    elements: ['Use of credit card', 'Without consent', 'Intent to defraud', 'Knowledge card was stolen/forged'],
    minimumSentence: '1 year probation',
    maximumSentence: '3 years prison',
    fineRange: { min: 1000, max: 10000 },
    probationEligible: true,
    enhancementFactors: ['Large loss amount', 'Multiple victims', 'Organized scheme'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'fraud-wire': {
    id: 'fraud-wire-001',
    crimeType: 'fraud-wire',
    category: 'felony',
    title: 'Wire Fraud',
    description: 'Using electronic communications to perpetrate fraud',
    statuteReference: '18 USC § 1343',
    elements: ['Scheme to defraud', 'Use of interstate wire communications', 'Intent to defraud', 'Material misrepresentation'],
    minimumSentence: '1 year prison',
    maximumSentence: '20 years prison',
    fineRange: { min: 5000, max: 250000 },
    probationEligible: true,
    enhancementFactors: ['Financial institution victim', 'Large loss', 'Multiple victims'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'embezzlement': {
    id: 'embezzlement-001',
    crimeType: 'embezzlement',
    category: 'felony',
    title: 'Embezzlement',
    description: 'Fraudulent appropriation of property by person in position of trust',
    statuteReference: 'Penal Code § 503',
    elements: ['Property entrusted to defendant', 'Fraudulent appropriation', 'Intent to deprive owner', 'Breach of trust'],
    minimumSentence: '1 year probation',
    maximumSentence: '4 years prison',
    fineRange: { min: 1000, max: 10000 },
    probationEligible: true,
    enhancementFactors: ['Large amount', 'Public employee', 'Vulnerable victim'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'money-laundering': {
    id: 'money-laundering-001',
    crimeType: 'money-laundering',
    category: 'felony',
    title: 'Money Laundering',
    description: 'Conducting financial transactions with proceeds of criminal activity',
    statuteReference: '18 USC § 1956',
    elements: ['Financial transaction', 'Involving proceeds of criminal activity', 'Knowledge of criminal origin', 'Intent to conceal source'],
    minimumSentence: '2 years prison',
    maximumSentence: '20 years prison',
    fineRange: { min: 10000, max: 500000 },
    probationEligible: false,
    enhancementFactors: ['Large amounts', 'International transactions', 'Organized crime'],
    juvenileEligible: false,
    capitalEligible: false
  },

  'reckless-driving': {
    id: 'reckless-driving-001',
    crimeType: 'reckless-driving',
    category: 'misdemeanor',
    title: 'Reckless Driving',
    description: 'Operating vehicle with willful disregard for safety',
    statuteReference: 'Vehicle Code § 23103',
    elements: ['Driving motor vehicle', 'On highway or off-street parking', 'Willful/wanton disregard for safety'],
    minimumSentence: 'Fine only',
    maximumSentence: '90 days jail',
    fineRange: { min: 145, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['Excessive speed', 'Injury caused', 'School zone'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'hit-and-run': {
    id: 'hit-run-001',
    crimeType: 'hit-and-run',
    category: 'felony',
    title: 'Hit and Run with Injury',
    description: 'Leaving scene of accident causing injury without providing information',
    statuteReference: 'Vehicle Code § 20001',
    elements: ['Vehicle accident causing injury', 'Driver aware of accident', 'Failed to stop', 'Failed to provide identification'],
    minimumSentence: '1 year probation',
    maximumSentence: '4 years prison',
    fineRange: { min: 1000, max: 10000 },
    probationEligible: true,
    enhancementFactors: ['Great bodily injury', 'Death', 'Under influence'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'disorderly-conduct': {
    id: 'disorderly-001',
    crimeType: 'disorderly-conduct',
    category: 'misdemeanor',
    title: 'Disorderly Conduct',
    description: 'Engaging in offensive, obscene, or threatening behavior in public',
    statuteReference: 'Penal Code § 647',
    elements: ['Public place', 'Offensive/obscene/threatening behavior', 'Disturbing peace'],
    minimumSentence: 'Fine only',
    maximumSentence: '6 months jail',
    fineRange: { min: 50, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['Repeat offense', 'Near schools', 'Public event'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'public-intoxication': {
    id: 'public-intox-001',
    crimeType: 'public-intoxication',
    category: 'misdemeanor',
    title: 'Public Intoxication',
    description: 'Being under influence of alcohol or drugs in public place',
    statuteReference: 'Penal Code § 647(f)',
    elements: ['Public place', 'Under influence of alcohol/drugs', 'Unable to care for safety or others'],
    minimumSentence: 'Fine only',
    maximumSentence: '6 months jail',
    fineRange: { min: 50, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['Repeat offense', 'Disorderly behavior'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'trespassing': {
    id: 'trespassing-001',
    crimeType: 'trespassing',
    category: 'misdemeanor',
    title: 'Criminal Trespass',
    description: 'Entering or remaining on property without permission',
    statuteReference: 'Penal Code § 602',
    elements: ['Entry onto property', 'Without permission', 'After being warned to leave'],
    minimumSentence: 'Fine only',
    maximumSentence: '6 months jail',
    fineRange: { min: 100, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['School property', 'Agricultural land', 'Repeat offense'],
    juvenileEligible: true,
    capitalEligible: false
  },

  'resisting-arrest': {
    id: 'resisting-001',
    crimeType: 'resisting-arrest',
    category: 'misdemeanor',
    title: 'Resisting Arrest',
    description: 'Willfully resisting, delaying, or obstructing peace officer',
    statuteReference: 'Penal Code § 148',
    elements: ['Willful resistance/delay/obstruction', 'Peace officer performing duties', 'Officer was lawfully performing duties'],
    minimumSentence: 'Fine only',
    maximumSentence: '1 year jail',
    fineRange: { min: 100, max: 1000 },
    probationEligible: true,
    enhancementFactors: ['Violence against officer', 'Injury to officer', 'Use of weapon'],
    juvenileEligible: true,
    capitalEligible: false
  }
};

// Helper function to get charges by category
export const getChargesByCategory = (category: CrimeCategory): CriminalCharge[] => {
  return Object.values(criminalCharges).filter(charge => charge.category === category);
};

// Helper function to get common charges for case generation
export const getCommonCharges = (): CriminalCharge[] => {
  return [
    criminalCharges['theft-grand'],
    criminalCharges['theft-petty'],
    criminalCharges['assault-simple'],
    criminalCharges['burglary-second-degree'],
    criminalCharges['possession-controlled-substance'],
    criminalCharges['dui-first'],
    criminalCharges['vandalism']
  ];
};

// Generate appropriate charges based on case facts
export const generateChargesFromFacts = (facts: string[]): CriminalCharge[] => {
  const charges: CriminalCharge[] = [];
  const factText = facts.join(' ').toLowerCase();
  
  // Theft-related
  if (factText.includes('theft') || factText.includes('steal') || factText.includes('stolen')) {
    if (factText.includes('1000') || factText.includes('valuable')) {
      charges.push(criminalCharges['theft-grand']);
    } else {
      charges.push(criminalCharges['theft-petty']);
    }
  }
  
  // Assault-related
  if (factText.includes('assault') || factText.includes('attack') || factText.includes('hit')) {
    if (factText.includes('weapon') || factText.includes('injury')) {
      charges.push(criminalCharges['assault-aggravated']);
    } else {
      charges.push(criminalCharges['assault-simple']);
    }
  }
  
  // Burglary-related
  if (factText.includes('break') || factText.includes('enter') || factText.includes('burglary')) {
    if (factText.includes('home') || factText.includes('house') || factText.includes('residence')) {
      charges.push(criminalCharges['burglary-first-degree']);
    } else {
      charges.push(criminalCharges['burglary-second-degree']);
    }
  }
  
  // Drug-related
  if (factText.includes('drug') || factText.includes('narcotic') || factText.includes('controlled substance')) {
    if (factText.includes('sell') || factText.includes('distribute')) {
      charges.push(criminalCharges['possession-with-intent']);
    } else {
      charges.push(criminalCharges['possession-controlled-substance']);
    }
  }
  
  // DUI-related
  if (factText.includes('driving') && (factText.includes('alcohol') || factText.includes('drunk') || factText.includes('intoxicated'))) {
    charges.push(criminalCharges['dui-first']);
  }
  
  // Default to petty theft if no specific charges identified
  if (charges.length === 0) {
    charges.push(criminalCharges['theft-petty']);
  }
  
  return charges;
};