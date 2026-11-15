// ===== Autenticação, conta, aluno, Pro =====
// Depende de: state.js, firebase.js, ui.js, icons.js, config.js

import { S, save, isPro, applyPlanClasses, todayStr } from './state.js';
import { DB, dbLoad, dbSave, scheduleDbSave } from './firebase.js';
import { openModal, closeModal, toast, esc } from './ui.js';
import { I } from './icons.js';
import { IS_PRO_KEY, PIX_KEY } from './config.js';

export function contaAtual(){ return S.conta && DB.contasGlobais[S.conta] ? DB.contasGlobais[S.conta] : null; }
export function alunoSessao(){ return S.alunoSessao && DB.alunos[S.alunoSessao] ? DB.alunos[S.alunoSessao] : null; }

export function jogadorAtual(){
  if(S.alunoSessao){ const a = alunoSessao(); if(a) return { tipo: 'alunoSessao', dados: a }; }
  const c = contaAtual();
  if(c) return { tipo: 'conta', dados: c };
  return { tipo: 'visitante', dados: null };
}

export function isProfessor(){ const c = contaAtual(); return !!(c && c.pro); }
export function podeAcessarPro(){ return isProfessor(); }

export function turmaDoJogador(){
  const j = jogadorAtual();
  if(j.tipo === 'alunoSessao' && j.dados.turmaId) return DB.turmas.find(t => t.id === j.dados.turmaId) || null;
  if(j.tipo === 'conta' && j.dados.turmaId) return DB.turmas.find(t => t.id === j.dados.turmaId) || null;
  return null;
}

const slug = t => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'item';

export function abrirModalConta(){
  const c = contaAtual();
  if(c){
    const turma = turmaDoJogador();
    openModal(
      '<div class="modal-head"><h3>Minha conta</h3><button class="icon-btn" id="mClose">' + I.x + '</button></div>'
      + '<div style="text-align:left;margin-top:8px">'
      +   '<p class="sub">' + (c.pro ? '⭐ Professor (Pro)' : 'Usuário') + '</p>'
      +   '<b style="font-family:var(--font-disp);font-size:20px">' + esc(c.nome) + '</b>'
      +   '<p class="sub" style="margin-top:6px">E-mail: ' + esc(c.email || '—') + '</p>'
      +   '<p class="sub">XP: ' + (c.xp || 0) + ' • Ofensiva: ' + (c.ofensiva || 0) + '</p>'
      +   (turma ? '<p class="sub" style="margin-top:6px">Turma: <b>' + esc(turma.nome) + '</b></p>' : '')
      + '</div>'
      + '<div class="modal-actions-col" style="margin-top:18px">'
      +   (!c.pro ? '<button class="btn blue" id="virarPro">' + I.spark + ' Ativar versão Pro</button>' : '')
      +   '<button class="btn ghost" id="contaSair">' + I.x + ' Sair da conta</button>'
      +   '<button class="btn ghost" id="contaFechar">Fechar</button>'
      + '</div>'
    );
    document.getElementById('mClose').onclick =
      document.getElementById('contaFechar').onclick = () => closeModal();
    const btnPro = document.getElementById('virarPro');
    if(btnPro) btnPro.onclick = () => { closeModal(true); abrirModalPro(); };
    document.getElementById('contaSair').onclick = async () => {
      try{ const { auth } = window.FirebaseService; const { signOut } = window.FirebaseAuth; await signOut(auth); }catch(e){}
      S.conta = null; S.alunoSessao = null; S.xp = 0; S.compras = []; S.completed = {};
      S.streak = 0; S.lastDay = null; S.diasEstudados = {}; S.custom = [];
      localStorage.removeItem(IS_PRO_KEY);
      save(); applyPlanClasses();
      closeModal(true);
      if(window.updateHUD) updateHUD();
      if(window.renderSidebar) renderSidebar();
      if(window.renderTrilha) renderTrilha();
      toast('Você saiu da conta.', { type: 'info' });
    };
    return;
  }
  openModal(
    '<div class="modal-head"><h3>Entrar / Criar conta</h3><button class="icon-btn" id="mClose">' + I.x + '</button></div>'
    + '<p class="modal-sub" style="text-align:left">Escolha como entrar:</p>'
    + '<div class="modal-actions-col" style="margin-top:14px">'
    +   '<button class="btn green big" id="modoConta">' + I.user + ' Entrar com conta (e-mail)</button>'
    +   '<button class="btn blue big" id="modoTurma">' + I.trophy + ' Entrar com turma (aluno)</button>'
    + '</div>'
    + '<div class="modal-actions"><button class="btn ghost" id="cancelarBtn">Cancelar</button></div>'
  );
  document.getElementById('mClose').onclick =
    document.getElementById('cancelarBtn').onclick = () => closeModal();
  document.getElementById('modoConta').onclick = () => { closeModal(true); abrirLoginConta(); };
  document.getElementById('modoTurma').onclick = () => { closeModal(true); abrirLoginTurma(); };
}

