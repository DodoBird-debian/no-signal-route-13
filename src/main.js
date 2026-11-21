import './style.css';
import { createWorld } from './world.js';
import { encounters, INITIAL_STATE, deriveEnding } from './story.js';
import { canChoose, resolveChoice, normalizeSave } from './session.js';
import { createAudio } from './audio.js';
import { supplies, useSupply, supplyBenefit } from './items.js';
import { normalizeAtlas, rememberTrip, chooseFirstOffer } from './atlas.js';
import { stepLook, dragLook } from './look.js';
import { getCabinObjects, hasInspected, inspectCabin } from './inspections.js';
import { resolveStaging } from './staging.js';
import { trustScore, trustLabel } from './relationships.js';
import { getExteriorObjects } from './clues.js';
import { hasScouted, inspectExterior } from './roadside.js';
import { activeConsequences, choiceConsequenceReason } from './consequences.js';
import { chooseNextOffer, callbackText } from './offers.js';
import { getSceneActions, sceneActionIndex } from './scene-actions.js';

const $ = (s) => document.querySelector(s);
const app = $('#app');
const SAVE_KEY = 'no-signal-route13-v1';
const PREF_KEY = 'no-signal-preferences-v1';
const ATLAS_KEY = 'no-signal-atlas-v1';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const svg = (name) => {
  const paths = {
    signal:'<path d="M4 17v-3m5 3V9m5 8V5m5 12V2"/><path d="m3 3 18 18"/>',
    arrow:'<path d="M4 12h15m-5-5 5 5-5 5"/>',
    sound:'<path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute:'<path d="m11 4-6 5H2v6h3l6 5zM16 9l6 6m0-6-6 6"/>',
    book:'<path d="M12 5c-3-2-7-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-3-1-7-1-10 1zm0 0v15"/>',
    heart:'<path d="M20 5c-3-3-6-1-8 1-2-2-5-4-8-1-4 4 0 9 8 15 8-6 12-11 8-15z"/>',
    eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    bag:'<rect x="5" y="7" width="14" height="14" rx="3"/><path d="M8 7V5a4 4 0 0 1 8 0v2M9 12h6"/>',
    pin:'<path d="M19 9c0 6-7 13-7 13S5 15 5 9a7 7 0 1 1 14 0z"/><circle cx="12" cy="9" r="2"/>',
    thumb:'<path d="M7 11v10H3V11zm0 0 5-8c3 0 3 3 1 7h6c2 0 2 2 1 4l-2 7H7"/>',
    gear:'<path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 2 4h4l2-3 3-1 2-4-2-2 1-3-3-2-2-3z"/><circle cx="11" cy="12" r="3"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',
    moon:'<path d="M20 15A9 9 0 0 1 9 3 9 9 0 1 0 20 15z"/>',
    reset:'<path d="M3 10a9 9 0 1 1 2 8M3 4v6h6"/>',
    car:'<path d="m4 8 2-5h12l2 5M3 9h18v9H3zm3 9v3m12-3v3M6 13h2m8 0h2"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.arrow}</svg>`;
};
let preferences = { sound:false, motion:!matchMedia('(prefers-reduced-motion: reduce)').matches };
try { preferences={...preferences,...JSON.parse(localStorage.getItem(PREF_KEY)||'{}')}; }catch{}
let state=structuredClone(INITIAL_STATE), mode='title', active=null, nodeId=null, offerIndex=0, ending=null, modal=null, noticeTimer;
let selectedRoute='unknown', sessionLog=[], declined=[], transitionLock=false;
let atlas=normalizeAtlas(null);
try { atlas=normalizeAtlas(JSON.parse(localStorage.getItem(ATLAS_KEY))); }catch{}
let sceneFocus=false, look={yaw:0,pitch:0}, dragStart=null, interactionNote=null;
let modalOrigin=null;
let saved=null;
try { saved=normalizeSave(JSON.parse(localStorage.getItem(SAVE_KEY))); }catch{}
const world=createWorld($('#world'));
world.setMotion(preferences.motion);
const audio=createAudio();
const getOffer = () => encounters[offerIndex % encounters.length];
const current = () => mode==='ride' ? active : getOffer();
const sceneActions = () => mode==='ride'?getSceneActions(active,nodeId,state):[];
function save() {
  try { localStorage.setItem(PREF_KEY,JSON.stringify(preferences)); if(mode!=='title'){saved={version:1,state,mode,activeId:active?.id||getOffer().id,nodeId,offerIndex,declined,sessionLog,selectedRoute};localStorage.setItem(SAVE_KEY,JSON.stringify(saved));atlas=rememberTrip(atlas,{state,activeId:active?.id,mode,ending,runId:selectedRoute});localStorage.setItem(ATLAS_KEY,JSON.stringify(atlas));} } catch{}
}
function updateWorld() {
  const e=current();
  world.setMode(mode==='ride'?'driving':'roadside');
  world.setDriver(e?.portrait || 'driver',e?.color || '#dbac68');
  world.setVehicle(e?.vehicle || 'sedan',e?.color);
  world.setInspectables(mode==='ride'?getCabinObjects(active).filter(o=>!hasInspected(state,active,o.id)):[]);
  world.setExteriorInspectables(mode==='roadside'?getExteriorObjects(e):[]);
  world.setStoryActions(sceneActions().filter(action=>action.enabled));
  if(mode==='roadside')world.arrive(selectedRoute+':'+e.id);
  const staging=resolveStaging(e,nodeId,mode,state);
  world.setScene(staging.scene,{moonless:staging.moonless});world.setBeat(staging.beat);
  world.setSpeed(mode==='ride'?1:0.12);
  audio.drive(mode==='ride');
}
const effectiveEnding=()=>deriveEnding(state);
function stat(label, value, icon, color) {return `<div class="stat" style="--stat:${color}"><div class="stat-label">${svg(icon)}<span>${label}</span><strong>${Math.round(value)}<small>/100</small></strong></div><div class="stat-track"><i style="width:${Math.max(0,Math.min(100,value))}%"></i></div></div>`;}
function header(){return `<header class="topbar"><a class="brand" href="#" data-action="home" aria-label="No Signal home"><span class="brand-mark">${svg('signal')}</span><span>NO SIGNAL<small>A ROUTE 13 STORY</small></span></a><nav aria-label="Game navigation"><button class="nav-button ${modal==='journal'?'selected':''}" data-action="journal" aria-label="Travel journal">${svg('book')}<span>Travel journal</span><span class="counter">${state.completed.length.toString().padStart(2,'0')}</span></button><button class="nav-button" data-action="help" aria-label="How to play"><span class="help-mark">?</span><span>How to play</span></button><span class="nav-divider"></span><button class="icon-button ${preferences.sound?'active':''}" data-action="sound" aria-label="${preferences.sound?'Mute sound':'Enable sound'}" title="${preferences.sound?'Mute sound':'Enable sound'} (M)">${svg(preferences.sound?'sound':'mute')}</button><button class="icon-button" data-action="settings" aria-label="Settings">${svg('gear')}</button></nav></header>`;}
function route(){const progress=Math.min(100,state.miles/300*100);return `<aside class="route-widget"><div class="route-top"><span class="route-shield">13</span><span>WESTBOUND<small>BLACKWATER COAST</small></span></div><div class="route-line"><span class="route-start"></span><i style="height:${Math.max(4,progress)}%"></i><span class="route-player" style="top:${Math.max(3,Math.min(96,progress))}%">${svg('car')}</span><span class="route-end">${svg('pin')}</span></div><div class="route-distance"><strong>${Math.round(Math.max(0,300-state.miles))}</strong><span>MILES TO DAWN</span></div></aside>`;}
function footer(){return `<footer class="hud"><div class="hud-status"><span class="live-dot"></span><span>${mode==='ride'?'IN TRANSIT':mode==='ending'&&state.miles>=300&&state.health>0&&state.sanity>0?'ARRIVED':'ROADSIDE'}<small>${mode==='ride'?esc(active?.driver):mode==='ending'&&state.miles>=300&&state.health>0&&state.sanity>0?'BLACKWATER COAST':'MILE '+Math.round(state.miles)+' · SOMEWHERE, NEVADA'}</small></span></div><div class="vitals">${stat('BODY',state.health,'heart','#d9a97d')}${stat('NERVE',state.sanity,'eye','#70c9c2')}</div><div class="pocket"><span>CASH</span><strong>$${state.cash}</strong></div><button class="inventory-button" data-action="inventory" aria-label="Backpack with ${state.inventory.length} ${state.inventory.length===1?'item':'items'}">${svg('bag')}<span>BACKPACK<small>${state.inventory.length} ${state.inventory.length===1?'ITEM':'ITEMS'}</small></span></button><div class="clock">${svg('moon')}<span>${clockTime()}<small>${mode==='ending'&&state.miles>=300&&state.health>0&&state.sanity>0?'DAWN AT LAST':'THE NIGHT IS STILL YOUNG'}</small></span></div></footer>`;}
function clockTime(){const minutes=107+Math.round(state.miles*.65);return `${String(Math.floor(minutes/60)%12||12).padStart(2,'0')}:${String(minutes%60).padStart(2,'0')} AM`;}
function titleView(){return `<section class="title-view"><div class="eyebrow"><span></span> AN UNLIKELY ROAD TRIP</div><h1>NO<br><span>SIGNAL</span><sup>™</sup></h1><div class="title-subline"><span class="mini-route">13</span><span>300 MILES. ONE VERY STRANGE NIGHT.</span></div><p class="intro">Your phone is dead. The coast is far.<br>And someone just pulled over.</p><p class="intro-small">Hitch a ride through the American nowhere.<br>Trust your gut. Expect absolutely anything.</p><button class="primary-button start-button" data-action="start">${svg('thumb')}<span>Stick out your thumb</span>${svg('arrow')}</button>${saved?'<button class="continue-button" data-action="continue">Continue your night '+svg('arrow')+'</button>':''}<button class="atlas-launch" data-action="atlas">${svg('book')}<span>Road atlas <small>${atlas.discovered.length} / ${encounters.length} DRIVERS MET</small></span>${svg('arrow')}</button><div class="title-footnote"><span class="live-dot"></span> A FIRST-PERSON HITCHHIKING ADVENTURE</div></section><div class="world-caption"><span class="tiny-label">YOUR NEXT BAD IDEA</span><h2>A stranger. A ride.<br>A terrible feeling.</h2><div><i></i> YOU DECIDE WHO STOPS.</div></div><div class="road-stamp"><span>EST. 01:47 AM</span><strong>NOWHERE / NV</strong><span>37° 14′ N &nbsp; 115° 48′ W</span></div>`;}
function riskLabel(e){return typeof e.risk==='number'?(e.risk<35?'A LITTLE OFF':e.risk<70?'PROBABLY A BAD IDEA':'DEFINITELY A BAD IDEA'):e.risk||'TRUST YOUR INSTINCTS';}
function consequenceNote(e){const text=callbackText(e,state);return text?`<p class="consequence-note"><span>THE ROAD REMEMBERS</span>${esc(text)}</p>`:'';}
function roadsideView(){const e=getOffer();return `<section class="offer-view panel-enter"><div class="eyebrow"><span></span> HEADLIGHTS IN THE DISTANCE</div><h1 class="section-title">Every ride<br>has a <em>catch.</em></h1><p class="offer-intro">A car slows to a stop. The passenger window rolls down.<br>You have a decision to make.</p><article class="ride-card"><div class="ride-card-top"><span class="tiny-label">RIDE ${String(state.rides+1).padStart(2,'0')}</span><span class="risk"><i></i>${esc(riskLabel(e))}</span></div><div class="driver-summary"><div class="driver-avatar"><img src="/assets/${esc(e.portrait)}.png" alt="${esc(e.driver)}" /></div><div><span class="tiny-label">${esc(e.car||'AN UNMARKED SEDAN')}</span><h2>${esc(e.driver)}</h2><span class="driver-tag">${esc(e.subtitle||e.tag)}</span></div></div><p class="ride-description">${esc(e.description)}</p>${consequenceNote(e)}<button class="scout-button" data-action="scout-view">${svg('eye')}<span>Take a closer look</span><small>${getExteriorObjects(e).filter(o=>hasScouted(state,e,o.id)).length} / 3 NOTES</small></button><div class="ride-actions"><button class="secondary-button" data-action="pass">Let it pass ${svg('arrow')}</button><button class="primary-button" data-action="ride">${svg('thumb')} Hop in</button></div><div class="choice-hint"><kbd>1</kbd> LET IT PASS <span>·</span> <kbd>2</kbd> HOP IN</div></article><div class="roadside-whisper">${svg('eye')} ${esc(roadsideTip())}</div></section><div class="scene-label"><span class="tiny-label">ROUTE 13 / WESTBOUND</span><p>Some roads don't<br>show up on maps.</p></div>`;}
function roadsideTip(){return ['Nobody gets to the coast alone.','You can always wait for another ride.','A friendly face is not a safety guarantee.','The desert remembers every passenger.','Check your backpack. Strange things come in handy.'][declined.length%5];}
function rideView(){const node=active.nodes[nodeId];if(!node)return '';return `<section class="ride-view panel-enter"><div class="encounter-heading"><span class="tiny-label">ENCOUNTER ${String(state.rides).padStart(2,'0')} <i>/</i> ${esc(active.tag||'THE NIGHT SHIFT')}</span><h1>${esc(active.title)}</h1><div class="driver-speaking"><img src="/assets/${esc(active.portrait)}.png" alt=""/><i></i>${esc(active.driver)} <span>· ${esc(active.car)}</span><span class="trust-badge ${trustLabel(trustScore(state,active.id))}">Trust: ${trustLabel(trustScore(state,active.id))}</span></div></div>${consequenceNote(active)}<article class="dialogue-box"><span class="dialogue-quote">“</span><p class="story-text">${esc(node.text)}</p>${sceneActions().some(a=>a.enabled)?`<button class="scene-action-launch" data-action="act-view">${svg('thumb')} Act in the scene ${svg('arrow')}</button>`:''}<div class="story-choices">${node.choices.map((c,i)=>{const itemLocked=c.requires&&!state.inventory.includes(c.requires);const trustLocked=c.requiresTrust!==undefined&&trustScore(state,active.id)<c.requiresTrust;const locked=!canChoose(state,c,active.id);return `<button class="story-choice" data-choice="${i}" ${locked?'disabled':''}><span class="choice-number">${i+1}</span><span><strong>${esc(c.label)}</strong>${c.detail?`<small>${esc(c.detail)}</small>`:''}${locked?`<small class="required">${itemLocked?'Requires '+esc(c.requires):trustLocked?'Requires more trust from this driver':choiceConsequenceReason(state,c)||'Need $'+Math.abs(c.effects?.cash||0)}</small>`:''}</span>${svg('arrow')}</button>`}).join('')}</div></article><div class="ride-caption">${svg('car')} THE WHEELS KEEP TURNING. <button data-action="help">CHOICES HAVE CONSEQUENCES.</button></div></section><div class="passenger-tag"><span class="live-dot"></span><span>YOUR DRIVER<small>${esc(active.driver)}</small></span></div>`;}
function restView(){const last=sessionLog.at(-1);return `<section class="rest-view panel-enter"><div class="eyebrow"><span></span> BACK ON SOLID GROUND. MOSTLY.</div><h1 class="section-title">Still here.<br><em>Somehow.</em></h1><p class="rest-story">${esc(last?.resolution||'The taillights disappear around a bend. For a moment, the desert is quiet. You check your pockets and your pulse. Both have changed.')}</p><div class="receipt"><div><span>RIDE COMPLETED</span><strong>${esc(active?.title)}</strong></div><div><span>DISTANCE COVERED</span><strong>${Math.round(state.miles)} <small>/ 300 MI</small></strong></div><div><span>STORIES TO TELL</span><strong>${state.completed.length} <small>AND COUNTING</small></strong></div></div><button class="primary-button" data-action="next">Back to the roadside ${svg('arrow')}</button><button class="continue-button" data-action="journal">Write it all down ${svg('book')}</button></section>`;}
function endingView(){return `<section class="ending-view panel-enter"><div class="eyebrow"><span></span> ${state.miles>=300 && state.health>0 && state.sanity>0?'THE HORIZON FINALLY OPENS':'THE ROAD REMEMBERS YOU'}</div><h1 class="section-title">${esc(ending.title)}</h1><p class="rest-story">${esc(ending.text)}</p><div class="ending-stats"><div><strong>${state.rides}</strong><span>RIDES TAKEN</span></div><div><strong>${Math.round(state.miles)}</strong><span>MILES TRAVELED</span></div><div><strong>${state.inventory.length}</strong><span>STRANGE SOUVENIRS</span></div></div><button class="primary-button" data-action="restart">${svg('reset')} A different kind of night</button><button class="continue-button" data-action="journal">Read your travel journal ${svg('book')}</button></section>`;}
function moveCamera(yaw,pitch){look=stepLook(look,yaw,pitch);world.setLook(look.yaw,look.pitch);}
function resetCamera(){interactionNote=null;look={yaw:0,pitch:0};world.resetLook();}
function lookControls(){if(!['ride','roadside'].includes(mode))return '';return `<aside class="look-controls" aria-label="First-person camera controls"><div class="look-instructions">${svg('eye')}<span>FIRST-PERSON VIEW<small>${sceneFocus?'DRAG TO LOOK · EXPLORE GLOWING OBJECTS':'DRAG THE SCENE OR USE ARROW KEYS'}</small></span></div><div class="look-buttons">${['ride','roadside'].includes(mode)?`<button class="cabin-open" data-action="${mode==='roadside'?'exterior':'cabin'}" aria-label="${mode==='roadside'?'Inspect this car':'Inspect the cabin'}" title="${mode==='roadside'?'Inspect this car':'Inspect the cabin'} (I)">${svg('bag')}</button>`:''}${sceneFocus?`<button data-action="look-left" aria-label="Look left">←</button><button data-action="look-up" aria-label="Look up">↑</button><button data-action="look-down" aria-label="Look down">↓</button><button data-action="look-right" aria-label="Look right">→</button>`:''}<button data-action="reset-look" aria-label="Center camera" title="Center camera">${svg('reset')}</button><button class="look-toggle" data-action="look">${svg(sceneFocus?'book':'eye')}<span>${sceneFocus?(mode==='roadside'?'Back to the ride':'Return to story'):'Look around'}</span><kbd>L</kbd></button></div></aside>`;}
app.addEventListener('pointerdown',e=>{if(modal||!['ride','roadside'].includes(mode)||!e.target.closest('.main-stage')||e.target.closest('button,a,.ride-view,.offer-view,.title-view,.rest-view,.ending-view,.scene-label'))return;dragStart={id:e.pointerId,x:e.clientX,y:e.clientY,look:{...look}};app.classList.add('dragging-scene');app.setPointerCapture(e.pointerId);});
app.addEventListener('pointermove',e=>{if(!dragStart||e.pointerId!==dragStart.id)return;look=dragLook(dragStart.look,e.clientX-dragStart.x,e.clientY-dragStart.y,innerWidth,innerHeight);world.setLook(look.yaw,look.pitch);});
function endDrag(e){if(dragStart&&e.pointerId===dragStart.id){dragStart=null;app.classList.remove('dragging-scene');}}
app.addEventListener('pointerup',endDrag);app.addEventListener('pointercancel',endDrag);

function cabinLayer(){
  if(!['ride','roadside'].includes(mode))return '';
  const outside=mode==='roadside',e=outside?getOffer():active;
  const objects=outside?getExteriorObjects(e):getCabinObjects(e).filter(o=>!hasInspected(state,e,o.id));
  const actions=sceneActions().filter(a=>a.enabled);
  const controls=outside&&sceneFocus?`<aside class="scout-decisions"><span class="tiny-label">${esc(e.driver)}</span><div><button class="secondary-button" data-action="pass">Let it pass ${svg('arrow')}</button><button class="primary-button" data-action="ride">${svg('thumb')} Hop in</button></div></aside>`:'';
  return `<div id="cabin-hotspots" class="cabin-hotspots" aria-label="${outside?'Objects outside the waiting car':'Objects inside the 3D cabin'}" ${!sceneFocus||modal?'hidden':''}>${objects.map(o=>`<button hidden class="cabin-hotspot" data-action="inspect" data-object="${esc(o.id)}"><span>+</span>${esc(o.label)}</button>`).join('')}</div>${!outside?`<div id="story-hotspots" class="cabin-hotspots story-hotspots" aria-label="Actions in the 3D cabin" ${!sceneFocus||modal?'hidden':''}>${actions.map(a=>`<button hidden class="cabin-hotspot story-hotspot" data-action="scene-choice" data-scene-action="${esc(a.id)}"><span>↗</span>${esc(a.label)}</button>`).join('')}</div>`:''}${interactionNote?`<aside class="cabin-note ${interactionNote.exterior?'exterior-note':interactionNote.story?'action-note':''}" role="status"><span class="tiny-label">${interactionNote.exterior?'BEFORE YOU HOP IN':interactionNote.story?'YOU ACTED':'A DISCOVERY INSIDE THE CAR'}</span><button class="icon-button" data-action="close-note" aria-label="${interactionNote.story?'Dismiss action result':'Dismiss discovery'}">${svg('close')}</button><h2>${esc(interactionNote.object.title)}</h2><p>${esc(interactionNote.object.text)}</p>${interactionNote.changes.length?`<small>${esc(interactionNote.changes.join(' · '))}</small>`:''}<button class="continue-button" data-action="${interactionNote.story?'return-story':'close-note'}">${interactionNote.story?'Continue the story':'Keep looking'} ${svg('arrow')}</button></aside>`:''}${controls}`;
}
function exteriorContent(){
  if(mode!=='roadside')return '<h2>No car to inspect.</h2>';
  const e=getOffer();return `<span class="tiny-label">TRUST YOUR EYES BEFORE YOUR GUT</span><h2>Before you get in.</h2><p>Look at the driver, plate, and visible cargo. These are clues, not guarantees. In Look around mode you can click the glowing points on the 3D car.</p><div class="cabin-object-list">${getExteriorObjects(e).map(o=>`<button data-action="inspect" data-object="${esc(o.id)}">${svg(o.id==='window'?'eye':o.id==='plate'?'car':'bag')}<span><strong>${esc(o.label)}</strong><small>${hasScouted(state,e,o.id)?'READ AGAIN':'LOOK CLOSER'}</small></span>${svg('arrow')}</button>`).join('')}</div><p class="content-note">Looking costs no resources. Your observations remain in the travel journal even if you let the car pass.</p>`;
}

function cabinContent(){if(mode!=='ride')return '<h2>No cabin to inspect.</h2>';return `<span class="tiny-label">SMALL THINGS ON A STRANGE NIGHT</span><h2>Inside the car.</h2>${sceneActions().length?`<div class="scene-action-list"><span class="tiny-label">ACT ON THIS MOMENT</span>${sceneActions().map(a=>`<button class="story-choice" data-action="scene-choice" data-scene-action="${esc(a.id)}" ${a.enabled?'':'disabled'}><span>${svg('thumb')}</span><span><strong>${esc(a.label)}</strong><small>${esc(a.enabled?'Makes this story choice':a.reason)}</small></span>${svg('arrow')}</button>`).join('')}</div>`:''}<p>In Look around mode, turn toward glowing objects and click their labels. Look down to explore the dashboard. You can also inspect them here.</p><div class="cabin-object-list">${getCabinObjects(active).map(o=>{const used=hasInspected(state,active,o.id);return `<button data-action="inspect" data-object="${esc(o.id)}" ${used?'disabled':''}>${svg(o.kind==='radio'?'sound':o.kind==='map'?'book':o.kind==='glovebox'?'bag':'eye')}<span><strong>${esc(o.label)}</strong><small>${used?'ALREADY EXPLORED':'LOOK CLOSER'}</small></span>${svg('arrow')}</button>`}).join('')}</div><p class="content-note">Each object can be explored once per ride. Your discoveries save with the trip and may unlock new story choices.</p>`;}
function inspectObject(id){
  if(mode==='roadside'){inspectRoadside(id);return;}
  if(mode!=='ride')return;
  const result=inspectCabin(state,active,id);
  if(!result)return;
  closeModal();state=result.state;interactionNote=result;sceneFocus=true;
  sessionLog.push({encounter:active.id,title:active.title,driver:active.driver,choice:result.object.label,text:result.object.text,resolution:result.object.text,changes:result.changes.join(' · ')});
  updateWorld();world.react(result.object.reaction);audio.cue();save();render();
}
function inspectRoadside(id){
  if(mode!=='roadside')return;
  const e=getOffer(),result=inspectExterior(state,e,id),object=getExteriorObjects(e).find(o=>o.id===id);
  if(!object)return;
  closeModal();sceneFocus=true;
  if(result){state=result.state;sessionLog.push({encounter:e.id,title:e.title,driver:e.driver,choice:object.label,text:object.text,resolution:object.text,changes:'Roadside observation'});save();}
  interactionNote=result||{object,changes:[],exterior:true};
  updateWorld();render();
}

let hotspotFrame=0,lastProjection=0;
function projectCabinLabels(time){
  hotspotFrame=requestAnimationFrame(projectCabinLabels);
  if(document.hidden||time-lastProjection<80)return;
  lastProjection=time;
  const maxY=Math.min(innerHeight-8,$('.hud').getBoundingClientRect().top-3);
  const minY=$('.topbar').getBoundingClientRect().bottom+38;
  const layers=[['#cabin-hotspots','object',()=>world.getHotspots()],['#story-hotspots','sceneAction',()=>world.getStoryHotspots()]];
  for(const [selector,key,project] of layers){
    const layer=$(selector);if(!layer)continue;
    layer.hidden=!['ride','roadside'].includes(mode)||!sceneFocus||!!modal;
    if(layer.hidden)continue;
    const points=new Map(project().map(p=>[p.id,p]));
    let previous=null;
    for(const button of layer.querySelectorAll('button')){
      const p=points.get(button.dataset[key]),x=p?.x*innerWidth,y=p?.y*innerHeight;
      const visible=p?.visible&&x>20&&x<innerWidth-20&&y>minY&&y<maxY;
      button.hidden=!visible;
      if(visible){const half=button.offsetWidth/2+8;const left=Math.max(half,Math.min(innerWidth-half,x));let top=y;
        if(key==='sceneAction'&&previous&&Math.abs(left-previous.left)<(button.offsetWidth+previous.width)/2+8&&Math.abs(top-previous.top)<44)top=previous.top+46;
        button.style.left=left+'px';button.style.top=top+'px';previous={left,top,width:button.offsetWidth};}
    }
  }
}
hotspotFrame=requestAnimationFrame(projectCabinLabels);
if(import.meta.hot)import.meta.hot.dispose(()=>cancelAnimationFrame(hotspotFrame));

function render(){app.dataset.mode=mode;app.dataset.look=String(sceneFocus);app.innerHTML=`${header()}${route()}<div class="main-stage">${mode==='title'?titleView():mode==='roadside'?roadsideView():mode==='ride'?rideView():mode==='rest'?restView():endingView()}</div>${lookControls()}${cabinLayer()}${footer()}<div id="toast" role="status" aria-live="polite"></div><div id="modal-root"></div>`;if(modal)renderModal();else window.scrollTo({top:0,left:0,behavior:'instant'});}
function begin(continuing=false,firstOffer=null){
  resetCamera();sceneFocus=false;
  if(continuing&&saved){state={...structuredClone(INITIAL_STATE),...saved.state};offerIndex=saved.offerIndex||0;active=encounters.find(e=>e.id===saved.activeId)||getOffer();nodeId=saved.nodeId;declined=saved.declined||[];sessionLog=saved.sessionLog||[];selectedRoute=saved.selectedRoute&&saved.selectedRoute!=='unknown'?saved.selectedRoute:crypto.randomUUID();mode=saved.mode==='ride'&&active.nodes[nodeId]?'ride':saved.mode==='rest'?'rest':'roadside';ending=(mode!=='ride'||state.health<=0||state.sanity<=0)?effectiveEnding():null;if(ending)mode='ending';}
  else {state=structuredClone(INITIAL_STATE);offerIndex=Number.isInteger(firstOffer)&&firstOffer>=0&&firstOffer<encounters.length?firstOffer:chooseFirstOffer(atlas);declined=[];sessionLog=[];active=null;nodeId=null;mode='roadside';ending=null;selectedRoute=crypto.randomUUID();}
  if(preferences.sound)audio.toggle(true);
  updateWorld();save();render();
}
function ride(){resetCamera();sceneFocus=false;active=getOffer();nodeId=active.start||'intro';mode='ride';state.rides++;audio.cue();updateWorld();save();render();}
function pass(){resetCamera();const old=getOffer();declined.push(old.id);offerIndex=nextOffer();audio.cue();updateWorld();save();render();toast('Another pair of headlights will come.');}
function nextOffer(){return chooseNextOffer({encounters,state,activeId:active?.id,offerIndex,declined});}
function performSceneAction(id){
  if(mode!=='ride'||transitionLock)return;
  const index=sceneActionIndex(active,nodeId,state,id);if(index===null)return;
  if(modal)closeModal();choose(index,true);
}
function choose(index,fromScene=false){
  if(mode!=='ride'||transitionLock)return;
  const choice=active.nodes[nodeId]?.choices[index];
  const oldHealth=state.health;
  const result=resolveChoice({state,active,nodeId,sessionLog},index);
  if(!result)return;
  transitionLock=true;setTimeout(()=>{transitionLock=false;},180);
  interactionNote=null;
  ({state,mode,nodeId,sessionLog,ending}=result);
  if(fromScene&&mode==='ride'){sceneFocus=true;interactionNote={story:true,object:{title:choice.label,text:choice.outcome||choice.detail},changes:result.changes};}
  audio.cue(state.health<25||state.sanity<25?'danger':'choice');
  updateWorld();world.react(state.health<oldHealth?'damage':/flare|shoot|gun/i.test(choice.label)?'shot':active.scene==='cthulhu'?'eldritch':active.scene==='alien'?'alien':'reward');if(choice.sceneAction&&mode==='ride')world.performAction(choice.sceneAction.kind);save();render();
  if(result.changes.length)toast(result.changes.join('  ·  '));
}
function nextRide(){resetCamera();sceneFocus=false;offerIndex=nextOffer();mode='roadside';updateWorld();save();render();}
function toast(message){const t=$('#toast');if(!t)return;t.textContent=message;t.classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>t?.classList.remove('visible'),4500);}
function openModal(name){modalOrigin=document.activeElement;modal=name;renderModal();}
function renderModal(){document.body.style.overflow='hidden';const root=$('#modal-root');if(!root)return;const content=modal==='help'?helpContent():modal==='settings'?settingsContent():modal==='inventory'?inventoryContent():modal==='atlas'?atlasContent():modal==='cabin'?cabinContent():modal==='exterior'?exteriorContent():journalContent();root.innerHTML=`<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(modal)}"><button class="icon-button modal-close" data-action="close" aria-label="Close dialog">${svg('close')}</button>${content}</section></div>`;for(const child of app.children)if(child!==root)child.inert=true;root.querySelector('button')?.focus();}
function closeModal(){document.body.style.overflow='';modal=null;$('#modal-root').innerHTML='';for(const child of app.children)child.inert=false;if(modalOrigin?.isConnected)modalOrigin.focus();}
function helpContent(){return `<span class="tiny-label">THE UNWRITTEN RULES OF ROUTE 13</span><h2>Getting there is<br>the whole story.</h2><p>Your phone died 300 miles from Blackwater Coast. Get there before the night gets you.</p><ol class="help-steps"><li><strong>Read the driver.</strong><span>Inspect the driver, plate, and cargo before deciding. Press I for the observation list, or click glowing points on the 3D car. Let it pass or hop in; there is always another ride.</span></li><li><strong>Choose your way through.</strong><span>Each ride is a branching story. Choices change your body, nerve, cash, distance, and the driver’s trust. Helping a driver can open new options; betraying them can close those doors. Some decisions leave lasting consequences that other drivers recognize. The journal records what follows you. Choose Act in the scene to reach for story objects such as a flare or scanner. Their glowing action labels make the matching story choice. The same actions are in the I list and numbered choices. Look around and inspect glowing cabin objects, or press I for the object list. Discoveries unlock choices during this ride and later ones. Use food and first-aid supplies from your backpack to recover.</span></li><li><strong>Make it to the coast.</strong><span>Look around from the passenger seat with arrow keys, or drag the scene. Reach 300 miles with body and nerve above zero. Your night saves automatically. The road atlas remembers discoveries across trips.</span></li></ol><div class="key-help"><span><kbd>1</kbd>–<kbd>4</kbd> CHOOSE</span><span><kbd>J</kbd> JOURNAL</span><span><kbd>I</kbd> INSPECT</span><span><kbd>M</kbd> SOUND</span><span><kbd>←</kbd><kbd>→</kbd> LOOK</span><span><kbd>L</kbd> SCENE / STORY</span><span><kbd>ESC</kbd> CLOSE</span></div><p class="content-note">Surreal horror, cartoon peril, fictional crime, and non-explicit adult flirtation. No time limits. Take your time with every choice.</p>`;}
function settingsContent(){return `<span class="tiny-label">MAKE YOURSELF COMFORTABLE</span><h2>Night settings.</h2><div class="setting-row"><div><strong>Midnight radio</strong><p>Original ambient drone, road noise, and choice sounds.</p></div><button class="toggle ${preferences.sound?'on':''}" data-action="sound" role="switch" aria-checked="${preferences.sound}" aria-label="Ambient audio"><i></i></button></div><div class="setting-row"><div><strong>Scenery motion</strong><p>Moving road, camera drift, and atmospheric effects.</p></div><button class="toggle ${preferences.motion?'on':''}" data-action="motion" role="switch" aria-checked="${preferences.motion}" aria-label="Scenery motion"><i></i></button></div><div class="setting-row"><div><strong>Start a new night</strong><p>Replaces the current trip and its saved progress.</p></div><button class="secondary-button" data-action="confirm-restart">New trip</button></div><p class="content-note">Your progress is stored locally in this browser. Audio starts only after you turn it on. No account needed.</p>`;}
function inventoryContent(){return `<span class="tiny-label">EVERYTHING YOU CARRIED THIS FAR</span><h2>Your backpack.</h2>${state.inventory.length?`<div class="inventory-list">${state.inventory.map((item,i)=>{const supply=supplies[item];const usable=mode!=='ending'&&!!useSupply(state,item);return `<div class="inventory-item ${supply?'is-supply':''}"><span class="inventory-index">${String(i+1).padStart(2,'0')}</span>${svg('bag')}<strong>${esc(item)}</strong><small>${supply?esc(supply.description):'KEEP IT. YOU NEVER KNOW.'}</small>${supply?`<button class="supply-button" data-action="use-supply" data-item="${esc(item)}" ${usable?'':'disabled'}>${usable?'Use · '+esc(supplyBenefit(state,item)):mode==='ending'?'Trip ended':'Feeling fine'}</button>`:''}</div>`}).join('')}</div>`:`<div class="empty-state">${svg('bag')}<h3>Traveling light.</h3><p>Odd souvenirs find their way into your bag as you make choices. Some open doors. Some open portals.</p></div>`}<p class="content-note">Cash on hand: <strong>$${state.cash}</strong> · Supplies are consumed when used. Other items unlock matching story choices.</p>`;}
function atlasContent(){return `<span class="tiny-label">EVERY STRANGER LEAVES A TRACE</span><h2>The road atlas.</h2><p>The atlas tracks drivers you’ve traveled with. Choosing a driver below starts a new trip and replaces your current save. Roadside observations stay in the journal.</p><div class="atlas-stats"><div><strong>${atlas.discovered.length}<small> / ${encounters.length}</small></strong><span>DRIVERS MET</span></div><div><strong>${atlas.endings.length}</strong><span>ENDINGS FOUND</span></div><div><strong>${atlas.finishedRuns.length}</strong><span>NIGHTS FINISHED</span></div></div><div class="atlas-grid">${encounters.map((e,i)=>{const known=atlas.discovered.includes(e.id);return `<article class="atlas-card ${known?'discovered':'unseen'}">${known?`<div class="atlas-portrait"><img src="/assets/${esc(e.portrait)}.png" alt="${esc(e.driver)}" loading="lazy"/></div>`:`<div class="atlas-portrait unknown-face">${svg('signal')}<span>${String(i+1).padStart(2,'0')}</span></div>`}<div><span class="tiny-label">${known?esc(e.tag):'UNEXPLORED'}</span><h3>${known?esc(e.title):'A stranger in the dark'}</h3><p>${known?esc(e.driver):'Still waiting somewhere on Route 13.'}</p><small>${atlas.completed.includes(e.id)?'STORY COMPLETED':known?'YOU CROSSED PATHS':'FOLLOW THE HEADLIGHTS'}</small>${known?`<button class="revisit-driver" data-action="revisit" data-encounter="${esc(e.id)}">New trip with this driver ${svg('arrow')}</button>`:''}</div></article>`}).join('')}</div>${atlas.endings.length?`<div class="atlas-endings"><span class="tiny-label">ENDINGS YOU CARRIED HOME</span>${atlas.endings.map(e=>`<p>${svg('moon')}${esc(e)}</p>`).join('')}</div>`:''}<p class="content-note">The atlas stays with you across trips. Choose a discovered driver to begin a new trip with them; this replaces your current trip. Other new trips prefer an undiscovered driver.</p>`;}

