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

    function parseInlineStyles(rawSegment) {
        const styles = {};
        const openTagMatch = String(rawSegment || '').match(/^\[CIFRA\s+style\s*=\s*([^\]]+)\]/i);
        if (!openTagMatch) return styles;

        const styleStr = openTagMatch[1];
        styleStr.split(',').forEach((item) => {
            const idx = item.indexOf(':');
            if (idx === -1) return;
            const prop = item.slice(0, idx).trim();
            const val = item.slice(idx + 1).trim().replace(/^["']|["']$/g, '');

            // Sanitização básica de propriedade e valor
            if (/^[a-zA-Z\-]+$/.test(prop) && !/[<>{};]/.test(val)) {
                styles[prop] = val;
            }
        });

        return styles;
    }

    function formatChordLine(line, styleAttr) {
        // Linha vazia vira quebra de linha limpa
        if (!line.trim()) {
            return '<div class="cifra-break"></div>';
        }

        const tokens = [];
        const regex = /\[([^\]]+)\]([^\[]*)/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(line)) !== null) {
            // Texto antes do primeiro acorde na linha (ex: "Tom: C" ou introdução)
            if (match.index > lastIndex) {
                const prefix = line.slice(lastIndex, match.index);
                tokens.push(
                    `<span class="lyric no-chord"><span>${escapeHtml(prefix)}</span></span>`
                );
            }

            const chord = match[1].trim();
            const lyricPart = match[2] || '';

            tokens.push(
                `<span class="lyric">` +
                    `<span class="chord"${styleAttr}>${escapeHtml(chord)}</span>` +
                    `<span class="lyric-text">${escapeHtml(lyricPart)}</span>` +
                `</span>`
            );

            lastIndex = match.index + match[0].length;
        }

        // Se a linha não tiver nenhum [acorde], renderiza como linha normal
        if (tokens.length === 0) {
            return `<div class="cifra-plain-line">${escapeHtml(line)}</div>`;
        }

        // Resto da linha após o último match, se houver
        if (lastIndex < line.length) {
            const tail = line.slice(lastIndex);
            tokens.push(
                `<span class="lyric no-chord"><span>${escapeHtml(tail)}</span></span>`
            );
        }

        return `<div class="cifra-line">${tokens.join('')}</div>`;
    }

    async function copyCifra(rawText, btn) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(rawText);
            } else {
                const ta = document.createElement('textarea');
                ta.value = rawText;
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
            const styles = parseInlineStyles(fullMatch);
            const styleEntries = Object.entries(styles).map(([k, v]) => `${k}: ${v}`);
            const styleAttr = styleEntries.length > 0 ? ` style="${styleEntries.join('; ')}"` : '';

            // Remove eventual [CIFRA ...] inicial caso venha incluído
            const withoutOpen = String(rawInner || '').replace(/^\[CIFRA[^\]]*\]/i, '').trim();
            const lines = withoutOpen.split(/\r?\n/);
            const htmlLines = lines.map((line) => formatChordLine(line, styleAttr));

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
            btnCopy.onclick = () => copyCifra(withoutOpen, btnCopy);

            header.appendChild(label);
            header.appendChild(btnCopy);
            box.appendChild(header);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'cifra-content';
            contentDiv.innerHTML = htmlLines.join('');
            box.appendChild(contentDiv);

            return box;
        }
    };
})();
