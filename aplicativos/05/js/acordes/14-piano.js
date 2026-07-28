// ============================================
// TECLADO DE PIANO
// ============================================

function normalizarNota(nota) {
    const eq = { 'Eb': 'D#', 'Bb': 'A#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#' };
    for (const [bemol, sustain] of Object.entries(eq)) {
        if (nota.startsWith(bemol)) return sustain + nota.replace(bemol, '');
    }
    return nota;
}

function desenharTecladoPiano(container, sigla, nome, notasAcorde, startOitava, endOitava, dedosTreble) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-block; margin: 10px auto; text-align: center; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';

    const title = document.createElement('div');
    title.style.cssText = 'font-size: 1.6em; font-weight: bold; color: #e94560; margin-bottom: 10px;';
    title.textContent = nome;
    wrapper.appendChild(title);

    const pianoDiv = document.createElement('div');
    pianoDiv.style.cssText = 'display: flex; position: relative; background: #131212; padding: 3px; border-radius: 4px;';

    const escala = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const startMatch = startOitava.match(/^([A-G])(\d+)$/);
    const endMatch = endOitava.match(/^([A-G])(\d+)$/);

    if (!startMatch || !endMatch) {
        container.innerHTML = '<div style="color:red">Erro no range</div>';
        return;
    }

    const pretasMap = { 'C#3': 0, 'D#3': 1, 'F#3': 3, 'G#3': 4, 'A#3': 5, 'C#4': 7, 'D#4': 8, 'F#4': 10, 'G#4': 11, 'A#4': 12, 'C#5': 14, 'D#5': 15, 'F#5': 17, 'G#5': 18, 'A#5': 19 };
    const whiteKeyWidth = 37, whiteKeyHeight = 120, blackKeyWidth = 25, blackKeyHeight = 79, blackKeyOffset = 34;

    const teclasNoRange = [];
    for (let oct = parseInt(startMatch[2]); oct <= parseInt(endMatch[2]); oct++) {
        for (let i = 0; i < escala.length; i++) {
            const nota = escala[i];
            const num = (oct + 1) * 12 + i;
            if (num >= (parseInt(startMatch[2]) + 1) * 12 + escala.indexOf(startMatch[1]) && num <= (parseInt(endMatch[2]) + 1) * 12 + escala.indexOf(endMatch[1])) {
                teclasNoRange.push({ nota, oitava: oct });
            }
        }
    }

    const whiteKeys = teclasNoRange.filter(t => !t.nota.includes('#'));
    const blackKeys = [];
    teclasNoRange.forEach(t => {
        if (t.nota.includes('#')) {
            const pos = pretasMap[t.nota + t.oitava];
            if (pos !== undefined) blackKeys.push({ ...t, pos });
        }
    });

    function getDedo(notaNome, oitava) {
        const notaCompleta = notaNome + oitava;
        for (let i = 0; i < notasAcorde.length; i++) {
            if (normalizarNota(notasAcorde[i]) === normalizarNota(notaCompleta)) return dedosTreble[i] || null;
        }
        return null;
    }

    whiteKeys.forEach(tecla => {
        const dedo = getDedo(tecla.nota, tecla.oitava);
        const isActive = dedo !== null;
        const whiteKey = document.createElement('div');
        whiteKey.style.cssText = `width: ${whiteKeyWidth}px; height: ${whiteKeyHeight}px; background: ${isActive ? 'linear-gradient(to bottom, #3a86ff 0%, #2666cc 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)'}; border: 1px solid #333; border-radius: 0 0 8px 8px; position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 1; cursor: default;`;
        if (dedo) {
            const dedoDiv = document.createElement('div');
            dedoDiv.textContent = dedo;
            dedoDiv.style.cssText = `position: absolute; top: 80%; left: 50%; transform: translate(-50%, -50%); width: 23px; height: 25px; background: white; color: #3a86ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: bold; font-family: Arial; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10;`;
            whiteKey.appendChild(dedoDiv);
        }
        pianoDiv.appendChild(whiteKey);
    });

    blackKeys.forEach(tecla => {
        const dedo = getDedo(tecla.nota, tecla.oitava);
        const isActive = dedo !== null;
        const blackKey = document.createElement('div');
        blackKey.style.cssText = `width: ${blackKeyWidth}px; height: ${blackKeyHeight}px; background: ${isActive ? 'linear-gradient(to bottom, #ff4757 0%, #cc2233 100%)' : 'linear-gradient(to bottom, #222 0%, #111 100%)'}; position: absolute; left: ${tecla.pos * whiteKeyWidth + blackKeyOffset}px; top: 0; border-radius: 0 0 5px 5px; box-shadow: 0 3px 8px rgba(0,0,0,0.4); z-index: 2; cursor: default;`;
        if (dedo) {
            const dedoDiv = document.createElement('div');
            dedoDiv.textContent = dedo;
            dedoDiv.style.cssText = `position: absolute; top: 78%; left: 50%; transform: translate(-50%, -50%); width: 18px; height: 20px; background: white; color: #ff4757; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; font-family: Arial; box-shadow: 0 1px 3px rgba(0,0,0,0.2); z-index: 11;`;
            blackKey.appendChild(dedoDiv);
        }
        pianoDiv.appendChild(blackKey);
    });

    wrapper.appendChild(pianoDiv);
    container.appendChild(wrapper);
}

