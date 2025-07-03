// main.js - Sistema Completo de Gerenciamento de Partituras Musicais
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
    const fileTypeElement = document.getElementById('fileType');
    const audioPlayer = document.getElementById('audioPlayer');

    // Estado da aplicação
    let allMusicas = [];
    let filteredMusicas = [];
    let currentPdfUrl = '';
    const loadedScripts = new Set();
    let currentSelectedLevel = null;

    // ==================== FUNÇÕES PRINCIPAIS ====================

    // Inicialização do sistema
    async function init() {
        try {
            showLoading(true);
            setupInitialSelects();
            setupEventListeners();
            
            // Carrega o primeiro nível se existir
            if (window.nivel1) {
                await loadLevel(0, window.nivel1);
            }
            
            // Habilita a busca
            searchInput.disabled = false;
            
            // Pré-carrega todas as músicas disponíveis
            await scanAndLoadScriptsComMusicas();
        } catch (error) {
            console.error('Erro na inicialização:', error);
            showErrorMessage('Erro ao carregar partituras');
        } finally {
            showLoading(false);
        }
    }

    // Configura os selects iniciais
    function setupInitialSelects() {
        selects.forEach((select, index) => {
            if (select) {
                select.disabled = index > 0;
                select.innerHTML = '<option value="">Selecione...</option>';
            }
        });
    }

    // Configura os eventos
    function setupEventListeners() {
        // Eventos de mudança nos selects
        selects.forEach((select, index) => {
            if (select) {
                select.addEventListener('change', async () => {
                    try {
                        showLoading(true);
                        const nivelKey = `nivel${index + 1}`;
                        const data = window[nivelKey];
                        if (data) {
                            currentSelectedLevel = index;
                            await handleSelectChange(index, data);
                        }
                    } catch (error) {
                        console.error('Erro ao mudar nível:', error);
                        showErrorMessage('Erro ao carregar nível selecionado');
                    } finally {
                        showLoading(false);
                    }
                });
            }
        });

        // Evento de busca
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                handleSearch();
            });
        }

        // Eventos do PDF
        if (downloadBtn) downloadBtn.addEventListener('click', downloadPdf);
        if (printBtn) printBtn.addEventListener('click', printPdf);
    }

    // Carrega um nível específico
    async function loadLevel(levelIndex, data) {
        const select = selects[levelIndex];
        if (!select) return;

        select.innerHTML = '<option value="">Selecione...</option>';
        data.forEach((item, index) => {
            const option = new Option(item.nome, index);
            select.add(option);
        });
        select.disabled = false;
    }

    // ==================== FUNÇÕES DE GERENCIAMENTO ====================

    // Manipula a mudança de seleção
async function handleSelectChange(levelIndex, currentData) {
    const selectedIndex = selects[levelIndex].value;
    if (selectedIndex === '') return;

    await clearLevelsBelow(levelIndex);

    const selectedItem = currentData[selectedIndex];
    if (!selectedItem) return;

    // Carrega o script se necessário
    if (selectedItem.arquivo) {
        await loadScript(selectedItem.arquivo);
    }

    // Verifica se há músicas para mostrar
    if (window.musicas) {
        await renderMusicList(window.musicas);
        return;
    }

    // Verifica próximo nível
    const nextLevelIndex = levelIndex + 1;
    const nextLevelKey = `nivel${nextLevelIndex + 1}`;
    if (window[nextLevelKey]) {
        await loadLevel(nextLevelIndex, window[nextLevelKey]);
    }
}

    // Limpa os níveis abaixo do selecionado
    async function clearLevelsBelow(levelIndex) {
        for (let i = levelIndex + 1; i < selects.length; i++) {
            if (selects[i]) {
                selects[i].innerHTML = '<option value="">Selecione...</option>';
                selects[i].disabled = true;
            }
        }

        if (musicList) musicList.innerHTML = '';
        if (searchInput) searchInput.value = '';
        await hidePdfViewer();
    }

    // Carrega um script dinamicamente
async function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}
    // ==================== FUNÇÕES DE EXIBIÇÃO ====================

    // Renderiza a lista de músicas
