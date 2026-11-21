import { canChoose, resolveChoice } from '../src/session.js';
import { inspectCabin } from '../src/inspections.js';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { encounters, INITIAL_STATE, applyChoice, deriveEnding, validateStory } from '../src/story.js';

const available = (node, state) => node.choices.filter(c => !c.requiresTrust && (!c.requires || state.inventory.includes(c.requires)) && -(c.effects?.cash || 0) <= state.cash);
const copy = value => structuredClone(value);

test('all encounter graphs are complete, reachable and terminate', () => {
  assert.deepEqual(validateStory(), []);
  assert.ok(encounters.length >= 24);
  for (const encounter of encounters) {
    const seen = new Set();
    function walk(id, path = new Set()) {
      assert.ok(!path.has(id), `${encounter.id}: cycle at ${id}`);
      const node = encounter.nodes[id];
      assert.ok(node?.text && node.choices.length >= 3, `${encounter.id}/${id}`);
      seen.add(id);
      const nextPath = new Set([...path, id]);
      for (const choice of node.choices) {
        assert.ok(choice.label && choice.detail && choice.effects);
        if (choice.next !== null) walk(choice.next, nextPath);
      }
    }
    walk(encounter.start);
    assert.deepEqual([...seen].sort(), Object.keys(encounter.nodes).sort());
    assert.ok(seen.size >= 3);
  }
});

test('choice application is immutable, bounded, and handles items', () => {
  const state = { ...copy(INITIAL_STATE), health: 98, sanity: 2, fuel: 99, cash: 2, miles: 1, inventory: ['key'] };
  const before = copy(state);
  const result = applyChoice(state, { effects: { health: 50, sanity: -50, fuel: 50, cash: -50, miles: -50 }, item: 'map', removeItem: 'key' });
  assert.deepEqual(state, before);
  assert.deepEqual([result.health, result.sanity, result.fuel, result.cash, result.miles], [100, 0, 100, 0, 0]);
  assert.deepEqual(result.inventory, ['map']);
  assert.notStrictEqual(result.completed, state.completed);
  assert.notStrictEqual(result.log, state.log);
  assert.deepEqual(applyChoice(result, { effects: {}, item: 'map' }).inventory, ['map']);
});

test('every encounter has a survivable complete path and reasonable distance', () => {
  for (const encounter of encounters) {
    const endings = [];
    function explore(nodeId, state) {
      for (const choice of available(encounter.nodes[nodeId], state)) {
        const next = applyChoice(state, choice);
        if (next.health <= 0 || next.sanity <= 0) continue;
        if (choice.next === null) endings.push(next);
        else explore(choice.next, next);
      }
    }
    explore(encounter.start, copy(INITIAL_STATE));
    assert.ok(endings.length, `${encounter.id} has no survivable route`);
    assert.ok(endings.every(s => s.miles >= 30 && s.miles <= 70), `${encounter.id} distance outside 30–70`);
  }
});

test('every gated option is reachable using an item earned in actual play', () => {
  let gates = 0, callbacks = 0;
  const walk = (encounter, initial, visitor) => {
    function explore(id, state) {
      const node = encounter.nodes[id];
      visitor(node, state);
      for (const choice of available(node, state)) {
        const next = applyChoice(state, choice);
        if (choice.next !== null && next.health > 0 && next.sanity > 0) explore(choice.next, next);
      }
    }
    explore(encounter.start, initial);
  };
  for (const target of encounters) for (const node of Object.values(target.nodes)) for (const gate of node.choices.filter(c => c.requires)) {
    gates++;
    let reachable = false;
    walk(target, copy(INITIAL_STATE), (current, state) => {
      if (current === node && available(current, state).includes(gate)) reachable = true;
    });
    if (reachable) continue;
    // Inspect an actual cabin object before proceeding through the encounter.
    for (const objectId of ['radio', 'glovebox', 'map', 'charm']) {
      const inspected = inspectCabin(copy(INITIAL_STATE), target, objectId);
      if (!inspected) continue;
      walk(target, inspected.state, (current, state) => {
        if (current === node && available(current, state).includes(gate)) reachable = true;
      });
      if (reachable) break;
    }
    if (reachable) continue;
    for (const source of encounters.filter(e => e !== target)) {
      // Capture only completed, affordable, survivable source paths, not invented items.
      const obtained = [];
      function acquire(id, state) {
        for (const choice of available(source.nodes[id], state)) {
          const next = applyChoice(state, choice);
          if (next.health <= 0 || next.sanity <= 0) continue;
          if (choice.next === null) { if (next.inventory.includes(gate.requires)) obtained.push(next); }
          else acquire(choice.next, next);
        }
      }
      acquire(source.start, copy(INITIAL_STATE));
      for (const state of obtained) walk(target, state, (current, currentState) => {
        if (current === node && available(current, currentState).includes(gate)) reachable = true;
      });
      if (reachable) break;
    }
    assert.ok(reachable, `${target.id}: no real route to gated ${gate.requires}`);
    callbacks++;
  }
  assert.ok(gates > 0);
  assert.ok(callbacks >= 6, 'cross-encounter callbacks should be playable');
});

