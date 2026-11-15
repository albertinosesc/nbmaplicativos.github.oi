// ===== Biblioteca: cards, preview, view toggle =====
import { S, save, withStatus, todayStr } from './state.js';
import { DB } from './firebase.js';
import { openModal, closeModal, toast, esc } from './ui.js';
import { I } from './icons.js';
import { songMeta, extractNotes, getTempo } from './songs.js';
import { DIFF_LABEL } from './config.js';

export function musicasVisiveis(){
  const vis = new Set();
  const c = window.contaAtual ? contaAtual() : null;
  if(c && Array.isArray(c.compras)) c.compras.forEach(id => vis.add(id));
  const j = window.jogadorAtual ? jogadorAtual() : { tipo: 'visitante', dados: null };
  if(j.tipo === 'alunoSessao'){
    const alunoId = j.dados.id, turmaId = j.dados.turmaId;
    DB.compras.forEach(cp => {
      if(cp.turmaId !== turmaId) return;
      if(cp.destino === 'todos') vis.add(cp.musicaId);
      else if(Array.isArray(cp.alunoIds) && cp.alunoIds.includes(alunoId)) vis.add(cp.musicaId);
    });
  }
  if(j.tipo === 'conta' && j.dados.turmaId){
    const alunoId = j.dados.id, turmaId = j.dados.turmaId;
    DB.compras.forEach(cp => {
      if(cp.turmaId !== turmaId) return;
      if(cp.destino === 'todos') vis.add(cp.musicaId);
      else if(Array.isArray(cp.alunoIds) && cp.alunoIds.includes(alunoId)) vis.add(cp.musicaId);
    });
  }
  return vis;
}

export function jogadorTemMusica(id){ if(!id) return false; return musicasVisiveis().has(id); }

export function cardHtml(s){
  const m = songMeta(s), c = S.completed[s.id], tier = 't' + s.difficulty;
  const status = s.done
    ? '<span class="status-badge done">' + I.check + ' Concluída</span>'
    : s.current
      ? '<span class="status-badge current">' + I.spark + ' Disponível</span>'
      : '<span class="status-badge">' + I.lock + ' Bloqueada</span>';
  return '<article class="song-card ' + tier + '">'
    + '<div class="card-badges"><span class="diff-badge ' + tier + '">' + DIFF_LABEL[s.difficulty] + '</span>' + status + '</div>'
    + '<h3>' + esc(s.title) + '</h3><p class="composer">' + esc(s.composer || '') + '</p>'
    + '<div class="chiprow mini"><span>♪ ' + m.count + ' notas</span><span>Compasso ' + esc(m.meter) + '</span><span>♩=' + m.bpm + '</span></div>'
    + (c ? '<div class="card-stars">' + '★'.repeat(c.stars) + '☆'.repeat(3 - c.stars) + '<small>precisão ' + c.acc + '%</small></div>' : '')
    + '<div class="card-actions">'
    + '<button class="btn ' + (s.unlocked ? 'green' : 'ghost') + ' small" data-action="practice" data-id="' + s.id + '"' + (s.unlocked ? '' : ' disabled') + '>' + I.play + ' ' + (s.done ? 'Revisar' : 'Praticar') + '</button>'
    + '<button class="btn blue small" data-action="preview" data-id="' + s.id + '">' + I.note + ' Ver/Ouvir</button>'
    + (s.seed ? '' : '<button class="btn ghost small icon-only danger" data-action="delete" data-id="' + s.id + '">' + I.trash + '</button>')
    + '</div></article>';
}

