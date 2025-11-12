import axios, { AxiosInstance, AxiosError } from 'axios';
import { Case, Evidence, SimulationSettings } from '../types';

export interface BackendConfig {
  baseURL: string;
  timeout?: number;
}

export interface CaseResponse {
  case: Case;
  message: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

export interface StatusResponse {
  status: string;
  services: {
    llm: {
      providers: Record<string, { available: boolean; models?: string[] }>;
    };
    queue: {
      pending: number;
      processing: number;
      completed: number;
      failed: number;
    };
    sessions: {
      active: number;
      total: number;
    };
    ollama: Array<{
      port: number;
      healthy: boolean;
      models: string[];
      activeRequests: number;
    }>;
    circuitBreakers: Record<string, { state: string; failures: number }>;
  };
  uptime: number;
  timestamp: string;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageWaitTime: number;
  averageProcessingTime: number;
}

export interface EvidenceUploadResponse {
  evidence: Evidence;
  message: string;
}

export class BackendAPIClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(config: BackendConfig = { baseURL: 'http://localhost:3001' }) {
    this.baseURL = config.baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('🌐 API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
        return response;
      },
      (error: AxiosError) => {
        console.error(
          `❌ API Error: ${error.config?.url} - ${error.response?.status || 'Network Error'}`
        );
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      // Server responded with error
      const message = (error.response.data as any)?.error || error.message;
      return new Error(`Backend Error (${error.response.status}): ${message}`);
    } else if (error.request) {
      // Request made but no response
      return new Error('Backend Server Not Responding. Please ensure the backend is running.');
    } else {
      // Something else happened
      return new Error(`Request Error: ${error.message}`);
    }
  }

  // Health Check
  async checkHealth(): Promise<HealthResponse> {
    const response = await this.client.get<HealthResponse>('/api/health');
    return response.data;
  }

  // Get comprehensive status
  async getStatus(): Promise<StatusResponse> {
    const response = await this.client.get<StatusResponse>('/api/status');
    return response.data;
  }

  // Case Management
  async createCase(caseData: Partial<Case>): Promise<CaseResponse> {
    const response = await this.client.post<CaseResponse>('/api/cases', caseData);
    return response.data;
  }

  async getCase(caseId: string): Promise<Case> {
    const response = await this.client.get<Case>(`/api/cases/${caseId}`);
    return response.data;
  }

  async updateCase(caseId: string, updates: Partial<Case>): Promise<CaseResponse> {
    const response = await this.client.put<CaseResponse>(`/api/cases/${caseId}`, updates);
    return response.data;
  }

  async deleteCase(caseId: string): Promise<{ message: string }> {
    const response = await this.client.delete<{ message: string }>(`/api/cases/${caseId}`);
    return response.data;
  }

  async listCases(filters?: {
    type?: string;
    phase?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ cases: Case[]; total: number }> {
    const response = await this.client.get<{ cases: Case[]; total: number }>('/api/cases', {
      params: filters,
    });
    return response.data;
  }

  // Evidence Management
  async uploadEvidence(
    caseId: string,
    file: File,
    metadata: {
      title: string;
      description: string;
      type: string;
      submittedBy: string;
    }
  ): Promise<EvidenceUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caseId', caseId);
    formData.append('title', metadata.title);
    formData.append('description', metadata.description);
    formData.append('type', metadata.type);
    formData.append('submittedBy', metadata.submittedBy);

    const response = await this.client.post<EvidenceUploadResponse>(
      '/api/evidence/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async getEvidence(evidenceId: string): Promise<Evidence> {
    const response = await this.client.get<Evidence>(`/api/evidence/${evidenceId}`);
    return response.data;
  }

  async listEvidence(caseId: string): Promise<Evidence[]> {
    const response = await this.client.get<Evidence[]>(`/api/evidence/case/${caseId}`);
    return response.data;
  }

  // LLM Queue Management
  async getQueueStats(): Promise<QueueStats> {
    const response = await this.client.get<QueueStats>('/api/llm/queue/stats');
    return response.data;
  }

  async clearQueue(): Promise<{ message: string; cleared: number }> {
    const response = await this.client.post<{ message: string; cleared: number }>(
      '/api/llm/queue/clear'
    );
    return response.data;
  }

  // LLM Provider Management
  async validateProvider(provider: string, config: any): Promise<{ valid: boolean; error?: string }> {
    const response = await this.client.post<{ valid: boolean; error?: string }>(
      '/api/llm/validate',
      { provider, config }
    );
    return response.data;
  }

  async listAvailableModels(provider: string): Promise<string[]> {
    const response = await this.client.get<string[]>(`/api/llm/models/${provider}`);
    return response.data;
  }

  // Session Management
  async createSession(caseId: string, settings: SimulationSettings): Promise<{ sessionId: string }> {
    const response = await this.client.post<{ sessionId: string }>('/api/sessions', {
      caseId,
      settings,
    });
    return response.data;
  }

  async getSession(sessionId: string): Promise<any> {
    const response = await this.client.get(`/api/sessions/${sessionId}`);
    return response.data;
  }

  async updateSessionStatus(
    sessionId: string,
    status: 'active' | 'paused' | 'completed'
  ): Promise<{ message: string }> {
    const response = await this.client.patch<{ message: string }>(
      `/api/sessions/${sessionId}/status`,
      { status }
    );
    return response.data;
  }

  // Utility methods
  getBaseURL(): string {
    return this.baseURL;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.checkHealth();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
let instance: BackendAPIClient | null = null;

export function getBackendAPIClient(config?: BackendConfig): BackendAPIClient {
  if (!instance) {
    instance = new BackendAPIClient(config);
  }
  return instance;
}

export function resetBackendAPIClient(): void {
  instance = null;
}
