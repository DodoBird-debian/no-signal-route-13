export function createAudio() {
  let ctx, master, hum, enabled = false;
  function init() {
    if (ctx) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    ctx = new Audio(); master = ctx.createGain(); master.gain.value = 0;
    master.connect(ctx.destination);
    for (const [frequency, volume, wave] of [[55,.045,'sine'],[82.41,.018,'sine'],[110.1,.012,'triangle']]) {
      const osc=ctx.createOscillator(), gain=ctx.createGain(); osc.type=wave; osc.frequency.value=frequency;
      gain.gain.value=volume; osc.connect(gain).connect(master); osc.start();
      if (!hum) hum=osc;
    }
    const size=ctx.sampleRate*3, buffer=ctx.createBuffer(1,size,ctx.sampleRate);
    const d=buffer.getChannelData(0); let previous=0;
    for(let i=0;i<size;i++) { previous=(previous+Math.random()*.04-.02)/1.02; d[i]=previous; }
    const noise=ctx.createBufferSource(), filter=ctx.createBiquadFilter(), gain=ctx.createGain();
    noise.buffer=buffer; noise.loop=true; filter.type='lowpass';filter.frequency.value=450;gain.gain.value=.22;
    noise.connect(filter).connect(gain).connect(master);noise.start();
  }
  return {
    async toggle(value) { enabled=value; if(value) { init(); if(ctx?.state==='suspended') await ctx.resume(); } if(master) master.gain.setTargetAtTime(value?.7:0,ctx.currentTime,.3);return enabled; },
    drive(driving) { if(hum) hum.frequency.setTargetAtTime(driving?68:55,ctx.currentTime,1); },
    cue(type='choice') { if(!enabled || !ctx)return; const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime;o.type='sine';o.frequency.setValueAtTime(type==='danger'?130:440,t);o.frequency.exponentialRampToValueAtTime(type==='danger'?55:660,t+.16);g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g).connect(master);o.start();o.stop(t+.32); },
    get enabled(){return enabled;}
  };
}
