// ============================================
// main4.js - PRO MAESTRO (VERSÃO COMPLETA)
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
        r: "#FF0000",
        o: "#FF6600",
        y: "#FFDD00",
        g: "#00CC00",
        b: "#0066FF",
        i: "#4B0082",
        v: "#8B00FF"
    };
    return cores[codigo.toLowerCase()] || "#000000";
}

// ============================================
// FUNÇÃO INTERPRETAR COMANDO DE COR
// ============================================
function interpretarComandoCor(texto) {
    if (!texto) {
        return { elementos: [], cor: "#000000", textoLimpo: "" };
    }

    // Comandos: [Nr], [Lr], [Cr], [LNr], [LCr], [CNr], [LNCr]
    const match = texto.match(/\[(LN?C?|LC|CN)(r|o|y|g|b|i|v)\]/i);

    if (!match) {
        return { elementos: [], cor: "#000000", textoLimpo: texto };
    }

    const comando = match[1].toUpperCase();
    const codigoCor = match[2].toLowerCase();
    const elementos = [];

    if (comando.includes("N")) elementos.push("nota");
    if (comando.includes("L")) elementos.push("letra");
    if (comando.includes("C")) elementos.push("cifra");

    const textoLimpo = texto.replace(/\[(LN?C?|LC|CN)(r|o|y|g|b|i|v)\]/gi, "").trim();

    return {
        elementos: elementos,
        cor: obterCorPorCodigo(codigoCor),
        textoLimpo: textoLimpo
    };
}

// ============================================
// FUNÇÃO APLICAR CORES NAS NOTAS (COM COMANDOS)
// ============================================
function aplicarCoresNasNotasComComandos() {
    if (!coresAtivas) return;

    document.querySelectorAll("#preview .abcjs-note").forEach(nota => {
        const textoNota = nota.textContent || "";
        
        // Procura por [Nr], [No], [Ny], etc.
        const match = textoNota.match(/\[(N)(r|o|y|g|b|i|v)\]/i);
        
        const cabeca = nota.querySelector("ellipse, circle") || nota.querySelector("path");
        
        if (match) {
            const codigoCor = match[2].toLowerCase();
            const cor = obterCorPorCodigo(codigoCor);
            
            if (cabeca) {
                cabeca.style.fill = cor;
                cabeca.style.fillOpacity = "1";
            }
            
            // Remove o comando do texto
            nota.textContent = textoNota.replace(/\[N(r|o|y|g|b|i|v)\]/gi, "").trim();
        } else {
            // Sem comando: nota preta
            if (cabeca) {
                cabeca.style.fill = "#000000";
                cabeca.style.fillOpacity = "1";
            }
        }
    });
}

// ============================================
// FUNÇÃO APLICAR CORES NAS CIFRAS E LETRAS
// ============================================
function aplicarCoresAcordesLetras() {
    if (!coresAtivas) return;

    // CIFRAS (acima da pauta)
    document.querySelectorAll("#preview .abcjs-chord").forEach(el => {
        const textoOriginal = el.textContent || "";
        const resultado = interpretarComandoCor(textoOriginal);

        if (resultado.elementos.includes("cifra")) {
            el.style.fill = resultado.cor;
        }

        if (resultado.textoLimpo !== undefined) {
            el.textContent = resultado.textoLimpo;
        }
    });

    // LETRAS (abaixo da pauta)
    document.querySelectorAll("#preview .abcjs-lyric").forEach(el => {
        const textoOriginal = el.textContent || "";
        const resultado = interpretarComandoCor(textoOriginal);

        if (resultado.elementos.includes("letra")) {
            el.style.fill = resultado.cor;
        }

        if (resultado.textoLimpo !== undefined) {
            el.textContent = resultado.textoLimpo;
        }
    });
}

