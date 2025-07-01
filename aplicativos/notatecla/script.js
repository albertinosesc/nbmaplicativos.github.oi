
// Mapeamentos de notas (mantido igual)
const noteNameMap = {
    'C': 'Dó',
    'D': 'Ré',
    'E': 'Mi',
    'F': 'Fá',
    'G': 'Sol',
    'A': 'Lá',
    'B': 'Si',
    'V': 'Dó' // 'V' agora exibe 'Dó' no visual
};

const noteNumberMap = {
    'C': '1',
    'D': '2',
    'E': '3',
    'F': '4',
    'G': '5',
    'A': '6',
    'B': '7',
    'V': '8' // 'V' agora exibe '8' no visual
};

// Elementos do DOM - Verificações adicionadas para evitar erros se o elemento não existir
const statusEl = document.getElementById('status');
const fileInput = document.getElementById('midiFile');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const tempoSlider = document.getElementById('tempo');
const tempoValue = document.getElementById('tempoValue');
const fallingSpeedSlider = document.getElementById('fallingSpeed');
const fallingSpeedValue = document.getElementById('fallingSpeedValue');
const fallingNotesContainer = document.getElementById('fallingNotesContainer');
const instrumentSelector = document.getElementById("instrumentSelector");
const instrumentContainer = document.getElementById("instrumentContainer");

// Elementos da nova funcionalidade de bibliotecas
const librarySelect = document.getElementById("librarySelect");
const searchInput = document.getElementById("musicSearch");
const musicListDiv = document.getElementById("musicList");

// Novos elementos para controle de exibição das notas caindo
const showFallingNoteLettersCheckbox = document.getElementById('showFallingNoteLetters');
const showFallingNoteNumbersCheckbox = document.getElementById('showFallingNoteNumbers');
const showFallingNoteNamesCheckbox = document.getElementById('showFallingNoteNames');

// NOVOS ELEMENTOS PARA CONTROLE DE ÁUDIO DO TECLADO
const muteKeyboardCheckbox = document.getElementById('muteKeyboardCheckbox');
const keyboardVolSlider = document.getElementById('keyboardVol');

// Variáveis de estado
let transposeSolo = false;
let midiData = null;
let parts = [];
let synths = [];
let isInitialized = false;
let isPlaying = false;
let notes = [];
let notePositions = {}; // Armazena a posição X central de cada nota para as notas caindo
let fallingSpeedMultiplier = 1; // Novo multiplicador para velocidade de queda

// SAMPLERS DECLARADOS NO ESCOPO GLOBAL para acesso direto em playNote
let soloSampler = null;
let keyboardSampler = null;

// Cores e mapeamentos
const noteColors = {
    'C': 'red', 'D': 'orange', 'E': 'yellow', 'F': 'green',
    'G': 'blue', 'A': 'indigo', 'B': 'violet', 'V': 'darkred' // Mantém 'V' para a cor
};

const noteKeys = {
    'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'A': 'A', 'B': 'B', 'V': 'V',
    '1': 'C', '2': 'D', '3': 'E', '4': 'F', '5': 'G', '6': 'A', '7': 'B', '8': 'V'
};

// Inicialização dos Volume Nodes do Tone.js
const soloVolume = new Tone.Volume(0).toDestination();
const accompanimentVolume = new Tone.Volume(-12).toDestination();
const keyboardVolume = new Tone.Volume(0).toDestination();

// MAPEAMENTO DAS BIBLIOTECAS
// Garante que musicLibrary1 e musicLibrary2 existam, caso contrário, usa um array vazio
const libraries = {
    '1': typeof musicLibrary1 !== 'undefined' ? musicLibrary1 : [],
    '2': typeof musicLibrary2 !== 'undefined' ? musicLibrary2 : []
};

// Inicialização da aplicação
document.addEventListener("DOMContentLoaded", () => {
    // Verifica se os elementos existem antes de acessá-los
    if (fallingSpeedValue && fallingSpeedSlider) {
        fallingSpeedValue.textContent = `${fallingSpeedSlider.value}x`;
    }
    if (librarySelect && musicListDiv) {
        renderMusicList(librarySelect.value);
    }
    setupEventListeners();
    updateInstrument();
});

