// ============================================
// ACORDES BASE - Dicionário Principal
// ============================================

const ACORDES_BASE = {
    // Acordes Maiores
    'C': { 
        nome: 'Dó Maior', 
        cordas: [-1,3,2,0,1,0], 
        dedos: ['','3','2','','1',''], 
        pestana: false, 
        casaInicial: 1 
    },
    'D': { 
        nome: 'Ré Maior', 
        cordas: [-1,-1,0,2,3,2], 
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
    'F': { 
        nome: 'Fá Maior', 
        cordas: [1,3,3,2,1,1], 
        dedos: ['1','3','4','2','1','1'], 
        pestana: [0,1,2,3,4,5], 
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
    'B': { 
        nome: 'Si Maior', 
        cordas: [2,3,4,4,2,2], 
        dedos: ['1','2','3','4','1','1'], 
        pestana: [0,4,5], 
        casaInicial: 2 
    },

    // Acordes Menores
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
    },
    'Bm': { 
        nome: 'Si Menor', 
        cordas: [-1,2,4,4,3,2], 
        dedos: ['','1','3','4','2','1'], 
        pestana: [1,2,3,4,5], 
        casaInicial: 2 
    },
    'Fm': { 
        nome: 'Fá Menor', 
        cordas: [1,3,3,1,1,1], 
        dedos: ['1','3','4','1','1','1'], 
        pestana: [0,1,2,3,4,5], 
        casaInicial: 1 
    },
    'Cm': { 
        nome: 'Dó Menor', 
        cordas: [3,4,5,5,3,3], 
        dedos: ['1','2','3','4','1','1'], 
        pestana: [0,4,5], 
        casaInicial: 3 
    }
};

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ACORDES_BASE;
}