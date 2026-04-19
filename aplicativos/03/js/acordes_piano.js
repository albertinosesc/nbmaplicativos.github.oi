// ============================================
// DICIONÁRIO DE ACORDES DE PIANO
// ============================================

const ACORDES_PIANO = {
    // Acordes Maiores
    'C': { nome: 'Dó Maior', notas: ['C', 'E', 'G'] },
    'C#': { nome: 'Dó Sustenido Maior', notas: ['C#', 'F', 'G#'] },
    'Db': { nome: 'Ré Bemol Maior', notas: ['Db', 'F', 'Ab'] },
    'D': { nome: 'Ré Maior', notas: ['D', 'F#', 'A'] },
    'D#': { nome: 'Ré Sustenido Maior', notas: ['D#', 'G', 'A#'] },
    'Eb': { nome: 'Mi Bemol Maior', notas: ['Eb', 'G', 'Bb'] },
    'E': { nome: 'Mi Maior', notas: ['E', 'G#', 'B'] },
    'F': { nome: 'Fá Maior', notas: ['F', 'A', 'C'] },
    'F#': { nome: 'Fá Sustenido Maior', notas: ['F#', 'A#', 'C#'] },
    'Gb': { nome: 'Sol Bemol Maior', notas: ['Gb', 'Bb', 'Db'] },
    'G': { nome: 'Sol Maior', notas: ['G', 'B', 'D'] },
    'G#': { nome: 'Sol Sustenido Maior', notas: ['G#', 'C', 'D#'] },
    'Ab': { nome: 'Lá Bemol Maior', notas: ['Ab', 'C', 'Eb'] },
    'A': { nome: 'Lá Maior', notas: ['A', 'C#', 'E'] },
    'A#': { nome: 'Lá Sustenido Maior', notas: ['A#', 'D', 'F'] },
    'Bb': { nome: 'Si Bemol Maior', notas: ['Bb', 'D', 'F'] },
    'B': { nome: 'Si Maior', notas: ['B', 'D#', 'F#'] },

    // Acordes Menores
    'Cm': { nome: 'Dó Menor', notas: ['C', 'Eb', 'G'] },
    'C#m': { nome: 'Dó Sustenido Menor', notas: ['C#', 'E', 'G#'] },
    'Dbm': { nome: 'Ré Bemol Menor', notas: ['Db', 'E', 'Ab'] },
    'Dm': { nome: 'Ré Menor', notas: ['D', 'F', 'A'] },
    'D#m': { nome: 'Ré Sustenido Menor', notas: ['D#', 'F#', 'A#'] },
    'Ebm': { nome: 'Mi Bemol Menor', notas: ['Eb', 'Gb', 'Bb'] },
    'Em': { nome: 'Mi Menor', notas: ['E', 'G', 'B'] },
    'Fm': { nome: 'Fá Menor', notas: ['F', 'Ab', 'C'] },
    'F#m': { nome: 'Fá Sustenido Menor', notas: ['F#', 'A', 'C#'] },
    'Gbm': { nome: 'Sol Bemol Menor', notas: ['Gb', 'A', 'Db'] },
    'Gm': { nome: 'Sol Menor', notas: ['G', 'Bb', 'D'] },
    'G#m': { nome: 'Sol Sustenido Menor', notas: ['G#', 'B', 'D#'] },
    'Abm': { nome: 'Lá Bemol Menor', notas: ['Ab', 'Cb', 'Eb'] },
    'Am': { nome: 'Lá Menor', notas: ['A', 'C', 'E'] },
    'A#m': { nome: 'Lá Sustenido Menor', notas: ['A#', 'C#', 'F'] },
    'Bbm': { nome: 'Si Bemol Menor', notas: ['Bb', 'Db', 'F'] },
    'Bm': { nome: 'Si Menor', notas: ['B', 'D', 'F#'] },

    // Acordes com Sétima (Dominante)
    'C7': { nome: 'Dó com Sétima', notas: ['C', 'E', 'G', 'Bb'] },
    'C#7': { nome: 'Dó Sustenido com Sétima', notas: ['C#', 'F', 'G#', 'B'] },
    'Db7': { nome: 'Ré Bemol com Sétima', notas: ['Db', 'F', 'Ab', 'B'] },
    'D7': { nome: 'Ré com Sétima', notas: ['D', 'F#', 'A', 'C'] },
    'D#7': { nome: 'Ré Sustenido com Sétima', notas: ['D#', 'G', 'A#', 'C#'] },
    'Eb7': { nome: 'Mi Bemol com Sétima', notas: ['Eb', 'G', 'Bb', 'Db'] },
    'E7': { nome: 'Mi com Sétima', notas: ['E', 'G#', 'B', 'D'] },
    'F7': { nome: 'Fá com Sétima', notas: ['F', 'A', 'C', 'Eb'] },
    'F#7': { nome: 'Fá Sustenido com Sétima', notas: ['F#', 'A#', 'C#', 'E'] },
    'Gb7': { nome: 'Sol Bemol com Sétima', notas: ['Gb', 'Bb', 'Db', 'E'] },
    'G7': { nome: 'Sol com Sétima', notas: ['G', 'B', 'D', 'F'] },
    'G#7': { nome: 'Sol Sustenido com Sétima', notas: ['G#', 'C', 'D#', 'F#'] },
    'Ab7': { nome: 'Lá Bemol com Sétima', notas: ['Ab', 'C', 'Eb', 'Gb'] },
    'A7': { nome: 'Lá com Sétima', notas: ['A', 'C#', 'E', 'G'] },
    'A#7': { nome: 'Lá Sustenido com Sétima', notas: ['A#', 'D', 'F', 'G#'] },
    'Bb7': { nome: 'Si Bemol com Sétima', notas: ['Bb', 'D', 'F', 'Ab'] },
    'B7': { nome: 'Si com Sétima', notas: ['B', 'D#', 'F#', 'A'] },

    // Acordes com Sétima Maior
    'Cmaj7': { nome: 'Dó com Sétima Maior', notas: ['C', 'E', 'G', 'B'] },
    'C#maj7': { nome: 'Dó Sustenido com Sétima Maior', notas: ['C#', 'F', 'G#', 'C'] },
    'Dbmaj7': { nome: 'Ré Bemol com Sétima Maior', notas: ['Db', 'F', 'Ab', 'C'] },
    'Dmaj7': { nome: 'Ré com Sétima Maior', notas: ['D', 'F#', 'A', 'C#'] },
    'D#maj7': { nome: 'Ré Sustenido com Sétima Maior', notas: ['D#', 'G', 'A#', 'D'] },
    'Ebmaj7': { nome: 'Mi Bemol com Sétima Maior', notas: ['Eb', 'G', 'Bb', 'D'] },
    'Emaj7': { nome: 'Mi com Sétima Maior', notas: ['E', 'G#', 'B', 'D#'] },
    'Fmaj7': { nome: 'Fá com Sétima Maior', notas: ['F', 'A', 'C', 'E'] },
    'F#maj7': { nome: 'Fá Sustenido com Sétima Maior', notas: ['F#', 'A#', 'C#', 'F'] },
    'Gbmaj7': { nome: 'Sol Bemol com Sétima Maior', notas: ['Gb', 'Bb', 'Db', 'F'] },
    'Gmaj7': { nome: 'Sol com Sétima Maior', notas: ['G', 'B', 'D', 'F#'] },
    'G#maj7': { nome: 'Sol Sustenido com Sétima Maior', notas: ['G#', 'C', 'D#', 'G'] },
    'Abmaj7': { nome: 'Lá Bemol com Sétima Maior', notas: ['Ab', 'C', 'Eb', 'G'] },
    'Amaj7': { nome: 'Lá com Sétima Maior', notas: ['A', 'C#', 'E', 'G#'] },
    'A#maj7': { nome: 'Lá Sustenido com Sétima Maior', notas: ['A#', 'D', 'F', 'A'] },
    'Bbmaj7': { nome: 'Si Bemol com Sétima Maior', notas: ['Bb', 'D', 'F', 'A'] },
    'Bmaj7': { nome: 'Si com Sétima Maior', notas: ['B', 'D#', 'F#', 'A#'] },

    // Acordes Menores com Sétima
    'Cm7': { nome: 'Dó Menor com Sétima', notas: ['C', 'Eb', 'G', 'Bb'] },
    'C#m7': { nome: 'Dó Sustenido Menor com Sétima', notas: ['C#', 'E', 'G#', 'B'] },
    'Dbm7': { nome: 'Ré Bemol Menor com Sétima', notas: ['Db', 'E', 'Ab', 'B'] },
    'Dm7': { nome: 'Ré Menor com Sétima', notas: ['D', 'F', 'A', 'C'] },
    'D#m7': { nome: 'Ré Sustenido Menor com Sétima', notas: ['D#', 'F#', 'A#', 'C#'] },
    'Ebm7': { nome: 'Mi Bemol Menor com Sétima', notas: ['Eb', 'Gb', 'Bb', 'Db'] },
    'Em7': { nome: 'Mi Menor com Sétima', notas: ['E', 'G', 'B', 'D'] },
    'Fm7': { nome: 'Fá Menor com Sétima', notas: ['F', 'Ab', 'C', 'Eb'] },
    'F#m7': { nome: 'Fá Sustenido Menor com Sétima', notas: ['F#', 'A', 'C#', 'E'] },
    'Gbm7': { nome: 'Sol Bemol Menor com Sétima', notas: ['Gb', 'A', 'Db', 'E'] },
    'Gm7': { nome: 'Sol Menor com Sétima', notas: ['G', 'Bb', 'D', 'F'] },
    'G#m7': { nome: 'Sol Sustenido Menor com Sétima', notas: ['G#', 'B', 'D#', 'F#'] },
    'Abm7': { nome: 'Lá Bemol Menor com Sétima', notas: ['Ab', 'Cb', 'Eb', 'Gb'] },
    'Am7': { nome: 'Lá Menor com Sétima', notas: ['A', 'C', 'E', 'G'] },
    'A#m7': { nome: 'Lá Sustenido Menor com Sétima', notas: ['A#', 'C#', 'F', 'G#'] },
    'Bbm7': { nome: 'Si Bemol Menor com Sétima', notas: ['Bb', 'Db', 'F', 'Ab'] },
    'Bm7': { nome: 'Si Menor com Sétima', notas: ['B', 'D', 'F#', 'A'] },

    // Acordes Diminutos
    'Cdim': { nome: 'Dó Diminuto', notas: ['C', 'Eb', 'Gb'] },
    'C#dim': { nome: 'Dó Sustenido Diminuto', notas: ['C#', 'E', 'G'] },
    'Dbdim': { nome: 'Ré Bemol Diminuto', notas: ['Db', 'E', 'G'] },
    'Ddim': { nome: 'Ré Diminuto', notas: ['D', 'F', 'Ab'] },
    'D#dim': { nome: 'Ré Sustenido Diminuto', notas: ['D#', 'F#', 'A'] },
    'Ebdim': { nome: 'Mi Bemol Diminuto', notas: ['Eb', 'Gb', 'A'] },
    'Edim': { nome: 'Mi Diminuto', notas: ['E', 'G', 'Bb'] },
    'Fdim': { nome: 'Fá Diminuto', notas: ['F', 'Ab', 'B'] },
    'F#dim': { nome: 'Fá Sustenido Diminuto', notas: ['F#', 'A', 'C'] },
    'Gbdim': { nome: 'Sol Bemol Diminuto', notas: ['Gb', 'A', 'C'] },
    'Gdim': { nome: 'Sol Diminuto', notas: ['G', 'Bb', 'Db'] },
    'G#dim': { nome: 'Sol Sustenido Diminuto', notas: ['G#', 'B', 'D'] },
    'Abdim': { nome: 'Lá Bemol Diminuto', notas: ['Ab', 'B', 'D'] },
    'Adim': { nome: 'Lá Diminuto', notas: ['A', 'C', 'Eb'] },
    'A#dim': { nome: 'Lá Sustenido Diminuto', notas: ['A#', 'C#', 'E'] },
    'Bbdim': { nome: 'Si Bemol Diminuto', notas: ['Bb', 'Db', 'E'] },
    'Bdim': { nome: 'Si Diminuto', notas: ['B', 'D', 'F'] },

    // Acordes Aumentados
    'Caug': { nome: 'Dó Aumentado', notas: ['C', 'E', 'G#'] },
    'C#aug': { nome: 'Dó Sustenido Aumentado', notas: ['C#', 'F', 'A'] },
    'Dbaug': { nome: 'Ré Bemol Aumentado', notas: ['Db', 'F', 'A'] },
    'Daug': { nome: 'Ré Aumentado', notas: ['D', 'F#', 'A#'] },
    'D#aug': { nome: 'Ré Sustenido Aumentado', notas: ['D#', 'G', 'B'] },
    'Ebaug': { nome: 'Mi Bemol Aumentado', notas: ['Eb', 'G', 'B'] },
    'Eaug': { nome: 'Mi Aumentado', notas: ['E', 'G#', 'C'] },
    'Faug': { nome: 'Fá Aumentado', notas: ['F', 'A', 'C#'] },
    'F#aug': { nome: 'Fá Sustenido Aumentado', notas: ['F#', 'A#', 'D'] },
    'Gbaug': { nome: 'Sol Bemol Aumentado', notas: ['Gb', 'Bb', 'D'] },
    'Gaug': { nome: 'Sol Aumentado', notas: ['G', 'B', 'D#'] },
    'G#aug': { nome: 'Sol Sustenido Aumentado', notas: ['G#', 'C', 'E'] },
    'Abaug': { nome: 'Lá Bemol Aumentado', notas: ['Ab', 'C', 'E'] },
    'Aaug': { nome: 'Lá Aumentado', notas: ['A', 'C#', 'F'] },
    'A#aug': { nome: 'Lá Sustenido Aumentado', notas: ['A#', 'D', 'F#'] },
    'Bbaug': { nome: 'Si Bemol Aumentado', notas: ['Bb', 'D', 'F#'] },
    'Baug': { nome: 'Si Aumentado', notas: ['B', 'D#', 'G'] }
};

