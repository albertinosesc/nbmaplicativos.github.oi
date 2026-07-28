// ============================================
// VARIÁVEIS GLOBAIS
// ============================================

let dados = {
    listas: []
};

let githubToken = localStorage.getItem('github_token') || '';
let githubRepo = localStorage.getItem('github_repo') || '';
let githubBranch = localStorage.getItem('github_branch') || 'main';
let githubPasta = localStorage.getItem('github_pasta') || 'aulas/';
let listaAtual = null;
let cartaoAtual = null;
let timeoutRenderTimer;
let coresAtivas = true;
let expandedPaths = new Set();
let exploradorCaminhoAtual = '';

const STORAGE_KEY = 'pro_maestro_listas';

// Exporta para o escopo global
window.githubToken = githubToken;
window.githubRepo = githubRepo;
window.githubBranch = githubBranch;
window.githubPasta = githubPasta;
window.dados = dados;
window.listaAtual = listaAtual;
window.cartaoAtual = cartaoAtual;
window.coresAtivas = coresAtivas;
