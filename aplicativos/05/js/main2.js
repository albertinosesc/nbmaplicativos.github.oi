// ============================================
// main.js - PRO MAESTRO
// ============================================

// Variáveis
let dados = {
    listas: []
};

let listaAtual = null;
let cartaoAtual = null;
let timeoutRenderTimer;
let coresAtivas = true;
let expandedPaths = new Set();

const STORAGE_KEY = 'pro_maestro_listas';
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const listaAulas = document.getElementById('listaAulas');

// ============================================
// FUNÇÃO DE TELA CHEIA (CORREÇÃO)
// ============================================
function toggleFullscreenPreview() {
    const previewElement = document.getElementById('preview');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Entrar em tela cheia
        if (previewElement.requestFullscreen) {
            previewElement.requestFullscreen();
        } else if (previewElement.webkitRequestFullscreen) { /* Safari */
            previewElement.webkitRequestFullscreen();
        } else if (previewElement.msRequestFullscreen) { /* IE/Edge */
            previewElement.msRequestFullscreen();
        }
        if (fullscreenBtn) {
            fullscreenBtn.textContent = '✖';
            fullscreenBtn.style.background = '#e94560';
        }
    } else {
        // Sair da tela cheia
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
        if (fullscreenBtn) {
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.style.background = '#00CC00';
        }
    }
}

// Detectar quando sair da tela cheia (ESC)
document.addEventListener('fullscreenchange', function() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (!document.fullscreenElement && fullscreenBtn) {
        fullscreenBtn.textContent = '⛶';
        fullscreenBtn.style.background = '#00CC00';
    }
});
document.addEventListener('webkitfullscreenchange', function() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (!document.webkitFullscreenElement && fullscreenBtn) {
        fullscreenBtn.textContent = '⛶';
        fullscreenBtn.style.background = '#00CC00';
    }
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function obterChaveDoCaminho(caminho) {
    return caminho.join('-');
}

function obterListaPorCaminho(caminho) {
    if (!caminho || caminho.length === 0) return null;
    let atual = dados.listas[caminho[0]];
    for (let i = 1; i < caminho.length; i++) {
        if (!atual || !atual.sublistas) return null;
        atual = atual.sublistas[caminho[i]];
    }
    return atual;
}

function obterDadosPadrao() {
    return {
        listas: [
            {
                nome: "Piano",
                cards: [
                    {texto: "Escala de Dó Maior", conteudo: "# Escala de Dó Maior\n\n[PIANO:C]Dó Maior[/PIANO]\n\n[ABC]\nX:1\nM:4/4\nL:1/8\nK:C\nC DEF | GAB c |]\n[/ABC]", ultimaModificacao: Date.now() },
                    { texto: "Acordes Básicos", conteudo: "# Acordes Básicos\n\n[PIANO:C]Dó Maior[/PIANO]\n[PIANO:G]Sol Maior[/PIANO]\n[PIANO:Am]Lá Menor[/PIANO]", ultimaModificacao: Date.now() }
                ],
                sublistas: [
                    {
                        nome: "Exercícios",
                        cards: [
                            { texto: "Hanon 1", conteudo: "# Hanon 1\n\nExercício para dedos.", ultimaModificacao: Date.now() }
                        ],
                        sublistas: []
                    }
                ]
            },
            {
                nome: "Violão",
                cards: [
                    { texto: "Acordes Iniciantes", conteudo: "# Acordes Iniciantes\n\n[Acorde:C]Dó Maior[/Acorde]\n[Acorde:G]Sol Maior[/Acorde]\n[Acorde:Am]Lá Menor[/Acorde]", ultimaModificacao: Date.now() }
                ],
                sublistas: []
            },
            {
                nome: "Teoria Musical",
                cards: [
                    { texto: "Partitura Infantil", conteudo: "# Partitura Colorida\n\n[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/4\nK:C\nC DEF | GAB c |]\nw: Dó Ré Mi Fá Sol Lá Si Dó\n[/ABC-INFANTIL]", ultimaModificacao: Date.now() }
                ],
                sublistas: []
            }
        ]
    };
}

// ============================================
// FUNÇÃO PARA SALVAR ACORDE DINÂMICO NA BIBLIOTECA
// ============================================

function salvarAcordeDinamicoNaBiblioteca() {
    const formato = prompt(
        '💾 SALVAR ACORDE DINÂMICO NA BIBLIOTECA\n\n' +
        'Digite o formato do acorde sonoro que você quer salvar:\n\n' +
        'Exemplo: 1;3 (Sol Maior)\n' +
        'Exemplo: 2;5 (Lá Menor)\n\n' +
        'Formato:'
    );
    
    if (!formato) return;
    
    const convertido = converterDinamicoParaEditavel(formato);
    if (!convertido) return;
    
    // Pergunta se quer personalizar o nome
    const novoNome = prompt(`Nome do acorde na biblioteca (ou Enter para manter "${convertido.nome}"):`, convertido.nome);
    if (novoNome && novoNome.trim()) {
        convertido.acorde.nome = novoNome.trim();
        convertido.linha = convertido.linha.replace(convertido.nome, novoNome.trim());
    }
    
    // Salva diretamente na biblioteca
    if (typeof bibliotecaAcordes !== 'undefined') {
        // Extrai dados da linha
        const partes = convertido.linha.split('/').map(p => p.trim());
        const siglaNome = partes[0];
        const doisPontos = siglaNome.indexOf(':');
        const sigla = siglaNome.substring(0, doisPontos).trim();
        
        // Salva na biblioteca
        bibliotecaAcordes[sigla] = {
            nome: convertido.acorde.nome,
            cordas: convertido.acorde.cordas,
            dedos: convertido.acorde.dedos,
            pestana: convertido.acorde.pestanaCordas || convertido.acorde.pestana || false,
            casaInicial: convertido.acorde.casaInicial,
            baixo: convertido.acorde.baixo || sigla
        };
        
        // Salva no localStorage
        localStorage.setItem('biblioteca_acordes', JSON.stringify(bibliotecaAcordes));
        
        // Atualizar visualização
        if (typeof atualizarBibliotecaVisual === 'function') {
            atualizarBibliotecaVisual();
        }
        
        alert(`✅ Acorde "${sigla}" salvo na biblioteca!\n\nUse [Acorde:${sigla}] no editor.`);
    } else {
        alert('Erro: biblioteca de acordes não disponível');
    }
}

// Adicionado um botão na barra lateral para salvar acorde sonoro
function adicionarBotaoSalvarDinamico() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        const btn = document.createElement('button');
        btn.innerHTML = '🔄 Conversor Dinâmico';
        btn.style.background = '#9b59b6';
        btn.style.marginTop = '10px';
        btn.onclick = salvarAcordeDinamicoNaBiblioteca;
        
        // Insere depois do botão "Editor de Acordes"
        const editorBtn = document.querySelector('#sidebar button[onclick="abrirEditorAcordes()"]');
        if (editorBtn) {
            editorBtn.insertAdjacentElement('afterend', btn);
        } else {
            sidebar.querySelector('.sidebar-content')?.appendChild(btn);
        }
    }
}

