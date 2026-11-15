// ===== Trilha: mundos, render, sidebar =====
import { S, save, withStatus, todayStr } from './state.js';
import { DB } from './firebase.js';
import { esc, toast } from './ui.js';
import { I, mascotSVG } from './icons.js';
import { TIPS, DIFF_LABEL } from './config.js';

export const WORLDS = [
  { id:'forest',  name:'Floresta Encantada', desc:'Sons suaves entre árvores e cogumelos', emblem:'🌲', cls:'w-forest',  range:[1,1] },
  { id:'farm',    name:'Fazenda',            desc:'Ritmos do campo, animais e natureza',   emblem:'🚜', cls:'w-farm',    range:[2,2] },
  { id:'city',    name:'Cidade Neon',        desc:'Ritmo urbano, luzes e batidas',         emblem:'🏙️', cls:'w-city',    range:[3,3] },
  { id:'space',   name:'Espaço Sideral',     desc:'Melodias entre estrelas e planetas',    emblem:'🚀', cls:'w-space',   range:[4,4] },
  { id:'volcano', name:'Vulcão Ancestral',   desc:'O desafio final em lava e brasas',      emblem:'🌋', cls:'w-volcano', range:[5,5] }
];

export function worldOf(diff){
  return WORLDS.find(w => diff >= w.range[0] && diff <= w.range[1]) || WORLDS[0];
}

let tipIdx = 0;

function worldSvgDecor(worldId){
  if(worldId === 'forest') return '<svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 180 Q60 150 120 170 T260 160 T400 175 V200 H0 Z" fill="rgba(15,60,35,.6)"/><circle cx="40" cy="40" r="2" fill="#a8e6b8" opacity=".7"/><circle cx="120" cy="60" r="1.5" fill="#c8ffd8" opacity=".6"/><circle cx="300" cy="50" r="2" fill="#a8e6b8" opacity=".7"/><circle cx="360" cy="100" r="1.5" fill="#c8ffd8" opacity=".6"/></svg>';
  if(worldId === 'farm') return '<svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 175 Q100 140 200 160 T400 155 V200 H0 Z" fill="rgba(80,50,20,.55)"/><circle cx="50" cy="55" r="20" fill="rgba(255,210,120,.25)"/><path d="M0 185 Q50 170 100 180 T200 175 T300 182 T400 178" stroke="rgba(180,140,70,.35)" stroke-width="2" fill="none"/><circle cx="120" cy="90" r="1.8" fill="#ffd27a" opacity=".7"/><circle cx="280" cy="70" r="1.5" fill="#ffd27a" opacity=".6"/><circle cx="350" cy="120" r="1.5" fill="#ffd27a" opacity=".6"/></svg>';
  if(worldId === 'city') return '<svg viewBox="0 0 400 200" preserveAspectRatio="none"><rect x="20" y="140" width="26" height="60" fill="rgba(80,30,140,.5)"/><rect x="60" y="120" width="34" height="80" fill="rgba(80,30,140,.55)"/><rect x="110" y="150" width="20" height="50" fill="rgba(80,30,140,.5)"/><rect x="270" y="130" width="30" height="70" fill="rgba(80,30,140,.55)"/><rect x="315" y="100" width="40" height="100" fill="rgba(80,30,140,.5)"/><circle cx="130" cy="40" r="1.5" fill="#f0a3ff" opacity=".7"/><circle cx="200" cy="30" r="1.5" fill="#a3d5ff" opacity=".7"/><circle cx="330" cy="60" r="1.5" fill="#f0a3ff" opacity=".6"/></svg>';
  if(worldId === 'space') return '<svg viewBox="0 0 400 200" preserveAspectRatio="none"><circle cx="60" cy="40" r="1.5" fill="#fff"/><circle cx="150" cy="90" r="1.2" fill="#fff"/><circle cx="230" cy="30" r="1.8" fill="#c8d8ff"/><circle cx="310" cy="80" r="1.3" fill="#fff"/><circle cx="370" cy="40" r="1" fill="#fff"/><circle cx="90" cy="140" r="1" fill="#fff"/><circle cx="340" cy="150" r="1.4" fill="#c8d8ff"/><ellipse cx="200" cy="180" rx="80" ry="10" fill="rgba(120,80,200,.25)"/></svg>';
  if(worldId === 'volcano') return '<svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="M0 180 L80 90 L140 130 L200 60 L260 130 L320 90 L400 180 Z" fill="rgba(120,30,10,.55)"/><circle cx="70" cy="40" r="2" fill="#ff8c4d" opacity=".7"/><circle cx="200" cy="20" r="1.5" fill="#ffb37a" opacity=".7"/><circle cx="320" cy="40" r="2" fill="#ff8c4d" opacity=".6"/><path d="M0 190 Q100 170 200 185 T400 180" stroke="rgba(255,120,60,.35)" stroke-width="2" fill="none"/></svg>';
  return '';
}