export function abrirLoginConta(){
  openModal(
    '<div class="modal-head"><h3>Entrar / Criar conta</h3><button class="icon-btn" id="mClose">' + I.x + '</button></div>'
    + '<p class="modal-sub" style="text-align:left">Conta com e-mail e senha.</p>'
    + '<div style="text-align:left;margin-top:12px;display:flex;flex-direction:column;gap:10px">'
    +   '<label>Nome</label>'
    +   '<input id="loginNome" type="text" placeholder="Seu nome" style="width:100%" maxlength="20" autocomplete="username">'
    +   '<label>E-mail</label>'
    +   '<input id="loginEmail" type="email" placeholder="seu@email.com" style="width:100%" maxlength="80" autocomplete="email">'
    +   '<label>Senha</label>'
    +   '<input id="loginSenha" type="password" placeholder="Mínimo 6 caracteres" style="width:100%" maxlength="40" autocomplete="current-password">'
    +   '<label class="checkline" style="margin-top:8px">'
    +     '<input type="checkbox" id="loginNotif">'
    +     '<span>Quero receber notificações de atualizações por e-mail</span>'
    +   '</label>'
    + '</div>'
    + '<div class="modal-actions">'
    +   '<button class="btn green" id="entrarBtn">' + I.check + ' Entrar</button>'
    +   '<button class="btn blue" id="criarBtn">' + I.plus + ' Criar conta</button>'
    +   '<button class="btn ghost" id="cancelarBtn">Voltar</button>'
    + '</div>'
    + '<p style="text-align:center;margin-top:14px"><a href="#" id="esqueciSenha" style="color:var(--teal);font-weight:800;font-size:13px">Esqueci minha senha</a></p>'
  );
  if(window.injectIcons) injectIcons();
  document.getElementById('mClose').onclick =
    document.getElementById('cancelarBtn').onclick = () => closeModal();
  document.getElementById('entrarBtn').onclick = () => entrarConta();
  document.getElementById('criarBtn').onclick  = () => criarConta();
  const esqueci = document.getElementById('esqueciSenha');
  if(esqueci) esqueci.onclick = (e) => {
    e.preventDefault();
    const email = (document.getElementById('loginEmail').value || '').trim();
    if(!email){ toast('Digite seu e-mail primeiro.', { type: 'warn' }); return; }
    try{
      const { auth } = window.FirebaseService;
      const { sendPasswordResetEmail } = window.FirebaseAuth;
      sendPasswordResetEmail(auth, email)
        .then(() => toast('E-mail de recuperação enviado!', { type: 'success', duration: 6000 }))
        .catch((err) => toast('Erro: ' + err.message, { type: 'error' }));
    }catch(err){ toast('Erro: ' + err.message, { type: 'error' }); }
  };
}

export function abrirLoginTurma(){
  openModal(
    '<div class="modal-head"><h3>Entrar com turma</h3><button class="icon-btn" id="mClose">' + I.x + '</button></div>'
    + '<p class="modal-sub" style="text-align:left">Digite o nome e a senha cadastrados pelo professor.</p>'
    + '<div style="text-align:left;margin-top:12px;display:flex;flex-direction:column;gap:10px">'
    +   '<label>Nome do aluno</label>'
    +   '<input id="turmaNome" type="text" placeholder="Ex.: João Silva" style="width:100%" maxlength="20">'
    +   '<label>Senha da turma</label>'
    +   '<input id="turmaSenha" type="password" placeholder="Senha" style="width:100%" maxlength="40">'
    + '</div>'
    + '<div class="modal-actions">'
    +   '<button class="btn green" id="turmaEntrarBtn">' + I.check + ' Entrar</button>'
    +   '<button class="btn ghost" id="cancelarBtn">Voltar</button>'
    + '</div>'
  );
  document.getElementById('mClose').onclick =
    document.getElementById('cancelarBtn').onclick = () => closeModal();
  document.getElementById('turmaEntrarBtn').onclick = () => entrarAlunoTurma();
}

