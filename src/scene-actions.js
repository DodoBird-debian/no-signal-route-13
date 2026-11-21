import { canChoose } from './session.js';
import { choiceConsequenceReason } from './consequences.js';

export const SCENE_ACTION_KINDS = Object.freeze(['flare', 'scanner', 'radio', 'papers']);

export function getSceneActions(encounter, nodeId, state) {
  const node = encounter?.nodes?.[nodeId];
  if (!node) return [];
  return node.choices.flatMap((choice, choiceIndex) => {
    const action = choice.sceneAction;
    if (!action || !SCENE_ACTION_KINDS.includes(action.kind) || typeof action.label !== 'string' || !action.label.trim()) return [];
    const enabled = canChoose(state, choice, encounter.id);
    const reason = enabled ? '' : choice.requires && !state.inventory.includes(choice.requires) ? `Requires ${choice.requires}`
      : choiceConsequenceReason(state, choice) || (choice.requiresTrust !== undefined ? 'Requires more trust from this driver' : `Need $${Math.abs(choice.effects?.cash || 0)}`);
    return [{ id: `${encounter.id}:${nodeId}:${choiceIndex}`, kind: action.kind, label: action.label, choiceIndex, enabled, reason }];
  });
}

// The node is part of the ID: a delayed or repeated click cannot select a
// different choice after the story advances.
export function sceneActionIndex(encounter, nodeId, state, actionId) {
  const action = getSceneActions(encounter, nodeId, state).find(action => action.id === actionId && action.enabled);
  return action?.choiceIndex ?? null;
}
