/**
 * New York State Civil Law - CPLR Procedures and Civil Causes of Action
 * Based on New York Civil Practice Law and Rules (CPLR)
 */

export interface NYSCivilCause {
  id: string;
  title: string;
  cplrSection: string;
  classification: 'tort' | 'contract' | 'property' | 'family' | 'commercial' | 'employment' | 'constitutional';
  elementsRequired: string[];
  statuteOfLimitations: string;
  damages: {
    compensatory: boolean;
    punitive: boolean;
    nominal: boolean;
    injunctive: boolean;
  };
  venue: string[];
  jurisdiction: 'supreme' | 'county' | 'city' | 'town' | 'village' | 'family';
  minimumDamages?: number;
  maximumDamages?: number;
  discoveryRules: string[];
  commonDefenses: string[];
  burden: 'preponderance' | 'clear-convincing';
}

export interface CPLRProcedure {
  id: string;
  title: string;
  cplrSection: string;
  category: 'pleading' | 'discovery' | 'motion' | 'trial' | 'appeal' | 'enforcement';
  description: string;
  timeLimit: string;
  requirements: string[];
  consequences: string[];
  applicableTo: string[];
}

// New York Civil Causes of Action
export const nysCivilCauses: Record<string, NYSCivilCause> = {
  'negligence': {
    id: 'negligence',
    title: 'Negligence',
    cplrSection: 'Common Law',
    classification: 'tort',
    elementsRequired: [
      'Duty of care owed to plaintiff',
      'Breach of that duty by defendant',
      'Causation (factual and proximate)',
      'Actual damages or harm'
    ],
    statuteOfLimitations: '3 years from accrual (CPLR § 214)',
    damages: {
      compensatory: true,
      punitive: false,
      nominal: false,
      injunctive: false
    },
    venue: ['County where cause arose', 'County where defendant resides'],
    jurisdiction: 'supreme',
    discoveryRules: ['CPLR § 3101 - Full disclosure', 'CPLR § 3120 - Document production'],
    commonDefenses: [
      'Comparative negligence',
      'Assumption of risk',
      'Statute of limitations',
      'No duty owed',
      'No causation'
    ],
    burden: 'preponderance'
  },

  'breach-contract': {
    id: 'breach-contract',
    title: 'Breach of Contract',
    cplrSection: 'CPLR § 213',
    classification: 'contract',
    elementsRequired: [
      'Valid contract formation',
      'Performance by plaintiff or excuse',
      'Material breach by defendant',
      'Damages resulting from breach'
    ],
    statuteOfLimitations: '6 years for written contracts, 6 years for oral contracts (CPLR § 213)',
    damages: {
      compensatory: true,
      punitive: false,
      nominal: true,
      injunctive: true
    },
    venue: ['County where contract was made', 'County where contract was to be performed'],
    jurisdiction: 'supreme',
    discoveryRules: ['CPLR § 3101', 'Contract documents discoverable'],
    commonDefenses: [
      'Statute of frauds',
      'Impossibility/impracticability',
      'Frustration of purpose',
      'Duress or undue influence',
      'Lack of consideration'
    ],
    burden: 'preponderance'
  },

  'personal-injury': {
    id: 'personal-injury',
    title: 'Personal Injury',
    cplrSection: 'CPLR § 214',
    classification: 'tort',
    elementsRequired: [
      'Negligent, reckless, or intentional conduct',
      'Causation of physical injury',
      'Actual damages (medical expenses, lost wages, pain and suffering)'
    ],
    statuteOfLimitations: '3 years from date of injury (CPLR § 214)',
    damages: {
      compensatory: true,
      punitive: true,
      nominal: false,
      injunctive: false
    },
    venue: ['County where injury occurred', 'County where defendant resides'],
    jurisdiction: 'supreme',
    discoveryRules: [
      'CPLR § 3101 - Medical records discoverable',
      'CPLR § 3121 - Medical examination',
      'CPLR § 4504 - Physician-patient privilege'
    ],
    commonDefenses: [
      'Comparative negligence',
      'Assumption of risk',
      'Statute of limitations',
      'Pre-existing condition',
      'Intervening cause'
    ],
    burden: 'preponderance'
  },

  'defamation': {
    id: 'defamation',
    title: 'Defamation (Libel/Slander)',
    cplrSection: 'CPLR § 215',
    classification: 'tort',
    elementsRequired: [
      'False statement of fact',
      'Publication to third party',
      'Statement concerning plaintiff',
      'Damages to reputation',
      'Fault (negligence for private figures, actual malice for public figures)'
    ],
    statuteOfLimitations: '1 year from publication (CPLR § 215)',
    damages: {
      compensatory: true,
      punitive: true,
      nominal: true,
      injunctive: true
    },
    venue: ['County where published', 'County where plaintiff resides'],
    jurisdiction: 'supreme',
    discoveryRules: ['CPLR § 3101', 'Publication evidence', 'Reputation evidence'],
    commonDefenses: [
      'Truth',
      'Absolute privilege',
      'Qualified privilege',
      'Opinion',
      'Statute of limitations'
    ],
    burden: 'preponderance'
  },

  'employment-discrimination': {
    id: 'employment-discrimination',
    title: 'Employment Discrimination',
    cplrSection: 'NY Human Rights Law § 296',
    classification: 'employment',
    elementsRequired: [
      'Protected class membership',
      'Adverse employment action',
      'Causal connection between protected status and adverse action',
      'Employer liability'
    ],
    statuteOfLimitations: '1 year with NYSDHR, 3 years in court (Executive Law § 297)',
    damages: {
      compensatory: true,
      punitive: true,
      nominal: false,
      injunctive: true
    },
    venue: ['County where employment occurred', 'County where employer located'],
    jurisdiction: 'supreme',
    discoveryRules: [
      'CPLR § 3101',
      'Personnel files discoverable',
      'Comparator evidence',
      'Statistical evidence'
    ],
    commonDefenses: [
      'Legitimate business reason',
      'Bona fide occupational qualification',
      'Statute of limitations',
      'After-acquired evidence',
      'No adverse action'
    ],
    burden: 'preponderance'
  },

  'landlord-tenant': {
    id: 'landlord-tenant',
    title: 'Landlord-Tenant Dispute',
    cplrSection: 'RPAPL Article 7',
    classification: 'property',
    elementsRequired: [
      'Landlord-tenant relationship',
      'Breach of lease terms or statutory duty',
      'Notice (if required)',
      'Damages or right to possession'
    ],
    statuteOfLimitations: '6 years for breach of lease (CPLR § 213)',
    damages: {
      compensatory: true,
      punitive: false,
      nominal: true,
      injunctive: true
    },
    venue: ['County where property located'],
    jurisdiction: 'city',
    discoveryRules: ['CPLR § 3101', 'Lease documents', 'Rent records', 'Inspection reports'],
    commonDefenses: [
      'Warranty of habitability breach',
      'Retaliatory eviction',
      'Improper notice',
      'Rent stabilization violations',
      'Constructive eviction'
    ],
    burden: 'preponderance'
  },

  'medical-malpractice': {
    id: 'medical-malpractice',
    title: 'Medical Malpractice',
    cplrSection: 'CPLR § 214-a',
    classification: 'tort',
    elementsRequired: [
      'Doctor-patient relationship',
      'Departure from accepted medical practice',
      'Causation of injury',
      'Actual damages'
    ],
    statuteOfLimitations: '2.5 years from malpractice or end of continuous treatment (CPLR § 214-a)',
    damages: {
      compensatory: true,
      punitive: false,
      nominal: false,
      injunctive: false
    },
    venue: ['County where treatment occurred', 'County where defendant practices'],
    jurisdiction: 'supreme',
    minimumDamages: 0,
    maximumDamages: undefined,
    discoveryRules: [
      'CPLR § 3101',
      'Medical records fully discoverable',
      'Expert disclosure requirements',
      'Certificate of merit (CPLR § 3012-a)'
    ],
    commonDefenses: [
      'Standard of care met',
      'No causation',
      'Statute of limitations',
      'Contributory negligence',
      'Informed consent defense'
    ],
    burden: 'preponderance'
  },

  'fraud': {
    id: 'fraud',
    title: 'Fraud/Misrepresentation',
    cplrSection: 'CPLR § 213',
    classification: 'tort',
    elementsRequired: [
      'False representation of material fact',
      'Knowledge of falsity or reckless disregard',
      'Intent to induce reliance',
      'Justifiable reliance',
      'Damages'
    ],
    statuteOfLimitations: '6 years from fraud or 2 years from discovery (CPLR § 213)',
    damages: {
      compensatory: true,
      punitive: true,
      nominal: false,
      injunctive: true
    },
    venue: ['County where fraud occurred', 'County where defendant resides'],
    jurisdiction: 'supreme',
    discoveryRules: [
      'CPLR § 3101',
      'Financial records discoverable',
      'Communications regarding representations'
    ],
    commonDefenses: [
      'Truth of representations',
      'No reliance',
      'Unreasonable reliance',
      'No damages',
      'Statute of limitations'
    ],
    burden: 'preponderance'
  }
};

