// ============================================================
// MÓDULO VIDEO YOUTUBE (video.js)
// ============================================================
(function () {
    function extractYouTubeId(input) {
        const str = String(input || '').trim();
        if (!str) return null;

        // Já é um ID de 11 caracteres
        if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
            return str;
        }

        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
        ];

        for (const regex of patterns) {
            const match = str.match(regex);
            if (match && match[1]) return match[1];
        }

        return null;
    }

    window.VideoModule = {
        render(rawText) {
            const lines = String(rawText || '')
                .split(/\r?\n/)
                .map(l => l.trim())
                .filter(Boolean);

            const firstLine = lines[0] || '';
            const caption = lines.slice(1).join(' ').trim();
            const videoId = extractYouTubeId(firstLine);

            const box = document.createElement('div');
            box.className = 'video-block';

            if (!videoId) {
                box.innerHTML = `<div class="error">URL ou ID de vídeo do YouTube inválido: <code>${firstLine}</code></div>`;
                return box;
            }

            const wrapper = document.createElement('div');
            wrapper.className = 'video-responsive';

            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            iframe.title = caption || 'Vídeo do YouTube';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';

            wrapper.appendChild(iframe);
            box.appendChild(wrapper);

            if (caption) {
                const capEl = document.createElement('p');
                capEl.className = 'video-caption';
                capEl.textContent = caption;
                box.appendChild(capEl);
            }

            return box;
        }
    };
})();
