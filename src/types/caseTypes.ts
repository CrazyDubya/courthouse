import { CaseType, LegalSystem } from './index';

// Burden of proof standards
export type BurdenOfProof = 
  | 'beyond-reasonable-doubt'    // Criminal standard
  | 'preponderance-of-evidence'  // Civil standard
  | 'clear-and-convincing'       // Some civil cases
  | 'substantial-evidence';      // Administrative cases

// Criminal case specific types
export type CrimeCategory = 
  | 'felony'      // Serious crimes, prison > 1 year
  | 'misdemeanor' // Lesser crimes, prison < 1 year
  | 'infraction'  // Minor violations, fines only
  | 'violation';  // Regulatory offenses

export type CrimeType = 
  // Violent crimes
  | 'murder-first-degree'
  | 'murder-second-degree' 
  | 'manslaughter'
  | 'assault-aggravated'
  | 'assault-simple'
  | 'domestic-violence'
  | 'robbery-armed'
  | 'robbery-strong-arm'
  
  // Property crimes
  | 'theft-grand'
  | 'theft-petty'
  | 'burglary-first-degree'
  | 'burglary-second-degree'
  | 'vandalism'
  | 'arson'
  
  // Drug crimes
  | 'possession-controlled-substance'
  | 'possession-with-intent'
  | 'trafficking-drugs'
  | 'manufacturing-drugs'
  
  // Financial crimes
  | 'fraud-identity'
  | 'fraud-credit-card'
  | 'fraud-wire'
  | 'embezzlement'
  | 'money-laundering'
  
  // Traffic offenses
  | 'dui-first'
  | 'dui-repeat'
  | 'reckless-driving'
  | 'hit-and-run'
  
  // Public order
  | 'disorderly-conduct'
  | 'public-intoxication'
  | 'trespassing'
  | 'resisting-arrest';

export interface CriminalCharge {
  id: string;
  crimeType: CrimeType;
  category: CrimeCategory;
  title: string;
  description: string;
  statuteReference: string;
  elements: string[]; // Required elements to prove
  
  // Sentencing guidelines
  minimumSentence?: string;
  maximumSentence?: string;
  fineRange?: { min: number; max: number };
  probationEligible: boolean;
  
  // Enhancements
  enhancementFactors?: string[]; // Prior convictions, weapon use, etc.
  juvenileEligible: boolean;
  capitalEligible: boolean; // Death penalty eligible
}

// Civil case specific types
export type CivilClaimType = 
  // Contract disputes
  | 'breach-of-contract'
  | 'specific-performance'
  | 'contract-interpretation'
  
  // Tort claims
  | 'negligence-personal-injury'
  | 'negligence-professional'
  | 'negligence-product-liability'
  | 'intentional-tort-assault'
  | 'intentional-tort-defamation'
  | 'intentional-tort-privacy'
  
  // Property disputes
  | 'real-estate-dispute'
  | 'landlord-tenant'
  | 'property-damage'
  | 'quiet-title'
  | 'easement-dispute'
  
  // Business/commercial
  | 'partnership-dispute'
  | 'corporate-dissolution'
  | 'intellectual-property'
  | 'trade-secrets'
  | 'non-compete-agreement'
  
  // Employment
  | 'wrongful-termination'
  | 'discrimination-employment'
  | 'wage-and-hour'
  | 'harassment-workplace'
  
  // Family (civil aspects)
  | 'divorce-contested'
  | 'child-custody'
  | 'child-support'
  | 'adoption'
  | 'domestic-relations'
  
  // Government/constitutional
  | 'civil-rights-violation'
  | 'constitutional-challenge'
  | 'administrative-appeal';

export type RemedyType = 
  // Monetary remedies
  | 'compensatory-damages'    // Actual losses
  | 'consequential-damages'   // Foreseeable losses
  | 'punitive-damages'        // Punishment for bad conduct
  | 'nominal-damages'         // Token amount
  | 'liquidated-damages'      // Pre-agreed amount
  
  // Equitable remedies
  | 'injunctive-relief'       // Stop or require action
  | 'specific-performance'    // Force contract performance
  | 'restitution'            // Return unjust enrichment
  | 'rescission'             // Cancel contract
  | 'reformation'            // Modify contract terms
  
  // Declaratory relief
  | 'declaratory-judgment'    // Clarify legal rights
  | 'quiet-title'            // Establish property ownership
  
  // Other
  | 'attorneys-fees'         // Cost recovery
  | 'costs-and-expenses';    // Court costs

