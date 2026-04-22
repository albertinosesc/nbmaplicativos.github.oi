// ============================================
// PROCESSAR ACORDE COM SINTAXE [Acorde:forma;casa]
// ============================================
function processarAcordeDinamico(sigla, nome) {
    console.log("processarAcordeDinamico chamado com:", sigla, nome);
    
    // Formatos suportados:
    // [Acorde:1;3]      - forma 1, casa 3 (pestana na casa 1, número 3 ao lado)
    // [Acorde:1;3;5]    - forma 1, casa 3, base na 5ª corda
    
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
        cordaBase = 6;  // padrão: base na 6ª corda
    }
    
    // Mapeamento das formas de acorde (sempre com pestana na casa 1)
    const formas = {
        // ============================================
        // BASE NA 6ª CORDA (Mi) - Pestana na casa 1
        // ============================================
        '6_1': {  // Maior
            cordas: [1, 3, 3, 2, 1, 1],
            dedos: ['1', '3', '4', '2', '1', '1'],
            pestana: true,
            pestanaCasa: 1,
            nome: 'Maior'
        },
        '6_2': {  // Menor
            cordas: [1, 2, 3, 3, 1, 1],
            dedos: ['1', '2', '3', '4', '1', '1'],
            pestana: true,
            pestanaCasa: 1,
            nome: 'Menor'
        },
        '6_3': {  // Sétima
            cordas: [1, 3, 2, 2, 1, 1],
            dedos: ['1', '3', '2', '4', '1', '1'],
            pestana: true,
            pestanaCasa: 1,
            nome: 'Sétima'
        },
        
        // ============================================
        // BASE NA 5ª CORDA (Lá) - Pestana na casa 1
        // ============================================
        '5_1': {  // Maior
            cordas: [-1, 1, 3, 3, 3, 1],
            dedos: ['', '1', '3', '4', '2', '1'],
            pestana: true,
            pestanaCasa: 1,
            nome: 'Maior'
        },
        '5_2': {  // Menor
            cordas: [-1, 1, 2, 2, 3, 1],
            dedos: ['', '1', '2', '3', '4', '1'],
            pestana: true,
            pestanaCasa: 1,
            nome: 'Menor'
        },
        '5_3': {  // Sétima
            cordas: [-1, 1, 3, 2, 3, 1],
            dedos: ['', '1', '3', '2', '4', '1'],
            pestana: true,
            pestanaCasa: 1,
            nome: 'Sétima'
        }
    };
    
    const chave = `${cordaBase}_${forma}`;
    const formaBase = formas[chave];
    
    if (!formaBase) {
        console.warn(`Forma ${forma} com base na ${cordaBase}ª corda não encontrada`);
        return null;
    }
    
    // IMPORTANTE: Deslocar as cordas baseado na casa (transposição)
    // Ex: casa=3, deslocamento=2, corda 1 vira 3, corda 3 vira 5, etc.
    const deslocamento = casa - 1;
    const cordasAjustadas = formaBase.cordas.map(corda => {
        if (corda === -1) return -1;
        if (corda === 0) return 0;
        return corda + deslocamento;
    });
    
    // Gerar nome do acorde baseado na nota
    let nomeGerado = nome;
    if (!nomeGerado || nomeGerado === sigla) {
        const notasPorCasa = {
            6: { 1: 'F', 2: 'F#', 3: 'G', 4: 'G#', 5: 'A', 6: 'A#', 7: 'B', 
                 8: 'C', 9: 'C#', 10: 'D', 11: 'D#', 12: 'E' },
            5: { 1: 'A#', 2: 'B', 3: 'C', 4: 'C#', 5: 'D', 6: 'D#', 7: 'E',
                 8: 'F', 9: 'F#', 10: 'G', 11: 'G#', 12: 'A' }
        };
        const notaBase = notasPorCasa[cordaBase]?.[casa] || `${casa}ª`;
        nomeGerado = `${notaBase} ${formaBase.nome}`;
    }
    
    return {
        nome: nomeGerado,
        cordas: cordasAjustadas,
        dedos: formaBase.dedos,
        pestana: formaBase.pestana,
        pestanaCasa: formaBase.pestanaCasa,  // SEMPRE 1
        casaInicial: casa,                   // Número que aparece ao lado
        cordaBase: cordaBase,
        baixo: ''
    };
}