export function renderBiblioteca(){
  const grid = document.getElementById('songGrid');
  if(!grid) return;
  const modo = (S.libView === 'grid') ? 'grid' : 'list';
  grid.classList.toggle('mode-list', modo === 'list');
  grid.classList.toggle('mode-grid', modo === 'grid');
  atualizarBotoesView(modo);

  const list = withStatus(window.SEEDS);
  const q = (document.getElementById('libSearch').value || '').toLowerCase().trim();
  const tab = (document.getElementById('libTab') && document.getElementById('libTab').value) || 'todas';
  const fd = document.getElementById('libDiff').value;
  const sort = document.getElementById('libSort').value;
  const vis = musicasVisiveis();

  let f = list.filter(s => {
    if(tab === 'compradas' && !vis.has(s.id)) return false;
    if(tab === 'trilha' && vis.has(s.id)) return false;
    if(fd !== 'all' && s.difficulty !== +fd) return false;
    if(q && !(s.title + ' ' + (s.composer || '')).toLowerCase().includes(q)) return false;
    return true;
  });

  const rank = s => s.current ? 0 : s.done ? 1 : 2;
  if(sort === 'diff-desc') f.sort((a,b) => b.difficulty - a.difficulty || a.idx - b.idx);
  else if(sort === 'title') f.sort((a,b) => a.title.localeCompare(b.title, 'pt'));
  else if(sort === 'status') f.sort((a,b) => rank(a) - rank(b) || a.idx - b.idx);
  else f.sort((a,b) => a.idx - b.idx);

  grid.innerHTML = f.map(cardHtml).join('') || '<div class="empty-state">Nenhuma música. 🔍</div>';
  const lc = document.getElementById('libCount');
  if(lc) lc.textContent = f.length + ' de ' + list.length;
}

export function atualizarBotoesView(modo){
  const bList = document.getElementById('libViewList');
  const bGrid = document.getElementById('libViewGrid');
  if(bList) bList.setAttribute('aria-pressed', String(modo === 'list'));
  if(bGrid) bGrid.setAttribute('aria-pressed', String(modo === 'grid'));
}

export function setLibView(modo){
  if(modo !== 'list' && modo !== 'grid') modo = 'list';
  S.libView = modo;
  save();
  renderBiblioteca();
  if(window.sfxClick) sfxClick();
}

export function deleteCustom(id){
  const s = S.custom.find(x => x.id === id);
  if(!s) return;
  openModal(
    '<h3 class="modal-title">Excluir música?</h3>'
    + '<p class="modal-sub">“' + esc(s.title) + '” será removida.</p>'
    + '<div class="modal-actions-col" style="margin-top:18px">'
    + '<button class="btn red big" id="mDel">' + I.trash + ' Excluir</button>'
    + '<button class="btn ghost" id="mCancel">Cancelar</button></div>'
  );
  document.getElementById('mDel').onclick = () => {
    S.custom = S.custom.filter(x => x.id !== id);
    delete S.completed[id];
    if(S.ranges) delete S.ranges[id];
    save();
    if(window.metaCache) metaCache.delete(id);
    try{ localStorage.removeItem('clave.songsCache.v5'); }catch(e){}
    closeModal(true);
    renderBiblioteca();
    if(window.renderTrilha) renderTrilha();
    toast('Música excluída.', { type: 'info' });
  };
  document.getElementById('mCancel').onclick = () => closeModal();
}

