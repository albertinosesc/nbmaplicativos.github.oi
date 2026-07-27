// ============================================
// main4.js - PRO MAESTRO (VERSÃO CORRIGIDA)
// ============================================

// Variáveis
let dados = {
    listas: []
};

// ============================================
// CONFIGURAÇÃO GITHUB
// ============================================
let githubToken = localStorage.getItem('github_token') || '';
let githubRepo = localStorage.getItem('github_repo') || '';
let githubBranch = localStorage.getItem('github_branch') || 'main';
let githubPasta = localStorage.getItem('github_pasta') || 'aulas/';
let listaAtual = null;
let cartaoAtual = null;
let timeoutRenderTimer;
let coresAtivas = true;
let expandedPaths = new Set();

window.githubToken = githubToken;
window.githubRepo = githubRepo;
window.githubBranch = githubBranch;
window.githubPasta = githubPasta;

const STORAGE_KEY = 'pro_maestro_listas';
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const listaAulas = document.getElementById('listaAulas');

// ============================================
// FUNÇÃO OBTER COR POR CÓDIGO
// ============================================
function obterCorPorCodigo(codigo) {
    const cores = {
        r: "#FF0000", // vermelho
        o: "#FF6600", // laranja
        y: "#FFDD00", // amarelo
        g: "#00CC00", // verde
        u: "#0066FF", // azul
        i: "#4B0082", // índigo
        v: "#8B00FF"  // violeta
    };
    return cores[codigo.toLowerCase()] || "#000000";
}

// ============================================
// FUNÇÃO OBTER COR POR NOTA (PARA COMPATIBILIDADE)
// ============================================
function obterCorPorNota(nota) {
    const cores = {
        'C': '#FF0000', 'D': '#FF6600', 'E': '#FFDD00',
        'F': '#00CC00', 'G': '#0066FF', 'A': '#4B0082', 'B': '#8B00FF'
    };
    return cores[nota.toUpperCase()] || '#000000';
}

// ============================================
// FUNÇÃO INTERPRETAR COMANDO DE COR
// ============================================
function interpretarComandoCor(texto) {
    if (!texto) {
        return { elementos: [], cor: "#000000", textoLimpo: "" };
    }

    // Agora usa {} em vez de []
    const match = texto.match(/\{(LN?C?|LC|CN)(r|o|y|g|u|i|v)\}/i);

    if (!match) {
        return { elementos: [], cor: "#000000", textoLimpo: texto };
    }

    const comando = match[1].toUpperCase();
    const codigoCor = match[2].toLowerCase();
    const elementos = [];

    if (comando.includes("N")) elementos.push("nota");
    if (comando.includes("L")) elementos.push("letra");
    if (comando.includes("C")) elementos.push("cifra");

    const textoLimpo = texto.replace(/\{(LN?C?|LC|CN)(r|o|y|g|u|i|v)\}/gi, "").trim();

    return {
        elementos: elementos,
        cor: obterCorPorCodigo(codigoCor),
        textoLimpo: textoLimpo
    };
}

// ============================================
// APLICAR CORES NAS LETRAS (usa {r}, {u}, etc.)
// ============================================
function aplicarCoresNasLetras() {
    if (!coresAtivas) return;

    document.querySelectorAll("#preview .abcjs-lyric").forEach(el => {
        const textoOriginal = el.textContent || "";
        
        // Procura por {r}, {u}, {g}, etc.
        const match = textoOriginal.match(/\{(r|o|y|g|u|i|v)\}/i);
        
        if (match) {
            const codigoCor = match[1].toLowerCase();
            const cor = obterCorPorCodigo(codigoCor);
            el.style.fill = cor;
            el.textContent = textoOriginal.replace(/\{(r|o|y|g|u|i|v)\}/gi, "").trim();
        }
    });
}

