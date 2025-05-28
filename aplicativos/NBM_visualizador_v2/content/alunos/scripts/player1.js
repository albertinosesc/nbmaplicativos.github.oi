// =============================================
// ELEMENTOS DO DOM
// =============================================
const elements = {
    songSearchInput: document.getElementById('song-search'),
    searchButton: document.getElementById('search-button'),
    songsListContainer: document.getElementById('songs-list'),
    songTitle: document.getElementById('song-title'),
    songArtist: document.getElementById('song-artist'),
    musicContainer: document.getElementById('music-container'),
    transposeUp: document.getElementById('transpose-up'),
    transposeDown: document.getElementById('transpose-down'),
    semitonesSpan: document.getElementById('semitones'),
    notationRadios: document.getElementsByName('notation'),
    displayMode: document.getElementById('display-mode')
};

// =============================================
// CONSTANTES MUSICAIS
// =============================================
const MUSICAL_NOTES = {
    sharp: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    flat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
};

const FLAT_TO_SHARP_MAP = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
};

const DEGREE_MAP = {
    'C': 'I', 'C#': '#I', 'Db': 'bII', 'D': 'II', 'D#': '#II',
    'Eb': 'bIII', 'E': 'III', 'F': 'IV', 'F#': '#IV', 'Gb': 'bV',
    'G': 'V', 'G#': '#V', 'Ab': 'bVI', 'A': 'VI', 'A#': '#VI',
    'Bb': 'bVII', 'B': 'VII',
    'Cm': 'Im', 'C#m': '#Im', 'Dbm': 'bIIm', 'Dm': 'IIm', 'D#m': '#IIm',
    'Ebm': 'bIIIm', 'Em': 'IIIm', 'Fm': 'IVm', 'F#m': '#IVm', 'Gbm': 'bVm',
    'Gm': 'Vm', 'G#m': '#Vm', 'Abm': 'bVIm', 'Am': 'VIm', 'A#m': '#VIm',
    'Bbm': 'bVIIm', 'Bm': 'VIIm'
};

// =============================================
// ESTADO DA APLICAÇÃO
// =============================================
const state = {
    currentSemitones: 0,
    currentSongId: null,
    songsList: [],
    originalChords: "",
    barPositions: [],
    currentSong: null
};

// =============================================
// FUNÇÕES AUXILIARES
// =============================================
const utils = {
    normalizeNote: (note) => FLAT_TO_SHARP_MAP[note] || note.toUpperCase(),
    
    getNotation: () => {
        const notation = document.querySelector('input[name="notation"]:checked').value;
        return MUSICAL_NOTES[notation];
    },
    
    isMinorChord: (suffix) => /m/i.test(suffix),
    
    loadJSFile: (url) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => {
                document.head.removeChild(script);
                resolve();
            };
            script.onerror = () => {
                document.head.removeChild(script);
                reject(new Error(`Falha ao carregar ${url}`));
            };
            document.head.appendChild(script);
        });
    }
};

