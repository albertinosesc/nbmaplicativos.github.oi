// ============================================
// PLANOS DE CURSO
// ============================================

let PLANOS_CURSO_PERSONALIZADOS = {};

const PLANOS_CURSO_PADRAO = {
    1: {
        id: 1,
        nome: "Fundação Musical - Nível 1",
        ano: 1,
        nivel: 1,
        objetivoGeral: "Desenvolver fundamentos musicais básicos",
        ementa: "Introdução aos elementos da música",
        justificativa: "A música é essencial para o desenvolvimento",
        cargaHoraria: 40,
        planos_aula_ids: [1, 2],
        competencias: ["Percepção auditiva", "Coordenação motora"]
    }
};

function getPlanoCurso(id) {
    if (PLANOS_CURSO_PERSONALIZADOS[id]) return PLANOS_CURSO_PERSONALIZADOS[id];
    return PLANOS_CURSO_PADRAO[id];
}

function getAllPlanosCurso() {
    const ids = [...new Set([...Object.keys(PLANOS_CURSO_PADRAO).map(Number), ...Object.keys(PLANOS_CURSO_PERSONALIZADOS).map(Number)])];
    return ids.map(id => getPlanoCurso(id));
}

function salvarPlanoCurso(id, plano) {
    PLANOS_CURSO_PERSONALIZADOS[id] = plano;
    localStorage.setItem('planosCursoPersonalizados', JSON.stringify(PLANOS_CURSO_PERSONALIZADOS));
    if (window.mostrarToast) window.mostrarToast(`✅ Plano de curso "${plano.nome}" salvo!`);
}

function carregarPlanosCursoSalvos() {
    const salvas = localStorage.getItem('planosCursoPersonalizados');
    if (salvas) {
        PLANOS_CURSO_PERSONALIZADOS = JSON.parse(salvas);
    }
    const totalSpan = document.getElementById('totalPlanosCurso');
    if (totalSpan) totalSpan.textContent = Object.keys(PLANOS_CURSO_PERSONALIZADOS).length + Object.keys(PLANOS_CURSO_PADRAO).length;
}