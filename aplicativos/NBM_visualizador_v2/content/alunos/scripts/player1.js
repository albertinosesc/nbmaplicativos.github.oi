       // Elementos do DOM
        const songSearchInput = document.getElementById('song-search');
        const searchButton = document.getElementById('search-button');
        const songsListContainer = document.getElementById('songs-list');
        const songTitle = document.getElementById('song-title');
        const songArtist = document.getElementById('song-artist');
        const musicContainer = document.getElementById('music-container');
        const transposeUp = document.getElementById('transpose-up');
        const transposeDown = document.getElementById('transpose-down');
        const semitonesSpan = document.getElementById('semitones');
        const notationRadios = document.getElementsByName('notation');
        const displayMode = document.getElementById('display-mode');

        // Constantes para transposição
        const notesSharp = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
        const notesFlat = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];
        const flatMap = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'};

        // Mapeamento de graus harmônicos
// Mapeamento de graus atualizado para menores com "m" maiúsculo
const degreeMap = {
    'C': 'I', 'C#': '#I', 'Db': 'bII', 'D': 'II', 'D#': '#II',
    'Eb': 'bIII', 'E': 'III', 'F': 'IV', 'F#': '#IV', 'Gb': 'bV',
    'G': 'V', 'G#': '#V', 'Ab': 'bVI', 'A': 'VI', 'A#': '#VI',
    'Bb': 'bVII', 'B': 'VII',
    'Cm': 'Im', 'C#m': '#Im', 'Dbm': 'bIIm', 'Dm': 'IIm', 'D#m': '#IIm',
    'Ebm': 'bIIIm', 'Em': 'IIIm', 'Fm': 'IVm', 'F#m': '#IVm', 'Gbm': 'bVm',
    'Gm': 'Vm', 'G#m': '#Vm', 'Abm': 'bVIm', 'Am': 'VIm', 'A#m': '#VIm',
    'Bbm': 'bVIIm', 'Bm': 'VIIm'
};