async function renderMusicList(musicas) {
    if (!musicList) return;

    const searchTerm = searchInput?.value?.trim().toLowerCase() || '';
    filteredMusicas = await filterMusicas(musicas, searchTerm);

    musicList.innerHTML = '';

    if (filteredMusicas.length === 0) {
        const msg = searchTerm
            ? `Nenhuma partitura encontrada para "${searchInput.value}"`
            : 'Nenhuma partitura disponível';
        showInfoMessage(msg);
        return;
    }
        filteredMusicas.forEach(music => {
        if (!music) return;

        const fileExtension = music.file.split('.').pop().toLowerCase();
        const fileType = fileExtension === 'pdf' ? 'PDF' : 
                         fileExtension === 'mp3' ? 'MP3' :
                         fileExtension === 'mid' ? 'MIDI' :
                         fileExtension === 'abc' ? 'ABC' : fileExtension.toUpperCase();

        const div = document.createElement('div');
        div.className = 'music-item';
        div.innerHTML = `
            <div class="music-info">
                <strong>${music.name || 'Sem nome'}</strong>
                <div class="file-type">${fileType}</div>
                ${music.composer ? `<div class="music-meta">${music.composer}</div>` : ''}
                ${music.level ? `<div class="music-meta">Nível: ${music.level}</div>` : ''}
                ${music.reference ? `<div class="music-meta">Referência: ${music.reference}</div>` : ''}
            </div>
        `;
        div.addEventListener('click', () => showPdf(music.file));
        musicList.appendChild(div);
    });
}

    // Filtra músicas conforme termo de busca
    async function filterMusicas(musicas, term) {
        if (!musicas || !Array.isArray(musicas)) return [];
        if (!term) return musicas;
        
        return musicas.filter(m => {
            if (!m) return false;
            return (
                (m.name && m.name.toLowerCase().includes(term)) ||
                (m.composer && m.composer.toLowerCase().includes(term)) ||
                (m.level && m.level.toString().toLowerCase().includes(term)) ||
                (m.reference && m.reference.toLowerCase().includes(term))
            );
        });
    }

    // Manipula a busca
    async function handleSearch() {
        try {
            if (currentSelectedLevel !== null) {
                await renderMusicList(filteredMusicas);
            } else {
                await renderMusicList(allMusicas);
            }
        } catch (error) {
            console.error('Erro na busca:', error);
            showErrorMessage('Erro ao realizar busca');
        }
    }

    // Mostra o PDF
async function showPdf(url) {
    if (!url) return;
    
    try {
        currentPdfUrl = url;
        const fileExtension = url.split('.').pop().toLowerCase();
        
        // Esconder todos os visualizadores primeiro
        if (pdfViewer) pdfViewer.style.display = 'none';
        if (audioPlayer) audioPlayer.style.display = 'none';
        
        // Mostrar o visualizador apropriado
        switch(fileExtension) {
            case 'pdf':
                if (pdfViewer) {
                    pdfViewer.src = url;
                    pdfViewer.style.display = 'block';
                }
                fileTypeElement.textContent = 'Tipo: PDF';
                break;
            case 'mp3':
                if (audioPlayer) {
                    audioPlayer.src = url;
                    audioPlayer.style.display = 'block';
                }
                fileTypeElement.textContent = 'Tipo: MP3';
                break;
            case 'mid':
                fileTypeElement.textContent = 'Tipo: MIDI (Baixe para ouvir)';
                break;
            case 'abc':
                fileTypeElement.textContent = 'Tipo: ABC Notation (Baixe para visualizar)';
                break;
            default:
                fileTypeElement.textContent = 'Tipo: Desconhecido';
        }
        
        if (noPdfMessage) noPdfMessage.style.display = 'none';
        if (pdfActions) {
            pdfActions.style.display = 'flex';
            // Atualizar texto do botão conforme o tipo de arquivo
            downloadBtn.textContent = fileExtension === 'pdf' ? 'Baixar PDF' : 
                                     fileExtension === 'mp3' ? 'Baixar MP3' :
                                     fileExtension === 'mid' ? 'Baixar MIDI' :
                                     fileExtension === 'abc' ? 'Baixar ABC' : 'Baixar Arquivo';
        }
    } catch (error) {
        console.error('Erro ao carregar arquivo:', error);
        showErrorMessage('Erro ao carregar arquivo');
    }
}

    // Esconde o visualizador de PDF
