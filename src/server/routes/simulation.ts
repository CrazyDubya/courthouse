import { Router } from 'express';
import { ApiResponse, Case, Character, SimulationState } from '../shared/types/index.js';
import { SimulationEngine } from '../shared/models/SimulationEngine.js';
import { llmManager } from './llm.js';

const router = Router();

// Store active simulations
const activeSimulations: Map<string, SimulationEngine> = new Map();
const simulationStates: Map<string, SimulationState> = new Map();

// External case and character storage (normally would be imported from a service)
let cases: Map<string, Case> = new Map();
let caseCharacters: Map<string, Character[]> = new Map();

// Import the data from cases route (this is a simplified approach)
// In a production app, you'd use a proper database service
import('../routes/cases.js').then((casesModule) => {
  // Access the cases data if needed
});

// Start simulation
router.post('/:caseId/start', async (req, res) => {
  try {
    const { caseId } = req.params;
    
    // Check if simulation is already running
    if (activeSimulations.has(caseId)) {
      const response: ApiResponse = {
        success: false,
        error: 'Simulation is already running for this case'
      };
      return res.status(400).json(response);
    }

    // Get case and characters (in production, fetch from database)
    const caseData = await getCaseById(caseId);
    const characters = await getCharactersByCaseId(caseId);

    if (!caseData) {
      const response: ApiResponse = {
        success: false,
        error: 'Case not found'
      };
      return res.status(404).json(response);
    }

    if (!characters || characters.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'No characters found for this case'
      };
      return res.status(400).json(response);
    }

    // Ensure LLM is configured
    if (!llmManager.getProvider('default')) {
      const response: ApiResponse = {
        success: false,
        error: 'LLM provider not configured. Please configure an LLM provider first.'
      };
      return res.status(400).json(response);
    }

    // Create simulation engine
    const simulation = new SimulationEngine(caseData, characters, llmManager);
    
    // Set up event listeners for simulation
    setupSimulationEventListeners(simulation, caseId);
    
    // Store simulation
    activeSimulations.set(caseId, simulation);
    
    // Start simulation asynchronously
    simulation.start().catch(error => {
      console.error(`Error in simulation ${caseId}:`, error);
      activeSimulations.delete(caseId);
      simulationStates.delete(caseId);
    });

    const response: ApiResponse = {
      success: true,
      message: 'Simulation started successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error starting simulation:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to start simulation'
    };
    
    res.status(500).json(response);
  }
});

// Pause simulation
router.post('/:caseId/pause', async (req, res) => {
  try {
    const { caseId } = req.params;
    const simulation = activeSimulations.get(caseId);
    
    if (!simulation) {
      const response: ApiResponse = {
        success: false,
        error: 'No active simulation found for this case'
      };
      return res.status(404).json(response);
    }

    await simulation.pauseSimulation();

    const response: ApiResponse = {
      success: true,
      message: 'Simulation paused successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error pausing simulation:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to pause simulation'
    };
    
    res.status(500).json(response);
  }
});

// Resume simulation
router.post('/:caseId/resume', async (req, res) => {
  try {
    const { caseId } = req.params;
    const simulation = activeSimulations.get(caseId);
    
    if (!simulation) {
      const response: ApiResponse = {
        success: false,
        error: 'No active simulation found for this case'
      };
      return res.status(404).json(response);
    }

    await simulation.resumeSimulation();

    const response: ApiResponse = {
      success: true,
      message: 'Simulation resumed successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error resuming simulation:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to resume simulation'
    };
    
    res.status(500).json(response);
  }
});

// Stop simulation
router.post('/:caseId/stop', async (req, res) => {
  try {
    const { caseId } = req.params;
    const simulation = activeSimulations.get(caseId);
    
    if (!simulation) {
      const response: ApiResponse = {
        success: false,
        error: 'No active simulation found for this case'
      };
      return res.status(404).json(response);
    }

    // Stop simulation
    activeSimulations.delete(caseId);
    simulationStates.delete(caseId);

    const response: ApiResponse = {
      success: true,
      message: 'Simulation stopped successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error stopping simulation:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to stop simulation'
    };
    
    res.status(500).json(response);
  }
});

