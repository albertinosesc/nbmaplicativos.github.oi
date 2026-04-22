// ============================================
// PROCESSAR ACORDE COM SINTAXE [Acorde:forma;casa]
// ============================================
function processarAcordeDinamico(sigla, nome) {
    console.log("processarAcordeDinamico chamado com:", sigla, nome);
    
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
    
    // Mapeamento das formas de acorde
    // IMPORTANTE: Aqui as casas são relativas ao início do desenho (1 = primeira casa visível)
    const formas = {
        '6_1': { // Maior (Forma de F)
            cordas: [1, 3, 3, 2, 1, 1],
            dedos: ['1', '3', '4', '2', '1', '1'],
            pestana: true,
            pestanaCasa: 1,
            nome: 'Maior'
        },
        '6_2': { // Menor (Forma de Fm)
            cordas: [1, 3, 3, 1, 1, 1],
            dedos: ['1', '3', '4', '1', '1', '1'],
            pestana: true,
            pestanaCasa: 1,
            nome: 'Menor'
        },
        '6_3': { // Sétima (Forma de F7)
            cordas: [1, 3, 1, 2, 1, 1],
            dedos: ['1', '3', '1', '2', '1', '1'],
            pestana: true,
            pestanaCasa: 1,
            nome: 'Sétima'
        },
        '5_1': { // Maior (Forma de Bb/A)
            cordas: [-1, 1, 3, 3, 3, 1],
            dedos: ['', '1', '2', '3', '4', '1'],
            pestana: true,
            pestanaCasa: 1,
            nome: 'Maior'
        },
        '5_2': { // Menor (Forma de Bbm/Am)
            cordas: [-1, 1, 3, 3, 2, 1],
            dedos: ['', '1', '3', '4', '2', '1'],
            pestana: true,
            pestanaCasa: 1,
            nome: 'Menor'
        },
        '5_3': { // Sétima (Forma de Bb7/A7)
            cordas: [-1, 1, 3, 1, 3, 1],
            dedos: ['', '1', '3', '1', '4', '1'],
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
    
    // CORREÇÃO: Não deslocamos os valores das cordas! 
    // O diagrama vai renderizar as notas na casa 1, 2, 3 do desenho,
    // e o atributo 'casaInicial' cuidará de colocar o número correto (ex: 3) ao lado.
    const cordasAjustadas = [...formaBase.cordas]; 
    
    // Gerar nome da nota fundamental para o título
    let nomeGerado = nome;
    if (!nomeGerado || nomeGerado === sigla) {
        const notasPorCasa = {
            6: { 1: 'F', 2: 'F#', 3: 'G', 4: 'G#', 5: 'A', 6: 'A#', 7: 'B', 8: 'C', 9: 'C#', 10: 'D', 11: 'D#', 12: 'E' },
            5: { 1: 'A#', 2: 'B', 3: 'C', 4: 'C#', 5: 'D', 6: 'D#', 7: 'E', 8: 'F', 9: 'F#', 10: 'G', 11: 'G#', 12: 'A' }
        };
        const notaBase = notasPorCasa[cordaBase]?.[casa] || `${casa}ª`;
        nomeGerado = `${notaBase} ${formaBase.nome}`;
    }
    
    return {
        nome: nomeGerado,
        cordas: cordasAjustadas,
        dedos: formaBase.dedos,
        pestana: formaBase.pestana,
        pestanaCasa: formaBase.pestanaCasa,
        casaInicial: casa, // Este número indica que a "casa 1" do desenho é, na verdade, a casa X do instrumento
        cordaBase: cordaBase,
        baixo: ''
    };
}
