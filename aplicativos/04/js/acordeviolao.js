// ============================================
// DICIONÁRIO DE ACORDES PARA VIOLÃO
// ============================================
// Este arquivo contém todos os acordes pré-definidos
// Formato linear para facilitar manutenção

const ACORDES = {
    'C1': { nome: 'C', cordas: [-1,3,2,0,1,0], dedos: ['','3','2','','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'G': { nome: 'Sol Maior', cordas: [3,2,0,0,0,3], dedos: ['2','1','','','','3'], pestana: false, casaInicial: 1 },
    'D': { nome: 'Ré Maior', cordas: [0,0,0,2,3,2], dedos: ['','','','2','3','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Am': { nome: 'Lá Menor', cordas: [-1,0,2,2,1,0], dedos: ['','','2','3','1',''], pestana: false, casaInicial: 1 },
    'Em': { nome: 'Mi Menor', cordas: [0,2,2,0,0,0], dedos: ['','2','3','','',''], pestana: false, casaInicial: 1 },
    'F63': { nome: 'F6q', cordas: [1,-1,0,2,1,-1], dedos: ['1','','','3','2',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Fyt': { nome: 'Fá Maior', cordas: [1,3,3,2,1,1], dedos: ['1','3','4','2','1','1'], pestana: true, casaInicial: 0, mostrarNumero: false }
};

// Exporta para uso global (caso esteja em um ambiente modular)
if (typeof window !== 'undefined') {
    window.ACORDES = ACORDES;
}

