// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function toast(msg, tipo = 'info') {
    const el = document.createElement('div');
    el.textContent = msg;
    const bg = tipo === 'error' ? '#e94560' : tipo === 'success' ? '#2ed573' : '#3a86ff';
    el.style.cssText = `position:fixed; bottom:20px; right:20px; background:${bg}; color:white; padding:12px 20px; border-radius:8px; z-index:9999; animation:fadeOut 3s forwards; font-weight:bold;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

function obterChaveDoCaminho(caminho) {
    return caminho.join('-');
}

function obterListaPorCaminho(caminho) {
    if (!caminho || caminho.length === 0) return null;
    let atual = dados.listas[caminho[0]];
    for (let i = 1; i < caminho.length; i++) {
        if (!atual || !atual.sublistas) return null;
        atual = atual.sublistas[caminho[i]];
    }
    return atual;
}

function obterTituloAtual() {
    if (listaAtual !== null && cartaoAtual !== null) {
        const lista = obterListaPorCaminho(listaAtual);
        if (lista && lista.cards[cartaoAtual]) {
            return lista.cards[cartaoAtual].texto || 'aula';
        }
    }
    return 'aula';
}

function obterConteudoAtual() {
    const editor = document.getElementById('editor');
    return editor ? editor.value : '';
}

// Estilo para toast
const styleToast = document.createElement('style');
styleToast.textContent = `@keyframes fadeOut { 0% { opacity: 1; transform: translateX(0); } 70% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); } }`;
document.head.appendChild(styleToast);
