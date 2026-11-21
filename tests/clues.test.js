import test from 'node:test';
import assert from 'node:assert/strict';
import { encounters } from '../src/story.js';
import { getExteriorObjects } from '../src/clues.js';

test('every encounter has three distinct, complete exterior observations', () => {
  assert.equal(encounters.length, 46);
  const all = new Set();
  for (const encounter of encounters) {
    const observations = getExteriorObjects(encounter);
    assert.deepEqual(observations.map(o => o.id), ['window', 'plate', 'cargo'], encounter.id);
    assert.deepEqual(observations.map(o => o.kind), ['window', 'plate', 'cargo'], encounter.id);
    assert.deepEqual(observations.map(o => o.label), ['Study the driver', 'Read the plate', 'Check the cargo'], encounter.id);
    for (const observation of observations) {
      assert.ok(observation.title.trim() && observation.text.trim(), encounter.id);
      assert.ok(!all.has(observation.text), `duplicate observation: ${encounter.id}`);
      all.add(observation.text);
    }
  }
  assert.deepEqual(getExteriorObjects(null), []);
});
