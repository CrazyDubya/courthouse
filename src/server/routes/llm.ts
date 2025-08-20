import { Router } from 'express';
import { LLMConfig, LLMProvider, ApiResponse } from '../shared/types/index.js';
import { LLMManager, BaseLLMProvider } from '../shared/llm/providers.js';

const router = Router();

// Global LLM manager instance
let llmManager: LLMManager = new LLMManager();

// Store LLM configurations (in production, use encrypted storage)
const llmConfigs: Map<string, LLMConfig> = new Map();

// Configure LLM provider
router.post('/config', (req, res) => {
  try {
    const config: LLMConfig = req.body;
    
    // Validate required fields
    if (!config.provider || !config.model) {
      const response: ApiResponse = {
        success: false,
        error: 'Provider and model are required'
      };
      return res.status(400).json(response);
    }

    // Validate provider-specific requirements
    const validationError = validateLLMConfig(config);
    if (validationError) {
      const response: ApiResponse = {
        success: false,
        error: validationError
      };
      return res.status(400).json(response);
    }

    // Create and test the provider
    try {
      const provider = LLMManager.createProvider(config);
      
      if (!provider.isConfigured()) {
        const response: ApiResponse = {
          success: false,
          error: 'Provider configuration is incomplete'
        };
        return res.status(400).json(response);
      }

      // Store configuration (remove sensitive data for storage)
      const configId = 'default'; // In production, support multiple configs
      llmConfigs.set(configId, config);
      
      // Add provider to manager
      llmManager.addProvider(configId, provider);

      const response: ApiResponse = {
        success: true,
        message: 'LLM configuration saved successfully'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error creating LLM provider:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'Failed to create LLM provider: ' + (error as Error).message
      };
      
      res.status(400).json(response);
    }
  } catch (error) {
    console.error('Error configuring LLM:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to configure LLM'
    };
    
    res.status(500).json(response);
  }
});

// Get current LLM configuration (without sensitive data)
router.get('/config', (req, res) => {
  const config = llmConfigs.get('default');
  
  if (!config) {
    const response: ApiResponse = {
      success: false,
      error: 'No LLM configuration found'
    };
    return res.status(404).json(response);
  }

  // Return config without sensitive data
  const safeConfig = {
    provider: config.provider,
    model: config.model,
    baseUrl: config.baseUrl,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    hasApiKey: !!config.apiKey
  };

  const response: ApiResponse = {
    success: true,
    data: safeConfig
  };
  
  res.json(response);
});

// Test LLM connection
router.post('/test', async (req, res) => {
  try {
    const provider = llmManager.getProvider('default');
    
    if (!provider) {
      const response: ApiResponse = {
        success: false,
        error: 'No LLM provider configured'
      };
      return res.status(400).json(response);
    }

    // Test with a simple prompt
    const testResponse = await provider.generateResponse([
      {
        role: 'user',
        content: 'Hello, this is a test message. Please respond with "Test successful".'
      }
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        message: 'LLM test successful',
        response: testResponse.content,
        model: testResponse.model,
        usage: testResponse.usage
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error testing LLM:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'LLM test failed: ' + (error as Error).message
    };
    
    res.status(500).json(response);
  }
});

// Generate response for a character
router.post('/generate', async (req, res) => {
  try {
    const { characterId, prompt, context } = req.body;
    
    if (!characterId || !prompt) {
      const response: ApiResponse = {
        success: false,
        error: 'Character ID and prompt are required'
      };
      return res.status(400).json(response);
    }

    const llmResponse = await llmManager.generateCharacterResponse(
      characterId,
      prompt,
      context || ''
    );

    const response: ApiResponse = {
      success: true,
      data: llmResponse
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error generating LLM response:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to generate response: ' + (error as Error).message
    };
    
    res.status(500).json(response);
  }
});

// Get available providers
router.get('/providers', (req, res) => {
  const providers = [
    {
      id: LLMProvider.OPENAI,
      name: 'OpenAI',
      description: 'GPT models from OpenAI',
      requiresApiKey: true,
      defaultModels: ['gpt-4', 'gpt-3.5-turbo']
    },
    {
      id: LLMProvider.ANTHROPIC,
      name: 'Anthropic',
      description: 'Claude models from Anthropic',
      requiresApiKey: true,
      defaultModels: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
    },
    {
      id: LLMProvider.OLLAMA,
      name: 'Ollama',
      description: 'Local Ollama installation',
      requiresApiKey: false,
      defaultModels: ['llama2', 'mistral', 'codellama']
    },
    {
      id: LLMProvider.LOCAL_COMPATIBLE,
      name: 'Local Compatible',
      description: 'OpenAI-compatible local server',
      requiresApiKey: false,
      defaultModels: ['local-model']
    },
    {
      id: LLMProvider.LM_STUDIO,
      name: 'LM Studio',
      description: 'LM Studio local server',
      requiresApiKey: false,
      defaultModels: ['local-model']
    }
  ];

  const response: ApiResponse = {
    success: true,
    data: providers
  };
  
  res.json(response);
});

// Helper function to validate LLM configuration
function validateLLMConfig(config: LLMConfig): string | null {
  switch (config.provider) {
    case LLMProvider.OPENAI:
      if (!config.apiKey) {
        return 'API key is required for OpenAI';
      }
      break;
      
    case LLMProvider.ANTHROPIC:
      if (!config.apiKey) {
        return 'API key is required for Anthropic';
      }
      break;
      
    case LLMProvider.OLLAMA:
      // Ollama doesn't require API key, but validate base URL if provided
      if (config.baseUrl && !isValidUrl(config.baseUrl)) {
        return 'Invalid base URL for Ollama';
      }
      break;
      
    case LLMProvider.LOCAL_COMPATIBLE:
    case LLMProvider.LM_STUDIO:
      if (!config.baseUrl) {
        return 'Base URL is required for local providers';
      }
      if (!isValidUrl(config.baseUrl)) {
        return 'Invalid base URL';
      }
      break;
      
    default:
      return 'Unsupported provider';
  }

  // Validate temperature
  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
    return 'Temperature must be between 0 and 2';
  }

  // Validate max tokens
  if (config.maxTokens !== undefined && (config.maxTokens < 1 || config.maxTokens > 32000)) {
    return 'Max tokens must be between 1 and 32000';
  }

  return null;
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Export the LLM manager for use in other parts of the application
export { llmManager };
export default router;