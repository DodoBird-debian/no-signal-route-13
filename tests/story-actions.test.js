import test from 'node:test';
import assert from 'node:assert/strict';
import { encounters, INITIAL_STATE } from '../src/story.js';
import { canChoose, resolveChoice } from '../src/session.js';
import { getSceneActions, sceneActionIndex } from '../src/scene-actions.js';

test('scene-action metadata selects its actual story choice with the same outcome', () => {
  const kinds = new Set(['flare', 'scanner', 'radio', 'papers']);
  const locations = [];
  for (const active of encounters) for (const [nodeId, node] of Object.entries(active.nodes)) {
    node.choices.forEach((choice, index) => {
      if (!choice.sceneAction) return;
      const action = choice.sceneAction;
      assert.deepEqual(Object.keys(action).sort(), ['kind','label']);
      assert.ok(kinds.has(action.kind), `${active.id}/${nodeId}`);
      assert.ok(typeof action.label === 'string' && action.label.trim(), `${active.id}/${nodeId}`);
      const state = { ...structuredClone(INITIAL_STATE), inventory: choice.requires ? [choice.requires] : [], flags: choice.requiresFlag ? [choice.requiresFlag] : [] };
      if (choice.requiresTrust) state.relationships = { [active.id]: choice.requiresTrust };
      assert.ok(canChoose(state, choice, active.id));
      const input = { state, active, nodeId, sessionLog: [] };
      const physical = getSceneActions(active, nodeId, state).find(a => a.choiceIndex === index);
      assert.ok(physical?.enabled);
      assert.equal(sceneActionIndex(active, nodeId, state, physical.id), index);
      const result = resolveChoice(input, sceneActionIndex(active, nodeId, state, physical.id));
      assert.ok(result, `${active.id}/${nodeId}/${index}`);
      assert.equal(result.sessionLog.at(-1).choice, choice.label);
      assert.equal(result.sessionLog.at(-1).resolution, choice.outcome || choice.detail);
      assert.equal(result.nodeId, choice.next);
      locations.push(`${active.id}/${nodeId}/${action.kind}`);
    });
  }
  assert.equal(locations.length, 14);
  for (const id of ['saucer','crossfire','deep','radio','contraband','lostandfound','antlimo','chef','ambulance']) assert.ok(locations.some(location => location.startsWith(`${id}/`)), id);
});