test('a sequence of rides can reach the coast alive', () => {
  let state = copy(INITIAL_STATE);
  for (const encounter of encounters) {
    let id = encounter.start;
    while (id !== null && !deriveEnding(state)) {
      const choices = available(encounter.nodes[id], state);
      const choice = choices.find(c => (c.effects.health || 0) >= 0 && (c.effects.sanity || 0) >= 0) || choices[0];
      state = applyChoice(state, choice);
      id = choice.next;
    }
    if (deriveEnding(state)) break;
  }
  assert.ok(state.miles >= 300);
  assert.ok(state.health > 0 && state.sanity > 0);
  assert.ok(['victory', 'special', 'bittersweet'].includes(deriveEnding(state).type));
});

test('fatal and arrival endings are selected at their thresholds', () => {
  assert.equal(deriveEnding(copy(INITIAL_STATE)), null);
  assert.equal(deriveEnding({ ...INITIAL_STATE, health: 0 }).type, 'death');
  assert.equal(deriveEnding({ ...INITIAL_STATE, sanity: 0 }).type, 'madness');
  assert.equal(deriveEnding({ ...INITIAL_STATE, miles: 300 }).type, 'victory');
  assert.equal(deriveEnding({ ...INITIAL_STATE, miles: 300, inventory: ['tide message'] }).type, 'special');
  assert.equal(deriveEnding({ ...INITIAL_STATE, miles: 300, health: 0 }).type, 'death');
});


test('the featured encounters offer distinct paths with no gated dead ends', () => {
  for (const id of ['saucer', 'contraband', 'raccoon', 'crossfire', 'deep', 'fox', 'loop', 'schoolbus', 'siren']) {
    const encounter = encounters.find(e => e.id === id);
    const destinations = new Set(encounter.nodes.intro.choices.map(c => c.next));
    assert.ok(destinations.size >= 3, `${id}: intro does not branch`);
    const explored = new Set();
    function visit(nodeId, state) {
      const signature = `${nodeId}:${[...state.inventory].sort().join(',')}`;
      if (explored.has(signature)) return;
      explored.add(signature);
      const choices = available(encounter.nodes[nodeId], state);
      assert.ok(choices.length, `${id}/${nodeId}: no available choice`);
      for (const choice of choices) {
        assert.ok(choice.outcome, `${id}/${nodeId}: missing outcome`);
        const next = applyChoice(state, choice);
        if (choice.next !== null) visit(choice.next, next);
      }
    }
    visit(encounter.start, copy(INITIAL_STATE));
    for (const destination of destinations) assert.ok([...explored].some(x => x.startsWith(`${destination}:`)));
  }
});


test('all reachable live encounter states have an affordable, unlocked choice', () => {
  for (const encounter of encounters) for (const cash of [0, INITIAL_STATE.cash]) {
    const initial = { ...copy(INITIAL_STATE), cash };
    for (const [nodeId, node] of Object.entries(encounter.nodes)) assert.ok(node.choices.some(c => !c.requires && (c.effects?.cash || 0) >= 0), `${encounter.id}/${nodeId} lacks a free unlocked fallback`);
    const seen = new Set();
    function visit(nodeId, state) {
      const signature = JSON.stringify([nodeId, state.health, state.sanity, state.cash, state.fuel, state.miles, [...state.inventory].sort()]);
      if (seen.has(signature)) return;
      seen.add(signature);
      const choices = available(encounter.nodes[nodeId], state);
      assert.ok(choices.length, `${encounter.id}/${nodeId} has no choice with $${state.cash} and ${state.inventory}`);
      for (const choice of choices) {
        const next = applyChoice(state, choice);
        if (choice.next !== null && next.health > 0 && next.sanity > 0) visit(choice.next, next);
      }
    }
    visit(encounter.start, initial);
  }
});


