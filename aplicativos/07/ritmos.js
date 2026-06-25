// ritmos.js - Banco único com suporte a RH e LH separados

// Banco global de ritmos
const BANCO_RITMOS = {};

// Registro único
const REGISTRO_RITMOS = {
    registrar: function(dadosEstilo) {
        const cat = dadosEstilo.categoria;
        const sub = dadosEstilo.subcategoria;
        if (!BANCO_RITMOS[cat]) BANCO_RITMOS[cat] = {};
        if (!BANCO_RITMOS[cat][sub]) BANCO_RITMOS[cat][sub] = {};

        Object.keys(dadosEstilo.variacoes).forEach(nomeVar => {
            const variacao = dadosEstilo.variacoes[nomeVar];
            BANCO_RITMOS[cat][sub][nomeVar] = {
                metro: variacao.metro || "4/4",
                desenhoRh: variacao.desenhoRh || null,
                desenhoLh: variacao.desenhoLh || null,
                compassos: variacao.compassos || null  // suporte a múltiplos compassos
            };
        });
        console.log(`📦 [${cat} > ${sub}] registrado.`);
    }
};

// Índice de arquivos
const INDICE_ARQUIVOS_RITMO = [
    { categoria: "Rock", arquivo: "ritmos/rock_pop.js" },
    { categoria: "Bossa Nova", arquivo: "ritmos/bossa_nova.js" },
    { categoria: "Piano", arquivo: "ritmos/piano_simples.js" },
    { categoria: "Exemplo", arquivo: "ritmos/exemplo_padrao.js" },
    { categoria: "Valsa", arquivo: "ritmos/valsa_trad.js" }
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

// Função auxiliar
function obterVariacao(categoria, subcategoria, variacao) {
    if (BANCO_RITMOS[categoria] && BANCO_RITMOS[categoria][subcategoria] && BANCO_RITMOS[categoria][subcategoria][variacao]) {
        return BANCO_RITMOS[categoria][subcategoria][variacao];
    }
    return null;
}

// Função que obtém a quinta justa mantendo a oitava da nota de entrada
function obterQuintaComOitava(notaComOitava) {
    // Extrai a nota base (ex: "C" de "C,", "C#" de "C#,")
    const match = notaComOitava.match(/^([A-G][#b]?)([,']*)/);
    if (!match) return null;
    const notaBase = match[1];
    const oitava = match[2] || ''; // pode ser "," ou "'" ou vazio
    
    const indice = ESCALA_CIFRAS.indexOf(notaBase);
    if (indice === -1) return null;
    
    const quintaIndice = (indice + 7) % 12;
    const quintaNota = ESCALA_CIFRAS[quintaIndice];
    
    return quintaNota + oitava; // mantém a mesma oitava
}

// Função que processa um compasso a partir de desenhos já extraídos (sem metadados de ritmo)
function processarCompassoDinamicoString(stringInternaCompasso, metroPadrao, estiloBaixo, desenhoRh, desenhoLh) {
    const regexAcorde = /([A-G][A-Za-z0-9°+]*)/;
    let itens = stringInternaCompasso.split(/\s+/).filter(c => c !== "");
    let primeiroItem = itens[0];
    const temposTotais = metroPadrao.split("/")[0];
    if (!primeiroItem) return { rh: `z${temposTotais}`, lh: `z${temposTotais}` };

    let match = primeiroItem.match(regexAcorde);
    if (!match) return { rh: `z${temposTotais}`, lh: `z${temposTotais}` };

    let cifra = match[1];
    const acorde = ACORDES[cifra];
    if (!acorde) return { rh: `z${temposTotais}`, lh: `z${temposTotais}` };

    // Notas da mão esquerda conforme o modo
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

    // Fallback se desenhos não veio
    if (!desenhoRh) desenhoRh = `{RH}${temposTotais}`;
    if (!desenhoLh) desenhoLh = `{LH}${temposTotais}`;

    let notasRh = acorde.rh.join("");
    let baixoTratado = notasLhEscolhidas;
    if (desenhoLh.includes("[{LH}]") && baixoTratado.startsWith("[")) {
        baixoTratado = baixoTratado.replace(/[\[\]]/g, "");
    }

    let abcRh = desenhoRh.replace(/{RH}/g, notasRh);
    let abcLh = desenhoLh.replace(/{LH}/g, baixoTratado);

    // Usa a nota da mão esquerda já com oitava (baixoTratado) para obter a quinta na mesma oitava
const quintaNota = obterQuintaComOitava(baixoTratado);
if (quintaNota) {
    abcLh = abcLh.replace(/{LH5}/g, quintaNota);
}

    return { rh: abcRh, lh: abcLh };
}

// Função original que recebe os objetos ritmoRH e ritmoLH
function processarCompassoDinamico(stringInternaCompasso, metroPadrao, estiloBaixo, ritmoRH, ritmoLH, indice) {
    let desenhoRh = null;
    let desenhoLh = null;

    // Se o ritmo tem array de compassos, pega o padrão correspondente ao índice (repetindo se necessário)
    if (ritmoRH && ritmoRH.compassos && ritmoRH.compassos.length > 0) {
        const padraoRh = ritmoRH.compassos[(indice || 0) % ritmoRH.compassos.length];
        if (padraoRh && padraoRh.desenhoRh) desenhoRh = padraoRh.desenhoRh;
    } else if (ritmoRH && ritmoRH.desenhoRh) {
        desenhoRh = ritmoRH.desenhoRh;
    }

    if (ritmoLH && ritmoLH.compassos && ritmoLH.compassos.length > 0) {
        const padraoLh = ritmoLH.compassos[(indice || 0) % ritmoLH.compassos.length];
        if (padraoLh && padraoLh.desenhoLh) desenhoLh = padraoLh.desenhoLh;
    } else if (ritmoLH && ritmoLH.desenhoLh) {
        desenhoLh = ritmoLH.desenhoLh;
    }

    // Fallback se não houver desenho, usa nota inteira
    if (!desenhoRh) desenhoRh = `{RH}${metroPadrao.split('/')[0]}`;
    if (!desenhoLh) desenhoLh = `{LH}${metroPadrao.split('/')[0]}`;

    // Chama a função que processa o compasso com os desenhos
    return processarCompassoDinamicoString(stringInternaCompasso, metroPadrao, estiloBaixo, desenhoRh, desenhoLh);
}

// Função auxiliar que lida com múltiplos compassos (mantida por compatibilidade)
function processarCompassoDinamicoMultiplo(stringInternaCompasso, metroPadrao, estiloBaixo, ritmoRH, ritmoLH, indice) {
    // 1. Determina os desenhos a usar, considerando arrays de compassos
    let desenhoRh = null;
    let desenhoLh = null;

    // RH
    if (ritmoRH) {
        if (ritmoRH.compassos && Array.isArray(ritmoRH.compassos) && ritmoRH.compassos.length > 0) {
            const padrao = ritmoRH.compassos[indice % ritmoRH.compassos.length];
            if (padrao && padrao.desenhoRh) desenhoRh = padrao.desenhoRh;
        } else if (ritmoRH.desenhoRh) {
            desenhoRh = ritmoRH.desenhoRh;
        }
    }

    // LH
    if (ritmoLH) {
        if (ritmoLH.compassos && Array.isArray(ritmoLH.compassos) && ritmoLH.compassos.length > 0) {
            const padrao = ritmoLH.compassos[indice % ritmoLH.compassos.length];
            if (padrao && padrao.desenhoLh) desenhoLh = padrao.desenhoLh;
        } else if (ritmoLH.desenhoLh) {
            desenhoLh = ritmoLH.desenhoLh;
        }
    }

    // 2. Fallback (nota inteira) se não houver desenhos
    const tempos = parseInt(metroPadrao.split('/')[0]) || 4;
    if (!desenhoRh) desenhoRh = `{RH}${tempos}`;
    if (!desenhoLh) desenhoLh = `{LH}${tempos}`;

    // 3. Cria objetos ritmo temporários com os desenhos escolhidos
    const ritmoRHFinal = { ...ritmoRH, desenhoRh };
    const ritmoLHFinal = { ...ritmoLH, desenhoLh };

    // 4. Chama a função principal de substituição
    return processarCompassoDinamico(stringInternaCompasso, metroPadrao, estiloBaixo, ritmoRHFinal, ritmoLHFinal);
}