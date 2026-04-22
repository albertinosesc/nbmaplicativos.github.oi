// ============================================
// PRO MAESTRO - SISTEMA COMPLETO
// ============================================

// Variáveis globais
let dados = {
    listas: []
};

let listaAtual = null;
let cartaoAtual = null;
let timeoutRenderTimer;
let coresAtivas = true;

const STORAGE_KEY = 'pro_maestro_listas';
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const listaAulas = document.getElementById('listaAulas');

// ============================================
// DICIONÁRIO DE ACORDES
// ============================================
const ACORDES = {
    'C': { nome: 'Dó Maior', cordas: [-1,3,2,0,1,0], dedos: ['','3','2','','1',''], pestana: false, casaInicial: 1 },
    'G': { nome: 'Sol Maior', cordas: [3,2,0,0,0,3], dedos: ['2','1','','','','3'], pestana: false, casaInicial: 1 },
    'D': { nome: 'Ré Maior', cordas: [-1,0,0,2,3,2], dedos: ['','','','2','3','1'], pestana: false, casaInicial: 1 },
    'Am': { nome: 'Lá Menor', cordas: [-1,0,2,2,1,0], dedos: ['','','2','3','1',''], pestana: false, casaInicial: 1 },
    'Em': { nome: 'Mi Menor', cordas: [0,2,2,0,0,0], dedos: ['','2','3','','',''], pestana: false, casaInicial: 1 },
    'F': { nome: 'Fá Maior', cordas: [1,3,3,2,1,1], dedos: ['1','3','4','2','1','1'], pestana: true, casaInicial: 1 }
};

