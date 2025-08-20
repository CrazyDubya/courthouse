# Courthouse Simulator

An advanced LLM-powered mock courtroom simulator featuring a fully interactive 3D environment built with Three.js. This comprehensive legal simulation platform allows users to experience realistic courtroom proceedings with AI-driven characters representing all key courtroom roles.

## 🏛️ Overview

This simulator creates an immersive legal experience where multiple Large Language Model (LLM) providers power intelligent courtroom characters. Users can participate as any role or observe AI-controlled proceedings through opening statements, witness examinations, evidence presentation, objections, and final verdicts.

## ✨ Key Features

### 🎭 **Multi-Role AI Characters**
- **Judge**: Maintains order, rules on objections, provides jury instructions
- **Prosecutor/Plaintiff Lawyer**: Presents the case against the defendant
- **Defense Lawyer**: Advocates for the defendant's rights and innocence
- **Defendant/Plaintiff**: Key parties in the legal proceeding
- **Witnesses**: Provide testimony based on case facts
- **Jury Members**: Deliberate and reach verdicts (6-12 members, configurable)
- **Court Reporter**: Documents all proceedings
- **Bailiff**: Maintains courtroom security and order

### 🧠 **Advanced LLM Integration**
- **Multiple Provider Support**: OpenAI, Anthropic (Claude), Ollama, LM Studio, OpenRouter, Grok, Groq
- **Local & Cloud**: Support for both local and cloud-based LLM deployments
- **Secure Storage**: API keys stored locally with encryption
- **Character Personalities**: Each AI character has unique motivations, backgrounds, and behavioral traits
- **Dynamic Responses**: Context-aware dialogue based on case facts, evidence, and proceeding phase

### 🎬 **Comprehensive Trial Simulation**
- **Pre-Trial Phase**: Discovery, evidence sharing, privilege handling, pre-trial motions
- **Jury Selection**: Voir dire process with attorney questioning
- **Opening Statements**: Both sides present their case overview
- **Evidence Presentation**: Documents, physical evidence, digital media, testimony
- **Witness Examination**: Direct examination, cross-examination with realistic objections
- **Legal Procedures**: Sidebars, mini-hearings, sustained/overruled objections
- **Closing Arguments**: Final persuasive presentations
- **Jury Deliberation**: AI jury members discuss and reach consensus
- **Verdict Delivery**: Final decision with reasoning

### 📊 **Evidence Management System**
- **Multi-Format Support**: PDF documents, images, videos, audio files, physical evidence
- **AI Processing**: Automatic analysis and description generation for media evidence
- **Privilege Protection**: Attorney-client, work product, and other legal privileges
- **Discovery Process**: Realistic evidence sharing with privilege filtering
- **Metadata Tracking**: Comprehensive evidence cataloging and chain of custody

### 🏛️ **3D Courtroom Environment**
- **Realistic Layout**: Accurate courtroom architecture with judge's bench, jury box, counsel tables
- **Interactive Camera**: Pan, zoom, and focus on active speakers
- **Role Highlighting**: Visual indicators for speaking characters
- **Immersive Experience**: Professional courtroom atmosphere with proper lighting and materials

### ⚙️ **Flexible Configuration**
- **Simulation Depth**: Choose from Abbreviated, Standard, Full, or Custom simulation levels
- **User Control**: Take control of any role or let AI handle all characters
- **Case Types**: Criminal, Civil, Family, Corporate, Constitutional law cases
- **Legal Systems**: Common law, Civil law, and specialized court procedures
- **Customizable Settings**: Jury size, objection frequency, sidebar allowances, evidence requirements

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Modern web browser with WebGL support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/CrazyDubya/courthouse.git
   cd courthouse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

4. **Configure LLM Provider**
   - Launch the application
   - Click "Configure LLM" in the control panel
   - Select your preferred provider (OpenAI, Anthropic, Ollama, etc.)
   - Enter API key (if required) and model name
   - Test the connection

### Quick Start

1. **Start the application**
   ```bash
   npm run dev
   ```
   This starts both the development server (port 3000) and backend API (port 3001).

2. **Create a new case**
   - Click "New Case" in the control panel
   - Select case type (Criminal, Civil, Family, Corporate)
   - Choose legal system and configure case details
   - Set which roles you want to control vs. AI-controlled

3. **Start simulation**
   - Click "Start Simulation"
   - Watch the 3D courtroom come to life
   - Interact through the control panels or observe AI proceedings

## 🏗️ Architecture

### Frontend (`src/client/`)
- **Three.js Scene**: 3D courtroom visualization with dynamic camera controls
- **TypeScript**: Type-safe client application with modern ES modules
- **Vite**: Fast development server with hot module replacement
- **Responsive UI**: Control panels, case information, action logs, character status

### Backend (`src/server/`)
- **Express.js API**: RESTful endpoints for case, character, and simulation management
- **WebSocket Server**: Real-time communication for live simulation updates
- **TypeScript**: Fully typed server implementation
- **Modular Routes**: Organized API endpoints for different functionality areas

### Shared Components (`src/shared/`)
- **Type Definitions**: Comprehensive TypeScript interfaces for all data structures
- **LLM Providers**: Abstracted interface supporting multiple LLM services
- **Simulation Engine**: Core logic for managing trial flow and character interactions
- **Models**: Character generation, case management, and evidence processing

## 🎮 Usage Guide

### Creating Cases

1. **Case Types**:
   - **Criminal**: State vs. defendant with prosecutor and defense attorney
   - **Civil**: Plaintiff vs. defendant with civil procedures and damages
   - **Family**: Custody, divorce, and family law matters
   - **Corporate**: Business disputes, mergers, contract disagreements