function desenharAcordePianoPersonalizado(container, sigla, nome) {
    const acordesPersonalizados = JSON.parse(localStorage.getItem("acordes_piano_personalizados") || "{}");
    const acorde = acordesPersonalizados[sigla];
    if (!acorde) {
        container.innerHTML = `<div style="color:red; padding:10px;">❌ Acorde personalizado não encontrado</div>`;
        return;
    }
    const notasAtivas = acorde.notasNomes || [];
    const dedos = acorde.fingersTreble ? acorde.fingersTreble.split(/\s+/) : [];
    desenharTecladoPianoSimples(container, nome, notasAtivas, acorde.startOitava || 'C3', acorde.endOitava || 'C5', dedos);
}

function desenharTecladoPianoSimples(container, nome, notasAtivas, startOitava, endOitava, dedosTreble = []) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-block; margin: 10px auto; text-align: center; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';

    const title = document.createElement('div');
    title.style.cssText = 'font-size: 1.6em; font-weight: bold; color: #e94560; margin-bottom: 10px;';
    title.textContent = nome;
    wrapper.appendChild(title);

    const pianoDiv = document.createElement('div');
    pianoDiv.style.cssText = 'display: flex; position: relative; background: #131212; padding: 3px; border-radius: 4px;';

    const escala = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const startMatch = startOitava.match(/^([A-G])(\d+)$/);
    const endMatch = endOitava.match(/^([A-G])(\d+)$/);

    if (!startMatch || !endMatch) {
        container.innerHTML = '<div style="color:red">Erro no range</div>';
        return;
    }

    const pretasMap = { 'C#3': 0, 'D#3': 1, 'F#3': 3, 'G#3': 4, 'A#3': 5, 'C#4': 7, 'D#4': 8, 'F#4': 10, 'G#4': 11, 'A#4': 12, 'C#5': 14, 'D#5': 15, 'F#5': 17, 'G#5': 18, 'A#5': 19 };
    const whiteKeyWidth = 37, whiteKeyHeight = 120, blackKeyWidth = 25, blackKeyHeight = 79, blackKeyOffset = 34;

    const teclasNoRange = [];
    for (let oct = parseInt(startMatch[2]); oct <= parseInt(endMatch[2]); oct++) {
        for (let i = 0; i < escala.length; i++) {
            const nota = escala[i];
            const num = (oct + 1) * 12 + i;
            if (num >= (parseInt(startMatch[2]) + 1) * 12 + escala.indexOf(startMatch[1]) && num <= (parseInt(endMatch[2]) + 1) * 12 + escala.indexOf(endMatch[1])) {
                teclasNoRange.push({ nota, oitava: oct });
            }
        }
    }

    const whiteKeys = teclasNoRange.filter(t => !t.nota.includes('#'));
    const blackKeys = [];
    teclasNoRange.forEach(t => {
        if (t.nota.includes('#')) {
            const pos = pretasMap[t.nota + t.oitava];
            if (pos !== undefined) blackKeys.push({ ...t, pos });
        }
    });

    function getDedo(notaNome, idx) {
        if (dedosTreble && dedosTreble.length > 0) {
            const notaIndex = notasAtivas.indexOf(notaNome);
            if (notaIndex !== -1 && dedosTreble[notaIndex]) return dedosTreble[notaIndex];
        }
        const mapa = { 'C': '1', 'D': '2', 'E': '3', 'F': '4', 'G': '5', 'A': '1', 'B': '2', 'C#': '2', 'D#': '3', 'F#': '4', 'G#': '5', 'A#': '1' };
        return mapa[notaNome] || null;
    }

    whiteKeys.forEach(tecla => {
        const isActive = notasAtivas.includes(tecla.nota);
        const dedo = isActive ? getDedo(tecla.nota) : null;
        const whiteKey = document.createElement('div');
        whiteKey.style.cssText = `width: ${whiteKeyWidth}px; height: ${whiteKeyHeight}px; background: ${isActive ? 'linear-gradient(to bottom, #3a86ff 0%, #2666cc 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)'}; border: 1px solid #333; border-radius: 0 0 8px 8px; position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 1; cursor: default;`;
        if (dedo) {
            const dedoDiv = document.createElement('div');
            dedoDiv.textContent = dedo;
            dedoDiv.style.cssText = `position: absolute; top: 80%; left: 50%; transform: translate(-50%, -50%); width: 23px; height: 25px; background: white; color: #3a86ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: bold; font-family: Arial; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10;`;
            whiteKey.appendChild(dedoDiv);
        }
        pianoDiv.appendChild(whiteKey);
    });

    blackKeys.forEach(tecla => {
        const isActive = notasAtivas.includes(tecla.nota);
        const dedo = isActive ? getDedo(tecla.nota) : null;
        const blackKey = document.createElement('div');
        blackKey.style.cssText = `width: ${blackKeyWidth}px; height: ${blackKeyHeight}px; background: ${isActive ? 'linear-gradient(to bottom, #ff4757 0%, #cc2233 100%)' : 'linear-gradient(to bottom, #222 0%, #111 100%)'}; position: absolute; left: ${tecla.pos * whiteKeyWidth + blackKeyOffset}px; top: 0; border-radius: 0 0 5px 5px; box-shadow: 0 3px 8px rgba(0,0,0,0.4); z-index: 2; cursor: default;`;
        if (dedo) {
            const dedoDiv = document.createElement('div');
            dedoDiv.textContent = dedo;
            dedoDiv.style.cssText = `position: absolute; top: 78%; left: 50%; transform: translate(-50%, -50%); width: 18px; height: 20px; background: white; color: #ff4757; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; font-family: Arial; box-shadow: 0 1px 3px rgba(0,0,0,0.2); z-index: 11;`;
            blackKey.appendChild(dedoDiv);
        }
        pianoDiv.appendChild(blackKey);
    });

    wrapper.appendChild(pianoDiv);
    container.appendChild(wrapper);
}

console.log('✅ Piano carregado');
