import { CourtroomScene } from './scene/CourtroomScene.js';
import { SimulationEngine } from './engine/SimulationEngine.js';
import { AIEngine } from './engine/AIEngine.js';
import { CaseManager } from './case/CaseManager.js';
import { EvidenceManager } from './case/EvidenceManager.js';
import { CharacterManager } from './characters/CharacterManager.js';
import { UIManager } from './ui/UIManager.js';
import { ChatManager } from './ui/ChatManager.js';
import { ConfigManager } from './config/ConfigManager.js';

class CourtroomSimulator {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentCase = null;
        this.simulationMode = 'guided';
        
        // Initialize managers
        this.configManager = new ConfigManager();
        this.aiEngine = new AIEngine();
        this.caseManager = new CaseManager();
        this.evidenceManager = new EvidenceManager();
        this.characterManager = new CharacterManager();
        this.uiManager = new UIManager();
        this.chatManager = new ChatManager();
        
        // Initialize 3D scene
        this.scene = new CourtroomScene();
        
        // Initialize simulation engine
        this.simulationEngine = new SimulationEngine(
            this.aiEngine,
            this.caseManager,
            this.characterManager,
            this.scene
        );
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize configuration
            await this.configManager.init();
            
            // Initialize AI engine
            await this.aiEngine.init();
            
            // Initialize 3D scene
            await this.scene.init();
            
            // Initialize UI
            this.uiManager.init();
            
            // Initialize chat
            this.chatManager.init();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load saved configuration
            await this.loadSavedConfiguration();
            
            console.log('Courtroom Simulator initialized successfully');
            