function applyMinimized(){
  const list = window.withStatus && window.SEEDS ? window.withStatus(window.SEEDS) : [];
  const currentSong = list.find(s => s.current);
  const activeWorldId = currentSong ? worldOf(currentSong.difficulty).id : null;
  const manual = JSON.parse(localStorage.getItem('clave.minimized') || '[]');
  document.querySelectorAll('#worldStack .world').forEach(el => {
    const toggle = el.querySelector('.world-toggle');
    if(!toggle) return;
    const wId = toggle.dataset.world;
    if(!wId) return;
    let isMin;
    if(wId === activeWorldId) isMin = false;
    else isMin = !manual.includes('open:' + wId);
    el.classList.toggle('minimized', isMin);
    toggle.textContent = isMin ? '+' : '−';
    toggle.title = isMin ? 'Expandir' : 'Minimizar';
  });
}

export function renderTrilha(){
  const stack = document.getElementById('worldStack');
  if(!stack) return;
  stack.innerHTML = '';
  const list = withStatus(window.SEEDS);
  const byWorld = {};
  WORLDS.forEach(w => byWorld[w.id] = []);
  list.forEach(s => byWorld[worldOf(s.difficulty).id].push(s));

  WORLDS.forEach((w, wi) => {
    const songs = byWorld[w.id];
    const done = songs.filter(s => s.done).length;
    const nodesHtml = songs.map((s, i) => {
      const off = Math.round(Math.sin(i * 1.15) * 52);
      const cls = s.done ? 'done' : s.current ? 'current' : 'locked';
      const icon = s.done ? '★' : s.current ? '♪' : '🔒';
      const subText = s.done ? 'Concluída' : (s.composer || '').trim();
      return '<div class="w-node-row"><div class="w-node-holder" style="--ox:' + off + 'px">'
        + '<button class="w-node ' + cls + '" data-id="' + s.id + '" aria-label="' + esc(s.title) + '">'
        + icon + (s.done ? '<span class="w-node-badge">' + I.check + '</span>' : '')
        + '</button>'
        + '<div class="w-node-title">' + esc(s.title) + '</div>'
        + (subText ? '<div class="w-node-sub">' + esc(subText) + '</div>' : '')
        + '</div></div>';
    }).join('');

    // Se o mundo está vazio, mostra mensagem + botão "Em breve"
    const vazioHtml = !songs.length
      ? '<div class="w-empty"><span class="w-empty-emoji">' + w.emblem + '</span><b>Em breve!</b><span>Novas músicas chegando neste mundo.</span></div>'
      : '';

    const div = document.createElement('section');
    div.className = 'world ' + w.cls + (songs.length ? '' : ' world-empty');
    div.innerHTML = '<div class="world-deco">' + worldSvgDecor(w.id) + '</div>'
      + '<div class="world-head">'
      +   '<div class="world-emblem-wrap">' + w.emblem + '</div>'
      +   '<div class="world-titles"><small>Mundo ' + (wi + 1) + '</small><h2>' + esc(w.name) + '</h2><p>' + esc(w.desc) + '</p></div>'
      +   '<div class="world-progress"><b>' + done + '/' + songs.length + '</b>'
      +   '<div class="world-bar"><div style="width:' + (songs.length ? (100 * done / songs.length) : 0) + '%"></div></div></div>'
      +   '<button class="world-toggle" data-world="' + w.id + '" aria-label="Minimizar/expandir" title="Minimizar">−</button>'
      + '</div>'
      + '<div class="world-path">'
      +   '<svg class="world-svg" aria-hidden="true"></svg>'
      +   '<div class="world-nodes">' + nodesHtml + vazioHtml + '</div>'
      + '</div>';
    stack.appendChild(div);
  });

  if(!WORLDS.some(w => byWorld[w.id].length)){
    // Só cai aqui se NENHUM mundo tiver música
    stack.innerHTML = '<div class="empty-state" style="margin-top:20px">Nenhuma música carregada. 🎵</div>';
    return;
  }

  requestAnimationFrame(() => {
    document.querySelectorAll('#worldStack .world').forEach(worldEl => {
      const holderEl = worldEl.querySelector('.world-path');
      const svg = worldEl.querySelector('.world-svg');
      const nodes = holderEl.querySelectorAll('.w-node');
      if(!nodes.length || !svg) return;
      const wr = holderEl.getBoundingClientRect();
      svg.setAttribute('width', wr.width);
      svg.setAttribute('height', wr.height);
      svg.setAttribute('viewBox', '0 0 ' + wr.width + ' ' + wr.height);
      let d = '', prev = null;
      nodes.forEach(n => {
        const r = n.getBoundingClientRect();
        const x = r.left - wr.left + r.width/2;
        const y = r.top  - wr.top  + r.height/2;
        if(!prev) d = 'M' + x + ' ' + y;
        else { const my = (prev.y + y) / 2; d += ' C ' + prev.x + ' ' + my + ', ' + x + ' ' + my + ', ' + x + ' ' + y; }
        prev = { x, y };
      });
      svg.innerHTML = '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10"/>';
    });
  });
  renderSidebar();
  applyMinimized();
}

