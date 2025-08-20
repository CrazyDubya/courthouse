# LLM Courtroom Simulator

An AI-powered 3D virtual courtroom simulation that uses multiple Large Language Models (LLMs) to create realistic legal proceedings. Each participant in the courtroom is controlled by an AI agent with unique personality traits, backgrounds, and objectives.

## Features

### Core Capabilities
- **3D Courtroom Environment**: Built with Three.js and React Three Fiber for immersive visualization
- **Multi-Agent System**: Each courtroom participant is an autonomous AI agent with:
  - Unique personality traits (assertiveness, empathy, analytical thinking, etc.)
  - Professional background and experience
  - Emotional states that evolve during proceedings
  - Memory systems (short-term, long-term, working memory)
  - Personal motivations and objectives

### Legal Proceedings Simulation
- **Complete Trial Phases**:
  - Pre-trial proceedings
  - Jury selection
  - Opening statements
  - Plaintiff/Prosecution case presentation
  - Defense case presentation
  - Witness examination and cross-examination
  - Closing arguments
  - Jury deliberation
  - Verdict
  - Sentencing (for criminal cases)

### Evidence Management
- Support for multiple evidence types (documents, images, videos, testimony, physical evidence)
- Chain of custody tracking
- Discovery process simulation
- Privilege protection
- Evidence admissibility determinations

### Interactive Features
- **User Role Selection**: Take control of any participant (judge, attorney, defendant, witness, jury member) or observe as all roles are AI-controlled
- **Real-time Interventions**: Make objections, present evidence, or speak during proceedings
- **Adjustable Simulation Settings**:
  - Simulation speed control
  - Auto-progress or manual phase advancement
  - Detail level (abbreviated to full proceedings)
  - Jury size configuration (6-12 members)

### LLM Integration
Supports multiple LLM providers for diverse AI behaviors:
- OpenAI (GPT-4)
- Anthropic (Claude)
- Ollama (local models)
- LM Studio
- OpenRouter
- Groq
- Grok
- Custom local endpoints

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/llm-courtroom-simulator.git
cd llm-courtroom-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Configure API keys (optional, for cloud LLM providers):
   - The application will prompt for API keys when needed
   - Keys are stored securely in local storage
   - Local models (Ollama, LM Studio) don't require API keys

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

## Usage

### Quick Start
1. Launch the application
2. Click "Load Sample Case & Begin" to start with a pre-configured criminal case
3. Select your role (or remain as an observer)
4. Click "Start Simulation" to begin the proceedings
5. Watch as AI agents conduct the trial, or intervene if you've selected a participant role

### Controlling the Simulation
- **Start/Stop/Pause**: Control simulation flow with the control panel buttons
- **Speed Adjustment**: Use the speed slider (0.5x to 3x normal speed)
- **Manual Progression**: Disable auto-progress to manually advance through phases
- **User Actions** (when controlling a participant):
  - Type statements in the input field
  - Make objections (attorneys only)
  - Present evidence
  - Respond to questions

### Creating Custom Cases
The system supports custom case creation with:
- Case type selection (criminal, civil, family, corporate, constitutional)
- Legal system choice (common law, civil law, religious, customary, mixed)
- Custom participant configuration
- Evidence submission
- Charge/claim specification

## Architecture

### Technology Stack
- **Frontend**: React with TypeScript
- **3D Graphics**: Three.js + React Three Fiber
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Build Tool**: Vite

### Agent System (Inspired by Microsoft TinyTroupe)
Each agent features:
- **Cognitive Architecture**:
  - Thought generation before actions
  - Action planning with confidence levels
  - Evidence evaluation and analysis
  - Emotional state tracking

- **Memory Systems**:
  - Short-term memory for recent events
  - Long-term memory for persistent knowledge
  - Working memory for current context
  - Belief systems affecting decisions
  - Relationship tracking with other participants

- **Daily Routines**: Agents have simulated daily activities relevant to their roles (case preparation, research, client meetings, etc.)

### Proceedings Engine
The engine orchestrates the trial flow:
- Phase management and transitions
- Turn-taking and speaker management
- Objection handling and rulings
- Evidence presentation
- Sidebar conferences
- Transcript recording

## Configuration

### LLM Provider Setup
Each participant can use a different LLM provider. Configure in the settings:

```javascript
{
  provider: 'openai',
  model: 'gpt-4-turbo-preview',
  apiKey: 'your-api-key',
  temperature: 0.7,
  maxTokens: 1000
}
```

### Local Model Setup (Ollama)
1. Install Ollama: https://ollama.ai
2. Pull a model: `ollama pull llama2`
3. The simulator will automatically detect and use local Ollama models

### Simulation Settings
```javascript
{
  realtimeSpeed: 1,          // 1x normal speed
  autoProgress: true,         // Automatic phase advancement
  detailLevel: 'standard',   // abbreviated/standard/detailed/full
  enableObjections: true,     // Allow AI objections
  enableSidebar: true,        // Enable sidebar conferences
  jurySize: 6,               // 6-12 jury members
  allowUserIntervention: true // Allow user to interrupt
}
```

## Development

