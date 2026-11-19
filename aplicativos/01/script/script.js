// ============================================================
// CONFIGURAÇÃO
// ============================================================
const CONFIG = {
    baseUrl: 'tutorials/',
    indexFile: 'index.json',
    github: {
        owner: 'albertinosesc',
        repo: 'nbmaplicativos.github.oi',
        branch: 'main',
        tutorialsFolder: 'aplicativos/01/script/tutorials'
    }
};

// ============================================================
// ESTADO GLOBAL
// ============================================================
let lessons = [];
let currentFile = null;
let openCategories = new Set(); // Guarda quais pastas "Pai" estão abertas
let searchTerm = '';
let isAdminOpen = false;

window.currentLessonRawText = '';
window.currentLessonTitle = 'Licao';

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    setupSidebarControls();
    setupLessonActionButtons();
    renderAdminPanel();
    await loadLessonIndex();
});

function setupSidebarControls() {
    const toggleBtn = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    const adminBtn = document.getElementById('btn-admin-tab');
    const searchInput = document.getElementById('lesson-search');
    const expandAllBtn = document.getElementById('btn-expand-all');
    const collapseAllBtn = document.getElementById('btn-collapse-all');

    if (toggleBtn && sidebar) {
        toggleBtn.onclick = () => sidebar.classList.toggle('collapsed');
    }

    if (adminBtn) {
        adminBtn.onclick = () => toggleAdmin(!isAdminOpen);
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.trim().toLowerCase();
            renderNavigation();
        });
    }

    if (expandAllBtn) {
        expandAllBtn.onclick = () => {
            getAllCategories().forEach(cat => openCategories.add(cat));
            renderNavigation();
        };
    }

    if (collapseAllBtn) {
        collapseAllBtn.onclick = () => {
            openCategories.clear();
            renderNavigation();
        };
    }
}

function setupLessonActionButtons() {
    const copyBtn = document.getElementById('btn-copy-txt');
    const pdfBtn = document.getElementById('btn-export-pdf');

    if (copyBtn) {
        copyBtn.onclick = () => copiarLicaoTxtOriginal(copyBtn);
    }

    if (pdfBtn) {
        pdfBtn.onclick = () => exportarLicaoAtualPdf();
    }
}

async function copiarLicaoTxtOriginal(btnEl) {
    const rawText = window.currentLessonRawText;
    if (typeof rawText !== 'string' || rawText.length === 0) {
        alert('Nenhum conteúdo .txt carregado para copiar.');
        return;
    }

    let copiou = false;
    try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            await navigator.clipboard.writeText(rawText);
            copiou = true;
        }
    } catch {
        copiou = false;
    }

    if (!copiou) {
        const tempArea = document.createElement('textarea');
        tempArea.value = rawText;
        tempArea.setAttribute('readonly', '');
        tempArea.style.position = 'fixed';
        tempArea.style.top = '-9999px';
        tempArea.style.left = '-9999px';
        document.body.appendChild(tempArea);
        tempArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempArea);
    }

    if (btnEl) {
        const textoOriginal = btnEl.dataset.originalLabel || btnEl.textContent;
        btnEl.dataset.originalLabel = textoOriginal;
        btnEl.textContent = '✅ .TXT Copiado!';
        setTimeout(() => {
            btnEl.textContent = btnEl.dataset.originalLabel || textoOriginal;
        }, 1600);
    }
}