test('new encounters have four-beat routes, branching, and valid vehicles', () => {
  const ids = ['jury','bloodbank','moonrepo','cake','snail','moonradio','kaiju','dragonlibrary','whalecourt','pageant','blacktoll','gpsdream','carwash','birthdayhearse','octoconductor','vending'];
  const vehicles = new Set(['sedan','van','bus','truck','convertible','hearse','ambulance','caravan','foodtruck','taxi']);
  assert.ok(encounters.length >= 40);
  for (const encounter of encounters) assert.ok(vehicles.has(encounter.vehicle), `${encounter.id}: invalid vehicle`);
  for (const id of ids) {
    const encounter = encounters.find(e => e.id === id);
    assert.ok(encounter);
    assert.ok(new Set(encounter.nodes.intro.choices.map(c => c.next)).size >= 2, `${id}: missing branches`);
    function explore(nodeId, depth, state) {
      const node = encounter.nodes[nodeId];
      for (const choice of available(node, state)) {
        assert.ok(choice.outcome, `${id}: missing outcome`);
        const next = applyChoice(state, choice);
        if (choice.next === null) {
          assert.ok(depth >= 4, `${id}: route too short`);
          assert.ok(next.miles >= 35 && next.miles <= 80, `${id}: ${next.miles} miles`);
        } else explore(choice.next, depth + 1, next);
      }
    }
    explore(encounter.start, 1, copy(INITIAL_STATE));
  }
});


test('every encounter portrait resolves to a shipped asset', () => {
  for (const encounter of encounters) {
    const path = fileURLToPath(new URL(`../public/assets/${encounter.portrait}.png`, import.meta.url));
    assert.ok(existsSync(path), `${encounter.id}: missing portrait ${encounter.portrait}`);
  }
});


test('cabin discoveries unlock the tire iron fight and mapped toll escape', () => {
  for (const [id, objectId, branchChoice, nodeId, requirement] of [
    ['deep', 'glovebox', 0, 'fight', 'tire iron'],
    ['blacktoll', 'map', 1, 'rescue', 'creased map'],
  ]) {
    const encounter = encounters.find(e => e.id === id);
    const state = copy(INITIAL_STATE);
    const inspected = inspectCabin(state, encounter, objectId);
    assert.ok(inspected?.state.inventory.includes(requirement));
    const intro = encounter.nodes.intro.choices[branchChoice];
    assert.equal(intro.next, nodeId);
    let next = applyChoice(inspected.state, intro);
    let node = encounter.nodes[nodeId];
    if (id === 'blacktoll') { next = applyChoice(next, available(node, next)[0]); node = encounter.nodes.horizon; }
    const option = node.choices.find(c => c.requires === requirement);
    assert.ok(option && available(node, next).includes(option));
    assert.ok(!available(node, { ...next, inventory: next.inventory.filter(item => item !== requirement) }).includes(option));
    assert.ok(applyChoice(next, option).miles > next.miles);
  }
});

test('all nodes fit the four-key choice interface', () => {
  for (const encounter of encounters) for (const [id, node] of Object.entries(encounter.nodes))
    assert.ok(node.choices.length <= 4, `${encounter.id}/${id} has too many choices`);
});


test('scene beat cues describe the intended narrative phases', () => {
  const valid = new Set(['road','abduction','hangar','checkpoint','chase','tunnel','monster','storm','clear']);
  for (const encounter of encounters) for (const node of Object.values(encounter.nodes)) if (node.beat) assert.ok(valid.has(node.beat));
  const node = (id, name) => encounters.find(e => e.id === id).nodes[name];
  assert.equal(node('saucer','intro').beat, 'abduction');
  assert.equal(node('saucer','shaft').beat, 'hangar');
  assert.equal(node('contraband','inspection').beat, 'checkpoint');
  assert.equal(node('crossfire','tunnel').beat, 'tunnel');
  assert.equal(node('deep','fight').beat, 'monster');
  assert.equal(node('deep','last').beat, 'clear');
  assert.equal(node('deep','last').scene, 'road');
  assert.equal(node('carwash','rinse').beat, 'storm');
  assert.equal(node('carwash','last').beat, 'clear');
});

test('trust metadata is bounded and optional trust choices have free alternatives', () => {
  let trustGateCount = 0, changes = 0;
  for (const encounter of encounters) for (const node of Object.values(encounter.nodes)) {
    for (const choice of node.choices) {
      if (choice.relation !== undefined) { assert.ok([-1,1].includes(choice.relation)); changes++; }
      if (choice.requiresTrust !== undefined) { assert.ok(Number.isInteger(choice.requiresTrust) && choice.requiresTrust > 0); trustGateCount++; }
    }
    assert.ok(node.choices.some(c => !c.requiresTrust && !c.requires && (c.effects.cash || 0) >= 0));
  }
  assert.ok(changes >= 8);
  assert.equal(trustGateCount, 1);
});


