const scenes = new Set(['road', 'alien', 'checkpoint', 'shootout', 'cthulhu', 'forest', 'neon', 'dawn']);
const beats = new Set(['road', 'abduction', 'hangar', 'checkpoint', 'chase', 'tunnel', 'monster', 'storm', 'clear']);

export function resolveStaging(encounter, nodeId, mode, state) {
  if (mode === 'ending' && state.miles >= 300 && state.health > 0 && state.sanity > 0) return { scene: 'dawn', beat: 'clear', moonless: false };
  if (mode !== 'ride' || !encounter) return { scene: 'road', beat: 'clear', moonless: false };
  const node = encounter.nodes[nodeId] || {};
  const requested = node.scene || encounter.scene || 'road';
  const scene = scenes.has(requested) ? requested : 'road';
  const fallback = { checkpoint: 'checkpoint', shootout: 'chase', cthulhu: 'monster' }[scene] || 'road';
  return {
    scene,
    beat: beats.has(node.beat) ? node.beat : fallback,
    moonless: node.moonless ?? (encounter.id === 'moonradio'),
  };
}
