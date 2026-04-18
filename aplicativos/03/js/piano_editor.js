// ============================================
// EDITOR DE PIANO - FUNÇÕES COMPLETAS
// ============================================

const escalaPadrao = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
let notasSelec = [];
let diagramasPiano = [];
let diagramaPianoSelecionado = null;
let filtroPiano = "";
let clefAtual = "treble";

// Funções de conversão de notas
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

// Controle de clave
function setClefMode(clef) {
    clefAtual = clef;
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

// Teclado interativo
function criarTeclado() {
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
            k.onclick = () => toggleNota(i);
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
                b.onclick = (e) => { e.stopPropagation(); toggleNota(i); };
                p.appendChild(b);
            }
        }
    }
}

function toggleNota(num) {
    let existente = notasSelec.find(n => n.num === num && n.clef === clefAtual);
    if (existente) {
        notasSelec = notasSelec.filter(n => !(n.num === num && n.clef === clefAtual));
    } else {
        let notaBase = escalaPadrao[num % 12];
        let oitava = Math.floor(num / 12) - 1;
        let char = notaBase[0];
        let acc = notaBase.includes("#") ? "^" : "";
        notasSelec.push({num, char, acc, oitava, clef: clefAtual});
    }
    notasSelec.sort((a, b) => a.num - b.num);
    atualizarCoresTeclado();
    gerarABCPiano();
}

function atualizarCoresTeclado() {
    document.querySelectorAll("#keyboard .white, #keyboard .black").forEach(el => {
        el.classList.remove("activeWhiteTreble", "activeBlackTreble", "activeWhiteBass", "activeBlackBass");
    });
    notasSelec.forEach(nota => {
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
    let notasTreble = notasSelec.filter(n => n.clef === "treble");
    let notasBass = notasSelec.filter(n => n.clef === "bass");
    
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
    
    notasSelec = [];
    
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
                notasSelec.push({num, char: resultado.letra, acc: acc || resultado.acc, oitava: resultado.oitava, clef: "treble"});
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
                notasSelec.push({num, char: resultado.letra, acc: acc || resultado.acc, oitava: resultado.oitava, clef: "bass"});
            }
        }
    }
    
    notasSelec.sort((a, b) => a.num - b.num);
    atualizarCoresTeclado();
    atualizarEditorPiano();
}

