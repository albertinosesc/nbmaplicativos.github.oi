// ============================================
// main4.js - PRO MAESTRO (VERSÃO SIMPLIFICADA)
// ============================================

// Variáveis
let dados = {
    listas: []
};

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
// MAPA DE CORES
// ============================================
function obterCorPorCodigo(codigo) {
    const cores = {
        'r': '#FF0000',  // vermelho
        'o': '#FF6600',  // laranja
        'y': '#FFDD00',  // amarelo
        'g': '#00CC00',  // verde
        'u': '#0066FF',  // azul
        'i': '#4B0082',  // índigo
        'v': '#8B00FF'   // violeta
    };
    return cores[codigo] || '#000000';
}

// ============================================
// APLICAR CORES NAS LETRAS
// ============================================
function aplicarCoresNasLetras() {
    if (!coresAtivas) return;

    document.querySelectorAll('#preview .abcjs-lyric').forEach(el => {
        let texto = el.textContent || '';
        
        // Procura por [r], [u], etc.
        const match = texto.match(/\[(r|o|y|g|u|i|v)\]/i);
        if (match) {
            const cor = obterCorPorCodigo(match[1].toLowerCase());
            el.style.fill = cor;
            el.textContent = texto.replace(/\[(r|o|y|g|u|i|v)\]/gi, '').trim();
        }
    });
}

// ============================================
// APLICAR CORES NAS CIFRAS
// ============================================
function aplicarCoresNasCifras() {
    if (!coresAtivas) return;

    document.querySelectorAll('#preview .abcjs-chord').forEach(el => {
        let texto = el.textContent || '';
        
        // Procura por [Cr], [Cu], etc.
        const match = texto.match(/\[C(r|o|y|g|u|i|v)\]/i);
        if (match) {
            const cor = obterCorPorCodigo(match[1].toLowerCase());
            el.style.fill = cor;
            el.textContent = texto.replace(/\[C(r|o|y|g|u|i|v)\]/gi, '').trim();
        }
    });
}

// ============================================
// APLICAR CORES NAS NOTAS
// ============================================
function aplicarCoresNasNotas() {
    if (!coresAtivas) return;

    document.querySelectorAll('#preview .abcjs-note').forEach(nota => {
        let texto = nota.textContent || '';
        
        // Procura por [Nr], [Nu], etc.
        const match = texto.match(/\[N(r|o|y|g|u|i|v)\]/i);
        const cabeca = nota.querySelector('ellipse, circle') || nota.querySelector('path');
        
        if (match && cabeca) {
            const cor = obterCorPorCodigo(match[1].toLowerCase());
            cabeca.style.fill = cor;
            cabeca.style.fillOpacity = '1';
            nota.textContent = texto.replace(/\[N(r|o|y|g|u|i|v)\]/gi, '').trim();
        } else if (cabeca) {
            cabeca.style.fill = '#000000';
            cabeca.style.fillOpacity = '1';
        }
    });
}

