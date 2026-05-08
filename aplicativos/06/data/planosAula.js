// ============================================
// PLANOS DE AULA
// ============================================

let PLANOS_AULA_PERSONALIZADOS = {};

const PLANOS_AULA_PADRAO = {
    1: {
        id: 1,
        titulo: "Conhecendo a Nota Dó",
        nivel: 1,
        duracao: "50min",
        objetivoGeral: "Familiarizar o aluno com a nota Dó",
        objetivosEspecificos: ["Identificar a nota Dó", "Localizar a tecla Dó", "Produzir o som"],
        conteudo: ["Apresentação do instrumento", "Nota Dó na pauta"],
        metodologia: "Aula expositiva e prática",
        recursosDidaticos: ["Piano", "Flashcards"],
        desenvolvimento: ["Boas-vindas (5min)", "Apresentação (10min)", "Prática (15min)"],
        atividades_ids: [1, 2, 12],
        avaliacao: "Observação participativa",
        nivel_id: 1
    },
    2: {
        id: 2,
        titulo: "Brincando com Ritmo",
        nivel: 1,
        duracao: "50min",
        objetivoGeral: "Desenvolver percepção rítmica",
        objetivosEspecificos: ["Diferenciar grave/agudo", "Perceber longos/curtos"],
        conteudo: ["Altura e duração"],
        metodologia: "Aula ativa com jogos",
        recursosDidaticos: ["Piano", "Pandeiro"],
        desenvolvimento: ["Aquecimento (10min)", "Jogos (20min)"],
        atividades_ids: [94, 95, 96],
        avaliacao: "Observação",
        nivel_id: 1
    }
};

function getPlanoAula(id) {
    if (PLANOS_AULA_PERSONALIZADOS[id]) return PLANOS_AULA_PERSONALIZADOS[id];
    return PLANOS_AULA_PADRAO[id];
}

function getAllPlanosAula() {
    const ids = [...new Set([...Object.keys(PLANOS_AULA_PADRAO).map(Number), ...Object.keys(PLANOS_AULA_PERSONALIZADOS).map(Number)])];
    return ids.map(id => getPlanoAula(id));
}

function salvarPlanoAula(id, plano) {
    PLANOS_AULA_PERSONALIZADOS[id] = plano;
    localStorage.setItem('planosAulaPersonalizados', JSON.stringify(PLANOS_AULA_PERSONALIZADOS));
    if (window.mostrarToast) window.mostrarToast(`✅ Plano de aula "${plano.titulo}" salvo!`);
}

function carregarPlanosAulaSalvos() {
    const salvas = localStorage.getItem('planosAulaPersonalizados');
    if (salvas) {
        PLANOS_AULA_PERSONALIZADOS = JSON.parse(salvas);
    }
    const totalSpan = document.getElementById('totalPlanosAula');
    if (totalSpan) totalSpan.textContent = Object.keys(PLANOS_AULA_PERSONALIZADOS).length + Object.keys(PLANOS_AULA_PADRAO).length;
}