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
