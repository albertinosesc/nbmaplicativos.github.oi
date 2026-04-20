// ============================================
// SISTEMA DE LISTAS E CARTÕES COM SUB-LISTAS
// ============================================

// Variáveis globais
let dados = {
    listas: []
};

let timeoutRenderTimer; // Renomeado para evitar conflito

const STORAGE_KEY = 'pro_maestro_listas';
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const listaAulas = document.getElementById('listaAulas');

// ============================================
// FUNÇÕES AUXILIARES PARA NAVEGAR NAS LISTAS
// ============================================
function getListaByPath(path) {
    if (!path || path.length === 0) return null;
    let current = dados.listas[path[0]];
    for (let i = 1; i < path.length; i++) {
        if (!current.subListas) return null;
        current = current.subListas[path[i]];
    }
    return current;
}

// ============================================
// DADOS PADRÃO COM EXEMPLOS
// ============================================
function getDadosPadrao() {
    return {
        listas: [
            {
                nome: "Piano",
                cards: [
                    { texto: "Escala de Dó Maior", conteudo: "# Escala de Dó Maior\n\nPraticar escala ascendente e descendente.", ultimaModificacao: Date.now() },
                    { texto: "Acordes Básicos", conteudo: "# Acordes Básicos\n\nC, G, Am, F", ultimaModificacao: Date.now() }
                ],
                subListas: [
                    {
                        nome: "Exercícios de Dedos",
                        cards: [
                            { texto: "Hanon 1", conteudo: "# Hanon 1\n\nExercício para independência dos dedos.", ultimaModificacao: Date.now() }
                        ],
                        subListas: []
                    }
                ]
            },
            {
                nome: "Teoria Musical",
                cards: [
                    { texto: "Clave de Sol", conteudo: "# Clave de Sol\n\nNotas na clave de Sol.", ultimaModificacao: Date.now() }
                ],
                subListas: []
            },
            {
                nome: "Músicas para Aprender",
                cards: [],
                subListas: [
                    {
                        nome: "Músicas Clássicas",
                        cards: [
                            { texto: "Für Elise", conteudo: "# Für Elise\n\nBeethoven", ultimaModificacao: Date.now() }
                        ],
                        subListas: []
                    },
                    {
                        nome: "Músicas Populares",
                        cards: [],
                        subListas: []
                    }
                ]
            }
        ]
    };
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
}

