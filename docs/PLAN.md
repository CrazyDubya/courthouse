# Mock Courtroom Multi-Phase Plan

## Phase 0 – Research & Requirements
- Analyse legal systems to support (initially US adversarial).
- Explore evidence formats: text, PDF, images, video.
- Review Microsoft TinyTroupe for multi-agent prototyping.
- Determine UI framework for 3D scene (three.js).

## Phase 1 – Project Foundation
- Initialise Node.js project with ES modules and build tooling.
- Create basic 3D courtroom scene using three.js (judge bench, tables, jury box).
- Set up environment variable management for LLM API keys stored locally.

## Phase 2 – LLM Engine Abstraction
- Implement unified interface supporting OpenAI-compatible endpoints, Ollama, LMStudio, Anthropic, Groq, etc.
- Provide configuration allowing users to choose provider and model.
- Prototype agent behaviours with TinyTroupe for quick iteration.

## Phase 3 – Case Generation & Evidence Handling
- LLM generates case description, legal system, and roles.
- Support ingestion of evidence: upload & classification into privileged/non-privileged.
- Store text versions of documents; request JSON descriptions for images/videos (5 s default, variable).

## Phase 4 – Role & Agent Modelling
- Define roles: Judge, Prosecutor, Defense, Defendant, Witnesses, Jury (6–12), Player.
- Generate personalities, motivations, backgrounds for each agent.
- Agents maintain state (research, planning, life events) outside hearings.

## Phase 5 – Trial Flow
- Implement pre-trial motions, discovery exchange, witness list setup.
- Simulate courtroom phases: opening statements, witness examination, evidence introduction with objections and rulings.
- Support sidebars and mini-hearings; toggle witnesses on/off.

## Phase 6 – Verdict & Post-Trial
- Allow judge or jury deliberation and verdict generation.
- Record outcomes and provide reasoning transcripts.

## Phase 7 – User Interaction & Control
- Allow user to select or switch roles or observe.
- Offer modes: fully simulated, guided, or user-controlled segments.
- Provide options for abbreviated vs full simulations.

## Phase 8 – Enhancement & Feedback
- Integrate lifecycle for agents (researching, planning during recesses).
- Improve TinyTroupe integration for multi-agent planning.
- Collect logs for debugging and replay.