// Função para converter acordes em graus (versão com menores em "Im, IIm, etc.")
function chordToDegree(chord) {
    // Extrai a nota base (C, D#, Bb, etc.) e o resto do acorde (m, 7, sus4, etc.)
    const match = chord.match(/^([A-Ga-g][#b]?)(.*)/i);
    if (!match) return chord;

    const [, baseNote, suffix] = match;
    const normalizedNote = flatMap[baseNote] || baseNote.toUpperCase();
    
    // Verifica se é menor (quando o sufixo contém 'm' independente de posição)
    const isMinor = /m/i.test(suffix);
    
    // Converte a nota base para grau
    let degree;
    if (isMinor) {
        degree = degreeMap[normalizedNote + 'm'] || 
                (degreeMap[normalizedNote] ? degreeMap[normalizedNote] + 'm' : chord);
    } else {
        degree = degreeMap[normalizedNote] || chord;
    }
    
    // Mantém o sufixo original (7, sus, etc.) removendo o 'm' duplicado se necessário
    const cleanSuffix = isMinor ? suffix.replace(/m/i, '') : suffix;
    return degree + cleanSuffix;
}

        // Variáveis de estado
        let currentSemitones = 0;
        let currentSongId = null;
        let songsList = [];
        let originalChords = "";
        let barPositions = [];

        // Carregar a lista de músicas
        fetch('../cifras/songs.json')
            .then(response => response.json())
            .then(data => {
                songsList = data;
            })
            .catch(error => {
                console.error('Erro ao carregar songs.json:', error);
            });

        // Buscar músicas
        searchButton.addEventListener('click', () => {
            const query = songSearchInput.value.toLowerCase();
            const results = songsList.filter(song =>
                song.title.toLowerCase().includes(query) || song.artist.toLowerCase().includes(query)
            );

            songsListContainer.innerHTML = '';

            if (results.length === 0) {
                songsListContainer.innerHTML = '<p>Nenhuma música encontrada.</p>';
                return;
            }

            results.forEach(song => {
                const div = document.createElement('div');
                div.className = 'song-item';
                div.textContent = `${song.title} - ${song.artist}`;
                div.addEventListener('click', () => {
                    loadSong(song.id);
                });
                songsListContainer.appendChild(div);
            });
        });

        // Carregar música selecionada
        function loadSong(id) {
            fetch(`../cifras/${id}.json`)
                .then(response => response.json())
                .then(song => {
                    currentSongId = id;
                    currentSemitones = 0;
                    semitonesSpan.textContent = currentSemitones;
                    originalChords = song.chords;
                    
                    songTitle.textContent = song.title;
                    songArtist.textContent = song.artist;
                    
                    displayChords();
                })
                .catch(error => {
                    alert('Erro ao carregar a música.');
                    console.error(error);
                });
        }

        // Exibir os acordes formatados
function displayChords() {
    let finalOutput = '';
    const lines = originalChords.split('\n');
    const useSharp = getNotation() === notesSharp;
    const showDegrees = displayMode.value === 'degrees';

    lines.forEach(line => {
        // Processar acordes
        let processedLine = line.replace(/\[([^\]]+)\]/g, (match, chord) => {
            const transposed = transposeChord(chord, currentSemitones, useSharp);
            return showDegrees ? chordToDegree(transposed) : transposed;
        });

        // Criar linha de números e linha de barras
        let numbersLine = '';
        let barsLine = '';
        let currentPos = 0;

        // Processar cada segmento da linha
        const segments = processedLine.split(/(\|+\*+)/g);
        
        segments.forEach(segment => {
            const match = segment.match(/(\|+)(\*+)/);
            
            if (match) {
                const bars = match[1];
                const stars = match[2];
                const starCount = stars.length;
                const totalLength = bars.length + stars.length;
                
                // Adicionar à linha de números
                const centerPos = Math.floor(bars.length / 2);
                for (let i = 0; i < bars.length; i++) {
                    numbersLine += (i === centerPos) ? starCount : ' ';
                }
                
                // Adicionar à linha de barras (sem asteriscos)
                barsLine += bars;
                
                currentPos += totalLength;
            } else {
                // Adicionar texto normal
                numbersLine += ' '.repeat(segment.length);
                barsLine += segment;
                currentPos += segment.length;
            }
        });

        // Adicionar ao output se houver números
        if (numbersLine.trim() !== '') {
            finalOutput += numbersLine + '\n';
        }
        finalOutput += barsLine + '\n';
    });

    musicContainer.innerHTML = `<pre style="line-height: 1.1; font-family: monospace;">${finalOutput}</pre>`;
}
        // Função para transpor acordes
        function transposeChord(chord, semitones, useSharp) {
            const notes = useSharp ? notesSharp : notesFlat;
            
            return chord.replace(/([A-Ga-g][#b]?)(.*)/g, (match, note, suffix) => {
                note = flatMap[note] || note.toUpperCase();
                const index = notesSharp.indexOf(note);
                if (index === -1) return match;

                let newIndex = (index + semitones) % 12;
                if (newIndex < 0) newIndex += 12;
                
                return notes[newIndex] + suffix;
            });
        }

        // Função para converter acordes em graus
        function chordToDegree(chord) {
            // Extrai a nota base e o sufixo (incluindo 'm' para menores)
            const match = chord.match(/^([A-Ga-g][#b]?)(.*)/i);
            if (!match) return chord;

            const [, baseNote, suffix] = match;
            const normalizedNote = flatMap[baseNote] || baseNote.toUpperCase();
            
            // Verifica se é menor (contém 'm' no sufixo)
            const isMinor = suffix.toLowerCase().includes('m');
            const degreeKey = isMinor ? normalizedNote + 'm' : normalizedNote;
            
            return degreeMap[degreeKey] || chord; // Retorna o grau ou o acorde original se não encontrado
        }

        // Obter notação selecionada
        function getNotation() {
            return document.querySelector('input[name="notation"]:checked').value === 'flat' ? notesFlat : notesSharp;
        }

        // Controles de transposição
        transposeUp.addEventListener('click', () => {
            currentSemitones++;
            semitonesSpan.textContent = currentSemitones;
            displayChords();
        });

        transposeDown.addEventListener('click', () => {
            currentSemitones--;
            semitonesSpan.textContent = currentSemitones;
            displayChords();
        });

        // Listeners para mudanças
        notationRadios.forEach(radio => {
            radio.addEventListener('change', displayChords);
        });

        displayMode.addEventListener('change', displayChords);