function renderMusicList(libraryId, filter = "") {
    if (!musicListDiv) return; // Evita erro se musicListDiv não existe

    const selectedLibrary = libraries[libraryId] || [];
    musicListDiv.innerHTML = "";

    selectedLibrary
        .filter(music => music.name.toLowerCase().includes(filter.toLowerCase()))
        .forEach(music => {
            const musicItem = document.createElement("div");
            musicItem.className = "music-item";
            musicItem.textContent = music.name;
            musicItem.dataset.file = music.file;
            musicListDiv.appendChild(musicItem);
        });

    setupMusicListItemListeners();
}

function setupMusicListItemListeners() {
    document.querySelectorAll('.music-item').forEach(item => {
        item.removeEventListener('click', handleMusicItemClick);
        item.addEventListener('click', handleMusicItemClick);
    });
}

async function handleMusicItemClick() {
    const fileName = this.dataset.file;
    document.querySelectorAll('.music-item').forEach(el => el.classList.remove('active'));
    this.classList.add('active');
    await loadMidiFile(fileName);
}

function setupEventListeners() {
    // Transpose Solo Checkbox
    const transposeSoloCheckbox = document.getElementById("transposeSoloCheckbox");
    if (transposeSoloCheckbox) {
        transposeSoloCheckbox.addEventListener("change", function() {
            transposeSolo = this.checked;
        });
    }

    // Solo Volume Slider
    const soloVol = document.getElementById('soloVol');
    if (soloVol) {
        soloVol.addEventListener('input', (e) => {
            soloVolume.volume.value = parseInt(e.target.value);
        });
    }

    // Accompaniment Volume Slider
    const accompVol = document.getElementById('accompVol');
    if (accompVol) {
        accompVol.addEventListener('input', (e) => {
            accompanimentVolume.volume.value = parseInt(e.target.value);
        });
    }

    // Mute Keyboard Checkbox
    if (muteKeyboardCheckbox && keyboardVolSlider) {
        muteKeyboardCheckbox.addEventListener('change', () => {
            if (muteKeyboardCheckbox.checked) {
                keyboardVolume.mute = true;
                keyboardVolSlider.disabled = true;
            } else {
                keyboardVolume.mute = false;
                keyboardVolSlider.disabled = false;
            }
        });
    }

    // Keyboard Volume Slider
    if (keyboardVolSlider) {
        keyboardVolSlider.addEventListener('input', (e) => {
            keyboardVolume.volume.value = parseInt(e.target.value);
        });
    }

    // Music Search Input
    if (searchInput && librarySelect) {
        searchInput.addEventListener('input', (e) => {
            renderMusicList(librarySelect.value, e.target.value);
        });
    }

    // Library Select
    if (librarySelect && searchInput) {
        librarySelect.addEventListener("change", () => {
            renderMusicList(librarySelect.value, searchInput.value);
        });
    }

    // MIDI File Input
    if (fileInput) {
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            document.querySelectorAll('.music-item').forEach(item => {
                item.classList.remove('active');
            });

            await loadMidiFromFile(file);
        });
    }

    // Play Button
    if (playBtn && stopBtn && statusEl) {
        playBtn.addEventListener('click', async () => {
            if (!midiData || isPlaying) return;

            if (!isInitialized) {
                await Tone.start();
                await Tone.loaded();
                isInitialized = true;
            }

            Tone.Transport.stop();
            Tone.Transport.start();
            isPlaying = true;

            requestAnimationFrame(animateFallingNotes);

            playBtn.disabled = true;
            stopBtn.disabled = false;
            statusEl.textContent = "Tocando...";
        });
    }

    // Stop Button
    if (stopBtn && playBtn && statusEl) {
        stopBtn.addEventListener('click', () => {
            Tone.Transport.stop();
            isPlaying = false;
            playBtn.disabled = false;
            stopBtn.disabled = true;
            statusEl.textContent = "Parado.";

            document.querySelectorAll('.falling-note').forEach(el => el.remove());
            notes = [];
        });
    }

    // Tempo Slider
    if (tempoSlider && tempoValue) {
        tempoSlider.addEventListener('input', () => {
            const bpm = parseInt(tempoSlider.value);
            Tone.Transport.bpm.value = bpm;
            tempoValue.textContent = bpm;
        });
    }

    // Falling Speed Slider
    if (fallingSpeedSlider && fallingSpeedValue) {
        fallingSpeedSlider.addEventListener('input', () => {
            fallingSpeedMultiplier = parseFloat(fallingSpeedSlider.value);
            fallingSpeedValue.textContent = `${fallingSpeedMultiplier}x`;
        });
    }

    // Keyboard Keydown Events
    document.addEventListener('keydown', (event) => {
        const noteChar = event.key.toUpperCase();
        const note = noteKeys[noteChar];
        if (note) {
            let noteToPlay = note + "4";

            if (noteChar === '8' || note === 'V') {
                noteToPlay = 'C5';
            }
            playNote(noteToPlay, 'manual');
        }
    });

    // Instrument Selector
    if (instrumentSelector) {
        instrumentSelector.addEventListener("change", updateInstrument);
    }

    // Instrument Display Checkboxes
    ['showLetters', 'showNumbers', 'showNoteNames'].forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', updateInstrument);
        }
    });

    // Falling Note Display Checkboxes (they don't need to trigger updateInstrument now)
    [showFallingNoteLettersCheckbox, showFallingNoteNumbersCheckbox, showFallingNoteNamesCheckbox].forEach(checkbox => {
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                // No need to re-render notes, only their content will change
                // if you want to update existing falling notes, you'd iterate through 'notes'
                // and update their textContent based on current checkbox states.
                // For now, this is okay as new notes will respect the current settings.
            });
        }
    });
}

