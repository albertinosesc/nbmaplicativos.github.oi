// ============================================================
// MÓDULO MARKDOWN (markdown.js)
// ============================================================
(function () {
    function fallbackMarkdown(md) {
        return md
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            .replace(/\n\n+/g, '</p><p>')
            .replace(/\n/g, '<br>');
    }

    window.MarkdownModule = {
        render(rawMd) {
            const cleanMd = String(rawMd || '').trim();
            const container = document.createElement('div');
            container.className = 'md-block text-content';

            if (window.marked && typeof window.marked.parse === 'function') {
                container.innerHTML = window.marked.parse(cleanMd);
            } else {
                container.innerHTML = `<p>${fallbackMarkdown(cleanMd)}</p>`;
            }

            return container;
        }
    };
})();
