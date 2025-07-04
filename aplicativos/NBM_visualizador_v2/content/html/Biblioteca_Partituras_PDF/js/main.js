//main3.js
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
    const resetFiltersBtn = document.getElementById('resetFiltersBtn'); // <--- NOVO ELEMENTO

    // Estado da aplicação
    let allMusicasLoadedFromScripts = [];
    let currentPdfUrl = '';
    const loadedScripts = new Set();
    let lastActiveLevelIndex = -1;
    let searchTimeout; // Variável para o debounce da busca

    // Chaves para o localStorage
    const STORAGE_KEY_LEVEL_SELECTIONS = 'nivelSelections';
    const STORAGE_KEY_SEARCH_TERM = 'searchTerm';
    const STORAGE_KEY_LAST_MEDIA = 'lastMedia';

    // --- FUNÇÕES PRINCIPAIS ---

    async function init() {
        try {
            showLoading(true);
            setupInitialSelects();
            setupEventListeners();

            await scanAndLoadAllMusicScripts();

            // Carrega o primeiro nível e tenta restaurar o estado
            if (window.nivel1) {
                populateSelect(selects[0], window.nivel1);
                restoreAppState();
            }

            searchInput.disabled = false;
            // Só mostra a mensagem inicial se nada foi restaurado ou se o campo de busca e selects estão vazios
            if (!searchInput.value.trim() && selects.every(s => s.value === '')) {
                showInfoMessage('Selecione uma categoria ou digite para pesquisar em todas as partituras.');
            }

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
                searchInput.value = ''; // Limpa o campo de busca ao mudar o select
                saveLevelSelections();
                await handleLevelSelectChange(index);
            });
        });

        // Evento de busca no campo de texto (com debounce)
        searchInput.addEventListener('input', () => {
            saveSearchTerm();
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterAndRenderMusicList();
            }, 300); // Atraso de 300ms antes de filtrar
        });

        // Evento para o novo botão "Limpar Tudo"
        resetFiltersBtn.addEventListener('click', resetAllFiltersAndViewer); // <--- NOVO LISTENER

        // Eventos dos botões de ação
        downloadBtn.addEventListener('click', downloadFile);
        printBtn.addEventListener('click', printFile);
    }

    // Popula um select com opções
    function populateSelect(selectElement, data) {
        selectElement.innerHTML = '<option value="">Selecione...</option>';
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                selectElement.add(new Option(item.nome, index));
            });
        }
        selectElement.disabled = false;
    }

    // --- LÓGICA DE FILTRAGEM E EXIBIÇÃO ---

    // Manipula a mudança de seleção nos selects de nível
    async function handleLevelSelectChange(currentSelectIndex, isRestoring = false) {
        if (!isRestoring) {
            showLoading(true);
        }
        
        const selectedValue = selects[currentSelectIndex].value;

        for (let i = currentSelectIndex + 1; i < selects.length; i++) {
            selects[i].innerHTML = '<option value="">Selecione...</option>';
            selects[i].disabled = true;
        }

        musicList.innerHTML = '';
        if (!isRestoring) {
            await hideMediaViewer();
        }

        if (selectedValue === '') {
            lastActiveLevelIndex = currentSelectIndex - 1;
            filterAndRenderMusicList();
            if (!isRestoring) {
                showLoading(false);
            }
            return;
        }

        lastActiveLevelIndex = currentSelectIndex;

        const currentLevelData = window[`nivel${currentSelectIndex + 1}`];
        const selectedItem = currentLevelData[parseInt(selectedValue)];

        if (!selectedItem) {
            showErrorMessage('Item de nível não encontrado.');
            if (!isRestoring) {
                showLoading(false);
            }
            return;
        }

        if (selectedItem.arquivo) {
            try {
                await loadScript(selectedItem.arquivo);
                if (window[`nivel${currentSelectIndex + 2}`]) {
                    populateSelect(selects[currentSelectIndex + 1], window[`nivel${currentSelectIndex + 2}`]);
                    // Se estiver restaurando, tenta restaurar o próximo nível
                    if (isRestoring && currentSelectIndex + 1 < selects.length) {
                        const savedSelections = JSON.parse(localStorage.getItem(STORAGE_KEY_LEVEL_SELECTIONS));
                        if (savedSelections && savedSelections[currentSelectIndex + 1] !== undefined) {
                            selects[currentSelectIndex + 1].value = savedSelections[currentSelectIndex + 1];
                            await handleLevelSelectChange(currentSelectIndex + 1, true); // Chamar recursivamente
                        }
                    }
                }
            } catch (error) {
                console.error(`Erro ao carregar script para ${selectedItem.nome}:`, error);
                showErrorMessage(`Erro ao carregar dados para "${selectedItem.nome}".`);
            }
        }

        filterAndRenderMusicList();
        if (!isRestoring) {
            showLoading(false);
        }
    }

    // Função unificada para filtrar e renderizar a lista de músicas
    function filterAndRenderMusicList() {
        let musicsToFilter = allMusicasLoadedFromScripts;
        let currentFilterTerm = '';

        // 1. APLICA FILTRO POR NÍVEL
        if (lastActiveLevelIndex !== -1 && selects[lastActiveLevelIndex].value !== '') {
            const currentLevelData = window[`nivel${lastActiveLevelIndex + 1}`];
            const selectedItem = currentLevelData[parseInt(selects[lastActiveLevelIndex].value)];

            if (selectedItem && selectedItem.nome) {
                const levelNameLower = selectedItem.nome.toLowerCase();
                currentFilterTerm = selectedItem.nome;
                
                musicsToFilter = allMusicasLoadedFromScripts.filter(m => {
                    const matchesComposer = m.composer && m.composer.toLowerCase().includes(levelNameLower);
                    const matchesLevelProperty = m.level && m.level.toLowerCase().includes(levelNameLower);
                    const matchesName = m.name && m.name.toLowerCase().includes(levelNameLower);
                    const matchesReference = m.reference && m.reference.toLowerCase().includes(levelNameLower);
                    const matchesInstrument = m.instrument && m.instrument.toLowerCase().includes(levelNameLower);
                    const matchesBook = m.book && m.book.toLowerCase().includes(levelNameLower);

                    const matchesAnyFileVersionPath = m.versions.some(v => v.file.toLowerCase().includes(levelNameLower));
                    
                    return matchesComposer || matchesLevelProperty || matchesName || matchesReference ||
                           matchesInstrument || matchesBook ||
                           matchesAnyFileVersionPath;
                });
            }
        }
        
        // 2. APLICA FILTRO POR TERMO DE BUSCA
        const searchTerm = searchInput.value.toLowerCase().trim();
        let finalFilteredMusicas = musicsToFilter;

        if (searchTerm) {
            currentFilterTerm = searchTerm;
            finalFilteredMusicas = musicsToFilter.filter(m =>
                (m.name && m.name.toLowerCase().includes(searchTerm)) ||
                (m.composer && m.composer.toLowerCase().includes(searchTerm)) ||
                (m.level && m.level.toLowerCase().includes(searchTerm)) ||
                (m.id && m.id.includes(searchTerm)) ||
                (m.reference && m.reference.toLowerCase().includes(searchTerm)) ||
                (m.instrument && m.instrument.toLowerCase().includes(searchTerm)) ||
                (m.book && m.book.toLowerCase().includes(searchTerm))
            );
        }

        // Renderiza os resultados ou a mensagem apropriada
        if (finalFilteredMusicas.length === 0) {
            const msg = currentFilterTerm
                ? `Nenhuma partitura encontrada para "${currentFilterTerm}".`
                : 'Nenhuma partitura disponível para este critério.';
            showInfoMessage(msg);
        } else {
            renderMusicListHtml(finalFilteredMusicas);
            musicList.scrollTop = 0; // Rola para o topo da lista após renderizar
        }
    }

    // Renderiza a lista de músicas no HTML
    function renderMusicListHtml(musicasToRender) {
        if (!musicList) return;

        musicList.innerHTML = musicasToRender.map(music => `
            <div class="music-item" data-music-id="${music.id}">
                <div class="music-info">
                    <strong>${music.name || 'Sem nome'}</strong> ${music.composer ? `<div class="composer">${music.composer}</div>` : ''}
                    ${music.reference ? `<div class="reference">Referência: ${music.reference}</div>` : ''}
                    ${music.level ? `<div class="level">Nível: ${music.level}</div>` : ''}
                    ${music.instrument ? `<div class="instrument">Instrumento: ${music.instrument}</div>` : ''}
                    ${music.book ? `<div class="book">Livro: ${music.book}</div>` : ''}
                    <div class="formats">${
                        music.versions.map(v =>
                            `<span class="file-badge ${v.type}"
                                data-file="${v.file}"
                                data-type="${v.type}"
                                data-music-id="${music.id}">
                                ${v.type.toUpperCase()}
                            </span>`
                        ).join(' ')
                    }</div>
                </div>
            </div>`
        ).join('');

        // Adiciona eventos aos badges para exibir a mídia
        document.querySelectorAll('.file-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                showMedia(
                    e.target.getAttribute('data-file'),
                    e.target.getAttribute('data-type')
                );
            });
        });

        // Após renderizar a lista, tente aplicar o destaque do último badge ativo
        const lastMedia = JSON.parse(localStorage.getItem(STORAGE_KEY_LAST_MEDIA));
        if (lastMedia && lastMedia.file && lastMedia.type) {
            const activeBadge = document.querySelector(`.file-badge[data-file="${lastMedia.file}"][data-type="${lastMedia.type}"]`);
            if (activeBadge) {
                activeBadge.classList.add('active');
            }
        }
    }

    // --- FUNÇÕES DE PERSISTÊNCIA ---

    function saveLevelSelections() {
        const selections = selects.map(select => select.value);
        localStorage.setItem(STORAGE_KEY_LEVEL_SELECTIONS, JSON.stringify(selections));
    }

    function saveSearchTerm() {
        localStorage.setItem(STORAGE_KEY_SEARCH_TERM, searchInput.value.trim());
    }

    function saveLastMedia(url, type) {
        localStorage.setItem(STORAGE_KEY_LAST_MEDIA, JSON.stringify({ file: url, type: type }));
    }

    async function restoreAppState() {
        const savedSelections = JSON.parse(localStorage.getItem(STORAGE_KEY_LEVEL_SELECTIONS));
        const savedSearchTerm = localStorage.getItem(STORAGE_KEY_SEARCH_TERM);
        const lastMedia = JSON.parse(localStorage.getItem(STORAGE_KEY_LAST_MEDIA));

        // Restaura o termo de busca
        if (savedSearchTerm) {
            searchInput.value = savedSearchTerm;
        }

        // Restaura as seleções de nível
        if (savedSelections && Array.isArray(savedSelections)) {
            // Tenta restaurar o primeiro select de nível
            if (savedSelections[0] !== undefined && selects[0]) {
                selects[0].value = savedSelections[0];
                if (savedSelections[0] !== '') {
                    // Chama handleLevelSelectChange para carregar e preencher os próximos selects recursivamente
                    await handleLevelSelectChange(0, true); 
                } else {
                    // Se o primeiro select estava vazio, apenas filtra o que tiver
                    filterAndRenderMusicList();
                }
            }
        }
        
        // Se houver uma mídia salva, tenta exibi-la após tudo ser filtrado e renderizado
        if (lastMedia && lastMedia.file && lastMedia.type) {
            // Um pequeno atraso garante que a lista de músicas esteja totalmente renderizada
            // antes de tentar aplicar o highlight e mostrar a mídia.
            setTimeout(() => {
                showMedia(lastMedia.file, lastMedia.type);
            }, 100); 
        }
    }

    // --- NOVA FUNÇÃO: RESETAR TUDO ---
    async function resetAllFiltersAndViewer() {
        showLoading(true);
        
        // 1. Resetar selects de nível
        selects.forEach((select, index) => {
            select.value = ''; // Define o valor para a opção "Selecione..."
            if (index > 0) { // Desabilita selects subsequentes
                select.disabled = true;
                select.innerHTML = '<option value="">Selecione...</option>';
            }
        });
        lastActiveLevelIndex = -1; // Reseta o índice ativo

        // 2. Limpar campo de busca
        searchInput.value = '';

        // 3. Esconder visualizador de mídia
        await hideMediaViewer();

        // 4. Limpar localStorage
        localStorage.removeItem(STORAGE_KEY_LEVEL_SELECTIONS);
        localStorage.removeItem(STORAGE_KEY_SEARCH_TERM);
        localStorage.removeItem(STORAGE_KEY_LAST_MEDIA);

        // 5. Refiltrar e renderizar a lista completa de músicas
        filterAndRenderMusicList();
        showInfoMessage('Filtros resetados. Selecione uma categoria ou digite para pesquisar em todas as partituras.');
        
        showLoading(false);
    }

    // --- FUNÇÕES DE UTILITÁRIAS ---

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
            script.onerror = (e) => {
                console.error(`Falha ao carregar script: ${src}`, e);
                reject(e);
            };
            document.head.appendChild(script);
        });
    }

    async function scanAndLoadAllMusicScripts() {
        try {
            let rawMusicas = [];
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
                        rawMusicas.push(...window.musicas);
                        window.musicas = undefined;
                    }
                } catch (error) {
                    console.warn(`Erro ao carregar script musical: ${src}. Pode não ter sido definido window.musicas ou o script não existe.`, error);
                }
            }
            allMusicasLoadedFromScripts = agruparMusicas(rawMusicas);
            console.log("Todas as músicas carregadas e agrupadas para o pool global. Total de músicas agrupadas:", allMusicasLoadedFromScripts.length);

        } catch (error) {
            console.error('Erro fatal ao escanear e carregar todos os scripts de música:', error);
            throw error;
        }
    }

    function agruparMusicas(musicasArray) {
        const musicasAgrupadas = {};
        musicasArray.forEach(musica => {
            const fileName = musica.file.split('/').pop();
            const idMatch = fileName.match(/^(\d+)/);
            const id = idMatch ? idMatch[1] : `ID_GEN_${musica.name || ''}_${musica.composer || ''}_${musica.file.split('/').pop().split('.')[0]}`.replace(/[^a-zA-Z0-9_]/g, '');

            if (!musicasAgrupadas[id]) {
                musicasAgrupadas[id] = {
                    id: id,
                    name: musica.name || 'Sem nome',
                    composer: musica.composer || 'Desconhecido',
                    level: musica.level || 'Não especificado',
                    reference: musica.reference || '',
                    instrument: musica.instrument || '',
                    book: musica.book || '',
                    versions: []
                };
            }
            
            const tipo = musica.file.split('.').pop().toLowerCase();
            if (!musicasAgrupadas[id].versions.some(v => v.file === musica.file)) {
                musicasAgrupadas[id].versions.push({
                    type: tipo,
                    file: musica.file
                });
            }
        });
        return Object.values(musicasAgrupadas);
    }


