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
        tutorialsFolder: 'aplicativos/01/tutorial/tutorials'
    }
};

// ============================================================
// ESTADO GLOBAL
// ============================================================
let lessons = [];
let currentFile = null;
let openCategories = new Set(); // Guarda quais pastas "Pai" estão abertas
let searchTerm = '';
let currentSynth = null;
let audioContext = null;
let playTimeout = null;
let activeBtnPlay = null;
let activeBtnStop = null;
let isPlaying = false;
let visualObjs = {};
let isAdminOpen = false;

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    setupSidebarControls();
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
    const adminBtn = document.getElementById('btn-admin-tab');

    panel.style.display = show ? 'block' : 'none';
    content.style.display = show ? 'none' : 'block';
    if (adminBtn) adminBtn.classList.toggle('active', show);
}

async function loadLesson(fileName) {
    currentFile = fileName;
    const content = document.getElementById('lesson-content');
    content.innerHTML = '<p class="loading">Carregando lição...</p>';

    const lessonMeta = lessons.find(l => l.file === fileName);
    if (lessonMeta) {
        openCategories.add(getLessonCategory(lessonMeta));
    }
    renderNavigation();

    try {
        const response = await fetch(`${CONFIG.baseUrl}${fileName}?t=${Date.now()}`);
        if (!response.ok) throw new Error('Lição não encontrada');
        const text = await response.text();
        visualObjs = {};
        renderLesson(text);
    } catch (error) {
        content.innerHTML = `<div class="error">Erro: ${error.message}</div>`;
    }
}

// ============================================================
// PARSER E RENDERIZAÇÃO ABC
// ============================================================
function renderLesson(text) {
    if (window.AbcModule && typeof window.AbcModule.resetPlayback === 'function') {
        window.AbcModule.resetPlayback();
    }

    const content = document.getElementById('lesson-content');
    content.innerHTML = '';

    // Aceita [CIFRA]...[/CIFRA] (e também tolera [CIFRA]...[CIFRA] caso apareça)
    const tokenRegex = /\[(ABC|CIFRA|MD|LINK|VIDEO)\]([\s\S]*?)(?:\[\/\1\]|\[CIFRA\])/g;
    let lastIndex = 0;
    let match;
    let abcCounter = 0;

    while ((match = tokenRegex.exec(text)) !== null) {
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore.trim()) {
            content.appendChild(parseText(textBefore));
        }

        const tagType = match[1].toUpperCase();
        const innerContent = match[2];

        if (tagType === 'ABC' && window.AbcModule) {
            content.appendChild(window.AbcModule.render(innerContent, abcCounter++));
        } else if (tagType === 'CIFRA' && window.CifraModule) {
            content.appendChild(window.CifraModule.render(innerContent));
        } else if (tagType === 'MD' && window.MarkdownModule) {
            content.appendChild(window.MarkdownModule.render(innerContent));
        } else if (tagType === 'LINK' && window.LinksModule) {
            content.appendChild(window.LinksModule.render(innerContent));
        } else if (tagType === 'VIDEO' && window.VideoModule) {
            content.appendChild(window.VideoModule.render(innerContent));
        } else {
            content.appendChild(parseText(innerContent));
        }

        lastIndex = match.index + match[0].length;
    }

    const textAfter = text.substring(lastIndex);
    if (textAfter.trim()) {
        content.appendChild(parseText(textAfter));
    }
}
function parseText(text) {
    const container = document.createElement('div');
    container.className = 'text-content';
    container.innerHTML = text;
    return container;
}

function createAbcBlock(abcCode, blockId) {
    const block = document.createElement('div');
    block.className = 'abc-block';

    const hasPlay = /%%play\b/.test(abcCode);
    const cleanCode = abcCode.replace(/%%play\s*/g, '').trim();

    const sheetContainer = document.createElement('div');
    sheetContainer.className = 'abc-sheet';
    sheetContainer.id = `abc-sheet-${blockId}`;
    block.appendChild(sheetContainer);

    try {
        const renderResult = ABCJS.renderAbc(sheetContainer, cleanCode, {
            responsive: 'resize',
            scale: 0.75,
            staffwidth: 700,
            paddingtop: 10,
            paddingbottom: 10,
            add_classes: true
        });

        if (renderResult && renderResult[0]) {
            visualObjs[blockId] = renderResult[0];
        }
    } catch (error) {
        sheetContainer.innerHTML = `<div class="error">Erro ao renderizar: ${error.message}</div>`;
    }

    if (hasPlay) {
        const controls = document.createElement('div');
        controls.className = 'abc-controls';

        const btnPlay = document.createElement('button');
        btnPlay.className = 'btn-play';
        btnPlay.innerHTML = '▶ Tocar';
        btnPlay.onclick = () => playAbc(cleanCode, btnPlay, blockId);

        const btnStop = document.createElement('button');
        btnStop.className = 'btn-stop';
        btnStop.innerHTML = '■ Parar';
        btnStop.style.display = 'none';
        btnStop.onclick = () => stopAbc(btnPlay, btnStop);

        controls.appendChild(btnPlay);
        controls.appendChild(btnStop);
        block.appendChild(controls);
    }

    // Cabeçalho do código ABC + Botão Copiar
    const codeHeader = document.createElement('div');
    codeHeader.className = 'abc-code-header';

    const codeLabel = document.createElement('span');
    codeLabel.className = 'abc-code-label';
    codeLabel.textContent = 'Código ABC';

    const btnCopy = document.createElement('button');
    btnCopy.type = 'button';
    btnCopy.className = 'btn-copy';
    btnCopy.innerHTML = '📋 Copiar';
    btnCopy.onclick = () => copyAbcCode(cleanCode, btnCopy);

    codeHeader.appendChild(codeLabel);
    codeHeader.appendChild(btnCopy);
    block.appendChild(codeHeader);

    const codeView = document.createElement('pre');
    codeView.className = 'abc-code';
    codeView.textContent = cleanCode;
    block.appendChild(codeView);

    return block;
}

