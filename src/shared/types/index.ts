// Core role types in the courtroom
export enum Role {
  JUDGE = 'judge',
  PROSECUTOR = 'prosecutor',
  PLAINTIFF = 'plaintiff',
  DEFENDANT = 'defendant',
  DEFENSE_LAWYER = 'defense_lawyer',
  PLAINTIFF_LAWYER = 'plaintiff_lawyer',
  WITNESS = 'witness',
  JURY_MEMBER = 'jury_member',
  COURT_REPORTER = 'court_reporter',
  BAILIFF = 'bailiff'
}

// Legal system types
export enum LegalSystem {
  COMMON_LAW = 'common_law',
  CIVIL_LAW = 'civil_law',
  CRIMINAL = 'criminal',
  FAMILY = 'family',
  CORPORATE = 'corporate',
  CONSTITUTIONAL = 'constitutional'
}

// Case types
export enum CaseType {
  CRIMINAL = 'criminal',
  CIVIL = 'civil',
  FAMILY = 'family',
  CORPORATE = 'corporate',
  CONSTITUTIONAL = 'constitutional',
  APPELLATE = 'appellate'
}

// Evidence types
export enum EvidenceType {
  DOCUMENT = 'document',
  PHYSICAL = 'physical',
  TESTIMONIAL = 'testimonial',
  DIGITAL = 'digital',
  AUDIO = 'audio',
  VIDEO = 'video',
  PHOTOGRAPHIC = 'photographic'
}

// Privilege types for discovery
export enum PrivilegeType {
  ATTORNEY_CLIENT = 'attorney_client',
  WORK_PRODUCT = 'work_product',
  SPOUSAL = 'spousal',
  DOCTOR_PATIENT = 'doctor_patient',
  PRIEST_PENITENT = 'priest_penitent',
  TRADE_SECRET = 'trade_secret'
}

// Simulation depth levels
export enum SimulationDepth {
  ABBREVIATED = 'abbreviated',
  STANDARD = 'standard',
  FULL = 'full',
  CUSTOM = 'custom'
}

// LLM providers
export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  OLLAMA = 'ollama',
  LM_STUDIO = 'lm_studio',
  OPENROUTER = 'openrouter',
  GROK = 'grok',
  GROQ = 'groq',
  LOCAL_COMPATIBLE = 'local_compatible'
}

// Character personality traits
export interface PersonalityTrait {
  name: string;
  value: number; // 0-100 scale
  description: string;
}

// Character background
export interface CharacterBackground {
  name: string;
  age: number;
  birthday: string;
  career: string;
  education: string;
  experience: string;
  personality: PersonalityTrait[];
  motivations: string[];
  background: string;
  specialties?: string[];
  weaknesses?: string[];
}

// Evidence item
export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  content: string; // Text content or file path
  metadata: Record<string, any>;
  privileges: PrivilegeType[];
  submittedBy: Role;
  dateSubmitted: Date;
  admissible: boolean;
  objections: string[];
  rulings: string[];
}

// Case information
export interface Case {
  id: string;
  title: string;
  type: CaseType;
  legalSystem: LegalSystem;
  description: string;
  background: string;
  charges?: string[];
  claims?: string[];
  facts: string[];
  evidence: Evidence[];
  witnessLists: Record<Role, string[]>;
  timeline: CaseEvent[];
  status: CaseStatus;
  settings: CaseSettings;
}

export enum CaseStatus {
  PREPARATION = 'preparation',
  DISCOVERY = 'discovery',
  PRE_TRIAL = 'pre_trial',
  TRIAL = 'trial',
  POST_TRIAL = 'post_trial',
  COMPLETED = 'completed'
}

// Case event for timeline
export interface CaseEvent {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  participants: Role[];
  outcome?: string;
}

// Case settings
export interface CaseSettings {
  jurySize: number; // 6-12
  simulationDepth: SimulationDepth;
  userControlledRoles: Role[];
  llmControlledRoles: Role[];
  allowObjections: boolean;
  allowSidebars: boolean;
  allowMiniHearings: boolean;
  preTrial: boolean;
  evidenceVideoLength: number; // seconds
}

// LLM configuration
export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

// Character assigned to an LLM
export interface Character extends CharacterBackground {
  id: string;
  role: Role;
  llmConfig: LLMConfig;
  currentThoughts: string[];
  currentGoals: string[];
  currentPlans: string[];
  memoryLog: string[];
  active: boolean;
}

// Courtroom action types
export enum ActionType {
  OPENING_STATEMENT = 'opening_statement',
  WITNESS_CALL = 'witness_call',
  DIRECT_EXAMINATION = 'direct_examination',
  CROSS_EXAMINATION = 'cross_examination',
  OBJECTION = 'objection',
  RULING = 'ruling',
  EVIDENCE_INTRODUCTION = 'evidence_introduction',
  SIDEBAR = 'sidebar',
  RECESS = 'recess',
  CLOSING_STATEMENT = 'closing_statement',
  JURY_DELIBERATION = 'jury_deliberation',
  VERDICT = 'verdict'
}

// Courtroom action
export interface CourtroomAction {
  id: string;
  type: ActionType;
  timestamp: Date;
  actor: Role;
  target?: Role | null;
  content: string;
  evidence?: string[]; // Evidence IDs
  objection?: ObjectionType;
  ruling?: RulingType;
}

export enum ObjectionType {
  HEARSAY = 'hearsay',
  RELEVANCE = 'relevance',
  LEADING = 'leading',
  ARGUMENTATIVE = 'argumentative',
  SPECULATION = 'speculation',
  COMPOUND = 'compound',
  ASKED_AND_ANSWERED = 'asked_and_answered',
  BEYOND_SCOPE = 'beyond_scope',
  PRIVILEGE = 'privilege'
}

export enum RulingType {
  SUSTAINED = 'sustained',
  OVERRULED = 'overruled',
  WITHDRAWN = 'withdrawn'
}

// Simulation state
export interface SimulationState {
  caseId: string;
  currentPhase: TrialPhase;
  currentActor: Role;
  currentWitness?: string | null;
  evidenceIntroduced: string[];
  objectionsPending: CourtroomAction[];
  sidebarActive: boolean;
  juryDeliberating: boolean;
  completed: boolean;
  verdict?: string;
}

export enum TrialPhase {
  PRE_TRIAL = 'pre_trial',
  JURY_SELECTION = 'jury_selection',
  OPENING_STATEMENTS = 'opening_statements',
  PROSECUTION_CASE = 'prosecution_case',
  DEFENSE_CASE = 'defense_case',
  REBUTTAL = 'rebuttal',
  CLOSING_STATEMENTS = 'closing_statements',
  JURY_INSTRUCTIONS = 'jury_instructions',
  JURY_DELIBERATION = 'jury_deliberation',
  VERDICT = 'verdict',
  SENTENCING = 'sentencing'
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// WebSocket message types
export interface WSMessage {
  type: string;
  payload: any;
  timestamp: Date;
  sender?: Role;
}