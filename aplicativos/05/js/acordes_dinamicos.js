// ============================================
// DICIONÁRIO DINÂMICO DE ACORDES
// ============================================

const FORMAS_INFINITAS = {

    // ===== CORDAS BASE 6 (Mi) =====
    '1': { nome: 'Maior', cordaBase: 6, cordas: [1, 3, 3, 2, 1, 1], dedos: ['1', '3', '4', '2', '1', '1'], pestana: [0,1,2,3,4,5] },
    '2': { nome: 'Menor', cordaBase: 6, cordas: [1, 3, 3, 1, 1, 1], dedos: ['1', '3', '4', '1', '1', '1'], pestana: [0,1,2,3,4,5] },
    '3': { nome: 'Sétima', cordaBase: 6, cordas: [1, 3, 1, 2, 4, 1], dedos: ['1', '3', '1', '2', '4', '1'], pestana: [0,1,2,3,4,5] },
    
    // ===== CORDAS BASE 5 (Lá) =====
    '4': { nome: 'Maior', cordaBase: 5, cordas: [-1, 1, 3, 3, 3, 1], dedos: ['', '1', '3', '4', '2', '1'], pestana: [1,2,3,4,5] },
    '5': { nome: 'Menor', cordaBase: 5, cordas: [-1, 1, 3, 3, 2, 1], dedos: ['', '1', '3', '4', '2', '1'], pestana: [1,2,3,4,5] },
    '6': { nome: 'Sétima', cordaBase: 5, cordas: [-1, 1, 3, 1, 3, 1], dedos: ['', '1', '3', '1', '4', '1'], pestana: [1,2,3,4,5] },
    
    // ===== CORDAS BASE 4 (Ré) =====
    '7': { nome: 'Maior', cordaBase: 4, cordas: [-1, -1, 1, 3, 4, 3], dedos: ['', '', '1', '3', '4', '2'], pestana: [2,3,4,5] },
    '8': { nome: 'Menor', cordaBase: 4, cordas: [-1, -1, 1, 3, 4, 2], dedos: ['', '', '1', '3', '4', '2'], pestana: [2,3,4,5] },
    '9': { nome: 'Sétima', cordaBase: 4, cordas: [-1, -1, 1, 3, 2, 3], dedos: ['', '', '1', '3', '2', '4'], pestana: [2,3,4,5] },

    // =====Formação 1-7-3-5 (fundamnetal na 6 Corda) =====
    '10': { nome: '7+', cordaBase: 6, cordas: [1, -1, 2, 2, 1, -1], dedos: ['1', '', '3', '4', '2', ''], pestana: false },
    '11': { nome: 'm7', cordaBase: 6, cordas: [1, -1, 1, 1, 1, -1], dedos: ['1', '', '2', '3', '4', ''], pestana: false },
    '12': { nome: 'm7(b5)', cordaBase: 6, cordas: [2, -1, 2, 2, 1, -1], dedos: ['2', '', '3', '4', '1', ''], pestana: false },
    '13': { nome: '7', cordaBase: 6, cordas: [1, -1, 1, 2, 1, -1], dedos: ['1', '', '2', '4', '3', ''], pestana: false },
    '14': { nome: '7+(5+)', cordaBase: 6, cordas: [1, -1, 2, 2, 2, -1], dedos: ['1', '', '2', '3', '4', ''], pestana: false },
    '15': { nome: 'm7+', cordaBase: 6, cordas: [1, -1, 2, 1, 1, -1], dedos: ['1', '', '2', '4', '3', ''], pestana: false },
    '16': { nome: '°7', cordaBase: 6, cordas: [2, -1, 1, 2, 1, -1], dedos: ['3', '', '1', '4', '2', ''], pestana: false },


    // ===== Formação 1-5-7-3 (fundamental na 5ª corda) =====
   '17': { nome: '7+',    cordaBase: 5, cordas: [-1, 1, 3, 2, 3, 1], dedos: ['', '1', '3', '2', '4', '1'], pestana: [1,2,3,4,5] },
   '18': { nome: '7',     cordaBase: 5, cordas: [-1, 1, 3, 1, 3, 1],  dedos: ['', '1', '3', '1', '4', '1'], pestana: [1,2,3,4,5] },
   '19': { nome: 'm7',    cordaBase: 5, cordas: [-1, 1, 3, 1, 2, 1],  dedos: ['', '1', '3', '1', '2', '1'], pestana: [1,2,3,4,5] },
   '20': { nome: 'm7(b5)',cordaBase: 5, cordas: [-1, 1, 2, 1, 2, -1],  dedos: ['', '1', '3', '2', '4', ''], pestana: false },
   '21': { nome: '°7',    cordaBase: 5, cordas: [-1, 2, 3, 1, 3, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
   '22': { nome: '7(5+)', cordaBase: 5, cordas: [-1, 1, 4, 2, 3, -1], dedos: ['', '1', '4', '2', '3', ''], pestana: false },
   '23': { nome: 'm(7+)', cordaBase: 5, cordas: [-1, 1, 3, 2, 2, -1], dedos: ['', '1', '4', '2', '3', ''], pestana: false },

// ===== Formação 1-5-7-3 (fundamental na 4ª corda) =====
'24': { nome: '7+',    cordaBase: 4, cordas: [-1, -1, 1, 3, 3, 3], dedos: ['', '', '1', '2', '3', '4'], pestana: false },
'25': { nome: '7',     cordaBase: 4, cordas: [-1, -1, 1, 3, 2, 3], dedos: ['', '', '1', '3', '2', '4'], pestana: false },
'26': { nome: 'm7',    cordaBase: 4, cordas: [-1, -1, 1, 3, 2, 2], dedos: ['', '', '1', '4', '2', '3'], pestana: false },
'27': { nome: 'm7(b5)',cordaBase: 4, cordas: [-1, -1, 1, 2, 2, 2], dedos: ['', '', '1', '2', '3', '4'], pestana: false },
'28': { nome: '°7',    cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 2], dedos: ['', '', '1', '3', '2', '4'], pestana: false },
'29': { nome: '7(5+)', cordaBase: 4, cordas: [-1, -1, 1, 4, 3, 3], dedos: ['', '', '1', '4', '2', '3'], pestana: false },
'30': { nome: 'm(7+)', cordaBase: 4, cordas: [-1, -1, 1, 3, 3, 2], dedos: ['', '', '1', '3', '4', '2'], pestana: false },



// ===== Formação 3-1-5-7 (6ª corda) =====
'31': { nome: '7+',    cordaBase: 6, cordas: [3, -1, 1, 3, 3, -1], dedos: ['2','','1','3','4',''], pestana: false },
'32': { nome: '7',     cordaBase: 6, cordas: [3, -1, 1, 3, 2, -1], dedos: ['3','','1','2','4',''], pestana: false },
'33': { nome: 'm7',    cordaBase: 6, cordas: [2, -1, 1, 3, 2, -1], dedos: ['2','','1','4','3',''], pestana: false },

'34': { nome: 'm7(b5)',cordaBase: 6, cordas: [2, -1, 1, 2, 2, -1], dedos: ['2','','1','3','4',''], pestana: false },

'35': { nome: '°7',    cordaBase: 6, cordas: [2, -1, 1, 2, 1, -1], dedos: ['3','','1','4','2',''], pestana: false },
'36': { nome: '7(5+)', cordaBase: 6, cordas: [3, -1, 1, 4, 3, -1], dedos: ['2','','1','4','3',''], pestana: false },
'37': { nome: 'm(7+)', cordaBase: 6, cordas: [2, -1, 1, 3, 3, -1], dedos: ['2','','1','3','4',''], pestana: false },

// ===== Formação 5-3-7-1 (6ª corda) =====
'38': { nome: '7+',    cordaBase: 6, cordas: [3, -1, 2, 4, 1, -1], dedos: ['3','','2','4','1',''], pestana: false },
'39': { nome: '7',     cordaBase: 6, cordas: [3, -1, 2, 3, 1, -1], dedos: ['3','','2','4','1',''], pestana: false },
'40': { nome: 'm7',    cordaBase: 6, cordas: [3, -1, 1, 3, 1, -1], dedos: ['3','','1','4','2',''], pestana: false },
'41': { nome: 'm7(b5)',cordaBase: 6, cordas: [2, -1, 1, 3, 1, -1], dedos: ['3','','1','4','2',''], pestana: false },
'42': { nome: '°7',    cordaBase: 6, cordas: [2, -1, 1, 2, 1, -1], dedos: ['3','','1','4','2',''], pestana: false },
'43': { nome: '7(5+)', cordaBase: 6, cordas: [4, -1, 2, 4, 1, -1], dedos: ['3','','2','4','1',''], pestana: false },
'44': { nome: 'm(7+)', cordaBase: 6, cordas: [3, -1, 1, 4, 1, -1], dedos: ['3','','1','4','2',''], pestana: false },

// ===== Formação 7-5-1-3 (6ª corda) =====
'45': { nome: '7+',    cordaBase: 6, cordas: [3, -1, 1, 1, 1, -1], dedos: ['4','','1','2','3',''], pestana: false },
'46': { nome: '7',     cordaBase: 6, cordas: [2, -1, 1, 1, 1, -1], dedos: ['4','','1','2','3',''], pestana: false },
'47': { nome: 'm7',    cordaBase: 6, cordas: [3, -1, 2, 2, 1, -1], dedos: ['4','','2','3','1',''], pestana: false },
'48': { nome: 'm7(b5)',cordaBase: 6, cordas: [2, -1, 1, 2, 2, -1], dedos: ['2','','1','3','4',''], pestana: false },
'49': { nome: '°7',    cordaBase: 6, cordas: [2, -1, 1, 2, 1, -1], dedos: ['3','','1','4','2',''], pestana: false },
'50': { nome: '7(5+)', cordaBase: 6, cordas: [3, -1, 2, 1, 1, -1], dedos: ['4','','3','1','2',''], pestana: false },
'51': { nome: 'm(7+)', cordaBase: 6, cordas: [4, -1, 2, 2, 1, -1], dedos: ['4','','2','3','1',''], pestana: false },


// ===== Formação 3-7-1-5 (fundamental na 5ª corda) =====
'52': { nome: '7+',    cordaBase: 5, cordas: [-1, 3, 5, 1, 4, -1], dedos: ['', '2', '4', '1', '3', ''], pestana: false },
'53': { nome: '7',     cordaBase: 5, cordas: [-1, 3, 4, 1, 4, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
'54': { nome: 'm7',    cordaBase: 5, cordas: [-1, 2, 4, 1, 4, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
'55': { nome: 'm7(b5)',cordaBase: 5, cordas: [-1, 2, 4, 1, 3, -1], dedos: ['', '2', '4', '1', '3', ''], pestana: false },
'56': { nome: '°7',    cordaBase: 5, cordas: [-1, 2, 3, 1, 3, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
'57': { nome: '7(5+)', cordaBase: 5, cordas: [-1, 3, 5, 1, 5, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
'58': { nome: 'm(7+)', cordaBase: 5, cordas: [-1, 2, 5, 1, 3, -1], dedos: ['', '2', '4', '1', '3', ''], pestana: false },

// ===== Formação 5-1-3-7 (fundamental na 5ª corda) =====
'59': { nome: '7+',    cordaBase: 5, cordas: [-1, 2, 2, 1, 4,-1], dedos:  ['', '2', '3', '1', '4', ''], pestana: false },
'60': { nome: '7',     cordaBase: 5, cordas: [-1, 2, 2, 1, 3, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
'61': { nome: 'm7',    cordaBase: 5, cordas: [-1, 3, 3, 1, 4, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
'62': { nome: 'm7(b5)',cordaBase: 5, cordas: [-1, 2, 3, 1, 4, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
'63': { nome: '°7',    cordaBase: 5, cordas: [-1, 2, 3, 1, 3, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
'64': { nome: '7(5+)', cordaBase: 5, cordas: [-1, 3, 2, 1, 4, -1], dedos: ['', '3', '2', '1', '4', ''], pestana: false },
'65': { nome: 'm(7+)', cordaBase: 5, cordas: [-1, 3, 3, 1, 5, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },

// ===== Formação 7-3-5-1 (fundamental na 5ª corda) =====
'66': { nome: '7+',    cordaBase: 5, cordas: [-1, 3, 3, 1, 2, -1], dedos: ['', '3', '4', '1', '2', ''], pestana: false },
'67': { nome: '7',     cordaBase: 5, cordas: [-1, 2, 3, 1, 2, -1], dedos: ['', '2', '4', '1', '3', ''], pestana: false },
'68': { nome: 'm7',    cordaBase: 5, cordas: [-1, 2, 2, 1, 2, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
'69': { nome: 'm7(b5)',cordaBase: 5, cordas: [-1, 3, 3, 1, 3, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
'70': { nome: '°7',    cordaBase: 5, cordas: [-1, 2, 3, 1, 3, -1], dedos: ['', '2', '3', '1', '4', ''], pestana: false },
'71': { nome: '7(5+)', cordaBase: 5, cordas: [-1, 2, 2, 1, 1, -1], dedos: ['', '3', '4', '1', '2', ''], pestana: false },
'72': { nome: 'm(7+)', cordaBase: 5, cordas: [-1, 3, 2, 1, 2, -1], dedos: ['', '4', '2', '1', '3', ''], pestana: false },

// ===== Formação 3-7-1-5 (fundamental na 4ª corda) =====
'73': { nome: '7+',    cordaBase: 4, cordas: [-1, -1, 2, 4, 1, 3], dedos: ['', '', '2', '4', '1', '3'], pestana: false },
'74': { nome: '7',     cordaBase: 4, cordas: [-1, -1, 2, 3, 1, 4], dedos: ['', '', '2', '3', '1', '4'], pestana: false },
'75': { nome: 'm7',    cordaBase: 4, cordas: [-1, -1, 1, 3, 1, 3], dedos: ['', '', '1', '3', '2', '4'], pestana: false },
'76': { nome: 'm7(b5)',cordaBase: 4, cordas: [-1, -1, 1, 3, 1, 2], dedos: ['', '', '1', '3', '2', '4'], pestana: false },
'77': { nome: '°7',    cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 2], dedos: ['', '', '1', '3', '2', '4'], pestana: false },
'78': { nome: '7(5+)', cordaBase: 4, cordas: [-1, -1, 2, 4, 1, 4], dedos: ['', '', '2', '3', '1', '4'], pestana: false },
'79': { nome: 'm(7+)', cordaBase: 4, cordas: [-1, -1, 1, 4, 1, 3], dedos: ['', '', '1', '4', '2', '3'], pestana: false },

// ===== Formação 5-1-3-7 (fundamental na 4ª corda) =====
'80': { nome: '7+',    cordaBase: 4, cordas: [-1, -1, 1, 1, 1, 3], dedos: ['', '', '1', '2', '3', '4'], pestana: false },
'81': { nome: '7',     cordaBase: 4, cordas: [-1, -1, 1, 1, 1, 2], dedos: ['', '', '1', '2', '3', '4'], pestana: false },
'82': { nome: 'm7',    cordaBase: 4, cordas: [-1, -1, 2, 2, 1, 3], dedos: ['', '', '2', '3', '1', '4'], pestana: false },
'83': { nome: 'm7(b5)',cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 3], dedos: ['', '', '1', '3', '2', '4'], pestana: false },
'84': { nome: '°7',    cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 2], dedos: ['', '', '1', '3', '2', '4'], pestana: false },
'85': { nome: '7(5+)', cordaBase: 4, cordas: [-1, -1, 2, 1, 1, 3], dedos: ['', '', '3', '1', '2', '4'], pestana: false },
'86': { nome: 'm(7+)', cordaBase: 4, cordas: [-1, -1, 2, 2, 1, 4], dedos: ['', '', '2', '3', '1', '4'], pestana: false },

// ===== Formação 7-3-5-1 (fundamental na 4ª corda) =====
'87': { nome: '7+',    cordaBase: 4, cordas: [-1, -1, 2, 2, 1, 1], dedos: ['', '', '3', '4', '1', '2'], pestana: false },
'88': { nome: '7',     cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 1], dedos: ['', '', '1', '4', '2', '3'], pestana: false },
'89': { nome: 'm7',    cordaBase: 4, cordas: [-1, -1, 1, 1, 1, 1], dedos: ['', '', '1', '2', '3', '4'], pestana: false },
'90': { nome: 'm7(b5)',cordaBase: 4, cordas: [-1, -1, 2, 2, 1, 2], dedos: ['', '', '2', '3', '1', '4'], pestana: false },
'91': { nome: '°7',    cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 2], dedos: ['', '', '1', '3', '2', '4'], pestana: false },
'92': { nome: '7(5+)', cordaBase: 4, cordas: [-1, -1, 2, 2, 2, 1], dedos: ['', '', '2', '3', '4', '1'], pestana: false },
'93': { nome: 'm(7+)', cordaBase: 4, cordas: [-1, -1, 2, 1, 1, 1], dedos: ['', '', '4', '1', '2', '3'], pestana: false },


'94': { nome: '7(b9)', cordaBase: 5, cordas: [-1, 2, 1, 2, 1, -1], dedos: ['', '3', '1', '4', '2', ''], pestana: false },
'95': { nome: 'm6', cordaBase: 6, cordas: [3, -1, 2, 3, 3, -1], dedos: ['2', '', '1', '3', '4', ''], pestana: false },
'96': { nome: '7(13)', cordaBase: 6, cordas: [2, -1, 2, 3, 4, -1], dedos: ['1', '', '2', '3', '4', ''], pestana: false },
'97': { nome: '7(b13)', cordaBase: 6, cordas: [2, -1, 2, 3, 3, -1], dedos: ['2', '', '1', '3', '4', ''], pestana: false },
'98': { nome: '7(9)', cordaBase: 5, cordas: [-1, 2, 1, 2, 2, -1], dedos: ['', '2', '1', '3', '4', ''], pestana: false },
'99': { nome: '7(9)', cordaBase: 4, cordas: [-1, -1, 2, 1, 3, 2], dedos: ['', '', '2', '1', '4', '3'], pestana: false },

// fazer
'100': { nome: 'C', cordas: [-1,3,2,0,1,0], dedos: ['','3','2','','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '101': { nome: 'G', cordas: [3,2,0,0,0,3], dedos: ['2','1','','','','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '102': { nome: 'G', cordas: [3,2,0,0,3,3], dedos: ['2','1','','','3','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '103': { nome: 'D', cordas: [-1,-1,0,2,3,2], dedos: ['','','','1','3','2'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '104': { nome: 'A', cordas: [-1,0,2,2,2,0], dedos: ['','','1','2','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '105': { nome: 'E', cordas: [0,2,2,1,0,0], dedos: ['','2','3','1','',''], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Menor ==========
    '106': { nome: 'Dm', cordas: [-1,-1,0,2,3,1], dedos: ['','','','2','3','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '107': { nome: 'Em', cordas: [0,2,2,0,0,0], dedos: ['','2','3','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '108': { nome: 'Am', cordas: [-1,0,2,2,1,0], dedos: ['','','2','3','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '109': { nome: 'Cm', cordas: [-1,3,1,0,1,-1], dedos: ['','4','1','','2',''], pestana: false, casaInicial: 0, mostrarNumero: false },

    //========== Maior 7 ==========
    '110': { nome: 'C7', cordas: [-1,3,2,3,1,0], dedos: ['','3','2','4','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '111': { nome: 'G7', cordas: [3,2,0,0,0,1], dedos: ['3','2','','','','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '112': { nome: 'D7', cordas: [-1,-1,0,2,1,2], dedos: ['','','','2','1','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '113': { nome: 'A7', cordas: [-1,0,2,0,2,0], dedos: ['','','2','','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '114': { nome: 'E7', cordas: [0,2,0,1,0,0], dedos: ['','2','0','1','0',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '115': { nome: 'E7', cordas: [0,2,2,1,3,0], dedos: ['','2','3','1','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '116': { nome: 'B7', cordas: [-1,2,1,2,0,2], dedos: ['','2','1','3','','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Menor 7 ==========
    '117': { nome: 'Dm7', cordas: [-1,-1,0,2,1,1], dedos: ['','','','3','1','2'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '118': { nome: 'Em7', cordas: [0,2,0,0,0,0], dedos: ['','2','','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '119': { nome: 'Am7', cordas: [-1,0,2,0,1,0], dedos: ['','','2','0','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== add9 ==========
    '120': { nome: 'Cadd9', cordas: [-1,3,2,0,3,0], dedos: ['','2','1','','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Sus2 ==========
    '121': { nome: 'A2', cordas: [-1,0,2,2,0,0], dedos: ['','','1','2','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '122': { nome: 'D2', cordas: [-1,-1,0,2,3,0], dedos: ['','','','1','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '123': { nome: 'G2', cordas: [3,-1,0,2,3,3], dedos: ['2','','','1','3','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Sus4 ==========
    '124': { nome: 'A4', cordas: [-1,0,2,2,3,0], dedos: ['','','1','2','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '125': { nome: 'C4', cordas: [-1,3,3,0,1,-1], dedos: ['','3','4','','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '126': { nome: 'D4', cordas: [-1,-1,0,2,3,3], dedos: ['','','','1','3','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '127': { nome: 'E4', cordas: [0,2,2,2,0,0], dedos: ['','2','3','4','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '128': { nome: 'G4', cordas: [3,-1,0,0,1,3], dedos: ['2','','','','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Maior 6 ==========
    '129': { nome: 'A6', cordas: [-1,0,2,2,2,2], dedos: ['','','1','1','1','1'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
    '130': { nome: 'B6', cordas: [-1,2,1,1,0,-1], dedos: ['','3','1','2','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '131': { nome: 'C6', cordas: [-1,3,2,2,1,0], dedos: ['','4','2','3','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '132': { nome: 'D6', cordas: [-1,-1,0,2,0,2], dedos: ['','','','2','','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '133': { nome: 'E6', cordas: [0,2,2,1,2,0], dedos: ['','2','3','1','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '134': { nome: 'G6', cordas: [3,-1,2,0,3,3], dedos: ['2','','1','','3','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Maior 6(9) ==========
    '135': { nome: 'C6(9)', cordas: [-1,4,2,2,4,4], dedos: ['','2','1','1','3','4'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },

    // ========== Maior 7+ ==========
    '136': { nome: 'A7+', cordas: [-1,0,2,1,2,0], dedos: ['','','2','1','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '137': { nome: 'C7+', cordas: [-1,3,2,0,0,0], dedos: ['','3','2','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '138': { nome: 'D7+', cordas: [-1,-1,0,2,2,2], dedos: ['','','','1','1','1'], pestana: true, pestanaCordas: [3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
    '139': { nome: 'E7+', cordas: [0,2,1,1,0,0], dedos: ['','3','1','2','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '140': { nome: 'F7+', cordas: [-1,-1,3,2,1,0], dedos: ['','','3','2','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '141': { nome: 'G7+', cordas: [3,-1,0,0,0,2], dedos: ['2','','','','','1'], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== 7(4) ==========
    '142': { nome: 'A7(4)', cordas: [-1,0,2,0,3,0], dedos: ['','','2','','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '143': { nome: 'C7(4)', cordas: [-1,3,3,3,1,-1], dedos: ['','2','3','4','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '144': { nome: 'D7(4)', cordas: [-1,-1,0,2,1,3], dedos: ['','','','2','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '145': { nome: 'E7(4)', cordas: [0,2,0,2,0,0], dedos: ['','2','','3','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '146': { nome: 'G7(4)', cordas: [3,-1,3,0,1,3], dedos: ['2','','3','','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Maior 11 ==========
    '147': { nome: 'A11', cordas: [-1,0,0,0,0,0], dedos: ['','','','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '148': { nome: 'B11', cordas: [-1,2,2,2,2,2], dedos: ['','1','1','1','1','1'], pestana: true, pestanaCordas: [1,2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
    '149': { nome: 'C11', cordas: [-1,3,-1,3,4,1], dedos: ['','2','','3','4','1'], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Maior 5+ ==========
    '150': { nome: 'A5+', cordas: [-1,0,-1,2,2,1], dedos: ['','','','2','3','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '151': { nome: 'Bb5+', cordas: [-1,1,-1,1,3,2], dedos: ['','1','','2','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '152': { nome: 'C5+', cordas: [-1,3,2,1,1,-1], dedos: ['','3','2','1','1',''], pestana: true, pestanaCordas: [3,4], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

    // ========== Menor 6 ==========
    '153': { nome: 'Am6', cordas: [-1,0,2,0,1,2], dedos: ['','','2','0','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '154': { nome: 'Bm6', cordas: [-1,0,2,0,1,2], dedos: ['','','2','0','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '155': { nome: 'Cm6', cordas: [-1,3,-1,2,4,3], dedos: ['','2','','1','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '156': { nome: 'Dm6', cordas: [-1,-1,0,2,0,1], dedos: ['','','','2','','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '157': { nome: 'Em6', cordas: [0,2,2,0,2,0], dedos: ['','2','3','','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Maior 7(5+) ==========
    '158': { nome: 'D7(5+)', cordas: [-1,-1,0,3,1,2], dedos: ['','','','3','1','2'], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Maior 7(b5) ==========
    '159': { nome: 'D7(b5)', cordas: [-1,-1,0,1,1,2], dedos: ['','','','1','2','3'], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Menor 7(b5) ==========
    '160': { nome: 'Am7(b5)', cordas: [-1,0,1,2,1,3], dedos: ['','','1','2','1','4'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },
    '161': { nome: 'Bbm7(b5)', cordas: [-1,2,0,1,4,2], dedos: ['','2','','1','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '162': { nome: 'Bm7(b5)', cordas: [-1,2,3,2,3,-1], dedos: ['','1','3','2','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '163': { nome: 'Dm7(b5)', cordas: [-1,-1,0,1,1,1], dedos: ['','','','1','1','1'], pestana: true, pestanaCordas: [3,4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

    // ========== Menor 7+ ==========
    '164': { nome: 'Cm7+', cordas: [-1,3,1,0,0,-1], dedos: ['','3','1','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Menor 9 ==========
    '165': { nome: 'Am9', cordas: [-1,0,2,4,1,3], dedos: ['','','2','4','1','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '166': { nome: 'Bm9', cordas: [-1,2,0,2,2,2], dedos: ['','1','','2','3','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '167': { nome: 'Em9', cordas: [0,2,2,0,3,2], dedos: ['','1','2','','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Menor 7+ ==========
    '168': { nome: 'Am7+', cordas: [-1,0,2,1,1,0], dedos: ['','','3','1','2','0'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '169': { nome: 'Bm7+', cordas: [-1,2,-1,3,3,2], dedos: ['','1','','3','4','2'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '170': { nome: 'Dm7+', cordas: [-1,-1,0,2,2,1], dedos: ['','','','2','3','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '171': { nome: 'Em7+', cordas: [0,2,1,0,0,0], dedos: ['','2','1','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Menor 11 ==========
    '172': { nome: 'Am11', cordas: [-1,0,0,0,1,0], dedos: ['','','','','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '173': { nome: 'Bm11', cordas: [-1,2,2,2,4,2], dedos: ['','1','1','1','2','1'], pestana: true, pestanaCordas: [1,2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
    '174': { nome: 'Cm11', cordas: [-1,3,0,3,3,1], dedos: ['','2','0','3','4','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
    '175': { nome: 'Dm11', cordas: [-1,-1,0,0,1,1], dedos: ['','','','','1','1'], pestana: true, pestanaCordas: [4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

    // ========== Maior 7(#9) ==========
    '176': { nome: 'Bb7(#9)', cordas: [-1,1,0,1,2,0], dedos: ['','1','','2','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '177': { nome: 'B7(#9)', cordas: [-1,2,1,2,4,-1], dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '178': { nome: 'C7(#9)', cordas: [-1,3,2,2,4,-1], dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Maior 9 ==========
    '179': { nome: 'Bb9', cordas: [-1,1,0,1,1,0], dedos: ['','2','','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '180': { nome: 'B9', cordas: [-1,2,1,2,2,-1], dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '181': { nome: 'C9', cordas: [-1,3,2,3,3,-1], dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Maior 7(b9) ==========
    '182': { nome: 'C7(b9)', cordas: [-1,3,2,3,2,-1], dedos: ['','3','1','4','2',''], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== Maior 13(b9) ==========
    '183': { nome: 'C13(b9)', cordas: [-1,4,2,4,2,6], dedos: ['','2','1','3','1','4'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },

    // ========== °7 ==========
    '184': { nome: 'Bb°7', cordas: [-1,1,2,0,2,-1], dedos: ['','2','3','0','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
    '185': { nome: 'B°7', cordas: [-1,1,2,0,2,-1], dedos: ['','2','3','0','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },

    // ========== ° ==========
    '186': { nome: 'D°', cordas: [-1,-1,0,1,3,1], dedos: ['','','','1','4','1'], pestana: true, pestanaCordas: [3,4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

    // ========== ° ==========
    '187': { nome: 'm7', cordas: [-1,2,-1,2,3,2], dedos: ['','1','','2','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },



};

// Processa pestana
function processarPestana(pestanaConfig, cordas) {
    let temPestana = false;
    let casa = 1;
    let cordasPestana = [];
    
    if (!pestanaConfig) return { temPestana: false, casa: 1, cordas: [] };
    
    if (typeof pestanaConfig === 'number') {
        temPestana = true;
        casa = pestanaConfig;
        cordas.forEach((cordaCasa, idx) => {
            if (cordaCasa === casa) cordasPestana.push(idx);
        });
    } else if (Array.isArray(pestanaConfig)) {
        temPestana = true;
        const primeiraCorda = pestanaConfig[0];
        if (cordas[primeiraCorda]) casa = cordas[primeiraCorda];
        cordasPestana = pestanaConfig;
    } else if (pestanaConfig === true) {
        temPestana = true;
        casa = 1;
        cordas.forEach((cordaCasa, idx) => {
            if (cordaCasa === casa) cordasPestana.push(idx);
        });
    }
    
    return { temPestana, casa, cordas: cordasPestana };
}

// Função principal USANDO o dicionário FORMAS_INFINITAS
function processarAcordeDinamico(formato, nomePersonalizado = '') {
    // Formato: "forma;casa;posicao;texto" 
    // Exemplo: "2;5;5;5" (forma 2=Menor, casa 5, posição 5, texto 5)
    
    const partes = formato.split(';').map(p => p.trim());
    
    if (partes.length < 2) {
        console.error('Formato inválido. Use: forma;casa');
        return null;
    }
    
    const formaId = partes[0];  // '1', '2', '3', '4', '5', '6', '7', '8', '9'
    const casa = parseInt(partes[1]);  // casa da pestana
    const posicaoMostrada = partes[2] ? parseInt(partes[2]) : null;
    const textoNumero = partes[3] ? parseInt(partes[3]) : null;
    
    // Busca a forma no dicionário
    const formaBase = FORMAS_INFINITAS[formaId];
    if (!formaBase) {
        console.error(`Forma ${formaId} não encontrada no dicionário`);
        return null;
    }
    
    // Calcula as cordas baseado na casa
    const cordas = formaBase.cordas.map(c => {
        if (c === -1) return -1;
        if (c === 0) return 0;
        return c + casa - 1;  // Ajusta pela casa da pestana
    });
    
    // Dedos (mantém os mesmos)
    const dedos = [...formaBase.dedos];
    
    // Processa a pestana
    let pestanaInfo = { temPestana: false, casa: casa, cordas: [] };
    if (formaBase.pestana) {
        pestanaInfo = processarPestana(formaBase.pestana, cordas);
    }
    
    // Nome do acorde
    let nome = nomePersonalizado;
    if (!nome || nome === '') {
        const notas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const notaIndex = (casa + 2) % 12;
        nome = `${notas[notaIndex]} ${formaBase.nome}`;
    }
    
    const acorde = {
        nome: nome,
        cordas: cordas,
        dedos: dedos,
        pestana: pestanaInfo.temPestana,
        pestanaCasa: pestanaInfo.casa,
        pestanaCordas: pestanaInfo.cordas,
        casaInicial: casa,
        baixo: ''
    };
    
    // Adiciona posição se tiver
    if (posicaoMostrada !== null) {
        acorde.posicao = posicaoMostrada;
        acorde.mostrarPosicao = true;
        acorde.textoPosicao = (textoNumero !== null && !isNaN(textoNumero)) 
            ? textoNumero + 'ª' 
            : posicaoMostrada + 'ª';
    }
    
    return acorde;
}

// Desenha acorde no canvas
function desenharAcorde(container, acorde) {
    if (!container || !acorde) return;
    
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-block; margin: 10px; text-align: center;';
    
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 190;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const startX = 28, startY = 45, stringSpacing = 18, fretSpacing = 26;
    const numFrets = 5;
    
    // Cordas
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(startX + i * stringSpacing, startY);
        ctx.lineTo(startX + i * stringSpacing, startY + numFrets * fretSpacing);
        ctx.stroke();
    }
    
    // Trastes
    for (let i = 0; i <= numFrets; i++) {
        ctx.beginPath();
        ctx.moveTo(startX, startY + i * fretSpacing);
        ctx.lineTo(startX + 5 * stringSpacing, startY + i * fretSpacing);
        ctx.stroke();
    }
    
    // Casa inicial
    if (acorde.casaInicial > 1) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(acorde.casaInicial + 'ª', startX - 18, startY + fretSpacing / 2 + 2);
    }
    
    // Texto da posição
    if (acorde.textoPosicao && acorde.posicao) {
        const posY = startY + (acorde.posicao - 1) * fretSpacing + fretSpacing / 2;
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#e94560';
        ctx.fillText(acorde.textoPosicao, startX - 20, posY + 5);
    }
    
    // Pestana
    if (acorde.pestana && acorde.pestanaCordas && acorde.pestanaCordas.length > 0) {
        const pestanaY = startY + 12;
        const primeiraCorda = Math.min(...acorde.pestanaCordas);
        const ultimaCorda = Math.max(...acorde.pestanaCordas);
        
        ctx.beginPath();
        ctx.moveTo(startX + primeiraCorda * stringSpacing - 3, pestanaY);
        ctx.lineTo(startX + ultimaCorda * stringSpacing + 3, pestanaY);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#2c3e50';
        ctx.stroke();
        ctx.lineWidth = 1.5;
    }
    
    // Notas
    const pestanaCasa = acorde.pestanaCasa || acorde.casaInicial;
    acorde.cordas.forEach((casa, i) => {
        const x = startX + i * stringSpacing;
        const casaRelativa = casa - pestanaCasa + 1;
        const isPestanaCorda = acorde.pestanaCordas && acorde.pestanaCordas.includes(i);
        
        if (casa === 0) {
            const y = startY - 12;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.strokeStyle = '#333';
            ctx.stroke();
        } else if (casa === -1) {
            const y = startY - 12;
            ctx.beginPath();
            ctx.moveTo(x - 5, y - 5);
            ctx.lineTo(x + 5, y + 5);
            ctx.moveTo(x + 5, y - 5);
            ctx.lineTo(x - 5, y + 5);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#e94560';
            ctx.stroke();
        } else if (casa > 0 && casaRelativa > 0 && casaRelativa <= numFrets && !isPestanaCorda) {
            const y = startY + (casaRelativa - 1) * fretSpacing + fretSpacing / 2;
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = '#1a1a2e';
            ctx.fill();
            
            const dedo = acorde.dedos && acorde.dedos[i] ? acorde.dedos[i] : '';
            if (dedo) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(dedo, x, y);
            }
        }
    });
    
    wrapper.appendChild(canvas);
    
    const nomeSpan = document.createElement('div');
    nomeSpan.textContent = acorde.nome;
    nomeSpan.style.cssText = 'font-size: 12px; margin-top: 8px; color: #333; font-weight: bold;';
    wrapper.appendChild(nomeSpan);
    
    container.appendChild(wrapper);
}

// PARSER
function renderizarAcordes() {
    const body = document.body;
    if (!body) return;
    
    let html = body.innerHTML;
    const regex = /\[Acorde:([^\]]+)\]([^\[]*)\[\/Acorde\]/g;
    let match;
    let newHtml = html;
    let containers = [];
    
    while ((match = regex.exec(html)) !== null) {
        const formato = match[1];
        const nomeAcorde = match[2];
        const acorde = processarAcordeDinamico(formato, nomeAcorde);
        
        if (acorde) {
            const id = 'acorde-' + Date.now() + '-' + containers.length;
            const placeholder = `<div id="${id}" class="acorde-placeholder" style="display: inline-block;"></div>`;
            newHtml = newHtml.replace(match[0], placeholder);
            containers.push({ id, acorde });
        }
    }
    
    if (newHtml !== html) {
        body.innerHTML = newHtml;
        containers.forEach(container => {
            const elemento = document.getElementById(container.id);
            if (elemento) desenharAcorde(elemento, container.acorde);
        });
    }
}

// Inicializa
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderizarAcordes);
    } else {
        renderizarAcordes();
    }
}

window.processarAcordeDinamico = processarAcordeDinamico;
window.desenharAcorde = desenharAcorde;
window.renderizarAcordes = renderizarAcordes;
window.FORMAS_INFINITAS = FORMAS_INFINITAS;

console.log('✅ Sistema com dicionário carregado!');
