// ============================================================
// MÓDULO LINKS (links.js)
// ============================================================
(function () {
    function parseLinkLine(line) {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const parts = trimmed.split('|');
        if (parts.length >= 2) {
            const label = parts[0].trim();
            const url = parts.slice(1).join('|').trim();
            return { label: label || url, url };
        }
        return { label: trimmed, url: trimmed };
    }

    function isSafeUrl(url) {
        return /^https?:\/\//i.test(url);
    }

    window.LinksModule = {
        render(rawText) {
            const lines = String(rawText || '')
                .split(/\r?\n/)
                .map(parseLinkLine)
                .filter(item => item && isSafeUrl(item.url));

            const box = document.createElement('div');
            box.className = 'links-block';

            const title = document.createElement('div');
            title.className = 'links-title';
            title.textContent = '🔗 Links de Referência';
            box.appendChild(title);

            if (lines.length === 0) {
                box.innerHTML += '<p class="error">Nenhum link válido (http/https) encontrado.</p>';
                return box;
            }

            const ul = document.createElement('ul');
            ul.className = 'links-list';

            lines.forEach(({ label, url }) => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = label;
                li.appendChild(a);
                ul.appendChild(li);
            });

            box.appendChild(ul);
            return box;
        }
    };
})();
