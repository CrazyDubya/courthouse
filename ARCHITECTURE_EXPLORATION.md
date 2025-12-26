# ⚖️ THE COURTHOUSE CHRONICLES
## *A Wanderer's Yarn Through Silicon Justice*

```
                           ╔═══════════════════════════════════════╗
                           ║   ALL RISE FOR THE COURT OF SILICON   ║
                           ╚═══════════════════════════════════════╝

                                         ▲▲▲
                                        /    \
                                       /  ⚖️  \
                                      /_________\
                                     |   JUDGE   |
                                     |   [LLM]   |
                                     |___________|
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
         ╭────┴────╮                 ╭────┴────╮                 ╭────┴────╮
         │PROSECUTOR│                │ WITNESS │                │ DEFENSE │
         │  [LLM]   │◄──────────────►│  [LLM]  │◄──────────────►│  [LLM]  │
         ╰─────────╯                 ╰─────────╯                 ╰─────────╯
              │                           │                           │
              └───────────────────────────┴───────────────────────────┘
                                          │
                              ┌───────────┴───────────┐
                              │     JURY BOX          │
                              │  [LLM] [LLM] [LLM]    │
                              │  [LLM] [LLM] [LLM]    │
                              └───────────────────────┘
```

---

## CHAPTER I: *The Architecture of Dispute*

Here lies a cathedral built not of stone but of state. At its foundation: **Zustand** — a German word meaning "condition" or "state" — and what fitting poetry for a courtroom, where the condition of truth is forever contested.

```
    ╔════════════════════════════════════════════════════════════════╗
    ║                    THE TRINITY OF CONCERNS                      ║
    ╠════════════════════════════════════════════════════════════════╣
    ║                                                                 ║
    ║   REACT COMPONENTS          SERVICES            ZUSTAND STORE  ║
    ║   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐  ║
    ║   │ 3D Courtroom│       │ Proceedings │       │   Single    │  ║
    ║   │ TranscriptV │◄─────►│   Engine    │◄─────►│   Source    │  ║
    ║   │ ControlPanel│       │  Agents     │       │   of Truth  │  ║
    ║   │ CaseSelector│       │  Factories  │       │             │  ║
    ║   └─────────────┘       └─────────────┘       └─────────────┘  ║
    ║        VIEW                 LOGIC                  STATE       ║
    ╚════════════════════════════════════════════════════════════════╝
```

The store at `src/store/useCourtroomStore.ts` is the silent bailiff — tracking who speaks, who thinks, who errs. It monitors the emotional pulse of silicon attorneys through `activeLLMAgents`, each tagged with their temperament:

```typescript
status: 'idle' | 'thinking' | 'speaking' | 'error'
```

Four states. Like the four classical elements. *Earth waits, Water thinks, Fire speaks, Void errs.*

---

## CHAPTER II: *The Factory of Fate*

```
    ┌─────────────────────────────────────────────────────────────────┐
    │                    THE MANUFACTURING OF JUSTICE                  │
    │                                                                  │
    │    ┌──────────────────┐                                         │
    │    │ CaseScenarioFactory│──────► Criminal Cases (NYS Law)       │
    │    │    1,700 lines    │──────► Civil Cases (Negligence, etc)   │
    │    └────────┬─────────┘                                         │
    │             │                                                    │
    │             ▼                                                    │
    │    ┌──────────────────┐                                         │
    │    │  WitnessFactory  │──────► Biases, Expertise, Testimony     │
    │    │    900 lines     │──────► Backgrounds, Credibility         │
    │    └────────┬─────────┘                                         │
    │             │                                                    │
    │             ▼                                                    │
    │    ┌──────────────────┐                                         │
    │    │  EvidenceFactory │──────► Documents, Forensics, Video      │
    │    │    700 lines     │──────► Chain of Custody Tracking        │
    │    └────────┬─────────┘                                         │
    │             │                                                    │
    │             ▼                                                    │
    │    ┌──────────────────┐                                         │
    │    │EnhancedJudgeFactory│────► Judicial Philosophy              │
    │    │    600 lines      │────► Ruling Patterns, Temperament      │
    │    └──────────────────┘                                         │
    └─────────────────────────────────────────────────────────────────┘
```

