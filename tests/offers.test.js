import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseNextOffer, callbackText } from '../src/offers.js';

const encounters = [
  { id: 'source' }, { id: 'ordinary' },
  { id: 'callback', callbacks: [{ flag: 'remembered', text: 'The road remembers.' }] },
];
const select = (extra = {}) => chooseNextOffer({ encounters, state: { completed: [], flags: ['remembered'] }, activeId: 'source', offerIndex: 0, random: () => 0, ...extra });

test('earned consequences bring their driver into the next set of headlights', () => {
  assert.equal(select(), 2);
  assert.equal(select({ state: { completed: [], flags: [] } }), 1);
  assert.equal(callbackText(encounters[2], { flags: ['remembered'] }), 'The road remembers.');
  assert.equal(callbackText(encounters[2], {}), '');
});

test('declining or completing a callback keeps other rides available', () => {
  assert.equal(select({ declined: ['callback'] }), 1);
  assert.equal(select({ state: { completed: ['callback'], flags: ['remembered'] } }), 1);
  assert.equal(select({ state: { completed: ['ordinary', 'callback'], flags: [] } }), 1);
});
