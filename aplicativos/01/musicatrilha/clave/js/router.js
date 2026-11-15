// ===== Roteamento (hash) =====
import { S, isPro } from './state.js';
import { toast } from './ui.js';

let currentView = 'trilha';

export function getCurrentView(){ return currentView; }

export function showView(v){
  currentView = v;
  document.querySelectorAll('.view').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('view-' + v);
  if(el) el.classList.add('active');
  document.body.classList.toggle('in-lesson', v === 'licao');
  if(v !== 'licao') window.scrollTo(0, 0);
}

export function updateNav(h){
  const set = (sel, on) => { const el = document.querySelector(sel); if(el) el.classList.toggle('active', on); };
  set('#navTrilha', h.startsWith('#/trilha') || h.startsWith('#/licao') || h === '' || h === '#');
  set('#navBib',    h.startsWith('#/biblioteca'));
  set('#navComentarios', h.startsWith('#/comentarios'));
  set('#navSobre',       h.startsWith('#/sobre'));
  set('#navVideos',      h.startsWith('#/videos'));
  set('#navPlanos',      h.startsWith('#/planos'));

  const pro = window.podeAcessarPro ? podeAcessarPro() : false;
  const navTurmas = document.getElementById('navTurmas');
  if(navTurmas){
    navTurmas.classList.toggle('active', h.startsWith('#/turmas'));
    navTurmas.classList.toggle('locked', !pro);
    navTurmas.setAttribute('aria-disabled', String(!pro));
    navTurmas.title = pro ? '' : '🔒 Recurso Pro';
  }
  const navLoja = document.getElementById('navLoja');
  if(navLoja){
    navLoja.classList.toggle('active', h.startsWith('#/loja'));
    navLoja.classList.toggle('locked', !pro);
    navLoja.setAttribute('aria-disabled', String(!pro));
    navLoja.title = pro ? '' : '🔒 Recurso Pro';
  }
}

export async function route(){
  const h = location.hash || '#/trilha';

  const mLicao = h.match(/^#\/licao\/(.+)$/);
  if(mLicao){
    const id = decodeURIComponent(mLicao[1]);
    const list = window.withStatus ? window.withStatus(window.SEEDS) : [];
    const s = list.find(x => x.id === id);
    if(!s || !s.unlocked){
      toast('🔒 Música bloqueada ou inexistente.', { type: 'warn' });
      showView('trilha');
      if(window.renderTrilha) window.renderTrilha();
      updateNav('#/trilha');
      return;
    }
    showView('licao');
    updateNav(h);
    if(window.initLesson) window.initLesson(s);
    return;
  }

  if(h.startsWith('#/turmas')){
    if(window.podeAcessarPro && !window.podeAcessarPro()){
      toast('🔒 Turmas é um recurso Pro.', { type: 'warn' });
      showView('trilha');
      if(window.renderTrilha) window.renderTrilha();
      updateNav('#/trilha');
      return;
    }
    showView('turmas');
    if(window.renderTurmas) window.renderTurmas();
  } else if(h.startsWith('#/biblioteca')){
    showView('biblioteca');
    if(window.renderBiblioteca) window.renderBiblioteca();
  } else if(h.startsWith('#/loja')){
    if(window.podeAcessarPro && !window.podeAcessarPro()){
      toast('🔒 Loja é um recurso Pro.', { type: 'warn' });
      showView('trilha');
      if(window.renderTrilha) window.renderTrilha();
      updateNav('#/trilha');
      return;
    }
    showView('loja');
    if(window.renderLoja) window.renderLoja();
  } else if(h.startsWith('#/comentarios')){
    showView('comentarios');
    if(window.injectIcons) window.injectIcons();
  } else if(h.startsWith('#/videos')){
    showView('videos');
    if(window.renderVideos) window.renderVideos();
  } else if(h.startsWith('#/planos')){
    showView('planos');
    if(window.injectIcons) window.injectIcons();
  } else if(h.startsWith('#/sobre')){
    showView('sobre');
    if(window.injectIcons) window.injectIcons();
  } else {
    showView('trilha');
    if(window.renderTrilha) window.renderTrilha();
  }
  updateNav(h);
}

window.showView = showView;
window.updateNav = updateNav;
window.route = route;
window.getCurrentView = getCurrentView;
