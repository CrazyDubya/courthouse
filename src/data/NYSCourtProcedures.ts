/**
 * New York State Court Procedures - Specific NY Hearing Types and Court Rules
 * Based on NY court system procedures and local rules
 */

export interface NYSCourtProcedure {
  id: string;
  title: string;
  courtType: 'supreme' | 'county' | 'city' | 'town' | 'village' | 'family' | 'surrogate' | 'claims';
  category: 'motion' | 'conference' | 'hearing' | 'trial' | 'administrative' | 'settlement';
  description: string;
  participants: string[];
  timeLimit: string;
  prerequisites: string[];
  procedures: string[];
  outcomes: string[];
  appealable: boolean;
  publicRecord: boolean;
}

export interface NYSHearingType {
  id: string;
  name: string;
  purpose: string;
  courtLevel: string[];
  duration: string;
  formality: 'formal' | 'informal' | 'semi-formal';
  recordRequired: boolean;
  procedures: NYSCourtProcedure[];
}

// New York State Court Procedures
export const nysCourtProcedures: Record<string, NYSCourtProcedure> = {
  'preliminary-conference': {
    id: 'preliminary-conference',
    title: 'Preliminary Conference',
    courtType: 'supreme',
    category: 'conference',
    description: 'Early case management conference to establish discovery schedule and trial readiness',
    participants: ['Judge', 'All attorneys', 'Pro se parties'],
    timeLimit: 'Within 45 days of joinder of issue in personal injury cases',
    prerequisites: [
      'Note of issue not yet filed',
      'All parties served and appeared',
      'Request for preliminary conference filed'
    ],
    procedures: [
      'Court reviews pleadings and discovery demands',
      'Establishes discovery cut-off dates',
      'Identifies potential dispositive motion practice',
      'Sets medical examination dates if applicable',
      'Discusses settlement potential'
    ],
    outcomes: [
      'Preliminary Conference Order issued',
      'Discovery schedule established',
      'Trial date may be set',
      'Compliance conference scheduled if needed'
    ],
    appealable: false,
    publicRecord: true
  },

  'compliance-conference': {
    id: 'compliance-conference',
    title: 'Compliance Conference',
    courtType: 'supreme',
    category: 'conference',
    description: 'Follow-up conference to monitor compliance with preliminary conference order',
    participants: ['Judge', 'All attorneys', 'Pro se parties'],
    timeLimit: 'As scheduled in preliminary conference order',
    prerequisites: [
      'Preliminary conference order in effect',
      'Discovery period ongoing',
      'Compliance issues identified'
    ],
    procedures: [
      'Review compliance with discovery deadlines',
      'Address discovery disputes',
      'Modify schedule if necessary',
      'Impose sanctions for non-compliance'
    ],
    outcomes: [
      'Modified scheduling order',
      'Sanctions for non-compliance',
      'Case marked off calendar if appropriate',
      'Additional compliance dates set'
    ],
    appealable: false,
    publicRecord: true
  },

  'settlement-conference': {
    id: 'settlement-conference',
    title: 'Settlement Conference',
    courtType: 'supreme',
    category: 'settlement',
    description: 'Confidential discussion to explore settlement possibilities',
    participants: ['Judge/Mediator', 'All attorneys', 'Parties with settlement authority'],
    timeLimit: 'As scheduled by court, typically before trial',
    prerequisites: [
      'Case at issue',
      'Discovery substantially complete',
      'Parties willing to engage in settlement discussions'
    ],
    procedures: [
      'Confidential discussion of case strengths/weaknesses',
      'Exploration of settlement ranges',
      'Discussion of risk/benefit analysis',
      'Identification of creative settlement options'
    ],
    outcomes: [
      'Settlement reached and documented',
      'Case proceeds to trial if no settlement',
      'Partial settlement on some issues',
      'Additional settlement conference scheduled'
    ],
    appealable: false,
    publicRecord: false
  },

  'pre-trial-conference': {
    id: 'pre-trial-conference',
    title: 'Pre-Trial Conference',
    courtType: 'supreme',
    category: 'conference',
    description: 'Final conference before trial to resolve all preliminary matters',
    participants: ['Trial Judge', 'All trial attorneys', 'Parties if required'],
    timeLimit: 'Within 30 days of trial date',
    prerequisites: [
      'Case ready for trial',
      'Note of issue filed',
      'Discovery completed',
      'All pre-trial motions resolved'
    ],
    procedures: [
      'Finalize witness lists and exhibits',
      'Resolve evidentiary objections',
      'Estimate trial length',
      'Address jury selection procedures',
      'Set ground rules for trial conduct'
    ],
    outcomes: [
      'Pre-trial order issued',
      'Trial schedule confirmed',
      'Evidentiary rulings made',
      'Case ready for trial assignment'
    ],
    appealable: false,
    publicRecord: true
  },

  'motion-hearing': {
    id: 'motion-hearing',
    title: 'Motion Hearing',
    courtType: 'supreme',
    category: 'motion',
    description: 'Oral argument on contested motions',
    participants: ['Judge', 'Moving attorney', 'Opposing attorneys'],
    timeLimit: 'As scheduled in motion calendar',
    prerequisites: [
      'Motion properly noticed and served',
      'Responsive papers filed if required',
      'Oral argument requested or required by court'
    ],
    procedures: [
      'Moving party argues motion',
      'Opposition responds to arguments',
      'Court may ask questions',
      'Reply argument if permitted',
      'Court rules or reserves decision'
    ],
    outcomes: [
      'Motion granted in whole or part',
      'Motion denied',
      'Decision reserved with written decision to follow',
      'Case may be dismissed or summary judgment granted'
    ],
    appealable: true,
    publicRecord: true
  },

  'ex-parte-application': {
    id: 'ex-parte-application',
    title: 'Ex Parte Application',
    courtType: 'supreme',
    category: 'motion',
    description: 'Emergency application made without notice to opposing party',
    participants: ['Judge', 'Applicant attorney'],
    timeLimit: 'Immediate hearing based on emergency',
    prerequisites: [
      'Emergency circumstances exist',
      'Irreparable harm if notice given',
      'Sworn affidavit supporting application',
      'Legal basis for ex parte relief'
    ],
    procedures: [
      'Present emergency circumstances to court',
      'Provide sworn testimony if required',
      'Demonstrate irreparable harm',
      'Show why notice not practical'
    ],
    outcomes: [
      'Temporary restraining order granted',
      'Emergency relief denied',
      'Order to show cause issued',
      'Return date set for full hearing'
    ],
    appealable: true,
    publicRecord: true
  },

  'voir-dire-hearing': {
    id: 'voir-dire-hearing',
    title: 'Voir Dire (Jury Selection)',
    courtType: 'supreme',
    category: 'trial',
    description: 'Process of selecting impartial jury for trial',
    participants: ['Judge', 'All trial attorneys', 'Prospective jurors'],
    timeLimit: '1-3 days depending on case complexity',
    prerequisites: [
      'Jury trial demanded',
      'Case ready for trial',
      'Jury panel summoned',
      'Jury questionnaires completed if used'
    ],
    procedures: [
      'Court gives preliminary jury instructions',
      'Attorneys conduct voir dire examination',
      'Challenges for cause made and ruled upon',
      'Peremptory challenges exercised',
      'Final jury selected and sworn'
    ],
    outcomes: [
      'Jury impaneled and sworn',
      'Case proceeds to opening statements',
      'Alternates selected',
      'Jury dismissed if settlement reached'
    ],
    appealable: false,
    publicRecord: true
  },

  'suppression-hearing': {
    id: 'suppression-hearing',
    title: 'Suppression Hearing (Criminal)',
    courtType: 'supreme',
    category: 'hearing',
    description: 'Hearing to determine admissibility of evidence in criminal case',
    participants: ['Judge', 'Prosecutor', 'Defense attorney', 'Witnesses'],
    timeLimit: 'As scheduled before trial',
    prerequisites: [
      'Motion to suppress filed',
      'Criminal charges pending',
      'Evidence subject to Fourth Amendment challenge',
      'Factual hearing required'
    ],
    procedures: [
      'Prosecution presents evidence supporting search/seizure',
      'Defense cross-examines prosecution witnesses',
      'Defense may present witnesses',
      'Legal arguments on constitutional standards',
      'Court rules on suppression motion'
    ],
    outcomes: [
      'Evidence suppressed (excluded from trial)',
      'Evidence admitted for trial use',
      'Partial suppression of some evidence',
      'Case dismissed if critical evidence suppressed'
    ],
    appealable: true,
    publicRecord: true
  },

  'family-court-hearing': {
    id: 'family-court-hearing',
    title: 'Family Court Hearing',
    courtType: 'family',
    category: 'hearing',
    description: 'Hearing on family matters including custody, support, and protection',
    participants: ['Family Court Judge', 'Attorneys', 'Parties', 'Children\'s attorney if applicable'],
    timeLimit: 'Varies by issue type',
    prerequisites: [
      'Petition filed in Family Court',
      'Proper service on all parties',
      'Court appearance scheduled',
      'Required forms completed'
    ],
    procedures: [
      'Judge reviews petition and responses',
      'Parties present testimony and evidence',
      'Best interests of child considered',
      'Court may order investigation or evaluation',
      'Temporary or final orders issued'
    ],
    outcomes: [
      'Custody/visitation order',
      'Support order issued',
      'Protection order granted or denied',
      'Case adjourned for further proceedings'
    ],
    appealable: true,
    publicRecord: false
  },

  'small-claims-hearing': {
    id: 'small-claims-hearing',
    title: 'Small Claims Court Hearing',
    courtType: 'city',
    category: 'hearing',
    description: 'Informal hearing for small monetary disputes',
    participants: ['Judge/Arbitrator', 'Plaintiff', 'Defendant'],
    timeLimit: '30-60 minutes typical',
    prerequisites: [
      'Claim under jurisdictional limit ($3,000-$5,000)',
      'Proper service on defendant',
      'Filing fee paid',
      'No attorney representation (generally)'
    ],
    procedures: [
      'Informal presentation by plaintiff',
      'Defendant response and any counterclaim',
      'Court may ask questions',
      'Evidence reviewed informally',
      'Decision rendered immediately or reserved'
    ],
    outcomes: [
      'Judgment for plaintiff',
      'Judgment for defendant',
      'Judgment on counterclaim',
      'Case dismissed'
    ],
    appealable: true,
    publicRecord: true
  },

  'arbitration-hearing': {
    id: 'arbitration-hearing',
    title: 'Court-Annexed Arbitration',
    courtType: 'supreme',
    category: 'hearing',
    description: 'Mandatory arbitration for smaller civil cases',
    participants: ['Arbitrator', 'All attorneys', 'Parties if desired'],
    timeLimit: 'Half day typical',
    prerequisites: [
      'Case under monetary threshold',
      'No jury trial demand',
      'Case assigned to arbitration track',
      'Discovery substantially complete'
    ],
    procedures: [
      'Informal presentation of evidence',
      'Witness testimony allowed',
      'Arbitrator may ask questions',
      'Final arguments presented',
      'Award rendered'
    ],
    outcomes: [
      'Arbitration award in favor of party',
      'Case dismissed',
      'Trial de novo if award rejected',
      'Judgment entered if award accepted'
    ],
    appealable: false,
    publicRecord: true
  }
};

