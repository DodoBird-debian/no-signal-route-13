import { consequenceGateReason, normalizeFlags, flagLabel } from './consequences.js';
import { encounters, INITIAL_STATE, applyChoice, deriveEnding } from './story.js';
import { applyTrust, trustScore } from './relationships.js';

export function canChoose(state, choice, driverId) {
  return !!choice && !consequenceGateReason(state, choice) && (!choice.requires || state.inventory.includes(choice.requires)) && -(choice.effects?.cash || 0) <= state.cash
    && (choice.requiresTrust === undefined || (typeof choice.requiresTrust === 'number' && Number.isFinite(choice.requiresTrust) && !!driverId && trustScore(state, driverId) >= choice.requiresTrust));
}

export function resolveChoice({ state, active, nodeId, sessionLog }, index) {
  const node = active?.nodes?.[nodeId];
  const choice = Number.isInteger(index) && index >= 0 ? node?.choices?.[index] : null;
  if (!node || !canChoose(state, choice, active.id)) return null;
  let nextState = applyChoice(state, choice);
  if (choice.relation !== undefined) nextState = applyTrust(nextState, active.id, choice.relation);
  const changes = [];
  if (choice.setFlag && !normalizeFlags(state.flags).includes(choice.setFlag) && normalizeFlags(nextState.flags).includes(choice.setFlag)) changes.push(`Road remembered: ${flagLabel(choice.setFlag)}`);
  const trustChange = trustScore(nextState, active.id) - trustScore(state, active.id);
  if (trustChange) changes.push(trustChange > 0 ? 'Driver’s trust grew' : 'Driver’s trust fell');
  for (const [key, label] of [['health','body'], ['sanity','nerve'], ['cash','cash'], ['miles','miles']]) {
    const difference = nextState[key] - state[key];
    if (difference) changes.push(`${difference > 0 ? '+' : ''}${difference} ${label}`);
  }
  if (choice.item && !state.inventory.includes(choice.item)) changes.push(`Found: ${choice.item}`);
  const nextLog = [...sessionLog, { encounter: active.id, title: active.title, driver: active.driver, choice: choice.label, text: node.text, resolution: choice.outcome || choice.detail || '', changes: changes.join(' · ') }];
  const rideEnded = choice.next === null;
  if (rideEnded && !nextState.completed.includes(active.id)) nextState.completed.push(active.id);
  // Fatal consequences take effect immediately; arriving at the coast waits until
  // the passenger has resolved the ride's final scene.
  const fatal = nextState.health <= 0 || nextState.sanity <= 0;
  const ending = fatal || rideEnded ? deriveEnding(nextState) : null;
  return { state: nextState, mode: ending ? 'ending' : rideEnded ? 'rest' : 'ride', nodeId: rideEnded ? null : choice.next, sessionLog: nextLog, ending, changes };
}

const encounterIds = new Set(encounters.map(encounter => encounter.id));
const stringArray = value => Array.isArray(value) && value.every(item => typeof item === 'string');
const finite = value => typeof value === 'number' && Number.isFinite(value);
const bound = (value, min, max = Infinity) => Math.max(min, Math.min(max, value));

export function normalizeSave(raw) {
  if (!raw || typeof raw !== 'object' || raw.version !== 1 || !raw.state || typeof raw.state !== 'object') return null;
  const active = encounters.find(e => e.id === raw.activeId);
  if (!active || !['roadside', 'ride', 'rest', 'ending'].includes(raw.mode)) return null;
  if (raw.mode === 'ride' && (typeof raw.nodeId !== 'string' || !Object.hasOwn(active.nodes, raw.nodeId))) return null;
  if (!['health','sanity','cash','fuel','miles','rides'].every(key => finite(raw.state[key]))) return null;
  if (!['inventory','completed','log'].every(key => stringArray(raw.state[key]))) return null;
  if (!Number.isInteger(raw.offerIndex) || raw.offerIndex < 0 || !stringArray(raw.declined) || !Array.isArray(raw.sessionLog) || typeof raw.selectedRoute !== 'string') return null;
  const logKeys = ['encounter','title','driver','choice','text','resolution','changes'];
  if (!raw.sessionLog.every(entry => entry && typeof entry === 'object' && logKeys.every(key => typeof entry[key] === 'string'))) return null;
  const state = { ...INITIAL_STATE,
    health: bound(raw.state.health, 0, 100), sanity: bound(raw.state.sanity, 0, 100),
    fuel: bound(raw.state.fuel, 0, 100), cash: bound(raw.state.cash, 0), miles: bound(raw.state.miles, 0),
    rides: Math.floor(bound(raw.state.rides, 0)), inventory: [...raw.state.inventory],
    completed: [...new Set(raw.state.completed.filter(id => encounterIds.has(id)))], log: [...raw.state.log] };
  state.flags = normalizeFlags(raw.state.flags);
  if (Object.hasOwn(raw.state, 'relationships')) {
    const relationships = raw.state.relationships;
    state.relationships = relationships && typeof relationships === 'object' && !Array.isArray(relationships)
      ? Object.fromEntries(Object.entries(relationships).filter(([id, score]) => encounterIds.has(id) && finite(score)).map(([id, score]) => [id, bound(score, -3, 3)]))
      : {};
  }
  return { version: 1, state, mode: raw.mode, activeId: active.id, nodeId: raw.mode === 'ride' ? raw.nodeId : null,
    offerIndex: raw.offerIndex % encounters.length, declined: raw.declined.filter(id => encounterIds.has(id)),
    sessionLog: raw.sessionLog.filter(entry => encounterIds.has(entry.encounter)).map(entry => Object.fromEntries(logKeys.map(key => [key, entry[key]]))), selectedRoute: raw.selectedRoute };
}