The factories are story-generators. They conjure cases from probabilistic ether — disputes worth `Math.floor(Math.random() * 2000000) + 100000` dollars. They weave witness packages with `biases` and `expertise`. Each witness carries their own hidden truths.

**Key Files:**
- `src/services/CaseScenarioFactory.ts` — Case generation engine
- `src/services/WitnessFactory.ts` — Witness profile creation
- `src/services/EvidenceFactory.ts` — Evidence package generation
- `src/services/EnhancedJudgeFactory.ts` — Judicial personality modeling

---

## CHAPTER III: *The Mind of the Machine Attorney*

Here we find the soul of the simulation — `src/services/agents/CourtroomAgent.ts`. Each participant carries cognitive architecture:

```
    ╔═══════════════════════════════════════════════════════════════════╗
    ║                      AGENT COGNITIVE MODEL                         ║
    ╠═══════════════════════════════════════════════════════════════════╣
    ║                                                                    ║
    ║    MEMORY SYSTEMS                        EMOTIONAL STATE          ║
    ║    ┌────────────────┐                    ┌──────────────┐         ║
    ║    │ shortTerm: []  │ ◄── recent events  │ stress: 0.3  │         ║
    ║    │ longTerm: []   │ ◄── education,     │ confidence:  │         ║
    ║    │ workingMemory  │     experience     │   0.5        │         ║
    ║    │ beliefs: Map   │ ◄── justice: 0.8   │ frustration: │         ║
    ║    │ relationships  │     truth: 0.9     │   0.2        │         ║
    ║    └────────────────┘     fairness: 0.7  │ satisfaction │         ║
    ║                                          │   0.5        │         ║
    ║                                          └──────────────┘         ║
    ║                                                                    ║
    ║    ┌─────────────────────────────────────────────────────┐        ║
    ║    │                  DAILY ROUTINE                       │        ║
    ║    │  Judge: "Review case files", "Study laws"...         │        ║
    ║    │  Prosecutor: "Research case law", "Interview..."     │        ║
    ║    │  Defense: "Meet with client", "Investigate..."       │        ║
    ║    └─────────────────────────────────────────────────────┘        ║
    ╚═══════════════════════════════════════════════════════════════════╝
```

Each agent **thinks before speaking**. The `think()` method precedes action — a deliberate cognitive layer. They hold beliefs in justice (0.8), truth (0.9), fairness (0.7). Numbers that shape their soul.

The `cognitiveLoad` variable tracks mental strain. Push an agent too hard and watch performance degrade. This is theatre, yes, but theatre with a pulse.

---

## CHAPTER IV: *The Stage of Three Dimensions*

```
    ┌────────────────────────────────────────────────────────────────┐
    │                    THE 3D COURTROOM                            │
    │                                                                │
    │             ═══════════════════════════                        │
    │            │ JUDGE BENCH (elevated) │                          │
    │            │  ∙ Warm gold uplighting │                         │
    │            │  ∙ Glow when thinking   │                         │
    │             ═══════════════════════════                        │
    │                        ▼                                       │
    │        ┌──────────┐         ┌──────────┐                       │
    │        │PROSECUTION│         │ DEFENSE  │                       │
    │        │  TABLE    │◄─────►│  TABLE   │                        │
    │        └──────────┘  floor  └──────────┘                       │
    │                                                                │
    │  ┌──────────┐                              ┌──────────┐        │
    │  │ WITNESS  │                              │  JURY    │        │
    │  │  STAND   │                              │   BOX    │        │
    │  └──────────┘                              └──────────┘        │
    │                                                                │
    │     DYNAMIC SPOTLIGHT ◎───────────────────► follows speaker    │
    │     Color: #ffeaa7 (warm gold)                                 │
    └────────────────────────────────────────────────────────────────┘
```

The `src/components/ImprovedCourtroom3D.tsx` is a theatre of light. Using **React Three Fiber** and **@react-three/drei**, it casts:

- **Ambient light** at `#fff8dc` (cornsilk warmth)
- **Dynamic spotlight** that tracks `activeSpeaker`
- **Thinking glow** — pulsing emissive materials when agents cogitate
- **Shadow mapping** at 2048x2048 resolution

The spotlight follows the orator. When the judge speaks, light pools upon the bench. When counsel objects, the camera's eye shifts. This is *drama* rendered in WebGL.

---

## CHAPTER V: *The Engine of Proceedings*