async function loadMidiFile(filename) {
    if (!statusEl || !playBtn || !stopBtn) return;

    statusEl.textContent = `Carregando ${filename}...`;
    playBtn.disabled = true;
    stopBtn.disabled = true;

    try {
        const response = await fetch(filename);
        const arrayBuffer = await response.arrayBuffer();
        midiData = new Midi(arrayBuffer);
        await setupPlayback();

        playBtn.disabled = false;
        statusEl.textContent = `${filename} carregado. Pronto para tocar.`;
    } catch (error) {
        console.error("Erro ao carregar MIDI:", error);
        statusEl.textContent = `Erro ao carregar ${filename}`;
    }
}

async function loadMidiFromFile(file) {
    if (!statusEl || !playBtn || !stopBtn) return;

    statusEl.textContent = "Carregando arquivo MIDI...";
    playBtn.disabled = true;
    stopBtn.disabled = true;

    try {
        const arrayBuffer = await file.arrayBuffer();
        midiData = new Midi(arrayBuffer);
        await setupPlayback();

        playBtn.disabled = false;
        statusEl.textContent = "Arquivo MIDI carregado. Pronto para tocar.";
    } catch (error) {
        console.error("Erro ao carregar MIDI:", error);
        statusEl.textContent = "Erro ao carregar arquivo MIDI";
    }
}