// CPLR Procedures and Rules
export const cplrProcedures: Record<string, CPLRProcedure> = {
  'service-process': {
    id: 'service-process',
    title: 'Service of Process',
    cplrSection: 'CPLR §§ 308-314',
    category: 'pleading',
    description: 'Proper service of summons and complaint to obtain jurisdiction',
    timeLimit: 'Within 120 days of filing (CPLR § 306-b)',
    requirements: [
      'Personal service preferred (CPLR § 308)',
      'Substitute service if personal service not possible',
      'Service by mail with acknowledgment',
      'Service on agent or attorney if authorized'
    ],
    consequences: [
      'Failure to serve properly = dismissal',
      'Improper service = lack of personal jurisdiction',
      'Late service = dismissal unless good cause shown'
    ],
    applicableTo: ['All civil actions']
  },

  'answer-requirements': {
    id: 'answer-requirements',
    title: 'Answer and Responsive Pleadings',
    cplrSection: 'CPLR §§ 3011-3018',
    category: 'pleading',
    description: 'Defendant\'s response to complaint with admissions, denials, and affirmative defenses',
    timeLimit: '20 days if served within NY, 30 days if served outside NY (CPLR § 3012)',
    requirements: [
      'Admit, deny, or state insufficient knowledge for each allegation',
      'Raise all affirmative defenses or waive them',
      'Counterclaims that arise from same transaction must be pleaded',
      'Verification required if complaint was verified'
    ],
    consequences: [
      'Failure to answer = default judgment',
      'Failure to deny = deemed admission',
      'Waiver of affirmative defenses not pleaded'
    ],
    applicableTo: ['All defendants in civil actions']
  },

  'discovery-disclosure': {
    id: 'discovery-disclosure',
    title: 'Discovery and Disclosure',
    cplrSection: 'CPLR §§ 3101-3140',
    category: 'discovery',
    description: 'Full disclosure of all matter material and necessary to prosecution/defense',
    timeLimit: 'Discovery must be completed within timeframes set by court or rule',
    requirements: [
      'Automatic disclosure of basic information',
      'Document production under CPLR § 3120',
      'Depositions under CPLR § 3107',
      'Expert disclosure under CPLR § 3101(d)'
    ],
    consequences: [
      'Sanctions for failure to comply',
      'Preclusion of evidence/witnesses',
      'Dismissal or default judgment for egregious conduct'
    ],
    applicableTo: ['All civil actions']
  },

  'motion-summary-judgment': {
    id: 'motion-summary-judgment',
    title: 'Motion for Summary Judgment',
    cplrSection: 'CPLR § 3212',
    category: 'motion',
    description: 'Motion for judgment when no genuine issue of material fact exists',
    timeLimit: 'Within 120 days after note of issue filed, unless court permits later',
    requirements: [
      'Moving papers must establish prima facie entitlement',
      'Supported by admissible evidence',
      'Address all material facts',
      'Statement of material facts as required by rules'
    ],
    consequences: [
      'Judgment entered if granted',
      'Case proceeds to trial if denied',
      'Partial summary judgment possible on some issues'
    ],
    applicableTo: ['Any party in civil action']
  },

  'motion-dismiss': {
    id: 'motion-dismiss',
    title: 'Motion to Dismiss',
    cplrSection: 'CPLR § 3211',
    category: 'motion',
    description: 'Motion challenging legal sufficiency of pleading',
    timeLimit: 'Within 60 days of service of pleading, or in answer',
    requirements: [
      'Must specify ground for dismissal under CPLR § 3211(a)',
      'Supported by affidavit if based on facts not in record',
      'Documentary evidence if dismissal based on documentary evidence'
    ],
    consequences: [
      'Dismissal with or without prejudice if granted',
      'Case continues if denied',
      'May convert to summary judgment motion'
    ],
    applicableTo: ['Any party against whom pleading is served']
  },

  'preliminary-injunction': {
    id: 'preliminary-injunction',
    title: 'Preliminary Injunction',
    cplrSection: 'CPLR § 6301',
    category: 'motion',
    description: 'Temporary restraint pending final determination',
    timeLimit: 'Motion should be made promptly after commencement',
    requirements: [
      'Likelihood of success on merits',
      'Irreparable harm without injunction',
      'Balance of hardships favors plaintiff',
      'Undertaking for damages if wrongfully enjoined'
    ],
    consequences: [
      'Status quo maintained if granted',
      'Expedited trial may be required',
      'Damages if undertaking insufficient'
    ],
    applicableTo: ['Any party seeking equitable relief']
  },

  'jury-trial-demand': {
    id: 'jury-trial-demand',
    title: 'Demand for Jury Trial',
    cplrSection: 'CPLR § 4102',
    category: 'trial',
    description: 'Demand for trial by jury in civil action',
    timeLimit: 'Within 15 days of service of last pleading (CPLR § 4102)',
    requirements: [
      'Written demand served on all parties',
      'Payment of jury fee',
      'Demand for specific issues if not entire case'
    ],
    consequences: [
      'Waiver of jury trial if not timely demanded',
      'Court trial if waived',
      'May be withdrawn with consent or court permission'
    ],
    applicableTo: ['Any party in action triable by jury']
  },

  'appeal-civil': {
    id: 'appeal-civil',
    title: 'Appeal from Civil Judgment',
    cplrSection: 'CPLR §§ 5501-5531',
    category: 'appeal',
    description: 'Appeal from final judgment or appealable order',
    timeLimit: '30 days from service of judgment/order with notice of entry (CPLR § 5513)',
    requirements: [
      'Notice of appeal filed and served',
      'Appellate division has jurisdiction',
      'Final judgment or appealable interlocutory order',
      'Record on appeal prepared'
    ],
    consequences: [
      'Automatic stay of money judgment if undertaking posted',
      'Review of legal issues and some factual determinations',
      'Affirmance, reversal, or modification possible'
    ],
    applicableTo: ['Any aggrieved party']
  }
};