function exportarLicaoAtualPdf() {
    const article = document.getElementById('lesson-content');
    if (!article || !article.innerHTML.trim()) {
        alert('Nenhuma lição carregada para exportar em PDF.');
        return;
    }

    const titulo = window.currentLessonTitle || currentFile || 'Licao';
    const janelaPdf = window.open('', '_blank', 'width=980,height=740');
    if (!janelaPdf) {
        alert('Permita pop-ups no navegador para gerar o PDF da lição.');
        return;
    }

    const estilosAtuais = [...document.querySelectorAll('link[rel="stylesheet"], style')]
        .map(el => el.outerHTML)
        .join('\n');

    janelaPdf.document.open();
    janelaPdf.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(titulo)}</title>
            ${estilosAtuais}
            <style>
                body {
                    background: #ffffff !important;
                    color: #000000 !important;
                    margin: 0 !important;
                    padding: 20px !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .lesson-actions,
                #lesson-actions-bar,
                .sidebar,
                header,
                footer,
                #admin-panel {
                    display: none !important;
                }
                #lesson-content {
                    display: block !important;
                    width: 100% !important;
                    max-width: 100% !important;
                }
                .violao-grid {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 12px !important;
                }
                .violao-card {
                    break-inside: avoid !important;
                    page-break-inside: avoid !important;
                }
                canvas.violao-canvas {
                    display: block !important;
                    visibility: visible !important;
                }
                @media print {
                    body {
                        padding: 0 !important;
                    }
                }
            </style>
        </head>
        <body></body>
        </html>
    `);
    janelaPdf.document.close();

    // Clona o nó diretamente no contexto da janela de impressão para preservar os <canvas>
    const cloneArticle = janelaPdf.document.importNode(article, true);
    janelaPdf.document.body.appendChild(cloneArticle);

    const origCanvases = [...article.querySelectorAll('canvas')];
    const clonedCanvases = [...cloneArticle.querySelectorAll('canvas')];

    origCanvases.forEach((origCanvas, idx) => {
        const destCanvas = clonedCanvases[idx];
        if (!destCanvas || origCanvas.width === 0 || origCanvas.height === 0) return;

        destCanvas.width = origCanvas.width;
        destCanvas.height = origCanvas.height;

        const rect = origCanvas.getBoundingClientRect();
        if (rect.width > 0) destCanvas.style.width = `${Math.round(rect.width)}px`;
        if (rect.height > 0) destCanvas.style.height = `${Math.round(rect.height)}px`;

        const ctx = destCanvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, destCanvas.width, destCanvas.height);
            ctx.drawImage(origCanvas, 0, 0);
        }
    });

    const dispararImpressao = async () => {
        try {
            if (janelaPdf.document.fonts && janelaPdf.document.fonts.ready) {
                await janelaPdf.document.fonts.ready;
            }
        } catch (_) {}

        setTimeout(() => {
            janelaPdf.focus();
            janelaPdf.print();
        }, 500);
    };

    if (janelaPdf.document.readyState === 'complete') {
        dispararImpressao();
    } else {
        janelaPdf.addEventListener('load', dispararImpressao, { once: true });
    }
}

function getLessonCategory(lesson) {
    return (lesson.category || lesson.parent || 'Geral').trim();
}

function getAllCategories() {
    const cats = new Set();
    lessons.forEach(l => cats.add(getLessonCategory(l)));
    return Array.from(cats);
}

async function loadLessonIndex() {
    try {
        const response = await fetch(`${CONFIG.baseUrl}${CONFIG.indexFile}?t=${Date.now()}`);
        if (!response.ok) throw new Error('Não foi possível carregar o índice');
        lessons = await response.json();

        if (lessons.length > 0 && openCategories.size === 0) {
            openCategories.add(getLessonCategory(lessons[0]));
        }

        updateCategoryDatalist();
        renderNavigation();

        if (lessons.length > 0 && !isAdminOpen && !currentFile) {
            loadLesson(lessons[0].file);
        }
    } catch (error) {
        document.getElementById('lesson-content').innerHTML =
            `<div class="error">Erro ao carregar índice: ${error.message}<br>
            Verifique se o arquivo <code>${CONFIG.indexFile}</code> existe em <code>${CONFIG.baseUrl}</code></div>`;
    }
}

function renderNavigation() {
    const nav = document.getElementById('lesson-nav');
    nav.innerHTML = '';

    const groupsMap = new Map();

    lessons.forEach((lesson) => {
        const category = getLessonCategory(lesson);
        const matchesSearch = !searchTerm ||
            lesson.title.toLowerCase().includes(searchTerm) ||
            category.toLowerCase().includes(searchTerm) ||
            lesson.file.toLowerCase().includes(searchTerm);

        if (!matchesSearch) return;

        if (!groupsMap.has(category)) {
            groupsMap.set(category, []);
        }
        groupsMap.get(category).push(lesson);
    });

    if (groupsMap.size === 0) {
        nav.innerHTML = `<p style="padding: 0.8rem; color: #777; font-size: 0.9rem;">Nenhum tópico encontrado.</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    groupsMap.forEach((items, categoryName) => {
        const isOpen = Boolean(searchTerm) || openCategories.has(categoryName);

        const groupDiv = document.createElement('div');
        groupDiv.className = `tree-group${isOpen ? ' open' : ''}`;

        const parentBtn = document.createElement('button');
        parentBtn.type = 'button';
        parentBtn.className = 'tree-parent';
        parentBtn.innerHTML = `
            <span class="parent-label">
                <span class="arrow">${isOpen ? '▾' : '▸'}</span>
                <span>${escapeHtml(categoryName)}</span>
            </span>
            <span class="badge-count">${items.length}</span>
        `;

        parentBtn.onclick = () => {
            if (openCategories.has(categoryName)) {
                openCategories.delete(categoryName);
            } else {
                openCategories.add(categoryName);
            }
            renderNavigation();
        };

        const childrenUl = document.createElement('ul');
        childrenUl.className = 'tree-children';

        items.forEach((lesson) => {
            const li = document.createElement('li');
            const childBtn = document.createElement('button');
            childBtn.type = 'button';
            childBtn.className = `tree-child-btn${lesson.file === currentFile ? ' active' : ''}`;
            childBtn.dataset.file = lesson.file;
            childBtn.title = `${lesson.title} (${lesson.file})`;
            childBtn.innerHTML = `
                <span class="tree-child-title">${escapeHtml(lesson.title)}</span>
                <span class="tree-child-file">${escapeHtml(lesson.file)}</span>
            `;
            childBtn.onclick = () => {
                toggleAdmin(false);
                loadLesson(lesson.file);
            };
            li.appendChild(childBtn);
            childrenUl.appendChild(li);
        });

        groupDiv.appendChild(parentBtn);
        groupDiv.appendChild(childrenUl);
        fragment.appendChild(groupDiv);
    });

    nav.appendChild(fragment);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function toggleAdmin(show) {
    isAdminOpen = show;
    const panel = document.getElementById('admin-panel');
    const content = document.getElementById('lesson-content');
    const actionsBar = document.getElementById('lesson-actions-bar');
    const adminBtn = document.getElementById('btn-admin-tab');

    panel.style.display = show ? 'block' : 'none';
    content.style.display = show ? 'none' : 'block';
    if (actionsBar) actionsBar.style.display = show ? 'none' : 'flex';
    if (adminBtn) adminBtn.classList.toggle('active', show);
}

