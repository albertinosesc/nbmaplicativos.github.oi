// ============================================================
// MÓDULO VIOLÃO (violao.js)
// ============================================================
(function () {
    const ACORDES_DIREITOS = {
        // Família de Dó (C)
        'C':     { nome: 'Dó Maior',      pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 0, 1, 0], dedos: [0, 3, 2, 0, 1, 0] },
        'Cm':    { nome: 'Dó Menor',      pestana: true,  casaInicial: 3, cordas: ['X', 3, 5, 5, 4, 3], dedos: [0, 1, 3, 4, 2, 1] },
        'C7':    { nome: 'Dó Dominante',  pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 3, 1, 0], dedos: [0, 3, 2, 4, 1, 0] },
        'C9':    { nome: 'Dó com Nona',   pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 0, 3, 3], dedos: [0, 2, 1, 0, 3, 4] },
        'Cmaj7': { nome: 'Dó Maior 7M',   pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 0, 0, 0], dedos: [0, 3, 2, 0, 0, 0] },

        // Família de Ré (D)
        'D':     { nome: 'Ré Maior',      pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 3, 2], dedos: [0, 0, 0, 1, 3, 2] },
        'Dm':    { nome: 'Ré Menor',      pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 3, 1], dedos: [0, 0, 0, 2, 3, 1] },
        'D7':    { nome: 'Ré Dominante',  pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 1, 2], dedos: [0, 0, 0, 2, 1, 3] },
        'D9':    { nome: 'Ré com Nona',   pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 1, 0], dedos: [0, 0, 0, 2, 1, 0] },

        // Família de Mi / Lá / Sol / Si
        'E':     { nome: 'Mi Maior',      pestana: false, casaInicial: 1, cordas: [0, 2, 2, 1, 0, 0], dedos: [0, 2, 3, 1, 0, 0] },
        'Em':    { nome: 'Mi Menor',      pestana: false, casaInicial: 1, cordas: [0, 2, 2, 0, 0, 0], dedos: [0, 2, 3, 0, 0, 0] },
        'F':     { nome: 'Fá Maior',      pestana: true,  casaInicial: 1, cordas: [1, 3, 3, 2, 1, 1], dedos: [1, 3, 4, 2, 1, 1] },
        'F#m':   { nome: 'Fá# Menor',     pestana: true,  casaInicial: 2, cordas: [2, 4, 4, 2, 2, 2], dedos: [1, 3, 4, 1, 1, 1] },
        'G':     { nome: 'Sol Maior',     pestana: false, casaInicial: 1, cordas: [3, 2, 0, 0, 0, 3], dedos: [2, 1, 0, 0, 0, 3] },
        'A':     { nome: 'Lá Maior',      pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 2, 2, 0], dedos: [0, 0, 1, 2, 3, 0] },
        'Am':    { nome: 'Lá Menor',      pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 2, 1, 0], dedos: [0, 0, 2, 3, 1, 0] },
        'B':     { nome: 'Si Maior',      pestana: true,  casaInicial: 2, cordas: ['X', 2, 4, 4, 4, 2], dedos: [0, 1, 2, 3, 4, 1] },
        'Bm':    { nome: 'Si Menor',      pestana: true,  casaInicial: 2, cordas: ['X', 2, 4, 4, 3, 2], dedos: [0, 1, 3, 4, 2, 1] }
    };

    const FORMAS_DINAMICAS = {
        // ===== CORDAS BASE 6 (Mi) =====
        '1':  { nome: '',        cordaBase: 6, cordas: [1, 3, 3, 2, 1, 1],     dedos: ['', '3', '4', '2', '', ''], pestana: [0,1,2,3,4,5] },
        '2':  { nome: 'm',       cordaBase: 6, cordas: [1, 3, 3, 1, 1, 1],     dedos: ['', '3', '4', '', '', ''], pestana: [0,1,2,3,4,5] },
        '3':  { nome: '7',       cordaBase: 6, cordas: [1, 3, 1, 2, 4, 1],     dedos: ['', '3', '', '2', '4', ''], pestana: [0,1,2,3,4,5] },

        // ===== CORDAS BASE 5 (Lá) =====
        '4':  { nome: '',        cordaBase: 5, cordas: [-1, 1, 3, 3, 3, 1],    dedos: ['', '', '3', '4', '2', ''], pestana: [1,2,3,4,5] },
        '5':  { nome: 'm',       cordaBase: 5, cordas: [-1, 1, 3, 3, 2, 1],    dedos: ['', '', '3', '4', '2', ''], pestana: [1,2,3,4,5] },
        '6':  { nome: '7',       cordaBase: 5, cordas: [-1, 1, 3, 1, 3, 1],    dedos: ['', '', '3', '', '4', ''], pestana: [1,2,3,4,5] },

        // ===== CORDAS BASE 4 (Ré) =====
        '7':  { nome: '',        cordaBase: 4, cordas: [-1, -1, 1, 3, 4, 3],   dedos: ['', '', '', '2', '3', '4'], pestana: [2,3,4,5], pestanaCasa: 1 },
        '8':  { nome: 'm',       cordaBase: 4, cordas: [-1, -1, 1, 3, 4, 2],   dedos: ['', '', '', '3', '4', '2'], pestana: [2,3,4,5], pestanaCasa: 1 },
        '9':  { nome: '7',       cordaBase: 4, cordas: [-1, -1, 1, 3, 2, 3],   dedos: ['', '', '', '3', '2', '4'], pestana: [2,3,4,5], pestanaCasa: 1 },

        // ===== Formação 1-7-3-5 (fundamental na 6 Corda) =====
        '10': { nome: '7+',      cordaBase: 6, cordas: [1, -1, 2, 2, 1, -1],   dedos: ['1', '', '3', '4', '2', ''], pestana: false },
        '11': { nome: 'm7',      cordaBase: 6, cordas: [1, -1, 1, 1, 1, -1],   dedos: ['1', '', '2', '3', '4', ''], pestana: false },
        '12': { nome: 'm7(b5)',  cordaBase: 6, cordas: [2, -1, 2, 2, 1, -1],   dedos: ['2', '', '3', '4', '1', ''], pestana: false },
        '13': { nome: '7',       cordaBase: 6, cordas: [1, -1, 1, 2, 1, -1],   dedos: ['1', '', '2', '4', '3', ''], pestana: false },
        '14': { nome: '7+(5+)',  cordaBase: 6, cordas: [1, -1, 2, 2, 2, -1],   dedos: ['1', '', '2', '3', '4', ''], pestana: false },
        '15': { nome: 'm7+',     cordaBase: 6, cordas: [1, -1, 2, 1, 1, -1],   dedos: ['1', '', '2', '4', '3', ''], pestana: false },
        '16': { nome: '°7',      cordaBase: 6, cordas: [2, -1, 1, 2, 1, -1],   dedos: ['3', '', '1', '4', '2', ''], pestana: false },

        // ===== Formação 1-5-7-3 (fundamental na 5ª corda) =====
        '17': { nome: '7+',      cordaBase: 5, cordas: [-1, 1, 3, 2, 3, 1],    dedos: ['', '', '3', '2', '4', ''], pestana: [1,2,3,4,5] },
        '18': { nome: '7',       cordaBase: 5, cordas: [-1, 1, 3, 1, 3, 1],    dedos: ['', '', '3', '', '4', ''], pestana: [1,2,3,4,5] },
        '19': { nome: 'm7',      cordaBase: 5, cordas: [-1, 1, 3, 1, 2, 1],    dedos: ['', '', '3', '', '2', ''], pestana: [1,2,3,4,5] },
        '20': { nome: 'm7(b5)',  cordaBase: 5, cordas: [-1, 1, 2, 1, 2, -1],   dedos: ['', '1', '3', '2', '4', ''], pestana: false },
        '21': { nome: '°7',      cordaBase: 5, cordas: [-1, 2, 3, 1, 3, -1],   dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '22': { nome: '7(5+)',   cordaBase: 5, cordas: [-1, 1, 4, 2, 3, -1],   dedos: ['', '1', '4', '2', '3', ''], pestana: false },
        '23': { nome: 'm(7+)',   cordaBase: 5, cordas: [-1, 1, 3, 2, 2, -1],   dedos: ['', '1', '4', '2', '3', ''], pestana: false },

        // ===== Formação 1-5-7-3 (fundamental na 4ª corda) =====
        '24': { nome: '7+',      cordaBase: 4, cordas: [-1, -1, 1, 3, 3, 3],  dedos: ['', '', '1', '2', '3', '4'], pestana: false },
        '25': { nome: '7',       cordaBase: 4, cordas: [-1, -1, 1, 3, 2, 3],  dedos: ['', '', '1', '3', '2', '4'], pestana: false },
        '26': { nome: 'm7',      cordaBase: 4, cordas: [-1, -1, 1, 3, 2, 2],  dedos: ['', '', '1', '4', '2', '3'], pestana: false },
        '27': { nome: 'm7(b5)',  cordaBase: 4, cordas: [-1, -1, 1, 2, 2, 2],  dedos: ['', '', '1', '2', '3', '4'], pestana: false },
        '28': { nome: '°7',      cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 2],  dedos: ['', '', '1', '3', '2', '4'], pestana: false },
        '29': { nome: '7(5+)',   cordaBase: 4, cordas: [-1, -1, 1, 4, 3, 3],  dedos: ['', '', '1', '4', '2', '3'], pestana: false },
        '30': { nome: 'm(7+)',   cordaBase: 4, cordas: [-1, -1, 1, 3, 3, 2],  dedos: ['', '', '1', '3', '4', '2'], pestana: false },

        // ===== Formação 3-1-5-7 (6ª corda) =====
        '31': { nome: '7+',      cordaBase: 6, cordas: [3, -1, 1, 3, 3, -1],   dedos: ['2','','1','3','4',''], pestana: false },
        '32': { nome: '7',       cordaBase: 6, cordas: [3, -1, 1, 3, 2, -1],   dedos: ['3','','1','2','4',''], pestana: false },
        '33': { nome: 'm7',      cordaBase: 6, cordas: [2, -1, 1, 3, 2, -1],   dedos: ['2','','1','4','3',''], pestana: false },
        '34': { nome: 'm7(b5)',  cordaBase: 6, cordas: [2, -1, 1, 2, 2, -1],   dedos: ['2','','1','3','4',''], pestana: false },
        '35': { nome: '°7',      cordaBase: 6, cordas: [2, -1, 1, 2, 1, -1],   dedos: ['3','','1','4','2',''], pestana: false },
        '36': { nome: '7(5+)',   cordaBase: 6, cordas: [3, -1, 1, 4, 3, -1],   dedos: ['2','','1','4','3',''], pestana: false },
        '37': { nome: 'm(7+)',   cordaBase: 6, cordas: [2, -1, 1, 3, 3, -1],   dedos: ['2','','1','3','4',''], pestana: false },

        // ===== Formação 5-3-7-1 (6ª corda) =====
        '38': { nome: '7+',      cordaBase: 6, cordas: [3, -1, 2, 4, 1, -1],   dedos: ['3','','2','4','1',''], pestana: false },
        '39': { nome: '7',       cordaBase: 6, cordas: [3, -1, 2, 3, 1, -1],   dedos: ['3','','2','4','1',''], pestana: false },
        '40': { nome: 'm7',      cordaBase: 6, cordas: [3, -1, 1, 3, 1, -1],   dedos: ['3','','1','4','2',''], pestana: false },
        '41': { nome: 'm7(b5)',  cordaBase: 6, cordas: [2, -1, 1, 3, 1, -1],   dedos: ['3','','1','4','2',''], pestana: false },
        '42': { nome: '°7',      cordaBase: 6, cordas: [2, -1, 1, 2, 1, -1],   dedos: ['3','','1','4','2',''], pestana: false },
        '43': { nome: '7(5+)',   cordaBase: 6, cordas: [4, -1, 2, 4, 1, -1],   dedos: ['3','','2','4','1',''], pestana: false },
        '44': { nome: 'm(7+)',   cordaBase: 6, cordas: [3, -1, 1, 4, 1, -1],   dedos: ['3','','1','4','2',''], pestana: false },

        // ===== Formação 7-5-1-3 (6ª corda) =====
        '45': { nome: '7+',      cordaBase: 6, cordas: [3, -1, 1, 1, 1, -1],   dedos: ['4','','1','2','3',''], pestana: false },
        '46': { nome: '7',       cordaBase: 6, cordas: [2, -1, 1, 1, 1, -1],   dedos: ['4','','1','2','3',''], pestana: false },
        '47': { nome: 'm7',      cordaBase: 6, cordas: [3, -1, 2, 2, 1, -1],   dedos: ['4','','2','3','1',''], pestana: false },
        '48': { nome: 'm7(b5)',  cordaBase: 6, cordas: [2, -1, 1, 2, 2, -1],   dedos: ['2','','1','3','4',''], pestana: false },
        '49': { nome: '°7',      cordaBase: 6, cordas: [2, -1, 1, 2, 1, -1],   dedos: ['3','','1','4','2',''], pestana: false },
        '50': { nome: '7(5+)',   cordaBase: 6, cordas: [3, -1, 2, 1, 1, -1],   dedos: ['4','','3','1','2',''], pestana: false },
        '51': { nome: 'm(7+)',   cordaBase: 6, cordas: [4, -1, 2, 2, 1, -1],   dedos: ['4','','2','3','1',''], pestana: false },

        // ===== Formação 3-7-1-5 (fundamental na 5ª corda) =====
        '52': { nome: '7+',      cordaBase: 5, cordas: [-1, 3, 5, 1, 4, -1],  dedos: ['', '2', '4', '1', '3', ''], pestana: false },
        '53': { nome: '7',       cordaBase: 5, cordas: [-1, 3, 4, 1, 4, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '54': { nome: 'm7',      cordaBase: 5, cordas: [-1, 2, 4, 1, 4, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '55': { nome: 'm7(b5)',  cordaBase: 5, cordas: [-1, 2, 4, 1, 3, -1],  dedos: ['', '2', '4', '1', '3', ''], pestana: false },
        '56': { nome: '°7',      cordaBase: 5, cordas: [-1, 2, 3, 1, 3, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '57': { nome: '7(5+)',   cordaBase: 5, cordas: [-1, 3, 5, 1, 5, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '58': { nome: 'm(7+)',   cordaBase: 5, cordas: [-1, 2, 5, 1, 3, -1],  dedos: ['', '2', '4', '1', '3', ''], pestana: false },

        // ===== Formação 5-1-3-7 (fundamental na 5ª corda) =====
        '59': { nome: '7+',      cordaBase: 5, cordas: [-1, 2, 2, 1, 4, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '60': { nome: '7',       cordaBase: 5, cordas: [-1, 2, 2, 1, 3, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '61': { nome: 'm7',      cordaBase: 5, cordas: [-1, 3, 3, 1, 4, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '62': { nome: 'm7(b5)',  cordaBase: 5, cordas: [-1, 2, 3, 1, 4, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '63': { nome: '°7',      cordaBase: 5, cordas: [-1, 2, 3, 1, 3, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '64': { nome: '7(5+)',   cordaBase: 5, cordas: [-1, 3, 2, 1, 4, -1],  dedos: ['', '3', '2', '1', '4', ''], pestana: false },
        '65': { nome: 'm(7+)',   cordaBase: 5, cordas: [-1, 3, 3, 1, 5, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },

        // ===== Formação 7-3-5-1 (fundamental na 5ª corda) =====
        '66': { nome: '7+',      cordaBase: 5, cordas: [-1, 3, 3, 1, 2, -1],  dedos: ['', '3', '4', '1', '2', ''], pestana: false },
        '67': { nome: '7',       cordaBase: 5, cordas: [-1, 2, 3, 1, 2, -1],  dedos: ['', '2', '4', '1', '3', ''], pestana: false },
        '68': { nome: 'm7',      cordaBase: 5, cordas: [-1, 2, 2, 1, 2, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '69': { nome: 'm7(b5)',  cordaBase: 5, cordas: [-1, 3, 3, 1, 3, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '70': { nome: '°7',      cordaBase: 5, cordas: [-1, 2, 3, 1, 3, -1],  dedos: ['', '2', '3', '1', '4', ''], pestana: false },
        '71': { nome: '7(5+)',   cordaBase: 5, cordas: [-1, 2, 2, 1, 1, -1],  dedos: ['', '3', '4', '1', '2', ''], pestana: false },
        '72': { nome: 'm(7+)',   cordaBase: 5, cordas: [-1, 3, 2, 1, 2, -1],  dedos: ['', '4', '2', '1', '3', ''], pestana: false },

        // ===== Formação 3-7-1-5 (fundamental na 4ª corda) =====
        '73': { nome: '7+',      cordaBase: 4, cordas: [-1, -1, 2, 4, 1, 3],  dedos: ['', '', '2', '4', '1', '3'], pestana: false },
        '74': { nome: '7',       cordaBase: 4, cordas: [-1, -1, 2, 3, 1, 4],  dedos: ['', '', '2', '3', '1', '4'], pestana: false },
        '75': { nome: 'm7',      cordaBase: 4, cordas: [-1, -1, 1, 3, 1, 3],  dedos: ['', '', '1', '3', '2', '4'], pestana: false },
        '76': { nome: 'm7(b5)',  cordaBase: 4, cordas: [-1, -1, 1, 3, 1, 2],  dedos: ['', '', '1', '3', '2', '4'], pestana: false },
        '77': { nome: '°7',      cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 2],  dedos: ['', '', '1', '3', '2', '4'], pestana: false },
        '78': { nome: '7(5+)',   cordaBase: 4, cordas: [-1, -1, 2, 4, 1, 4],  dedos: ['', '', '2', '3', '1', '4'], pestana: false },
        '79': { nome: 'm(7+)',   cordaBase: 4, cordas: [-1, -1, 1, 4, 1, 3],  dedos: ['', '', '1', '4', '2', '3'], pestana: false },

        // ===== Formação 5-1-3-7 (fundamental na 4ª corda) =====
        '80': { nome: '7+',      cordaBase: 4, cordas: [-1, -1, 1, 1, 1, 3],  dedos: ['', '', '1', '2', '3', '4'], pestana: false },
        '81': { nome: '7',       cordaBase: 4, cordas: [-1, -1, 1, 1, 1, 2],  dedos: ['', '', '1', '2', '3', '4'], pestana: false },
        '82': { nome: 'm7',      cordaBase: 4, cordas: [-1, -1, 2, 2, 1, 3],  dedos: ['', '', '2', '3', '1', '4'], pestana: false },
        '83': { nome: 'm7(b5)',  cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 3],  dedos: ['', '', '1', '3', '2', '4'], pestana: false },
        '84': { nome: '°7',      cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 2],  dedos: ['', '', '1', '3', '2', '4'], pestana: false },
        '85': { nome: '7(5+)',   cordaBase: 4, cordas: [-1, -1, 2, 1, 1, 3],  dedos: ['', '', '3', '1', '2', '4'], pestana: false },
        '86': { nome: 'm(7+)',   cordaBase: 4, cordas: [-1, -1, 2, 2, 1, 4],  dedos: ['', '', '2', '3', '1', '4'], pestana: false },

        // ===== Formação 7-3-5-1 (fundamental na 4ª corda) =====
        '87': { nome: '7+',      cordaBase: 4, cordas: [-1, -1, 2, 2, 1, 1],  dedos: ['', '', '3', '4', '1', '2'], pestana: false },
        '88': { nome: '7',       cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 1],  dedos: ['', '', '1', '4', '2', '3'], pestana: false },
        '89': { nome: 'm7',      cordaBase: 4, cordas: [-1, -1, 1, 1, 1, 1],  dedos: ['', '', '1', '2', '3', '4'], pestana: false },
        '90': { nome: 'm7(b5)',  cordaBase: 4, cordas: [-1, -1, 2, 2, 1, 2],  dedos: ['', '', '2', '3', '1', '4'], pestana: false },
        '91': { nome: '°7',      cordaBase: 4, cordas: [-1, -1, 1, 2, 1, 2],  dedos: ['', '', '1', '3', '2', '4'], pestana: false },
        '92': { nome: '7(5+)',   cordaBase: 4, cordas: [-1, -1, 2, 2, 2, 1],  dedos: ['', '', '2', '3', '4', '1'], pestana: false },
        '93': { nome: 'm(7+)',   cordaBase: 4, cordas: [-1, -1, 2, 1, 1, 1],  dedos: ['', '', '4', '1', '2', '3'], pestana: false },

        '94': { nome: '7(b9)',   cordaBase: 5, cordas: [-1, 2, 1, 2, 1, -1],  dedos: ['', '3', '1', '4', '2', ''], pestana: false },
        '95': { nome: 'm6',      cordaBase: 6, cordas: [3, -1, 2, 3, 3, -1],  dedos: ['2', '', '1', '3', '4', ''], pestana: false },
        '96': { nome: '7(13)',   cordaBase: 6, cordas: [2, -1, 2, 3, 4, -1],  dedos: ['1', '', '2', '3', '4', ''], pestana: false },
        '97': { nome: '7(b13)',  cordaBase: 6, cordas: [2, -1, 2, 3, 3, -1],  dedos: ['2', '', '1', '3', '4', ''], pestana: false },
        '98': { nome: '7(9)',    cordaBase: 5, cordas: [-1, 2, 1, 2, 2, -1],  dedos: ['', '2', '1', '3', '4', ''], pestana: false },
        '99': { nome: '7(9)',    cordaBase: 4, cordas: [-1, -1, 2, 1, 3, 2],  dedos: ['', '', '2', '1', '4', '3'], pestana: false },

        // ========== Acordes fixos (100 a 190) ==========
        '100': { nome: 'C',       cordas: [-1,3,2,0,1,0],   dedos: ['','3','2','','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '101': { nome: 'G',       cordas: [3,2,0,0,0,3],    dedos: ['2','1','','','','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '102': { nome: 'G',       cordas: [3,2,0,0,3,3],    dedos: ['2','1','','','3','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '103': { nome: 'D',       cordas: [-1,-1,0,2,3,2],  dedos: ['','','','1','3','2'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '104': { nome: 'A',       cordas: [-1,0,2,2,2,0],   dedos: ['','','1','2','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '105': { nome: 'E',       cordas: [0,2,2,1,0,0],    dedos: ['','2','3','1','',''], pestana: false, casaInicial: 0, mostrarNumero: false },

        '106': { nome: 'Dm',      cordas: [-1,-1,0,2,3,1],  dedos: ['','','','2','3','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '107': { nome: 'Em',      cordas: [0,2,2,0,0,0],    dedos: ['','2','3','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '108': { nome: 'Am',      cordas: [-1,0,2,2,1,0],   dedos: ['','','2','3','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '109': { nome: 'Cm',      cordas: [-1,3,1,0,1,-1],  dedos: ['','4','1','','2',''], pestana: false, casaInicial: 0, mostrarNumero: false },

        '110': { nome: 'C7',      cordas: [-1,3,2,3,1,0],   dedos: ['','3','2','4','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '111': { nome: 'G7',      cordas: [3,2,0,0,0,1],    dedos: ['3','2','','','','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '112': { nome: 'D7',      cordas: [-1,-1,0,2,1,2],  dedos: ['','','','2','1','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '113': { nome: 'A7',      cordas: [-1,0,2,0,2,0],   dedos: ['','','2','','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '114': { nome: 'E7',      cordas: [0,2,0,1,0,0],    dedos: ['','2','0','1','0',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '115': { nome: 'E7',      cordas: [0,2,2,1,3,0],    dedos: ['','2','3','1','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '116': { nome: 'B7',      cordas: [-1,2,1,2,0,2],   dedos: ['','2','1','3','','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

        '117': { nome: 'Dm7',     cordas: [-1,-1,0,2,1,1],  dedos: ['','','','3','1','2'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '118': { nome: 'Em7',     cordas: [0,2,0,0,0,0],    dedos: ['','2','','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '119': { nome: 'Am7',     cordas: [-1,0,2,0,1,0],   dedos: ['','','2','0','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },

        '120': { nome: 'Cadd9',   cordas: [-1,3,2,0,3,0],   dedos: ['','2','1','','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },

        '121': { nome: 'A2',      cordas: [-1,0,2,2,0,0],   dedos: ['','','1','2','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '122': { nome: 'D2',      cordas: [-1,-1,0,2,3,0],  dedos: ['','','','1','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '123': { nome: 'G2',      cordas: [3,-1,0,2,3,3],   dedos: ['2','','','1','3','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

        '124': { nome: 'A4',      cordas: [-1,0,2,2,3,0],   dedos: ['','','1','2','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '125': { nome: 'C4',      cordas: [-1,3,3,0,1,-1],  dedos: ['','3','4','','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '126': { nome: 'D4',      cordas: [-1,-1,0,2,3,3],  dedos: ['','','','1','3','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '127': { nome: 'E4',      cordas: [0,2,2,2,0,0],    dedos: ['','2','3','4','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '128': { nome: 'G4',      cordas: [3,-1,0,0,1,3],   dedos: ['2','','','','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

        '129': { nome: 'A6',      cordas: [-1,0,2,2,2,2],   dedos: ['','','1','1','1','1'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
        '130': { nome: 'B6',      cordas: [-1,2,1,1,0,-1],  dedos: ['','3','1','2','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '131': { nome: 'C6',      cordas: [-1,3,2,2,1,0],   dedos: ['','4','2','3','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '132': { nome: 'D6',      cordas: [-1,-1,0,2,0,2],  dedos: ['','','','2','','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '133': { nome: 'E6',      cordas: [0,2,2,1,2,0],    dedos: ['','2','3','1','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '134': { nome: 'G6',      cordas: [3,-1,2,0,3,3],   dedos: ['2','','1','','3','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

        '135': { nome: 'C6(9)',   cordas: [-1,4,2,2,4,4],   dedos: ['','2','1','1','3','4'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },

        '136': { nome: 'A7+',     cordas: [-1,0,2,1,2,0],   dedos: ['','','2','1','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '137': { nome: 'C7+',     cordas: [-1,3,2,0,0,0],   dedos: ['','3','2','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '138': { nome: 'D7+',     cordas: [-1,-1,0,2,2,2],  dedos: ['','','','1','1','1'], pestana: true, pestanaCordas: [3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
        '139': { nome: 'E7+',     cordas: [0,2,1,1,0,0],    dedos: ['','3','1','2','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '140': { nome: 'F7+',     cordas: [-1,-1,3,2,1,0],  dedos: ['','','3','2','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '141': { nome: 'G7+',     cordas: [3,-1,0,0,0,2],   dedos: ['2','','','','','1'], pestana: false, casaInicial: 0, mostrarNumero: false },

        '142': { nome: 'A7(4)',   cordas: [-1,0,2,0,3,0],   dedos: ['','','2','','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '143': { nome: 'C7(4)',   cordas: [-1,3,3,3,1,-1],  dedos: ['','2','3','4','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '144': { nome: 'D7(4)',   cordas: [-1,-1,0,2,1,3],  dedos: ['','','','2','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '145': { nome: 'E7(4)',   cordas: [0,2,0,2,0,0],    dedos: ['','2','','3','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '146': { nome: 'G7(4)',   cordas: [3,-1,3,0,1,3],   dedos: ['2','','3','','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },

        '147': { nome: 'A11',     cordas: [-1,0,0,0,0,0],   dedos: ['','','','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '148': { nome: 'B11',     cordas: [-1,2,2,2,2,2],   dedos: ['','1','1','1','1','1'], pestana: true, pestanaCordas: [1,2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
        '149': { nome: 'C11',     cordas: [-1,3,-1,3,4,1],  dedos: ['','2','','3','4','1'], pestana: false, casaInicial: 0, mostrarNumero: false },

        '150': { nome: 'A5+',     cordas: [-1,0,-1,2,2,1],  dedos: ['','','','2','3','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '151': { nome: 'Bb5+',    cordas: [-1,1,-1,1,3,2],  dedos: ['','1','','2','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '152': { nome: 'C5+',     cordas: [-1,3,2,1,1,-1],  dedos: ['','3','2','1','1',''], pestana: true, pestanaCordas: [3,4], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

        '153': { nome: 'Am6',     cordas: [-1,0,2,0,1,2],   dedos: ['','','2','0','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '154': { nome: 'Bm6',     cordas: [-1,0,2,0,1,2],   dedos: ['','','2','0','1','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '155': { nome: 'Cm6',     cordas: [-1,3,-1,2,4,3],  dedos: ['','2','','1','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '156': { nome: 'Dm6',     cordas: [-1,-1,0,2,0,1],  dedos: ['','','','2','','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '157': { nome: 'Em6',     cordas: [0,2,2,0,2,0],    dedos: ['','2','3','','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },

        '158': { nome: 'D7(5+)',  cordas: [-1,-1,0,3,1,2],  dedos: ['','','','3','1','2'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '159': { nome: 'D7(b5)',  cordas: [-1,-1,0,1,1,2],  dedos: ['','','','1','2','3'], pestana: false, casaInicial: 0, mostrarNumero: false },

        '160': { nome: 'Am7(b5)', cordas: [-1,0,1,2,1,3],   dedos: ['','','1','2','1','4'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },
        '161': { nome: 'Bbm7(b5)',cordas: [-1,2,0,1,4,2],   dedos: ['','2','','1','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '162': { nome: 'Bm7(b5)', cordas: [-1,2,3,2,3,-1],  dedos: ['','1','3','2','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '163': { nome: 'Dm7(b5)', cordas: [-1,-1,0,1,1,1],  dedos: ['','','','1','1','1'], pestana: true, pestanaCordas: [3,4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

        '164': { nome: 'Cm7+',    cordas: [-1,3,1,0,0,-1],  dedos: ['','3','1','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },

        '165': { nome: 'Am9',     cordas: [-1,0,2,4,1,3],   dedos: ['','','2','4','1','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '166': { nome: 'Bm9',     cordas: [-1,2,0,2,2,2],   dedos: ['','1','','2','3','4'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '167': { nome: 'Em9',     cordas: [0,2,2,0,3,2],    dedos: ['','1','2','','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },

        '168': { nome: 'Am7+',    cordas: [-1,0,2,1,1,0],   dedos: ['','','3','1','2','0'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '169': { nome: 'Bm7+',    cordas: [-1,2,-1,3,3,2],  dedos: ['','1','','3','4','2'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '170': { nome: 'Dm7+',    cordas: [-1,-1,0,2,2,1],  dedos: ['','','','2','3','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '171': { nome: 'Em7+',    cordas: [0,2,1,0,0,0],    dedos: ['','2','1','','',''], pestana: false, casaInicial: 0, mostrarNumero: false },

        '172': { nome: 'Am11',    cordas: [-1,0,0,0,1,0],   dedos: ['','','','','1',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '173': { nome: 'Bm11',    cordas: [-1,2,2,2,4,2],   dedos: ['','1','1','1','2','1'], pestana: true, pestanaCordas: [1,2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
        '174': { nome: 'Cm11',    cordas: [-1,3,0,3,3,1],  dedos: ['','2','0','3','4','1'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '175': { nome: 'Dm11',    cordas: [-1,-1,0,0,1,1],  dedos: ['','','','','1','1'], pestana: true, pestanaCordas: [4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

        '176': { nome: 'Bb7(#9)', cordas: [-1,1,0,1,2,0],   dedos: ['','1','','2','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '177': { nome: 'B7(#9)',  cordas: [-1,2,1,2,4,-1],  dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '178': { nome: 'C7(#9)',  cordas: [-1,3,2,2,4,-1],  dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },

        '179': { nome: 'Bb9',     cordas: [-1,1,0,1,1,0],   dedos: ['','2','','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '180': { nome: 'B9',      cordas: [-1,2,1,2,2,-1],  dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '181': { nome: 'C9',      cordas: [-1,3,2,3,3,-1],  dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },

        '182': { nome: 'C7(b9)',  cordas: [-1,3,2,3,2,-1],  dedos: ['','3','1','4','2',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '183': { nome: 'C13(b9)', cordas: [-1,4,2,4,2,6],   dedos: ['','2','1','3','1','4'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },

        '184': { nome: 'Bb°7',    cordas: [-1,1,2,0,2,-1],  dedos: ['','1','2','0','3',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '185': { nome: 'B°7',     cordas: [-1,1,2,0,2,-1],  dedos: ['','2','3','0','4',''], pestana: false, casaInicial: 0, mostrarNumero: false },
        '186': { nome: 'D°',      cordas: [-1,-1,0,1,3,1],  dedos: ['','','','1','4','1'], pestana: true, pestanaCordas: [3,4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

        '187': { nome: 'm7',      cordas: [-1,2,-1,2,3,2],  dedos: ['','1','','2','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '188': { nome: 'm7+',     cordas: [-1,2,-1,3,3,2],  dedos: ['','1','','3','4','2'], pestana: false, casaInicial: 0, mostrarNumero: false },
        '189': { nome: 'm6',      cordas: [-1,2,-1,1,3,2],  dedos: ['','2','','1','4','3'], pestana: false, casaInicial: 0, mostrarNumero: false },

        '190': { nome: 'M/3',     cordaBase: 5, cordas: [-1,3,1,1,1,-1],  dedos: ['','3','1','1','4',''], pestana: true, pestanaCordas: [2,3,4], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false }
    };

    function parseEstiloViolao(rawEstilo) {
        const cfg = {
            cifraX: null,
            cifraY: 24,
            cifraCor: '#1e293b',
            cifraTamanho: 18,
            cifraFonte: 'Arial, sans-serif',
            cifraAlinhar: 'branco',
            xInicial: 32,
            yInicial: 52
        };

        if (!rawEstilo) return cfg;

        const limpo = String(rawEstilo)
            .replace(/^\[VIOLAO\s+style\s*[:=]\s*/i, '')
            .replace(/\]$/, '')
            .trim()
            .replace(/^["']|["']$/g, '');

        const partes = limpo.split(/[;,]/).map(p => p.trim()).filter(Boolean);
        partes.forEach((parte) => {
            const idx = parte.indexOf(':');
            const sepIdx = idx !== -1 ? idx : parte.indexOf('=');
            if (sepIdx === -1) return;

            const chave = parte.slice(0, sepIdx).trim().toLowerCase().replace(/\s+/g, '-');
            const valor = parte.slice(sepIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!valor || /[<>{}]/.test(valor)) return;

            if (chave === 'cifra-x' || chave === 'x-cifra' || chave === 'acorde-x') {
                const num = parseFloat(valor);
                if (!Number.isNaN(num)) cfg.cifraX = num;
            } else if (chave === 'cifra-y' || chave === 'y-cifra' || chave === 'acorde-y') {
                const num = parseFloat(valor);
                if (!Number.isNaN(num)) cfg.cifraY = num;
            } else if (chave === 'cifra-cor' || chave === 'color' || chave === 'cor') {
                cfg.cifraCor = valor;
            } else if (chave === 'cifra-tamanho' || chave === 'font-size' || chave === 'tamanho') {
                const num = parseFloat(valor);
                if (!Number.isNaN(num) && num > 0) cfg.cifraTamanho = num;
            } else if (chave === 'cifra-fonte' || chave === 'font-family' || chave === 'fonte') {
                cfg.cifraFonte = valor;
            } else if (chave === 'cifra-alinhar' || chave === 'alinhar' || chave === 'align') {
                const v = valor.toLowerCase();
                if (['branco', 'cordas', 'canvas', 'centro', 'esquerda', 'direita'].includes(v)) {
                    cfg.cifraAlinhar = v === 'centro' ? 'canvas' : (v === 'cordas' ? 'branco' : v);
                }
            } else if (chave === 'x-inicial' || chave === 'braço-x' || chave === 'braco-x') {
                const num = parseFloat(valor);
                if (!Number.isNaN(num)) cfg.xInicial = num;
            } else if (chave === 'y-inicial' || chave === 'braço-y' || chave === 'braco-y') {
                const num = parseFloat(valor);
                if (!Number.isNaN(num)) cfg.yInicial = num;
            }
        });

        return cfg;
    }

    function normalizarDedos(dedosRaw) {
        if (!Array.isArray(dedosRaw)) return [0, 0, 0, 0, 0, 0];
        return dedosRaw.slice(0, 6).map(d => {
            if (typeof d === 'number') return d;
            const n = parseInt(String(d || '').trim(), 10);
            return Number.isNaN(n) ? 0 : n;
        });
    }

    function calcularNotaPorCordaBase(forma, casa) {
        // Casa 1: 6ª corda = F, 5ª corda = A#, 4ª corda = D#
        const notasBase6 = ['F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'];
        const notasBase5 = ['A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'];
        const notasBase4 = ['D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'];

        const idxNota = (((casa - 1) % 12) + 12) % 12;
        const base = Number(forma.cordaBase) || 6;

        if (base === 5) return notasBase5[idxNota];
        if (base === 4) return notasBase4[idxNota];
        return notasBase6[idxNota];
    }

    function resolverLinhaAcorde(linha) {
        const partes = linha.split('|').map(p => p.trim()).filter(Boolean);
        const espec = partes[0] || '';
        const labelCustom = partes.find(p => !p.includes('=') && p !== espec) || '';

        // 1. Formato dinâmico: "formaId;casa" (ex: "17;5" ou "7;3")
        if (/^\d+\s*;\s*\d+/.test(espec)) {
            const [formaId, casaRaw] = espec.split(';').map(s => s.trim());
            const casa = Math.max(1, parseInt(casaRaw, 10) || 1);
            const forma = FORMAS_DINAMICAS[formaId];
            if (!forma) return { erro: `Forma dinâmica "${formaId}" não encontrada.` };

            const cordas = forma.cordas.slice(0, 6).map(c => {
                if (c === 'X' || c === -1) return 'X';
                if (c === 0) return 0;
                return c + casa - 1;
            });

            const numId = parseInt(formaId, 10);
            const nomeForma = String(forma.nome || '').trim();
            let siglaPadrao;

            if (numId >= 100 && nomeForma) {
                siglaPadrao = nomeForma;
            } else {
                const notaRaiz = calcularNotaPorCordaBase(forma, casa);
                siglaPadrao = `${notaRaiz}${nomeForma}`;
            }

            const pestanaAtiva = Boolean(forma.pestana) || Array.isArray(forma.pestana);
            const pestanaCordas = Array.isArray(forma.pestana)
                ? forma.pestana
                : (Array.isArray(forma.pestanaCordas) ? forma.pestanaCordas : null);

            const pestanaCasaAbsoluta = typeof forma.pestanaCasa === 'number'
                ? (forma.pestanaCasa + casa - 1)
                : null;

            const casaEfetiva = forma.mostrarNumero === false ? 1 : casa;

            return {
                sigla: labelCustom || siglaPadrao,
                casaInicial: casaEfetiva,
                pestana: pestanaAtiva,
                pestanaCordas,
                pestanaCasaAbsoluta,
                cordas,
                dedos: normalizarDedos(forma.dedos)
            };
        }

        // 2. Formato inline customizado: "F#m: cordas=2,4,4,2,2,2 | dedos=1,3,4,1,1,1 | casa=2 | pestana=true"
        if (espec.includes(':')) {
            const idxDoisPontos = espec.indexOf(':');
            const nomeAcorde = espec.slice(0, idxDoisPontos).trim();
            const primeiroParam = espec.slice(idxDoisPontos + 1).trim();

            const sigla = labelCustom || nomeAcorde;
            const cordas = ['X', 'X', 'X', 'X', 'X', 'X'];
            const dedos = [0, 0, 0, 0, 0, 0];
            let casaInicial = 1;
            let pestana = false;

            const todosParams = [primeiroParam, ...partes.slice(1)];
            todosParams.forEach(token => {
                const idxIgual = token.indexOf('=');
                if (idxIgual === -1) return;

                const k = token.slice(0, idxIgual).trim().toLowerCase();
                const v = token.slice(idxIgual + 1).trim();

                if (k === 'cordas') {
                    v.split(',').slice(0, 6).forEach((val, idx) => {
                        const t = val.trim().toUpperCase();
                        cordas[idx] = (t === 'X' || t === '-1') ? 'X' : (parseInt(t, 10) || 0);
                    });
                } else if (k === 'dedos') {
                    v.split(',').slice(0, 6).forEach((val, idx) => {
                        dedos[idx] = parseInt(val.trim(), 10) || 0;
                    });
                } else if (k === 'casa') {
                    casaInicial = Math.max(1, parseInt(v, 10) || 1);
                } else if (k === 'pestana') {
                    pestana = v.toLowerCase() === 'true';
                }
            });

            return { sigla, casaInicial, pestana, cordas, dedos };
        }

        // 3. Sigla direta do dicionário (ex: "C", "Am", "D7", "F#m")
        const chave = ACORDES_DIREITOS[espec]
            ? espec
            : Object.keys(ACORDES_DIREITOS).find(k => k.toLowerCase() === espec.toLowerCase());

        const base = chave ? ACORDES_DIREITOS[chave] : null;
        if (!base) {
            return { erro: `Acorde "${espec}" não encontrado no dicionário.` };
        }

        return {
            sigla: labelCustom || chave,
            casaInicial: base.casaInicial || 1,
            pestana: Boolean(base.pestana),
            cordas: [...base.cordas],
            dedos: normalizarDedos(base.dedos)
        };
    }

    function criarCanvasAcorde(cfg, estiloCfg) {
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 170;
        canvas.className = 'violao-canvas';

        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const xInicial = estiloCfg.xInicial;
        const yInicial = estiloCfg.yInicial;
        const espCordas = 18;
        const espTrastes = 24;
        const numTrastes = 4;
        const casaInicial = cfg.casaInicial || 1;
        const centroBracoX = xInicial + (2.5 * espCordas);

        let cifraX = estiloCfg.cifraX;
        let cifraAlign = 'center';

        if (cifraX === null) {
            if (estiloCfg.cifraAlinhar === 'canvas') {
                cifraX = canvas.width / 2;
                cifraAlign = 'center';
            } else if (estiloCfg.cifraAlinhar === 'esquerda') {
                cifraX = xInicial;
                cifraAlign = 'left';
            } else if (estiloCfg.cifraAlinhar === 'direita') {
                cifraX = xInicial + (5 * espCordas);
                cifraAlign = 'right';
            } else {
                cifraX = centroBracoX;
                cifraAlign = 'center';
            }
        }

        // Desenho da cifra
        ctx.fillStyle = estiloCfg.cifraCor;
        ctx.font = `bold ${estiloCfg.cifraTamanho}px ${estiloCfg.cifraFonte}`;
        ctx.textAlign = cifraAlign;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(cfg.sigla, cifraX, estiloCfg.cifraY);

        // Número da casa inicial quando > 1
        if (casaInicial > 1) {
            ctx.fillStyle = '#475569';
            ctx.font = 'bold 12px Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${casaInicial}ª`, xInicial - 8, yInicial + espTrastes / 2 + 4);
        }

        // Casas (linhas horizontais)
        ctx.strokeStyle = '#475569';
        for (let i = 0; i <= numTrastes; i++) {
            ctx.lineWidth = (i === 0 && casaInicial === 1) ? 4 : 1.5;
            ctx.beginPath();
            ctx.moveTo(xInicial, yInicial + i * espTrastes);
            ctx.lineTo(xInicial + 5 * espCordas, yInicial + i * espTrastes);
            ctx.stroke();
        }

        // Cordas (linhas verticais)
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(xInicial + i * espCordas, yInicial);
            ctx.lineTo(xInicial + i * espCordas, yInicial + numTrastes * espTrastes);
            ctx.stroke();
        }

        // Marcadores superiores: X (não toca) e O (corda solta)
        cfg.cordas.forEach((status, idx) => {
            const x = xInicial + idx * espCordas;
            ctx.font = 'bold 11px Arial, sans-serif';
            ctx.textAlign = 'center';
            if (status === 'X' || status === -1) {
                ctx.fillStyle = '#dc2626';
                ctx.fillText('X', x, yInicial - 7);
            } else if (status === 0) {
                ctx.fillStyle = '#16a34a';
                ctx.fillText('O', x, yInicial - 7);
            }
        });

        // Pestana
        let casaPestanaAlvo = null;
        let cordasPestanaAlvo = [];

        if (cfg.pestana) {
            const casasPositivas = cfg.cordas.filter(c => typeof c === 'number' && c > 0);
            if (casasPositivas.length > 0) {
                casaPestanaAlvo = cfg.pestanaCasaAbsoluta || Math.min(...casasPositivas);

                if (Array.isArray(cfg.pestanaCordas) && cfg.pestanaCordas.length >= 2) {
                    cordasPestanaAlvo = cfg.pestanaCordas.filter(idx => idx >= 0 && idx < 6);
                } else {
                    cordasPestanaAlvo = cfg.cordas
                        .map((c, idx) => (c === casaPestanaAlvo ? idx : -1))
                        .filter(idx => idx !== -1);
                }

                if (cordasPestanaAlvo.length >= 2) {
                    const casaPestanaRelativa = casaPestanaAlvo - casaInicial + 1;
                    if (casaPestanaRelativa >= 1 && casaPestanaRelativa <= numTrastes) {
                        const xIni = xInicial + Math.min(...cordasPestanaAlvo) * espCordas;
                        const xFim = xInicial + Math.max(...cordasPestanaAlvo) * espCordas;
                        const yPest = yInicial + (casaPestanaRelativa - 0.5) * espTrastes;

                        ctx.strokeStyle = '#1e293b';
                        ctx.lineWidth = 10;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.moveTo(xIni, yPest);
                        ctx.lineTo(xFim, yPest);
                        ctx.stroke();
                        ctx.lineWidth = 1.5;
                    }
                }
            }
        }

        // Bolinhas dos dedos
        cfg.cordas.forEach((status, idx) => {
            if (typeof status !== 'number' || status <= 0) return;
            const casaRel = status - casaInicial + 1;
            if (casaRel < 1 || casaRel > numTrastes) return;

            const dedo = cfg.dedos && cfg.dedos[idx] ? cfg.dedos[idx] : 0;
            const fazParteDaPestana =
                cfg.pestana &&
                status === casaPestanaAlvo &&
                cordasPestanaAlvo.includes(idx) &&
                (!dedo || dedo === 1);

            if (fazParteDaPestana) return;

            const x = xInicial + idx * espCordas;
            const y = yInicial + (casaRel - 0.5) * espTrastes;

            ctx.fillStyle = '#2563eb';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();

            if (dedo > 0) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(dedo), x, y);
            }
        });

        return canvas;
    }

    window.ViolaoModule = {
        render(rawInner, fullMatch = '') {
            const textoBruto = String(rawInner || '')
                .replace(/^\[VIOLAO[^\]]*\]/i, '')
                .replace(/\[\/VIOLAO\]$/i, '');

            let estiloRaw = '';
            const matchTag = String(fullMatch || '').match(/^\[VIOLAO\s+style\s*[:=]\s*([^\]]+)\]/i);
            if (matchTag) {
                estiloRaw = matchTag[1];
            }

            const linhas = textoBruto
                .split(/\r?\n/)
                .map(l => l.trim())
                .filter((l) => {
                    if (!l) return false;
                    const matchLinhaEstilo = l.match(/^style\s*[:=]\s*(.+)$/i);
                    if (matchLinhaEstilo) {
                        estiloRaw = matchLinhaEstilo[1];
                        return false;
                    }
                    return true;
                });

            const estiloCfg = parseEstiloViolao(estiloRaw);

            const block = document.createElement('div');
            block.className = 'violao-block';

            const header = document.createElement('div');
            header.className = 'violao-header';
            header.textContent = '🎸 Diagramas de Violão';
            block.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'violao-grid';

            linhas.forEach((linha) => {
                const res = resolverLinhaAcorde(linha);
                const card = document.createElement('div');
                card.className = 'violao-card';

                if (res.erro) {
                    card.innerHTML = `<span class="error">${res.erro}</span>`;
                } else {
                    card.appendChild(criarCanvasAcorde(res, estiloCfg));
                }

                grid.appendChild(card);
            });

            block.appendChild(grid);
            return block;
        }
    };
})();
