// ============================================
// main.js - ARQUIVO PRINCIPAL
// ============================================

// Referências DOM
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const listaAulas = document.getElementById('listaAulas');

// ============================================
// FUNÇÕES DE CRIAÇÃO (LISTAS E CARTÕES)
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
// FUNÇÃO INSERIR ACORDE POR NÚMERO
// ============================================
function inserirAcordePorNumero() {
    const inputField = document.getElementById('buscaAcordeRapida');
    if (!inputField) {
        console.error("❌ Campo buscaAcordeRapida não encontrado!");
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
    
    if (!nomeAcorde && typeof FORMAS_INFINITAS !== 'undefined' && FORMAS_INFINITAS[numero]) {
        nomeAcorde = FORMAS_INFINITAS[numero].nome;
    }
    
    if (!nomeAcorde && typeof window.processarAcordeDinamico === 'function') {
        const acordeTemp = window.processarAcordeDinamico(numero, '');
        if (acordeTemp && acordeTemp.nome) {
            nomeAcorde = acordeTemp.nome;
        }
    }
    
    if (!nomeAcorde) {
        toast(`❌ Acorde ${numero} não encontrado!`, 'error');
        console.error(`❌ Acorde ${numero} não encontrado!`);
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
    
    if (typeof renderizar === 'function') renderizar();
    if (typeof salvarAulaAtual === 'function') salvarAulaAtual();
    
    inputField.value = '';
    editor.focus();
    
    toast(`✅ Acorde "${nomeAcorde}" inserido!`, 'success');
}

// ============================================
// FUNÇÕES DE INSERIR ABC E PIANO
// ============================================

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
// FUNÇÃO PARA ALTERNAR CORES
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

console.log('✅ main.js carregado!');