function inserirCodigoAcorde(codigo) {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + codigo + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

// ============================================
// CONVERTER ACORDE DINÂMICO PARA EDITÁVEL
// ============================================

// Função para converter acorde sonoro em formato editável
function converterDinamicoParaEditavel(formato) {
    if (typeof window.processarAcordeDinamico !== 'function') {
        alert('Módulo de acordes sonoros não carregado!');
        return null;
    }
    
    const acorde = window.processarAcordeDinamico(formato, '');
    if (!acorde) {
        alert(`Formato "${formato}" inválido!`);
        return null;
    }
    
    // Gera uma linha no formato que o editor entende
    const pestanaStr = acorde.pestana ? (Array.isArray(acorde.pestanaCordas) && acorde.pestanaCordas.length > 0
        ? JSON.stringify(acorde.pestanaCordas)
        : 'true') : 'false';
    
    const cordasStr = acorde.cordas.join(',');
    const dedosStr = acorde.dedos.join(',');
    
    // Formato: SIGLA: NOME / CORDAS / DEDOS / PESTANA / CASA_INICIAL / BAIXO
    const linha = `${formato}: ${acorde.nome} / ${cordasStr} / ${dedosStr} / ${pestanaStr} / ${acorde.casaInicial} / ${acorde.baixo || ''}`;
    
    return {
        linha: linha,
        acorde: acorde,
        formato: formato,
        nome: acorde.nome
    };
}

// Função para abrir editor com acorde sonoro
function editarAcordeDinamico() {
    const formato = prompt(
        '🎸 EDITAR ACORDE DINÂMICO\n\n' +
        'Digite o formato do acorde sonoro que você quer editar:\n\n' +
        'Exemplos:\n' +
        '• 1;3 = Sol Maior\n' +
        '• 2;5 = Lá Menor\n' +
        '• 1;3;5 = Dó Maior (corda base 5)\n\n' +
        'Formato:'
    );
    
    if (!formato) return;
    
    const convertido = converterDinamicoParaEditavel(formato);
    if (!convertido) return;
    
    // Abre o editor com o acorde convertido
    abrirEditorAcordesComDados(convertido.linha, convertido.nome);
}

// Função para abrir editor com dados pré-preenchidos
function abrirEditorAcordesComDados(linha, nomeSugerido) {
    const modal = document.getElementById('modalAcordes');
    if (!modal) {
        alert('Editor de acordes não encontrado!');
        return;
    }
    
    // Abre o modal
    if (typeof carregarBiblioteca === 'function') carregarBiblioteca();
    modal.style.display = 'block';
    
    // Preenche o campo de texto
    const inputField = document.getElementById('acordeInput');
    if (inputField) {
        inputField.value = linha;
    }
    
    // Foca no campo
    setTimeout(() => {
        if (inputField) {
            inputField.focus();
            inputField.select();
        }
    }, 100);
    
    // Pré-visualização gerada automaticamente
    setTimeout(() => {
        if (typeof gerarPreviewAcordes === 'function') {
            gerarPreviewAcordes();
        }
    }, 200);
    
    alert(`✅ Acorde dinâmico convertido!\n\nAgora você pode editar e salvar na biblioteca.`);
}

function desenharAcorde(container, sigla, nomeParam = '') {
    let acorde = null;
    let nomeExibido = nomeParam || sigla;
    
    // FORÇAR O C1 A NÃO MOSTRAR NÚMERO
    if (sigla === 'C1') {
        // Busca direta no ACORDES original
        if (typeof ACORDES !== 'undefined' && ACORDES['C1']) {
            acorde = {...ACORDES['C1']};
            acorde.posicao = null;
            acorde.mostrarNumero = false;
            nomeExibido = acorde.nome;
        }
    }
    
    // 1️⃣ Busca do acorde (Biblioteca ou Dinâmico) NORMAL
    if (!acorde && typeof ACORDES !== 'undefined' && ACORDES[sigla]) {
        acorde = ACORDES[sigla];
        nomeExibido = acorde.nome;
    } else if (!acorde && typeof bibliotecaAcordes !== 'undefined' && bibliotecaAcordes[sigla]) {
        acorde = bibliotecaAcordes[sigla];
        nomeExibido = acorde.nome;
    } else if (!acorde && typeof window.processarAcordeDinamico === 'function') {
        const acordeDinamico = window.processarAcordeDinamico(sigla, nomeExibido);
        if (acordeDinamico) {
            acorde = acordeDinamico;
            nomeExibido = acorde.nome;
        }
    }
    
    if (!acorde) {
        container.innerHTML = `<div style="color:red; padding:10px;">❌ Acorde "${sigla}" não encontrado</div>`;
        return;
    }
    
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative; display:inline-block; text-align:center; margin:20px 10px;';
    
    const cifraDiv = document.createElement('div');
    cifraDiv.textContent = nomeExibido;
    cifraDiv.style.cssText = 'position:absolute; top:-3px; left:50%; transform:translateX(-50%); font-size:25px; font-weight:bold; color:#e94560; background:white; padding:0px 8px; border-radius:20px; white-space:nowrap;';
    wrapper.appendChild(cifraDiv);
    
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    canvas.height = 190;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const startX = 28, startY = 45, stringSpacing = 18, fretSpacing = 26;
    const numFrets = 5;
    
    // Desenha cordas
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(startX + i * stringSpacing, startY);
        ctx.lineTo(startX + i * stringSpacing, startY + numFrets * fretSpacing);
        ctx.stroke();
    }
    
    // Desenha trastes
    for (let i = 0; i <= numFrets; i++) {
        ctx.beginPath();
        ctx.moveTo(startX, startY + i * fretSpacing);
        ctx.lineTo(startX + 5 * stringSpacing, startY + i * fretSpacing);
        ctx.stroke();
    }
    
    // ========== PESTANA (declarar as variáveis PRIMEIRO) ==========
    const temPestana = acorde.pestana && acorde.pestanaCordas && acorde.pestanaCordas.length > 0;
    const casaInicialVal = acorde.casaInicial || 1;
    const casaBase = acorde.pestanaCasa || acorde.casaInicial || 1;
    const posicao = acorde.posicao || casaBase;
    const mostrarNumero = acorde.mostrarNumero !== false;
    
    let cordasNaPestana = [];
    
if (temPestana) {
    cordasNaPestana = acorde.pestanaCordas;
    // Pega a casa da pestana (padrão: 1)
    const casaPestana = acorde.pestanaCasa || acorde.casaInicialParaPestana || 1;
    // Calcula a posição Y baseada na casa da pestana
    const pestanaY = startY + (casaPestana - 1) * fretSpacing + (fretSpacing / 2);
    const primeiraCorda = Math.min(...cordasNaPestana);
    const ultimaCorda = Math.max(...cordasNaPestana);
    
    const xInicio = startX + primeiraCorda * stringSpacing - 2;
    const xFim = startX + ultimaCorda * stringSpacing + 2;
    
    ctx.beginPath();
    ctx.moveTo(xInicio, pestanaY);
    ctx.lineTo(xFim, pestanaY);
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2c3e50';
    ctx.stroke();
}

// ========== NÚMERO LATERAL ==========
let numeroMostrar = null;
let textoMostrar = null;

if (acorde.mostrarPosicao === true && acorde.posicao) {
    // Para acordes dinâmicos com posição definida
    numeroMostrar = acorde.posicao;           // posição (casa onde o número fica)
    textoMostrar = acorde.textoPosicao || (acorde.posicao + 'ª'); // texto a mostrar
} else if (mostrarNumero && temPestana) {
    // Para acordes normais com pestana
    numeroMostrar = acorde.pestanaCasa || acorde.casaInicial || 1;
    textoMostrar = numeroMostrar + 'ª';
}

if (numeroMostrar !== null && textoMostrar !== null && acorde.mostrarNumero !== false) {
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#333';
    const yPos = startY + (numeroMostrar - 1) * fretSpacing + fretSpacing / 2 + 2;
    ctx.fillText(textoMostrar, startX - 28, yPos);
}

    
    // ========== DESENHAR NOTAS (BOLINHAS) ==========
    ctx.lineWidth = 1.5;
    acorde.cordas.forEach((casa, i) => {
        const x = startX + i * stringSpacing;
        const casaRelativa = casa - casaBase + 1;
        
        const estaNaPestana = temPestana && cordasNaPestana.includes(i) && casa === casaBase;
        
        if (casa === 0) {
            const y = startY - 10;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.strokeStyle = '#333';
            ctx.stroke();
        }
        else if (casa === -1) {
            const y = startY - 10;
            ctx.strokeStyle = '#e94560';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4);
            ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4);
            ctx.stroke();
            ctx.lineWidth = 1.5;
        }
        else if (casa > 0 && casaRelativa > 0 && casaRelativa <= numFrets) {
            if (!estaNaPestana) {
                const y = startY + (casaRelativa - 1) * fretSpacing + fretSpacing / 2;
                
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = '#1a1a2e';
                ctx.fill();
                
                const dedo = (acorde.dedos && acorde.dedos[i]) ? acorde.dedos[i] : '';
                if (dedo) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 11px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(dedo, x, y);
                }
            }
        }
    });
    
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);
}

