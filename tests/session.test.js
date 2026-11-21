import test from 'node:test';
import assert from 'node:assert/strict';
import { encounters, INITIAL_STATE } from '../src/story.js';
import { canChoose, resolveChoice, normalizeSave } from '../src/session.js';
const copy = value => structuredClone(value);

test('a complete run resolves rides and reaches the coast at a ride end', () => {
  let state = copy(INITIAL_STATE), sessionLog = [], result;
  for (const active of encounters) {
    state = { ...state, rides: state.rides + 1 };
    let nodeId = active.start;
    do {
      const choices = active.nodes[nodeId].choices;
      const index = choices.findIndex(c => canChoose(state, c) && (c.effects.health || 0) >= 0 && (c.effects.sanity || 0) >= 0);
      const fallback = choices.findIndex(c => canChoose(state, c));
      result = resolveChoice({ state, active, nodeId, sessionLog }, index >= 0 ? index : fallback);
      assert.ok(result);
      ({ state, nodeId, sessionLog } = result);
    } while (result.mode === 'ride');
    assert.ok(state.completed.includes(active.id));
    if (result.mode === 'ending') break;
    assert.equal(result.mode, 'rest');
  }
  assert.equal(result.mode, 'ending');
  assert.ok(state.miles >= 300 && state.health > 0 && state.sanity > 0);
  assert.equal(state.completed.length, state.rides);
  assert.ok(sessionLog.length >= 3 * state.rides);
});

test('unaffordable, locked, and invalid choices do not resolve or mutate inputs', () => {
  const active = encounters.find(e => e.id === 'deep');
  const state = { ...copy(INITIAL_STATE), cash: 0 };
  const input = { state, active, nodeId: 'fight', sessionLog: [] }, before = copy(input);
  assert.equal(canChoose(state, { requires: 'absent', effects: {} }), false);
  assert.equal(canChoose(state, { effects: { cash: -1 } }), false);
  assert.equal(resolveChoice(input, 1), null); // flare is actually earned in the previous scene
  assert.equal(resolveChoice(input, 99), null);
  assert.deepEqual(input, before);
  const result = resolveChoice(input, 0);
  assert.ok(result);
  assert.deepEqual(input, before);
  assert.notStrictEqual(result.state, state);
  assert.notStrictEqual(result.sessionLog, input.sessionLog);
});

test('coast arrival waits for the final choice and completion is recorded first', () => {
  const active = encounters.find(e => e.id === 'saucer');
  const state = { ...copy(INITIAL_STATE), miles: 299 };
  const first = resolveChoice({ state, active, nodeId: 'intro', sessionLog: [] }, 0);
  assert.equal(first.mode, 'ride');
  assert.equal(first.ending, null);
  const middle = resolveChoice({ state: first.state, active, nodeId: first.nodeId, sessionLog: first.sessionLog }, 0);
  assert.equal(middle.mode, 'ride');
  const last = resolveChoice({ state: middle.state, active, nodeId: middle.nodeId, sessionLog: middle.sessionLog }, 0);
  assert.equal(last.mode, 'ending');
  assert.ok(last.state.completed.includes(active.id));
  assert.equal(last.ending.type, 'victory');
});

test('fatal consequences end a ride immediately', () => {
  const active = encounters.find(e => e.id === 'deep');
  const state = { ...copy(INITIAL_STATE), health: 1 };
  const result = resolveChoice({ state, active, nodeId: 'intro', sessionLog: [] }, 0);
  assert.equal(result.mode, 'ending');
  assert.equal(result.ending.type, 'death');
  assert.deepEqual(result.state.completed, []);
});

test('normalizes valid saves without aliasing and rejects corrupt snapshots', () => {
  const raw = { version: 1, state: copy(INITIAL_STATE), mode: 'ride', activeId: 'saucer', nodeId: 'intro', offerIndex: 0, declined: [], sessionLog: [], selectedRoute: 'unknown' };
  const normalized = normalizeSave(raw);
  assert.deepEqual(normalized, { ...raw, state: { ...raw.state, flags: [] } });
  normalized.state.inventory.push('new');
  assert.deepEqual(raw.state.inventory, []);
  assert.equal(normalizeSave({ ...raw, activeId: 'missing' }), null);
  assert.equal(normalizeSave({ ...raw, nodeId: 'missing' }), null);
  assert.equal(normalizeSave({ ...raw, state: { ...raw.state, health: NaN } }), null);
  assert.equal(normalizeSave({ ...raw, sessionLog: [null] }), null);
  assert.equal(normalizeSave(null), null);
  assert.equal(normalizeSave({ ...raw, state: { ...raw.state, health: 900 } }).state.health, 100);
});


test('save restoration filters unknown encounter references but preserves known history', () => {
  const entry = id => ({ encounter:id, title:'A title', driver:'A driver', choice:'A choice', text:'A scene', resolution:'An outcome', changes:'' });
  const raw = { version:1, state:{ ...copy(INITIAL_STATE), completed:['saucer','retired-story','saucer'] }, mode:'rest', activeId:'saucer', nodeId:null, offerIndex:0, declined:['retired-story','fox'], sessionLog:[entry('saucer'),entry('retired-story')], selectedRoute:'run-1' };
  const normalized = normalizeSave(raw);
  assert.deepEqual(normalized.state.completed, ['saucer']);
  assert.deepEqual(normalized.declined, ['fox']);
  assert.deepEqual(normalized.sessionLog, [entry('saucer')]);
  assert.deepEqual(raw.state.completed, ['saucer','retired-story','saucer']);
});

test('trust gates choices by active driver and applies changes immutably', () => {
  const state = copy(INITIAL_STATE);
  const active = { id: 'saucer', title: 'Test', driver: 'Test driver', nodes: { intro: { text: 'Hello', choices: [
    { label: 'Build trust', effects: {}, relation: 1, next: 'intro' },
    { label: 'Trust gate', effects: {}, requiresTrust: 1, relation: -1, next: 'intro' },
  ] } } };
  const input = { state, active, nodeId: 'intro', sessionLog: [] };
  assert.equal(canChoose(state, active.nodes.intro.choices[1]), false);
  assert.equal(resolveChoice(input, 1), null);
  const first = resolveChoice(input, 0);
  assert.equal(first.state.relationships.saucer, 1);
  assert.ok(first.changes.includes('Driver’s trust grew'));
  assert.equal(state.relationships, undefined);
  assert.equal(canChoose(first.state, active.nodes.intro.choices[1], 'fox'), false);
  const second = resolveChoice({ ...input, state: first.state }, 1);
  assert.equal(second.state.relationships.saucer, 0);
  assert.ok(second.changes.includes('Driver’s trust fell'));
  const capped = resolveChoice({ ...input, state: { ...state, relationships: { saucer: 3 } } }, 0);
  assert.ok(!capped.changes.some(change => change.includes('trust')));
  assert.equal(first.state.relationships.saucer, 1);
  assert.ok(first.changes.includes('Driver’s trust grew'));
});

test('save restoration sanitizes optional relationship scores', () => {
  const raw = { version: 1, state: { ...copy(INITIAL_STATE), relationships: { saucer: 100, fox: -99, deep: NaN, unknown: 2 } }, mode: 'rest', activeId: 'saucer', nodeId: null, offerIndex: 0, declined: [], sessionLog: [], selectedRoute: 'test' };
  assert.deepEqual(normalizeSave(raw).state.relationships, { saucer: 3, fox: -3 });
  assert.equal(raw.state.relationships.saucer, 100);
  assert.deepEqual(normalizeSave({ ...raw, state: { ...raw.state, relationships: ['bad'] } }).state.relationships, {});
});
