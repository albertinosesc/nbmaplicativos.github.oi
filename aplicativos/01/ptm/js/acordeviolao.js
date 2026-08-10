// =========================================================================
// acordeviolao.js - MOTOR COMPLETO DE MAPEAMENTO E RENDERIZAÇÃO DE ACORDES
// PRESERVAÇÃO INTEGRAL DE DICIONÁRIO DE POSIÇÕES E REGRAS VISUAIS
// =========================================================================

const DICIONARIO_ACORDES_MESTRE = {
    // Família de Dó (C)
    "C":   { nome: "Dó Maior",     pestana: false, trasteIncap: 0, cordas: ["X", 3, 2, 0, 1, 0], dedos: [0, 3, 2, 0, 1, 0] },
    "Cm":  { nome: "Dó Menor",     pestana: true,  trasteIncap: 3, cordas: ["X", 1, 3, 3, 2, 1], dedos: [0, 1, 3, 4, 2, 1] },
    "C7":  { nome: "Dó Dominante", pestana: false, trasteIncap: 0, cordas: ["X", 3, 2, 3, 1, 0], dedos: [0, 3, 2, 4, 1, 0] },
    "C9":  { nome: "Dó com Nona",  pestana: false, trasteIncap: 0, cordas: ["X", 3, 2, 0, 3, 3], dedos: [0, 2, 1, 0, 3, 4] },
    "Cmaj7":{ nome: "Dó Maior 7M", pestana: false, trasteIncap: 0, cordas: ["X", 3, 2, 0, 0, 0], dedos: [0, 3, 2, 0, 0, 0] },
    
    // Família de Ré (D)
    "D":   { nome: "Ré Maior",     pestana: false, trasteIncap: 0, cordas: ["X", "X", 0, 2, 3, 2], dedos: [0, 0, 0, 1, 3, 2] },
    "Dm":  { nome: "Ré Menor",     pestana: false, trasteIncap: 0, cordas: ["X", "X", 0, 2, 3, 1], dedos: [0, 0, 0, 2, 3, 1] },
    "D7":  { nome: "Ré Dominante", pestana: false, trasteIncap: 0, cordas: ["X", "X", 0, 2, 1, 2], dedos: [0, 0, 0, 2, 1, 3] },
    "D9":  { nome: "Ré com Nona",  pestana: false, trasteIncap: 0, cordas: ["X", "X", 0, 2, 1, 0], dedos: [0, 0, 0, 2, 1, 0] },
    
    // Família de Mi (E)
    "E":   { nome: "Mi Maior",     pestana: false, trasteIncap: 0, cordas: [0, 2, 3, 1, 0, 0], dedos: [0, 2, 3, 1, 0, 0] },
    "Em":  { nome: "Mi Menor",     pestana: false, trasteIncap: 0, cordas: [0, 2, 3, 0, 0, 0], dedos: [0, 2, 3, 0, 0, 0] },
    "E7":  { nome: "Mi Dominante", pestana: false, trasteIncap: 0, cordas: [0, 2, 0, 1, 0, 0], dedos: [0, 2, 0, 1, 0, 0] },
    
    // Família de Fá (F)
    "F":   { nome: "Fá Maior",     pestana: true,  trasteIncap: 1, cordas: [1, 3, 3, 2, 1, 1], dedos: [1, 3, 4, 2, 1, 1] },
    "Fm":  { nome: "Fá Menor",     pestana: true,  trasteIncap: 1, cordas: [1, 3, 3, 1, 1, 1], dedos: [1, 3, 4, 1, 1, 1] },
    "F7":  { nome: "Fá Dominante", pestana: true,  trasteIncap: 1, cordas: [1, 3, 1, 2, 1, 1], dedos: [1, 3, 1, 2, 1, 1] },
    
    // Família de Sol (G)
    "G":   { nome: "Sol Maior",    pestana: false, trasteIncap: 0, cordas: [3, 2, 0, 0, 0, 3], dedos: [3, 2, 0, 0, 0, 4] },
    "Gm":  { nome: "Sol Menor",    pestana: true,  trasteIncap: 3, cordas: [1, 3, 3, 1, 1, 1], dedos: [1, 3, 4, 1, 1, 1] },
    "G7":  { nome: "Sol Dominante", pestana: false, trasteIncap: 0, cordas: [3, 2, 0, 0, 0, 1], dedos: [3, 2, 0, 0, 0, 1] },
    
    // Família de Lá (A)
    "A":   { nome: "Lá Maior",     pestana: false, trasteIncap: 0, cordas: ["X", 0, 2, 2, 2, 0], dedos: [0, 0, 1, 2, 3, 0] },
    "Am":  { nome: "Lá Menor",     pestana: false, trasteIncap: 0, cordas: ["X", 0, 2, 2, 1, 0], dedos: [0, 0, 2, 3, 1, 0] },
    "A7":  { nome: "Lá Dominante", pestana: false, trasteIncap: 0, cordas: ["X", 0, 2, 0, 2, 0], dedos: [0, 0, 1, 0, 2, 0] },
    
    // Família de Si (B)
    "B":   { nome: "Si Maior",     pestana: true,  trasteIncap: 2, cordas: ["X", 1, 3, 3, 3, 1], dedos: [0, 1, 2, 3, 4, 1] },
    "Bm":  { nome: "Si Menor",     pestana: true,  trasteIncap: 2, cordas: ["X", 1, 3, 3, 2, 1], dedos: [0, 1, 3, 4, 2, 1] }
};

