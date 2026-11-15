// ===== Loja: compras, PIX, para turma =====
import { S, save, todayStr } from './state.js';
import { DB, dbLoad, dbSave, scheduleDbSave } from './firebase.js';
import { openModal, closeModal, toast, esc } from './ui.js';
import { I } from './icons.js';
import { PIX_KEY } from './config.js';

export const LOJA = [
  { id:'loja-parabens',   title:'Parabéns pra Você', composer:'Tradicional', preco: 1.99,
    abc:"X:1\nT:Parabéns pra Você\nM:3/4\nL:1/4\nQ:100\nK:C\nG G A G c B | G G A G d c |]" },
  { id:'loja-hino',       title:'Hino da Alegria',   composer:'Beethoven',   preco: 1.99,
    abc:"X:1\nT:Hino da Alegria\nM:4/4\nL:1/4\nQ:100\nK:C\nE E F G | G F E D | C C D E | E D D2 |]" },
  { id:'loja-cirandinha', title:'Ciranda Cirandinha',composer:'Tradicional', preco: 1.99,
    abc:"X:1\nT:Ciranda Cirandinha\nM:4/4\nL:1/4\nQ:90\nK:C\nG G A A | G G E2 | G G A A | G G E2 |]" },
  { id:'loja-peixinho',   title:'Peixinhos do Mar',  composer:'Tradicional', preco: 1.99,
    abc:"X:1\nT:Peixinhos do Mar\nM:4/4\nL:1/4\nQ:100\nK:G\nG A B c | d d B2 | G A B c | d d B2 |]" }
];

export function renderLoja(){
  const grid = document.getElementById('lojaGrid');
  if(!grid) return;
  if(!window.podeAcessarPro || !podeAcessarPro()){
    grid.innerHTML = '<div class="empty-state">🔒 Loja exclusiva do plano Pro.<br><br><button class="btn gold" id="lojaProBtn">' + I.spark + ' Ativar Pro</button></div>';
    const b = document.getElementById('lojaProBtn');
    if(b) b.onclick = () => { if(!window.contaAtual || !contaAtual()) abrirModalConta(); else abrirModalPro(); };
    return;
  }
  const ehProf = window.isProfessor ? isProfessor() : false;
  const minhasTurmas = ehProf ? DB.turmas.filter(t => t.professorId === S.conta) : [];
  grid.innerHTML = LOJA.map(item => {
    const comprada = window.jogadorTemMusica ? jogadorTemMusica(item.id) : false;
    const precoTxt = 'R$ ' + item.preco.toFixed(2).replace('.', ',');
    return '<article class="song-card t1">'
      + '<div class="card-badges"><span class="diff-badge t1">Avulsa</span>'
      + (comprada ? '<span class="preco-tag comprada"><i class="icw" data-icon="check"></i> Liberada</span>' : '<span class="preco-tag">' + precoTxt + '</span>')
      + '</div>'
      + '<h3>' + esc(item.title) + '</h3>'
      + '<p class="composer">' + esc(item.composer) + '</p>'
      + '<div class="card-actions">'
      + (comprada
          ? '<button class="btn green small" data-loja-action="praticar" data-id="' + item.id + '">' + I.play + ' Tocar</button>'
          : '<button class="btn gold small" data-loja-action="comprar" data-id="' + item.id + '">' + I.gem + ' Comprar</button>')
      + '<button class="btn blue small" data-loja-action="preview" data-id="' + item.id + '">' + I.note + ' Prévia</button>'
      + (ehProf && minhasTurmas.length
          ? '<button class="btn blue small" data-loja-action="turma" data-id="' + item.id + '">' + I.trophy + ' Para a turma</button>'
          : '')
      + '</div></article>';
  }).join('');
  if(window.injectIcons) injectIcons();
  grid.onclick = e => {
    const b = e.target.closest('[data-loja-action]');
    if(!b) return;
    const id = b.dataset.id, act = b.dataset.lojaAction;
    const item = LOJA.find(x => x.id === id);
    if(!item) return;
    if(window.sfxClick) sfxClick();
    if(act === 'comprar') abrirModalCompra(item);
    else if(act === 'praticar') abrirPraticaLoja(item);
    else if(act === 'turma') abrirModalCompraTurma(item);
    else if(act === 'preview') abrirPreview({ id: item.id, title: item.title, composer: item.composer, difficulty: item.difficulty || 1, abc: item.abc }, { amostra: true });
  };
}