```
    ╔════════════════════════════════════════════════════════════════════╗
    ║                 THE PROCEEDINGS ENGINE                              ║
    ║                    (2,100+ lines of orchestration)                  ║
    ╠════════════════════════════════════════════════════════════════════╣
    ║                                                                     ║
    ║   PHASE STATE MACHINE                                               ║
    ║   ═══════════════════                                               ║
    ║                                                                     ║
    ║   case-preparation ──► pre-trial ──► jury-selection                 ║
    ║          │                                    │                     ║
    ║          │            ┌───────────────────────┘                     ║
    ║          │            ▼                                             ║
    ║          │    opening-statements ──► plaintiff-case                 ║
    ║          │                                    │                     ║
    ║          │                                    ▼                     ║
    ║          │                            defense-case                  ║
    ║          │                                    │                     ║
    ║          │                                    ▼                     ║
    ║          │                          closing-arguments               ║
    ║          │                                    │                     ║
    ║          │                                    ▼                     ║
    ║          │                          jury-deliberation               ║
    ║          │                                    │                     ║
    ║          │                                    ▼                     ║
    ║          └──────────────────────────────────► verdict               ║
    ║                                               │                     ║
    ║                                               ▼                     ║
    ║                                          sentencing                 ║
    ║                                         (criminal only)             ║
    ╚════════════════════════════════════════════════════════════════════╝
```

The `src/services/ProceedingsEngine.ts` is the conductor. Each phase has a handler. Each handler orchestrates AI agents, manages the event queue, handles objections, rules on motions.

The engine carries *timeouts* — 120 seconds per phase lest some LLM falls into infinite contemplation. If a phase fails, it `skipToNextPhase()`. The show must go on.

---

## CHAPTER VI: *The Babel of Providers*

```
    ┌─────────────────────────────────────────────────────────────────┐
    │              THE TOWER OF LLM PROVIDERS                         │
    │                                                                 │
    │                    ┌──────────────┐                             │
    │                    │BaseLLMProvider│ (abstract)                 │
    │                    │  generateResponse()                        │
    │                    │  validateConfig()                          │
    │                    └───────┬──────┘                             │
    │          ┌─────────────────┼─────────────────┐                  │
    │          ▼                 ▼                 ▼                  │
    │   ┌──────────┐      ┌──────────┐      ┌──────────┐             │
    │   │ OpenAI   │      │Anthropic │      │  Ollama  │             │
    │   │ Provider │      │ Provider │      │ Provider │             │
    │   │(gpt-4)   │      │(claude)  │      │(local)   │             │
    │   └──────────┘      └──────────┘      └──────────┘             │
    │          │                 │                 │                  │
    │          └─────────────────┼─────────────────┘                  │
    │                            ▼                                    │
    │                  ┌──────────────────┐                           │
    │                  │LLMProviderFactory│                           │
    │                  │  .create(config) │                           │
    │                  └──────────────────┘                           │
    │                                                                 │
    │   Also: Groq, Grok, OpenRouter, LM Studio, Custom Endpoints     │
    └─────────────────────────────────────────────────────────────────┘
```

A factory of minds. Each attorney may be backed by a different oracle. The judge might be Claude while counsel argues as GPT-4. The witness speaks through Llama running locally. A parliament of intelligences debating justice.

**Provider Files:**
- `src/services/llm/LLMProvider.ts` — Frontend abstraction
- `backend/src/services/LLMService.ts` — Backend orchestration

---

## CHAPTER VII: *The Queue of Patience*

```
    ┌─────────────────────────────────────────────────────────────────┐
    │                    BACKEND QUEUE ARCHITECTURE                    │
    │                                                                  │
    │     Frontend                    Backend                          │
    │    ┌─────────┐              ┌─────────────┐                     │
    │    │ Request │──WebSocket──►│ QueueService│                     │
    │    └─────────┘              └──────┬──────┘                     │
    │                                    │                            │
    │                                    ▼                            │
    │                            ┌──────────────┐                     │
    │                            │   Bull Queue │ (Redis-backed)      │
    │                            │  ┌─────────┐ │                     │
    │                            │  │Priority │ │                     │
    │                            │  │Sorting  │ │                     │
    │                            │  └────┬────┘ │                     │
    │                            └───────┼──────┘                     │
    │                                    │                            │
    │                      ┌─────────────┼─────────────┐              │
    │                      ▼             ▼             ▼              │
    │                 ┌────────┐   ┌────────┐   ┌────────┐           │
    │                 │OpenAI  │   │Claude  │   │Ollama  │           │
    │                 │   API  │   │   API  │   │ Pool   │           │
    │                 └────────┘   └────────┘   └────────┘           │
    │                                                │                │
    │                                   ┌────────────┘                │
    │                                   ▼                             │
    │                          OllamaPoolService                      │
    │                    ┌─────────────────────────┐                  │
    │                    │ Instance 1  Instance 2  │                  │
    │                    │ Instance 3  Instance 4  │                  │
    │                    │    (load balanced)      │                  │
    │                    └─────────────────────────┘                  │
    └─────────────────────────────────────────────────────────────────┘
```