function renderizarAcordes(containerAlvo = document) {
    const elementos = containerAlvo.querySelectorAll('.acorde-chart, [data-chord]');

    elementos.forEach(el => {
        if (el.hasAttribute('data-renderizado-ok')) return;

        let tokenAcorde = el.getAttribute('data-chord') || el.textContent.trim();
        tokenAcorde = tokenAcorde.replace(/\[|\]/g, '').trim(); 
        
        if (!tokenAcorde) return;

        const configuracao = DICIONARIO_ACORDES_MESTRE[tokenAcorde] || DICIONARIO_ACORDES_MESTRE[tokenAcorde.toUpperCase()];
        
        // Se o acorde não existir no mapa de dados mestre, interrompe a quebra de layout
        if (!configuracao) return;

        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 180;
        canvas.style.width = "150px";
        canvas.style.height = "180px";
        canvas.className = "canvas-acorde-renderizado";
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        el.textContent = '';
        el.appendChild(canvas);
        el.setAttribute('data-renderizado-ok', 'true');

        // Renderização Gráfica Avançada do Canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Título/Cifra do Acorde
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 20px Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(tokenAcorde, 75, 25);

        // Configuração de Margens e Escalas da Grade
        const xInicial = 25;
        const yInicial = 50;
        const espacamentoCordas = 20; // Total 5 espaços para 6 cordas = 100px
        const espacamentoTrastes = 24; // Total 4 espaços = 96px
        const numTrastes = 4;

        // Desenha Número do Traste de Referência (Se houver Pestana móvel fora do traste 1)
        if (configuracao.trasteIncap > 1 && configuracao.pestana) {
            ctx.fillStyle = '#64748b';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${configuracao.trasteIncap}º`, xInicial - 6, yInicial + 16);
        }

        // Desenha Trastes (Linhas Horizontais)
        ctx.strokeStyle = '#475569';
        for (let i = 0; i <= numTrastes; i++) {
            ctx.lineWidth = (i === 0 && configuracao.trasteIncap <= 1) ? 4 : 1.5;
            ctx.beginPath();
            ctx.moveTo(xInicial, yInicial + (i * espacamentoTrastes));
            ctx.lineTo(xInicial + (5 * espacamentoCordas), yInicial + (i * espacamentoTrastes));
            ctx.stroke();
        }

        // Desenha Cordas (Linhas Verticais)
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(xInicial + (i * espacamentoCordas), yInicial);
            ctx.lineTo(xInicial + (i * espacamentoCordas), yInicial + (numTrastes * espacamentoTrastes));
            ctx.stroke();
        }

        // Desenha Marcadores de topo (Cordas Soltas "O" ou Não Tocadas "X")
        configuracao.cordas.forEach((status, indiceCorda) => {
            let posX = xInicial + (indiceCorda * espacamentoCordas);
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            
            if (status === "X") {
                ctx.fillStyle = '#ef4444';
                ctx.fillText("X", posX, yInicial - 6);
            } else if (status === 0) {
                ctx.fillStyle = '#22c55e';
                ctx.fillText("O", posX, yInicial - 6);
            }
        });

        // Desenha Pestana (Se configurado na var mestre)
        if (configuracao.pestana) {
            let trasteDesenho = configuracao.trasteIncap > 1 ? 1 : configuracao.trasteIncap;
            let yPestana = yInicial + (trasteDesenho * espacamentoTrastes) - (espacamentoTrastes / 2);
            
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.beginPath();
            
            // Encontra a primeira corda que não seja 'X' para deitar a pestana
            let primeiraCordaValida = configuracao.cordas.findIndex(c => c !== "X");
            let xStart = xInicial + (primeiraCordaValida * espacamentoCordas);
            let xEnd = xInicial + (5 * espacamentoCordas);
            
            ctx.moveTo(xStart, yPestana);
            ctx.lineTo(xEnd, yPestana);
            ctx.stroke();
            ctx.lineWidth = 1.5; // Restaura linha padrão
        }

        // Desenha Bolinhas das Posições dos Dedos
        configuracao.cordas.forEach((status, indiceCorda) => {
            if (status !== "X" && status > 0) {
                // Se for pestana, pula o desenho do dedo individual se ele bater no traste base da pestana
                if (configuracao.pestana && status === configuracao.trasteIncap) {
                    // Desenha apenas o número do dedo se for diferente de 1 na casa da pestana
                    return;
                }

                let casaRelativa = configuracao.trasteIncap > 1 ? (status - configuracao.trasteIncap + 1) : status;
                let posX = xInicial + (indiceCorda * espacamentoCordas);
                let posY = yInicial + (casaRelativa * espacamentoTrastes) - (espacamentoTrastes / 2);

                // Desenha Círculo do Dedo
                ctx.fillStyle = '#2563eb';
                ctx.beginPath();
                ctx.arc(posX, posY, 8, 0, 2 * Math.PI);
                ctx.fill();

                // Número do Dedo Interno
                let numeroDedo = configuracao.dedos[indiceCorda];
                if (numeroDedo > 0) {
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 11px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(numeroDedo, posX, posY);
                }
            }
        });
    });
}
