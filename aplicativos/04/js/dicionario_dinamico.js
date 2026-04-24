// ============================================
// DICIONÁRIO DINÂMICO DE ACORDES
// ============================================
// Formato: 'ID': { nome, cordaBase, cordas, dedos, pestana }

const FORMAS_INFINITAS = {
    // ===== CORDAS BASE 6 (Mi) =====
    '1': { nome: 'Maior', cordaBase: 6, cordas: [1, 3, 3, 2, 1, 1], dedos: ['1', '3', '4', '2', '1', '1'], pestana: [0,1,2,3,4,5] },
    '2': { nome: 'Menor', cordaBase: 6, cordas: [1, 3, 3, 1, 1, 1], dedos: ['1', '3', '4', '1', '1', '1'], pestana: [0,1,2,3,4,5] },
    '3': { nome: 'Sétima', cordaBase: 6, cordas: [1, 3, 1, 2, 4, 1], dedos: ['1', '3', '1', '2', '4', '1'], pestana: [0,1,2,3,4,5] },
    
    // ===== CORDAS BASE 5 (Lá) =====
    '4': { nome: 'Maior', cordaBase: 5, cordas: [-1, 1, 3, 3, 3, 1], dedos: ['', '1', '3', '4', '2', '1'], pestana: [1,2,3,4,5] },
    '5': { nome: 'Menor', cordaBase: 5, cordas: [-1, 1, 2, 2, 3, 1], dedos: ['', '1', '2', '3', '4', '1'], pestana: [1,2,3,4,5] },
    '6': { nome: 'Sétima', cordaBase: 5, cordas: [-1, 1, 3, 2, 3, 1], dedos: ['', '1', '3', '2', '4', '1'], pestana: [1,2,3,4,5] },
    '10': { nome: '7+', cordaBase: 5, cordas: [-1,1,3,2,3,1], dedos: ["0","1","3","2","4","1"], pestana: [1,2,3,4,5] },
    '11': { nome: 'Maior', cordaBase: 6, cordas: [1,3,3,2,1,1], dedos: ["1","3","4","2","1","1"], pestana: [0,1,2,3,4,5] },
    // ===== CORDAS BASE 4 (Ré) =====
    '7': { nome: 'Maior', cordaBase: 4, cordas: [-1, -1, 1, 3, 3, 1], dedos: ['', '', '1', '3', '4', '2'], pestana: [2,3,4,5] },
    '8': { nome: 'Menor', cordaBase: 4, cordas: [-1, -1, 1, 2, 3, 1], dedos: ['', '', '1', '2', '3', '4'], pestana: [2,3,4,5] },
    '9': { nome: 'Sétima', cordaBase: 4, cordas: [-1, -1, 1, 3, 2, 1], dedos: ['', '', '1', '3', '2', '4'], pestana: [2,3,4,5] },
    
    // ===== ESPAÇO PARA ADICIONAR MAIS FORMAS =====
    // Exemplo: 
    // '10': { nome: 'Maior com 5ª', cordaBase: 6, cordas: [1, 1, 3, 3, 3, 1], dedos: ['1', '1', '3', '4', '2', '1'], pestana: [0,1,2,3,4,5] },
    // '11': { nome: 'Tríade', cordaBase: 3, cordas: [-1, -1, -1, 1, 3, 3], dedos: ['', '', '', '1', '3', '4'], pestana: [3,4,5] },
};

const FORMAS_SEM_PESTANA_INFINITAS = {
    '1': { nome: 'Maior', cordas: [-1, 3, 2, 2, 3, -1], dedos: ['', '3', '1', '2', '4', ''], pestana: false },
    '2': { nome: 'Menor', cordas: [-1, 0, 2, 2, 1, 0], dedos: ['', '', '2', '3', '1', ''], pestana: false },
    '3': { nome: 'Sétima', cordas: [-1, 0, 2, 1, 2, 0], dedos: ['', '', '2', '1', '3', ''], pestana: false },
    
    // ===== ESPAÇO PARA ADICIONAR MAIS FORMAS SEM PESTANA =====
    // Exemplo:
    // '4': { nome: 'Maior aberto', cordas: [0, 0, 0, 2, 2, 0], dedos: ['', '', '', '2', '3', ''], pestana: false },
    // '5': { nome: 'Menor aberto', cordas: [0, 2, 2, 1, 0, 0], dedos: ['', '2', '3', '1', '', ''], pestana: false },
};

// Exporta para uso global
if (typeof window !== 'undefined') {
    window.FORMAS_INFINITAS = FORMAS_INFINITAS;
    window.FORMAS_SEM_PESTANA_INFINITAS = FORMAS_SEM_PESTANA_INFINITAS;
}
