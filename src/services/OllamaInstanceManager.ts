import { ParticipantRole } from '../types';
import { Ollama } from 'ollama';

export interface OllamaInstance {
  id: string;
  port: number;
  model: string;
  endpoint: string;
  client: Ollama;
  isHealthy: boolean;
  assignedRoles: ParticipantRole[];
}

export interface OllamaModelConfig {
  model: string;
  port: number;
  roles: ParticipantRole[];
  description: string;
  priority: number;
}

export class OllamaInstanceManager {
  private instances: Map<string, OllamaInstance> = new Map();
  private roleToInstanceMap: Map<ParticipantRole, string> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private defaultConfigs: OllamaModelConfig[] = [
    {
      model: 'llama3:latest',
      port: 11434,
      roles: ['judge'],
      description: 'Primary model for judicial consistency',
      priority: 1
    },
    {
      model: 'mistral:7b',
      port: 11435,
      roles: ['prosecutor', 'plaintiff-attorney', 'defense-attorney'],
      description: 'Analytical model for legal arguments',
      priority: 2
    },
    {
      model: 'gemma2:9b',
      port: 11436,
      roles: ['witness'],
      description: 'Diverse model for witness testimony',
      priority: 3
    },
    {
      model: 'llama3.2:3b',
      port: 11437,
      roles: ['jury-member'],
      description: 'Efficient model for jury members',
      priority: 4
    },
    {
      model: 'qwen2.5:3b',
      port: 11438,
      roles: ['court-clerk', 'bailiff'],
      description: 'Variety model for court staff',
      priority: 5
    }
  ];

  constructor() {
    this.initializeInstances();
    this.startHealthChecking();
  }

  private async initializeInstances(): Promise<void> {
    for (const config of this.defaultConfigs) {
      try {
        const instance: OllamaInstance = {
          id: `ollama-${config.port}`,
          port: config.port,
          model: config.model,
          endpoint: `http://localhost:${config.port}`,
          client: new Ollama({ host: `http://localhost:${config.port}` }),
          isHealthy: false,
          assignedRoles: config.roles
        };

        // Test connection
        await this.testInstanceHealth(instance);
        
        this.instances.set(instance.id, instance);
        
        // Map roles to this instance
        for (const role of config.roles) {
          this.roleToInstanceMap.set(role, instance.id);
        }

        console.log(`✅ Ollama instance initialized: ${config.model} on port ${config.port}`);
      } catch (error) {
        console.warn(`⚠️ Failed to initialize Ollama instance ${config.model} on port ${config.port}:`, error);
      }
    }

    // Fallback: if no instances are healthy, use primary port with llama3
    if (this.instances.size === 0) {
      console.log('🔄 No instances available, creating fallback instance...');
      await this.createFallbackInstance();
    }
  }

  private async createFallbackInstance(): Promise<void> {
    const fallbackInstance: OllamaInstance = {
      id: 'ollama-fallback',
      port: 11434,
      model: 'llama3:latest',
      endpoint: 'http://localhost:11434',
      client: new Ollama({ host: 'http://localhost:11434' }),
      isHealthy: false,
      assignedRoles: ['judge', 'prosecutor', 'defense-attorney', 'witness', 'jury-member', 'plaintiff-attorney', 'court-clerk', 'bailiff']
    };

    try {
      await this.testInstanceHealth(fallbackInstance);
      this.instances.set(fallbackInstance.id, fallbackInstance);
      
      // Map all roles to fallback
      for (const role of fallbackInstance.assignedRoles) {
        this.roleToInstanceMap.set(role, fallbackInstance.id);
      }
      
      console.log('✅ Fallback Ollama instance created');
    } catch (error) {
      console.error('❌ Failed to create fallback instance:', error);
      throw new Error('No Ollama instances available');
    }
  }

  private async testInstanceHealth(instance: OllamaInstance): Promise<boolean> {
    try {
      await instance.client.list();
      instance.isHealthy = true;
      return true;
    } catch (error) {
      instance.isHealthy = false;
      console.warn(`❌ Health check failed for instance ${instance.id}:`, error);
      return false;
    }
  }

  public getInstanceForRole(role: ParticipantRole): OllamaInstance | null {
    const instanceId = this.roleToInstanceMap.get(role);
    if (!instanceId) {
      console.warn(`No instance mapped for role: ${role}`);
      return this.getFallbackInstance();
    }

    const instance = this.instances.get(instanceId);
    if (!instance || !instance.isHealthy) {
      console.warn(`Instance ${instanceId} for role ${role} is not healthy, using fallback`);
      return this.getFallbackInstance();
    }

    return instance;
  }

  private getFallbackInstance(): OllamaInstance | null {
    // Return first healthy instance
    for (const instance of this.instances.values()) {
      if (instance.isHealthy) {
        return instance;
      }
    }
    return null;
  }

  public getAllInstances(): OllamaInstance[] {
    return Array.from(this.instances.values());
  }

  public getHealthyInstances(): OllamaInstance[] {
    return Array.from(this.instances.values()).filter(instance => instance.isHealthy);
  }

  public async assignRoleToInstance(role: ParticipantRole, instanceId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.error(`Instance ${instanceId} not found`);
      return false;
    }

    if (!instance.isHealthy) {
      console.error(`Instance ${instanceId} is not healthy`);
      return false;
    }

    // Remove role from previous instance
    const previousInstanceId = this.roleToInstanceMap.get(role);
    if (previousInstanceId) {
      const previousInstance = this.instances.get(previousInstanceId);
      if (previousInstance) {
        previousInstance.assignedRoles = previousInstance.assignedRoles.filter(r => r !== role);
      }
    }

    // Add role to new instance
    instance.assignedRoles.push(role);
    this.roleToInstanceMap.set(role, instanceId);

    console.log(`✅ Assigned role ${role} to instance ${instanceId} (${instance.model})`);
    return true;
  }

  private startHealthChecking(): void {
    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      for (const instance of this.instances.values()) {
        await this.testInstanceHealth(instance);
      }
    }, 30000);
  }

  public async restartInstance(instanceId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.error(`Instance ${instanceId} not found`);
      return false;
    }

    console.log(`🔄 Restarting instance ${instanceId}...`);
    
    try {
      // Recreate client
      instance.client = new Ollama({ host: instance.endpoint });
      
      // Test health
      await this.testInstanceHealth(instance);
      
      if (instance.isHealthy) {
        console.log(`✅ Instance ${instanceId} restarted successfully`);
        return true;
      } else {
        console.error(`❌ Instance ${instanceId} still unhealthy after restart`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Failed to restart instance ${instanceId}:`, error);
      return false;
    }
  }

  public getRoleAssignments(): Map<ParticipantRole, string> {
    return new Map(this.roleToInstanceMap);
  }

  public getInstanceStats(): { total: number; healthy: number; unhealthy: number } {
    const healthy = this.getHealthyInstances().length;
    const total = this.instances.size;
    return {
      total,
      healthy,
      unhealthy: total - healthy
    };
  }

  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    this.instances.clear();
    this.roleToInstanceMap.clear();
  }
}

// Singleton instance
export const ollamaInstanceManager = new OllamaInstanceManager();