### Project Structure
```
src/
├── components/        # React components
│   ├── Courtroom3D.tsx
│   ├── ControlPanel.tsx
│   └── TranscriptViewer.tsx
├── services/         # Core services
│   ├── agents/       # Agent system
│   ├── llm/          # LLM providers
│   └── ProceedingsEngine.ts
├── store/            # State management
├── types/            # TypeScript definitions
└── utils/            # Utilities
```

### Testing

This project uses a comprehensive testing framework to ensure code reliability and maintainability.

#### Testing Stack
- **Test Runner**: Vitest (fast, Vite-native testing)
- **Component Testing**: React Testing Library
- **Mocking**: Vitest built-in mocks
- **Coverage**: V8 coverage provider
- **Environment**: jsdom for DOM simulation

#### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests once (for CI)
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI (interactive mode)
npm run test:ui
```

#### Test Coverage

Current test coverage focuses on critical components:

- **ProceedingsEngine**: Core simulation logic (34.51% coverage)
- **CourtroomAgent**: AI agent behavior (70.11% coverage)
- **Store**: State management (78.65% coverage)
- **Courtroom3D**: 3D rendering component (mocked for testing)

Coverage reports are generated in HTML format in the `coverage/` directory.

#### Testing Approach

**Unit Tests**: 
- Service classes (`ProceedingsEngine`, `CourtroomAgent`)
- State management (`useCourtroomStore`)
- Utility functions

**Component Tests**:
- React component rendering
- User interaction handling
- Props validation
- State integration

**Integration Tests**:
- Agent-engine interactions
- Store-component communication
- LLM provider integrations (mocked)

#### Test Files Structure
```
src/
├── components/
│   └── __tests__/
│       └── Courtroom3D.test.tsx
├── services/
│   ├── __tests__/
│   │   └── ProceedingsEngine.test.ts
│   └── agents/
│       └── __tests__/
│           └── CourtroomAgent.test.ts
├── store/
│   └── __tests__/
│       └── useCourtroomStore.test.ts
└── test/
    └── setup.ts                 # Test configuration
```

#### Mocking Strategy

- **Three.js Components**: Mocked to avoid WebGL rendering in tests
- **LLM Providers**: Mocked to prevent API calls during testing
- **LocalStorage**: Mocked for consistent test environments
- **Browser APIs**: Mocked (IntersectionObserver, ResizeObserver)

#### Writing Tests

When adding new features, ensure tests are written for:

1. **Critical Business Logic**: All core functionality
2. **Error Handling**: Edge cases and failure scenarios  
3. **Component Rendering**: React component behavior
4. **State Management**: Store actions and selectors
5. **Integration Points**: Service interactions

Example test structure:
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup test data
  });

  describe('Feature Group', () => {
    it('should handle specific scenario', () => {
      // Arrange
      // Act  
      // Assert
    });
  });
});
```

#### Continuous Integration

To set up GitHub Actions CI, create `.github/workflows/ci.yml` with the following content:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run linting (if available)
      run: |
        if npm run lint --silent 2>/dev/null; then
          npm run lint
        else
          echo "No lint script found, skipping linting"
        fi
      continue-on-error: true
    - name: Run type checking
      run: npm run build
    - name: Run tests
      run: npm run test:run
    - name: Run tests with coverage
      run: npm run test:coverage
  
  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    - name: Use Node.js 20.x
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Build application
      run: npm run build
```

This CI pipeline will automatically run tests on:
- Push to main/develop branches
- Pull requests
- Multiple Node.js versions (18.x, 20.x)
- Multiple operating systems (configurable)

The pipeline includes:
1. Dependency installation
2. Linting (if available)
3. Type checking via TypeScript compilation
4. Unit test execution
5. Coverage report generation
6. Build verification

### Adding New LLM Providers
1. Extend `BaseLLMProvider` class
2. Implement `generateResponse()` and `validateConfig()`
3. Register in `LLMProviderFactory`

### Customizing Agent Behaviors
Modify agent personalities and behaviors in `CourtroomAgent.ts`:
- Adjust personality trait ranges
- Modify emotional response patterns
- Customize role-specific behaviors
- Add new memory types or cognitive functions

## Future Enhancements

### Planned Features
- **Advanced Evidence Handling**:
  - Real document parsing (PDFs, images)
  - Video evidence playback with timestamp citations
  - Automated evidence analysis and relevance scoring

- **Enhanced Realism**:
  - Procedural rule enforcement
  - Case law citations
  - Legal precedent consideration
  - Jurisdiction-specific procedures

- **Multi-case Support**:
  - Case templates library
  - Historical case replay
  - Comparative case analysis

- **Training Mode**:
  - Law student practice scenarios
  - Performance evaluation
  - Feedback and scoring systems

- **Collaboration Features**:
  - Multi-user support
  - Real-time collaboration
  - Remote participation

## Contributing
Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License
MIT License - see LICENSE file for details

## Acknowledgments
- Inspired by Microsoft TinyTroupe for agent simulation concepts
- Three.js community for 3D rendering capabilities
- OpenAI, Anthropic, and other LLM providers for AI capabilities

## Support
For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

This repository was initialized by Terragon.