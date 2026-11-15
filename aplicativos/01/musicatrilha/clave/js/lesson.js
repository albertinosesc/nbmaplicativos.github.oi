// ===== Lição: init, renderSheet, piano, evaluate =====
// Depende de: state.js, songs.js, audio.js, ui.js, icons.js, config.js

import { S, save, addXp, salvarProgressoMusica, todayStr } from './state.js';
import { extractNotes, getTempo } from './songs.js';
import { instNote, sfxWrong, sfxFanfare, sfxFail, startPlayback, stopPlayback, PB, MET, metStop, metStart } from './audio.js';
import { openModal, closeModal, toast, esc, confettiBurst } from './ui.js';
import { I } from './icons.js';
import { DIFF_LABEL } from './config.js';

export let L = null;
let hintTimer = 0;
export let KEYMAP = { map: {}, rev: {}, labels: {} };

const NOTE_PT = ['Dó','Dó♯','Ré','Ré♯','Mi','Fá','Fá♯','Sol','Sol♯','Lá','Lá♯','Si'];
const BLACK_PC = [1,3,6,8,10];
const DIATONIC_SEMITONES = [0,2,4,5,7,9,11];
const isBlack = m => BLACK_PC.includes(((m % 12) + 12) % 12);
const noteLabel = m => NOTE_PT[((m % 12) + 12) % 12] + ' (' + ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][((m % 12) + 12) % 12] + Math.floor(m / 12 - 1) + ')';
const fmtTime = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

const PIANO_KEYS = ['KeyA','KeyW','KeyS','KeyE','KeyD','KeyF','KeyT','KeyG','KeyY','KeyH','KeyU','KeyJ',
                    'KeyK','KeyO','KeyL','KeyP','Semicolon','Quote',
                    'Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7'];
const PIANO_LABELS = { KeyA:'A', KeyW:'W', KeyS:'S', KeyE:'E', KeyD:'D', KeyF:'F', KeyT:'T', KeyG:'G', KeyY:'Y', KeyH:'H', KeyU:'U', KeyJ:'J',
  KeyK:'K', KeyO:'O', KeyL:'L', KeyP:'P', Semicolon:';', Quote:"'", Digit1:'1', Digit2:'2', Digit3:'3', Digit4:'4', Digit5:'5', Digit6:'6', Digit7:'7' };

function buildKeyMap(notes){
  const map = {}, rev = {};
  for(let i = 0; i < notes.length && i < PIANO_KEYS.length; i++){
    const m = notes[i];
    if(rev[m] != null) continue;
    map[PIANO_KEYS[i]] = m;
    rev[m] = PIANO_KEYS[i];
  }
  return { map, rev, labels: PIANO_LABELS };
}

export function initLesson(song){
  stopPlayback(); metStop();
  let bpm = 100, beatsPerBar = 4;
  try{
    const tune = (window.ABCJS && ABCJS.parseOnly) ? ABCJS.parseOnly(song.abc)[0] : null;
    const tp = getTempo(tune);
    bpm = tp.bpm || 100;
    const mm = song.abc.match(/^M:\s*(\d+)\/(\d+)/m);
    if(mm) beatsPerBar = parseInt(mm[1], 10) || 4;
  }catch(e){}
  L = { song, index: 0, hearts: 5, mistakes: 0, combo: 0, maxCombo: 0, correct: 0, startedAt: Date.now(), finished: false, events: [], targets: [], total: 0, spw: 2.4, keys: new Map(), tempo: { bpm, q: 0.25 }, beatsPerBar, hits: [], anchorAC: 0 };
  window.L = L;
  const w = window.worldOf ? window.worldOf(song.difficulty) : { emblem: '🎵', name: 'Trilha' };
  document.getElementById('lessonUnit').textContent = w.emblem + ' ' + w.name + ' • ' + DIFF_LABEL[song.difficulty];
  document.getElementById('lessonTitle').textContent = song.title;
  document.getElementById('lessonTip').style.display = S.settings.tipSeen ? 'none' : 'flex';
  setSwitch(document.getElementById('namesSwitch'),  S.settings.names);
  setSwitch(document.getElementById('assistSwitch'), S.settings.assist);
  if(!S.ranges) S.ranges = {};
  if(!S.ranges[song.id]){ S.ranges[song.id] = { from: 'C,', to: 'c' }; save(); }
  renderSheet();
  buildPianoFromRange(song);
  if(window.updatePlayUI) updatePlayUI();
  if(window.metSetButton) metSetButton();
  const reflow = () => {
    if(!L || L.finished) return;
    const pw = document.getElementById('paper');
    if(pw && pw.clientWidth > 50){
      renderSheet();
      buildPianoFromRange(L.song);
    } else {
      setTimeout(reflow, 80);
    }
  };
  requestAnimationFrame(reflow);
  setTimeout(reflow, 150);
  setTimeout(reflow, 400);
  if(S.settings.metronome || S.settings.metLight) metStart();
}