// ============================================
// FUNÇÃO APLICAR CORES NAS NOTAS (ANTIGA - PARA COMPATIBILIDADE)
// ============================================
function aplicarCoresNasNotas() {
    if (!coresAtivas) return;
    document.querySelectorAll("#preview .abcjs-note").forEach(nota => {
        const cabeca = nota.querySelector("ellipse, circle") || nota.querySelector("path");
        if (cabeca) {
            cabeca.style.fill = "#000000";
            cabeca.style.fillOpacity = "1";
        }
    });
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
// PROCESSAR ABC COM ESPAÇAMENTO (VERSÃO CORRIGIDA)
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
        
        // Aplica cores após renderizar
        setTimeout(() => {
            aplicarCoresAcordesLetras();
            aplicarCoresNasNotasComComandos();
            if (tipo === 'infantil') {
                ajustarAcordes();
                ajustarLetras();
            }
        }, 300);
        
    } catch (e) {
        elemento.innerHTML = `<p style="color:red">Erro: ${e.message}</p>`;
    }
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

        // Processar com Marked
        preview.innerHTML = marked.parse(processado);

        // Desenhar acordes
        acordes.forEach(a => {
            const el = document.getElementById(a.id);
            if (el) desenharAcorde(el, a.sigla, a.nome);
        });

        // Processar ABC
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
// DESENHAR ACORDE (SIMPLIFICADO)
// ============================================
function desenharAcorde(container, sigla, nomeParam = '') {
    // Tenta buscar o acorde da biblioteca
    let nome = nomeParam || sigla;
    let acorde = null;
    
    if (typeof ACORDES !== 'undefined' && ACORDES[sigla]) {
        acorde = ACORDES[sigla];
        nome = acorde.nome;
    } else if (typeof bibliotecaAcordes !== 'undefined' && bibliotecaAcordes[sigla]) {
        acorde = bibliotecaAcordes[sigla];
        nome = acorde.nome;
    }
    
    container.innerHTML = `<div style="padding:10px; color:#e94560; text-align:center; font-weight:bold; font-size:1.2em;">🎸 ${nome}</div>`;
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
            dados = { listas: [] };
        }
    } else {
        dados = { listas: [] };
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

    dados.listas.forEach((lista, idx) => {
        const listaDiv = document.createElement('div');
        listaDiv.style.marginBottom = '10px';
        listaDiv.style.padding = '8px';
        listaDiv.style.background = '#0f3460';
        listaDiv.style.borderRadius = '5px';
        
        const headerDiv = document.createElement('div');
        headerDiv.style.display = 'flex';
        headerDiv.style.justifyContent = 'space-between';
        headerDiv.style.alignItems = 'center';
        
        const tituloSpan = document.createElement('span');
        tituloSpan.style.fontWeight = 'bold';
        tituloSpan.style.color = '#e94560';
        tituloSpan.textContent = `📁 ${lista.nome}`;
        
        const addCardBtn = document.createElement('button');
        addCardBtn.textContent = '+ Cartão';
        addCardBtn.style.padding = '4px 10px';
        addCardBtn.style.background = '#2ecc71';
        addCardBtn.style.border = 'none';
        addCardBtn.style.borderRadius = '3px';
        addCardBtn.style.cursor = 'pointer';
        addCardBtn.style.color = 'white';
        addCardBtn.onclick = () => criarCartao([idx]);
        
        headerDiv.appendChild(tituloSpan);
        headerDiv.appendChild(addCardBtn);
        listaDiv.appendChild(headerDiv);
        
        const cardsContainer = document.createElement('div');
        cardsContainer.style.marginTop = '5px';
        cardsContainer.style.paddingLeft = '10px';
        
        if (lista.cards && lista.cards.length > 0) {
            lista.cards.forEach((card, cardIdx) => {
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
                
                cardDiv.appendChild(cardTitle);
                cardDiv.onclick = () => carregarAula([idx], cardIdx);
                cardsContainer.appendChild(cardDiv);
            });
        }
        
        listaDiv.appendChild(cardsContainer);
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
        dados.listas.push(novaListaObj);
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
            salvarDados();
            alert(`✅ Cartão "${nome.trim()}" criado!`);
        }
    }
}

// ============================================
// FUNÇÃO OBTER LISTA POR CAMINHO
// ============================================
function obterListaPorCaminho(caminho) {
    if (!caminho || caminho.length === 0) return null;
    let atual = dados.listas[caminho[0]];
    for (let i = 1; i < caminho.length; i++) {
        if (!atual || !atual.sublistas) return null;
        atual = atual.sublistas[caminho[i]];
    }
    return atual;
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
}

function inserirABCInfantil() {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + `[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/8\nK:C\n[Nr]C [No]D [Ny]E [Ng]F | [Nb]G [Ni]A [Nv]B c |\nw: [Lr]Dó [Lo]Ré [Ly]Mi [Lg]Fá | [Lb]Sol [Li]Lá [Lv]Si Dó\n[/ABC-INFANTIL]\n` + editor.value.substring(start);
    renderizar();
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
            }, 500);
        });
    }
    
    // Renderiza um exemplo inicial se o editor estiver vazio
    if (editor.value === '') {
        editor.value = `[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/8\nK:C\n[Nr]C [No]D [Ny]E [Ng]F | [Nb]G [Ni]A [Nv]B c |\nw: [Lr]Dó [Lo]Ré [Ly]Mi [Lg]Fá | [Lb]Sol [Li]Lá [Lv]Si Dó\n[/ABC-INFANTIL]`;
        renderizar();
    } else {
        renderizar();
    }
}

document.addEventListener('DOMContentLoaded', init);

const styleToast = document.createElement('style');
styleToast.textContent = `@keyframes fadeOut { 0% { opacity: 1; transform: translateX(0); } 70% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); } }`;
document.head.appendChild(styleToast);

console.log('✅ main4.js carregado com todas as modificações!');