export async function entrarAlunoTurma(){
  const nome  = (document.getElementById('turmaNome').value  || '').trim();
  const senha = (document.getElementById('turmaSenha').value || '').trim();
  if(!nome || !senha){ toast('Preencha nome e senha.', { type: 'warn' }); return; }
  const id = slug(nome);
  const a = DB.alunos[id];
  if(!a || a.senha !== senha){ toast('Nome ou senha incorretos.', { type: 'error' }); return; }
  S.alunoSessao = id;
  S.xp = a.xp || 0;
  S.completed = JSON.parse(JSON.stringify(a.musicasConcluidas || {}));
  S.streak = a.ofensiva || 0;
  S.lastDay = a.ultimoAcesso || null;
  S.diasEstudados = JSON.parse(JSON.stringify(a.diasEstudados || {}));
  S.today = { day: todayStr(), xp: 0 };
  save();
  closeModal(true);
  if(window.updateHUD) updateHUD();
  if(window.renderSidebar) renderSidebar();
  if(window.renderTrilha) renderTrilha();
  toast('Bem-vindo, ' + a.nome + '! 🎹', { type: 'success' });
}

export async function criarConta(){
  const nome  = (document.getElementById('loginNome').value  || '').trim();
  const email = (document.getElementById('loginEmail').value || '').trim().toLowerCase();
  const senha = (document.getElementById('loginSenha').value || '').trim();
  const notif = document.getElementById('loginNotif') ? document.getElementById('loginNotif').checked : false;

  if(!nome || nome.length < 2){ toast('Nome muito curto.', { type: 'warn' }); return; }
  if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ toast('E-mail inválido.', { type: 'warn' }); return; }
  if(!senha || senha.length < 6){ toast('Senha deve ter ao menos 6 caracteres.', { type: 'warn' }); return; }

  const btn = document.getElementById('criarBtn');
  const originalHtml = btn ? btn.innerHTML : '';
  if(btn){ btn.disabled = true; btn.innerHTML = I.refresh + ' Criando...'; }

  try{
    const { auth, db, doc, setDoc } = window.FirebaseService;
    const { createUserWithEmailAndPassword } = window.FirebaseAuth;
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    const uid  = cred.user.uid;
    const perfil = {
      id: uid, nome, email, pro: false,
      xp: S.xp || 0, ofensiva: S.streak || 0, ultimoAcesso: todayStr(),
      compras: Array.isArray(S.compras) ? [...S.compras] : [],
      musicasConcluidas: { ...(S.completed || {}) },
      diasEstudados: { ...(S.diasEstudados || {}) },
      notificacoes: notif,
      criadoEm: todayStr()
    };
    await setDoc(doc(db, 'clave', 'dados'),
      { contasGlobais: { [uid]: perfil } },
      { merge: true });
    DB.contasGlobais[uid] = perfil;
    S.conta = uid;
    S.alunoSessao = null;
    save();
    closeModal(true);
    if(window.updateHUD) updateHUD();
    if(window.renderSidebar) renderSidebar();
    if(window.renderTrilha) renderTrilha();
    toast('Conta criada! 🎉 Bem-vindo, ' + esc(nome), { type: 'success' });
  }catch(err){
    const msg = err && err.code ? err.code : (err.message || 'Erro desconhecido');
    if(msg.includes('email-already-in-use')) toast('Este e-mail já está cadastrado.', { type: 'error' });
    else if(msg.includes('weak-password'))   toast('Senha muito fraca.', { type: 'error' });
    else if(msg.includes('invalid-email'))   toast('E-mail inválido.', { type: 'error' });
    else toast('Erro: ' + msg, { type: 'error', duration: 5000 });
    if(btn){ btn.disabled = false; btn.innerHTML = originalHtml; }
  }
}

