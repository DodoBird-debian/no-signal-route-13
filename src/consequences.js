// Trip-scoped facts are deliberately finite so old and malformed saves can be sanitized.
export const FLAG_LABELS = Object.freeze({
  sky_ambassador: 'Spoke for Earth',
  helped_june: 'Earned June’s confidence',
  heard_the_deep: 'Heard the deep',
});
export const flagLabel = flag => FLAG_LABELS[flag] || null;
export const normalizeFlags = flags => Array.isArray(flags)
  ? [...new Set(flags.filter(flag => typeof flag === 'string' && Object.hasOwn(FLAG_LABELS, flag)))]
  : [];
export const hasFlag = (state, flag) => normalizeFlags(state?.flags).includes(flag);
export function consequenceGateReason(state, choice) {
  if (choice?.requiresFlag && !hasFlag(state, choice.requiresFlag)) return `Requires: ${flagLabel(choice.requiresFlag) || 'an earlier road experience'}`;
  if (choice?.excludesFlag && hasFlag(state, choice.excludesFlag)) return `Unavailable after: ${flagLabel(choice.excludesFlag) || 'an earlier road experience'}`;
  return null;
}

const DESCRIPTIONS = Object.freeze({
  sky_ambassador: 'You spoke honestly to the survey council about Earth.',
  helped_june: 'You stayed with June after her difficult delivery.',
  heard_the_deep: 'You faced the immense eye and admitted your fear.',
});
export function activeConsequences(state) {
  return normalizeFlags(state?.flags).map(id => ({ id, label: FLAG_LABELS[id], description: DESCRIPTIONS[id] }));
}
export const choiceConsequenceReason = (state, choice) => consequenceGateReason(state, choice) || '';
