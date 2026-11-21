import { getExteriorObjects } from './clues.js';

const token = (encounter, id) => `scouted:${encounter.id}:${id}`;

export function hasScouted(state, encounter, id) {
  return !!encounter && (state.log || []).includes(token(encounter, id));
}

export function inspectExterior(state, encounter, id) {
  if (!encounter || state.health <= 0 || state.sanity <= 0 || hasScouted(state, encounter, id)) return null;
  const object = getExteriorObjects(encounter).find(entry => entry.id === id);
  if (!object) return null;
  return {
    state: {
      ...state,
      inventory: [...state.inventory],
      completed: [...state.completed],
      log: [...state.log, token(encounter, id)],
    },
    object,
    changes: [],
    exterior: true,
  };
}