export interface CivilClaim {
  id: string;
  claimType: CivilClaimType;
  title: string;
  description: string;
  legalTheory: string;
  elements: string[]; // Required elements to prove
  
  // Damages sought
  economicDamages?: number;
  nonEconomicDamages?: number;
  punitiveDamages?: number;
  attorneyFees?: number;
  
  // Remedies requested
  remediesRequested: RemedyType[];
  injunctiveRelief?: string;
  specificPerformance?: string;
  
  // Case characteristics
  jurisdiction: 'federal' | 'state' | 'local';
  classAction: boolean;
  jurySuitability: boolean; // Some equity cases are judge-only
}

// Enhanced case interfaces
export interface CriminalCase {
  baseType: 'criminal';
  charges: CriminalCharge[];
  burdenOfProof: 'beyond-reasonable-doubt';
  
  // Prosecution details
  jurisdiction: 'federal' | 'state' | 'municipal';
  districtAttorney: string;
  investigatingAgency: string[];
  
  // Defendant information
  defendantCustodyStatus: 'in-custody' | 'released-bail' | 'released-recognizance';
  bailAmount?: number;
  priorConvictions: string[];
  
  // Procedural status
  grandJuryIndictment: boolean;
  plea?: 'guilty' | 'not-guilty' | 'no-contest' | 'not-guilty-by-reason-of-insanity';
  pleaBargainOffered?: string;
  
  // Sentencing considerations
  sentencingGuidelines: string;
  victimImpactStatements: boolean;
  restitutionAmount?: number;
  
  // Special circumstances
  capitalCase: boolean;
  juvenileDefendant: boolean;
  mentalHealthConcerns: boolean;
}

export interface CivilCase {
  baseType: 'civil';
  claims: CivilClaim[];
  burdenOfProof: 'preponderance-of-evidence' | 'clear-and-convincing';

  // Parties information
  plaintiffType: 'individual' | 'corporation' | 'government' | 'non-profit';
  defendantType: 'individual' | 'corporation' | 'government' | 'non-profit';

  // Case management
  discovery: {
    cutoffDate?: Date;
    depositionsAllowed: number;
    interrogatoriesAllowed: number;
    documentRequests: number;
  };

  // Settlement information
  settlementDiscussions: boolean;
  mediationRequired: boolean;
  arbitrationClause: boolean;
  settlementAmount?: number;

  // Damages and relief
  totalDamagesClaimed: number;
  injunctiveReliefSought: boolean;
  classActionStatus: 'individual' | 'proposed-class' | 'certified-class';

  // Economic valuation (for business/SaaS cases)
  economicValuation?: string; // ID reference to EconomicValuation

  // Trial considerations
  juryTrial: boolean;
  complexCase: boolean;
  expertWitnessesRequired: boolean;
}

// Unified case type that includes case-specific properties
export interface EnhancedCase {
  // Base case information
  id: string;
  title: string;
  type: CaseType;
  legalSystem: LegalSystem;
  summary: string;
  facts: string[];
  
  // Case-specific details
  criminal?: CriminalCase;
  civil?: CivilCase;
  
  // Common properties (existing)
  evidence: any[]; // Evidence interface
  participants: any[]; // Participant interface  
  currentPhase: any; // ProceedingPhase
  transcript: any[]; // TranscriptEntry interface
  rulings: any[]; // Ruling interface
  
  // Case outcome tracking
  outcome?: CaseOutcome;
}

// Case outcome types
export type CriminalVerdict = 'guilty' | 'not-guilty' | 'not-guilty-by-reason-of-insanity' | 'hung-jury';
export type CivilVerdict = 'plaintiff' | 'defendant' | 'hung-jury';

export interface CriminalSentence {
  charges: Array<{
    chargeId: string;
    verdict: CriminalVerdict;
    sentence?: {
      prisonTime?: string;
      probationTime?: string;
      fineAmount?: number;
      restitution?: number;
      communityService?: number;
      other?: string[];
    };
  }>;
  totalPrisonTime?: string;
  totalProbationTime?: string;
  totalFines: number;
  totalRestitution: number;
  conditions: string[];
}

