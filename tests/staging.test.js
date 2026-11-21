import test from 'node:test';
import assert from 'node:assert/strict';
import { encounters, INITIAL_STATE } from '../src/story.js';
import { resolveStaging } from '../src/staging.js';

test('the UFO ride progresses from a lift to the hangar and a resolved return', () => {
  const saucer = encounters.find(e => e.id === 'saucer');
  assert.equal(resolveStaging(saucer, 'intro', 'ride', INITIAL_STATE).beat, 'abduction');
  for (const id of ['middle', 'shaft', 'diplomacy']) assert.equal(resolveStaging(saucer, id, 'ride', INITIAL_STATE).beat, 'hangar');
  assert.equal(resolveStaging(saucer, 'last', 'ride', INITIAL_STATE).beat, 'clear');
});

test('escaping Cthulhu enters a tunnel and its resolved beat removes the threat', () => {
  const deep = encounters.find(e => e.id === 'deep');
  assert.equal(resolveStaging(deep, 'fight', 'ride', INITIAL_STATE).beat, 'monster');
  assert.equal(resolveStaging(deep, 'escape', 'ride', INITIAL_STATE).beat, 'tunnel');
  assert.deepEqual(resolveStaging(deep, 'last', 'ride', INITIAL_STATE), { scene: 'road', beat: 'clear', moonless: false });
});

test('the roadside never retains the last ride’s props and fatal arrivals stay dark', () => {
  const deep = encounters.find(e => e.id === 'deep');
  assert.deepEqual(resolveStaging(deep, 'fight', 'roadside', INITIAL_STATE), { scene: 'road', beat: 'clear', moonless: false });
  assert.equal(resolveStaging(deep, null, 'ending', { ...INITIAL_STATE, miles: 310 }).scene, 'dawn');
  assert.equal(resolveStaging(deep, null, 'ending', { ...INITIAL_STATE, miles: 310, health: 0 }).scene, 'road');
});

test('all authored beats resolve to supported renderer stages', () => {
  const allowed = new Set(['road', 'abduction', 'hangar', 'checkpoint', 'chase', 'tunnel', 'monster', 'storm', 'clear']);
  for (const encounter of encounters) for (const id of Object.keys(encounter.nodes)) {
    assert.ok(allowed.has(resolveStaging(encounter, id, 'ride', INITIAL_STATE).beat));
  }
  const moon = encounters.find(e => e.id === 'moonradio');
  assert.equal(resolveStaging(moon, moon.start, 'ride', INITIAL_STATE).moonless, true);
  assert.equal(resolveStaging(moon, 'last', 'ride', INITIAL_STATE).moonless, false);
});
