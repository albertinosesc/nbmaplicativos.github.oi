// ============================================================
// MÓDULO PDF (pdf.js)
// ============================================================
(function () {
    function extrairTituloDaTag(fullMatch) {
        const match = String(fullMatch || '').match(/^\[PDF[^\]]*(?:titulo|title)\s*=\s*["']?([^"'\]]+)["']?[^\]]*\]/i);
        return match ? match[1].trim() : '';
    }

    function extrairUrlETitulo(rawInner, fullMatch) {
        const linhas = String(rawInner || '')
            .replace(/^\[PDF[^\]]*\]/i, '')
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        const url = linhas[0] || '';
        const tituloAttr = extrairTituloDaTag(fullMatch);
        const tituloLinha = linhas.slice(1).join(' ').trim();

        return {
            url,
            titulo: tituloAttr || tituloLinha || 'Documento PDF'
        };
    }

    window.PdfModule = {
        render(rawInner, fullMatch = '') {
            const { url, titulo } = extrairUrlETitulo(rawInner, fullMatch);

            const box = document.createElement('div');
            box.className = 'lesson-pdf-block';

            const header = document.createElement('div');
            header.className = 'lesson-pdf-header';

            const titleEl = document.createElement('span');
            titleEl.className = 'lesson-pdf-title';
            titleEl.textContent = `📄 ${titulo}`;
            header.appendChild(titleEl);

            if (url) {
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'lesson-pdf-link';
                link.textContent = 'Abrir em nova aba';
                header.appendChild(link);
            }

            box.appendChild(header);

            if (!url) {
                const vazio = document.createElement('div');
                vazio.className = 'lesson-pdf-empty';
                vazio.textContent = 'URL do PDF não informada.';
                box.appendChild(vazio);
                return box;
            }

            const frame = document.createElement('iframe');
            frame.src = url;
            frame.title = titulo;
            frame.className = 'lesson-pdf-frame';
            frame.loading = 'lazy';
            box.appendChild(frame);

            return box;
        }
    };
})();
