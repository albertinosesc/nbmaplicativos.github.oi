// ============================================
// DADOS PADRÃO
// ============================================

function obterDadosPadrao() {
    return {
        listas: [
            {
                nome: "Piano",
                cards: [
                    { texto: "Escala de Dó Maior", conteudo: "# Escala de Dó Maior\n\n[PIANO:C]Dó Maior[/PIANO]\n\n[ABC]\nX:1\nM:4/4\nL:1/8\nK:C\nC DEF | GAB c |]\n[/ABC]", ultimaModificacao: Date.now() },
                    { texto: "Acordes Básicos", conteudo: "# Acordes Básicos\n\n[PIANO:C]Dó Maior[/PIANO]\n[PIANO:G]Sol Maior[/PIANO]\n[PIANO:Am]Lá Menor[/PIANO]", ultimaModificacao: Date.now() }
                ],
                sublistas: [
                    {
                        nome: "Exercícios",
                        cards: [
                            { texto: "Hanon 1", conteudo: "# Hanon 1\n\nExercício para dedos.", ultimaModificacao: Date.now() }
                        ],
                        sublistas: []
                    }
                ]
            },
            {
                nome: "Violão",
                cards: [
                    { texto: "Acordes Iniciantes", conteudo: "# Acordes Iniciantes\n\n[Acorde:C]Dó Maior[/Acorde]\n[Acorde:G]Sol Maior[/Acorde]\n[Acorde:Am]Lá Menor[/Acorde]", ultimaModificacao: Date.now() }
                ],
                sublistas: []
            },
            {
                nome: "Teoria Musical",
                cards: [
                    { texto: "Partitura Infantil", conteudo: "# Partitura Colorida\n\n[ABC-INFANTIL]\nX:1\nM:4/4\nL:1/4\nK:C\nC DEF | GAB c |]\nw: Dó Ré Mi Fá Sol Lá Si Dó\n[/ABC-INFANTIL]", ultimaModificacao: Date.now() }
                ],
                sublistas: []
            }
        ]
    };
}

console.log('✅ Dados padrão carregados');
