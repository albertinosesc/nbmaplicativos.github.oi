// ============================================
// ACORDES PARA INICIANTES (Versão simplificada)
// ============================================

const ACORDES_INICIANTE = {
    'C': { 
        nome: 'Dó Maior', 
        cordas: [0,1,0,2,3,0], 
        dedos: ['','1','','2','3',''], 
        pestana: false, 
        casaInicial: 1 
    },
    'D': { 
        nome: 'Ré Maior', 
        cordas: [0,0,1,2,3,2], 
        dedos: ['','','1','2','3','4'], 
        pestana: false, 
        casaInicial: 1 
    },
    'E': { 
        nome: 'Mi Maior', 
        cordas: [0,2,2,1,0,0], 
        dedos: ['','2','3','1','',''], 
        pestana: false, 
        casaInicial: 1 
    },
    'G': { 
        nome: 'Sol Maior', 
        cordas: [3,2,0,0,0,3], 
        dedos: ['2','1','','','','3'], 
        pestana: false, 
        casaInicial: 1 
    },
    'A': { 
        nome: 'Lá Maior', 
        cordas: [0,0,2,2,2,0], 
        dedos: ['','','2','3','4',''], 
        pestana: false, 
        casaInicial: 1 
    },
    'Am': { 
        nome: 'Lá Menor', 
        cordas: [0,1,2,2,0,0], 
        dedos: ['','1','2','3','',''], 
        pestana: false, 
        casaInicial: 1 
    },
    'Em': { 
        nome: 'Mi Menor', 
        cordas: [0,2,2,0,0,0], 
        dedos: ['','2','3','','',''], 
        pestana: false, 
        casaInicial: 1 
    },
    'Dm': { 
        nome: 'Ré Menor', 
        cordas: [0,0,1,2,3,1], 
        dedos: ['','','1','2','3','4'], 
        pestana: false, 
        casaInicial: 1 
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ACORDES_INICIANTE;
}