export function abrirPreview(song, opts){
  opts = opts || {};
  const apenasAmostra = !!opts.amostra;
  const paperId = 'previewPaper';
  openModal(
    '<div class="modal-head"><h3>' + esc(song.title) + '</h3><button class="icon-btn" id="pvClose">' + I.x + '</button></div>'
    + (song.composer ? '<p class="sub" style="text-align:left;margin-top:-6px">' + esc(song.composer) + '</p>' : '')
    + '<div id="' + paperId + '" style="background:var(--paper);border-radius:12px;padding:12px 10px;margin-top:12px;min-height:180px;max-height:50vh;overflow:auto;text-align:left"></div>'
    + (apenasAmostra ? '<p class="sub" style="text-align:left;margin-top:8px;color:var(--ink3)">Prévia gratuita — apenas os primeiros compassos.</p>' : '')
    + '<div class="modal-actions" style="margin-top:14px">'
    + '<button class="btn blue small" id="pvPlay">' + I.play + ' Ouvir</button>'
    + '<button class="btn green small" id="pvPraticar">' + I.note + ' Praticar</button>'
    + '<button class="btn ghost small" id="pvFechar">Fechar</button>'
    + '</div>',
    { onClose: () => { if(window.stopPlayback) stopPlayback(); } }
  );
  if(window.injectIcons) injectIcons();
  const paper = document.getElementById(paperId);
  if(!paper) return;
  if(!window.ABCJS){
    paper.innerHTML = '<div class="paper-error">⚠️ abcjs não carregou.</div>';
    return;
  }
  let abc = song.abc;
  if(apenasAmostra){
    const linhas = abc.split('\n');
    const out = [];
    let contador = 0;
    for(const l of linhas){
      if(/^[A-Za-z]:/.test(l) || !l.trim()){ out.push(l); continue; }
      const partes = l.split('|');
      out.push(partes.slice(0, 3).join('|'));
      contador++;
      if(contador >= 2) break;
    }
    abc = out.join('\n');
  }

  let ex = { events: [], total: 0 };
  let tp = { bpm: 100, q: 0.25 };
  let tentativas = 0;

  function renderizar(){
    tentativas++;
    const wReal = paper.clientWidth;
    if(!wReal || wReal < 50){
      if(tentativas > 25){
        paper.innerHTML = '<div class="paper-error">Não foi possível medir o modal.</div>';
        return;
      }
      setTimeout(renderizar, 60);
      return;
    }
    const w = Math.max(240, Math.floor(wReal - 40));
    paper.innerHTML = '';
    let tunes = null;
    try{
      tunes = ABCJS.renderAbc(paper, abc, {
        staffwidth: w, scale: 1.0, add_classes: true,
        paddingtop: 6, paddingbottom: 10, paddingleft: 4, paddingright: 4,
        wrap: { minSpacing: 1.8, maxSpacing: 2.6, preferredMeasuresPerLine: 4 }
      });
    }catch(err){
      paper.innerHTML = '<div class="paper-error">Erro: ' + esc(err.message) + '</div>';
      return;
    }
    const svgEl = paper.querySelector('svg');
    if(svgEl){
      svgEl.style.transform = 'none';
      svgEl.style.transformOrigin = '0 0';
    }
    const tune = tunes && tunes[0];
    ex = tune ? extractNotes(tune) : { events: [], total: 0 };
    tp = tune ? getTempo(tune) : { bpm: 100, q: 0.25 };
    paper.scrollTop = 0;
    paper.scrollLeft = 0;
  }
  renderizar();
  setTimeout(() => {
    if(!paper.querySelector('svg') && !paper.querySelector('.paper-error')){
      paper.innerHTML = '<div class="paper-error">⚠️ A partitura não carregou.<br>Tente fechar e abrir novamente.</div>';
    }
  }, 1200);

  const btnPlay = document.getElementById('pvPlay');
  if(btnPlay) btnPlay.onclick = () => {
    const spw = 60 / (tp.bpm * tp.q);
    if(window.PB && PB.playing && PB.session && PB.session.owner === 'preview'){ stopPlayback(); return; }
    if(window.startPlayback) startPlayback({ owner: 'preview', events: ex.events, total: ex.total, spw, paper, keys: null, onEnd: () => {} });
  };
  const pvPr = document.getElementById('pvPraticar');
  if(pvPr) pvPr.onclick = () => { if(window.stopPlayback) stopPlayback(); closeModal(true); location.hash = '#/licao/' + song.id; };
  const pvC = document.getElementById('pvClose');
  const pvF = document.getElementById('pvFechar');
  if(pvC) pvC.onclick = () => { if(window.stopPlayback) stopPlayback(); closeModal(); };
  if(pvF) pvF.onclick = () => { if(window.stopPlayback) stopPlayback(); closeModal(); };
}

// Expor no window
window.musicasVisiveis = musicasVisiveis;
window.jogadorTemMusica = jogadorTemMusica;
window.cardHtml = cardHtml;
window.renderBiblioteca = renderBiblioteca;
window.atualizarBotoesView = atualizarBotoesView;
window.setLibView = setLibView;
window.deleteCustom = deleteCustom;
window.abrirPreview = abrirPreview;
