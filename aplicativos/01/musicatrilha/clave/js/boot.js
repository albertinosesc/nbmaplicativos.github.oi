// ===== Boot — ponto de entrada =====
import { S, save, touchToday, applyPlanClasses, effStreak, withStatus } from './state.js';
import { DB, dbLoad } from './firebase.js';
import { loadRemoteSongs } from './songs.js';
import { updateSoundBtn, metSetButton } from './audio.js';
import { injectIcons, mascotSVG, I } from './icons.js';
import { renderTrilha, renderSidebar, worldOf } from './trilha.js';
import { renderBiblioteca, abrirPreview } from './biblioteca.js';
import { renderVideos } from './videos.js';
import { renderTurmas } from './turmas.js';
import { renderLoja } from './loja.js';
import { route } from './router.js';
import { wire } from './wire.js';
import { openModal, closeModal, toast, esc } from './ui.js';
import { initLesson } from './lesson.js';
import { abrirModalConta, abrirModalPro, abrirLoginConta, abrirLoginTurma } from './auth.js';

// ⚠️ Expor TODAS as funções no window (para o código legado)
window.renderTrilha = renderTrilha;
window.renderSidebar = renderSidebar;
window.renderBiblioteca = renderBiblioteca;
window.renderVideos = renderVideos;
window.renderTurmas = renderTurmas;
window.renderLoja = renderLoja;
window.abrirPreview = abrirPreview;
window.initLesson = initLesson;
window.abrirModalConta = abrirModalConta;
window.abrirModalPro = abrirModalPro;
window.abrirLoginConta = abrirLoginConta;
window.abrirLoginTurma = abrirLoginTurma;
window.withStatus = withStatus;
window.worldOf = worldOf;
window.injectIcons = injectIcons;
window.openModal = openModal;
window.closeModal = closeModal;
window.toast = toast;
window.esc = esc;

// ===== HUD =====
function updateHUD(){
  const j = window.jogadorAtual ? jogadorAtual() : { tipo: 'visitante', dados: null };
  const dados = j.dados;
  const s = document.getElementById('hudStreak');
  if(s) s.textContent = dados ? (dados.ofensiva || 0) : effStreak();
  const x = document.getElementById('hudXp');
  if(x) x.textContent = dados ? (dados.xp || 0) : S.xp;
  const g = document.getElementById('hudGems');
  if(g) g.textContent = S.gems;
  const ha = document.getElementById('hudConta');
  if(ha){
    if(dados){
      ha.style.display = 'inline-flex';
      ha.querySelector('.hud-avatar').textContent = j.tipo === 'alunoSessao' ? '🎓' : (dados.pro ? '👨‍🏫' : '🎹');
      ha.querySelector('.hud-nome').textContent = dados.nome;
      ha.title = dados.nome;
    } else {
      ha.style.display = 'none';
    }
  }
  const sess = document.getElementById('sessaoChip');
  if(sess){
    const a = window.alunoSessao ? alunoSessao() : null;
    if(a){
      sess.style.display = 'inline-flex';
      const sn = document.getElementById('sessaoNome');
      if(sn) sn.textContent = a.nome;
    } else {
      sess.style.display = 'none';
    }
  }
  const tp = document.getElementById('topProBtn');
  if(tp){
    const c = window.contaAtual ? contaAtual() : null;
    tp.style.display = (c && c.pro) ? 'none' : 'inline-flex';
  }
  const cb = document.getElementById('contaBtn');
  if(cb) cb.classList.toggle('active-met', !!dados);
}
window.updateHUD = updateHUD;

