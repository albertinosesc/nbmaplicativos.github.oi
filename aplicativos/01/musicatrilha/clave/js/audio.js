// ===== Web Audio, playback, metrônomo =====
// Depende de: state.js (S)
import { I } from './icons.js';
import { S } from './state.js';

export let AC = null;
export let master = null;

export function ensureAudio(){
  if(!AC){
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return null;
    AC = new Ctx();
    master = AC.createGain();
    master.gain.value = S.settings.sound ? 0.9 : 0;
    try{ const comp = AC.createDynamicsCompressor(); master.connect(comp); comp.connect(AC.destination); }
    catch(e){ master.connect(AC.destination); }
  }
  if(AC.state === 'suspended') AC.resume().catch(() => {});
  return AC;
}

export function unlockAudio(){
  const ctx = ensureAudio(); if(!ctx || !master) return;
  try{
    const o = ctx.createOscillator(), g = ctx.createGain();
    g.gain.value = 0.0001; o.connect(g); g.connect(master);
    o.start(); o.stop(ctx.currentTime + 0.02);
  }catch(e){}
}

export function tone(o){
  const ctx = ensureAudio(); if(!ctx) return;
  const when = o.when || ctx.currentTime;
  const f = o.freq != null ? o.freq : 440 * Math.pow(2, (o.midi - 69) / 12);
  const dur = Math.max(o.dur || 0.4, 0.1);
  const vel = o.vel || 0.6;
  const dest = o.dest || master;
  const g = ctx.createGain();
  const flt = ctx.createBiquadFilter();
  flt.type = 'lowpass'; flt.frequency.value = Math.min(7000, f * 7); flt.Q.value = 0.4;
  g.connect(flt); flt.connect(dest);
  const o1 = ctx.createOscillator(); o1.type = o.type || 'triangle'; o1.frequency.value = f; o1.connect(g);
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2;
  const g2 = ctx.createGain(); g2.gain.value = 0.3; o2.connect(g2); g2.connect(g);
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(Math.max(vel * 0.5, 0.001), when + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  o1.start(when); o2.start(when);
  o1.stop(when + dur + 0.06); o2.stop(when + dur + 0.06);
}

export const instNote = (midi, dur, when, vel, dest) => tone({ midi, dur, when, vel, type: 'triangle', dest });
export const sfxClick   = () => tone({ freq: 950, dur: 0.05, vel: 0.12, type: 'sine' });
export const sfxWrong   = () => { tone({ freq: 130, dur: 0.22, vel: 0.28, type: 'square' }); tone({ freq: 139, dur: 0.22, vel: 0.2, type: 'square' }); };
export const sfxFanfare = () => {
  const c = ensureAudio(); if(!c) return;
  [72,76,79,84].forEach((m,i) => instNote(m, 0.5, c.currentTime + 0.12 * i, 0.7));
  [72,76,79,84].forEach(m => instNote(m, 1.1, c.currentTime + 0.55, 0.45));
  tone({ freq: 2637, dur: 0.6, vel: 0.12, type: 'sine', when: c.currentTime + 0.55 });
};
export const sfxFail = () => {
  const c = ensureAudio(); if(!c) return;
  tone({ midi: 64, dur: 0.3, vel: 0.4 });
  tone({ midi: 58, dur: 0.5, vel: 0.4, when: c.currentTime + 0.25 });
};

export function setSound(on){
  S.settings.sound = on; save();
  ensureAudio();
  if(master && AC) master.gain.setTargetAtTime(on ? 0.9 : 0, AC.currentTime, 0.02);
  updateSoundBtn();
}

export function updateSoundBtn(){
  const b = document.getElementById('soundBtn'); if(!b) return;
  b.innerHTML = S.settings.sound
    ? '<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" stroke="none"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>'
    : '<svg class="ic" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4z" fill="currentColor" stroke="none"/><path d="M23 9l-6 6M17 9l6 6"/></svg>';
  b.setAttribute('aria-pressed', String(S.settings.sound));
}

// Playback
export const PB = { token: 0, raf: 0, gain: null, session: null, playing: false, lastEv: null };

export function setPlayCursor(sess, ev, on){
  if(!ev) return;
  ev.elems.forEach(e => e.classList.toggle('hl-play', on));
  if(sess.keys && ev.midi != null){ const k = sess.keys.get(ev.midi); if(k) k.classList.toggle('playing', on); }
}

export function startPlayback(sess){
  stopPlayback();
  const ctx = ensureAudio();
  if(!ctx){ if(window.toast) toast('Áudio indisponível.', { type: 'warn' }); return; }
  const t0 = ctx.currentTime + 0.15;
  const g = ctx.createGain(); g.gain.value = 1; g.connect(master);
  PB.gain = g; PB.session = sess; PB.playing = true;
  const token = ++PB.token;
  sess.events.forEach(ev => {
    if(ev.midi != null) instNote(ev.midi, Math.max(0.18, ev.dur * sess.spw * 0.92), t0 + ev.start * sess.spw, 0.75, g);
  });
  const end = t0 + sess.total * sess.spw + 0.25;
  const step = () => {
    if(token !== PB.token) return;
    const now = ctx.currentTime;
    if(now >= end){ const cb = sess.onEnd; stopPlayback(); if(cb) cb(); return; }
    const b = (now - t0) / sess.spw;
    let cur = null;
    for(const ev of sess.events){ if(ev.midi != null && b >= ev.start && b < ev.start + ev.dur){ cur = ev; break; } }
    if(cur !== PB.lastEv){
      setPlayCursor(sess, PB.lastEv, false);
      setPlayCursor(sess, cur, true);
      PB.lastEv = cur;
      if(cur) ensureVisible(sess.paper, cur);
    }
    PB.raf = requestAnimationFrame(step);
  };
  PB.raf = requestAnimationFrame(step);
  updatePlayUI();
}

export function stopPlayback(){
  PB.token++;
  cancelAnimationFrame(PB.raf);
  if(PB.session) setPlayCursor(PB.session, PB.lastEv, false);
  PB.lastEv = null;
  if(PB.gain && AC){
    const g = PB.gain;
    try{ g.gain.setTargetAtTime(0.0001, AC.currentTime, 0.02); setTimeout(() => { try{ g.disconnect(); }catch(e){} }, 300); }catch(e){}
  }
  PB.gain = null;
  PB.playing = false;
  PB.session = null;
  updatePlayUI();
}

export function updatePlayUI(){
  const b = document.getElementById('listenBtn');
  if(b){
    const on = PB.playing && PB.session && PB.session.owner === 'lesson';
    b.innerHTML = on ? '⏹ <span>Parar</span>' : '▶ <span>Ouvir</span>';
    b.classList.toggle('blue', !on);
    b.classList.toggle('red', on);
  }
}

export function ensureVisible(paper, ev){
  const e = ev.elems && ev.elems[0];
  if(!e || !paper) return;
  const r = e.getBoundingClientRect();
  const p = paper.getBoundingClientRect();
  if(r.bottom > p.bottom - 16) paper.scrollTop += (r.bottom - p.bottom) + 60;
  else if(r.top < p.top + 8) paper.scrollTop -= (p.top - r.top) + 60;
}

// Metrônomo
export const MET = { on:false, light:false, raf:0, nextTime:0, beat:0, beatsPerBar:4, bpm:100, meterDuration:0.25, _startAC:0, token:0 };

export function metSetButton(){
  const bSound = document.getElementById('metronomeBtn');
  if(bSound){
    bSound.setAttribute('aria-pressed', String(!!S.settings.metronome));
    bSound.classList.toggle('active-met', !!S.settings.metronome);
    const ico = bSound.querySelector('.icw');
    if(ico) ico.innerHTML = S.settings.metronome ? I.volume : I.mute;
  }
  const bLight = document.getElementById('metLightBtn');
  if(bLight){
    bLight.setAttribute('aria-pressed', String(!!S.settings.metLight));
    bLight.style.overflow = 'visible';
    bLight.style.minWidth = 'auto';
    bLight.style.padding = '8px 10px';
    const host = document.getElementById('metLamps');
    if(host){
      host.style.display = 'inline-flex';
      host.style.gap = '5px';
      host.style.alignItems = 'center';
      host.style.minHeight = '18px';
      host.style.overflow = 'visible';
      const bpb = (window.L && window.L.beatsPerBar) ? window.L.beatsPerBar : 4;
      if(host.children.length !== bpb){
        let html = '';
        for(let i = 0; i < bpb; i++) html += '<span class="met-lamp' + (i === 0 ? '' : ' weak') + '"></span>';
        host.innerHTML = html;
      }
      [...host.children].forEach(el => {
        el.style.display = 'inline-block';
        el.style.width = '16px';
        el.style.height = '16px';
        el.style.minWidth = '16px';
        el.style.minHeight = '16px';
        el.style.borderRadius = '50%';
        el.style.background = '#8A8A8A';
        el.style.border = '1px solid rgba(255,255,255,.25)';
        el.style.flexShrink = '0';
        el.classList.remove('on');
      });
    }
  }
}

export function metStart(){
  if(!window.L) return;
  if(!S.settings.metLight && !S.settings.metronome) return;
  const ctx = ensureAudio(); if(!ctx) return;
  cancelAnimationFrame(MET.raf);
  MET.token = (MET.token || 0) + 1;
  const myToken = MET.token;
  const tp = window.L.tempo || { bpm: 100, q: 0.25 };
  MET.bpm = tp.bpm || 100;
  MET.meterDuration = 60 / MET.bpm;
  MET.beatsPerBar = window.L.beatsPerBar || 4;
  MET.beat = 0;
  MET.nextTime = ctx.currentTime + 0.1;
  MET._startAC = ctx.currentTime;
  MET.on    = !!S.settings.metronome;
  MET.light = !!S.settings.metLight;
  MET._token = myToken;
  metSetButton();
  sfxClick();
  metLoop(myToken);
}

export function metStop(){
  MET.token = (MET.token || 0) + 1;
  MET.on = false; MET.light = false;
  cancelAnimationFrame(MET.raf); MET.raf = 0; MET._token = 0;
  const host = document.getElementById('metLamps');
  if(host){
    [...host.children].forEach(el => {
      el.classList.remove('on');
      el.style.background = '#8A8A8A';
      el.style.boxShadow = 'none';
    });
  }
}

export function metLoop(token){
  if(token !== MET._token) return;
  if(!MET.on && !MET.light){ MET.raf = 0; return; }
  const ctx = ensureAudio(); if(!ctx) return;
  while(MET.nextTime < ctx.currentTime + 0.15){
    const t = MET.nextTime;
    const strong = (MET.beat % MET.beatsPerBar) === 0;
    if(MET.on){
      tone({ freq: strong ? 880 : 660, dur: 0.06, vel: strong ? 0.5 : 0.28, type: 'sine', when: t });
    }
    if(MET.light){
      const delay = Math.max(0, (t - ctx.currentTime) * 1000);
      const beatIdx = MET.beat % MET.beatsPerBar;
      setTimeout(() => {
        if(token !== MET._token) return;
        if(!MET.light) return;
        const host = document.getElementById('metLamps');
        if(!host) return;
        const lamps = host.children;
        for(let i = 0; i < lamps.length; i++){
          lamps[i].classList.remove('on');
          lamps[i].style.background = '#8A8A8A';
          lamps[i].style.boxShadow = 'none';
        }
        if(lamps[beatIdx]){
          lamps[beatIdx].classList.add('on');
          const isStrong = beatIdx === 0;
          lamps[beatIdx].style.background = isStrong ? '#FF5A5F' : '#3CE68A';
          lamps[beatIdx].style.boxShadow = isStrong ? '0 0 10px rgba(255,90,95,.95)' : '0 0 10px rgba(60,230,138,.95)';
        }
      }, delay);
    }
    MET.beat++;
    MET.nextTime += MET.meterDuration;
  }
  MET.raf = requestAnimationFrame(() => metLoop(token));
}

export function metRestart(){
  cancelAnimationFrame(MET.raf); MET.raf = 0;
  MET.token = (MET.token || 0) + 1;
  MET.on    = !!S.settings.metronome;
  MET.light = !!S.settings.metLight;
  metSetButton();
  if(MET.on || MET.light) metStart();
  else metStop();
}

export function metToggleSound(){ S.settings.metronome = !S.settings.metronome; save(); metSetButton(); }
export function metToggleLight(){ S.settings.metLight   = !S.settings.metLight;   save(); metSetButton(); }

// Expor no window para compatibilidade
window.ensureAudio = ensureAudio;
window.unlockAudio = unlockAudio;
window.tone = tone;
window.instNote = instNote;
window.sfxClick = sfxClick;
window.sfxWrong = sfxWrong;
window.sfxFanfare = sfxFanfare;
window.sfxFail = sfxFail;
window.setSound = setSound;
window.updateSoundBtn = updateSoundBtn;
window.PB = PB;
window.startPlayback = startPlayback;
window.stopPlayback = stopPlayback;
window.updatePlayUI = updatePlayUI;
window.ensureVisible = ensureVisible;
window.MET = MET;
window.metSetButton = metSetButton;
window.metStart = metStart;
window.metStop = metStop;
window.metRestart = metRestart;
window.metToggleSound = metToggleSound;
window.metToggleLight = metToggleLight;
