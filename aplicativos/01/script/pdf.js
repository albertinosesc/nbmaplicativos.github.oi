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

    function criarFallbackIframe(url, titulo) {
        const frame = document.createElement('iframe');
        frame.src = url;
        frame.title = titulo;
        frame.className = 'lesson-pdf-frame';
        frame.loading = 'lazy';
        return frame;
    }

    async function renderizarPaginasComPdfJs(url, paginasContainer, statusEl, box, titulo) {
        const pdfjsLib = window.pdfjsLib || (window['pdfjs-dist/build/pdf'] || null);
        if (!pdfjsLib || typeof pdfjsLib.getDocument !== 'function') {
            statusEl.remove();
            box.appendChild(criarFallbackIframe(url, titulo));
            return;
        }

        try {
            statusEl.textContent = 'Carregando PDF...';
            const loadingTask = pdfjsLib.getDocument(url);
            const pdfDoc = await loadingTask.promise;
            const totalPaginas = pdfDoc.numPages || 0;

            statusEl.textContent = totalPaginas === 1 ? '1 página' : `${totalPaginas} páginas`;

            for (let pageNum = 1; pageNum <= totalPaginas; pageNum++) {
                const page = await pdfDoc.getPage(pageNum);
                const containerWidth = Math.max(260, (paginasContainer.clientWidth || 720) - 24);
                const viewportBase = page.getViewport({ scale: 1 });
                const scale = Math.min(2, Math.max(0.75, containerWidth / viewportBase.width));
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                canvas.className = 'lesson-pdf-page-canvas';
                const context = canvas.getContext('2d');
                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);

                paginasContainer.appendChild(canvas);
                await page.render({ canvasContext: context, viewport }).promise;
            }
        } catch (err) {
            paginasContainer.innerHTML = '';
            statusEl.textContent = 'Visualização direta';
            box.appendChild(criarFallbackIframe(url, titulo));
        }
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

            const controlsRight = document.createElement('div');
            controlsRight.className = 'lesson-pdf-actions';

            const statusEl = document.createElement('span');
            statusEl.className = 'lesson-pdf-status';
            statusEl.textContent = '';
            controlsRight.appendChild(statusEl);

            if (url) {
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.className = 'lesson-pdf-link';
                link.textContent = 'Abrir PDF';
                controlsRight.appendChild(link);
            }

            header.appendChild(controlsRight);
            box.appendChild(header);

            if (!url) {
                const vazio = document.createElement('div');
                vazio.className = 'lesson-pdf-empty';
                vazio.textContent = 'URL do PDF não informada.';
                box.appendChild(vazio);
                return box;
            }

            const paginasContainer = document.createElement('div');
            paginasContainer.className = 'lesson-pdf-pages';
            box.appendChild(paginasContainer);

            renderizarPaginasComPdfJs(url, paginasContainer, statusEl, box, titulo);

            return box;
        }
    };
})();