// New York State Hearing Types
export const nysHearingTypes: Record<string, NYSHearingType> = {
  'civil-motion-calendar': {
    id: 'civil-motion-calendar',
    name: 'Civil Motion Calendar',
    purpose: 'Regular schedule for hearing contested civil motions',
    courtLevel: ['Supreme Court', 'County Court'],
    duration: 'Half day sessions',
    formality: 'formal',
    recordRequired: true,
    procedures: [
      nysCourtProcedures['motion-hearing'],
      nysCourtProcedures['ex-parte-application']
    ]
  },

  'case-management': {
    id: 'case-management',
    name: 'Case Management Track',
    purpose: 'Structured case progression from filing to trial',
    courtLevel: ['Supreme Court'],
    duration: 'Series of conferences over months',
    formality: 'semi-formal',
    recordRequired: true,
    procedures: [
      nysCourtProcedures['preliminary-conference'],
      nysCourtProcedures['compliance-conference'],
      nysCourtProcedures['pre-trial-conference']
    ]
  },

  'settlement-program': {
    id: 'settlement-program',
    name: 'Court Settlement Program',
    purpose: 'Alternative dispute resolution before trial',
    courtLevel: ['Supreme Court', 'County Court'],
    duration: '1-2 hours per session',
    formality: 'informal',
    recordRequired: false,
    procedures: [
      nysCourtProcedures['settlement-conference']
    ]
  },

  'criminal-proceedings': {
    id: 'criminal-proceedings',
    name: 'Criminal Court Proceedings',
    purpose: 'Prosecution of criminal charges',
    courtLevel: ['Supreme Court', 'County Court', 'City Court'],
    duration: 'Varies by proceeding type',
    formality: 'formal',
    recordRequired: true,
    procedures: [
      nysCourtProcedures['suppression-hearing'],
      nysCourtProcedures['pre-trial-conference']
    ]
  },

  'family-matters': {
    id: 'family-matters',
    name: 'Family Court Matters',
    purpose: 'Resolution of family-related disputes',
    courtLevel: ['Family Court'],
    duration: '1-4 hours typical',
    formality: 'semi-formal',
    recordRequired: false,
    procedures: [
      nysCourtProcedures['family-court-hearing']
    ]
  },

  'small-claims': {
    id: 'small-claims',
    name: 'Small Claims Court',
    purpose: 'Quick resolution of small monetary disputes',
    courtLevel: ['City Court', 'Town Court', 'Village Court'],
    duration: '30-60 minutes',
    formality: 'informal',
    recordRequired: true,
    procedures: [
      nysCourtProcedures['small-claims-hearing']
    ]
  },

  'trial-calendar': {
    id: 'trial-calendar',
    name: 'Trial Calendar',
    purpose: 'Scheduling and conducting jury and non-jury trials',
    courtLevel: ['Supreme Court', 'County Court'],
    duration: '1 day to several weeks',
    formality: 'formal',
    recordRequired: true,
    procedures: [
      nysCourtProcedures['voir-dire-hearing'],
      nysCourtProcedures['pre-trial-conference']
    ]
  }
};

