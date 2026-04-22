// ============================================
// ACORDES DINÂMICOS - PRO MAESTRO
// ============================================

// Dicionário de formas de acordes para transposição
const FORMAS_ACORDES = {
    // Formas com corda base 6 (Mi)
    '6_1': { 
        cordas: [1, 3, 3, 2, 1, 1], 
        dedos: ['1', '3', '4', '2', '1', '1'], 
        pestana: [1,2,3,4,5], 
        nome: 'Maior' 
    },
    '6_2': { 
        cordas: [1, 2, 3, 3, 1, 1], 
        dedos: ['1', '2', '3', '4', '1', '1'], 
        pestana: true, 
        nome: 'Menor' 
    },
    '6_3': { 
        cordas: [1, 3, 2, 2, 1, 1], 
        dedos: ['1', '3', '2', '4', '1', '1'], 
        pestana: true, 
        nome: 'Sétima' 
    },
    
    // Formas com corda base 5 (Lá)
    '5_1': { 
        cordas: [-1, 1, 3, 3, 3, 1], 
        dedos: ['', '1', '3', '4', '2', '1'], 
        pestana: true, 
        nome: 'Maior' 
    },
    '5_2': { 
        cordas: [-1, 1, 2, 2, 3, 1], 
        dedos: ['', '1', '2', '3', '4', '1'], 
        pestana: true, 
        nome: 'Menor' 
    },
    '5_3': { 
        cordas: [-1, 1, 3, 2, 3, 1], 
        dedos: ['', '1', '3', '2', '4', '1'], 
        pestana: true, 
        nome: 'Sétima' 
    },
    
    // Formas com corda base 4 (Ré)
    '4_1': { 
        cordas: [-1, -1, 1, 3, 3, 1], 
        dedos: ['', '', '1', '3', '4', '2'], 
        pestana: true, 
        nome: 'Maior' 
    },
    '4_2': { 
        cordas: [-1, -1, 1, 2, 3, 1], 
        dedos: ['', '', '1', '2', '3', '4'], 
        pestana: true, 
        nome: 'Menor' 
    },
    '4_3': { 
        cordas: [-1, -1, 1, 3, 2, 1], 
        dedos: ['', '', '1', '3', '2', '4'], 
        pestana: true, 
        nome: 'Sétima' 
    }
};

// Mapeamento de casas para notas (por corda base)
const NOTAS_POR_CASA = {
    6: { 
        1: 'F', 2: 'F#', 3: 'G', 4: 'G#', 5: 'A', 
        6: 'A#', 7: 'B', 8: 'C', 9: 'C#', 10: 'D', 
        11: 'D#', 12: 'E' 
    },
    5: { 
        1: 'A#', 2: 'B', 3: 'C', 4: 'C#', 5: 'D', 
        6: 'D#', 7: 'E', 8: 'F', 9: 'F#', 10: 'G', 
        11: 'G#', 12: 'A' 
    },
    4: {
        1: 'D#', 2: 'E', 3: 'F', 4: 'F#', 5: 'G',
        6: 'G#', 7: 'A', 8: 'A#', 9: 'B', 10: 'C',
        11: 'C#', 12: 'D'
    }
};

/**
 * Processa um acorde dinâmico no formato "forma;casa" ou "forma;casa;cordaBase"
 * Exemplos: "1;3", "2;5", "1;3;5", "3;7;6"
 * 
 * @param {string} sigla - Formato do acorde (ex: "1;3")
 * @param {string} nome - Nome personalizado (opcional)
 * @returns {object|null} Objeto do acorde ou null se inválido
 */