async function loadLesson(fileName) {
    currentFile = fileName;
    const content = document.getElementById('lesson-content');
    content.innerHTML = '<p class="loading">Carregando lição...</p>';

    const lessonMeta = lessons.find(l => l.file === fileName);
    window.currentLessonTitle = lessonMeta?.title || fileName.replace(/\.txt$/i, '');

    if (lessonMeta) {
        openCategories.add(getLessonCategory(lessonMeta));
    }
    renderNavigation();

    try {
        const response = await fetch(`${CONFIG.baseUrl}${fileName}?t=${Date.now()}`);
        if (!response.ok) throw new Error('Lição não encontrada');
        const text = await response.text();
        window.currentLessonRawText = text;
        renderLesson(text);
    } catch (error) {
        window.currentLessonRawText = '';
        content.innerHTML = `<div class="error">Erro: ${error.message}</div>`;
    }
}

// ============================================================
// ORQUESTRADOR DE RENDERIZAÇÃO DE BLOCOS
// ============================================================
function renderLesson(text) {
    if (typeof text === 'string') {
        window.currentLessonRawText = text;
    }

    if (window.AbcModule && typeof window.AbcModule.resetPlayback === 'function') {
        window.AbcModule.resetPlayback();
    }

    const content = document.getElementById('lesson-content');
    renderLessonIntoContainer(text, content, 'lesson-abc');
}