const ACORDES_PIANO = {
    'C': { nome: 'Dó Maior', notas: ['C3', 'E3', 'G3'], startOitava: 'C3', endOitava: 'C4', dedosTreble: ['1', '3', '5'] },
    'G': { nome: 'Sol Maior', notas: ['G3', 'B3', 'D4'], startOitava: 'G3', endOitava: 'G4', dedosTreble: ['1', '3', '5'] },
    'Am': { nome: 'Lá Menor', notas: ['A3', 'C4', 'E4'], startOitava: 'A3', endOitava: 'A4', dedosTreble: ['1', '3', '5'] },
    'F': { nome: 'Fá Maior', notas: ['F3', 'A3', 'C4'], startOitava: 'F3', endOitava: 'F4', dedosTreble: ['1', '3', '5'] },
    'Dm': { nome: 'Ré Menor', notas: ['D3', 'F3', 'A3'], startOitava: 'D3', endOitava: 'D4', dedosTreble: ['1', '3', '5'] }
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function getListaByPath(path) {
    if (!path || path.length === 0) return null;
    let current = dados.listas[path[0]];
    for (let i = 1; i < path.length; i++) {
        if (!current || !current.subListas) return null;
        current = current.subListas[path[i]];
    }
    return current;
}

function getDadosPadrao() {
    return {
        listas: [
            {
                nome: "Piano",
                cards: [
                    { texto: "Escala de Dó Maior", conteudo: "# Escala de Dó Maior\n\n[PIANO:C]Dó Maior[/PIANO]\n\n[ABC]\nX:1\nM:4/4\nL:1/8\nK:C\nC D E F | G A B c |]\n[/ABC]", ultimaModificacao: Date.now() },
                    { texto: "Acordes Básicos", conteudo: "# Acordes Básicos\n\n[PIANO:C]Dó Maior[/PIANO]\n[PIANO:G]Sol Maior[/PIANO]\n[PIANO:Am]Lá Menor[/PIANO]", ultimaModificacao: Date.now() }
                ],
                subListas: [
                    {
                        nome: "Exercícios",
                        cards: [
                            { texto: "Hanon 1", conteudo: "# Hanon 1\n\nExercício para dedos.", ultimaModificacao: Date.now() }
                        ],
                        subListas: []
                    }
                ]
            },
            {
                nome: "Violão",
                cards: [
                    { texto: "Acordes Iniciantes", conteudo: "# Acordes Iniciantes\n\n[Acorde:C]Dó Maior[/Acorde]\n[Acorde:G]Sol Maior[/Acorde]\n[Acorde:Am]Lá Menor[/Acorde]", ultimaModificacao: Date.now() }
                ],
                subListas: []
            },
            {
                nome: "Teoria Musical",
                cards: [
                    { texto: "Partitura Infantil", conteudo: "# Partitura Colorida\n\n[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c |]\nw: Dó Ré Mi Fá Sol Lá Si Dó\n[/ABC-INFANTIL]", ultimaModificacao: Date.now() }
                ],
                subListas: []
            }
        ]
    };
}




// ============================================
// PROCESSAR ACORDE DINÂMICO [Acorde:forma;casa]
// ============================================
function processarAcordeDinamico(sigla, nome) {
    console.log("processarAcordeDinamico chamado com:", sigla, nome);
    
    // Formatos: [Acorde:1;3] ou [Acorde:1;3;5]
    let match = sigla.match(/^(\d+);(\d+)$/);
    let matchComCorda = sigla.match(/^(\d+);(\d+);(\d+)$/);
    
    if (!match && !matchComCorda) return null;
    
    let forma, casa, cordaBase;
    
    if (matchComCorda) {
        forma = parseInt(matchComCorda[1]);
        casa = parseInt(matchComCorda[2]);
        cordaBase = parseInt(matchComCorda[3]);
    } else {
        forma = parseInt(match[1]);
        casa = parseInt(match[2]);
        cordaBase = 6;
    }
    
    // FORMAS DE ACORDE (sempre com pestana na casa 1)
    const formas = {
        '6_1': { cordas: [1, 3, 3, 2, 1, 1], dedos: ['1', '3', '4', '2', '1', '1'], pestana: true, nome: 'Maior' },
        '6_2': { cordas: [1, 2, 3, 3, 1, 1], dedos: ['1', '2', '3', '4', '1', '1'], pestana: true, nome: 'Menor' },
        '6_3': { cordas: [1, 3, 2, 2, 1, 1], dedos: ['1', '3', '2', '4', '1', '1'], pestana: true, nome: 'Sétima' },
        '5_1': { cordas: [-1, 1, 3, 3, 3, 1], dedos: ['', '1', '3', '4', '2', '1'], pestana: true, nome: 'Maior' },
        '5_2': { cordas: [-1, 1, 2, 2, 3, 1], dedos: ['', '1', '2', '3', '4', '1'], pestana: true, nome: 'Menor' },
        '5_3': { cordas: [-1, 1, 3, 2, 3, 1], dedos: ['', '1', '3', '2', '4', '1'], pestana: true, nome: 'Sétima' }
    };
    
    const chave = `${cordaBase}_${forma}`;
    const formaBase = formas[chave];
    
    if (!formaBase) return null;
    
    // Deslocar as cordas baseado na casa (ex: casa=3, deslocamento=2)
    const deslocamento = casa - 1;
    const cordasAjustadas = formaBase.cordas.map(corda => {
        if (corda === -1) return -1;
        if (corda === 0) return 0;
        return corda + deslocamento;
    });
    
    // Gerar nome do acorde
    let nomeGerado = nome;
    if (!nomeGerado || nomeGerado === sigla) {
        const notasPorCasa = {
            6: { 1: 'F', 2: 'F#', 3: 'G', 4: 'G#', 5: 'A', 6: 'A#', 7: 'B', 8: 'C', 9: 'C#', 10: 'D', 11: 'D#', 12: 'E' },
            5: { 1: 'A#', 2: 'B', 3: 'C', 4: 'C#', 5: 'D', 6: 'D#', 7: 'E', 8: 'F', 9: 'F#', 10: 'G', 11: 'G#', 12: 'A' }
        };
        const notaBase = notasPorCasa[cordaBase]?.[casa] || `${casa}ª`;
        nomeGerado = `${notaBase} ${formaBase.nome}`;
    }
    
    return {
        nome: nomeGerado,
        cordas: cordasAjustadas,
        dedos: formaBase.dedos,
        pestana: formaBase.pestana,
        pestanaCasa: 1,
        casaInicial: casa,
        cordaBase: cordaBase,
        baixo: ''
    };
}

// ============================================
// DESENHAR ACORDE DE VIOLÃO (VERSÃO CORRIGIDA)
// ============================================
function desenharAcorde(container, sigla, nomeParam = '') {
    let acorde = ACORDES[sigla];
    let nomeExibido = nomeParam || (acorde ? acorde.nome : sigla);
    
    if (!acorde) {
        if (typeof processarAcordeDinamico !== 'undefined') {
            const acordeDinamico = processarAcordeDinamico(sigla, nomeExibido);
            if (acordeDinamico) {
                acorde = acordeDinamico;
                nomeExibido = acorde.nome;
            }
        }
    }
    
    if (!acorde) {
        container.innerHTML = `<div style="color:red">Acorde "${sigla}" não encontrado</div>`;
        return;
    }
    
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.textAlign = 'center';
    
    const cifraDiv = document.createElement('div');
    cifraDiv.textContent = nomeExibido;
    cifraDiv.style.position = 'absolute';
    cifraDiv.style.top = '-5px';
    cifraDiv.style.left = '48%';
    cifraDiv.style.transform = 'translateX(-50%)';
    cifraDiv.style.fontSize = '1.6em';
    cifraDiv.style.fontWeight = 'bold';
    cifraDiv.style.color = '#e94560';
    wrapper.appendChild(cifraDiv);
    
    const canvas = document.createElement('canvas');
    canvas.width = 130;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const startX = 25, startY = 42, stringSpacing = 18, fretSpacing = 26;
    const numFrets = 5;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(startX + i * stringSpacing, startY);
        ctx.lineTo(startX + i * stringSpacing, startY + numFrets * fretSpacing);
        ctx.stroke();
    }
    for (let i = 0; i <= numFrets; i++) {
        ctx.beginPath();
        ctx.moveTo(startX, startY + i * fretSpacing);
        ctx.lineTo(startX + 5 * stringSpacing, startY + i * fretSpacing);
        ctx.stroke();
    }
    
    // NÚMERO DA CASA (TRANSPOSIÇÃO) - Mostra o número ao lado esquerdo
    if (acorde.casaInicial > 1) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(acorde.casaInicial + 'ª', startX - 18, startY + fretSpacing / 2 + 2);
    }
    
    // PESTANA - SEMPRE NA CASA 1
    if (acorde.pestana) {
        const pestanaY = startY + 12;
        ctx.beginPath();
        ctx.moveTo(startX - 3, pestanaY);
        ctx.lineTo(startX + 5 * stringSpacing + 3, pestanaY);
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.lineWidth = 1.5;
    }
    
    // DESENHAR BOLINHAS
    // IMPORTANTE: As bolinhas devem ser desenhadas SEMPRE nas casas 1 a 5 do diagrama
    // Os valores em acorde.cordas são os valores ABSOLUTOS (ex: 3,5,5,4,3,3)
    // Precisamos converter para valores relativos (1 a 5) para desenhar no diagrama
    acorde.cordas.forEach((casa, i) => {
    const x = startX + i * stringSpacing;
    
    // Usa pestanaCasa (que é 1) para calcular a posição relativa
    const pestanaCasa = acorde.pestanaCasa || 1;
    const casaRelativa = casa - pestanaCasa + 1;
    const isPestana = (acorde.pestana && casa === pestanaCasa);
        
        const isPestana = (acorde.pestana && casa === 1);
        
        if (casa === 0) {
            // Corda solta
            const y = startY - 12;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.strokeStyle = '#333';
            ctx.stroke();
        } else if (casa === -1) {
            // Corda não tocada
            const y = startY - 12;
            ctx.beginPath();
            ctx.moveTo(x - 5, y - 5);
            ctx.lineTo(x + 5, y + 5);
            ctx.moveTo(x + 5, y - 5);
            ctx.lineTo(x - 5, y + 5);
            ctx.stroke();
        } else if (casa > 0 && casaDiagrama > 0 && casaDiagrama <= numFrets && !isPestana) {
            // Nota pressionada - desenha na posição do diagrama
            const y = startY + (casaDiagrama - 1) * fretSpacing + fretSpacing / 2;
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, 2 * Math.PI);
            ctx.fillStyle = '#000000';
            ctx.fill();
            const dedo = acorde.dedos && acorde.dedos[i] ? acorde.dedos[i] : '';
            if (dedo) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(dedo, x, y);
            }
        }
    });
    
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);
}