function midiFromAbc(abc){
  const m = /^([A-Ga-g])([#b]?)(,+|'+)?$/.exec(abc);
  if(!m) return null;
  const base = m[1];
  const acc  = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  const upper = base.toUpperCase();
  const diatonic = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 }[upper];
  if(diatonic == null) return null;
  let octv = 4;
  if(base === base.toLowerCase() && base !== base.toUpperCase()) octv = 5;
  if(m[3]){
    if(m[3][0] === ',') octv -= m[3].length;
    if(m[3][0] === "'") octv += m[3].length;
  }
  return (octv + 1) * 12 + diatonic + acc;
}

export function buildPianoFromRange(song){
  let r = S.ranges[song.id];
  if(!r || !r.from || !r.to) r = { from: 'C,', to: 'c' };
  const lo = midiFromAbc(r.from) ?? 48;
  const hi = midiFromAbc(r.to)   ?? 72;
  const a  = Math.min(lo, hi);
  const b  = Math.max(lo, hi);
  const notes = [];
  for(let m = a; m <= b; m++) notes.push(m);
  if(!notes.length){ for(let m = 48; m <= 72; m++) notes.push(m); }
  KEYMAP = buildKeyMap(notes);
  window.KEYMAP = KEYMAP;
  buildPiano(notes);
}

export function renderSheet(){
  const paper = document.getElementById('paper');
  if(!paper || !L) return;
  if(!window.ABCJS){ paper.innerHTML = '<div class="paper-error">⚠️ abcjs não carregou.</div>'; return; }
  const cs = getComputedStyle(paper);
  const padL = parseFloat(cs.paddingLeft) || 0;
  const padR = parseFloat(cs.paddingRight) || 0;
  let paperW = paper.clientWidth;
  if(!paperW || paperW < 100) paperW = Math.max(280, window.innerWidth - 40);
  const w = Math.max(280, paperW - padL - padR - 12);
  paper.innerHTML = '';
  let tunes = null;
  try{
    tunes = ABCJS.renderAbc(paper, L.song.abc, {
      staffwidth: w, scale: 1.15, add_classes: true,
      paddingtop: -42, paddingbottom: 40, paddingleft: 4, paddingright: 4,
      wrap: { minSpacing: 1.9, maxSpacing: 2.8, preferredMeasuresPerLine: 4 }
    });
  }catch(err){
    paper.innerHTML = '<div class="paper-error">Erro: ' + esc(err.message) + '</div>';
    return;
  }
  const tune = tunes && tunes[0], ex = extractNotes(tune);
  L.events  = ex.events;
  L.targets = ex.targets;
  L.total   = ex.total;
  const tp = getTempo(tune);
  L.spw = 60 / (tp.bpm * tp.q);
  L.anchorAC = 0;
  paper.scrollTop = 0;
  if(!L.targets.length) paper.innerHTML += '<div class="paper-error">Nenhuma nota.</div>';

  // 👇 ativa rolagem se a partitura for maior que o container
  const lessonEl = document.querySelector('#view-licao .lesson');
  if(lessonEl){
    const paperWrap = paper.closest('.paper-wrap');
    if(paperWrap){
      const overflow = paper.scrollHeight > paperWrap.clientHeight + 10;
      lessonEl.classList.toggle('lesson-scrollable', overflow);
    }
  }
}

export function buildPiano(notes){
  const piano = document.getElementById('piano');
  if(!piano) return;
  piano.innerHTML = '';
  L.keys.clear();
  piano.classList.toggle('no-names', !S.settings.names);
  if(!notes.length) return;
  const minM = notes[0], maxM = notes[notes.length - 1];
  const whites = [];
  for(let m = minM; m <= maxM; m++) if(!isBlack(m)) whites.push(m);
  const W = whites.length, ww = 100 / W;
  piano.style.minWidth = (W * 46) + 'px';
  piano.style.width = '100%';
  const whiteIndexByMidi = new Map();
  whites.forEach((m,i) => whiteIndexByMidi.set(m, i));
  const { labels } = KEYMAP;
  whites.forEach(m => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'key white';
    b.dataset.midi = m;
    const code = KEYMAP.rev[m];
    b.innerHTML = '<span class="kbd-hint">' + (code ? (labels[code] || '') : '') + '</span>'
                + '<span class="key-name">' + NOTE_PT[((m % 12)+12)%12] + '</span>';
    b.setAttribute('aria-label', noteLabel(m));
    piano.appendChild(b);
    L.keys.set(m, b);
  });
  for(let m = minM; m <= maxM; m++){
    if(!isBlack(m)) continue;
    const prevW = whiteIndexByMidi.get(m - 1);
    const nextW = whiteIndexByMidi.get(m + 1);
    if(prevW == null || nextW == null) continue;
    const centerPct = (prevW + 1) * ww;
    const blackW = ww * 0.62;
    const leftPct = centerPct - blackW / 2;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'key black';
    b.dataset.midi = m;
    b.style.left = leftPct + '%';
    b.style.width = blackW + '%';
    const code = KEYMAP.rev[m];
    b.innerHTML = '<span class="kbd-hint">' + (code ? (labels[code] || '') : '') + '</span>';
    b.setAttribute('aria-label', noteLabel(m));
    piano.appendChild(b);
    L.keys.set(m, b);
  }
  applyPracticeHighlight();
  updateLessonUI();
}

