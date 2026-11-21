import { encounters } from './story.js';

const encounterIds = new Set(encounters.map(e => e.id));
const strings = value => Array.isArray(value) ? [...new Set(value.filter(x => typeof x === 'string'))] : [];
export const EMPTY_ATLAS = Object.freeze({ version: 1, discovered: [], completed: [], endings: [], finishedRuns: [], bestMiles: 0 });

export function normalizeAtlas(raw) {
  if (!raw || raw.version !== 1) return structuredClone(EMPTY_ATLAS);
  return {
    version: 1,
    discovered: strings(raw.discovered).filter(id => encounterIds.has(id)),
    completed: strings(raw.completed).filter(id => encounterIds.has(id)),
    endings: strings(raw.endings),
    finishedRuns: strings(raw.finishedRuns).slice(-500),
    bestMiles: typeof raw.bestMiles === 'number' && Number.isFinite(raw.bestMiles) ? Math.max(0, raw.bestMiles) : 0,
  };
}

export function rememberTrip(atlas, { state, activeId, mode, ending, runId }) {
  const memory = normalizeAtlas(atlas);
  const met = ['ride', 'rest', 'ending'].includes(mode) && encounterIds.has(activeId);
  memory.discovered = [...new Set([...memory.discovered, ...(met ? [activeId] : []), ...state.completed.filter(id => encounterIds.has(id))])];
  memory.completed = [...new Set([...memory.completed, ...state.completed.filter(id => encounterIds.has(id))])];
  memory.bestMiles = Math.max(memory.bestMiles, state.miles);
  if (mode === 'ending' && ending && typeof runId === 'string' && runId) {
    memory.endings = [...new Set([...memory.endings, ending.title])];
    memory.finishedRuns = [...new Set([...memory.finishedRuns, runId])].slice(-500);
  }
  return memory;
}

export function chooseFirstOffer(atlas, random = Math.random) {
  const seen = normalizeAtlas(atlas).discovered;
  if (!seen.length) return 0; // The first trip opens with the carefully staged UFO ride.
  const undiscovered = encounters.map((e, i) => ({ e, i })).filter(({ e }) => !seen.includes(e.id));
  const pool = undiscovered.length ? undiscovered : encounters.map((e, i) => ({ e, i }));
  return pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))].i;
}
