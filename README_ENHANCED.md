# Courthouse Simulator - Enhanced Edition

A sophisticated LLM-powered courthouse simulator featuring advanced judge personality systems, comprehensive case management, and realistic courtroom proceedings.

## 🚀 Major Enhancements

This enhanced version includes significant improvements and new features developed in the latest session:

### 🧠 Advanced Judge Personality System
- **MBTI-based personality types** with 8 distinct judge personalities
- **RPG-style attributes** (wisdom, authority, empathy, analytical skill, etc.)
- **Dynamic quirks and temperaments** affecting judicial behavior
- **Memory persistence** with case, participant, and decision tracking
- **Experience-based decision making** influenced by past cases

### 📚 Temporal Memory Management
- **5-year case memory retention** with automatic cleanup
- **Participant relationship tracking** with credibility scoring
- **Decision pattern analysis** for consistent judicial behavior
- **Similar case detection** for precedent-based rulings
- **Performance metrics** tracking conviction rates, appeal rates, etc.

### ⚖️ Comprehensive Motion System
- **27+ motion templates** covering criminal and civil procedures
- **Intelligent motion scheduling** with calendar integration
- **Legal standard enforcement** (beyond reasonable doubt, preponderance, etc.)
- **Success likelihood calculations** based on case type and judge
- **Motion workflow tracking** from filing to ruling

### 📅 Court Calendar & Task Management
- **Integrated scheduling system** for hearings, deadlines, and tasks
- **Conflict detection** for participant scheduling
- **Automated deadline creation** for motion practice
- **Workload reporting** for capacity planning
- **Reminder systems** for upcoming events

### 🏛️ Louisiana Civil Law Support
- **Dual legal system support** (Common Law + Louisiana Civil Law)
- **Civil Code article references** (e.g., La. C.C. Art. 2315)
- **Louisiana-specific procedures** and terminology
- **Community property handling** and unique remedies
- **Legal system comparisons** for educational purposes

### ⚖️ Criminal vs Civil Case Distinctions
- **Separate case workflows** with appropriate procedures
- **Burden of proof enforcement** (beyond reasonable doubt vs preponderance)
- **Criminal penalty phases** with sentencing guidelines
- **Civil remedy calculations** with damages assessment
- **Case-specific participant roles** and requirements

## 🧪 Testing Framework

Comprehensive test suite with 192 tests covering:

- **95.3% pass rate** with 183/192 tests passing
- **Unit tests** for all new services and factories
- **Integration tests** for complex workflows
- **Type safety tests** for Louisiana law system
- **Mock data generation** for consistent testing
- **Coverage reporting** with Vitest and React Testing Library

### Running Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 🏗️ Architecture Overview

```
Enhanced Courthouse Simulator
├── Judge System
│   ├── EnhancedJudgeFactory (creates judges with personalities)
│   ├── MemoryManager (tracks cases and decisions)
│   └── JudgePersonalities (MBTI-based templates)
├── Case Management
│   ├── EnhancedCaseFactory (criminal/civil case creation)
│   ├── LouisianaCaseFactory (civil law cases)
│   └── CaseTypes (comprehensive type definitions)
├── Motion System
│   ├── MotionTemplates (27+ predefined motions)
│   ├── MotionEngine (integrated with ProceedingsEngine)
│   └── MotionWorkflow (tracking and scheduling)
├── Calendar System
│   ├── CourtCalendar (events, deadlines, tasks)
│   ├── ConflictDetection (scheduling validation)
│   └── WorkloadReporting (capacity analysis)
└── Legal Systems
    ├── CommonLaw (traditional legal system)
    ├── LouisianaLaw (civil law system)
    └── LegalComparisons (educational content)
```

## 📖 Key Features

### Judge Personality System

```typescript
// Create a judge with specific personality
const judge = EnhancedJudgeFactory.createJudge(
  'Judge Smith',
  'strict-traditionalist',
  true // enable memory
);

// Judge has MBTI type, temperament, and attributes
console.log(judge.mbtiType); // 'ESTJ'
console.log(judge.temperament); // 'strict'
console.log(judge.attributes.wisdom); // 8/10
```

### Memory Management

```typescript
// Memory manager tracks judicial experience
const memory = new MemoryManager('judge-id');

// Record case outcomes and participant performance
memory.recordCase(caseData, 'guilty verdict', ['objection sustained']);
memory.recordParticipantInteraction(attorney, 'conviction', 'excellent');

// Find similar cases for precedent
const similarCases = memory.findSimilarCases(currentCase, 5);
```

### Motion System

```typescript
// Get motion templates by case type
const criminalMotions = getCriminalMotions();
const civilMotions = getCivilMotions();

// Create and process motions
const motion = {
  type: 'motion-to-suppress-evidence',
  filedBy: 'defense-attorney',
  caseType: 'criminal',
  // ... motion details
};
```

