// ===== Músicas: SEEDS, loadRemoteSongs, metaCache, pitch, extractNotes =====
// Depende de: state.js (S, save), ui.js (toast)

import { S, save } from './state.js';
import { toast } from './ui.js';
import { MUSIC_DIR } from './config.js';

export const SEEDS = [];
export const metaCache = new Map();

const DIATONIC_SEMITONES = [0,2,4,5,7,9,11];

export function pitchToMidi(p){
  if(!p) return null;
  if(typeof p.midiPitch === 'number' && p.midiPitch >= 0 && p.midiPitch <= 127) return p.midiPitch;
  if(typeof p.pitch === 'number' && p.pitch >= 12 && p.pitch <= 127) return p.pitch;
  if(typeof p.verticalPos === 'number'){
    const vp = p.verticalPos, octv = 4 + Math.floor(vp / 7), diat = ((vp % 7) + 7) % 7;
    const nameHasAcc = p.name && /[#b]/.test(String(p.name));
    let acc = 0;
    if(!nameHasAcc){
      if(p.accidental === 'sharp' || p.accidental === 1) acc = 1;
      else if(p.accidental === 'flat' || p.accidental === -1) acc = -1;
    }
    return (octv + 1) * 12 + DIATONIC_SEMITONES[diat] + acc;
  }
  if(p.name){
    const m = /^([A-Ga-g])([#b]?)(-?\d+)?$/.exec(String(p.name).trim());
    if(m){
      const idx = 'CDEFGAB'.indexOf(m[1].toUpperCase());
      const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
      let octv = m[3] != null ? parseInt(m[3], 10) : 4;
      if(m[1] === m[1].toLowerCase() && m[3] == null) octv = 5;
      return (octv + 1) * 12 + DIATONIC_SEMITONES[idx] + acc;
    }
  }
  if(typeof p.pitch === 'number' && p.pitch >= 0 && p.pitch <= 7) return 60 + DIATONIC_SEMITONES[p.pitch];
  return null;
}

export function extractNotes(tune){
  const events = [];
  let beat = 0;
  ((tune && tune.lines) || []).forEach(line => {
    if(!line.staff) return;
    const st = line.staff[0];
    const voice = st && st.voices && st.voices[0];
    if(!voice) return;
    voice.forEach(el => {
      if(el.el_type !== 'note') return;
      const dur = el.duration || 0.25;
      if(el.pitches && el.pitches.length){
        const midis = el.pitches.map(pitchToMidi).filter(v => v != null);
        const midi = midis.length ? Math.max(...midis) : null;
        const elems = ((el.abselem && el.abselem.elemset) || []).flat().filter(e => e && e.classList);
        events.push({ midi, dur, start: beat, elems });
      } else {
        events.push({ midi: null, dur, start: beat, elems: [] });
      }
      beat += dur;
    });
  });
  return { events, total: beat, targets: events.filter(e => e.midi != null) };
}

export function getTempo(tune){
  const t = tune && tune.metaText && tune.metaText.tempo;
  if(t){
    let bpm = (typeof t.bpm === 'number' && t.bpm > 0) ? t.bpm : ((typeof t.qpm === 'number' && t.qpm > 0) ? t.qpm : 0);
    if(bpm > 0){
      let q = (t.duration && t.duration[0]) || 0.25;
      if(q > 1) q = 1 / q;
      return { bpm, q };
    }
  }
  return { bpm: 100, q: 0.25 };
}

export function songMeta(s){
  if(metaCache.has(s.id)) return metaCache.get(s.id);
  const m = { count: 0, min: 0, max: 0, meter: '4/4', bpm: 100, key: 'C' };
  try{
    if(window.ABCJS && ABCJS.parseOnly){
      const t = ABCJS.parseOnly(s.abc)[0];
      const ex = extractNotes(t);
      const ms = ex.targets.map(x => x.midi);
      m.count = ms.length;
      if(ms.length){ m.min = Math.min(...ms); m.max = Math.max(...ms); }
      m.bpm = getTempo(t).bpm;
    } else {
      m.count = (s.abc.split('\n').filter(l => !/^[A-Za-z]:/.test(l)).join('').match(/[A-Ga-g]/g) || []).length;
    }
  }catch(e){}
  const mm = s.abc.match(/^M:\s*(.+)$/m); if(mm) m.meter = mm[1].trim();
  const kk = s.abc.match(/^K:\s*(.+)$/m); if(kk) m.key   = kk[1].trim();
  metaCache.set(s.id, m);
  return m;
}

const slug = t => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'item';
const absUrl = path => { try{ return new URL(path, document.baseURI).href; }catch(e){ return path; } };

let remoteLoaded = false;

export async function loadRemoteSongs(){
  if(remoteLoaded) return;
  remoteLoaded = true;
  const CACHE_KEY = 'clave.songsCache.v5';
  const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
  try{
    const raw = localStorage.getItem(CACHE_KEY);
    if(raw){
      const cached = JSON.parse(raw);
      if(cached && Array.isArray(cached.songs) && cached.songs.length && (Date.now() - (cached.savedAt || 0)) < CACHE_TTL_MS){
        SEEDS.length = 0;
        cached.songs.forEach(s => SEEDS.push(s));
        metaCache.clear();
        return;
      }
    }
  }catch(e){}
  try{
    const res = await fetch(absUrl(MUSIC_DIR + 'manifest.json'), { cache: 'no-cache' });
    if(!res.ok) throw new Error('manifest ' + res.status);
    const man = await res.json();
    const list = Array.isArray(man.songs) ? man.songs : (Array.isArray(man) ? man : []);
    let idx = 0, added = 0;
    for(const item of list){
      const file = typeof item === 'string' ? item : item.file;
      if(!file) continue;
      const diff = typeof item === 'object' && item.difficulty ? +item.difficulty : 1;
      const id = 'r' + slug(file.replace(/\.abc$/i, ''));
      if(SEEDS.some(s => s.id === id)) continue;
      try{
        const r = await fetch(absUrl(MUSIC_DIR + file), { cache: 'no-cache' });
        if(!r.ok) continue;
        const abc = await r.text();
        if(!abc.trim()) continue;
        const tM = abc.match(/^T:\s*(.+)$/m), cM = abc.match(/^C:\s*(.+)$/m);
        SEEDS.push({
          id, seed: true, order: 1000 + idx++,
          difficulty: Math.min(5, Math.max(1, diff || 1)),
          title: (typeof item === 'object' && item.title) || (tM ? tM[1].trim() : '') || file.replace(/\.abc$/i, ''),
          composer: (typeof item === 'object' && item.composer !== undefined)
            ? String(item.composer || '').trim()
            : (cM ? cM[1].trim() : ''),
          abc
        });
        if(typeof item === 'object' && item.defaultRange && item.defaultRange.from && item.defaultRange.to){
          const dr = item.defaultRange;
          if(!S.ranges) S.ranges = {};
          const atual = S.ranges[id];
          const manifestMudou = !atual || atual.from !== dr.from || atual.to !== dr.to;
          if(manifestMudou && !(atual && atual._custom)){ S.ranges[id] = { from: dr.from, to: dr.to, _fromManifest: true }; save(); }
        }
        added++;
      }catch(e){}
    }
    if(added){
      metaCache.clear();
      try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ songs: SEEDS, savedAt: Date.now() })); }catch(e){}
      save();
    }
  }catch(e){ console.warn('Músicas remotas não carregadas:', e); }
}

// Expor no window
window.SEEDS = SEEDS;
window.metaCache = metaCache;
window.pitchToMidi = pitchToMidi;
window.extractNotes = extractNotes;
window.getTempo = getTempo;
window.songMeta = songMeta;
window.loadRemoteSongs = loadRemoteSongs;
