import { CourtroomScene } from './scenes/CourtroomScene.js';
import { 
  Role, 
  CaseType, 
  LegalSystem, 
  LLMProvider,
  SimulationDepth,
  Case,
  Character,
  CourtroomAction,
  TrialPhase,
  ApiResponse
} from '../shared/types/index.js';

class CourtroomApp {
  private scene!: CourtroomScene;
  private currentCase: Case | null = null;
  private characters: Character[] = [];
  private websocket: WebSocket | null = null;
  private isSimulationRunning = false;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    // Initialize 3D scene
    const canvas = document.getElementById('courtroom-canvas') as HTMLCanvasElement;
    this.scene = new CourtroomScene(canvas);

    // Setup event listeners
    this.setupEventListeners();

    // Connect to WebSocket
    this.connectWebSocket();

    // Load saved configurations
    this.loadConfigurations();
  }

  private setupEventListeners(): void {
    // Control panel buttons
    document.getElementById('new-case-btn')?.addEventListener('click', () => {
      this.showNewCaseModal();
    });

    document.getElementById('start-simulation-btn')?.addEventListener('click', () => {
      this.startSimulation();
    });

    document.getElementById('pause-simulation-btn')?.addEventListener('click', () => {
      this.pauseSimulation();
    });

    document.getElementById('sidebar-btn')?.addEventListener('click', () => {
      this.requestSidebar();
    });

    document.getElementById('llm-config-btn')?.addEventListener('click', () => {
      this.showLLMConfigModal();
    });

    document.getElementById('settings-btn')?.addEventListener('click', () => {
      this.showSettingsModal();
    });

    // Modal event listeners
    this.setupModalEventListeners();

    // Speed slider
    const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
    speedSlider?.addEventListener('input', (e) => {
      const speed = parseInt((e.target as HTMLInputElement).value);
      this.updateSimulationSpeed(speed);
    });
  }

  private setupModalEventListeners(): void {
    // New Case Modal
    document.getElementById('cancel-new-case')?.addEventListener('click', () => {
      this.hideModal('new-case-modal');
    });

    document.getElementById('new-case-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createNewCase();
    });

    // LLM Config Modal
    document.getElementById('cancel-llm-config')?.addEventListener('click', () => {
      this.hideModal('llm-config-modal');
    });

    document.getElementById('llm-config-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveLLMConfig();
    });

    // Settings Modal
    document.getElementById('cancel-settings')?.addEventListener('click', () => {
      this.hideModal('settings-modal');
    });

    document.getElementById('settings-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSettings();
    });

    // Temperature slider
    const tempSlider = document.getElementById('llm-temperature-input') as HTMLInputElement;
    tempSlider?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      document.getElementById('temperature-value')!.textContent = value;
    });

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hideModal(modal.id);
        }
      });
    });
  }

  private connectWebSocket(): void {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected');
      };

      this.websocket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(() => this.connectWebSocket(), 3000);
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'action:generated':
        this.handleNewAction(message.payload);
        break;
      case 'phase:changed':
        this.updateCurrentPhase(message.payload.phase);
        break;
      case 'simulation:started':
        this.onSimulationStarted();
        break;
      case 'simulation:completed':
        this.onSimulationCompleted(message.payload);
        break;
      case 'simulation:paused':
        this.onSimulationPaused();
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private showNewCaseModal(): void {
    this.populateUserRolesCheckboxes();
    this.showModal('new-case-modal');
  }

  private populateUserRolesCheckboxes(): void {
    const container = document.getElementById('user-roles-checkboxes')!;
    container.innerHTML = '';

    Object.values(Role).forEach((role: string) => {
      const div = document.createElement('div');
      div.className = 'checkbox-item';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `role-${role}`;
      checkbox.value = role;

      const label = document.createElement('label');
      label.htmlFor = `role-${role}`;
      label.textContent = role.replace('_', ' ').toUpperCase();

      div.appendChild(checkbox);
      div.appendChild(label);
      container.appendChild(div);
    });
  }

  private async createNewCase(): Promise<void> {
    const title = (document.getElementById('case-title-input') as HTMLInputElement).value;
    const type = (document.getElementById('case-type-select') as HTMLSelectElement).value as CaseType;
    const legalSystem = (document.getElementById('legal-system-select') as HTMLSelectElement).value as LegalSystem;
    const description = (document.getElementById('case-desc-input') as HTMLTextAreaElement).value;
    const jurySize = parseInt((document.getElementById('jury-size-input') as HTMLInputElement).value);

    const userRoles: Role[] = [];
    document.querySelectorAll('#user-roles-checkboxes input:checked').forEach(checkbox => {
      userRoles.push((checkbox as HTMLInputElement).value as Role);
    });

    const caseData = {
      title,
      type,
      legalSystem,
      description,
      userControlledRoles: userRoles,
      jurySize
    };

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseData)
      });

      const result: ApiResponse<Case> = await response.json();
      
      if (result.success && result.data) {
        this.currentCase = result.data;
        this.updateCaseInfo();
        this.hideModal('new-case-modal');
        this.enableSimulationControls();
        
        // Load characters for this case
        await this.loadCaseCharacters();
      } else {
        alert('Failed to create case: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating case:', error);
      alert('Failed to create case. Please try again.');
    }
  }

  private async loadCaseCharacters(): Promise<void> {
    if (!this.currentCase) return;

    try {
      const response = await fetch(`/api/cases/${this.currentCase.id}/characters`);
      const result: ApiResponse<Character[]> = await response.json();
      
      if (result.success && result.data) {
        this.characters = result.data;
        this.updateCharacterList();
      }
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  }

  private showLLMConfigModal(): void {
    this.loadLLMConfig();
    this.showModal('llm-config-modal');
  }

  private loadLLMConfig(): void {
    const config = this.getLLMConfigFromStorage();
    
    (document.getElementById('llm-provider-select') as HTMLSelectElement).value = config.provider || 'openai';
    (document.getElementById('llm-model-input') as HTMLInputElement).value = config.model || '';
    (document.getElementById('llm-api-key-input') as HTMLInputElement).value = config.apiKey || '';
    (document.getElementById('llm-base-url-input') as HTMLInputElement).value = config.baseUrl || '';
    (document.getElementById('llm-temperature-input') as HTMLInputElement).value = (config.temperature || 0.7).toString();
    document.getElementById('temperature-value')!.textContent = (config.temperature || 0.7).toString();
  }

  private saveLLMConfig(): void {
    const config = {
      provider: (document.getElementById('llm-provider-select') as HTMLSelectElement).value as LLMProvider,
      model: (document.getElementById('llm-model-input') as HTMLInputElement).value,
      apiKey: (document.getElementById('llm-api-key-input') as HTMLInputElement).value,
      baseUrl: (document.getElementById('llm-base-url-input') as HTMLInputElement).value,
      temperature: parseFloat((document.getElementById('llm-temperature-input') as HTMLInputElement).value)
    };

    this.saveLLMConfigToStorage(config);
    this.hideModal('llm-config-modal');
    
    // Send config to server
    this.sendLLMConfigToServer(config);
  }

  private showSettingsModal(): void {
    this.loadSettings();
    this.showModal('settings-modal');
  }

  private loadSettings(): void {
    const settings = this.getSettingsFromStorage();
    
    (document.getElementById('simulation-depth-select') as HTMLSelectElement).value = settings.simulationDepth || 'standard';
    (document.getElementById('allow-objections') as HTMLInputElement).checked = settings.allowObjections !== false;
    (document.getElementById('allow-sidebars') as HTMLInputElement).checked = settings.allowSidebars !== false;
    (document.getElementById('include-pretrial') as HTMLInputElement).checked = settings.preTrial !== false;
    (document.getElementById('evidence-video-length') as HTMLInputElement).value = (settings.evidenceVideoLength || 5).toString();
  }

  private saveSettings(): void {
    const settings = {
      simulationDepth: (document.getElementById('simulation-depth-select') as HTMLSelectElement).value as SimulationDepth,
      allowObjections: (document.getElementById('allow-objections') as HTMLInputElement).checked,
      allowSidebars: (document.getElementById('allow-sidebars') as HTMLInputElement).checked,
      preTrial: (document.getElementById('include-pretrial') as HTMLInputElement).checked,
      evidenceVideoLength: parseInt((document.getElementById('evidence-video-length') as HTMLInputElement).value)
    };

    this.saveSettingsToStorage(settings);
    this.hideModal('settings-modal');
  }

  private async startSimulation(): Promise<void> {
    if (!this.currentCase) {
      alert('Please create or load a case first.');
      return;
    }

    try {
      const response = await fetch(`/api/simulation/${this.currentCase.id}/start`, {
        method: 'POST'
      });

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        this.isSimulationRunning = true;
        this.updateSimulationControls();
      } else {
        alert('Failed to start simulation: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error starting simulation:', error);
      alert('Failed to start simulation. Please try again.');
    }
  }

  private async pauseSimulation(): Promise<void> {
    try {
      const response = await fetch(`/api/simulation/${this.currentCase?.id}/pause`, {
        method: 'POST'
      });

      const result: ApiResponse = await response.json();
      
      if (result.success) {
        this.isSimulationRunning = false;
        this.updateSimulationControls();
      }
    } catch (error) {
      console.error('Error pausing simulation:', error);
    }
  }

  private async requestSidebar(): Promise<void> {
    try {
      await fetch(`/api/simulation/${this.currentCase?.id}/sidebar`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error requesting sidebar:', error);
    }
  }

  private updateSimulationSpeed(speed: number): void {
    // Send speed update to server
    fetch(`/api/simulation/${this.currentCase?.id}/speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed })
    }).catch(error => {
      console.error('Error updating simulation speed:', error);
    });
  }

  private handleNewAction(action: CourtroomAction): void {
    this.addActionToLog(action);
    this.scene.highlightRole(action.actor);
    
    // Remove highlight after 2 seconds
    setTimeout(() => {
      this.scene.removeHighlight(action.actor);
    }, 2000);

    // Focus camera on actor
    this.scene.focusOnRole(action.actor);
  }

  private addActionToLog(action: CourtroomAction): void {
    const actionList = document.getElementById('action-list')!;
    
    // Clear placeholder text
    if (actionList.textContent?.includes('No actions yet')) {
      actionList.innerHTML = '';
    }

    const actionElement = document.createElement('div');
    actionElement.className = 'action-item';
    
    const timestamp = new Date(action.timestamp).toLocaleTimeString();
    actionElement.innerHTML = `
      <div class="timestamp">${timestamp}</div>
      <div class="role">${action.actor.replace('_', ' ').toUpperCase()}:</div>
      <div>${action.content}</div>
    `;

    actionList.appendChild(actionElement);
    actionList.scrollTop = actionList.scrollHeight;
  }

  private updateCurrentPhase(phase: TrialPhase): void {
    const phaseElement = document.getElementById('current-phase')!;
    phaseElement.textContent = phase.replace('_', ' ').toUpperCase();
  }

  private updateCaseInfo(): void {
    if (!this.currentCase) return;

    document.getElementById('case-title')!.textContent = this.currentCase.title;
    document.getElementById('case-type')!.textContent = this.currentCase.type.toUpperCase();
    document.getElementById('case-status')!.textContent = this.currentCase.status.toUpperCase();
    document.getElementById('case-description')!.textContent = this.currentCase.description;
  }

  private updateCharacterList(): void {
    const characterList = document.getElementById('character-list')!;
    
    if (this.characters.length === 0) {
      characterList.innerHTML = '<p style="color: #888; text-align: center;">No characters loaded...</p>';
      return;
    }

    characterList.innerHTML = '';
    
    this.characters.forEach(character => {
      const characterElement = document.createElement('div');
      characterElement.className = 'character-card';
      
      characterElement.innerHTML = `
        <div class="character-name">${character.name}</div>
        <div class="character-role">${character.role.replace('_', ' ').toUpperCase()}</div>
        <div class="character-status">${character.active ? 'Active' : 'Inactive'}</div>
      `;

      characterList.appendChild(characterElement);
    });
  }

  private enableSimulationControls(): void {
    (document.getElementById('start-simulation-btn') as HTMLButtonElement).disabled = false;
  }

  private updateSimulationControls(): void {
    const startBtn = document.getElementById('start-simulation-btn') as HTMLButtonElement;
    const pauseBtn = document.getElementById('pause-simulation-btn') as HTMLButtonElement;
    const sidebarBtn = document.getElementById('sidebar-btn') as HTMLButtonElement;

    if (this.isSimulationRunning) {
      startBtn.disabled = true;
      pauseBtn.disabled = false;
      sidebarBtn.disabled = false;
    } else {
      startBtn.disabled = false;
      pauseBtn.disabled = true;
      sidebarBtn.disabled = true;
    }
  }

  private onSimulationStarted(): void {
    this.isSimulationRunning = true;
    this.updateSimulationControls();
  }

  private onSimulationCompleted(data: any): void {
    this.isSimulationRunning = false;
    this.updateSimulationControls();
    
    alert(`Simulation completed. Verdict: ${data.verdict}`);
  }

  private onSimulationPaused(): void {
    this.isSimulationRunning = false;
    this.updateSimulationControls();
  }

  private showModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  private hideModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  private loadConfigurations(): void {
    // Load any saved configurations from localStorage
    const llmConfig = this.getLLMConfigFromStorage();
    if (llmConfig.provider) {
      this.sendLLMConfigToServer(llmConfig);
    }
  }

  private getLLMConfigFromStorage(): any {
    try {
      return JSON.parse(localStorage.getItem('llmConfig') || '{}');
    } catch {
      return {};
    }
  }

  private saveLLMConfigToStorage(config: any): void {
    localStorage.setItem('llmConfig', JSON.stringify(config));
  }

  private getSettingsFromStorage(): any {
    try {
      return JSON.parse(localStorage.getItem('settings') || '{}');
    } catch {
      return {};
    }
  }

  private saveSettingsToStorage(settings: any): void {
    localStorage.setItem('settings', JSON.stringify(settings));
  }

  private async sendLLMConfigToServer(config: any): Promise<void> {
    try {
      await fetch('/api/llm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
    } catch (error) {
      console.error('Error sending LLM config to server:', error);
    }
  }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new CourtroomApp();
});