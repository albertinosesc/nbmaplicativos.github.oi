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

// Exposição temporária para o IIFE antigo
window.S = S;
window.save = save;
