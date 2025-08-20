import { Router } from 'express';
import { Case, CaseType, LegalSystem, Character, Role, ApiResponse } from '../shared/types/index.js';
import { CaseGenerator } from '../shared/models/Case.js';
import { CharacterGenerator } from '../shared/models/Character.js';

const router = Router();

// In-memory storage (in production, use a proper database)
const cases: Map<string, Case> = new Map();
const caseCharacters: Map<string, Character[]> = new Map();

// Get all cases
router.get('/', (req, res) => {
  const allCases = Array.from(cases.values());
  
  const response: ApiResponse<Case[]> = {
    success: true,
    data: allCases
  };
  
  res.json(response);
});

// Get specific case
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const caseData = cases.get(id);
  
  if (!caseData) {
    const response: ApiResponse = {
      success: false,
      error: 'Case not found'
    };
    return res.status(404).json(response);
  }
  
  const response: ApiResponse<Case> = {
    success: true,
    data: caseData
  };
  
  res.json(response);
});

// Create new case
router.post('/', (req, res) => {
  try {
    const { 
      title, 
      type, 
      legalSystem, 
      description, 
      userControlledRoles = [], 
      jurySize = 6 
    } = req.body;

    // Validate required fields
    if (!title || !type || !legalSystem) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields: title, type, legalSystem'
      };
      return res.status(400).json(response);
    }

    // Generate case
    const newCase = description 
      ? CaseGenerator.createCustomCase(title, type as CaseType, legalSystem as LegalSystem, description)
      : CaseGenerator.generateCase(type as CaseType, legalSystem as LegalSystem);

    // Update settings
    newCase.settings = {
      ...newCase.settings,
      userControlledRoles: userControlledRoles as Role[],
      jurySize: Math.min(12, Math.max(6, jurySize))
    };

    // Store case
    cases.set(newCase.id, newCase);

    // Generate characters for the case
    const characters = generateCaseCharacters(newCase);
    caseCharacters.set(newCase.id, characters);

    const response: ApiResponse<Case> = {
      success: true,
      data: newCase,
      message: 'Case created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating case:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create case'
    };
    
    res.status(500).json(response);
  }
});

// Update case
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const caseData = cases.get(id);
  
  if (!caseData) {
    const response: ApiResponse = {
      success: false,
      error: 'Case not found'
    };
    return res.status(404).json(response);
  }

  try {
    // Update case with provided fields
    const updatedCase = { ...caseData, ...req.body };
    cases.set(id, updatedCase);

    const response: ApiResponse<Case> = {
      success: true,
      data: updatedCase,
      message: 'Case updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error updating case:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to update case'
    };
    
    res.status(500).json(response);
  }
});

// Delete case
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  if (!cases.has(id)) {
    const response: ApiResponse = {
      success: false,
      error: 'Case not found'
    };
    return res.status(404).json(response);
  }

  cases.delete(id);
  caseCharacters.delete(id);

  const response: ApiResponse = {
    success: true,
    message: 'Case deleted successfully'
  };
  
  res.json(response);
});

// Get case characters
router.get('/:id/characters', (req, res) => {
  const { id } = req.params;
  const characters = caseCharacters.get(id);
  
  if (!characters) {
    const response: ApiResponse = {
      success: false,
      error: 'Characters not found for this case'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Character[]> = {
    success: true,
    data: characters
  };
  
  res.json(response);
});

// Add evidence to case
router.post('/:id/evidence', (req, res) => {
  const { id } = req.params;
  const caseData = cases.get(id);
  
  if (!caseData) {
    const response: ApiResponse = {
      success: false,
      error: 'Case not found'
    };
    return res.status(404).json(response);
  }

  try {
    const updatedCase = CaseGenerator.addEvidence(caseData, req.body);
    cases.set(id, updatedCase);

    const response: ApiResponse<Case> = {
      success: true,
      data: updatedCase,
      message: 'Evidence added successfully'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error adding evidence:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to add evidence'
    };
    
    res.status(500).json(response);
  }
});

// Helper function to generate characters for a case
function generateCaseCharacters(caseData: Case): Character[] {
  const characters: Character[] = [];
  
  // Default LLM config (will be updated when user configures LLM)
  const defaultLLMConfig = {
    provider: 'openai' as any,
    model: 'gpt-4',
    apiKey: '',
    baseUrl: '',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: ''
  };

  // Generate required roles based on case type
  const requiredRoles = getRequiredRoles(caseData.type);
  
  requiredRoles.forEach(role => {
    const character = CharacterGenerator.createCharacter(role, defaultLLMConfig);
    characters.push(character);
  });

  // Generate jury members
  for (let i = 0; i < caseData.settings.jurySize; i++) {
    const juryMember = CharacterGenerator.createCharacter(Role.JURY_MEMBER, defaultLLMConfig);
    juryMember.name += ` #${i + 1}`;
    characters.push(juryMember);
  }

  return characters;
}

function getRequiredRoles(caseType: CaseType): Role[] {
  const baseRoles = [Role.JUDGE, Role.COURT_REPORTER, Role.BAILIFF];
  
  switch (caseType) {
    case CaseType.CRIMINAL:
      return [...baseRoles, Role.PROSECUTOR, Role.DEFENSE_LAWYER, Role.DEFENDANT];
    case CaseType.CIVIL:
      return [...baseRoles, Role.PLAINTIFF_LAWYER, Role.DEFENSE_LAWYER, Role.PLAINTIFF, Role.DEFENDANT];
    case CaseType.FAMILY:
      return [...baseRoles, Role.PLAINTIFF_LAWYER, Role.DEFENSE_LAWYER, Role.PLAINTIFF, Role.DEFENDANT];
    case CaseType.CORPORATE:
      return [...baseRoles, Role.PLAINTIFF_LAWYER, Role.DEFENSE_LAWYER, Role.PLAINTIFF, Role.DEFENDANT];
    default:
      return [...baseRoles, Role.PROSECUTOR, Role.DEFENSE_LAWYER, Role.DEFENDANT];
  }
}

export default router;