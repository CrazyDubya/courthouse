import { ParticipantRole, CaseType } from './index';

// MBTI-based personality types for judges
export type JudgeMBTI = 
  | 'ESTJ' // The Executive - Strong organizational skills, traditional, decisive
  | 'ISTJ' // The Logistician - Methodical, reliable, detail-oriented
  | 'ENTJ' // The Commander - Natural leader, strategic, efficient
  | 'INTJ' // The Architect - Independent, analytical, visionary
  | 'ENFJ' // The Protagonist - Empathetic, inspiring, people-focused
  | 'INFJ' // The Advocate - Insightful, principled, idealistic
  | 'ENTP' // The Debater - Innovative, versatile, challenging
  | 'INTP'; // The Thinker - Logical, flexible, abstract

// Judicial temperament categories
export type JudicialTemperament = 
  | 'strict' // By-the-book, harsh on violations, formal
  | 'balanced' // Fair, measured, considers all sides
  | 'lenient' // Compassionate, gives second chances, understanding
  | 'pragmatic' // Focuses on practical outcomes, efficient
  | 'scholarly' // Intellectual, loves legal theory, detailed analysis
  | 'folksy' // Down-to-earth, plain-spoken, relatable
  | 'authoritarian' // Demands respect, controls courtroom strictly
  | 'progressive'; // Open to new ideas, reform-minded, innovative

// Judge specializations and expertise areas
export type JudgeSpecialization = 
  | 'criminal-law' // Expert in criminal procedure and sentencing
  | 'civil-litigation' // Commercial disputes, contracts, torts
  | 'family-law' // Divorce, custody, adoption, domestic violence
  | 'corporate-law' // Business law, securities, mergers
  | 'constitutional-law' // Civil rights, government powers, amendments
  | 'environmental-law' // Environmental regulations, public health
  | 'intellectual-property' // Patents, trademarks, copyright
  | 'immigration-law' // Deportation, asylum, citizenship
  | 'bankruptcy-law' // Debt relief, reorganization, liquidation
  | 'administrative-law' // Government agencies, regulations
  | 'general-practice'; // No specific specialization

// RPG-style attributes for judges
export interface JudgeAttributes {
  wisdom: number; // 1-10: Legal knowledge and sound judgment
  authority: number; // 1-10: Command presence and respect
  empathy: number; // 1-10: Understanding of human condition
  analyticalSkill: number; // 1-10: Logical reasoning and problem-solving
  patience: number; // 1-10: Tolerance for lengthy proceedings
  strictness: number; // 1-10: Adherence to rules and procedures
  fairness: number; // 1-10: Impartial treatment of all parties
  efficiency: number; // 1-10: Speed of decision-making
  charisma: number; // 1-10: Personal magnetism and persuasiveness
  integrity: number; // 1-10: Moral character and honesty
}

// Judicial quirks and tendencies
export interface JudgeQuirks {
  // Procedural quirks
  strictOnTime: boolean; // Starts court exactly on time
  allowsFood: boolean; // Permits eating in courtroom
  informalAddress: boolean; // Prefers casual speech
  longRecesses: boolean; // Takes extended breaks
  
  // Decision-making tendencies
  harshOnFirstOffenders: boolean; // Tough on inexperienced defendants
  softOnSeniors: boolean; // Lenient with elderly participants
  strictOnAttorneys: boolean; // Demands professional behavior
  allowsObjections: boolean; // Tolerates frequent objections
  
  // Communication style
  asksManyQuestions: boolean; // Actively questions witnesses/attorneys
  givesLongExplanations: boolean; // Explains rulings in detail
  usesHumor: boolean; // Employs humor to ease tension
  quotesLaw: boolean; // References statutes and case law frequently
  
  // Bias tendencies (subtle influences)
  proProsecution: number; // -5 to +5: Bias toward prosecution
  proPlaintiff: number; // -5 to +5: Bias toward plaintiffs
  proBusinesses: number; // -5 to +5: Bias toward corporate interests
  proIndividuals: number; // -5 to +5: Bias toward individual litigants
}

// Case memory - remembers specific cases and patterns
export interface CaseMemory {
  caseId: string;
  caseType: CaseType;
  participants: string[]; // Names of key participants
  outcome: string; // Verdict, settlement, dismissal
  notableEvents: string[]; // Key moments, objections, rulings
  personalNotes: string; // Judge's private observations
  timestamp: Date;
  appealResult?: 'affirmed' | 'reversed' | 'remanded' | 'pending';
}