function ensureKeyVisible(k){
  const wrap = k.closest('.piano-scroll') || document.getElementById('pianoScroll');
  if(!wrap) return;
  if(k.offsetLeft < wrap.scrollLeft + 8 || k.offsetLeft + k.offsetWidth > wrap.scrollLeft + wrap.clientWidth - 8)
    wrap.scrollLeft = k.offsetLeft - wrap.clientWidth / 2 + k.offsetWidth / 2;
}

function baseHint(){ return S.settings.assist ? 'Toque' : 'Leia a partitura 🎼'; }

export function applyPracticeHighlight(){
  if(!L) return;
  L.targets.forEach((t,i) => {
    const cls = i < L.index ? 'hl-done' : (i === L.index && !L.finished ? 'hl-current' : '');
    t.elems.forEach(e => { e.classList.remove('hl-done', 'hl-current'); if(cls) e.classList.add(cls); });
  });
  L.keys.forEach(k => k.classList.remove('expect'));
  const t = L.targets[L.index];
  if(t && !L.finished){
    if(S.settings.assist){ const k = L.keys.get(t.midi); if(k){ k.classList.add('expect'); ensureKeyVisible(k); } }
    const paper = document.getElementById('paper');
    if(paper){
      const e = t.elems && t.elems[0];
      if(e){
        const r = e.getBoundingClientRect();
        const p = paper.getBoundingClientRect();
        if(r.bottom > p.bottom - 16) paper.scrollTop += (r.bottom - p.bottom) + 60;
        else if(r.top < p.top + 8) paper.scrollTop -= (p.top - r.top) + 60;
      }
    }
  }
}

export function updateLessonUI(){
  if(!L) return;
  const hearts = document.getElementById('hearts');
  if(hearts) hearts.innerHTML = [0,1,2,3,4].map(i => '<span class="heart' + (i < L.hearts ? '' : ' lost') + '">' + I.heart + '</span>').join('');
  const total = L.targets.length || 1;
  const fill = document.getElementById('pbarFill');
  if(fill) fill.style.width = (100 * L.index / total) + '%';
  const pc = document.getElementById('pCount');
  if(pc) pc.textContent = L.index + '/' + L.targets.length;
  const cc = document.getElementById('comboChip');
  if(cc){
    if(L.combo >= 2){ cc.style.display = 'inline-flex'; cc.innerHTML = I.flame + ' ×' + L.combo; }
    else cc.style.display = 'none';
  }
  const t = L.targets[L.index];
  const hc = document.getElementById('hintChip');
  if(hc) hc.innerHTML = L.finished ? '🎉' : (S.settings.assist && t ? NOTE_PT[((t.midi%12)+12)%12] : '?');
  const hm = document.getElementById('hintMsg');
  if(hm && !hm.classList.contains('err')) hm.textContent = L.finished ? 'Concluída!' : baseHint();
}

export function flashHint(msg){
  const m = document.getElementById('hintMsg');
  if(!m) return;
  m.textContent = msg; m.classList.add('err');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => {
    m.classList.remove('err');
    m.textContent = L && !L.finished ? baseHint() : 'Concluída!';
  }, 1500);
}

export function setSwitch(btn, on){ if(btn) btn.setAttribute('aria-checked', String(on)); }