function journalContent(){
  const consequences=activeConsequences(state);
  const seen=new Set(sessionLog.map(l=>l.encounter));
  const focused=mode==='roadside'?getOffer().id:active?.id;
  const entries=[...seen].reverse().map(id=>{
    const e=encounters.find(e=>e.id===id),logs=sessionLog.filter(l=>l.encounter===id);
    const entered=active?.id===id&&['ride','ending'].includes(mode);
    const status=state.completed.includes(id)?'RIDE COMPLETED':entered?(mode==='ending'?'TRIP ENDED':'IN PROGRESS'):'ROADSIDE NOTES';
    return `<details ${id===focused?'open':''}><summary><img src="/assets/${esc(e.portrait)}.png" alt=""/><span><strong>${esc(e.title)}</strong><small>${esc(e.driver)} · ${status}</small></span>${svg('arrow')}</summary><div class="journal-details">${logs.map(l=>`<p>${esc(l.choice)}${l.resolution?`<span class="journal-resolution">${esc(l.resolution)}</span>`:''}<small>${esc(l.changes||'A moment you will remember.')}</small></p>`).join('')}</div></details>`;
  }).join('');
  return `<span class="tiny-label">PROOF THAT ANY OF THIS HAPPENED</span><h2>The travel journal.</h2><div class="journal-summary"><span><strong>${state.completed.length}</strong> rides completed</span><span><strong>${Math.round(state.miles)}</strong> miles behind you</span><span><strong>${encounters.length}</strong> strange stories</span></div>${consequences.length?`<section class="trip-consequences" aria-label="Lasting consequences"><span class="tiny-label">WHAT FOLLOWS YOU</span>${consequences.map(c=>`<article><h3>${esc(c.label)}</h3><p>${esc(c.description)}</p></article>`).join('')}</section>`:''}${!sessionLog.length?'<div class="empty-state"><h3>A blank page. For now.</h3><p>The first ride is always the hardest to explain.</p></div>':`<div class="journal-entries">${entries}</div>`}<div class="undiscovered">${encounters.length-seen.size} ENCOUNTERS STILL UNRECORDED</div><button class="atlas-journal-button" data-action="atlas">${svg('book')} Open the road atlas ${svg('arrow')}</button>`;
}