/**
 * Get applicable procedures for case type and stage
 */
export function getApplicableNYSProcedures(
  caseType: 'civil' | 'criminal' | 'family', 
  stage: string,
  courtLevel: string
): NYSCourtProcedure[] {
  const procedures: NYSCourtProcedure[] = [];

  // Filter by court type and case stage
  Object.values(nysCourtProcedures).forEach(procedure => {
    const matchesCourt = procedure.courtType === courtLevel.toLowerCase() || 
                        procedure.courtType === 'supreme'; // Supreme has broad jurisdiction
    
    const matchesStage = stage === 'all' || 
                        (stage === 'pre-trial' && ['conference', 'motion'].includes(procedure.category)) ||
                        (stage === 'trial' && procedure.category === 'trial') ||
                        (stage === 'settlement' && procedure.category === 'settlement');

    if (matchesCourt && matchesStage) {
      procedures.push(procedure);
    }
  });

  return procedures;
}

/**
 * Determine appropriate hearing type for case
 */
export function determineHearingType(
  caseType: 'civil' | 'criminal' | 'family',
  damagesAmount?: number,
  hasJuryDemand?: boolean
): NYSHearingType {
  switch (caseType) {
    case 'criminal':
      return nysHearingTypes['criminal-proceedings'];
    
    case 'family':
      return nysHearingTypes['family-matters'];
    
    case 'civil':
      if (damagesAmount && damagesAmount < 5000) {
        return nysHearingTypes['small-claims'];
      } else if (hasJuryDemand) {
        return nysHearingTypes['trial-calendar'];
      } else {
        return nysHearingTypes['case-management'];
      }
    
    default:
      return nysHearingTypes['case-management'];
  }
}