// Experience memory - tracks career statistics and patterns
export interface ExperienceMemory {
  totalCasesPresided: number;
  casesByType: Record<CaseType, number>;
  convictionRate: number; // For criminal cases
  plaintiffWinRate: number; // For civil cases
  appealRate: number; // Percentage of cases appealed
  reversalRate: number; // Percentage of appeals reversed
  averageSentenceLength: number; // In months for criminal cases
  averageDamageAward: number; // For civil cases
  motionsGranted: number;
  motionsDenied: number;
  objectionsIssued: number;
  contemptCitations: number;
  yearsOnBench: number;
  careerStartDate: Date;
  retirementEligible: boolean;
}

// Participant memory - remembers attorneys and other regular participants
export interface ParticipantMemory {
  participantName: string;
  role: ParticipantRole;
  casesWithParticipant: number;
  winRate: number; // Success rate when appearing before this judge
  credibilityScore: number; // 1-10: Judge's trust in this participant
  notableQualities: string[]; // "well-prepared", "often late", "aggressive"
  lastAppearance: Date;
  relationship: 'neutral' | 'positive' | 'negative' | 'respected' | 'problematic';
  personalNotes: string; // Private observations about this participant
}

// Historical decision tracking
export interface HistoricalDecision {
  id: string;
  timestamp: Date;
  caseId: string;
  decisionType: 'ruling' | 'sentence' | 'motion' | 'objection' | 'contempt';
  subject: string; // What the decision was about
  decision: string; // The actual decision made
  reasoning: string; // Judge's stated reasoning
  personalFactors: string[]; // Unstated influences (personality, mood, experience)
  confidence: number; // 1-10: How confident the judge was
  appealed: boolean;
  appealResult?: 'affirmed' | 'reversed' | 'remanded';
}

// Comprehensive judge memory system
export interface JudgeMemory {
  cases: CaseMemory[];
  experience: ExperienceMemory;
  participants: ParticipantMemory[];
  decisions: HistoricalDecision[];
  enabled: boolean; // Toggle for one-off simulations
  retentionPeriod: number; // Days to keep case memories (default: 1825 = 5 years)
}

// Current judicial state
export interface JudicialState {
  currentMood: number; // -10 to +10: Affected by courtroom events
  energyLevel: number; // 1-10: Fatigue affects decision quality
  stressLevel: number; // 1-10: High stress leads to shorter temper
  patientRemaining: number; // 0-10: Depletes during difficult proceedings
  rulingStreak: number; // Consecutive rulings in same direction
  
  // Session-specific state
  sessionStartTime: Date;
  breaksTaken: number;
  objectionsHeard: number;
  contemptThreshold: number; // Dynamic threshold for contempt citations
  lastMajorRuling: Date;
}

// Complete enhanced judge profile
export interface EnhancedJudgeProfile {
  // Core identification
  id: string;
  name: string;
  
  // Personality system
  mbtiType: JudgeMBTI;
  temperament: JudicialTemperament;
  specialization: JudgeSpecialization;
  attributes: JudgeAttributes;
  quirks: JudgeQuirks;
  
  // Memory systems
  memory: JudgeMemory;
  currentState: JudicialState;
  
  // Career information
  appointedDate: Date;
  appointingAuthority: string; // "Elected", "Governor Smith", "President Jones"
  previousCareer: string[]; // "Prosecutor", "Defense Attorney", "Law Professor"
  lawSchool: string;
  graduationYear: number;
  barAdmissions: string[]; // States where admitted to practice
  
  // Reputation and ratings
  reputationScore: number; // 1-10: Overall community respect
  attorneyRating: number; // 1-10: How attorneys rate this judge
  reversalRating: number; // 1-10: How appeals courts rate decisions
  politicalLeanings: number; // -10 to +10: Conservative to liberal
  
  // Settings
  retirementDate?: Date;
  temporaryAssignment?: boolean;
  jurisdictionLevel: 'municipal' | 'county' | 'state' | 'federal' | 'appellate' | 'supreme';
}

// Judge decision-making factors
export interface DecisionFactors {
  legalPrecedent: number; // Weight given to case law
  statutoryText: number; // Weight given to written law
  personalExperience: number; // Weight given to past cases
  communityStandards: number; // Weight given to local values
  politicalConsiderations: number; // Weight given to political implications
  emotionalFactors: number; // Weight given to sympathetic circumstances
  efficiency: number; // Weight given to court management
  appealRisk: number; // Consideration of reversal risk
}

// Judge personality template system
export interface JudgePersonalityTemplate {
  name: string;
  description: string;
  mbtiType: JudgeMBTI;
  temperament: JudicialTemperament;
  specialization: JudgeSpecialization;
  attributeRanges: {
    [K in keyof JudgeAttributes]: [number, number]; // Min and max values
  };
  commonQuirks: Partial<JudgeQuirks>;
  decisionFactorWeights: DecisionFactors;
  typicalSayings: string[]; // Common phrases this type of judge uses
}