export function pressKey(midi, keyEl){
  keyEl.classList.add('pressed');
  clearTimeout(keyEl._pt);
  keyEl._pt = setTimeout(() => keyEl.classList.remove('pressed'), 200);
  instNote(midi, 0.9, null, 0.8);
  evaluate(midi, keyEl);
}

export function evaluate(midi, keyEl){
  if(!L || L.finished || PB.playing) return;
  const t = L.targets[L.index];
  if(!t) return;
  const ctx = window.ensureAudio ? ensureAudio() : null;
  const tempoReal = ctx ? ctx.currentTime : 0;
  if(!L.anchorAC) L.anchorAC = tempoReal;
  const tempoAlvo = L.anchorAC + (t.start * L.spw);
  const erro = tempoReal - tempoAlvo;
  L.hits.push({ midi, err: erro, idx: L.index, at: Date.now() });
  if(midi === t.midi){
    L.correct++; L.combo++;
    L.maxCombo = Math.max(L.maxCombo, L.combo);
    if(window.addXp) addXp(10);
    floatXp(keyEl);
    L.index++;
    if(L.index >= L.targets.length) finishLesson();
    else applyPracticeHighlight();
    updateLessonUI();
  } else {
    L.mistakes++; L.combo = 0; L.hearts--;
    keyEl.classList.add('wrong');
    setTimeout(() => keyEl.classList.remove('wrong'), 460);
    if(window.sfxWrong) sfxWrong();
    flashHint('Erro ');
    const h = document.getElementById('hearts');
    if(h){ h.classList.add('shake'); setTimeout(() => h.classList.remove('shake'), 500); }
    updateLessonUI();
    if(L.hearts <= 0) failLesson();
  }
}

function floatXp(keyEl){
  const r = keyEl.getBoundingClientRect();
  const x = Math.min(Math.max(r.left + r.width/2, 34), innerWidth - 34);
  const sp = document.createElement('span');
  sp.className = 'float-xp';
  sp.textContent = '+10';
  sp.style.left = x + 'px';
  sp.style.top = Math.max(r.top - 10, 70) + 'px';
  document.body.appendChild(sp);
  setTimeout(() => sp.remove(), 950);
}

export function toggleListen(){
  if(!L) return;
  if(PB.playing && PB.session && PB.session.owner === 'lesson'){ stopPlayback(); applyPracticeHighlight(); return; }
  if(!L.events.length) return;
  startPlayback({ owner: 'lesson', events: L.events, total: L.total, spw: L.spw, paper: document.getElementById('paper'), keys: L.keys, onEnd: () => applyPracticeHighlight() });
}

