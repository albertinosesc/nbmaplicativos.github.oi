document.addEventListener('DOMContentLoaded', async function () {
    // Elementos do DOM
    const selects = Array.from(document.querySelectorAll('[id^="nivel"]')).sort((a, b) =>
        parseInt(a.id.replace('nivel', '')) - parseInt(b.id.replace('nivel', ''))
    );
    const searchInput = document.getElementById('searchInput');
    const musicList = document.getElementById('musicList');
    const pdfViewer = document.getElementById('pdfViewer');
    const noPdfMessage = document.querySelector('.no-pdf');
    const pdfActions = document.querySelector('.pdf-actions');
    const downloadBtn = document.getElementById('downloadPdf');
    const printBtn = document.getElementById('printPdf');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const audioPlayer = document.getElementById('audioPlayer');
    const fileTypeElement = document.getElementById('fileType');

    // Estado da aplicação
    let allMusicasLoadedFromScripts = []; // Todas as músicas agrupadas carregadas dos scripts (para pesquisa global)
    let currentMusicasDisplaySource = []; // Músicas carregadas pelo SELECT de nível (ex: musicas de Beethoven)
    let currentPdfUrl = '';
    const loadedScripts = new Set(); // Para controlar scripts já carregados
    let lastActiveLevelIndex = -1; // Índice do último select de nível com uma seleção válida

    // ==================== FUNÇÕES PRINCIPAIS ====================

    async function init() {
        try {
            showLoading(true);
            setupInitialSelects();
            setupEventListeners();
            
            // Carrega todos os scripts de música na inicialização para o pool de pesquisa global
            await scanAndLoadAllMusicScripts();

            // Carrega o primeiro nível de selects
            if (window.nivel1) {
                populateSelect(selects[0], window.nivel1);
            }
            
            searchInput.disabled = false;
            showInfoMessage('Selecione uma categoria ou digite para pesquisar em todas as partituras.');

        } catch (error) {
            console.error('Erro na inicialização:', error);
            showErrorMessage('Erro ao iniciar o sistema. Tente novamente mais tarde.');
        } finally {
            showLoading(false);
        }
    }

    function setupInitialSelects() {
        selects.forEach((select, index) => {
            select.disabled = index > 0;
            select.innerHTML = '<option value="">Selecione...</option>';
        });
    }

    function setupEventListeners() {
        // Eventos de mudança nos selects de nível
        selects.forEach((select, index) => {
            select.addEventListener('change', async () => {
                await handleLevelSelectChange(index);
            });
        });

        // Evento de busca no campo de texto
        searchInput.addEventListener('input', () => {
            filterAndRenderMusicList();
        });

        // Eventos dos botões de ação
        downloadBtn.addEventListener('click', downloadFile);
        printBtn.addEventListener('click', printFile);
    }

    // Popula um select com opções
    function populateSelect(selectElement, data) {
        selectElement.innerHTML = '<option value="">Selecione...</option>';
        data.forEach((item, index) => {
            // Usamos o índice como valor porque seus itens não têm 'id'
            selectElement.add(new Option(item.nome, index)); 
        });
        selectElement.disabled = false;
    }

    // ==================== LÓGICA DE FILTRAGEM E EXIBIÇÃO ====================

    // Manipula a mudança de seleção nos selects de nível
    async function handleLevelSelectChange(currentSelectIndex) {
        showLoading(true);
        const selectedValue = selects[currentSelectIndex].value; // É o índice do item
        
        // Limpa selects subsequentes
        for (let i = currentSelectIndex + 1; i < selects.length; i++) {
            selects[i].innerHTML = '<option value="">Selecione...</option>';
            selects[i].disabled = true;
        }
        
        // Esconde visualizador de mídia e limpa lista de músicas
        musicList.innerHTML = '';
        await hideMediaViewer();
        currentMusicasDisplaySource = []; // Reseta a fonte de exibição de músicas

        if (selectedValue === '') {
            // Se "Selecione..." foi escolhido no select atual, resetamos os níveis abaixo e filtramos no pool principal
            lastActiveLevelIndex = currentSelectIndex - 1; // O nível anterior é o último ativo
            filterAndRenderMusicList();
            showLoading(false);
            return;
        }

        lastActiveLevelIndex = currentSelectIndex; // Atualiza o índice do último select ativo

        const currentLevelData = window[`nivel${currentSelectIndex + 1}`];
        const selectedItem = currentLevelData[parseInt(selectedValue)]; // O item selecionado
        
        if (!selectedItem) {
            showErrorMessage('Item de nível não encontrado.');
            showLoading(false);
            return;
        }

        // Se o item selecionado tem um 'arquivo' (script de músicas ou próximo nível)
        if (selectedItem.arquivo) {
            try {
                await loadScript(selectedItem.arquivo);
                
                // Se o script carregou 'window.musicas' (músicas diretas para este item)
                if (window.musicas && Array.isArray(window.musicas)) {
                    currentMusicasDisplaySource = agruparMusicas(window.musicas); // Agrupa as músicas recém-carregadas
                    window.musicas = undefined; // Limpa window.musicas para o próximo carregamento
                } 
                // Se o script carregou um 'nivelX' (próximo nível de selects)
                else if (window[`nivel${currentSelectIndex + 2}`]) {
                    populateSelect(selects[currentSelectIndex + 1], window[`nivel${currentSelectIndex + 2}`]);
                    currentMusicasDisplaySource = []; // Nenhuma música direta ainda
                } else {
                    // Script carregado, mas sem window.musicas ou próximo nível. Pode ser um script vazio ou de configuração.
                    currentMusicasDisplaySource = []; 
                }
            } catch (error) {
                console.error(`Erro ao carregar script para ${selectedItem.nome}:`, error);
                showErrorMessage(`Erro ao carregar dados para "${selectedItem.nome}".`);
                currentMusicasDisplaySource = [];
            }
        } else {
            // Se o item não tem um 'arquivo', mas há um próximo nível globalmente definido (não carregado via arquivo)
            const nextLevelData = window[`nivel${currentSelectIndex + 2}`];
            if (nextLevelData) {
                 // Popula o próximo select, filtrando pelo 'nome' do item pai, se aplicável
                 // NOTE: Seu nivel2.js não tem 'pai', então ele simplesmente carrega todas as opções de nivel2
                 // Se você quiser filtragem aqui, precisaria de 'pai' nos seus dados de nível.
                populateSelect(selects[currentSelectIndex + 1], nextLevelData);
            }
            currentMusicasDisplaySource = []; // Nenhuma música direta ainda
        }
        
        filterAndRenderMusicList(); // Aplica o filtro de texto ao que foi carregado/determinado
        showLoading(false);
    }

    // Função unificada para filtrar e renderizar a lista de músicas
    function filterAndRenderMusicList() {
        let musicsToProcess = [];

        // Determine a base para a filtragem:
        // 1. Se músicas foram carregadas por um select de nível (currentMusicasDisplaySource tem prioridade)
        if (currentMusicasDisplaySource.length > 0) {
            musicsToProcess = currentMusicasDisplaySource;
        } 
        // 2. Senão, se estamos em um nível "pai" sem um script de músicas, ou no início (pool principal)
        else {
            // Se um item de nível foi selecionado e ele não carregou músicas diretas,
            // então filtramos do allMusicasLoadedFromScripts pelo "nome" desse nível.
            if (lastActiveLevelIndex !== -1) {
                const selectedLevelData = window[`nivel${lastActiveLevelIndex + 1}`][parseInt(selects[lastActiveLevelIndex].value)];
                if (selectedLevelData && selectedLevelData.nome) {
                    musicsToProcess = allMusicasLoadedFromScripts.filter(m => 
                        m.composer && m.composer.toLowerCase().includes(selectedLevelData.nome.toLowerCase()) || // Busca por compositor
                        m.level && m.level.toLowerCase().includes(selectedLevelData.nome.toLowerCase()) // Busca por nível
                        // Adicione mais condições se o "nome" do nível puder ser outras propriedades da música
                    );
                } else {
                    musicsToProcess = allMusicasLoadedFromScripts; // Default para todas se não puder filtrar por nome
                }
            } else {
                musicsToProcess = allMusicasLoadedFromScripts; // Quando nenhum nível está selecionado
            }
        }

        // Aplica filtro por termo de busca
        const searchTerm = searchInput.value.toLowerCase().trim();
        let finalFilteredMusicas = musicsToProcess;

        if (searchTerm) {
            finalFilteredMusicas = musicsToProcess.filter(m =>
                (m.name && m.name.toLowerCase().includes(searchTerm)) ||
                (m.composer && m.composer.toLowerCase().includes(searchTerm)) ||
                (m.level && m.level.toLowerCase().includes(searchTerm)) ||
                (m.id && m.id.includes(searchTerm)) || // Verifica se m.id existe antes de usar
                (m.reference && m.reference.toLowerCase().includes(searchTerm))
            );
        }

        // Renderiza os resultados ou a mensagem apropriada
        if (finalFilteredMusicas.length === 0) {
            const msg = searchTerm
                ? `Nenhuma partitura encontrada para "${searchInput.value}"`
                : 'Nenhuma partitura disponível para este critério.';
            showInfoMessage(msg);
        } else {
            renderMusicListHtml(finalFilteredMusicas);
        }
    }

    // Renderiza a lista de músicas no HTML
// ... (código anterior)

    // Renderiza a lista de músicas no HTML
    function renderMusicListHtml(musicasToRender) {
        if (!musicList) return;

        musicList.innerHTML = musicasToRender.map(music => `
            <div class="music-item">
                <div class="music-info">
                    <strong>${music.name || 'Sem nome'} -</strong>
                    ${music.composer ? `<div class="composer">${music.composer}</div>` : ''}
                    ${music.reference ? `<div class="reference">Referência: ${music.reference}</div>` : ''} ${music.level ? `<div class="level">Nível: ${music.level}</div>` : ''} <div class="formats">${
                        music.versions.map(v =>
                            `<span class="file-badge ${v.type}"
                                data-file="${v.file}"
                                data-type="${v.type}">
                                ${v.type.toUpperCase()}
                            </span>`
                        ).join(' ')
                    }</div>
                </div>
            </div>`
        ).join('');

        // Adiciona eventos aos badges
        document.querySelectorAll('.file-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation(); 
                showMedia(
                    e.target.getAttribute('data-file'),
                    e.target.getAttribute('data-type')
                );
            });
        });
    }

