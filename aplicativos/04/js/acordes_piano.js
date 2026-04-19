// acordes_piano.js
// ============================================
// DICIONÁRIO DE ACORDES DE PIANO 
// ============================================

// ============================================
// DICIONÁRIO DE ACORDES DE PIANO COM RANGE DE OITAVAS
// ============================================

// ============================================
// DICIONÁRIO DE ACORDES DE PIANO COM OITAVAS E DEDOS
// ============================================

const ACORDES_PIANO = {
    // Acordes Maiores
    'C': { 
        nome: 'Dó Maior', 
        notas: ['C3', 'E3', 'G3'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'C3', 
        endOitava: 'C4' 
    },
    'C#': { 
        nome: 'Dó Sustenido Maior', 
        notas: ['C#3', 'F3', 'G#3'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'C#3', 
        endOitava: 'C#4' 
    },
    'Db': { 
        nome: 'Ré Bemol Maior', 
        notas: ['Db3', 'F3', 'Ab3'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'Db3', 
        endOitava: 'Db4' 
    },
    'D': { 
        nome: 'Ré Maior', 
        notas: ['D3', 'F#3', 'A3'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'D3', 
        endOitava: 'D4' 
    },
    'D#': { 
        nome: 'Ré Sustenido Maior', 
        notas: ['D#3', 'G3', 'A#3'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'D#3', 
        endOitava: 'D#4' 
    },
    'Eb': { 
        nome: 'Mi Bemol Maior', 
        notas: ['Eb3', 'G3', 'Bb3'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'Eb3', 
        endOitava: 'Eb4' 
    },
    'E': { 
        nome: 'Mi Maior', 
        notas: ['E3', 'G#3', 'B3'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'E3', 
        endOitava: 'E4' 
    },
    'F': { 
        nome: 'Fá Maior', 
        notas: ['F3', 'A3', 'C4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'F3', 
        endOitava: 'F4' 
    },
    'F#': { 
        nome: 'Fá Sustenido Maior', 
        notas: ['F#3', 'A#3', 'C#4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'F#3', 
        endOitava: 'F#4' 
    },
    'Gb': { 
        nome: 'Sol Bemol Maior', 
        notas: ['Gb3', 'Bb3', 'Db4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'Gb3', 
        endOitava: 'Gb4' 
    },
    'G': { 
        nome: 'Sol Maior', 
        notas: ['G3', 'B3', 'D4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'G3', 
        endOitava: 'G4' 
    },
    'G#': { 
        nome: 'Sol Sustenido Maior', 
        notas: ['G#3', 'C4', 'D#4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'G#3', 
        endOitava: 'G#4' 
    },
    'Ab': { 
        nome: 'Lá Bemol Maior', 
        notas: ['Ab3', 'C4', 'Eb4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'Ab3', 
        endOitava: 'Ab4' 
    },
    'A': { 
        nome: 'Lá Maior', 
        notas: ['A3', 'C#4', 'E4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'A3', 
        endOitava: 'A4' 
    },
    'A#': { 
        nome: 'Lá Sustenido Maior', 
        notas: ['A#3', 'D4', 'F4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'A#3', 
        endOitava: 'A#4' 
    },
    'Bb': { 
        nome: 'Si Bemol Maior', 
        notas: ['Bb3', 'D4', 'F4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'Bb3', 
        endOitava: 'Bb4' 
    },
    'B': { 
        nome: 'Si Maior', 
        notas: ['B3', 'D#4', 'F#4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'B3', 
        endOitava: 'B4' 
    },

    // Acordes Menores
    'Cm': { 
        nome: 'Dó Menor', 
        notas: ['C3', 'D#3', 'Gb3'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'C3', 
        endOitava: 'C4' 
    },

        'Cm1': { 
        nome: 'Dó Menor hfsfsj', 
        notas: ['C3', 'D#3', 'Gb3'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'C3', 
        endOitava: 'C4' 
    },
    'Dm': { 
        nome: 'Ré Menor', 
        notas: ['D3', 'F3', 'A3'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'D3', 
        endOitava: 'D5' 
    },
    'Em': { 
        nome: 'Mi Menor', 
        notas: ['E3', 'G3', 'B3'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'E3', 
        endOitava: 'E5' 
    },
    'Fm': { 
        nome: 'Fá Menor', 
        notas: ['F3', 'Ab3', 'C4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'F3', 
        endOitava: 'F5' 
    },
    'Gm': { 
        nome: 'Sol Menor', 
        notas: ['G3', 'Bb3', 'D4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'G3', 
        endOitava: 'G5' 
    },
    'Am': { 
        nome: 'Lá Menor', 
        notas: ['A3', 'C4', 'E4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'A3', 
        endOitava: 'A5' 
    },
    'Bm': { 
        nome: 'Si Menor', 
        notas: ['B3', 'D4', 'F#4'],
        dedosTreble: ['1', '3', '5'],
        startOitava: 'B3', 
        endOitava: 'B5' 
    },

    // Acordes com Sétima
    'C7': { 
        nome: 'Dó com Sétima', 
        notas: ['C3', 'E3', 'G3', 'Bb3'],
        dedosTreble: ['1', '2', '3', '5'],
        startOitava: 'C3', 
        endOitava: 'C5' 
    },
    'D7': { 
        nome: 'Ré com Sétima', 
        notas: ['D3', 'F#3', 'A3', 'C4'],
        dedosTreble: ['1', '2', '3', '5'],
        startOitava: 'D3', 
        endOitava: 'D5' 
    },
    'G7': { 
        nome: 'Sol com Sétima', 
        notas: ['G3', 'B3', 'D4', 'F4'],
        dedosTreble: ['1', '2', '3', '5'],
        startOitava: 'G3', 
        endOitava: 'G5' 
    },
    'A7': { 
        nome: 'Lá com Sétima', 
        notas: ['A3', 'C#4', 'E4', 'G4'],
        dedosTreble: ['1', '2', '3', '5'],
        startOitava: 'A3', 
        endOitava: 'A5' 
    }
};

// ============================================
// FUNÇÃO PARA DESENHAR ACORDE DE PIANO NO VISUALIZADOR
// ============================================
function desenharAcordePianoPreview(container, sigla, nome) {
    // Buscar o acorde no dicionário
    let acorde = ACORDES_PIANO[sigla];
    
    // Se não encontrou, tenta encontrar pelo nome
    if (!acorde && nome) {
        for (const [key, value] of Object.entries(ACORDES_PIANO)) {
            if (value.nome === nome) {
                acorde = value;
                break;
            }
        }
    }
    
    if (!acorde) {
        container.innerHTML = `<div style="color:red; padding: 10px; border: 1px solid red; border-radius: 5px;">
            ❌ Acorde de Piano "${sigla}" não encontrado
        </div>`;
        return;
    }
    
    // Limpar o container
    container.innerHTML = '';
    
    // Criar o wrapper principal
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-block; margin: 10px auto; text-align: center; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
    
    // Título
    const title = document.createElement('div');
    title.style.cssText = 'font-size: 1.2em; font-weight: bold; color: #e94560; margin-bottom: 10px;';
    title.textContent = `${sigla} - ${acorde.nome}`;
    wrapper.appendChild(title);
    
    // Container do teclado
    const keyboardContainer = document.createElement('div');
    keyboardContainer.style.cssText = 'display: flex; position: relative; height: 120px; margin: 5px 0; justify-content: center;';
    
    const notasTeclas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const notasAcorde = acorde.notas;
    const whiteKeyWidth = 40;
    const whiteKeyHeight = 100;
    
    const whiteKeys = [];
    
    // Desenhar teclas brancas
    for (let i = 0; i < notasTeclas.length; i++) {
        const nota = notasTeclas[i];
        if (!nota.includes('#')) {
            const key = document.createElement('div');
            const isActive = notasAcorde.includes(nota);
            
            key.style.cssText = `
                width: ${whiteKeyWidth}px;
                height: ${whiteKeyHeight}px;
                background: ${isActive ? '#3a86ff' : '#ffffff'};
                border: 1px solid #333;
                display: inline-block;
                position: relative;
                border-radius: 0 0 4px 4px;
                cursor: default;
            `;
            
            const label = document.createElement('div');
            label.textContent = nota;
            label.style.cssText = 'position: absolute; bottom: 5px; width: 100%; text-align: center; font-size: 10px; color: #666; font-weight: bold;';
            key.appendChild(label);
            keyboardContainer.appendChild(key);
            whiteKeys.push(key);
        }
    }
    
    // Desenhar teclas pretas
    let blackIndex = 0;
    const blackPositions = [1, 3, 6, 8, 10];
    const blackKeyWidth = 26;
    const blackKeyHeight = 65;
    
    for (let i = 0; i < notasTeclas.length; i++) {
        const nota = notasTeclas[i];
        if (nota.includes('#')) {
            const pos = blackPositions[blackIndex++];
            if (pos !== undefined && whiteKeys[pos]) {
                const blackKey = document.createElement('div');
                const isActive = notasAcorde.includes(nota);
                
                blackKey.style.cssText = `
                    width: ${blackKeyWidth}px;
                    height: ${blackKeyHeight}px;
                    background: ${isActive ? '#ff4757' : '#222222'};
                    position: absolute;
                    left: ${pos * whiteKeyWidth - (blackKeyWidth / 2)}px;
                    top: 0;
                    border-radius: 0 0 3px 3px;
                    cursor: default;
                `;
                
                const label = document.createElement('div');
                label.textContent = nota;
                label.style.cssText = 'position: absolute; bottom: 5px; width: 100%; text-align: center; font-size: 8px; color: #fff; font-weight: bold;';
                blackKey.appendChild(label);
                keyboardContainer.appendChild(blackKey);
            }
        }
    }
    
    wrapper.appendChild(keyboardContainer);
    
    // Legenda com as notas
    const legend = document.createElement('div');
    legend.style.cssText = 'font-size: 11px; color: #555; margin-top: 8px; padding: 4px 8px; background: #f0f2f5; border-radius: 15px; display: inline-block;';
    legend.textContent = `🎵 Notas: ${notasAcorde.join(' + ')}`;
    wrapper.appendChild(legend);
    
    container.appendChild(wrapper);
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