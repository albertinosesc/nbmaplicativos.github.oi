// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let ACORDES = {};
let coresAtivas = true;
let aulas = JSON.parse(localStorage.getItem('aulas') || '[]');
let aulaAtual = 0;
let timeoutRender;

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const listaAulas = document.getElementById('listaAulas');

// ============================================
// DICIONÁRIO DE ACORDES
// ============================================
const ACORDES_COMPLETO = {};

function mesclarAcordes() {
    for (let key in ACORDES_COMPLETO) delete ACORDES_COMPLETO[key];
    
    if (typeof ACORDES_MAIOR_C !== 'undefined') Object.assign(ACORDES_COMPLETO, ACORDES_MAIOR_C);
    if (typeof ACORDES_MENOR_C !== 'undefined') Object.assign(ACORDES_COMPLETO, ACORDES_MENOR_C);
    if (typeof ACORDES_DOMINANTE_C !== 'undefined') Object.assign(ACORDES_COMPLETO, ACORDES_DOMINANTE_C);
    if (typeof ACORDES_DIMINUTO_C !== 'undefined') Object.assign(ACORDES_COMPLETO, ACORDES_DIMINUTO_C);
    
    const salvos = localStorage.getItem('acordes_personalizados_usuario');
    if (salvos) Object.assign(ACORDES_COMPLETO, JSON.parse(salvos));
}

function carregarAcordes() {
    mesclarAcordes();
    ACORDES = ACORDES_COMPLETO;
}

function salvarAcordesPersonalizadosUsuario() {
    const personalizados = {};
    for (const [sigla, acorde] of Object.entries(ACORDES)) {
        const existeNoMaior = ACORDES_MAIOR_C?.[sigla];
        const existeNoMenor = ACORDES_MENOR_C?.[sigla];
        const existeNoDominante = ACORDES_DOMINANTE_C?.[sigla];
        const existeNoDiminuto = ACORDES_DIMINUTO_C?.[sigla];
        if (!existeNoMaior && !existeNoMenor && !existeNoDominante && !existeNoDiminuto) {
            personalizados[sigla] = acorde;
        }
    }
    localStorage.setItem('acordes_personalizados_usuario', JSON.stringify(personalizados));
}

function resetarAcordes() {
    if (confirm('Resetar acordes para o padrão?')) {
        localStorage.removeItem('acordes_personalizados_usuario');
        carregarAcordes();
        renderizar();
        alert('Acordes resetados!');
    }
}

