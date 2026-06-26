// ritmos.js - Banco único com suporte a RH e LH separados com Antecipação Harmônica e Graus Dinâmicos

// Banco global de ritmos
const BANCO_RITMOS = {};
const ALIAS_RITMOS = {};  // Mapeia alias -> { categoria, subcategoria, nome }

const REGISTRO_RITMOS = {
    registrar: function(dadosEstilo) {
        const cat = dadosEstilo.categoria;
        const sub = dadosEstilo.subcategoria;
        const styleGlobal = dadosEstilo.style || null; // estilo da subcategoria

        if (!BANCO_RITMOS[cat]) BANCO_RITMOS[cat] = {};
        if (!BANCO_RITMOS[cat][sub]) BANCO_RITMOS[cat][sub] = {};

        Object.keys(dadosEstilo.variacoes).forEach(nomeVar => {
            const variacao = dadosEstilo.variacoes[nomeVar];
            BANCO_RITMOS[cat][sub][nomeVar] = {
                metro: variacao.metro || "4/4",
                desenhoRh: variacao.desenhoRh || null,
                desenhoLh: variacao.desenhoLh || null,
                compassos: variacao.compassos || null,
                alias: variacao.alias || null,
                style: variacao.style || styleGlobal || null, // herda o estilo da subcategoria
                duracao: variacao.métrica || variacao.duracao || "1/4"
            };
            if (variacao.alias) {
                ALIAS_RITMOS[variacao.alias] = {
                    categoria: cat,
                    subcategoria: sub,
                    nome: nomeVar
                };
            }
        });
        console.log(`📦 [${cat} > ${sub}] registrado.`);
    }
};

// Índice de arquivos
const INDICE_ARQUIVOS_RITMO = [
    { categoria: "Jazz", arquivo: "ritmos/Jazz20.js" },
    { categoria: "Country", arquivo: "ritmos/country20.js" },
    { categoria: "Rock", arquivo: "ritmos/rock_pop.js" },
    { categoria: "Bossa Nova", arquivo: "ritmos/bossa_nova.js" },
    { categoria: "Piano", arquivo: "ritmos/piano_simples.js" },
    { categoria: "Exemplo", arquivo: "ritmos/exemplo_padrao.js" },
    { categoria: "Valsa", arquivo: "ritmos/valsa_trad.js" },
    { categoria: "Exemplo2", arquivo: "ritmos/exemplo2.js" }
    
];

// Carregador dinâmico
function carregarPastaDeRitmos() {
    return new Promise((resolve) => {
        let scriptsCarregados = 0;
        if (INDICE_ARQUIVOS_RITMO.length === 0) return resolve();
        INDICE_ARQUIVOS_RITMO.forEach(item => {
            const script = document.createElement("script");
            script.src = item.arquivo;
            script.async = false;
            script.onload = () => {
                scriptsCarregados++;
                if (scriptsCarregados === INDICE_ARQUIVOS_RITMO.length) {
                    console.log("🚀 Todos os ritmos carregados.");
                    resolve();
                }
            };
            script.onerror = () => {
                console.error(`❌ Erro ao carregar: ${item.arquivo}`);
                scriptsCarregados++;
                if (scriptsCarregados === INDICE_ARQUIVOS_RITMO.length) resolve();
            };
            document.head.appendChild(script);
        });
    });
}

// Função auxiliar para obter variação por categoria, subcategoria e nome
function obterVariacao(categoria, subcategoria, variacao) {
    if (BANCO_RITMOS[categoria] && BANCO_RITMOS[categoria][subcategoria] && BANCO_RITMOS[categoria][subcategoria][variacao]) {
        return BANCO_RITMOS[categoria][subcategoria][variacao];
    }
    return null;
}

// Função para resolver um comando {alias} ou {número}
function resolverComando(comando, catPadrao, subPadrao, listaVars) {
    const num = parseInt(comando);
    if (!isNaN(num) && num >= 1 && num <= listaVars.length) {
        return { categoria: catPadrao, subcategoria: subPadrao, nome: listaVars[num - 1] };
    }

    if (ALIAS_RITMOS[comando]) {
        return ALIAS_RITMOS[comando];
    }

    if (listaVars.includes(comando)) {
        return { categoria: catPadrao, subcategoria: subPadrao, nome: comando };
    }

    return null;
}

