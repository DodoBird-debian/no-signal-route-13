import test from 'node:test';
import assert from 'node:assert/strict';
import { encounters, INITIAL_STATE } from '../src/story.js';
import { canChoose, normalizeSave, resolveChoice } from '../src/session.js';
import { activeConsequences, choiceConsequenceReason, normalizeFlags } from '../src/consequences.js';

const encounter = id => encounters.find(e => e.id === id);
const copy = value => structuredClone(value);
function choose(run, label) {
  const index = run.active.nodes[run.nodeId].choices.findIndex(c => c.label === label);
  assert.ok(index >= 0, `${run.active.id}/${run.nodeId}: ${label}`);
  const result = resolveChoice(run, index);
  assert.ok(result, `choice should be available: ${label}`);
  return { ...run, ...result };
}
function ride(state, sessionLog, id, labels) {
  let run = { state, sessionLog, active: encounter(id), nodeId: 'intro' };
  for (const label of labels) run = choose(run, label);
  return run;
}
function restore(run) {
  return normalizeSave({ version: 1, state:run.state, mode:'rest', activeId:run.active.id, nodeId:null, offerIndex:0, declined:[], sessionLog:run.sessionLog, selectedRoute:'trip' });
}

test('authored consequences survive saving and unlock choices on later rides', () => {
  const cases = [
    { source:'saucer', path:['Negotiate as a representative','Answer honestly','Say yes'], flag:'sky_ambassador', target:'radio', lead:['Play a record'], gate:'Send a message to the council' },
    { source:'crossfire', path:['Open the envelope','Fire the flare skyward','Sit with her'], flag:'helped_june', target:'contraband', lead:['Ask for a cut'], gate:'Mention June’s delivery' },
    { source:'deep', path:['Try to negotiate','Admit you are afraid','Promise to deliver it'], flag:'heard_the_deep', target:'whalecourt', lead:['Defend the fisherman','Ask to hear the recording'], gate:'Describe the deep’s reply' },
  ];
  for (const c of cases) {
    const initial = copy(INITIAL_STATE);
    const source = ride(initial, [], c.source, c.path);
    assert.deepEqual(initial.flags, undefined);
    assert.ok(source.state.flags.includes(c.flag));
    assert.ok(source.sessionLog.some(entry => entry.changes.includes('Road remembered:')));
    const saved = restore(source);
    assert.ok(saved.state.flags.includes(c.flag));
    assert.deepEqual(activeConsequences(saved.state).map(x => x.id), [c.flag]);
    const target = ride(saved.state, saved.sessionLog, c.target, c.lead);
    const gate = target.active.nodes[target.nodeId].choices.find(choice => choice.label === c.gate);
    assert.equal(canChoose({ ...target.state, flags:[] }, gate, target.active.id), false);
    assert.ok(choiceConsequenceReason({ ...target.state, flags:[] }, gate));
    assert.equal(choiceConsequenceReason(target.state, gate), '');
    assert.ok(canChoose(target.state, gate, target.active.id));
    assert.ok(choose(target, c.gate));
    assert.ok(target.active.callbacks.some(callback => callback.flag === c.flag));
  }
});

test('flags are finite, old saves remain valid, and exclusion gates work', () => {
  assert.deepEqual(normalizeFlags(['sky_ambassador','unknown','sky_ambassador',null]), ['sky_ambassador']);
  assert.deepEqual(normalizeFlags({ sky_ambassador:true }), []);
  const state = copy(INITIAL_STATE), active = encounter('radio');
  const gate = active.nodes.last.choices.find(c => c.excludesFlag);
  assert.equal(canChoose(state, gate, active.id), true);
  assert.equal(canChoose({ ...state, flags:['sky_ambassador'] }, gate, active.id), false);
  assert.ok(choiceConsequenceReason({ ...state, flags:['sky_ambassador'] }, gate));
  const raw = { version:1, state:{ ...state, flags:['unknown','helped_june','helped_june'] }, mode:'roadside', activeId:'radio', nodeId:null, offerIndex:0, declined:[], sessionLog:[], selectedRoute:'old' };
  assert.deepEqual(normalizeSave(raw).state.flags, ['helped_june']);
  delete raw.state.flags;
  assert.deepEqual(normalizeSave(raw).state.flags, []);
});
