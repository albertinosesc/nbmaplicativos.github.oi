 // Variáveis globais
    let cifraOriginal = [];
    let semitones = 0;
    let musicas = [];
    let musicaAtual = null;

    // Notas musicais para transposição
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const flatMap = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'};

    // Formata a linha com cifras coloridas
    function formatLine(line) {
      return line.replace(/\[([^\]]+)\]/g, '<span class="chord">$1</span>');
    }

    // Transpõe um acorde individual
    function transposeChord(chord, semitones) {
      const match = chord.match(/^([A-G][b#]?)/);
      if (!match) return chord;

      let baseNote = match[1];
      let index = notes.indexOf(baseNote);

      if (index === -1 && flatMap[baseNote]) {
        baseNote = flatMap[baseNote];
        index = notes.indexOf(baseNote);
        if (index === -1) return chord;
      } else if (index === -1) {
        return chord;
      }

      let newIndex = (index + semitones) % 12;
      if (newIndex < 0) newIndex += 12;
      const newNote = notes[newIndex];
      const resto = chord.slice(match[1].length);

      return newNote + resto;
    }

    // Transpõe todas as cifras em uma linha
    function transposeLine(line, semitones) {
      return line.replace(/\[([^\]]+)\]/g, (_, chord) => {
        return '[' + transposeChord(chord, semitones) + ']';
      });
    }

    // Atualiza a exibição da música
    function updateDisplay() {
      const container = document.getElementById('music-container');
      container.innerHTML = '';

      cifraOriginal.forEach(line => {
        const div = document.createElement('div');
        
        if (line.trim() === '') {
          // Linha vazia (espaço entre versos)
          div.innerHTML = '<br>';
        } else {
          // Transpõe e formata a linha
          const transposedLine = transposeLine(line, semitones);
          div.innerHTML = formatLine(transposedLine);
        }
        
        container.appendChild(div);
      });
    }

    // Carrega uma música selecionada
    function loadSong(song) {
      if (!song) return;
      
      musicaAtual = song;
      cifraOriginal = song.cifra || [];
      semitones = 0;
      
      document.getElementById('song-title').textContent = song.titulo;
      document.getElementById('song-artist').textContent = song.artista || '';
      document.title = song.titulo + (song.artista ? ` - ${song.artista}` : '');
      document.getElementById('semitones-display').textContent = semitones;
      
      updateDisplay();
    }

    // Executa a busca
    function performSearch(searchTerm) {
      const searchResults = document.getElementById('search-results');
      searchTerm = searchTerm.toLowerCase().trim();
      
      if (searchTerm.length === 0) {
        searchResults.style.display = 'none';
        return;
      }
      
      // Filtra as músicas que correspondem ao termo de busca
      const results = musicas.filter(musica => {
        const titleMatch = musica.titulo.toLowerCase().includes(searchTerm);
        const artistMatch = musica.artista && musica.artista.toLowerCase().includes(searchTerm);
        return titleMatch || artistMatch;
      });
      
      // Exibe os resultados
      if (results.length > 0) {
        searchResults.innerHTML = '';
        
        results.forEach(musica => {
          const resultItem = document.createElement('div');
          resultItem.className = 'search-result-item';
          
          // Destaca o termo de busca no resultado
          const title = highlightMatch(musica.titulo, searchTerm);
          const artist = musica.artista ? highlightMatch(musica.artista, searchTerm) : '';
          
          resultItem.innerHTML = `${title}${artist ? `<br><small>${artist}</small>` : ''}`;
          resultItem.addEventListener('click', () => {
            loadSong(musica);
            searchResults.style.display = 'none';
            document.getElementById('song-search').value = musica.titulo;
          });
          
          searchResults.appendChild(resultItem);
        });
        
        searchResults.style.display = 'block';
      } else {
        searchResults.innerHTML = '<div class="search-result-item">Nenhuma música encontrada</div>';
        searchResults.style.display = 'block';
      }
    }

    // Carrega a lista de músicas disponíveis
    async function loadSongList() {
      try {
        // Carrega a lista de arquivos JSON
        const response = await fetch('../musicas/lista-musicas.json');
        if (!response.ok) throw new Error('Erro ao carregar lista de músicas');
        
        const songFiles = await response.json();
        musicas = [];
        
        // Carrega cada música individualmente
        for (const file of songFiles) {
          try {
            const songResponse = await fetch(`../musicas/${file}`);
            if (songResponse.ok) {
              const songData = await songResponse.json();
              musicas.push({
                ...songData,
                file: file
              });
            }
          } catch (e) {
            console.error(`Erro ao carregar ${file}:`, e);
          }
        }
        
        console.log("Músicas carregadas:", musicas);
        
        // Configura o campo de busca
        setupSearch();
        
      } catch (error) {
        console.error('Erro ao carregar lista:', error);
        document.getElementById('song-search').placeholder = 'Erro ao carregar músicas';
      }
    }

    // Configura o campo de busca e os eventos
    function setupSearch() {
      const searchInput = document.getElementById('song-search');
      const searchButton = document.getElementById('search-button');
      const searchResults = document.getElementById('search-results');
      const searchContainer = document.getElementById('search-container');
      
      // Busca ao digitar (em tempo real)
      searchInput.addEventListener('input', function() {
        performSearch(this.value);
      });
      
      // Busca ao clicar no botão
      searchButton.addEventListener('click', function() {
        performSearch(searchInput.value);
      });
      
      // Busca ao pressionar Enter
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          performSearch(this.value);
        }
      });
      
      // Esconde os resultados quando clicar fora
      document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target)) {
          searchResults.style.display = 'none';
        }
      });
    }

    // Destaca o termo de busca no texto
    function highlightMatch(text, term) {
      const index = text.toLowerCase().indexOf(term);
      if (index === -1) return text;
      
      const before = text.substring(0, index);
      const match = text.substring(index, index + term.length);
      const after = text.substring(index + term.length);
      
      return `${before}<span class="highlight">${match}</span>${after}`;
    }

    // Event Listeners
    document.addEventListener('DOMContentLoaded', () => {
      // Controles de transposição
      document.getElementById('transpose-up').addEventListener('click', () => {
        semitones++;
        updateDisplay();
        document.getElementById('semitones-display').textContent = semitones;
      });

      document.getElementById('transpose-down').addEventListener('click', () => {
        semitones--;
        updateDisplay();
        document.getElementById('semitones-display').textContent = semitones;
      });

      // Carrega a lista de músicas ao iniciar
      loadSongList();
    });
