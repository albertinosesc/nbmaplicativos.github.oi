// =============================================
// ELEMENTOS DO DOM
// =============================================
const elements = {
    searchInput: document.getElementById('song-search'),
    searchButton: document.getElementById('search-button'),
    searchResults: document.getElementById('search-results'),
    songTitle: document.getElementById('song-title'),
    songArtist: document.getElementById('song-artist'),
    musicContainer: document.getElementById('music-container'),
    transposeUp: document.getElementById('transpose-up'),
    transposeDown: document.getElementById('transpose-down'),
    accidentalRadios: document.getElementsByName('accidental'),
    semitonesDisplay: document.getElementById('semitones-display')
};

// =============================================
// CONSTANTES MUSICAIS
// =============================================
const MUSICAL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_TO_SHARP = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'};

// =============================================
// ESTADO DA APLICAÇÃO
// =============================================
const state = {
    songs: [],
    currentSong: null,
    originalChords: [],
    semitones: 0
};

// =============================================
// FUNÇÕES PRINCIPAIS
// =============================================

/**
 * Carrega um arquivo JavaScript dinamicamente
 */
function loadJSFile(url) {
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

/**
 * Carrega a lista de músicas
 */
async function loadSongList() {
    try {
        console.log('Carregando lista de músicas...');
        await loadJSFile('../musicas/lista-musicas.js');
        
        if (!window.listaMusicas || !Array.isArray(window.listaMusicas)) {
            throw new Error('Formato inválido da lista de músicas');
        }
        
        // Carrega informações básicas de cada música
        state.songs = await Promise.all(window.listaMusicas.map(async file => {
            try {
                await loadJSFile(`../musicas/${file}`);
                if (!window.currentSong) {
                    throw new Error('Formato inválido da música');
                }
                return {
                    file,
                    title: window.currentSong.titulo,
                    artist: window.currentSong.artista || '',
                    chords: window.currentSong.cifra || []
                };
            } catch (error) {
                console.error(`Erro ao carregar ${file}:`, error);
                return {
                    file,
                    title: file.replace('.js', '').replace(/-/g, ' '),
                    artist: 'Artista desconhecido',
                    chords: []
                };
            }
        }));
        
        console.log('Músicas carregadas:', state.songs);
        setupSearch();
        
    } catch (error) {
        console.error('Erro ao carregar lista:', error);
        alert('Erro ao carregar lista de músicas. Verifique o console.');
    }
}

/**
 * Carrega uma música específica
 */
async function loadSong(file) {
    try {
        // Remove script anterior se existir
        const oldScript = document.getElementById('current-song-script');
        if (oldScript) document.head.removeChild(oldScript);
        
        // Carrega o arquivo da música
        const script = document.createElement('script');
        script.src = `../musicas/${file}`;
        script.id = 'current-song-script';
        
        script.onload = () => {
            if (!window.currentSong) {
                throw new Error('Formato inválido da música');
            }
            
            state.currentSong = {
                file,
                title: window.currentSong.titulo,
                artist: window.currentSong.artista || '',
                chords: window.currentSong.cifra || []
            };
            
            state.originalChords = [...state.currentSong.chords];
            state.semitones = 0;
            
            updateUI();
        };
        
        script.onerror = () => {
            document.head.removeChild(script);
            throw new Error(`Falha ao carregar ${file}`);
        };
        
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('Erro ao carregar música:', error);
        alert('Erro ao carregar a música. Verifique o console.');
    }
}

/**
 * Transpõe um acorde individual
 */
/**
 * Transpõe um acorde individual, considerando sustenidos ou bemóis
 */
function transposeChord(chord, semitones) {
    const match = chord.match(/^([A-G][b#]?)/);
    if (!match) return chord;

    let note = match[1];
    let index = MUSICAL_NOTES.indexOf(note);

    if (index === -1 && FLAT_TO_SHARP[note]) {
        note = FLAT_TO_SHARP[note];
        index = MUSICAL_NOTES.indexOf(note);
    }

    if (index === -1) return chord;

    const newIndex = (index + semitones + 12) % 12;

    const accidentalPref = getAccidentalPreference();
    const useFlat = accidentalPref === 'flat';

    const sharpNote = MUSICAL_NOTES[newIndex];
    const flatNote = Object.entries(FLAT_TO_SHARP).find(([, sharp]) => sharp === sharpNote)?.[0];

    const finalNote = useFlat && flatNote ? flatNote : sharpNote;

    return finalNote + chord.slice(match[1].length);
}


function getAccidentalPreference() {
    return Array.from(elements.accidentalRadios).find(radio => radio.checked)?.value || 'sharp';
}

/**
 * Atualiza a interface do usuário
 */
function updateUI() {
    if (!state.currentSong) return;
    
    // Atualiza informações da música
    elements.songTitle.textContent = state.currentSong.title;
    elements.songArtist.textContent = state.currentSong.artist;
    elements.semitonesDisplay.textContent = state.semitones;
    
    // Atualiza a cifra
    elements.musicContainer.innerHTML = '';
    
    state.originalChords.forEach(line => {
        const div = document.createElement('div');
        if (line.trim() === '') {
            div.innerHTML = '<br>';
        } else {
            const transposedLine = line.replace(/\[([^\]]+)\]/g, (_, chord) => 
                `[${transposeChord(chord, state.semitones)}]`
            );
            div.innerHTML = transposedLine.replace(/\[([^\]]+)\]/g, '<span class="chord">$1</span>');
        }
        elements.musicContainer.appendChild(div);
    });
}

/**
 * Configura o sistema de busca
 */
function setupSearch() {
    elements.searchButton.addEventListener('click', performSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    elements.searchInput.addEventListener('input', performSearch); // 🔥 Aqui faz a busca dinâmica enquanto digita
}

/**
 * Executa a busca e exibe os resultados
 */
// =============================================
// FUNÇÃO PARA DESTACAR TERMOS DE BUSCA
// =============================================
function highlightMatch(text, term) {
    if (!term) return text;
    
    const index = text.toLowerCase().indexOf(term.toLowerCase());
    if (index === -1) return text;
    
    const before = text.substring(0, index);
    const match = text.substring(index, index + term.length);
    const after = text.substring(index + term.length);
    
    return `${before}<span class="highlight">${match}</span>${after}`;
}

// =============================================
// FUNÇÃO DE BUSCA ATUALIZADA
// =============================================
function performSearch() {
    const term = elements.searchInput.value.trim();
    elements.searchResults.innerHTML = '';
    
    if (!term) {
        elements.searchResults.style.display = 'none';
        return;
    }
    
    const results = state.songs.filter(song =>
        song.title.toLowerCase().includes(term.toLowerCase()) ||
        (song.artist && song.artist.toLowerCase().includes(term.toLowerCase()))
    );
    
    if (results.length > 0) {
        results.forEach(song => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            
            // Destaca o termo de busca nos resultados
            const highlightedTitle = highlightMatch(song.title, term);
            const highlightedArtist = song.artist ? highlightMatch(song.artist, term) : '';
            
            item.innerHTML = `
                <div class="search-result-title">${highlightedTitle}</div>
                ${highlightedArtist ? `<div class="search-result-artist">${highlightedArtist}</div>` : ''}
            `;
            
            item.addEventListener('click', () => {
                loadSong(song.file);
                elements.searchResults.style.display = 'none';
                elements.searchInput.value = song.title;
            });
            
            elements.searchResults.appendChild(item);
        });
        
        elements.searchResults.style.display = 'block';
    } else {
        elements.searchResults.innerHTML = '<div class="no-results">Nenhuma música encontrada</div>';
        elements.searchResults.style.display = 'block';
    }
}

// =============================================
// INICIALIZAÇÃO
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Controles de transposição
    elements.transposeUp.addEventListener('click', () => {
        state.semitones++;
        updateUI();
    });

    elements.accidentalRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        updateUI();
    });
});



    elements.transposeDown.addEventListener('click', () => {
        state.semitones--;
        updateUI();
    });

    // Fechar resultados ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search-container') && 
            !e.target.closest('#search-results')) {
            elements.searchResults.style.display = 'none';
        }
    });

    // Carrega a lista de músicas
    loadSongList();
});