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

console.log('✅ Ajustes carregados');