### Louisiana Civil Law

```typescript
// Create Louisiana civil law case
const louisianaCase = LouisianaCaseFactory.createLouisianaCivilCase({
  type: 'contract-dispute',
  claims: []
}, 'orleans'); // New Orleans Parish

// Includes Louisiana-specific elements
console.log(louisianaCase.applicableCodeArticles); // ['La. C.C. Art. 1993', ...]
console.log(louisianaCase.proceedingType); // 'ordinary-proceeding'
```

## 🎯 Usage Examples

### Creating a Complete Court Session

```typescript
// 1. Create enhanced judge with memory
const judge = EnhancedJudgeFactory.createJudge(
  'Judge Williams',
  'balanced-pragmatist',
  true
);

// 2. Create case with proper type
const criminalCase = EnhancedCaseFactory.createCriminalCase({
  charges: ['theft-grand', 'burglary-first-degree'],
  defendant: 'John Doe',
  jurisdiction: 'state'
});

// 3. Set up calendar and schedule hearings
const calendar = new CourtCalendar();
const hearingEvent = calendar.addEvent({
  title: 'Criminal Trial',
  type: 'trial',
  date: new Date('2024-12-01T09:00:00'),
  caseId: criminalCase.id,
  participants: [judge.id, 'prosecutor-1', 'defense-1'],
  priority: 'high'
});

// 4. Run enhanced proceedings with memory
const engine = new ProceedingsEngine(criminalCase, settings, aiCallbacks);
await engine.processPhase(); // Includes motion handling and memory updates
```

### Motion Practice Workflow

```typescript
// 1. File a motion
const motion = {
  type: 'motion-to-suppress-evidence',
  title: 'Motion to Suppress Illegally Obtained Evidence',
  filedBy: 'defense-attorney',
  caseType: 'criminal',
  hearingRequired: true,
  urgent: false
};

// 2. Schedule hearing automatically
const hearingEvent = calendar.scheduleMotionHearing(
  motion, 
  ['judge-1', 'prosecutor-1', 'defense-1'],
  new Date('2024-12-15T10:00:00')
);

// 3. Process motion with judge's experience
const influence = judge.memory.getDecisionInfluence({
  participants: caseParticipants,
  caseType: 'criminal',
  subject: 'motion to suppress'
});

// Judge's decision influenced by past similar cases and participant history
```

## 🔧 Development

### Prerequisites

- Node.js 18+
- TypeScript 5.9+
- React 19+
- Vite 7+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Project Structure

```
src/
├── services/
│   ├── EnhancedJudgeFactory.ts      # Judge creation with personalities
│   ├── MemoryManager.ts             # Judicial memory system
│   ├── CourtCalendar.ts             # Calendar and scheduling
│   └── ProceedingsEngine.ts         # Enhanced with motions
├── types/
│   ├── judge.ts                     # Judge personality types
│   ├── motions.ts                   # Motion system types
│   ├── caseTypes.ts                 # Criminal/civil distinctions
│   ├── louisianaLaw.ts              # Civil law system types
│   └── calendar.ts                  # Calendar system types
├── data/
│   ├── judgePersonalities.ts        # MBTI-based templates
│   ├── motionTemplates.ts           # 27+ motion templates
│   ├── criminalCharges.ts           # Criminal charge definitions
│   └── civilClaims.ts               # Civil claim types
└── __tests__/                       # Comprehensive test suite
    ├── services/                    # Service layer tests
    ├── types/                       # Type system tests
    └── data/                        # Data layer tests
```

## 📊 Performance Metrics

- **192 total tests** with 95.3% pass rate
- **2,500+ lines** of new functionality
- **8 major systems** fully integrated
- **27+ motion templates** with legal accuracy
- **5-year memory retention** with intelligent cleanup
- **4 access patterns** (common law, Louisiana law, criminal, civil)

## 🤝 Contributing

This enhanced version maintains full backward compatibility while adding significant new capabilities. All existing functionality continues to work as expected.

### Adding New Features

1. **Judge Personalities**: Add new MBTI types in `judgePersonalities.ts`
2. **Motion Types**: Extend motion templates in `motionTemplates.ts`
3. **Legal Systems**: Add new jurisdictions following the Louisiana law pattern
4. **Memory Systems**: Extend memory tracking for new decision types

### Testing Guidelines

- Write comprehensive tests for all new features
- Maintain 90%+ test coverage
- Use mock data helpers from `src/test/helpers.ts`
- Follow existing test patterns and naming conventions

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

Built with modern web technologies and enhanced with sophisticated AI-powered legal simulation capabilities.

---

**Enhanced Courthouse Simulator** - Bringing realistic judicial proceedings to life with advanced personality systems and comprehensive legal frameworks.