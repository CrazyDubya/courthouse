import { ParticipantRole, CaseType } from './index';

// Types of pre-trial motions
export type MotionType = 
  // Criminal motions
  | 'motion-to-dismiss-criminal'
  | 'motion-to-suppress-evidence'
  | 'motion-for-change-of-venue'
  | 'motion-for-discovery'
  | 'motion-for-bill-of-particulars'
  | 'motion-for-continuance'
  | 'motion-to-exclude-witnesses'
  | 'motion-in-limine'
  | 'motion-for-severance'
  | 'motion-to-compel-discovery'
  
  // Civil motions
  | 'motion-to-dismiss-civil'
  | 'motion-for-summary-judgment'
  | 'motion-for-judgment-on-pleadings'
  | 'motion-to-compel'
  | 'motion-for-protective-order'
  | 'motion-for-sanctions'
  | 'motion-for-default-judgment'
  | 'motion-to-amend-pleadings'
  | 'motion-for-preliminary-injunction'
  | 'motion-for-class-certification';

// Status of a motion
export type MotionStatus = 
  | 'pending' // Filed but not yet heard
  | 'scheduled' // Hearing scheduled
  | 'under-advisement' // Judge is considering
  | 'granted' // Motion approved
  | 'denied' // Motion rejected
  | 'granted-in-part' // Partially approved
  | 'withdrawn' // Movant withdrew motion
  | 'moot'; // Circumstances changed

// Legal standards for different motions
export type LegalStandard = 
  | 'preponderance-of-evidence' // More likely than not (civil)
  | 'clear-and-convincing' // High probability
  | 'beyond-reasonable-doubt' // Criminal standard
  | 'arbitrary-and-capricious' // Administrative review
  | 'substantial-evidence' // Administrative support
  | 'rational-basis' // Constitutional review
  | 'intermediate-scrutiny' // Constitutional review
  | 'strict-scrutiny'; // Constitutional review

// Grounds for dismissal
export interface DismissalGrounds {
  lackOfJurisdiction: boolean;
  failureToStateClaimForRelief: boolean;
  failureToJoinNecessaryParty: boolean;
  statuteOfLimitations: boolean;
  constitutionalViolation: boolean;
  prosecutorialMisconduct: boolean;
  insufficientEvidence: boolean;
  doubleJeopardy: boolean;
  speedy_trial_violation: boolean;
}

// Discovery request types
export type DiscoveryType = 
  | 'interrogatories' // Written questions
  | 'document-production' // Produce documents
  | 'depositions' // Oral testimony under oath
  | 'admissions' // Admit/deny facts
  | 'physical-examination' // Medical examination
  | 'mental-examination' // Psychological evaluation
  | 'expert-witness-disclosure' // Expert testimony plans
  | 'witness-list' // Fact witness identification
  | 'exhibit-list'; // Physical evidence list

// Motion filing details
export interface Motion {
  id: string;
  type: MotionType;
  title: string;
  filedBy: string; // Participant ID
  filedAgainst?: string; // Opposing party ID
  filingDate: Date;
  status: MotionStatus;
  
  // Legal arguments
  legalStandard: LegalStandard;
  grounds: string[]; // Legal basis for motion
  factualBasis: string[]; // Facts supporting motion
  legalCitations: string[]; // Cases, statutes, rules cited
  
  // Procedural details
  hearingRequired: boolean;
  hearingDate?: Date;
  responseDeadline?: Date;
  replyDeadline?: Date;
  
  // Motion content
  argument: string; // Main legal argument
  relief_requested: string; // What movant wants
  supporting_evidence: string[]; // Evidence IDs
  
  // Responses and replies
  responses: MotionResponse[];
  reply?: string; // Movant's reply to response
  
  // Judicial handling
  assignedJudge?: string;
  rulingDate?: Date;
  ruling?: MotionRuling;
  
  // Case impact
  caseType: CaseType;
  urgent: boolean;
  dispositive: boolean; // Could end the case
  
  // Metadata
  pageCount: number;
  attachments: string[];
  served_parties: string[];
  certificate_of_service: boolean;
}

// Response to a motion
export interface MotionResponse {
  id: string;
  respondent: string; // Participant ID
  responseDate: Date;
  
  // Response content
  opposition: string; // Legal argument against motion
  counter_facts: string[]; // Disputed facts
  counter_citations: string[]; // Opposing legal authority
  
