// piano_editor.js
// ============================================
// EDITOR DE PIANO - FUNÇÕES COMPLETAS
// ============================================

const escalaPadrao = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
let notasSelecPiano = [];
let diagramasPiano = [];
let diagramaPianoSelecionado = null;
let filtroPiano = "";
let clefAtualPiano = "treble";

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
function notaParaNum(letra, acidental, oitava) {
    let base = escalaPadrao.indexOf(letra);
    let offset = acidental === "^" ? 1 : acidental === "_" ? -1 : 0;
    return (parseInt(oitava) + 1) * 12 + base + offset;
}

function numParaNota(num) {
    return escalaPadrao[num % 12] + (Math.floor(num / 12) - 1);
}

function formatarCifra(acc, char) {
    if (acc === "^") return char + "#";
    if (acc === "_") return char + "b";
    return char;
}

function oitavaParaABCNome(notaChar, oitava) {
    let letra = notaChar;
    if (oitava === 2) return letra + ",,0";
    if (oitava === 3) return letra + ",0";
    if (oitava === 4) return letra + "0";
    if (oitava === 5) return letra.toLowerCase() + "0";
    if (oitava === 6) return letra.toLowerCase() + "'0";
    if (oitava === 7) return letra.toLowerCase() + "''0";
    if (oitava === 1) return letra + ",,,0";
    return letra + (oitava - 4) + "0";
}