The backend is a patient bureaucracy. Requests queue. Retries happen with exponential backoff. Circuit breakers prevent cascade. The `OllamaPoolService` distributes load across local GPU instances — a cluster of contemplation.

**Backend Services:**
- `backend/src/services/QueueService.ts` — Request queuing
- `backend/src/services/OllamaPoolService.ts` — Load balancing
- `backend/src/services/WebSocketService.ts` — Real-time communication

---

## CHAPTER VIII: *The Office Behind the Court*

A delightful surprise lurks in `src/services/OfficeManager.ts`. Before the trial, attorneys don't just *appear* prepared. They **work**:

```
    ┌─────────────────────────────────────────────────────────────────┐
    │                   THE OFFICE MANAGER                             │
    │                                                                  │
    │    Attorney Location: [courtroom] ◄──► [office]                 │
    │                                                                  │
    │    Work Sessions:                                                │
    │    ┌─────────────────────────────────────────────┐              │
    │    │ • evidence-review      (review documents)   │              │
    │    │ • witness-prep         (prepare witnesses)  │              │
    │    │ • legal-research       (case law lookup)    │              │
    │    │ • motion-drafting      (write motions)      │              │
    │    │ • strategy-session     (plan approach)      │              │
    │    └─────────────────────────────────────────────┘              │
    │                                                                  │
    │    Progress Callbacks:                                           │
    │    🏢 "Sarah Chen started evidence-review in office"             │
    │    📊 "Sarah Chen 45% complete with evidence-review"             │
    │    ✅ "Sarah Chen completed evidence-review"                     │
    │    📍 "Sarah Chen moved from office to courtroom"                │
    └─────────────────────────────────────────────────────────────────┘
```

Attorneys physically (well, virtually) leave the courtroom, go to their offices, work, and return. Location tracking. Progress percentages. Output artifacts. This is *ambient simulation* — the life between the drama.

---

## CHAPTER IX: *The Emotional Topology*

Every agent carries emotional state as floating point:

```
    STRESS          CONFIDENCE       FRUSTRATION      SATISFACTION
    ══════          ══════════       ═══════════      ════════════
      │                 │                 │                 │
    1.0 ┤               │                 │                 │
        │               │                 │                 │
    0.7 ┤    ▓▓▓        │                 │                 │
        │    ▓▓▓        │                 │                 │
    0.5 ┤    ▓▓▓        ▓▓▓              ▓▓▓               ▓▓▓
        │    ▓▓▓        ▓▓▓               │                ▓▓▓
    0.3 ┤    ▓▓▓        ▓▓▓               │                ▓▓▓
        │    ▓▓▓        ▓▓▓              ▓▓▓               ▓▓▓
    0.2 ┤    ▓▓▓        ▓▓▓              ▓▓▓               ▓▓▓
        │    ▓▓▓        ▓▓▓              ▓▓▓               ▓▓▓
    0.0 ┼────┴──────────┴────────────────┴─────────────────┴───
```

These are not static. Events modify emotional state. Lose an objection? Frustration rises. Win a motion? Confidence swells. The emotional variables feed back into prompt construction — stressed attorneys argue differently than calm ones.

---

## CHAPTER X: *The Jurisdiction Tapestry*

