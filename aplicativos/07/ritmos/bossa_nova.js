// ritmos/bossa_nova.js - 9 Variações (com espaços, legível)
(() => {
    const estilo = {
        categoria: "Bossa Nova",
        subcategoria: "Bossa Nova",
        variacoes: {
            "Variação 1": {
                metro: "2/4",
                compassos: [
                    { desenhoRh: "[{RH}]/[{RH}]/ z/ <[{RH}]/", desenhoLh: "{LH} {LH}" }
                ]
            },
            "Variação 2": {
                metro: "2/4",
                compassos: [
                    { desenhoRh: "[{RH}]/[{RH}]/ z/ <[{RH}]/", desenhoLh: "{LH} {LH}/>{LH}/" }
                ]
            },
            "Variação 3": {
                metro: "2/4",
                compassos: [
                    { desenhoRh: "[{RH}]/[{RH}]/ z/ <[{RH}]/", desenhoLh: "{LH} {LH5}/>{LH5}/" },
                    { desenhoRh: "[{RH}]/[{RH}]/ z/ <[{RH}]/", desenhoLh: "{LH} {LH5,}/>{LH5,}/" }
                ]
            },
            "Variação 4": {
                metro: "2/4",
                compassos: [
                    { desenhoRh: "[{RH}]/[{RH}]/ z/ <[{RH}]/", desenhoLh: "{LH}/>{LH}/ {LH5}/>{LH5}/" },
                    { desenhoRh: "[{RH}]/[{RH}]/ z/ <[{RH}]/", desenhoLh: "{LH}/>{LH}/ {LH5}/>{LH5}/" }
                ]
            },
            "Variação 5": {
                metro: "2/4",
                compassos: [
                    { desenhoRh: "[{RH}]/[{RH}]/ z/ <[{RH}]/", desenhoLh: "{LH}/>{LH}/ {LH5}/>{LH5}/" },
                    { desenhoRh: "[{RH}]/[{RH}]/ z/ <[{RH}]/", desenhoLh: "{LH}/>{LH}/ {LH5}/>{LH5}/" }
                ]
            },
            "Variação 6": {
                metro: "2/4",
                compassos: [
                    { desenhoRh: "[{RH}]/[{RH}]/ z/ <[{RH}]/", desenhoLh: "{LH}/>{LH}/ {LH5}/>{LH5}/" },
                    { desenhoRh: "[{RH}]/[{RH}]/ z/ <[{RH}]/", desenhoLh: "{LH}/>{LH}/ {LH5}/{LH5}/" }
                ]
            },
            "Variação 7": {
                metro: "2/4",
                compassos: [
                    { desenhoRh: "[{RH}]/[{RH}]//[{RH}]// -[{RH}]//[{RH}]/[{RH}]// -", desenhoLh: "{LH} {LH}" },
                    { desenhoRh: "[{RH}]//[{RH}]/[{RH}]//  [{RH}]/[{RH}]/", desenhoLh: "{LH} {LH}" }
                ]
            },
             "Variação 8": {
                metro: "2/4",
                compassos: [
                    { desenhoRh: "[{RH}]// z/[{RH}]// z/[{RH}]// z//", desenhoLh: "{LH} {LH5}" },
                    { desenhoRh: "z/[{RH}]// z// z//[{RH}]//z/", desenhoLh: "{LH} {LH5}" }
                ]
            },
            "Variação 9": {
                metro: "2/4",
                compassos: [
                    { desenhoRh: "[{RH}]/[{RH}]/ z//[{RH}]/[{RH}]//", desenhoLh: "{LH}/>{LH}/ {LH5}" },
                    { desenhoRh: "z/>[{RH}]/ -[{RH}]/<[{RH}]/", desenhoLh: "{LH} {LH5}" },
                    { desenhoRh: "[{RH}]/[{RH}]/ z//[{RH}]/[{RH}]// -", desenhoLh: "{LH}/>{LH}/ {LH5}" },
                    { desenhoRh: "[{RH}] z/ <[{RH}]/", desenhoLh: "{LH} {LH5}" }
                ]
            }
        }
    };

    if (typeof REGISTRO_RITMOS !== 'undefined') {
        REGISTRO_RITMOS.registrar(estilo);
    }
})();