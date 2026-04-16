// ============================================
// ACORDES MAIORES - TOM DE DÓ (C)
// ============================================

const ACORDES_MAIOR_C = {
    // Fundamentais
    'C': {
        nome: 'Dó Maior',
        cordas: [-1,3,2,0,1,0],
        dedos: ['','3','2','','1',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'C'
    },
    'C6': {
        nome: 'Dó com Sexta (C6)',
        cordas: [-1,3,2,2,1,0],
        dedos: ['','4','2','3','1',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'C'
    },
    'C6/9': {
        nome: 'Dó com Sexta e Nona (C6/9)',
        cordas: [-1,3,2,2,3,0],
        dedos: ['','3','1','2','4',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'C'
    },
    'C7+': {
        nome: 'Dó com Sétima Maior (C7+)',
        cordas: [-1,3,2,0,0,0],
        dedos: ['','3','2','','',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'C'
    },
    'C7+/9': {
        nome: 'Dó com Sétima Maior e Nona (C7+/9)',
        cordas: [-1,3,2,4,3,0],
        dedos: ['','2','1','4','3',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'C'
    },
    'C7+/6': {
        nome: 'Dó com Sétima Maior e Sexta (C7+/6)',
        cordas: [-1,3,2,2,0,0],
        dedos: ['','3','1','2','',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'C'
    },
    'C7+/6(9)': {
        nome: 'Dó com Sétima Maior, Sexta e Nona (C7+/6/9)',
        cordas: [8,7,7,7,8,7],
        dedos: ['2','1','1','1','3','1'],
        pestana: [0,1,2,3,4,5], 
        casaInicial: 7,
        baixo: 'C'
    },
// ============================================
// ACORDES GERADOS AUTOMATICAMENTE
// Total: 2 acordes
// ============================================


    'T': {
    nome: 'Fá Maior',
    cordas: [1,3,3,2,1,1],
    dedos: ['1','3','4','2','1','1'],
    pestana: [0,1,2,3,4,5],
    casaInicial: 1,
    baixo: 'F'
},
    'teste2': {
    nome: 'Dó Maior',
    cordas: [-1,3,2,0,1,0],
    dedos: ['1','3','2','2','1','1'],
    pestana: false,
    casaInicial: 1,
    baixo: 'C'
},

    'teste1':  {
    nome: 'Fá Maior',
    cordas: [-1,-1,3,2,1,1],
    dedos: ['1','','3','2','1','1'],
    pestana: [2,3,4,5],
    casaInicial: 1,
    baixo: 'F'
},


// Para usar, mescle com seus acordes existentes:
// Object.assign(ACORDES, ACORDES_GERADOS);
    // 1ª Inversão (baixo na 3ª - E/Mi)
    'C/E': {
        nome: 'Dó Maior com baixo em Mi (C/E)',
        cordas: [0,1,0,2,3,0],
        dedos: ['','1','','2','3',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'E'
    },
    'C6/E': {
        nome: 'Dó com Sexta com baixo em Mi (C6/E)',
        cordas: [0,0,2,2,2,0],
        dedos: ['','','2','3','4',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'E'
    },
    'C6/9/E': {
        nome: 'Dó com Sexta e Nona com baixo em Mi (C6/9/E)',
        cordas: [0,0,2,2,2,0],
        dedos: ['','','2','3','4',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'E'
    },
    'C7+/E': {
        nome: 'Dó com Sétima Maior com baixo em Mi (C7+/E)',
        cordas: [0,1,0,2,3,0],
        dedos: ['','1','','2','3',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'E'
    },
    'C7+/9/E': {
        nome: 'Dó com Sétima Maior e Nona com baixo em Mi (C7+/9/E)',
        cordas: [0,1,0,2,3,0],
        dedos: ['','1','','2','3',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'E'
    },
    'C7+/6/E': {
        nome: 'Dó com Sétima Maior e Sexta com baixo em Mi (C7+/6/E)',
        cordas: [0,1,0,2,3,0],
        dedos: ['','1','','2','3',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'E'
    },
    'C7+/6(9)/E': {
        nome: 'Dó com Sétima Maior, Sexta e Nona com baixo em Mi (C7+/6/9/E)',
        cordas: [0,1,0,2,3,0],
        dedos: ['','1','','2','3',''],
        pestana: false,
        casaInicial: 1,
        baixo: 'E'
    },

    // 2ª Inversão (baixo na 5ª - G/Sol)
    'C/G': {
        nome: 'Dó Maior com baixo em Sol (C/G)',
        cordas: [3,2,0,0,0,3],
        dedos: ['2','1','','','','3'],
        pestana: false,
        casaInicial: 1,
        baixo: 'G'
    },
    'C6/G': {
        nome: 'Dó com Sexta com baixo em Sol (C6/G)',
        cordas: [3,2,0,0,0,3],
        dedos: ['2','1','','','','3'],
        pestana: false,
        casaInicial: 1,
        baixo: 'G'
    },
    'C6/9/G': {
        nome: 'Dó com Sexta e Nona com baixo em Sol (C6/9/G)',
        cordas: [3,2,0,0,0,3],
        dedos: ['2','1','','','','3'],
        pestana: false,
        casaInicial: 1,
        baixo: 'G'
    },
    'C7+/G': {
        nome: 'Dó com Sétima Maior com baixo em Sol (C7+/G)',
        cordas: [3,2,0,0,0,3],
        dedos: ['2','1','','','','3'],
        pestana: false,
        casaInicial: 1,
        baixo: 'G'
    },
    'C7+/9/G': {
        nome: 'Dó com Sétima Maior e Nona com baixo em Sol (C7+/9/G)',
        cordas: [3,2,0,0,0,3],
        dedos: ['2','1','','','','3'],
        pestana: false,
        casaInicial: 1,
        baixo: 'G'
    },
    'C7+/6/G': {
        nome: 'Dó com Sétima Maior e Sexta com baixo em Sol (C7+/6/G)',
        cordas: [3,2,0,0,0,3],
        dedos: ['2','1','','','','3'],
        pestana: false,
        casaInicial: 1,
        baixo: 'G'
    },





    'C7+/6(9)/G': {
        nome: 'Dó com Sétima Maior, Sexta e Nona com baixo em Sol (C7+/6/9/G)',
        cordas: [3,2,0,0,0,3],
        dedos: ['2','1','','','','3'],
        pestana: false,
        casaInicial: 1,
        baixo: 'G'
    },

    'Cm': {
    nome: 'Cm',
    cordas: [-1,3,5,5,4,3],
    dedos: ['','1','3','4','2','1'],
    pestana: [1,2,3,4,5],
    casaInicial: 3,
    baixo: 'C'
},

    'j': {
        nome: 'Dó com Sétima Maior, Sexta e Nona (C7+/6/9)',
        cordas: [8,7,7,7,8,7],
        dedos: ['2','1','1','1','3','1'],
        pestana: [0,1,2,3,4,5], 
        casaInicial: 7,
        baixo: 'C'
    },
    
};

// Exportar
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ACORDES_MAIOR_C;
}

