// app.js - Lógica principal com hierarquia Categoria → Subcategoria → Style → Variação
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
// PROCESSAMENTO PRINCIPAL COM ANTECIPAÇÃO AUTOMÁTICA
// =========================================================================
function processarCifrasParaAbc() {
    // --- LEITURA DOS CAMPOS ---
    const titulo = document.getElementById("titulo")?.value || "Música";
    const compositor = document.getElementById("compositor")?.value || "";
    const arranjador = document.getElementById("arranjador")?.value || "";
    const clave = document.getElementById("clave")?.value.trim() || "C";
    const estiloBaixo = document.getElementById("padraoBaixo")?.value || "tonica";
    const cifrasRaw = document.getElementById("cifras")?.value || "";
    const bpmVal = document.getElementById("bpm")?.value || "120";

    const loopCheckEl = document.getElementById("loopCheck");
    const querLoop = loopCheckEl ? loopCheckEl.checked : false;
    let vezesRepetir = parseInt(document.getElementById("loopVezes")?.value) || 4;
    if (isNaN(vezesRepetir) || vezesRepetir < 1) vezesRepetir = 1;

    // --- OBTÉM CATEGORIA, SUBCATEGORIA, STYLE E VARIAÇÃO ATUAIS ---
    const catAtualRH = document.getElementById("ritmoCategoriaRH")?.value;
    const subAtualRH = document.getElementById("ritmoSubcategoriaRH")?.value;
    const styleAtualRH = document.getElementById("ritmoStyleRH")?.value;
    const varAtualRH = document.getElementById("ritmoVariacaoRH")?.value;

    const catAtualLH = document.getElementById("ritmoCategoriaLH")?.value;
    const subAtualLH = document.getElementById("ritmoSubcategoriaLH")?.value;
    const styleAtualLH = document.getElementById("ritmoStyleLH")?.value;
    const varAtualLH = document.getElementById("ritmoVariacaoLH")?.value;

    // --- DEFINE O METRO INICIAL ---
    let metroDinamico = "4/4";
    const ritmoGlobalRH = (catAtualRH && subAtualRH && varAtualRH) ? obterVariacao(catAtualRH, subAtualRH, varAtualRH) : null;
    const ritmoGlobalLH = (catAtualLH && subAtualLH && varAtualLH) ? obterVariacao(catAtualLH, subAtualLH, varAtualLH) : null;
    if (ritmoGlobalRH && ritmoGlobalRH.metro) metroDinamico = ritmoGlobalRH.metro;
    else if (ritmoGlobalLH && ritmoGlobalLH.metro) metroDinamico = ritmoGlobalLH.metro;

    // --- DEFINE DURAÇÃO (L:) A PARTIR DOS RITMOS GLOBAIS ---
    let duracaoAtual = "1/4";
    if (ritmoGlobalRH && ritmoGlobalRH.duracao) duracaoAtual = ritmoGlobalRH.duracao;
    else if (ritmoGlobalLH && ritmoGlobalLH.duracao) duracaoAtual = ritmoGlobalLH.duracao;

    // --- OBTÉM O STYLE PARA EXIBIÇÃO NO CABEÇALHO ---
    let styleHeader = "";
    if (ritmoGlobalRH && ritmoGlobalRH.style) styleHeader = ritmoGlobalRH.style;
    else if (ritmoGlobalLH && ritmoGlobalLH.style) styleHeader = ritmoGlobalLH.style;

    // --- DIVIDE O TEXTO EM LINHAS ---
    const linhas = cifrasRaw.split(/[\n;]+/).filter(line => line.trim() !== '');
    if (linhas.length === 0) {
        linhas.push('C | Am | Dm | G | Dm | E');
    }

    // --- PLANIFICAÇÃO DOS COMPASSOS EM UMA LISTA LINEAR ÚNICA ---
    let todosOsBlocos = [];
    linhas.forEach((linha) => {
        let blocos = linha.split('|').map(b => b.trim()).filter(b => b !== '');
        if (blocos.length === 0) {
            const tempos = parseInt(metroDinamico.split('/')[0]) || 4;
            blocos = [`z${tempos}`];
        }
        todosOsBlocos.push(...blocos);
    });

    let partesRh = [], partesLh = [];

    // --- FUNÇÃO AUXILIAR PARA RESOLVER COMANDOS ---
    function resolverComando(comando, catPadrao, subPadrao, listaVars) {
        if (typeof ALIAS_RITMOS !== 'undefined' && ALIAS_RITMOS[comando]) {
            return ALIAS_RITMOS[comando];
        }
        const num = parseInt(comando);
        if (!isNaN(num) && num >= 1 && num <= listaVars.length) {
            return { categoria: catPadrao, subcategoria: subPadrao, nome: listaVars[num - 1] };
        }
        if (listaVars.includes(comando)) {
            return { categoria: catPadrao, subcategoria: subPadrao, nome: comando };
        }
        return null;
    }

    function obterRitmo(cat, sub, varNome) {
        if (cat && sub && varNome) return obterVariacao(cat, sub, varNome);
        return null;
    }

    // --- PROCESSAMENTO COM ENGENHARIA DE OLHAR PARA A FRENTE ---
    todosOsBlocos.forEach((blocoAtual, idx) => {
        let catRH = catAtualRH, subRH = subAtualRH, varRH = varAtualRH;
        let catLH = catAtualLH, subLH = subAtualLH, varLH = varAtualLH;

        const matchComando = blocoAtual.match(/^\{([^}]+)\}\s*/);
        if (matchComando) {
            const comando = matchComando[1].trim();
            const listaVarsRH = (catRH && subRH && BANCO_RITMOS[catRH] && BANCO_RITMOS[catRH][subRH]) ? Object.keys(BANCO_RITMOS[catRH][subRH]) : [];
            const resolvido = resolverComando(comando, catRH, subRH, listaVarsRH);
            if (resolvido) {
                catRH = resolvido.categoria; subRH = resolvido.subcategoria; varRH = resolvido.nome;
                catLH = resolvido.categoria; subLH = resolvido.subcategoria; varLH = resolvido.nome;
            }
            blocoAtual = blocoAtual.replace(/^\{[^}]+\}\s*/, '');
            if (!blocoAtual) return;
        }

        const ritmoRH = obterRitmo(catRH, subRH, varRH);
        const ritmoLH = obterRitmo(catLH, subLH, varLH);

        // Identifica o próximo compasso para obter a cifra de antecipação automática
        let proximoBloco = todosOsBlocos[idx + 1] || blocoAtual;
        proximoBloco = proximoBloco.replace(/^\{[^}]+\}\s*/, '').trim();

        // Executa o processador robusto do ritmos.js repassando os alvos harmonicamente amarrados
        let resultado = processarCompassoDinamicoComProximo(blocoAtual, proximoBloco, metroDinamico, estiloBaixo, ritmoRH, ritmoLH, idx);
        partesRh.push(resultado.rh);
        partesLh.push(resultado.lh);
    });

    // Remontagem das linhas estruturadas de 4 em 4 compassos para a visualização gráfica
    let todasPartesRh = [];
    let todasPartesLh = [];
    for (let i = 0; i < partesRh.length; i += 4) {
        todasPartesRh.push(partesRh.slice(i, i + 4).join(' | '));
        todasPartesLh.push(partesLh.slice(i, i + 4).join(' | '));
    }

    // --- MONTAGEM DO ABC VISUAL ---
    let corpoAbcVisual = "";
    for (let i = 0; i < todasPartesRh.length; i++) {
        const abertura = (i === 0 && querLoop) ? '|:' : '';
        const fechamento = (i === todasPartesRh.length - 1) ? '|]' : '|';
        corpoAbcVisual += `V:1\n${abertura} ${todasPartesRh[i]} ${fechamento}\n`;
        corpoAbcVisual += `V:2\n${abertura} ${todasPartesLh[i]} ${fechamento}\n`;
    }

    // --- INCLUI O STYLE NO CAMPO A: (ARRAJADOR) ---
    const arranjadorCompleto = styleHeader ? `${styleHeader}` : arranjador;

    let abcVisual = `X:1
T:${titulo}
C:${compositor}
R:${arranjadorCompleto}
A:${arranjador}
M:${metroDinamico}
%%score {1 | 2}
L:${duracaoAtual}
Q:1/4=${bpmVal}
K:${clave}
%%MIDI program 0
V:1 clef=treble
V:2 clef=bass
${corpoAbcVisual}`;

    // --- ÁUDIO ---
    let cuerpoRhAudio = partesRh.join(' | ');
    let cuerpoLhAudio = partesLh.join(' | ');
    if (querLoop && vezesRepetir > 1) {
        cuerpoRhAudio = Array(vezesRepetir).fill(partesRh.join(' | ')).join(' | ');
        cuerpoLhAudio = Array(vezesRepetir).fill(partesLh.join(' | ')).join(' | ');
    }

    let abcAudio = `X:1
M:${metroDinamico}
L:${duracaoAtual}
Q:1/4=${bpmVal}
K:${clave}
%%MIDI program 0
V:1 clef=treble
| ${cuerpoRhAudio} |
V:2 clef=bass
| ${cuerpoLhAudio} |`;

    window.abcGeradoAtual = abcVisual;
    renderizarDiretoDoAbc(abcVisual, abcAudio);

    console.log("🔍 Total Compassos Planificados:", todosOsBlocos.length);
    console.log("📄 ABC gerado:\n", abcVisual);
}