  // Procedural response
  standing_objection: boolean; // Respondent lacks standing
  procedural_defects: string[]; // Motion filing problems
  
  // Alternative relief
  counter_motion?: Motion; // Cross-motion or alternative
  conditional_agreement?: string; // "If X, then Y"
}

// Judge's ruling on motion
export interface MotionRuling {
  id: string;
  judge: string; // Judge ID
  rulingDate: Date;
  decision: MotionStatus; // granted, denied, etc.
  
  // Judicial reasoning
  legal_reasoning: string; // Judge's legal analysis
  factual_findings: string[]; // Facts judge found credible
  legal_conclusions: string[]; // Legal determinations
  
  // Ruling details
  conditions?: string[]; // Conditions if granted in part
  deadlines?: Date[]; // New deadlines imposed
  sanctions?: string; // Penalties for frivolous motion
  
  // Appealability
  appealable: boolean;
  interlocutory: boolean; // Can appeal before final judgment
  stay_pending_appeal?: boolean;
  
  // Case impact
  case_dispositive: boolean; // Ends the case
  discovery_impact?: string; // How ruling affects discovery
  trial_impact?: string; // How ruling affects trial
}

// Calendar entry for motion practice
export interface MotionCalendarEntry {
  id: string;
  motionId: string;
  eventType: 'filing-deadline' | 'response-deadline' | 'hearing' | 'ruling-deadline';
  date: Date;
  time?: string;
  duration?: number; // Minutes
  location?: string; // Courtroom
  participants: string[]; // Required attendees
  description: string;
  reminder_sent: boolean;
  completed: boolean;
}

// Motion workflow status
export interface MotionWorkflow {
  motionId: string;
  currentPhase: 'filing' | 'service' | 'response-period' | 'reply-period' | 'hearing' | 'under-advisement' | 'ruled';
  nextDeadline?: Date;
  nextAction?: string;
  responsible_party?: string; // Who needs to act next
  overdue: boolean;
  
  // Workflow history
  timeline: MotionTimelineEntry[];
}

export interface MotionTimelineEntry {
  date: Date;
  event: string;
  actor: string; // Who did the action
  details?: string;
  document_filed?: string;
}

// Standard motion templates
export interface MotionTemplate {
  type: MotionType;
  applicableCaseTypes: CaseType[];
  title: string;
  description: string;
  
  // Legal requirements
  legalStandard: LegalStandard;
  common_grounds: string[];
  required_citations: string[];
  typical_evidence: string[];
  
  // Procedural requirements
  page_limit?: number;
  hearing_required: boolean;
  response_time_days: number;
  reply_time_days?: number;
  
  // Success factors
  likelihood_of_success: number; // 0-1 probability
  typical_judicial_concerns: string[];
  best_practices: string[];
  common_mistakes: string[];
  
  // Template text
  sample_argument: string;
  sample_relief: string;
  sample_facts: string;
}

// Motion practice statistics
export interface MotionStatistics {
  motionType: MotionType;
  judge?: string;
  
  // Filing statistics
  total_filed: number;
  filing_rate_per_case: number;
  
  // Outcome statistics
  grant_rate: number;
  denial_rate: number;
  partial_grant_rate: number;
  withdrawal_rate: number;
  
  // Timing statistics
  average_response_time: number; // Days
  average_ruling_time: number; // Days
  hearing_frequency: number; // Percentage requiring hearing
  
  // Quality metrics
  appeal_rate: number;
  reversal_rate: number;
  sanctions_rate: number;
  
  // Context
  time_period: { start: Date; end: Date };
  case_types: CaseType[];
  jurisdiction: string;
}

// Motion brief quality assessment
export interface BriefQuality {
  motionId: string;
  
  // Content quality
  legal_argument_strength: number; // 1-10
  factual_support: number; // 1-10
  citation_quality: number; // 1-10
  organization: number; // 1-10
  
  // Procedural compliance
  formatting_compliance: boolean;
  page_limit_compliance: boolean;
  citation_format_correct: boolean;
  proper_service: boolean;
  
  // Strategic assessment
  timing_appropriate: boolean;
  necessary_for_case: boolean;
  likelihood_of_success: number; // 0-1
  cost_benefit_ratio: number; // 1-10
  
  // Writing quality
  clarity: number; // 1-10
  persuasiveness: number; // 1-10
  professional_tone: boolean;
  grammar_and_style: number; // 1-10
  
  // Overall assessment
  overall_score: number; // 1-100
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
}