// ============================================================
// MÓDULO LINKS (links.js)
// ============================================================
(function () {
    function extrairUrl(texto) {
        const match = String(texto || '').match(/(https?:\/\/[^\s|]+|www\.[^\s|]+|[a-z0-9-]+(?:\.[a-z0-9-]+)+[^\s|]*)/i);
        return match ? match[0].trim() : '';
    }

    function normalizarUrl(rawUrl) {
        let url = String(rawUrl || '').trim();
        if (!url) return '';

        // Remove pontuação solta no final caso alguém tenha colado com vírgula ou ponto final
        url = url.replace(/[),.;]+$/g, '');

        if (/^https?:\/\//i.test(url)) {
            return url;
        }
        if (/^www\./i.test(url) || /^[a-z0-9-]+(?:\.[a-z0-9-]+)+/i.test(url)) {
            return `https://${url}`;
        }
        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            return url;
        }
        return '';
    }

    window.LinksModule = {
        render(rawInner) {
            const linhas = String(rawInner || '')
                .split(/\r?\n/)
                .map(l => l.trim())
                .filter(Boolean);

            const block = document.createElement('div');
            block.className = 'links-block';

            const header = document.createElement('div');
            header.className = 'links-header';
            header.textContent = '🔗 Links de Referência';
            block.appendChild(header);

            const list = document.createElement('ul');
            list.className = 'links-list';

            let adicionados = 0;

            linhas.forEach((linha) => {
                let urlBruta = '';
                let titulo = '';

                if (linha.includes('|')) {
                    const partes = linha.split('|').map(p => p.trim()).filter(Boolean);
                    const urlNaPrimeira = extrairUrl(partes[0]);
                    const urlNaUltima = extrairUrl(partes[partes.length - 1]);

                    if (urlNaPrimeira) {
                        urlBruta = urlNaPrimeira;
                        titulo = partes.slice(1).join(' - ').trim();
                    } else if (urlNaUltima) {
                        urlBruta = urlNaUltima;
                        titulo = partes.slice(0, -1).join(' - ').trim();
                    } else {
                        urlBruta = extrairUrl(linha);
                        titulo = linha.replace(urlBruta, '').replace(/\|/g, '').trim();
                    }
                } else {
                    urlBruta = extrairUrl(linha);
                    titulo = linha.replace(urlBruta, '').trim();
                }

                const href = normalizarUrl(urlBruta);
                if (!href) return;

                const item = document.createElement('li');
                item.className = 'links-item';

                const linkEl = document.createElement('a');
                linkEl.href = href;
                linkEl.textContent = titulo || href;
                linkEl.target = '_blank';
                linkEl.rel = 'noopener noreferrer';

                item.appendChild(linkEl);
                list.appendChild(item);
                adicionados++;
            });

            if (adicionados === 0) {
                const msg = document.createElement('p');
                msg.className = 'links-empty';
                msg.textContent = 'Nenhum link encontrado neste bloco.';
                block.appendChild(msg);
            } else {
                block.appendChild(list);
            }

            return block;
        }
    };
})();