// ============================================
// FUNÇÃO PARA GERAR CÓDIGO ABC DO ACORDE DE PIANO
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
        if (oitava === 2) return `${acidente}${notaLimpa},,0`;
        if (oitava === 6) return `${acidente}${notaLimpa.toLowerCase()}'0`;
        return `${acidente}${notaLimpa}0`;
    });
    
    return `X:1\nM:4/4\nL:1/4\nK:C\n[${notasABC.join(' ')}]|]`;
}

// ============================================
// FUNÇÃO PARA DESENHAR ACORDE DE PIANO NO PREVIEW
// ============================================
function desenharAcordePianoPreview(container, sigla, nome) {
    const acorde = ACORDES_PIANO[sigla];
    if (!acorde) {
        container.innerHTML = `<div style="color:red">Acorde de Piano "${sigla}" não encontrado</div>`;
        return;
    }
    
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'piano-diagram';
    wrapper.style.cssText = 'display: inline-block; margin: 10px; text-align: center; background: white; padding: 10px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);';
    
    const title = document.createElement('div');
    title.className = 'piano-title';
    title.style.cssText = 'font-size: 1.2em; font-weight: bold; color: #e94560; margin-bottom: 8px;';
    title.textContent = `${sigla} - ${acorde.nome}`;
    wrapper.appendChild(title);
    
    const keysDiv = document.createElement('div');
    keysDiv.className = 'piano-keys';
    keysDiv.style.cssText = 'display: flex; position: relative; height: 120px; margin: 5px 0;';
    
    const notasTeclas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const notasAcorde = acorde.notas;
    
    const whiteKeys = [];
    for (let i = 0; i < notasTeclas.length; i++) {
        const nota = notasTeclas[i];
        if (!nota.includes('#')) {
            const key = document.createElement('div');
            key.style.cssText = `width: 35px; height: 100px; background: ${notasAcorde.some(n => n === nota || n === nota + '#' || n === nota + 'b') ? '#3a86ff' : '#fff'}; border: 1px solid #333; display: inline-block; position: relative; border-radius: 0 0 4px 4px;`;
            
            const label = document.createElement('div');
            label.textContent = nota;
            label.style.cssText = 'position: absolute; bottom: 5px; width: 100%; text-align: center; font-size: 10px; color: #666;';
            key.appendChild(label);
            keysDiv.appendChild(key);
            whiteKeys.push(key);
        }
    }
    
    let blackIndex = 0;
    const blackPositions = [1, 3, 6, 8, 10];
    for (let i = 0; i < notasTeclas.length; i++) {
        const nota = notasTeclas[i];
        if (nota.includes('#')) {
            const pos = blackPositions[blackIndex++];
            if (pos !== undefined && whiteKeys[pos]) {
                const blackKey = document.createElement('div');
                blackKey.style.cssText = `width: 22px; height: 60px; background: ${notasAcorde.some(n => n === nota) ? '#ff4757' : '#222'}; position: absolute; left: ${pos * 35 - 11}px; top: 0; border-radius: 0 0 3px 3px;`;
                
                const label = document.createElement('div');
                label.textContent = nota;
                label.style.cssText = 'position: absolute; bottom: 5px; width: 100%; text-align: center; font-size: 8px; color: #fff;';
                blackKey.appendChild(label);
                keysDiv.appendChild(blackKey);
            }
        }
    }
    
    wrapper.appendChild(keysDiv);
    container.appendChild(wrapper);
}

// ============================================
// FUNÇÃO PARA GERAR CÓDIGO [PIANO:...] PARA O EDITOR
// ============================================
function gerarCodigoPiano(sigla, nome) {
    return `[PIANO:${sigla}]${nome}[/PIANO]`;
}

// ============================================
// FUNÇÃO PARA BUSCAR ACORDE DE PIANO POR SIGLA
// ============================================
function buscarAcordePiano(sigla) {
    return ACORDES_PIANO[sigla] || null;
}

// ============================================
// FUNÇÃO PARA LISTAR TODAS AS SIGLAS DE ACORDES
// ============================================
function listarSiglasPiano() {
    return Object.keys(ACORDES_PIANO);
}

// ============================================
// FUNÇÃO PARA OBTER NOTAS DO ACORDE
// ============================================
function getNotasAcordePiano(sigla) {
    const acorde = ACORDES_PIANO[sigla];
    return acorde ? acorde.notas : [];
}