// =========================================================================
// RENDERIZAÇÃO E SINCRONIA COM O EDITOR
// =========================================================================
function renderizarDiretoDoAbc(abcVisual, abcAudio) {
    const editor = document.getElementById('abcEditor');
    if (editor) editor.value = abcVisual;

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
// FUNÇÕES DO EDITOR (botão e atualização automática)
// =========================================================================
function renderizarDoEditor() {
    const editor = document.getElementById('abcEditor');
    if (!editor) return;
    const abc = editor.value;
    if (abc.trim() === '') return;
    renderizarDiretoDoAbc(abc, abc);
}

// =========================================================================
// MENUS HIERÁRQUICOS: Categoria → Subcategoria → Style → Variação
// =========================================================================
function inicializarMenus() {
    const categorias = Object.keys(BANCO_RITMOS);
    if (categorias.length === 0) {
        console.warn("Nenhum ritmo carregado.");
        return;
    }
    ['RH', 'LH'].forEach(lado => {
        const catSelect = document.getElementById(`ritmoCategoria${lado}`);
        if (!catSelect) return;
        catSelect.innerHTML = "";
        categorias.forEach(cat => {
            catSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        // Inicializa os submenus
        atualizarSubcategorias(lado);
    });
}

function atualizarSubcategorias(lado) {
    const prefix = lado === 'RH' ? 'RH' : 'LH';
    const catSelect = document.getElementById(`ritmoCategoria${prefix}`);
    const subSelect = document.getElementById(`ritmoSubcategoria${prefix}`);
    if (!catSelect || !subSelect) return;

    const cat = catSelect.value;
    subSelect.innerHTML = "";
    if (BANCO_RITMOS[cat]) {
        Object.keys(BANCO_RITMOS[cat]).forEach(sub => {
            subSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
        });
    }
    // Após atualizar subcategorias, atualiza os estilos
    atualizarStyles(lado);
}

function atualizarStyles(lado) {
    const prefix = lado === 'RH' ? 'RH' : 'LH';
    const catSelect = document.getElementById(`ritmoCategoria${prefix}`);
    const subSelect = document.getElementById(`ritmoSubcategoria${prefix}`);
    const styleSelect = document.getElementById(`ritmoStyle${prefix}`);
    if (!catSelect || !subSelect || !styleSelect) return;

    const cat = catSelect.value;
    const sub = subSelect.value;
    styleSelect.innerHTML = "";

    if (BANCO_RITMOS[cat] && BANCO_RITMOS[cat][sub]) {
        // Extrai todos os estilos únicos das variações da subcategoria
        const styles = new Set();
        const vars = BANCO_RITMOS[cat][sub];
        Object.keys(vars).forEach(varNome => {
            const variacao = vars[varNome];
            if (variacao.style) styles.add(variacao.style);
        });
        // Se não houver style definido, adiciona "Padrão"
        if (styles.size === 0) styles.add("Padrão");
        
        styles.forEach(style => {
            styleSelect.innerHTML += `<option value="${style}">${style}</option>`;
        });
        
        // Seleciona o primeiro estilo e atualiza as variações
        atualizarVariacoesPorStyle(lado);
    }
}

function atualizarVariacoesPorStyle(lado) {
    const prefix = lado === 'RH' ? 'RH' : 'LH';
    const catSelect = document.getElementById(`ritmoCategoria${prefix}`);
    const subSelect = document.getElementById(`ritmoSubcategoria${prefix}`);
    const styleSelect = document.getElementById(`ritmoStyle${prefix}`);
    const varSelect = document.getElementById(`ritmoVariacao${prefix}`);
    if (!catSelect || !subSelect || !styleSelect || !varSelect) return;

    const cat = catSelect.value;
    const sub = subSelect.value;
    const style = styleSelect.value;

    varSelect.innerHTML = "";

    if (BANCO_RITMOS[cat] && BANCO_RITMOS[cat][sub]) {
        const vars = BANCO_RITMOS[cat][sub];
        Object.keys(vars).forEach(varNome => {
            const variacao = vars[varNome];
            const styleVar = variacao.style || "Padrão";
            if (styleVar === style) {
                varSelect.innerHTML += `<option value="${varNome}">${varNome}</option>`;
            }
        });
    }
    processarCifrasParaAbc();
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

// =========================================================================
// INICIALIZAÇÃO
// =========================================================================
window.addEventListener("DOMContentLoaded", () => {
    carregarPastaDeRitmos().then(() => {
        inicializarMenus();

        // Listeners para RH (cadeia hierárquica)
        document.getElementById("ritmoCategoriaRH")?.addEventListener("change", () => {
            atualizarSubcategorias("RH");
        });
        document.getElementById("ritmoSubcategoriaRH")?.addEventListener("change", () => {
            atualizarStyles("RH");
        });
        document.getElementById("ritmoStyleRH")?.addEventListener("change", () => {
            atualizarVariacoesPorStyle("RH");
        });
        document.getElementById("ritmoVariacaoRH")?.addEventListener("change", processarCifrasParaAbc);

        // Listeners para LH (cadeia hierárquica)
        document.getElementById("ritmoCategoriaLH")?.addEventListener("change", () => {
            atualizarSubcategorias("LH");
        });
        document.getElementById("ritmoSubcategoriaLH")?.addEventListener("change", () => {
            atualizarStyles("LH");
        });
        document.getElementById("ritmoStyleLH")?.addEventListener("change", () => {
            atualizarVariacoesPorStyle("LH");
        });
        document.getElementById("ritmoVariacaoLH")?.addEventListener("change", processarCifrasParaAbc);

        // Campos globais
        document.getElementById("loopCheck")?.addEventListener("change", processarCifrasParaAbc);
        document.getElementById("loopVezes")?.addEventListener("input", processarCifrasParaAbc);
        ["titulo", "compositor", "arranjador", "clave", "padraoBaixo", "cifras", "bpm"].forEach(id => {
            document.getElementById(id)?.addEventListener("input", processarCifrasParaAbc);
        });

        // Editor ABC
        document.getElementById("btnAtualizarAbc")?.addEventListener("click", renderizarDoEditor);
        document.getElementById("abcEditor")?.addEventListener("input", renderizarDoEditor);

        // Disparo inicial
        processarCifrasParaAbc();
    });
});