function atualizarEditorPiano() {
    let startNota = document.getElementById("startNota")?.value || "C3";
    let endNota = document.getElementById("endNota")?.value || "C5";
    let zoom = parseInt(document.getElementById("zoomPiano")?.value || 30);
    let fingersTreble = document.getElementById("fingersTreble")?.value || "1 3 5";
    let fingersBass = document.getElementById("fingersBass")?.value || "5 3 1";
    
    desenharDiagramaPiano(document.getElementById("preview-diagram-piano"), notasSelec, startNota, endNota, zoom, fingersTreble, fingersBass);
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
    wrap.style.margin = "0";
    wrap.style.padding = "0";
    
    let keyboardContainer = document.createElement("div");
    keyboardContainer.style.position = "relative";
    keyboardContainer.style.display = "inline-block";
    keyboardContainer.style.height = (h + 8) + "px";
    keyboardContainer.style.margin = "0";
    keyboardContainer.style.padding = "0";
    
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

function adicionarDiagramaPiano() {
    let nome = document.getElementById("diagramNamePiano")?.value.trim() || "Sem nome";
    if (notasSelec.length === 0) { alert("Selecione pelo menos uma nota!"); return; }
    
    diagramasPiano.push({
        id: Date.now(),
        nome: nome,
        startNota: document.getElementById("startNota")?.value || "C3",
        endNota: document.getElementById("endNota")?.value || "C5",
        zoom: parseInt(document.getElementById("zoomPiano")?.value || 30),
        fingersTreble: document.getElementById("fingersTreble")?.value || "1 3 5",
        fingersBass: document.getElementById("fingersBass")?.value || "5 3 1",
        abc: document.getElementById("abcTextPiano")?.value || "",
        notas: JSON.parse(JSON.stringify(notasSelec))
    });
    salvarDiagramasPiano();
    renderizarListaPiano();
    toast("✅ Diagrama de piano adicionado!", "success");
}

function renderizarListaPiano() {
    let list = document.getElementById("diagramsListPiano");
    if (!list) return;
    
    let filtrados = filtroPiano ? diagramasPiano.filter(d => d.nome.toLowerCase().includes(filtroPiano)) : diagramasPiano;
    document.getElementById("diagramCountPiano").innerHTML = filtrados.length;
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
        notasSelec = JSON.parse(JSON.stringify(diag.notas));
        atualizarCoresTeclado();
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
    if (!diagramaPianoSelecionado) { alert("Selecione um diagrama!"); return; }
    let idx = diagramasPiano.findIndex(d => d.id === diagramaPianoSelecionado);
    if (idx > 0) {
        [diagramasPiano[idx], diagramasPiano[idx-1]] = [diagramasPiano[idx-1], diagramasPiano[idx]];
        salvarDiagramasPiano();
        renderizarListaPiano();
        toast("⬆️ Movido", "success");
    }
}

function moverParaBaixoPiano() {
    if (!diagramaPianoSelecionado) { alert("Selecione um diagrama!"); return; }
    let idx = diagramasPiano.findIndex(d => d.id === diagramaPianoSelecionado);
    if (idx < diagramasPiano.length - 1) {
        [diagramasPiano[idx], diagramasPiano[idx+1]] = [diagramasPiano[idx+1], diagramasPiano[idx]];
        salvarDiagramasPiano();
        renderizarListaPiano();
        toast("⬇️ Movido", "success");
    }
}

function limparEditorPiano() {
    notasSelec = [];
    document.getElementById("diagramNamePiano").value = "Novo Acorde Piano";
    document.getElementById("fingersTreble").value = "1 3 5";
    document.getElementById("fingersBass").value = "5 3 1";
    document.getElementById("abcTextPiano").value = "";
    atualizarCoresTeclado();
    atualizarEditorPiano();
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
    if (notasSelec.length === 0) {
        alert("Selecione pelo menos uma nota primeiro!");
        return;
    }
    
    const nome = document.getElementById("diagramNamePiano")?.value.trim() || "Acorde Piano";
    const sigla = nome.replace(/[^a-zA-Z0-9]/g, '');
    
    const codigo = `[PIANO:${sigla}]${nome}[/PIANO]`;
    
    const editorField = document.getElementById('editor');
    const start = editorField.selectionStart;
    editorField.value = editorField.value.substring(0, start) + codigo + editorField.value.substring(start);
    editorField.selectionStart = editorField.selectionEnd = start + codigo.length;
    
    if (typeof renderizar === 'function') renderizar();
    if (typeof salvarAulaAtual === 'function') salvarAulaAtual();
    
    alert(`✅ Código gerado: ${codigo}`);
}

function ajustarZoomPiano(v) {
    document.getElementById("zoomPianoVal").innerText = v;
    atualizarEditorPiano();
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
    t.style.cssText = `position:fixed; bottom:20px; right:20px; background:${tipo==='success'?'#2ed573':'#3a86ff'}; color:white; padding:12px 20px; border-radius:8px; z-index:9999; animation:fadeOut 3s forwards; font-weight:bold;`;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Inicialização do piano
function initPiano() {
    criarTeclado();
    carregarDiagramasPiano();
    
    // Exemplo inicial - acorde C maior
    setTimeout(() => {
        setClefMode('treble');
        toggleNota(60); toggleNota(64); toggleNota(67);
        setClefMode('bass');
        toggleNota(48); toggleNota(52); toggleNota(55);
        setClefMode('treble');
        atualizarEditorPiano();
    }, 100);
}