function renderLessonIntoContainer(text, container, idPrefix = 'abc') {
    if (!container) return;
    container.innerHTML = '';

    const codeBlocks = [];
    // 1. Protege qualquer trecho dentro de <code>...</code> ou <pre>...</pre>
    const protectedText = String(text || '').replace(
        /<(code|pre)(\b[^>]*)>([\s\S]*?)<\/\1>/gi,
        (fullMatch) => {
            const token = `@@CODEBLOCK_${codeBlocks.length}@@`;
            codeBlocks.push(fullMatch);
            return token;
        }
    );

    const restoreCodeBlocks = (str) =>
        String(str || '').replace(/@@CODEBLOCK_(\d+)@@/g, (_, idx) => codeBlocks[Number(idx)] ?? '');

    const tokenRegex = /\[(ABC|CIFRA(?:\s+[^\]]*)?|MD|LINK|VIDEO|VIOLAO)\]([\s\S]*?)\[\/(ABC|CIFRA|MD|LINK|VIDEO|VIOLAO)\]/gi;
    let lastIndex = 0;
    let match;
    let abcCounter = 0;

    while ((match = tokenRegex.exec(protectedText)) !== null) {
        const textBefore = restoreCodeBlocks(protectedText.substring(lastIndex, match.index));
        if (textBefore.trim()) {
            container.appendChild(parseText(textBefore));
        }

        const rawTag = match[1].trim();
        const tagType = rawTag.split(/\s+/)[0].toUpperCase();
        const innerContent = restoreCodeBlocks(match[2]);

        if (tagType === 'ABC' && window.AbcModule) {
            container.appendChild(window.AbcModule.render(innerContent, `${idPrefix}-${abcCounter++}`));
        } else if (tagType === 'CIFRA' && window.CifraModule) {
    container.appendChild(window.CifraModule.render(innerContent, match[0]));
        } else if (tagType === 'MD' && window.MarkdownModule) {
            container.appendChild(window.MarkdownModule.render(innerContent));
        } else if (tagType === 'LINK' && window.LinksModule) {
            container.appendChild(window.LinksModule.render(innerContent));
            } else if (tagType === 'IMAGEM' && window.ImagemModule) {
            container.appendChild(window.ImagemModule.render(innerContent, match[0]));
        } else if (tagType === 'PDF' && window.PdfModule) {
            container.appendChild(window.PdfModule.render(innerContent, match[0]));
        } else if (tagType === 'VIDEO' && window.VideoModule) {
            container.appendChild(window.VideoModule.render(innerContent));
        } else if (tagType === 'VIOLAO' && window.ViolaoModule) {
            container.appendChild(window.ViolaoModule.render(innerContent));
        } else {
            container.appendChild(parseText(innerContent));
        }

        lastIndex = match.index + match[0].length;
    }

    const textAfter = restoreCodeBlocks(protectedText.substring(lastIndex));
    if (textAfter.trim()) {
        container.appendChild(parseText(textAfter));
    }
}

function parseText(text) {
    const container = document.createElement('div');
    container.className = 'text-content';
    container.innerHTML = text;
    return container;
}

// ============================================================
// ABA ADMIN — SALVAR .TXT E ATUALIZAR index.json NO GITHUB
// ============================================================
const TOKEN_STORAGE_KEY = 'abc_github_pat';

function normalizeTxtFilename(rawInput) {
    const cleaned = String(rawInput || '')
        .trim()
        .replace(/^\/+|\/+$/g, '')
        .replace(/\.txt$/i, '');
    return cleaned ? `${cleaned}.txt` : '';
}

function formatIndexJson(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
        return '[\n]\n';
    }
    const lines = entries.map((item) => {
        const obj = {
            category: String(item.category || item.parent || 'Geral'),
            title: String(item.title || ''),
            file: String(item.file || '')
        };
        return `    ${JSON.stringify(obj)}`;
    });
    return `[\n${lines.join(',\n')}\n]\n`;
}

function updateCategoryDatalist() {
    const datalist = document.getElementById('category-suggestions');
    if (!datalist) return;
    datalist.innerHTML = '';
    getAllCategories().forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        datalist.appendChild(opt);
    });
}

let adminPreviewTimer = null;

