// ============================================
// ATIVIDADES VINCULADAS ÀS AÇÕES
// ============================================

let ATIVIDADES_PERSONALIZADAS = {};

function getAtividadePadrao(acaoId, acaoTexto) {
    return {
        titulo: `Atividade da Ação #${acaoId}`,
        objetivo: `Desenvolver a habilidade de realizar a ação "${acaoTexto || ''}".`,
        materiais: ["Instrumento musical", "Papel e lápis", "Partitura simples"],
        passo_a_passo: [
            "1. Professor explica e demonstra a ação",
            "2. Aluno observa e tenta imitar",
            "3. Pratica com repetição (5 a 10 vezes)",
            "4. Professor dá feedback"
        ],
        duracao: "5-10min"
    };
}

function getAtividadePorAcaoId(acaoId, acaoTexto) {
    if (ATIVIDADES_PERSONALIZADAS[acaoId]) return ATIVIDADES_PERSONALIZADAS[acaoId];
    return getAtividadePadrao(acaoId, acaoTexto);
}

function salvarAtividade(acaoId, atividade) {
    ATIVIDADES_PERSONALIZADAS[acaoId] = atividade;
    localStorage.setItem('atividadesPersonalizadas', JSON.stringify(ATIVIDADES_PERSONALIZADAS));
    if (window.mostrarToast) window.mostrarToast(`✅ Atividade da ação #${acaoId} salva!`);
}

function carregarAtividadesSalvas() {
    const salvas = localStorage.getItem('atividadesPersonalizadas');
    if (salvas) {
        ATIVIDADES_PERSONALIZADAS = JSON.parse(salvas);
    }
    const totalSpan = document.getElementById('totalAtividades');
    if (totalSpan) totalSpan.textContent = Object.keys(ATIVIDADES_PERSONALIZADAS).length;
}

function getTotalAtividadesEditadas() {
    return Object.keys(ATIVIDADES_PERSONALIZADAS).length;
}