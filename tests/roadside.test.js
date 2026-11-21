import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_STATE, encounters } from '../src/story.js';
import { inspectExterior, hasScouted } from '../src/roadside.js';
import { normalizeSave } from '../src/session.js';

test('scouting is an observation, preserves resources, and does not board the car', () => {
  const state = structuredClone(INITIAL_STATE), before = structuredClone(state), encounter = encounters[0];
  const result = inspectExterior(state, encounter, 'window');
  assert.ok(result.object.text);
  assert.deepEqual(state, before);
  for (const key of ['health', 'sanity', 'cash', 'miles', 'rides']) assert.equal(result.state[key], state[key]);
  assert.deepEqual(result.state.inventory, []);
  assert.deepEqual(result.state.completed, []);
  assert.ok(hasScouted(result.state, encounter, 'window'));
  assert.equal(inspectExterior(result.state, encounter, 'window'), null);
  assert.equal(inspectExterior(state, encounter, 'absent'), null);
});

test('roadside clues persist independently for different offers across save restoration', () => {
  const first = encounters[0], second = encounters[1];
  const state = inspectExterior(structuredClone(INITIAL_STATE), first, 'plate').state;
  assert.equal(hasScouted(state, second, 'plate'), false);
  const saved = normalizeSave({ version: 1, state, mode: 'roadside', activeId: first.id, nodeId: null, offerIndex: 0, declined: [], sessionLog: [], selectedRoute: 'roadside-save' });
  assert.equal(inspectExterior(saved.state, first, 'plate'), null);
  assert.ok(inspectExterior(saved.state, second, 'plate'));
});
