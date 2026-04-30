// ============================================
// DICIONÁRIO DE ACORDES PARA VIOLÃO
// ============================================
// Este arquivo contém todos os acordes pré-definidos
// Formato linear para facilitar manutenção

const ACORDES = {
// Maior
    'C': { nome: 'C', cordas: [-1,3,2,0,1,0], dedos: ['','3','2','','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'G': { nome: 'G', cordas: [3,2,0,0,0,3], dedos: ['2','1','','','','3'], pestana: false, casaInicial:  0, mostrarNumero: false },
    'D': { nome: 'D', cordas: [-1,-1,0,2,3,2], dedos: ['','','','2','3','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'A': { nome: 'A', cordas: [-1,0,2,2,2,0], dedos: ['','','1','2','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'E': { nome: 'E', cordas: [0,2,2,1,0,0], dedos: ['','2','3','1','',''], pestana: false, casaInicial: 0, mostrarNumero: false },

// Menor
    'Dm': { nome: 'Dm', cordas: [-1,-1,0,2,3,1], dedos: ['','','','2','3','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Em': { nome: 'Em', cordas: [0,2,2,0,0,0], dedos: ['','2','3','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Am': { nome: 'Am', cordas: [-1,0,2,2,1,0], dedos: ['','','2','3','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    
// Maior 7
    'C7': { nome: 'C7', cordas: [-1,3,2,3,1,0], dedos: ['','3','2','4','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'G7': { nome: 'G7', cordas: [3,2,0,0,0,1], dedos: ['3','2','','','','1'], pestana: false, casaInicial:  0, mostrarNumero: false },
    'D7': { nome: 'D7', cordas: [-1,-1,0,2,1,2], dedos: ['','','','2','1','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'A7': { nome: 'A7', cordas: [-1,0,2,0,2,0], dedos: ['','','2','','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'E7': { nome: 'E7', cordas: [0,2,0,1,0,0], dedos: ['','2','0','1','0',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'E71': { nome: 'E7', cordas: [0,2,2,1,3,0], dedos: ['','2','3','1','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'B7': { nome: 'B7', cordas: [-1,2,1,2,0,2], dedos: ['','2','1','3','','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

// Menor 7
    'Dm7': { nome: 'Dm7', cordas: [-1,-1,0,2,1,1], dedos: ['','','','3','1','2'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Em7': { nome: 'Em7', cordas: [0,2,0,0,0,0], dedos: ['','2','','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Am7': { nome: 'Am7', cordas: [-1,0,2,0,1,0], dedos: ['','','2','0','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },

// Maior 6
    'F6': { nome: 'F6', cordas: [1,-1,0,2,1,-1], dedos: ['1','','','3','2',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    
};

// Exporta para uso global (caso esteja em um ambiente modular)
if (typeof window !== 'undefined') {
    window.ACORDES = ACORDES;
}

console.log("🔍 Acorde:", sigla, "fonte:", 
    ACORDES[sigla] ? "ACORDES" : 
    (bibliotecaAcordes && bibliotecaAcordes[sigla]) ? "bibliotecaAcordes" : 
    "dinâmico", 
    "casaInicial:", acorde.casaInicial);