export function renderSidebar(){
  const sidebar = document.getElementById('sidebar');
  if(!sidebar) return;
  const c = window.contaAtual ? contaAtual() : null;
  const al = window.alunoSessao ? alunoSessao() : null;
  const j = window.jogadorAtual ? jogadorAtual() : { tipo: 'visitante', dados: null };
  const dados = j.dados;
  const xpUser = (dados && dados.xp) || S.xp;
  const lvl = Math.floor(xpUser / 150) + 1;
  const into = xpUser % 150;
  const goal = 60;
  const tx = Math.min(S.today.xp || 0, goal);
  const C = 2 * Math.PI * 26;
  const off = C * (1 - tx / goal);
  const rankGlobal = Object.entries(DB.contasGlobais)
    .map(([id, cc]) => ({ id, nome: cc.nome || 'Anônimo', xp: cc.xp || 0, me: id === S.conta && !al }))
    .sort((a,b) => b.xp - a.xp)
    .slice(0, 10);
  const turma = window.turmaDoJogador ? turmaDoJogador() : null;
  const rankTurma = turma
    ? Object.values(DB.alunos).filter(a => a.turmaId === turma.id).map(a => ({ id: a.id, nome: a.nome, xp: a.xp || 0, me: S.alunoSessao === a.id })).sort((a,b) => b.xp - a.xp)
    : [];
  const nomeMostrado = al ? al.nome + ' (aluno)' : (c ? c.nome : 'Visitante');
  const subtitulo   = al ? 'Sessão do professor' : (c ? (c.pro ? 'Professor · Pro' : 'Usuário') : 'Visitante');
  sidebar.innerHTML =
    '<div class="card profile-card"><div class="mascot">' + mascotSVG('side') + '</div>'
    + '<div class="profile-info"><b>' + esc(nomeMostrado) + '</b>'
    + '<span>' + subtitulo + '</span>'
    + '<div class="pbar thin"><div style="width:' + (100 * into / 150) + '%"></div></div>'
    + '<small>XP: ' + xpUser + ' · Nível ' + lvl + '</small></div></div>'
    + '<div class="card goal-card"><div class="goal-ring">'
    + '<svg width="72" height="72" viewBox="0 0 72 72"><defs><linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3CE68A"/><stop offset="1" stop-color="#2ED9C3"/></linearGradient></defs>'
    + '<circle cx="36" cy="36" r="26" stroke="#3A2762" stroke-width="8" fill="none"/>'
    + '<circle cx="36" cy="36" r="26" stroke="url(#goalGrad)" stroke-width="8" fill="none" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 36 36)"/>'
    + '<text x="36" y="41" text-anchor="middle" font-size="14" font-weight="800" fill="#F6F1FF">' + Math.round(100 * tx / goal) + '%</text></svg></div>'
    + '<div><b>Meta diária</b><p>' + (S.today.xp || 0) + '/' + goal + ' XP</p></div></div>'
    + (rankGlobal.length
        ? '<div class="card"><h4>' + I.trophy + ' Ranking global</h4><div class="rank-list">'
          + rankGlobal.map((r,i) =>
              '<div class="rank-row' + (r.me ? ' me' : '') + '"><span class="rank-pos">' + (i < 3 ? ['🥇','🥈','🥉'][i] : i + 1) + '</span>'
              + '<span class="rank-name">' + esc(r.nome) + '</span><b>' + r.xp + ' XP</b></div>'
            ).join('')
          + '</div></div>'
        : '<div class="card"><h4>' + I.trophy + ' Ranking global</h4><p style="font-size:13px;color:var(--ink3);font-weight:700">Crie uma conta para aparecer no ranking!</p></div>')
    + (turma
        ? '<div class="card"><h4>' + I.trophy + ' Ranking da turma · ' + esc(turma.nome) + '</h4><div class="rank-list">'
          + rankTurma.map((r,i) =>
              '<div class="rank-row' + (r.me ? ' me' : '') + '"><span class="rank-pos">' + (i + 1) + '</span>'
              + '<span class="rank-name">' + esc(r.nome) + '</span><b>' + r.xp + ' XP</b></div>'
            ).join('')
          + '</div></div>'
        : '')
    + '<div class="card tip-card"><h4>💡 Dica</h4><p id="tipText">' + TIPS[tipIdx] + '</p>'
    + '<button class="btn ghost small" id="tipBtn">' + I.refresh + ' Outra dica</button></div>';
  const tb = document.getElementById('tipBtn');
  if(tb) tb.onclick = () => { tipIdx = (tipIdx + 1) % TIPS.length; document.getElementById('tipText').textContent = TIPS[tipIdx]; if(window.sfxClick) sfxClick(); };
}

// Expor no window
window.WORLDS = WORLDS;
window.worldOf = worldOf;
window.renderTrilha = renderTrilha;
window.renderSidebar = renderSidebar;

window.applyMinimized = applyMinimized;
window.renderTrilha = renderTrilha;
window.renderSidebar = renderSidebar;
window.worldOf = worldOf;
window.WORLDS = WORLDS;