// ============================================
// FUNÇÕES DE SALVAR E CARREGAR
// ============================================
function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    renderizarListaAulas();
    console.log("💾 Dados salvos");
}

function carregarDados() {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
        try {
            dados = JSON.parse(localData);
            console.log("✅ Dados carregados:", dados.listas.length, "listas");
        } catch(e) {
            console.error("Erro ao carregar:", e);
            dados = obterDadosPadrao();
        }
    } else {
        dados = obterDadosPadrao();
        console.log("📁 Dados padrão carregados");
    }
    renderizarListaAulas();
    if (dados.listas.length > 0 && dados.listas[0].cards.length > 0) {
        carregarAula(0, 0);
    }
}

// ============================================
// RENDERIZAR LISTA DE AULAS (SIDEBAR)
// ============================================
function renderizarListaAulas() {
    if (!listaAulas) return;
    listaAulas.innerHTML = '';
    
    const novaListaBtn = document.createElement('button');
    novaListaBtn.textContent = '+ Nova Lista';
    novaListaBtn.style.background = '#e94560';
    novaListaBtn.style.marginBottom = '15px';
    novaListaBtn.style.width = '100%';
    novaListaBtn.style.padding = '10px';
    novaListaBtn.style.cursor = 'pointer';
    novaListaBtn.style.border = 'none';
    novaListaBtn.style.borderRadius = '5px';
    novaListaBtn.style.color = 'white';
    novaListaBtn.style.fontWeight = 'bold';
    novaListaBtn.onclick = () => criarLista(null);
    listaAulas.appendChild(novaListaBtn);
    
    if (!dados.listas || dados.listas.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.textContent = '📭 Nenhuma lista. Clique em "+ Nova Lista" para começar.';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '20px';
        emptyMsg.style.color = '#999';
        listaAulas.appendChild(emptyMsg);
        return;
    }
    
    function renderizarListaRecursiva(lista, caminho, nivel = 0) {
        const listaDiv = document.createElement('div');
        listaDiv.style.marginBottom = '10px';
        listaDiv.style.marginLeft = `${nivel * 15}px`;
        if (nivel > 0) {
            listaDiv.style.borderLeft = '2px solid #e94560';
            listaDiv.style.paddingLeft = '10px';
        }
        
        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.justifyContent = 'space-between';
        headerDiv.style.alignItems = 'center';
        headerDiv.style.padding = '8px';
        headerDiv.style.background = nivel === 0 ? '#0f3460' : '#1a1a3e';
        headerDiv.style.borderRadius = '5px';
        headerDiv.style.cursor = 'pointer';
        headerDiv.style.marginTop = '5px';
        
        const tituloSpan = document.createElement('span');
        tituloSpan.style.fontWeight = 'bold';
        tituloSpan.style.color = '#e94560';
        
        const pathKey = obterChaveDoCaminho(caminho);
        const isExpanded = expandedPaths.has(pathKey);
        tituloSpan.innerHTML = isExpanded ? `📂 ${lista.nome}` : `📁 ${lista.nome}`;
        
        const botoesDiv = document.createElement('div');
        botoesDiv.style.display = 'flex';
        botoesDiv.style.gap = '5px';
        
        const addSubListBtn = document.createElement('button');
        addSubListBtn.textContent = '📁+';
        addSubListBtn.style.padding = '4px 8px';
        addSubListBtn.style.background = '#f39c12';
        addSubListBtn.style.border = 'none';
        addSubListBtn.style.borderRadius = '3px';
        addSubListBtn.style.cursor = 'pointer';
        addSubListBtn.style.color = 'white';
        addSubListBtn.style.fontSize = '11px';
        addSubListBtn.onclick = (e) => { e.stopPropagation(); criarLista(caminho); };
        
        const addCardBtn = document.createElement('button');
        addCardBtn.textContent = '+';
        addCardBtn.style.padding = '4px 10px';
        addCardBtn.style.background = '#2ecc71';
        addCardBtn.style.border = 'none';
        addCardBtn.style.borderRadius = '3px';
        addCardBtn.style.cursor = 'pointer';
        addCardBtn.style.color = 'white';
        addCardBtn.onclick = (e) => { e.stopPropagation(); criarCartao(caminho); };
        
        const editListBtn = document.createElement('button');
        editListBtn.textContent = '✏️';
        editListBtn.style.padding = '4px 8px';
        editListBtn.style.background = '#3a86ff';
        editListBtn.style.border = 'none';
        editListBtn.style.borderRadius = '3px';
        editListBtn.style.cursor = 'pointer';
        editListBtn.style.color = 'white';
        editListBtn.onclick = (e) => { e.stopPropagation(); renomearLista(caminho); };
        
        const deleteListBtn = document.createElement('button');
        deleteListBtn.textContent = '🗑️';
        deleteListBtn.style.padding = '4px 8px';
        deleteListBtn.style.background = '#e94560';
        deleteListBtn.style.border = 'none';
        deleteListBtn.style.borderRadius = '3px';
        deleteListBtn.style.cursor = 'pointer';
        deleteListBtn.style.color = 'white';
        deleteListBtn.onclick = (e) => { e.stopPropagation(); excluirLista(caminho); };
        
        botoesDiv.appendChild(addSubListBtn);
        botoesDiv.appendChild(addCardBtn);
        botoesDiv.appendChild(editListBtn);
        botoesDiv.appendChild(deleteListBtn);
        headerDiv.appendChild(tituloSpan);
        headerDiv.appendChild(botoesDiv);
        
        const contentContainer = document.createElement('div');
        contentContainer.className = 'cards-container';
        contentContainer.style.paddingLeft = '10px';
        contentContainer.style.marginTop = '5px';
        contentContainer.style.display = isExpanded ? 'block' : 'none';
        
        if (lista.cards && lista.cards.length > 0) {
            for (let cardIdx = 0; cardIdx < lista.cards.length; cardIdx++) {
                const card = lista.cards[cardIdx];
                const cardDiv = document.createElement('div');
                cardDiv.className = 'cartao';
                cardDiv.style.display = 'flex';
                cardDiv.style.justifyContent = 'space-between';
                cardDiv.style.alignItems = 'center';
                cardDiv.style.background = '#1a1a2e';
                cardDiv.style.borderLeft = '3px solid #e94560';
                cardDiv.style.padding = '6px 8px';
                cardDiv.style.margin = '3px 0';
                cardDiv.style.borderRadius = '3px';
                cardDiv.style.cursor = 'pointer';
                
                const cardTitle = document.createElement('span');
                cardTitle.textContent = `📄 ${card.texto}`;
                cardTitle.style.fontSize = '12px';
                cardTitle.style.flex = '1';
                
                const cardActions = document.createElement('div');
                cardActions.style.display = 'flex';
                cardActions.style.gap = '5px';
                
                const editCardBtn = document.createElement('button');
                editCardBtn.textContent = '✏️';
                editCardBtn.style.padding = '2px 6px';
                editCardBtn.style.background = '#3a86ff';
                editCardBtn.style.border = 'none';
                editCardBtn.style.borderRadius = '3px';
                editCardBtn.style.cursor = 'pointer';
                editCardBtn.style.color = 'white';
                editCardBtn.style.fontSize = '10px';
                editCardBtn.onclick = (e) => { e.stopPropagation(); renomearCartao(caminho, cardIdx); };
                
                const deleteCardBtn = document.createElement('button');
                deleteCardBtn.textContent = '🗑️';
                deleteCardBtn.style.padding = '2px 6px';
                deleteCardBtn.style.background = '#e94560';
                deleteCardBtn.style.border = 'none';
                deleteCardBtn.style.borderRadius = '3px';
                deleteCardBtn.style.cursor = 'pointer';
                deleteCardBtn.style.color = 'white';
                deleteCardBtn.style.fontSize = '10px';
                deleteCardBtn.onclick = (e) => { e.stopPropagation(); excluirCartao(caminho, cardIdx); };
                
                cardActions.appendChild(editCardBtn);
                cardActions.appendChild(deleteCardBtn);
                cardDiv.appendChild(cardTitle);
                cardDiv.appendChild(cardActions);
                cardDiv.onclick = () => carregarAula(caminho, cardIdx);
                contentContainer.appendChild(cardDiv);
            }
        }
        
        if (lista.sublistas && lista.sublistas.length > 0) {
            for (let subIdx = 0; subIdx < lista.sublistas.length; subIdx++) {
                const subPath = [...caminho, subIdx];
                const subDiv = renderizarListaRecursiva(lista.sublistas[subIdx], subPath, nivel + 1);
                contentContainer.appendChild(subDiv);
            }
        }
        
        if ((!lista.cards || lista.cards.length === 0) && (!lista.sublistas || lista.sublistas.length === 0)) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = '📭 Nenhum conteúdo. Clique em "+" para adicionar cartão ou "📁+" para sub-lista.';
            emptyMsg.style.padding = '8px';
            emptyMsg.style.color = '#888';
            emptyMsg.style.fontSize = '11px';
            emptyMsg.style.textAlign = 'center';
            contentContainer.appendChild(emptyMsg);
        }
        
        headerDiv.onclick = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            if (expandedPaths.has(pathKey)) {
                expandedPaths.delete(pathKey);
                contentContainer.style.display = 'none';
                tituloSpan.innerHTML = `📁 ${lista.nome}`;
            } else {
                expandedPaths.add(pathKey);
                contentContainer.style.display = 'block';
                tituloSpan.innerHTML = `📂 ${lista.nome}`;
            }
        };
        
        listaDiv.appendChild(headerDiv);
        listaDiv.appendChild(contentContainer);
        return listaDiv;
    }
    
    dados.listas.forEach((lista, idx) => {
        const listaDiv = renderizarListaRecursiva(lista, [idx], 0);
        listaDiv.setAttribute('data-lista-idx', idx);
        listaAulas.appendChild(listaDiv);
    });
}