2. **Evidence Management**:
   - Upload documents (PDF), images, videos, audio files
   - AI automatically analyzes and describes evidence
   - Set privilege levels (attorney-client, work product, etc.)
   - Manage discovery and evidence sharing between parties

3. **Character Customization**:
   - AI generates unique personalities, backgrounds, and motivations
   - Assign different LLM models to different characters
   - Control character goals and behavioral traits
   - Set experience levels and specializations

### Running Simulations

1. **Observation Mode**: Watch AI characters conduct entire trial
2. **Participation Mode**: Take control of specific roles (judge, lawyer, witness)
3. **Guided Mode**: AI suggests actions while you make final decisions
4. **Intervention**: Pause simulation to make objections or request sidebars

### LLM Configuration

**Supported Providers:**
- **OpenAI**: GPT-4, GPT-3.5-turbo models
- **Anthropic**: Claude-3 Sonnet, Haiku models  
- **Ollama**: Local models (Llama2, Mistral, CodeLlama)
- **LM Studio**: Local OpenAI-compatible server
- **OpenRouter**: Access to multiple model providers
- **Local Compatible**: Any OpenAI-compatible local deployment

**Configuration Options:**
- Model selection and parameters
- Temperature control for response creativity
- Token limits for response length
- Custom system prompts for character behavior

## 🛠️ Development

### Project Structure
```
courthouse/
├── src/
│   ├── client/          # Frontend application
│   │   ├── scenes/      # Three.js 3D scenes
│   │   ├── main.ts      # Client application entry
│   │   └── index.html   # Main HTML template
│   ├── server/          # Backend API server  
│   │   ├── routes/      # API route handlers
│   │   ├── services/    # Business logic services
│   │   └── index.ts     # Server entry point
│   └── shared/          # Shared components
│       ├── types/       # TypeScript type definitions
│       ├── models/      # Data models and business logic
│       └── llm/         # LLM provider abstractions
├── dist/                # Built application files
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production application
- `npm run build:server` - Build only server components
- `npm run build:client` - Build only client components
- `npm run serve` - Start production server
- `npm run lint` - Run code linting
- `npm run test` - Run test suite

### Building for Production

```bash
npm run build
npm run serve
```

The application will be available at http://localhost:3001

## 🔧 Configuration

### Environment Variables (`.env`)
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=http://localhost:3000

# LLM Provider Keys (optional - can be configured in UI)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Local LLM Settings
OLLAMA_BASE_URL=http://localhost:11434
LOCAL_LLM_BASE_URL=http://localhost:1234
```

### Application Settings
- **Simulation Speed**: Control pace of AI responses
- **Objection Frequency**: Adjust how often objections occur
- **Evidence Requirements**: Set standards for evidence admissibility
- **Jury Size**: Configure jury from 6-12 members
- **Trial Phases**: Enable/disable specific trial components

## 🧪 Example Scenarios

### Criminal Case Example
```
Case: State v. Johnson (Burglary)
Evidence: Fingerprints, witness testimony, crime scene photos
Witnesses: Police officer, forensic expert, alibi witness
Outcome: AI jury deliberates based on evidence strength
```

### Civil Case Example  
```
Case: Smith v. ABC Corp (Personal Injury)
Evidence: Medical records, safety reports, expert testimony
Discovery: Privilege protection for attorney communications
Outcome: Liability determination and damages assessment
```

## 🤖 AI Character Examples

**Judge Character**:
- *Background*: Former prosecutor with 15 years experience
- *Personality*: Patient (85%), Fair (92%), Detail-oriented (78%)
- *Motivations*: Uphold law, ensure fair trial, maintain order
- *Behavior*: Strict on procedure, allows reasonable objections

**Defense Attorney Character**:
- *Background*: Public defender specializing in criminal law
- *Personality*: Aggressive (88%), Empathetic (70%), Creative (82%)
- *Motivations*: Protect client rights, create reasonable doubt
- *Behavior*: Challenges evidence, objects frequently, passionate advocacy

## 🔐 Security & Privacy

- **Local Storage**: API keys encrypted and stored locally
- **No Data Transmission**: Case details remain on your system
- **Privacy Controls**: Full control over what data is shared with LLM providers
- **Secure Communications**: HTTPS/WSS for all network communications

## 🚧 Roadmap

### Phase 1: Core Enhancement (Current)
- [x] Complete TypeScript compilation and deployment
- [ ] Microsoft TinyTroupe integration for advanced agent behaviors
- [ ] Enhanced evidence processing (OCR, video analysis)
- [ ] Advanced jury psychology modeling

### Phase 2: Expanded Features
- [ ] Multi-language support for international legal systems
- [ ] Appeal process simulation
- [ ] Settlement negotiation scenarios  
- [ ] Expert witness specialization system
- [ ] Real legal case database integration

### Phase 3: Advanced AI
- [ ] Memory persistence across sessions
- [ ] Learning from past cases
- [ ] Emotional modeling for characters
- [ ] Advanced legal reasoning capabilities
- [ ] Integration with legal databases and precedents

### Phase 4: Collaboration
- [ ] Multi-user sessions (collaborative trials)
- [ ] Law school integration
- [ ] Professional training modules
- [ ] Case sharing and community features

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Three.js community for excellent 3D rendering capabilities
- OpenAI, Anthropic, and other LLM providers for AI capabilities
- Legal professionals who provided guidance on courtroom procedures
- Open source community for foundational technologies

## 📞 Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions
- **Documentation**: Comprehensive guides available in `/docs` directory
- **Examples**: Sample cases and configurations in `/examples` directory

---

*Built with ❤️ for legal education, training, and simulation*