            // Add welcome message to chat
            this.chatManager.addMessage('System', 'Welcome to the LLM Courtroom Simulator! Please configure your case and AI settings to begin.');
            
        } catch (error) {
            console.error('Failed to initialize simulator:', error);
            this.chatManager.addMessage('System', 'Error: Failed to initialize simulator. Please check the console for details.');
        }
    }
    
    setupEventListeners() {
        // Control panel events
        document.getElementById('start-simulation').addEventListener('click', () => this.startSimulation());
        document.getElementById('pause-simulation').addEventListener('click', () => this.pauseSimulation());
        document.getElementById('reset-simulation').addEventListener('click', () => this.resetSimulation());
        
        // Camera control events
        document.getElementById('camera-judge').addEventListener('click', () => this.scene.setCameraView('judge'));
        document.getElementById('camera-jury').addEventListener('click', () => this.scene.setCameraView('jury'));
        document.getElementById('camera-counsel').addEventListener('click', () => this.scene.setCameraView('counsel'));
        document.getElementById('camera-witness').addEventListener('click', () => this.scene.setCameraView('witness'));
        
        // Case management events
        document.getElementById('generate-case').addEventListener('click', () => this.generateCase());
        document.getElementById('load-case').addEventListener('click', () => this.loadCase());
        document.getElementById('upload-evidence').addEventListener('click', () => this.uploadEvidence());
        
        // AI configuration events
        document.getElementById('configure-ai').addEventListener('click', () => this.configureAI());
        
        // Simulation mode changes
        document.getElementById('simulation-mode').addEventListener('change', (e) => {
            this.simulationMode = e.target.value;
            this.updateSimulationMode();
        });
        
        // Legal system changes
        document.getElementById('legal-system').addEventListener('change', (e) => {
            this.updateLegalSystem(e.target.value);
        });
        
        // Jury size changes
        document.getElementById('jury-size').addEventListener('change', (e) => {
            this.updateJurySize(parseInt(e.target.value));
        });
        
        // Witness toggle changes
        document.getElementById('witness-toggle').addEventListener('change', (e) => {
            this.updateWitnessToggle(e.target.value);
        });
        
        // Chat events
        document.getElementById('send-chat').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });
        document.getElementById('clear-chat').addEventListener('click', () => this.chatManager.clearChat());
        document.getElementById('export-chat').addEventListener('click', () => this.chatManager.exportChat());
        
        // Window events
        window.addEventListener('resize', () => this.scene.onWindowResize());
        window.addEventListener('beforeunload', () => this.saveConfiguration());
    }
    
    async startSimulation() {
        if (!this.currentCase) {
            this.chatManager.addMessage('System', 'Please create or load a case before starting the simulation.');
            return;
        }
        
        try {
            this.isRunning = true;
            this.isPaused = false;
            
            // Update UI
            document.getElementById('start-simulation').disabled = true;
            document.getElementById('pause-simulation').disabled = false;
            
            // Start simulation engine
            await this.simulationEngine.start(this.currentCase, this.simulationMode);
            
            this.chatManager.addMessage('System', 'Simulation started successfully!');
            
        } catch (error) {
            console.error('Failed to start simulation:', error);
            this.chatManager.addMessage('System', 'Error: Failed to start simulation.');
            this.isRunning = false;
        }
    }
    
    async pauseSimulation() {
        if (!this.isRunning) return;
        
        try {
            this.isPaused = true;
            
            // Update UI
            document.getElementById('start-simulation').disabled = false;
            document.getElementById('pause-simulation').disabled = true;
            
            // Pause simulation engine
            await this.simulationEngine.pause();
            
            this.chatManager.addMessage('System', 'Simulation paused.');
            
        } catch (error) {
            console.error('Failed to pause simulation:', error);
            this.chatManager.addMessage('System', 'Error: Failed to pause simulation.');
        }
    }
    
    async resetSimulation() {
        try {
            this.isRunning = false;
            this.isPaused = false;
            
            // Update UI
            document.getElementById('start-simulation').disabled = false;
            document.getElementById('pause-simulation').disabled = true;
            
            // Reset simulation engine
            await this.simulationEngine.reset();
            
            // Reset scene
            this.scene.reset();
            
            // Clear chat
            this.chatManager.clearChat();
            
            this.chatManager.addMessage('System', 'Simulation reset successfully.');
            
        } catch (error) {
            console.error('Failed to reset simulation:', error);
            this.chatManager.addMessage('System', 'Error: Failed to reset simulation.');
        }
    }
    
    async generateCase() {
        try {
            const caseTitle = document.getElementById('case-title').value;
            const caseType = document.getElementById('case-type').value;
            const caseSummary = document.getElementById('case-summary').value;
            
            if (!caseTitle || !caseSummary) {
                this.chatManager.addMessage('System', 'Please provide a case title and summary.');
                return;
            }
            
            this.chatManager.addMessage('System', 'Generating case... This may take a few moments.');
            
            // Generate case using AI
            const generatedCase = await this.caseManager.generateCase({
                title: caseTitle,
                type: caseType,
                summary: caseSummary,
                legalSystem: document.getElementById('legal-system').value,
                jurySize: parseInt(document.getElementById('jury-size').value),
                witnessesEnabled: document.getElementById('witness-toggle').value === 'on'
            });
            
            this.currentCase = generatedCase;
            
            // Update scene with case information
            this.scene.updateCaseInfo(generatedCase);
            
            // Update UI
            this.updateCaseStatus(generatedCase);
            
            this.chatManager.addMessage('System', `Case "${generatedCase.title}" generated successfully!`);
            
        } catch (error) {
            console.error('Failed to generate case:', error);
            this.chatManager.addMessage('System', 'Error: Failed to generate case. Please check your AI configuration.');
        }
    }
    
    async loadCase() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const caseData = await this.caseManager.loadCase(file);
                    this.currentCase = caseData;
                    
                    // Update scene
                    this.scene.updateCaseInfo(caseData);
                    
                    // Update UI
                    this.updateCaseStatus(caseData);
                    this.updateCaseForm(caseData);
                    
                    this.chatManager.addMessage('System', `Case "${caseData.title}" loaded successfully!`);
                }
            };
            input.click();
        } catch (error) {
            console.error('Failed to load case:', error);
            this.chatManager.addMessage('System', 'Error: Failed to load case.');
        }
    }
    
    async uploadEvidence() {
        try {
            const fileInput = document.getElementById('evidence-files');
            const files = fileInput.files;
            
            if (files.length === 0) {
                this.chatManager.addMessage('System', 'Please select evidence files to upload.');
                return;
            }
            
            this.chatManager.addMessage('System', `Uploading ${files.length} evidence file(s)...`);
            
            // Process evidence files
            const evidence = await this.evidenceManager.processEvidence(files);
            
            // Add evidence to current case
            if (this.currentCase) {
                this.currentCase.evidence = evidence;
                this.updateCaseStatus(this.currentCase);
            }
            
            this.chatManager.addMessage('System', `Evidence uploaded successfully!`);
            
        } catch (error) {
            console.error('Failed to upload evidence:', error);
            this.chatManager.addMessage('System', 'Error: Failed to upload evidence.');
        }
    }
    
    async configureAI() {
        try {
            const engine = document.getElementById('ai-engine').value;
            const config = await this.configManager.getAIConfig(engine);
            
            // Show configuration dialog
            const apiKey = prompt(`Enter your ${engine} API key:`);
            if (apiKey) {
                await this.configManager.setAIConfig(engine, { apiKey });
                this.chatManager.addMessage('System', `${engine} API key configured successfully.`);
            }
        } catch (error) {
            console.error('Failed to configure AI:', error);
            this.chatManager.addMessage('System', 'Error: Failed to configure AI.');
        }
    }
    
    updateSimulationMode() {
        this.simulationMode = document.getElementById('simulation-mode').value;
        this.chatManager.addMessage('System', `Simulation mode changed to: ${this.simulationMode}`);
    }
    
    updateLegalSystem(system) {
        this.chatManager.addMessage('System', `Legal system changed to: ${system}`);
        // Update simulation engine with new legal system
        this.simulationEngine.setLegalSystem(system);
    }
    
    updateJurySize(size) {
        this.chatManager.addMessage('System', `Jury size changed to: ${size}`);
        // Update scene with new jury size
        this.scene.updateJurySize(size);
    }
    
    updateWitnessToggle(toggle) {
        this.chatManager.addMessage('System', `Witnesses ${toggle === 'on' ? 'enabled' : 'disabled'}`);
        // Update simulation engine
        this.simulationEngine.setWitnessesEnabled(toggle === 'on');
    }
    
    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message) {
            this.chatManager.addMessage('User', message);
            input.value = '';
            
            // Process user message (could trigger AI responses, etc.)
            this.processUserMessage(message);
        }
    }
    
    async processUserMessage(message) {
        // Simple message processing - could be expanded
        if (message.toLowerCase().includes('help')) {
            this.chatManager.addMessage('System', 'Available commands: help, status, pause, resume, evidence, witnesses');
        } else if (message.toLowerCase().includes('status')) {
            this.chatManager.addMessage('System', `Simulation: ${this.isRunning ? (this.isPaused ? 'Paused' : 'Running') : 'Stopped'}`);
        }
    }
    
    updateCaseStatus(caseData) {
        const statusDiv = document.getElementById('case-status');
        statusDiv.innerHTML = `
            <div><span class="status-indicator status-active"></span>Case: ${caseData.title}</div>
            <div><span class="status-indicator status-active"></span>Evidence: ${caseData.evidence?.length || 0} files</div>
            <div><span class="status-indicator status-active"></span>Witnesses: ${caseData.witnesses?.length || 0}</div>
        `;
    }
    
    updateCaseForm(caseData) {
        document.getElementById('case-title').value = caseData.title;
        document.getElementById('case-type').value = caseData.type;
        document.getElementById('case-summary').value = caseData.summary;
    }
    
    async loadSavedConfiguration() {
        try {
            const config = await this.configManager.loadConfig();
            if (config) {
                // Apply saved configuration
                if (config.simulationMode) {
                    document.getElementById('simulation-mode').value = config.simulationMode;
                    this.simulationMode = config.simulationMode;
                }
                if (config.legalSystem) {
                    document.getElementById('legal-system').value = config.legalSystem;
                }
                if (config.jurySize) {
                    document.getElementById('jury-size').value = config.jurySize;
                }
                if (config.witnessToggle) {
                    document.getElementById('witness-toggle').value = config.witnessToggle;
                }
                if (config.aiEngine) {
                    document.getElementById('ai-engine').value = config.aiEngine;
                }
            }
        } catch (error) {
            console.error('Failed to load saved configuration:', error);
        }
    }
    
    async saveConfiguration() {
        try {
            const config = {
                simulationMode: this.simulationMode,
                legalSystem: document.getElementById('legal-system').value,
                jurySize: document.getElementById('jury-size').value,
                witnessToggle: document.getElementById('witness-toggle').value,
                aiEngine: document.getElementById('ai-engine').value
            };
            
            await this.configManager.saveConfig(config);
        } catch (error) {
            console.error('Failed to save configuration:', error);
        }
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.courtroomSimulator = new CourtroomSimulator();
});

// Export for potential use in other modules
export { CourtroomSimulator };