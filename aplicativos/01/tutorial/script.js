// ============================================================
// CONFIGURAÇÃO
// ============================================================
const CONFIG = {
    baseUrl: 'tutorials/',
    indexFile: 'index.json',
    github: {
        owner: 'SEU_USUARIO_GITHUB', // Ex: 'joaosilva'
        repo: 'NOME_DO_REPOSITORIO', // Ex: 'abc-tutorial'
        branch: 'main',              // Ou 'master'
        tutorialsFolder: 'tutorials'
    }
};

// ============================================================
// ESTADO GLOBAL
// ============================================================
let lessons = [];
let currentSynth = null;
let audioContext = null;
let playTimeout = null;
let isPlaying = false;
let visualObjs = {};
let isAdminOpen = false;

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    renderAdminPanel();
    await loadLessonIndex();
});

async function loadLessonIndex() {
    try {
        // Cache-busting evita ler index.json antigo após salvar no GitHub
        const response = await fetch(`${CONFIG.baseUrl}${CONFIG.indexFile}?t=${Date.now()}`);
        if (!response.ok) throw new Error('Não foi possível carregar o índice');
        lessons = await response.json();
        renderNavigation();
        if (lessons.length > 0 && !isAdminOpen) {
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

    lessons.forEach((lesson, index) => {
        const btn = document.createElement('button');
        btn.textContent = `${index + 1}. ${lesson.title}`;
        btn.onclick = () => {
            toggleAdmin(false);
            loadLesson(lesson.file);
        };
        btn.dataset.file = lesson.file;
        nav.appendChild(btn);
    });

    // Botão da aba Admin
    const adminBtn = document.createElement('button');
    adminBtn.id = 'btn-admin-tab';
    adminBtn.className = 'admin-btn';
    adminBtn.textContent = '⚙️ Admin';
    adminBtn.onclick = () => toggleAdmin(!isAdminOpen);
    nav.appendChild(adminBtn);
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
    const content = document.getElementById('lesson-content');
    content.innerHTML = '<p class="loading">Carregando lição...</p>';

    document.querySelectorAll('#lesson-nav button:not(.admin-btn)').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.file === fileName);
    });

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
    const content = document.getElementById('lesson-content');
    content.innerHTML = '';

    const abcRegex = /\[ABC\]([\s\S]*?)\[\/ABC\]/g;
    let lastIndex = 0;
    let match;
    let blockCounter = 0;

    while ((match = abcRegex.exec(text)) !== null) {
        const textBefore = text.substring(lastIndex, match.index);
        if (textBefore.trim()) {
            content.appendChild(parseText(textBefore));
        }

        content.appendChild(createAbcBlock(match[1], blockCounter));
        blockCounter++;

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

    const codeView = document.createElement('pre');
    codeView.className = 'abc-code';
    codeView.textContent = cleanCode;
    block.appendChild(codeView);

    return block;
}

// ============================================================
// REPRODUTOR DE ÁUDIO
// ============================================================
async function playAbc(abcCode, btnPlay, blockId) {
    if (isPlaying) return;
    const btnStop = btnPlay.nextElementSibling;

    try {
        if (!ABCJS.synth || !ABCJS.synth.supportsAudio()) {
            throw new Error('Seu navegador não suporta reprodução de áudio WebAudio.');
        }

        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        if (playTimeout) {
            clearTimeout(playTimeout);
            playTimeout = null;
        }
        if (currentSynth) {
            currentSynth.stop();
            currentSynth = null;
        }

        // Garante um visualObj válido renderizado pelo ABCJS
        let visualObj = visualObjs[blockId];
        if (!visualObj || !Array.isArray(visualObj.lines)) {
            const tempDiv = document.createElement('div');
            const rendered = ABCJS.renderAbc(tempDiv, abcCode);
            if (!rendered || !rendered[0]) {
                throw new Error('Não foi possível preparar a partitura para áudio.');
            }
            visualObj = rendered[0];
            visualObjs[blockId] = visualObj;
        }

        btnPlay.disabled = true;
        btnPlay.innerHTML = '⏳ Carregando timbres...';
        btnStop.style.display = 'inline-block';
        isPlaying = true;

        currentSynth = new ABCJS.synth.CreateSynth();

        // Passa 'options: {}' explicitamente para evitar 'swing' em options undefined
        await currentSynth.init({
            visualObj: visualObj,
            audioContext: audioContext,
            options: {}
        });

        await currentSynth.prime();

        btnPlay.innerHTML = '🔊 Tocando...';
        currentSynth.start();

        const durationSeconds = typeof visualObj.getTotalTime === 'function'
            ? visualObj.getTotalTime()
            : 10;

        playTimeout = setTimeout(() => {
            if (isPlaying) {
                resetPlayUI(btnPlay, btnStop);
            }
        }, (durationSeconds * 1000) + 500);
    } catch (error) {
        console.error('Erro ao tocar:', error);
        alert('Erro ao reproduzir áudio: ' + error.message);
        resetPlayUI(btnPlay, btnStop);
    }
}