function renderAdminPanel() {
    const panel = document.getElementById('admin-panel');
    const savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY) || '';

    panel.innerHTML = `
        <h2>🛠️ Painel Admin — Lições no GitHub</h2>
        <p>Salva arquivos <code>.txt</code> diretamente em <code>${CONFIG.github.tutorialsFolder}/</code> e atualiza o <code>index.json</code>.</p>

        <div class="admin-grid">
            <div class="admin-field">
                <label for="gh-owner">Usuário / Organização GitHub</label>
                <input id="gh-owner" type="text" value="${CONFIG.github.owner}" />
            </div>
            <div class="admin-field">
                <label for="gh-repo">Nome do Repositório</label>
                <input id="gh-repo" type="text" value="${CONFIG.github.repo}" />
            </div>
            <div class="admin-field">
                <label for="gh-branch">Branch</label>
                <input id="gh-branch" type="text" value="${CONFIG.github.branch}" />
            </div>
        </div>

        <div class="admin-field">
            <label for="gh-token">GitHub Personal Access Token (permissão Contents: Read & Write)</label>
            <input id="gh-token" type="password" placeholder="ghp_... ou github_pat_..." value="${savedToken}" />
        </div>

        <div class="admin-grid">
            <div class="admin-field">
                <label for="lesson-category">Categoria / Tópico Pai</label>
                <input id="lesson-category" list="category-suggestions" type="text" placeholder="Ex: Dinâmica ou Propriedades do Som" />
                <datalist id="category-suggestions"></datalist>
            </div>
            <div class="admin-field">
                <label for="lesson-title">Título do Tópico (Filho)</label>
                <input id="lesson-title" type="text" placeholder="Ex: Intensidade (p, mf, f)" />
            </div>
            <div class="admin-field">
                <label for="lesson-filename">Nome do arquivo (extensão .txt automática)</label>
                <div class="filename-input-wrap">
                    <input id="lesson-filename" type="text" placeholder="Ex: 04-dinamica" />
                    <span class="filename-ext-badge">.txt</span>
                </div>
            </div>
        </div>

        <div class="admin-workspace">
            <div class="admin-editor-col">
                <div class="admin-field">
                    <label for="lesson-body">Conteúdo da Lição (.txt)</label>
                    <textarea id="lesson-body" placeholder="<h2>Nova Lição</h2>\n<p>Texto explicativo...</p>\n\n[ABC]\nX:1\nT:Exemplo\nM:4/4\nL:1/4\nK:C\nCDEF|GABC|\n%%play\n[/ABC]\n\n[CIFRA]\n[C]Exemplo de [G]cifra\n[/CIFRA]"></textarea>
                </div>
            </div>

            <div class="admin-preview-col">
                <div class="admin-preview-header">
                    <span>👁️ Pré-visualização em Tempo Real</span>
                    <button type="button" id="btn-refresh-preview" class="btn-mini-preview">↻ Atualizar agora</button>
                </div>
                <div id="admin-live-preview" class="admin-live-preview">
                    <p class="admin-preview-empty">Digite no editor ao lado para visualizar todas as tags antes de salvar.</p>
                </div>
            </div>
        </div>

        <label class="admin-checkbox">
            <input id="update-index-json" type="checkbox" checked />
            Atualizar também o arquivo <code>tutorials/index.json</code>
        </label>

        <div class="admin-actions">
            <button type="button" id="btn-save-lesson">💾 Salvar no GitHub</button>
            <button type="button" id="btn-load-existing">📂 Carregar lição existente para editar</button>
        </div>

        <div id="admin-status"></div>
    `;

    const bodyTextarea = document.getElementById('lesson-body');
    const refreshBtn = document.getElementById('btn-refresh-preview');

    bodyTextarea.addEventListener('input', () => {
        window.currentLessonRawText = bodyTextarea.value;
        scheduleAdminPreview();
    });

    if (refreshBtn) {
        refreshBtn.onclick = () => renderAdminLivePreview();
    }

    document.getElementById('btn-save-lesson').onclick = handleSaveToGithub;
    document.getElementById('btn-load-existing').onclick = handleLoadExistingLesson;

    renderAdminLivePreview();
}

function scheduleAdminPreview() {
    if (adminPreviewTimer) {
        clearTimeout(adminPreviewTimer);
    }
    adminPreviewTimer = setTimeout(() => {
        renderAdminLivePreview();
    }, 150);
}

function renderAdminLivePreview() {
    const textarea = document.getElementById('lesson-body');
    const previewEl = document.getElementById('admin-live-preview');
    if (!textarea || !previewEl) return;

    const text = textarea.value || '';
    if (!text.trim()) {
        previewEl.innerHTML = '<p class="admin-preview-empty">Digite no editor ao lado para visualizar todas as tags antes de salvar.</p>';
        return;
    }

    renderLessonIntoContainer(text, previewEl, 'admin-abc');
}

function setAdminStatus(message, isError = false) {
    const statusEl = document.getElementById('admin-status');
    statusEl.className = `admin-status ${isError ? 'err' : 'ok'}`;
    statusEl.textContent = message;
}

function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToUtf8(base64) {
    const clean = base64.replace(/\n/g, '');
    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
}

async function ghRequest(endpoint, token, method = 'GET', body = null) {
    const url = `https://api.github.com${endpoint}`;
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }
    };

    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.message || `Erro HTTP ${res.status} na API do GitHub`);
    }

    return data;
}

