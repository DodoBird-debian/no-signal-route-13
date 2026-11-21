import { applyChoice } from './story.js';

const token = (encounter, id) => `inspected:${encounter.id}:${id}`;
export function hasInspected(state, encounter, id) {
  return state.log.includes(token(encounter, id));
}

export function getCabinObjects(encounter) {
  const cosmic = ['alien', 'cthulhu'].includes(encounter.scene);
  const objects = [
    { id: 'radio', kind: 'radio', label: 'Tune the radio', title: 'Between the stations', text: 'You turn the dial until a tired voice announces clear skies over the coast. For once, you let yourself believe the forecast.', effects: { sanity: 2 }, reaction: 'reward' },
    { id: 'glovebox', kind: 'glovebox', label: 'Check the glovebox', title: 'A useful piece of metal', text: 'The driver nods toward the latch. Inside: expired registration, two fossilized mints, and a tire iron. “Keep it. Out here you should have something solid to hold.”', effects: {}, item: 'tire iron', reaction: 'reward' },
    { id: 'map', kind: 'map', label: 'Read the folded map', title: 'A pencil line to the sea', text: 'Someone has traced the westbound road in soft pencil. You fold the map along that line and keep it. A route is a small kind of promise.', effects: { sanity: 1 }, item: 'creased map', reaction: 'reward' },
    { id: 'charm', kind: 'charm', label: 'Examine the charm', title: 'Someone else was here', text: 'A tiny charm sways beneath the mirror. On the back, a passenger scratched: IF YOU GET THERE, WATCH THE SUN FOR ME. You hold it still for a moment, then let it swing.', effects: { sanity: 1 }, reaction: 'reward' },
  ];
  if (cosmic) Object.assign(objects[0], { title: 'An impossible request', text: encounter.id === 'deep' ? 'Between two storms, a voice asks you to remind the sea that even its oldest monsters can change. You record the message on a strip of dashboard tape.' : 'The radio picks up your own voice, seventeen minutes from now. It says to hold on to the ordinary things. Unit 7 quietly turns the volume down.', item: 'signal recording', reaction: encounter.id === 'deep' ? 'eldritch' : 'alien' });
  if (encounter.id === 'siren' || encounter.id === 'ambulance') Object.assign(objects[1], { title: 'Professional kindness', text: 'The glove compartment opens with a soft chime. There is a fresh first-aid kit inside, labeled FOR THE PASSENGER, JUST IN CASE. You accept the kindness without arguing.', item: 'first-aid kit' });
  if (encounter.id === 'fox') Object.assign(objects[3], { title: 'A ribbon, not a promise', text: 'Vesper says the ribbon is part of a very old ceremony. Kit cuts off a spare piece for you. “A souvenir,” she says firmly. “No obligations attached.”', item: 'veil ribbon' });
  if (encounter.id === 'ghost') Object.assign(objects[3], { title: 'A yellow kitchen', text: 'The charm is a little enamel kettle. Elise tells you her mother kept one exactly like it. She remembers the kitchen light first, then the smell of toast. You listen.', effects: { sanity: 4 } });
  if (encounter.id === 'moonradio') Object.assign(objects[0], { title: 'A caller from the tide', text: 'The sea calls again. This time you write down the return frequency. Undertow says not to give that number to the mountains; they never hang up.', item: 'frequency note' });
  if (encounter.id === 'taxi' || encounter.id === 'loop') Object.assign(objects[2], { title: 'The difference this time', text: 'The same intersection appears on six folded layers of the map. On the seventh, someone has drawn a way out. Nina lets you keep the marked sheet.', item: 'loop notebook' });
  return objects;
}

export function inspectCabin(state, encounter, id) {
  if (!encounter || state.health <= 0 || state.sanity <= 0 || hasInspected(state, encounter, id)) return null;
  const object = getCabinObjects(encounter).find(entry => entry.id === id);
  if (!object) return null;
  const next = applyChoice(state, object);
  next.log.push(token(encounter, id));
  const changes = [];
  for (const [key, label] of [['health', 'body'], ['sanity', 'nerve']]) {
    if (next[key] !== state[key]) changes.push(`+${next[key] - state[key]} ${label}`);
  }
  if (object.item && !state.inventory.includes(object.item)) changes.push(`Found: ${object.item}`);
  return { state: next, object, changes };
}