// ============================================
// FUNÇÕES DE CRIAÇÃO
// ============================================
function criarLista(caminho) {
    const nome = prompt("Nome da nova lista:");
    if (nome && nome.trim()) {
        const novaListaObj = { nome: nome.trim(), cards: [], sublistas: [] };
        if (caminho === null) dados.listas.push(novaListaObj);
        else {
            const listaPai = obterListaPorCaminho(caminho);
            if (listaPai) {
                if (!listaPai.sublistas) listaPai.sublistas = [];
                listaPai.sublistas.push(novaListaObj);
                const parentKey = obterChaveDoCaminho(caminho);
                expandedPaths.add(parentKey);
            }
        }
        salvarDados();
        alert(`✅ Lista "${nome.trim()}" criada!`);
    }
}

function criarCartao(caminho) {
    const nome = prompt("Nome do novo cartão:");
    if (nome && nome.trim()) {
        const lista = obterListaPorCaminho(caminho);
        if (lista) {
            if (!lista.cards) lista.cards = [];
            lista.cards.push({
                texto: nome.trim(),
                conteudo: `# ${nome.trim()}\n\nDigite seu conteúdo aqui...`,
                ultimaModificacao: Date.now()
            });
            const parentKey = obterChaveDoCaminho(caminho);
            expandedPaths.add(parentKey);
            salvarDados();
            alert(`✅ Cartão "${nome.trim()}" criado!`);
        }
    }
}

