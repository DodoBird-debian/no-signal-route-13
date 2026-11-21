import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_STATE, encounters } from '../src/story.js';
import { useSupply, supplyBenefit } from '../src/items.js';
import { normalizeAtlas, rememberTrip, chooseFirstOffer } from '../src/atlas.js';

const fresh = () => structuredClone(INITIAL_STATE);

test('supplies heal once, preserve bounds and never mutate or revive', () => {
  const state = { ...fresh(), health: 90, inventory: ['sandwich', 'red thread'] };
  const before = structuredClone(state);
  const result = useSupply(state, 'sandwich');
  assert.equal(result.health, 100);
  assert.equal(result.sanity, 100);
  assert.deepEqual(result.inventory, ['red thread']);
  assert.deepEqual(state, before);
  assert.equal(useSupply(result, 'sandwich'), null);
  assert.equal(useSupply({ ...state, health: 0 }, 'sandwich'), null);
  assert.equal(useSupply({ ...state, sanity: 0 }, 'sandwich'), null);
  assert.equal(useSupply({ ...state, health: 100 }, 'sandwich'), null);
  assert.equal(useSupply(state, 'red thread'), null);
  assert.equal(supplyBenefit(state, 'sandwich'), '+10 body');
});

test('a mixed supply restores both resources and is consumed', () => {
  const state = { ...fresh(), health: 95, sanity: 80, inventory: ['slice of pie'] };
  const next = useSupply(state, 'slice of pie');
  assert.equal(next.health, 100);
  assert.equal(next.sanity, 85);
  assert.deepEqual(next.inventory, []);
  assert.deepEqual(next.log, ['Used slice of pie.']);
});

test('the atlas retains discovered rides across new trips and deduplicates endings', () => {
  let atlas = normalizeAtlas(null);
  const completed = [encounters[0].id];
  const state = { ...fresh(), miles: 310, completed };
  const snapshot = { state, activeId: completed[0], mode: 'ending', ending: { title: 'The Coast at Last' }, runId: 'run-1' };
  atlas = rememberTrip(atlas, snapshot);
  atlas = rememberTrip(atlas, snapshot);
  assert.deepEqual(atlas.discovered, completed);
  assert.deepEqual(atlas.endings, ['The Coast at Last']);
  assert.deepEqual(atlas.finishedRuns, ['run-1']);
  const afterRestart = rememberTrip(atlas, { state: fresh(), activeId: encounters[1].id, mode: 'roadside', runId: 'run-2' });
  assert.deepEqual(afterRestart.discovered, completed);
  assert.equal(afterRestart.bestMiles, 310);
  assert.deepEqual(atlas, rememberTrip(atlas, snapshot));
});

test('atlas normalization filters corrupt data and new trips prefer unseen drivers', () => {
  const empty = normalizeAtlas({ version: 1, discovered: [null, 'nonexistent'], bestMiles: NaN });
  assert.deepEqual(empty.discovered, []);
  assert.equal(empty.bestMiles, 0);
  assert.equal(chooseFirstOffer(empty), 0);
  const seen = { ...empty, discovered: [encounters[0].id] };
  assert.equal(chooseFirstOffer(seen, () => 0), 1);
  assert.equal(chooseFirstOffer(seen, () => 1), encounters.length - 1);
});