```
    ┌─────────────────────────────────────────────────────────────────┐
    │                  LEGAL SYSTEM SUPPORT                           │
    │                                                                 │
    │   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
    │   │  common-law  │   │  civil-law   │   │  religious   │       │
    │   │  (US, UK)    │   │  (Europe)    │   │  (Sharia)    │       │
    │   └──────────────┘   └──────────────┘   └──────────────┘       │
    │                                                                 │
    │   ┌──────────────┐   ┌──────────────┐                          │
    │   │   customary  │   │    mixed     │                          │
    │   │  (tribal)    │   │  (Louisiana) │ ◄── special file!        │
    │   └──────────────┘   └──────────────┘                          │
    │                                                                 │
    │   Louisiana Law:                                                │
    │   • src/types/louisianaLaw.ts      (rules & procedures)        │
    │   • src/components/LouisianaCourtroom.ts                       │
    │                                                                 │
    │   NYS Criminal:                                                 │
    │   • src/data/NYSCriminalCharges.ts (charge definitions)        │
    │   • generateNYSChargesFromFacts() (smart charge selection)     │
    └─────────────────────────────────────────────────────────────────┘
```

Louisiana gets special treatment — that beautiful anomaly of Napoleonic code in American soil. The architecture anticipates jurisdictional expansion.

---

## CHAPTER XI: *The Economic Undercurrent*

Buried within is a damages calculator. ARR, MRR, economic valuation dashboards. This courtroom is not merely theatrical — it computes:

```
    ┌─────────────────────────────────────────────────────────────────┐
    │                 ECONOMIC VALUATION ENGINE                        │
    │                                                                  │
    │   ┌──────────────────────────────────────────┐                  │
    │   │          ValuationCalculator.ts          │                  │
    │   │  ┌────────────────────────────────────┐  │                  │
    │   │  │ calculateARR(data)  → Annual RR    │  │                  │
    │   │  │ calculateMRR(data)  → Monthly RR   │  │                  │
    │   │  │ computeDamages()    → Loss Model   │  │                  │
    │   │  │ projectImpact()     → Future Value │  │                  │
    │   │  └────────────────────────────────────┘  │                  │
    │   └──────────────────────────────────────────┘                  │
    │                                                                  │
    │   ┌──────────────────────────────────────────┐                  │
    │   │          EconomicValuation/              │                  │
    │   │   • Dashboard.tsx    (visualization)     │                  │
    │   │   • Charts.tsx       (D3/Recharts)       │                  │
    │   │   • Summary.tsx      (executive view)    │                  │
    │   └──────────────────────────────────────────┘                  │
    └─────────────────────────────────────────────────────────────────┘
```

A civil case over IP theft? The system calculates damages. SaaS contract dispute? ARR projections. This is law-tech with financial teeth.

---

## CHAPTER XII: *The Data Flow — A Speech is Born*

```
    ╔════════════════════════════════════════════════════════════════════╗
    ║            HOW AN AI ATTORNEY SPEAKS IN COURT                      ║
    ╠════════════════════════════════════════════════════════════════════╣
    ║                                                                    ║
    ║  1. ProceedingsEngine.processPhase()                               ║
    ║     │                                                              ║
    ║     ▼                                                              ║
    ║  2. Phase handler calls agent.generateResponse(context)            ║
    ║     │                                                              ║
    ║     ▼                                                              ║
    ║  3. CourtroomAgent prepares:                                       ║
    ║     • System prompt (role, personality, objectives)                ║
    ║     • Case context and facts                                       ║
    ║     • Memory (short-term, long-term, beliefs)                      ║
    ║     • Current emotional state                                      ║
    ║     │                                                              ║
    ║     ▼                                                              ║
    ║  4. LLMProvider.generateResponse(messages)                         ║
    ║     │                                                              ║
    ║     ▼                                                              ║
    ║  5. Backend receives request via WebSocket                         ║
    ║     │                                                              ║
    ║     ▼                                                              ║
    ║  6. QueueService processes (queuing, retry logic)                  ║
    ║     │                                                              ║
    ║     ▼                                                              ║
    ║  7. LLMService routes to provider (OpenAI/Ollama/Claude)           ║
    ║     │                                                              ║
    ║     ▼                                                              ║
    ║  8. Response streamed back via WebSocket                           ║
    ║     │                                                              ║
    ║     ▼                                                              ║
    ║  9. CourtroomAgent processes response:                             ║
    ║     • Updates emotional state                                      ║
    ║     • Updates memory                                               ║
    ║     • Records transcript entry                                     ║
    ║     │                                                              ║
    ║     ▼                                                              ║
    ║  10. Zustand store updates → React re-renders                      ║
    ║      • TranscriptViewer shows new entry                            ║
    ║      • 3D spotlight moves to speaker                               ║
    ║      • ControlPanel reflects status                                ║
    ╚════════════════════════════════════════════════════════════════════╝
```

