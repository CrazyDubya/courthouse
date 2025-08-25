import { MotionTemplate, MotionType, CaseType, LegalStandard } from '../types/motions';

export const MOTION_TEMPLATES: MotionTemplate[] = [
  // CRIMINAL MOTIONS
  {
    type: 'motion-to-dismiss-criminal',
    applicableCaseTypes: ['criminal'],
    title: 'Motion to Dismiss Criminal Charges',
    description: 'Request to dismiss criminal charges due to legal deficiencies',
    legalStandard: 'beyond-reasonable-doubt',
    common_grounds: [
      'Insufficient evidence to support charges',
      'Statute of limitations has expired',
      'Double jeopardy violation',
      'Prosecutorial misconduct',
      'Constitutional violations',
      'Lack of jurisdiction',
      'Failure to state a criminal offense'
    ],
    required_citations: [
      'Fed. R. Crim. P. 12(b)',
      'Brady v. Maryland, 373 U.S. 83 (1963)',
      'United States v. Lovasco, 431 U.S. 783 (1977)'
    ],
    typical_evidence: [
      'Police reports',
      'Witness statements',
      'Expert testimony on legal standards',
      'Discovery materials',
      'Constitutional precedents'
    ],
    page_limit: 25,
    hearing_required: true,
    response_time_days: 14,
    reply_time_days: 7,
    likelihood_of_success: 0.15,
    typical_judicial_concerns: [
      'Preservation of prosecutorial discretion',
      'Sufficiency of evidence for trial',
      'Procedural versus substantive defects',
      'Prejudice to prosecution if granted'
    ],
    best_practices: [
      'File early in proceedings',
      'Provide detailed factual basis',
      'Address prosecutorial counter-arguments',
      'Request specific relief'
    ],
    common_mistakes: [
      'Filing too late',
      'Insufficient legal research',
      'Failure to address all charges',
      'Inadequate factual development'
    ],
    sample_argument: 'The prosecution has failed to present sufficient evidence to establish the essential elements of the charged offense. The evidence, when viewed in the light most favorable to the prosecution, does not support a reasonable inference of guilt beyond a reasonable doubt.',
    sample_relief: 'WHEREFORE, Defendant respectfully requests that this Honorable Court grant this Motion to Dismiss and dismiss all charges against Defendant with prejudice.',
    sample_facts: 'On [date], Defendant was charged with [offense]. Discovery reveals that [key factual deficiency]. The prosecution cannot establish [essential element] based on the available evidence.'
  },

  {
    type: 'motion-to-suppress-evidence',
    applicableCaseTypes: ['criminal'],
    title: 'Motion to Suppress Evidence',
    description: 'Request to exclude evidence obtained in violation of constitutional rights',
    legalStandard: 'preponderance-of-evidence',
    common_grounds: [
      'Fourth Amendment violation - illegal search',
      'Fourth Amendment violation - illegal seizure',
      'Fifth Amendment violation - coerced confession',
      'Sixth Amendment violation - denial of counsel',
      'Miranda rights violation',
      'Chain of custody issues',
      'Fruit of the poisonous tree doctrine'
    ],
    required_citations: [
      'Mapp v. Ohio, 367 U.S. 643 (1961)',
      'Miranda v. Arizona, 384 U.S. 436 (1966)',
      'Terry v. Ohio, 392 U.S. 1 (1968)',
      'Wong Sun v. United States, 371 U.S. 471 (1963)'
    ],
    typical_evidence: [
      'Police body camera footage',
      'Search warrant documents',
      'Arrest reports',
      'Witness testimony',
      'Expert testimony on search procedures'
    ],
    hearing_required: true,
    response_time_days: 14,
    reply_time_days: 7,
    likelihood_of_success: 0.25,
    typical_judicial_concerns: [
      'Balancing law enforcement needs with constitutional rights',
      'Good faith exception to exclusionary rule',
      'Inevitable discovery doctrine',
      'Standing of defendant to challenge search'
    ],
    best_practices: [
      'Obtain all relevant police reports',
      'Review body camera and surveillance footage',
      'Interview all witnesses present',
      'Research recent Fourth Amendment developments'
    ],
    common_mistakes: [
      'Failure to establish standing',
      'Inadequate factual development',
      'Missing suppression hearing deadlines',
      'Failure to request evidentiary hearing'
    ],
    sample_argument: 'The evidence sought to be suppressed was obtained in violation of Defendant\'s Fourth Amendment rights. The search conducted by law enforcement lacked probable cause and was not supported by a valid warrant or recognized exception to the warrant requirement.',
    sample_relief: 'WHEREFORE, Defendant respectfully requests that this Court suppress all evidence obtained as a result of the illegal search and any evidence derived therefrom.',
    sample_facts: 'On [date], law enforcement conducted a search of [location]. The search was conducted without a warrant and without [specific constitutional requirement]. As a result, [evidence obtained] should be suppressed.'
  },

  {
    type: 'motion-for-discovery',
    applicableCaseTypes: ['criminal'],
    title: 'Motion for Discovery',
    description: 'Request for disclosure of prosecution evidence and materials',
    legalStandard: 'preponderance-of-evidence',
    common_grounds: [
      'Brady material - exculpatory evidence',
      'Giglio material - impeachment evidence',
      'Police reports and investigative files',
      'Expert witness reports and qualifications',
      'Evidence of prosecutorial misconduct',
      'Witness statements and identities'
    ],
    required_citations: [
      'Brady v. Maryland, 373 U.S. 83 (1963)',
      'Giglio v. United States, 405 U.S. 150 (1972)',
      'Fed. R. Crim. P. 16',
      'Jencks v. United States, 353 U.S. 657 (1957)'
    ],
    typical_evidence: [
      'Discovery requests',
      'Prosecution responses',
      'Court orders',
      'Case law on discovery obligations'
    ],
    hearing_required: false,
    response_time_days: 14,
    likelihood_of_success: 0.70,
    typical_judicial_concerns: [
      'Broad fishing expeditions',
      'Protection of ongoing investigations',
      'Witness safety and intimidation',
      'Work product protection'
    ],
    best_practices: [
      'Make specific, targeted requests',
      'Explain relevance to defense',
      'Follow up on incomplete responses',
      'Preserve record for appeal'
    ],
    common_mistakes: [
      'Overly broad requests',
      'Failure to meet deadlines',
      'Inadequate follow-up',
      'Missing Brady violations'
    ],
    sample_argument: 'Defendant is entitled to discovery of all exculpatory and impeachment evidence in the prosecution\'s possession. The requested materials are essential to prepare an adequate defense and ensure a fair trial.',
    sample_relief: 'WHEREFORE, Defendant requests that this Court order the prosecution to provide all requested discovery materials within 30 days of this Order.',
    sample_facts: 'Defendant has requested [specific materials] that are relevant to [defense theory]. The prosecution has [response status], which is insufficient to meet constitutional and statutory discovery obligations.'
  },

  // CIVIL MOTIONS
  {
    type: 'motion-to-dismiss-civil',
    applicableCaseTypes: ['civil', 'corporate', 'family'],
    title: 'Motion to Dismiss',
    description: 'Request to dismiss civil complaint for failure to state a claim',
    legalStandard: 'preponderance-of-evidence',
    common_grounds: [
      'Failure to state a claim upon which relief can be granted',
      'Lack of subject matter jurisdiction',
      'Lack of personal jurisdiction',
      'Improper venue',
      'Insufficient service of process',
      'Failure to join necessary party',
      'Statute of limitations'
    ],
    required_citations: [
      'Fed. R. Civ. P. 12(b)',
      'Bell Atlantic Corp. v. Twombly, 550 U.S. 544 (2007)',
      'Ashcroft v. Iqbal, 556 U.S. 662 (2009)',
      'Conley v. Gibson, 355 U.S. 41 (1957)'
    ],
    typical_evidence: [
      'Complaint and attachments',
      'Jurisdictional documents',
      'Service of process records',
      'Applicable statutes',
      'Contract documents'
    ],
    page_limit: 20,
    hearing_required: false,
    response_time_days: 21,
    reply_time_days: 14,
    likelihood_of_success: 0.30,
    typical_judicial_concerns: [
      'Plausibility of claims',
      'Liberal pleading standards',
      'Leave to amend deficient pleadings',
      'Procedural versus substantive challenges'
    ],
    best_practices: [
      'Attack specific elements of claims',
      'Focus on legal insufficiency',
      'Address all counts separately',
      'Argue in the alternative'
    ],
    common_mistakes: [
      'Arguing facts not law',
      'Premature factual challenges',
      'Failure to meet and confer',
      'Inadequate legal research'
    ],
    sample_argument: 'Plaintiff\'s complaint fails to state a claim upon which relief can be granted. The allegations, even if taken as true, do not establish the essential elements of [specific cause of action] and fail to meet the plausibility standard.',
    sample_relief: 'WHEREFORE, Defendant respectfully requests that this Court dismiss Plaintiff\'s complaint with prejudice.',
    sample_facts: 'Plaintiff alleges [summary of claims]. However, the complaint fails to allege [essential element] and does not provide sufficient factual matter to state a plausible claim for relief.'
  },

  {
    type: 'motion-for-summary-judgment',
    applicableCaseTypes: ['civil', 'corporate'],
    title: 'Motion for Summary Judgment',
    description: 'Request for judgment as a matter of law without trial',
    legalStandard: 'preponderance-of-evidence',
    common_grounds: [
      'No genuine dispute of material fact',
      'Entitled to judgment as a matter of law',
      'Statute of limitations bars claims',
      'Failure of proof on essential element',
      'Immunity from liability',
      'Contract terms preclude liability'
    ],
    required_citations: [
      'Fed. R. Civ. P. 56',
      'Celotex Corp. v. Catrett, 477 U.S. 317 (1986)',
      'Matsushita Elec. Indus. Co. v. Zenith Radio Corp., 475 U.S. 574 (1986)',
      'Anderson v. Liberty Lobby, Inc., 477 U.S. 242 (1986)'
    ],
    typical_evidence: [
      'Deposition transcripts',
      'Document production',
      'Expert reports',
      'Affidavits',
      'Admissions'
    ],
    page_limit: 25,
    hearing_required: true,
    response_time_days: 28,
    reply_time_days: 14,
    likelihood_of_success: 0.40,
    typical_judicial_concerns: [
      'Genuine disputes of material fact',
      'Credibility determinations',
      'Drawing inferences in favor of non-movant',
      'Completeness of discovery'
    ],
    best_practices: [
      'Complete discovery before filing',
      'Create detailed statement of facts',
      'Address all claims and defenses',
      'Use admissions and undisputed facts'
    ],
    common_mistakes: [
      'Premature filing before discovery',
      'Arguing credibility',
      'Inadequate factual record',
      'Failure to address all issues'
    ],
    sample_argument: 'There is no genuine dispute of material fact regarding [specific issue], and Defendant is entitled to judgment as a matter of law. The undisputed evidence establishes that [legal conclusion].',
    sample_relief: 'WHEREFORE, Defendant respectfully requests that this Court grant summary judgment in favor of Defendant and against Plaintiff on all claims.',
    sample_facts: 'The undisputed material facts, as established through discovery, are as follows: [detailed factual statement with citations to record].'
  },

  {
    type: 'motion-to-compel',
    applicableCaseTypes: ['civil', 'corporate', 'family'],
    title: 'Motion to Compel Discovery',
    description: 'Request to compel responses to discovery requests',
    legalStandard: 'preponderance-of-evidence',
    common_grounds: [
      'Failure to respond to discovery requests',
      'Inadequate or evasive responses',
      'Improper objections to discovery',
      'Failure to produce documents',
      'Refusal to attend deposition',
      'Assertion of meritless privilege'
    ],
    required_citations: [
      'Fed. R. Civ. P. 37',
      'Fed. R. Civ. P. 26(b)',
      'Fed. R. Civ. P. 30',
      'Fed. R. Civ. P. 34'
    ],
    typical_evidence: [
      'Discovery requests',
      'Discovery responses',
      'Meet and confer correspondence',
      'Privilege logs',
      'Relevance arguments'
    ],
    hearing_required: false,
    response_time_days: 14,
    likelihood_of_success: 0.60,
    typical_judicial_concerns: [
      'Proportionality of discovery',
      'Burden versus benefit',
      'Protection of privileged information',
      'Good faith meet and confer efforts'
    ],
    best_practices: [
      'Meet and confer in good faith first',
      'Be specific about deficiencies',
      'Address objections individually',
      'Request reasonable sanctions'
    ],
    common_mistakes: [
      'Failure to meet and confer',
      'Overly broad discovery requests',
      'Inadequate documentation',
      'Unreasonable sanctions requests'
    ],
    sample_argument: 'Defendant has failed to adequately respond to legitimate discovery requests. The responses are evasive, incomplete, and contain meritless objections that improperly restrict discovery. This Court should compel complete responses to ensure a fair proceeding.',
    sample_relief: 'WHEREFORE, Movant requests that this Court compel complete responses to the discovery requests and award reasonable attorney fees incurred in bringing this motion.',
    sample_facts: 'On [date], Movant served [discovery requests]. Opposing party responded on [date] with [inadequate responses]. Despite meet and confer efforts, opposing party refuses to provide adequate responses.'
  },

  {
    type: 'motion-for-protective-order',
    applicableCaseTypes: ['civil', 'corporate', 'family'],
    title: 'Motion for Protective Order',
    description: 'Request to limit or protect against discovery abuse',
    legalStandard: 'preponderance-of-evidence',
    common_grounds: [
      'Discovery requests are overly broad',
      'Discovery would cause undue burden',
      'Protection of confidential information',
      'Prevention of harassment',
      'Protection of trade secrets',
      'Privacy concerns',
      'Attorney-client privilege'
    ],
    required_citations: [
      'Fed. R. Civ. P. 26(c)',
      'Seattle Times Co. v. Rhinehart, 467 U.S. 20 (1984)',
      'Fed. R. Civ. P. 26(b)(1)'
    ],
    typical_evidence: [
      'Discovery requests at issue',
      'Cost estimates for compliance',
      'Confidentiality agreements',
      'Trade secret documentation',
      'Privacy impact assessments'
    ],
    hearing_required: false,
    response_time_days: 14,
    likelihood_of_success: 0.50,
    typical_judicial_concerns: [
      'Balancing discovery needs with protection',
      'Alternative methods of obtaining information',
      'Proportionality of protection requested',
      'Good cause for protection'
    ],
    best_practices: [
      'Demonstrate good cause',
      'Propose alternative discovery methods',
      'Be specific about harm',
      'Suggest protective measures'
    ],
    common_mistakes: [
      'Overbroad protection requests',
      'Failure to show good cause',
      'Inadequate meet and confer',
      'Generic confidentiality claims'
    ],
    sample_argument: 'Good cause exists to protect [specific information] from discovery because [specific harm]. Plaintiff seeks overbroad discovery that would cause undue burden on Defendant. This Court should grant a protective order as the requested protection is narrowly tailored and necessary to prevent [specific injury].',
    sample_relief: 'WHEREFORE, Movant requests that this Court enter a protective order limiting discovery as specified herein.',
    sample_facts: 'The discovery requests at issue seek [specific information]. Disclosure would [specific harm] because [factual basis for harm].'
  }
];