/**
 * Generate realistic court schedule
 */
export function generateCourtSchedule(hearingType: NYSHearingType): {
  nextHearing: Date;
  estimatedDuration: string;
  procedures: string[];
} {
  const now = new Date();
  const nextHearing = new Date(now);
  
  // Add realistic delay based on hearing type
  switch (hearingType.id) {
    case 'small-claims':
      nextHearing.setDate(now.getDate() + 14); // 2 weeks
      break;
    case 'family-matters':
      nextHearing.setDate(now.getDate() + 30); // 1 month
      break;
    case 'case-management':
      nextHearing.setDate(now.getDate() + 45); // 6 weeks
      break;
    case 'trial-calendar':
      nextHearing.setMonth(now.getMonth() + 6); // 6 months
      break;
    default:
      nextHearing.setDate(now.getDate() + 21); // 3 weeks
  }

  return {
    nextHearing,
    estimatedDuration: hearingType.duration,
    procedures: hearingType.procedures.map(p => p.title)
  };
}

/**
 * Check if appeal is available for procedure
 */
export function isAppealable(procedureId: string): boolean {
  const procedure = nysCourtProcedures[procedureId];
  return procedure ? procedure.appealable : false;
}

/**
 * Get required participants for procedure
 */
export function getRequiredParticipants(procedureId: string): string[] {
  const procedure = nysCourtProcedures[procedureId];
  return procedure ? procedure.participants : [];
}