function renomearLista(caminho) {
    const lista = obterListaPorCaminho(caminho);
    if (!lista) return;
    const novoNome = prompt("Novo nome:", lista.nome);
    if (novoNome && novoNome.trim()) {
        lista.nome = novoNome.trim();
        salvarDados();
        alert("✅ Lista renomeada!");
    }
}

function excluirLista(caminho) {
    const lista = obterListaPorCaminho(caminho);
    if (!lista) return;
    if (confirm(`Excluir a lista "${lista.nome}" e todo seu conteúdo?`)) {
        const pathStr = obterChaveDoCaminho(caminho);
        for (let key of expandedPaths) {
            if (key.startsWith(pathStr)) {
                expandedPaths.delete(key);
            }
        }
        
        if (caminho.length === 1) dados.listas.splice(caminho[0], 1);
        else {
            const paiPath = caminho.slice(0, -1);
            const listaPai = obterListaPorCaminho(paiPath);
            const idx = caminho[caminho.length - 1];
            listaPai.sublistas.splice(idx, 1);
        }
        salvarDados();
        alert("✅ Lista excluída!");
    }
}

function renomearCartao(caminho, cardIdx) {
    const lista = obterListaPorCaminho(caminho);
    if (!lista || !lista.cards[cardIdx]) return;
    const novoNome = prompt("Novo nome:", lista.cards[cardIdx].texto);
    if (novoNome && novoNome.trim()) {
        lista.cards[cardIdx].texto = novoNome.trim();
        salvarDados();
        alert("✅ Cartão renomeado!");
    }
}

function excluirCartao(caminho, cardIdx) {
    const lista = obterListaPorCaminho(caminho);
    if (!lista || !lista.cards[cardIdx]) return;
    if (confirm(`Excluir o cartão "${lista.cards[cardIdx].texto}"?`)) {
        lista.cards.splice(cardIdx, 1);
        salvarDados();
        alert("✅ Cartão excluído!");
    }
}

function carregarAula(caminho, cardIdx) {
    const lista = obterListaPorCaminho(caminho);
    if (!lista || !lista.cards[cardIdx]) return;
    const card = lista.cards[cardIdx];
    listaAtual = caminho;
    cartaoAtual = cardIdx;
    editor.value = card.conteudo;
    if (timeoutRenderTimer) clearTimeout(timeoutRenderTimer);
    renderizar();
}

function salvarAulaAtual() {
    if (listaAtual !== null && cartaoAtual !== null) {
        const lista = obterListaPorCaminho(listaAtual);
        if (lista && lista.cards[cartaoAtual]) {
            lista.cards[cartaoAtual].conteudo = editor.value;
            lista.cards[cartaoAtual].ultimaModificacao = Date.now();
            salvarDados();
        }
    }
}

// ============================================
// FUNÇÕES DE CORES DO ABC INFANTIL
// ============================================
function obterCorPorNota(nota) {
    const cores = { 'C': '#FF0000', 'D': '#FF6600', 'E': '#FFDD00', 'F': '#00CC00', 'G': '#0066FF', 'A': '#4B0082', 'B': '#8B00FF' };
    return cores[nota.toUpperCase()] || '#000000';
}

function getCorPorTag(texto) {
    if (!texto) return "#000000";
    if (texto.includes("[r]")) return "#FF0000";
    if (texto.includes("[o]")) return "#FF6600";
    if (texto.includes("[y]")) return "#FFDD00";
    if (texto.includes("[g]")) return "#00CC00";
    if (texto.includes("[b]")) return "#0066FF";
    if (texto.includes("[i]")) return "#4B0082";
    if (texto.includes("[v]")) return "#8B00FF";
    return "#000000";
}

function aplicarCoresNasNotas() {
    if (!coresAtivas) return;
    document.querySelectorAll("#preview .abcjs-note").forEach(nota => {
        let cabeca = nota.querySelector('ellipse, circle');
        if (!cabeca) cabeca = nota.querySelector('path');
        if (cabeca) {
            let textoNota = nota.textContent || '';
            let match = textoNota.match(/[CDEFGAB]/i);
            if (match) {
                cabeca.style.fill = obterCorPorNota(match[0]);
                cabeca.style.fillOpacity = '1';
            }
        }
    });
}