/**
 * Generate appropriate civil causes based on case facts
 */
export function generateNYSCivilClaims(facts: string[]): NYSCivilCause[] {
  const claims: NYSCivilCause[] = [];
  const factString = facts.join(' ').toLowerCase();

  // Analyze facts to determine applicable claims
  if (factString.includes('negligent') || factString.includes('careless') || factString.includes('failed to')) {
    claims.push(nysCivilCauses['negligence']);
  }

  if (factString.includes('contract') || factString.includes('agreement') || factString.includes('breach')) {
    claims.push(nysCivilCauses['breach-contract']);
  }

  if (factString.includes('injury') || factString.includes('accident') || factString.includes('hurt')) {
    claims.push(nysCivilCauses['personal-injury']);
  }

  if (factString.includes('defam') || factString.includes('libelous') || factString.includes('slander')) {
    claims.push(nysCivilCauses['defamation']);
  }

  if (factString.includes('discriminat') || factString.includes('fired') || factString.includes('harassment')) {
    claims.push(nysCivilCauses['employment-discrimination']);
  }

  if (factString.includes('landlord') || factString.includes('tenant') || factString.includes('rent') || factString.includes('evict')) {
    claims.push(nysCivilCauses['landlord-tenant']);
  }

  if (factString.includes('medical') || factString.includes('doctor') || factString.includes('malpractice')) {
    claims.push(nysCivilCauses['medical-malpractice']);
  }

  if (factString.includes('fraud') || factString.includes('misrepresent') || factString.includes('deceiv')) {
    claims.push(nysCivilCauses['fraud']);
  }

  // Default to negligence if no specific claims identified
  if (claims.length === 0) {
    claims.push(nysCivilCauses['negligence']);
  }

  return claims;
}

