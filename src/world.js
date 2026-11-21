import * as THREE from 'three';

// A small, self-contained night drive. All geometry is deliberately unlit or
// simply lit so the scene stays smooth on laptops and high-density displays.
export function createWorld(canvas, { onReady } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch (error) {
    return makeFallback(canvas, onReady);
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  window.__NO_SIGNAL_WORLD__ = { renderer: 'webgl', portrait: 'loading', scene: 'road', mode: 'roadside', vehicle: 'sedan', motion: true };
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#071923');
  scene.fog = new THREE.FogExp2('#0b2b34', .009);
  const camera = new THREE.PerspectiveCamera(43, 1, .1, 500);
  const clock = new THREE.Clock();
  const ambient = new THREE.HemisphereLight(0x6699ab, 0x29343a, 2.1); scene.add(ambient);
  const moonlight = new THREE.DirectionalLight(0x83c8db, 2.2); moonlight.position.set(-30, 55, 20); scene.add(moonlight);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x122029, roughness: 1 });
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x172c2c, roughness: 1 });
  const mountainMat = new THREE.MeshStandardMaterial({ color: 0x112930, roughness: 1, flatShading: true });
  const black = new THREE.MeshStandardMaterial({ color: 0x080f15, roughness: .75 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x25424a, metalness: .75, roughness: .4 });
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xb6a57c });
  const warm = new THREE.MeshBasicMaterial({ color: 0xffd397 });
  const red = new THREE.MeshBasicMaterial({ color: 0xe75b47 });
  const box = (w,h,d,mat,x=0,y=0,z=0,parent=scene) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); parent.add(m); return m; };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), groundMat); ground.rotation.x = -Math.PI/2; ground.position.y = -.12; scene.add(ground);
  const roadSurface=box(14,.05,500,roadMat,0,-.04,-170);
  const roadEdges=[box(.12,.03,500,lineMat,-6.65,.01,-170),box(.12,.03,500,lineMat,6.65,.01,-170)];
  const roadLines = new THREE.Group(); scene.add(roadLines);
  for(let z=20;z>-400;z-=13) box(.16,.04,6,lineMat,0,.025,z,roadLines);
  let seed=91823; const rand=()=>{ seed=(seed*1664525+1013904223)>>>0; return seed/4294967296; };
  // Angular mountain silhouettes make the horizon feel vast.
  const mountains=[];
  for(let side of [-1,1]) for(let i=0;i<24;i++) {
    const g=new THREE.ConeGeometry(14+rand()*18, 14+rand()*20, 5); const m=new THREE.Mesh(g,mountainMat);
    m.position.set(side*(45+rand()*45), 5, -i*18-45); m.rotation.y=rand()*3; scene.add(m); mountains.push(m);
  }
  const starsGeo=new THREE.BufferGeometry(), stars=[];
  for(let i=0;i<520;i++) { const a=rand()*Math.PI*2, r=130+rand()*100; stars.push(Math.cos(a)*r,30+rand()*110,Math.sin(a)*r-50); }
  starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));
  const starMat=new THREE.PointsMaterial({color:0xc3e9ee,size:.4,transparent:true,opacity:.7,sizeAttenuation:true}); scene.add(new THREE.Points(starsGeo,starMat));
  const moon = new THREE.Mesh(new THREE.SphereGeometry(7,24,16), new THREE.MeshBasicMaterial({color:0xb9e5df,fog:false})); moon.position.set(145,48,-180); scene.add(moon);
  const moonHalo=new THREE.Mesh(new THREE.SphereGeometry(10,24,16),new THREE.MeshBasicMaterial({color:0x85d6d0,transparent:true,opacity:.08,side:THREE.BackSide})); moon.add(moonHalo);
  const coast=new THREE.Group(); scene.add(coast);
  const ocean=new THREE.Mesh(new THREE.PlaneGeometry(700,350),new THREE.MeshBasicMaterial({color:0x668c91}));ocean.rotation.x=-Math.PI/2;ocean.position.set(0,.04,-225);coast.add(ocean);
  const island=new THREE.Mesh(new THREE.ConeGeometry(30,11,6),new THREE.MeshBasicMaterial({color:0x6a7075}));island.position.set(38,2,-128);island.scale.z=.35;coast.add(island);
  const sunrise=new THREE.Mesh(new THREE.CircleGeometry(9,32),new THREE.MeshBasicMaterial({color:0xffd6a2,fog:false}));sunrise.position.set(90,22,-150);sunrise.lookAt(-8,4,0);coast.add(sunrise);
  for(let i=0;i<12;i++){const glint=box(10+i*2,.03,.12,new THREE.MeshBasicMaterial({color:0xe6bca2,transparent:true,opacity:.45}),72-i*2,.07,-80-i*8,coast);}
  const scenery=new THREE.Group(); scene.add(scenery);
  const poleMat=new THREE.MeshStandardMaterial({color:0x182627,roughness:1});
  const poles=[];
  for(let i=0;i<27;i++) {
    const group=new THREE.Group(); group.position.set(i%2 ? -11:11,0,-i*16+18);
    box(.23,8,.23,poleMat,0,4,0,group); box(3,.15,.18,poleMat,0,7.4,0,group);
    for(let x of [-1,1]) box(.12,.25,.12,black,x,7.6,0,group);
    scenery.add(group); poles.push(group);
  }
  // Low scrub, rocks and little reflectors break up the roadside.
  const shrubs=[];
  for(let i=0;i<130;i++) { const x=(rand()>.5?1:-1)*(8+rand()*50), z=15-rand()*370;
    const shrub=new THREE.Mesh(new THREE.ConeGeometry(.3+rand()*.65,.4+rand()*1.2,5), new THREE.MeshStandardMaterial({color:rand()>.5?0x203b37:0x293c36,flatShading:true})); shrub.position.set(x,.3,z); scenery.add(shrub); shrubs.push(shrub);
  }
  for(let i=0;i<30;i++) { const m=box(.12,.6,.12,warm,i%2?7.5:-7.5,.3,-i*12); scenery.add(m); shrubs.push(m); }
  // Roadside motel sign is a real illuminated object in the landscape.
  const sign=new THREE.Group(); sign.position.set(13,0,-33); scenery.add(sign); shrubs.push(sign);
  box(.3,8,.3,poleMat,0,4,0,sign); box(6,3.3,.28,black,0,8,0,sign);
  const signCanvas=document.createElement('canvas'); signCanvas.width=512; signCanvas.height=256; const sx=signCanvas.getContext('2d');
  sx.fillStyle='#122b2d'; sx.fillRect(0,0,512,256); sx.strokeStyle='#e9aa72'; sx.lineWidth=6; sx.strokeRect(10,10,492,236); sx.fillStyle='#f4c395'; sx.textAlign='center'; sx.font='bold 83px Georgia'; sx.fillText('MOTEL',256,110); sx.font='26px sans-serif'; sx.letterSpacing='7px'; sx.fillText('VACANCY',256,170); sx.fillStyle='#e28260'; sx.font='20px sans-serif'; sx.fillText('LAST STOP  •  2 MILES',256,215);
  const st=new THREE.CanvasTexture(signCanvas); st.colorSpace=THREE.SRGBColorSpace;
  const signFace=new THREE.Mesh(new THREE.PlaneGeometry(5.7,3),new THREE.MeshBasicMaterial({map:st})); signFace.position.set(0,8,.16); sign.add(signFace); sign.rotation.y=-.2;
  // Scene landmarks share a few low-poly geometries and materials.
  const forest=new THREE.Group(), neonRoad=new THREE.Group(), strangeShore=new THREE.Group();
  scene.add(forest,neonRoad,strangeShore);
  const trunkGeometry=new THREE.CylinderGeometry(.22,.38,5,5), foliageGeometry=new THREE.ConeGeometry(2.5,7,5);
  const trunkMaterial=new THREE.MeshStandardMaterial({color:0x25352d,roughness:1});
  const foliageMaterial=new THREE.MeshStandardMaterial({color:0x173c32,roughness:1,flatShading:true});
  for(let i=0;i<32;i++){
    const tree=new THREE.Group(), side=i%2?-1:1;
    tree.position.set(side*(12+(i%3)*3),0,-12-Math.floor(i/2)*10);
    tree.scale.setScalar(.8+(i%4)*.14);
    const trunk=new THREE.Mesh(trunkGeometry,trunkMaterial);trunk.position.y=2.5;tree.add(trunk);
    const crown=new THREE.Mesh(foliageGeometry,foliageMaterial);crown.position.y=6.2;tree.add(crown);
    forest.add(tree);
  }
  const neonWall=new THREE.MeshStandardMaterial({color:0x241e36,roughness:.85});
  const neonPink=new THREE.MeshBasicMaterial({color:0xf276c4}), neonBlue=new THREE.MeshBasicMaterial({color:0x69d8dc});
  for(let i=0;i<6;i++){
    const side=i%2?-1:1, x=side*(13+i%3*2), z=-24-i*19;
    box(8,5,7,neonWall,x,2.5,z,neonRoad);
    box(7,.15,.12,i%2?neonPink:neonBlue,x,4.5,z+3.56,neonRoad);
    box(.15,2.5,.12,i%2?neonBlue:neonPink,x-side*3,3,z+3.56,neonRoad);
    box(3.4,1.2,.16,i%2?neonBlue:neonPink,x,6,z+3.5,neonRoad);
    box(3,.85,.04,neonWall,x,6,z+3.6,neonRoad);
  }
  const shoreWater=new THREE.Mesh(new THREE.PlaneGeometry(135,240),new THREE.MeshStandardMaterial({color:0x163d48,roughness:.38,metalness:.25}));
  shoreWater.rotation.x=-Math.PI/2;shoreWater.position.set(80,-.02,-115);strangeShore.add(shoreWater);
  const stoneGeometry=new THREE.ConeGeometry(3,13,5), stoneMaterial=new THREE.MeshStandardMaterial({color:0x263d45,roughness:1,flatShading:true});
  for(let i=0;i<9;i++){
    const stone=new THREE.Mesh(stoneGeometry,stoneMaterial);stone.position.set(18+(i%3)*10,3,-25-i*19);stone.rotation.z=(i%2?.13:-.1);stone.scale.setScalar(.65+(i%3)*.2);strangeShore.add(stone);
  }
  const shoreRing=new THREE.Mesh(new THREE.TorusGeometry(7,.24,6,32),new THREE.MeshBasicMaterial({color:0x87c5b5}));shoreRing.position.set(42,17,-110);shoreRing.rotation.z=.22;strangeShore.add(shoreRing);
  // Car points down the highway; all parts move together.
  const car=new THREE.Group(); car.position.set(4.6,0,-12); car.rotation.y=0; scene.add(car);
  const bodyMat=new THREE.MeshStandardMaterial({color:0x829ca1,metalness:.45,roughness:.45});
  // A low, long sedan with tapered shoulders and a pitched greenhouse.
  function shell(sections, material) {
    const v=[], indices=[];
    sections.forEach(([z,half,y0,y1])=>v.push(-half,y0,z, half,y0,z, half,y1,z, -half,y1,z));
    for(let i=0;i<sections.length-1;i++) for(let j=0;j<4;j++) {const a=i*4+j,b=i*4+(j+1)%4,c=(i+1)*4+(j+1)%4,d=(i+1)*4+j;indices.push(a,b,d,b,c,d);}
    indices.push(0,3,2,0,2,1);const n=(sections.length-1)*4;indices.push(n,n+1,n+2,n,n+2,n+3);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(indices);g.computeVertexNormals();const m=new THREE.Mesh(g,material);car.add(m);return m;
  }
  shell([[-3.05,1.48,.72,1.25],[-2.65,1.6,.68,1.43],[2.45,1.6,.68,1.43],[3.1,1.45,.72,1.23]],bodyMat);
  // A dark glazed canopy with a sloped front and back, and a floating painted roof.
  const glass=new THREE.MeshStandardMaterial({color:0x24434a,metalness:.35,roughness:.25,side:THREE.DoubleSide});
  const sedanCanopy=shell([[-1.95,1.4,1.4,1.48],[-1.35,1.25,1.4,2.22],[.35,1.25,1.4,2.22],[1.18,1.4,1.4,1.48]],glass);
  const sedanRoof=box(2.58,.12,1.8,bodyMat,0,2.25,-.5,car);
  for(const x of [-1.3,1.3]) {box(.1,.9,.1,metal,x,1.84,-.48,car); box(.08,.07,2.9,metal,x,1.5,-.38,car);}
  box(3.12,.12,.14,metal,0,.75,3.12,car); box(3.12,.12,.14,metal,0,.75,-3.12,car);
  box(1.15,.3,.05,black,0,1.03,3.13,car);
  for(let y of [.92,1.01,1.1,1.19]) box(1.1,.025,.04,metal,0,y,3.17,car);
  box(.32,.17,.04,warm,0,.78,3.21,car);
  for(let x of [-1.6,1.6]) {
    box(.05,.07,1.05,metal,x,1.24,-.35,car); box(.08,.08,.38,metal,x,1.34,-.8,car);
    for(let z of [-2,2]) { const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.59,.59,.32,20),black); wheel.rotation.z=Math.PI/2; wheel.position.set(x,.64,z); car.add(wheel); const hub=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.35,20),metal); hub.rotation.z=Math.PI/2; hub.position.copy(wheel.position); car.add(hub); const cap=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.37,16),warm);cap.rotation.z=Math.PI/2;cap.position.copy(wheel.position);car.add(cap); }
  }
  for(let x of [-1.12,1.12]) { const lamp=new THREE.Mesh(new THREE.CircleGeometry(.22,20),warm);lamp.position.set(x,1.11,3.13);car.add(lamp);box(.4,.2,.06,red,x,1.1,-3.13,car); }
  const headlight = new THREE.SpotLight(0xffd0a0,65,38,Math.PI/6,.8,1); headlight.position.set(0,1.3,3); headlight.target.position.set(0,0,24); car.add(headlight,headlight.target);
  const glowCanvas=document.createElement('canvas'); glowCanvas.width=128; glowCanvas.height=128;
  const gx=glowCanvas.getContext('2d'), gradient=gx.createRadialGradient(64,64,2,64,64,64);
  gradient.addColorStop(0,'rgba(255,244,209,.95)'); gradient.addColorStop(.12,'rgba(255,198,120,.55)'); gradient.addColorStop(1,'rgba(255,172,84,0)');
  gx.fillStyle=gradient; gx.fillRect(0,0,128,128); const glowTexture=new THREE.CanvasTexture(glowCanvas);
  for(let x of [-1.1,1.1]) { const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:0xffd5a2,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending})); glow.position.set(x,1.2,3.23); glow.scale.set(2.7,2.7,1); car.add(glow); }
  const lightPool=new THREE.Mesh(new THREE.PlaneGeometry(9,14),new THREE.MeshBasicMaterial({map:glowTexture,color:0xffc38b,transparent:true,opacity:.27,depthWrite:false})); lightPool.rotation.x=-Math.PI/2;lightPool.position.set(0,.035,8);car.add(lightPool);
  // Add-ons share the base chassis and materials; no vehicle assets or network calls.
  const vehicleDetails=new THREE.Group();car.add(vehicleDetails);
  const ivory=new THREE.MeshStandardMaterial({color:0xd8d5bd,roughness:.55});
  const stripe=new THREE.MeshBasicMaterial({color:0xb94743});
  const taxiYellow=new THREE.MeshBasicMaterial({color:0xe9b95d});
  let vehicle='sedan', vehicleBeacon;
  const vehicleKinds=new Set(['sedan','van','bus','truck','convertible','hearse','ambulance','caravan','foodtruck','taxi']);
  function setVehicle(kind='sedan', color) {
    vehicle=vehicleKinds.has(String(kind).toLowerCase())?String(kind).toLowerCase():'sedan';
    window.__NO_SIGNAL_WORLD__.vehicle=vehicle;
    while(vehicleDetails.children.length){const child=vehicleDetails.children[0];vehicleDetails.remove(child);child.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
    vehicleBeacon=null; sedanCanopy.visible=vehicle!=='convertible';sedanRoof.visible=vehicle!=='convertible';
    car.scale.set(1,1,['bus','hearse','caravan','foodtruck'].includes(vehicle)?1.25:1);
    try {bodyMat.color.set(color||({taxi:'#d7a640',ambulance:'#e1dfd1',bus:'#b68d51',hearse:'#34444c',foodtruck:'#d1c5a4',caravan:'#b6a58f',truck:'#586e70',van:'#789394',convertible:'#a15d55'}[vehicle]||'#829ca1'));} catch {bodyMat.color.set('#829ca1');}
    const add=(w,h,d,m,x,y,z)=>box(w,h,d,m,x,y,z,vehicleDetails);
    if(['van','bus','ambulance','caravan','foodtruck'].includes(vehicle)) {
      const tall=vehicle==='bus'?2.05:1.55, y=1.42+tall/2;
      add(3.05,tall,4.4,bodyMat,0,y,-.55);add(3.1,.12,4.5,ivory,0,1.42+tall,-.55);
      // Windows are shallow side panels so the selected driver stays visible in front.
      for(const x of [-1.54,1.54]) {
        const count=vehicle==='bus'?4:2;
        for(let i=0;i<count;i++) add(.035,.55,vehicle==='bus'?.72:1.05,glass,x,2.3,-2.1+i*(vehicle==='bus'?1:1.55));
      }
      if(vehicle==='ambulance'){for(const x of [-1.56,1.56]) {add(.04,.16,4.25,stripe,x,1.8,-.55);add(.05,.75,.18,stripe,x,2.28,-1.2);add(.05,.18,.75,stripe,x,2.28,-1.2);}vehicleBeacon=add(.65,.3,.5,red,0,3.22,-.15);}
      if(vehicle==='foodtruck'){add(.06,.95,1.75,black,-1.57,2.36,-1.15);add(.09,.1,1.9,ivory,-1.62,2.87,-1.15);add(.2,.07,1.9,metal,-1.65,1.9,-1.15);}
      if(vehicle==='caravan'){for(const x of [-1.57,1.57])add(.04,.15,4.1,ivory,x,1.75,-.5);}
    } else if(vehicle==='truck') {
      add(3.1,1.5,2.35,bodyMat,0,2.15,-.95);add(3.2,.14,2.45,ivory,0,2.95,-.95);
      for(const x of [-1.58,1.58]){add(.04,.65,1.25,glass,x,2.35,-.9);add(.1,.1,1.6,metal,x,1.58,-.9);}
      add(2.9,.65,2.1,black,0,1.55,-2.5);
    } else if(vehicle==='hearse') {
      add(3,1.0,2.95,bodyMat,0,1.93,-1.3);add(3.05,.12,3.05,metal,0,2.48,-1.3);
      for(const x of [-1.52,1.52])add(.04,.55,1.5,glass,x,2.03,-1.55);
    } else if(vehicle==='convertible') {
      add(2.5,.3,1.2,black,0,1.52,-.75);add(2.4,.55,.08,glass,0,1.75,1.05);
      for(const x of [-.75,.75])add(.65,.55,.55,black,x,1.7,-.65);
    } else if(vehicle==='taxi') {
      add(1,.36,.5,taxiYellow,0,2.5,-.4);add(.8,.08,.52,black,0,2.5,-.4);
      for(const x of [-1.62,1.62]) for(let i=0;i<7;i++) if(i%2===0)add(.04,.12,.28,black,x,1.28,-1.2+i*.3);
    }
    if(roadsideDriver) roadsideDriver.position.set(vehicle==='convertible'?-1.25:-1.65,vehicle==='convertible'?1.75:2.02,vehicle==='convertible'?-.4:.3);
  }
  // The cabin is fixed in world space, so turning the camera reveals parallax.
  const cabin=new THREE.Group(); cabin.position.set(0,2.5,5); scene.add(cabin);
  const dashMat=new THREE.MeshStandardMaterial({color:0x19292e,roughness:.83});
  const dashTrim=new THREE.MeshStandardMaterial({color:0x708689,metalness:.65,roughness:.35});
  const gaugeGlow=new THREE.MeshBasicMaterial({color:0xd6b37e});
  const gaugeDark=new THREE.MeshBasicMaterial({color:0x17272b});
  // Dashboard top and front sit in the lower quarter of the windshield.
  box(12,1.2,1.4,dashMat,0,-1.55,-3.9,cabin);
  box(12,.12,1.45,dashTrim,0,-.91,-3.9,cabin);
  box(12,.25,.5,black,0,1.82,-4,cabin);
  for(const side of [-1,1]) {const pillar=box(.3,4.7,.55,black,side*2.85,0,-4,cabin);pillar.rotation.z=side*.12;}
  box(.12,3.5,.35,dashTrim,-2.75,0,-4.05,cabin);box(.12,3.5,.35,dashTrim,2.75,0,-4.05,cabin);
  // Rear-view mirror, mounted from the windshield header.
  box(.1,.45,.12,black,0,1.55,-3.9,cabin);box(1.15,.35,.15,black,0,1.26,-3.9,cabin);box(.99,.24,.04,glass,0,1.26,-3.8,cabin);
  // Passenger glovebox, vents, radio and softly lit instruments.
  const gloveGroup=new THREE.Group();cabin.add(gloveGroup);
  box(1.45,.48,.04,dashTrim,-1.35,-1.33,-3.18,gloveGroup);box(1.3,.36,.05,dashMat,-1.35,-1.33,-3.14,gloveGroup);box(.35,.04,.04,metal,-1.35,-1.24,-3.1,gloveGroup);
  const paper=new THREE.MeshStandardMaterial({color:0xc9ba96,roughness:1});
  const foldedMap=box(.7,.035,.42,paper,-.72,-.85,-3.02,cabin);foldedMap.rotation.y=-.2;
  box(.015,.35,.015,metal,.36,1.12,-3.7,cabin);const charm=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),gaugeGlow);charm.position.set(.36,.94,-3.7);cabin.add(charm);
  box(.8,.34,.06,black,-.12,-1.18,-3.15,cabin);for(let i=0;i<4;i++)box(.65,.025,.04,dashTrim,-.12,-1.28+i*.07,-3.1,cabin);
  box(.75,.22,.05,black,.5,-1.34,-3.13,cabin);box(.5,.07,.05,gaugeGlow,.5,-1.31,-3.09,cabin);
  // The driver is on the right; the player sits in the left passenger seat.
  const controlsGroup=new THREE.Group(); cabin.add(controlsGroup);
  const wheel=new THREE.Mesh(new THREE.TorusGeometry(.53,.055,8,32),black);wheel.position.set(1.48,-.95,-3.15);controlsGroup.add(wheel);
  box(.08,.95,.08,black,1.48,-.95,-3.14,controlsGroup);box(.9,.08,.08,black,1.48,-.95,-3.14,controlsGroup);
  const wheelHub=new THREE.Mesh(new THREE.CircleGeometry(.16,20),dashTrim);wheelHub.position.set(1.48,-.95,-3.08);controlsGroup.add(wheelHub);
  for(let i=0;i<3;i++){const dial=new THREE.Mesh(new THREE.CircleGeometry(.18,20),gaugeGlow);dial.position.set(1.05+i*.37,-.87,-3.19);controlsGroup.add(dial);const face=new THREE.Mesh(new THREE.CircleGeometry(.14,20),gaugeDark);face.position.set(1.05+i*.37,-.87,-3.17);controlsGroup.add(face);}
  // Small rings sit on real cabin objects; the UI may project them for accessible labels.
  const hotspotLayer=new THREE.Group();cabin.add(hotspotLayer);
  const hotspotKinds=new Set(['radio','glovebox','charm','map']);
  const hotspotMaterial=new THREE.MeshBasicMaterial({color:0xf4d3a1,transparent:true,opacity:.85,depthWrite:false});
  const hotspotCenterMaterial=new THREE.MeshBasicMaterial({color:0xffe7bd,transparent:true,opacity:.9,depthWrite:false});
  let hotspots=[], exteriorHotspots=[];
  const exteriorLayer=new THREE.Group();car.add(exteriorLayer);
  const exteriorPositions={window:[-1.67,2.03,.3],plate:[0,1.03,3.23],cargo:[-1.68,1.48,-2.15]};
  function setExteriorInspectables(items=[]){
    for(const item of exteriorHotspots){exteriorLayer.remove(item.marker);item.marker.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
    exteriorHotspots=[];
    for(const entry of Array.isArray(items)?items:[]){
      if(!entry||!entry.id||!Object.hasOwn(exteriorPositions,entry.kind))continue;
      const marker=new THREE.Group();marker.position.set(...exteriorPositions[entry.kind]);
      if(entry.kind!=='plate')marker.rotation.y=-Math.PI/2;
      marker.add(new THREE.Mesh(new THREE.TorusGeometry(.19,.025,6,20),hotspotMaterial));
      marker.add(new THREE.Mesh(new THREE.CircleGeometry(.04,12),hotspotCenterMaterial));
      exteriorLayer.add(marker);exteriorHotspots.push({id:String(entry.id),marker});
    }
  }
  // Story actions are physical controls, separate from discovery markers.
  const storyLayer=new THREE.Group();cabin.add(storyLayer);
  const storyRed=new THREE.MeshStandardMaterial({color:0xb73e38,roughness:.55});
  const storyCyan=new THREE.MeshBasicMaterial({color:0x75e2d5});
  const storyPaper=new THREE.MeshStandardMaterial({color:0xe0cfaa,roughness:1});
  const storyDark=new THREE.MeshStandardMaterial({color:0x263d40,roughness:.75});
  const storyKinds=new Set(['flare','scanner','radio','papers']);
  let storyActions=[];
  function positionStoryActions(){
    const narrow=(canvas.clientWidth||window.innerWidth)<600, center=narrow?-.05:-.65, spacing=narrow?.32:.65;
    storyActions.forEach((item,index)=>{item.prop.position.x=center+(index-(storyActions.length-1)/2)*spacing;});
  }
  function setStoryActions(items=[]){
    for(const item of storyActions){storyLayer.remove(item.prop);item.prop.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
    storyActions=[];
    const valid=(Array.isArray(items)?items:[]).filter(entry=>entry&&entry.id&&storyKinds.has(entry.kind));
    valid.forEach((entry,index)=>{
      const prop=new THREE.Group();prop.position.set(-.65+(index-(valid.length-1)/2)*.65,-.88,-3.35);
      if(entry.kind==='flare'){
        const tube=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.62,10),storyRed);tube.position.y=.24;prop.add(tube);
        const cap=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.09,10),storyPaper);cap.position.y=.59;prop.add(cap);
      }else if(entry.kind==='scanner'){
        box(.18,.2,.15,storyDark,0,.1,0,prop);
        box(.55,.34,.18,storyDark,0,.34,0,prop);box(.42,.2,.025,storyCyan,0,.38,.11,prop);
        box(.08,.04,.03,storyPaper,.16,.2,.11,prop);
      }else if(entry.kind==='radio'){
        box(.18,.2,.15,storyDark,0,.1,0,prop);
        box(.55,.3,.18,storyDark,0,.34,0,prop);box(.32,.08,.03,storyCyan,-.05,.38,.11,prop);
        const knob=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.06,12),storyPaper);knob.rotation.x=Math.PI/2;knob.position.set(.18,.32,.13);prop.add(knob);
        box(.025,.3,.025,storyDark,-.2,.64,0,prop);
      }else{
        box(.38,.07,.2,storyDark,0,.035,0,prop);
        const envelope=box(.54,.4,.04,storyPaper,0,.25,0,prop);envelope.rotation.z=-.08;
        const ink=box(.35,.025,.02,storyDark,0,.27,.035,prop);ink.rotation.z=-.08;
      }
      const marker=new THREE.Group();marker.position.set(0,.78,.12);
      marker.add(new THREE.Mesh(new THREE.TorusGeometry(.11,.018,6,20),hotspotMaterial));
      marker.add(new THREE.Mesh(new THREE.CircleGeometry(.028,12),hotspotCenterMaterial));
      prop.add(marker);storyLayer.add(prop);storyActions.push({id:String(entry.id),prop,marker});
    });
    positionStoryActions();
  }
  function getStoryHotspots(){
    if(mode!=='driving'||!cabin.visible)return [];
    camera.updateMatrixWorld();cabin.updateWorldMatrix(true,true);
    return storyActions.map(item=>{const p=item.marker.getWorldPosition(new THREE.Vector3()).project(camera);const x=(p.x+1)/2,y=(1-p.y)/2;return{id:item.id,x,y,visible:p.z>=-1&&p.z<=1&&x>=0&&x<=1&&y>=0&&y<=1};}).filter(item=>item.visible);
  }
  const actionLayer=new THREE.Group();cabin.add(actionLayer);
  let actionEffect=null;
  canvas.dataset.action='none';canvas.dataset.lastAction='none';
  function clearAction(){
    while(actionLayer.children.length){const child=actionLayer.children[0];actionLayer.remove(child);child.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});}
    actionEffect=null;canvas.dataset.action='none';
  }
  function performAction(kind){
    clearAction();
    if(mode!=='driving'||!storyKinds.has(kind))return;
    const material=(color,opacity)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});
    const effect=new THREE.Group();effect.position.set((canvas.clientWidth||window.innerWidth)<600?-.05:-.65,-.25,-3.15);actionLayer.add(effect);
    if(kind==='flare'){
      const streak=new THREE.Mesh(new THREE.CylinderGeometry(.035,.07,.58,8),material(0xff5549,.85));streak.rotation.z=-.3;effect.add(streak);
      const glow=new THREE.Mesh(new THREE.CircleGeometry(.2,20),material(0xff8b6d,.4));glow.position.y=.28;effect.add(glow);
    }else if(kind==='scanner'){
      for(let i=0;i<3;i++)box(1.35,.035,.02,material(0x79f7e8,.6),0,i*.25,0,effect);
    }else if(kind==='radio'){
      for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.RingGeometry(.16+i*.13,.18+i*.13,32),material(0x9fe8dd,.5-i*.1));ring.position.z=i*.01;effect.add(ring);}
    }else{
      const sheet=new THREE.Mesh(new THREE.PlaneGeometry(.6,.46),material(0xffe7ad,.72));sheet.rotation.z=-.15;effect.add(sheet);
      box(.3,.025,.015,material(0xd78e5b,.65),0,0,.02,effect);
    }
    actionEffect={kind,start:null,effect};canvas.dataset.action=kind;canvas.dataset.lastAction=kind;
  }
  function updateAction(now){
    if(!actionEffect)return;
    if(actionEffect.start===null)actionEffect.start=now;
    const progress=(now-actionEffect.start)/2000;
    if(progress>=1){clearAction();return;}
    if(!moving)return;
    const {kind,effect}=actionEffect;
    if(kind==='flare')effect.position.y=-.25+progress*2.4;
    else if(kind==='scanner')effect.position.y=-.25+progress*.55;
    else if(kind==='radio')effect.scale.setScalar(1+progress*.8);
    else {effect.position.y=-.25+progress*.45;effect.rotation.z=progress*.15;}
    effect.traverse(o=>{if(o.material)o.material.opacity=(kind==='flare'?.75:.55)*(1-progress);});
  }
  function hotspotPosition(kind,narrow){
    const desktop={radio:[.5,-1.28,-3.04],glovebox:[-1.35,-1.24,-3.04],charm:[.36,1.0,-3.7],map:[-.72,-.89,-3.0]};
    const mobile={radio:[.36,-1.05,-2.95],glovebox:[-.56,-1.15,-3.04],charm:[.36,1.0,-3.7],map:[-.45,-.82,-2.95]};
    return (narrow?mobile:desktop)[kind];
  }
  function positionHotspots(){const narrow=(canvas.clientWidth||window.innerWidth)<600;for(const item of hotspots)item.marker.position.set(...hotspotPosition(item.kind,narrow));}
  function setInspectables(items=[]){
    for(const item of hotspots){hotspotLayer.remove(item.marker);item.marker.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
    hotspots=[];
    for(const entry of Array.isArray(items)?items:[]){
      if(!entry||!entry.id||!hotspotKinds.has(entry.kind))continue;
      const marker=new THREE.Group();
      marker.add(new THREE.Mesh(new THREE.TorusGeometry(.11,.018,6,20),hotspotMaterial));
      marker.add(new THREE.Mesh(new THREE.CircleGeometry(.028,12),hotspotCenterMaterial));
      hotspotLayer.add(marker);hotspots.push({id:String(entry.id),kind:entry.kind,marker});
    }
    positionHotspots();
  }
  function getHotspots(){
    const group=mode==='driving'?cabin:car, points=mode==='driving'?hotspots:exteriorHotspots;
    if(!group.visible)return [];
    camera.updateMatrixWorld();group.updateWorldMatrix(true,true);
    return points.map(item=>{const p=item.marker.getWorldPosition(new THREE.Vector3()).project(camera);const x=(p.x+1)/2,y=(1-p.y)/2;return{id:item.id,x,y,visible:p.z>=-1&&p.z<=1&&x>=0&&x<=1&&y>=0&&y<=1};}).filter(item=>item.visible);
  }
  let reaction=null;
  function react(kind){if(beat==='clear'&&['alien','shot','eldritch'].includes(kind))return;if(['damage','reward','alien','shot','eldritch'].includes(kind))reaction={kind,start:performance.now()};}
  // Character portrait planes sit on the passenger side of the cabin.
  const portraits={}; let driverPlane, roadsideDriver;
  function portraitTexture(name,color='#a2c8ba') {
    const c=document.createElement('canvas'); c.width=256;c.height=256;const q=c.getContext('2d'); q.fillStyle=color;q.beginPath();q.ellipse(128,125,75,90,0,0,Math.PI*2);q.fill(); q.fillStyle='#15252a';q.beginPath();q.ellipse(100,115,12,18,-.2,0,7);q.ellipse(156,115,12,18,.2,0,7);q.fill();q.strokeStyle='#15252a';q.lineWidth=5;q.beginPath();q.arc(128,145,24,.2,Math.PI-.2);q.stroke();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
    const img=new Image(); img.onload=()=>{q.clearRect(0,0,c.width,c.height);q.drawImage(img,0,0,c.width,c.height);t.needsUpdate=true; if(window.__NO_SIGNAL_WORLD__) window.__NO_SIGNAL_WORLD__.portrait=name}; img.onerror=()=>{if(window.__NO_SIGNAL_WORLD__) window.__NO_SIGNAL_WORLD__.portrait=name+' (fallback)'}; img.src='/assets/'+name+'.png'; return t;
  }
  function setDriver(name='driver',color='#a2c8ba') {
    const key=String(name||'driver').toLowerCase().replace(/[^a-z]/g,'')||'driver';
    if(!portraits[key]) portraits[key]=portraitTexture(key,color);
    if(driverPlane) { cabin.remove(driverPlane); driverPlane.geometry.dispose();driverPlane.material.dispose(); }
    driverPlane=new THREE.Mesh(new THREE.PlaneGeometry(1.8,2.1),new THREE.MeshBasicMaterial({map:portraits[key],transparent:true,depthWrite:false,opacity:.92})); driverPlane.position.set(1.75,-.45,-3.45); cabin.add(driverPlane); layoutCabin();
    if(roadsideDriver) {car.remove(roadsideDriver);roadsideDriver.geometry.dispose();roadsideDriver.material.dispose();}
    roadsideDriver=new THREE.Mesh(new THREE.PlaneGeometry(1.05,.83),new THREE.MeshBasicMaterial({map:portraits[key],transparent:true,depthWrite:false,side:THREE.DoubleSide})); roadsideDriver.position.set(vehicle==='convertible'?-1.25:-1.65,vehicle==='convertible'?1.75:2.02,vehicle==='convertible'?-.4:.3);roadsideDriver.rotation.y=-Math.PI/2;car.add(roadsideDriver);
  }
  setDriver(); setVehicle();
  // Special events are hidden until their chapter calls for them.
  const ufo=new THREE.Group(); ufo.position.set(0,35,-95); scene.add(ufo);
  const disk=new THREE.Mesh(new THREE.SphereGeometry(9,32,12),new THREE.MeshStandardMaterial({color:0x426f75,metalness:.8,roughness:.2,emissive:0x0d4143}));disk.scale.y=.22;ufo.add(disk);
  const dome=new THREE.Mesh(new THREE.SphereGeometry(3.4,24,12,0,Math.PI*2,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0xa2e9d8,transparent:true,opacity:.65}));ufo.add(dome);
  const beam=new THREE.Mesh(new THREE.ConeGeometry(14,35,32,1,true),new THREE.MeshBasicMaterial({color:0x9af9d6,transparent:true,opacity:.09,side:THREE.DoubleSide,depthWrite:false})); beam.position.y=-19; ufo.add(beam);
  const suspended=new THREE.Mesh(new THREE.IcosahedronGeometry(1.6,1),new THREE.MeshBasicMaterial({color:0xc8e9d1}));suspended.position.set(0,-26,0);ufo.add(suspended);
  const cosmic=new THREE.Group(); cosmic.position.set(0,0,-70); scene.add(cosmic);
  const leviathanMat=new THREE.MeshStandardMaterial({color:0x24434c,roughness:.8,emissive:0x081b21});
  const mass=new THREE.Mesh(new THREE.SphereGeometry(13,20,12),leviathanMat);mass.scale.set(1.25,1.3,.65);mass.position.set(0,18,-5);cosmic.add(mass);
  const eyeMat=new THREE.MeshBasicMaterial({color:0xdec38c});
  for(const x of [-5,5]) {const eye=new THREE.Mesh(new THREE.SphereGeometry(1.6,16,12),eyeMat);eye.position.set(x,21,4);cosmic.add(eye);const pupil=new THREE.Mesh(new THREE.SphereGeometry(.65,12,8),black);pupil.position.set(x,21,5.4);cosmic.add(pupil);}
  const tentacles=[];
  for(let i=0;i<8;i++) { const pts=[]; for(let j=0;j<9;j++) pts.push(new THREE.Vector3((i-3.5)*3+Math.sin(j*.7+i)*3, 10-j*2.6,Math.cos(j*.6+i)*3)); const tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),28,.85,6,false),leviathanMat);cosmic.add(tube);tentacles.push(tube); }
  const beacon=new THREE.PointLight(0xff3e52,0,55); beacon.position.set(7,4,-45); scene.add(beacon);
  const checkpoint=new THREE.Group(); checkpoint.position.set(0,0,-48); scene.add(checkpoint);
  box(17,.35,.4,metal,0,6,0,checkpoint); box(.3,6,.3,metal,-8,3,0,checkpoint);box(.3,6,.3,metal,8,3,0,checkpoint);
  box(4,1,.2,black,0,5,0,checkpoint);
  for(const x of [-4.5,4.5]) {box(5,.3,.3,ivory,x,1,1,checkpoint);for(let j=-2;j<=2;j++)box(.45,.34,.35,stripe,x+j,1,1,checkpoint);box(.15,1.8,.2,metal,x,1,1,checkpoint);}
  const cpLight=box(.6,.4,.3,red,6,6.3,0,checkpoint);
  // Story beats add spatial staging while the scene palette remains independent.
  const beatStages=new THREE.Group();scene.add(beatStages);
  const hangar=new THREE.Group(), tunnel=new THREE.Group(), chase=new THREE.Group(), storm=new THREE.Group();
  beatStages.add(hangar,tunnel,chase,storm);
  const structure=new THREE.MeshStandardMaterial({color:0x3d6161,metalness:.55,roughness:.55});
  const panelGlow=new THREE.MeshBasicMaterial({color:0x77d6c4});
  const hangarFloor=new THREE.Mesh(new THREE.PlaneGeometry(45,65),new THREE.MeshStandardMaterial({color:0x263d3d,metalness:.35,roughness:.7}));hangarFloor.rotation.x=-Math.PI/2;hangarFloor.position.set(0,.04,-35);hangar.add(hangarFloor);
  const bayWalls=new THREE.MeshStandardMaterial({color:0x1a3034,metalness:.3,roughness:.85,side:THREE.DoubleSide});
  for(const x of [-10.2,10.2])box(.35,14,57,bayWalls,x,7,-38.5,hangar);
  box(20.8,.35,57,bayWalls,0,14.1,-38.5,hangar);box(20.8,14,.35,bayWalls,0,7,-67,hangar);
  for(let z=-15;z>=-60;z-=9){box(.45,14,.45,structure,-10,7,z,hangar);box(.45,14,.45,structure,10,7,z,hangar);box(20,.45,.45,structure,0,14,z,hangar);for(const x of [-9.6,9.6])box(.15,4,.25,panelGlow,x,8,z+.3,hangar);}
  for(const x of [-6,6])box(.12,.04,58,panelGlow,x,.08,-35,hangar);
  const tunnelMat=new THREE.MeshStandardMaterial({color:0x46535a,roughness:.9});
  for(let z=-14;z>=-80;z-=8){const arch=new THREE.Mesh(new THREE.TorusGeometry(8,.22,6,28,Math.PI),tunnelMat);arch.position.set(0,0,z);tunnel.add(arch);for(const x of [-7.8,7.8]){box(.3,5,.3,tunnelMat,x,2.5,z,tunnel);box(.3,.3,.35,warm,x,4.6,z+.2,tunnel);}}
  for(const x of [-8,8])box(.25,5,75,tunnelMat,x,2.5,-48,tunnel);
  const chaseLights=[];
  for(const [x,z] of [[-5.2,-35],[5.4,-49]]) {const pursuer=new THREE.Group();pursuer.position.set(x,.1,z);chase.add(pursuer);box(2.6,.85,4.4,black,0,.85,0,pursuer);box(2.15,.65,1.9,glass,0,1.55,-.2,pursuer);for(const lx of [-.8,.8]){const lamp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color:0xffd5a2,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));lamp.position.set(lx,1.05,2.25);lamp.scale.set(2.3,2.3,1);pursuer.add(lamp);chaseLights.push(lamp);} }
  const rainPositions=[];
  for(let i=0;i<180;i++){const x=(rand()-.5)*36,y=rand()*19,z=-5-rand()*60;rainPositions.push(x,y,z,x-.16,y-.85,z+.08);}
  const rainGeometry=new THREE.BufferGeometry();rainGeometry.setAttribute('position',new THREE.Float32BufferAttribute(rainPositions,3));
  const rain=new THREE.LineSegments(rainGeometry,new THREE.LineBasicMaterial({color:0x9bc6ca,transparent:true,opacity:.3}));storm.add(rain);
  const beatNames=new Set(['road','abduction','hangar','checkpoint','chase','tunnel','monster','storm','clear']);
  let beat='road',beatStarted=0;
  function applyBeatVisibility(){
    hangar.visible=beat==='hangar';tunnel.visible=beat==='tunnel';chase.visible=beat==='chase';storm.visible=beat==='storm';
    const resolved=beat==='clear';
    forest.visible=chapter==='forest'&&beat!=='hangar';neonRoad.visible=chapter==='neon'&&beat!=='hangar';strangeShore.visible=chapter==='cthulhu'&&beat!=='hangar';coast.visible=chapter==='dawn'&&beat!=='hangar';
    scenery.visible=beat!=='hangar';roadSurface.visible=beat!=='hangar';roadLines.visible=beat!=='hangar';roadEdges.forEach(edge=>edge.visible=beat!=='hangar');mountains.forEach(m=>m.visible=beat!=='hangar'&&chapter!=='dawn');moon.visible=beat!=='hangar'&&chapter!=='dawn'&&!sceneMoonless;
    ufo.visible=!resolved&&(beat==='abduction'||(beat==='road'&&chapter==='alien'));
    cosmic.visible=!resolved&&(beat==='monster'||(beat==='road'&&chapter==='cthulhu'));
    checkpoint.visible=!resolved&&(beat==='checkpoint'||(beat==='road'&&(chapter==='checkpoint'||chapter==='shootout')));
    ufo.position.z=beat==='abduction'?-55:-95;
  }
  function setBeat(name='road'){
    const next=beatNames.has(name)?name:'road';if(next!==beat){beat=next;beatStarted=elapsed;}if(beat==='clear')reaction=null;canvas.dataset.beat=beat;window.__NO_SIGNAL_WORLD__.beat=beat;applyBeatVisibility();
  }
  let mode='roadside', chapter='road', sceneMoonless=false, speed=35, moving=true, elapsed=0, raf=0, lastFrame=0, disposed=false;
  let arrivalKey=null, arrivalStarted=0;
  canvas.dataset.arrival='stopped';
  function stopArrival(){car.position.z=-12;canvas.dataset.arrival='stopped';}
  function arrive(offerId){
    if(mode!=='roadside'||offerId==null||offerId===arrivalKey)return;
    arrivalKey=offerId;
    if(!moving){stopArrival();return;}
    arrivalStarted=elapsed;car.position.z=-70;canvas.dataset.arrival='approaching';
  }
  let lookYaw=0, lookPitch=0, targetYaw=0, targetPitch=0;
  window.__NO_SIGNAL_WORLD__.look={yaw:0,pitch:0};
  const clampLook=value=>Math.max(-1,Math.min(1,Number(value)||0));
  function setLook(yaw=0,pitch=0){targetYaw=clampLook(yaw);targetPitch=clampLook(pitch);}
  function resetLook(){setLook(0,0);}
  const palettes={ road:['#071923','#0b2b34','#172c2c'], alien:['#092126','#0d3d39','#193c35'], checkpoint:['#111b28','#18303b','#263333'], shootout:['#1b1922','#3a2b32','#332b2b'], cthulhu:['#101629','#172c3b','#1c3035'], forest:['#081d1b','#12342c','#1a3029'], neon:['#21132b','#3a203f','#2b2836'], dawn:['#c07463','#bd8b79','#66564c'] };
  function setScene(name='road', {moonless=false}={}) { sceneMoonless=!!moonless;chapter=palettes[name]?name:'road'; window.__NO_SIGNAL_WORLD__.scene=chapter;canvas.dataset.scene=chapter; const p=palettes[chapter]; scene.background.set(p[0]);scene.fog.color.set(p[1]);groundMat.color.set(p[2]);coast.visible=chapter==='dawn';starMat.opacity=chapter==='dawn'?.05:.7;ambient.color.set(chapter==='dawn'?0xffc599:0x6699ab);applyBeatVisibility(); }
  function setMode(value) { const next=value==='driving'?'driving':'roadside';if(mode==='roadside'&&next==='driving')stopArrival();if(mode==='driving'&&next!=='driving')clearAction();mode=next; window.__NO_SIGNAL_WORLD__.mode=mode; cabin.visible=mode==='driving'; car.visible=mode!=='driving'; }
  function layoutCabin(){const narrow=(canvas.clientWidth||window.innerWidth)<600;controlsGroup.position.x=narrow?-.8:0;gloveGroup.position.x=narrow?.8:0;foldedMap.position.x=narrow?-.45:-.72;positionHotspots();positionStoryActions();if(driverPlane){driverPlane.position.x=narrow?.65:1.75;driverPlane.scale.setScalar(narrow?.8:1);}}
  function resize() { const w=canvas.clientWidth||window.innerWidth, h=canvas.clientHeight||window.innerHeight; renderer.setSize(w,h,false); camera.aspect=w/h;camera.fov=w<600?55:43;camera.updateProjectionMatrix();layoutCabin(); }
  function animate(now) {
    if(disposed || document.hidden) return;
    raf=requestAnimationFrame(animate);
    if(now-lastFrame<1000/30) return;
    lastFrame=now; const dt=Math.min(clock.getDelta(),.05);if(moving) elapsed+=dt;
    updateAction(now);
    if(canvas.dataset.arrival==='approaching'){
      const t=Math.min(1,Math.max(0,(elapsed-arrivalStarted)/2));
      car.position.z=-70+58*(1-(1-t)**3);
      if(t>=1)stopArrival();
    }
    if(mode==='driving'&&moving) { const step=dt*Math.max(4,speed*.45); roadLines.position.z=(roadLines.position.z+step)%13; for(const p of poles) {p.position.z+=step;if(p.position.z>25)p.position.z-=432;} for(const s of shrubs) {s.position.z+=step;if(s.position.z>30)s.position.z-=370;} for(const tree of forest.children){tree.position.z+=step;if(tree.position.z>18)tree.position.z-=160;} }
    const sway=Math.sin(elapsed*.35)*.08;
    const lift=beat==='abduction'&&mode==='driving'?(moving?Math.min(1,Math.max(0,(elapsed-beatStarted)/4)):1)*2.3:0;
    cabin.position.y=2.5+lift;
    if(mode==='driving') { camera.position.set(sway,2.5+lift+Math.sin(elapsed*1.3)*.025,5); camera.lookAt(sway*.5,2+lift,-80); }
    else { camera.position.set(-8+Math.sin(elapsed*.12)*.15,1.9,-.5); camera.lookAt(3.6,1.45,-15); }
    const lookBlend=moving?1-Math.exp(-dt*10):1;lookYaw+=(targetYaw-lookYaw)*lookBlend;lookPitch+=(targetPitch-lookPitch)*lookBlend;
    camera.rotateY(-lookYaw*Math.PI/15);camera.rotateX(lookPitch*Math.PI/30);
    let reactionStrength=0;if(reaction){const progress=(performance.now()-reaction.start)/1700;if(progress>=1)reaction=null;else reactionStrength=Math.sin(Math.PI*Math.max(0,progress));}
    if(reaction?.kind==='damage'&&moving)camera.rotateZ(Math.sin((performance.now()-reaction.start)/500)*reactionStrength*.008);
    dashMat.emissive.set(reaction?.kind==='reward'?0x805022:0x000000);dashMat.emissiveIntensity=reaction?.kind==='reward'?reactionStrength*.8:0;
    eyeMat.color.set(reaction?.kind==='eldritch'?0xffe0a1:0xdec38c);eyeMat.color.multiplyScalar(1+(reaction?.kind==='eldritch'?reactionStrength*.8:0));
    window.__NO_SIGNAL_WORLD__.look={yaw:lookYaw,pitch:lookPitch};
    if(driverPlane) { driverPlane.position.y=-.45+Math.sin(elapsed*.8)*.025; driverPlane.rotation.z=Math.sin(elapsed*.55)*.012; }
    rain.position.y=-(elapsed*5%5);chaseLights.forEach((light,i)=>{light.material.opacity=.58+.2*Math.sin(elapsed*.8+i);});
    ufo.position.y=(beat==='abduction'?26:35)+Math.sin(elapsed*.8)*1.2; beam.material.opacity=Math.min(.3,.11+Math.sin(elapsed*2)*.035+(reaction?.kind==='alien'?reactionStrength*.15:0));suspended.position.y=-23+Math.sin(elapsed*.7)*5;suspended.rotation.y=elapsed*.3;
    tentacles.forEach((t,i)=>{t.rotation.z=Math.sin(elapsed*.55+i*.8)*.07;t.rotation.x=Math.sin(elapsed*.45+i)*.06;});
    const beaconActive=beat==='checkpoint'||beat==='chase'||(beat==='road'&&(chapter==='checkpoint'||chapter==='shootout'));
    beacon.intensity=beaconActive?(Math.sin(elapsed*2)>0?20:4):0;if(beaconActive&&reaction?.kind==='shot')beacon.intensity+=reactionStrength*45; cpLight.material.color.set(chapter==='shootout'&&Math.sin(elapsed*12)>0?0xffdf9d:0xe75b47);
    renderer.render(scene,camera);
  }
  function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0;clearAction();} else if(!disposed&&!raf){clock.getDelta();lastFrame=0;raf=requestAnimationFrame(animate);}}
  function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);clearAction();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}});[storyRed,storyCyan,storyPaper,storyDark].forEach(m=>m.dispose());Object.values(portraits).forEach(t=>t.dispose());st.dispose();glowTexture.dispose();renderer.dispose();}
  setScene('road');setBeat('road');setMode('roadside');resize();window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);if(!document.hidden)raf=requestAnimationFrame(animate); if(import.meta.hot)import.meta.hot.dispose(dispose);if(onReady) onReady();
  return {setScene,setBeat,setMode,setDriver,setVehicle,setLook,resetLook,setInspectables,setExteriorInspectables,getHotspots,setStoryActions,getStoryHotspots,performAction,arrive,react,setSpeed(n){speed=Number(n)||0},setMotion(v){moving=!!v;if(!moving)stopArrival();window.__NO_SIGNAL_WORLD__.motion=moving},resize,dispose};
}

