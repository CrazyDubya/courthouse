/**
 * Minimal engine for orchestrating a mock LLM‑driven courtroom.
 * The class is written to accommodate OpenAI‑compatible providers such as
 * OpenAI, Anthropic, Grok, Groq, Ollama, LMStudio, or OpenRouter. Network
 * calls are not implemented here; instead the methods return deterministic
 * structures so the rest of the application can be exercised and tested.
 */

export class CaseEngine {
  constructor(config = {}) {
    this.config = {
      jurySize: 6,
      includeWitnesses: true,
      ...config,
    }; // { provider: 'openai', apiKey: '...' }
  }

  /**
   * Build a procedural case using an LLM.
   * @param {string} prompt - description of the dispute
   * @returns {Promise<object>} case outline and generated evidence requests
   */
  async buildCase(prompt) {
    return {
      summary: `Mock case for: ${prompt}`,
      // include a trivial piece of evidence so the trial can render a verdict
      evidence: [{ id: 1, description: 'Sample evidence' }],
      witnesses: [{ id: 1, name: 'Alex Witness' }],
    };
  }

  /**
   * Assign personas for judge, counsel, jury and witnesses
   */
  async assignRoles(caseData) {
    const jury = Array.from({ length: this.config.jurySize }, (_, i) => ({
      id: i + 1,
      role: 'juror',
    }));

    const baseRoles = {
      judge: { name: 'Judge Judy', role: 'judge' },
      prosecutor: { name: 'Pat Prosecutor', role: 'prosecutor' },
      defense: { name: 'Dan Defense', role: 'defense' },
      defendant: { name: 'Daisy Defendant', role: 'defendant' },
      jury,
    };

    const witnesses = this.config.includeWitnesses ? caseData.witnesses : [];

    return { ...caseData, ...baseRoles, witnesses };
  }

  /**
   * Run the trial, managing openings, evidence presentation, and verdict
   */
  async runTrial(caseData) {
    // extremely naive verdict: presence of evidence implies guilt
    const verdict = caseData.evidence.length > 0 ? 'guilty' : 'not guilty';
    return { ...caseData, verdict };
  }
}