async function copyAbcCode(codeText, btnCopy) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(codeText);
        } else {
            const tempArea = document.createElement('textarea');
            tempArea.value = codeText;
            document.body.appendChild(tempArea);
            tempArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempArea);
        }

        const originalHtml = btnCopy.innerHTML;
        btnCopy.innerHTML = '✓ Copiado!';
        btnCopy.classList.add('copied');

        setTimeout(() => {
            btnCopy.innerHTML = originalHtml;
            btnCopy.classList.remove('copied');
        }, 1800);
    } catch (err) {
        alert('Não foi possível copiar o código: ' + err.message);
    }
}

// ============================================================
// REPRODUTOR DE ÁUDIO
// ============================================================
async function playAbc(abcCode, btnPlay, blockId) {
    const btnStop = btnPlay ? btnPlay.nextElementSibling : null;

    if (currentSynth) {
        stopCurrentPlayback();
    }

    try {
        if (!window.ABCJS || !ABCJS.synth || !ABCJS.synth.supportsAudio()) {
            throw new Error('Seu navegador não suporta reprodução de áudio WebAudio.');
        }

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!audioContext) {
            audioContext = new AudioCtx();
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        const tempDiv = document.createElement('div');
        const rendered = ABCJS.renderAbc(tempDiv, abcCode);
        if (!rendered || !rendered[0]) {
            throw new Error('Não foi possível preparar a partitura para áudio.');
        }
        const visualObj = rendered[0];

        activeBtnPlay = btnPlay;
        activeBtnStop = btnStop;
        isPlaying = true;

        if (btnPlay) {
            btnPlay.disabled = true;
            btnPlay.innerHTML = '⏳ Carregando...';
        }
        if (btnStop) {
            btnStop.disabled = false;
            btnStop.style.display = 'inline-block';
        }

        const synth = new ABCJS.synth.CreateSynth();
        currentSynth = synth;

        await synth.init({
            visualObj: visualObj,
            audioContext: audioContext,
            options: {}
        });

        await synth.prime();

        if (!isPlaying || currentSynth !== synth) {
            return;
        }

        if (btnPlay) {
            btnPlay.innerHTML = '🔊 Tocando...';
        }

        synth.start();

        const totalSec = (typeof synth.duration === 'number' && synth.duration > 0)
            ? synth.duration
            : (typeof visualObj.getTotalTime === 'function' && visualObj.getTotalTime() > 0)
                ? visualObj.getTotalTime()
                : 15;

        playTimeout = setTimeout(() => {
            if (currentSynth === synth) {
                stopCurrentPlayback();
            }
        }, (totalSec * 1000) + 2000);

    } catch (error) {
        console.error('Erro ao tocar:', error);
        alert('Erro ao reproduzir áudio: ' + (error && error.message ? error.message : error));
        stopCurrentPlayback();
    }
}

function stopAbc(btnPlay, btnStop) {
    stopCurrentPlayback();
}

function stopCurrentPlayback() {
    if (playTimeout) {
        clearTimeout(playTimeout);
        playTimeout = null;
    }

    if (currentSynth) {
        try {
            currentSynth.stop();
        } catch (e) {
            // Ignora se já tiver parado
        }
        currentSynth = null;
    }

    isPlaying = false;

    if (activeBtnPlay) {
        activeBtnPlay.disabled = false;
        activeBtnPlay.innerHTML = '▶ Tocar';
    }
    if (activeBtnStop) {
        activeBtnStop.disabled = false;
        activeBtnStop.style.display = 'none';
    }

    activeBtnPlay = null;
    activeBtnStop = null;
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

        <div class="admin-field">
            <label for="lesson-body">Conteúdo da Lição (.txt)</label>
            <textarea id="lesson-body" placeholder="<h2>Nova Lição</h2>\n<p>Texto explicativo...</p>\n\n[ABC]\nX:1\nT:Exemplo\nM:4/4\nL:1/4\nK:C\nCDEF|GABC|\n%%play\n[/ABC]"></textarea>
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

    document.getElementById('btn-save-lesson').onclick = handleSaveToGithub;
    document.getElementById('btn-load-existing').onclick = handleLoadExistingLesson;
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