async function setupPlayback() {
    if (!isInitialized) {
        await Tone.start();
        await Tone.loaded();
        isInitialized = true;
    }

    parts.forEach(p => p.dispose());
    synths.forEach(s => s.dispose());
    parts = [];
    synths = [];

    Tone.Transport.cancel();

    const bpm = midiData.header.tempos[0]?.bpm || 120;
    if (tempoSlider && tempoValue) {
        Tone.Transport.bpm.value = bpm;
        tempoSlider.value = bpm;
        tempoValue.textContent = bpm;
    }

    // SOLO - Piano real com Sampler (PARA O MIDI)
    soloSampler = new Tone.Sampler({
        urls: {
            "C4": "C4.mp3", "D4": "D4.mp3", "E4": "E4.mp3", "F4": "F4.mp3",
            "G4": "G4.mp3", "A4": "A4.mp3", "B4": "B4.mp3", "C5": "C5.mp3"
        },
        baseUrl: "samples/piano/",
        release: 1,
        onload: () => console.log("Solo Sampler de piano carregado"),
    }).connect(soloVolume);

    // Sampler para o teclado virtual (manual), conectado a keyboardVolume
    keyboardSampler = new Tone.Sampler({
        urls: {
            "C4": "C4.mp3", "D4": "D4.mp3", "E4": "E4.mp3", "F4": "F4.mp3",
            "G4": "G4.mp3", "A4": "A4.mp3", "B4": "B4.mp3", "C5": "C5.mp3"
        },
        baseUrl: "samples/piano/",
        release: 1,
        onload: () => console.log("Keyboard Sampler de piano carregado"),
    }).connect(keyboardVolume);

    synths.push(soloSampler);
    synths.push(keyboardSampler);

    const soloTrack = midiData.tracks.find(track => track.notes.length > 0);
    if (soloTrack) {
        const part = new Tone.Part((time, note) => {
            let noteToPlay = note.name;
            if (transposeSolo) {
                noteToPlay = transposeOctave(note.name, 1);
            }

            if (soloSampler) { // Garante que o soloSampler esteja carregado
                soloSampler.triggerAttackRelease(noteToPlay, note.duration, time, note.velocity);
            }
            generateFallingNote(note.name, note.duration, time);
        }, soloTrack.notes).start(0);

        parts.push(part);
    }

    function transposeOctave(noteName, shift = 1) {
        const match = noteName.match(/^([A-G]#?)(\d)$/);
        if (!match) return noteName;
        const [_, pitch, octave] = match;
        const newOctave = parseInt(octave) + shift;
        return pitch + newOctave;
    }

    const guitarSampler = new Tone.Sampler({
        urls: {
            "A1": "A1.mp3", "C2": "C2.mp3", "E2": "E2.mp3", "G2": "G2.mp3",
            "C3": "C3.mp3", "E3": "E3.mp3", "G3": "G3.mp3",
            "C4": "C4.mp3", "E4": "E4.mp3", "G4": "G4.mp3",
            "C5": "C5.mp3", "E5": "E5.mp3", "G5": "G5.mp3"
        },
        baseUrl: "samples/guitar/",
        release: 1,
        onload: () => console.log("Sampler de guitarra carregado"),
    }).connect(accompanimentVolume);

    synths.push(guitarSampler);

    midiData.tracks.forEach(track => {
        if (track === soloTrack || track.notes.length === 0) return;

        const part = new Tone.Part((time, note) => {
            guitarSampler.triggerAttackRelease(note.name, note.duration, time, note.velocity);
        }, track.notes).start(0);

        parts.push(part);
    });
}

// Instrumentos
const noteOrder = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'V'];

function createPiano(colorido = false) {
    if (!instrumentContainer) return;

    instrumentContainer.innerHTML = '';
    instrumentContainer.style.left = '50%';

    const showLetters = document.getElementById('showLetters')?.checked;
    const showNumbers = document.getElementById('showNumbers')?.checked;
    const showNoteNames = document.getElementById('showNoteNames')?.checked;

    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'V'];
    const blackNotes = ['C#', 'D#', null, 'F#', 'G#', 'A#', null, null];

    // Aumentar o tamanho das teclas para dispositivos móveis
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const keyWidth = isMobile ? 60 : 44; // Teclas mais largas em dispositivos móveis
    const blackKeyWidth = isMobile ? 35 : 25;
    const blackKeyHeight = isMobile ? 120 : 100;

    const blackKeyOffsets = {
        'C#': 2, 'D#': 4, 'F#': 8, 'G#': 10, 'A#': 12
    };

    notePositions = {};

    whiteNotes.forEach((note, i) => {
        const whiteKey = document.createElement("div");
        whiteKey.className = "key white";
        whiteKey.setAttribute("data-note", note);
        if (colorido) whiteKey.classList.add("color-" + note.replace('#', 's'));

        whiteKey.style.position = "relative";
        whiteKey.style.display = "inline-block";
        whiteKey.style.width = `${keyWidth}px`;
        whiteKey.style.height = isMobile ? "180px" : "160px"; // Mais alto em mobile
        whiteKey.style.marginRight = "2px";
        
        // Substituir onclick por addEventListener para toque e clique
        whiteKey.addEventListener('mousedown', handleNotePress);
        whiteKey.addEventListener('touchstart', handleNotePress, { passive: false });
        whiteKey.addEventListener('mouseup', handleNoteRelease);
        whiteKey.addEventListener('touchend', handleNoteRelease);
        whiteKey.addEventListener('mouseleave', handleNoteRelease);

        const content = document.createElement("div");
        content.className = "key-content";
        content.style.position = "absolute";
        content.style.bottom = "10px";
        content.style.width = "100%";
        content.style.textAlign = "center";

        const displayTextNote = (note === 'V') ? 'C' : note;

        if (showNumbers) {
            const num = document.createElement("div");
            num.className = "number";
            num.textContent = noteNumberMap[note] || '';
            content.appendChild(num);
        }
        if (showNoteNames) {
            const noteName = document.createElement("div");
            noteName.className = "note-name";
            noteName.textContent = noteNameMap[note] || '';
            content.appendChild(noteName);
        }
        if (showLetters) {
            const letter = document.createElement("div");
            letter.className = "letter";
            letter.textContent = displayTextNote;
            content.appendChild(letter);
        }

        whiteKey.appendChild(content);
        instrumentContainer.appendChild(whiteKey);
    });

    whiteNotes.forEach((note, i) => {
        const blackNote = blackNotes[i];
        if (!blackNote) return;

        const blackKey = document.createElement("div");
        blackKey.className = "key black";
        blackKey.setAttribute("data-note", blackNote);
        if (colorido) blackKey.classList.add("color-" + blackNote.replace('#', 's'));

        blackKey.style.position = "absolute";
        blackKey.style.width = `${blackKeyWidth}px`;
        blackKey.style.height = `${blackKeyHeight}px`;

        const offset = blackKeyOffsets[blackNote] || 0;
        blackKey.style.left = `${i * (keyWidth + 2) + keyWidth - blackKeyWidth/2 + offset}px`;

        blackKey.style.top = "0";
        
        // Substituir onclick por addEventListener para toque e clique
        blackKey.addEventListener('mousedown', handleNotePress);
        blackKey.addEventListener('touchstart', handleNotePress, { passive: false });
        blackKey.addEventListener('mouseup', handleNoteRelease);
        blackKey.addEventListener('touchend', handleNoteRelease);
        blackKey.addEventListener('mouseleave', handleNoteRelease);

        const content = document.createElement("div");
        content.className = "key-content";
        blackKey.appendChild(content);
        instrumentContainer.appendChild(blackKey);
    });

    setTimeout(updateNotePositions, 100);
}


