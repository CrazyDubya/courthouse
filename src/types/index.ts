export type LegalSystem = 'common-law' | 'civil-law' | 'religious' | 'customary' | 'mixed';

export type CaseType = 'criminal' | 'civil' | 'family' | 'corporate' | 'constitutional';

export type ParticipantRole = 
  | 'judge' 
  | 'prosecutor' 
  | 'plaintiff' 
  | 'defendant' 
  | 'defense-attorney'
  | 'plaintiff-attorney'
  | 'witness'
  | 'jury-member'
  | 'bailiff'
  | 'court-clerk'
  | 'observer';

export type ProceedingPhase = 
  | 'pre-trial'
  | 'jury-selection'
  | 'opening-statements'
  | 'plaintiff-case'
  | 'defense-case'
  | 'witness-examination'
  | 'cross-examination'
  | 'closing-arguments'
  | 'jury-deliberation'
  | 'verdict'
  | 'sentencing';

export type EvidenceType = 'document' | 'image' | 'video' | 'audio' | 'physical' | 'testimony';

export type ObjectionType = 
  | 'relevance'
  | 'hearsay'
  | 'speculation'
  | 'leading-question'
  | 'argumentative'
  | 'asked-and-answered'
  | 'compound-question'
  | 'foundation'
  | 'privilege';

export interface Evidence {
  id: string;
  type: EvidenceType;
  title: string;
  description: string;
  url?: string;
  content?: string;
  metadata?: Record<string, any>;
  admissible: boolean;
  submittedBy: string;
  chainOfCustody: string[];
  privileged?: boolean;
  exhibit?: string;
}

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  aiControlled: boolean;
  llmProvider?: LLMConfig;
  personality: PersonalityTraits;
  background: Background;
  currentMood: number;
  knowledge: string[];
  objectives: string[];
}

export interface PersonalityTraits {
  assertiveness: number;
  empathy: number;
  analyticalThinking: number;
  emotionalStability: number;
  openness: number;
  conscientiousness: number;
  persuasiveness: number;
}

export interface Background {
  age: number;
  education: string;
  experience: string;
  specialization?: string;
  personalHistory: string;
  motivations: string[];
}

export interface Case {
  id: string;
  title: string;
  type: CaseType;
  legalSystem: LegalSystem;
  summary: string;
  facts: string[];
  charges?: string[];
  claims?: string[];
  evidence: Evidence[];
  participants: Participant[];
  currentPhase: ProceedingPhase;
  transcript: TranscriptEntry[];
  rulings: Ruling[];
}

export interface TranscriptEntry {
  id: string;
  timestamp: Date;
  speaker: string;
  role: ParticipantRole;
  content: string;
  type: 'statement' | 'question' | 'objection' | 'ruling' | 'exhibit' | 'sidebar';
  metadata?: Record<string, any>;
}

export interface Ruling {
  id: string;
  timestamp: Date;
  judge: string;
  type: 'objection' | 'motion' | 'admissibility' | 'procedural';
  subject: string;
  decision: 'sustained' | 'overruled' | 'granted' | 'denied';
  reasoning?: string;
}

export type LLMProvider = 
  | 'openai'
  | 'anthropic'
  | 'ollama'
  | 'lmstudio'
  | 'openrouter'
  | 'grok'
  | 'groq'
  | 'local';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface SimulationSettings {
  realtimeSpeed: number;
  autoProgress: boolean;
  detailLevel: 'abbreviated' | 'standard' | 'detailed' | 'full';
  enableObjections: boolean;
  enableSidebar: boolean;
  jurySize: number;
  allowUserIntervention: boolean;
  recordTranscript: boolean;
}

export interface AgentMemory {
  shortTerm: string[];
  longTerm: string[];
  workingMemory: Map<string, any>;
  beliefs: Map<string, number>;
  relationships: Map<string, number>;
}

export interface AgentAction {
  type: 'speak' | 'object' | 'motion' | 'exhibit' | 'think' | 'react';
  content: string;
  target?: string;
  confidence: number;
  reasoning?: string;
}