function aplicarCoresAcordesLetras() {
    document.querySelectorAll("#preview .abcjs-chord, #preview .abcjs-lyric").forEach(el => {
        let texto = el.textContent || '';
        let cor = getCorPorTag(texto);
        if (cor !== "#000000") el.style.fill = cor;
        el.textContent = texto.replace(/\[(.*?)\]/g, "");
    });
}

// ============================================
// PROCESSAR ABC COM ESPAÇAMENTO
// ============================================
function processarABCComEspacamento(id, code, tipo) {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    
    const staffsep = document.getElementById("staffsepRange")?.value || 60;
    const sysstaffsep = document.getElementById("sysstaffsepRange")?.value || 80;
    
    let linhas = code.split('\n');
    let novasLinhas = [];
    let hasStaffsep = false, hasSysstaffsep = false;
    
    for (let linha of linhas) {
        if (linha.trim().startsWith('%%staffsep')) {
            novasLinhas.push(`%%staffsep ${staffsep}`);
            hasStaffsep = true;
        } else if (linha.trim().startsWith('%%sysstaffsep')) {
            novasLinhas.push(`%%sysstaffsep ${sysstaffsep}`);
            hasSysstaffsep = true;
        } else {
            novasLinhas.push(linha);
        }
    }
    
    if (!hasStaffsep && linhas.length > 0) novasLinhas.unshift(`%%staffsep ${staffsep}`);
    if (!hasSysstaffsep && linhas.length > 0) novasLinhas.unshift(`%%sysstaffsep ${sysstaffsep}`);
    
    let codigoProcessado = novasLinhas.join('\n');
    
    try {
        elemento.innerHTML = "";
        ABCJS.renderAbc(id, codigoProcessado, { add_classes: true, staffwidth: 800, responsive: 'resize' });
        if (tipo === 'infantil') {
            setTimeout(() => {
                aplicarCoresAcordesLetras();
                if (coresAtivas) aplicarCoresNasNotas();
                ajustarAcordes();
                ajustarLetras();
                ajustarLetrasX();
            }, 200);
        }
    } catch(e) {
        elemento.innerHTML = `<p style="color:red">Erro: ${e.message}</p>`;
    }
}

// ============================================
// FUNÇÕES DE AJUSTE
// ============================================
function ajustarAcordes() {
    const valor = parseFloat(document.getElementById("acordeRange")?.value || -8);
    document.getElementById("acordeValue").innerText = valor;
    document.querySelectorAll("#preview .abcjs-chord").forEach(el => {
        let yAtual = parseFloat(el.getAttribute("y"));
        if (!isNaN(yAtual)) {
            if (!el.dataset.yOriginal) el.dataset.yOriginal = yAtual;
            el.setAttribute("y", parseFloat(el.dataset.yOriginal) + valor);
        }
    });
}

function ajustarLetras() {
    const valor = parseFloat(document.getElementById("letraRange")?.value || 12);
    document.getElementById("letraValue").innerText = valor;
    document.querySelectorAll("#preview .abcjs-lyric").forEach(el => {
        let yAtual = parseFloat(el.getAttribute("y"));
        if (!isNaN(yAtual)) {
            if (!el.dataset.yOriginal) el.dataset.yOriginal = yAtual;
            el.setAttribute("y", parseFloat(el.dataset.yOriginal) + valor);
        }
    });
}

function ajustarLetrasX() {
    const valor = parseFloat(document.getElementById("letraXRange")?.value || 5);
    document.getElementById("letraXValue").innerText = valor;
    document.querySelectorAll("#preview .abcjs-lyric").forEach(el => {
        let xAtual = parseFloat(el.getAttribute("x"));
        if (!isNaN(xAtual)) {
            if (!el.dataset.xOriginal) el.dataset.xOriginal = xAtual;
            el.setAttribute("x", parseFloat(el.dataset.xOriginal) + valor);
        }
    });
}

function atualizarStaffSep() { renderizar(); }
function atualizarSysStaffSep() { renderizar(); }
function atualizarIntensidadeCores() { if (coresAtivas) aplicarCoresNasNotas(); }

// ============================================
// DESENHAR TECLADO DO PIANO
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
    
    const pretasMap = { 'C#3':0,'D#3':1,'F#3':3,'G#3':4,'A#3':5,'C#4':7,'D#4':8,'F#4':10,'G#4':11,'A#4':12,'C#5':14,'D#5':15,'F#5':17,'G#5':18,'A#5':19 };
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

// ============================================
// DESENHAR ACORDE DE PIANO PERSONALIZADO
// ============================================
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
    
    const pretasMap = { 'C#3':0,'D#3':1,'F#3':3,'G#3':4,'A#3':5,'C#4':7,'D#4':8,'F#4':10,'G#4':11,'A#4':12,'C#5':14,'D#5':15,'F#5':17,'G#5':18,'A#5':19 };
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
        const mapa = { 'C':'1', 'D':'2', 'E':'3', 'F':'4', 'G':'5', 'A':'1', 'B':'2', 'C#':'2', 'D#':'3', 'F#':'4', 'G#':'5', 'A#':'1' };
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

