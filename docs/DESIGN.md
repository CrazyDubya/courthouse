# LLM-Powered Mock Courtroom

This document outlines the architecture for an end-to-end courtroom simulator
that combines a Three.js 3D scene with large language models (LLMs) acting as
participants in a mock trial.

## Goals

- Visualize a simple courtroom in the browser
- Allow the player to assume any role (judge, counsel, defendant, juror, etc.)
  or observe the simulation
- Support multiple LLM providers (OpenAI, Anthropic, Grok, Groq, Ollama,
  LMStudio, OpenRouter, etc.)
- Scaffold case creation, evidence exchange, and trial procedure
- Support abbreviated or full simulations, including pre-trial phases

## Technologies

- **Three.js** for rendering a minimal 3D courtroom scene
- **CaseEngine** (see `src/agents/caseEngine.js`) for managing roles and
  interactions with LLMs
- **Microsoft TinyTroupe** for early prototyping of multi-agent conversations

## Core Components

### 3D Courtroom

The `client` folder contains a static page that renders a courtroom with a
bench, witness stand, and counsel tables. This scene can later be expanded with
animated participants and UI overlays for procedural actions.

### Case Engine

The `CaseEngine` class manages:

1. **Case Generation** – Use an LLM to create the facts of the case and
   establish required evidence. Images and videos can be requested as JSON
   descriptors for external generation.
2. **Role Assignment** – Produce biographies and motivations for all actors:
   judge, prosecutor, defense, defendant, witnesses, and jurors (6–12, default
   6).
3. **Trial Orchestration** – Step through openings, witness examinations with
   objections, sidebars, and closing arguments. Final verdict may be produced
   by judge or jury agents.
4. **Persistence** – Store API keys securely on the client; case state is held
   locally or in a sandboxed backend.

`CaseEngine` accepts configuration options such as desired `jurySize` (default
6) and whether to `includeWitnesses`, allowing simulations to skip witness
examinations altogether.

### Simulation Controls

- Toggle witness participation and jury size
- Choose which roles the player controls versus AI agents
- Select level of detail (abbreviated vs. full procedure)
- Hooks for pre-trial motions and discovery exchange

### Future Enhancements

- Timeline and personal schedules for agents to perform research and planning
- Support for uploading evidence (PDF, image, video) with automatic text
  extraction for LLM review
- Integration of TinyTroupe agents to model discussions among counsel and jury