async function getFileIfExists(owner, repo, path, branch, token) {
    try {
        return await ghRequest(
            `/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`,
            token,
            'GET'
        );
    } catch (err) {
        if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
            return null;
        }
        throw err;
    }
}

async function upsertFile(owner, repo, path, contentStr, commitMessage, branch, token) {
    const existing = await getFileIfExists(owner, repo, path, branch, token);
    const payload = {
        message: commitMessage,
        content: utf8ToBase64(contentStr),
        branch
    };

    if (existing && existing.sha) {
        payload.sha = existing.sha;
    }

    return await ghRequest(
        `/repos/${owner}/${repo}/contents/${path}`,
        token,
        'PUT',
        payload
    );
}

async function handleLoadExistingLesson() {
    const rawFile = document.getElementById('lesson-filename').value;
    const fileName = normalizeTxtFilename(rawFile);
    if (!fileName) {
        setAdminStatus('Digite o nome do arquivo (ex: 01-introducao) para carregar.', true);
        return;
    }

    const foundMeta = lessons.find(item => item.file === fileName);

    try {
        const res = await fetch(`${CONFIG.baseUrl}${fileName}?t=${Date.now()}`);
        if (!res.ok) throw new Error('Arquivo não encontrado em tutorials/');
        const text = await res.text();

        window.currentLessonRawText = text;
        if (foundMeta) {
            window.currentLessonTitle = foundMeta.title;
        }

        document.getElementById('lesson-filename').value = fileName.replace(/\.txt$/i, '');
        if (foundMeta) {
            document.getElementById('lesson-category').value = getLessonCategory(foundMeta);
            document.getElementById('lesson-title').value = foundMeta.title;
        }
        document.getElementById('lesson-body').value = text;
        setAdminStatus(`Lição "${fileName}" carregada no editor.`);
    } catch (err) {
        setAdminStatus(`Erro ao carregar lição: ${err.message}`, true);
    }
}

async function handleSaveToGithub() {
    const owner = document.getElementById('gh-owner').value.trim();
    const repo = document.getElementById('gh-repo').value.trim();
    const branch = document.getElementById('gh-branch').value.trim() || 'main';
    const token = document.getElementById('gh-token').value.trim();
    const category = document.getElementById('lesson-category').value.trim() || 'Geral';
    const title = document.getElementById('lesson-title').value.trim();
    const rawFileName = document.getElementById('lesson-filename').value;
    const fileName = normalizeTxtFilename(rawFileName);
    const bodyText = document.getElementById('lesson-body').value;
    const shouldUpdateIndex = document.getElementById('update-index-json').checked;

    if (!owner || !repo) {
        setAdminStatus('Preencha corretamente o usuário e o nome do repositório do GitHub.', true);
        return;
    }
    if (!token) {
        setAdminStatus('Informe um Personal Access Token do GitHub para salvar.', true);
        return;
    }
    if (!fileName) {
        setAdminStatus('Informe o nome do arquivo (ex: 04-dinamica).', true);
        return;
    }
    if (shouldUpdateIndex && !title) {
        setAdminStatus('Informe o título do tópico para atualizar o index.json.', true);
        return;
    }

    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);

    const folder = CONFIG.github.tutorialsFolder.replace(/^\/|\/$/g, '');
    const txtPath = `${folder}/${fileName}`;
    const indexPath = `${folder}/${CONFIG.indexFile}`;

    try {
        setAdminStatus('Enviando arquivo .txt para o GitHub...');

        await upsertFile(
            owner,
            repo,
            txtPath,
            bodyText,
            `feat(tutorials): salva lição ${fileName}`,
            branch,
            token
        );

        if (shouldUpdateIndex) {
            setAdminStatus(`Arquivo ${fileName} salvo! Atualizando ${CONFIG.indexFile}...`);

            const existingIndexFile = await getFileIfExists(owner, repo, indexPath, branch, token);
            let currentIndex = [];

            if (existingIndexFile && existingIndexFile.content) {
                currentIndex = JSON.parse(base64ToUtf8(existingIndexFile.content));
            } else if (Array.isArray(lessons)) {
                currentIndex = [...lessons];
            }

            const existingIdx = currentIndex.findIndex(item => item.file === fileName);
            const newEntry = { category, title, file: fileName };

            if (existingIdx >= 0) {
                currentIndex[existingIdx] = newEntry;
            } else {
                currentIndex.push(newEntry);
            }

            const formattedJson = formatIndexJson(currentIndex);

            await upsertFile(
                owner,
                repo,
                indexPath,
                formattedJson,
                `chore(tutorials): atualiza index.json com ${fileName}`,
                branch,
                token
            );
        }

        window.currentLessonRawText = bodyText;
        if (title) {
            window.currentLessonTitle = title;
        }

        openCategories.add(category);
        await loadLessonIndex();
        setAdminStatus(
            `Sucesso! "${txtPath}" salvo na categoria "${category}"` +
            (shouldUpdateIndex ? ` e "${indexPath}" atualizado.` : '.')
        );
    } catch (err) {
        console.error(err);
        setAdminStatus(`Falha ao salvar no GitHub: ${err.message}`, true);
    }
}

