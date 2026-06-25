// app.js - Lógica principal de interface, Transposição e Síntese de Áudio (ABCJS)
let synthControllerAtual = null;
let bancoDeMusicasRepertorio = [];

// =========================================================================
// TRANSPOSIÇÃO
// =========================================================================
function alterarTom(semitons) {
    const input = document.getElementById("cifras");
    if (!input) return;
    let texto = input.value;

    let novoTexto = texto.replace(/([A-G][#b]?)([A-Za-z0-9°+]*)/g, (match, nota, sufixo) => {
        if (typeof MAPA_ENARMONEOS !== 'undefined' && MAPA_ENARMONEOS[nota]) nota = MAPA_ENARMONEOS[nota];
        if (typeof ESCALA_CIFRAS === 'undefined') return match;
        let indice = ESCALA_CIFRAS.indexOf(nota);
        if (indice === -1) return match;

        let novoIndice = (indice + semitons) % 12;
        if (novoIndice < 0) novoIndice += 12;
        return ESCALA_CIFRAS[novoIndice] + sufixo;
    });

    input.value = novoTexto;
    processarCifrasParaAbc();
}

// =========================================================================
// PROCESSAMENTO PRINCIPAL (CORRIGIDO)
// =========================================================================
function processarCifrasParaAbc() {
    // --- LEITURA DOS CAMPOS ---
    const titulo = document.getElementById("titulo")?.value || "Música";
    const compositor = document.getElementById("compositor")?.value || "N-Play";
    const arranjador = document.getElementById("arranjador")?.value || "N-Play";
    const clave = document.getElementById("clave")?.value.trim() || "C";
    const estiloBaixo = document.getElementById("padraoBaixo")?.value || "tonica";
    const cifrasRaw = document.getElementById("cifras")?.value || "";
    const bpmVal = document.getElementById("bpm")?.value || "120";

    const loopCheckEl = document.getElementById("loopCheck");
    const querLoop = loopCheckEl ? loopCheckEl.checked : false;
    let vezesRepetir = parseInt(document.getElementById("loopVezes")?.value) || 4;
    if (isNaN(vezesRepetir) || vezesRepetir < 1) vezesRepetir = 1;

    // --- OBTÉM CATEGORIA E SUBCATEGORIA ATUAIS (para resolver variações por número) ---
    const catRH = document.getElementById("ritmoCategoriaRH")?.value;
    const subRH = document.getElementById("ritmoSubcategoriaRH")?.value;
    const catLH = document.getElementById("ritmoCategoriaLH")?.value;
    const subLH = document.getElementById("ritmoSubcategoriaLH")?.value;

    // Lista de nomes de variações da categoria/subcategoria atual (RH e LH)
    const listaVarsRH = (catRH && subRH && BANCO_RITMOS[catRH] && BANCO_RITMOS[catRH][subRH]) 
        ? Object.keys(BANCO_RITMOS[catRH][subRH]) 
        : [];
    const listaVarsLH = (catLH && subLH && BANCO_RITMOS[catLH] && BANCO_RITMOS[catLH][subLH]) 
        ? Object.keys(BANCO_RITMOS[catLH][subLH]) 
        : [];

    // Variação global (selecionada nos menus)
    const varGlobalRH = document.getElementById("ritmoVariacaoRH")?.value || null;
    const varGlobalLH = document.getElementById("ritmoVariacaoLH")?.value || null;

    // --- DEFINE O METRO (usa a primeira variação global, se disponível) ---
    let metroDinamico = "4/4";
    const ritmoGlobalRH = (catRH && subRH && varGlobalRH) ? obterVariacao(catRH, subRH, varGlobalRH) : null;
    const ritmoGlobalLH = (catLH && subLH && varGlobalLH) ? obterVariacao(catLH, subLH, varGlobalLH) : null;
    if (ritmoGlobalRH && ritmoGlobalRH.metro) metroDinamico = ritmoGlobalRH.metro;
    else if (ritmoGlobalLH && ritmoGlobalLH.metro) metroDinamico = ritmoGlobalLH.metro;

    // --- DIVIDE O TEXTO EM LINHAS ---
    const linhas = cifrasRaw.split(/[\n;]+/).filter(line => line.trim() !== '');
    if (linhas.length === 0) {
        linhas.push('C | Am | Dm | G | Dm| E'); // fallback
    }

    let todasPartesRh = [];
    let todasPartesLh = [];

    // --- FUNÇÃO AUXILIAR PARA OBTER O RITMO A PARTIR DO NOME DA VARIAÇÃO ---
    function obterRitmoPorNome(cat, sub, nomeVar) {
        if (cat && sub && nomeVar) {
            return obterVariacao(cat, sub, nomeVar);
        }
        return null;
    }

    // --- PROCESSA CADA LINHA ---
    linhas.forEach((linha) => {
        // Divide os compassos da linha (separados por "|")
        let blocosCompasso = linha.split('|').map(b => b.trim()).filter(b => b !== '');
        if (blocosCompasso.length === 0) {
            const tempos = parseInt(metroDinamico.split('/')[0]) || 4;
            blocosCompasso = [`z${tempos}`];
        }

        // Inicializa a variação atual com a global (para esta linha)
        let varAtualRH = varGlobalRH;
        let varAtualLH = varGlobalLH;

        let partesRh = [];
        let partesLh = [];

        // Processa cada compasso (bloco)
        blocosCompasso.forEach((bloco, idx) => {
            // Verifica se o bloco começa com {n} (onde n é um número)
            const matchComando = bloco.match(/^\{(\d+)\}\s*/);
            if (matchComando) {
                const numero = parseInt(matchComando[1]);
                // Mapeia o número para o nome da variação (1-based)
                // Usa a lista de RH (assumindo que RH e LH têm as mesmas variações, ou usa a que tiver)
                const listaVars = (listaVarsRH.length > 0) ? listaVarsRH : listaVarsLH;
                if (numero >= 1 && numero <= listaVars.length) {
                    const nomeVar = listaVars[numero - 1];
                    varAtualRH = nomeVar;
                    varAtualLH = nomeVar; // aplica a mesma para ambos
                }
                // Remove o comando do bloco
                bloco = bloco.replace(/^\{(\d+)\}\s*/, '');
                // Se o bloco ficou vazio, pula (pode ser um comando isolado)
                if (!bloco) return;
            }

            // Obtém os ritmos correspondentes às variações atuais
            const ritmoRH = obterRitmoPorNome(catRH, subRH, varAtualRH);
            const ritmoLH = obterRitmoPorNome(catLH, subLH, varAtualLH);

            // Processa o compasso com os ritmos obtidos
            let resultado = processarCompassoDinamico(bloco, metroDinamico, estiloBaixo, ritmoRH, ritmoLH);
            partesRh.push(resultado.rh);
            partesLh.push(resultado.lh);
        });

        const linhaRh = partesRh.join(' | ');
        const linhaLh = partesLh.join(' | ');
        todasPartesRh.push(linhaRh);
        todasPartesLh.push(linhaLh);
    });

    // --- MONTAGEM DO SISTEMA LINHA POR LINHA (com barras) ---
    let corpoAbcVisual = "";
    for (let i = 0; i < todasPartesRh.length; i++) {
        const abertura = (i === 0 && querLoop) ? '|:' : '';
        const fechamento = (i === todasPartesRh.length - 1) ? '|]' : '|';
        corpoAbcVisual += `V:1\n${abertura} ${todasPartesRh[i]} ${fechamento}\n`;
        corpoAbcVisual += `V:2\n${abertura} ${todasPartesLh[i]} ${fechamento}\n`;
    }

    // --- MONTAGEM DO ABC VISUAL ---
    let abcVisual = `X:1
T:${titulo}
C:${compositor}
A:${arranjador}
M:${metroDinamico}
%%score { 1 | 2 }
L:1/4
Q:1/4=${bpmVal}
K:${clave}
%%MIDI program 0
V:1 clef=treble
V:2 clef=bass
${corpoAbcVisual}`;

    // --- ÁUDIO (com repetições se ativado) ---
    let cuerpoRhAudio = todasPartesRh.join(' | ');
    let cuerpoLhAudio = todasPartesLh.join(' | ');
    if (querLoop && vezesRepetir > 1) {
        const repeatRh = Array(vezesRepetir).fill(todasPartesRh.join(' | ')).join(' | ');
        const repeatLh = Array(vezesRepetir).fill(todasPartesLh.join(' | ')).join(' | ');
        cuerpoRhAudio = repeatRh;
        cuerpoLhAudio = repeatLh;
    }

    let abcAudio = `X:1
M:${metroDinamico}
L:1/4
Q:1/4=${bpmVal}
K:${clave}
%%MIDI program 0
V:1 clef=treble
| ${cuerpoRhAudio} |
V:2 clef=bass
| ${cuerpoLhAudio} |`;

    window.abcGeradoAtual = abcVisual;
    renderizarDiretoDoAbc(abcVisual, abcAudio);

    console.log("🔍 Número de linhas lidas:", linhas.length);
    console.log("📄 ABC gerado:\n", abcVisual);
}
// =========================================================================
// RENDERIZAÇÃO (ABCJS)
// =========================================================================
function renderizarDiretoDoAbc(abcVisual, abcAudio) {
    const codigoVisual = abcVisual || window.abcGeradoAtual || "";
    const codigoAudio = abcAudio || codigoVisual;

    if (synthControllerAtual) {
        try { synthControllerAtual.stop(); synthControllerAtual.close(); } catch(e) {}
    }

    const playerDiv = document.getElementById("audio-player");
    if (playerDiv) playerDiv.innerHTML = "";

    const partituraDiv = document.getElementById("partitura");
    if (!partituraDiv) return;

    let visualObj = ABCJS.renderAbc("partitura", codigoVisual, { responsive: "resize" })[0];
    let audioVisualObj = ABCJS.renderAbc(document.createElement("div"), codigoAudio)[0];

    if (ABCJS.synth.supportsAudio() && visualObj && playerDiv) {
        const synthControl = new ABCJS.synth.SynthController();
        synthControllerAtual = synthControl;

        synthControl.load("#audio-player", null, {
            displayPlay: true,
            displayRestart: true,
            displayProgress: true,
            displayWarp: false
        });

        const criarSynth = new ABCJS.synth.CreateSynth();
        criarSynth.init({ visualObj: audioVisualObj })
            .then(() => synthControl.setTune(audioVisualObj, false))
            .then(() => console.log("Áudio carregado."))
            .catch(err => console.error("Erro na síntese:", err));
    }
}

// =========================================================================
// MENUS HIERÁRQUICOS
// =========================================================================
function inicializarMenus() {
    const categorias = Object.keys(BANCO_RITMOS);
    if (categorias.length === 0) {
        console.warn("Nenhum ritmo carregado.");
        return;
    }

    // Preenche os dois conjuntos de menus
    ['RH', 'LH'].forEach(lado => {
        const catSelect = document.getElementById(`ritmoCategoria${lado}`);
        const subSelect = document.getElementById(`ritmoSubcategoria${lado}`);
        const varSelect = document.getElementById(`ritmoVariacao${lado}`);
        if (!catSelect) return;

        catSelect.innerHTML = "";
        categorias.forEach(cat => {
            catSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });

        // Atualiza subcategorias e variações para o primeiro item
        atualizarSubcategorias(lado);
    });
}

function atualizarSubcategorias(lado) {
    const catSelect = document.getElementById(`ritmoCategoria${lado}`);
    const subSelect = document.getElementById(`ritmoSubcategoria${lado}`);
    if (!catSelect || !subSelect) return;

    const cat = catSelect.value;
    subSelect.innerHTML = "";
    if (BANCO_RITMOS[cat]) {
        Object.keys(BANCO_RITMOS[cat]).forEach(sub => {
            subSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
        });
    }
    atualizarVariacoes(lado);
}

function atualizarVariacoes(lado) {
    const catSelect = document.getElementById(`ritmoCategoria${lado}`);
    const subSelect = document.getElementById(`ritmoSubcategoria${lado}`);
    const varSelect = document.getElementById(`ritmoVariacao${lado}`);
    if (!catSelect || !subSelect || !varSelect) return;

    const cat = catSelect.value;
    const sub = subSelect.value;
    varSelect.innerHTML = "";
    if (BANCO_RITMOS[cat] && BANCO_RITMOS[cat][sub]) {
        Object.keys(BANCO_RITMOS[cat][sub]).forEach(v => {
            varSelect.innerHTML += `<option value="${v}">${v}</option>`;
        });
    }
    processarCifrasParaAbc(); // atualiza a música ao mudar
}

// =========================================================================
// REPERTÓRIO E EXPORTAÇÃO
// =========================================================================
function adicionarMusicaAoRepertorio() {
    const titulo = document.getElementById("titulo")?.value || "Sem Título";
    const abcCode = window.abcGeradoAtual || "";
    const cifrasRaw = document.getElementById("cifras")?.value || "";
    bancoDeMusicasRepertorio.push({ titulo, abc: abcCode, txt: cifrasRaw });
    atualizarListaRepertorioVisual();
}

function atualizarListaRepertorioVisual() {
    const ul = document.getElementById("listaRepertorio");
    if (!ul) return;
    ul.innerHTML = "";
    if (bancoDeMusicasRepertorio.length === 0) {
        ul.innerHTML = `<li style="color: #94a3b8; font-style: italic;">Nenhuma música salva ainda...</li>`;
        return;
    }
    bancoDeMusicasRepertorio.forEach((m, idx) => {
        ul.innerHTML += `<li>📌 <strong>${m.titulo}</strong> (Posição: ${idx + 1})</li>`;
    });
}

function exportarArquivo(tipo, formato) {
    let conteudo = "", nomeArquivo = "";
    if (tipo === 'individual') {
        const titulo = (document.getElementById("titulo")?.value || "musica").toLowerCase().replace(/\s+/g, '_');
        nomeArquivo = `${titulo}.${formato}`;
        conteudo = (formato === 'abc') ? (window.abcGeradoAtual || "") : (document.getElementById("cifras")?.value || "");
    } else {
        if (bancoDeMusicasRepertorio.length === 0) { alert("Repertório vazio!"); return; }
        nomeArquivo = `repertorio_completo.${formato}`;
        bancoDeMusicasRepertorio.forEach((musica, index) => {
            if (formato === 'abc') {
                let abcAjustado = musica.abc.replace(/X:\s*\d+/g, `X:${index + 1}`);
                conteudo += abcAjustado + "\n\n";
            } else {
                conteudo += `Title: ${musica.titulo}\nChords: ${musica.txt}\n\n---\n\n`;
            }
        });
    }
    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = nomeArquivo;
    link.click();
}


window.addEventListener("DOMContentLoaded", () => {
    carregarPastaDeRitmos().then(() => {
        inicializarMenus();

        // Listeners para RH
        document.getElementById("ritmoCategoriaRH")?.addEventListener("change", () => atualizarSubcategorias("RH"));
        document.getElementById("ritmoSubcategoriaRH")?.addEventListener("change", () => atualizarVariacoes("RH"));
        document.getElementById("ritmoVariacaoRH")?.addEventListener("change", processarCifrasParaAbc);

        // Listeners para LH
        document.getElementById("ritmoCategoriaLH")?.addEventListener("change", () => atualizarSubcategorias("LH"));
        document.getElementById("ritmoSubcategoriaLH")?.addEventListener("change", () => atualizarVariacoes("LH"));
        document.getElementById("ritmoVariacaoLH")?.addEventListener("change", processarCifrasParaAbc);

        // Outros campos
        document.getElementById("loopCheck")?.addEventListener("change", processarCifrasParaAbc);
        document.getElementById("loopVezes")?.addEventListener("input", processarCifrasParaAbc);
        ["titulo", "compositor", "arranjador", "clave", "padraoBaixo", "cifras", "bpm"].forEach(id => {
            document.getElementById(id)?.addEventListener("input", processarCifrasParaAbc);
        });

        processarCifrasParaAbc();
    });
});