function createXilofone() {
    if (!instrumentContainer) return;

    instrumentContainer.innerHTML = '';
    instrumentContainer.style.left = '50%';

    const showLetters = document.getElementById('showLetters')?.checked;
    const showNumbers = document.getElementById('showNumbers')?.checked;
    const showNoteNames = document.getElementById('showNoteNames')?.checked;

    notePositions = {};

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const barWidth = isMobile ? 50 : 40; // Barras mais largas em mobile

    noteOrder.forEach((note, index) => {
        const bar = document.createElement("div");
        bar.className = `bar color-${note}`;
        bar.setAttribute("data-note", note);
        bar.style.width = `${barWidth}px`;
        bar.style.height = `${100 - index * 10}px`;
        bar.style.margin = '0 2px';
        bar.style.backgroundColor = noteColors[note];
        bar.style.display = 'flex';
        bar.style.flexDirection = 'column';
        bar.style.justifyContent = 'flex-end';
        bar.style.alignItems = 'center';
        bar.style.cursor = 'pointer';
        
        // Substituir onclick por addEventListener para toque e clique
        bar.addEventListener('mousedown', handleNotePress);
        bar.addEventListener('touchstart', handleNotePress, { passive: false });
        bar.addEventListener('mouseup', handleNoteRelease);
        bar.addEventListener('touchend', handleNoteRelease);
        bar.addEventListener('mouseleave', handleNoteRelease);

        const content = document.createElement("div");
        content.className = "bar-content";
        content.style.marginBottom = '5px';

        const displayTextNote = (note === 'V') ? 'C' : note;

        if (showNumbers) {
            const num = document.createElement("div");
            num.className = "number";
            num.textContent = noteNumberMap[note] || '';
            content.appendChild(num);
        }
        if (showNoteNames) {
            const noteName = document.createElement("div");
            noteName.className = "note-name";
            noteName.textContent = noteNameMap[note] || '';
            content.appendChild(noteName);
        }
        if (showLetters) {
            const letter = document.createElement("div");
            letter.className = "letter";
            letter.textContent = displayTextNote;
            content.appendChild(letter);
        }

        bar.appendChild(content);
        instrumentContainer.appendChild(bar);
    });

    setTimeout(updateNotePositions, 100);
}