async function hidePdfViewer() {
    if (pdfViewer) pdfViewer.style.display = 'none';
    if (audioPlayer) audioPlayer.style.display = 'none';
    if (noPdfMessage) noPdfMessage.style.display = 'block';
    if (pdfActions) pdfActions.style.display = 'none';
    if (fileTypeElement) fileTypeElement.textContent = '';
    currentPdfUrl = '';
}

    // ==================== FUNÇÕES UTILITÁRIAS ====================

    // Escaneia e carrega scripts que contêm músicas
    async function scanAndLoadScriptsComMusicas() {
        try {
            allMusicas = [];

            const scripts = Array.from(document.querySelectorAll('script[src]'));
            for (const script of scripts) {
                const src = script.getAttribute('src');
                if (!loadedScripts.has(src)) {
                    try {
                        await loadScript(src);
                    } catch {
                        console.warn('Erro ao carregar script:', src);
                    }
                }

                if (window.musicas && Array.isArray(window.musicas)) {
                    allMusicas = allMusicas.concat(window.musicas);
                    window.musicas = undefined;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar músicas:', error);
            throw error;
        }
    }

    // Download do PDF
    function downloadPdf() {
        if (!currentPdfUrl) return;
        const a = document.createElement('a');
        a.href = currentPdfUrl;
        a.download = currentPdfUrl.split('/').pop() || 'partitura.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // Impressão do PDF
    function printPdf() {
        if (!currentPdfUrl) return;
        const printWindow = window.open(currentPdfUrl, '_blank');
        if (printWindow) {
            printWindow.onload = function() {
                printWindow.print();
            };
        }
    }

    // Mostra mensagem de erro
    function showErrorMessage(message) {
        if (!musicList) return;
        musicList.innerHTML = `<div class="error-message">${message}</div>`;
    }

    // Mostra mensagem informativa
    function showInfoMessage(message) {
        if (!musicList) return;
        musicList.innerHTML = `<div class="info-message">${message}</div>`;
    }

    // Mostra/oculta indicador de carregamento
    function showLoading(show) {
        if (!loadingIndicator) return;
        loadingIndicator.style.display = show ? 'block' : 'none';
    }

    // ==================== FUNÇÕES DE DEBUG ====================

    // Verifica a estrutura de dados atual
    window.verificarEstrutura = function() {
        if (currentSelectedLevel === null) {
            console.log('Nenhum nível selecionado');
            return;
        }

        const nivelKey = `nivel${currentSelectedLevel + 1}`;
        const data = window[nivelKey];
        const selectedIndex = selects[currentSelectedLevel].value;
        const selectedItem = data[selectedIndex];

        console.group('Verificação de Estrutura');
        console.log('Nível atual:', nivelKey);
        console.log('Item selecionado:', selectedItem);
        
        if (selectedItem.arquivo) {
            console.log('Arquivo a carregar:', selectedItem.arquivo);
            console.log('Já carregado?', loadedScripts.has(selectedItem.arquivo));
        }
        
        console.log('Tem músicas diretamente?', !!selectedItem.musicas);
        console.log('window.musicas definido?', !!window.musicas);
        console.groupEnd();
    };

    // Mostra estado completo da aplicação
    window.debugApp = function() {
        console.group('Estado da Aplicação');
        console.log('Nível selecionado:', currentSelectedLevel);
        console.log('Total músicas carregadas:', allMusicas.length);
        console.log('Músicas filtradas:', filteredMusicas.length);
        console.log('PDF atual:', currentPdfUrl);
        console.log('Scripts carregados:', Array.from(loadedScripts));
        
        if (currentSelectedLevel !== null) {
            const nivelKey = `nivel${currentSelectedLevel + 1}`;
            console.log('Dados do nível atual:', window[nivelKey]);
        }
        
        console.groupEnd();
    };

    // Inicializa a aplicação
    await init();
});