// ============================================
// APLICAR CORES NAS CIFRAS (usa {Cr}, {Cu}, etc.)
// ============================================
function aplicarCoresNasCifras() {
    if (!coresAtivas) return;

    document.querySelectorAll("#preview .abcjs-chord").forEach(el => {
        const textoOriginal = el.textContent || "";
        
        // Procura por {Cr}, {Cu}, etc.
        let match = textoOriginal.match(/\{C(r|o|y|g|u|i|v)\}/i);
        let cor = null;
        let textoLimpo = textoOriginal;
        
        if (match) {
            cor = obterCorPorCodigo(match[1].toLowerCase());
            textoLimpo = textoOriginal.replace(/\{C(r|o|y|g|u|i|v)\}/gi, "").trim();
        }
        
        if (cor) {
            el.style.fill = cor;
            el.textContent = textoLimpo;
        }
    });
}

// ============================================
// APLICAR CORES NAS NOTAS (usa {Nr}, {Nu}, etc.)
// ============================================
function aplicarCoresNasNotas() {
    if (!coresAtivas) return;

    document.querySelectorAll("#preview .abcjs-note").forEach(nota => {
        const textoNota = nota.textContent || "";
        
        // Procura por {Nr}, {Nu}, etc.
        let match = textoNota.match(/\{N(r|o|y|g|u|i|v)\}/i);
        let cor = null;
        let textoLimpo = textoNota;
        
        if (match) {
            cor = obterCorPorCodigo(match[1].toLowerCase());
            textoLimpo = textoNota.replace(/\{N(r|o|y|g|u|i|v)\}/gi, "").trim();
        }
        
        const cabeca = nota.querySelector("ellipse, circle") || nota.querySelector("path");
        
        if (cor && cabeca) {
            cabeca.style.fill = cor;
            cabeca.style.fillOpacity = "1";
            nota.textContent = textoLimpo;
        } else if (cabeca) {
            // Sem comando: nota preta
            cabeca.style.fill = "#000000";
            cabeca.style.fillOpacity = "1";
        }
    });
}