/**
 * Get applicable CPLR procedures for case stage
 */
export function getApplicableProcedures(stage: string): CPLRProcedure[] {
  const procedures: CPLRProcedure[] = [];

  switch (stage) {
    case 'pre-trial':
      procedures.push(
        cplrProcedures['service-process'],
        cplrProcedures['answer-requirements'],
        cplrProcedures['motion-dismiss'],
        cplrProcedures['motion-summary-judgment']
      );
      break;
    case 'discovery':
      procedures.push(
        cplrProcedures['discovery-disclosure']
      );
      break;
    case 'trial':
      procedures.push(
        cplrProcedures['jury-trial-demand']
      );
      break;
    case 'post-trial':
      procedures.push(
        cplrProcedures['appeal-civil']
      );
      break;
    default:
      procedures.push(...Object.values(cplrProcedures));
  }

  return procedures;
}

/**
 * Determine proper venue for civil case
 */
export function determineVenue(cause: NYSCivilCause, facts: string[]): string {
  // Simple venue determination based on cause type
  if (cause.venue.length > 0) {
    return cause.venue[0]; // Return first option
  }
  return 'County where cause arose';
}

/**
 * Calculate damages range for civil case
 */
export function calculateDamagesRange(cause: NYSCivilCause, severity: 'minor' | 'moderate' | 'severe'): { min: number; max: number } {
  const baseRanges = {
    minor: { min: 1000, max: 25000 },
    moderate: { min: 25000, max: 100000 },
    severe: { min: 100000, max: 1000000 }
  };

  let range = baseRanges[severity];

  // Adjust based on cause type
  switch (cause.classification) {
    case 'tort':
      if (cause.id === 'medical-malpractice') {
        range = { min: range.min * 3, max: range.max * 5 };
      } else if (cause.id === 'personal-injury') {
        range = { min: range.min * 2, max: range.max * 3 };
      }
      break;
    case 'contract':
      // Contract damages typically related to contract value
      range = { min: range.min * 0.5, max: range.max * 2 };
      break;
    case 'employment':
      // Employment cases often have statutory damages
      range = { min: range.min, max: range.max * 2 };
      break;
  }

  return range;
}