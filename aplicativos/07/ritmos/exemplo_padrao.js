// ritmos/exemplo_padrao.js - Exemplo de ritmo com padrão ABC fornecido
(() => {
    const estilo = {
        categoria: "Exemplo",
        subcategoria: "Padrão",
        variacoes: {
            "Básico": {
                metro: "4/4",
                // RH: silêncio no 1º tempo, acorde nos 2º, 3º e 4º
                desenhoRh: "z [{RH}] [{RH}] [{RH}]",
                // LH: tônica no 1º tempo, silêncio nos demais
                desenhoLh: "{LH} z z z"
            },
            "Variação Baixo": {
                metro: "4/4",
                // RH: mesmo padrão
                desenhoRh: "z [{RH}] [{RH}] [{RH}]",
                // LH: tônica no 1º e 4º tempos (oitava)
                desenhoLh: "{LH} z z {LH}"
            }
        }
    };

    // Registra no banco global (se disponível)
    if (typeof REGISTRO_RITMOS !== 'undefined') {
        REGISTRO_RITMOS.registrar(estilo);
    }
})();

