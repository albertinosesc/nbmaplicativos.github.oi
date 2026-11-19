// ============================================================
// MÓDULO LINKS (links.js)
// ============================================================
(function () {
    function normalizarUrl(rawUrl) {
        const url = String(rawUrl || '').trim();
        if (!url) return '';
        if (/^https?:\/\//i.test(url)) return url;
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
            header.textContent = '🔗 Links e Referências';
            block.appendChild(header);

            const list = document.createElement('ul');
            list.className = 'links-list';

            linhas.forEach((linha) => {
                const partes = linha.split('|').map(p => p.trim());
                const href = normalizarUrl(partes[0]);
                if (!href) return;

                const textoLink = partes[1] || partes[0];

                const item = document.createElement('li');
                item.className = 'links-item';

                const anchor = document.createElement('a');
                anchor.href = href;
                anchor.textContent = textoLink;
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';

                item.appendChild(anchor);
                list.appendChild(item);
            });

            block.appendChild(list);
            return block;
        }
    };
})();