function abcParaOitava(notaStr) {
    let match = notaStr.match(/^([\^_]?)([A-Ga-g])([,']*)(\d+)$/);
    if (!match) return null;
    let acc = match[1];
    let letra = match[2].toUpperCase();
    let modificadores = match[3];
    let oitava = 4;
    if (modificadores.includes(',')) {
        let commas = (modificadores.match(/,/g) || []).length;
        oitava = 4 - commas;
    } else if (modificadores.includes("'")) {
        let apostrofes = (modificadores.match(/'/g) || []).length;
        oitava = 5 + apostrofes;
    } else if (letra !== match[2]) {
        oitava = 5;
    }
    return { acc, letra, oitava, num: notaParaNum(letra, acc, oitava) };
}

function escapeHtml(text) {
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
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
// CONTROLE DE CLAVE
// ============================================
function setClefModePiano(clef) {
    clefAtualPiano = clef;
    const trebleBtn = document.getElementById("clefTrebleBtn");
    const bassBtn = document.getElementById("clefBassBtn");
    const modeLabel = document.getElementById("clefModeLabel");
    
    if (trebleBtn) trebleBtn.classList.remove("active");
    if (bassBtn) bassBtn.classList.remove("active");
    
    if (clef === "treble") {
        if (trebleBtn) trebleBtn.classList.add("active");
        if (modeLabel) {
            modeLabel.innerHTML = "🔵 Clave de Sol";
            modeLabel.className = "clef-indicator treble";
        }
    } else {
        if (bassBtn) bassBtn.classList.add("active");
        if (modeLabel) {
            modeLabel.innerHTML = "🟢 Clave de Fá";
            modeLabel.className = "clef-indicator bass";
        }
    }
}

// ============================================
// CRIAR TECLADO
// ============================================
function criarTecladoPiano() {
    const kb = document.getElementById("keyboard");
    if (!kb) return;
    
    kb.innerHTML = "";
    let startNota = document.getElementById("startNota")?.value || "C3";
    let endNota = document.getElementById("endNota")?.value || "C5";
    
    let startMatch = startNota.match(/^([A-G])(\d+)$/);
    let endMatch = endNota.match(/^([A-G])(\d+)$/);
    
    if (!startMatch || !endMatch) return;
    
    const startNum = notaParaNum(startMatch[1], "", startMatch[2]);
    const endNum = notaParaNum(endMatch[1], "", endMatch[2]);
    const zoom = parseInt(document.getElementById("zoomPiano")?.value || 30);
    const w = zoom;
    const h = w * 4.5;
    
    let whites = {};
    for (let i = startNum; i <= endNum; i++) {
        let n = numParaNota(i);
        if (!n.includes("#")) {
            let k = document.createElement("div");
            k.className = "white";
            k.dataset.nota = i;
            k.onclick = () => toggleNotaPiano(i);
            k.innerHTML = `<div class="noteLabel">${n}</div>`;
            k.style.width = w + "px";
            k.style.height = h + "px";
            k.style.display = "inline-block";
            k.style.position = "relative";
            k.style.cursor = "pointer";
            kb.appendChild(k);
            whites[i] = k;
        }
    }
    
    for (let i = startNum; i <= endNum; i++) {
        let n = numParaNota(i);
        if (n.includes("#")) {
            let p = whites[i-1];
            if (p && p.parentNode === kb) {
                let b = document.createElement("div");
                b.className = "black";
                b.dataset.nota = i;
                b.style.width = (w * 0.65) + "px";
                b.style.height = (h * 0.6) + "px";
                b.style.left = (w * 0.68) + "px";
                b.style.top = "0";
                b.style.position = "absolute";
                b.style.backgroundColor = "#222";
                b.onclick = (e) => { e.stopPropagation(); toggleNotaPiano(i); };
                p.appendChild(b);
            }
        }
    }
}

function toggleNotaPiano(num) {
    let existente = notasSelecPiano.find(n => n.num === num && n.clef === clefAtualPiano);
    if (existente) {
        notasSelecPiano = notasSelecPiano.filter(n => !(n.num === num && n.clef === clefAtualPiano));
    } else {
        let notaBase = escalaPadrao[num % 12];
        let oitava = Math.floor(num / 12) - 1;
        let char = notaBase[0];
        let acc = notaBase.includes("#") ? "^" : "";
        notasSelecPiano.push({num, char, acc, oitava, clef: clefAtualPiano});
    }
    notasSelecPiano.sort((a, b) => a.num - b.num);
    atualizarCoresTecladoPiano();
    gerarABCPiano();
}

function atualizarCoresTecladoPiano() {
    document.querySelectorAll("#keyboard .white, #keyboard .black").forEach(el => {
        el.classList.remove("activeWhiteTreble", "activeBlackTreble", "activeWhiteBass", "activeBlackBass");
    });
    notasSelecPiano.forEach(nota => {
        let tecla = document.querySelector(`#keyboard [data-nota="${nota.num}"]`);
        if (tecla) {
            if (nota.clef === "treble") {
                tecla.classList.add(tecla.classList.contains("white") ? "activeWhiteTreble" : "activeBlackTreble");
            } else {
                tecla.classList.add(tecla.classList.contains("white") ? "activeWhiteBass" : "activeBlackBass");
            }
        }
    });
}

function gerarABCPiano() {
    let notasTreble = notasSelecPiano.filter(n => n.clef === "treble");
    let notasBass = notasSelecPiano.filter(n => n.clef === "bass");
    
    let trebleNotes = notasTreble.map(n => {
        let nota = n.char;
        if (n.acc === "^") nota = "^" + n.char;
        else if (n.acc === "_") nota = "_" + n.char;
        return oitavaParaABCNome(nota.replace(/[\^_]/g, ''), n.oitava);
    }).join(" ");
    
    let bassNotes = notasBass.map(n => {
        let nota = n.char;
        if (n.acc === "^") nota = "^" + n.char;
        else if (n.acc === "_") nota = "_" + n.char;
        return oitavaParaABCNome(nota.replace(/[\^_]/g, ''), n.oitava);
    }).join(" ");
    
    let abcString = `X:1\nK:C\nV:1 clef=treble\n[${trebleNotes || "z"}]|]\nV:2 clef=bass\n[${bassNotes || "z"}]|]`;
    let abcField = document.getElementById("abcTextPiano");
    if (abcField) abcField.value = abcString;
    atualizarEditorPiano();
}

function sincronizarDoABCPiano() {
    let texto = document.getElementById("abcTextPiano")?.value || "";
    let trebleMatch = texto.match(/V:1[^\n]*\n\[(.*?)\]/);
    let bassMatch = texto.match(/V:2[^\n]*\n\[(.*?)\]/);
    
    notasSelecPiano = [];
    
    if (trebleMatch) {
        let notasRaw = trebleMatch[1];
        let regex = /([\^_]?)([A-Ga-g][,']*\d+)/g;
        let m;
        while ((m = regex.exec(notasRaw)) !== null) {
            let acc = m[1];
            let notaCompleta = m[2];
            let resultado = abcParaOitava(notaCompleta);
            if (resultado) {
                let num = notaParaNum(resultado.letra, acc || resultado.acc, resultado.oitava);
                notasSelecPiano.push({num, char: resultado.letra, acc: acc || resultado.acc, oitava: resultado.oitava, clef: "treble"});
            }
        }
    }
    
    if (bassMatch) {
        let notasRaw = bassMatch[1];
        let regex = /([\^_]?)([A-Ga-g][,']*\d+)/g;
        let m;
        while ((m = regex.exec(notasRaw)) !== null) {
            let acc = m[1];
            let notaCompleta = m[2];
            let resultado = abcParaOitava(notaCompleta);
            if (resultado) {
                let num = notaParaNum(resultado.letra, acc || resultado.acc, resultado.oitava);
                notasSelecPiano.push({num, char: resultado.letra, acc: acc || resultado.acc, oitava: resultado.oitava, clef: "bass"});
            }
        }
    }
    
    notasSelecPiano.sort((a, b) => a.num - b.num);
    atualizarCoresTecladoPiano();
    atualizarEditorPiano();
}

function atualizarEditorPiano() {
    let startNota = document.getElementById("startNota")?.value || "C3";
    let endNota = document.getElementById("endNota")?.value || "C5";
    let zoom = parseInt(document.getElementById("zoomPiano")?.value || 30);
    let fingersTreble = document.getElementById("fingersTreble")?.value || "1 3 5";
    let fingersBass = document.getElementById("fingersBass")?.value || "5 3 1";
    
    desenharDiagramaPiano(document.getElementById("preview-diagram-piano"), notasSelecPiano, startNota, endNota, zoom, fingersTreble, fingersBass);
    renderizarPartituraPiano(document.getElementById("preview-score-piano"), document.getElementById("abcTextPiano")?.value);
}

function desenharDiagramaPiano(container, notas, start, end, zoom, fingersTreble, fingersBass) {
    if (!container) return;
    container.innerHTML = "";
    
    let startMatch = start.match(/^([A-G])(\d+)$/);
    let endMatch = end.match(/^([A-G])(\d+)$/);
    if (!startMatch || !endMatch) return;
    
    const startNum = notaParaNum(startMatch[1], "", startMatch[2]);
    const endNum = notaParaNum(endMatch[1], "", endMatch[2]);
    const w = zoom;
    const h = w * 4.5;
    
    let fingersTrebleArr = fingersTreble.trim().split(/\s+/).filter(d => d !== '');
    let fingersBassArr = fingersBass.trim().split(/\s+/).filter(d => d !== '');
    
    let wrap = document.createElement("div");
    wrap.style.width = "100%";
    wrap.style.display = "flex";
    wrap.style.justifyContent = "center";
    
    let keyboardContainer = document.createElement("div");
    keyboardContainer.style.position = "relative";
    keyboardContainer.style.display = "inline-block";
    keyboardContainer.style.height = (h + 8) + "px";
    
    let whites = {};
    for (let i = startNum; i <= endNum; i++) {
        let notaPura = numParaNota(i);
        if (!notaPura.includes("#")) {
            let k = document.createElement("div");
            k.style.width = w + "px";
            k.style.height = h + "px";
            k.style.backgroundColor = "#fff";
            k.style.display = "inline-block";
            k.style.position = "relative";
            k.style.border = "1px solid #999";
            k.style.borderRadius = "0 0 4px 4px";
            
            let nSel = notas.find(ns => ns.num === i);
            if (nSel) {
                let corFundo = nSel.clef === "treble" ? "#d0e7ff" : "#d4f1e6";
                k.style.background = corFundo;
                let notasMesmaClef = notas.filter(n => n.clef === nSel.clef);
                let index = notasMesmaClef.findIndex(n => n.num === i);
                let cifra = formatarCifra(nSel.acc, nSel.char);
                let dedoNum = nSel.clef === "treble" ? fingersTrebleArr[index] : fingersBassArr[index];
                let circuloSiz = Math.max(16, w * 0.38);
                let fontSize = Math.max(10, w * 0.32);
                let corDedo = nSel.clef === "treble" ? "#ff4757" : "#e67e22";
                
                k.innerHTML = `<div style="position:absolute; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; bottom:10px; left:0;">
                    <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
                        ${dedoNum ? `<div style="width:${circuloSiz}px; height:${circuloSiz}px; font-size:${fontSize}px; background:${corDedo}; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">${dedoNum}</div>` : ''}
                        <div style="font-weight:bold; font-size:${fontSize}px; background:rgba(255,255,255,0.9); padding:1px 4px; border-radius:3px;">${cifra}</div>
                    </div>
                </div>`;
            }
            keyboardContainer.appendChild(k);
            whites[i] = k;
        }
    }
    
    for (let i = startNum; i <= endNum; i++) {
        let notaPura = numParaNota(i);
        if (notaPura.includes("#")) {
            let p = whites[i-1];
            if (p && p.parentNode === keyboardContainer) {
                let b = document.createElement("div");
                b.style.width = (w * 0.65) + "px";
                b.style.height = (h * 0.6) + "px";
                b.style.left = (w * 0.68) + "px";
                b.style.top = "0";
                b.style.position = "absolute";
                b.style.backgroundColor = "#222";
                b.style.borderRadius = "0 0 3px 3px";
                
                let nSel = notas.find(ns => ns.num === i);
                if (nSel) {
                    let corFundo = nSel.clef === "treble" ? "#3a86ff" : "#2ecc71";
                    b.style.background = corFundo;
                    let notasMesmaClef = notas.filter(n => n.clef === nSel.clef);
                    let index = notasMesmaClef.findIndex(n => n.num === i);
                    let cifra = formatarCifra(nSel.acc, nSel.char);
                    let dedoNum = nSel.clef === "treble" ? fingersTrebleArr[index] : fingersBassArr[index];
                    let circuloSiz = Math.max(14, w * 0.33);
                    let fontSize = Math.max(9, w * 0.28);
                    
                    b.innerHTML = `<div style="position:absolute; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; bottom:4px; left:0;">
                        <div style="display:flex; flex-direction:column; align-items:center; gap:1px;">
                            ${dedoNum ? `<div style="width:${circuloSiz}px; height:${circuloSiz}px; font-size:${fontSize}px; background:#ff4757; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center;">${dedoNum}</div>` : ''}
                            <div style="font-weight:bold; font-size:${fontSize}px; color:white; text-shadow:0 1px 1px black;">${cifra}</div>
                        </div>
                    </div>`;
                }
                p.style.position = "relative";
                p.appendChild(b);
            }
        }
    }
    
    wrap.appendChild(keyboardContainer);
    container.appendChild(wrap);
}

function renderizarPartituraPiano(container, abcTexto) {
    if (!container) return;
    container.innerHTML = "";
    if (!abcTexto || !abcTexto.trim()) return;
    try {
        let wrapper = document.createElement("div");
        wrapper.className = "dual-stave";
        ABCJS.renderAbc(wrapper, abcTexto, { 
            staffwidth: 300, 
            scale: 1.0, 
            paddingtop: 1, 
            paddingbottom: 28,
            add_classes: true
        });
        container.appendChild(wrapper);
    } catch(e) {
        container.innerHTML = "<small style='color:red'>Erro na partitura</small>";
    }
}

// ============================================
// IDENTIFICAR SIGLA DO ACORDE PELAS NOTAS
// ============================================
function identificarSiglaAcorde(notas) {
    const notasSelecionadas = notas.map(n => {
        let nota = n.char;
        if (n.acc === "^") nota += "#";
        else if (n.acc === "_") nota += "b";
        return nota;
    }).sort();
    
    if (typeof ACORDES_PIANO === 'undefined') return null;
    
    for (const [sigla, acorde] of Object.entries(ACORDES_PIANO)) {
        const notasAcorde = [...acorde.notas].sort();
        if (JSON.stringify(notasSelecionadas) === JSON.stringify(notasAcorde)) {
            return sigla;
        }
    }
    return null;
}

// ============================================
// GERENCIAMENTO DE DIAGRAMAS
// ============================================
function adicionarDiagramaPiano() {
    let nome = document.getElementById("diagramNamePiano")?.value.trim() || "Sem nome";
    if (notasSelecPiano.length === 0) { 
        toast("Selecione pelo menos uma nota!", "warning");
        return; 
    }
    
    const siglaIdentificada = identificarSiglaAcorde(notasSelecPiano);
    
    diagramasPiano.push({
        id: Date.now(),
        nome: nome,
        sigla: siglaIdentificada || null,
        startNota: document.getElementById("startNota")?.value || "C3",
        endNota: document.getElementById("endNota")?.value || "C5",
        zoom: parseInt(document.getElementById("zoomPiano")?.value || 30),
        fingersTreble: document.getElementById("fingersTreble")?.value || "1 3 5",
        fingersBass: document.getElementById("fingersBass")?.value || "5 3 1",
        abc: document.getElementById("abcTextPiano")?.value || "",
        notas: JSON.parse(JSON.stringify(notasSelecPiano))
    });
    
    salvarDiagramasPiano();
    renderizarListaPiano();
    toast("✅ Diagrama de piano adicionado!", "success");
}

function renderizarListaPiano() {
    let list = document.getElementById("diagramsListPiano");
    if (!list) return;
    
    let filtrados = filtroPiano ? diagramasPiano.filter(d => d.nome.toLowerCase().includes(filtroPiano)) : diagramasPiano;
    let countSpan = document.getElementById("diagramCountPiano");
    if (countSpan) countSpan.innerHTML = filtrados.length;
    
    list.innerHTML = "";
    
    if (filtrados.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:30px; color:#999;">📭 Nenhum diagrama de piano</div>';
        return;
    }
    
    filtrados.forEach(diag => {
        let div = document.createElement("div");
        div.className = `diagram-item ${diagramaPianoSelecionado === diag.id ? 'selected' : ''}`;
        div.onclick = () => { diagramaPianoSelecionado = diag.id; renderizarListaPiano(); toast(`📌 ${diag.nome} selecionado`, "info"); };
        div.innerHTML = `
            <div class="diagram-header">
                <span class="diagram-name">🎹 ${escapeHtml(diag.nome)}</span>
                <div class="diagram-actions">
                    <button onclick="event.stopPropagation();editarDiagramaPiano(${diag.id})">✏️</button>
                    <button onclick="event.stopPropagation();removerDiagramaPiano(${diag.id})">🗑️</button>
                </div>
            </div>
            <div class="diagram-info">
                <span>${diag.notas.filter(n=>n.clef==='treble').length} Sol / ${diag.notas.filter(n=>n.clef==='bass').length} Fá</span>
                ${diag.sigla ? `<span style="background:#667eea; color:white; padding:2px 8px; border-radius:12px; font-size:11px;">${diag.sigla}</span>` : ''}
            </div>
        `;
        list.appendChild(div);
    });
}

function editarDiagramaPiano(id) {
    let diag = diagramasPiano.find(d => d.id === id);
    if (diag) {
        document.getElementById("diagramNamePiano").value = diag.nome;
        document.getElementById("startNota").value = diag.startNota;
        document.getElementById("endNota").value = diag.endNota;
        document.getElementById("zoomPiano").value = diag.zoom;
        document.getElementById("zoomPianoVal").innerText = diag.zoom;
        document.getElementById("fingersTreble").value = diag.fingersTreble;
        document.getElementById("fingersBass").value = diag.fingersBass;
        document.getElementById("abcTextPiano").value = diag.abc;
        notasSelecPiano = JSON.parse(JSON.stringify(diag.notas));
        atualizarCoresTecladoPiano();
        atualizarEditorPiano();
        toast(`✏️ Editando: ${diag.nome}`, "info");
    }
}

function removerDiagramaPiano(id) {
    diagramasPiano = diagramasPiano.filter(d => d.id !== id);
    if (diagramaPianoSelecionado === id) diagramaPianoSelecionado = null;
    salvarDiagramasPiano();
    renderizarListaPiano();
    toast("🗑️ Removido", "success");
}

function moverParaCimaPiano() {
    if (!diagramaPianoSelecionado) { toast("Selecione um diagrama!", "warning"); return; }
    let idx = diagramasPiano.findIndex(d => d.id === diagramaPianoSelecionado);
    if (idx > 0) {
        [diagramasPiano[idx], diagramasPiano[idx-1]] = [diagramasPiano[idx-1], diagramasPiano[idx]];
        salvarDiagramasPiano();
        renderizarListaPiano();
        toast("⬆️ Movido", "success");
    }
}

function moverParaBaixoPiano() {
    if (!diagramaPianoSelecionado) { toast("Selecione um diagrama!", "warning"); return; }
    let idx = diagramasPiano.findIndex(d => d.id === diagramaPianoSelecionado);
    if (idx < diagramasPiano.length - 1) {
        [diagramasPiano[idx], diagramasPiano[idx+1]] = [diagramasPiano[idx+1], diagramasPiano[idx]];
        salvarDiagramasPiano();
        renderizarListaPiano();
        toast("⬇️ Movido", "success");
    }
}

function limparEditorPiano() {
    notasSelecPiano = [];
    document.getElementById("diagramNamePiano").value = "Novo Acorde Piano";
    document.getElementById("fingersTreble").value = "1 3 5";
    document.getElementById("fingersBass").value = "5 3 1";
    document.getElementById("abcTextPiano").value = "";
    atualizarCoresTecladoPiano();
    atualizarEditorPiano();
    toast("🧹 Editor limpo", "info");
}

function limparTodosDiagramasPiano() {
    if (confirm("Remover TODOS os diagramas de piano?")) {
        diagramasPiano = [];
        diagramaPianoSelecionado = null;
        salvarDiagramasPiano();
        renderizarListaPiano();
        toast("🗑️ Todos removidos", "success");
    }
}

function filtrarDiagramasPiano() {
    filtroPiano = document.getElementById("searchDiagramsPiano")?.value.toLowerCase() || "";
    renderizarListaPiano();
}

function salvarDiagramasPiano() {
    localStorage.setItem("diagramas_piano", JSON.stringify(diagramasPiano));
}

function carregarDiagramasPiano() {
    let salvos = localStorage.getItem("diagramas_piano");
    if (salvos) {
        diagramasPiano = JSON.parse(salvos);
        renderizarListaPiano();
    }
}

function gerarCodigoPianoParaEditor() {
    if (notasSelecPiano.length === 0) {
        toast("⚠️ Selecione pelo menos uma nota primeiro!", "warning");
        return;
    }
    
    const nome = document.getElementById("diagramNamePiano")?.value.trim() || "Meu Acorde";
    const startNota = document.getElementById("startNota")?.value || "C3";
    const endNota = document.getElementById("endNota")?.value || "C5";
    const fingersTreble = document.getElementById("fingersTreble")?.value || "";
    const fingersBass = document.getElementById("fingersBass")?.value || "";
    
    // Separar notas por mão
    const notasTreble = notasSelecPiano.filter(n => n.clef === "treble");
    const notasBass = notasSelecPiano.filter(n => n.clef === "bass");
    
    // Extrair as notas selecionadas com oitava
    const todasNotas = notasSelecPiano.map(n => {
        let nota = n.char;
        if (n.acc === "^") nota += "#";
        else if (n.acc === "_") nota += "b";
        return nota + n.oitava;
    });
    
    // Extrair apenas os nomes das notas (sem oitava) para comparação
    const nomesNotas = todasNotas.map(n => n.replace(/[0-9]/g, ''));
    
    // Formatar notasTreble e notasBass para salvar
    const notasTrebleStr = notasTreble.map(n => {
        let nota = n.char;
        if (n.acc === "^") nota += "#";
        else if (n.acc === "_") nota += "b";
        return nota + n.oitava;
    });
    
    const notasBassStr = notasBass.map(n => {
        let nota = n.char;
        if (n.acc === "^") nota += "#";
        else if (n.acc === "_") nota += "b";
        return nota + n.oitava;
    });
    
    // Criar uma sigla única
    const siglaPersonalizada = "CUSTOM_" + todasNotas.join("_");
    
    // Salvar todas as informações
    const acordesPersonalizados = JSON.parse(localStorage.getItem("acordes_piano_personalizados") || "{}");
    acordesPersonalizados[siglaPersonalizada] = {
        nome: nome,
        notas: todasNotas,
        notasNomes: nomesNotas,
        notasTreble: notasTrebleStr,
        notasBass: notasBassStr,
        startOitava: startNota,
        endOitava: endNota,
        fingersTreble: fingersTreble,
        fingersBass: fingersBass,
        data: new Date().toISOString()
    };
    localStorage.setItem("acordes_piano_personalizados", JSON.stringify(acordesPersonalizados));
    
    // Gerar o código
    const codigo = `[PIANO-CUSTOM:${siglaPersonalizada}]${nome}[/PIANO-CUSTOM]`;
    
    const editorField = document.getElementById('editor');
    const start = editorField.selectionStart;
    editorField.value = editorField.value.substring(0, start) + codigo + editorField.value.substring(start);
    editorField.selectionStart = editorField.selectionEnd = start + codigo.length;
    
    if (typeof renderizar === 'function') renderizar();
    if (typeof salvarAulaAtual === 'function') salvarAulaAtual();
    
    toast(`✅ Acorde personalizado gerado!`, "success");
}

// ============================================
// FUNÇÕES DE LAYOUT E EXPORTAÇÃO
// ============================================
function gerarLayoutPiano() {
    let cols = parseInt(document.getElementById("columnsPiano")?.value || 2);
    let rows = parseInt(document.getElementById("rowsPiano")?.value || 3);
    let gap = parseInt(document.getElementById("gapPiano")?.value || 12);
    let porPagina = cols * rows;
    let container = document.getElementById("pianoContainer");
    let previewDiv = document.getElementById("previewPiano");
    
    if (!container) return;
    container.innerHTML = "";
    
    if (diagramasPiano.length === 0) {
        if (previewDiv) previewDiv.style.display = "none";
        return;
    }
    
    if (previewDiv) previewDiv.style.display = "block";
    let paginas = Math.ceil(diagramasPiano.length / porPagina);
    
    for (let p = 0; p < paginas; p++) {
        let page = document.createElement("div");
        page.style.cssText = `page-break-after: ${p === paginas-1 ? 'auto' : 'always'}; break-after: ${p === paginas-1 ? 'auto' : 'page'}; margin: 0; padding: 8px 0;`;
        
        let titulo = document.createElement("div");
        titulo.style.cssText = "text-align:center; margin-bottom:12px; padding:6px; background:#f0f2f5; border-radius:6px; font-size:12px;";
        titulo.innerHTML = `<span style="font-weight:bold; color:#667eea;">Página ${p + 1} de ${paginas}</span>`;
        page.appendChild(titulo);
        
        let grid = document.createElement("div");
        grid.style.cssText = `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${gap}px; align-items: stretch;`;
        
        let inicio = p * porPagina;
        let fim = Math.min(inicio + porPagina, diagramasPiano.length);
        
        for (let i = inicio; i < fim; i++) {
            let diag = diagramasPiano[i];
            let card = document.createElement("div");
            card.className = "diagram-card";
            
            let titleDiv = document.createElement("div");
            titleDiv.className = "diagram-title";
            titleDiv.textContent = diag.nome;
            
            let contentDiv = document.createElement("div");
            contentDiv.className = "diagram-content";
            
            let diagramDiv = document.createElement("div");
            let scoreDiv = document.createElement("div");
            scoreDiv.className = "score-wrapper";
            
            // Usar a sigla salva para desenhar o acorde corretamente
            if (diag.sigla && typeof desenharAcordePianoPreview !== 'undefined') {
                const tempContainer = document.createElement('div');
                desenharAcordePianoPreview(tempContainer, diag.sigla, diag.nome);
                diagramDiv.innerHTML = tempContainer.innerHTML;
            } else {
                desenharDiagramaPiano(diagramDiv, diag.notas, diag.startNota, diag.endNota, diag.zoom, diag.fingersTreble, diag.fingersBass);
            }
            
            contentDiv.appendChild(diagramDiv);
            
            if (diag.abc && diag.abc.trim()) {
                try {
                    let wrapper = document.createElement("div");
                    wrapper.className = "dual-stave";
                    ABCJS.renderAbc(wrapper, diag.abc, { staffwidth: 260, scale: 0.95, paddingtop: 1, paddingbottom: 28 });
                    scoreDiv.appendChild(wrapper);
                    contentDiv.appendChild(scoreDiv);
                } catch(e) {}
            }
            
            card.appendChild(titleDiv);
            card.appendChild(contentDiv);
            grid.appendChild(card);
        }
        
        page.appendChild(grid);
        container.appendChild(page);
    }
    toast("📄 Layout gerado!", "success");
}

function imprimirLayoutPiano() { 
    window.print(); 
}

function ajustarZoomPiano(v) {
    document.getElementById("zoomPianoVal").innerText = v;
    atualizarEditorPiano();
}

function exportarPianoImagem() {
    if (diagramasPiano.length === 0) { toast("Adicione diagramas primeiro!", "warning"); return; }
    gerarLayoutPiano();
    setTimeout(() => {
        const element = document.getElementById("pianoContainer");
        html2canvas(element, { scale: 2, backgroundColor: "#ffffff", logging: false }).then(canvas => {
            let link = document.createElement('a');
            link.download = `piano_diagramas_${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            toast("🖼️ Imagem exportada!", "success");
        }).catch(err => { console.error(err); toast("Erro ao gerar imagem", "warning"); });
    }, 800);
}

function exportarPianoHTML() {
    if (diagramasPiano.length === 0) { toast("Adicione diagramas primeiro!", "warning"); return; }
    gerarLayoutPiano();
    setTimeout(() => {
        let conteudo = document.getElementById("pianoContainer").innerHTML;
        let styles = document.querySelector("style")?.innerHTML || "";
        let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Diagramas de Piano</title>
        <script src="https://cdn.jsdelivr.net/npm/abcjs@6.2.3/dist/abcjs-basic-min.js"><\/script>
        <style>${styles} .diagram-card { break-inside: avoid; page-break-inside: avoid; }</style>
        </head><body><div class="a4-container">${conteudo}</div></body></html>`;
        let blob = new Blob([html], {type: "text/html"});
        let a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `piano_diagramas_${Date.now()}.html`;
        a.click();
        toast("📑 HTML exportado!", "success");
    }, 500);
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function initPiano() {
    criarTecladoPiano();
    carregarDiagramasPiano();
    
    setTimeout(() => {
        setClefModePiano('treble');
        toggleNotaPiano(60); toggleNotaPiano(64); toggleNotaPiano(67);
        setClefModePiano('bass');
        toggleNotaPiano(48); toggleNotaPiano(52); toggleNotaPiano(55);
        setClefModePiano('treble');
        atualizarEditorPiano();
    }, 100);
}

function abrirModalPiano() {
    const modal = document.getElementById('modalPiano');
    if (modal) {
        modal.style.display = 'block';
        initPiano();
    }
}

function fecharModalPiano() {
    const modal = document.getElementById('modalPiano');
    if (modal) modal.style.display = 'none';
}

// Adicionar estilo para animação do toast
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        0% { opacity: 1; transform: translateX(0); }
        70% { opacity: 1; transform: translateX(0); }
        100% { opacity: 0; transform: translateX(20px); }
    }
`;
document.head.appendChild(style);