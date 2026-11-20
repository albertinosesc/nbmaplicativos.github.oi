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
        'F#m':   { nome: 'Fá# Menor',     pestana: true,  casaInicial: 2, cordas: [2, 4, 4, 2, 2, 2], dedos: [1, 3, 4, 1, 1, 1] },
        'G':     { nome: 'Sol Maior',     pestana: false, casaInicial: 1, cordas: [3, 2, 0, 0, 0, 3], dedos: [2, 1, 0, 0, 0, 3] },
        'A':     { nome: 'Lá Maior',      pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 2, 2, 0], dedos: [0, 0, 1, 2, 3, 0] },
        'Am':    { nome: 'Lá Menor',      pestana: false, casaInicial: 1, cordas: ['X', 0, 2, 2, 1, 0], dedos: [0, 0, 2, 3, 1, 0] },
        'B':     { nome: 'Si Maior',      pestana: true,  casaInicial: 2, cordas: ['X', 2, 4, 4, 4, 2], dedos: [0, 1, 2, 3, 4, 1] },
        'Bm':    { nome: 'Si Menor',      pestana: true,  casaInicial: 2, cordas: ['X', 2, 4, 4, 3, 2], dedos: [0, 1, 3, 4, 2, 1] }
    };

    const FORMAS_DINAMICAS = {
        // Corda base 6 (Mi)
        '1':  { nome: '',        cordas: [1, 3, 3, 2, 1, 1],     dedos: [1, 3, 4, 2, 1, 1], pestana: true },
        '2':  { nome: 'm',       cordas: [1, 3, 3, 1, 1, 1],     dedos: [1, 3, 4, 1, 1, 1], pestana: true },
        '3':  { nome: '7',       cordas: [1, 3, 1, 2, 4, 1],     dedos: [1, 3, 1, 2, 4, 1], pestana: true },
        '10': { nome: '7+',      cordas: [1, 'X', 2, 2, 1, 'X'], dedos: [1, 0, 3, 4, 2, 0], pestana: false },
        '11': { nome: 'm7',      cordas: [1, 'X', 1, 1, 1, 'X'], dedos: [1, 0, 2, 3, 4, 0], pestana: false },
        '12': { nome: 'm7(b5)',  cordas: [2, 'X', 2, 2, 1, 'X'], dedos: [2, 0, 3, 4, 1, 0], pestana: false },
        '13': { nome: '7',       cordas: [1, 'X', 1, 2, 1, 'X'], dedos: [1, 0, 2, 4, 3, 0], pestana: false },
        '14': { nome: '7+(5+)',  cordas: [1, 'X', 2, 2, 2, 'X'], dedos: [1, 0, 2, 3, 4, 0], pestana: false },
        '15': { nome: 'm7+',     cordas: [1, 'X', 2, 1, 1, 'X'], dedos: [1, 0, 2, 4, 3, 0], pestana: false },
        '16': { nome: '°7',      cordas: [2, 'X', 1, 2, 1, 'X'], dedos: [3, 0, 1, 4, 2, 0], pestana: false },

        // Corda base 5 (Lá)
        '4':  { nome: '',        cordas: ['X', 1, 3, 3, 3, 1],     dedos: [0, 1, 3, 4, 2, 1], pestana: true },
        '5':  { nome: 'm',       cordas: ['X', 1, 3, 3, 2, 1],     dedos: [0, 1, 3, 4, 2, 1], pestana: true },
        '6':  { nome: '7',       cordas: ['X', 1, 3, 1, 3, 1],     dedos: [0, 1, 3, 1, 4, 1], pestana: true },

        // Corda base 4 (Ré)
        '7':  { nome: '',        cordas: ['X', 'X', 1, 3, 4, 3], dedos: [0, 0, 1, 3, 4, 2], pestana: false },
        '8':  { nome: 'm',       cordas: ['X', 'X', 1, 3, 4, 2], dedos: [0, 0, 1, 3, 4, 2], pestana: false },
        '9':  { nome: '7',       cordas: ['X', 'X', 1, 3, 2, 3], dedos: [0, 0, 1, 3, 2, 4], pestana: false }
    };

    function parseEstiloViolao(rawEstilo) {
        const cfg = {
            cifraX: null,
            cifraY: 24,
            cifraCor: '#1e293b',
            cifraTamanho: 18,
            cifraFonte: 'Arial, sans-serif',
            cifraAlinhar: 'branco', // 'branco' (centro das 6 cordas), 'canvas' (centro do canvas), 'esquerda', 'direita'
            xInicial: 32,
            yInicial: 52
        };

        if (!rawEstilo) return cfg;

        // Aceita tanto "[VIOLAO style: cifra-y=20, cifra-cor=#b91c1c]" quanto "[VIOLAO style='...']"
        const limpo = String(rawEstilo)
            .replace(/^\[VIOLAO\s+style\s*[:=]\s*/i, '')
            .replace(/\]$/, '')
            .trim()
            .replace(/^["']|["']$/g, '');

        const partes = limpo.split(/[;,]/).map(p => p.trim()).filter(Boolean);
        partes.forEach((parte) => {
            const idx = parte.indexOf(':');
            const sepIdx = idx !== -1 ? idx : parte.indexOf('=');
            if (sepIdx === -1) return;

            const chave = parte.slice(0, sepIdx).trim().toLowerCase().replace(/\s+/g, '-');
            const valor = parte.slice(sepIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!valor || /[<>{}]/.test(valor)) return;

            if (chave === 'cifra-x' || chave === 'x-cifra' || chave === 'acorde-x') {
                const num = parseFloat(valor);
                if (!Number.isNaN(num)) cfg.cifraX = num;
            } else if (chave === 'cifra-y' || chave === 'y-cifra' || chave === 'acorde-y') {
                const num = parseFloat(valor);
                if (!Number.isNaN(num)) cfg.cifraY = num;
            } else if (chave === 'cifra-cor' || chave === 'color' || chave === 'cor') {
                cfg.cifraCor = valor;
            } else if (chave === 'cifra-tamanho' || chave === 'font-size' || chave === 'tamanho') {
                const num = parseFloat(valor);
                if (!Number.isNaN(num) && num > 0) cfg.cifraTamanho = num;
            } else if (chave === 'cifra-fonte' || chave === 'font-family' || chave === 'fonte') {
                cfg.cifraFonte = valor;
            } else if (chave === 'cifra-alinhar' || chave === 'alinhar' || chave === 'align') {
                const v = valor.toLowerCase();
                if (['branco', 'cordas', 'canvas', 'centro', 'esquerda', 'direita'].includes(v)) {
                    cfg.cifraAlinhar = v === 'centro' ? 'canvas' : (v === 'cordas' ? 'branco' : v);
                }
            } else if (chave === 'x-inicial' || chave === 'braço-x' || chave === 'braco-x') {
                const num = parseFloat(valor);
                if (!Number.isNaN(num)) cfg.xInicial = num;
            } else if (chave === 'y-inicial' || chave === 'braço-y' || chave === 'braco-y') {
                const num = parseFloat(valor);
                if (!Number.isNaN(num)) cfg.yInicial = num;
            }
        });

        return cfg;
    }

    function resolverLinhaAcorde(linha) {
        const partes = linha.split('|').map(p => p.trim()).filter(Boolean);
        const espec = partes[0] || '';
        const labelCustom = partes.find(p => !p.includes('=') && p !== espec) || '';

        // 1. Formato dinâmico: "formaId;casa" (ex: "3;5")
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
            const sufixo = forma.nome ? `${forma.nome}` : '';

            return {
                sigla: labelCustom || `${notaRaiz}${sufixo}`,
                casaInicial: casa,
                pestana: Boolean(forma.pestana),
                cordas,
                dedos: [...forma.dedos]
            };
        }

        // 2. Formato inline customizado: "F#m: cordas=2,4,4,2,2,2 | dedos=1,3,4,1,1,1 | casa=2 | pestana=true"
        if (espec.includes(':')) {
            const idxDoisPontos = espec.indexOf(':');
            const nomeAcorde = espec.slice(0, idxDoisPontos).trim();
            const primeiroParam = espec.slice(idxDoisPontos + 1).trim();

            const sigla = labelCustom || nomeAcorde;
            const cordas = ['X', 'X', 'X', 'X', 'X', 'X'];
            const dedos = [0, 0, 0, 0, 0, 0];
            let casaInicial = 1;
            let pestana = false;

            const todosParams = [primeiroParam, ...partes.slice(1)];
            todosParams.forEach(token => {
                const idxIgual = token.indexOf('=');
                if (idxIgual === -1) return;

                const k = token.slice(0, idxIgual).trim().toLowerCase();
                const v = token.slice(idxIgual + 1).trim();

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

            return { sigla, casaInicial, pestana, cordas, dedos };
        }

        // 3. Sigla direta do dicionário (ex: "C", "Am", "D7", "F#m")
        const chave = ACORDES_DIREITOS[espec]
            ? espec
            : Object.keys(ACORDES_DIREITOS).find(k => k.toLowerCase() === espec.toLowerCase());

        const base = chave ? ACORDES_DIREITOS[chave] : null;
        if (!base) {
            return { erro: `Acorde "${espec}" não encontrado no dicionário.` };
        }

        return {
            sigla: labelCustom || chave,
            casaInicial: base.casaInicial || 1,
            pestana: Boolean(base.pestana),
            cordas: [...base.cordas],
            dedos: [...base.dedos]
        };
    }

    function criarCanvasAcorde(cfg, estiloCfg) {
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 170;
        canvas.className = 'violao-canvas';

        const ctx = canvas.getContext('2d');
        if (!ctx) return canvas;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const xInicial = estiloCfg.xInicial;
        const yInicial = estiloCfg.yInicial;
        const espCordas = 18;
        const espTrastes = 24;
        const numTrastes = 4;
        const casaInicial = cfg.casaInicial || 1;
        const centroBracoX = xInicial + (2.5 * espCordas);

        // Posição e alinhamento da cifra em relação ao diagrama
        let cifraX = estiloCfg.cifraX;
        let cifraAlign = 'center';

        if (cifraX === null) {
            if (estiloCfg.cifraAlinhar === 'canvas') {
                cifraX = canvas.width / 2;
                cifraAlign = 'center';
            } else if (estiloCfg.cifraAlinhar === 'esquerda') {
                cifraX = xInicial;
                cifraAlign = 'left';
            } else if (estiloCfg.cifraAlinhar === 'direita') {
                cifraX = xInicial + (5 * espCordas);
                cifraAlign = 'right';
            } else {
                // 'branco': centraliza exatamente sobre as 6 cordas do diagrama
                cifraX = centroBracoX;
                cifraAlign = 'center';
            }
        }

        // Desenho da cifra
        ctx.fillStyle = estiloCfg.cifraCor;
        ctx.font = `bold ${estiloCfg.cifraTamanho}px ${estiloCfg.cifraFonte}`;
        ctx.textAlign = cifraAlign;
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(cfg.sigla, cifraX, estiloCfg.cifraY);

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
        let menorCasaPestana = null;
        if (cfg.pestana) {
            const casasPositivas = cfg.cordas.filter(c => typeof c === 'number' && c > 0);
            if (casasPositivas.length > 0) {
                menorCasaPestana = Math.min(...casasPositivas);
                const casaPestanaRelativa = menorCasaPestana - casaInicial + 1;
                if (casaPestanaRelativa >= 1 && casaPestanaRelativa <= numTrastes) {
                    const cordasNaPestana = cfg.cordas
                        .map((c, idx) => (c === menorCasaPestana ? idx : -1))
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

            const dedo = cfg.dedos && cfg.dedos[idx] ? cfg.dedos[idx] : 0;
            const fazParteDaPestana = cfg.pestana && status === menorCasaPestana && (!dedo || dedo === 1);
            if (fazParteDaPestana) return;

            const x = xInicial + idx * espCordas;
            const y = yInicial + (casaRel - 0.5) * espTrastes;

            ctx.fillStyle = '#2563eb';
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();

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
        render(rawInner, fullMatch = '') {
            const textoBruto = String(rawInner || '');
            let estiloRaw = '';

            // Permite [VIOLAO style: ...] tanto em fullMatch quanto na primeira linha caso venha colado
            const matchTag = String(fullMatch || '').match(/^\[VIOLAO\s+style\s*[:=]\s*([^\]]+)\]/i);
            if (matchTag) {
                estiloRaw = matchTag[1];
            }

            const linhas = textoBruto
                .split(/\r?\n/)
                .map(l => l.trim())
                .filter((l) => {
                    if (!l) return false;
                    const matchLinhaEstilo = l.match(/^style\s*[:=]\s*(.+)$/i);
                    if (matchLinhaEstilo) {
                        estiloRaw = matchLinhaEstilo[1];
                        return false;
                    }
                    return true;
                });

            const estiloCfg = parseEstiloViolao(estiloRaw);

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
                    card.appendChild(criarCanvasAcorde(res, estiloCfg));
                }

                grid.appendChild(card);
            });

            block.appendChild(grid);
            return block;
        }
    };
})();
