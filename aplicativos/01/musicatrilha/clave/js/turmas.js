// ===== Turmas e alunos (professor Pro) =====
import { S, save, todayStr, isPro } from './state.js';
import { DB, dbSave } from './firebase.js';
import { openModal, closeModal, toast, esc } from './ui.js';
import { I } from './icons.js';

function gerarCodigoTurma(){
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for(let i = 0; i < 6; i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}
const slug = t => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'item';

export function renderTurmas(){
  const list = document.getElementById('turmasList');
  if(!list) return;
  if(!window.podeAcessarPro || !podeAcessarPro()){
    list.innerHTML = '<div class="empty-state">🔒 Recurso exclusivo do plano Pro.<br><br><button class="btn gold" id="turmasProBtn">' + I.spark + ' Ativar Pro</button></div>';
    const b = document.getElementById('turmasProBtn');
    if(b) b.onclick = () => { if(!window.contaAtual || !contaAtual()) abrirModalConta(); else abrirModalPro(); };
    return;
  }
  const minhas = DB.turmas.filter(t => t.professorId === S.conta);
  if(!minhas.length){
    list.innerHTML = '<div class="empty-state">Nenhuma turma ainda. Clique em <b>Nova turma</b> para começar. 🎓</div>';
    return;
  }
  list.innerHTML = minhas.map(t => {
    const alunos = Object.values(DB.alunos).filter(a => a.turmaId === t.id);
    alunos.sort((a,b) => (b.xp || 0) - (a.xp || 0));
    const rows = alunos.length
      ? alunos.map((a,i) =>
          '<div class="aluno-row"><span class="rank-pos">' + (i + 1) + '</span>'
            + '<span class="avatar">🎵</span><span class="nome" data-entrar="' + a.id + '" title="Entrar como este aluno">' + esc(a.nome) + '</span>'
            + '<span class="xp">' + (a.xp || 0) + ' XP</span>'
            + '<button class="btn ghost small icon-only danger" data-del-aluno="' + a.id + '" title="Remover aluno">' + I.trash + '</button>'
          + '</div>'
        ).join('')
      : '<div class="turma-empty">Nenhum aluno. Clique em <b>Adicionar aluno</b>.</div>';
    return '<div class="turma-card" data-turma-id="' + t.id + '">'
      + '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">'
      +   '<h3 style="flex:1;min-width:0">' + esc(t.nome) + ' <small>' + alunos.length + ' alunos</small></h3>'
      +   '<span class="turma-codigo" data-copy="' + (t.codigo || '—') + '" title="Copiar código">' + (t.codigo || '—') + ' ' + I.copy + '</span>'
      +   '<button class="btn green small" data-add-aluno="' + t.id + '">' + I.plus + ' Adicionar aluno</button>'
      +   '<button class="btn ghost small icon-only danger" data-del-turma="' + t.id + '" title="Excluir turma">' + I.trash + '</button>'
      + '</div>'
      + '<div class="turma-alunos">' + rows + '</div>'
      + '</div>';
  }).join('');
}

export function abrirModalAluno(turmaId){
  const turma = DB.turmas.find(t => t.id === turmaId);
  if(!turma){ toast('Turma não encontrada.', { type: 'error' }); return; }
  if(turma.professorId !== S.conta){ toast('Você não é dono dessa turma.', { type: 'error' }); return; }
  openModal(
    '<div class="modal-head"><h3>Adicionar aluno</h3><button class="icon-btn" id="mClose">' + I.x + '</button></div>'
    + '<p class="modal-sub" style="text-align:left">Turma: <b>' + esc(turma.nome) + '</b></p>'
    + '<div style="text-align:left;margin-top:12px;display:flex;flex-direction:column;gap:10px">'
    + '<label>Nome do aluno</label><input id="alNome" type="text" placeholder="Ex.: João Silva" style="width:100%" maxlength="20">'
    + '<label>Senha</label><input id="alSenha" type="password" placeholder="Mínimo 4 caracteres" style="width:100%" maxlength="40">'
    + '</div>'
    + '<div class="modal-actions">'
    + '<button class="btn green" id="alOk">' + I.check + ' Criar aluno</button>'
    + '<button class="btn ghost" id="alCancel">Cancelar</button>'
    + '</div>'
  );
  document.getElementById('mClose').onclick = document.getElementById('alCancel').onclick = () => closeModal();
  document.getElementById('alOk').onclick = async () => {
    const nome = (document.getElementById('alNome').value || '').trim();
    const senha = (document.getElementById('alSenha').value || '').trim();
    if(!nome || nome.length < 2){ toast('Nome muito curto.', { type: 'warn' }); return; }
    if(!senha || senha.length < 4){ toast('Senha muito curta.', { type: 'warn' }); return; }
    const id = slug(nome);
    if(DB.alunos[id]){ toast('Já existe um aluno com esse nome.', { type: 'warn' }); return; }
    DB.alunos[id] = { id, nome, senha, turmaId, xp: 0, ofensiva: 0, musicasConcluidas: {}, diasEstudados: {}, criadoEm: todayStr() };
    try{
      await dbSave('novo aluno ' + nome);
      closeModal(true);
      toast('Aluno criado! 🎉', { type: 'success' });
      renderTurmas();
    }catch(e){ toast('Erro: ' + e.message, { type: 'error' }); }
  };
}

export function excluirTurma(turmaId){
  const turma = DB.turmas.find(t => t.id === turmaId);
  if(!turma) return;
  if(turma.professorId !== S.conta){ toast('Você não é dono dessa turma.', { type: 'error' }); return; }
  const alunos = Object.values(DB.alunos).filter(a => a.turmaId === turmaId);
  openModal(
    '<h3 class="modal-title">Excluir turma?</h3>'
    + '<p class="modal-sub">“' + esc(turma.nome) + '” será removida.'
    + (alunos.length ? '<br><b style="color:#FF9B9E">' + alunos.length + ' aluno(s)</b> serão removidos também.' : '')
    + '</p>'
    + '<div class="modal-actions-col" style="margin-top:18px">'
    + '<button class="btn red big" id="delOk">' + I.trash + ' Sim, excluir</button>'
    + '<button class="btn ghost" id="delCancel">Cancelar</button>'
    + '</div>'
  );
  document.getElementById('delOk').onclick = async () => {
    DB.turmas = DB.turmas.filter(t => t.id !== turmaId);
    Object.keys(DB.alunos).forEach(k => { if(DB.alunos[k].turmaId === turmaId) delete DB.alunos[k]; });
    try{ await dbSave('turma excluída ' + turma.nome); toast('Turma excluída.', { type: 'success' }); }
    catch(e){ toast('Erro: ' + e.message, { type: 'error' }); }
    closeModal(true);
    renderTurmas();
  };
  document.getElementById('delCancel').onclick = () => closeModal();
}

export function excluirAluno(alunoId){
  const a = DB.alunos[alunoId];
  if(!a) return;
  const turma = DB.turmas.find(t => t.id === a.turmaId);
  if(!turma || turma.professorId !== S.conta){ toast('Sem permissão.', { type: 'error' }); return; }
  openModal(
    '<h3 class="modal-title">Remover aluno?</h3>'
    + '<p class="modal-sub">“' + esc(a.nome) + '” será removido da turma.</p>'
    + '<div class="modal-actions-col" style="margin-top:18px">'
    + '<button class="btn red big" id="delOk">' + I.trash + ' Sim, remover</button>'
    + '<button class="btn ghost" id="delCancel">Cancelar</button></div>'
  );
  document.getElementById('delOk').onclick = async () => {
    delete DB.alunos[alunoId];
    try{ await dbSave('aluno removido ' + a.nome); }catch(e){}
    closeModal(true);
    renderTurmas();
    toast('Aluno removido.', { type: 'success' });
  };
  document.getElementById('delCancel').onclick = () => closeModal();
}

export function entrarComoSessaoAluno(alunoId){
  const a = DB.alunos[alunoId];
  if(!a) return;
  const turma = DB.turmas.find(t => t.id === a.turmaId);
  if(!turma || turma.professorId !== S.conta){ toast('Sem permissão.', { type: 'error' }); return; }
  S.alunoSessao = alunoId;
  S.xp = a.xp || 0;
  S.completed = JSON.parse(JSON.stringify(a.musicasConcluidas || {}));
  S.streak = a.ofensiva || 0;
  S.diasEstudados = JSON.parse(JSON.stringify(a.diasEstudados || {}));
  S.today = { day: todayStr(), xp: 0 };
  save();
  if(window.updateHUD) updateHUD();
  if(window.renderSidebar) renderSidebar();
  if(window.renderTrilha) renderTrilha();
  toast('Agora jogando como ' + a.nome + '.', { type: 'success' });
  location.hash = '#/trilha';
}

export function sairSessaoAluno(){
  const a = window.alunoSessao ? alunoSessao() : null;
  if(!a) return;
  const c = window.contaAtual ? contaAtual() : null;
  S.alunoSessao = null;
  if(c){
    S.xp = c.xp || 0;
    S.completed = { ...(c.musicasConcluidas || {}) };
    S.streak = c.ofensiva || 0;
    S.diasEstudados = { ...(c.diasEstudados || {}) };
  }
  S.today = { day: todayStr(), xp: 0 };
  save();
  if(window.updateHUD) updateHUD();
  if(window.renderSidebar) renderSidebar();
  if(window.renderTrilha) renderTrilha();
  toast('Voltou para a conta do professor.', { type: 'info' });
}

window.renderTurmas = renderTurmas;
window.abrirModalAluno = abrirModalAluno;
window.excluirTurma = excluirTurma;
window.excluirAluno = excluirAluno;
window.entrarComoSessaoAluno = entrarComoSessaoAluno;
window.sairSessaoAluno = sairSessaoAluno;
window.gerarCodigoTurma = gerarCodigoTurma;