// ============================================
// APLICAR CORES NAS CIFRAS E LETRAS (MANTIDA PARA COMPATIBILIDADE)
// ============================================
function aplicarCoresAcordesLetras() {
    if (!coresAtivas) return;

    // CIFRAS
    document.querySelectorAll("#preview .abcjs-chord").forEach(el => {
        const textoOriginal = el.textContent || "";
        const resultado = interpretarComandoCor(textoOriginal);

        if (resultado.elementos.includes("cifra")) {
            el.style.fill = resultado.cor;
        }

        el.textContent = textoOriginal.replace(/\{(LN?C?|LC|CN)(r|o|y|g|u|i|v)\}/gi, "").trim();
    });

    // LETRAS
    document.querySelectorAll("#preview .abcjs-lyric").forEach(el => {
        const textoOriginal = el.textContent || "";
        const resultado = interpretarComandoCor(textoOriginal);

        if (resultado.elementos.includes("letra")) {
            el.style.fill = resultado.cor;
        }

        el.textContent = textoOriginal.replace(/\{(LN?C?|LC|CN)(r|o|y|g|u|i|v)\}/gi, "").trim();
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
    codigoProcessado = codigoProcessado.replace(/"%"/g, '"％"');
    
    try {
        elemento.innerHTML = "";
        ABCJS.renderAbc(id, codigoProcessado, { add_classes: true, staffwidth: 800, responsive: 'resize' });
        
        setTimeout(() => {
            aplicarCoresNasLetras();
            aplicarCoresNasCifras();
            aplicarCoresNasNotas();
            aplicarCoresAcordesLetras();
            
            if (tipo === 'infantil') {
                ajustarAcordes();
                ajustarLetras();
            }
        }, 500);
        
    } catch (e) {
        elemento.innerHTML = `<p style="color:red">Erro: ${e.message}</p>`;
    }
}

// ============================================
// FUNÇÃO PARA DEBUG
// ============================================
function debugCores() {
    console.log("=== DEBUG CORES ===");
    console.log("Letras:");
    document.querySelectorAll("#preview .abcjs-lyric").forEach(el => {
        console.log("  Letra:", el.textContent, "fill:", el.style.fill);
    });
    console.log("Cifras:");
    document.querySelectorAll("#preview .abcjs-chord").forEach(el => {
        console.log("  Cifra:", el.textContent, "fill:", el.style.fill);
    });
    console.log("Notas:");
    document.querySelectorAll("#preview .abcjs-note").forEach(el => {
        const cabeca = el.querySelector("ellipse, circle") || el.querySelector("path");
        console.log("  Nota:", el.textContent, "fill:", cabeca?.style?.fill);
    });
}

// ============================================
// CONFIGURAR GITHUB (botão 🔑)
// ============================================
function configurarGitHub() {
    const token = prompt('🔑 Token do GitHub (ou vazio para remover):', githubToken || '');
    if (token === null) return;
    if (token.trim() === '') {
        localStorage.removeItem('github_token');
        githubToken = '';
        toast('Token removido.', 'info');
    } else {
        localStorage.setItem('github_token', token.trim());
        githubToken = token.trim();
        toast('✅ Token salvo.', 'success');
    }

    const repo = prompt('📁 Repositório (usuario/repo):', githubRepo || '');
    if (repo !== null && repo.trim() !== '') {
        localStorage.setItem('github_repo', repo.trim());
        githubRepo = repo.trim();
    }

    const branch = prompt('🌿 Branch (padrão: main):', githubBranch || 'main');
    if (branch !== null && branch.trim() !== '') {
        localStorage.setItem('github_branch', branch.trim());
        githubBranch = branch.trim();
    }

    const pasta = prompt('📂 Pasta padrão (ex: aulas/, partituras/, ou vazio):', githubPasta || '');
    if (pasta !== null) {
        let pastaTratada = pasta.trim();
        if (pastaTratada && !pastaTratada.endsWith('/')) pastaTratada += '/';
        localStorage.setItem('github_pasta', pastaTratada);
        githubPasta = pastaTratada;
        toast(`Pasta definida: "${githubPasta || 'raiz'}"`, 'info');
    }

    window.githubToken = githubToken;
    window.githubRepo = githubRepo;
    window.githubBranch = githubBranch;
    window.githubPasta = githubPasta;
}

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
                nome: "Exemplos",
                cards: [
                    { texto: "Cores - Letras", conteudo: "[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/4\nK:C stafflines=0\nV:1 stem=up\nB2BBBBBBB2|]\nw: [b]0 [b]1 [b]2 [b]3 [r]0 [r]1 [r]2 [r]3\n[/ABC-INFANTIL]", ultimaModificacao: Date.now() },
                    { texto: "Cores - Notas", conteudo: "[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/8\nK:C\n[Nb]C [Nr]D [Ng]E [Ny]F | [Nv]G [Ni]A [No]B c |\n[/ABC-INFANTIL]", ultimaModificacao: Date.now() },
                    { texto: "Cores - Cifras", conteudo: "[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/8\nK:C\n\"[Cb]C\" C D E F | \"[Cr]G\" G A B c |\n[/ABC-INFANTIL]", ultimaModificacao: Date.now() }
                ],
                sublistas: []
            }
        ]
    };
}

// ============================================
// FUNÇÕES DE SALVAR E CARREGAR DADOS
// ============================================
function salvarDados() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    renderizarListaAulas();
}