function stopAbc(btnPlay, btnStop) {
    if (playTimeout) {
        clearTimeout(playTimeout);
        playTimeout = null;
    }
    if (currentSynth) {
        currentSynth.stop();
        currentSynth = null;
    }
    resetPlayUI(btnPlay, btnStop);
}

function resetPlayUI(btnPlay, btnStop) {
    isPlaying = false;
    btnPlay.disabled = false;
    btnPlay.innerHTML = '▶ Tocar';
    btnStop.style.display = 'none';
}

// ============================================================
// ABA ADMIN — SALVAR .TXT E ATUALIZAR index.json NO GITHUB
// ============================================================
const TOKEN_STORAGE_KEY = 'abc_github_pat';

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
                <label for="lesson-title">Título da Lição (para o index.json)</label>
                <input id="lesson-title" type="text" placeholder="Ex: Acordes e Harmonia" />
            </div>
            <div class="admin-field">
                <label for="lesson-filename">Nome do arquivo .txt</label>
                <input id="lesson-filename" type="text" placeholder="Ex: 04-acordes.txt" />
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
    const rawFile = document.getElementById('lesson-filename').value.trim();
    if (!rawFile) {
        setAdminStatus('Digite o nome do arquivo .txt (ex: 01-introducao.txt) para carregar.', true);
        return;
    }

    const fileName = rawFile.endsWith('.txt') ? rawFile : `${rawFile}.txt`;
    const foundMeta = lessons.find(item => item.file === fileName);

    try {
        const res = await fetch(`${CONFIG.baseUrl}${fileName}?t=${Date.now()}`);
        if (!res.ok) throw new Error('Arquivo não encontrado em tutorials/');
        const text = await res.text();

        document.getElementById('lesson-filename').value = fileName;
        if (foundMeta) {
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
    const title = document.getElementById('lesson-title').value.trim();
    let fileName = document.getElementById('lesson-filename').value.trim();
    const bodyText = document.getElementById('lesson-body').value;
    const shouldUpdateIndex = document.getElementById('update-index-json').checked;

    if (!owner || !repo || owner === 'SEU_USUARIO_GITHUB' || repo === 'NOME_DO_REPOSITORIO') {
        setAdminStatus('Preencha corretamente o usuário e o nome do repositório do GitHub.', true);
        return;
    }
    if (!token) {
        setAdminStatus('Informe um Personal Access Token do GitHub para salvar.', true);
        return;
    }
    if (!fileName) {
        setAdminStatus('Informe o nome do arquivo .txt (ex: 04-acordes.txt).', true);
        return;
    }
    if (!fileName.endsWith('.txt')) {
        fileName += '.txt';
        document.getElementById('lesson-filename').value = fileName;
    }
    if (shouldUpdateIndex && !title) {
        setAdminStatus('Informe o título da lição para atualizar o index.json.', true);
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
            const newEntry = { title, file: fileName };

            if (existingIdx >= 0) {
                currentIndex[existingIdx] = newEntry;
            } else {
                currentIndex.push(newEntry);
            }

            const formattedJson = JSON.stringify(currentIndex, null, 4) + '\n';

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

        await loadLessonIndex();
        setAdminStatus(
            `Sucesso! "${txtPath}" salvo no GitHub` +
            (shouldUpdateIndex ? ` e "${indexPath}" atualizado.` : '.')
        );
    } catch (err) {
        console.error(err);
        setAdminStatus(`Falha ao salvar no GitHub: ${err.message}`, true);
    }
}