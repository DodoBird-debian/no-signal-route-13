const clampTrust = score => Math.max(-3, Math.min(3, score));

export function trustScore(state, id) {
  const score = id && state?.relationships?.[id];
  return typeof score === 'number' && Number.isFinite(score) ? clampTrust(score) : 0;
}

export function trustLabel(score) {
  return score > 0 ? 'warm' : score < 0 ? 'wary' : 'guarded';
}

export function applyTrust(state, id, delta) {
  if (!id || typeof delta !== 'number' || !Number.isFinite(delta)) return state;
  return { ...state, relationships: { ...state.relationships, [id]: clampTrust(trustScore(state, id) + delta) } };
}
