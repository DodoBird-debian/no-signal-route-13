import test from 'node:test';
import assert from 'node:assert/strict';
import { encounters, INITIAL_STATE } from '../src/story.js';
import { getCabinObjects, inspectCabin, hasInspected } from '../src/inspections.js';
import { normalizeSave } from '../src/session.js';

test('cabin discoveries award real items once per ride and preserve the original state', () => {
  const encounter = encounters[0], state = structuredClone(INITIAL_STATE), before = structuredClone(state);
  const result = inspectCabin(state, encounter, 'glovebox');
  assert.ok(result.state.inventory.includes('tire iron'));
  assert.deepEqual(state, before);
  assert.equal(hasInspected(result.state, encounter, 'glovebox'), true);
  assert.equal(inspectCabin(result.state, encounter, 'glovebox'), null);
  assert.equal(inspectCabin(state, encounter, 'not-a-cabin-object'), null);
  assert.equal(inspectCabin({ ...state, health: 0 }, encounter, 'radio'), null);
});

test('inspection progress survives normal save restoration without advancing the story', () => {
  const encounter = encounters[0], state = inspectCabin(structuredClone(INITIAL_STATE), encounter, 'map').state;
  const saved = normalizeSave({ version: 1, state, mode: 'ride', activeId: encounter.id, nodeId: encounter.start, offerIndex: 0, declined: [], sessionLog: [], selectedRoute: 'inspection-test' });
  assert.equal(saved.nodeId, encounter.start);
  assert.equal(saved.state.miles, 0);
  assert.equal(inspectCabin(saved.state, encounter, 'map'), null);
  assert.ok(saved.state.inventory.includes('creased map'));
});

test('every ride offers four inspectable objects and special cabins reflect their story', () => {
  for (const encounter of encounters) {
    const objects = getCabinObjects(encounter);
    assert.equal(new Set(objects.map(o => o.id)).size, 4);
    assert.ok(objects.every(o => o.label && o.title && o.text && o.kind));
  }
  const mercy = encounters.find(e => e.id === 'siren');
  assert.equal(inspectCabin(structuredClone(INITIAL_STATE), mercy, 'glovebox').object.item, 'first-aid kit');
  const fox = encounters.find(e => e.id === 'fox');
  assert.equal(inspectCabin(structuredClone(INITIAL_STATE), fox, 'charm').object.item, 'veil ribbon');
});
