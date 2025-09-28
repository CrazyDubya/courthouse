import { Ollama } from 'ollama';
import { LLMConfig, LLMMessage, LLMResponse } from '../types/index.js';

interface OllamaInstance {
  id: string;
  host: string;
  port: number;
  client: Ollama;
  isHealthy: boolean;
  activeRequests: number;
  maxConcurrentRequests: number;
  lastHealthCheck: Date;
  models: string[];
}

interface ModelAssignment {
  model: string;
  preferredInstances: string[];
  loadBalancingStrategy: 'round-robin' | 'least-connections' | 'random';
}

export class OllamaPoolService {
  private instances: Map<string, OllamaInstance> = new Map();
  private modelAssignments: Map<string, ModelAssignment> = new Map();
  private roundRobinCounters: Map<string, number> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultPools();
    this.startHealthChecking();
  }

  private initializeDefaultPools(): void {
    const defaultInstances = [
      { 
        host: process.env.OLLAMA_HOST || 'http://localhost:11434', 
        port: 11434,
        maxConcurrent: 2 
      },
      { 
        host: process.env.OLLAMA_SECONDARY_HOST || 'http://localhost:11435', 
        port: 11435,
        maxConcurrent: 2 
      },
      { 
        host: process.env.OLLAMA_TERTIARY_HOST || 'http://localhost:11436', 
        port: 11436,
        maxConcurrent: 2 
      }
    ];

    defaultInstances.forEach((config, index) => {
      const instanceId = `ollama_${config.port}`;
      this.addInstance(instanceId, config.host, config.port, config.maxConcurrent);
    });

    this.setupDefaultModelAssignments();
  }

  private setupDefaultModelAssignments(): void {
    const assignments: ModelAssignment[] = [
      {
        model: 'llama3:latest',
        preferredInstances: ['ollama_11434', 'ollama_11435'],
        loadBalancingStrategy: 'least-connections'
      },
      {
        model: 'mistral:7b',
        preferredInstances: ['ollama_11435', 'ollama_11436'],
        loadBalancingStrategy: 'round-robin'
      },
      {
        model: 'gemma2:9b',
        preferredInstances: ['ollama_11436', 'ollama_11434'],
        loadBalancingStrategy: 'round-robin'
      },
      {
        model: 'llama3.2:3b',
        preferredInstances: ['ollama_11434', 'ollama_11435', 'ollama_11436'],
        loadBalancingStrategy: 'least-connections'
      },
      {
        model: 'smollm2:1.7b',
        preferredInstances: ['ollama_11434', 'ollama_11435', 'ollama_11436'],
        loadBalancingStrategy: 'least-connections'
      }
    ];

    assignments.forEach(assignment => {
      this.modelAssignments.set(assignment.model, assignment);
      this.roundRobinCounters.set(assignment.model, 0);
    });
  }

  addInstance(
    id: string, 
    host: string, 
    port: number, 
    maxConcurrentRequests = 3
  ): void {
    const client = new Ollama({ host });
    
    const instance: OllamaInstance = {
      id,
      host,
      port,
      client,
      isHealthy: false,
      activeRequests: 0,
      maxConcurrentRequests,
      lastHealthCheck: new Date(0),
      models: []
    };

    this.instances.set(id, instance);
    console.log(`Added Ollama instance: ${id} (${host}:${port})`);
  }

  removeInstance(id: string): boolean {
    const instance = this.instances.get(id);
    if (!instance) return false;

    if (instance.activeRequests > 0) {
      console.warn(`Cannot remove instance ${id} with ${instance.activeRequests} active requests`);
      return false;
    }

    this.instances.delete(id);
    console.log(`Removed Ollama instance: ${id}`);
    return true;
  }

  async generateResponse(config: LLMConfig, messages: LLMMessage[]): Promise<LLMResponse> {
    const instance = await this.selectInstance(config.model);
    
    if (!instance) {
      throw new Error(`No healthy Ollama instances available for model: ${config.model}`);
    }

    instance.activeRequests++;
    
    try {
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\\n');
      
      const response = await instance.client.generate({
        model: config.model,
        prompt: prompt,
        options: {
          temperature: config.temperature || 0.7,
          num_predict: config.maxTokens || 1000,
        },
      });

      return {
        content: response.response,
      };

    } finally {
      instance.activeRequests--;
    }
  }

  async streamResponse(
    config: LLMConfig, 
    messages: LLMMessage[],
    onChunk: (chunk: string) => void,
    onComplete: (content: string) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    const instance = await this.selectInstance(config.model);
    
    if (!instance) {
      onError(new Error(`No healthy Ollama instances available for model: ${config.model}`));
      return;
    }

    instance.activeRequests++;
    
    try {
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\\n');
      
      const stream = await instance.client.generate({
        model: config.model,
        prompt: prompt,
        stream: true,
        options: {
          temperature: config.temperature || 0.7,
          num_predict: config.maxTokens || 1000,
        },
      });

      let fullContent = '';

      for await (const chunk of stream) {
        if (chunk.response) {
          fullContent += chunk.response;
          onChunk(chunk.response);
        }

        if (chunk.done) {
          onComplete(fullContent);
          break;
        }
      }

    } catch (error) {
      onError(error as Error);
    } finally {
      instance.activeRequests--;
    }
  }

  private async selectInstance(model: string): Promise<OllamaInstance | null> {
    const assignment = this.modelAssignments.get(model);
    
    if (!assignment) {
      return this.selectFromAllInstances();
    }

    const availableInstances = assignment.preferredInstances
      .map(id => this.instances.get(id))
      .filter((instance): instance is OllamaInstance => 
        instance !== undefined && 
        instance.isHealthy && 
        instance.activeRequests < instance.maxConcurrentRequests &&
        instance.models.includes(model)
      );

    if (availableInstances.length === 0) {
      return this.selectFromAllInstances();
    }

    switch (assignment.loadBalancingStrategy) {
      case 'least-connections':
        return availableInstances.reduce((least, current) => 
          current.activeRequests < least.activeRequests ? current : least
        );

      case 'round-robin':
        const counter = this.roundRobinCounters.get(model) || 0;
        const selected = availableInstances[counter % availableInstances.length];
        this.roundRobinCounters.set(model, counter + 1);
        return selected;

      case 'random':
        const randomIndex = Math.floor(Math.random() * availableInstances.length);
        return availableInstances[randomIndex];

      default:
        return availableInstances[0];
    }
  }

  private selectFromAllInstances(): OllamaInstance | null {
    const healthyInstances = Array.from(this.instances.values())
      .filter(instance => 
        instance.isHealthy && 
        instance.activeRequests < instance.maxConcurrentRequests
      );

    if (healthyInstances.length === 0) return null;

    return healthyInstances.reduce((least, current) => 
      current.activeRequests < least.activeRequests ? current : least
    );
  }

  async validateModel(model: string, instanceId?: string): Promise<boolean> {
    if (instanceId) {
      const instance = this.instances.get(instanceId);
      return instance ? this.checkModelOnInstance(instance, model) : false;
    }

    for (const instance of this.instances.values()) {
      if (await this.checkModelOnInstance(instance, model)) {
        return true;
      }
    }

    return false;
  }

  private async checkModelOnInstance(instance: OllamaInstance, model: string): Promise<boolean> {
    try {
      const models = await instance.client.list();
      return models.models.some(m => m.name === model);
    } catch {
      return false;
    }
  }

  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, 30000);

    this.performHealthChecks();
  }

  private async performHealthChecks(): Promise<void> {
    const healthCheckPromises = Array.from(this.instances.values()).map(async (instance) => {
      try {
        const models = await instance.client.list();
        instance.isHealthy = true;
        instance.models = models.models.map(m => m.name);
        instance.lastHealthCheck = new Date();
        
        if (!instance.isHealthy) {
          console.log(`Instance ${instance.id} is now healthy`);
        }
      } catch (error) {
        if (instance.isHealthy) {
          console.warn(`Instance ${instance.id} health check failed:`, error);
        }
        instance.isHealthy = false;
        instance.models = [];
        instance.lastHealthCheck = new Date();
      }
    });

    await Promise.all(healthCheckPromises);
  }

  getInstanceStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    for (const [id, instance] of this.instances.entries()) {
      status[id] = {
        host: instance.host,
        port: instance.port,
        healthy: instance.isHealthy,
        activeRequests: instance.activeRequests,
        maxConcurrentRequests: instance.maxConcurrentRequests,
        models: instance.models,
        lastHealthCheck: instance.lastHealthCheck.toISOString()
      };
    }

    return status;
  }

  getModelAssignments(): Record<string, ModelAssignment> {
    return Object.fromEntries(this.modelAssignments);
  }

  updateModelAssignment(model: string, assignment: Partial<ModelAssignment>): void {
    const existing = this.modelAssignments.get(model);
    
    if (existing) {
      this.modelAssignments.set(model, { ...existing, ...assignment });
    } else {
      this.modelAssignments.set(model, {
        model,
        preferredInstances: assignment.preferredInstances || [],
        loadBalancingStrategy: assignment.loadBalancingStrategy || 'least-connections'
      });
    }

    if (!this.roundRobinCounters.has(model)) {
      this.roundRobinCounters.set(model, 0);
    }
  }

  async pullModel(model: string, instanceId?: string): Promise<void> {
    const instances = instanceId 
      ? [this.instances.get(instanceId)].filter(Boolean) as OllamaInstance[]
      : Array.from(this.instances.values()).filter(instance => instance.isHealthy);

    const pullPromises = instances.map(async (instance) => {
      try {
        console.log(`Pulling model ${model} on instance ${instance.id}`);
        await instance.client.pull({ model });
        console.log(`Successfully pulled model ${model} on instance ${instance.id}`);
        
        if (!instance.models.includes(model)) {
          instance.models.push(model);
        }
      } catch (error) {
        console.error(`Failed to pull model ${model} on instance ${instance.id}:`, error);
        throw error;
      }
    });

    await Promise.all(pullPromises);
  }

  shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    console.log('Ollama pool service shut down');
  }
}