// ===== Calendário =====
function abrirCalendarioOfensiva(){
  let ym = new Date();
  const dow = ['D','S','T','Q','Q','S','S'];

  function getDiasEstudados(){
    const j = window.jogadorAtual ? jogadorAtual() : { tipo: 'visitante', dados: null };
    if(j.tipo === 'alunoSessao' || j.tipo === 'conta') return j.dados.diasEstudados || {};
    return S.diasEstudados || {};
  }

  function todayStrLocal(){
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function render(){
    const dias = getDiasEstudados();
    const y = ym.getFullYear(), m = ym.getMonth();
    const primeiro = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0).getDate();
    const startDow = primeiro.getDay();
    const hoje = todayStrLocal();
    let cells = '';
    const prevLast = new Date(y, m, 0).getDate();
    for(let i = startDow - 1; i >= 0; i--) cells += '<div class="cal-day other">' + (prevLast - i) + '</div>';
    for(let d = 1; d <= lastDay; d++){
      const iso = y + '-' + String(m + 1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      const isFuture = iso > hoje;
      const isToday = iso === hoje;
      let cls = 'cal-day';
      if(isFuture) cls += ' future';
      else if(dias[iso]) cls += ' studied';
      else if(iso < hoje) cls += ' missed';
      if(isToday) cls += ' today';
      cells += '<div class="' + cls + '" title="' + iso + '">' + d + '</div>';
    }
    const totalCells = startDow + lastDay;
    const rest = (7 - (totalCells % 7)) % 7;
    for(let i = 1; i <= rest; i++) cells += '<div class="cal-day other">' + i + '</div>';
    const nomeMes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][m];
    return (
      '<div class="modal-head"><h3>Ofensiva</h3><button class="icon-btn" id="mClose">✕</button></div>'
      + '<div class="cal-head"><button class="icon-btn" id="calPrev">‹</button><div class="cal-title">' + nomeMes + ' ' + y + '</div><button class="icon-btn" id="calNext">›</button></div>'
      + '<div class="cal-grid">' + dow.map(d => '<div class="cal-dow">' + d + '</div>').join('') + cells + '</div>'
      + '<div class="cal-legend"><span><i class="lg-s"></i> Estudou</span><span><i class="lg-m"></i> Não estudou</span><span><i class="lg-n"></i> Futuro</span></div>'
    );
  }

  openModal(render(), { onClose: () => {} });

  function refresh(){
    const bd = document.querySelector('#modalRoot .modal');
    if(!bd) return;
    bd.innerHTML = render();
    bind();
  }

  function bind(){
    const cl = document.getElementById('mClose');
    if(cl) cl.onclick = () => closeModal();
    const pv = document.getElementById('calPrev'), nx = document.getElementById('calNext');
    if(pv) pv.onclick = () => { ym = new Date(ym.getFullYear(), ym.getMonth() - 1, 1); refresh(); };
    if(nx) nx.onclick = () => { ym = new Date(ym.getFullYear(), ym.getMonth() + 1, 1); refresh(); };
  }

  bind();
}
window.abrirCalendarioOfensiva = abrirCalendarioOfensiva;

// ===== Notas de fundo =====
function makeBgNotes(){
  const glyphs = ['♪','♫','♬','♩'];
  const host = document.getElementById('bgNotes');
  if(!host) return;
  let html = '';
  for(let i = 0; i < 11; i++){
    const left = Math.random() * 96;
    const fs = 20 + Math.random() * 42;
    const dur = 16 + Math.random() * 20;
    const delay = -Math.random() * 30;
    html += '<span style="left:' + left + '%;font-size:' + fs + 'px;animation-duration:' + dur + 's;animation-delay:' + delay + 's">' + glyphs[i % 4] + '</span>';
  }
  host.innerHTML = html;
}

// ===== Changelog =====
async function renderChangelog(host){
  if(!host) return;
  host.innerHTML = '<div style="color:var(--ink3);font-size:13px;font-weight:700">Carregando…</div>';
  try{
    const { CHANGELOG_URL } = await import('./config.js');
    const res = await fetch(CHANGELOG_URL, { cache: 'no-cache' });
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const txt = await res.text();
    const linhas = txt.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 6);
    host.innerHTML = linhas.map(l => {
      const m = l.match(/^([0-9]{4}-[0-9]{2}-[0-9]{2})[:\s|-]+(.+)$/);
      if(m) return '<div class="changelog-row"><b class="cl-data">' + esc(m[1]) + '</b><span class="cl-desc">' + esc(m[2]) + '</span></div>';
      return '<div class="changelog-row"><span class="cl-desc">' + esc(l) + '</span></div>';
    }).join('') || '<div style="color:var(--ink3);font-size:13px">Sem atualizações.</div>';
  }catch(e){
    host.innerHTML = '<div style="color:var(--ink3);font-size:13px">Não foi possível carregar as atualizações.</div>';
  }
}

