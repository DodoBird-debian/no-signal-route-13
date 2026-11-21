// A consequence gets a chance to catch up with you on the next stretch of road.
// Passing its driver is still a valid decision; recent declines take priority.
export function chooseNextOffer({ encounters, state, activeId, offerIndex, declined = [], random = Math.random }) {
  const currentId = encounters[offerIndex]?.id;
  const available = encounters.map((encounter, index) => ({ encounter, index }))
    .filter(({ encounter }) => !state.completed.includes(encounter.id) && encounter.id !== activeId && encounter.id !== currentId);
  if (!available.length) return (offerIndex + 1) % encounters.length;
  const fresh = available.filter(({ encounter }) => !declined.slice(-5).includes(encounter.id));
  const pool = fresh.length ? fresh : available;
  const callbacks = pool.filter(({ encounter }) => encounter.callbacks?.some(callback => state.flags?.includes(callback.flag)));
  const choices = callbacks.length ? callbacks : pool;
  return choices[Math.min(choices.length - 1, Math.max(0, Math.floor(random() * choices.length)))].index;
}

export function callbackText(encounter, state) {
  return (encounter?.callbacks || []).filter(callback => state.flags?.includes(callback.flag)).map(callback => callback.text).join(' ');
}