// Função que obtém a quinta justa mantendo a oitava da nota de entrada
function obterQuintaComOitava(notaComOitava) {
    if (!notaComOitava) return null;
    const match = notaComOitava.match(/^([A-G][#b]?)([,']*)/);
    if (!match) return null;
    const notaBase = match[1];
    const oitava = match[2] || '';
    if (typeof ESCALA_CIFRAS === 'undefined') return null;
    const indice = ESCALA_CIFRAS.indexOf(notaBase);
    if (indice === -1) return null;
    const quintaIndice = (indice + 7) % 12;
    const quintaNota = ESCALA_CIFRAS[quintaIndice];
    return quintaNota + oitava;
}

// --- FUNÇÃO AUXILIAR PARA FATIAR OS DESENHOS ABC ---
function fatiarDesenhoAbc(desenho, totalFatias) {
    let unidades = desenho.split(/\s+/).filter(u => u.trim() !== "");
    let tamanhoFatia = Math.ceil(unidades.length / totalFatias);
    let fatias = [];
    
    for (let i = 0; i < totalFatias; i++) {
        let inicio = i * tamanhoFatia;
        let fim = inicio + tamanhoFatia;
        let pedaco = unidades.slice(inicio, fim).join(" ");
        fatias.push(pedaco);
    }
    return fatias;
}

// --- FUNÇÃO AUXILIAR DEFINITIVA: GRAUS (1,3,5,7) + EXTREMOS (G, A) POR ALTURA REAL ---
function processarMarcadoresGraus(fatiaStr, vetorNotasRh) {
    if (!vetorNotasRh || vetorNotasRh.length === 0) return "z";

    // 1. Mapeamento de altura real das notas no ABC
    const obtenerPesoNotaAbc = (nota) => {
        if (!nota) return 0;
        const match = nota.match(/^([A-Ga-g][#b]?)([,']*)/);
        if (!match) return 0;
        
        let notaBase = match[1];
        let oitavaMod = match[2] || '';
        
        const ordemLetras = ["C","D","E","F","G","A","B","c","d","e","f","g","a","b"];
        let peso = ordemLetras.indexOf(notaBase);
        if (peso === -1) peso = 0;

        for (let i = 0; i < oitavaMod.length; i++) {
            if (oitavaMod[i] === "'") peso += 7; 
            if (oitavaMod[i] === ",") peso -= 7; 
        }
        return peso;
    };

    // Ordena o array de notas da mais grave para a mais aguda
    let notasOrdenadasPorAltura = [...vetorNotasRh].sort((a, b) => obtenerPesoNotaAbc(a) - obtenerPesoNotaAbc(b));

    // 2. Substitui os marcadores compactos de extremos (Grave e Aguda)
    fatiaStr = fatiaStr.replace(/{RH_G}/g, notasOrdenadasPorAltura[0]);
    fatiaStr = fatiaStr.replace(/{RH_A}/g, notasOrdenadasPorAltura[notasOrdenadasPorAltura.length - 1]);

    // 3. Processa os graus numéricos ({RH1}, {RH3}, {RH5}, {RH7}) baseados na altura ordenada
    return fatiaStr.replace(/{RH(\d*)}/g, (match, digito) => {
        if (digito === "") {
            return vetorNotasRh.join(""); // {RH} sem número continua sendo o acorde cheio original
        }
        
        // Mapeamento dos graus para o array ordenado por altura:
        // {RH1} = mais grave, {RH3} = segunda nota, {RH5} = terceira nota, {RH7} = quarta nota
        const mapeamentoGraus = { "1": 0, "3": 1, "5": 2, "7": 3 };
        const indiceNota = mapeamentoGraus[digito];
        
        if (indiceNota !== undefined && notasOrdenadasPorAltura[indiceNota]) {
            return notasOrdenadasPorAltura[indiceNota]; 
        }
        
        // Se o acorde tiver menos notas que o grau pedido (ex: pediu {RH7} em tríade), pega a mais aguda
        return notasOrdenadasPorAltura[notasOrdenadasPorAltura.length - 1]; 
    });
}


// ====== PROCESSAMENTO DE MÚLTIPLOS ACORDES DENTRO DO COMPASSO ======
function processarCompassoDinamicoString(stringInternaCompasso, metroPadrao, estiloBaixo, desenhoRh, desenhoLh) {
    const regexAcorde = /([A-G][A-Za-z0-9°+]*)/;
    let itens = stringInternaCompasso.split(/\s+/).filter(c => c.trim() !== "");
    const temposTotais = parseInt(metroPadrao.split("/")[0]) || 4;

    if (itens.length === 0) {
        return { rh: `z${temposTotais}`, lh: `z${temposTotais}` };
    }

    let acordesValidos = itens.filter(item => item.match(regexAcorde));
    if (acordesValidos.length === 0) {
        return { rh: `z${temposTotais}`, lh: `z${temposTotais}` };
    }

    let qtdAcordes = acordesValidos.length;
    let fatiasRh = fatiarDesenhoAbc(desenhoRh || `{RH}${temposTotais}`, qtdAcordes);
    let fatiasLh = fatiarDesenhoAbc(desenhoLh || `{LH}${temposTotais}`, qtdAcordes);

    let resultadoFinalRh = [];
    let resultadoFinalLh = [];

    acordesValidos.forEach((itemAcorde, index) => {
        let match = itemAcorde.match(regexAcorde);
        let cifra = match[1];
        const acorde = ACORDES[cifra];

        if (!acorde) {
            let fatiaRh = fatiasRh[index].replace(/{RH\d*}|{RH}/g, "z");
            let fatiaLh = fatiasLh[index].replace(/{LH5}|{LH}/g, "z");
            resultadoFinalRh.push(fatiaRh);
            resultadoFinalLh.push(fatiaLh);
            return;
        }

        let notasLhEscolhidas = acorde.m1 || "C,";
        switch (estiloBaixo) {
            case "tonica":          notasLhEscolhidas = acorde.m1 || "C,"; break;
            case "quinta":          notasLhEscolhidas = acorde.m2 || "[C,G,]"; break;
            case "oitava":          notasLhEscolhidas = acorde.m3 || "[C,C]"; break;
            case "triade_aberta":   notasLhEscolhidas = acorde.m4 || "[C,,G,,C,]"; break;
            case "triade_fechada":  notasLhEscolhidas = acorde.m5 || "[C,E,G]"; break;
            case "tetrade":         notasLhEscolhidas = acorde.m6 || "[C,E,G,C]"; break;
            case "baixo_acorde":    notasLhEscolhidas = acorde.m7 || "[C,G,E]"; break;
            default:                notasLhEscolhidas = acorde.m1 || "C,"; break;
        }

        let baixoTratado = notasLhEscolhidas;
        if (fatiasLh[index].includes("[{LH}]") && baixoTratado.startsWith("[")) {
            baixoTratado = baixoTratado.replace(/[\[\]]/g, "");
        }

        let fatiaRh = fatiasRh[index];
        let fatiaLh = fatiasLh[index];

        // Processa marcadores {RH}, {RH1}, {RH3}, etc.
        fatiaRh = processarMarcadoresGraus(fatiaRh, acorde.rh);

        // Substitui {LH} pela tônica tratada
        fatiaLh = fatiaLh.replace(/{LH}/g, baixoTratado);

        // Substitui {LH5} pela quinta justa
        const quintaNota = obterQuintaComOitava(baixoTratado);
        if (quintaNota) {
            fatiaLh = fatiaLh.replace(/{LH5}/g, quintaNota);
        }

        resultadoFinalRh.push(fatiaRh);
        resultadoFinalLh.push(fatiaLh);
    });

    return { 
        rh: resultadoFinalRh.join(" "), 
        lh: resultadoFinalLh.join(" ") 
    };
}

// ====== MOTOR DE ANTECIPAÇÃO HARMÔNICA AUTOMÁTICA ======
function processarCompassoDinamicoComProximo(blocoAtual, proximoBloco, metroPadrao, estiloBaixo, ritmoRH, ritmoLH, indice) {
    let desenhoRh = null;
    let desenhoLh = null;

    if (ritmoRH && ritmoRH.compassos && ritmoRH.compassos.length > 0) {
        const padraoRh = ritmoRH.compassos[indice % ritmoRH.compassos.length];
        if (padraoRh && padraoRh.desenhoRh) desenhoRh = padraoRh.desenhoRh;
    } else if (ritmoRH && ritmoRH.desenhoRh) {
        desenhoRh = ritmoRH.desenhoRh;
    }

    if (ritmoLH && ritmoLH.compassos && ritmoLH.compassos.length > 0) {
        const padraoLh = ritmoLH.compassos[indice % ritmoLH.compassos.length];
        if (padraoLh && padraoLh.desenhoLh) desenhoLh = padraoLh.desenhoLh;
    } else if (ritmoLH && ritmoLH.desenhoLh) {
        desenhoLh = ritmoLH.desenhoLh;
    }

    const tempos = metroPadrao.split('/')[0];
    if (!desenhoRh) desenhoRh = `[{RH}]${tempos}`;
    if (!desenhoLh) desenhoLh = `{LH}${tempos}`;

    // Se houver mais de um acorde no bloco atual, delega para a função de fatiamento simples
    let itensAtuais = blocoAtual.split(/\s+/).filter(c => c.trim() !== "");
    if (itensAtuais.length > 1) {
        return processarCompassoDinamicoString(blocoAtual, metroPadrao, estiloBaixo, desenhoRh, desenhoLh);
    }

    const regexCifra = /([A-G][A-Za-z0-9°+]*)/;
    let matchAtual = blocoAtual.match(regexCifra);
    let matchProximo = proximoBloco.match(regexCifra);

    let cifraAtual = matchAtual ? matchAtual[1] : "C";
    let cifraProxima = matchProximo ? matchProximo[1] : cifraAtual;

    const acAtual = ACORDES[cifraAtual] || { rh: ["C","E","G"], m1: "C," };
    const acProximo = ACORDES[cifraProxima] || acAtual;

    // --- Processamento Mão Direita (RH) ---
    let notasRhAtual = acAtual.rh.join("");
    let notasRhProximo = acProximo.rh.join("");

    // Processa os graus dinâmicos antes da injeção de antecipações sincopadas
    let abcRh = processarMarcadoresGraus(desenhoRh, acAtual.rh);
    
    // Injeta as notas do próximo acorde caso a ponta de antecipação sincopada exista
    let buscaPontaRh = `[${notasRhAtual}]/>[${notasRhAtual}]/-`;
    let substituiPontaRh = `[${notasRhAtual}]/>[${notasRhProximo}]/-`;
    abcRh = abcRh.replace(buscaPontaRh, substituiPontaRh);

    // --- Processamento Mão Esquerda (LH) ---
    function obterBaixo(acorde) {
        switch (estiloBaixo) {
            case "tonica": return acorde.m1 || "C,";
            case "quinta": return acorde.m2 || "[C,G,]";
            case "oitava": return acorde.m3 || "[C,C]";
            case "triade_aberta": return acorde.m4 || "[C,,G,,C,]";
            case "triade_fechada": return acorde.m5 || "[C,E,G]";
            case "tetrade": return acorde.m6 || "[C,E,G,C]";
            case "baixo_acorde": return acorde.m7 || "[C,G,E]";
            default: return acorde.m1 || "C,";
        }
    }

    let baixoAtual = obterBaixo(acAtual);
    let baixoProximo = obterBaixo(acProximo);

    let abcLh = desenhoLh.replace(/{LH}/g, bajoTratado = baixoAtual);

    const qNotaAtual = obterQuintaComOitava(baixoAtual);
    const qNotaProxima = obterQuintaComOitava(baixoProximo);
    if (qNotaAtual) abcLh = abcLh.replace(/{LH5}/g, qNotaAtual);

    // Injeta a antecipação harmônica no Baixo se houver a amarração correspondente
    let buscaPontaLh = `${baixoAtual}/>${baixoAtual}/-`;
    let substituiPontaLh = `${baixoAtual}/>${baixoProximo}/-`;
    abcLh = abcLh.replace(buscaPontaLh, substituiPontaLh);

    if (qNotaProxima) {
        let buscaPontaLh5 = `${baixoAtual}/>${qNotaAtual}/-`;
        let substituiPontaLh5 = `${baixoAtual}/>${qNotaProxima}/-`;
        abcLh = abcLh.replace(buscaPontaLh5, substituiPontaLh5);
    }

    return { rh: abcRh, lh: abcLh };
}

function processarCompassoDinamico(stringInternaCompasso, metroPadrao, estiloBaixo, ritmoRH, ritmoLH, indice) {
    return processarCompassoDinamicoComProximo(stringInternaCompasso, stringInternaCompasso, metroPadrao, estiloBaixo, ritmoRH, ritmoLH, indice);
}