app.addEventListener('click',async(event)=>{const choice=event.target.closest('[data-choice]');if(choice){choose(Number(choice.dataset.choice));return;}const button=event.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
  if(action==='revisit'){const index=encounters.findIndex(e=>e.id===button.dataset.encounter);if(index>=0&&atlas.discovered.includes(encounters[index].id)){closeModal();begin(false,index);}return;}
  if(action==='return-story'){interactionNote=null;sceneFocus=false;render();return;}
  if(action==='scene-choice'){performSceneAction(button.dataset.sceneAction);return;}
  if(action==='act-view'){interactionNote=null;sceneFocus=true;look={yaw:0,pitch:0};world.resetLook();render();return;}
  if(action==='scout-view'){sceneFocus=true;render();return;}
  if(action==='inspect'){inspectObject(button.dataset.object);return;}if(action==='close-note'){interactionNote=null;render();return;}
  if(action==='look'){sceneFocus=!sceneFocus;if(!sceneFocus&&interactionNote?.story)interactionNote=null;render();return;}if(action==='reset-look'){look={yaw:0,pitch:0};world.resetLook();toast('View centered.');return;}if(action.startsWith('look-')){const delta={'look-left':[-.22,0],'look-right':[.22,0],'look-up':[0,.22],'look-down':[0,-.22]}[action];if(delta)moveCamera(...delta);return;}
  if(action==='start'){begin();return;}if(action==='continue'){begin(true);return;}if(action==='ride'){ride();return;}if(action==='pass'){pass();return;}if(action==='next'){nextRide();return;}
  if(action==='sound'){preferences.sound=!preferences.sound;await audio.toggle(preferences.sound);save();render();return;}
  if(action==='motion'){preferences.motion=!preferences.motion;world.setMotion(preferences.motion);save();renderModal();return;}
  if(action==='use-supply'){if(mode==='ending')return;const next=useSupply(state,button.dataset.item);if(next){state=next;save();render();toast('Used '+button.dataset.item+'. Take care of yourself.');}return;}
  if(['help','journal','settings','inventory','atlas','cabin','exterior'].includes(action)){openModal(action);return;}
  if(action==='close'||(action==='backdrop'&&event.target===button)){closeModal();return;}
  if(action==='restart'){closeModal();begin();return;}
  if(action==='confirm-restart'){const area=button.closest('.setting-row');area.innerHTML='<div><strong>Leave this night behind?</strong><p>Your current trip will be replaced.</p></div><button class="primary-button" data-action="restart">Start over</button>';return;}
  if(action==='home'){event.preventDefault();openModal('help');}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();return;}if(e.key.toLowerCase()==='m'){app.querySelector('[data-action="sound"]').click();return;}if(e.key.toLowerCase()==='j'){modal?closeModal():openModal('journal');return;}
  if(modal){if(e.key==='Tab'){const focusables=[...$('#modal-root').querySelectorAll('button:not(:disabled), summary, [tabindex="0"]')].filter(el=>!el.hidden&&el.getClientRects().length>0);const first=focusables[0],last=focusables.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}return;}
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&['ride','roadside'].includes(mode)){e.preventDefault();const delta={ArrowLeft:[-.16,0],ArrowRight:[.16,0],ArrowUp:[0,.16],ArrowDown:[0,-.16]}[e.key];moveCamera(...delta);return;}
  if(e.key.toLowerCase()==='i'&&['ride','roadside'].includes(mode)){openModal(mode==='roadside'?'exterior':'cabin');return;}
  if(e.key.toLowerCase()==='l'&&['ride','roadside'].includes(mode)){sceneFocus=!sceneFocus;if(!sceneFocus&&interactionNote?.story)interactionNote=null;render();return;}
  if(mode==='roadside'&&['1','2'].includes(e.key)){e.preventDefault();if(e.key==='1')pass();else ride();return;}
  if(sceneFocus)return;
  if(['1','2','3','4'].includes(e.key)){if(mode==='ride')choose(Number(e.key)-1);}if(e.key==='Enter'&&document.activeElement===document.body){if(mode==='title')begin();else if(mode==='rest')nextRide();}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){save();audio.toggle(false);}else if(preferences.sound)audio.toggle(true);});
window.addEventListener('beforeunload',save);
updateWorld();render();
// Read-only diagnostics make content and browser QA inspectable without changing play.
window.__NO_SIGNAL__={get state(){return structuredClone(state)},get mode(){return mode},get encounter(){return active?.id},get node(){return nodeId},get totalEncounters(){return encounters.length}};
