export const supplies = Object.freeze({
  sandwich: { health: 18, sanity: 0, description: 'Chef Claude wrapped it for the road. Still surprisingly warm.' },
  'slice of pie': { health: 12, sanity: 5, description: 'Gravity seems willing to leave this slice alone.' },
  bandage: { health: 14, sanity: 0, description: 'A little care goes a long way out here.' },
  'first-aid kit': { health: 30, sanity: 0, description: 'Clean gauze, antiseptic, and a reassuring lack of mystery.' },
  'memorial cake': { health: 10, sanity: 8, description: 'A generous slice from an unexpectedly moving funeral.' },
  'sugar rose': { health: 0, sanity: 8, description: 'Eat the flower. Keep the memory.' },
});

export function useSupply(state, item) {
  const supply = supplies[item];
  if (!supply || !state.inventory.includes(item) || state.health <= 0 || state.sanity <= 0) return null;
  const health = Math.min(100, state.health + supply.health);
  const sanity = Math.min(100, state.sanity + supply.sanity);
  if (health === state.health && sanity === state.sanity) return null;
  return {
    ...state,
    health,
    sanity,
    inventory: state.inventory.filter(name => name !== item),
    completed: [...state.completed],
    log: [...state.log, `Used ${item}.`],
  };
}

export function supplyBenefit(state, item) {
  const supply = supplies[item];
  if (!supply) return '';
  return [supply.health && `+${Math.min(supply.health, 100 - state.health)} body`, supply.sanity && `+${Math.min(supply.sanity, 100 - state.sanity)} nerve`].filter(Boolean).join(' · ');
}
