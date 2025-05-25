 // Objeto para armazenar as músicas registradas
        const registeredSongs = {};
        
        // Função modificada para registrar músicas
        function registerSong(songData) {
            if (!songData || !songData.id || !songData.abc) {
                console.error("Dados da música inválidos:", songData);
                return;
            }
            
            registeredSongs[songData.id] = songData;
            
            // Se esta for a música solicitada na URL, exibe-a
            if (window.location.hash === `#${songData.id}`) {
                showMusic(songData.id);
            }
        }
        
        // Função para exibir uma música específica
        function showMusic(musicId) {
            const container = document.getElementById('music-container');
            const song = registeredSongs[musicId];
            
            if (song) {
                // Limpa o container antes de renderizar
                container.innerHTML = '';
                
                // Cria a seção da música dinamicamente
                const { inputSection, outputSection } = createMusicSection(song);
                container.appendChild(inputSection);
                container.appendChild(outputSection);
                
                // Inicializa o controlador de música
                musicControllers[musicId] = new MusicController(musicId, song.abc);
                
                // Rola para a música
                document.getElementById(musicId)?.scrollIntoView();
            } else {
                container.innerHTML = `<p>Música não encontrada: ${musicId}</p>`;
            }
        }
        
        // Verifica o hash ao carregar a página
        window.addEventListener('DOMContentLoaded', () => {
            if (window.location.hash) {
                const musicId = window.location.hash.substring(1);
                if (registeredSongs[musicId]) {
                    showMusic(musicId);
                } else {
                    // Carrega o script específico se a música ainda não foi registrada
                    loadMusicScript(musicId);
                }
            }
        });
        
        // Função para carregar um script de música específico
        function loadMusicScript(musicId) {
            const script = document.createElement('script');
            script.src = `../../songs/${musicId}.js`;
            document.body.appendChild(script);
        }