// Novas funções para lidar com toques
function handleNotePress(e) {
    // Prevenir o comportamento padrão para evitar zoom indesejado
    if (e.type === 'touchstart') {
        e.preventDefault();
    }
    
    const noteElement = e.currentTarget;
    const note = noteElement.getAttribute('data-note');
    
    // Feedback visual
    noteElement.classList.add('active-touch');
    
    // Tocar a nota
    playNote(note === 'V' ? 'C5' : note + "4", 'manual');
}

function handleNoteRelease(e) {
    const noteElement = e.currentTarget;
    noteElement.classList.remove('active-touch');
}
function playNote(noteNameFull, source = 'midi') {
    let pureNoteKey = noteNameFull[0];
    const octave = parseInt(noteNameFull.slice(1));

    if (pureNoteKey === 'C' && octave >= 5) {
        pureNoteKey = 'V';
    }

    if (isInitialized) {
        if (source === 'manual' && keyboardSampler) {
            keyboardSampler.triggerAttackRelease(noteNameFull, "8n");
        } else if (source === 'midi' && soloSampler) {
            soloSampler.triggerAttackRelease(noteNameFull, "8n");
        }
    }

    if (source === 'manual') {
        removeFallingNotesByPitch(pureNoteKey);
    }

    if (source === 'midi') {
        generateFallingNote(noteNameFull, 0.5);
    }
}

function removeFallingNotesByPitch(pitchKey) {
    for (let i = notes.length - 1; i >= 0; i--) {
        const note = notes[i];
        if (note && note.element && note.element.dataset.pitchKey) { // Adiciona verificações de segurança
            const noteFallingPitchKey = note.element.dataset.pitchKey;

            if (noteFallingPitchKey === pitchKey) {
                note.element.style.opacity = '0';
                note.element.style.transform = 'scale(1.2)';
                note.element.style.transition = 'opacity 0.2s, transform 0.2s';

                setTimeout(() => {
                    note.element.remove();
                    notes.splice(i, 1);
                }, 200);
            }
        }
    }
}

function generateFallingNote(noteNameFull, duration) {
    let pureNoteKey = noteNameFull[0];
    const octave = parseInt(noteNameFull.slice(1));

    if (pureNoteKey === 'C' && octave >= 5) {
        pureNoteKey = 'V';
    }

    if (!notePositions[pureNoteKey] || !fallingNotesContainer) { // Verifica se fallingNotesContainer existe
        console.warn(`Posição para a nota ${pureNoteKey} não encontrada ou container de notas caindo ausente. Notas caindo podem não aparecer.`);
        return;
    }

    const noteEl = document.createElement("div");
    noteEl.className = "falling-note";
    noteEl.classList.add("color-" + pureNoteKey);
    noteEl.style.left = notePositions[pureNoteKey] + "px";
    noteEl.style.top = "0px";

    noteEl.dataset.pitchKey = pureNoteKey;

    let displayContent = '';
    const displayTextNote = (pureNoteKey === 'V') ? 'C' : pureNoteKey;

    if (showFallingNoteNumbersCheckbox && showFallingNoteNumbersCheckbox.checked) {
        displayContent = noteNumberMap[pureNoteKey] || '';
    } else if (showFallingNoteNamesCheckbox && showFallingNoteNamesCheckbox.checked) {
        displayContent = noteNameMap[pureNoteKey] || '';
    } else if (showFallingNoteLettersCheckbox && showFallingNoteLettersCheckbox.checked) {
        displayContent = displayTextNote;
    } else {
        displayContent = '';
    }
    noteEl.textContent = displayContent;

    fallingNotesContainer.appendChild(noteEl);

    const baseSpeed = fallingNotesContainer.offsetHeight / (duration || 0.5);
    const finalSpeed = baseSpeed * fallingSpeedMultiplier;

    notes.push({
        element: noteEl,
        startTime: Tone.Transport.seconds,
        duration: duration,
        speed: finalSpeed
    });

    const el = instrumentContainer?.querySelector(`[data-note="${pureNoteKey}"]`); // Uso de optional chaining
    if (el) {
        el.classList.add("active");
        setTimeout(() => el.classList.remove("active"), Tone.Time(duration || "8n").toMilliseconds());
    }
}