function makeFallback(canvas,onReady) {
  window.__NO_SIGNAL_WORLD__ = { renderer: '2d', portrait: 'fallback', scene: 'road', mode: 'roadside', vehicle: 'sedan', motion: true };
  canvas.dataset.beat='road';canvas.dataset.scene='road';canvas.dataset.arrival='stopped';canvas.dataset.action='none';canvas.dataset.lastAction='none';window.__NO_SIGNAL_WORLD__.beat='road';
  const ctx=canvas.getContext('2d'); let scene='road', mode='roadside', vehicle='sedan', moonless=false, raf=0, time=0, moving=true, lastFrame=0, disposed=false;
  function resize(){canvas.width=(canvas.clientWidth||innerWidth)*Math.min(devicePixelRatio||1,1.8);canvas.height=(canvas.clientHeight||innerHeight)*Math.min(devicePixelRatio||1,1.8)}
  function draw(now){if(disposed||document.hidden)return;raf=requestAnimationFrame(draw);if(now-lastFrame<1000/30)return;lastFrame=now;if(!ctx)return;if(moving)time+=.01;const w=canvas.width,h=canvas.height;const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,scene==='dawn'?'#c97869':scene==='neon'?'#27152e':'#061923');g.addColorStop(.65,scene==='dawn'?'#e8b394':'#214047');g.addColorStop(1,scene==='dawn'?'#65868a':'#0d171c');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);if(!moonless||scene==='dawn'){ctx.fillStyle=scene==='dawn'?'#ffe1b4':'#a8d9d2';ctx.beginPath();ctx.arc(w*.78,h*.19,h*.035,0,7);ctx.fill();}ctx.fillStyle=scene==='dawn'?'#748c8b':'#122b30';ctx.beginPath();ctx.moveTo(0,h*.65);for(let i=0;i<=12;i++)ctx.lineTo(i*w/12,h*(.5+Math.sin(i*5)*.07));ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();ctx.fillStyle='#101b22';ctx.beginPath();ctx.moveTo(w*.42,h*.55);ctx.lineTo(w*.58,h*.55);ctx.lineTo(w*.95,h);ctx.lineTo(w*.1,h);ctx.fill();ctx.strokeStyle='#c4af80';ctx.lineWidth=3;ctx.setLineDash([20,25]);ctx.beginPath();ctx.moveTo(w*.5,h*.57);ctx.lineTo(w*.52,h);ctx.stroke();ctx.setLineDash([]);if(mode==='roadside'){ctx.fillStyle='#344b51';ctx.fillRect(w*.56,h*.65,w*.24,h*.12);ctx.fillStyle='#172a30';ctx.fillRect(w*.6,h*(vehicle==='convertible'?.63:['bus','van','truck','ambulance','foodtruck','caravan'].includes(vehicle)?.52:.59),w*.15,h*(vehicle==='convertible'?.04:['bus','van','truck','ambulance','foodtruck','caravan'].includes(vehicle)?.15:.08));ctx.fillStyle='#ffcf8d';ctx.fillRect(w*.57,h*.69,w*.035,h*.025);ctx.fillRect(w*.75,h*.69,w*.035,h*.025)}else{ctx.fillStyle='#070e13';ctx.fillRect(0,h*.9,w,h*.1);}}
  function visibility(){if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(!disposed&&!raf){lastFrame=0;raf=requestAnimationFrame(draw);}}
  function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',visibility);}
  resize();window.addEventListener('resize',resize);document.addEventListener('visibilitychange',visibility);if(!document.hidden)raf=requestAnimationFrame(draw);if(import.meta.hot)import.meta.hot.dispose(dispose);if(onReady)onReady();return{setBeat(name='road'){canvas.dataset.beat=name;window.__NO_SIGNAL_WORLD__.beat=name},setInspectables(){},setExteriorInspectables(){},getHotspots(){return []},setStoryActions(){},getStoryHotspots(){return []},performAction(){},arrive(){canvas.dataset.arrival='stopped'},react(){},setLook(yaw=0,pitch=0){window.__NO_SIGNAL_WORLD__.look={yaw:Math.max(-1,Math.min(1,Number(yaw)||0)),pitch:Math.max(-1,Math.min(1,Number(pitch)||0))}},resetLook(){window.__NO_SIGNAL_WORLD__.look={yaw:0,pitch:0}},setVehicle(v){vehicle=v||'sedan';window.__NO_SIGNAL_WORLD__.vehicle=vehicle},setScene(v,options={}){scene=v;canvas.dataset.scene=v;moonless=!!options.moonless;window.__NO_SIGNAL_WORLD__.scene=v;window.__NO_SIGNAL_WORLD__.moonless=moonless},setMode(v){mode=v;window.__NO_SIGNAL_WORLD__.mode=v},setDriver(){},setSpeed(){},setMotion(v){moving=!!v;window.__NO_SIGNAL_WORLD__.motion=moving},resize,dispose};
}