// =============================================
// FUNÇÕES DE ACORDES
// =============================================
const chordFunctions = {
    transposeChord: (chord, semitones, useSharp) => {
        const notes = useSharp ? MUSICAL_NOTES.sharp : MUSICAL_NOTES.flat;
        
        return chord.replace(/([A-Ga-g][#b]?)(.*)/g, (match, note, suffix) => {
            const normalizedNote = utils.normalizeNote(note);
            const index = MUSICAL_NOTES.sharp.indexOf(normalizedNote);
            if (index === -1) return match;

            let newIndex = (index + semitones) % 12;
            if (newIndex < 0) newIndex += 12;
            
            return notes[newIndex] + suffix;
        });
    },
    
    chordToDegree: (chord) => {
        const match = chord.match(/^([A-Ga-g][#b]?)(.*)/i);
        if (!match) return chord;

        const [, baseNote, suffix] = match;
        const normalizedNote = utils.normalizeNote(baseNote);
        const isMinor = utils.isMinorChord(suffix);
        
        let degree;
        if (isMinor) {
            degree = DEGREE_MAP[normalizedNote + 'm'] || 
                    (DEGREE_MAP[normalizedNote] ? DEGREE_MAP[normalizedNote] + 'm' : chord);
        } else {
            degree = DEGREE_MAP[normalizedNote] || chord;
        }
        
        const cleanSuffix = isMinor ? suffix.replace(/m/i, '') : suffix;
        return degree + cleanSuffix;
    }
};

// =============================================
// FUNÇÕES DE INTERFACE
// =============================================
const uiFunctions = {
    displayChords: () => {
        if (!state.originalChords) return;

        let finalOutput = '';
        const lines = state.originalChords.split('\n');
        const useSharp = utils.getNotation() === MUSICAL_NOTES.sharp;
        const showDegrees = elements.displayMode.value === 'degrees';

        lines.forEach(line => {
            let processedLine = line.replace(/\[([^\]]+)\]/g, (match, chord) => {
                const transposed = chordFunctions.transposeChord(chord, state.currentSemitones, useSharp);
                return showDegrees ? chordFunctions.chordToDegree(transposed) : transposed;
            });

            let numbersLine = '';
            let barsLine = '';
            let currentPos = 0;

            const segments = processedLine.split(/(\|+\*+)/g);
            
            segments.forEach(segment => {
                const match = segment.match(/(\|+)(\*+)/);
                
                if (match) {
                    const bars = match[1];
                    const stars = match[2];
                    const starCount = stars.length;
                    const totalLength = bars.length + stars.length;
                    
                    const centerPos = Math.floor(bars.length / 2);
                    for (let i = 0; i < bars.length; i++) {
                        numbersLine += (i === centerPos) ? starCount : ' ';
                    }
                    
                    barsLine += bars;
                    currentPos += totalLength;
                } else {
                    numbersLine += ' '.repeat(segment.length);
                    barsLine += segment;
                    currentPos += segment.length;
                }
            });

            if (numbersLine.trim() !== '') {
                finalOutput += numbersLine + '\n';
            }
            finalOutput += barsLine + '\n';
        });

        elements.musicContainer.innerHTML = `<pre style="line-height: 1.1; font-family: monospace;">${finalOutput}</pre>`;
    },
    
    displaySearchResults: (results) => {
        elements.songsListContainer.innerHTML = '';

        if (!results || results.length === 0) {
            elements.songsListContainer.innerHTML = '<p>Nenhuma música encontrada.</p>';
            return;
        }

        results.forEach(song => {
            const div = document.createElement('div');
            div.className = 'song-item';
            div.textContent = `${song.title} - ${song.artist}`;
            div.addEventListener('click', () => songFunctions.loadSong(song.id));
            elements.songsListContainer.appendChild(div);
        });
    }
};

// =============================================
// FUNÇÕES DE MÚSICAS (Adaptadas para JS)
// =============================================
const songFunctions = {
    loadSongsList: async () => {
        try {
            // Carrega o arquivo songs.js que deve definir window.songsList
            await utils.loadJSFile('../cifras/songs.js');
            
            if (window.songsList && Array.isArray(window.songsList)) {
                state.songsList = window.songsList;
            } else {
                throw new Error('Formato inválido de songsList');
            }
        } catch (error) {
            console.error('Erro ao carregar lista de músicas:', error);
            if (elements.songsListContainer) {
                elements.songsListContainer.innerHTML = '<p>Erro ao carregar lista de músicas</p>';
            }
        }
    },
    
    searchSongs: () => {
        const query = elements.songSearchInput.value.toLowerCase().trim();
        if (!query) return;

        const results = state.songsList.filter(song =>
            song.title.toLowerCase().includes(query) || 
            song.artist.toLowerCase().includes(query)
        );

        uiFunctions.displaySearchResults(results);
    },
    
    loadSong: async (id) => {
        if (!id) return;

        try {
            // Remove o script anterior se existir
            const oldScript = document.getElementById('current-song-script');
            if (oldScript) document.head.removeChild(oldScript);
            
            // Carrega o novo arquivo JS da música
            await utils.loadJSFile(`../cifras/${id}.js`);
            
            // O arquivo JS deve definir window.currentSong
            if (!window.currentSong) {
                throw new Error('Formato inválido do arquivo da música');
            }
            
            state.currentSongId = id;
            state.currentSemitones = 0;
            state.originalChords = window.currentSong.chords;
            state.currentSong = window.currentSong;
            
            elements.semitonesSpan.textContent = state.currentSemitones;
            elements.songTitle.textContent = window.currentSong.title;
            elements.songArtist.textContent = window.currentSong.artist;
            
            uiFunctions.displayChords();
        } catch (error) {
            console.error('Erro ao carregar a música:', error);
            alert('Erro ao carregar a música. Verifique o console para mais detalhes.');
        }
    }
};

// =============================================
// CONFIGURAÇÃO DE EVENTOS
// =============================================
const setupEventListeners = () => {
    if (!elements.searchButton || !elements.songSearchInput) return;

    // Busca
    elements.searchButton.addEventListener('click', songFunctions.searchSongs);
    elements.songSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') songFunctions.searchSongs();
    });

    // Transposição
    if (elements.transposeUp && elements.transposeDown) {
        elements.transposeUp.addEventListener('click', () => {
            state.currentSemitones++;
            elements.semitonesSpan.textContent = state.currentSemitones;
            uiFunctions.displayChords();
        });

        elements.transposeDown.addEventListener('click', () => {
            state.currentSemitones--;
            elements.semitonesSpan.textContent = state.currentSemitones;
            uiFunctions.displayChords();
        });
    }

    // Mudanças de configuração
    if (elements.notationRadios) {
        Array.from(elements.notationRadios).forEach(radio => {
            radio.addEventListener('change', uiFunctions.displayChords);
        });
    }

    if (elements.displayMode) {
        elements.displayMode.addEventListener('change', uiFunctions.displayChords);
    }
};

// =============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =============================================
const initializeApp = async () => {
    // Verifica elementos essenciais
    const essentialElements = ['searchButton', 'songSearchInput', 'songsListContainer', 'musicContainer'];
    const missingElements = essentialElements.filter(id => !elements[id]);
    
    if (missingElements.length > 0) {
        console.error('Elementos essenciais não encontrados:', missingElements);
        alert('Aplicação não pode iniciar. Elementos essenciais faltando.');
        return;
    }

    // Configura eventos e carrega dados
    setupEventListeners();
    await songFunctions.loadSongsList();
};

// Inicia quando o DOM estiver pronto
if (document.readyState === 'complete') {
    initializeApp();
} else {
    document.addEventListener('DOMContentLoaded', initializeApp);
}