function carregarDados() {
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
        try {
            dados = JSON.parse(localData);
        } catch (e) {
            dados = obterDadosPadrao();
        }
    } else {
        dados = obterDadosPadrao();
    }
    renderizarListaAulas();
    if (dados.listas.length > 0 && dados.listas[0].cards.length > 0) {
        carregarAula([0], 0);
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
// FUNÇÕES DE AJUSTE
// ============================================
function ajustarAcordes() {
    const valor = parseFloat(document.getElementById("acordeRange")?.value || -8);
    const acordeValue = document.getElementById("acordeValue");
    if (acordeValue) acordeValue.innerText = valor;
    
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
    const letraValue = document.getElementById("letraValue");
    if (letraValue) letraValue.innerText = valor;
    
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
    const letraXValue = document.getElementById("letraXValue");
    if (letraXValue) letraXValue.innerText = valor;
    
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

// ============================================
// FUNÇÃO TOAST
// ============================================
function toast(msg, tipo = 'info') {
    const el = document.createElement('div');
    el.textContent = msg;
    const bg = tipo === 'error' ? '#e94560' : tipo === 'success' ? '#2ed573' : '#3a86ff';
    el.style.cssText = `position:fixed; bottom:20px; right:20px; background:${bg}; color:white; padding:12px 20px; border-radius:8px; z-index:9999; animation:fadeOut 3s forwards; font-weight:bold;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
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
        const abcInfantis = [];
        const abcNormais = [];

        processado = processado.replace(/\[Acorde:([^\]]+)\]([\s\S]*?)\[\/Acorde\]/g, (match, sigla, nome) => {
            const id = 'chord-' + Date.now() + '-' + acordes.length;
            acordes.push({ id, sigla: sigla.trim(), nome: nome ? nome.trim() : '' });
            return `<div id="${id}" class="chord-diagram"></div>`;
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

        abcNormais.forEach(a => {
            const el = document.getElementById(a.id);
            if (el && typeof ABCJS !== 'undefined') {
                processarABCComEspacamento(a.id, a.code, 'normal');
            }
        });

        abcInfantis.forEach(a => {
            const el = document.getElementById(a.id);
            if (el && typeof ABCJS !== 'undefined') {
                processarABCComEspacamento(a.id, a.code, 'infantil');
            }
        });

    } catch (e) {
        console.error("Erro na renderização:", e);
        preview.innerHTML = '<p style="color:red;">❌ Erro ao renderizar: ' + e.message + '</p>';
    }
}

// ============================================
// DESENHAR ACORDE
// ============================================
function desenharAcorde(container, sigla, nomeParam = '') {
    let nome = nomeParam || sigla;
    container.innerHTML = `<div style="padding:10px; color:#e94560; text-align:center; font-weight:bold; font-size:1.2em;">🎸 ${nome}</div>`;
}

// ============================================
// FUNÇÃO PARA ALTERNAR CORES
// ============================================
function toggleCoresNotas() {
    coresAtivas = !coresAtivas;
    const btn = document.getElementById("btnCores");
    if (btn) {
        btn.style.background = coresAtivas ? "#00CC00" : "#CC0000";
        btn.textContent = coresAtivas ? "✅ Cores" : "❌ Cores";
    }
    renderizar();
}

// ============================================
// FUNÇÃO PARA ALTERNAR SIDEBAR
// ============================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// ============================================
// FUNÇÃO INSERIR ABC
// ============================================
function inserirABC() {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + `[ABC]\nX:1\nM:4/4\nL:1/8\nK:C\nC DEF | GAB c |]\n[/ABC]\n` + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

function inserirABCInfantil() {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + `[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/8\nK:C\n[Nb]C [Nr]D [Ng]E [Ny]F | [Nv]G [Ni]A [No]B c |\nw: [b]0 [b]1 [b]2 [b]3 [r]0 [r]1 [r]2 [r]3\n[/ABC-INFANTIL]\n` + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

// ============================================
// FUNÇÃO COPIAR EDITOR
// ============================================
function copiarEditor(event) {
    const editor = document.getElementById('editor');
    if (!editor) {
        toast('❌ Editor não encontrado.', 'error');
        return;
    }
    
    editor.select();
    editor.setSelectionRange(0, editor.value.length);
    
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(editor.value)
                .then(() => {
                    toast('✅ Texto copiado!', 'success');
                    if (event && event.target) {
                        const btn = event.target;
                        const textoOriginal = btn.textContent;
                        btn.textContent = '✅ Copiado!';
                        setTimeout(() => {
                            btn.textContent = textoOriginal;
                        }, 1500);
                    }
                })
                .catch(() => {
                    document.execCommand('copy');
                    toast('✅ Texto copiado!', 'success');
                });
        } else {
            document.execCommand('copy');
            toast('✅ Texto copiado!', 'success');
        }
    } catch (err) {
        toast('❌ Erro ao copiar: ' + err.message, 'error');
    }
    
    editor.setSelectionRange(0, 0);
    editor.focus();
}

// ============================================
// FUNÇÃO COLAR EDITOR
// ============================================
function colarEditor(event) {
    const editor = document.getElementById('editor');
    if (!editor) {
        toast('❌ Editor não encontrado.', 'error');
        return;
    }
    
    editor.focus();
    
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText()
            .then(text => {
                if (text) {
                    const start = editor.selectionStart;
                    const end = editor.selectionEnd;
                    const currentText = editor.value;
                    editor.value = currentText.substring(0, start) + text + currentText.substring(end);
                    
                    renderizar();
                    salvarAulaAtual();
                    
                    toast('✅ Texto colado!', 'success');
                    if (event && event.target) {
                        const btn = event.target;
                        const textoOriginal = btn.textContent;
                        btn.textContent = '✅ Colado!';
                        setTimeout(() => {
                            btn.textContent = textoOriginal;
                        }, 1500);
                    }
                }
            })
            .catch(() => {
                colarComPrompt(editor);
            });
    } else {
        colarComPrompt(editor);
    }
}

function colarComPrompt(editor) {
    const textoColado = prompt('📋 Cole o texto aqui (Ctrl+V):');
    if (textoColado !== null && textoColado !== '') {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const currentText = editor.value;
        editor.value = currentText.substring(0, start) + textoColado + currentText.substring(end);
        
        renderizar();
        salvarAulaAtual();
        
        editor.focus();
        toast('✅ Texto colado via prompt!', 'success');
    }
}

// ============================================
// FUNÇÃO INSERIR ACORDE POR NÚMERO
// ============================================
function inserirAcordePorNumero() {
    const inputField = document.getElementById('buscaAcordeRapida');
    if (!inputField) {
        toast('❌ Campo de busca não encontrado.', 'error');
        return;
    }
    
    const numero = inputField.value.trim();
    if (!numero || numero < 1) {
        toast('⚠️ Digite um número válido.', 'warning');
        return;
    }
    
    let nomeAcorde = null;
    
    if (typeof ACORDES !== 'undefined' && ACORDES[numero]) {
        nomeAcorde = ACORDES[numero].nome;
    }
    
    if (!nomeAcorde && typeof bibliotecaAcordes !== 'undefined' && bibliotecaAcordes[numero]) {
        nomeAcorde = bibliotecaAcordes[numero].nome;
    }
    
    if (!nomeAcorde && typeof window.processarAcordeDinamico === 'function') {
        const acordeTemp = window.processarAcordeDinamico(numero, '');
        if (acordeTemp && acordeTemp.nome) {
            nomeAcorde = acordeTemp.nome;
        }
    }
    
    if (!nomeAcorde) {
        toast(`❌ Acorde ${numero} não encontrado!`, 'error');
        return;
    }
    
    const codigoFinal = `[Acorde:${numero};1]${nomeAcorde}[/Acorde]`;
    
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const texto = editor.value;
    
    if (start !== end) {
        editor.value = texto.substring(0, start) + codigoFinal + texto.substring(end);
        editor.setSelectionRange(start + codigoFinal.length, start + codigoFinal.length);
    } else {
        editor.value = texto.substring(0, start) + codigoFinal + texto.substring(start);
        editor.setSelectionRange(start + codigoFinal.length, start + codigoFinal.length);
    }
    
    renderizar();
    salvarAulaAtual();
    
    inputField.value = '';
    editor.focus();
    
    toast(`✅ Acorde "${nomeAcorde}" inserido!`, 'success');
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function init() {
    console.log("Inicializando o sistema...");
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
    
    renderizar();
}

document.addEventListener('DOMContentLoaded', init);

const styleToast = document.createElement('style');
styleToast.textContent = `@keyframes fadeOut { 0% { opacity: 1; transform: translateX(0); } 70% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); } }`;
document.head.appendChild(styleToast);

console.log('✅ main4.js carregado com todas as modificações!');