// ===== Boas-vindas =====
function abrirBoasVindas(){
  openModal(
    '<div class="mascot-wrap mascot">' + mascotSVG('welcome') + '</div>'
    + '<h3 class="modal-title">Bem-vindo ao Clave!</h3>'
    + '<p class="modal-sub">Aprenda música tocando. 🎹<br>Como você quer entrar?</p>'
    + '<div class="modal-actions-col" style="margin-top:18px">'
    + '<button class="btn green big" id="bemCriar">' + I.plus + ' Criar conta grátis</button>'
    + '<button class="btn blue big" id="bemTurma">' + I.trophy + ' Entrar com turma</button>'
    + '<button class="btn ghost" id="bemVisitante">Continuar como visitante</button>'
    + '</div>'
    + '<div style="margin-top:22px;text-align:left">'
    +   '<div style="font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--teal);margin-bottom:8px">📢 Atualizações recentes</div>'
    +   '<div id="welcomeChangelog" class="changelog"></div>'
    + '</div>'
  );
  document.getElementById('bemCriar').onclick = () => { closeModal(true); if(window.abrirLoginConta) abrirLoginConta(); };
  document.getElementById('bemTurma').onclick = () => { closeModal(true); if(window.abrirLoginTurma) abrirLoginTurma(); };
  document.getElementById('bemVisitante').onclick = () => { closeModal(true); };
  renderChangelog(document.getElementById('welcomeChangelog'));
}

// ===== Boot =====
async function boot(){
  injectIcons();
  applyPlanClasses();
  makeBgNotes();
  touchToday();
  save();
  if(window.metSetButton) metSetButton();
  if(window.updateSoundBtn) updateSoundBtn();
  wire();

  const ua = navigator.userAgent || '';
  const isPS4 = /PlayStation/i.test(ua) && !/PlayStation 5/i.test(ua);
  const fewCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
  if(isPS4 || fewCores) document.documentElement.classList.add('lite-mode');

  if(!window.ABCJS) await new Promise(r => window.addEventListener('load', r, { once: true }));

  try {
    await window.FB.init();
  } catch(e) {
    console.warn('FB init:', e);
  }

  if(window.FirebaseService && window.FirebaseService.auth){
    const { auth, db, doc, getDoc } = window.FirebaseService;
    auth.onAuthStateChanged(async (user) => {
      if(!user){
        if(S.conta){
          S.conta = null;
          S.alunoSessao = null;
          S.xp = 0;
          S.compras = [];
          S.completed = {};
          S.streak = 0;
          S.lastDay = null;
          S.diasEstudados = {};
          S.custom = [];
          localStorage.removeItem('clave.isPro');
          save();
          applyPlanClasses();
          updateHUD();
          if(window.renderSidebar) renderSidebar();
          if(window.renderTrilha) renderTrilha();
        }
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'clave', 'dados'));
        const dados = snap.exists() ? snap.data() : null;
        const conta = dados && dados.contasGlobais && dados.contasGlobais[user.uid];
        if(!conta) return;
        DB.contasGlobais = dados.contasGlobais;
        S.conta = user.uid;
        S.alunoSessao = null;
        S.xp = conta.xp || 0;
        S.compras = Array.isArray(conta.compras) ? [...conta.compras] : [];
        S.completed = { ...(conta.musicasConcluidas || {}) };
        S.streak = conta.ofensiva || 0;
        S.lastDay = conta.ultimoAcesso || null;
        S.diasEstudados = { ...(conta.diasEstudados || {}) };
        S.custom = S.custom.filter(s => !s.comprada || S.compras.includes(s.id));
        if(conta.pro) localStorage.setItem('clave.isPro', 'true');
        else localStorage.removeItem('clave.isPro');
        save();
        applyPlanClasses();
        updateHUD();
        if(window.renderSidebar) renderSidebar();
        if(window.renderTrilha) renderTrilha();
      } catch(e) {
        console.warn('onAuthStateChanged:', e);
      }
    });
  }

  try { await loadRemoteSongs(); } catch(e) { console.warn('remote:', e); }
  try { await dbLoad(); } catch(e) { console.warn('dbLoad:', e); }

  // Renderiza a trilha depois de carregar as músicas
  if(window.renderTrilha) renderTrilha();
  if(window.renderSidebar) renderSidebar();

  await route();

  if(!S.conta && !S.alunoSessao) abrirBoasVindas();
}

boot().catch(e => console.error('Boot error:', e));