export interface CivilJudgment {
  claims: Array<{
    claimId: string;
    verdict: CivilVerdict;
    damages?: {
      compensatory?: number;
      consequential?: number;
      punitive?: number;
      attorneyFees?: number;
    };
    injunctiveRelief?: string[];
    otherRelief?: string[];
  }>;
  totalMonetaryAward: number;
  injunctiveOrders: string[];
  postJudgmentInterest: number;
  appealDeadline: Date;
}

export interface CaseOutcome {
  verdictDate: Date;
  type: 'criminal-verdict' | 'civil-judgment' | 'dismissal' | 'settlement' | 'plea-bargain';
  
  // Outcome details
  criminalSentence?: CriminalSentence;
  civilJudgment?: CivilJudgment;
  settlementTerms?: string;
  dismissalReason?: string;
  
  // Appeal information
  appealable: boolean;
  appealFiled?: boolean;
  appealDeadline?: Date;
  
  // Compliance and enforcement
  restitutionPaid?: number;
  probationStatus?: 'active' | 'completed' | 'violated';
  injunctionCompliance?: 'compliant' | 'violation' | 'contempt';
}

// Court jurisdiction and venue
export interface CourtJurisdiction {
  level: 'trial' | 'appellate' | 'supreme';
  type: 'federal' | 'state' | 'municipal' | 'tribal';
  name: string;
  jurisdiction: string[];
  
  // Case type limitations
  criminalJurisdiction: boolean;
  civilJurisdiction: boolean;
  amountInControversy?: { min?: number; max?: number };
  
  // Special courts
  specializedCourt?: 'drug-court' | 'veterans-court' | 'mental-health-court' | 'family-court' | 'business-court';
}

// Plea bargain and settlement structures
export interface PleaBargain {
  id: string;
  offeredBy: 'prosecution' | 'defense';
  offeredDate: Date;
  expirationDate?: Date;
  
  // Terms
  chargesDropped: string[];
  chargesReduced: Array<{
    originalCharge: string;
    reducedCharge: string;
  }>;
  
  // Sentence recommendation
  recommendedSentence: {
    prisonTime?: string;
    probationTime?: string;
    fineAmount?: number;
    restitution?: number;
    conditions?: string[];
  };
  
  // Acceptance
  status: 'offered' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  acceptanceDate?: Date;
  courtApproval?: 'pending' | 'approved' | 'rejected';
}

export interface Settlement {
  id: string;
  offeredBy: 'plaintiff' | 'defendant';
  offeredDate: Date;
  expirationDate?: Date;

  // Terms
  monetaryAmount?: number;
  nonMonetaryTerms?: string[];
  confidentialityClause: boolean;
  admissionOfLiability: boolean;

  // Approval process
  status: 'offered' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  courtApprovalRequired: boolean;
  courtApproval?: 'pending' | 'approved' | 'rejected';
}

// Economic Valuation for Business/SaaS Cases
export type ValuationMethod =
  | 'dcf'              // Discounted Cash Flow
  | 'market-multiple'  // Market-based multiples
  | 'asset-based'      // Net asset value
  | 'revenue-multiple' // Revenue-based valuation
  | 'arr-multiple';    // ARR-based valuation

export type RevenueType = 'subscription' | 'one-time' | 'usage-based' | 'license' | 'service' | 'other';
export type CustomerSegment = 'enterprise' | 'smb' | 'individual' | 'government' | 'non-profit';
export type ContractTerm = 'monthly' | 'quarterly' | 'annual' | 'multi-year' | 'perpetual';

export interface RevenueDataPoint {
  period: Date;
  amount: number;
  periodType: 'monthly' | 'quarterly' | 'annual';
  breakdown?: {
    newRevenue: number;
    expansionRevenue: number;
    contractionRevenue: number;
    churnedRevenue: number;
  };
}

export interface RevenueProjection {
  period: Date;
  amount: number;
  confidence: number; // 0-1 confidence level
  assumptions: string[];
  growthRate?: number;
}

export interface CustomerCohort {
  cohort: string; // e.g., '2024-Q1'
  acquisitionDate: Date;
  initialCount: number;
  retentionRates: number[]; // Retention by period
  lifetimeValue: number;
  acquisitionCost: number;
}

