// ============================================
// ACORDES COM SUSTENIDO
// ============================================

const ACORDES_SUSTENIDOS = {
    'C#': { 
        nome: 'Dó Sustenido', 
        cordas: [4,4,6,6,6,4], 
        dedos: ['1','1','3','4','2','1'], 
        pestana: [0,1,2,3,4,5], 
        casaInicial: 4 
    },
    'D#': { 
        nome: 'Ré Sustenido', 
        cordas: [6,6,8,8,8,6], 
        dedos: ['1','1','3','4','2','1'], 
        pestana: [0,1,2,3,4,5], 
        casaInicial: 6 
    },
    'F#': { 
        nome: 'Fá Sustenido', 
        cordas: [2,4,4,3,2,2], 
        dedos: ['1','3','4','2','1','1'], 
        pestana: [0,1,2,3,4,5], 
        casaInicial: 2 
    },
    'G#': { 
        nome: 'Sol Sustenido', 
        cordas: [4,4,6,6,6,4], 
        dedos: ['1','1','3','4','2','1'], 
        pestana: [0,1,2,3,4,5], 
        casaInicial: 4 
    },
    'A#': { 
        nome: 'Lá Sustenido', 
        cordas: [6,6,8,8,8,6], 
        dedos: ['1','1','3','4','2','1'], 
        pestana: [0,1,2,3,4,5], 
        casaInicial: 6 
    },
    'C#m': { 
        nome: 'Dó Sustenido Menor', 
        cordas: [4,4,6,6,5,4], 
        dedos: ['1','1','3','4','2','1'], 
        pestana: [0,1,2,3,4,5], 
        casaInicial: 4 
    },
    'F#m': { 
        nome: 'Fá Sustenido Menor', 
        cordas: [2,4,4,2,2,2], 
        dedos: ['1','3','4','1','1','1'], 
        pestana: [0,1,2,3,4,5], 
        casaInicial: 2 
    },
    'G#m': { 
        nome: 'Sol Sustenido Menor', 
        cordas: [4,4,6,6,5,4], 
        dedos: ['1','1','3','4','2','1'], 
        pestana: [0,1,2,3,4,5], 
        casaInicial: 4 
    }
};

// Mesclar com acordes base
if (typeof ACORDES_BASE !== 'undefined') {
    Object.assign(ACORDES_BASE, ACORDES_SUSTENIDOS);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ACORDES_SUSTENIDOS;
}