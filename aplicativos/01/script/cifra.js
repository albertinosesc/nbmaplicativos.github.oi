// ============================================================
// MÓDULO CIFRA (cifra.js)
// ============================================================
(function () {
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function parseStyleList(rawList) {
        const styles = {};
        if (!rawList) return styles;

        rawList.split(',').forEach((item) => {
            const idx = item.indexOf(':');
            if (idx === -1) return;
            const prop = item.slice(0, idx).trim();
            const val = item.slice(idx + 1).trim().replace(/^["']|["']$/g, '');

            if (/^[a-zA-Z\-]+$/.test(prop) && val && !/[<>{};]/.test(val)) {
                styles[prop] = val;
            }
        });

        return styles;
    }

    function stylesToAttr(stylesObj) {
        const entries = Object.entries(stylesObj).map(([k, v]) => `${k}: ${v}`);
        return entries.length > 0 ? ` style="${entries.join('; ')}"` : '';
    }

    function parseCifraTagStyles(rawSegment) {
        const tagMatch = String(rawSegment || '').match(/^\[CIFRA([^\]]*)\]/i);
        const attrsStr = tagMatch ? tagMatch[1] : '';

        const keysPattern = '(?:style|letra-style|titulo-style)\\s*=';

        const tituloMatch = attrsStr.match(new RegExp(`titulo-style\\s*=\\s*(.+?)(?=\\s+${keysPattern}|$)`, 'i'));
        const letraMatch = attrsStr.match(new RegExp(`letra-style\\s*=\\s*(.+?)(?=\\s+${keysPattern}|$)`, 'i'));
        const acordeMatch = attrsStr.match(new RegExp(`(?:^|\\s)style\\s*=\\s*(.+?)(?=\\s+${keysPattern}|$)`, 'i'));

        const tituloRaw = tituloMatch ? tituloMatch[1].trim().replace(/,$/, '') : '';
        const letraRaw = letraMatch ? letraMatch[1].trim().replace(/,$/, '') : '';
        const acordeRaw = acordeMatch ? acordeMatch[1].trim().replace(/,$/, '') : '';

        return {
            chordAttr: stylesToAttr(parseStyleList(acordeRaw)),
            lyricAttr: stylesToAttr(parseStyleList(letraRaw)),
            titleAttr: stylesToAttr(parseStyleList(tituloRaw))
        };
    }

    function extractTitleAndBody(rawInner) {
        let text = String(rawInner || '').replace(/^\[CIFRA[^\]]*\]/i, '').trim();
        let titulo = '';

        // Formato 1: [TITULO]...[/TITULO]
        const tagTitleMatch = text.match(/\[TITULO\]([\s\S]*?)\[\/TITULO\]/i);
        if (tagTitleMatch) {
            titulo = tagTitleMatch[1].trim();
            text = text.replace(/\[TITULO\][\s\S]*?\[\/TITULO\]/i, '').trim();
        } else {
            // Formato 2: primeira linha começando com "titulo:"
            const lines = text.split(/\r?\n/);
            if (lines.length > 0 && /^titulo\s*:/i.test(lines[0].trim())) {
                titulo = lines[0].trim().replace(/^titulo\s*:/i, '').trim();
                text = lines.slice(1).join('\n').trim();
            }
        }

        return { titulo, bodyText: text };
    }

    function formatChordLine(line, chordAttr, lyricAttr) {
        if (!line.trim()) {
            return '<div class="cifra-break"></div>';
        }

        const tokens = [];
        const regex = /\[([^\]]+)\]([^\[]*)/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(line)) !== null) {
            if (match.index > lastIndex) {
                const prefix = line.slice(lastIndex, match.index);
                tokens.push(
                    `<span class="lyric no-chord"><span class="lyric-text"${lyricAttr}>${escapeHtml(prefix)}</span></span>`
                );
            }

            const chord = match[1].trim();
            const lyricPart = match[2] || '';

            tokens.push(
                `<span class="lyric">` +
                    `<span class="chord"${chordAttr}>${escapeHtml(chord)}</span>` +
                    `<span class="lyric-text"${lyricAttr}>${escapeHtml(lyricPart)}</span>` +
                `</span>`
            );

            lastIndex = match.index + match[0].length;
        }

        if (tokens.length === 0) {
            return `<div class="cifra-plain-line"${lyricAttr}>${escapeHtml(line)}</div>`;
        }

        if (lastIndex < line.length) {
            const tail = line.slice(lastIndex);
            tokens.push(
                `<span class="lyric no-chord"><span class="lyric-text"${lyricAttr}>${escapeHtml(tail)}</span></span>`
            );
        }

        return `<div class="cifra-line">${tokens.join('')}</div>`;
    }

    async function copyCifra(copySourceText, btn) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(copySourceText);
            } else {
                const ta = document.createElement('textarea');
                ta.value = copySourceText;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            const old = btn.innerHTML;
            btn.innerHTML = '✓ Copiado!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerHTML = old;
                btn.classList.remove('copied');
            }, 1800);
        } catch (err) {
            alert('Erro ao copiar cifra: ' + err.message);
        }
    }

    window.CifraModule = {
        render(rawInner, fullMatch = '') {
            const { chordAttr, lyricAttr, titleAttr } = parseCifraTagStyles(fullMatch);
            const { titulo, bodyText } = extractTitleAndBody(rawInner);

            const lines = bodyText ? bodyText.split(/\r?\n/) : [];
            const htmlLines = lines.map((line) => formatChordLine(line, chordAttr, lyricAttr));
            const fullCopyText = titulo ? `${titulo}\n\n${bodyText}` : bodyText;

            const box = document.createElement('div');
            box.className = 'cifra-block';

            const header = document.createElement('div');
            header.className = 'cifra-header';

            const label = document.createElement('span');
            label.className = 'cifra-label';
            label.textContent = '🎸 Cifra';

            const btnCopy = document.createElement('button');
            btnCopy.type = 'button';
            btnCopy.className = 'btn-copy';
            btnCopy.innerHTML = '📋 Copiar';
            btnCopy.onclick = () => copyCifra(fullCopyText, btnCopy);

            header.appendChild(label);
            header.appendChild(btnCopy);
            box.appendChild(header);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'cifra-content';

            if (titulo) {
                const titleEl = document.createElement('div');
                titleEl.className = 'cifra-title';
                if (titleAttr) {
                    titleEl.setAttribute('style', titleAttr.replace(/^ style="|"$|^ style='|'$/g, ''));
                }
                titleEl.textContent = titulo;
                contentDiv.appendChild(titleEl);
            }

            contentDiv.innerHTML += htmlLines.join('');
            box.appendChild(contentDiv);

            return box;
        }
    };
})();