// Get simulation status
router.get('/:caseId/status', (req, res) => {
  const { caseId } = req.params;
  const simulation = activeSimulations.get(caseId);
  const state = simulationStates.get(caseId);
  
  if (!simulation && !state) {
    const response: ApiResponse = {
      success: false,
      error: 'No simulation found for this case'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<{ 
    isActive: boolean; 
    state?: SimulationState;
    actionCount?: number;
  }> = {
    success: true,
    data: {
      isActive: !!simulation,
      state: state || simulation?.getState(),
      actionCount: simulation?.getActionHistory().length || 0
    }
  };
  
  res.json(response);
});

// Get simulation action history
router.get('/:caseId/actions', (req, res) => {
  const { caseId } = req.params;
  const simulation = activeSimulations.get(caseId);
  
  if (!simulation) {
    const response: ApiResponse = {
      success: false,
      error: 'No active simulation found for this case'
    };
    return res.status(404).json(response);
  }

  const actions = simulation.getActionHistory();
  
  const response: ApiResponse = {
    success: true,
    data: actions
  };
  
  res.json(response);
});

// Request sidebar
router.post('/:caseId/sidebar', async (req, res) => {
  try {
    const { caseId } = req.params;
    const simulation = activeSimulations.get(caseId);
    
    if (!simulation) {
      const response: ApiResponse = {
        success: false,
        error: 'No active simulation found for this case'
      };
      return res.status(404).json(response);
    }

    await simulation.requestSidebar();

    const response: ApiResponse = {
      success: true,
      message: 'Sidebar requested successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error requesting sidebar:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to request sidebar'
    };
    
    res.status(500).json(response);
  }
});

// Update simulation speed
router.post('/:caseId/speed', (req, res) => {
  try {
    const { caseId } = req.params;
    const { speed } = req.body;
    
    if (typeof speed !== 'number' || speed < 1 || speed > 10) {
      const response: ApiResponse = {
        success: false,
        error: 'Speed must be a number between 1 and 10'
      };
      return res.status(400).json(response);
    }

    // Store speed setting (in production, this would affect simulation timing)
    console.log(`Simulation speed for case ${caseId} set to ${speed}`);

    const response: ApiResponse = {
      success: true,
      message: 'Simulation speed updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating simulation speed:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to update simulation speed'
    };
    
    res.status(500).json(response);
  }
});

// Setup event listeners for simulation
function setupSimulationEventListeners(simulation: SimulationEngine, caseId: string): void {
  // Import WebSocket manager dynamically to avoid circular dependency
  import('../services/WebSocketManager.js').then(({ WebSocketManager }) => {
    // Get the WebSocket manager instance from the server
    // This is a simplified approach - in production, use dependency injection
    
    simulation.on('simulation:started', (data) => {
      console.log(`Simulation started for case ${caseId}`);
      // Broadcast to WebSocket clients
      // wsManager.broadcastToCase(caseId, {
      //   type: 'simulation:started',
      //   payload: data,
      //   timestamp: new Date()
      // });
    });

    simulation.on('action:generated', (action) => {
      console.log(`Action generated in case ${caseId}:`, action.type);
      // Broadcast to WebSocket clients
      // wsManager.broadcastToCase(caseId, {
      //   type: 'action:generated',
      //   payload: action,
      //   timestamp: new Date()
      // });
    });

    simulation.on('phase:changed', (data) => {
      console.log(`Phase changed in case ${caseId}:`, data.phase);
      // Update stored state
      const currentState = simulation.getState();
      simulationStates.set(caseId, currentState);
      
      // Broadcast to WebSocket clients
      // wsManager.broadcastToCase(caseId, {
      //   type: 'phase:changed',
      //   payload: data,
      //   timestamp: new Date()
      // });
    });

    simulation.on('simulation:completed', (data) => {
      console.log(`Simulation completed for case ${caseId}:`, data.verdict);
      
      // Clean up
      activeSimulations.delete(caseId);
      
      // Broadcast to WebSocket clients
      // wsManager.broadcastToCase(caseId, {
      //   type: 'simulation:completed',
      //   payload: data,
      //   timestamp: new Date()
      // });
    });
  });
}

// Helper functions (in production, these would be proper service calls)
async function getCaseById(caseId: string): Promise<Case | null> {
  // This is a placeholder - in production, fetch from database
  return cases.get(caseId) || null;
}

async function getCharactersByCaseId(caseId: string): Promise<Character[] | null> {
  // This is a placeholder - in production, fetch from database
  return caseCharacters.get(caseId) || null;
}

export default router;