// ============================================================
// BARRA DE ATALHOS DE TAGS NO EDITOR DO ADMIN
// ============================================================
const TAGS_EDITOR_ADMIN = [
    {
        label: '🎬 Vídeo',
        title: 'Inserir bloco de vídeo',
        insert: '[VIDEO]\nhttps://www.youtube.com/watch?v=\n[/VIDEO]\n',
        wrapSelection: false
    },
    {
        label: '🎼 ABC',
        title: 'Inserir partitura ABC',
        insert: '[ABC]\nX:1\nT:Título\nM:4/4\nL:1/4\nK:C\nC D E F |\n[/ABC]\n',
        wrapSelection: true
    },
    {
        label: '🎸 Cifra',
        title: 'Inserir cifra com acordes entre colchetes',
        insert: '[CIFRA]\n[TITULO]Nome da Música[/TITULO]\n[C]Exemplo de letra com [G]acorde\n[/CIFRA]\n',
        wrapSelection: true
    },
    {
        label: '🪕 Violão',
        title: 'Inserir diagramas de violão',
        insert: '[VIOLAO]\nC, Am, F, G7\n[/VIOLAO]\n',
        wrapSelection: true
    },
    {
        label: '🖼️ Imagem',
        title: 'Inserir bloco de imagem',
        insert: '[IMAGEM]\nURL_DA_IMAGEM\n[/IMAGEM]\n',
        wrapSelection: true
    },
    {
        label: '📄 PDF',
        title: 'Inserir bloco de PDF',
        insert: '[PDF]\nURL_DO_PDF\n[/PDF]\n',
        wrapSelection: true
    }
];

function inserirTagNoTextarea(textarea, tagConfig) {
    if (!textarea) return;

    const start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : textarea.value.length;
    const end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : textarea.value.length;
    const textoAtual = textarea.value;
    const selecionado = textoAtual.slice(start, end);

    let textoInserido = tagConfig.insert;

    // Se o usuário selecionou um trecho de texto, envolve com as tags de abertura/fechamento
    if (tagConfig.wrapSelection && selecionado.trim()) {
        const matchTags = tagConfig.insert.match(/^(\[[A-Z0-9_]+[^\]]*\])([\s\S]*?)(\[\/[A-Z0-9_]+\])(\n?)$/i);
        if (matchTags) {
            const abre = matchTags[1];
            const fecha = matchTags[3];
            const quebraFinal = matchTags[4] || '';
            textoInserido = `${abre}\n${selecionado}\n${fecha}${quebraFinal}`;
        }
    }

    textarea.value = textoAtual.slice(0, start) + textoInserido + textoAtual.slice(end);

    // Posiciona o cursor logo após o texto inserido e dispara input para atualizar prévia (se houver)
    const novaPosicao = start + textoInserido.length;
    textarea.focus();
    textarea.setSelectionRange(novaPosicao, novaPosicao);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function montarBarraTagsAdmin(textarea, toolbarContainer) {
    if (!textarea || !toolbarContainer) return;
    if (toolbarContainer.dataset.initialized === 'true') return;

    toolbarContainer.innerHTML = '';

    TAGS_EDITOR_ADMIN.forEach((cfg) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'admin-tag-btn';
        btn.title = cfg.title;
        btn.textContent = cfg.label;
        btn.onclick = () => inserirTagNoTextarea(textarea, cfg);
        toolbarContainer.appendChild(btn);
    });

    toolbarContainer.dataset.initialized = 'true';
}