export function finishLesson(){
  L.finished = true;
  applyPracticeHighlight();
  metStop();
  const secs = Math.round((Date.now() - L.startedAt) / 1000);
  const acc  = Math.round(100 * L.correct / Math.max(1, L.correct + L.mistakes));
  const stars = L.mistakes === 0 ? 3 : L.mistakes <= 3 ? 2 : 1;
  const bonus = 20 + L.song.difficulty * 10;
  const perfect = L.mistakes === 0 ? 30 : 0;
  const notesXp = L.correct * 10;
  if(window.addXp) addXp(bonus + perfect);
  const gems = 5 + (perfect ? 3 : 0);
  S.gems += gems;
  const d = todayStr();
  if(S.lastDay !== d){ const diff = S.lastDay ? window.daysBetween(S.lastDay, d) : 999; S.streak = diff === 1 ? S.streak + 1 : 1; S.lastDay = d; }
  if(window.salvarProgressoMusica) salvarProgressoMusica(L.song.id, stars, acc);
  save();
  if(window.updateHUD) updateHUD();
  if(window.sfxFanfare) sfxFanfare();
  if(window.confettiBurst) confettiBurst();
  const TOL = 0.200;
  const medirRitmo = !!MET._startAC && L.hits.some(h => h.err != null);
  let accRitmo = null;
  if(medirRitmo){
    let ok = 0, total = 0;
    L.hits.forEach(h => {
      if(h.midi == null || h.idx == null) return;
      const alvo = L.targets[h.idx];
      if(!alvo) return;
      if(h.midi === alvo.midi){ total++; if(Math.abs(h.err) <= TOL) ok++; }
    });
    accRitmo = total > 0 ? Math.round(100 * ok / total) : null;
  }
  const next = window.withStatus ? withStatus(window.SEEDS).find(s => !s.done) : null;
  const maxCombo = L.maxCombo, song = L.song;
  const statsHtml = '<div class="stats-grid' + (accRitmo != null ? ' five' : '') + '">'
    + '<div class="stat"><b>+' + (notesXp + bonus + perfect) + '</b><span>XP</span></div>'
    + '<div class="stat"><b>' + acc + '%</b><span>Notas</span></div>'
    + (accRitmo != null ? '<div class="stat"><b>' + accRitmo + '%</b><span>Ritmo</span></div>' : '')
    + '<div class="stat"><b>×' + maxCombo + '</b><span>Combo</span></div>'
    + '<div class="stat"><b>' + fmtTime(secs) + '</b><span>Tempo</span></div></div>';
  openModal(
    '<div class="mascot-wrap mascot">' + window.mascotSVG('win') + '</div>'
    + '<h3 class="modal-title">' + (next ? 'Música concluída!' : 'Trilha completa! 🏆') + '</h3>'
    + '<p class="modal-sub">' + esc(song.title) + '</p>'
    + '<div class="stars-row">' + [0,1,2].map(i =>
        '<span class="star-big' + (i < stars ? ' earned' : '') + '" style="animation-delay:' + (0.1 + i * 0.16) + 's">' + I.star + '</span>'
      ).join('') + '</div>'
    + statsHtml
    + '<div class="reward-line"><span class="icw c-gem">' + I.gem + '</span> +' + gems + ' gemas' + (perfect ? ' &nbsp;•&nbsp; Perfeito! +30 XP' : '') + '</div>'
    + '<div class="modal-actions-col">'
    + (next ? '<button class="btn gold big" id="mNext">Próxima: ' + esc(next.title) + ' ' + I.arrowR + '</button>' : '<button class="btn gold big" id="mTrail">' + I.route + ' Voltar à trilha</button>')
    + (next ? '<button class="btn ghost" id="mTrail2">' + I.route + ' Voltar à trilha</button>' : '')
    + '</div>',
    { onClose: () => { location.hash = '#/trilha'; } }
  );
  const nx = document.getElementById('mNext');
  if(nx) nx.onclick = () => { closeModal(true); location.hash = '#/licao/' + next.id; };
  const tr = document.getElementById('mTrail') || document.getElementById('mTrail2');
  if(tr) tr.onclick = () => closeModal();
}

export function failLesson(){
  L.finished = true; applyPracticeHighlight();
  if(window.sfxFail) sfxFail();
  const song = L.song;
  openModal(
    '<div class="fail-icon">' + I.heart + '</div>'
    + '<h3 class="modal-title">Não foi dessa vez!</h3>'
    + '<p class="modal-sub">Tente de novo — errar faz parte. 💪</p>'
    + '<div class="modal-actions-col" style="margin-top:18px">'
    + '<button class="btn green big" id="mRetry">' + I.refresh + ' Tentar novamente</button>'
    + '<button class="btn ghost" id="mBack">' + I.route + ' Voltar à trilha</button></div>'
  );
  const rt = document.getElementById('mRetry'), bk = document.getElementById('mBack');
  if(rt) rt.onclick = () => { closeModal(true); initLesson(song); };
  if(bk) bk.onclick = () => { closeModal(true); location.hash = '#/trilha'; };
}

export function requestExit(){
  if(L && !L.finished && L.index > 0){
    openModal(
      '<h3 class="modal-title">Sair da lição?</h3>'
      + '<p class="modal-sub">Seu progresso será perdido.</p>'
      + '<div class="modal-actions-col" style="margin-top:18px">'
      + '<button class="btn green big" id="mStay">' + I.play + ' Continuar</button>'
      + '<button class="btn ghost" id="mQuit">Sair</button></div>'
    );
    const st = document.getElementById('mStay'), qt = document.getElementById('mQuit');
    if(st) st.onclick = () => closeModal();
    if(qt) qt.onclick = () => { closeModal(true); location.hash = '#/trilha'; };
  } else { location.hash = '#/trilha'; }
}

// Expor no window
window.L = L;
window.KEYMAP = KEYMAP;
window.initLesson = initLesson;
window.renderSheet = renderSheet;
window.buildPianoFromRange = buildPianoFromRange;
window.buildPiano = buildPiano;
window.applyPracticeHighlight = applyPracticeHighlight;
window.updateLessonUI = updateLessonUI;
window.flashHint = flashHint;
window.setSwitch = setSwitch;
window.pressKey = pressKey;
window.evaluate = evaluate;
window.toggleListen = toggleListen;
window.finishLesson = finishLesson;
window.failLesson = failLesson;
window.requestExit = requestExit;
