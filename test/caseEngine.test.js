import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CaseEngine } from '../src/agents/caseEngine.js';

test('buildCase returns mock case structure', async () => {
  const engine = new CaseEngine();
  const result = await engine.buildCase('dispute');
  assert.equal(result.summary, 'Mock case for: dispute');
  assert.ok(Array.isArray(result.evidence));
  assert.equal(result.witnesses.length, 1);
});

test('assignRoles respects config', async () => {
  const engine = new CaseEngine({ jurySize: 8, includeWitnesses: false });
  const caseData = await engine.buildCase('dispute');
  const roles = await engine.assignRoles(caseData);
  assert.equal(roles.jury.length, 8);
  assert.equal(roles.witnesses.length, 0);
  assert.ok(roles.judge);
});

test('runTrial produces verdict based on evidence', async () => {
  const engine = new CaseEngine();
  const caseData = await engine.buildCase('dispute');
  const roles = await engine.assignRoles(caseData);
  const result = await engine.runTrial(roles);
  assert.equal(result.verdict, 'guilty');
});