export interface CustomerMetrics {
  total: number;
  active: number;
  churned: number;
  newCustomers: number;
  avgContractValue: number;
  avgContractLength: number; // months

  // Segmentation
  bySegment: Record<CustomerSegment, number>;
  byContractTerm: Record<ContractTerm, number>;

  // Retention metrics
  retention: {
    rate: number; // Current retention rate
    netRetention: number; // Including expansion
    cohorts: CustomerCohort[];
  };

  // Growth metrics
  cac: number; // Customer Acquisition Cost
  paybackPeriod: number; // months
  ltv: number; // Lifetime Value
  ltvCacRatio: number; // LTV:CAC ratio
}

export interface SaaSMetrics {
  // Core metrics
  arr: number; // Annual Recurring Revenue
  mrr: number; // Monthly Recurring Revenue

  // Growth metrics
  mrrGrowthRate: number; // Month-over-month growth
  arrGrowthRate: number; // Year-over-year growth

  // Churn metrics
  customerChurnRate: number; // % customers lost
  revenueChurnRate: number; // % revenue lost
  negativeChurnRate: number; // Expansion - Churn

  // Efficiency metrics
  quickRatio: number; // (New MRR + Expansion) / (Churned MRR + Contraction)
  magicNumber: number; // Net new ARR / Sales & Marketing spend
  ruleOf40: number; // Growth rate + Profit margin

  // Unit economics
  arpu: number; // Average Revenue Per User
  arppu: number; // Average Revenue Per Paying User

  // Calculated at
  calculatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
}

export interface DamageCalculation {
  // Lost revenue
  lostRevenue: {
    historical: number; // Actual lost revenue
    projected: number; // Future revenue loss
    breakdown: {
      subscriptionLoss: number;
      expansionLoss: number;
      oneTimeLoss: number;
    };
  };

  // Customer impact
  lostCustomers: {
    count: number;
    lifetimeValue: number;
    segmentImpact: Record<CustomerSegment, number>;
  };

  // Business impact
  businessImpact: {
    marketShareLoss: number;
    brandDamage: number;
    competitiveDisadvantage: number;
    operationalDisruption: number;
  };

  // Mitigation costs
  mitigationCosts: {
    remediation: number;
    customerRecovery: number;
    reputationRepair: number;
    legalAndCompliance: number;
    other: number;
  };

  // Total calculations
  subtotal: number;
  interestRate?: number;
  interest?: number;
  total: number;

  // Justification
  methodology: string;
  assumptions: string[];
  supportingDocuments: string[];
}

export interface ValuationAnalysis {
  method: ValuationMethod;
  baselineValue: number; // Pre-incident valuation
  currentValue: number; // Post-incident valuation
  valueLoss: number; // Difference

  // Valuation inputs
  inputs: {
    discountRate?: number;
    growthRate?: number;
    multiple?: number;
    terminalValue?: number;
    comparableCompanies?: string[];
  };

  // Assumptions and sensitivity
  assumptions: string[];
  sensitivityAnalysis?: {
    scenario: string;
    value: number;
    probability: number;
  }[];

  calculatedBy: string; // Expert/system that performed calculation
  calculatedAt: Date;
}

export interface EconomicValuation {
  id: string;
  caseId: string;

  // SaaS and subscription metrics
  saasMetrics?: SaaSMetrics;

  // Customer data
  customerMetrics: CustomerMetrics;

  // Revenue tracking
  revenue: {
    historical: RevenueDataPoint[];
    projected: RevenueProjection[];
    revenueTypes: Record<RevenueType, number>;
  };

  // Valuation analyses
  valuations: ValuationAnalysis[];
  preferredValuation?: ValuationMethod;

  // Damage calculation
  damages: DamageCalculation;

  // Timeline of economic impact
  impactTimeline: Array<{
    date: Date;
    event: string;
    economicImpact: number;
    description: string;
  }>;

  // Expert opinions
  expertOpinions?: Array<{
    expertId: string;
    expertName: string;
    valuation: number;
    methodology: string;
    reasoning: string;
    submittedAt: Date;
  }>;

  // LLM analysis
  llmAnalysis?: {
    summary: string;
    keyFindings: string[];
    risks: string[];
    opportunities: string[];
    analyzedAt: Date;
    model: string;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  status: 'draft' | 'under-review' | 'approved' | 'challenged';
  version: number;
}