function updateNotePositions() {
    notePositions = {};

    if (!instrumentSelector || !instrumentContainer || !fallingNotesContainer) return;

    const instrumentType = instrumentSelector.value;
    if (instrumentType.startsWith("piano")) {
        const whiteKeys = instrumentContainer.querySelectorAll('.key.white');
        const containerRect = fallingNotesContainer.getBoundingClientRect();

        whiteKeys.forEach(key => {
            const noteAttr = key.getAttribute('data-note');
            if (noteAttr) {
                const rect = key.getBoundingClientRect();
                notePositions[noteAttr] = rect.left - containerRect.left + rect.width / 2;
            }
        });
    } else if (instrumentType === "xilofone") {
        const allBars = instrumentContainer.querySelectorAll('.bar');
        const containerRect = fallingNotesContainer.getBoundingClientRect();
        allBars.forEach(bar => {
            const noteAttr = bar.getAttribute('data-note');
            if (noteAttr) {
                const rect = bar.getBoundingClientRect();
                notePositions[noteAttr] = rect.left - containerRect.left + rect.width / 2;
            }
        });
    }
}

function animateFallingNotes() {
    if (!isPlaying || !fallingNotesContainer) { // Verifica fallingNotesContainer
        return;
    }

    const currentTime = Tone.Transport.seconds;
    const containerHeight = fallingNotesContainer.offsetHeight;

    notes = notes.filter(note => {
        if (!note || !note.element) return false; // Adiciona verificação para notas inválidas

        const elapsed = currentTime - note.startTime;
        const distance = elapsed * note.speed;

        if (distance >= containerHeight) {
            note.element.remove();
            return false;
        }

        note.element.style.top = distance + "px";
        return true;
    });

    requestAnimationFrame(animateFallingNotes);
}

function updateInstrument() {
    if (!instrumentSelector) return;

    const type = instrumentSelector.value;
    if (type === "piano") createPiano(false);
    else if (type === "piano-colorido") createPiano(true);
    else if (type === "xilofone") createXilofone();

    setTimeout(updateNotePositions, 150);
}

window.addEventListener("load", () => {
    // Definir o estado inicial dos checkboxes de exibição do instrumento
    const showLetters = document.getElementById('showLetters');
    const showNumbers = document.getElementById('showNumbers');
    const showNoteNames = document.getElementById('showNoteNames');

    if (showLetters) showLetters.checked = false;
    if (showNumbers) showNumbers.checked = false;
    if (showNoteNames) showNoteNames.checked = false;

    // Definir o estado inicial dos checkboxes de exibição das notas caindo
    if (showFallingNoteLettersCheckbox) showFallingNoteLettersCheckbox.checked = true;
    if (showFallingNoteNumbersCheckbox) showFallingNoteNumbersCheckbox.checked = false;
    if (showFallingNoteNamesCheckbox) showFallingNoteNamesCheckbox.checked = false;

    // Inicializar a lista de músicas
    if (librarySelect) {
        librarySelect.value = '1';
        renderMusicList(librarySelect.value);
    }

    // Atualizar o instrumento inicial
    updateInstrument();

    // Garante que o slider de volume do teclado e o checkbox de mudo iniciem no estado correto
    if (keyboardVolSlider && muteKeyboardCheckbox) {
        keyboardVolume.volume.value = parseInt(keyboardVolSlider.value);
        muteKeyboardCheckbox.checked = false;
        keyboardVolSlider.disabled = false;
    }
});
