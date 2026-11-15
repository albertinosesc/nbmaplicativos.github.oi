// ===== Todos os event listeners =====
import { S, save } from './state.js';
import { setSound, metToggleSound, metToggleLight } from './audio.js';
import { toast, closeModal } from './ui.js';
import { setLibView, deleteCustom, abrirPreview } from './biblioteca.js';
import { requestExit, toggleListen, initLesson } from './lesson.js';
import { sairSessaoAluno } from './turmas.js';
import { abrirModalConta, abrirModalPro } from './auth.js';
import { enviarComentario } from './comentarios.js';

export function wire(){
  window.addEventListener('hashchange', () => { if(window.route) route(); });

  const soundBtn = document.getElementById('soundBtn');
  if(soundBtn) soundBtn.onclick = () => { setSound(!S.settings.sound); if(window.sfxClick) sfxClick(); };
  ['pointerdown','touchstart','click','keydown'].forEach(evt =>
    document.addEventListener(evt, () => { if(window.unlockAudio) unlockAudio(); }, { passive: true })
  );

  const contaBtn = document.getElementById('contaBtn');
  if(contaBtn) contaBtn.onclick = () => abrirModalConta();

  const topPro = document.getElementById('topProBtn');
  if(topPro) topPro.onclick = () => abrirModalPro();

  ['#navTurmas', '#navLoja'].forEach(sel => {
    const el = document.querySelector(sel);
    if(!el) return;
    el.addEventListener('click', e => {
      if(window.podeAcessarPro && !podeAcessarPro()){
        e.preventDefault();
        e.stopPropagation();
        toast('🔒 Recurso exclusivo do plano Pro.', { type: 'warn', duration: 4500 });
        if(window.sfxWrong) sfxWrong();
        if(window.contaAtual && !contaAtual()) abrirModalConta();
        else abrirModalPro();
      }
    }, true);
  });

  const navToggle = document.getElementById('navToggle');
  const navEl = document.querySelector('.mainnav');
  if(navToggle && navEl){
    navToggle.onclick = () => { navEl.classList.toggle('aberto'); if(window.sfxClick) sfxClick(); };
  }

  const sessaoChip = document.getElementById('sessaoChip');
  if(sessaoChip) sessaoChip.onclick = () => {
    if(window.openModal) openModal(
      '<h3 class="modal-title">Sair da sessão do aluno?</h3>'
      + '<p class="modal-sub">Voltar para a sua conta de professor.</p>'
      + '<div class="modal-actions-col" style="margin-top:18px">'
      + '<button class="btn green big" id="sairOk">Sim, voltar</button>'
      + '<button class="btn ghost" id="sairCancel">Cancelar</button>'
      + '</div>'
    );
    const ok = document.getElementById('sairOk');
    const cancel = document.getElementById('sairCancel');
    if(ok) ok.onclick = () => { closeModal(true); sairSessaoAluno(); };
    if(cancel) cancel.onclick = () => closeModal();
  };

  const worldStack = document.getElementById('worldStack');
  if(worldStack){
    worldStack.addEventListener('click', e => {
      const b = e.target.closest('.w-node');
      if(!b) return;
      const list = window.withStatus ? withStatus(window.SEEDS) : [];
      const s = list.find(x => x.id === b.dataset.id);
      if(!s) return;
      if(s.unlocked){ if(window.sfxClick) sfxClick(); location.hash = '#/licao/' + s.id; }
      else {
        const prev = list[s.idx - 1];
        toast('🔒 Complete “' + (prev ? prev.title : 'a anterior') + '”.', { type: 'warn' });
      }
    });
    worldStack.addEventListener('click', e => {
      const b = e.target.closest('.world-toggle');
      if(!b) return;
      const wId = b.dataset.world;
      const manual = JSON.parse(localStorage.getItem('clave.minimized') || '[]');
      const key = 'open:' + wId;
      const isOpenManually = manual.includes(key);
      if(isOpenManually) manual.splice(manual.indexOf(key), 1);
      else manual.push(key);
      localStorage.setItem('clave.minimized', JSON.stringify(manual));
      if(window.applyMinimized) applyMinimized();
      if(window.sfxClick) sfxClick();
    });
  }

  const backBtn = document.getElementById('backBtn');
  if(backBtn) backBtn.onclick = requestExit;
  const listenBtn = document.getElementById('listenBtn');
  if(listenBtn) listenBtn.onclick = toggleListen;
  const restartBtn = document.getElementById('restartBtn');
  if(restartBtn) restartBtn.onclick = () => { if(window.L){ initLesson(window.L.song); toast('Reiniciada.', { type: 'info' }); } };
  const metBtn = document.getElementById('metronomeBtn');
  if(metBtn) metBtn.onclick = metToggleSound;
  const metLBtn = document.getElementById('metLightBtn');
  if(metLBtn) metLBtn.onclick = metToggleLight;

  const namesSw = document.getElementById('namesSwitch');
  if(namesSw) namesSw.onclick = () => {
    S.settings.names = !S.settings.names; save();
    namesSw.setAttribute('aria-checked', String(S.settings.names));
    const p = document.getElementById('piano');
    if(p) p.classList.toggle('no-names', !S.settings.names);
    if(window.sfxClick) sfxClick();
  };
  const assistSw = document.getElementById('assistSwitch');
  if(assistSw) assistSw.onclick = () => {
    S.settings.assist = !S.settings.assist; save();
    assistSw.setAttribute('aria-checked', String(S.settings.assist));
    if(window.applyPracticeHighlight) applyPracticeHighlight();
    if(window.updateLessonUI) updateLessonUI();
    if(window.sfxClick) sfxClick();
  };
  const tipClose = document.getElementById('tipClose');
  if(tipClose) tipClose.onclick = () => {
    S.settings.tipSeen = true; save();
    const lt = document.getElementById('lessonTip');
    if(lt) lt.style.display = 'none';
  };

  const pianoScroll = document.getElementById('pianoScroll');
  if(pianoScroll) pianoScroll.addEventListener('pointerdown', e => {
    const k = e.target.closest('.key'); if(!k) return;
    e.preventDefault();
    if(window.pressKey) pressKey(+k.dataset.midi, k);
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      if(document.querySelector('#modalRoot .modal-backdrop')) closeModal();
      else if(window.getCurrentView && getCurrentView() === 'licao') requestExit();
      return;
    }
    if((window.getCurrentView && getCurrentView() !== 'licao') || e.repeat) return;
    if(document.querySelector('#modalRoot .modal-backdrop')) return;
    const ae = document.activeElement;
    if(ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT' || ae.isContentEditable)) return;
    if(e.code === 'Space'){ e.preventDefault(); toggleListen(); return; }
    const midi = window.KEYMAP && KEYMAP.map[e.code];
    if(midi == null || !window.L) return;
    e.preventDefault();
    const k = window.L.keys.get(midi);
    if(k && window.pressKey) pressKey(midi, k);
  });

  const limparBtn = document.getElementById('limparCacheBtn');
  if(limparBtn) limparBtn.onclick = () => {
    if(window.openModal) openModal(
      '<div class="modal-head"><h3>Limpar dados do navegador?</h3><button class="icon-btn" id="mClose">✕</button></div>'
      + '<p class="modal-sub" style="text-align:left">Remove do navegador atual. Progresso na nuvem não é afetado.</p>'
      + '<div class="modal-actions">'
      + '<button class="btn red" id="limparOk">Sim, limpar</button>'
      + '<button class="btn ghost" id="limparCancel">Cancelar</button>'
      + '</div>'
    );
    const close = document.getElementById('mClose');
    const cancel = document.getElementById('limparCancel');
    if(close) close.onclick = () => closeModal();
    if(cancel) cancel.onclick = () => closeModal();
    const ok = document.getElementById('limparOk');
    if(ok) ok.onclick = async () => {
      try{
        localStorage.clear(); sessionStorage.clear();
        if(window.caches && caches.keys){ const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); }
        closeModal(true);
        toast('Limpando…', { type: 'success' });
        setTimeout(() => { location.href = location.pathname + location.search; }, 600);
      }catch(e){ toast('Erro: ' + e.message, { type: 'error' }); }
    };
  };

  const hudStreakEl = document.getElementById('hudStreak');
  const hudStreakChip = hudStreakEl && hudStreakEl.closest('.chip');
  if(hudStreakChip){
    hudStreakChip.style.cursor = 'pointer';
    hudStreakChip.setAttribute('role', 'button');
    hudStreakChip.setAttribute('tabindex', '0');
    hudStreakChip.onclick = () => { if(window.abrirCalendarioOfensiva) abrirCalendarioOfensiva(); };
  }

  const libSearch = document.getElementById('libSearch');
  if(libSearch) libSearch.addEventListener('input', () => { if(window.renderBiblioteca) renderBiblioteca(); });
  const libTab = document.getElementById('libTab');
  if(libTab) libTab.addEventListener('change', () => { if(window.renderBiblioteca) renderBiblioteca(); });
  const libDiff = document.getElementById('libDiff');
  if(libDiff) libDiff.addEventListener('change', () => { if(window.renderBiblioteca) renderBiblioteca(); });
  const libSort = document.getElementById('libSort');
  if(libSort) libSort.addEventListener('change', () => { if(window.renderBiblioteca) renderBiblioteca(); });

  const libViewList = document.getElementById('libViewList');
  const libViewGrid = document.getElementById('libViewGrid');
  if(libViewList) libViewList.addEventListener('click', () => setLibView('list'));
  if(libViewGrid) libViewGrid.addEventListener('click', () => setLibView('grid'));

  const songGrid = document.getElementById('songGrid');
  if(songGrid) songGrid.addEventListener('click', e => {
    const b = e.target.closest('[data-action]');
    if(!b || b.disabled) return;
    const id = b.dataset.id, act = b.dataset.action;
    if(window.sfxClick) sfxClick();
    if(act === 'practice') location.hash = '#/licao/' + id;
    else if(act === 'delete') deleteCustom(id);
    else if(act === 'preview'){
      const list = window.withStatus ? withStatus(window.SEEDS) : [];
      const song = list.find(s => s.id === id);
      if(song) abrirPreview(song, { amostra: false });
    }
  });

  const novaTurmaBtn = document.getElementById('novaTurmaBtn');
  if(novaTurmaBtn) novaTurmaBtn.onclick = () => {
    if(window.isProfessor && !isProfessor()){ toast('🔒 Recurso Pro.', { type: 'warn' }); return; }
    if(window.openModal) openModal(
      '<div class="modal-head"><h3>Nova turma</h3><button class="icon-btn" id="mClose">✕</button></div>'
      + '<div style="text-align:left;margin-top:8px;display:flex;flex-direction:column;gap:10px">'
      + '<label>Nome da turma</label><input id="mtNome" type="text" placeholder="Ex.: 6º Ano A" style="width:100%">'
      + '</div>'
      + '<div class="modal-actions"><button class="btn green" id="mtOk">Criar</button><button class="btn ghost" id="mtCancel">Cancelar</button></div>'
    );
    const close = document.getElementById('mClose');
    const cancel = document.getElementById('mtCancel');
    if(close) close.onclick = () => closeModal();
    if(cancel) cancel.onclick = () => closeModal();
    const ok = document.getElementById('mtOk');
    if(ok) ok.onclick = async () => {
      const nome = document.getElementById('mtNome').value.trim();
      if(!nome){ toast('Digite o nome.', { type: 'warn' }); return; }
      const codigo = window.gerarCodigoTurma ? gerarCodigoTurma() : 'ABC123';
      const id = 't' + Date.now().toString(36);
      if(window.DB){
        DB.turmas.push({ id, nome, codigo, professorId: S.conta, criadaEm: todayStr() });
        try{
          await dbSave('nova turma');
          closeModal(true);
          toast('Turma criada! Código: ' + codigo, { type: 'success', duration: 6000 });
          if(window.renderTurmas) renderTurmas();
        }catch(e){ toast('Erro: ' + e.message, { type: 'error' }); }
      }
    };
  };

  const turmasList = document.getElementById('turmasList');
  if(turmasList) turmasList.addEventListener('click', async e => {
    const cod = e.target.closest('[data-copy]');
    if(cod){
      if(window.sfxClick) sfxClick();
      const valor = cod.dataset.copy;
      try{
        if(navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) await navigator.clipboard.writeText(valor);
        else { const ta = document.createElement('textarea'); ta.value = valor; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
        toast('Código copiado!', { type: 'success' });
      }catch(err){ toast('Copie manualmente: ' + valor, { type: 'warn' }); }
      return;
    }
    const btnAdd = e.target.closest('[data-add-aluno]');
    if(btnAdd){ if(window.sfxClick) sfxClick(); if(window.abrirModalAluno) abrirModalAluno(btnAdd.dataset.addAluno); return; }
    const btnDelT = e.target.closest('[data-del-turma]');
    if(btnDelT){ if(window.sfxClick) sfxClick(); if(window.excluirTurma) excluirTurma(btnDelT.dataset.delTurma); return; }
    const btnDelA = e.target.closest('[data-del-aluno]');
    if(btnDelA){ if(window.sfxClick) sfxClick(); if(window.excluirAluno) excluirAluno(btnDelA.dataset.delAluno); return; }
    const entrar = e.target.closest('[data-entrar]');
    if(entrar){ if(window.sfxClick) sfxClick(); if(window.entrarComoSessaoAluno) entrarComoSessaoAluno(entrar.dataset.entrar); return; }
  });

  const cmtBtn = document.getElementById('cmtEnviar');
  if(cmtBtn) cmtBtn.onclick = () => { if(window.enviarComentario) enviarComentario(); };

  let rzT = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rzT);
    rzT = setTimeout(() => {
      const cv = window.getCurrentView && getCurrentView();
      if(cv === 'licao' && window.L){
        if(window.PB && PB.playing) stopPlayback();
        if(window.renderSheet) renderSheet();
        if(window.buildPianoFromRange) buildPianoFromRange(window.L.song);
      }
      if(cv === 'trilha' && window.renderTrilha) renderTrilha();
    }, 240);
  });
}
