// ritmos/jazz_all.js
(() => {
    // ==========================================
    // 1. ESTILO: SOLO PIANO JAZZ BALLAD (j1 a j7)
    // ==========================================
    REGISTRO_RITMOS.registrar({
        categoria: "Jazz 20",
        subcategoria: "Jazz",
        style: "Solo Piano Jazz Ballad",
        variacoes: {
            "Ballad 1": {
                alias: "j1",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "[{RH}]2 {RH_G}2 [{RH}]4", desenhoLh: "{LH}4 {LH5}3 {LH5}" }]
            },
            "Ballad 2": {
                alias: "j2",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "{RH1}{RH3}{RH5}[{RH}]- [{RH}]2 [{RH}]2", desenhoLh: "{LH}4 {LH5}2 z2" }]
            },
            "Ballad 3": {
                alias: "j3",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "[{RH}]3 [{RH}]- [{RH}] {RH_A}2 {RH_G}", desenhoLh: "[{LH}]4 {LH}4" }]
            },
            "Ballad 4": {
                alias: "j4",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "[{RH}]3 [{RH}]- [{RH}] {RH_G} {RH_G}2", desenhoLh: "{LH}4 {LH}4" }]
            },
            "Ballad 5": {
                alias: "j5",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "[{RH}]3 [{RH}]- [{RH}][{RH}] z2", desenhoLh: "[{LH}]4 {LH}3 [{LH}]" }]
            },
            "Ballad 6": {
                alias: "j6",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "[{RH}]4 (3[{RH}] {RH_A} [{RH}] (3:2:2 {RH_G} [{RH}]2", desenhoLh: "[{LH}]3 {LH} {LH}{LH5} z2" }]
            },
            "Ballad 7": {
                alias: "j7",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "(3 {RH}- {RH}2 {RH}/{RH}/{RH}/{RH}/ (3z {RH_G} {RH_A}", desenhoLh: "(3:2:2 {LH} {LH}2 {LH}/{LH}/{LH}/{LH}/- {LH}2 z2" }]
            }
        }
    });

    // ==========================================
    // 2. ESTILO: SOLO SHOWTUNE PIANO (j8 a j13)
    // ==========================================
    REGISTRO_RITMOS.registrar({
        categoria: "Jazz 20",
        subcategoria: "Jazz",
        style: "Solo Showtune Piano",
        variacoes: {
            "Showtune 1": {
                alias: "j8", // Continua a sequência aqui
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "z2 [{RH}]4 [{RH}]2", desenhoLh: "[{LH}]4 {LH5}2 z2" }]
            },
            "Showtune 2": {
                alias: "j9",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "z2 [{RH}][{RH}]- [{RH}]2 {RH1}2", desenhoLh: "[{LH}]4 {LH5}2 {LH5}2" }]
            },
            "Showtune 3": {
                alias: "j10",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "{RH_A}2 [{RH}]4 [{RH}]2", desenhoLh: "{LH}4 {LH5}4" }]
            },
            "Showtune 4": {
                alias: "j11",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "z {RH3} (3:2:2{RH5} {RH_A}2 [{RH}]2 [{RH}]2", desenhoLh: "{LH}4 {LH5}2 z2" }]
            },
            "Showtune 5": {
                alias: "j12",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "z2 [{RH}]4 [{RH}]2", desenhoLh: "{LH}2 {LH5}2 {LH5}2 {LH5}2" }]
            },
            "Showtune 6": {
                alias: "j13",
                metro: "4/4",
                duracao: "1/8",
                compassos: [{ desenhoRh: "z2 [{RH}]2 [{RH}]2 z2", desenhoLh: "[{LH}]2 {LH5}2 {LH}2 z2" }]
            }
        }
    });
})();