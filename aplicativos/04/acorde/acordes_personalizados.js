// ============================================
// ACORDES PERSONALIZADOS (Usuário pode editar)
// ============================================

const ACORDES_PERSONALIZADOS = {
    // Exemplos de acordes personalizados
    'C7': { 
        nome: 'Dó com Sétima', 
        cordas: [0,1,0,2,3,0], 
        dedos: ['','1','','2','3',''], 
        pestana: false, 
        casaInicial: 1 
    },

        'C7+': { 
        nome: 'Dó com Sétima', 
        cordas: [-1,3,2,0,0,0], 
        dedos: ['','3','2','','',''], 
        pestana: false, 
        casaInicial: 1 
    },
    'G7': { 
        nome: 'Sol com Sétima', 
        cordas: [3,2,0,0,0,1], 
        dedos: ['2','1','','','','3'], 
        pestana: false, 
        casaInicial: 1 
    },
    'A7': { 
        nome: 'Lá com Sétima', 
        cordas: [0,0,2,0,2,0], 
        dedos: ['','','2','','3',''], 
        pestana: false, 
        casaInicial: 1 
    },
    'D7': { 
        nome: 'Ré com Sétima', 
        cordas: [0,0,1,2,1,2], 
        dedos: ['','','1','3','2','4'], 
        pestana: false, 
        casaInicial: 1 
    },
    'E7': { 
        nome: 'Mi com Sétima', 
        cordas: [0,2,0,1,0,0], 
        dedos: ['','2','','1','',''], 
        pestana: false, 
        casaInicial: 1 
    },
    'B7': { 
        nome: 'Si com Sétima', 
        cordas: [2,1,2,0,2,0], 
        dedos: ['2','1','3','','4',''], 
        pestana: false, 
        casaInicial: 2 
    }
};

// Mesclar com acordes base
if (typeof ACORDES_BASE !== 'undefined') {
    Object.assign(ACORDES_BASE, ACORDES_PERSONALIZADOS);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ACORDES_PERSONALIZADOS;
}