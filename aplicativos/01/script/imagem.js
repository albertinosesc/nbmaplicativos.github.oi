// ============================================================
// MÓDULO IMAGEM (imagem.js)
// ============================================================
(function () {
    function extrairLegendaDaTag(fullMatch) {
        const match = String(fullMatch || '').match(/^\[IMAGEM[^\]]*(?:legenda|caption)\s*=\s*["']?([^"'\]]+)["']?[^\]]*\]/i);
        return match ? match[1].trim() : '';
    }

    function extrairUrlELegenda(rawInner, fullMatch) {
        const linhas = String(rawInner || '')
            .replace(/^\[IMAGEM[^\]]*\]/i, '')
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        const src = linhas[0] || '';
        const legendaAttr = extrairLegendaDaTag(fullMatch);
        const legendaLinha = linhas.slice(1).join(' ').trim();

        return {
            src,
            caption: legendaAttr || legendaLinha || ''
        };
    }

    window.ImagemModule = {
        render(rawInner, fullMatch = '') {
            const { src, caption } = extrairUrlELegenda(rawInner, fullMatch);

            const figure = document.createElement('figure');
            figure.className = 'lesson-image-block';

            if (!src) {
                const vazio = document.createElement('div');
                vazio.className = 'lesson-image-empty';
                vazio.textContent = 'Imagem não informada.';
                figure.appendChild(vazio);
                return figure;
            }

            const img = document.createElement('img');
            img.src = src;
            img.alt = caption || 'Imagem da lição';
            img.className = 'lesson-image-img';
            img.loading = 'lazy';
            figure.appendChild(img);

            if (caption) {
                const figcaption = document.createElement('figcaption');
                figcaption.className = 'lesson-image-caption';
                figcaption.textContent = caption;
                figure.appendChild(figcaption);
            }

            return figure;
        }
    };
})();