// ============================================
// RENDERIZAR LISTA DE AULAS (SIDEBAR)
// ============================================
function renderizarListaAulas() {
    if (!listaAulas) {
        console.log("Elemento listaAulas não encontrado");
        return;
    }
    listaAulas.innerHTML = '';
    
    // Botão Nova Lista (raiz)
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
    
    // Função recursiva para renderizar listas
    function renderizarListaRecursiva(lista, path, nivel = 0) {
        const listaDiv = document.createElement('div');
        listaDiv.style.marginBottom = '10px';
        listaDiv.style.marginLeft = `${nivel * 15}px`;
        if (nivel > 0) {
            listaDiv.style.borderLeft = '2px solid #e94560';
            listaDiv.style.paddingLeft = '10px';
        }
        
        // Cabeçalho
        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.justifyContent = 'space-between';
        headerDiv.style.alignItems = 'center';
        headerDiv.style.padding = '8px';
        headerDiv.style.background = nivel === 0 ? '#0f3460' : '#1a1a3e';
        headerDiv.style.borderRadius = '5px';
        headerDiv.style.cursor = 'pointer';
        headerDiv.style.marginTop = '5px';
        
        const totalCards = lista.cards?.length || 0;
        const totalSubListas = lista.subListas?.length || 0;
        
        const tituloSpan = document.createElement('span');
        tituloSpan.style.fontWeight = 'bold';
        tituloSpan.style.color = '#e94560';
        tituloSpan.innerHTML = `📁 ${lista.nome} `;
        
        const botoesDiv = document.createElement('div');
        botoesDiv.style.display = 'flex';
        botoesDiv.style.gap = '5px';
        
        // Botão Nova Sub-Lista
        const addSubListaBtn = document.createElement('button');
        addSubListaBtn.textContent = '📁+';
        addSubListaBtn.style.padding = '4px 8px';
        addSubListaBtn.style.background = '#f39c12';
        addSubListaBtn.style.border = 'none';
        addSubListaBtn.style.borderRadius = '3px';
        addSubListaBtn.style.cursor = 'pointer';
        addSubListaBtn.style.color = 'white';
        addSubListaBtn.style.fontSize = '11px';
        addSubListaBtn.title = 'Nova sub-lista';
        addSubListaBtn.onclick = (e) => {
            e.stopPropagation();
            criarLista(path);
        };
        
        // Botão Novo Cartão
        const addCardBtn = document.createElement('button');
        addCardBtn.textContent = '+';
        addCardBtn.style.padding = '4px 10px';
        addCardBtn.style.background = '#2ecc71';
        addCardBtn.style.border = 'none';
        addCardBtn.style.borderRadius = '3px';
        addCardBtn.style.cursor = 'pointer';
        addCardBtn.style.color = 'white';
        addCardBtn.onclick = (e) => {
            e.stopPropagation();
            criarCartao(path);
        };
        
        // Botão Renomear
        const editListBtn = document.createElement('button');
        editListBtn.textContent = '✏️';
        editListBtn.style.padding = '4px 8px';
        editListBtn.style.background = '#3a86ff';
        editListBtn.style.border = 'none';
        editListBtn.style.borderRadius = '3px';
        editListBtn.style.cursor = 'pointer';
        editListBtn.style.color = 'white';
        editListBtn.onclick = (e) => {
            e.stopPropagation();
            renomearLista(path);
        };
        
        // Botão Excluir
        const deleteListBtn = document.createElement('button');
        deleteListBtn.textContent = '🗑️';
        deleteListBtn.style.padding = '4px 8px';
        deleteListBtn.style.background = '#e94560';
        deleteListBtn.style.border = 'none';
        deleteListBtn.style.borderRadius = '3px';
        deleteListBtn.style.cursor = 'pointer';
        deleteListBtn.style.color = 'white';
        deleteListBtn.onclick = (e) => {
            e.stopPropagation();
            excluirLista(path);
        };
        
        botoesDiv.appendChild(addSubListaBtn);
        botoesDiv.appendChild(addCardBtn);
        botoesDiv.appendChild(editListBtn);
        botoesDiv.appendChild(deleteListBtn);
        headerDiv.appendChild(tituloSpan);
        headerDiv.appendChild(botoesDiv);
        
        // Container de conteúdo
        const contentContainer = document.createElement('div');
        contentContainer.style.paddingLeft = '10px';
        contentContainer.style.marginTop = '5px';
        contentContainer.style.display = 'block';
        
        // Renderizar cartões
        if (lista.cards && lista.cards.length > 0) {
            for (let cardIdx = 0; cardIdx < lista.cards.length; cardIdx++) {
                const card = lista.cards[cardIdx];
                
                const cardDiv = document.createElement('div');
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
                editCardBtn.onclick = (e) => {
                    e.stopPropagation();
                    renomearCartao(path, cardIdx);
                };
                
                const deleteCardBtn = document.createElement('button');
                deleteCardBtn.textContent = '🗑️';
                deleteCardBtn.style.padding = '2px 6px';
                deleteCardBtn.style.background = '#e94560';
                deleteCardBtn.style.border = 'none';
                deleteCardBtn.style.borderRadius = '3px';
                deleteCardBtn.style.cursor = 'pointer';
                deleteCardBtn.style.color = 'white';
                deleteCardBtn.style.fontSize = '10px';
                deleteCardBtn.onclick = (e) => {
                    e.stopPropagation();
                    excluirCartao(path, cardIdx);
                };
                
                cardActions.appendChild(editCardBtn);
                cardActions.appendChild(deleteCardBtn);
                cardDiv.appendChild(cardTitle);
                cardDiv.appendChild(cardActions);
                
                cardDiv.onclick = () => carregarAula(path, cardIdx);
                contentContainer.appendChild(cardDiv);
            }
        }
        
        // Renderizar sub-listas recursivamente
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
        
        let expandido = true;
        headerDiv.onclick = () => {
            expandido = !expandido;
            contentContainer.style.display = expandido ? 'block' : 'none';
            tituloSpan.innerHTML = expandido ? `📂 ${lista.nome} ` : `📁 ${lista.nome} `;
        };
        
        listaDiv.appendChild(headerDiv);
        listaDiv.appendChild(contentContainer);
        return listaDiv;
    }
    
    // Renderizar todas as listas raiz
    dados.listas.forEach((lista, idx) => {
        const listaDiv = renderizarListaRecursiva(lista, [idx], 0);
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
        
        if (path === null) {
            dados.listas.push(novaListaObj);
        } else {
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

// ============================================
// FUNÇÕES DE EDIÇÃO E EXCLUSÃO
// ============================================
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
        if (path.length === 1) {
            dados.listas.splice(path[0], 1);
        } else {
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
    editor.value = card.conteudo;
    renderizar();
}

// ============================================
// FUNÇÕES DE FORMATAÇÃO
// ============================================
function addFormatacao(before, after) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const text = editor.value;
    const selectedText = text.substring(start, end);
    
    let newText;
    if (selectedText) {
        newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    } else {
        newText = text.substring(0, start) + before + after + text.substring(end);
    }
    editor.value = newText;
    editor.setSelectionRange(start + before.length, start + before.length);
    renderizar();
    editor.focus();
}

function inserirLink() {
    const url = prompt('Digite a URL:', 'https://');
    const texto = prompt('Digite o texto do link:', 'Clique aqui');
    if (url && texto) {
        const start = editor.selectionStart;
        editor.value = editor.value.substring(0, start) + `[${texto}](${url})` + editor.value.substring(start);
        renderizar();
    }
}

function inserirImagem() {
    const url = prompt('Digite a URL da imagem:', 'https://via.placeholder.com/300x200');
    const alt = prompt('Digite o texto alternativo:', 'Imagem');
    if (url && alt) {
        const start = editor.selectionStart;
        editor.value = editor.value.substring(0, start) + `![${alt}](${url})` + editor.value.substring(start);
        renderizar();
    }
}

// Placeholders
function inserirAcorde() { alert("🎸 Acordes em breve!"); }
function inserirABC() { alert("🎼 Partituras em breve!"); }
function inserirABCInfantil() { alert("🎨 Partituras Infantis em breve!"); }
function inserirPiano() { alert("🎹 Piano em breve!"); }
function toggleCoresNotas() {}
function ajustarAcordes() {}
function ajustarLetras() {}
function ajustarLetrasX() {}
function atualizarStaffSep() { renderizar(); }
function atualizarSysStaffSep() { renderizar(); }
function atualizarIntensidadeCores() {}
function toggleSidebar() { document.getElementById('sidebar')?.classList.toggle('collapsed'); }
function toggleCategoria(menuId) { document.getElementById(menuId)?.classList.toggle('collapsed'); }
function abrirModalPiano() {}
function fecharModalPiano() {}
function exportHTML() { alert("📄 Exportação em breve!"); }
function exportAppHTML() { alert("📱 Exportação App em breve!"); }

// ============================================
// RENDERIZAÇÃO PRINCIPAL
// ============================================
function renderizar() {
    console.log("Renderizando...");
    const conteudo = editor.value || '';
    
    try {
        preview.innerHTML = marked.parse(conteudo);
    } catch (e) {
        console.error("Erro na renderização:", e);
        preview.innerHTML = '<p style="color:red;">❌ Erro ao renderizar: ' + e.message + '</p>';
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function init() {
    console.log("Inicializando sistema...");
    console.log("Elemento listaAulas:", listaAulas);
    carregarDados();
    
    if (editor) {
        editor.addEventListener('input', () => {
            clearTimeout(timeoutRenderTimer);
            timeoutRenderTimer = setTimeout(() => {
                renderizar();
            }, 300);
        });
    }
}

// Iniciar
document.addEventListener('DOMContentLoaded', init);