---

## CHAPTER XIII: *A Reflection on the Whole*

```
    ╔════════════════════════════════════════════════════════════════════╗
    ║                                                                    ║
    ║                    ┌─────────────────────┐                         ║
    ║                    │    THE VISION       │                         ║
    ║                    └──────────┬──────────┘                         ║
    ║                               │                                    ║
    ║    ┌──────────────────────────┼──────────────────────────┐        ║
    ║    │                          │                          │        ║
    ║    ▼                          ▼                          ▼        ║
    ║  Multi-Agent             Procedural              Economic         ║
    ║  Simulation              Fidelity               Modeling          ║
    ║    │                          │                          │        ║
    ║    │   Each agent thinks      │   10 trial phases        │        ║
    ║    │   independently with     │   with realistic         │   ARR  ║
    ║    │   memory & emotion       │   NY State law           │   MRR  ║
    ║    │                          │                          │        ║
    ║    └──────────────────────────┼──────────────────────────┘        ║
    ║                               │                                    ║
    ║                               ▼                                    ║
    ║                   ┌─────────────────────┐                          ║
    ║                   │  3D Visualization   │                          ║
    ║                   │  with Dynamic Light │                          ║
    ║                   └─────────────────────┘                          ║
    ╚════════════════════════════════════════════════════════════════════╝
```

This is not a toy. It is ambition crystallized.

### What Works Beautifully

- **Cognitive agent architecture** — genuine thought-before-speech
- **Factory patterns** that generate endless case variations
- **Provider abstraction** — swap LLMs like changing counsel
- **Emotional state** feedback into behavior
- **Office simulation** adding depth to downtime
- **Clean separation**: React renders, Services compute, Zustand remembers

### The Poetry of the Design

- Agents hold `beliefs` in `justice`, `truth`, `fairness` as floating points
- The spotlight literally follows who speaks
- Witnesses carry biases as data structures
- Trials timeout — even silicon patience has limits

---

## EPILOGUE: *The Unfinished Court*

```
    ┌─────────────────────────────────────────────────────────────────┐
    │                                                                 │
    │   "This court is not yet in session for production..."         │
    │                                                                 │
    │   Future Horizons:                                              │
    │   • Persistent storage for cases and transcripts               │
    │   • Comprehensive test coverage                                 │
    │   • Appeal process simulation                                   │
    │   • Multi-case continuity                                       │
    │   • More jurisdictions                                          │
    │                                                                 │
    │   Present Strengths:                                            │
    │   • A vision fully articulated                                  │
    │   • Architecture that breathes                                  │
    │   • Theatre that computes                                       │
    │                                                                 │
    └─────────────────────────────────────────────────────────────────┘
```

This codebase is a **demonstration of ambition**. It asks: *Can we simulate justice?* Not the outcome, but the *process* — the deliberation, the objection, the sidebar conference whispered in corners.

The answer, encoded in 15,000+ lines across 67 source files: *We can try.*

And in that trying, we find something beautiful — silicon actors performing the most human of dramas, arguing over truth in a courtroom of light.

```
                              ⚖️
                             /|\
                              |
                    THE COURT STANDS ADJOURNED
```

---

## Quick Reference: Key Files

| Purpose | Location |
|---------|----------|
| **Main Entry** | `src/App.tsx`, `src/main.tsx` |
| **State Store** | `src/store/useCourtroomStore.ts` |
| **Trial Engine** | `src/services/ProceedingsEngine.ts` |
| **AI Agents** | `src/services/agents/CourtroomAgent.ts` |
| **LLM Providers** | `src/services/llm/LLMProvider.ts` |
| **3D Courtroom** | `src/components/ImprovedCourtroom3D.tsx` |
| **Case Factory** | `src/services/CaseScenarioFactory.ts` |
| **Backend Entry** | `backend/src/index.ts` |
| **Backend LLM** | `backend/src/services/LLMService.ts` |
| **Queue Service** | `backend/src/services/QueueService.ts` |

---

*Recorded in the archives, December 2025*