export async function entrarConta(){
  const email = (document.getElementById('loginEmail').value || '').trim().toLowerCase();
  const senha = (document.getElementById('loginSenha').value || '').trim();
  if(!email || !senha){ toast('Preencha e-mail e senha.', { type: 'warn' }); return; }
  const btn = document.getElementById('entrarBtn');
  const originalHtml = btn ? btn.innerHTML : '';
  if(btn){ btn.disabled = true; btn.innerHTML = I.refresh + ' Entrando...'; }
  try{
    const { auth, db, doc, getDoc } = window.FirebaseService;
    const { signInWithEmailAndPassword } = window.FirebaseAuth;
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const uid  = cred.user.uid;
    const snap = await getDoc(doc(db, 'clave', 'dados'));
    const dados = snap.exists() ? snap.data() : {};
    const contasGlobais = dados.contasGlobais || {};
    const c = contasGlobais[uid];
    if(!c){
      toast('Perfil não encontrado.', { type: 'error' });
      if(btn){ btn.disabled = false; btn.innerHTML = originalHtml; }
      return;
    }
    DB.contasGlobais = contasGlobais;
    S.conta = uid;
    S.alunoSessao = null;
    S.xp = c.xp || 0;
    S.compras = Array.isArray(c.compras) ? [...c.compras] : [];
    S.completed = { ...(c.musicasConcluidas || {}) };
    S.streak = c.ofensiva || 0;
    S.lastDay = c.ultimoAcesso || null;
    S.diasEstudados = { ...(c.diasEstudados || {}) };
    S.today = { day: todayStr(), xp: 0 };
    S.custom = S.custom.filter(s => !s.comprada || S.compras.includes(s.id));
    if(c.pro) localStorage.setItem(IS_PRO_KEY, 'true');
    else localStorage.removeItem(IS_PRO_KEY);
    save(); applyPlanClasses();
    closeModal(true);
    if(window.updateHUD) updateHUD();
    if(window.renderSidebar) renderSidebar();
    if(window.renderTrilha) renderTrilha();
    if(window.renderBiblioteca) renderBiblioteca();
    if(window.renderLoja) renderLoja();
    toast('Bem-vindo de volta, ' + esc(c.nome) + '! 🎹', { type: 'success' });
  }catch(err){
    const msg = err && err.code ? err.code : (err.message || '');
    if(msg.includes('user-not-found'))      toast('E-mail não cadastrado.', { type: 'error' });
    else if(msg.includes('wrong-password')) toast('Senha incorreta.', { type: 'error' });
    else if(msg.includes('invalid-email'))  toast('E-mail inválido.', { type: 'error' });
    else if(msg.includes('too-many-requests')) toast('Muitas tentativas. Aguarde.', { type: 'warn' });
    else toast('Erro: ' + msg, { type: 'error', duration: 5000 });
    if(btn){ btn.disabled = false; btn.innerHTML = originalHtml; }
  }
}

