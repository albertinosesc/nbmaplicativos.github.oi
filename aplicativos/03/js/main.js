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
    const sigla = prompt('Sigla (C, F, Bm, Bb):', 'C');
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
    const sigla = prompt('Sigla do acorde de piano (C, Dm, G7, Am, etc):', 'C');
    const nome = prompt('Nome do acorde:', ACORDES_PIANO[sigla]?.nome || sigla);
    if (sigla && nome) {
        const start = editor.selectionStart;
        editor.value = editor.value.substring(0, start) + `[PIANO:${sigla}]${nome}[/PIANO]` + editor.value.substring(start);
        renderizar();
        salvarAulaAtual();
    }
}

// ============================================
// DESENHAR ACORDE DE VIOLÃO
// ============================================
function desenharAcorde(container, sigla) {
    const acorde = ACORDES[sigla];
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
    cifraDiv.textContent = sigla;
    cifraDiv.style.position = 'absolute';
    cifraDiv.style.top = '-2px';
    cifraDiv.style.left = '48%';
    cifraDiv.style.transform = 'translateX(-50%)';
    cifraDiv.style.fontSize = '1.4em';
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
    
    if (acorde.pestana && Array.isArray(acorde.pestana)) {
        let inicio = acorde.pestana[0], fim = inicio;
        for (let i = 1; i <= acorde.pestana.length; i++) {
            if (i < acorde.pestana.length && acorde.pestana[i] === acorde.pestana[i - 1] + 1) {
                fim = acorde.pestana[i];
            } else {
                const xInicio = startX + inicio * stringSpacing;
                const xFim = startX + fim * stringSpacing;
                ctx.beginPath();
                ctx.moveTo(xInicio - 3, startY + 12);
                ctx.lineTo(xFim + 3, startY + 12);
                ctx.lineWidth = 8;
                ctx.strokeStyle = '#000000';
                ctx.stroke();
                if (i < acorde.pestana.length) {
                    inicio = acorde.pestana[i];
                    fim = inicio;
                }
            }
        }
    }
    
    acorde.cordas.forEach((casa, i) => {
        const temPestana = acorde.pestana && Array.isArray(acorde.pestana) && acorde.pestana.includes(i);
        const casaRelativa = casa - acorde.casaInicial + 1;
        if (temPestana && casa === acorde.casaInicial) return;
        if (casa > 0 && casaRelativa > 0 && casaRelativa <= numFrets) {
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
    
    acorde.cordas.forEach((casa, i) => {
        if (casa === 0) {
            const x = startX + i * stringSpacing;
            const y = startY - 12;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.strokeStyle = '#333';
            ctx.stroke();
        }
    });
    
    acorde.cordas.forEach((casa, stringIndex) => {
        if (casa === -1) {
            const x = startX + stringIndex * stringSpacing;
            const y = startY - 12;
            ctx.beginPath();
            ctx.moveTo(x - 5, y - 5);
            ctx.lineTo(x + 5, y + 5);
            ctx.moveTo(x + 5, y - 5);
            ctx.lineTo(x - 5, y + 5);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#333';
            ctx.stroke();
        }
    });
    
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);
}

// ============================================
// RENDERIZAÇÃO PRINCIPAL
// ============================================
function renderizar() {
    let conteudo = editor.value;
    
    try {
        let processado = conteudo;
        const acordes = [];
        const pianos = [];
        const abcInfantis = [];
        const abcNormais = [];
        
        processado = processado.replace(/\[Acorde:([^\]]+)\]([\s\S]*?)\[\/Acorde\]/g, (match, sigla) => {
            const id = 'chord-' + Date.now() + '-' + acordes.length;
            acordes.push({ id, sigla });
            return `<div id="${id}" class="chord-diagram"></div>`;
        });
        
        processado = processado.replace(/\[PIANO:([^\]]+)\]([\s\S]*?)\[\/PIANO\]/g, (match, sigla, nome) => {
            const id = 'piano-' + Date.now() + '-' + pianos.length;
            pianos.push({ id, sigla, nome });
            return `<div id="${id}" class="piano-diagram"></div>`;
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
            if (el) desenharAcorde(el, a.sigla);
        });
        
        pianos.forEach(p => {
            const el = document.getElementById(p.id);
            if (el && typeof desenharAcordePiano !== 'undefined') {
                desenharAcordePiano(el, p.sigla, p.nome);
            }
        });
        
        abcNormais.forEach(a => {
            const el = document.getElementById(a.id);
            if (el && typeof ABCJS !== 'undefined') {
                try {
                    const containerWidth = el.clientWidth - 20;
                    const staffwidth = Math.min(containerWidth, 500);
                    ABCJS.renderAbc(a.id, a.code, { scale: 1.0, staffwidth: staffwidth });
                } catch (e) {
                    el.innerHTML = `<p style="color:red">Erro: ${e.message}</p>`;
                }
            }
        });
        
        abcInfantis.forEach(a => {
            const el = document.getElementById(a.id);
            if (el && typeof ABCJS !== 'undefined') {
                try {
                    const containerWidth = el.clientWidth - 20;
                    const staffwidth = Math.min(containerWidth, 500);
                    ABCJS.renderAbc(a.id, a.code, { add_classes: true, scale: 1.0, staffwidth: staffwidth });
                } catch (e) {
                    el.innerHTML = `<p style="color:red">Erro: ${e.message}</p>`;
                }
            }
        });
        
        setTimeout(() => {
            if (coresAtivas) {
                if (typeof aplicarCoresNasNotas === 'function') aplicarCoresNasNotas();
                if (typeof aplicarCoresAcordesLetras === 'function') aplicarCoresAcordesLetras();
            }
            if (typeof ajustarAcordes === 'function') ajustarAcordes();
            if (typeof ajustarLetras === 'function') ajustarLetras();
            if (typeof ajustarLetrasX === 'function') ajustarLetrasX();
        }, 200);
        
    } catch (e) {
        preview.innerHTML = '<p style="color:red">Erro: ' + e.message + '</p>';
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
        conteudo: `# Minha Aula Completa

## Acorde de Violão
[Acorde:C]Dó Maior[/Acorde]

## Acorde de Piano
[PIANO:C]Dó Maior[/PIANO]

## Partitura Normal
[ABC]
X:1
M:4/4
L:1/8
K:C
C D E F | G A B c |]
[/ABC]

## Partitura Infantil (colorida)
[ABC-INFANTIL]
X:1
M:4/4
L:1/4
K:C
C D E F | G A B c |]
[/ABC-INFANTIL]`
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
// AJUSTES (CORES, POSIÇÕES)
// ============================================
function toggleCoresNotas() {
    coresAtivas = !coresAtivas;
    let btn = document.getElementById("btnCores");
    if (coresAtivas) {
        btn.style.background = "#00CC00";
        btn.textContent = "✅ Cores";
        if (typeof aplicarCoresNasNotas === 'function') aplicarCoresNasNotas();
        if (typeof aplicarCoresAcordesLetras === 'function') aplicarCoresAcordesLetras();
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

function atualizarStaffSep() { renderizar(); }
function atualizarSysStaffSep() { renderizar(); }
function atualizarIntensidadeCores() { if (coresAtivas && typeof aplicarCoresNasNotas === 'function') aplicarCoresNasNotas(); }

// ============================================
// MENUS E SIDEBAR
// ============================================
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleCategoria(menuId) {
    const menu = document.getElementById(menuId);
    if (menu) menu.classList.toggle('collapsed');
}

// ============================================
// EVENTOS E INICIALIZAÇÃO
// ============================================
document.addEventListener('click', function (event) {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.toggle-sidebar');
    const isMobile = window.innerWidth <= 768;
    if (isMobile && !sidebar.classList.contains('collapsed')) {
        if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
            sidebar.classList.add('collapsed');
        }
    }
});

window.onclick = function (event) {
    const modal = document.getElementById('modalAcordes');
    if (event.target === modal && typeof fecharEditorAcordes === 'function') fecharEditorAcordes();
};

editor.addEventListener('input', () => {
    clearTimeout(timeoutRender);
    timeoutRender = setTimeout(() => {
        renderizar();
        salvarAulaAtual();
    }, 300);
});

carregarAcordes();
if (aulas.length === 0) novaAula();
else { renderLista(); carregarAula(0); }