// ============================================
// RENDERIZAÇÃO PRINCIPAL
// ============================================
function renderizar() {
    console.log("Renderizando...");
    let conteudo = editor.value || '';
    
    try {
        let processado = conteudo;
        const acordes = [];
        const pianos = [];
        const abcInfantis = [];
        const abcNormais = [];
        const pianosCustom = [];
        
        processado = processado.replace(/\[Acorde:([^\]]+)\]([\s\S]*?)\[\/Acorde\]/g, (match, sigla, nome) => {
            const id = 'chord-' + Date.now() + '-' + acordes.length;
            acordes.push({ id, sigla: sigla.trim(), nome: nome ? nome.trim() : '' });
            return `<div id="${id}" class="chord-diagram"></div>`;
        });
        
        processado = processado.replace(/\[PIANO:([^\]]+)\]([\s\S]*?)\[\/PIANO\]/g, (match, sigla, nome) => {
            const id = 'piano-' + Date.now() + '-' + pianos.length;
            pianos.push({ id, sigla: sigla.trim(), nome: nome.trim() });
            return `<div id="${id}" class="piano-diagram-container"></div>`;
        });
        
        processado = processado.replace(/\[PIANO-CUSTOM:([^\]]+)\]([\s\S]*?)\[\/PIANO-CUSTOM\]/g, (match, sigla, nome) => {
            const id = 'piano-custom-' + Date.now() + '-' + pianosCustom.length;
            pianosCustom.push({ id, sigla: sigla.trim(), nome: nome.trim() });
            return `<div id="${id}" class="piano-diagram-container"></div>`;
        });
        
        processado = processado.replace(/\[ABC-INFANTIL\]([\s\S]*?)\[\/ABC-INFANTIL\]/g, (match, code) => {
            const id = 'abc-inf-' + Date.now() + '-' + abcInfantis.length;
            abcInfantis.push({ id, code: code.trim() });
            return `<div id="${id}" class="abc-container"></div>`;
        });
        
        processado = processado.replace(/\[ABC\]([\s\S]*?)\[\/ABC\]/g, (match, code) => {
            const id = 'abc-' + Date.now() + '-' + abcNormais.length;
            abcNormais.push({ id, code: code.trim() });
            return `<div id="${id}" class="abc-container"></div>`;
        });
        
        preview.innerHTML = marked.parse(processado);
        
        acordes.forEach(a => {
            const el = document.getElementById(a.id);
            if (el) desenharAcorde(el, a.sigla, a.nome);
        });
        
        pianos.forEach(p => {
            const el = document.getElementById(p.id);
            if (el && window.ACORDES_PIANO && window.ACORDES_PIANO[p.sigla]) {
                const a = window.ACORDES_PIANO[p.sigla];
                desenharTecladoPiano(el, p.sigla, a.nome, a.notas, a.startOitava, a.endOitava, a.dedosTreble);
            }
        });
        
        pianosCustom.forEach(p => {
            const el = document.getElementById(p.id);
            if (el) desenharAcordePianoPersonalizado(el, p.sigla, p.nome);
        });
        
        abcNormais.forEach(a => {
            const el = document.getElementById(a.id);
            if (el && typeof ABCJS !== 'undefined') processarABCComEspacamento(a.id, a.code, 'normal');
        });
        
        abcInfantis.forEach(a => {
            const el = document.getElementById(a.id);
            if (el && typeof ABCJS !== 'undefined') processarABCComEspacamento(a.id, a.code, 'infantil');
        });
        
    } catch (e) {
        console.error("Erro na renderização:", e);
        preview.innerHTML = '<p style="color:red;">❌ Erro ao renderizar: ' + e.message + '</p>';
    }
}

// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================
function addFormatacao(antes, depois) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const texto = editor.value;
    const selectedText = texto.substring(start, end);
    let newText = selectedText ? texto.substring(0, start) + antes + selectedText + depois + texto.substring(end) : texto.substring(0, start) + antes + depois + texto.substring(end);
    editor.value = newText;
    editor.setSelectionRange(start + antes.length, start + antes.length);
    renderizar();
    salvarAulaAtual();
    editor.focus();
}

function inserirLink() {
    const url = prompt('Digite uma URL:', 'https://');
    const texto = prompt('Digite o texto do link:', 'Clique aqui');
    if (url && texto) {
        const start = editor.selectionStart;
        editor.value = editor.value.substring(0, start) + `[${texto}](${url})` + editor.value.substring(start);
        renderizar();
        salvarAulaAtual();
    }
}

function inserirImagem() {
    const url = prompt('Digite a URL da imagem:', 'https://via.placeholder.com/300x200');
    const alt = prompt('Digite o texto alternativo:', 'Imagem');
    if (url && alt) {
        const start = editor.selectionStart;
        editor.value = editor.value.substring(0, start) + `![${alt}](${url})` + editor.value.substring(start);
        renderizar();
        salvarAulaAtual();
    }
}

// ============================================
// FUNÇÃO INSERIR ACORDE (PRINCIPAL)
// ============================================
function inserirAcorde() {
    const opcao = prompt(
        '🎸 INSERIR ACORDE\n\n' +
        '1 - Biblioteca Básica (C, G, Am, F, D, Em)\n' +
        '2 - Minha Biblioteca (acordes salvos)\n' +
        '3 - Acorde Dinâmico (1;3 = Sol Maior)\n' +
        '4 - Editor de Acordes\n\n' +
        'Digite o número da opção:'
    );
    
    // Opção 1: Biblioteca Básica
    if (opcao === '1') {
        const sigla = prompt('Digite a sigla do acorde (C, G, D, Am, Em, F):', 'C');
        if (sigla && window.ACORDES && window.ACORDES[sigla]) {
            inserirCodigoAcorde(`[Acorde:${sigla}]${window.ACORDES[sigla].nome}[/Acorde]`);
        } else if (sigla) {
            alert(`❌ Acorde "${sigla}" não encontrado! Use: C, G, D, Am, Em, F`);
        }
    }
    
    // Opção 2: Minha Biblioteca
    else if (opcao === '2') {
        if (typeof bibliotecaAcordes !== 'undefined' && Object.keys(bibliotecaAcordes).length > 0) {
            const lista = Object.entries(bibliotecaAcordes)
                .map(([sigla, acorde]) => `${sigla} - ${acorde.nome}`)
                .join('\n');
            const sigla = prompt(`📚 SEUS ACORDES SALVOS:\n\n${lista}\n\nDigite a sigla:`, '');
            if (sigla && bibliotecaAcordes[sigla]) {
                inserirCodigoAcorde(`[Acorde:${sigla}]${bibliotecaAcordes[sigla].nome}[/Acorde]`);
            } else if (sigla) {
                alert(`❌ Acorde "${sigla}" não encontrado!`);
            }
        } else {
            alert('📭 Nenhum acorde salvo! Use a opção 4 para criar.');
        }
    }
    
    // Opção 3: Acorde Dinâmico
    else if (opcao === '3') {
        const formato = prompt(
            '🎸 Acorde Dinâmico\n\n' +
            'Formatos:\n' +
            '• 1;3 = Sol Maior (forma maior, casa 3)\n' +
            '• 2;5 = Lá Menor (forma menor, casa 5)\n' +
            '• 1;3;5 = Dó Maior (corda base 5)\n\n' +
            'Digite o formato:'
        );
        
        if (formato && typeof window.processarAcordeDinamico === 'function') {
            const acordeTemp = window.processarAcordeDinamico(formato, '');
            if (acordeTemp) {
                inserirCodigoAcorde(`[Acorde:${formato}]${acordeTemp.nome}[/Acorde]`);
            } else {
                alert(`❌ Formato "${formato}" inválido! Exemplo: 1;3`);
            }
        } else if (formato) {
            alert('❌ Módulo de acordes sonoros não carregado!');
        }
    }
    
    // Opção 4: Editor de Acordes
    else if (opcao === '4') {
        abrirEditorAcordes();
    }
    else if (opcao !== null) {
        alert('Opção inválida! Digite 1, 2, 3 ou 4');
    }
}