export function abrirModalPro(){
  if(!contaAtual()){
    openModal(
      '<div class="modal-head"><h3>Ativar versão Pro</h3><button class="icon-btn" id="mClose">' + I.x + '</button></div>'
      + '<p class="modal-sub" style="text-align:left">Para ativar o Pro, você precisa entrar ou criar uma conta.</p>'
      + '<div class="modal-actions">'
      + '<button class="btn green" id="proConta">' + I.user + ' Entrar / Criar conta</button>'
      + '<button class="btn ghost" id="proCancel">Fechar</button>'
      + '</div>'
    );
    document.getElementById('mClose').onclick =
      document.getElementById('proCancel').onclick = () => closeModal();
    document.getElementById('proConta').onclick = () => { closeModal(true); abrirLoginConta(); };
    return;
  }
  openModal(
    '<div class="modal-head"><h3>Ativar versão Pro</h3><button class="icon-btn" id="mClose">' + I.x + '</button></div>'
    + '<p class="modal-sub" style="text-align:left">A versão Pro libera <b>Turmas</b> e <b>Ranking por turma</b>.</p>'
    + '<div style="margin-top:14px;padding:12px 14px;background:#221040;border:1px solid var(--line);border-radius:12px;text-align:center">'
    + '<img src="qrcode-pix.png" alt="QR Code PIX" style="width:180px;height:180px;display:block;margin:0 auto;border-radius:8px;background:#fff;padding:6px">'
    + '<div style="display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:10px">'
    + '<code style="font-size:12px;color:var(--ink2);word-break:break-all">' + PIX_KEY + '</code>'
    + '<button class="btn green small" id="pixProCopy" type="button">' + I.copy + '<span>Copiar</span></button>'
    + '</div></div>'
    + '<p class="sub" style="text-align:left;color:var(--ink3);margin-top:14px">Já tem a chave? Cole abaixo:</p>'
    + '<input id="proKey" type="text" placeholder="CLAVE-PRO-..." style="width:100%;margin-top:6px">'
    + '<div class="modal-actions"><button class="btn gold" id="proOk">' + I.check + ' Ativar</button><button class="btn ghost" id="proCancel">Cancelar</button></div>'
  );
  const proCopyBtn = document.getElementById('pixProCopy');
  if(proCopyBtn) proCopyBtn.onclick = async () => {
    try{
      if(navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) await navigator.clipboard.writeText(PIX_KEY);
      else { const ta = document.createElement('textarea'); ta.value = PIX_KEY; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }
      toast('Chave PIX copiada!', { type: 'success' });
    }catch(e){ toast('Copie manualmente.', { type: 'warn' }); }
  };
  document.getElementById('mClose').onclick =
    document.getElementById('proCancel').onclick = () => closeModal();
  document.getElementById('proOk').onclick = async () => {
    const key = (document.getElementById('proKey').value || '').trim().toUpperCase();
    if(!key){ toast('Digite a chave.', { type: 'warn' }); return; }
    if(!S.conta){ toast('Entre na sua conta.', { type: 'warn' }); return; }
    const btn = document.getElementById('proOk');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = I.refresh + ' Validando...';
    try{
      const { db, doc, runTransaction, setDoc } = window.FirebaseService;
      await runTransaction(db, async (transaction) => {
        const chaveRef = doc(db, 'chavesPro', key);
        const chaveSnap = await transaction.get(chaveRef);
        if(!chaveSnap.exists()) throw new Error('Chave inválida.');
        const data = chaveSnap.data();
        if(!data.ativa) throw new Error('Chave desativada.');
        if(data.usadaPor) throw new Error('Esta chave já foi usada.');
        transaction.update(chaveRef, { usadaPor: S.conta, usadaEm: new Date().toISOString() });
      });
      await setDoc(doc(db, 'clave', 'dados'), { contasGlobais: { [S.conta]: { pro: true } } }, { merge: true });
      if(DB.contasGlobais[S.conta]) DB.contasGlobais[S.conta].pro = true;
      localStorage.setItem(IS_PRO_KEY, 'true');
      applyPlanClasses();
      closeModal(true);
      toast('Versão Pro ativada! 🎉', { type: 'success' });
      if(window.renderTurmas) renderTurmas();
    }catch(e){
      const msg = e.message || 'Erro';
      if(msg.includes('já foi usada')) toast('🔒 Esta chave já foi usada.', { type: 'error' });
      else if(msg.includes('desativada')) toast('Chave desativada.', { type: 'error' });
      else if(msg.includes('inválida')) toast('Chave inválida.', { type: 'error' });
      else toast('Erro: ' + msg, { type: 'error' });
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  };
}

// Expor no window
window.contaAtual = contaAtual;
window.alunoSessao = alunoSessao;
window.jogadorAtual = jogadorAtual;
window.isProfessor = isProfessor;
window.podeAcessarPro = podeAcessarPro;
window.turmaDoJogador = turmaDoJogador;
window.abrirModalConta = abrirModalConta;
window.abrirLoginConta = abrirLoginConta;
window.abrirLoginTurma = abrirLoginTurma;
window.entrarAlunoTurma = entrarAlunoTurma;
window.criarConta = criarConta;
window.entrarConta = entrarConta;
window.abrirModalPro = abrirModalPro;