// ============================================
// ADICIONAR ACORDE PERSONALIZADO
// ============================================
function adicionarAcordePersonalizado(sigla, dados) {
    if (typeof ACORDES === 'undefined') {
        console.error('ACORDES não está definido');
        return false;
    }
    
    // Validar dados do acorde
    if (!dados.cordas || !Array.isArray(dados.cordas) || dados.cordas.length !== 6) {
        console.error('Cordas deve ser um array de 6 posições');
        return false;
    }
    
    // Validar pestana (pode ser boolean ou array)
    if (dados.pestana !== undefined && dados.pestana !== true && !Array.isArray(dados.pestana)) {
        console.error('Pestana deve ser true ou array de índices');
        return false;
    }
    
    // Validar dedos
    if (dados.dedos && (!Array.isArray(dados.dedos) || dados.dedos.length !== 6)) {
        console.error('Dedos deve ser um array de 6 posições');
        return false;
    }
    
    // Adicionar acorde
    ACORDES[sigla] = {
        nome: dados.nome || sigla,
        cordas: dados.cordas,
        dedos: dados.dedos || ['', '', '', '', '', ''],
        pestana: dados.pestana || false,
        casaInicial: dados.casaInicial || 1,
        baixo: dados.baixo || ''
    };
    
    console.log(`✅ Acorde ${sigla} adicionado com sucesso!`);
    return true;
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
            dados = getDadosPadrao();
        }
    } else {
        dados = getDadosPadrao();
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
    
    function renderizarListaRecursiva(lista, path, nivel = 0) {
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
        tituloSpan.innerHTML = `📁 ${lista.nome}`;
        
        const botoesDiv = document.createElement('div');
        botoesDiv.style.display = 'flex';
        botoesDiv.style.gap = '5px';
        
        const addSubListaBtn = document.createElement('button');
        addSubListaBtn.textContent = '📁+';
        addSubListaBtn.style.padding = '4px 8px';
        addSubListaBtn.style.background = '#f39c12';
        addSubListaBtn.style.border = 'none';
        addSubListaBtn.style.borderRadius = '3px';
        addSubListaBtn.style.cursor = 'pointer';
        addSubListaBtn.style.color = 'white';
        addSubListaBtn.style.fontSize = '11px';
        addSubListaBtn.onclick = (e) => { e.stopPropagation(); criarLista(path); };
        
        const addCardBtn = document.createElement('button');
        addCardBtn.textContent = '+';
        addCardBtn.style.padding = '4px 10px';
        addCardBtn.style.background = '#2ecc71';
        addCardBtn.style.border = 'none';
        addCardBtn.style.borderRadius = '3px';
        addCardBtn.style.cursor = 'pointer';
        addCardBtn.style.color = 'white';
        addCardBtn.onclick = (e) => { e.stopPropagation(); criarCartao(path); };
        
        const editListBtn = document.createElement('button');
        editListBtn.textContent = '✏️';
        editListBtn.style.padding = '4px 8px';
        editListBtn.style.background = '#3a86ff';
        editListBtn.style.border = 'none';
        editListBtn.style.borderRadius = '3px';
        editListBtn.style.cursor = 'pointer';
        editListBtn.style.color = 'white';
        editListBtn.onclick = (e) => { e.stopPropagation(); renomearLista(path); };
        
        const deleteListBtn = document.createElement('button');
        deleteListBtn.textContent = '🗑️';
        deleteListBtn.style.padding = '4px 8px';
        deleteListBtn.style.background = '#e94560';
        deleteListBtn.style.border = 'none';
        deleteListBtn.style.borderRadius = '3px';
        deleteListBtn.style.cursor = 'pointer';
        deleteListBtn.style.color = 'white';
        deleteListBtn.onclick = (e) => { e.stopPropagation(); excluirLista(path); };
        
        botoesDiv.appendChild(addSubListaBtn);
        botoesDiv.appendChild(addCardBtn);
        botoesDiv.appendChild(editListBtn);
        botoesDiv.appendChild(deleteListBtn);
        headerDiv.appendChild(tituloSpan);
        headerDiv.appendChild(botoesDiv);
        
        const contentContainer = document.createElement('div');
        contentContainer.className = 'cards-container';
        contentContainer.style.paddingLeft = '10px';
        contentContainer.style.marginTop = '5px';
        contentContainer.style.display = 'none';
        contentContainer.setAttribute('data-lista-path', JSON.stringify(path));
        
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
                editCardBtn.onclick = (e) => { e.stopPropagation(); renomearCartao(path, cardIdx); };
                
                const deleteCardBtn = document.createElement('button');
                deleteCardBtn.textContent = '🗑️';
                deleteCardBtn.style.padding = '2px 6px';
                deleteCardBtn.style.background = '#e94560';
                deleteCardBtn.style.border = 'none';
                deleteCardBtn.style.borderRadius = '3px';
                deleteCardBtn.style.cursor = 'pointer';
                deleteCardBtn.style.color = 'white';
                deleteCardBtn.style.fontSize = '10px';
                deleteCardBtn.onclick = (e) => { e.stopPropagation(); excluirCartao(path, cardIdx); };
                
                cardActions.appendChild(editCardBtn);
                cardActions.appendChild(deleteCardBtn);
                cardDiv.appendChild(cardTitle);
                cardDiv.appendChild(cardActions);
                cardDiv.onclick = () => carregarAula(path, cardIdx);
                contentContainer.appendChild(cardDiv);
            }
        }
        
        if (lista.subListas && lista.subListas.length > 0) {
            for (let subIdx = 0; subIdx < lista.subListas.length; subIdx++) {
                const subPath = [...path, subIdx];
                const subDiv = renderizarListaRecursiva(lista.subListas[subIdx], subPath, nivel + 1);
                contentContainer.appendChild(subDiv);
            }
        }
        
        if ((!lista.cards || lista.cards.length === 0) && (!lista.subListas || lista.subListas.length === 0)) {
            const emptyMsg = document.createElement('div');
            emptyMsg.textContent = '📭 Nenhum conteúdo. Clique em "+" para adicionar cartão ou "📁+" para sub-lista.';
            emptyMsg.style.padding = '8px';
            emptyMsg.style.color = '#888';
            emptyMsg.style.fontSize = '11px';
            emptyMsg.style.textAlign = 'center';
            contentContainer.appendChild(emptyMsg);
        }
        
        let expandido = false;
        headerDiv.onclick = (e) => {
            if (e.target.tagName === 'BUTTON') return;
            expandido = !expandido;
            contentContainer.style.display = expandido ? 'block' : 'none';
            tituloSpan.innerHTML = expandido ? `📂 ${lista.nome}` : `📁 ${lista.nome}`;
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
function criarLista(path) {
    const nome = prompt("Nome da nova lista:");
    if (nome && nome.trim()) {
        const novaListaObj = { nome: nome.trim(), cards: [], subListas: [] };
        if (path === null) dados.listas.push(novaListaObj);
        else {
            const listaPai = getListaByPath(path);
            if (listaPai) {
                if (!listaPai.subListas) listaPai.subListas = [];
                listaPai.subListas.push(novaListaObj);
            }
        }
        salvarDados();
        alert(`✅ Lista "${nome.trim()}" criada!`);
    }
}

function criarCartao(path) {
    const nome = prompt("Nome do novo cartão:");
    if (nome && nome.trim()) {
        const lista = getListaByPath(path);
        if (lista) {
            if (!lista.cards) lista.cards = [];
            lista.cards.push({
                texto: nome.trim(),
                conteudo: `# ${nome.trim()}\n\nDigite seu conteúdo aqui...`,
                ultimaModificacao: Date.now()
            });
            salvarDados();
            alert(`✅ Cartão "${nome.trim()}" criado!`);
        }
    }
}

function renomearLista(path) {
    const lista = getListaByPath(path);
    if (!lista) return;
    const novoNome = prompt("Novo nome:", lista.nome);
    if (novoNome && novoNome.trim()) {
        lista.nome = novoNome.trim();
        salvarDados();
        alert("✅ Lista renomeada!");
    }
}

function excluirLista(path) {
    const lista = getListaByPath(path);
    if (!lista) return;
    if (confirm(`Excluir a lista "${lista.nome}" e todo seu conteúdo?`)) {
        if (path.length === 1) dados.listas.splice(path[0], 1);
        else {
            const paiPath = path.slice(0, -1);
            const listaPai = getListaByPath(paiPath);
            const idx = path[path.length - 1];
            listaPai.subListas.splice(idx, 1);
        }
        salvarDados();
        alert("✅ Lista excluída!");
    }
}

function renomearCartao(path, cardIdx) {
    const lista = getListaByPath(path);
    if (!lista || !lista.cards[cardIdx]) return;
    const novoNome = prompt("Novo nome:", lista.cards[cardIdx].texto);
    if (novoNome && novoNome.trim()) {
        lista.cards[cardIdx].texto = novoNome.trim();
        salvarDados();
        alert("✅ Cartão renomeado!");
    }
}

function excluirCartao(path, cardIdx) {
    const lista = getListaByPath(path);
    if (!lista || !lista.cards[cardIdx]) return;
    if (confirm(`Excluir o cartão "${lista.cards[cardIdx].texto}"?`)) {
        lista.cards.splice(cardIdx, 1);
        salvarDados();
        alert("✅ Cartão excluído!");
    }
}

function carregarAula(path, cardIdx) {
    const lista = getListaByPath(path);
    if (!lista || !lista.cards[cardIdx]) return;
    const card = lista.cards[cardIdx];
    listaAtual = path;
    cartaoAtual = cardIdx;
    editor.value = card.conteudo;
    if (timeoutRenderTimer) clearTimeout(timeoutRenderTimer);
    renderizar();
}

function salvarAulaAtual() {
    if (listaAtual !== null && cartaoAtual !== null) {
        if (dados.listas[listaAtual] && dados.listas[listaAtual].cards[cartaoAtual]) {
            dados.listas[listaAtual].cards[cartaoAtual].conteudo = editor.value;
            dados.listas[listaAtual].cards[cartaoAtual].ultimaModificacao = Date.now();
            salvarDados();
        }
    }
}

// ============================================
// FUNÇÕES DE CORES DO ABC INFANTIL
// ============================================
function getCorPorNota(nota) {
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
                cabeca.style.fill = getCorPorNota(match[0]);
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
function processarABCComEspacamento(id, codigo, tipo) {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    
    const staffsep = document.getElementById("staffsepRange")?.value || 60;
    const sysstaffsep = document.getElementById("sysstaffsepRange")?.value || 80;
    
    let linhas = codigo.split('\n');
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
    for (const [bemol, sustenido] of Object.entries(eq)) {
        if (nota.startsWith(bemol)) return sustenido + nota.replace(bemol, '');
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
            if (el && ACORDES_PIANO[p.sigla]) {
                const a = ACORDES_PIANO[p.sigla];
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
function addFormatacao(before, after) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end);
    let newText = selectedText ? text.substring(0, start) + before + selectedText + after + text.substring(end) : text.substring(0, start) + before + after + text.substring(end);
    editor.value = newText;
    editor.setSelectionRange(start + before.length, start + before.length);
    renderizar();
    salvarAulaAtual();
    editor.focus();
}

function inserirLink() {
    const url = prompt('Digite a URL:', 'https://');
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

function inserirAcorde() {
    const sigla = prompt('Sigla (C, G, D, Am, Em, F) ou formato (1;3):', 'C');
    const acorde = ACORDES[sigla];
    const nome = acorde ? acorde.nome : sigla;
    if (sigla) {
        const start = editor.selectionStart;
        editor.value = editor.value.substring(0, start) + `[Acorde:${sigla}]${nome}[/Acorde]` + editor.value.substring(start);
        renderizar();
        salvarAulaAtual();
    }
}

function inserirABC() {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + `[ABC]\nX:1\nM:4/4\nL:1/8\nK:C\nC D E F | G A B c |]\n[/ABC]\n` + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

function inserirABCInfantil() {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + `[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c |]\n[/ABC-INFANTIL]\n` + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

function inserirPiano() {
    const sigla = prompt('Sigla (C, G, Am, F, Dm):', 'C');
    if (!sigla) return;
    const acordePiano = ACORDES_PIANO[sigla];
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

function toggleSidebar() { document.getElementById('sidebar')?.classList.toggle('collapsed'); }
function toggleCategoria(menuId) { document.getElementById(menuId)?.classList.toggle('collapsed'); }
function abrirModalPiano() { const modal = document.getElementById('modalPiano'); if (modal) modal.style.display = 'block'; if (typeof initPiano === 'function') initPiano(); }
function fecharModalPiano() { const modal = document.getElementById('modalPiano'); if (modal) modal.style.display = 'none'; }
function abrirEditorAcordes() { alert("Editor de Acordes em desenvolvimento"); }
function fecharEditorAcordes() { const modal = document.getElementById('modalAcordes'); if (modal) modal.style.display = 'none'; }
function resetarAcordes() { if (confirm('Resetar acordes?')) { localStorage.removeItem('acordes_personalizados_usuario'); alert('Acordes resetados!'); } }
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
    console.log("Inicializando sistema...");
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

// Adicionar estilo para animação do toast
const styleToast = document.createElement('style');
styleToast.textContent = `@keyframes fadeOut { 0% { opacity: 1; transform: translateX(0); } 70% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); } }`;
document.head.appendChild(styleToast);