// ============================================
// PROCESSAR ABC COM ESPAÇAMENTO
// ============================================
function processarABCComEspacamento(id, code, tipo) {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    const staffsep = document.getElementById('staffsepRange')?.value || 60;
    const sysstaffsep = document.getElementById('sysstaffsepRange')?.value || 80;

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
        elemento.innerHTML = '';
        ABCJS.renderAbc(id, codigoProcessado, { 
            add_classes: true, 
            staffwidth: 800, 
            responsive: 'resize' 
        });
        
        setTimeout(() => {
            aplicarCoresNasLetras();
            aplicarCoresNasCifras();
            aplicarCoresNasNotas();
            
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
// FUNÇÕES DE AJUSTE
// ============================================
function ajustarAcordes() {
    const valor = parseFloat(document.getElementById('acordeRange')?.value || -8);
    const acordeValue = document.getElementById('acordeValue');
    if (acordeValue) acordeValue.innerText = valor;
    
    document.querySelectorAll('#preview .abcjs-chord').forEach(el => {
        let yAtual = parseFloat(el.getAttribute('y'));
        if (!isNaN(yAtual)) {
            if (!el.dataset.yOriginal) el.dataset.yOriginal = yAtual;
            el.setAttribute('y', parseFloat(el.dataset.yOriginal) + valor);
        }
    });
}

function ajustarLetras() {
    const valor = parseFloat(document.getElementById('letraRange')?.value || 12);
    const letraValue = document.getElementById('letraValue');
    if (letraValue) letraValue.innerText = valor;
    
    document.querySelectorAll('#preview .abcjs-lyric').forEach(el => {
        let yAtual = parseFloat(el.getAttribute('y'));
        if (!isNaN(yAtual)) {
            if (!el.dataset.yOriginal) el.dataset.yOriginal = yAtual;
            el.setAttribute('y', parseFloat(el.dataset.yOriginal) + valor);
        }
    });
}

function ajustarLetrasX() {
    const valor = parseFloat(document.getElementById('letraXRange')?.value || 5);
    const letraXValue = document.getElementById('letraXValue');
    if (letraXValue) letraXValue.innerText = valor;
    
    document.querySelectorAll('#preview .abcjs-lyric').forEach(el => {
        let xAtual = parseFloat(el.getAttribute('x'));
        if (!isNaN(xAtual)) {
            if (!el.dataset.xOriginal) el.dataset.xOriginal = xAtual;
            el.setAttribute('x', parseFloat(el.dataset.xOriginal) + valor);
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
// FUNÇÃO PARA ALTERNAR CORES
// ============================================
function toggleCoresNotas() {
    coresAtivas = !coresAtivas;
    const btn = document.getElementById('btnCores');
    if (btn) {
        btn.style.background = coresAtivas ? '#00CC00' : '#CC0000';
        btn.textContent = coresAtivas ? '✅ Cores' : '❌ Cores';
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
    editor.value = editor.value.substring(0, start) + 
        `[ABC]\nX:1\nM:4/4\nL:1/8\nK:C\nC DEF | GAB c |]\n[/ABC]\n` + 
        editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

function inserirABCInfantil() {
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + 
        `[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/8\nK:C\n[Nu]C [Nr]D [Ng]E [Ny]F | [Nv]G [Ni]A [No]B c |\nw: [u]Dó [r]Ré [g]Mi [y]Fá | [v]Sol [i]Lá [o]Si Dó\n[/ABC-INFANTIL]\n` + 
        editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

// ============================================
// RENDERIZAÇÃO PRINCIPAL
// ============================================
function renderizar() {
    console.log('Renderizando...');
    let conteudo = editor.value || '';

    try {
        let processado = conteudo;
        const acordes = [];
        const abcInfantis = [];
        const abcNormais = [];

        // Processa Acordes
        processado = processado.replace(/\[Acorde:([^\]]+)\]([\s\S]*?)\[\/Acorde\]/g, (match, sigla, nome) => {
            const id = 'chord-' + Date.now() + '-' + acordes.length;
            acordes.push({ id, sigla: sigla.trim(), nome: nome ? nome.trim() : '' });
            return `<div id="${id}" class="chord-diagram"></div>`;
        });

        // Processa ABC Infantil
        processado = processado.replace(/\[ABC-INFANTIL\]([\s\S]*?)\[\/ABC-INFANTIL\]/g, (match, code) => {
            const id = 'abc-inf-' + Date.now() + '-' + abcInfantis.length;
            abcInfantis.push({ id, code: code.trim() });
            return `<div id="${id}" class="abc-container"></div>`;
        });

        // Processa ABC Normal
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
        console.error('Erro na renderização:', e);
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
    renderizarListaAulas();
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
    const nome = prompt('Nome da nova lista:');
    if (nome && nome.trim()) {
        const novaListaObj = { nome: nome.trim(), cards: [], sublistas: [] };
        dados.listas.push(novaListaObj);
        salvarDados();
        alert(`✅ Lista "${nome.trim()}" criada!`);
    }
}

function criarCartao(caminho) {
    const nome = prompt('Nome do novo cartão:');
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
    
    if (!nomeAcorde) {
        toast(`❌ Acorde ${numero} não encontrado!`, 'error');
        return;
    }
    
    const codigoFinal = `[Acorde:${numero}]${nomeAcorde}[/Acorde]`;
    
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
// INICIALIZAÇÃO
// ============================================
function init() {
    console.log('Inicializando o sistema...');
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
    
    // Exemplo inicial
    if (editor.value === '') {
        editor.value = `[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/8\nK:C\n[Nu]C [Nr]D [Ng]E [Ny]F | [Nv]G [Ni]A [No]B c |\nw: [u]Dó [r]Ré [g]Mi [y]Fá | [v]Sol [i]Lá [o]Si Dó\n[/ABC-INFANTIL]`;
        renderizar();
    } else {
        renderizar();
    }
}

document.addEventListener('DOMContentLoaded', init);

const styleToast = document.createElement('style');
styleToast.textContent = `@keyframes fadeOut { 0% { opacity: 1; transform: translateX(0); } 70% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); } }`;
document.head.appendChild(styleToast);

console.log('✅ main4.js carregado!');
