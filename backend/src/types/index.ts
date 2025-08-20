export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'openrouter' | 'groq';
  model: string;
  apiKey?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMRequest {
  id: string;
  messages: LLMMessage[];
  config: LLMConfig;
  priority?: number;
  userId?: string;
  sessionId?: string;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: LLMResponse;
  error?: string;
}

export interface WebSocketMessage {
  type: 'llm_request' | 'llm_response' | 'llm_stream' | 'llm_error' | 'status_update';
  requestId?: string;
  data?: any;
  error?: string;
}

export interface Case {
  id: string;
  title: string;
  type: 'civil' | 'criminal';
  summary: string;
  participants: Participant[];
  evidence: Evidence[];
  transcript: TranscriptEntry[];
  rulings: Ruling[];
  currentPhase: ProceedingPhase;
  settings?: SimulationSettings;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface Participant {
  id: string;
  name: string;
  role: ParticipantRole;
  description?: string;
  aiControlled: boolean;
  llmConfig?: LLMConfig;
  emotionalState?: Record<string, number>;
}

export interface Evidence {
  id: string;
  title: string;
  type: 'document' | 'video' | 'audio' | 'photo' | 'testimony' | 'physical';
  description: string;
  submittedBy: string;
  exhibit?: string;
  filePath?: string;
  admissible: boolean;
  privileged: boolean;
  chainOfCustody: string[];
  createdAt: Date;
}

export interface TranscriptEntry {
  id: string;
  timestamp: Date;
  speaker: string;
  role: ParticipantRole;
  content: string;
  type: 'statement' | 'exhibit' | 'ruling' | 'objection';
  metadata?: Record<string, any>;
}

export interface Ruling {
  id: string;
  timestamp: Date;
  judge: string;
  type: 'procedural' | 'evidentiary' | 'objection' | 'motion';
  subject: string;
  decision: 'granted' | 'denied' | 'sustained' | 'overruled';
  reasoning?: string;
}

export interface SimulationSettings {
  realtimeSpeed: number;
  autoProgress: boolean;
  jurySize: number;
  enableObjections: boolean;
  complexityLevel: 'simple' | 'intermediate' | 'advanced';
}

export type ParticipantRole = 
  | 'judge' 
  | 'prosecutor' 
  | 'defense-attorney' 
  | 'plaintiff-attorney'
  | 'defendant'
  | 'plaintiff'
  | 'witness'
  | 'jury-member'
  | 'court-clerk'
  | 'bailiff';

export type ProceedingPhase = 
  | 'pre-trial'
  | 'jury-selection' 
  | 'opening-statements'
  | 'plaintiff-case'
  | 'defense-case'
  | 'closing-arguments'
  | 'jury-deliberation'
  | 'verdict'
  | 'sentencing';

export type ObjectionType = 
  | 'relevance'
  | 'hearsay'
  | 'speculation'
  | 'leading-question'
  | 'argumentative'
  | 'compound'
  | 'assumes-facts'
  | 'vague';