// ... (restante do seu código main.js)
    // ==================== FUNÇÕES DE UTALITÁRIAS ====================

    // Carrega um script dinamicamente
    async function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (loadedScripts.has(src)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => {
                loadedScripts.add(src);
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Escaneia e carrega todos os scripts que contêm músicas para o pool global
    async function scanAndLoadAllMusicScripts() {
        try {
            allMusicasLoadedFromScripts = []; // Reseta o pool global
            const musicScriptSources = [
                'js/todaspartituraspdf.js',
                'js/todaspartiturasmp3.js',
                'js/todaspartiturasmid.js',
                'js/todaspartiturasabc.js'
            ];

            for (const src of musicScriptSources) {
                try {
                    await loadScript(src);
                    if (window.musicas && Array.isArray(window.musicas)) {
                        allMusicasLoadedFromScripts.push(...agruparMusicas(window.musicas));
                        window.musicas = undefined; // Limpa para o próximo script
                    }
                } catch (error) {
                    console.warn(`Erro ao carregar script musical: ${src}`, error);
                }
            }
        } catch (error) {
            console.error('Erro ao escanear e carregar todos os scripts de música:', error);
            throw error;
        }
    }
    
    // Agrupa músicas por ID para evitar duplicatas e gerenciar versões
    function agruparMusicas(musicasArray) {
        const musicasAgrupadas = {};
        musicasArray.forEach(musica => {
            const fileName = musica.file.split('/').pop();
            const idMatch = fileName.match(/^(\d+)/); // Pega números no início do nome do arquivo
            const id = idMatch ? idMatch[1] : 'UNKNOWN_ID'; // Fallback para ID se não encontrar

            if (!musicasAgrupadas[id]) {
                musicasAgrupadas[id] = {
                    id: id,
                    name: musica.name || 'Sem nome',
                    composer: musica.composer || 'Desconhecido',
                    level: musica.level || 'Não especificado',
                    reference: musica.reference || '',
                    versions: []
                };
            }
            
            const tipo = musica.file.split('.').pop().toLowerCase();
            musicasAgrupadas[id].versions.push({
                type: tipo,
                file: musica.file
            });
        });
        return Object.values(musicasAgrupadas);
    }

    // Mostra PDF ou MP3
    async function showMedia(url, type) {
        if (!url || !type) return;
        
        currentPdfUrl = url;
        fileTypeElement.textContent = `Tipo: ${type.toUpperCase()}`;
        
        pdfViewer.style.display = 'none';
        audioPlayer.style.display = 'none';

        if (type === 'pdf') {
            pdfViewer.src = url;
            pdfViewer.style.display = 'block';
        } else if (type === 'mp3') {
            audioPlayer.src = url;
            audioPlayer.load();
            audioPlayer.play();
            audioPlayer.style.display = 'block';
        } else {
            console.warn('Tipo de arquivo não suportado para visualização direta:', type);
        }
        
        noPdfMessage.style.display = 'none';
        pdfActions.style.display = 'flex';
        downloadBtn.textContent = `Baixar ${type.toUpperCase()}`;
        printBtn.textContent = `Imprimir ${type.toUpperCase()}`;
    }

    // Esconde visualizador de mídia
    async function hideMediaViewer() {
        pdfViewer.style.display = 'none';
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer.src = '';
            audioPlayer.style.display = 'none';
        }
        noPdfMessage.style.display = 'block';
        pdfActions.style.display = 'none';
        currentPdfUrl = '';
        fileTypeElement.textContent = 'Tipo: N/A';
    }

    // Download do arquivo
    function downloadFile() {
        if (!currentPdfUrl) return;
        const a = document.createElement('a');
        a.href = currentPdfUrl;
        a.download = currentPdfUrl.split('/').pop() || 'arquivo';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Impressão do arquivo
    function printFile() {
        if (!currentPdfUrl) return;
        const fileExtension = currentPdfUrl.split('.').pop().toLowerCase();
        if (fileExtension === 'pdf') {
            const printWindow = window.open(currentPdfUrl, '_blank');
            if (printWindow) {
                printWindow.onload = function() {
                    printWindow.print();
                };
            }
        } else {
            alert(`A função de impressão direta é suportada apenas para arquivos PDF. Tipo atual: ${fileExtension.toUpperCase()}.`);
            window.open(currentPdfUrl, '_blank');
        }
    }

    // Exibe mensagens de status
    function showErrorMessage(message) {
        if (!musicList) return;
        musicList.innerHTML = `<div class="error-message">${message}</div>`;
    }

    function showInfoMessage(message) {
        if (!musicList) return;
        musicList.innerHTML = `<div class="info-message">${message}</div>`;
    }

    function showLoading(show) {
        if (!loadingIndicator) return;
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    // ==================== FUNÇÕES DE DEBUG ====================

    window.verificarEstrutura = function() {
        console.group('Verificação de Estrutura');
        console.log('lastActiveLevelIndex:', lastActiveLevelIndex);
        console.log('currentMusicasDisplaySource (Músicas carregadas pelo SELECT de nível):', currentMusicasDisplaySource.length, currentMusicasDisplaySource);
        console.log('allMusicasLoadedFromScripts (Todas as músicas do pool principal):', allMusicasLoadedFromScripts.length, allMusicasLoadedFromScripts);
        console.log('Termo de busca:', searchInput.value.trim());

        if (lastActiveLevelIndex !== -1) {
            const currentSelect = selects[lastActiveLevelIndex];
            if (currentSelect && currentSelect.value !== '') {
                 const currentLevelData = window[`nivel${lastActiveLevelIndex + 1}`];
                 const selectedItem = currentLevelData[parseInt(currentSelect.value)];
                 console.log('Item de nível selecionado atualmente:', selectedItem);
            } else {
                console.log('Nível ativo, mas select vazio.');
            }
        } else {
            console.log('Nenhum nível está ativamente selecionado.');
        }
        
        console.log('Scripts carregados:', Array.from(loadedScripts));
        console.groupEnd();
    };

    window.debugApp = function() {
        console.group('Estado da Aplicação Completo');
        console.log('lastActiveLevelIndex:', lastActiveLevelIndex);
        console.log('Total músicas carregadas (allMusicasLoadedFromScripts):', allMusicasLoadedFromScripts.length);
        console.log('Músicas para exibição atual (currentMusicasDisplaySource):', currentMusicasDisplaySource.length);
        console.log('PDF/Mídia atual:', currentPdfUrl);
        console.log('Scripts carregados:', Array.from(loadedScripts));
        console.groupEnd();
    };

    // Inicializa a aplicação
    init();
});
