// ===== Formulário de comentários =====
import { S } from './state.js';
import { toast } from './ui.js';

export async function enviarComentario(){
  const nome  = (document.getElementById('cmtNome').value  || '').trim();
  const email = (document.getElementById('cmtEmail').value || '').trim();
  const tipo  = document.getElementById('cmtTipo').value;
  const msg   = (document.getElementById('cmtMsg').value   || '').trim();

  if(!msg || msg.length < 5){
    toast('Escreva uma mensagem um pouco maior.', { type: 'warn' });
    return;
  }

  const btn = document.getElementById('cmtEnviar');
  const original = btn ? btn.innerHTML : '';
  if(btn){ btn.disabled = true; btn.innerHTML = '⏳ Enviando...'; }

  try{
    const svc = window.FirebaseService;
    await svc.init ? svc.init() : Promise.resolve();
    const { db, doc, setDoc } = svc;
    const id = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    await setDoc(doc(db, 'comentarios', id), {
      id, nome: nome || 'Anônimo', email: email || '', tipo, mensagem: msg,
      criadoEm: new Date().toISOString(),
      contaUid: S.conta || null,
      userAgent: (navigator.userAgent || '').slice(0, 120)
    });
    document.getElementById('cmtNome').value = '';
    document.getElementById('cmtEmail').value = '';
    document.getElementById('cmtMsg').value = '';
    toast('Obrigado! Comentário enviado. 💬', { type: 'success', duration: 5000 });
    if(btn){ btn.disabled = false; btn.innerHTML = original; }
  }catch(e){
    toast('Erro ao enviar: ' + e.message, { type: 'error', duration: 5000 });
    if(btn){ btn.disabled = false; btn.innerHTML = original; }
  }
}

window.enviarComentario = enviarComentario;
