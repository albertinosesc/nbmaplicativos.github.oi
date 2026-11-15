// ===== Vídeos tutoriais organizados por tópicos =====
// Depende de: state.js, ui.js, icons.js

import { openModal, closeModal, toast, esc } from './ui.js';
import { I } from './icons.js';

// Tópicos — adicione novos aqui
export const TOPICOS = [
  { id: 'trilha',   nome: 'Trilha',       cor: 'var(--green)' },
  { id: 'pro',      nome: 'Versão Pro',   cor: 'var(--gold)' },
  { id: 'piano',    nome: 'Piano Virtual', cor: 'var(--blue)' },
  { id: 'metronomo',nome: 'Metrônomo',    cor: 'var(--magenta)' }
];

// Lista de vídeos (substitua os IDs pelos reais)
export const VIDEOS = [
  { id: 'trilha-1', topico: 'trilha',    titulo: 'Como usar a Trilha',          descricao: 'Aprenda a navegar pelos mundos, escolher músicas e ganhar XP.', youtubeId: 'dQw4w9WgXcQ' },
  { id: 'trilha-2', topico: 'trilha',    titulo: 'Sistema de estrelas',          descricao: 'Entenda como funciona a avaliação de cada música.',         youtubeId: 'dQw4w9WgXcQ' },
  { id: 'pro-1',    topico: 'pro',       titulo: 'Criar turma',                  descricao: 'Como cadastrar alunos e criar ranking por turma.',          youtubeId: 'dQw4w9WgXcQ' },
  { id: 'pro-2',    topico: 'pro',       titulo: 'Compra para a turma',          descricao: 'Liberar músicas para todos os alunos.',                     youtubeId: 'dQw4w9WgXcQ' },
  { id: 'piano-1',  topico: 'piano',     titulo: 'Teclado do PC',                descricao: 'Como tocar o piano virtual usando o teclado.',              youtubeId: 'dQw4w9WgXcQ' },
  { id: 'metronomo-1', topico: 'metronomo', titulo: 'Usar metrônomo',            descricao: 'Ajuste o BPM e a luz piscante.',                            youtubeId: 'dQw4w9WgXcQ' }
];

let topicoAtivo = 'trilha';

export function renderVideos(){
  const host = document.getElementById('view-videos');
  if(!host) return;
  const topicsHtml = TOPICOS.map(t =>
    '<button class="videos-topic-btn' + (t.id === topicoAtivo ? ' active' : '') + '" data-topic="' + t.id + '">' +
      esc(t.nome) +
    '</button>'
  ).join('');
  const videosFiltrados = VIDEOS.filter(v => v.topico === topicoAtivo);
  const videosHtml = videosFiltrados.length
    ? videosFiltrados.map(v =>
        '<article class="video-card">'
        + '<div class="video-iframe-wrap">'
        +   '<iframe src="https://www.youtube.com/embed/' + esc(v.youtubeId) + '" loading="lazy" title="' + esc(v.titulo) + '" allowfullscreen></iframe>'
        + '</div>'
        + '<div class="video-info">'
        +   '<span class="video-topic-tag">' + esc(TOPICOS.find(t => t.id === v.topico)?.nome || v.topico) + '</span>'
        +   '<h3>' + esc(v.titulo) + '</h3>'
        +   '<p>' + esc(v.descricao) + '</p>'
        + '</div>'
        + '</article>'
      ).join('')
    : '<div class="empty-state">Nenhum vídeo neste tópico ainda. 🎬</div>';

  host.innerHTML =
    '<div class="container">'
    + '<div class="lib-head"><div><h1>Vídeos tutoriais 🎬</h1><p class="sub">Aprenda a usar todos os recursos do Clave.</p></div></div>'
    + '<div class="videos-topics">' + topicsHtml + '</div>'
    + '<div class="videos-grid">' + videosHtml + '</div>'
    + '<footer>Clave — 2026</footer>'
    + '</div>';

  host.querySelectorAll('.videos-topic-btn').forEach(btn => {
    btn.onclick = () => {
      topicoAtivo = btn.dataset.topic;
      renderVideos();
      if(window.sfxClick) sfxClick();
    };
  });
}

export function getUltimoVideo(){
  return VIDEOS[VIDEOS.length - 1];
}

export function getVideoPorTopico(topico){
  return VIDEOS.filter(v => v.topico === topico);
}

window.TOPICOS = TOPICOS;
window.VIDEOS = VIDEOS;
window.renderVideos = renderVideos;
window.getUltimoVideo = getUltimoVideo;
