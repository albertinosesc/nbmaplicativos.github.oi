// ===== Estado global do app =====
import { LS, DEF, IS_PRO_KEY } from './config.js';

export function load(){
  try{
    const raw = localStorage.getItem(LS);
    if(raw){
      const p = JSON.parse(raw);
      const s = {
        ...DEF, ...p,
        settings: { ...DEF.settings, ...(p.settings || {}) },
        today:    { ...DEF.today,    ...(p.today    || {}) }
      };
      if(!Array.isArray(s.custom)) s.custom = [];
      if(!Array.isArray(s.compras)) s.compras = [];
      if(!s.completed || typeof s.completed !== 'object') s.completed = {};
      if(!s.diasEstudados || typeof s.diasEstudados !== 'object') s.diasEstudados = {};
      if(s.libView !== 'list' && s.libView !== 'grid') s.libView = 'list';
      return s;
    }
  }catch(e){}
  return JSON.parse(JSON.stringify(DEF));
}

export const S = load();

export function save(){ try{ localStorage.setItem(LS, JSON.stringify(S)); }catch(e){} }

export function todayStr(){
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

export function daysBetween(a, b){
  return Math.round((new Date(b+'T00:00:00') - new Date(a+'T00:00:00')) / 86400000);
}

export function touchToday(){
  const d = todayStr();
  if(S.today.day !== d) S.today = { day: d, xp: 0 };
}

export function effStreak(){
  if(!S.lastDay) return 0;
  const d = daysBetween(S.lastDay, todayStr());
  return d <= 1 ? S.streak : 0;
}

export function isPro(){ return localStorage.getItem(IS_PRO_KEY) === 'true'; }

export function applyPlanClasses(){
  document.body.classList.toggle('is-pro', isPro());
}

export function allSongs(SEEDS){
  return [...SEEDS, ...S.custom].sort((a,b) =>
    a.difficulty - b.difficulty || (a.order||0) - (b.order||0)
  );
}

export function withStatus(SEEDS){
  const list = allSongs(SEEDS);
  let f = list.findIndex(s => !S.completed[s.id]);
  if(f < 0) f = list.length;
  return list.map((s,i) => ({
    ...s, idx: i, done: !!S.completed[s.id], unlocked: i <= f, current: i === f
  }));
}

// ===== XP e progresso =====

export function addXp(n){
  touchToday();
  marcarDiaEstudado();
  S.today.xp = (S.today.xp || 0) + n;
  const j = window.jogadorAtual ? jogadorAtual() : { tipo: 'visitante', dados: null };
  if(j.tipo === 'alunoSessao' && j.dados){
    j.dados.xp = (j.dados.xp || 0) + n;
    j.dados.ultimoAcesso = todayStr();
    if(window.scheduleDbSave) scheduleDbSave('xp aluno ' + j.dados.nome + ' +' + n);
  } else if(j.tipo === 'conta' && j.dados){
    j.dados.xp = (j.dados.xp || 0) + n;
    j.dados.ultimoAcesso = todayStr();
    if(window.scheduleDbSave) scheduleDbSave('xp conta ' + j.dados.nome + ' +' + n);
  } else {
    S.xp += n;
  }
  save();
  if(window.updateHUD) updateHUD();
}

export function marcarDiaEstudado(){
  const d = todayStr();
  const j = window.jogadorAtual ? jogadorAtual() : { tipo: 'visitante', dados: null };
  if(j.tipo === 'alunoSessao' && j.dados){
    j.dados.diasEstudados = j.dados.diasEstudados || {};
    j.dados.diasEstudados[d] = true;
    if(window.scheduleDbSave) scheduleDbSave('dia aluno ' + j.dados.nome);
  } else if(j.tipo === 'conta' && j.dados){
    j.dados.diasEstudados = j.dados.diasEstudados || {};
    j.dados.diasEstudados[d] = true;
    if(window.scheduleDbSave) scheduleDbSave('dia conta ' + j.dados.nome);
  }
  S.diasEstudados = S.diasEstudados || {};
  S.diasEstudados[d] = true;
  save();
}

export function salvarProgressoMusica(musicaId, stars, acc){
  const j = window.jogadorAtual ? jogadorAtual() : { tipo: 'visitante', dados: null };
  if((j.tipo === 'alunoSessao' || j.tipo === 'conta') && j.dados){
    j.dados.musicasConcluidas = j.dados.musicasConcluidas || {};
    const ant = j.dados.musicasConcluidas[musicaId];
    j.dados.musicasConcluidas[musicaId] = {
      stars: Math.max(stars, (ant && ant.stars) || 0),
      acc: Math.max(acc, (ant && ant.acc) || 0)
    };
    j.dados.ofensiva = effStreak();
    if(window.scheduleDbSave) scheduleDbSave('progresso ' + musicaId + ' ' + j.dados.nome);
  }
  const prev = S.completed[musicaId];
  S.completed[musicaId] = {
    stars: Math.max(stars, (prev && prev.stars) || 0),
    acc: Math.max(acc, (prev && prev.acc) || 0),
    at: Date.now()
  };
  save();
}

// Exposição temporária para o código legado
window.S = S;
window.save = save;
window.addXp = addXp;
window.marcarDiaEstudado = marcarDiaEstudado;
window.salvarProgressoMusica = salvarProgressoMusica;
