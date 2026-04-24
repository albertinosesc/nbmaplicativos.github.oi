// acordes_piano.js
// ============================================
// DICIONÁRIO DE ACORDES DE PIANO 
// ============================================


const ACORDES_PIANO = {
    // ===== ACORDES MAIORES =====
    'CF': { nome: 'Dó Maior', notas: ['C3','E3','G3'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'C#F': { nome: 'Dó# Maior', notas: ['C#3','F3','G#3'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'DbF': { nome: 'Réb Maior', notas: ['Db3','F3','Ab3'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },

    'DF': { nome: 'Ré Maior', notas: ['D3','F#3','A3'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'D#F': { nome: 'Ré# Maior', notas: ['D#3','G3','A#3'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'EbF': { nome: 'Mib Maior', notas: ['Eb3','G3','Bb3'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },

    'EF': { nome: 'Mi Maior', notas: ['E3','G#3','B3'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },

    'FF': { nome: 'Fá Maior', notas: ['F3','A3','C4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'F#F': { nome: 'Fá# Maior', notas: ['F#3','A#3','C#4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'GbF': { nome: 'Solb Maior', notas: ['Gb3','Bb3','Db4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },

    'GF': { nome: 'Sol Maior', notas: ['G3','B3','D4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'G#F': { nome: 'Sol# Maior', notas: ['G#3','C4','D#4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'AbF': { nome: 'Láb Maior', notas: ['Ab3','C4','Eb4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },

    'AF': { nome: 'Lá Maior', notas: ['A3','C#4','E4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'A#F': { nome: 'Lá# Maior', notas: ['A#3','D4','F4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'BbF': { nome: 'Sib Maior', notas: ['Bb3','D4','F4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },

    'BF': { nome: 'Si Maior', notas: ['B3','D#4','F#4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },

    // ===== ACORDES MENORES =====
    'CmF': { nome: 'Dó Menor', notas: ['C3','Eb3','G3'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'DmF': { nome: 'Ré Menor', notas: ['D3','F3','A3'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'EmF': { nome: 'Mi Menor', notas: ['E3','G3','B3'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'FmF': { nome: 'Fá Menor', notas: ['F3','Ab3','C4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'GmF': { nome: 'Sol Menor', notas: ['G3','Bb3','D4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'AmF': { nome: 'Lá Menor', notas: ['A3','C4','E4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'BmF': { nome: 'Si Menor', notas: ['B3','D4','F#4'], dedosTreble: ['1','3','5'], startOitava: 'C3', endOitava: 'C5' },

    // ===== ACORDES COM SÉTIMA =====
    'C7F': { nome: 'Dó7', notas: ['C3','E3','G3','Bb3'], dedosTreble: ['1','2','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'D7F': { nome: 'Ré7', notas: ['D3','F#3','A3','C4'], dedosTreble: ['1','2','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'G7F': { nome: 'Sol7', notas: ['G3','B3','D4','F4'], dedosTreble: ['1','2','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'A7F': { nome: 'Lá7', notas: ['A3','C#4','E4','G4'], dedosTreble: ['1','2','3','5'], startOitava: 'C3', endOitava: 'C5' },


// ==============================RIMEIRA INVERSÃO ============================================================================================================
 
// ===== ACORDES MAIORES =====
    'C1': { nome: 'Dó Maior', notas: ['E3','G3','C4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'C#1': { nome: 'Dó# Maior', notas: ['F3','G#3','C#4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'Db1': { nome: 'Réb Maior', notas: ['F3','Ab3','Db4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },

    'D1': { nome: 'Ré Maior', notas: ['F#3','A3','D4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'D#1': { nome: 'Ré# Maior', notas: ['G3','A#3','D#4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'Eb1': { nome: 'Mib Maior', notas: ['G3','Bb3','Eb4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },

    'E1': { nome: 'Mi Maior', notas: ['G#3','B3','E4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },

    'F1': { nome: 'Fá Maior', notas: ['A3','C4','F4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'F#1': { nome: 'Fá# Maior', notas: ['A#3','C#4','F#4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'Gb1': { nome: 'Solb Maior', notas: ['Bb3','Db4','Gb4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },

    'G1': { nome: 'Sol Maior', notas: ['B3','D4','G4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'G#1': { nome: 'Sol# Maior', notas: ['C4','D#4','G#4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'Ab1': { nome: 'Láb Maior', notas: ['C4','Eb4','Ab4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },

    'A1': { nome: 'Lá Maior', notas: ['C#4','E4','A4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'A#1': { nome: 'Lá# Maior', notas: ['D4','F4','A#4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'Bb1': { nome: 'Sib Maior', notas: ['D4','F4','Bb4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },

    'B1': { nome: 'Si Maior', notas: ['D#4','F#4','B4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },

    // ===== ACORDES MENORES =====
    'Cm1': { nome: 'Dó Menor', notas: ['Eb3','G3','C4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'Dm1': { nome: 'Ré Menor', notas: ['F3','A3','D4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'Em1': { nome: 'Mi Menor', notas: ['G3','B3','E4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'Fm1': { nome: 'Fá Menor', notas: ['Ab3','C4','F4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'Gm1': { nome: 'Sol Menor', notas: ['Bb3','D4','G4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'Am1': { nome: 'Lá Menor', notas: ['C4','E4','A4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },
    'Bm1': { nome: 'Si Menor', notas: ['D4','F#4','B4'], dedosTreble: ['1','2','5'], startOitava: 'C3', endOitava: 'C5' },

    // ===== ACORDES COM SÉTIMA =====
    'C71': { nome: 'Dó7', notas: ['E3','G3','Bb3','C4'], dedosTreble: ['1','2','4','5'], startOitava: 'C3', endOitava: 'C5' },
    'D71': { nome: 'Ré7', notas: ['F#3','A3','C4','D4'], dedosTreble: ['1','2','4','5'], startOitava: 'C3', endOitava: 'C5' },
    'G71': { nome: 'Sol7', notas: ['B3','D4','F4','G4'], dedosTreble: ['1','2','4','5'], startOitava: 'C3', endOitava: 'C5' },
    'A71': { nome: 'Lá7', notas: ['C#4','E4','G4','A4'], dedosTreble: ['1','2','4','5'], startOitava: 'C3', endOitava: 'C5' },

// ==============================SEGUNDA INVERSÃO ============================================================================================================

    
    // ===== ACORDES MAIORES =====
    'C2': { nome: 'Dó Maior', notas: ['G3','C4','E4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'C#2': { nome: 'Dó# Maior', notas: ['G#3','C#4','F4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'Db2': { nome: 'Réb Maior', notas: ['Ab3','Db4','F4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },

    'D2': { nome: 'Ré Maior', notas: ['A3','D4','F#4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'D#2': { nome: 'Ré# Maior', notas: ['A#3','D#4','G4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'Eb2': { nome: 'Mib Maior', notas: ['Bb3','Eb4','G4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },

    'E2': { nome: 'Mi Maior', notas: ['B3','E4','G#4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },

    'F2': { nome: 'Fá Maior', notas: ['C4','F4','A4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'F#2': { nome: 'Fá# Maior', notas: ['C#4','F#4','A#4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'Gb2': { nome: 'Solb Maior', notas: ['Db4','Gb4','Bb4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },

    'G2': { nome: 'Sol Maior', notas: ['D4','G4','B4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'G#2': { nome: 'Sol# Maior', notas: ['D#4','G#4','C5'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'Ab2': { nome: 'Láb Maior', notas: ['Eb4','Ab4','C5'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },

    'A2': { nome: 'Lá Maior', notas: ['E4','A4','C#5'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'A#2': { nome: 'Lá# Maior', notas: ['F4','A#4','D5'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'Bb2': { nome: 'Sib Maior', notas: ['F4','Bb4','D5'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },

    'B2': { nome: 'Si Maior', notas: ['F#4','B4','D#5'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },

    // ===== ACORDES MENORES =====
    'Cm2': { nome: 'Dó Menor', notas: ['G3','C4','Eb4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'Dm2': { nome: 'Ré Menor', notas: ['A3','D4','F4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'Em2': { nome: 'Mi Menor', notas: ['B3','E4','G4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'Fm2': { nome: 'Fá Menor', notas: ['C4','F4','Ab4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'Gm2': { nome: 'Sol Menor', notas: ['D4','G4','Bb4'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'Am2': { nome: 'Lá Menor', notas: ['E4','A4','C5'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },
    'Bm2': { nome: 'Si Menor', notas: ['F#4','B4','D5'], dedosTreble: ['1','2','3'], startOitava: 'C3', endOitava: 'C5' },

    // ===== ACORDES COM SÉTIMA =====
    'C72': { nome: 'Dó7', notas: ['G3','Bb3','C4','E4'], dedosTreble: ['1','2','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'D72': { nome: 'Ré7', notas: ['A3','C4','D4','F#4'], dedosTreble: ['1','2','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'G72': { nome: 'Sol7', notas: ['D4','F4','G4','B4'], dedosTreble: ['1','2','3','5'], startOitava: 'C3', endOitava: 'C5' },
    'A72': { nome: 'Lá7', notas: ['E4','G4','A4','C#5'], dedosTreble: ['1','2','3','5'], startOitava: 'C3', endOitava: 'C5' }

    
};


// ============================================
// FUNÇÃO PARA DESENHAR ACORDE DE PIANO PADRÃO
// ============================================
function desenharAcordePianoPreview(container, sigla, nome) {
    const acorde = ACORDES_PIANO[sigla];
    
    if (!acorde) {
        container.innerHTML = `<div style="color:red; padding:10px;">❌ Acorde "${sigla}" não encontrado</div>`;
        return;
    }
    
    // Usa a mesma função do main.js
    if (typeof desenharTecladoPiano === 'function') {
        desenharTecladoPiano(container, sigla, acorde.nome, acorde.notas, acorde.startOitava, acorde.endOitava, acorde.dedosTreble);
    } else {
        // Fallback
        container.innerHTML = `<div style="color:red; padding:10px;">❌ Função desenharTecladoPiano não encontrada</div>`;
    }
}

// ============================================
// FUNÇÃO PARA GERAR CÓDIGO ABC
// ============================================
function gerarABCPiano(sigla, oitava = 4) {
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
    
    return `X:1\nM:4/4\nL:1/4\nK:C\n[${notasABC.join(' ')}]|]`;
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function buscarAcordePiano(sigla) {
    return ACORDES_PIANO[sigla] || null;
}

function listarSiglasPiano() {
    return Object.keys(ACORDES_PIANO);
}

function getNotasAcordePiano(sigla) {
    const acorde = ACORDES_PIANO[sigla];
    return acorde ? acorde.notas : [];
}

// Alias para compatibilidade
const desenharAcordePiano = desenharAcordePianoPreview;