function processarAcordeDinamico(sigla, nome) {
    console.log("processarAcordeDinamico chamado com:", sigla, nome);
    
    // Suporta formatos:
    // 1;3   -> forma=1, casa=3, cordaBase padrão=6
    // 1;3;5 -> forma=1, casa=3, cordaBase=5
    let match = sigla.match(/^(\d+);(\d+)$/);
    let matchComCorda = sigla.match(/^(\d+);(\d+);(\d+)$/);
    
    if (!match && !matchComCorda) return null;
    
    let forma, casa, cordaBase;
    
    if (matchComCorda) {
        forma = parseInt(matchComCorda[1]);
        casa = parseInt(matchComCorda[2]);
        cordaBase = parseInt(matchComCorda[3]);
    } else {
        forma = parseInt(match[1]);
        casa = parseInt(match[2]);
        cordaBase = 6;  // corda padrão (Mi)
    }
    
    // Validação dos parâmetros
    if (forma < 1 || forma > 3) {
        console.error(`Forma inválida: ${forma}. Use 1 (Maior), 2 (Menor) ou 3 (Sétima)`);
        return null;
    }
    
    if (casa < 1 || casa > 24) {
        console.error(`Casa inválida: ${casa}. Use valores entre 1 e 24`);
        return null;
    }
    
    if (cordaBase < 4 || cordaBase > 6) {
        console.error(`Corda base inválida: ${cordaBase}. Use 4, 5 ou 6`);
        return null;
    }
    
    // Busca a forma do acorde
    const chave = `${cordaBase}_${forma}`;
    let formaBase = FORMAS_ACORDES[chave];
    
    // Fallback para formas padrão
    if (!formaBase) {
        const fallbackChave = `${cordaBase}_1`;
        formaBase = FORMAS_ACORDES[fallbackChave];
        if (!formaBase) return null;
    }
    
    // Copia as cordas e ajusta para a casa desejada
    const cordasAjustadas = [...formaBase.cordas];
    
    // Ajusta os valores das cordas baseado na casa inicial
    for (let i = 0; i < cordasAjustadas.length; i++) {
        if (cordasAjustadas[i] > 0) {
            cordasAjustadas[i] = cordasAjustadas[i] + (casa - 1);
        }
    }
    
    // Gera o nome do acorde baseado na corda fundamental
    let nomeGerado = nome;
    if (!nomeGerado || nomeGerado === sigla) {
        nomeGerado = gerarNomeAcorde(cordaBase, casa, formaBase.nome);
    }
    
    console.log(`✅ Acorde gerado: ${nomeGerado} (corda base ${cordaBase}, forma ${forma}, casa ${casa})`);
    
    return {
        nome: nomeGerado,
        cordas: cordasAjustadas,
        dedos: [...formaBase.dedos],
        pestana: formaBase.pestana,
        pestanaCasa: casa,
        casaInicial: casa,
        cordaBase: cordaBase,
        baixo: cordaBase === 6 ? 'E' : (cordaBase === 5 ? 'A' : 'D')
    };
}

/**
 * Gera o nome do acorde baseado na corda base e casa
 */
function gerarNomeAcorde(cordaBase, casa, tipoAcorde) {
    let notaBase = NOTAS_POR_CASA[cordaBase]?.[casa];
    
    if (!notaBase) {
        // Se a casa for maior que 12, calcula a nota equivalente
        const casaMod = ((casa - 1) % 12) + 1;
        notaBase = NOTAS_POR_CASA[cordaBase]?.[casaMod];
        if (notaBase && casa > 12) {
            const oitavas = Math.floor((casa - 1) / 12);
            notaBase = notaBase + (oitavas > 0 ? ` (${oitavas + 1}ª oitava)` : '');
        }
    }
    
    return notaBase ? `${notaBase} ${tipoAcorde}` : `${casa}ª casa ${tipoAcorde}`;
}

/**
 * Adiciona um acorde personalizado ao dicionário global ACORDES
 */
function adicionarAcordePersonalizado(sigla, dados) {
    if (typeof ACORDES === 'undefined') {
        console.error('ACORDES não está definido');
        return false;
    }
    
    if (!dados.cordas || !Array.isArray(dados.cordas) || dados.cordas.length !== 6) {
        console.error('Cordas deve ser um array de 6 posições');
        return false;
    }
    
    ACORDES[sigla] = {
        nome: dados.nome || sigla,
        cordas: dados.cordas,
        dedos: dados.dedos || ['', '', '', '', '', ''],
        pestana: dados.pestana || false,
        casaInicial: dados.casaInicial || 1,
        baixo: dados.baixo || ''
    };
    
    console.log(`✅ Acorde ${sigla} adicionado com sucesso!`);
    return true;
}

/**
 * Lista todas as formas de acorde disponíveis
 */
function listarFormasDisponiveis() {
    const formas = [];
    for (const [chave, forma] of Object.entries(FORMAS_ACORDES)) {
        const [corda, tipo] = chave.split('_');
        const tipoNome = tipo === '1' ? 'Maior' : (tipo === '2' ? 'Menor' : 'Sétima');
        formas.push({
            cordaBase: parseInt(corda),
            tipo: parseInt(tipo),
            nome: tipoNome,
            formato: `${tipo};?;${corda}`,
            exemplo: `[Acorde:${tipo};3;${corda}]${tipoNome} na casa 3[/Acorde]`
        });
    }
    return formas;
}

// Exporta as funções para uso global (se estiver em um ambiente browser)
if (typeof window !== 'undefined') {
    window.processarAcordeDinamico = processarAcordeDinamico;
    window.adicionarAcordePersonalizado = adicionarAcordePersonalizado;
    window.listarFormasDisponiveis = listarFormasDisponiveis;
    window.FORMAS_ACORDES = FORMAS_ACORDES;
    window.NOTAS_POR_CASA = NOTAS_POR_CASA;
}
