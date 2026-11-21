import test from 'node:test';
import assert from 'node:assert/strict';
import { getSceneActions, sceneActionIndex } from '../src/scene-actions.js';

const encounter = { id: 'test', nodes: {
  intro: { choices: [{ label: 'Use flare', requires: 'flare', effects: {}, next: 'last', sceneAction: { kind: 'flare', label: 'Light the flare' } }] },
  last: { choices: [{ label: 'Tune radio', effects: {}, next: null, sceneAction: { kind: 'radio', label: 'Turn the dial' } }] },
} };
const state = { inventory: [], cash: 0 };

test('scene actions explain real gates and reject stale clicks after advancing', () => {
  const locked = getSceneActions(encounter, 'intro', state)[0];
  assert.equal(locked.enabled, false);
  assert.equal(locked.reason, 'Requires flare');
  assert.equal(sceneActionIndex(encounter, 'intro', state, locked.id), null);
  const ready = { ...state, inventory: ['flare'] };
  assert.equal(sceneActionIndex(encounter, 'intro', ready, locked.id), 0);
  assert.equal(sceneActionIndex(encounter, 'last', ready, locked.id), null);
  assert.equal(sceneActionIndex(encounter, 'last', ready, 'test:last:0'), 0);
  assert.deepEqual(state.inventory, []);
});

test('missing or unsupported physical actions are ignored safely', () => {
  assert.deepEqual(getSceneActions(null, 'intro', state), []);
  assert.deepEqual(getSceneActions(encounter, 'missing', state), []);
  const bad = { id: 'bad', nodes: { intro: { choices: [{ sceneAction: { kind: 'unknown', label: 'Bad' } }, { sceneAction: { kind: 'flare', label: '' } }] } } };
  assert.deepEqual(getSceneActions(bad, 'intro', state), []);
});