export function abrirModalCompra(item){
  const c = window.contaAtual ? contaAtual() : null;
  if(!c){
    openModal(
      '<div class="modal-head"><h3>' + esc(item.title) + '</h3><button class="icon-btn" id="mClose">' + I.x + '</button></div>'
      + '<p class="modal-sub" style="text-align:left">Para comprar, entre ou crie uma conta.</p>'
      + '<div class="modal-actions"><button class="btn green" id="compraConta">' + I.user + ' Entrar / Criar conta</button>'
      + '<button class="btn ghost" id="compraCancel">Cancelar</button></div>'
    );
    document.getElementById('mClose').onclick = document.getElementById('compraCancel').onclick = () => closeModal();
    document.getElementById('compraConta').onclick = () => { closeModal(true); if(window.abrirModalConta) abrirModalConta(); };
    return;
  }
  const precoTxt = 'R$ ' + item.preco.toFixed(2).replace('.', ',');
  openModal(
    '<div class="modal-head"><h3>' + esc(item.title) + '</h3><button class="icon-btn" id="mClose">' + I.x + '</button></div>'
    + '<p class="modal-sub">Compre esta música por <b>' + precoTxt + '</b> e toque quando quiser.</p>'
    + '<div style="margin-top:14px;padding:12px 14px;background:#221040;border:1px solid var(--line);border-radius:12px;text-align:center">'
    + '<div style="font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:var(--teal);margin-bottom:8px">Pague com QR Code PIX</div>'
    + '<img src="qrcode-pix.png" alt="QR Code PIX" style="width:180px;height:180px;display:block;margin:0 auto;border-radius:8px;background:#fff;padding:6px">'
    + '<div style="display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:10px">'
    + '<code style="font-size:13px;font-weight:700;color:var(--ink2);word-break:break-all">' + PIX_KEY + '</code>'
    + '<button class="btn green small" id="pixLojaCopy" type="button">' + I.copy + '<span>Copiar</span></button>'
    + '</div></div>'
    + '<div class="modal-actions" style="margin-top:16px">'
    + '<a class="btn green" href="https://wa.me/5571986797547?text=' + encodeURIComponent('Olá! Paguei R$ ' + item.preco.toFixed(2).replace('.', ',') + ' pela música "' + item.title + '". Meu nome: ' + c.nome) + '" target="_blank" rel="noopener">' + I.play + ' Enviar comprovante</a>'
    + '<button class="btn gold" id="compraCheck">' + I.refresh + ' Já paguei</button>'
    + '<button class="btn ghost" id="compraCancel">Fechar</button>'
    + '</div>'
  );
  document.getElementById('mClose').onclick = document.getElementById('compraCancel').onclick = () => closeModal();
  const copyBtn = document.getElementById('pixLojaCopy');
  if(copyBtn) copyBtn.onclick = async () => {
    try{
      if(navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) await navigator.clipboard.writeText(PIX_KEY);
      else { const ta = document.createElement('textarea'); ta.value = PIX_KEY; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      toast('Chave PIX copiada!', { type: 'success' });
    }catch(e){ toast('Copie manualmente.', { type: 'warn' }); }
  };
  document.getElementById('compraCheck').onclick = async () => {
    const btn = document.getElementById('compraCheck');
    btn.disabled = true;
    btn.innerHTML = I.refresh + ' Verificando...';
    try{
      await dbLoad();
      const c2 = window.contaAtual ? contaAtual() : null;
      const tem = (c2 && Array.isArray(c2.compras) && c2.compras.includes(item.id));
      if(tem){
        if(!S.custom.some(s => s.id === item.id)) S.custom.push({ id: item.id, title: item.title, composer: item.composer, difficulty: 1, abc: item.abc, order: 500 + S.custom.length, seed: false, comprada: true });
        save();
        scheduleDbSave('compra ' + item.title);
        closeModal(true);
        toast('“' + esc(item.title) + '” liberada! 🎉', { type: 'success' });
        if(window.renderLoja) renderLoja();
        if(window.renderBiblioteca) renderBiblioteca();
      } else {
        toast('Pagamento ainda não confirmado.', { type: 'warn', duration: 5000 });
        btn.disabled = false;
        btn.innerHTML = I.refresh + ' Já paguei';
      }
    }catch(e){
      toast('Erro: ' + e.message, { type: 'error' });
      btn.disabled = false;
      btn.innerHTML = I.refresh + ' Já paguei';
    }
  };
}

export function abrirModalCompraTurma(item){
  const c = window.contaAtual ? contaAtual() : null;
  if(!c || !window.isProfessor || !isProfessor()){ toast('Só o professor Pro pode comprar para a turma.', { type: 'warn' }); return; }
  const minhasTurmas = DB.turmas.filter(t => t.professorId === S.conta);
  if(!minhasTurmas.length){ toast('Você não tem turmas.', { type: 'warn' }); return; }
  const turmaSel = minhasTurmas[0];
  const alunos = Object.values(DB.alunos).filter(a => a.turmaId === turmaSel.id);
  const turmaOpts = minhasTurmas.map(t => '<option value="' + t.id + '">' + esc(t.nome) + '</option>').join('');
  const alunoChecks = alunos.map(a => '<label class="checkline"><input type="checkbox" class="aluno-chk" value="' + a.id + '"> ' + esc(a.nome) + '</label>').join('') || '<div class="turma-empty">Nenhum aluno nesta turma.</div>';
  openModal(
    '<div class="modal-head"><h3>' + esc(item.title) + '</h3><button class="icon-btn" id="mClose">' + I.x + '</button></div>'
    + '<p class="modal-sub" style="text-align:left">Escolha para quem liberar esta música.</p>'
    + '<div style="text-align:left;margin-top:12px">'
    +   '<label>Turma</label>'
    +   '<select id="ctTurma" style="width:100%;margin-bottom:10px">' + turmaOpts + '</select>'
    +   '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">'
    +     '<button class="btn blue small" id="ctTodos">' + I.check + ' Todos os alunos</button>'
    +     '<button class="btn ghost small" id="ctLimpar">Limpar seleção</button>'
    +   '</div>'
    +   '<div style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow:auto" id="ctAlunos">' + alunoChecks + '</div>'
    + '</div>'
    + '<div class="modal-actions">'
    +   '<a class="btn green" href="https://wa.me/5571986797547?text=' + encodeURIComponent('Olá! Quero comprar a música "' + item.title + '" para a turma.') + '" target="_blank" rel="noopener">' + I.play + ' Enviar comprovante</a>'
    +   '<button class="btn gold" id="ctOk">' + I.check + ' Registrar compra</button>'
    +   '<button class="btn ghost" id="ctCancel">Cancelar</button>'
    + '</div>'
  );
  document.getElementById('mClose').onclick = document.getElementById('ctCancel').onclick = () => closeModal();
  document.getElementById('ctTodos').onclick = () => { document.querySelectorAll('#ctAlunos .aluno-chk').forEach(cb => cb.checked = true); };
  document.getElementById('ctLimpar').onclick = () => { document.querySelectorAll('#ctAlunos .aluno-chk').forEach(cb => cb.checked = false); };
  document.getElementById('ctTurma').onchange = () => {
    const t = minhasTurmas.find(x => x.id === document.getElementById('ctTurma').value);
    if(!t) return;
    const al = Object.values(DB.alunos).filter(a => a.turmaId === t.id);
    document.getElementById('ctAlunos').innerHTML = al.map(a => '<label class="checkline"><input type="checkbox" class="aluno-chk" value="' + a.id + '"> ' + esc(a.nome) + '</label>').join('') || '<div class="turma-empty">Nenhum aluno nesta turma.</div>';
  };
  document.getElementById('ctOk').onclick = async () => {
    const turmaId = document.getElementById('ctTurma').value;
    const marcados = [...document.querySelectorAll('#ctAlunos .aluno-chk:checked')].map(cb => cb.value);
    if(!marcados.length){ toast('Marque ao menos um aluno.', { type: 'warn' }); return; }
    const turma = DB.turmas.find(t => t.id === turmaId);
    const todos = alunos.length === marcados.length;
    DB.compras.push({ musicaId: item.id, professorId: S.conta, turmaId, destino: todos ? 'todos' : 'alunos', alunoIds: todos ? [] : marcados, criadoEm: todayStr() });
    if(!S.custom.some(s => s.id === item.id)) S.custom.push({ id: item.id, title: item.title, composer: item.composer, difficulty: 1, abc: item.abc, order: 500 + S.custom.length, seed: false });
    try{
      await dbSave('compra turma ' + item.title + ' → ' + turma.nome);
      closeModal(true);
      toast('Compra registrada!', { type: 'success' });
      if(window.renderLoja) renderLoja();
      if(window.renderBiblioteca) renderBiblioteca();
    }catch(e){ toast('Erro: ' + e.message, { type: 'error' }); }
  };
}

export function abrirPraticaLoja(item){
  if(!S.custom.some(s => s.id === item.id)){
    S.custom.push({ id: item.id, title: item.title, composer: item.composer, difficulty: 1, abc: item.abc, order: 500 + S.custom.length, seed: false });
    save();
    if(window.metaCache) metaCache.delete(item.id);
  }
  closeModal(true);
  location.hash = '#/licao/' + item.id;
}

window.LOJA = LOJA;
window.renderLoja = renderLoja;
window.abrirModalCompra = abrirModalCompra;
window.abrirModalCompraTurma = abrirModalCompraTurma;
window.abrirPraticaLoja = abrirPraticaLoja;
