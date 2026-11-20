// ============================================================
// MÓDULO VIOLÃO COMPLETO (violao.js)
// ============================================================
(function () {
    const STORAGE_KEY_PREF = 'nbm_violao_preferencias_v1';
    const MODAL_ID = 'violao-acorde-modal';
    const preferenciasMemoria = {};
    let orientacaoModal = 'vertical'; // 'vertical' | 'horizontal'

    const ACORDES_DIREITOS = {
        // Família de Dó (C)
        'C':       { nome: 'Dó Maior',      pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 0, 1, 0], dedos: [0, 3, 2, 0, 1, 0] },
        'Cm':      { nome: 'Dó Menor',      pestana: true,  casaInicial: 3, cordas: ['X', 3, 5, 5, 4, 3], dedos: [0, 1, 3, 4, 2, 1] },
        'C7':      { nome: 'Dó Dominante',  pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 3, 1, 0], dedos: [0, 3, 2, 4, 1, 0] },
        'C9':      { nome: 'Dó com Nona',   pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 0, 3, 3], dedos: [0, 2, 1, 0, 3, 4] },
        'Cmaj7':   { nome: 'Dó Maior 7M',   pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 0, 0, 0], dedos: [0, 3, 2, 0, 0, 0] },
        'Cadd9':   { nome: 'Dó add9',       pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 0, 3, 0], dedos: [0, 2, 1, 0, 3, 0] },
        'C/E':     { nome: 'Dó / Mi',       pestana: false, casaInicial: 1, cordas: [0, 3, 2, 0, 1, 0], dedos: [0, 4, 2, 0, 1, 0] },
        'C/G':     { nome: 'Dó / Sol',      pestana: false, casaInicial: 1, cordas: [3, 3, 2, 0, 1, 0], dedos: [3, 4, 2, 0, 1, 0] },

        // Família de Ré (D)
        'D':       { nome: 'Ré Maior',      pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 3, 2], dedos: [0, 0, 0, 1, 3, 2] },
        'Dm':      { nome: 'Ré Menor',      pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 3, 1], dedos: [0, 0, 0, 2, 3, 1] },
        'D7':      { nome: 'Ré Dominante',  pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 1, 2], dedos: [0, 0, 0, 2, 1, 3] },
        'D9':      { nome: 'Ré com Nona',   pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 1, 0], dedos: [0, 0, 0, 2, 1, 0] },
        'Dmaj7':   { nome: 'Ré Maior 7M',   pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 2, 2], dedos: [0, 0, 0, 1, 1, 1] },
        'Dsus4':   { nome: 'Ré Sus4',       pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 3, 3], dedos: [0, 0, 0, 1, 2, 3] },
        'D/F#':    { nome: 'Ré / Fá#',      pestana: false, casaInicial: 1, cordas: [2, 'X', 0, 2, 3, 2], dedos: [1, 0, 0, 2, 4, 3] },

        // Família de Mi (E)
        'E':       { nome: 'Mi Maior',      pestana: false, casaInicial: 1, cordas: [0, 2, 2, 1, 0, 0], dedos: [0, 2, 3, 1, 0, 0] },
        'Em':      { nome: 'Mi Menor',      pestana: false, casaInicial: 1, cordas: [0, 2, 2, 0, 0, 0], dedos: [0, 2, 3, 0, 0, 0] },
        'E7':      { nome: 'Mi Dominante',  pestana: false, casaInicial: 1, cordas: [0, 2, 0, 1, 0, 0], dedos: [0, 2, 0, 1, 0, 0] },
        'Em7':     { nome: 'Mi Menor 7',    pestana: false, casaInicial: 1, cordas: [0, 2, 0, 0, 0, 0], dedos: [0, 2, 0, 0, 0, 0] },
        'Emaj7':   { nome: 'Mi Maior 7M',   pestana: false, casaInicial: 1, cordas: [0, 2, 1, 1, 0, 0], dedos: [0, 3, 1, 2, 0, 0] },

        // Família de Fá (F)
        'F':       { nome: 'Fá Maior',      pestana: true,  casaInicial: 1, cordas: [1, 3, 3, 2, 1, 1], dedos: [1, 3, 4, 2, 1, 1] },
        'Fm':      { nome: 'Fá Menor',      pestana: true,  casaInicial: 1, cordas: [1, 3, 3, 1, 1, 1], dedos: [1, 3, 4, 1, 1, 1] },
        'F7':      { nome: 'Fá Dominante',  pestana: true,  casaInicial: 1, cordas: [1, 3, 1, 2, 1, 1], dedos: [1, 3, 1, 2, 1, 1] },
        'Fm7':     { nome: 'Fá Menor 7',    pestana: true,  casaInicial: 1, cordas: [1, 3, 1, 1, 1, 1], dedos: [1, 3, 1, 1, 1, 1] },
        'Fmaj7':   { nome: 'Fá Maior 7M',   pestana: false, casaInicial: 1, cordas: ['X', 'X', 3, 2, 1, 0], dedos: [0, 0, 3, 2, 1, 0] },
        'F#m':     { nome: 'Fá# Menor',     pestana: true,  casaInicial: 2, cordas: [2, 4, 4, 2, 2, 2], dedos: [1, 3, 4, 1, 1, 1] },

        // Família de Sol (G)
        'G':       { nome: 'Sol Maior',     pestana: false, casaInicial: 1, cordas: [3, 2, 0, 0, 0, 3], dedos: [2, 1, 0, 0, 0, 3] },
        'Gm':      { nome: 'Sol Menor',     pestana: true,  casaInicial: 3, cordas: [3, 5, 5, 3, 3, 3], dedos: [1, 3, 4, 1, 1, 1] },
        'G7':      { nome: 'Sol Dominante', pestana: false, casaInicial: 1, cordas: [3, 2, 0, 0, 0, 1], dedos: [3, 2, 0, 0, 0, 1] },
        'Gmaj7':   { nome: 'Sol Maior 7M',  pestana: false, casaInicial: 1, cordas: [3, 2, 0, 0, 0, 2], dedos: [3, 2, 0, 0, 0, 1] },
        'G/B':     { nome: 'Sol / Si',      pestana: false, casaInicial: 1, cordas: ['X', 2, 0, 0, 0, 3], dedos: [0, 1, 0, 0, 0, 3] },

        // Família de Lá (A)
        'A':       { nome: 'Lá Maior',      pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 2, 2, 0], dedos: [0, 0, 1, 2, 3, 0] },
        'Am':      { nome: 'Lá Menor',      pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 2, 1, 0], dedos: [0, 0, 2, 3, 1, 0] },
        'A7':      { nome: 'Lá Dominante',  pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 0, 2, 0], dedos: [0, 0, 1, 0, 2, 0] },
        'Am7':     { nome: 'Lá Menor 7',    pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 0, 1, 0], dedos: [0, 0, 2, 0, 1, 0] },
        'Amaj7':   { nome: 'Lá Maior 7M',   pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 1, 2, 0], dedos: [0, 0, 2, 1, 3, 0] },
        'Asus4':   { nome: 'Lá Sus4',       pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 2, 3, 0], dedos: [0, 0, 1, 2, 4, 0] },
        'Am/G':    { nome: 'Lá Menor / Sol',pestana: false, casaInicial: 1, cordas: [3, 0, 2, 2, 1, 0], dedos: [3, 0, 1, 2, 1, 0] },

        // Família de Si (B)
        'B':       { nome: 'Si Maior',      pestana: true,  casaInicial: 2, cordas: ['X', 2, 4, 4, 4, 2], dedos: [0, 1, 2, 3, 4, 1] },
        'Bm':      { nome: 'Si Menor',      pestana: true,  casaInicial: 2, cordas: ['X', 2, 4, 4, 3, 2], dedos: [0, 1, 3, 4, 2, 1] },
        'B7':      { nome: 'Si Dominante',  pestana: false, casaInicial: 1, cordas: ['X', 2, 1, 2, 0, 2], dedos: [0, 2, 1, 3, 0, 4] },
        'Bm7':     { nome: 'Si Menor 7',    pestana: true,  casaInicial: 2, cordas: ['X', 2, 4, 2, 3, 2], dedos: [0, 1, 3, 1, 2, 1] },
        'Bmaj7':   { nome: 'Si Maior 7M',   pestana: true,  casaInicial: 2, cordas: ['X', 2, 4, 3, 4, 2], dedos: [0, 1, 3, 2, 4, 1] }
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
        '7':  { nome: '',        cordaBase: 4, cordas: [-1, -1, 1, 3, 3, 3],   dedos: ['', '', '', '2', '3', '4'], pestana: [2,3,4,5], pestanaCasa: 1 },
        '8':  { nome: 'm',       cordaBase: 4, cordas: [-1, -1, 1, 3, 2, 2],   dedos: ['', '', '', '3', '2', '4'], pestana: [2,3,4,5], pestanaCasa: 1 },
        '9':  { nome: '7',       cordaBase: 4, cordas: [-1, -1, 1, 3, 1, 3],   dedos: ['', '', '', '3', '1', '4'], pestana: [2,3,4,5], pestanaCasa: 1 },

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

        // ========== Acordes fixos / abertos / modelos (100 a 190) ==========
        '100': { nome: 'C',       cordas: [-1,3,2,0,1,0],   dedos: ['','3','2','','1',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '101': { nome: 'G',       cordas: [3,2,0,0,0,3],    dedos: ['2','1','','','','3'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '102': { nome: 'G',       cordas: [3,2,0,0,3,3],    dedos: ['2','1','','','3','4'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '103': { nome: 'D',       cordas: [-1,-1,0,2,3,2],  dedos: ['','','','1','3','2'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '104': { nome: 'A',       cordas: [-1,0,2,2,2,0],   dedos: ['','','1','2','3',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '105': { nome: 'E',       cordas: [0,2,2,1,0,0],    dedos: ['','2','3','1','',''], pestana: false, casaInicial: 1, mostrarNumero: false },

        '106': { nome: 'Dm',      cordas: [-1,-1,0,2,3,1],  dedos: ['','','','2','3','1'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '107': { nome: 'Em',      cordas: [0,2,2,0,0,0],    dedos: ['','2','3','','',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '108': { nome: 'Am',      cordas: [-1,0,2,2,1,0],   dedos: ['','','2','3','1',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '109': { nome: 'Cm',      cordas: [-1,3,1,0,1,-1],  dedos: ['','4','1','','2',''], pestana: false, casaInicial: 1, mostrarNumero: false },

        '110': { nome: 'C7',      cordas: [-1,3,2,3,1,0],   dedos: ['','3','2','4','1',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '111': { nome: 'G7',      cordas: [3,2,0,0,0,1],    dedos: ['3','2','','','','1'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '112': { nome: 'D7',      cordas: [-1,-1,0,2,1,2],  dedos: ['','','','2','1','3'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '113': { nome: 'A7',      cordas: [-1,0,2,0,2,0],   dedos: ['','','2','','3',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '114': { nome: 'E7',      cordas: [0,2,0,1,0,0],    dedos: ['','2','0','1','0',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '115': { nome: 'E7',      cordas: [0,2,2,1,3,0],    dedos: ['','2','3','1','4',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '116': { nome: 'B7',      cordas: [-1,2,1,2,0,2],   dedos: ['','2','1','3','','4'], pestana: false, casaInicial: 1, mostrarNumero: false },

        '117': { nome: 'Dm7',     cordas: [-1,-1,0,2,1,1],  dedos: ['','','','3','1','2'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '118': { nome: 'Em7',     cordas: [0,2,0,0,0,0],    dedos: ['','2','','','',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '119': { nome: 'Am7',     cordas: [-1,0,2,0,1,0],   dedos: ['','','2','0','1',''], pestana: false, casaInicial: 1, mostrarNumero: false },

        '120': { nome: 'Cadd9',   cordas: [-1,3,2,0,3,0],   dedos: ['','2','1','','3',''], pestana: false, casaInicial: 1, mostrarNumero: false },

        '121': { nome: 'A2',      cordas: [-1,0,2,2,0,0],   dedos: ['','','1','2','',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '122': { nome: 'D2',      cordas: [-1,-1,0,2,3,0],  dedos: ['','','','1','3',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '123': { nome: 'G2',      cordas: [3,-1,0,2,3,3],   dedos: ['2','','','1','3','4'], pestana: false, casaInicial: 1, mostrarNumero: false },

        '124': { nome: 'A4',      cordas: [-1,0,2,2,3,0],   dedos: ['','','1','2','3',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '125': { nome: 'C4',      cordas: [-1,3,3,0,1,-1],  dedos: ['','3','4','','1',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '126': { nome: 'D4',      cordas: [-1,-1,0,2,3,3],  dedos: ['','','','1','3','4'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '127': { nome: 'E4',      cordas: [0,2,2,2,0,0],    dedos: ['','2','3','4','',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '128': { nome: 'G4',      cordas: [3,-1,0,0,1,3],   dedos: ['2','','','','1','4'], pestana: false, casaInicial: 1, mostrarNumero: false },

        '129': { nome: 'A6',      cordas: [-1,0,2,2,2,2],   dedos: ['','','1','1','1','1'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
        '130': { nome: 'B6',      cordas: [-1,2,1,1,0,-1],  dedos: ['','3','1','2','',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '131': { nome: 'C6',      cordas: [-1,3,2,2,1,0],   dedos: ['','4','2','3','1',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '132': { nome: 'D6',      cordas: [-1,-1,0,2,0,2],  dedos: ['','','','2','','3'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '133': { nome: 'E6',      cordas: [0,2,2,1,2,0],    dedos: ['','2','3','1','4',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '134': { nome: 'G6',      cordas: [3,-1,2,0,3,3],   dedos: ['2','','1','','3','4'], pestana: false, casaInicial: 1, mostrarNumero: false },

        '135': { nome: 'C6(9)',   cordas: [-1,4,2,2,4,4],   dedos: ['','2','1','1','3','4'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },

        '136': { nome: 'A7+',     cordas: [-1,0,2,1,2,0],   dedos: ['','','2','1','3',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '137': { nome: 'C7+',     cordas: [-1,3,2,0,0,0],   dedos: ['','3','2','','',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '138': { nome: 'D7+',     cordas: [-1,-1,0,2,2,2],  dedos: ['','','','1','1','1'], pestana: true, pestanaCordas: [3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
        '139': { nome: 'E7+',     cordas: [0,2,1,1,0,0],    dedos: ['','3','1','2','',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '140': { nome: 'F7+',     cordas: [-1,-1,3,2,1,0],  dedos: ['','','3','2','1',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '141': { nome: 'G7+',     cordas: [3,-1,0,0,0,2],   dedos: ['2','','','','','1'], pestana: false, casaInicial: 1, mostrarNumero: false },

        '142': { nome: 'A7(4)',   cordas: [-1,0,2,0,3,0],   dedos: ['','','2','','3',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '143': { nome: 'C7(4)',   cordas: [-1,3,3,3,1,-1],  dedos: ['','2','3','4','1',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '144': { nome: 'D7(4)',   cordas: [-1,-1,0,2,1,3],  dedos: ['','','','2','1','4'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '145': { nome: 'E7(4)',   cordas: [0,2,0,2,0,0],    dedos: ['','2','','3','',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '146': { nome: 'G7(4)',   cordas: [3,-1,3,0,1,3],   dedos: ['2','','3','','1','4'], pestana: false, casaInicial: 1, mostrarNumero: false },

        '147': { nome: 'A11',     cordas: [-1,0,0,0,0,0],   dedos: ['','','','','',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '148': { nome: 'B11',     cordas: [-1,2,2,2,2,2],   dedos: ['','1','1','1','1','1'], pestana: true, pestanaCordas: [1,2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
        '149': { nome: 'C11',     cordas: [-1,3,-1,3,4,1],  dedos: ['','2','','3','4','1'], pestana: false, casaInicial: 1, mostrarNumero: false },

        '150': { nome: 'A5+',     cordas: [-1,0,-1,2,2,1],  dedos: ['','','','2','3','1'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '151': { nome: 'Bb5+',    cordas: [-1,1,-1,1,3,2],  dedos: ['','1','','2','4','3'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '152': { nome: 'C5+',     cordas: [-1,3,2,1,1,-1],  dedos: ['','3','2','1','1',''], pestana: true, pestanaCordas: [3,4], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

        '153': { nome: 'Am6',     cordas: [-1,0,2,0,1,2],   dedos: ['','','2','0','1','4'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '154': { nome: 'Bm6',     cordas: [-1,0,2,0,1,2],   dedos: ['','','2','0','1','4'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '155': { nome: 'Cm6',     cordas: [-1,3,-1,2,4,3],  dedos: ['','2','','1','4','3'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '156': { nome: 'Dm6',     cordas: [-1,-1,0,2,0,1],  dedos: ['','','','2','','1'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '157': { nome: 'Em6',     cordas: [0,2,2,0,2,0],    dedos: ['','2','3','','4',''], pestana: false, casaInicial: 1, mostrarNumero: false },

        '158': { nome: 'D7(5+)',  cordas: [-1,-1,0,3,1,2],  dedos: ['','','','3','1','2'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '159': { nome: 'D7(b5)',  cordas: [-1,-1,0,1,1,2],  dedos: ['','','','1','2','3'], pestana: false, casaInicial: 1, mostrarNumero: false },

        '160': { nome: 'Am7(b5)', cordas: [-1,0,1,2,1,3],   dedos: ['','','1','2','1','4'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },
        '161': { nome: 'Bbm7(b5)',cordas: [-1,2,0,1,4,2],   dedos: ['','2','','1','4','3'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '162': { nome: 'Bm7(b5)', cordas: [-1,2,3,2,3,-1],  dedos: ['','1','3','2','4',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '163': { nome: 'Dm7(b5)', cordas: [-1,-1,0,1,1,1],  dedos: ['','','','1','1','1'], pestana: true, pestanaCordas: [3,4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

        '164': { nome: 'Cm7+',    cordas: [-1,3,1,0,0,-1],  dedos: ['','3','1','','',''], pestana: false, casaInicial: 1, mostrarNumero: false },

        '165': { nome: 'Am9',     cordas: [-1,0,2,4,1,3],   dedos: ['','','2','4','1','3'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '166': { nome: 'Bm9',     cordas: [-1,2,0,2,2,2],   dedos: ['','1','','2','3','4'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '167': { nome: 'Em9',     cordas: [0,2,2,0,3,2],    dedos: ['','1','2','','4','3'], pestana: false, casaInicial: 1, mostrarNumero: false },

        '168': { nome: 'Am7+',    cordas: [-1,0,2,1,1,0],   dedos: ['','','3','1','2','0'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '169': { nome: 'Bm7+',    cordas: [-1,2,-1,3,3,2],  dedos: ['','1','','3','4','2'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '170': { nome: 'Dm7+',    cordas: [-1,-1,0,2,2,1],  dedos: ['','','','2','3','1'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '171': { nome: 'Em7+',    cordas: [0,2,1,0,0,0],    dedos: ['','2','1','','',''], pestana: false, casaInicial: 1, mostrarNumero: false },

        '172': { nome: 'Am11',    cordas: [-1,0,0,0,1,0],   dedos: ['','','','','1',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '173': { nome: 'Bm11',    cordas: [-1,2,2,2,4,2],   dedos: ['','1','1','1','2','1'], pestana: true, pestanaCordas: [1,2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },
        '174': { nome: 'Cm11',    cordas: [-1,3,0,3,3,1],  dedos: ['','2','0','3','4','1'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '175': { nome: 'Dm11',    cordas: [-1,-1,0,0,1,1],  dedos: ['','','','','1','1'], pestana: true, pestanaCordas: [4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

        '176': { nome: 'Bb7(#9)', cordas: [-1,1,0,1,2,0],   dedos: ['','1','','2','3',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '177': { nome: 'B7(#9)',  cordas: [-1,2,1,2,4,-1],  dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '178': { nome: 'C7(#9)',  cordas: [-1,3,2,2,4,-1],  dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 1, mostrarNumero: false },

        '179': { nome: 'Bb9',     cordas: [-1,1,0,1,1,0],   dedos: ['','2','','3','4',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '180': { nome: 'B9',      cordas: [-1,2,1,2,2,-1],  dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '181': { nome: 'C9',      cordas: [-1,3,2,3,3,-1],  dedos: ['','2','1','3','4',''], pestana: false, casaInicial: 1, mostrarNumero: false },

        '182': { nome: 'C7(b9)',  cordas: [-1,3,2,3,2,-1],  dedos: ['','3','1','4','2',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '183': { nome: 'C13(b9)', cordas: [-1,4,2,4,2,6],   dedos: ['','2','1','3','1','4'], pestana: true, pestanaCordas: [2,3,4,5], pestanaCasa: 2, casaInicial: 1, mostrarNumero: false },

        '184': { nome: 'Bb°7',    cordas: [-1,1,2,0,2,-1],  dedos: ['','1','2','0','3',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '185': { nome: 'B°7',     cordas: [-1,1,2,0,2,-1],  dedos: ['','2','3','0','4',''], pestana: false, casaInicial: 1, mostrarNumero: false },
        '186': { nome: 'D°',      cordas: [-1,-1,0,1,3,1],  dedos: ['','','','1','4','1'], pestana: true, pestanaCordas: [3,4,5], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false },

        '187': { nome: 'm7',      cordas: [-1,2,-1,2,3,2],  dedos: ['','1','','2','4','3'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '188': { nome: 'm7+',     cordas: [-1,2,-1,3,3,2],  dedos: ['','1','','3','4','2'], pestana: false, casaInicial: 1, mostrarNumero: false },
        '189': { nome: 'm6',      cordas: [-1,2,-1,1,3,2],  dedos: ['','2','','1','4','3'], pestana: false, casaInicial: 1, mostrarNumero: false },

        '190': { nome: 'M/3',     cordaBase: 5, cordas: [-1,3,1,1,1,-1],  dedos: ['','3','1','1','4',''], pestana: true, pestanaCordas: [2,3,4], pestanaCasa: 1, casaInicial: 1, mostrarNumero: false }
    };

    const MOLDES_CAGED = [
        {
            id: 'caged_c',
            rotulo: 'Modelo de C',
            qualidades: ['', '7+', 'maj7', '9', 'add9', '6'],
            cordasAbertas: [-1, 3, 2, 0, 1, 0],
            dedosAbertos: [0, 3, 2, 0, 1, 0],
            pestanaAberta: false,
            semitonsDesdeC: 0
        },
        {
            id: 'caged_a',
            rotulo: 'Modelo de A',
            qualidades: ['', '7+', 'maj7', '6', 'sus4', '2', 'sus2'],
            cordasAbertas: [-1, 0, 2, 2, 2, 0],
            dedosAbertos: [0, 0, 1, 2, 3, 0],
            pestanaAberta: false,
            semitonsDesdeC: 9
        },
        {
            id: 'caged_g',
            rotulo: 'Modelo de G',
            qualidades: ['', '7', '6'],
            cordasAbertas: [3, 2, 0, 0, 0, 3],
            dedosAbertos: [2, 1, 0, 0, 0, 3],
            pestanaAberta: false,
            semitonsDesdeC: 5
        },
        {
            id: 'caged_e',
            rotulo: 'Modelo de E',
            qualidades: ['', '7', '7+', 'maj7', '6', 'sus4'],
            cordasAbertas: [0, 2, 2, 1, 0, 0],
            dedosAbertos: [0, 2, 3, 1, 0, 0],
            pestanaAberta: false,
            semitonsDesdeC: 8
        },
        {
            id: 'caged_d',
            rotulo: 'Modelo de D',
            qualidades: ['', '7', '7+', 'maj7', '6', 'sus4', '2', 'sus2'],
            cordasAbertas: [-1, -1, 0, 2, 3, 2],
            dedosAbertos: [0, 0, 0, 1, 3, 2],
            pestanaAberta: false,
            semitonsDesdeC: 10
        },
        {
            id: 'caged_am',
            rotulo: 'Modelo de Am',
            qualidades: ['m', 'm7', 'm7+', 'm(7+)', 'm6'],
            cordasAbertas: [-1, 0, 2, 2, 1, 0],
            dedosAbertos: [0, 0, 2, 3, 1, 0],
            pestanaAberta: false,
            semitonsDesdeC: 9
        },
        {
            id: 'caged_em',
            rotulo: 'Modelo de Em',
            qualidades: ['m', 'm7', 'm7+', 'm(7+)', 'm6'],
            cordasAbertas: [0, 2, 2, 0, 0, 0],
            dedosAbertos: [0, 2, 3, 0, 0, 0],
            pestanaAberta: false,
            semitonsDesdeC: 8
        }
    ];

    function carregarPreferencias() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY_PREF);
            if (!raw) return { ...preferenciasMemoria };
            const parsed = JSON.parse(raw);
            return parsed && typeof parsed === 'object' ? { ...preferenciasMemoria, ...parsed } : { ...preferenciasMemoria };
        } catch (_err) {
            return { ...preferenciasMemoria };
        }
    }

    function salvarPreferencia(chaveAcorde, variacaoId) {
        if (!chaveAcorde || !variacaoId) return;
        preferenciasMemoria[chaveAcorde] = variacaoId;
        try {
            const atual = carregarPreferencias();
            atual[chaveAcorde] = variacaoId;
            window.localStorage.setItem(STORAGE_KEY_PREF, JSON.stringify(atual));
        } catch (_err) {
            // Fallback em memória
        }
    }

    function obterPreferencia(chaveAcorde) {
        const todas = carregarPreferencias();
        return todas[chaveAcorde] || null;
    }

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

    function normalizarCordas(cordasRaw) {
        if (!Array.isArray(cordasRaw)) return ['X', 'X', 'X', 'X', 'X', 'X'];
        return cordasRaw.slice(0, 6).map(c => {
            if (c === 'X' || c === 'x' || c === -1 || c === '-1') return 'X';
            if (c === 0 || c === '0') return 0;
            const n = parseInt(String(c).trim(), 10);
            return Number.isNaN(n) ? 'X' : n;
        });
    }

    function calcularNotaPorCordaBase(forma, casa) {
        const notasBase6 = ['F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'];
        const notasBase5 = ['A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'];
        const notasBase4 = ['D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D'];

        const idxNota = (((casa - 1) % 12) + 12) % 12;
        const base = Number(forma.cordaBase) || 6;

        if (base === 5) return notasBase5[idxNota];
        if (base === 4) return notasBase4[idxNota];
        return notasBase6[idxNota];
    }

    function notaParaIndice(notaRaw) {
        const mapa = {
            'C': 0, 'B#': 0,
            'C#': 1, 'Db': 1,
            'D': 2,
            'D#': 3, 'Eb': 3,
            'E': 4, 'Fb': 4,
            'F': 5, 'E#': 5,
            'F#': 6, 'Gb': 6,
            'G': 7,
            'G#': 8, 'Ab': 8,
            'A': 9,
            'A#': 10, 'Bb': 10,
            'B': 11, 'Cb': 11
        };
        const limpo = String(notaRaw || '').trim();
        if (mapa[limpo] !== undefined) return mapa[limpo];
        const maiuscula = limpo.charAt(0).toUpperCase() + limpo.slice(1).toLowerCase();
        return mapa[maiuscula] !== undefined ? mapa[maiuscula] : null;
    }

    function casasDaNotaNaCordaBase(idxRaiz, cordaBase) {
        const baseIdx = cordaBase === 5 ? 9 : (cordaBase === 4 ? 2 : 4);
        const casas = [];
        for (let casa = 1; casa <= 12; casa++) {
            const notaNaCasa = (baseIdx + casa) % 12;
            if (notaNaCasa === idxRaiz) {
                casas.push(casa);
            }
        }
        return casas;
    }

    function normalizarQualidade(qualRaw) {
        const q = String(qualRaw || '').trim();
        if (!q) return '';

        const ql = q.toLowerCase();
        if (ql === 'm' || ql === 'min' || q === '-') return 'm';
        if (ql === '7' || ql === 'dom7') return '7';
        if (ql === '7+' || ql === 'maj7' || q === 'Δ' || q === 'Δ7' || ql === '7m') return '7+';
        if (ql === 'm7') return 'm7';
        if (ql === 'm7(b5)' || ql === 'm7-5' || q === 'ø' || q === 'ø7' || ql === 'halfdim7') return 'm7(b5)';
        if (q === '°7' || ql === 'dim7' || ql === 'o7') return '°7';
        if (q === '°' || ql === 'dim') return '°7';
        if (ql === '5+' || ql === 'aug' || q === '+' || ql === '(#5)') return '7(5+)';
        if (ql === '7(5+)' || ql === '7aug' || ql === '7(#5)' || ql === '+7' || ql === 'aug7') return '7(5+)';
        if (ql === 'sus4' || ql === 'sus' || ql === '4') return 'sus4';
        if (ql === 'sus2' || ql === '2') return '2';
        if (ql === 'add9' || ql === 'add2') return 'add9';
        if (ql === '6') return '6';
        if (ql === 'm6') return 'm6';
        if (ql === '9' || ql === '7(9)') return '7(9)';
        if (ql === '7(b9)') return '7(b9)';
        if (ql === '7(#9)') return '7(#9)';
        if (ql === '7(13)') return '7(13)';
        if (ql === '7(b13)') return '7(b13)';
        if (ql === 'm(7+)' || ql === 'm(maj7)' || ql === 'mmaj7' || ql === 'm7+') return 'm(7+)';

        return q;
    }

    function quebrarCifra(cifraTexto) {
        const limpa = String(cifraTexto || '').trim();
        if (!limpa) return null;

        const semBaixo = limpa.split('/')[0].trim();
        const match = semBaixo.match(/^([A-Ga-g][#b]?)(.*)$/);
        if (!match) return null;

        const raiz = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        const idxRaiz = notaParaIndice(raiz);
        if (idxRaiz === null) return null;

        const resto = (match[2] || '').trim();
        const qualidadeNorm = normalizarQualidade(resto);

        return {
            original: limpa,
            raiz,
            idxRaiz,
            qualidadeRaw: resto,
            qualidade: qualidadeNorm
        };
    }

    function construirVariacaoDeFormaDinamica(formaId, casa, siglaExibicao, descricao) {
        const forma = FORMAS_DINAMICAS[String(formaId)];
        if (!forma) return null;

        const cordasNorm = normalizarCordas(forma.cordas);
        const cordas = cordasNorm.map(c => {
            if (c === 'X') return 'X';
            if (c === 0) return 0;
            return c + casa - 1;
        });

        const pestanaAtiva = Boolean(forma.pestana) || Array.isArray(forma.pestana);
        const pestanaCordas = Array.isArray(forma.pestana)
            ? forma.pestana
            : (Array.isArray(forma.pestanaCordas) ? forma.pestanaCordas : null);

        const pestanaCasaAbsoluta = typeof forma.pestanaCasa === 'number'
            ? (forma.pestanaCasa + casa - 1)
            : null;

        const casaEfetiva = forma.mostrarNumero === false ? 1 : casa;

        return {
            id: `din_${formaId}_${casa}`,
            sigla: siglaExibicao,
            descricao: descricao || `Forma ${formaId} (casa ${casa})`,
            casaInicial: casaEfetiva,
            casaReal: casa,
            cordaBase: forma.cordaBase || 6,
            pestana: pestanaAtiva,
            pestanaCordas,
            pestanaCasaAbsoluta,
            cordas,
            dedos: normalizarDedos(forma.dedos)
        };
    }

    function construirVariacaoDeAcordeDireito(chave, base, siglaExibicao) {
        return {
            id: `dir_${chave}`,
            sigla: siglaExibicao,
            descricao: base.nome || 'Posição aberta',
            casaInicial: base.casaInicial || 1,
            casaReal: base.casaInicial || 1,
            cordaBase: null,
            pestana: Boolean(base.pestana),
            pestanaCordas: Array.isArray(base.pestanaCordas) ? base.pestanaCordas : null,
            pestanaCasaAbsoluta: typeof base.pestanaCasa === 'number' ? base.pestanaCasa : null,
            cordas: normalizarCordas(base.cordas),
            dedos: normalizarDedos(base.dedos)
        };
    }

    function construirVariacaoCaged(molde, idxRaiz, siglaExibicao) {
        const deslocamento = ((idxRaiz - molde.semitonsDesdeC) % 12 + 12) % 12;
        const casa = deslocamento === 0 ? 1 : deslocamento;
        const precisaPestana = deslocamento > 0;

        const cordasAbertas = normalizarCordas(molde.cordasAbertas);
        const dedosAbertos = normalizarDedos(molde.dedosAbertos);

        const cordas = cordasAbertas.map((c) => {
            if (c === 'X') return 'X';
            if (c === 0) return precisaPestana ? casa : 0;
            return c + casa - 1;
        });

        const dedos = dedosAbertos.map((d, idx) => {
            if (cordas[idx] === 'X') return 0;
            if (d > 0) return d;
            return precisaPestana ? 1 : 0;
        });

        return {
            id: `${molde.id}_c${casa}`,
            sigla: siglaExibicao,
            descricao: precisaPestana ? `${molde.rotulo} (${casa}ª casa)` : `${molde.rotulo} (aberto)`,
            casaInicial: casa,
            casaReal: casa,
            cordaBase: null,
            pestana: precisaPestana || Boolean(molde.pestanaAberta),
            pestanaCordas: precisaPestana ? [0, 1, 2, 3, 4, 5] : null,
            pestanaCasaAbsoluta: precisaPestana ? casa : null,
            cordas,
            dedos
        };
    }

    function gerarVariacoesParaCifra(cifraTexto, labelCustom = '') {
        const info = quebrarCifra(cifraTexto);
        const variacoes = [];
        const vistosAssinatura = new Set();

        function adicionarVariacao(item) {
            if (!item || !Array.isArray(item.cordas)) return;
            const assinatura = `${item.cordas.join(',')}|${item.casaInicial}|${item.pestana ? 1 : 0}`;
            if (vistosAssinatura.has(assinatura)) return;
            vistosAssinatura.add(assinatura);
            variacoes.push(item);
        }

        const siglaFinal = labelCustom || (info ? info.original : String(cifraTexto || '').trim());

        if (info) {
            const chaveDireita = ACORDES_DIREITOS[info.original]
                ? info.original
                : Object.keys(ACORDES_DIREITOS).find(k => k.toLowerCase() === info.original.toLowerCase());

            if (chaveDireita) {
                adicionarVariacao(construirVariacaoDeAcordeDireito(chaveDireita, ACORDES_DIREITOS[chaveDireita], siglaFinal));
            }

            const chaveNormalizada = `${info.raiz}${info.qualidade}`;
            if (chaveNormalizada !== chaveDireita && ACORDES_DIREITOS[chaveNormalizada]) {
                adicionarVariacao(construirVariacaoDeAcordeDireito(chaveNormalizada, ACORDES_DIREITOS[chaveNormalizada], siglaFinal));
            }

            const idsCompativeis = Object.keys(FORMAS_DINAMICAS).filter((id) => {
                const n = parseInt(id, 10);
                if (n >= 100) return false;
                const forma = FORMAS_DINAMICAS[id];
                const qForma = normalizarQualidade(forma.nome);
                return qForma === info.qualidade;
            });

            idsCompativeis.forEach((id) => {
                const forma = FORMAS_DINAMICAS[id];
                const casas = casasDaNotaNaCordaBase(info.idxRaiz, forma.cordaBase || 6);
                casas.forEach((casa) => {
                    const descBase = forma.cordaBase
                        ? `Base ${forma.cordaBase}ª corda (${casa}ª casa)`
                        : `Forma ${id} (${casa}ª casa)`;
                    adicionarVariacao(construirVariacaoDeFormaDinamica(id, casa, siglaFinal, descBase));
                });
            });

            MOLDES_CAGED.forEach((molde) => {
                const qualCompativel = molde.qualidades.some(q => normalizarQualidade(q) === info.qualidade);
                if (qualCompativel) {
                    adicionarVariacao(construirVariacaoCaged(molde, info.idxRaiz, siglaFinal));
                }
            });
        }

        variacoes.sort((a, b) => {
            const aAte4 = (a.casaReal || 1) <= 4 ? 0 : 1;
            const bAte4 = (b.casaReal || 1) <= 4 ? 0 : 1;
            if (aAte4 !== bAte4) return aAte4 - bAte4;

            const aAberta = a.id.startsWith('dir_') ? 0 : 1;
            const bAberta = b.id.startsWith('dir_') ? 0 : 1;
            if (aAberta !== bAberta) return aAberta - bAberta;

            return (a.casaReal || 1) - (b.casaReal || 1);
        });

        const chavePref = info ? `${info.raiz}${info.qualidade}`.toLowerCase() : String(cifraTexto || '').trim().toLowerCase();
        const idPreferido = obterPreferencia(chavePref);
        if (idPreferido) {
            const idxPref = variacoes.findIndex(v => v.id === idPreferido);
            if (idxPref > 0) {
                const [escolhida] = variacoes.splice(idxPref, 1);
                escolhida.preferida = true;
                variacoes.unshift(escolhida);
            } else if (idxPref === 0) {
                variacoes[0].preferida = true;
            }
        }

        return {
            chavePreferencia: chavePref,
            variacoes
        };
    }

    function resolverLinhaAcorde(linha) {
        const partes = linha.split('|').map(p => p.trim()).filter(Boolean);
        const espec = partes[0] || '';
        const labelCustom = partes.find(p => !p.includes('=') && p !== espec) || '';

        if (/^\d+\s*;\s*\d+/.test(espec)) {
            const [formaId, casaRaw] = espec.split(';').map(s => s.trim());
            const casa = Math.max(1, parseInt(casaRaw, 10) || 1);
            const forma = FORMAS_DINAMICAS[formaId];
            if (!forma) return { erro: `Forma dinâmica "${formaId}" não encontrada.` };

            const numId = parseInt(formaId, 10);
            const nomeForma = String(forma.nome || '').trim();
            let siglaPadrao;

            if (numId >= 100 && nomeForma) {
                siglaPadrao = nomeForma;
            } else {
                const notaRaiz = calcularNotaPorCordaBase(forma, casa);
                siglaPadrao = `${notaRaiz}${nomeForma}`;
            }

            const principal = construirVariacaoDeFormaDinamica(
                formaId,
                casa,
                labelCustom || siglaPadrao,
                `Forma ${formaId} (${casa}ª casa)`
            );
            principal.preferida = true;

            const info = quebrarCifra(siglaPadrao);
            const extras = info ? gerarVariacoesParaCifra(siglaPadrao, labelCustom || siglaPadrao).variacoes : [];
            const todas = [principal];
            const assinaturas = new Set([`${principal.cordas.join(',')}|${principal.casaInicial}`]);

            extras.forEach((v) => {
                const sig = `${v.cordas.join(',')}|${v.casaInicial}`;
                if (!assinaturas.has(sig)) {
                    assinaturas.add(sig);
                    todas.push(v);
                }
            });

            return {
                ...principal,
                chavePreferencia: info ? `${info.raiz}${info.qualidade}`.toLowerCase() : siglaPadrao.toLowerCase(),
                variacoes: todas
            };
        }

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

            const manualItem = {
                id: `custom_${sigla}_${casaInicial}`,
                sigla,
                descricao: 'Configuração manual',
                casaInicial,
                casaReal: casaInicial,
                pestana,
                cordas,
                dedos,
                preferida: true
            };

            return {
                ...manualItem,
                chavePreferencia: sigla.toLowerCase(),
                variacoes: [manualItem]
            };
        }

        const gerado = gerarVariacoesParaCifra(espec, labelCustom);
        if (!gerado.variacoes.length) {
            return { erro: `Acorde "${espec}" não encontrado no dicionário.` };
        }

        return {
            ...gerado.variacoes[0],
            chavePreferencia: gerado.chavePreferencia,
            variacoes: gerado.variacoes
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

        ctx.fillStyle = estiloCfg.cifraCor;
        ctx.font = `bold ${estiloCfg.cifraTamanho}px ${estiloCfg.cifraFonte}`;
        ctx.textAlign = cifraAlign;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(String(cfg.sigla || ''), cifraX, estiloCfg.cifraY);

        if (casaInicial > 1) {
            ctx.fillStyle = '#475569';
            ctx.font = 'bold 12px Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${casaInicial}ª`, xInicial - 8, yInicial + espTrastes / 2 + 4);
        }

        ctx.strokeStyle = '#475569';
        for (let i = 0; i <= numTrastes; i++) {
            ctx.lineWidth = (i === 0 && casaInicial === 1) ? 4 : 1.5;
            ctx.beginPath();
            ctx.moveTo(xInicial, yInicial + i * espTrastes);
            ctx.lineTo(xInicial + 5 * espCordas, yInicial + i * espTrastes);
            ctx.stroke();
        }

        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(xInicial + i * espCordas, yInicial);
            ctx.lineTo(xInicial + i * espCordas, yInicial + numTrastes * espTrastes);
            ctx.stroke();
        }

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

    function montarCardAcorde(res, estiloCfg) {
        const card = document.createElement('div');
        card.className = 'violao-card';

        if (res.erro) {
            card.innerHTML = `<span class="error">${res.erro}</span>`;
            return card;
        }

        const variacoes = Array.isArray(res.variacoes) && res.variacoes.length ? res.variacoes : [res];
        let indiceAtual = 0;
        let mostrarTodas = false;

        const palcoPrincipal = document.createElement('div');
        palcoPrincipal.className = 'violao-principal-wrap';

        const acoesBar = document.createElement('div');
        acoesBar.className = 'violao-acoes';
        acoesBar.style.display = 'flex';
        acoesBar.style.gap = '6px';
        acoesBar.style.justifyContent = 'center';
        acoesBar.style.flexWrap = 'wrap';
        acoesBar.style.marginTop = '6px';

        const btnPreferencia = document.createElement('button');
        btnPreferencia.type = 'button';
        btnPreferencia.className = 'violao-btn-pref';
        btnPreferencia.style.cursor = 'pointer';
        btnPreferencia.style.fontSize = '11px';
        btnPreferencia.style.padding = '3px 7px';
        btnPreferencia.style.borderRadius = '4px';
        btnPreferencia.style.border = '1px solid #cbd5e1';

        const btnVariacoes = document.createElement('button');
        btnVariacoes.type = 'button';
        btnVariacoes.className = 'violao-btn-var';
        btnVariacoes.style.cursor = 'pointer';
        btnVariacoes.style.fontSize = '11px';
        btnVariacoes.style.padding = '3px 7px';
        btnVariacoes.style.borderRadius = '4px';
        btnVariacoes.style.border = '1px solid #cbd5e1';
        btnVariacoes.style.background = '#f8fafc';
        btnVariacoes.style.color = '#1e293b';

        const painelVariacoes = document.createElement('div');
        painelVariacoes.className = 'violao-variacoes-lista';
        painelVariacoes.style.display = 'none';
        painelVariacoes.style.marginTop = '8px';
        painelVariacoes.style.paddingTop = '8px';
        painelVariacoes.style.borderTop = '1px dashed #cbd5e1';

        function atualizarBotaoPreferencia(variacaoAtiva) {
            const prefSalva = obterPreferencia(res.chavePreferencia);
            const ehPreferida = Boolean(variacaoAtiva.preferida) || (prefSalva && prefSalva === variacaoAtiva.id);

            if (ehPreferida) {
                btnPreferencia.textContent = '★ Principal';
                btnPreferencia.style.background = '#fef3c7';
                btnPreferencia.style.color = '#92400e';
                btnPreferencia.style.borderColor = '#f59e0b';
            } else {
                btnPreferencia.textContent = '☆ Preferência';
                btnPreferencia.style.background = '#ffffff';
                btnPreferencia.style.color = '#334155';
                btnPreferencia.style.borderColor = '#cbd5e1';
            }
        }

        function renderizarPainelVariacoes() {
            painelVariacoes.innerHTML = '';
            if (!mostrarTodas) {
                painelVariacoes.style.display = 'none';
                return;
            }

            painelVariacoes.style.display = 'grid';
            painelVariacoes.style.gridTemplateColumns = 'repeat(auto-fit, minmax(152px, 1fr))';
            painelVariacoes.style.gap = '8px';

            variacoes.forEach((varItem, idx) => {
                const subCard = document.createElement('div');
                subCard.className = 'violao-var-item';
                subCard.style.border = '1px solid #e2e8f0';
                subCard.style.borderRadius = '6px';
                subCard.style.padding = '6px';
                subCard.style.background = '#ffffff';
                subCard.style.textAlign = 'center';

                subCard.appendChild(criarCanvasAcorde(varItem, estiloCfg));

                const subBar = document.createElement('div');
                subBar.style.display = 'flex';
                subBar.style.gap = '4px';
                subBar.style.justifyContent = 'center';
                subBar.style.marginTop = '4px';
                subBar.style.flexWrap = 'wrap';

                const btnUsar = document.createElement('button');
                btnUsar.type = 'button';
                btnUsar.textContent = 'Ver';
                btnUsar.style.cursor = 'pointer';
                btnUsar.style.fontSize = '11px';
                btnUsar.style.padding = '2px 6px';
                btnUsar.style.borderRadius = '4px';
                btnUsar.style.border = '1px solid #cbd5e1';
                btnUsar.style.background = '#f1f5f9';
                btnUsar.addEventListener('click', () => {
                    indiceAtual = idx;
                    renderizarPrincipal();
                });

                const btnFavSub = document.createElement('button');
                btnFavSub.type = 'button';
                const prefSalva = obterPreferencia(res.chavePreferencia);
                const isFav = prefSalva === varItem.id || (idx === 0 && varItem.preferida);
                btnFavSub.textContent = isFav ? '★ Principal' : '☆ Preferência';
                btnFavSub.style.cursor = 'pointer';
                btnFavSub.style.fontSize = '11px';
                btnFavSub.style.padding = '2px 6px';
                btnFavSub.style.borderRadius = '4px';
                btnFavSub.style.border = isFav ? '1px solid #f59e0b' : '1px solid #cbd5e1';
                btnFavSub.style.background = isFav ? '#fef3c7' : '#ffffff';
                btnFavSub.style.color = isFav ? '#92400e' : '#334155';

                btnFavSub.addEventListener('click', () => {
                    if (res.chavePreferencia) {
                        salvarPreferencia(res.chavePreferencia, varItem.id);
                    }
                    variacoes.forEach((v, i) => {
                        v.preferida = (i === idx);
                    });
                    const [escolhida] = variacoes.splice(idx, 1);
                    variacoes.unshift(escolhida);
                    indiceAtual = 0;
                    renderizarPrincipal();
                    renderizarPainelVariacoes();
                });

                subBar.appendChild(btnUsar);
                subBar.appendChild(btnFavSub);
                subCard.appendChild(subBar);
                painelVariacoes.appendChild(subCard);
            });
        }

        function renderizarPrincipal() {
            const atual = variacoes[indiceAtual] || variacoes[0];
            palcoPrincipal.innerHTML = '';
            palcoPrincipal.appendChild(criarCanvasAcorde(atual, estiloCfg));
            atualizarBotaoPreferencia(atual);
            btnVariacoes.textContent = mostrarTodas
                ? 'Ocultar variações'
                : `Variações (${variacoes.length})`;
        }

        btnPreferencia.addEventListener('click', () => {
            const atual = variacoes[indiceAtual] || variacoes[0];
            if (res.chavePreferencia && atual && atual.id) {
                salvarPreferencia(res.chavePreferencia, atual.id);
            }
            variacoes.forEach((v, i) => {
                v.preferida = (i === indiceAtual);
            });
            const [escolhida] = variacoes.splice(indiceAtual, 1);
            variacoes.unshift(escolhida);
            indiceAtual = 0;
            renderizarPrincipal();
            if (mostrarTodas) renderizarPainelVariacoes();
        });

        btnVariacoes.addEventListener('click', () => {
            mostrarTodas = !mostrarTodas;
            renderizarPrincipal();
            renderizarPainelVariacoes();
        });

        card.appendChild(palcoPrincipal);
        acoesBar.appendChild(btnPreferencia);
        if (variacoes.length > 1) {
            acoesBar.appendChild(btnVariacoes);
        }
        card.appendChild(acoesBar);
        card.appendChild(painelVariacoes);

        renderizarPrincipal();
        return card;
    }

    function garantirModal() {
        let modal = document.getElementById(MODAL_ID);
        if (modal) return modal;

        modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.style.position = 'fixed';
        modal.style.inset = '0';
        modal.style.background = 'rgba(15, 23, 42, 0.55)';
        modal.style.display = 'none';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.padding = '16px';
        modal.style.zIndex = '9999';

        const caixa = document.createElement('div');
        caixa.className = 'violao-modal-box';
        caixa.style.background = '#ffffff';
        caixa.style.borderRadius = '10px';
        caixa.style.width = 'min(92vw, 720px)';
        caixa.style.maxHeight = '85vh';
        caixa.style.display = 'flex';
        caixa.style.flexDirection = 'column';
        caixa.style.boxShadow = '0 14px 36px rgba(0, 0, 0, 0.25)';
        caixa.style.overflow = 'hidden';

        const topo = document.createElement('div');
        topo.className = 'violao-modal-header';
        topo.style.display = 'flex';
        topo.style.alignItems = 'center';
        topo.style.justifyContent = 'space-between';
        topo.style.gap = '8px';
        topo.style.padding = '10px 14px';
        topo.style.borderBottom = '1px solid #e2e8f0';
        topo.style.background = '#f8fafc';
        topo.style.flexWrap = 'wrap';

        const titulo = document.createElement('strong');
        titulo.className = 'violao-modal-titulo';
        titulo.style.fontSize = '15px';
        titulo.style.color = '#0f172a';

        const controles = document.createElement('div');
        controles.style.display = 'flex';
        controles.style.alignItems = 'center';
        controles.style.gap = '8px';

        const btnOrientacao = document.createElement('button');
        btnOrientacao.type = 'button';
        btnOrientacao.className = 'violao-modal-orientacao';
        btnOrientacao.style.cursor = 'pointer';
        btnOrientacao.style.fontSize = '12px';
        btnOrientacao.style.padding = '5px 10px';
        btnOrientacao.style.borderRadius = '6px';
        btnOrientacao.style.border = '1px solid #cbd5e1';
        btnOrientacao.style.background = '#ffffff';
        btnOrientacao.style.color = '#1e293b';

        const btnFechar = document.createElement('button');
        btnFechar.type = 'button';
        btnFechar.textContent = '✕';
        btnFechar.title = 'Fechar';
        btnFechar.style.cursor = 'pointer';
        btnFechar.style.fontSize = '14px';
        btnFechar.style.padding = '4px 9px';
        btnFechar.style.borderRadius = '6px';
        btnFechar.style.border = '1px solid #cbd5e1';
        btnFechar.style.background = '#ffffff';
        btnFechar.style.color = '#334155';

        btnFechar.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });

        const corpoRolavel = document.createElement('div');
        corpoRolavel.className = 'violao-modal-corpo';
        corpoRolavel.style.padding = '14px';
        corpoRolavel.style.overflow = 'auto';
        corpoRolavel.style.maxHeight = 'calc(85vh - 54px)';
        corpoRolavel.style.webkitOverflowScrolling = 'touch';

        const listaVariacoes = document.createElement('div');
        listaVariacoes.className = 'violao-modal-lista';

        controles.appendChild(btnOrientacao);
        controles.appendChild(btnFechar);
        topo.appendChild(titulo);
        topo.appendChild(controles);
        corpoRolavel.appendChild(listaVariacoes);
        caixa.appendChild(topo);
        caixa.appendChild(corpoRolavel);
        modal.appendChild(caixa);
        document.body.appendChild(modal);

        return modal;
    }

    function aplicarOrientacaoLista(listaEl, btnEl) {
        if (orientacaoModal === 'horizontal') {
            listaEl.style.display = 'flex';
            listaEl.style.flexDirection = 'row';
            listaEl.style.alignItems = 'flex-start';
            listaEl.style.gap = '12px';
            listaEl.style.overflowX = 'auto';
            listaEl.style.paddingBottom = '6px';
            btnEl.textContent = '↔ Horizontal';
        } else {
            listaEl.style.display = 'flex';
            listaEl.style.flexDirection = 'column';
            listaEl.style.alignItems = 'center';
            listaEl.style.gap = '12px';
            listaEl.style.overflowX = 'visible';
            listaEl.style.paddingBottom = '0';
            btnEl.textContent = '↕ Vertical';
        }
    }

    function abrirModalAcorde(acordeTexto) {
        const modal = garantirModal();
        const tituloEl = modal.querySelector('.violao-modal-titulo');
        const btnOrientacao = modal.querySelector('.violao-modal-orientacao');
        const listaEl = modal.querySelector('.violao-modal-lista');

        const sigla = String(acordeTexto || '').trim();
        tituloEl.textContent = `🎸 Acorde: ${sigla}`;

        function desenharConteudo() {
            const variacoes = window.ViolaoModule.resolverVariacoesAcorde(sigla) || [];
            listaEl.innerHTML = '';
            aplicarOrientacaoLista(listaEl, btnOrientacao);

            if (!variacoes.length) {
                listaEl.innerHTML = `<p style="color:#dc2626;margin:0;">Nenhuma variação encontrada para "${sigla}".</p>`;
                return;
            }

            variacoes.forEach((varItem, idx) => {
                const itemBox = document.createElement('div');
                itemBox.style.border = idx === 0 ? '2px solid #f59e0b' : '1px solid #e2e8f0';
                itemBox.style.borderRadius = '8px';
                itemBox.style.padding = '10px';
                itemBox.style.background = '#ffffff';
                itemBox.style.textAlign = 'center';
                itemBox.style.minWidth = '170px';
                itemBox.style.flexShrink = orientacaoModal === 'horizontal' ? '0' : '1';
                itemBox.style.width = orientacaoModal === 'horizontal' ? 'auto' : '100%';
                itemBox.style.maxWidth = orientacaoModal === 'horizontal' ? '220px' : '320px';

                itemBox.appendChild(criarCanvasAcorde(varItem, parseEstiloViolao('')));

                if (varItem.descricao) {
                    const desc = document.createElement('div');
                    desc.textContent = varItem.descricao;
                    desc.style.fontSize = '12px';
                    desc.style.color = '#475569';
                    desc.style.marginTop = '4px';
                    itemBox.appendChild(desc);
                }

                const btnPref = document.createElement('button');
                btnPref.type = 'button';
                btnPref.textContent = idx === 0 && varItem.preferida ? '★ Principal' : '☆ Preferência';
                btnPref.style.marginTop = '6px';
                btnPref.style.cursor = 'pointer';
                btnPref.style.fontSize = '11px';
                btnPref.style.padding = '4px 9px';
                btnPref.style.borderRadius = '5px';
                btnPref.style.border = idx === 0 && varItem.preferida ? '1px solid #f59e0b' : '1px solid #cbd5e1';
                btnPref.style.background = idx === 0 && varItem.preferida ? '#fef3c7' : '#f8fafc';
                btnPref.style.color = idx === 0 && varItem.preferida ? '#92400e' : '#1e293b';

                btnPref.addEventListener('click', () => {
                    window.ViolaoModule.definirPreferenciaAcorde(sigla, varItem.id);
                    desenharConteudo();
                });

                itemBox.appendChild(btnPref);
                listaEl.appendChild(itemBox);
            });
        }

        btnOrientacao.onclick = () => {
            orientacaoModal = orientacaoModal === 'vertical' ? 'horizontal' : 'vertical';
            desenharConteudo();
        };

        desenharConteudo();
        modal.style.display = 'flex';
    }

    // Delegação global para elementos de acorde clicáveis em cifras/partituras
    document.addEventListener('click', (e) => {
        if (e.target.closest(`#${MODAL_ID}`) || e.target.closest('.violao-block')) return;

        const alvo = e.target.closest('[data-acorde], [data-cifra], .acorde, .cifra-acorde');
        if (!alvo) return;

        const rawAcorde = alvo.getAttribute('data-acorde')
            || alvo.getAttribute('data-cifra')
            || alvo.textContent
            || '';
        const limpo = rawAcorde.replace(/^\[|\]$/g, '').trim();
        if (limpo && /^[A-Ga-g][#b]?/.test(limpo)) {
            abrirModalAcorde(limpo);
        }
    });

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
                grid.appendChild(montarCardAcorde(res, estiloCfg));
            });

            block.appendChild(grid);
            return block;
        },

        resolverVariacoesAcorde(cifraOuLinha, labelCustom = '') {
            const texto = String(cifraOuLinha || '').trim();
            if (/^\d+\s*;\s*\d+/.test(texto) || texto.includes(':')) {
                const res = resolverLinhaAcorde(texto);
                return res.erro ? [] : (res.variacoes || [res]);
            }
            return gerarVariacoesParaCifra(texto, labelCustom).variacoes;
        },

        definirPreferenciaAcorde(cifra, variacaoId) {
            const info = quebrarCifra(cifra);
            const chave = info ? `${info.raiz}${info.qualidade}`.toLowerCase() : String(cifra || '').trim().toLowerCase();
            salvarPreferencia(chave, variacaoId);
        },

        criarCanvasAcorde(cfg, estiloRaw = '') {
            return criarCanvasAcorde(cfg, parseEstiloViolao(estiloRaw));
        },

        abrirModal(acordeTexto) {
            abrirModalAcorde(acordeTexto);
        }
    };

    window.abrirModalAcordeViolao = abrirModalAcorde;
})();