function inserirABC() {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + `[ABC]\nX:1\nM:4/4\nL:1/8\nK:C\nC DEF | GAB c |]\n[/ABC]\n` + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

function inserirABCInfantil() {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + `[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/4\nK:C\nC DEF | GAB c |]\n[/ABC-INFANTIL]\n` + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

function inserirPiano() {
    const sigla = prompt('Sigla (C, G, Am, F, Dm):', 'C');
    if (!sigla) return;
    const acordePiano = window.ACORDES_PIANO ? window.ACORDES_PIANO[sigla] : null;
    const nome = acordePiano ? acordePiano.nome : sigla;
    const start = editor.selectionStart;
    const codigo = `[PIANO:${sigla}]${nome}[/PIANO]`;
    editor.value = editor.value.substring(0, start) + codigo + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

// ============================================
// FUNÇÕES DE UI
// ============================================
function toggleCoresNotas() {
    coresAtivas = !coresAtivas;
    const btn = document.getElementById("btnCores");
    if (btn) {
        btn.style.background = coresAtivas ? "#00CC00" : "#CC0000";
        btn.textContent = coresAtivas ? "✅ Cores" : "❌ Cores";
    }
    if (coresAtivas) {
        aplicarCoresNasNotas();
        aplicarCoresAcordesLetras();
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

function toggleCategoria(menuId) {
    document.getElementById(menuId)?.classList.toggle('collapsed');
}

function abrirModalPiano() {
    const modal = document.getElementById('modalPiano');
    if (modal) modal.style.display = 'block';
    if (typeof initPiano === 'function') initPiano();
}

function fecharModalPiano() {
    const modal = document.getElementById('modalPiano');
    if (modal) modal.style.display = 'none';
}

function abrirEditorAcordes() {
    const modal = document.getElementById('modalAcordes');
    if (modal) {
        if (typeof carregarBiblioteca === 'function') carregarBiblioteca();
        modal.style.display = 'block';
        const campoPesquisa = document.getElementById('pesquisaAcordes');
        if (campoPesquisa) {
            campoPesquisa.value = '';
            campoPesquisa.focus();
            if (typeof atualizarBibliotecaVisual === 'function') {
                campoPesquisa.oninput = () => atualizarBibliotecaVisual();
            }
        }
    } else {
        alert('Modal do editor de acordes não encontrado!');
    }
}

function fecharEditorAcordes() {
    const modal = document.getElementById('modalAcordes');
    if (modal) modal.style.display = 'none';
}

function resetarAcordes() {
    if (confirm('Redefinir acordes?')) {
        localStorage.removeItem('acordes_personalizados_usuario');
        alert('Acordes resetados!');
    }
}

function exportHTML() { alert("📄 Exportação HTML em desenvolvimento"); }
function exportAppHTML() { alert("📱 Exportação App em desenvolvimento"); }
function gerarPreviewAcordes() {}
function salvarAcordeNaBiblioteca() {}
function copiarCodigoAcordes() {}

function toast(msg, tipo) {
    const t = document.createElement("div");
    t.textContent = msg;
    const bgColor = tipo === 'success' ? '#2ed573' : '#3a86ff';
    t.style.cssText = `position:fixed; bottom:20px; right:20px; background:${bgColor}; color:white; padding:12px 20px; border-radius:8px; z-index:9999; animation:fadeOut 3s forwards; font-weight:bold;`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function init() {
    console.log("Inicializando o sistema...");
    
    if (typeof window.processarAcordeDinamico !== 'function') {
        console.warn('⚠️ acordes_dinamicos.js não carregado. Acordes sonoros não funcionam.');
    } else {
        console.log('✅ Módulo de acordes sonoros carregado!');
        adicionarBotaoSalvarDinamico();
    }
    
    carregarDados();
    
    if (editor) {
        editor.addEventListener('input', () => {
            clearTimeout(timeoutRenderTimer);
            timeoutRenderTimer = setTimeout(() => {
                renderizar();
                salvarAulaAtual();
            }, 500);
        });
    }
}

document.addEventListener('DOMContentLoaded', init);

const styleToast = document.createElement('style');
styleToast.textContent = `@keyframes fadeOut { 0% { opacity: 1; transform: translateX(0); } 70% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); } }`;
document.head.appendChild(styleToast);

// Ajustar zoom na tela cheia
function ajustarZoomFullscreen() {
    const valor = document.getElementById("zoomFullscreenRange")?.value || 130;
    document.getElementById("zoomFullscreenValue").innerText = valor;
    localStorage.setItem('zoom_fullscreen', valor);
}

// Aplicar zoom ao entrar em tela cheia
function aplicarZoomFullscreen() {
    const zoom = localStorage.getItem('zoom_fullscreen') || 130;
    const style = document.createElement('style');
    style.id = 'zoom-fullscreen-style';
    style.textContent = `
        #preview:fullscreen .chord-diagram canvas { transform: scale(${zoom/100}) !important; }
        #preview:-webkit-full-screen .chord-diagram canvas { transform: scale(${zoom/100}) !important; }
        #preview:fullscreen .abcjs-container svg { transform: scale(${zoom/100}) !important; }
        #preview:-webkit-full-screen .abcjs-container svg { transform: scale(${zoom/100}) !important; }
    `;
    
    const oldStyle = document.getElementById('zoom-fullscreen-style');
    if (oldStyle) oldStyle.remove();
    document.head.appendChild(style);
}

// Chamar quando entra em tela cheia
document.addEventListener('fullscreenchange', function() {
    if (document.fullscreenElement) {
        aplicarZoomFullscreen();
    }
});
