// ============================================
// main.js - PRO MAESTRO
// ============================================

// Variáveis
seja dados = {
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
função toggleFullscreenPreview() {
    const previewElement = document.getElementById('preview');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    se (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // Entrar em tela cheia
        se (previewElement.requestFullscreen) {
            previewElement.requestFullscreen();
        } else if (previewElement.webkitRequestFullscreen) { /* Safari */
            previewElement.webkitRequestFullscreen();
        } else if (previewElement.msRequestFullscreen) { /* IE/Edge */
            previewElement.msRequestFullscreen();
        }
        se (botão de tela cheia) {
            fullscreenBtn.textContent = 'âœ–';
            fullscreenBtn.style.background = '#e94560';
        }
    } outro {
        // Sair da tela cheia
        se (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
        se (botão de tela cheia) {
            fullscreenBtn.textContent = 'â›¶';
            fullscreenBtn.style.background = '#00CC00';
        }
    }
}

// Detectar quando sai da tela cheia (ESC)
document.addEventListener('fullscreenchange', function() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    se (!document.fullscreenElement && fullscreenBtn) {
        fullscreenBtn.textContent = 'â›¶';
        fullscreenBtn.style.background = '#00CC00';
    }
});
document.addEventListener('webkitfullscreenchange', function() {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    se (!document.webkitFullscreenElement && fullscreenBtn) {
        fullscreenBtn.textContent = 'â›¶';
        fullscreenBtn.style.background = '#00CC00';
    }
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function obterChaveDoCaminho(caminho) {
    retornar caminho.join('-');
}

function obterListaPorCaminho(caminho) {
    if (!caminho || caminho.length === 0) return null;
    let atual = dados.listas[caminho[0]];
    para (seja i = 1; i < caminho.length; i++) {
        if (!atual || !atual.sublistas) retorna nulo;
        atual = atual.sublistas[caminho[i]];
    }
    retornar atual;
}

função obterDadosPadrao() {
    retornar {
        listas: [
            {
                nome: "Piano",
                cartas: [
                    {texto: "Escala de Dó Maior", conteúdo: "# Escala de Dó Maior\n\n[PIANO:C]Dó Maior[/PIANO]\n\n[ABC]\nX:1\nM:4/4\nL:1/8\nK:C\nC DEF | GAB c |]\n[/ABC]", ultimaModificação: Date.now() },
                    { texto: "Acordes Básicos", conteudo: "# Acordes Básicos\n\n[PIANO:C]Dó Maior[/PIANO]\n[PIANO:G]Sol Maior[/PIANO]\n[PIANO:Am]Lá Menor[/PIANO]", ultimaModificacao: Date.now() }
                ],
                sublistas: [
                    {
                        nome: "Exercícios",
                        cartas: [
                            { texto: "Hanon 1", conteudo: "# Hanon 1\n\nExercício para dedos.", ultimaModificação: Date.now() }
                        ],
                        sublistas: []
                    }
                ]
            },
            {
                nome: "Violão",
                cartas: [
                    { texto: "Acordes Iniciantes", conteudo: "# Acordes Iniciantes\n\n[Acorde:C]Dó Maior[/Acorde]\n[Acorde:G]Sol Maior[/Acorde]\n[Acorde:Am]Lá Menor[/Acorde]", ultimaModificacao: Date.now() }
                ],
                sublistas: []
            },
            {
                nome: "Teoria Musical",
                cartas: [
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

função salvarAcordeDinamicoNaBiblioteca() {
    const formato = prompt(
        'ðŸ'¾ SALVAR ACORDE DINÂMICO NA BIBLIOTECA\n\n' +
        'Digite o formato do acorde sonoro que você quer salvar:\n\n' +
        'Exemplo: 1;3 (Sol Maior)\n' +
        'Exemplo: 2;5 (Lá Menor)\n\n' +
        'Formato:'
    );
    
    se (!formato) retornar;
    
    const convertido = conversorDinamicoParaEditavel(formato);
    se (!convin) retornar;
    
    //Pergunta se quer personalizar o nome
    const novoNome = prompt(`Nome do acorde na biblioteca (ou Enter para manter "${convertido.nome}"):`, convertido.nome);
    if (novoNome && novoNome.trim()) {
        convertido.acorde.nome = novoNome.trim();
        convertido.linha = convertido.linha.replace(convertido.nome, novoNome.trim());
    }
    
    // Salva diretamente na biblioteca
    se (typeof bibliotecaAcordes !== 'undefined') {
        // Extrai dados da linha
        const partes = convertido.linha.split('/').map(p => p.trim());
        const siglaNome = partes[0];
        const doisPontos = siglaNome.indexOf(':');
        const sigla = siglaNome.substring(0, doisPontos).trim();
        
        // Salva na biblioteca
        bibliotecaAcordes[sigla] = {
            nome: convertido.acorde.nome,
            cordas: convertidas.acorde.cordas,
            dedos: convertido.acorde.dedos,
            pestana: convertido.acorde.pestanaCordas || convertido.acorde.pestana || falso,
            casaInicial: convertido.acorde.casaInicial,
            baixo: convertido.acorde.baixo || sigla
        };
        
        // Salva no localStorage
        localStorage.setItem('biblioteca_acordes', JSON.stringify(bibliotecaAcordes));
        
        // Atualizar visualização
        se (typeof atualizarBibliotecaVisual === 'function') {
            atualizarBibliotecaVisual();
        }
        
        alert(`âœ… Acordo "${sigla}" salvo na biblioteca!\n\nUse [Acorde:${sigla}] no editor.`);
    } outro {
        alert('Erro: biblioteca de acordes não disponível');
    }
}

// Adicionado um botão na barra lateral para salvar acorde sonoro
function adicionarBotaoSalvarDinamico() {
    const sidebar = document.getElementById('sidebar');
    se (barra lateral) {
        const btn = document.createElement('button');
        btn.innerHTML = 'ðŸ”„ Conversor Dinâmico';
        btn.style.background = '#9b59b6';
        btn.style.marginTop = '10px';
        btn.onclick = salvarAcordeDinamicoNaBiblioteca;
        
        // Insere depois do botão "Editor de Acordes"
        const editorBtn = document.querySelector('#sidebar button[onclick="abrirEditorAcordes()"]');
        se (editorBtn) {
            editorBtn.insertAdjacentElement('afterend', btn);
        } outro {
            sidebar.querySelector('.sidebar-content')?.appendChild(btn);
        }
    }
}

function inserirCodigoAcorde(código) {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + codigo + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

// ============================================
// CONVERTER ACORDE DINÂMICO PARA EDITÁ VEL
// ============================================

// Função para converter acorde sonoro em formato editável
função converterDinamicoParaEditavel(formato) {
    if (typeof window.processarAcordeDinamico !== 'function') {
        alert('Módulo de acordes sonoros não carregado!');
        retornar nulo;
    }
    
    const acorde = window.processarAcordeDinamico(formato, '');
    se (!acorde) {
        alert(`Formato "${formato}" inválido!`);
        retornar nulo;
    }
    
    // Gera uma linha no formato que o editor entende
    const pestanaStr = acorde.pestana ? (Array.isArray(acorde.pestanaCordas) && acorde.pestanaCordas.length > 0
        ? JSON.stringify(acorde.pestanaCordas)
        : 'verdadeiro') : 'falso';
    
    const cordasStr = acorde.cordas.join(',');
    const dedosStr = acorde.dedos.join(',');
    
    // Formato: SIGLA: NOME / CORDAS / DEDOS / PESTANA / CASA_INICIAL / BAIXO
    const linha = `${formato}: ${acorde.nome} / ${cordasStr} / ${dedosStr} / ${pestanaStr} / ${acorde.casaInicial} / ${acorde.baixo || ''}`;
    
    retornar {
        linha: linha,
        acorde: acorde,
        formato: formato,
        nome: acorde.nome
    };
}

// Função para abrir editor com acorde sonoro
function editarAcordeDinamico() {
    const formato = prompt(
        'ðŸŽ¸ EDITAR ACORDE DINÂMICO\n\n' +
        'Digite o formato do acorde sonoro que você quer editar:\n\n' +
        'Exemplos:\n' +
        '• 1;3 = Sol Maior\n' +
        '€¢ 2;5 = Lá Menor\n' +
        'â€¢ 1;3;5 = DÃ³ Maior (corda base 5)\n\n' +
        'Formato:'
    );
    
    se (!formato) retornar;
    
    const convertido = conversorDinamicoParaEditavel(formato);
    se (!convin) retornar;
    
    // Abre o editor com o acorde convertido
    abrirEditorAcordesComDados(convertido.linha, convertido.nome);
}

// Função para abrir editor com dados pré-preenchidos
function abrirEditorAcordesComDados(linha, nomeSugerido) {
    const modal = document.getElementById('modalAcordes');
    se (!modal) {
        alert('Editor de acordes não encontrado!');
        retornar;
    }
    
    // Abre o modal
    se (typeof carregarBiblioteca === 'function') carregarBiblioteca();
    modal.style.display = 'block';
    
    // Preenche o campo de texto
    const inputField = document.getElementById('acordeInput');
    se (campo de entrada) {
        inputField.value = linha;
    }
    
    // Foca no campo
    setTimeout(() => {
        se (campo de entrada) {
            inputField.focus();
            inputField.select();
        }
    }, 100);
    
    // Pré-visualização gerada automaticamente
    setTimeout(() => {
        se (typeof gerarPreviewAcordes === 'function') {
            gerarPreviewAcordes();
        }
    }, 200);
    
    alert(`âœ… Acorde dinâmico convertido!\n\nAgora você pode editar e salvar na biblioteca.`);
}

function desenharAcorde(container, sigla, nomeParam = '') {
    seja acorde = nulo;
    deixe nomeExibido = nomeParam || siglas;
    
    // FORÃ‡AR O C1 A NÃƒO MOSTRAR NÃšMERO
    se (sigla === 'C1') {
        se (typeof ACORDES !== 'undefined' && ACORDES['C1']) {
            acorde = {...ACORDES['C1']};
            acorde.posicao = null;
            acorde.mostrarNumero = falso;
            nomeExibido = acorde.nome;
        }
    }
    
    // Busca do acorde
    if (!acorde && typeof ACORDES !== 'indefinido' && ACORDES[sigla]) {
        acorde = ACORDES[sigla];
        nomeExibido = acorde.nome;
    } else if (!acorde && typeof bibliotecaAcordes !== 'undefined' && bibliotecaAcordes[sigla]) {
        acorde = bibliotecaAcordes[sigla];
        nomeExibido = acorde.nome;
    } else if (!acorde && typeof window.processarAcordeDinamico === 'function') {
        const acordeDinamico = window.processarAcordeDinamico(sigla, nomeExibido);
        se (acordeDinamico) {
            acorde = acordeDinamico;
            nomeExibido = acorde.nome;
        }
    }
    
    se (!acorde) {
        container.innerHTML = `<div style="color:red; padding:10px;">â Œ Acorde "${sigla}" não encontrado</div>`;
        retornar;
    }
    
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative; display:inline-block; text-align:center; margin:20px 10px;';
    
    // Cifra (nome do acorde) em cima
    const cifraDiv = document.createElement('div');
    cifraDiv.textContent = nomeExibido;
    cifraDiv.style.cssText = 'position:absolute; top:-3px; left:50%; transform:translateX(-50%); font-size:25px; font-weight:bold; color:#e94560; background:white; padding:0px 8px; border-radius:20px; white-space:nowrap;';
    wrapper.appendChild(cifraDiv);
    
    const canvas = document.createElement('canvas');
    canvas.width = 140;
    altura da tela = 190;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const startX = 28, startY = 45, stringSpacing = 18, fretSpacing = 26;
    const numFrets = 5;
    
    // Desenha cordas
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    para (seja i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(startX + i * stringSpacing, startY);
        ctx.lineTo(startX + i * stringSpacing, startY + numFrets * fretSpacing);
        ctx.stroke();
    }
    
    // Desenha trastes
    para (seja i = 0; i <= numFrets; i++) {
        ctx.beginPath();
        ctx.moveTo(startX, startY + i * fretSpacing);
        ctx.lineTo(startX + 5 * stringSpacing, startY + i * fretSpacing);
        ctx.stroke();
    }
    
    // PESTANA
    const temPestana = acorde.pestana && acorde.pestanaCordas && acorde.pestanaCordas.length > 0;
    const casaInicialVal = acorde.casaInicial || 1;
    const casaBase = acorde.pestanaCasa || acorde.casaInicial || 1;
    const mostrarNumero = acorde.mostrarNumero !== false;
    
    let cordasNaPestana = [];
    
    se (temPestana) {
        cordasNaPestana = acorde.pestanaCordas;
        const casaPestana = acorde.pestanaCasa || acorde.casaInicialParaPestana || 1;
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
    
    // NÃšMERO LATERAL
    seja numeroMostrar = nulo;
    let textoMostrar = null;
    
    if (acorde.mostrarPosicao === true && acorde.posicao) {
        numeroMostrar = acorde.posição;
        textoMostrar = acorde.textoPosicao || (acorde.posição + 'Âª');
    } else if (mostrarNumero && temPestana) {
        numeroMostrar = acorde.pestanaCasa || acorde.casaInicial || 1;
        textoMostrar = numeroMostrar + 'Âª';
    }
    
    if (numeroMostrar !== null && textoMostrar !== null && acorde.mostrarNumero !== false) {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#333';
        const yPos = startY + (numeroMostrar - 1) * fretSpacing + fretSpacing / 2 + 2;
        ctx.fillText(textoMostrar, startX - 28, yPos);
    }
    
    // DESENHAR NOTAS (BOLINHAS)
    ctx.lineWidth = 1.5;
    acorde.cordas.forEach((casa, i) => {
        const x = startX + i * stringSpacing;
        const casaRelativa = casa - casaBase + 1;
        const estaNaPestana = temPestana && cordasNaPestana.includes(i) && casa === casaBase;
        
        se (casa === 0) {
            const y = startY - 10;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.strokeStyle = '#333';
            ctx.stroke();
        }
        senão se (casa === -1) {
            const y = startY - 10;
            ctx.strokeStyle = '#e94560';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x - 4, y - 4); ctx.lineTo(x + 4, y + 4);
            ctx.moveTo(x + 4, y - 4); ctx.lineTo(x - 4, y + 4);
            ctx.stroke();
            ctx.lineWidth = 1.5;
        }
        senão if (casa > 0 && casaRelativa > 0 && casaRelativa <= numFrets) {
            se (!estaNaPestana) {
                const y = startY + (casaRelativa - 1) * fretSpacing + fretSpacing / 2;
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = '#1a1a2e';
                ctx.fill();
                
                const dedo = (acorde.dedos && acorde.dedos[i]) ? acorde.dedos[i] : '';
                se (dedo) {
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

// Nome do acorde (ID) centralizado abaixo do diagrama
const idDiv = document.createElement('div');
// Só mostra o ID se para acorde dinâmico (formato com ;)
se (sigla.inclui(';')) {
    const primeiroNumero = sigla.split(';')[0];
    idDiv.textContent = primeiroNumero;
    idDiv.style.cssText = 'text-align: center; width: 100%; margin-top: -18px; font-size: 20px; font-weight: bold; color: #e94560;';
} outro {
    idDiv.textContent = '';
    idDiv.style.display = 'nenhum';
}

wrapper.appendChild(idDiv);

container.appendChild(wrapper);
}

// ============================================
// FUNÇÕES DE SALVAR E CARREGAR
// ============================================
função salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    renderizarListaAulas();
    console.log("ðŸ'¾ Dados salvos");
}

função carregarDados() {
    const localData = localStorage.getItem(STORAGE_KEY);
    se (localData) {
        tentar {
            dados = JSON.parse(localData);
            console.log("âœ… Dados carregados:", dados.listas.length, "listas");
        } catch(e) {
            console.error("Erro ao carregar:", e);
            dados = obterDadosPadrao();
        }
    } outro {
        dados = obterDadosPadrao();
        console.log("ðŸ“ Dados padrão carregados");
    }
    renderizarListaAulas();
    if (dados.listas.length > 0 && dados.listas[0].cards.length > 0) {
        carregarAula(0, 0);
    }
}

// ============================================
// RENDERIZAR LISTA DE AULAS (SIDEBAR)
// ============================================
função renderizarListaAulas() {
    se (!listaAulas) retornar;
    listaAulas.innerHTML = '';
    
    const novaListaBtn = document.createElement('button');
    novaListaBtn.textContent = '+ Nova Lista';
    novaListBtn.style.background = '#e94560';
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
        vazioMsg.textContent = 'ðŸ“ Nenhuma lista. Clique em "+ Nova Lista" para começar.';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '20px';
        emptyMsg.style.color = '#999';
        listaAulas.appendChild(emptyMsg);
        retornar;
    }
    
    function renderizarListaRecursiva(lista, caminho, nível = 0) {
        const listaDiv = document.createElement('div');
        listaDiv.style.marginBottom = '10px';
        listaDiv.style.marginLeft = `${nivel * 15}px`;
        se (nível > 0) {
            listaDiv.style.borderLeft = '2px solid #e94560';
            listaDiv.style.paddingLeft = '10px';
        }
        
        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.justifyContent = 'espaço-entre';
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
        tituloSpan.innerHTML = éExpandido? `ðŸ“‚ ${lista.nome}` : `ðŸ“ ${lista.nome}`;
        
        const botoesDiv = document.createElement('div');
        botoesDiv.style.display = 'flex';
        botoesDiv.style.gap = '5px';
        
        const addSubListBtn = document.createElement('button');
        addSubListBtn.textContent = 'ðŸ“ +';
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
        addCardBtn.onclick = (e) => { e.stopPropagation(); criarCartão(caminho); };
        
        const editListBtn = document.createElement('button');
        editListBtn.textContent = 'âœ ï¸';
        editListBtn.style.padding = '4px 8px';
        editListBtn.style.background = '#3a86ff';
        editListBtn.style.border = 'none';
        editListBtn.style.borderRadius = '3px';
        editListBtn.style.cursor = 'pointer';
        editListBtn.style.color = 'white';
        editListBtn.onclick = (e) => { e.stopPropagation(); renomearLista(caminho); };
        
        const deleteListBtn = document.createElement('button');
        deleteListBtn.textContent = 'ðŸ—'ï¸ ';
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
        
        se (lista.cards && lista.cards.length > 0) {
            para (let cardIdx = 0; cardIdx < lista.cards.length; cardIdx++) {
                const card = lista.cards[cardIdx];
                const cardDiv = document.createElement('div');
                cardDiv.className = 'cartão';
                cardDiv.style.display = 'flex';
                cardDiv.style.justifyContent = 'espaço-entre';
                cardDiv.style.alignItems = 'center';
                cardDiv.style.background = '#1a1a2e';
                cardDiv.style.borderLeft = '3px solid #e94560';
                cardDiv.style.padding = '6px 8px';
                cardDiv.style.margin = '3px 0';
                cardDiv.style.borderRadius = '3px';
                cardDiv.style.cursor = 'pointer';
                
                const cardTitle = document.createElement('span');
                cardTitle.textContent = `ðŸ“„ ${card.texto}`;
                cardTitle.style.fontSize = '12px';
                cardTitle.style.flex = '1';
                
                const cardActions = document.createElement('div');
                cardActions.style.display = 'flex';
                cardActions.style.gap = '5px';
                
                const editCardBtn = document.createElement('button');
                editCardBtn.textContent = 'âœ ï¸';
                editCardBtn.style.padding = '2px 6px';
                editCardBtn.style.background = '#3a86ff';
                editCardBtn.style.border = 'none';
                editCardBtn.style.borderRadius = '3px';
                editCardBtn.style.cursor = 'pointer';
                editCardBtn.style.color = 'white';
                editCardBtn.style.fontSize = '10px';
                editCardBtn.onclick = (e) => { e.stopPropagation(); renomearCartão(caminho, cardIdx); };
                
                const deleteCardBtn = document.createElement('button');
                deleteCardBtn.textContent = 'ðŸ—'ï¸ ';
                deleteCardBtn.style.padding = '2px 6px';
                deleteCardBtn.style.background = '#e94560';
                deleteCardBtn.style.border = 'none';
                deleteCardBtn.style.borderRadius = '3px';
                deleteCardBtn.style.cursor = 'pointer';
                deleteCardBtn.style.color = 'white';
                deleteCardBtn.style.fontSize = '10px';
                deleteCardBtn.onclick = (e) => { e.stopPropagation(); excluirCartão(caminho, cardIdx); };
                
                cardActions.appendChild(editCardBtn);
                cardActions.appendChild(botãoExcluirCartão);
                cardDiv.appendChild(cardTitle);
                cardDiv.appendChild(cardActions);
                cardDiv.onclick = () => carregarAula(caminho, cardIdx);
                contentContainer.appendChild(cardDiv);
            }
        }
        
        if (lista.sublistas && lista.sublistas.length > 0) {
            para (seja subIdx = 0; subIdx < lista.sublistas.length; subIdx++) {
                const subPath = [...caminho, subIdx];
                const subDiv = renderizarListaRecursiva(lista.sublistas[subIdx], subPath, nivel + 1);
                contentContainer.appendChild(subDiv);
            }
        }
        
        if ((!lista.cards || lista.cards.length === 0) && (!lista.sublistas || lista.sublistas.length === 0)) {
            const emptyMsg = document.createElement('div');
            vazioMsg.textContent = 'ðŸ“ Nenhum conteúdo. Clique em "+" para adicionar cartão ou "ðŸ“ +" para sub-lista.';
            emptyMsg.style.padding = '8px';
            emptyMsg.style.color = '#888';
            emptyMsg.style.fontSize = '11px';
            emptyMsg.style.textAlign = 'center';
            contentContainer.appendChild(emptyMsg);
        }
        
        headerDiv.onclick = (e) => {
            se (e.target.tagName === 'BUTTON') retorne;
            se (expandedPaths.has(pathKey)) {
                expandedPaths.delete(pathKey);
                contentContainer.style.display = 'none';
                tituloSpan.innerHTML = `ðŸ“ ${lista.nome}`;
            } outro {
                expandedPaths.add(pathKey);
                contentContainer.style.display = 'block';
                tituloSpan.innerHTML = `ðŸ“‚ ${lista.nome}`;
            }
        };
        
        listaDiv.appendChild(headerDiv);
        listaDiv.appendChild(contentContainer);
        retornar listaDiv;
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
    se (nome && nome.trim()) {
        const novaListaObj = { nome: nome.trim(), cards: [], sublistas: [] };
        if (caminho === null) dados.listas.push(novaListaObj);
        outro {
            const listaPai = obterListaPorCaminho(caminho);
            se (listaPai) {
                if (!listaPai.sublistas) listaPai.sublistas = [];
                listaPai.sublistas.push(novaListaObj);
                const parentKey = obterChaveDoCaminho(caminho);
                expandedPaths.add(parentKey);
            }
        }
        salvarDados();
        alert(`âœ… Lista "${nome.trim()}" criada!`);
    }
}

function criarCartão(caminho) {
    const nome = prompt("Nome do novo cartão:");
    se (nome && nome.trim()) {
        const lista = obterListaPorCaminho(caminho);
        se (lista) {
            if (!lista.cards) lista.cards = [];
            lista.cards.push({
                texto: nome.trim(),
                conteudo: `# ${nome.trim()}\n\nDigite seu conteúdo aqui...`,
                últimaModificação: Date.now()
            });
            const parentKey = obterChaveDoCaminho(caminho);
            expandedPaths.add(parentKey);
            salvarDados();
            alert(`âœ… Cartão "${nome.trim()}" criado!`);
        }
    }
}

function renomearLista(caminho) {
    const lista = obterListaPorCaminho(caminho);
    se (!lista) retornar;
    const novoNome = prompt("Novo nome:", lista.nome);
    if (novoNome && novoNome.trim()) {
        lista.nome = novoNome.trim();
        salvarDados();
        alert("âœ…Lista renomeada!");
    }
}

function excluirLista(caminho) {
    const lista = obterListaPorCaminho(caminho);
    se (!lista) retornar;
    if (confirm(`Excluir a lista "${lista.nome}" e todo seu conteúdo?`)) {
        const pathStr = obterChaveDoCaminho(caminho);
        para (seja chave de expandedPaths) {
            se (chave.começaCom(caminhoStr)) {
                expandedPaths.delete(key);
            }
        }
        
        if (caminho.length === 1) dados.listas.splice(caminho[0], 1);
        outro {
            const paiPath = caminho.slice(0, -1);
            const listaPai = obterListaPorCaminho(paiPath);
            const idx = caminho[caminho.comprimento - 1];
            listaPai.sublistas.splice(idx, 1);
        }
        salvarDados();
        alert("âœ… Lista excluída!");
    }
}

function renomearCartão(caminho, cardIdx) {
    const lista = obterListaPorCaminho(caminho);
    if (!lista || !lista.cards[cardIdx]) return;
    const novoNome = prompt("Novo nome:", lista.cards[cardIdx].texto);
    if (novoNome && novoNome.trim()) {
        lista.cards[cardIdx].texto = novoNome.trim();
        salvarDados();
        alert("âœ…Cartão renomeado!");
    }
}

function excluirCartão(caminho, cardIdx) {
    const lista = obterListaPorCaminho(caminho);
    if (!lista || !lista.cards[cardIdx]) return;
    if (confirm(`Excluir o cartão "${lista.cards[cardIdx].texto}"?`)) {
        lista.cards.splice(cardIdx, 1);
        salvarDados();
        alert("âœ…Cartão excluído!");
    }
}

function carregarAula(caminho, cardIdx) {
    const lista = obterListaPorCaminho(caminho);
    if (!lista || !lista.cards[cardIdx]) return;
    const card = lista.cards[cardIdx];
    listaAtual = caminho;
    cartaoAtual = cardIdx;
    editor.value = card.conteudo;
    se (timeoutRenderTimer) limparTimeout(timeoutRenderTimer);
    renderizar();
}

função salvarAulaAtual() {
    se (listaAtual !== null && cartaoAtual !== null) {
        const lista = obterListaPorCaminho(listaAtual);
        if (lista && lista.cards[cartaoAtual]) {
            lista.cartões[cartaoAtual].conteudo = editor.valor;
            lista.cards[cartaoAtual].ultimaModificação = Date.now();
            salvarDados();
        }
    }
}

// ============================================
// FUNÇÕES DE CORES DO ABC INFANTIL
// ============================================
função obterCorPorNota(nota) {
    const cores = { 'C': '#FF0000', 'D': '#FF6600', 'E': '#FFDD00', 'F': '#00CC00', 'G': '#0066FF', 'A': '#4B0082', 'B': '#8B00FF' };
    retornar núcleos[nota.toUpperCase()] || '#000000';
}

function getCorPorTag(texto) {
    se (!texto) retorne "#000000";
    se (texto.includes("[r]")) retorne "#FF0000";
    if (texto.includes("[o]")) return "#FF6600";
    se (texto.includes("[y]")) retorne "#FFDD00";
    se (texto.includes("[g]")) retorne "#00CC00";
    se (texto.includes("[b]")) retorne "#0066FF";
    se (texto.includes("[i]")) retorne "#4B0082";
    se (texto.includes("[v]")) retorne "#8B00FF";
    retornar "#000000";
}

function aplicarCoresNasNotas() {
    se (!coresAtivas) retornar;
    document.querySelectorAll("#preview .abcjs-note").forEach(nota => {
        deixe cabeca = nota.querySelector('ellipse, círculo');
        if (!cabeca) cabeca = nota.querySelector('caminho');
        se (cabeca) {
            deixe textoNota = nota.textContent || '';
            deixe corresponder = textoNota.match(/[CDEFGAB]/i);
            se (correspondência) {
                cabeca.style.fill = obterCorPorNota(match[0]);
                cabeca.style.fillOpacity = '1';
            }
        }
    });
}

function aplicarCoresAcordesLetras() {
    document.querySelectorAll("#preview .abcjs-chord, #preview .abcjs-lyric").forEach(el => {
        deixe texto = el.textContent || '';
        deixe cor = getCorPorTag(texto);
        if (cor !== "#000000") el.style.fill = cor;
        el.textContent = texto.replace(/\[(.*?)\]/g, "");
    });
}

// ============================================
// PROCESSAR ABC COM ESPAÇO
// ============================================
function processarABCComEspacionamento(id, código, tipo) {
    const elemento = document.getElementById(id);
    se (!elemento) retornar;
    
    const staffsep = document.getElementById("staffsepRange")?.value || 60;
    const sysstaffsep = document.getElementById("sysstaffsepRange")?.value || 80;
    
    deixe linhas = code.split('\n');
    seja novasLinhas = [];
    seja hasStaffsep = falso, hasSysstaffsep = falso;
    
    para (seja linha de linhas) {
        if (linha.trim().startsWith('%%staffsep')) {
            novasLinhas.push(`%%staffsep ${staffsep}`);
            hasStaffsep = verdadeiro;
        } else if (linha.trim().startsWith('%%sysstaffsep')) {
            novasLinhas.push(`%%sysstaffsep ${sysstaffsep}`);
            hasSysstaffsep = verdadeiro;
        } outro {
            novasLinhas.push(linha);
        }
    }
    
    if (!hasStaffsep && linhas.length > 0) novasLinhas.unshift(`%%staffsep ${staffsep}`);
    if (!hasSysstaffsep && linhas.length > 0) novasLinhas.unshift(`%%sysstaffsep ${sysstaffsep}`);
    
    let codigoProcessado = novasLinhas.join('\n');
    
    tentar {
        elemento.innerHTML = "";
        ABCJS.renderAbc(id, codigoProcessado, { add_classes: true, staffwidth: 800, responsive: 'resize' });
        se (tipo === 'infantil') {
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
// FUNÃ‡Ã•ES DE AJUSTE
// ============================================
função ajustarAcordes() {
    const valor = parseFloat(document.getElementById("acordeRange")?.valor || -8);
    document.getElementById("acordeValue").innerText = valor;
    document.querySelectorAll("#preview .abcjs-chord").forEach(el => {
        deixe yAtual = parseFloat(el.getAttribute("y"));
        se (!isNaN(yAtual)) {
            if (!el.dataset.yOriginal) el.dataset.yOriginal = yAtual;
            el.setAttribute("y", parseFloat(el.dataset.yOriginal) + valor);
        }
    });
}

função ajustarLetras() {
    const valor = parseFloat(document.getElementById("letraRange")?.valor || 12);
    document.getElementById("letraValue").innerText = valor;
    document.querySelectorAll("#preview .abcjs-lyric").forEach(el => {
        deixe yAtual = parseFloat(el.getAttribute("y"));
        se (!isNaN(yAtual)) {
            if (!el.dataset.yOriginal) el.dataset.yOriginal = yAtual;
            el.setAttribute("y", parseFloat(el.dataset.yOriginal) + valor);
        }
    });
}

função ajustarLetrasX() {
    const valor = parseFloat(document.getElementById("letraXRange")?.valor || 5);
    document.getElementById("letraXValue").innerText = valor;
    document.querySelectorAll("#preview .abcjs-lyric").forEach(el => {
        deixe xAtual = parseFloat(el.getAttribute("x"));
        se (!isNaN(xAtual)) {
            se (!el.dataset.xOriginal) el.dataset.xOriginal = xAtual;
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
função normalizarNota(nota) {
    const eq = { 'Eb': 'D#', 'Bb': 'A#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#' };
    para (const [bemol, sustain] de Object.entries(eq)) {
        if (nota.startsWith(bemol)) return sustentação + nota.replace(bemol, '');
    }
    retornar nota;
}

function desenharTecladoPiano(container, sigla, nome, notasAcorde, startOitava, endOitava, dedosTreble) {
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-block; margin: 10px auto; text-align: center; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
    
    const title = document.createElement('div');
    title.style.cssText = 'font-size: 1.6em; font-weight: bold; color: #e94560; margin-bottom: 10px;';
    título.textoConteúdo = nome;
    wrapper.appendChild(título);
    
    const pianoDiv = document.createElement('div');
    pianoDiv.style.cssText = 'display: flex; position: relative; background: #131212; padding: 3px; border-radius: 4px;';
    
    const escala = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const startMatch = startOitava.match(/^([AG])(\d+)$/);
    const endMatch = endOitava.match(/^([AG])(\d+)$/);
    
    if (!startMatch || !endMatch) {
        container.innerHTML = '<div style="color:red">Erro no range</div>';
        retornar;
    }
    
    const pretasMap = { 'C#3':0,'D#3':1,'F#3':3,'G#3':4,'A#3':5,'C#4':7,'D#4':8,'F#4':10,'G#4':11,'A#4':12,'C#5':14,'D#5':15,'F#5':17,'G#5':18,'A#5':19 };
    const whiteKeyWidth = 37, whiteKeyHeight = 120, blackKeyWidth = 25, blackKeyHeight = 79, blackKeyOffset = 34;
    
    const teclasNoRange = [];
    for (let oct = parseInt(startMatch[2]); oct <= parseInt(endMatch[2]); oct++) {
        para (seja i = 0; i < escala.length; i++) {
            const nota = escala[i];
            const num = (oct + 1) * 12 + i;
            if (num >= (parseInt(startMatch[2]) + 1) * 12 + escala.indexOf(startMatch[1]) && num <= (parseInt(endMatch[2]) + 1) * 12 + escala.indexOf(endMatch[1])) {
                teclasNoRange.push({ nota, oitava: out });
            }
        }
    }
    
    const whiteKeys = teclasNoRange.filter(t => !t.nota.includes('#'));
    const blackKeys = [];
    NoRange.forEach(t => {
        se (t.nota.inclui('#')) {
            const pos = pretasMap[t.nota + t.oitava];
            if (pos !== undefined) blackKeys.push({ ...t, pos });
        }
    });
    
    function getDedo(notaNome, oitava) {
        const notaCompleta = notaNome + oitava;
        para (let i = 0; i < notasAcorde.length; i++) {
            se (normalizarNota(notasAcorde[i]) === normalizarNota(notaCompleta)) retorne dedosTreble[i] || null;
        }
        retornar nulo;
    }
    
    whiteKeys.forEach(tecla => {
        const dedo = getDedo(tecla.nota, tecla.oitava);
        const isActive = dedo !== null;
        const whiteKey = document.createElement('div');
        whiteKey.style.cssText = `largura: ${whiteKeyWidth}px; altura: ${whiteKeyHeight}px; fundo: ${isActive ? 'linear-gradient(to bottom, #3a86ff 0%, #2666cc 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)'}; borda: 1px sólida #333; raio da borda: 0 0 8px 8px; posição: relativa; sombra: 0 2px 5px rgba(0,0,0,0.2); índice z: 1; cursor: padrão;`;
        se (dedo) {
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
        blackKey.style.cssText = `largura: ${blackKeyWidth}px; altura: ${blackKeyHeight}px; fundo: ${isActive ? 'linear-gradient(to bottom, #ff4757 0%, #cc2233 100%)' : 'linear-gradient(to bottom, #222 0%, #111 100%)'}; posição: absoluta; esquerda: ${tecla.pos * whiteKeyWidth + blackKeyOffset}px; topo: 0; raio da borda: 0 0 5px 5px; sombra da caixa: 0 3px 8px rgba(0,0,0,0.4); índice z: 2; cursor: padrão;`;
        se (dedo) {
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
    
    se (!acorde) {
        container.innerHTML = `<div style="color:red; padding:10px;">â Œ Acordo personalizado não encontrado</div>`;
        retornar;
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
    título.textoConteúdo = nome;
    wrapper.appendChild(título);
    
    const pianoDiv = document.createElement('div');
    pianoDiv.style.cssText = 'display: flex; position: relative; background: #131212; padding: 3px; border-radius: 4px;';
    
    const escala = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const startMatch = startOitava.match(/^([AG])(\d+)$/);
    const endMatch = endOitava.match(/^([AG])(\d+)$/);
    
    if (!startMatch || !endMatch) {
        container.innerHTML = '<div style="color:red">Erro no range</div>';
        retornar;
    }
    
    const pretasMap = { 'C#3':0,'D#3':1,'F#3':3,'G#3':4,'A#3':5,'C#4':7,'D#4':8,'F#4':10,'G#4':11,'A#4':12,'C#5':14,'D#5':15,'F#5':17,'G#5':18,'A#5':19 };
    const whiteKeyWidth = 37, whiteKeyHeight = 120, blackKeyWidth = 25, blackKeyHeight = 79, blackKeyOffset = 34;
    
    const teclasNoRange = [];
    for (let oct = parseInt(startMatch[2]); oct <= parseInt(endMatch[2]); oct++) {
        para (seja i = 0; i < escala.length; i++) {
            const nota = escala[i];
            const num = (oct + 1) * 12 + i;
            if (num >= (parseInt(startMatch[2]) + 1) * 12 + escala.indexOf(startMatch[1]) && num <= (parseInt(endMatch[2]) + 1) * 12 + escala.indexOf(endMatch[1])) {
                teclasNoRange.push({ nota, oitava: out });
            }
        }
    }
    
    const whiteKeys = teclasNoRange.filter(t => !t.nota.includes('#'));
    const blackKeys = [];
    NoRange.forEach(t => {
        se (t.nota.inclui('#')) {
            const pos = pretasMap[t.nota + t.oitava];
            if (pos !== undefined) blackKeys.push({ ...t, pos });
        }
    });
    
    função getDedo(notaNome, idx) {
        se (dedosTreble && dedosTreble.length > 0) {
            const notaIndex = notasAtivas.indexOf(notaNome);
            se (notaIndex !== -1 && dedosTreble[notaIndex]) retorne dedosTreble[notaIndex];
        }
        const mapa = { 'C':'1', 'D':'2', 'E':'3', 'F':'4', 'G':'5', 'A':'1', 'B':'2', 'C#':'2', 'D#':'3', 'F#':'4', 'G#':'5', 'A#':'1' };
        retornar mapa[notaNome] || nulo;
    }
    
    whiteKeys.forEach(tecla => {
        const isActive = notasAtivas.includes(tecla.nota);
        const dedo = isActive? getDedo(tecla.nota) : null;
        const whiteKey = document.createElement('div');
        whiteKey.style.cssText = `largura: ${whiteKeyWidth}px; altura: ${whiteKeyHeight}px; fundo: ${isActive ? 'linear-gradient(to bottom, #3a86ff 0%, #2666cc 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)'}; borda: 1px sólida #333; raio da borda: 0 0 8px 8px; posição: relativa; sombra: 0 2px 5px rgba(0,0,0,0.2); índice z: 1; cursor: padrão;`;
        se (dedo) {
            const dedoDiv = document.createElement('div');
            dedoDiv.textContent = dedo;
            dedoDiv.style.cssText = `position: absolute; top: 80%; left: 50%; transform: translate(-50%, -50%); width: 23px; height: 25px; background: white; color: #3a86ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: bold; font-family: Arial; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10;`;
            whiteKey.appendChild(dedoDiv);
        }
        pianoDiv.appendChild(whiteKey);
    });
    
    blackKeys.forEach(tecla => {
        const isActive = notasAtivas.includes(tecla.nota);
        const dedo = isActive? getDedo(tecla.nota) : null;
        const blackKey = document.createElement('div');
        blackKey.style.cssText = `largura: ${blackKeyWidth}px; altura: ${blackKeyHeight}px; fundo: ${isActive ? 'linear-gradient(to bottom, #ff4757 0%, #cc2233 100%)' : 'linear-gradient(to bottom, #222 0%, #111 100%)'}; posição: absoluta; esquerda: ${tecla.pos * whiteKeyWidth + blackKeyOffset}px; topo: 0; raio da borda: 0 0 5px 5px; sombra da caixa: 0 3px 8px rgba(0,0,0,0.4); índice z: 2; cursor: padrão;`;
        se (dedo) {
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
função renderizar() {
    console.log("Renderizando...");
    deixe conteudo = editor.valor || '';
    
    tentar {
        letse = conteudo;
        const acordes = [];
        const pianos = [];
        const abcInfantis = [];
        const abcNormais = [];
        const pianosCustom = [];
        
        processado = processado.replace(/\[Acorde:([^\]]+)\]([\s\S]*?)\[\/Acorde\]/g, (match, sigla, nome) => {
            const id = 'chord-' + Date.now() + '-' + acordes.length;
            acordes.push({ id, sigla: sigla.trim(), nome: nome ? nome.trim() : '' });
            retornar `<div id="${id}" class="chord-diagram"></div>`;
        });
        
        processado = processado.replace(/\[PIANO:([^\]]+)\]([\s\S]*?)\[\/PIANO\]/g, (match, sigla, nome) => {
            const id = 'piano-' + Date.now() + '-' + pianos.length;
            pianos.push({ id, sigla: sigla.trim(), nome: nome.trim() });
            retornar `<div id="${id}" class="piano-diagram-container"></div>`;
        });
        
        processado = processado.replace(/\[PIANO-CUSTOM:([^\]]+)\]([\s\S]*?)\[\/PIANO-CUSTOM\]/g, (match, sigla, nome) => {
            const id = 'piano-custom-' + Date.now() + '-' + pianosCustom.length;
            pianosCustom.push({ id, sigla: sigla.trim(), nome: nome.trim() });
            retornar `<div id="${id}" class="piano-diagram-container"></div>`;
        });
        
        processado = processado.replace(/\[ABC-INFANTIL\]([\s\S]*?)\[\/ABC-INFANTIL\]/g, (correspondência, código) => {
            const id = 'abc-inf-' + Date.now() + '-' + abcInfantis.length;
            abcInfantis.push({ id, code: code.trim() });
            retornar `<div id="${id}" class="abc-container"></div>`;
        });
        
        processado = processado.replace(/\[ABC\]([\s\S]*?)\[\/ABC\]/g, (match, code) => {
            const id = 'abc-' + Date.now() + '-' + abcNormais.length;
            abcNormais.push({ id, code: code.trim() });
            retornar `<div id="${id}" class="abc-container"></div>`;
        });
        
        preview.innerHTML = marcado.parse(processado);
        
        acordes.forEach(a => {
            const el = document.getElementById(a.id);
            if (el) desenharAcorde(el, a.sigla, a.nome);
        });
        
        pianos.forEach(p => {
            const el = document.getElementById(p.id);
            if (el && window.ACORDES_PIANO && window.ACORDES_PIANO[p.sigla]) {
                const a = janela.ACORDES_PIANO[p.sigla];
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
        preview.innerHTML = '<p style="color:red;">â Œ Erro ao renderizar: ' + e.message + '</p>';
    }

    // Dentro da função renderizar(), no final:
setTimeout(() => {
    DiagramasLado organizado();
}, 150);
}

// ============================================
// FUNÇÕES DE FORMAÇÃO
// ============================================
function addFormatacao(antes, depois) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const texto = editor.value;
    const selectedText = texto.substring(start, end);
    deixe novoTexto = texto selecionado? texto.substring(0, início) + antes + texto selecionado + depois + texto.substring(end) : texto.substring(0, início) + antes + depois + texto.substring(end);
    editor.valor = novoTexto;
    editor.setSelectionRange(start + antes.length, start + antes.length);
    renderizar();
    salvarAulaAtual();
    editor.focus();
}

função inserirLink() {
    const url = prompt('Digite uma URL:', 'https://');
    const texto = prompt('Digite o texto do link:', 'Clique aqui');
    se (url && texto) {
        const start = editor.selectionStart;
        editor.value = editor.value.substring(0, start) + `[${texto}](${url})` + editor.value.substring(start);
        renderizar();
        salvarAulaAtual();
    }
}

função inserirImagem() {
    const url = prompt('Digite a URL da imagem:', 'https://via.placeholder.com/300x200');
    const alt = prompt('Digite o texto alternativo:', 'Imagem');
    se (url && alt) {
        const start = editor.selectionStart;
        editor.value = editor.value.substring(0, start) + `![${alt}](${url})` + editor.value.substring(start);
        renderizar();
        salvarAulaAtual();
    }
}

// ============================================
// FUNÇÃO INSERIR ACORDE (PRINCIPAL)
// ============================================
função inserirAcorde() {
    const opcao = prompt(
        'ðŸŽ¸ INSERIR ACORDE\n\n' +
        '1 - Biblioteca Básica (C, G, Am, F, D, Em)\n' +
        '2 - Minha Biblioteca (acordes salvos)\n' +
        '3 - Acorde Dinâmico (1;3 = Sol Maior)\n' +
        '4 - Editor de Acordes\n\n' +
        'Digite o número da opção:'
    );
    
    // Opção 1: Biblioteca Básica
    se (opcao === '1') {
        const sigla = prompt('Digite a sigla do acorde (C, G, D, Am, Em, F):', 'C');
        if (sigla && janela.ACORDES && janela.ACORDES[sigla]) {
            inserirCodigoAcorde(`[Acorde:${sigla}]${window.ACORDES[sigla].nome}[/Acorde]`);
        } senão se (sigla) {
            alert(`â Œ Acordo "${sigla}" não encontrado! Use: C, G, D, Am, Em, F`);
        }
    }
    
    // Opção 2: Minha Biblioteca
    senão se (opcao === '2') {
        if (typeof bibliotecaAcordes !== 'undefined' && Object.keys(bibliotecaAcordes).length > 0) {
            const lista = Object.entries(bibliotecaAcordes)
                .map(([sigla, acorde]) => `${sigla} - ${acorde.nome}`)
                .join('\n');
            const sigla = prompt(`ðŸ“š SEUS ACORDES SALVOS:\n\n${lista}\n\nDigite a sigla:`, '');
            if (sigla && bibliotecaAcordes[sigla]) {
                inserirCodigoAcorde(`[Acorde:${sigla}]${bibliotecaAcordes[sigla].nome}[/Acorde]`);
            } senão se (sigla) {
                alert(`â Œ Acordo "${sigla}" não encontrado!`);
            }
        } outro {
            alert('ðŸ“Nenhum acorde salvo! Use a opção 4 para criar.');
        }
    }
    
    // Opção 3: Acorde Dinâmico
    senão se (opcao === '3') {
        const formato = prompt(
            'ðŸŽ¸ Acorde Dinâmico\n\n' +
            'Formatos:\n' +
            'â€¢ 1;3 = Sol Maior (forma maior, casa 3)\n' +
            '€¢ 2;5 = Lá Menor (forma menor, casa 5)\n' +
            'â€¢ 1;3;5 = DÃ³ Maior (corda base 5)\n\n' +
            'Digite o formato:'
        );
        
        se (formato && typeof window.processarAcordeDinamico === 'function') {
            const acordeTemp = window.processarAcordeDinamico(formato, '');
            se (acordeTemp) {
                inserirCodigoAcorde(`[Acorde:${formato}]${acordeTemp.nome}[/Acorde]`);
            } outro {
                alert(`â Œ Formato "${formato}" inválido! Exemplo: 1;3`);
            }
        } else if (formato) {
            alert('â Œ Módulo de acordes sonoros não carregado!');
        }
    }
    
    // Opção 4: Editor de Acordes
    senão se (opcao === '4') {
        abrirEditorAcordes();
    }
    senão se (opcao !== nulo) {
        alert('Opção inválida! Digite 1, 2, 3 ou 4');
    }
}

função inserirABC() {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + `[ABC]\nX:1\nM:4/4\nL:1/8\nK:C\nC DEF | GAB c |]\n[/ABC]\n` + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

função inserirABCInfantil() {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + `[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/4\nK:C\nC DEF | GAB c |]\n[/ABC-INFANTIL]\n` + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

função inserirPiano() {
    const sigla = prompt('Sigla (C, G, Am, F, Dm):', 'C');
    se (!sigla) retornar;
    const acordePiano = janela.ACORDES_PIANO ? janela.ACORDES_PIANO[sigla] : null;
    const nome = acordePiano ? acordePiano.nome : sigla;
    const start = editor.selectionStart;
    const código = `[PIANO:${sigla}]${nome}[/PIANO]`;
    editor.value = editor.value.substring(0, start) + codigo + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

// ============================================
// FUNÃ‡Ã•ES DE UI
// ============================================
função toggleCoresNotas() {
    coresAtivas = !coresAtivas;
    const btn = document.getElementById("btnCores");
    se (botão) {
        btn.style.background = coresAtivas ? "#00CC00" : "#CC0000";
        btn.textContent = coresAtivas ? "âœ… Núcleos" : "â Œ Núcleos";
    }
    se (coresAtivas) {
        aplicarCoresNasNotas();
        aplicarCoresAcordesLetras();
    }
}

função toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('collapsed');
}

função toggleCategoria(menuId) {
    document.getElementById(menuId)?.classList.toggle('collapsed');
}

função abrirModalPiano() {
    const modal = document.getElementById('modalPiano');
    se (modal) modal.style.display = 'block';
    se (typeof initPiano === 'function') initPiano();
}

função fecharModalPiano() {
    const modal = document.getElementById('modalPiano');
    se (modal) modal.style.display = 'nenhum';
}

function abrirEditorAcordes() {
    const modal = document.getElementById('modalAcordes');
    se (modal) {
        se (typeof carregarBiblioteca === 'function') carregarBiblioteca();
        modal.style.display = 'block';
        const campoPesquisa = document.getElementById('pesquisaAcordes');
        se (campoPesquisa) {
            campoPesquisa.value = '';
            campoPesquisa.focus();
            se (typeof atualizarBibliotecaVisual === 'function') {
                campoPesquisa.oninput = () => atualizarBibliotecaVisual();
            }
        }
    } outro {
        alert('Modal do editor de acordes não encontrado!');
    }
}

function fecharEditorAcordes() {
    const modal = document.getElementById('modalAcordes');
    se (modal) modal.style.display = 'nenhum';
}

função resetarAcordes() {
    if (confirm('Redefinir acordes?')) {
        localStorage.removeItem('acordes_personalizados_usuario');
        alert('Acordes resetados!');
    }
}

function exportHTML() { alert("ðŸ“„ Exportação HTML em desenvolvimento"); }
function exportAppHTML() { alert("ðŸ“± Exportação App em desenvolvimento"); }
função gerarPreviewAcordes() {}
function salvarAcordeNaBiblioteca() {}
função copiarCódigoAcordes() {}

função toast(msg, tipo) {
    const t = document.createElement("div");
    t.textContent = msg;
    const bgColor = tipo === 'success' ? '#2ed573' : '#3a86ff';
    t.style.cssText = `position:fixed; bottom:20px; right:20px; background:${bgColor}; color:white; padding:12px 20px; border-radius:8px; z-index:9999; animation:fadeOut 3s forwards; font-weight:bold;`;
    documento.corpo.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}







// ============================================
// INICIALIZAÇÃOÃ‡ÃƒO
// ============================================
função init() {
    console.log("Inicializando o sistema...");
    
    if (typeof window.processarAcordeDinamico !== 'function') {
        console.warn('âš ï¸ acordes_dinamicos.js não carregados. Acordes sonoros não funcionam.');
    } outro {
        console.log('âœ… Módulo de acordes sonoros carregados!');
        adicionarBotaoSalvarDinamico();
    }
    
    carregarDados();
    
    se (editor) {
        editor.addEventListener('input', () => {
            limparTimeout(timeoutRenderTimer);
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
