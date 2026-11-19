// ============================================================
// MÓDULO VIOLÃO (violao.js)
// ============================================================
(function () {
    const ACORDES_DIREITOS = {
        // Família de Dó (C)
        'C':     { nome: 'Dó Maior',      pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 0, 1, 0], dedos: [0, 3, 2, 0, 1, 0] },
        'Cm':    { nome: 'Dó Menor',      pestana: true,  casaInicial: 3, cordas: ['X', 3, 5, 5, 4, 3], dedos: [0, 1, 3, 4, 2, 1] },
        'C7':    { nome: 'Dó Dominante',  pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 3, 1, 0], dedos: [0, 3, 2, 4, 1, 0] },
        'C9':    { nome: 'Dó com Nona',   pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 0, 3, 3], dedos: [0, 2, 1, 0, 3, 4] },
        'Cmaj7': { nome: 'Dó Maior 7M',   pestana: false, casaInicial: 1, cordas: ['X', 3, 2, 0, 0, 0], dedos: [0, 3, 2, 0, 0, 0] },

        // Família de Ré (D)
        'D':     { nome: 'Ré Maior',      pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 3, 2], dedos: [0, 0, 0, 1, 3, 2] },
        'Dm':    { nome: 'Ré Menor',      pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 3, 1], dedos: [0, 0, 0, 2, 3, 1] },
        'D7':    { nome: 'Ré Dominante',  pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 1, 2], dedos: [0, 0, 0, 2, 1, 3] },
        'D9':    { nome: 'Ré com Nona',   pestana: false, casaInicial: 1, cordas: ['X', 'X', 0, 2, 1, 0], dedos: [0, 0, 0, 2, 1, 0] },

        // Família de Mi / Lá / Sol / Si
        'E':     { nome: 'Mi Maior',      pestana: false, casaInicial: 1, cordas: [0, 2, 2, 1, 0, 0], dedos: [0, 2, 3, 1, 0, 0] },
        'Em':    { nome: 'Mi Menor',      pestana: false, casaInicial: 1, cordas: [0, 2, 2, 0, 0, 0], dedos: [0, 2, 3, 0, 0, 0] },
        'F':     { nome: 'Fá Maior',      pestana: true,  casaInicial: 1, cordas: [1, 3, 3, 2, 1, 1], dedos: [1, 3, 4, 2, 1, 1] },
        'G':     { nome: 'Sol Maior',     pestana: false, casaInicial: 1, cordas: [3, 2, 0, 0, 0, 3], dedos: [2, 1, 0, 0, 0, 3] },
        'A':     { nome: 'Lá Maior',      pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 2, 2, 0], dedos: [0, 0, 1, 2, 3, 0] },
        'Am':    { nome: 'Lá Menor',      pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 2, 1, 0], dedos: [0, 0, 2, 3, 1, 0] },
        'B':     { nome: 'Si Maior',      pestana: true,  casaInicial: 2, cordas: ['X', 2, 4, 4, 4, 2], dedos: [0, 1, 2, 3, 4, 1] },
        'Bm':    { nome: 'Si Menor',      pestana: true,  casaInicial: 2, cordas: ['X', 2, 4, 4, 3, 2], dedos: [0, 1, 3, 4, 2, 1] }
    };

    const FORMAS_DINAMICAS = {
        // Corda base 6 (Mi)
        '1':  { nome: 'Maior',   cordas: [1, 3, 3, 2, 1, 1],     dedos: [1, 3, 4, 2, 1, 1], pestana: true },
        '2':  { nome: 'Menor',   cordas: [1, 3, 3, 1, 1, 1],     dedos: [1, 3, 4, 1, 1, 1], pestana: true },
        '3':  { nome: 'Sétima',  cordas: [1, 3, 1, 2, 4, 1],     dedos: [1, 3, 1, 2, 4, 1], pestana: true },
        '10': { nome: '7+',      cordas: [1, 'X', 2, 2, 1, 'X'], dedos: [1, 0, 3, 4, 2, 0], pestana: false },
        '11': { nome: 'm7',      cordas: [1, 'X', 1, 1, 1, 'X'], dedos: [1, 0, 2, 3, 4, 0], pestana: false },
        '12': { nome: 'm7(b5)',  cordas: [2, 'X', 2, 2, 1, 'X'], dedos: [2, 0, 3, 4, 1, 0], pestana: false },
        '13': { nome: '7',       cordas: [1, 'X', 1, 2, 1, 'X'], dedos: [1, 0, 2, 4, 3, 0], pestana: false },
        '14': { nome: '7+(5+)',  cordas: [1, 'X', 2, 2, 2, 'X'], dedos: [1, 0, 2, 3, 4, 0], pestana: false },
        '15': { nome: 'm7+',     cordas: [1, 'X', 2, 1, 1, 'X'], dedos: [1, 0, 2, 4, 3, 0], pestana: false },
        '16': { nome: '°7',      cordas: [2, 'X', 1, 2, 1, 'X'], dedos: [3, 0, 1, 4, 2, 0], pestana: false },

        // Corda base 5 (Lá)
        '4':  { nome: 'Maior',   cordas: ['X', 1, 3, 3, 3, 1],     dedos: [0, 1, 3, 4, 2, 1], pestana: true },
        '5':  { nome: 'Menor',   cordas: ['X', 1, 3, 3, 2, 1],     dedos: [0, 1, 3, 4, 2, 1], pestana: true },
        '6':  { nome: 'Sétima',  cordas: ['X', 1, 3, 1, 3, 1],     dedos: [0, 1, 3, 1, 4, 1], pestana: true },

        // Corda base 4 (Ré)
        '7':  { nome: 'Maior',   cordas: ['X', 'X', 1, 3, 4, 3], dedos: [0, 0, 1, 3, 4, 2], pestana: false },
        '8':  { nome: 'Menor',   cordas: ['X', 'X', 1, 3, 4, 2], dedos: [0, 0, 1, 3, 4, 2], pestana: false },
        '9':  { nome: 'Sétima',  cordas: ['X', 'X', 1, 3, 2, 3], dedos: [0, 0, 1, 3, 2, 4], pestana: false }
    };

    function resolverLinhaAcorde(linha) {
        const partes = linha.split('|').map(p => p.trim());
        const espec = partes[0];
        const labelCustom = partes[1] || '';

        // 1. Formato dinâmico: "formaId;casa" (ex: "1;5")
        if (/^\d+\s*;\s*\d+/.test(espec)) {
            const [formaId, casaRaw] = espec.split(';').map(s => s.trim());
            const casa = Math.max(1, parseInt(casaRaw, 10) || 1);
            const forma = FORMAS_DINAMICAS[formaId];
            if (!forma) return { erro: `Forma dinâmica "${formaId}" não encontrada.` };

            const cordas = forma.cordas.map(c => (c === 'X' || c === -1 || c === 0) ? c : (c + casa - 1));
            const notasBase6 = ['F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E'];
            const notasBase5 = ['A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A'];
            const idxNota = (casa - 1) % 12;
            const notaRaiz = ['4', '5', '6'].includes(formaId) ? notasBase5[idxNota] : notasBase6[idxNota];

            return {
                sigla: labelCustom || `${notaRaiz} (${forma.nome})`,
                subtitulo: `${casa}ª casa`,
                casaInicial: casa,
                pestana: Boolean(forma.pestana),
                cordas,
                dedos: [...forma.dedos]
            };
        }

        // 2. Formato inline customizado: "Nome: cordas=0,2,2,1,0,0 | dedos=0,2,3,1,0,0 | casa=1 | pestana=false"
        if (espec.includes(':')) {
            const [nomeParte, resto] = espec.split(':');
            const sigla = labelCustom || nomeParte.trim();
            const cordas = ['X', 'X', 'X', 'X', 'X', 'X'];
            const dedos = [0, 0, 0, 0, 0, 0];
            let casaInicial = 1;
            let pestana = false;

            const props = [espec, ...partes.slice(1)].join('|').split('|');
            props.forEach(token => {
                const [kRaw, vRaw] = token.split('=');
                if (!kRaw || !vRaw) return;
                const k = kRaw.trim().toLowerCase();
                const v = vRaw.trim();
                if (k === 'cordas') {
                    v.split(',').slice(0, 6).forEach((val, idx) => {
                        const t = val.trim().toUpperCase();
                        cordas[idx] = (t === 'X' || t === '-1') ? 'X' : (parseInt(t, 10) || 0);
                    });
                } else if (k === 'dedos') {
                    v.split(',').slice(0, 6).forEach((val, idx) => {
                        dedos[idx] = parseInt(val.trim(), 10) || 0;
                    });
                } else if (k === 'casa') {
                    casaInicial = Math.max(1, parseInt(v, 10) || 1);
                } else if (k === 'pestana') {
                    pestana = v.toLowerCase() === 'true';
                }
            });

            return { sigla, subtitulo: '', casaInicial, pestana, cordas, dedos };
        }

        // 3. Sigla direta do dicionário (ex: "C", "Am", "D7")
        const chave = ACORDES_DIREITOS[espec] ? espec : espec.toUpperCase();
        const base = ACORDES_DIREITOS[chave];
        if (!base) {
            return { erro: `Acorde "${espec}" não encontrado no dicionário.` };
        }

        return {
            sigla: labelCustom || chave,
            subtitulo: base.nome,
            casaInicial: base.casaInicial || 1,
            pestana: Boolean(base.pestana),
            cordas: [...base.cordas],
            dedos: [...base.dedos]
        };
    }

    function criarCanvasAcorde(cfg) {
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 185;
        canvas.className = 'violao-canvas';

        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Título da cifra
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 18px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(cfg.sigla, 75, 24);

        const xInicial = 30;
        const yInicial = 52;
        const espCordas = 18;
        const espTrastes = 24;
        const numTrastes = 4;
        const casaInicial = cfg.casaInicial || 1;

        // Número da casa inicial quando > 1
        if (casaInicial > 1) {
            ctx.fillStyle = '#475569';
            ctx.font = 'bold 12px Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${casaInicial}ª`, xInicial - 8, yInicial + espTrastes / 2 + 4);
        }

        // Casas (linhas horizontais)
        ctx.strokeStyle = '#475569';
        for (let i = 0; i <= numTrastes; i++) {
            ctx.lineWidth = (i === 0 && casaInicial === 1) ? 4 : 1.5;
            ctx.beginPath();
            ctx.moveTo(xInicial, yInicial + i * espTrastes);
            ctx.lineTo(xInicial + 5 * espCordas, yInicial + i * espTrastes);
            ctx.stroke();
        }

        // Cordas (linhas verticais)
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(xInicial + i * espCordas, yInicial);
            ctx.lineTo(xInicial + i * espCordas, yInicial + numTrastes * espTrastes);
            ctx.stroke();
        }

        // Marcadores superiores: X (não toca) e O (corda solta)
        cfg.cordas.forEach((status, idx) => {
            const x = xInicial + idx * espCordas;
            ctx.font = 'bold 11px Arial, sans-serif';
            ctx.textAlign = 'center';
            if (status === 'X' || status === -1) {
                ctx.fillStyle = '#dc2626';
                ctx.fillText('X', x, yInicial - 7);
            } else if (status === 0) {
                ctx.fillStyle = '#16a34a';
                ctx.fillText('O', x, yInicial - 7);
            }
        });

        // Pestana
        let casaPestanaRelativa = null;
        if (cfg.pestana) {
            const casasPositivas = cfg.cordas.filter(c => typeof c === 'number' && c > 0);
            if (casasPositivas.length > 0) {
                const menorCasa = Math.min(...casasPositivas);
                casaPestanaRelativa = menorCasa - casaInicial + 1;
                if (casaPestanaRelativa >= 1 && casaPestanaRelativa <= numTrastes) {
                    const cordasNaPestana = cfg.cordas
                        .map((c, idx) => (c === menorCasa ? idx : -1))
                        .filter(idx => idx !== -1);
                    if (cordasNaPestana.length >= 2) {
                        const xIni = xInicial + Math.min(...cordasNaPestana) * espCordas;
                        const xFim = xInicial + Math.max(...cordasNaPestana) * espCordas;
                        const yPest = yInicial + (casaPestanaRelativa - 0.5) * espTrastes;

                        ctx.strokeStyle = '#1e293b';
                        ctx.lineWidth = 10;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.moveTo(xIni, yPest);
                        ctx.lineTo(xFim, yPest);
                        ctx.stroke();
                        ctx.lineWidth = 1.5;
                    }
                }
            }
        }

        // Bolinhas dos dedos
        cfg.cordas.forEach((status, idx) => {
            if (typeof status !== 'number' || status <= 0) return;
            const casaRel = status - casaInicial + 1;
            if (casaRel < 1 || casaRel > numTrastes) return;
            if (cfg.pestana && casaRel === casaPestanaRelativa) return;

            const x = xInicial + idx * espCordas;
            const y = yInicial + (casaRel - 0.5) * espTrastes;

            ctx.fillStyle = '#2563eb';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();

            const dedo = cfg.dedos && cfg.dedos[idx] ? cfg.dedos[idx] : 0;
            if (dedo > 0) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 11px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(String(dedo), x, y);
            }
        });

        return canvas;
    }

    window.ViolaoModule = {
        render(rawInner) {
            const linhas = String(rawInner || '')
                .split(/\r?\n/)
                .map(l => l.trim())
                .filter(Boolean);

            const block = document.createElement('div');
            block.className = 'violao-block';

            const header = document.createElement('div');
            header.className = 'violao-header';
            header.textContent = '🎸 Diagramas de Violão';
            block.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'violao-grid';

            linhas.forEach((linha) => {
                const res = resolverLinhaAcorde(linha);
                const card = document.createElement('div');
                card.className = 'violao-card';

                if (res.erro) {
                    card.innerHTML = `<span class="error">${res.erro}</span>`;
                } else {
                    card.appendChild(criarCanvasAcorde(res));
                    if (res.subtitulo) {
                        const sub = document.createElement('div');
                        sub.className = 'violao-subtitulo';
                        sub.textContent = res.subtitulo;
                        card.appendChild(sub);
                    }
                }

                grid.appendChild(card);
            });

            block.appendChild(grid);
            return block;
        }
    };
})();