// Mostra PDF, MP3, MID ou ABC no visualizador
// Mostra PDF, MP3, MID ou ABC no visualizador
async function showMedia(url, type) {
    if (!url || !type) return;

    currentPdfUrl = url; // Mantendo o nome da variável, mas ela agora armazena qualquer URL de mídia
    fileTypeElement.textContent = `Tipo: ${type.toUpperCase()}`;

    // Esconde todos os visualizadores e ações por padrão antes de configurar
    pdfViewer.style.display = 'none';
    audioPlayer.style.display = 'none';
    noPdfMessage.style.display = 'none'; // Esconde a mensagem "Nenhum arquivo selecionado"
    pdfActions.style.display = 'none';   // Esconde os botões de ação inicialmente

    // Remove a classe 'active' de todos os badges
    document.querySelectorAll('.file-badge').forEach(badge => {
        badge.classList.remove('active');
    });

    // Lógica para exibir a mídia e ajustar os botões de ação e mensagens
    if (type === 'pdf') {
        pdfViewer.src = url;
        pdfViewer.style.display = 'block';
        pdfActions.style.display = 'flex'; // Mostra os botões
        downloadBtn.textContent = `Baixar PDF`;
        printBtn.textContent = `Imprimir PDF`; // Renomeado para Impressão
        printBtn.style.display = 'inline-block'; // Garante que o botão Imprimir aparece
    } else if (type === 'mp3') {
        audioPlayer.src = url;
        audioPlayer.load();
        // audioPlayer.play(); // REMOVA ESTA LINHA para que o MP3 não toque automaticamente
        audioPlayer.style.display = 'block'; // O próprio player já "visualiza"
        pdfActions.style.display = 'flex'; // Mostra os botões
        downloadBtn.textContent = `Baixar MP3`;
        printBtn.style.display = 'none'; // Esconde o botão de "Visualizar/Imprimir"
        noPdfMessage.style.display = 'none'; // Sem mensagem, pois o player já é a visualização
    } else if (type === 'mid') {
        // Para MID, apenas o botão de baixar
        noPdfMessage.innerHTML = `Nenhum visualizador disponível para MID. Clique em "Baixar" para abrir.`;
        noPdfMessage.style.display = 'block'; // Mostra a mensagem
        
        pdfActions.style.display = 'flex'; // Mostra os botões
        downloadBtn.textContent = `Baixar MID`;
        printBtn.style.display = 'none'; // Esconde o segundo botão
    } else if (type === 'abc') {
        // Para ABC, queremos "Baixar" e "Visualizar" (Abrir em nova aba/app externo)
        noPdfMessage.innerHTML = `Nenhum visualizador direto para ABC. Clique em "Visualizar" ou "Baixar".`;
        noPdfMessage.style.display = 'block'; // Mostra a mensagem
        
        pdfActions.style.display = 'flex'; // Mostra os botões
        downloadBtn.textContent = `Baixar ABC`;
        printBtn.textContent = `Visualizar ABC`; // Muda para "Visualizar"
        printBtn.style.display = 'inline-block'; // Garante que o botão Visualizar aparece
    } else {
        // Para tipos não suportados, mantém a mensagem padrão e apenas oferece o download
        console.warn('Tipo de arquivo não suportado para visualização direta:', type);
        noPdfMessage.innerHTML = `Visualização direta de ${type.toUpperCase()} não suportada. Baixe o arquivo.`; // Mensagem mais específica
        noPdfMessage.style.display = 'block';
        pdfActions.style.display = 'flex'; // Mostra os botões
        downloadBtn.textContent = `Baixar ${type.toUpperCase()}`;
        printBtn.style.display = 'none'; // Esconde o segundo botão
    }

    // Adiciona a classe 'active' ao badge clicado
    const activeBadge = document.querySelector(`.file-badge[data-file="${url}"][data-type="${type}"]`);
    if (activeBadge) {
        activeBadge.classList.add('active');
    }

    // Salva a última mídia visualizada
    saveLastMedia(url, type);
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

        // Remove a classe 'active' de todos os badges ao esconder o visualizador
        document.querySelectorAll('.file-badge').forEach(badge => {
            badge.classList.remove('active');
        });
        localStorage.removeItem(STORAGE_KEY_LAST_MEDIA);
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


// Ação para o segundo botão (Imprimir PDF / Visualizar ABC)
function printFile() {
    if (!currentPdfUrl) return; // currentPdfUrl agora é o URL da mídia atual
    const fileExtension = currentPdfUrl.split('.').pop().toLowerCase();

    if (fileExtension === 'pdf') {
        // Lógica de impressão direta para PDF
        const printWindow = window.open(currentPdfUrl, '_blank');
        if (printWindow) {
            printWindow.onload = function() {
                try {
                    printWindow.print();
                } catch (e) {
                    console.error('Erro ao tentar imprimir:', e);
                    alert('Não foi possível iniciar a impressão. Verifique as configurações do navegador ou tente baixar o arquivo.');
                }
            };
        }
    } else if (fileExtension === 'abc') {
        // Para ABC, apenas abre em uma nova aba (ação de "Visualizar")
        window.open(currentPdfUrl, '_blank');
    } 
    // MP3 e MID não chegam aqui, pois o printBtn está escondido para eles na showMedia
    // Se, por algum motivo, você quiser que "printFile" lide com um tipo não PDF/ABC,
    // adicione um 'else' aqui com uma mensagem ou uma chamada para downloadFile().
    // Por enquanto, não é necessário dada a nova lógica de showMedia.
}

    // Exibe mensagens de status na lista de músicas
    function showErrorMessage(message) {
        if (!musicList) return;
        musicList.innerHTML = `<div class="error-message">${message}</div>`;
        musicList.scrollTop = 0;
    }

    function showInfoMessage(message) {
        if (!musicList) return;
        musicList.innerHTML = `<div class="info-message">${message}</div>`;
        musicList.scrollTop = 0;
    }

    // Exibe/esconde indicador de carregamento
// ... seu JS existente ...

// Exibe/esconde indicador de carregamento
function showLoading(show) {
    if (!loadingIndicator) return;
    loadingIndicator.style.display = show ? 'flex' : 'none'; // <--- Mude de 'block' para 'flex' aqui
}

// ... o restante do seu JS ...

    // --- FUNÇÕES DE DEBUG ---
    window.verificarEstrutura = function() {
        console.group('Verificação de Estrutura');
        console.log('lastActiveLevelIndex:', lastActiveLevelIndex);
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
        console.log('PDF/Mídia atual:', currentPdfUrl);
        console.log('Scripts carregados:', Array.from(loadedScripts));
        console.log('LocalStorage - Seleções:', localStorage.getItem(STORAGE_KEY_LEVEL_SELECTIONS));
        console.log('LocalStorage - Termo Busca:', localStorage.getItem(STORAGE_KEY_SEARCH_TERM));
        console.log('LocalStorage - Última Mídia:', localStorage.getItem(STORAGE_KEY_LAST_MEDIA));
        console.groupEnd();
    };

    // Inicializa a aplicação quando o DOM estiver pronto
    init();
});