// ============================================================
// MÓDULO CIFRA (cifra.js)
// ============================================================
(function () {
    const NOTAS_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const NOTAS_BEMOL = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    const MAPA_SEMITONS = {
        'C': 0, 'B#': 0,
        'C#': 1, 'Db': 1,
        'D': 2,
        'D#': 3, 'Eb': 3,
        'E': 4, 'Fb': 4,
        'F': 5, 'E#': 5,
        'F#': 6, 'Gb': 6,
        'G': 7,
        'G#': 8, 'Ab': 8,
        'A': 9,
        'A#': 10, 'Bb': 10,
        'B': 11, 'Cb': 11
    };

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function parseStyleList(rawList) {
        const styles = {};
        if (!rawList) return styles;

        rawList.split(',').forEach((item) => {
            const idx = item.indexOf(':');
            if (idx === -1) return;
            const prop = item.slice(0, idx).trim();
            const val = item.slice(idx + 1).trim().replace(/^["']|["']$/g, '');

            if (/^[a-zA-Z\-]+$/.test(prop) && val && !/[<>{};]/.test(val)) {
                styles[prop] = val;
            }
        });

        return styles;
    }

    function stylesToAttr(stylesObj) {
        const entries = Object.entries(stylesObj).map(([k, v]) => `${k}: ${v}`);
        return entries.length > 0 ? ` style="${entries.join('; ')}"` : '';
    }

    function parseCifraTagStyles(rawSegment) {
        const tagMatch = String(rawSegment || '').match(/^\[CIFRA([^\]]*)\]/i);
        const attrsStr = tagMatch ? tagMatch[1] : '';

        const keysPattern = '(?:style|letra-style|titulo-style)\\s*=';

        const tituloMatch = attrsStr.match(new RegExp(`titulo-style\\s*=\\s*(.+?)(?=\\s+${keysPattern}|$)`, 'i'));
        const letraMatch = attrsStr.match(new RegExp(`letra-style\\s*=\\s*(.+?)(?=\\s+${keysPattern}|$)`, 'i'));
        const acordeMatch = attrsStr.match(new RegExp(`(?:^|\\s)style\\s*=\\s*(.+?)(?=\\s+${keysPattern}|$)`, 'i'));

        const tituloRaw = tituloMatch ? tituloMatch[1].trim().replace(/,$/, '') : '';
        const letraRaw = letraMatch ? letraMatch[1].trim().replace(/,$/, '') : '';
        const acordeRaw = acordeMatch ? acordeMatch[1].trim().replace(/,$/, '') : '';

        return {
            chordAttr: stylesToAttr(parseStyleList(acordeRaw)),
            lyricAttr: stylesToAttr(parseStyleList(letraRaw)),
            titleAttr: stylesToAttr(parseStyleList(tituloRaw))
        };
    }

    function extractTitleAndBody(rawInner) {
        let text = String(rawInner || '').replace(/^\[CIFRA[^\]]*\]/i, '').trim();
        let titulo = '';

        // Formato 1: [TITULO]...[/TITULO]
        const tagTitleMatch = text.match(/\[TITULO\]([\s\S]*?)\[\/TITULO\]/i);
        if (tagTitleMatch) {
            titulo = tagTitleMatch[1].trim();
            text = text.replace(/\[TITULO\][\s\S]*?\[\/TITULO\]/i, '').trim();
        } else {
            // Formato 2: primeira linha começando com "titulo:"
            const lines = text.split(/\r?\n/);
            if (lines.length > 0 && /^titulo\s*:/i.test(lines[0].trim())) {
                titulo = lines[0].trim().replace(/^titulo\s*:/i, '').trim();
                text = lines.slice(1).join('\n').trim();
            }
        }

        return { titulo, bodyText: text };
    }

    function transporNota(notaStr, semitons, usarBemol = false) {
        const match = String(notaStr || '').trim().match(/^([A-Ga-g])([#b]?)$/);
        if (!match) return notaStr;

        const letra = match[1].toUpperCase();
        const acidente = match[2] || '';
        const chave = `${letra}${acidente}`;
        const baseIdx = MAPA_SEMITONS[chave];
        if (baseIdx === undefined) return notaStr;

        const novoIdx = (((baseIdx + semitons) % 12) + 12) % 12;
        const preferirBemol = acidente === 'b' || (usarBemol && acidente !== '#');
        const escala = preferirBemol ? NOTAS_BEMOL : NOTAS_SHARP;

        return escala[novoIdx];
    }

    function transporAcordeTexto(acordeTexto, semitons) {
        if (!semitons) return acordeTexto;

        const preferirBemol = semitons < 0;
        const partes = String(acordeTexto).split('/');

        return partes.map((parte) => {
            const trimmed = parte.trim();
            if (!trimmed) return parte;

            const m = trimmed.match(/^([A-Ga-g][#b]?)(.*)$/);
            if (!m) return parte;

            const novaNota = transporNota(m[1], semitons, preferirBemol);
            return `${novaNota}${m[2]}`;
        }).join('/');
    }

    function transporTextoComColchetes(texto, semitons) {
        if (!semitons) return texto;
        return String(texto).replace(/\[([^\]]+)\]/g, (full, dentro) => {
            const limpo = dentro.trim();
            if (!/^[A-G][#b]?/i.test(limpo)) return full;
            return `[${transporAcordeTexto(limpo, semitons)}]`;
        });
    }

    function formatChordLine(line, chordAttr, lyricAttr) {
        if (!line.trim()) {
            return '<div class="cifra-break"></div>';
        }

        const tokens = [];
        const regex = /\[([^\]]+)\]([^\[]*)/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(line)) !== null) {
            if (match.index > lastIndex) {
                const prefix = line.slice(lastIndex, match.index);
                tokens.push(
                    `<span class="lyric no-chord"><span class="lyric-text"${lyricAttr}>${escapeHtml(prefix)}</span></span>`
                );
            }

            const chord = match[1].trim();
            const lyricPart = match[2] || '';

            tokens.push(
                `<span class="lyric">` +
                    `<span class="chord"${chordAttr} data-original-chord="${escapeHtml(chord)}">${escapeHtml(chord)}</span>` +
                    `<span class="lyric-text"${lyricAttr}>${escapeHtml(lyricPart)}</span>` +
                `</span>`
            );

            lastIndex = match.index + match[0].length;
        }

        if (tokens.length === 0) {
            return `<div class="cifra-plain-line"${lyricAttr}>${escapeHtml(line)}</div>`;
        }

        if (lastIndex < line.length) {
            const tail = line.slice(lastIndex);
            tokens.push(
                `<span class="lyric no-chord"><span class="lyric-text"${lyricAttr}>${escapeHtml(tail)}</span></span>`
            );
        }

        return `<div class="cifra-line">${tokens.join('')}</div>`;
    }

    async function copyCifra(getCopyTextFn, btn) {
        const copySourceText = typeof getCopyTextFn === 'function' ? getCopyTextFn() : String(getCopyTextFn || '');
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(copySourceText);
            } else {
                const ta = document.createElement('textarea');
                ta.value = copySourceText;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            const old = btn.innerHTML;
            btn.innerHTML = '✓ Copiado!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.innerHTML = old;
                btn.classList.remove('copied');
            }, 1800);
        } catch (err) {
            alert('Erro ao copiar cifra: ' + err.message);
        }
    }

    function criarBarraTranspose(contentDiv, titulo, bodyText, getSemitons, setSemitons) {
        const bar = document.createElement('div');
        bar.className = 'cifra-transpose-bar';

        const btnDown = document.createElement('button');
        btnDown.type = 'button';
        btnDown.className = 'cifra-transpose-btn';
        btnDown.title = 'Baixar 1 semitom';
        btnDown.textContent = '‹ -1';

        const statusSpan = document.createElement('span');
        statusSpan.className = 'cifra-transpose-status';
        statusSpan.textContent = 'Tom: 0';

        const btnUp = document.createElement('button');
        btnUp.type = 'button';
        btnUp.className = 'cifra-transpose-btn';
        btnUp.title = 'Subir 1 semitom';
        btnUp.textContent = '+1 ›';

        const btnReset = document.createElement('button');
        btnReset.type = 'button';
        btnReset.className = 'cifra-transpose-btn cifra-transpose-reset';
        btnReset.title = 'Voltar ao tom original';
        btnReset.textContent = 'Original';
        btnReset.style.display = 'none';

        const aplicar = (novoSemitons) => {
            setSemitons(novoSemitons);

            contentDiv.querySelectorAll('.chord[data-original-chord]').forEach((chordEl) => {
                const original = chordEl.getAttribute('data-original-chord') || '';
                chordEl.textContent = transporAcordeTexto(original, novoSemitons);
            });

            if (novoSemitons === 0) {
                statusSpan.textContent = 'Tom: 0';
                btnReset.style.display = 'none';
            } else {
                const sinal = novoSemitons > 0 ? `+${novoSemitons}` : `${novoSemitons}`;
                statusSpan.textContent = `Tom: ${sinal}`;
                btnReset.style.display = 'inline-block';
            }
        };

        btnDown.onclick = () => aplicar(getSemitons() - 1);
        btnUp.onclick = () => aplicar(getSemitons() + 1);
        btnReset.onclick = () => aplicar(0);

        bar.appendChild(btnDown);
        bar.appendChild(statusSpan);
        bar.appendChild(btnUp);
        bar.appendChild(btnReset);

        return bar;
    }

    window.CifraModule = {
        render(rawInner, fullMatch = '') {
            const { chordAttr, lyricAttr, titleAttr } = parseCifraTagStyles(fullMatch);
            const { titulo, bodyText } = extractTitleAndBody(rawInner);

            const lines = bodyText ? bodyText.split(/\r?\n/) : [];
            const htmlLines = lines.map((line) => formatChordLine(line, chordAttr, lyricAttr));

            let semitonsAtual = 0;
            const getCopyText = () => {
                const corpoAtual = transporTextoComColchetes(bodyText, semitonsAtual);
                return titulo ? `${titulo}\n\n${corpoAtual}` : corpoAtual;
            };

            const box = document.createElement('div');
            box.className = 'cifra-block';

            const header = document.createElement('div');
            header.className = 'cifra-header';

            const label = document.createElement('span');
            label.className = 'cifra-label';
            label.textContent = '🎸 Cifra';

            const btnCopy = document.createElement('button');
            btnCopy.type = 'button';
            btnCopy.className = 'btn-copy';
            btnCopy.innerHTML = '📋 Copiar';
            btnCopy.onclick = () => copyCifra(getCopyText, btnCopy);

            header.appendChild(label);
            header.appendChild(btnCopy);
            box.appendChild(header);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'cifra-content';

            if (titulo) {
                const titleEl = document.createElement('div');
                titleEl.className = 'cifra-title';
                if (titleAttr) {
                    titleEl.setAttribute('style', titleAttr.replace(/^ style="|"$|^ style='|'$/g, ''));
                }
                titleEl.textContent = titulo;
                contentDiv.appendChild(titleEl);
            }

            contentDiv.innerHTML += htmlLines.join('');

            const transposeBar = criarBarraTranspose(
                contentDiv,
                titulo,
                bodyText,
                () => semitonsAtual,
                (val) => { semitonsAtual = val; }
            );
            box.appendChild(transposeBar);
            box.appendChild(contentDiv);

            return box;
        }
    };
})();
