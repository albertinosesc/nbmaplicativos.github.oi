// ============================================================
// MÓDULO LINKS (links.js)
// ============================================================
(function () {
    function parecerUrl(str) {
        return /^(https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,})/i.test(str.trim());
    }

    function normalizarUrl(rawUrl) {
        const url = String(rawUrl || '').trim();
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) return url;
        return `https://${url}`;
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

            let itensAdicionados = 0;

            linhas.forEach((linha) => {
                const partes = linha.split('|').map(p => p.trim()).filter(Boolean);
                let urlRaw = '';
                let label = '';

                if (partes.length >= 2) {
                    if (parecerUrl(partes[0])) {
                        urlRaw = partes[0];
                        label = partes.slice(1).join(' | ');
                    } else if (parecerUrl(partes[partes.length - 1])) {
                        urlRaw = partes[partes.length - 1];
                        label = partes.slice(0, -1).join(' | ');
                    } else {
                        urlRaw = partes[0];
                        label = partes.slice(1).join(' | ');
                    }
                } else {
                    urlRaw = partes[0] || '';
                    label = urlRaw;
                }

                const href = normalizarUrl(urlRaw);
                if (!href) return;

                const item = document.createElement('li');
                item.className = 'links-item';

                const anchor = document.createElement('a');
                anchor.href = href;
                anchor.textContent = label || href;
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';

                item.appendChild(anchor);
                list.appendChild(item);
                itensAdicionados++;
            });

            if (itensAdicionados === 0) {
                const vazio = document.createElement('p');
                vazio.className = 'links-empty';
                vazio.textContent = 'Nenhum link encontrado no bloco [LINK].';
                block.appendChild(vazio);
            } else {
                block.appendChild(list);
            }

            return block;
        }
    };
})();
