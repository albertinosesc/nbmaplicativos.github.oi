// ============================================
// DICIONÁRIO DE ACORDES DE PIANO
// ============================================

const ACORDES_PIANO = {
    'C': { nome: 'Dó Maior', notas: ['C', 'E', 'G'] },
    'Cm': { nome: 'Dó Menor', notas: ['C', 'Eb', 'G'] },
    'C7': { nome: 'Dó com Sétima', notas: ['C', 'E', 'G', 'Bb'] },
    'Cmaj7': { nome: 'Dó com Sétima Maior', notas: ['C', 'E', 'G', 'B'] },
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

function desenharAcordePiano(container, sigla, nome) {
    const acorde = ACORDES_PIANO[sigla];
    if (!acorde) {
        container.innerHTML = `<div style="color:red">Acorde de Piano "${sigla}" não encontrado</div>`;
        return;
    }
    
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'piano-diagram';
    
    const title = document.createElement('div');
    title.className = 'piano-title';
    title.textContent = `${sigla} - ${acorde.nome}`;
    wrapper.appendChild(title);
    
    const keysDiv = document.createElement('div');
    keysDiv.className = 'piano-keys';
    keysDiv.style.position = 'relative';
    keysDiv.style.height = '120px';
    
    const notasTeclas = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const notasAcorde = acorde.notas;
    
    const whiteKeys = [];
    for (let i = 0; i < notasTeclas.length; i++) {
        const nota = notasTeclas[i];
        if (!nota.includes('#')) {
            const key = document.createElement('div');
            key.className = 'piano-key-white';
            key.style.width = '35px';
            key.style.height = '100px';
            key.style.display = 'inline-block';
            key.style.backgroundColor = notasAcorde.some(n => n === nota || n === nota + '#' || n === nota + 'b') ? '#3a86ff' : '#fff';
            key.style.border = '1px solid #333';
            key.style.position = 'relative';
            
            const label = document.createElement('div');
            label.textContent = nota;
            label.style.position = 'absolute';
            label.style.bottom = '5px';
            label.style.width = '100%';
            label.style.textAlign = 'center';
            label.style.fontSize = '10px';
            label.style.color = '#666';
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
                blackKey.className = 'piano-key-black';
                blackKey.style.width = '22px';
                blackKey.style.height = '60px';
                blackKey.style.backgroundColor = notasAcorde.some(n => n === nota) ? '#ff4757' : '#222';
                blackKey.style.position = 'absolute';
                blackKey.style.left = `${pos * 35 - 11}px`;
                blackKey.style.top = '0';
                blackKey.style.borderRadius = '0 0 3px 3px';
                
                const label = document.createElement('div');
                label.textContent = nota;
                label.style.position = 'absolute';
                label.style.bottom = '5px';
                label.style.width = '100%';
                label.style.textAlign = 'center';
                label.style.fontSize = '8px';
                label.style.color = '#fff';
                blackKey.appendChild(label);
                keysDiv.appendChild(blackKey);
            }
        }
    }
    
    wrapper.appendChild(keysDiv);
    container.appendChild(wrapper);
}
