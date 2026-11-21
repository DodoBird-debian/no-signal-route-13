import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTrust, trustLabel, trustScore } from '../src/relationships.js';

test('trust defaults, labels, clamps, and leaves prior state untouched', () => {
  const state = { relationships: { driver: 2, other: -2 } };
  assert.equal(trustScore({}, 'driver'), 0);
  assert.equal(trustLabel(0), 'guarded');
  assert.equal(trustLabel(1), 'warm');
  assert.equal(trustLabel(-1), 'wary');
  const next = applyTrust(state, 'driver', 5);
  assert.equal(trustScore(next, 'driver'), 3);
  assert.equal(trustScore(applyTrust(next, 'driver', -10), 'driver'), -3);
  assert.deepEqual(state.relationships, { driver: 2, other: -2 });
  assert.equal(next.relationships.other, -2);
  assert.notStrictEqual(next.relationships, state.relationships);
});
