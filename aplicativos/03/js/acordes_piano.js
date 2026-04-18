// ============================================
// DICIONÁRIO DE ACORDES DE PIANO
// ============================================

const ACORDES_PIANO = {
    // Acordes Maiores
    'C': { nome: 'Dó Maior', notas: ['C', 'E', 'G'] },
    'Cm': { nome: 'Dó Menor', notas: ['C', 'Eb', 'G'] },
    'C7': { nome: 'Dó com Sétima', notas: ['C', 'E', 'G', 'Bb'] },
    'Cmaj7': { nome: 'Dó com Sétima Maior', notas: ['C', 'E', 'G', 'B'] },
    'Cdim': { nome: 'Dó Diminuto', notas: ['C', 'Eb', 'Gb'] },
    'Caug': { nome: 'Dó Aumentado', notas: ['C', 'E', 'G#'] },
    
    'D': { nome: 'Ré Maior', notas: ['D', 'F#', 'A'] },
    'Dm': { nome: 'Ré Menor', notas: ['D', 'F', 'A'] },
    'D7': { nome: 'Ré com Sétima', notas: ['D', 'F#', 'A', 'C'] },
    
    'E': { nome: 'Mi Maior', notas: ['E', 'G#', 'B'] },
    'Em': { nome: 'Mi Menor', notas: ['E', 'G', 'B'] },
    'E7': { nome: 'Mi com Sétima', notas: ['E', 'G#', 'B', 'D'] },
    
    'F': { nome: 'Fá Maior', notas: ['F', 'A', 'C'] },
    'Fm': { nome: 'Fá Menor', notas: ['F', 'Ab', 'C'] },
    'F7': { nome: 'Fá com Sétima', notas: ['F', 'A', 'C', 'Eb'] },
    
    'G': { nome: 'Sol Maior', notas: ['G', 'B', 'D'] },
    'Gm': { nome: 'Sol Menor', notas: ['G', 'Bb', 'D'] },
    'G7': { nome: 'Sol com Sétima', notas: ['G', 'B', 'D', 'F'] },
    
    'A': { nome: 'Lá Maior', notas: ['A', 'C#', 'E'] },
    'Am': { nome: 'Lá Menor', notas: ['A', 'C', 'E'] },
    'A7': { nome: 'Lá com Sétima', notas: ['A', 'C#', 'E', 'G'] },
    
    'B': { nome: 'Si Maior', notas: ['B', 'D#', 'F#'] },
    'Bm': { nome: 'Si Menor', notas: ['B', 'D', 'F#'] },
    'B7': { nome: 'Si com Sétima', notas: ['B', 'D#', 'F#', 'A'] }
};

// Função para gerar ABC a partir das notas
function gerarABCparaPiano(sigla, oitava = 4) {
    const acorde = ACORDES_PIANO[sigla];
    if (!acorde) return null;
    
    const notasABC = acorde.notas.map(nota => {
        const notaBase = nota.charAt(0);
        const acidente = nota.includes('#') ? '^' : (nota.includes('b') ? '_' : '');
        const notaLimpa = nota.replace(/[#b]/g, '');
        
        if (oitava === 4) return `${acidente}${notaLimpa}0`;
        if (oitava === 3) return `${acidente}${notaLimpa},0`;
        if (oitava === 5) return `${acidente}${notaLimpa.toLowerCase()}0`;
        return `${acidente}${notaLimpa}0`;
    });
    
    return `X:1\nK:C\nV:1 clef=treble\n[${notasABC.join(' ')}]|]`;
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ACORDES_PIANO, gerarABCparaPiano };
}