// ============================================
// TELA CHEIA
// ============================================
function toggleFullscreenPreview() {
    const main = document.getElementById('main');
    const btn = document.getElementById('fullscreenBtn');
    
    main.classList.toggle('fullscreen-preview');
    
    if (main.classList.contains('fullscreen-preview')) {
        btn.innerHTML = '✕';
        document.getElementById('sidebar').classList.add('collapsed');
    } else {
        btn.innerHTML = '⛶';
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
    
    let newText;
    if (selectedText) {
        newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
        editor.value = newText;
        editor.setSelectionRange(start + before.length, end + before.length);
    } else {
        newText = text.substring(0, start) + before + after + text.substring(end);
        editor.value = newText;
        editor.setSelectionRange(start + before.length, start + before.length);
    }
    
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
    const sigla = prompt('Sigla (C, F, Bm, Bb) ou Formato (1;3):', 'C');
    const nome = prompt('Nome:', ACORDES[sigla]?.nome || sigla);
    if (sigla && nome) {
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
    const sigla = prompt('Sigla do acorde de piano (C, Dm, G7, Am, Cmaj7, etc):', 'C');
    if (!sigla) return;
    
    const acordePiano = typeof ACORDES_PIANO !== 'undefined' ? ACORDES_PIANO[sigla] : null;
    const nome = prompt('Nome do acorde:', acordePiano ? acordePiano.nome : sigla);
    
    if (sigla && nome) {
        const start = editor.selectionStart;
        const codigo = `[PIANO:${sigla}]${nome}[/PIANO]`;
        editor.value = editor.value.substring(0, start) + codigo + editor.value.substring(start);
        editor.setSelectionRange(start + codigo.length, start + codigo.length);
        renderizar();
        salvarAulaAtual();
        editor.focus();
        toast(`✅ ${codigo} inserido!`, "success");
    }
}

function toast(msg, tipo) {
    let t = document.createElement("div");
    t.textContent = msg;
    let bgColor = tipo === 'success' ? '#2ed573' : (tipo === 'warning' ? '#ffa502' : '#3a86ff');
    t.style.cssText = `position:fixed; bottom:20px; right:20px; background:${bgColor}; color:white; padding:12px 20px; border-radius:8px; z-index:9999; animation:fadeOut 3s forwards; font-weight:bold;`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// ============================================
// PROCESSAR ACORDE COM SINTAXE [Acorde:forma;casa]nome
// ============================================
function processarAcordeDinamico(sigla, nome) {
    const match = sigla.match(/^(\d+);(\d+)$/);
    
    if (match) {
        const forma = parseInt(match[1]);
        const casa = parseInt(match[2]);
        
        const formas = {
            1: {
                cordas: [casa, casa + 2, casa + 2, casa + 1, casa, casa],
                dedos: ['1', '3', '4', '2', '1', '1'],
                pestana: true,
                casaInicial: casa
            },
            2: {
                cordas: [casa, casa + 1, casa + 2, casa + 2, casa, casa],
                dedos: ['1', '2', '3', '4', '1', '1'],
                pestana: true,
                casaInicial: casa
            },
            3: {
                cordas: [casa, casa + 2, casa + 1, casa + 1, casa, casa],
                dedos: ['1', '3', '2', '4', '1', '1'],
                pestana: true,
                casaInicial: casa
            }
        };
        
        const formaBase = formas[forma];
        if (formaBase) {
            const cordasAjustadas = formaBase.cordas.map(corda => {
                if (corda === -1) return -1;
                if (corda === 0) return 0;
                return corda;
            });
            
            return {
                nome: nome || `${sigla} (casa ${casa})`,
                cordas: cordasAjustadas,
                dedos: formaBase.dedos,
                pestana: formaBase.pestana,
                casaInicial: formaBase.casaInicial,
                baixo: ''
            };
        }
    }
    return null;
}

// ============================================
// DESENHAR ACORDE DE VIOLÃO (MODIFICADO)
// ============================================
function desenharAcorde(container, sigla, nomeParam = '') {
    let acorde = ACORDES[sigla];
    let nomeExibido = nomeParam || (acorde ? acorde.nome : sigla);
    
    if (!acorde) {
        const acordeDinamico = processarAcordeDinamico(sigla, nomeExibido);
        if (acordeDinamico) {
            acorde = acordeDinamico;
            nomeExibido = acorde.nome;
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
    
    if (acorde.casaInicial > 1) {
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#333';
        ctx.fillText(acorde.casaInicial + 'ª', startX - 18, startY + fretSpacing / 2 + 2);
    }
    
    if (acorde.pestana) {
        const pestanaY = startY + (acorde.casaInicial - 1) * fretSpacing + 12;
        ctx.beginPath();
        ctx.moveTo(startX - 3, pestanaY);
        ctx.lineTo(startX + 5 * stringSpacing + 3, pestanaY);
        ctx.lineWidth = 7;
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.lineWidth = 1.5;
    }
    
    acorde.cordas.forEach((casa, i) => {
        const temPestana = acorde.pestana && casa === acorde.casaInicial;
        const casaRelativa = casa - acorde.casaInicial + 1;
        
        if (casa === 0) {
            const x = startX + i * stringSpacing;
            const y = startY - 12;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.strokeStyle = '#333';
            ctx.stroke();
        } else if (casa === -1) {
            const x = startX + i * stringSpacing;
            const y = startY - 12;
            ctx.beginPath();
            ctx.moveTo(x - 5, y - 5);
            ctx.lineTo(x + 5, y + 5);
            ctx.moveTo(x + 5, y - 5);
            ctx.lineTo(x - 5, y + 5);
            ctx.stroke();
        } else if (casa > 0 && casaRelativa > 0 && casaRelativa <= numFrets && !temPestana) {
            const x = startX + i * stringSpacing;
            const y = startY + (casaRelativa - 1) * fretSpacing + fretSpacing / 2;
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
// FUNÇÕES PARA CORES DO ABC INFANTIL
// ============================================
function getCorPorNota(nota) {
    let notaBase = nota.charAt(0).toUpperCase();
    const cores = {
        'C': '#FF0000', 'D': '#FF6600', 'E': '#FFDD00',
        'F': '#00CC00', 'G': '#0066FF', 'A': '#4B0082', 'B': '#8B00FF'
    };
    return cores[notaBase] || '#000000';
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
    
    const mapaCoresNotas = {
        'C': '#FF0000', 'D': '#FF6600', 'E': '#FFDD00',
        'F': '#00CC00', 'G': '#0066FF', 'A': '#4B0082', 'B': '#8B00FF'
    };
    
    document.querySelectorAll("#preview .abcjs-note").forEach(nota => {
        let cabecaNota = nota.querySelector('ellipse, circle');
        if (!cabecaNota) cabecaNota = nota.querySelector('path');
        
        if (cabecaNota) {
            let textoNota = nota.textContent || '';
            let notaNome = textoNota.match(/[CDEFGAB]/i)?.[0]?.toUpperCase();
            
            if (notaNome && mapaCoresNotas[notaNome]) {
                cabecaNota.style.fill = mapaCoresNotas[notaNome];
                cabecaNota.style.fillOpacity = '1';
            }
        }
    });
}

function aplicarCoresAcordesLetras() {
    document.querySelectorAll("#preview .abcjs-chord").forEach(el => {
        let texto = el.textContent || '';
        let cor = getCorPorTag(texto);
        if (cor !== "#000000") {
            el.style.fill = cor;
        }
        el.textContent = texto.replace(/\[(.*?)\]/g, "");
    });
    
    document.querySelectorAll("#preview .abcjs-lyric").forEach(el => {
        let texto = el.textContent || '';
        let cor = getCorPorTag(texto);
        if (cor !== "#000000") {
            el.style.fill = cor;
        }
        el.textContent = texto.replace(/\[(.*?)\]/g, "");
    });
}

// ============================================
// FUNÇÃO PARA PROCESSAR ABC COM ESPAÇAMENTO
// ============================================
function processarABCComEspacamento(id, codigo, tipo) {
    const elemento = document.getElementById(id);
    if (!elemento) return;
    
    const staffsep = document.getElementById("staffsepRange")?.value || 60;
    const sysstaffsep = document.getElementById("sysstaffsepRange")?.value || 80;
    
    let linhas = codigo.split('\n');
    let novasLinhas = [];
    let hasStaffsep = false;
    let hasSysstaffsep = false;
    
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
    
    if (!hasStaffsep && linhas.length > 0) {
        novasLinhas.unshift(`%%staffsep ${staffsep}`);
    }
    if (!hasSysstaffsep && linhas.length > 0) {
        novasLinhas.unshift(`%%sysstaffsep ${sysstaffsep}`);
    }
    
    let codigoProcessado = novasLinhas.join('\n');
    
    const opcoes = {
        add_classes: true,
        staffwidth: 800,
        responsive: 'resize'
    };
    
    try {
        ABCJS.renderAbc(id, codigoProcessado, opcoes);
        
        if (tipo === 'infantil') {
            setTimeout(() => {
                aplicarCoresAcordesLetras();
                if (coresAtivas) aplicarCoresNasNotas();
            }, 200);
        }
    } catch(e) {
        elemento.innerHTML = `<p style="color:red">Erro: ${e.message}</p>`;
    }
}

// ============================================
// FUNÇÃO PARA NORMALIZAR NOTAS (Eb -> D#)
// ============================================
function normalizarNota(nota) {
    const equivalencias = {
        'Cb': 'B', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E',
        'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#', 'E#': 'F', 'B#': 'C'
    };
    
    for (const [bemol, sustenido] of Object.entries(equivalencias)) {
        if (nota.startsWith(bemol)) {
            const oitava = nota.replace(bemol, '');
            return sustenido + oitava;
        }
    }
    return nota;
}

// ============================================
// DESENHAR TECLADO DO PIANO
// ============================================
function desenharTecladoPiano(container, sigla, nome, notasAcorde, startOitava = 'C3', endOitava = 'C5', dedosTreble = [], dedosBass = []) {
    container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: inline-block; margin: 10px auto; text-align: center; background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);';
    
    const title = document.createElement('div');
    title.style.cssText = 'font-size: 1.6em; font-weight: bold; color: #e94560; margin-bottom: 10px;';
    title.textContent = `${nome}`;
    wrapper.appendChild(title);
    
    const pianoDiv = document.createElement('div');
    pianoDiv.style.cssText = 'display: flex; position: relative; background: #131212; padding: 3px; border-radius: 4px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.3);';
    
    const escalaCompleta = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const startMatch = startOitava.match(/^([A-G])(\d+)$/);
    const endMatch = endOitava.match(/^([A-G])(\d+)$/);
    
    if (!startMatch || !endMatch) {
        container.innerHTML = '<div style="color:red">Erro no range</div>';
        return;
    }
    
    const mapaPosicoesPretas = {
        'C#3': 0, 'D#3': 1, 'F#3': 3, 'G#3': 4, 'A#3': 5,
        'C#4': 7, 'D#4': 8, 'F#4': 10, 'G#4': 11, 'A#4': 12,
        'C#5': 14, 'D#5': 15, 'F#5': 17, 'G#5': 18, 'A#5': 19
    };
    
    const whiteKeyWidth = 37;
    const whiteKeyHeight = 120;
    const blackKeyWidth = 25;
    const blackKeyHeight = 79;
    const blackKeyOffset = 34;
    
    const teclasNoRange = [];
    for (let oct = parseInt(startMatch[2]); oct <= parseInt(endMatch[2]); oct++) {
        for (let i = 0; i < escalaCompleta.length; i++) {
            const nota = escalaCompleta[i];
            const num = (oct + 1) * 12 + i;
            if (num >= (parseInt(startMatch[2]) + 1) * 12 + escalaCompleta.indexOf(startMatch[1]) &&
                num <= (parseInt(endMatch[2]) + 1) * 12 + escalaCompleta.indexOf(endMatch[1])) {
                teclasNoRange.push({ nota, oitava: oct, num });
            }
        }
    }
    
    const whiteKeys = [];
    const blackKeys = [];
    
    teclasNoRange.forEach(tecla => {
        if (!tecla.nota.includes('#')) {
            whiteKeys.push(tecla);
        }
    });
    
    teclasNoRange.forEach(tecla => {
        if (tecla.nota.includes('#')) {
            const chave = `${tecla.nota}${tecla.oitava}`;
            const pos = mapaPosicoesPretas[chave];
            if (pos !== undefined) {
                blackKeys.push({ ...tecla, pos });
            }
        }
    });
    
    function getDedo(notaCompleta) {
        const notaNormalizada = normalizarNota(notaCompleta);
        for (let i = 0; i < notasAcorde.length; i++) {
            const notaAcordeNormalizada = normalizarNota(notasAcorde[i]);
            if (notaAcordeNormalizada === notaNormalizada) {
                if (dedosTreble[i]) {
                    return { dedo: dedosTreble[i], mao: 'treble' };
                }
            }
        }
        return null;
    }
    
    whiteKeys.forEach(tecla => {
        const notaCompleta = `${tecla.nota}${tecla.oitava}`;
        const infoDedo = getDedo(notaCompleta);
        const isActive = infoDedo !== null;
        
        const whiteKey = document.createElement('div');
        whiteKey.style.cssText = `
            width: ${whiteKeyWidth}px;
            height: ${whiteKeyHeight}px;
            background: ${isActive ? 'linear-gradient(to bottom, #3a86ff 0%, #2666cc 100%)' : 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)'};
            border: 1px solid #333;
            border-radius: 0 0 8px 8px;
            position: relative;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 1;
            cursor: default;
        `;
        
        if (infoDedo) {
            const dedoDiv = document.createElement('div');
            dedoDiv.textContent = infoDedo.dedo;
            dedoDiv.style.cssText = `
                position: absolute;
                top: 80%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 23px;
                height: 25px;
                background: white;
                color: #141414;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                font-weight: bold;
                font-family: Arial;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                z-index: 10;
            `;
            whiteKey.appendChild(dedoDiv);
        }
        
        pianoDiv.appendChild(whiteKey);
    });
    
    blackKeys.forEach(tecla => {
        const notaCompleta = `${tecla.nota}${tecla.oitava}`;
        const infoDedo = getDedo(notaCompleta);
        const isActive = infoDedo !== null;
        
        const blackKey = document.createElement('div');
        blackKey.style.cssText = `
            width: ${blackKeyWidth}px;
            height: ${blackKeyHeight}px;
            background: ${isActive ? 'linear-gradient(to bottom, #ff4757 0%, #cc2233 100%)' : 'linear-gradient(to bottom, #222 0%, #111 100%)'};
            position: absolute;
            left: ${tecla.pos * whiteKeyWidth + blackKeyOffset}px;
            top: 0;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            z-index: 2;
            cursor: default;
        `;
        
        if (infoDedo) {
            const dedoDiv = document.createElement('div');
            dedoDiv.textContent = infoDedo.dedo;
            dedoDiv.style.cssText = `
                position: absolute;
                top: 78%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 18px;
                height: 20px;
                background: white;
                color: #111111;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                font-family: Arial;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                z-index: 11;
            `;
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
    let conteudo = editor.value;
    
    try {
        let processado = conteudo;
        const acordes = [];
        const pianos = [];
        const abcInfantis = [];
        const abcNormais = [];
        
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
            if (el && typeof ACORDES_PIANO !== 'undefined') {
                const acorde = ACORDES_PIANO[p.sigla];
                if (acorde) {
                    desenharTecladoPiano(el, p.sigla, acorde.nome, acorde.notas, acorde.startOitava, acorde.endOitava, acorde.dedosTreble || [], acorde.dedosBass || []);
                } else {
                    el.innerHTML = `<div style="color:red; padding:10px;">❌ Acorde "${p.sigla}" não encontrado</div>`;
                }
            }
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
        preview.innerHTML = '<p style="color:red; padding: 20px;">❌ Erro ao renderizar: ' + e.message + '</p>';
    }
}

// ============================================
// SISTEMA DE AULAS
// ============================================
function salvarTudo() {
    localStorage.setItem('aulas', JSON.stringify(aulas));
    salvarAcordesPersonalizadosUsuario();
}

function renderLista() {
    listaAulas.innerHTML = '';
    aulas.forEach((a, i) => {
        const btn = document.createElement('button');
        btn.textContent = a.titulo || 'Aula ' + (i + 1);
        btn.onclick = () => carregarAula(i);
        listaAulas.appendChild(btn);
    });
}

function novaAula() {
    aulas.push({
        id: Date.now(),
        titulo: 'Nova Aula',
        conteudo: `# Aluno
<div style="font-size: 19px; margin-top: -20px;">   NBM Escola de Música</div>
Data: 19-04-26
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
Aula: 01

--- 
---
## Assunto

---
---`
    });
    aulaAtual = aulas.length - 1;
    carregarAula(aulaAtual);
    salvarTudo();
    renderLista();
}

function excluirAulaAtual() {
    if (aulas.length === 1) {
        alert('Não é possível excluir a única aula');
        return;
    }
    if (confirm('Excluir esta aula?')) {
        aulas.splice(aulaAtual, 1);
        if (aulaAtual >= aulas.length) aulaAtual = aulas.length - 1;
        salvarTudo();
        renderLista();
        carregarAula(aulaAtual);
    }
}

function carregarAula(i) {
    aulaAtual = i;
    editor.value = aulas[i].conteudo;
    renderizar();
}

function salvarAulaAtual() {
    if (aulas[aulaAtual]) {
        aulas[aulaAtual].conteudo = editor.value;
        aulas[aulaAtual].titulo = editor.value.split('\n')[0].replace('#', '').trim() || 'Aula sem título';
        salvarTudo();
        renderLista();
    }
}

// ============================================
// AJUSTES
// ============================================
function toggleCoresNotas() {
    coresAtivas = !coresAtivas;
    let btn = document.getElementById("btnCores");
    if (coresAtivas) {
        btn.style.background = "#00CC00";
        btn.textContent = "✅ Cores";
        aplicarCoresNasNotas();
        aplicarCoresAcordesLetras();
    } else {
        btn.style.background = "#CC0000";
        btn.textContent = "❌ Cores";
        document.querySelectorAll("#preview .abcjs-note ellipse, #preview .abcjs-note circle").forEach(el => el.style.fill = '#000000');
        document.querySelectorAll("#preview .abcjs-chord, #preview .abcjs-lyric").forEach(el => el.style.fill = '#000000');
    }
}

function ajustarAcordes() {
    let valor = parseFloat(document.getElementById("acordeRange")?.value || -8);
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
    let valor = parseFloat(document.getElementById("letraRange")?.value || 12);
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
    let valor = parseFloat(document.getElementById("letraXRange")?.value || 5);
    document.getElementById("letraXValue").innerText = valor;
    document.querySelectorAll("#preview .abcjs-lyric").forEach(el => {
        let xAtual = parseFloat(el.getAttribute("x"));
        if (!isNaN(xAtual)) {
            if (!el.dataset.xOriginal) el.dataset.xOriginal = xAtual;
            el.setAttribute("x", parseFloat(el.dataset.xOriginal) + valor);
        }
    });
}

function atualizarStaffSep() { 
    const valor = document.getElementById("staffsepRange")?.value;
    if (document.getElementById("staffsepValue")) document.getElementById("staffsepValue").innerText = valor;
    renderizar(); 
}

function atualizarSysStaffSep() { 
    const valor = document.getElementById("sysstaffsepRange")?.value;
    if (document.getElementById("sysstaffsepValue")) document.getElementById("sysstaffsepValue").innerText = valor;
    renderizar(); 
}

function atualizarIntensidadeCores() { if (coresAtivas) aplicarCoresNasNotas(); }

// ============================================
// MENUS
// ============================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const main = document.getElementById('main');
    
    sidebar.classList.toggle('collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        main.style.width = '100%';
        main.style.marginLeft = '0';
    } else {
        main.style.width = '';
        main.style.marginLeft = '';
    }
    
    setTimeout(() => {
        renderizar();
    }, 300);
}

function toggleCategoria(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) menu.classList.toggle('collapsed');
}

function abrirModalPiano() {
    const modal = document.getElementById('modalPiano');
    if (modal) {
        modal.style.display = 'block';
        if (typeof initPiano === 'function') initPiano();
    }
}

function fecharModalPiano() {
    const modal = document.getElementById('modalPiano');
    if (modal) modal.style.display = 'none';
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function init() {
    console.log("Inicializando sistema...");
    carregarAcordes();
    
    if (aulas.length === 0) {
        novaAula();
    } else {
        renderLista();
        carregarAula(0);
    }
    
    editor.addEventListener('input', () => {
        clearTimeout(timeoutRender);
        timeoutRender = setTimeout(() => {
            renderizar();
            salvarAulaAtual();
        }, 300);
    });
}

document.addEventListener('DOMContentLoaded', init);

// Adicionar estilo para animação do toast
const styleToast = document.createElement('style');
styleToast.textContent = `
    @keyframes fadeOut {
        0% { opacity: 1; transform: translateX(0); }
        70% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(20px); }
    }
`;
document.head.appendChild(styleToast);
