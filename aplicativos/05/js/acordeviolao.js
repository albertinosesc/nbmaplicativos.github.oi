// ============================================
// DICIONÁRIO DE ACORDES PARA VIOLÃO - CORRIGIDO
// ============================================

const ACORDES = {
// ========== Maior ==========
    'C': { nome: 'C', cordas: [-1,3,2,0,1,0], dedos: ['','3','2','','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'G': { nome: 'G', cordas: [3,2,0,0,0,3], dedos: ['2','1','','','','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'D': { nome: 'D', cordas: [-1,-1,0,2,3,2], dedos: ['','','','1','3','2'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'A': { nome: 'A', cordas: [-1,0,2,2,2,0], dedos: ['','','1','2','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'E': { nome: 'E', cordas: [0,2,2,1,0,0], dedos: ['','2','3','1','',''], pestana: false, casaInicial: 0, mostrarNumero: false },

// ========== Menor ==========
    'Dm': { nome: 'Dm', cordas: [-1,-1,0,2,3,1], dedos: ['','','','2','3','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Em': { nome: 'Em', cordas: [0,2,2,0,0,0], dedos: ['','2','3','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Am': { nome: 'Am', cordas: [-1,0,2,2,1,0], dedos: ['','','2','3','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Cm': { nome: 'Cm', cordas: [-1,3,1,0,1,-1], dedos: ['','4','1','','2',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    
//========== Maior 7 ==========
    'C7': { nome: 'C7', cordas: [-1,3,2,3,1,0], dedos: ['','3','2','4','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'G7': { nome: 'G7', cordas: [3,2,0,0,0,1], dedos: ['3','2','','','','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'D7': { nome: 'D7', cordas: [-1,-1,0,2,1,2], dedos: ['','','','2','1','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'A7': { nome: 'A7', cordas: [-1,0,2,0,2,0], dedos: ['','','2','','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'E7': { nome: 'E7', cordas: [0,2,0,1,0,0], dedos: ['','2','0','1','0',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'E71': { nome: 'E7', cordas: [0,2,2,1,3,0], dedos: ['','2','3','1','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'B7': { nome: 'B7', cordas: [-1,2,1,2,0,2], dedos: ['','2','1','3','','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

// ========== Menor 7 ==========
    'Dm7': { nome: 'Dm7', cordas: [-1,-1,0,2,1,1], dedos: ['','','','3','1','2'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Em7': { nome: 'Em7', cordas: [0,2,0,0,0,0], dedos: ['','2','','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Am7': { nome: 'Am7', cordas: [-1,0,2,0,1,0], dedos: ['','','2','0','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },


// ========== add9 ==========
'Cadd9': { nome: 'Cadd9', cordas: [-1,3,2,0,3,0], dedos: ['','2','1','','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },



// ========== Sus2 ==========
    'Asus2': { nome: 'Asus2', cordas: [-1,0,2,2,0,0], dedos: ['','','1','2','',''], pestana: false, casaInicial: 0, mostrarNumero: false },



// ========== Sus4 ==========
    'A4': { nome: 'A4', cordas: [-1,0,2,2,3,0], dedos: ['','','1','2','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'C4': { nome: 'A4', cordas: [-1,3,3,0,1,-1], dedos: ['','3','4','','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },


// ========== Maior 6 ==========
    'A6': {nome:'A6', cordas: [-1,0,2,2,2,2], dedos: ['','','1','1','1','1'],  pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
    'B6': { nome: 'B6', cordas: [-1,2,1,1,0,-1], dedos: ['','3','1','2','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'C6': { nome: 'A6', cordas: [-1,3,2,2,1,0], dedos: ['','4','2','3','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },


// ========== Maior 6(9) ==========
    'C6(9)': {nome:'C6(9)', cordas: [-1,4,2,2,4,4], dedos: ['','2','1','1','3','4'],  pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
    



// ========== Maior 7+ ==========
    'A7+': { nome: 'A7+', cordas: [-1,0,2,1,2,0], dedos: ['','','2','1','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'C7+': { nome: 'C7+', cordas: [-1,3,2,0,0,0], dedos: ['','3','2','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },


// ========== 7(4) ==========
    'A7(4)': { nome: 'A7(4)', cordas: [-1,0,2,0,3,0], dedos: ['','','2','','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'C7(4)': { nome: 'C7(4)', cordas: [-1,3,3,3,1,-1], dedos: ['','2','3','4','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },


// ========== Maior 11 ==========
    'A11': { nome: 'A11', cordas: [-1,0,0,0,0,0], dedos: ['','','','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'B11': { nome:'B11', cordas: [-1,2,2,2,2,2], dedos: ['','1','1','1','1','1'],  pestana: true, pestanaCordas: [1,2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
    'C11': { nome: 'C11', cordas: [-1,3,-1,3,4,1], dedos: ['','2','','3','4','1'], pestana: false, casaInicial: 0, mostrarNumero: false },



 // ========== Maior 5+ ==========
    'A5+': { nome: 'A5+', cordas: [-1,0,-1,2,2,1], dedos: ['','','','2','3','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Bb5+': { nome: 'Bb5+', cordas: [-1,1,-1,1,3,2], dedos: ['','1','','2','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'C5+': { nome: 'C5+', cordas: [-1,3,2,1,1,-1], dedos: ['','3','2','1','1',''],  pestana: true, pestanaCordas: [3,4], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },
    



// ========== Menor 6 ==========
    'Am6': { nome: 'Am6', cordas: [-1,0,2,0,1,2], dedos: ['','','2','0','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Bm6': { nome: 'Bm6', cordas: [-1,0,2,0,1,2], dedos: ['','','2','0','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Cm6': { nome: 'Cm6', cordas: [-1,3,-1,2,4,3], dedos: ['','2','','1','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    

// ========== Menor 7(b5) ==========
    'Am7(b5)': { nome: 'Am7(b5)', cordas: [-1,0,1,2,1,3], dedos: ['','','1','2','1','4'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },
    'Bbm7(b5)': { nome: 'Bbm7(b5)', cordas: [-1,2,0,1,4,2], dedos: ['','2','','1','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Bm7(b5)': { nome: 'Bm7(b5)', cordas: [-1,2,3,2,3,-1], dedos: ['','1','3','2','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    

// ========== Menor 7+ ==========
    'Cm7+': { nome: 'Cm7+', cordas: [-1,3,1,0,0,-1], dedos: ['','3','1','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    


// ========== Menor 9 ==========
    'Am9': { nome: 'Am9', cordas: [-1,0,2,4,1,3], dedos: ['','','2','4','1','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Bm9': { nome: 'Bm9', cordas: [-1,2,0,2,2,2], dedos: ['','1','','2','3','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

    
// ========== Menor 7+ ==========
    'Am7+': { nome: 'Am7+', cordas: [-1,0,2,1,1,0], dedos: ['','','3','1','2','0'], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Bm7+': { nome: 'Bm7+', cordas: [-1,2,-1,3,3,2], dedos: ['','1','','3','4','2'], pestana: false, casaInicial: 0, mostrarNumero: false },


// ========== Menor 11 ==========
    'Am11': { nome: 'Am11', cordas: [-1,0,0,0,1,0], dedos: ['','','','','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'Bm11': { nome:'Bm11', cordas: [-1,2,2,2,4,2], dedos: ['','1','1','1','2','1'],  pestana: true, pestanaCordas: [1,2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
    'Cm11': { nome: 'Cm11', cordas: [-1,3,0,3,3,1], dedos: ['','2','0','3','4','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    


// ========== Maior 7(#9) ==========
    'Bb7(#9)': { nome: 'Bb7(#9)', cordas: [-1,1,0,1,2,0], dedos: ['','1','','2','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'B7(#9)': { nome: 'B7(#9)', cordas: [-1,2,1,2,4,-1], dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'C7(#9)': { nome: 'C7(#9)', cordas: [-1,3,2,2,4,-1], dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },


// ========== Maior 9 ==========
    'Bb9': { nome: 'Bb9', cordas: [-1,1,0,1,1,0], dedos: ['','2','','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'B9': { nome: 'B9', cordas: [-1,2,1,2,2,-1], dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    'C9': { nome: 'C9', cordas: [-1,3,2,3,3,-1], dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },

// ========== Maior 7(b9) ==========
   'C7(b9)': { nome: 'C7(b9)', cordas: [-1,3,2,3,2,-1], dedos: ['','3','1','4','2',''], pestana: false, casaInicial: 0, mostrarNumero: false },

// ========== Maior 13(b9) ==========
    'C13(b9)': { nome: 'C13(b9)', cordas: [-1,4,2,4,2,6], dedos: ['','2','1','3','1','4'],  pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
    
// ========== °7 ==========
    'Bb°7': { nome: 'Bb°7', cordas: [-1,1,2,0,2,-1], dedos: ['','2','3','0','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
     'B°7': { nome: 'B°7', cordas: [-1,1,2,0,2,-1], dedos: ['','2','3','0','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },


    // ========== Maior 7(5+) ==========



};

// Exporta para uso global
if (typeof window !== 'undefined') {
    window.ACORDES = ACORDES;
}