// Motion category mappings
export const CRIMINAL_MOTIONS: MotionType[] = [
  'motion-to-dismiss-criminal',
  'motion-to-suppress-evidence',
  'motion-for-change-of-venue',
  'motion-for-discovery',
  'motion-for-bill-of-particulars',
  'motion-for-continuance',
  'motion-to-exclude-witnesses',
  'motion-in-limine',
  'motion-for-severance',
  'motion-to-compel-discovery'
];

export const CIVIL_MOTIONS: MotionType[] = [
  'motion-to-dismiss-civil',
  'motion-for-summary-judgment',
  'motion-for-judgment-on-pleadings',
  'motion-to-compel',
  'motion-for-protective-order',
  'motion-for-sanctions',
  'motion-for-default-judgment',
  'motion-to-amend-pleadings',
  'motion-for-preliminary-injunction',
  'motion-for-class-certification'
];

// Utility functions
export function getMotionTemplate(motionType: MotionType): MotionTemplate | undefined {
  return MOTION_TEMPLATES.find(template => template.type === motionType);
}

export function getMotionsByCategory(caseType: CaseType): MotionTemplate[] {
  return MOTION_TEMPLATES.filter(template => 
    template.applicableCaseTypes.includes(caseType)
  );
}

export function getCriminalMotions(): MotionTemplate[] {
  return MOTION_TEMPLATES.filter(template => 
    CRIMINAL_MOTIONS.includes(template.type)
  );
}

export function getCivilMotions(): MotionTemplate[] {
  return MOTION_TEMPLATES.filter(template => 
    CIVIL_MOTIONS.includes(template.type)
  );
}

export function getCommonMotions(): MotionTemplate[] {
  return MOTION_TEMPLATES.filter(template => 
    template.likelihood_of_success > 0.3
  ).sort((a, b) => b.likelihood_of_success - a.likelihood_of_success);
}

export function getDispositivMotions(): MotionTemplate[] {
  return MOTION_TEMPLATES.filter(template => 
    template.type.includes('dismiss') || 
    template.type.includes('summary-judgment')
  );
}

export function getDiscoveryMotions(): MotionTemplate[] {
  return MOTION_TEMPLATES.filter(template => 
    template.type.includes('discovery') || 
    template.type.includes('compel') || 
    template.type.includes('protective')
  );
}