test('the optional trust route unlocks through two actual helpful choices', () => {
  const active = encounters.find(e => e.id === 'vending');
  const gate = active.nodes.delivery.choices.find(c => c.requiresTrust);
  let state = copy(INITIAL_STATE), sessionLog = [];
  assert.equal(canChoose(state, gate, active.id), false);
  let result = resolveChoice({ state, active, nodeId:'intro', sessionLog }, 0);
  assert.equal(result.nodeId, 'repair');
  assert.equal(canChoose(result.state, gate, active.id), false);
  result = resolveChoice({ state:result.state, active, nodeId:result.nodeId, sessionLog:result.sessionLog }, 0);
  assert.equal(result.nodeId, 'delivery');
  assert.equal(canChoose(result.state, gate, active.id), true);
  const index = active.nodes.delivery.choices.indexOf(gate);
  assert.equal(resolveChoice({ state:result.state, active, nodeId:result.nodeId, sessionLog:result.sessionLog }, index).nodeId, 'last');
});

test('new rides have branching four-beat routes and usable callbacks', () => {
  for (const id of ['lobsterstars', 'gnomeparole', 'shadowpawn', 'tomorrowcrew', 'lostandfound', 'antlimo']) {
    const e = encounters.find(e => e.id === id);
    assert.ok(e, id);
    const visit = (nodeId, path) => {
      const node = e.nodes[nodeId];
      assert.ok(node && !path.includes(nodeId), `${id}: invalid or cyclic route`);
      assert.ok(node.choices.length >= 3 && node.choices.length <= 4, `${id}/${nodeId}`);
      assert.ok(node.choices.some(c => !c.requires && !c.requiresTrust && (c.effects.cash || 0) >= 0), `${id}/${nodeId}: no free option`);
      for (const choice of node.choices) {
        if (choice.next === null) assert.equal(path.length + 1, 4, `${id}: route length`);
        else visit(choice.next, [...path, nodeId]);
      }
    };
    visit(e.start, []);
    assert.ok(new Set(e.nodes.intro.choices.map(c => c.next)).size >= 2, `${id}: no branch`);
    const callbacks = Object.values(e.nodes).flatMap(n => n.choices).filter(c => c.requires);
    assert.ok(callbacks.length, `${id}: no item callback`);
    for (const callback of callbacks) assert.ok(encounters.some(other => Object.values(other.nodes).some(n => n.choices.some(c => c.item === callback.requires))), `${id}: unknown item ${callback.requires}`);
  }
});

test('Claude and Bell have three playable opening branches with meaningful callbacks', () => {
  for (const [id, nodes, callbackNode, item] of [
    ['chef', ['tasting','origins','fries'], 'tasting', 'wedding favor'],
    ['ambulance', ['hand','equipment','directions'], 'directions', 'frequency note'],
  ]) {
    const active = encounters.find(e => e.id === id);
    assert.deepEqual(active.nodes.intro.choices.map(c => c.next), nodes);
    for (let i = 0; i < nodes.length; i++) {
      let state = copy(INITIAL_STATE), sessionLog = [];
      // The paid fries route is affordable from a fresh trip.
      let result = resolveChoice({ state, active, nodeId:'intro', sessionLog }, i);
      assert.equal(result.nodeId, nodes[i]);
      const node = active.nodes[result.nodeId];
      const direct = node.choices.findIndex(c => c.next === 'last' && !c.requires && (c.effects.cash || 0) >= 0);
      result = resolveChoice({ state:result.state, active, nodeId:result.nodeId, sessionLog:result.sessionLog }, direct);
      assert.equal(result.nodeId, 'last');
      result = resolveChoice({ state:result.state, active, nodeId:'last', sessionLog:result.sessionLog }, 0);
      assert.equal(result.mode, 'rest');
      assert.ok(result.state.completed.includes(id));
      assert.ok(result.state.miles >= 30 && result.state.miles <= 70);
    }
    const choice = active.nodes[callbackNode].choices.find(c => c.requires === item);
    assert.ok(choice);
    assert.equal(canChoose(copy(INITIAL_STATE), choice, id), false);
    assert.equal(canChoose({ ...copy(INITIAL_STATE), inventory:[item] }, choice, id), true);
  }
});
