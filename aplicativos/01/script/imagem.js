// ============================================================
// MÓDULO IMAGEM (imagem.js)
// ============================================================
(function () {
    const PASTA_PADRAO_IMAGENS = 'imagens';

    function extrairLegendaDaTag(fullMatch) {
        const match = String(fullMatch || '').match(/^\[IMAGEM[^\]]*(?:legenda|caption)\s*=\s*["']?([^"'\]]+)["']?[^\]]*\]/i);
        return match ? match[1].trim() : '';
    }

    function resolverCaminhoImagem(rawSrc) {
        const valor = String(rawSrc || '').trim().replace(/^["']|["']$/g, '');
        if (!valor) return '';

        // URLs completas ou dados em memória permanecem intactas
        if (/^(https?:\/\/|data:|blob:)/i.test(valor)) {
            return valor;
        }

        // Caminhos explícitos na mesma árvore do index.html
        if (/^(\.\/|\/)/.test(valor) || valor.includes('/')) {
            return valor.replace(/^\//, '');
        }

        // Nome simples de arquivo (ex.: "001.png") -> aponta para a pasta ao lado do index.html
        const pasta = PASTA_PADRAO_IMAGENS.replace(/^\/+|\/+$/g, '');
        return pasta ? `${pasta}/${valor}` : valor;
    }

    function extrairUrlELegenda(rawInner, fullMatch) {
        const linhas = String(rawInner || '')
            .replace(/^\[IMAGEM[^\]]*\]/i, '')
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);

        const src = resolverCaminhoImagem(linhas[0] || '');
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
            img.onerror = () => {
                if (img.dataset.fallbackApplied) return;
                img.dataset.fallbackApplied = 'true';
                const aviso = document.createElement('div');
                aviso.className = 'lesson-image-empty';
                aviso.textContent = `Não foi possível carregar a imagem: ${src}`;
                img.replaceWith(aviso);
            };
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
