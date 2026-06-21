// ============================================
// VARIÁVEIS GLOBAIS (Inicialização Segura)
// ============================================
let coresAtivas = true;
let timeoutRenderTimer = null;
const editor = document.getElementById('editor'); // Altere para o ID correto do seu textarea se necessário
const preview = document.getElementById('preview'); // Altere para o ID correto da sua div de preview
const bibliotecaAcordes = JSON.parse(localStorage.getItem("acordes_personalizados_usuario") || "{}");

// Funções auxiliares de persistência que o código invoca
function salvarDados() { /* Implementação externa ou via Sheets/localStorage */ }
function carregarDados() { /* Implementação externa */ }
function adicionarBotaoSalvarDinamico() { /* Implementação externa */ }
function obterListaPorCaminho(caminho) { return null; /* Implementação externa */ }
let listaAtual = null;
let cartaoAtual = null;

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
            }, 200); // Removido o ponto e vírgula órfão que existia aqui
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
    const indicador = document.getElementById("acordeValue");
    if (indicador) indicador.innerText = valor;
    
    document.querySelectorAll("#preview .abcjs-chord").forEach(el => {
        let yAtual = parseFloat(el.getAttribute("y"));
        if (!isNaN(yAtual)) {
            if (!el.dataset.yOriginal) el.dataset.yOriginal = yAtual;
            el.setAttribute("y", parseFloat(el.dataset.yOriginal) + valor);
        }
    });
}

// Correção para o teclado usar o 'R' em vez de Backspace conforme regras do sistema
function ajustarLetras() {
    const valor = parseFloat(document.getElementById("letraRange")?.value || 12);
    const indicador = document.getElementById("letraValue");
    if (indicador) indicador.innerText = valor;
    
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
    const indicador = document.getElementById("letraXValue");
    if (indicador) indicador.innerText = valor;
    
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
    
    function getDedo(notaNome) {
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
    if (!editor || !preview) return;
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
        
        if (window.marked && typeof window.marked.parse === 'function') {
            preview.innerHTML = window.marked.parse(processado);
        } else {
            preview.innerHTML = processado; 
        }
        
        acordes.forEach(a => {
            const el = document.getElementById(a.id);
            if (el && typeof desenharAcorde === 'function') desenharAcorde(el, a.sigla, a.nome);
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
        
        if (typeof window.escalasArpejos !== 'undefined' && window.escalasArpejos.renderizar) {
            window.escalasArpejos.renderizar(preview);
        }
        
    } catch (e) {
        console.error("Erro na renderização:", e);
        preview.innerHTML = '<p style="color:red;">❌ Erro ao renderizar: ' + e.message + '</p>';
    }
}

// ============================================
// FUNÇÕES DE FORMATAÇÃO E UTILITÁRIOS DE INSERÇÃO
// ============================================
function addFormatacao(antes, depois) {
    if (!editor) return;
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

// Criada para resolver a falta de declaração que quebrava o script
function inserirCodigoAcorde(codigo) {
    if (!editor) return;
    const start = editor.selectionStart;
    editor.value = editor.value.substring(0, start) + codigo + editor.value.substring(start);
    renderizar();
    salvarAulaAtual();
}

function inserirLink() {
    const url = prompt('Digite uma URL:', 'https://');
    const texto = prompt('Digite o texto do link:', 'Clique aqui');
    if (url && texto) {
        inserirCodigoAcorde(`[${texto}](${url})`);
    }
}

function inserirImagem() {
    const url = prompt('Digite a URL da imagem:', 'https://via.placeholder.com/300x200');
    const alt = prompt('Digite o texto alternativo:', 'Imagem');
    if (url && alt) {
        inserirCodigoAcorde(`![${alt}](${url})`);
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
    
    if (opcao === '1') {
        const sigla = prompt('Digite a sigla do acorde (C, G, D, Am, Em, F):', 'C');
        if (sigla && window.ACORDES && window.ACORDES[sigla]) {
            inserirCodigoAcorde(`[Acorde:${sigla}]${window.ACORDES[sigla].nome}[/Acorde]`);
        } else if (sigla) {
            alert(`❌ Acorde "${sigla}" não encontrado! Use: C, G, D, Am, Em, F`);
        }
    }
    
    else if (opcao === '2') {
        if (bibliotecaAcordes && Object.keys(bibliotecaAcordes).length > 0) {
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
    
    else if (opcao === '4') {
        abrirEditorAcordes();
    }
    else if (opcao !== null) {
        alert('Opção inválida! Digite 1, 2, 3 ou 4');
    }
}

function inserirABC() {
    inserirCodigoAcorde(`[ABC]\nX:1\nM:4/4\nL:1/8\nK:C\nC DEF | GAB c |]\n[/ABC]\n`);
}

function inserirABCInfantil() {
    inserirCodigoAcorde(`[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/4\nK:C\nC DEF | GAB c |]\n[/ABC-INFANTIL]\n`);
}

function inserirPiano() {
    const sigla = prompt('Sigla (C, G, Am, F, Dm):', 'C');
    if (!sigla) return;
    const acordePiano = window.ACORDES_PIANO ? window.ACORDES_PIANO[sigla] : null;
    const nome = acordePiano ? acordePiano.nome : sigla;
    inserirCodigoAcorde(`[PIANO:${sigla}]${nome}[/PIANO]`);
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
    document.getElementById('sidebar')?.classList.toggle('collapsed');
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

// Mantido sem "Densidade Rítmica" fixa por ser um parâmetro relativo
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
        if (typeof adicionarBotaoSalvarDinamico === 'function') adicionarBotaoSalvarDinamico();
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
    
    // Renderização inicial
    renderizar();
}

document.addEventListener('DOMContentLoaded', init);

const styleToast = document.createElement('style');
styleToast.textContent = `@keyframes fadeOut { 0% { opacity: 1; transform: translateX(0); } 70% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(20px); } }`;
document.head.appendChild(styleToast);
